/**
 * SafeHaven — VoiceAgent
 *
 * The persistent AI coaching interface that lives on top of every screen.
 *
 * Architecture:
 *   FloatingMicFAB      → always visible 64dp circle FAB
 *   ConversationSheet   → slide-up panel (40% → 90% height) with chat + mic
 *   useChatStream()     → SSE consumer for POST /api/chat
 *   useSTT()            → native SpeechRecognizer via @react-native-voice/voice
 *   TTS                 → ElevenLabs via synthesizeSpeech() / expo-speech fallback
 *
 * Mode toggle (3 states):
 *   'voice'  → mic input + voice TTS output (voice-only mode)
 *   'text'   → keyboard input + text display (no TTS)
 *   'both'   → mic input + text display + TTS (default)
 *
 * Distress awareness:
 *   - On 'emotional' or 'crisis' distress: hide investment FABs, show support banner
 *   - On 'financial' distress: show "seek help" nudge
 *
 * Accessibility:
 *   - Every interactive element has accessibilityLabel + accessibilityHint
 *   - accessibilityLiveRegion="polite" on streaming text (assistants turns)
 *   - Reduced-motion mode disables slide animation
 *   - Large-text mode bumps message text to 18pt
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated as RNAnimated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Voice from '@react-native-voice/voice';

import { useTheme, useColors } from '../design/Theme';
import { tokens } from '../design/tokens';
import { VoiceMicButton } from '../design/components/VoiceMicButton';
import { recordAndTranscribe, synthesizeSpeech, stopSpeech, type SupportedLocale } from './elevenlabs';
import { useConversationStore, selectRecentDistress } from './useConversationStore';
import { useOnboardingStore } from '../screens/onboarding/useOnboardingStore';
import { useAccessibilityStore } from '../store/accessibilityStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENT_URL = process.env['EXPO_PUBLIC_AGENT_URL'] ?? 'http://localhost:3001';

/** Sheet sits 40% up in collapsed state, 90% in expanded state */
const SHEET_COLLAPSED_RATIO = 0.40;
const SHEET_EXPANDED_RATIO  = 0.90;

type ReplyMode = 'voice' | 'text' | 'both';
type MicState  = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

// ─── Mode-toggle icon labels ──────────────────────────────────────────────────

const MODE_LABELS: Record<ReplyMode, string> = {
  voice: 'Voice only',
  both:  'Voice + text',
  text:  'Text only',
};
const MODE_NEXT: Record<ReplyMode, ReplyMode> = {
  voice: 'both',
  both:  'text',
  text:  'voice',
};

// ─── SSE streaming hook ───────────────────────────────────────────────────────

interface StreamResult {
  fullText: string;
  distressLevel: 'none' | 'financial' | 'emotional' | 'crisis';
}

async function streamChatRequest(
  params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    locale: string;
    userTier?: string;
    riskScore?: number;
    conversationSummary?: string;
    voiceMode: boolean;
  },
  onChunk: (text: string) => void,
  signal: AbortSignal,
): Promise<StreamResult> {
  const response = await fetch(`${AGENT_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages:            params.messages,
      locale:              params.locale,
      userTier:            params.userTier,
      riskScore:           params.riskScore,
      conversationSummary: params.conversationSummary,
      voiceMode:           params.voiceMode,
      stream:              true,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed: HTTP ${response.status}`);
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer    = '';
  let finalText = '';
  let distressLevel: StreamResult['distressLevel'] = 'none';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const payload = JSON.parse(line.slice(6)) as {
          chunk?: string;
          done?: boolean;
          finalResponse?: string;
          distressLevel?: string;
        };

        if (payload.chunk) {
          finalText += payload.chunk;
          onChunk(payload.chunk);
        }

        if (payload.done && payload.finalResponse) {
          finalText = payload.finalResponse;
          if (payload.distressLevel) {
            distressLevel = payload.distressLevel as StreamResult['distressLevel'];
          }
        }
      } catch {
        // ignore malformed SSE line
      }
    }
  }

  return { fullText: finalText, distressLevel };
}

// ─── STT hook ─────────────────────────────────────────────────────────────────

