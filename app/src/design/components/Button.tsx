/**
 * SafeHaven Design System — Button
 *
 * Variants: primary | secondary | ghost | danger | success
 * Sizes:    sm | md | lg
 *
 * Accessibility:
 *   - Min 48×48dp touch target (enforced for sm via padding)
 *   - accessibilityRole="button"
 *   - accessibilityState.disabled on disabled
 *   - accessibilityLabel and accessibilityHint as props
 *   - Haptic feedback (light for secondary/ghost, medium for primary/danger)
 *   - Press scale animation (disabled when reducedMotion=true)
 *   - Loading state with spinner + "Loading, please wait" accessibility hint
 */

import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../Theme';
import { MIN_TOUCH_TARGET, shadows } from '../tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;                    // Required — used as text AND a11y label if no override
  accessibilityLabel?: string;      // Overrides label for screen reader if different
  accessibilityHint?: string;
  loading?: boolean;
  iconLeft?: React.ReactElement;
  iconRight?: React.ReactElement;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  accessibilityLabel,
  accessibilityHint,
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  onPress,
  ...rest
}: ButtonProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn(): void {
    if (!isDisabled && !reducedMotion) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }
  }

  function handlePressOut(): void {
    if (!isDisabled && !reducedMotion) {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    }
  }

  function handlePress(e: Parameters<NonNullable<PressableProps['onPress']>>[0]): void {
    if (isDisabled) return;
    const hapticFn =
      variant === 'primary' || variant === 'danger'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(hapticFn).catch(() => {});
    onPress?.(e);
  }

  // ── Variant styles ──────────────────────────────────────────────────────────
  const variantStyles = getVariantStyles(variant, isDisabled, colors);
  const sizeStyles = getSizeStyles(size, fonts.sizes.base);

  const containerStyle: ViewStyle[] = [
    styles.base,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.label,
    variantStyles.label,
    sizeStyles.label,
  ] as TextStyle[];

  return (
    <AnimatedPressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={
        loading ? 'Loading, please wait' : accessibilityHint
      }
      accessibilityState={{ disabled: isDisabled }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[animatedStyle, ...containerStyle]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.spinnerColor}
            style={styles.spinner}
            accessibilityLabel="Loading"
          />
        ) : (
          iconLeft && <View style={styles.iconLeft}>{iconLeft}</View>
        )}

        <Text
          style={textStyle}
          numberOfLines={1}
          allowFontScaling
          maxFontSizeMultiplier={1.3}
        >
          {loading ? 'Please wait…' : label}
        </Text>

        {!loading && iconRight && (
          <View style={styles.iconRight}>{iconRight}</View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// ─── Variant Styles ───────────────────────────────────────────────────────────

function getVariantStyles(
  variant: ButtonVariant,
  disabled: boolean,
  colors: ReturnType<typeof useTheme>['colors'],
): {
  container: ViewStyle;
  label: TextStyle;
  spinnerColor: string;
} {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.primary,
          opacity,
          ...shadows.primary,
        },
        label: { color: colors.textOnPrimary },
        spinnerColor: colors.textOnPrimary,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.primary,
          opacity,
          ...shadows.sm,
        },
        label: { color: colors.primary },
        spinnerColor: colors.primary,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          opacity,
        },
        label: { color: colors.primary },
        spinnerColor: colors.primary,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: colors.danger,
          opacity,
          ...shadows.md,
        },
        label: { color: colors.textOnPrimary },
        spinnerColor: colors.textOnPrimary,
      };
    case 'success':
      return {
        container: {
          backgroundColor: colors.success,
          opacity,
          ...shadows.sm,
        },
        label: { color: colors.textOnPrimary },
        spinnerColor: colors.textOnPrimary,
      };
  }
}

function getSizeStyles(
  size: ButtonSize,
  baseFontSize: number,
): { container: ViewStyle; label: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: MIN_TOUCH_TARGET,
          borderRadius: 10,
        },
        label: { fontSize: baseFontSize - 2, fontWeight: '600' },
      };
    case 'md':
      return {
        container: {
          paddingHorizontal: 20,
          paddingVertical: 14,
          minHeight: MIN_TOUCH_TARGET,
          borderRadius: 12,
        },
        label: { fontSize: baseFontSize, fontWeight: '600' },
      };
    case 'lg':
      return {
        container: {
          paddingHorizontal: 28,
          paddingVertical: 18,
          minHeight: 56,
          borderRadius: 16,
        },
        label: { fontSize: baseFontSize + 2, fontWeight: '700' },
      };
  }
}

// ─── Static Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
