/**
 * SafeHaven Design System — BadgeChip
 *
 * Used for:
 *   - User tier badges (Novice / Saver / Investor)
 *   - Achievement badges (Budget Master, Emergency Pro, etc.)
 *   - Protocol / strategy tags (Kamino, MarginFi)
 *   - Category labels on lesson cards
 *
 * Accessibility:
 *   - accessibilityRole="text" by default (decorative chips)
 *   - accessibilityRole="button" when onPress provided
 *   - Always has accessibilityLabel even if icon-only
 *   - Earned animation on mount (respects reducedMotion)
 */

import React, { useEffect } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '../Theme';
import { MIN_TOUCH_TARGET } from '../tokens';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type TierType = 'novice' | 'saver' | 'investor';

export interface BadgeChipProps {
  label: string;
  accessibilityLabel?: string;
  /** Emoji or short string icon shown before the label */
  icon?: string;
  /** Custom background color (overrides color preset) */
  backgroundColor?: string;
  /** Custom text color (overrides color preset) */
  textColor?: string;
  /** Preset color scheme */
  preset?: 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'gold' | 'silver' | TierType;
  size?: BadgeSize;
  /** Show a "just earned" scale-bounce animation on mount */
  earned?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BadgeChip({
  label,
  accessibilityLabel,
  icon,
  backgroundColor,
  textColor,
  preset = 'primary',
  size = 'md',
  earned = false,
  onPress,
  style,
}: BadgeChipProps): React.ReactElement {
  const { colors, fonts, reducedMotion } = useTheme();
  const scale = useSharedValue(earned ? 0.5 : 1);

  useEffect(() => {
    if (earned && !reducedMotion) {
      scale.value = withSequence(
        withSpring(1.25, { damping: 6, stiffness: 400 }),
        withSpring(1.0,  { damping: 10, stiffness: 300 }),
      );
    } else if (earned && reducedMotion) {
      scale.value = withTiming(1, { duration: 0 });
    }
  }, [earned, reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const { bg, fg } = resolveColors(preset, colors, backgroundColor, textColor);
  const sizeStyle = getSizeStyle(size, fonts.sizes.sm);

  const chipContent = (
    <View style={[styles.inner, sizeStyle.container]}>
      {icon && (
        <Text
          style={[styles.icon, { fontSize: sizeStyle.iconSize }]}
          accessible={false}
        >
          {icon}
        </Text>
      )}
      <Text
        style={[styles.label, { color: fg, fontSize: sizeStyle.fontSize, fontWeight: '600' }]}
        numberOfLines={1}
        allowFontScaling
        maxFontSizeMultiplier={1.2}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={onPress}
        style={[
          styles.chip,
          { backgroundColor: bg, borderRadius: 999 },
          animatedStyle,
          style,
        ]}
      >
        {chipContent}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedView
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.chip,
        { backgroundColor: bg, borderRadius: 999 },
        animatedStyle,
        style,
      ]}
      entering={!reducedMotion ? FadeIn.duration(200) : undefined}
    >
      {chipContent}
    </AnimatedView>
  );
}

// ─── Tier Badge convenience ───────────────────────────────────────────────────

export function TierBadge({ tier }: { tier: TierType }): React.ReactElement {
  const icons: Record<TierType, string> = {
    novice:   '🌱',
    saver:    '💰',
    investor: '🚀',
  };

  return (
    <BadgeChip
      label={tier.charAt(0).toUpperCase() + tier.slice(1)}
      icon={icons[tier]}
      preset={tier}
      size="md"
      accessibilityLabel={`Level: ${tier}`}
    />
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveColors(
  preset: BadgeChipProps['preset'],
  colors: ReturnType<typeof useTheme>['colors'],
  bgOverride?: string,
  fgOverride?: string,
): { bg: string; fg: string } {
  if (bgOverride) return { bg: bgOverride, fg: fgOverride ?? colors.textOnPrimary };

  switch (preset) {
    case 'primary':   return { bg: colors.primaryLight, fg: colors.primaryDark };
    case 'success':   return { bg: colors.successBg,    fg: colors.success };
    case 'warning':   return { bg: colors.warningBg,    fg: colors.warning };
    case 'danger':    return { bg: colors.dangerBg,     fg: colors.danger };
    case 'muted':     return { bg: colors.bg,           fg: colors.textMuted };
    case 'gold':      return { bg: '#FEF3C7',           fg: '#92400E' };
    case 'silver':    return { bg: '#F1F5F9',           fg: '#475569' };
    case 'novice':    return { bg: '#E0F2FE',           fg: '#0369A1' };
    case 'saver':     return { bg: colors.primaryLight, fg: colors.primaryDark };
    case 'investor':  return { bg: '#EDE9FE',           fg: '#5B21B6' };
    default:          return { bg: colors.primaryLight, fg: colors.primaryDark };
  }
}

function getSizeStyle(size: BadgeSize, baseFontSize: number) {
  switch (size) {
    case 'sm': return { container: { paddingHorizontal: 8, paddingVertical: 4 }, fontSize: baseFontSize - 2, iconSize: 10 };
    case 'md': return { container: { paddingHorizontal: 12, paddingVertical: 6 }, fontSize: baseFontSize, iconSize: 12 };
    case 'lg': return { container: { paddingHorizontal: 16, paddingVertical: 8 }, fontSize: baseFontSize + 2, iconSize: 14 };
  }
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    lineHeight: undefined,
  },
  label: {
    letterSpacing: 0.2,
  },
});
