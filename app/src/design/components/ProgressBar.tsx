/**
 * SafeHaven Design System — ProgressBar
 *
 * Used for:
 *   - XP progress toward next tier
 *   - Lesson completion progress
 *   - Strategy deposit progress
 *
 * Accessibility:
 *   - accessibilityRole="progressbar"
 *   - accessibilityValue: { min, max, now } for screen readers
 *   - Announces percentage to TalkBack/VoiceOver when value changes
 *   - Animated fill (disabled in reducedMotion)
 *
 * Variants:
 *   xp       → blue gradient (XP bar)
 *   lesson   → green fill (lesson progress)
 *   neutral  → slate fill (generic)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../Theme';
import { MIN_TOUCH_TARGET } from '../tokens';

export type ProgressBarVariant = 'xp' | 'lesson' | 'neutral';

export interface ProgressBarProps {
  /** Progress value 0–100 */
  value: number;
  /** Max value (default 100) */
  max?: number;
  variant?: ProgressBarVariant;
  height?: number;
  showLabel?: boolean;
  label?: string;        // e.g. "340 / 500 XP"
  accessibilityLabel?: string;
  /** Called when animation completes */
  onAnimationEnd?: () => void;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'xp',
  height = 12,
  showLabel = false,
  label,
  accessibilityLabel,
  onAnimationEnd,
}: ProgressBarProps): React.ReactElement {
  const { colors, fonts, radius, reducedMotion, durations } = useTheme();
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percent = (clampedValue / max) * 100;

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(
      percent,
      {
        duration: reducedMotion ? 0 : durations.slow,
      },
      (finished) => {
        if (finished) onAnimationEnd?.();
      },
    );
  }, [percent, reducedMotion, durations.slow, width, onAnimationEnd]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const fillColor = getFillColor(variant, colors);

  const a11yLabel =
    accessibilityLabel ??
    `${label ?? 'Progress'}: ${Math.round(percent)} percent`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
      accessibilityValue={{ min: 0, max, now: clampedValue }}
    >
      {showLabel && label && (
        <Text
          style={[
            styles.label,
            {
              color: colors.textMuted,
              fontSize: fonts.sizes.sm,
              marginBottom: 4,
            },
          ]}
          numberOfLines={1}
          allowFontScaling
        >
          {label}
        </Text>
      )}

      {/* Track */}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: variant === 'xp' ? colors.xpTrack : colors.border,
            borderRadius: height / 2,
          },
        ]}
      >
        {/* Fill */}
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              backgroundColor: fillColor,
              borderRadius: height / 2,
            },
            fillStyle,
          ]}
        />

        {/* Shimmer highlight for XP bar */}
        {variant === 'xp' && (
          <View
            style={[
              styles.highlight,
              {
                height: height * 0.4,
                borderRadius: height / 2,
                top: height * 0.15,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
}

function getFillColor(
  variant: ProgressBarVariant,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  switch (variant) {
    case 'xp':     return colors.xpFill;
    case 'lesson': return colors.success;
    case 'neutral':
    default:       return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  highlight: {
    position: 'absolute',
    left: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

// ─── XPBar convenience component ─────────────────────────────────────────────

export interface XPBarProps {
  currentXP: number;
  maxXP: number;
  tierLabel: string;
}

export function XPBar({ currentXP, maxXP, tierLabel }: XPBarProps): React.ReactElement {
  const { colors, fonts, spacing } = useTheme();
  const percent = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: spacing[1],
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: fonts.sizes.sm,
            fontWeight: '600',
          }}
        >
          {tierLabel}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fonts.sizes.sm,
          }}
        >
          {currentXP} / {maxXP} XP
        </Text>
      </View>
      <ProgressBar
        value={currentXP}
        max={maxXP}
        variant="xp"
        height={14}
        accessibilityLabel={`${currentXP} of ${maxXP} XP toward ${tierLabel}`}
      />
    </View>
  );
}