function useSTT(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0];
      if (text) {
        setIsListening(false);
        onResult(text);
      }
    };
    Voice.onSpeechError = (e) => {
      setError(e.error?.message ?? 'STT error');
      setIsListening(false);
    };
    Voice.onSpeechEnd = () => setIsListening(false);

    return () => {
      void Voice.destroy().then(() => Voice.removeAllListeners());
    };
  }, [onResult]);

  const startListening = useCallback(async (locale: string) => {
    setError(null);
    try {
      await Voice.start(locale);
      setIsListening(true);
    } catch (e) {
      try {
        const result = await recordAndTranscribe(locale as SupportedLocale, (state) => {
          if (state === 'recording') {
            setIsListening(true);
            setError(null);
          } else if (state === 'processing') {
            setIsListening(false);
          } else if (state === 'error') {
            setIsListening(false);
          }
        });

        if (result?.transcript) {
          onResult(result.transcript);
          return;
        }

        setError('Could not transcribe audio');
      } catch {
        setError(e instanceof Error ? e.message : 'Could not start microphone');
      }
    }
  }, [onResult]);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  return { isListening, error, startListening, stopListening };
}

// ─── Distress banner ──────────────────────────────────────────────────────────

function DistressBanner({
  level,
  locale,
}: {
  level: 'financial' | 'emotional' | 'crisis';
  locale: string;
}) {
  const colors = useColors();

  const messages: Record<string, Record<string, string>> = {
    financial: {
      en: "💙 Sounds like things are tough financially. Remember, SafeHaven is here to help you build — not fix overnight crises. Consider speaking to a local financial counsellor.",
      fr: "💙 Les choses semblent difficiles financièrement. SafeHaven est là pour vous aider à construire. Parlez à un conseiller financier local.",
      es: "💙 Parece que las cosas están difíciles económicamente. SafeHaven está aquí para ayudarte. Considera hablar con un asesor financiero local.",
    },
    emotional: {
      en: "💙 It sounds like you're going through something really hard. That's okay. You don't have to face it alone — please reach out to someone you trust, or call a helpline.",
      fr: "💙 Il semble que vous traversez quelque chose de difficile. Vous n'avez pas à l'affronter seul. Appelez une ligne d'assistance.",
      es: "💙 Parece que estás pasando por algo muy difícil. No tienes que enfrentarlo solo. Llama a una línea de ayuda.",
    },
    crisis: {
      en: "🆘 Please reach out right now. You matter. Crisis line (US): 988 · International: findahelpline.com",
      fr: "🆘 Appelez maintenant. Vous comptez. Urgence psychologique: 3114",
      es: "🆘 Por favor llama ahora. Eres importante. Línea de atención: 024",
    },
  };

  const text =
    messages[level]?.[locale] ??
    messages[level]?.['en'] ??
    '';

  const bgColor = level === 'crisis' ? colors.danger : colors.warning;

  return (
    <View
      style={[styles.distressBanner, { backgroundColor: bgColor + '22', borderColor: bgColor }]}
      accessibilityRole="alert"
      accessibilityLabel={text}
    >
      <Text style={[styles.distressText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  role,
  content,
  isStreaming,
  largeText,
}: {
  role: 'user' | 'assistant';
  content: string;
  isStreaming: boolean;
  largeText: boolean;
}) {
  const colors = useColors();
  const isUser = role === 'user';
  const fontSize = largeText ? 18 : 15;

  return (
    <View
      style={[
        styles.bubble,
        isUser
          ? [styles.bubbleUser, { backgroundColor: colors.primary }]
          : [styles.bubbleAssistant, { backgroundColor: colors.surface, borderColor: colors.primaryLight }],
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${isUser ? 'You' : 'Coco'}: ${content}`}
      accessibilityLiveRegion={isUser ? 'none' : 'polite'}
    >
      {!isUser && (
        <Text style={[styles.bubbleSender, { color: colors.primary, fontSize: fontSize - 2 }]}>
          Coco 🪙
        </Text>
      )}
      <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : colors.text, fontSize }]}>
        {content}
      </Text>
      {isStreaming && !isUser && (
        <View style={styles.streamingDot}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

// ─── Mode toggle button ───────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onToggle,
}: {
  mode: ReplyMode;
  onToggle: () => void;
}) {
  const colors = useColors();
  const icons: Record<ReplyMode, string> = { voice: '🎙️', both: '💬🎙️', text: '💬' };

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.modeToggle, { backgroundColor: colors.primaryLight }]}
      accessibilityRole="button"
      accessibilityLabel={`Reply mode: ${MODE_LABELS[mode]}`}
      accessibilityHint={`Double tap to switch to ${MODE_LABELS[MODE_NEXT[mode]]} mode`}
      hitSlop={tokens.hitSlop}
    >
      <Text style={styles.modeIcon}>{icons[mode]}</Text>
    </Pressable>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface VoiceAgentProps {
  /** Default reply mode */
  defaultMode?: ReplyMode;
}

export function VoiceAgent({ defaultMode = 'both' }: VoiceAgentProps) {
  const { theme } = useTheme();
  const colors    = useColors();
  const { reducedMotion, largeText } = useAccessibilityStore();

  // ── Conversation state ─────────────────────────────────────────────────────
  const {
    turns,
    addUserTurn,
    addAssistantTurn,
    recordDistress,
    getMessages,
    getClaudeContext,
  } = useConversationStore();

  const recentDistress = useConversationStore(selectRecentDistress);

  // ── User profile context ───────────────────────────────────────────────────
  const { locale, userTier, riskScore } = useOnboardingStore((s) => ({
    locale:    s.locale ?? 'en',
    userTier:  s.userTier ?? 'novice',
    riskScore: s.riskScore ?? 1,
  }));

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isOpen,        setIsOpen]        = useState(false);
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [mode,          setMode]          = useState<ReplyMode>(defaultMode);
  const [micState,      setMicState]      = useState<MicState>('idle');
  const [inputText,     setInputText]     = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming,   setIsStreaming]    = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const flatListRef   = useRef<FlatList>(null);
  const abortRef      = useRef<AbortController | null>(null);
  const inputRef      = useRef<TextInput>(null);

  // ── Sheet animation ────────────────────────────────────────────────────────
  const sheetY = useSharedValue(0);   // 0 = offscreen below, 1 = visible

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - sheetY.value) * 600 }],
    opacity:   sheetY.value,
  }));

  const openSheet = useCallback(() => {
    setIsOpen(true);
    sheetY.value = reducedMotion
      ? 1
      : withSpring(1, { damping: 20, stiffness: 200 });
  }, [sheetY, reducedMotion]);

  const closeSheet = useCallback(() => {
    if (reducedMotion) {
      setIsOpen(false);
      setIsExpanded(false);
    } else {
      sheetY.value = withTiming(0, { duration: 220 }, (finished) => {
        if (finished) {
          runOnJS(setIsOpen)(false);
          runOnJS(setIsExpanded)(false);
        }
      });
    }
  }, [sheetY, reducedMotion]);

  // ── FAB pulse animation ────────────────────────────────────────────────────
  const fabScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion || micState !== 'listening') {
      fabScale.setValue(1);
      return;
    }
    const anim = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(fabScale, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        RNAnimated.timing(fabScale, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [micState, reducedMotion, fabScale]);

  // ── STT ────────────────────────────────────────────────────────────────────
  const handleSTTResult = useCallback((text: string) => {
    setMicState('idle');
    if (text.trim()) {
      void handleSendMessage(text.trim());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { isListening, error: sttError, startListening, stopListening } = useSTT(handleSTTResult);

  // ── Scroll to bottom when turns change ────────────────────────────────────
  useEffect(() => {
    if (turns.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: !reducedMotion });
      }, 80);
    }
  }, [turns.length, reducedMotion]);

  // ── Abort in-flight request on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      void stopSpeech();
    };
  }, []);

  // ── Core: send a message ──────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Abort any previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Stop any ongoing TTS
    await stopSpeech();

    // Add user turn locally
    addUserTurn(text);
    setInputText('');
    setStreamingText('');

    // Build messages + context
    const messages = getMessages();
    const context  = getClaudeContext();

    setIsStreaming(true);
    setMicState('processing');

    // Streaming text accumulator for live display
    let accumulated = '';
    const onChunk = (chunk: string) => {
      accumulated += chunk;
      setStreamingText(accumulated);
    };

    try {
      const result = await streamChatRequest(
        {
          messages,
          locale,
          userTier,
          riskScore,
          conversationSummary: context.conversationSummary,
          voiceMode: mode === 'voice',
        },
        onChunk,
        abortRef.current.signal,
      );

      const finalText = result.fullText || accumulated;

      // Persist assistant turn
      addAssistantTurn(finalText, {
        distressLevel: result.distressLevel !== 'none' ? result.distressLevel : undefined,
      });
      recordDistress({ level: result.distressLevel, triggers: [] });

      setStreamingText('');

      // Announce to screen reader
      AccessibilityInfo.announceForAccessibility(`Coco says: ${finalText.slice(0, 80)}`);

      // TTS playback
      if (mode !== 'text') {
        setMicState('speaking');
        await synthesizeSpeech(finalText, { locale: locale as SupportedLocale });
      }

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // user cancelled — do nothing
      } else {
        const fallback = 'Sorry, I lost connection. Please check your internet and try again.';
        addAssistantTurn(fallback);
        setStreamingText('');
        if (mode !== 'text') {
          void synthesizeSpeech(fallback, { locale: locale as SupportedLocale });
        }
      }
    } finally {
      setIsStreaming(false);
      setMicState('idle');
    }
  }, [
    isStreaming,
    mode,
    locale,
    userTier,
    riskScore,
    addUserTurn,
    addAssistantTurn,
    recordDistress,
    getMessages,
    getClaudeContext,
  ]);

  // ── Mic button handler ────────────────────────────────────────────────────
  const handleMicPress = useCallback(async () => {
    if (isStreaming) {
      // Abort ongoing stream
      abortRef.current?.abort();
      await stopSpeech();
      return;
    }

    if (isListening) {
      await stopListening();
      setMicState('idle');
      return;
    }

    if (micState === 'speaking') {
      await stopSpeech();
      setMicState('idle');
      return;
    }

    if (!isOpen) openSheet();

    setMicState('listening');
    await startListening(locale);
  }, [isStreaming, isListening, micState, isOpen, locale, openSheet, stopListening, startListening]);

  // ── Text send handler ─────────────────────────────────────────────────────
  const handleTextSend = useCallback(() => {
    const text = inputText.trim();
    if (text) void handleSendMessage(text);
  }, [inputText, handleSendMessage]);

  // ── Mode cycle ────────────────────────────────────────────────────────────
  const cycleMode = useCallback(() => {
    setMode((prev) => MODE_NEXT[prev]);
  }, []);

  // ── Render turn items ─────────────────────────────────────────────────────
  const renderTurn = useCallback(
    ({ item }: { item: typeof turns[number] }) => (
      <MessageBubble
        key={item.id}
        role={item.role}
        content={item.content}
        isStreaming={false}
        largeText={largeText}
      />
    ),
    [largeText],
  );

  const keyExtractor = useCallback(
    (item: typeof turns[number]) => item.id,
    [],
  );

  // ── Floating mic FAB ──────────────────────────────────────────────────────
  const fabColor =
    micState === 'listening' ? colors.danger :
    micState === 'speaking'  ? colors.accent :
    micState === 'processing' ? colors.warning :
    colors.primary;

  const fabLabel =
    micState === 'listening'  ? 'Stop listening' :
    micState === 'speaking'   ? 'Stop speaking'  :
    micState === 'processing' ? 'Processing...'  :
    'Tap to talk to Coco';

  const fabHint =
    isOpen
      ? 'Double tap to close the coaching sheet'
      : 'Double tap to open Coco and start voice conversation';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Mic FAB ── always visible ── */}
      <RNAnimated.View
        style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleMicPress}
          style={[styles.fab, { backgroundColor: fabColor }]}
          accessibilityRole="button"
          accessibilityLabel={fabLabel}
          accessibilityHint={fabHint}
          accessibilityState={{ selected: isOpen }}
        >
          <View style={styles.fabContent}>
            {micState === 'processing' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.fabIcon}>
                {micState === 'listening' ? '⏹️' :
                 micState === 'speaking'  ? '🔊' :
                 '🎙️'}
              </Text>
            )}
            <Text style={styles.fabText} numberOfLines={1}>
              {micState === 'listening'
                ? 'Listening'
                : micState === 'speaking'
                  ? 'Playing reply'
                  : micState === 'processing'
                    ? 'Processing'
                    : 'Tap to talk to Coco'}
            </Text>
          </View>
        </Pressable>
      </RNAnimated.View>

      {/* ── Conversation sheet ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <Pressable
            style={styles.backdrop}
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="Close coaching panel"
          />

          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                height: isExpanded
                  ? `${SHEET_EXPANDED_RATIO * 100}%`
                  : `${SHEET_COLLAPSED_RATIO * 100}%`,
              },
              sheetAnimStyle,
            ]}
          >
            {/* Drag handle */}
            <Pressable
              onPress={() => setIsExpanded((v) => !v)}
              style={styles.dragHandleArea}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? 'Collapse panel' : 'Expand panel'}
              hitSlop={tokens.hitSlop}
            >
              <View style={[styles.dragHandle, { backgroundColor: colors.textMuted + '44' }]} />
            </Pressable>

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Text style={[styles.sheetTitle, { color: colors.text, fontSize: largeText ? 20 : 17 }]}>
                  🪙 Coco the Coin Coach
                </Text>
                <ModeToggle mode={mode} onToggle={cycleMode} />
              </View>

              {/* Distress banner */}
              {(recentDistress === 'emotional' || recentDistress === 'crisis' || recentDistress === 'financial') && (
                <DistressBanner level={recentDistress} locale={locale} />
              )}
            </View>

            {/* Messages */}
            <FlatList
              ref={flatListRef}
              data={turns}
              renderItem={renderTurn}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textMuted, fontSize: largeText ? 17 : 15 }]}>
                    👋 Hi! I'm Coco — your personal finance coach.{'\n\n'}
                    Tap the mic and ask me anything about saving money, understanding DeFi, or setting financial goals.
                  </Text>
                </View>
              }
              ListFooterComponent={
                isStreaming && streamingText ? (
                  <MessageBubble
                    role="assistant"
                    content={streamingText}
                    isStreaming={true}
                    largeText={largeText}
                  />
                ) : null
              }
            />

            {/* Input row */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={[styles.inputRow, { borderTopColor: colors.primaryLight, backgroundColor: colors.bg }]}>
                {/* Text input (hidden in voice-only mode) */}
                {mode !== 'voice' && (
                  <TextInput
                    ref={inputRef}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask Coco anything..."
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        color:           colors.text,
                        borderColor:     colors.primaryLight,
                        backgroundColor: colors.surface,
                        fontSize:        largeText ? 17 : 15,
                      },
                    ]}
                    onSubmitEditing={handleTextSend}
                    returnKeyType="send"
                    accessibilityLabel="Message input"
                    accessibilityHint="Type your question and press send or return"
                    editable={!isStreaming}
                    multiline
                    maxLength={500}
                  />
                )}

                {/* Send button (text mode) */}
                {mode !== 'voice' && (
                  <Pressable
                    onPress={handleTextSend}
                    disabled={!inputText.trim() || isStreaming}
                    style={[
                      styles.sendButton,
                      {
                        backgroundColor:
                          !inputText.trim() || isStreaming
                            ? colors.primaryLight
                            : colors.primary,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                    accessibilityHint="Double tap to send your typed message to Coco"
                    accessibilityState={{ disabled: !inputText.trim() || isStreaming }}
                    hitSlop={tokens.hitSlop}
                  >
                    <Text style={styles.sendIcon}>→</Text>
                  </Pressable>
                )}

                {/* Mic button */}
                <VoiceMicButton
                  state={
                    sttError        ? 'error'      :
                    isListening     ? 'listening'  :
                    micState === 'speaking'  ? 'speaking'  :
                    micState === 'processing' ? 'processing' :
                    'idle'
                  }
                  onPress={handleMicPress}
                  size={48}
                  accessibilityLabel={
                    isListening
                      ? 'Stop recording'
                      : micState === 'speaking'
                      ? 'Stop Coco speaking'
                      : 'Start voice input'
                  }
                  accessibilityHint={
                    isListening
                      ? 'Double tap to stop recording and send your message'
                      : 'Double tap to speak your question aloud'
                  }
                />
              </View>

              {/* STT error nudge */}
              {sttError && (
                <Text
                  style={[styles.sttError, { color: colors.danger }]}
                  accessibilityLiveRegion="assertive"
                >
                  Microphone unavailable — please type your question above.
                </Text>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // FAB
  fabContainer: {
    position:       'absolute',
    bottom:         tokens.spacing[6],   // 24px
    right:          tokens.spacing[5],   // 20px
    zIndex:         999,
    pointerEvents:  'box-none',
  },
  fab: {
    minWidth:        208,
    height:          60,
    borderRadius:    30,
    paddingHorizontal: tokens.spacing[4],
    alignItems:      'center',
    justifyContent:  'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.22,
    shadowRadius:    8,
    elevation:       8,
    flexDirection:   'row',
  },
  fabContent: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            tokens.spacing[2],
  },
  fabIcon: {
    fontSize: 24,
    lineHeight: 32,
    color: '#FFFFFF',
  },
  fabText: {
    color: '#FFFFFF',
    fontFamily: tokens.fontFamily.base,
    fontSize: 15,
    fontWeight: '700',
  },

  // Backdrop
  backdrop: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    bottom:          0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex:          990,
  },

  // Sheet
  sheet: {
    position:       'absolute',
    left:            0,
    right:           0,
    bottom:          0,
    zIndex:          995,
    borderTopLeftRadius:  tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -4 },
    shadowOpacity:   0.15,
    shadowRadius:    12,
    elevation:       20,
    overflow:        'hidden',
  },

  dragHandleArea: {
    alignItems:     'center',
    paddingVertical: tokens.spacing[3],
  },
  dragHandle: {
    width:           48,
    height:          4,
    borderRadius:    2,
  },

  // Header
  sheetHeader: {
    paddingHorizontal: tokens.spacing[5],
    paddingBottom:     tokens.spacing[2],
  },
  sheetTitleRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    marginBottom:    tokens.spacing[2],
  },
  sheetTitle: {
    fontFamily:  tokens.fontFamily.base,
    fontWeight:  '700',
  },

  // Mode toggle
  modeToggle: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 18,
  },

  // Distress banner
  distressBanner: {
    borderRadius:  tokens.radius.md,
    borderWidth:   1,
    padding:       tokens.spacing[3],
    marginBottom:  tokens.spacing[2],
  },
  distressText: {
    fontFamily: tokens.fontFamily.base,
    fontSize:   13,
    lineHeight: 18,
  },

  // Messages
  messageList: {
    paddingHorizontal: tokens.spacing[4],
    paddingBottom:     tokens.spacing[4],
    flexGrow:          1,
  },
  emptyState: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     tokens.spacing[8],
    paddingHorizontal: tokens.spacing[6],
  },
  emptyText: {
    fontFamily: tokens.fontFamily.base,
    textAlign:  'center',
    lineHeight: 24,
  },

  // Bubbles
  bubble: {
    maxWidth:         '82%',
    borderRadius:     tokens.radius.lg,
    padding:          tokens.spacing[3],
    marginVertical:   tokens.spacing[1],
  },
  bubbleUser: {
    alignSelf:    'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    alignSelf:    'flex-start',
    borderWidth:  1,
    borderBottomLeftRadius: 4,
  },
  bubbleSender: {
    fontFamily:   tokens.fontFamily.base,
    fontWeight:   '700',
    marginBottom: 2,
  },
  bubbleText: {
    fontFamily: tokens.fontFamily.base,
    lineHeight: 22,
  },
  streamingDot: {
    marginTop:  tokens.spacing[1],
    alignSelf:  'flex-start',
  },

  // Input
  inputRow: {
    flexDirection:    'row',
    alignItems:       'flex-end',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical:   tokens.spacing[3],
    borderTopWidth:    1,
    gap:               tokens.spacing[2],
  },
  textInput: {
    flex:             1,
    minHeight:        44,
    maxHeight:        110,
    borderWidth:      1.5,
    borderRadius:     tokens.radius.lg,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical:   tokens.spacing[2],
    fontFamily:       tokens.fontFamily.base,
  },
  sendButton: {
    width:           44,
    height:          44,
    borderRadius:    22,
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendIcon: {
    color:    '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  sttError: {
    fontFamily:        tokens.fontFamily.base,
    fontSize:          12,
    textAlign:         'center',
    paddingBottom:     tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
  },
});
