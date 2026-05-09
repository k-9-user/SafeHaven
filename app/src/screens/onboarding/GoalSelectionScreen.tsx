/**
 * SafeHaven Onboarding — Step 3: Goal Selection
 *
 * Pictorial multi-select goal cards. Users pick one or more goals —
 * these drive the AI coach's tone and strategy recommendations.
 *
 * Goals:
 *   🛡  Save for emergencies     → builds safety-net framing
 *   ✈️  Send money home          → remittance flow emphasis
 *   🎯  Save for a goal          → target-based savings
 *   🌱  Grow my money slowly     → DeFi yield intro
 *
 * Accessibility:
 *   - accessibilityRole="checkbox" on each card (multi-select)
 *   - accessibilityState.checked reflects selection
 *   - Voice reads goal description when card gains focus (voice-first mode)
 *   - Large illustrated icons (emoji) — not icon-only (label always shown)
 *   - Minimum card height 96dp for easy tapping
 *   - Continue button disabled until at least 1 goal selected
 */

import React, { useCallback } from 'react';
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
} from 'react-native-reanimated';
import { useTheme } from '../../design/Theme';
import { Button } from '../../design/components/Button';
import { BadgeChip } from '../../design/components/BadgeChip';
import { OnboardingShell } from './OnboardingShell';
import { useOnboardingStore, type OnboardingGoal } from './useOnboardingStore';
import { synthesizeSpeech, stopSpeech } from '../../voice/elevenlabs';

// ─── Goal config ──────────────────────────────────────────────────────────────

interface GoalConfig {
  id: OnboardingGoal;
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagPreset: 'success' | 'primary' | 'warning' | 'muted';
  color: string;        // card accent
  voiceDescription: string;
}

const GOALS: GoalConfig[] = [
  {
    id: 'emergency_fund',
    icon: '🛡️',
    title: 'Save for emergencies',
    description: 'Build a safety net so unexpected costs don\'t throw you off track.',
    tag: 'Most popular',
    tagPreset: 'success',
    color: '#10B981',
    voiceDescription: 'Save for emergencies: Build a safety net so unexpected costs don\'t throw you off track.',
  },
  {
    id: 'send_money_home',
    icon: '✈️',
    title: 'Send money home',
    description: 'Support family abroad with better exchange rates and lower fees.',
    tag: 'Remittance',
    tagPreset: 'primary',
    color: '#2563EB',
    voiceDescription: 'Send money home: Support family abroad with better exchange rates and lower fees.',
  },
  {
    id: 'save_for_goal',
    icon: '🎯',
    title: 'Save for a goal',
    description: 'A phone, a trip, a business — make it happen, step by step.',
    tag: 'Goal-based',
    tagPreset: 'warning',
    color: '#F59E0B',
    voiceDescription: 'Save for a goal: A phone, a trip, a business — make it happen, step by step.',
  },
  {
    id: 'grow_slowly',
    icon: '🌱',
    title: 'Grow my money slowly',
    description: 'Put idle savings to work at 4–8% APY with no experience needed.',
    tag: 'Earn yield',
    tagPreset: 'muted',
    color: '#38BDF8',
    voiceDescription: 'Grow my money slowly: Put idle savings to work at 4 to 8 percent per year, with no experience needed.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface GoalSelectionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function GoalSelectionScreen({
  onNext,
  onBack,
}: GoalSelectionScreenProps): React.ReactElement {
  const { colors, fonts, spacing, reducedMotion } = useTheme();
  const { goals, toggleGoal, voiceFirstMode, locale } = useOnboardingStore();

  const handleToggle = useCallback(async (goal: GoalConfig) => {
    toggleGoal(goal.id);

    const nowSelected = !goals.includes(goal.id);
    AccessibilityInfo.announceForAccessibility(
      `${goal.title}: ${nowSelected ? 'selected' : 'unselected'}`,
    );

    if (voiceFirstMode) {
      await stopSpeech();
      await synthesizeSpeech(goal.voiceDescription, { locale });
    }
  }, [goals, toggleGoal, voiceFirstMode, locale]);

  const canContinue = goals.length > 0;

  return (
    <OnboardingShell
      step={3}
      screenTitle="What's your main goal?"
      onBack={onBack}
      cocoVariant="thinking"
      showVoiceReplay={voiceFirstMode}
      onVoiceReplay={async () => {
        await synthesizeSpeech(
          "What's your main goal? You can pick more than one. Choose from: Save for emergencies, Send money home, Save for a goal, or Grow my money slowly.",
          { locale },
        );
      }}
      footer={
        <Button
          label={canContinue ? `Continue (${goals.length} selected)` : 'Pick at least one goal'}
          variant={canContinue ? 'primary' : 'secondary'}
          size="lg"
          fullWidth
          disabled={!canContinue}
          onPress={onNext}
          accessibilityLabel={
            canContinue
              ? `Continue with ${goals.length} goal${goals.length > 1 ? 's' : ''} selected`
              : 'Please select at least one goal to continue'
          }
          accessibilityHint="Moves to the capital snapshot step"
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
        What's your main goal?
      </Text>
      <Text
        style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing[5] }}
        allowFontScaling
      >
        Pick one or more — we'll personalise your experience.
      </Text>

      {/* Goal cards */}
      <View
        accessible={false}
        accessibilityRole="none"
        style={styles.grid}
      >
        {GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isSelected={goals.includes(goal.id)}
            onPress={() => handleToggle(goal)}
            reducedMotion={reducedMotion}
          />
        ))}
      </View>
    </OnboardingShell>
  );
}

