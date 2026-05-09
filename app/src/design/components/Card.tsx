/**
 * SafeHaven Design System — Card
 *
 * Variants:
 *   default  — flat, light surface
 *   elevated — soft shadow, slightly lifted
 *   outlined — border only, no shadow
 *   quest    — colored left accent strip (GitMastery-inspired)
 *   success  — green accent (completed state)
 *   warning  — amber accent (caution state)
 */

import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../Theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'quest' | 'success' | 'warning';

export interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  /** If provided, the card becomes pressable (link/action card) */
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Accent color override for quest variant */
  accentColor?: string;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  variant = 'default',
  children,
  style,
  contentStyle,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accentColor,
  testID,
}: CardProps): React.ReactElement {
  const { colors, radius, shadows, reducedMotion } = useTheme();
  const scale = useSharedValue(1);

  const isInteractive = Boolean(onPress);

  function handlePressIn(): void {
    if (!reducedMotion && isInteractive) {
      scale.value = withSpring(0.98, { damping: 20, stiffness: 400 });
    }
  }

  function handlePressOut(): void {
    if (!reducedMotion && isInteractive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const containerStyle = getContainerStyle(variant, colors, radius, shadows, accentColor);
  const accentStyle = getAccentStyle(variant, colors, radius, accentColor);

  const Inner = (
    <View style={[styles.inner, accentStyle.inner, contentStyle]}>
      {children}
    </View>
  );

  if (isInteractive) {
    return (
      <AnimatedPressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle, accentStyle.outer, animatedStyle, style]}
        testID={testID}
      >
        {Inner}
      </AnimatedPressable>
    );
  }

  return (
    <View
      style={[containerStyle, accentStyle.outer, style]}
      testID={testID}
    >
      {Inner}
    </View>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function getContainerStyle(
  variant: CardVariant,
  colors: ReturnType<typeof useTheme>['colors'],
  radius: ReturnType<typeof useTheme>['radius'],
  shadows: ReturnType<typeof useTheme>['shadows'],
  _accentColor?: string,
): ViewStyle {
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  };

  switch (variant) {
    case 'default':
      return { ...base, ...shadows.sm };
    case 'elevated':
      return { ...base, ...shadows.md };
    case 'outlined':
      return {
        ...base,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.none,
      };
    case 'quest':
    case 'success':
    case 'warning':
      return { ...base, ...shadows.md, overflow: 'hidden' };
  }
}

function getAccentStyle(
  variant: CardVariant,
  colors: ReturnType<typeof useTheme>['colors'],
  radius: ReturnType<typeof useTheme>['radius'],
  accentColor?: string,
): { outer: ViewStyle; inner: ViewStyle } {
  if (variant !== 'quest' && variant !== 'success' && variant !== 'warning') {
    return { outer: {}, inner: {} };
  }

  const color =
    accentColor ??
    (variant === 'success'
      ? colors.success
      : variant === 'warning'
      ? colors.warning
      : colors.primary);

  return {
    outer: {
      flexDirection: 'row',
    },
    inner: {
      // Space for the accent strip
      marginLeft: 4,
      flex: 1,
    },
  };
}

const styles = StyleSheet.create({
  inner: {
    padding: 16,
    flex: 1,
  },
});

// ─── Card.Accent ──────────────────────────────────────────────────────────────

/**
 * Left-side accent strip for quest/success/warning cards.
 * Usage: <Card variant="quest"><Card.Accent color={colors.primary} /><View>...</View></Card>
 *
 * (Alternatively, use CardAccent directly)
 */
export function CardAccent({ color, width = 4 }: { color: string; width?: number }): React.ReactElement {
  return (
    <View
      style={{ width, backgroundColor: color, alignSelf: 'stretch' }}
      accessible={false}
    />
  );
}
