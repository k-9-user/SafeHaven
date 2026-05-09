/**
 * SafeHaven Onboarding — Step 4: Capital Snapshot
 *
 * "How much can you set aside this month, even if it's just $5?"
 *
 * Completely judgment-free framing — no minimum enforced, no shame labels.
 * Three input modes (user picks the one that feels natural):
 *   A. Slider with preset snap points ($0–$500+)
 *   B. Voice input ("fifty dollars") — transcribed via agent
 *   C. Direct numeric tap on preset chips ($5, $20, $50, $100, $200, Custom)
 *
 * The answer drives:
 *   - Capital range bucket (→ agent/src/risk/profiler.ts)
 *   - Strategy filtering (strategies with minDeposit > monthlyCapital are hidden)
 *   - Coco's framing of the result ("That's a great start!" / "Amazing commitment!")
 *
 * Accessibility:
 *   - Slider: accessibilityRole="adjustable" with increment/decrement actions
 *   - Slider value announced on change: "$50 per month"
 *   - Voice mic button uses existing VoiceMicButton component
 *   - Preset chips: accessibilityRole="radio"
 *   - Amount display text: accessibilityLiveRegion="polite"
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  PanResponder,
  Animated as RNAnimated,
  LayoutChangeEvent,
  StyleSheet,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { useTheme } from '../../design/Theme';
import { Button } from '../../design/components/Button';
import { VoiceMicButton } from '../../design/components/VoiceMicButton';
import { AmountInput } from '../../design/components/AmountInput';
import { OnboardingShell } from './OnboardingShell';
import { useOnboardingStore } from './useOnboardingStore';
import { recordAndTranscribe, synthesizeSpeech, stopSpeech } from '../../voice/elevenlabs';
import type { MicState } from '../../design/components/VoiceMicButton';
import { MIN_TOUCH_TARGET } from '../../design/tokens';

// ─── Snap points ──────────────────────────────────────────────────────────────

const PRESETS = [5, 20, 50, 100, 200, 500];
const MAX_SLIDER = 500;

// Maps a 0-1 slider position to a dollar amount (logarithmic feel)
function posToAmount(pos: number): number {
  const raw = pos * MAX_SLIDER;
  // Snap to nearest preset if within 8% of it
  for (const preset of PRESETS) {
    if (Math.abs(raw - preset) <= MAX_SLIDER * 0.04) return preset;
  }
  return Math.round(raw / 5) * 5; // Round to nearest $5
}

function amountToPos(amount: number): number {
  return Math.min(amount / MAX_SLIDER, 1);
}

function formatAmount(n: number): string {
  if (n === 0) return 'Just starting';
  if (n >= 500) return '$500+';
  return `$${n}`;
}

function getCocoMessage(amount: number): string {
  if (amount === 0) return "That's totally fine — starting is what matters! 💪";
  if (amount < 20) return "Every dollar counts — you're already ahead of most! ⭐";
  if (amount < 100) return "That's a solid start. We'll make it work hard for you! 🚀";
  if (amount < 200) return "Impressive commitment! You're on a great path. 🏆";
  return "Wow — you're serious about this. Amazing! 🎉";
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CapitalSnapshotScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function CapitalSnapshotScreen({
  onNext,
  onBack,
}: CapitalSnapshotScreenProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const { monthlyCapitalUSD, setMonthlyCapital, voiceFirstMode, locale } = useOnboardingStore();

  const [micState, setMicState] = useState<MicState>('idle');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Slider state
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderX = useRef(new RNAnimated.Value(amountToPos(monthlyCapitalUSD))).current;

  const handleSliderLayout = useCallback((e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (sliderWidth === 0) return;
      const pos = Math.max(0, Math.min(1, gestureState.moveX / sliderWidth));
      sliderX.setValue(pos);
      const amount = posToAmount(pos);
      setMonthlyCapital(amount);
      AccessibilityInfo.announceForAccessibility(`${formatAmount(amount)} per month`);
    },
    onPanResponderRelease: () => {
      // Final announce
    },
  });

  // Voice input
  const handleVoiceMic = useCallback(async () => {
    if (micState === 'idle' || micState === 'error') {
      const result = await recordAndTranscribe(locale, setMicState);
      if (result?.transcript) {
        // Extract number from transcript (e.g. "fifty dollars" → 50)
        const spoken = result.transcript.toLowerCase();
        const match = spoken.match(/\d+/);
        if (match) {
          const amount = Math.min(parseInt(match[0], 10), 9999);
          setMonthlyCapital(amount);
          sliderX.setValue(amountToPos(amount));
          await synthesizeSpeech(
            `Got it — ${formatAmount(amount)} per month. ${getCocoMessage(amount)}`,
            { locale },
          );
        } else {
          await synthesizeSpeech(
            "Sorry, I didn't catch the amount. Try saying something like 'fifty dollars' or tap a preset.",
            { locale },
          );
          setMicState('error');
        }
      }
    } else if (micState === 'recording') {
      // Stop recording (handled internally by recordAndTranscribe)
    }
  }, [micState, locale, setMonthlyCapital, sliderX]);

  const amount = monthlyCapitalUSD;
  const thumbPos = sliderX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <OnboardingShell
      step={4}
      screenTitle="How much can you set aside this month?"
      onBack={onBack}
      cocoVariant={amount > 0 ? 'happy' : 'idle'}
      showVoiceReplay={voiceFirstMode}
      onVoiceReplay={async () => {
        await synthesizeSpeech(
          "How much money can you set aside this month? Even if it's just five dollars, that's a great start. There's no right or wrong answer here.",
          { locale },
        );
      }}
      footer={
        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onNext}
          accessibilityLabel="Continue to risk profiling"
          accessibilityHint="Moves to the next step"
        />
      }
    >
      {/* Heading */}
      <Text
        accessible
        accessibilityRole="header"
        style={[
          styles.heading,
          { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginBottom: spacing[1] },
        ]}
        allowFontScaling
      >
        How much can you set aside this month?
      </Text>
      <Text
        style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing[5] }}
        allowFontScaling
      >
        Even $5 matters. No judgement — just an estimate.
      </Text>

      {/* Amount display */}
      <View style={styles.amountDisplay}>
        <Text
          accessible
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Selected amount: ${formatAmount(amount)} per month`}
          style={[
            styles.amountText,
            { color: amount > 0 ? colors.primary : colors.textMuted, fontSize: fonts.sizes['4xl'], fontWeight: '800' },
          ]}
          allowFontScaling
        >
          {formatAmount(amount)}
        </Text>
        {amount > 0 && (
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>
            per month
          </Text>
        )}
      </View>

      {/* Coco encouragement */}
      <Text
        style={[
          styles.cocoMessage,
          {
            color: colors.primary,
            fontSize: fonts.sizes.sm,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: spacing[5],
          },
        ]}
        allowFontScaling
      >
        {getCocoMessage(amount)}
      </Text>

      {/* ── Slider ────────────────────────────────────────────────── */}
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Amount slider. Current value: ${formatAmount(amount)}`}
        accessibilityValue={{ min: 0, max: MAX_SLIDER, now: amount }}
        accessibilityActions={[
          { name: 'increment', label: 'Increase by $10' },
          { name: 'decrement', label: 'Decrease by $10' },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') {
            const next = Math.min(amount + 10, MAX_SLIDER);
            setMonthlyCapital(next);
            sliderX.setValue(amountToPos(next));
          } else if (event.nativeEvent.actionName === 'decrement') {
            const next = Math.max(amount - 10, 0);
            setMonthlyCapital(next);
            sliderX.setValue(amountToPos(next));
          }
        }}
        style={[styles.sliderContainer, { marginBottom: spacing[5] }]}
        onLayout={handleSliderLayout}
        {...panResponder.panHandlers}
      >
        {/* Track */}
        <View
          style={[
            styles.track,
            { backgroundColor: colors.border, borderRadius: 6 },
          ]}
        >
          {/* Fill */}
          <RNAnimated.View
            style={[
              styles.trackFill,
              {
                width: thumbPos,
                backgroundColor: colors.primary,
                borderRadius: 6,
              },
            ]}
          />
          {/* Snap point markers */}
          {PRESETS.map((p) => (
            <View
              key={p}
              style={[
                styles.snapDot,
                {
                  left: `${(p / MAX_SLIDER) * 100}%`,
                  backgroundColor: amount >= p ? colors.primaryLight : colors.border,
                },
              ]}
              accessible={false}
            />
          ))}
        </View>

        {/* Thumb */}
        <RNAnimated.View
          style={[
            styles.thumb,
            {
              left: thumbPos,
              backgroundColor: colors.primary,
              borderColor: colors.surface,
              shadowColor: colors.primary,
            },
          ]}
        />

        {/* Range labels */}
        <View style={styles.rangeLabels}>
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs }}>$0</Text>
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs }}>$500+</Text>
        </View>
      </View>

      {/* ── Preset chips ────────────────────────────────────────── */}
      <Text
        style={{ color: colors.textMuted, fontSize: fonts.sizes.xs, fontWeight: '700', marginBottom: spacing[2], textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        Quick pick
      </Text>
      <View style={styles.chipsRow}>
        {PRESETS.map((preset) => {
          const isActive = amount === preset;
          return (
            <Pressable
              key={preset}
              accessible
              accessibilityRole="radio"
              accessibilityLabel={`${formatAmount(preset)} per month`}
              accessibilityState={{ checked: isActive }}
              onPress={() => {
                setMonthlyCapital(preset);
                sliderX.setValue(amountToPos(preset));
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.primary : colors.primaryLight,
                  borderRadius: radius.full,
                  minHeight: MIN_TOUCH_TARGET,
                  paddingHorizontal: spacing[4],
                },
              ]}
            >
              <Text style={{ color: isActive ? '#FFFFFF' : colors.primaryDark, fontSize: fonts.sizes.sm, fontWeight: '700' }}>
                {formatAmount(preset)}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Enter custom amount"
          onPress={() => setShowCustomInput(!showCustomInput)}
          style={[
            styles.chip,
            {
              backgroundColor: showCustomInput ? colors.primary : colors.primaryLight,
              borderRadius: radius.full,
              minHeight: MIN_TOUCH_TARGET,
              paddingHorizontal: spacing[4],
            },
          ]}
        >
          <Text style={{ color: showCustomInput ? '#FFFFFF' : colors.primaryDark, fontSize: fonts.sizes.sm, fontWeight: '700' }}>
            Custom
          </Text>
        </Pressable>
      </View>

      {/* Custom amount input */}
      {showCustomInput && (
        <View style={{ marginTop: spacing[4] }}>
          <AmountInput
            label="Custom amount"
            value={amount || undefined}
            onChange={(v) => {
              const val = v ?? 0;
              setMonthlyCapital(val);
              sliderX.setValue(amountToPos(val));
            }}
            min={0}
            max={9999}
            helperText="Any amount is a great start."
          />
        </View>
      )}

      {/* ── Voice input ─────────────────────────────────────────── */}
      <View style={[styles.voiceSection, { marginTop: spacing[6] }]}>
        <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, textAlign: 'center', marginBottom: spacing[3] }}>
          Or speak your answer
        </Text>
        <View style={{ alignItems: 'center' }}>
          <VoiceMicButton
            state={micState}
            onPress={handleVoiceMic}
            size={64}
            accessibilityHint='Say an amount like "fifty dollars" or "twenty" to set your monthly savings.'
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  heading: { letterSpacing: -0.3 },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  amountText: {
    fontVariant: ['tabular-nums'],
  },
  cocoMessage: {
    paddingHorizontal: 16,
  },
  sliderContainer: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  track: {
    height: 8,
    width: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  snapDot: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
  },
  thumb: {
    position: 'absolute',
    top: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    marginLeft: -14,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSection: {
    alignItems: 'center',
  },
});
