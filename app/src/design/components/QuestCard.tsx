/**
 * SafeHaven Design System — QuestCard
 *
 * GitMastery-inspired mission/quest card for the learning module.
 *
 * States:
 *   locked     → grayed out, padlock icon
 *   available  → full color, "Start" button
 *   in_progress→ progress bar shown, "Continue" button
 *   completed  → green check, XP earned badge, celebration animation
 *
 * Accessibility:
 *   - Entire card is one pressable with descriptive accessibilityLabel
 *   - State (locked/completed/in-progress) announced to screen reader
 *   - XP reward announced as "+N XP"
 *   - Completion animation respects reducedMotion
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useTheme } from '../Theme';
import { CardAccent } from './Card';
import { BadgeChip } from './BadgeChip';
import { ProgressBar } from './ProgressBar';
import { shadows } from '../tokens';

export type QuestState = 'locked' | 'available' | 'in_progress' | 'completed';

export interface QuestCardProps {
  title: string;
  description: string;
  xpReward: number;
  state: QuestState;
  /** Progress 0–100 (shown when state is in_progress) */
  progress?: number;
  /** Category label (e.g. "Budget", "DeFi", "Savings") */
  category?: string;
  categoryColor?: string;
  estimatedMinutes?: number;
  onPress?: () => void;
  style?: ViewStyle;
  /** Index for staggered enter animations */
  enterDelay?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function QuestCard({
  title,
  description,
  xpReward,
  state,
  progress = 0,
  category,
  categoryColor,
  estimatedMinutes,
  onPress,
  style,
  enterDelay = 0,
}: QuestCardProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const scale = useSharedValue(1);
  const completedScale = useSharedValue(state === 'completed' ? 1 : 0);

  useEffect(() => {
    if (state === 'completed' && !reducedMotion) {
      completedScale.value = withSequence(
        withSpring(1.2, { damping: 5, stiffness: 400 }),
        withSpring(1.0, { damping: 10 }),
      );
    } else if (state === 'completed') {
      completedScale.value = withTiming(1, { duration: 0 });
    }
  }, [state, reducedMotion, completedScale]);

  const completedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completedScale.value }],
  }));

  const isDisabled = state === 'locked';
  const accentColor =
    state === 'completed' ? colors.success :
    state === 'locked'    ? colors.textDisabled :
    categoryColor ?? colors.primary;

  const a11yLabel = buildA11yLabel(title, state, xpReward, progress);

  function handlePressIn(): void {
    if (!isDisabled && !reducedMotion) {
      scale.value = withSpring(0.97, { damping: 20, stiffness: 400 });
    }
  }

  function handlePressOut(): void {
    if (!isDisabled && !reducedMotion) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDisabled ? 0.5 : 1,
  }));

  return (
    <AnimatedPressable
      accessible
      accessibilityRole={isDisabled ? 'text' : 'button'}
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      entering={
        !reducedMotion
          ? FadeInDown.delay(enterDelay).duration(300)
          : undefined
      }
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          ...shadows.md,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Left accent strip */}
      <CardAccent color={accentColor} width={5} />

      <View style={[styles.content, { padding: spacing[4] }]}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            {category && (
              <BadgeChip
                label={category}
                size="sm"
                backgroundColor={categoryColor ? `${categoryColor}20` : colors.primaryLight}
                textColor={categoryColor ?? colors.primaryDark}
                style={{ marginBottom: spacing[1] }}
              />
            )}
            <Text
              style={[
                styles.title,
                {
                  color: isDisabled ? colors.textMuted : colors.text,
                  fontSize: fonts.sizes.base,
                  lineHeight: fonts.lineHeight(fonts.sizes.base, 'snug'),
                },
              ]}
              numberOfLines={2}
              allowFontScaling
            >
              {state === 'locked' ? '🔒 ' : ''}{title}
            </Text>
          </View>

          {/* XP badge */}
          <Animated.View style={state === 'completed' ? completedBadgeStyle : undefined}>
            {state === 'completed' ? (
              <BadgeChip label={`+${xpReward} XP`} icon="✅" preset="success" size="sm" earned />
            ) : (
              <BadgeChip label={`+${xpReward} XP`} icon="⚡" preset="primary" size="sm" />
            )}
          </Animated.View>
        </View>

        {/* Description */}
        <Text
          style={[
            styles.description,
            {
              color: colors.textMuted,
              fontSize: fonts.sizes.sm,
              lineHeight: fonts.lineHeight(fonts.sizes.sm, 'relaxed'),
              marginTop: spacing[2],
            },
          ]}
          numberOfLines={2}
          allowFontScaling
        >
          {description}
        </Text>

        {/* Progress bar (in_progress only) */}
        {state === 'in_progress' && (
          <View style={{ marginTop: spacing[3] }}>
            <ProgressBar
              value={progress}
              variant="lesson"
              height={8}
              accessibilityLabel={`Lesson ${Math.round(progress)}% complete`}
            />
          </View>
        )}

        {/* Footer */}
        <View style={[styles.footer, { marginTop: spacing[3] }]}>
          {estimatedMinutes && (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fonts.sizes.xs,
                fontWeight: '500',
              }}
              accessible={false}
            >
              ⏱ {estimatedMinutes} min
            </Text>
          )}
          <Text
            style={{
              color: getCtaColor(state, colors),
              fontSize: fonts.sizes.sm,
              fontWeight: '700',
              marginLeft: 'auto',
            }}
          >
            {getCtaLabel(state)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCtaLabel(state: QuestState): string {
  switch (state) {
    case 'locked':      return '';
    case 'available':   return 'Start →';
    case 'in_progress': return 'Continue →';
    case 'completed':   return 'Review ✓';
  }
}

function getCtaColor(
  state: QuestState,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (state) {
    case 'completed':   return colors.success;
    case 'locked':      return colors.textDisabled;
    default:            return colors.primary;
  }
}

function buildA11yLabel(
  title: string,
  state: QuestState,
  xpReward: number,
  progress: number,
): string {
  switch (state) {
    case 'locked':      return `${title}. Locked. Complete previous lessons to unlock.`;
    case 'available':   return `${title}. ${xpReward} XP reward. Tap to start.`;
    case 'in_progress': return `${title}. ${Math.round(progress)}% complete. ${xpReward} XP reward. Tap to continue.`;
    case 'completed':   return `${title}. Completed. You earned ${xpReward} XP.`;
  }
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
