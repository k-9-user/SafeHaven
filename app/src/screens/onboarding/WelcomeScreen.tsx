/**
 * SafeHaven Onboarding — Step 0: Welcome
 *
 * Coco the Coin Coach appears with a gentle animation and greets the user
 * by voice in their auto-detected language. Subtitle text is always shown
 * for hearing-impaired users and low-literacy contexts.
 *
 * Voice:  ElevenLabs TTS via agent proxy (falls back to expo-speech offline)
 * i18n:   Locale auto-detected from device; overridable in next step
 *
 * Accessibility:
 *   - Subtitles always visible (not hidden behind a toggle)
 *   - "Skip voice" Pressable for users who prefer silence
 *   - accessibilityRole="header" on greeting text
 *   - All animations respect reducedMotion
 *   - No auto-advance — user controls the pace
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '../../design/Theme';
import { CocoPet } from '../../design/components/CocoPet';
import { Button } from '../../design/components/Button';
import { synthesizeSpeech, stopSpeech, type SupportedLocale } from '../../voice/elevenlabs';
import { useOnboardingStore } from './useOnboardingStore';
import { OnboardingShell } from './OnboardingShell';

// ─── Localized welcome content ────────────────────────────────────────────────

const WELCOME_CONTENT: Record<SupportedLocale, {
  greeting: string;
  subtitle: string;
  voiceScript: string;
  ctaLabel: string;
}> = {
  en: {
    greeting: "Hi! I'm Coco, your Coin Coach 👋",
    subtitle: "I'll guide you to build a safer financial future — step by step, judgment-free.",
    voiceScript: "Hi! I'm Coco, your personal Coin Coach. I'm here to help you build a safer financial future — step by step, no experience needed. Let's get started!",
    ctaLabel: "Let's go!",
  },
  fr: {
    greeting: "Salut ! Je suis Coco, ton Coach Finances 👋",
    subtitle: "Je vais t'aider à construire un avenir financier plus sûr — étape par étape, sans jugement.",
    voiceScript: "Salut ! Je suis Coco, ton coach personnel en finances. Je suis là pour t'aider à construire un avenir financier plus sûr — étape par étape, sans aucune expérience nécessaire. C'est parti !",
    ctaLabel: "C'est parti !",
  },
  es: {
    greeting: "¡Hola! Soy Coco, tu Coach Financiero 👋",
    subtitle: "Te guiaré hacia un futuro financiero más seguro — paso a paso, sin juzgarte.",
    voiceScript: "¡Hola! Soy Coco, tu entrenador financiero personal. Estoy aquí para ayudarte a construir un futuro financiero más seguro — paso a paso, sin necesitar experiencia previa. ¡Empecemos!",
    ctaLabel: "¡Vamos!",
  },
  pt: {
    greeting: "Olá! Sou Coco, seu Coach Financeiro 👋",
    subtitle: "Vou te guiar para um futuro financeiro mais seguro — passo a passo, sem julgamentos.",
    voiceScript: "Olá! Sou Coco, seu treinador financeiro pessoal. Estou aqui para te ajudar a construir um futuro financeiro mais seguro — passo a passo, sem experiência necessária. Vamos lá!",
    ctaLabel: "Vamos lá!",
  },
  sw: {
    greeting: "Habari! Mimi ni Coco, Kocha wako wa Fedha 👋",
    subtitle: "Nitakuongoza kujenga mustakabali bora wa kifedha — hatua kwa hatua, bila kukuhukumu.",
    voiceScript: "Habari! Mimi ni Coco, kocha wako binafsi wa fedha. Niko hapa kukusaidia kujenga mustakabali bora wa kifedha — hatua kwa hatua. Twende!",
    ctaLabel: "Twende!",
  },
  ha: {
    greeting: "Sannu! Ni Coco ne, Mai Koya Kudin Ku 👋",
    subtitle: "Zan taimaka maka gina makomar kudi mafi aminci — mataki bayan mataki.",
    voiceScript: "Sannu! Ni Coco ne, mai koya maka game da kudi. Ina nan don taimaka maka gina makomar kudi mafi aminci. Mu fara!",
    ctaLabel: "Mu fara!",
  },
  ar: {
    greeting: "مرحباً! أنا كوكو، مدربك المالي 👋",
    subtitle: "سأرشدك نحو مستقبل مالي أكثر أماناً — خطوة بخطوة، بدون أي حكم مسبق.",
    voiceScript: "مرحباً! أنا كوكو، مدربك المالي الشخصي. أنا هنا لمساعدتك على بناء مستقبل مالي أكثر أماناً — خطوة بخطوة، دون الحاجة إلى أي خبرة سابقة. هيا نبدأ!",
    ctaLabel: "هيا نبدأ!",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const locale = useOnboardingStore((s) => s.locale);
  const content = WELCOME_CONTENT[locale] ?? WELCOME_CONTENT.en;

  const [voicePlaying, setVoicePlaying] = useState(false);
  const [voiceSkipped, setVoiceSkipped] = useState(false);
  const [cocoVariant, setCocoVariant] = useState<'idle' | 'happy'>('idle');
  const hasSpoken = useRef(false);

  // Animated entrance for Coco
  const cocoScale = useSharedValue(0.6);
  const cocoOpacity = useSharedValue(0);

  useEffect(() => {
    cocoScale.value = withSpring(1, { damping: 12, stiffness: 180 });
    cocoOpacity.value = withTiming(1, { duration: reducedMotion ? 0 : 500 });

    // Auto-play voice after brief entrance animation
    const timer = setTimeout(() => {
      if (!hasSpoken.current && !voiceSkipped) {
        playWelcomeVoice();
      }
    }, reducedMotion ? 0 : 800);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cocoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cocoScale.value }],
    opacity: cocoOpacity.value,
  }));

  const playWelcomeVoice = useCallback(async () => {
    if (voicePlaying) return;
    hasSpoken.current = true;
    setVoicePlaying(true);
    setCocoVariant('happy');

    try {
      await synthesizeSpeech(content.voiceScript, { locale });
    } catch {
      // expo-speech fallback already handled inside synthesizeSpeech
    } finally {
      setVoicePlaying(false);
      setCocoVariant('idle');
    }
  }, [voicePlaying, content.voiceScript, locale]);

  const skipVoice = useCallback(async () => {
    setVoiceSkipped(true);
    await stopSpeech();
    setVoicePlaying(false);
    setCocoVariant('idle');
  }, []);

  return (
    <OnboardingShell
      step={0}
      screenTitle="Welcome to SafeHaven"
      showBack={false}
      showVoiceReplay={voiceSkipped || !voicePlaying}
      onVoiceReplay={playWelcomeVoice}
      cocoVariant={cocoVariant}
      footer={
        <Button
          label={content.ctaLabel}
          variant="primary"
          size="lg"
          fullWidth
          onPress={onNext}
          accessibilityLabel={content.ctaLabel}
          accessibilityHint="Moves to the language selection screen"
        />
      }
    >
      {/* Coco mascot */}
      <View style={styles.cocoContainer}>
        <Animated.View style={cocoAnimStyle}>
          <CocoPet
            variant={cocoVariant}
            size={140}
            animated={!reducedMotion}
          />
        </Animated.View>
      </View>

      {/* Greeting */}
      <Text
        accessible
        accessibilityRole="header"
        style={[
          styles.greeting,
          {
            color: colors.text,
            fontSize: fonts.sizes['2xl'],
            fontWeight: '800',
            marginTop: spacing[5],
            textAlign: 'center',
          },
        ]}
        allowFontScaling
      >
        {content.greeting}
      </Text>

      {/* Subtitle — always visible for accessibility */}
      <Text
        style={[
          styles.subtitle,
          {
            color: colors.textMuted,
            fontSize: fonts.sizes.base,
            lineHeight: fonts.lineHeight(fonts.sizes.base, 'relaxed'),
            marginTop: spacing[3],
            textAlign: 'center',
          },
        ]}
        allowFontScaling
      >
        {content.subtitle}
      </Text>

      {/* Voice playing indicator + skip */}
      {voicePlaying && (
        <Animated.View
          entering={!reducedMotion ? FadeIn.duration(200) : undefined}
          style={[
            styles.voiceIndicator,
            {
              backgroundColor: colors.primaryLight,
              borderRadius: radius.full,
              marginTop: spacing[5],
            },
          ]}
        >
          <Text style={{ color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '600' }}>
            🔊 Coco is speaking…
          </Text>
          <Pressable
            onPress={skipVoice}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Skip voice"
            style={[styles.skipBtn, { marginLeft: spacing[3] }]}
          >
            <Text style={{ color: colors.primaryDark, fontSize: fonts.sizes.sm, fontWeight: '700' }}>
              Skip
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Trust signals */}
      <View style={[styles.trustRow, { marginTop: spacing[8] }]}>
        {[
          { icon: '🔒', label: 'Bank-grade\nsecurity' },
          { icon: '🚫', label: 'No hidden\nfees' },
          { icon: '📖', label: 'Learn as\nyou go' },
        ].map(({ icon, label }) => (
          <View key={label} style={styles.trustItem} accessible>
            <Text style={{ fontSize: 28 }}>{icon}</Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fonts.sizes.xs,
                textAlign: 'center',
                fontWeight: '600',
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  cocoContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  greeting: {
    letterSpacing: -0.5,
  },
  subtitle: {},
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
});