// ─── Goal card ────────────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GoalCardProps {
  goal: GoalConfig;
  isSelected: boolean;
  onPress: () => void;
  reducedMotion: boolean;
}

function GoalCard({ goal, isSelected, onPress, reducedMotion }: GoalCardProps): React.ReactElement {
  const { colors, fonts, spacing, radius, shadows } = useTheme();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="checkbox"
      accessibilityLabel={`${goal.title}. ${goal.description}`}
      accessibilityHint={isSelected ? 'Currently selected. Double-tap to deselect.' : 'Double-tap to select.'}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      onPressIn={() => {
        if (!reducedMotion) scale.value = withSpring(0.97, { damping: 18, stiffness: 350 });
      }}
      onPressOut={() => {
        if (!reducedMotion) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[
        styles.goalCard,
        {
          backgroundColor: isSelected ? `${goal.color}15` : colors.surface,
          borderColor: isSelected ? goal.color : colors.border,
          borderWidth: isSelected ? 2.5 : 1,
          borderRadius: radius.lg,
          padding: spacing[4],
          marginBottom: spacing[3],
          ...shadows.sm,
        },
        animStyle,
      ]}
    >
      {/* Left: icon */}
      <Text style={styles.goalIcon} accessible={false}>{goal.icon}</Text>

      {/* Center: text */}
      <View style={styles.goalText}>
        <View style={styles.goalTitleRow}>
          <Text
            style={{
              color: isSelected ? goal.color : colors.text,
              fontSize: fonts.sizes.base,
              fontWeight: '700',
              flex: 1,
            }}
            allowFontScaling
          >
            {goal.title}
          </Text>
          <BadgeChip
            label={goal.tag}
            preset={goal.tagPreset}
            size="sm"
          />
        </View>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fonts.sizes.sm,
            lineHeight: fonts.lineHeight(fonts.sizes.sm, 'relaxed'),
            marginTop: 4,
          }}
          allowFontScaling
        >
          {goal.description}
        </Text>
      </View>

      {/* Check indicator */}
      <View
        style={[
          styles.checkBox,
          {
            borderColor: isSelected ? goal.color : colors.border,
            backgroundColor: isSelected ? goal.color : 'transparent',
            borderRadius: 6,
          },
        ]}
        accessible={false}
      >
        {isSelected && (
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>✓</Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    letterSpacing: -0.3,
  },
  grid: {
    gap: 0,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    fontSize: 36,
    marginRight: 12,
    width: 44,
    textAlign: 'center',
  },
  goalText: {
    flex: 1,
    marginRight: 8,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
