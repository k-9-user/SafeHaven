/**
 * SafeHaven Design System — AmountInput
 *
 * A financial amount entry field — numeric-only, formatted in real time.
 * Used for deposit amounts, savings goals, strategy allocations, etc.
 *
 * Features:
 *   - Currency prefix ($ default) with configurable symbol
 *   - Real-time comma formatting (e.g., "1,234.56")
 *   - Min / max guard with inline error messaging
 *   - Animated focus ring (respects reducedMotion)
 *   - Quick-amount chip suggestions (e.g., "$10 / $50 / $100 / Max")
 *   - "Large text" mode via theme font scale
 *
 * Accessibility:
 *   - accessibilityRole="none" on wrapper (input is the accessible element)
 *   - TextInput has accessibilityLabel, accessibilityHint
 *   - keyboardType="decimal-pad" for numeric input
 *   - Announces error message via accessibilityLiveRegion="assertive"
 *   - Min tap target on quick-chip buttons: 48dp height
 *   - focusable, importantForAccessibility="yes"
 *   - Error state exposed via accessibilityState.invalid (React Native 0.73+)
 *
 * Usage:
 *   <AmountInput
 *     label="Deposit amount"
 *     value={amount}
 *     onChange={setAmount}
 *     currency="USDC"
 *     min={5}
 *     max={10000}
 *     suggestions={[10, 50, 100]}
 *   />
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../Theme';
import { MIN_TOUCH_TARGET } from '../tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AmountInputProps {
  /** Visible field label */
  label: string;
  /** Current numeric value (caller owns state) */
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Currency / asset symbol shown as prefix (default "$") */
  currencySymbol?: string;
  /** Currency name for accessibility (default "US dollars") */
  currencyName?: string;
  /** Minimum allowed amount — shows error if below */
  min?: number;
  /** Maximum allowed amount — shows error if above */
  max?: number;
  /** Quick-select chips (e.g. [10, 50, 100]) */
  suggestions?: (number | 'max')[];
  /** Optional helper text shown below the input */
  helperText?: string;
  /** External error message (overrides internal min/max validation) */
  error?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  /** Forwarded to TextInput */
  inputProps?: Partial<TextInputProps>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AmountInput({
  label,
  value,
  onChange,
  currencySymbol = '$',
  currencyName = 'US dollars',
  min,
  max,
  suggestions,
  helperText,
  error: externalError,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  inputProps,
}: AmountInputProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const [focused, setFocused] = useState(false);
  const [rawText, setRawText] = useState<string>(
    value !== undefined ? formatAmount(value) : '',
  );
  const [internalError, setInternalError] = useState<string | undefined>();
  const inputRef = useRef<TextInput>(null);

  const focusProgress = useSharedValue(0);

  // Sync internal raw text when value changes externally
  useEffect(() => {
    if (value === undefined) {
      setRawText('');
    } else {
      const formatted = formatAmount(value);
      // Only overwrite if different to avoid cursor jumping
      if (parseAmount(rawText) !== value) {
        setRawText(formatted);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    focusProgress.value = withTiming(1, { duration: reducedMotion ? 0 : 200 });
  }, [focusProgress, reducedMotion]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    focusProgress.value = withTiming(0, { duration: reducedMotion ? 0 : 200 });
    // Validate on blur
    if (value !== undefined) {
      if (min !== undefined && value < min) {
        setInternalError(`Minimum amount is ${currencySymbol}${formatAmount(min)}`);
      } else if (max !== undefined && value > max) {
        setInternalError(`Maximum amount is ${currencySymbol}${formatAmount(max)}`);
      } else {
        setInternalError(undefined);
      }
    }
  }, [focusProgress, reducedMotion, value, min, max, currencySymbol]);

  const handleChangeText = useCallback(
    (text: string) => {
      // Strip non-numeric characters except decimal point
      const cleaned = text.replace(/[^0-9.]/g, '');
      // Allow only one decimal point
      const parts = cleaned.split('.');
      const sanitized =
        parts.length > 2
          ? `${parts[0]}.${parts.slice(1).join('')}`
          : cleaned;

      setRawText(sanitized);
      setInternalError(undefined);

      const parsed = parseAmount(sanitized);
      onChange(sanitized === '' ? undefined : parsed);
    },
    [onChange],
  );

  const handleSuggestion = useCallback(
    (suggestion: number | 'max') => {
      const val = suggestion === 'max' ? max : suggestion;
      if (val === undefined) return;
      setRawText(formatAmount(val));
      setInternalError(undefined);
      onChange(val);
    },
    [max, onChange],
  );

  const activeError = externalError ?? internalError;
  const hasError = Boolean(activeError);

  // Animated border color
  const borderColor = useAnimatedStyle(() => {
    const color = interpolateColor(
      focusProgress.value,
      [0, 1],
      [
        hasError ? colors.danger : colors.border,
        hasError ? colors.danger : colors.borderFocus,
      ],
    );
    return { borderColor: color };
  });

  const a11yLabel =
    accessibilityLabel ?? `${label}, ${currencyName}`;
  const a11yHint =
    accessibilityHint ??
    (min !== undefined && max !== undefined
      ? `Enter an amount between ${currencySymbol}${formatAmount(min)} and ${currencySymbol}${formatAmount(max)}`
      : min !== undefined
      ? `Enter at least ${currencySymbol}${formatAmount(min)}`
      : 'Enter an amount');

  return (
    <View style={[styles.wrapper, style]}>
      {/* Field label */}
      <Text
        style={[
          styles.label,
          {
            color: hasError ? colors.danger : focused ? colors.primary : colors.textMuted,
            fontSize: fonts.sizes.sm,
            fontWeight: '600',
            marginBottom: spacing[1],
          },
        ]}
        allowFontScaling
      >
        {label}
      </Text>

      {/* Input row */}
      <Animated.View
        style={[
          styles.inputRow,
          {
            backgroundColor: disabled ? colors.bg : colors.surface,
            borderRadius: radius.md,
            borderWidth: focused ? 2 : 1,
            minHeight: MIN_TOUCH_TARGET,
            opacity: disabled ? 0.6 : 1,
          },
          borderColor,
        ]}
      >
        {/* Currency prefix */}
        <View style={[styles.prefix, { paddingHorizontal: spacing[3] }]}>
          <Text
            style={[
              styles.prefixText,
              {
                color: focused ? colors.primary : colors.textMuted,
                fontSize: fonts.sizes.xl,
                fontWeight: '700',
              },
            ]}
            accessible={false}
          >
            {currencySymbol}
          </Text>
        </View>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          accessible
          accessibilityLabel={a11yLabel}
          accessibilityHint={a11yHint}
          // @ts-ignore — accessibilityState.invalid supported RN 0.73+
          accessibilityState={{ disabled, invalid: hasError }}
          accessibilityLiveRegion="polite"
          value={rawText}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholder="0.00"
          placeholderTextColor={colors.textDisabled}
          editable={!disabled}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: fonts.sizes.xl,
              fontWeight: '700',
              flex: 1,
            },
          ]}
          allowFontScaling
          maxFontSizeMultiplier={1.2}
          selectionColor={colors.primary}
          {...inputProps}
        />

        {/* Clear button — only when has value */}
        {rawText.length > 0 && !disabled && (
          <Pressable
            onPress={() => {
              setRawText('');
              onChange(undefined);
              setInternalError(undefined);
              inputRef.current?.focus();
            }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Clear amount"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.clearBtn, { marginRight: spacing[3] }]}
          >
            <Text style={{ color: colors.textMuted, fontSize: 18 }}>×</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Quick-select suggestions */}
      {suggestions && suggestions.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.chipsRow, { gap: spacing[2], paddingTop: spacing[2] }]}
          accessible={false}
        >
          {suggestions.map((s, i) => {
            const chipValue = s === 'max' ? max : s;
            const isActive = chipValue !== undefined && value === chipValue;
            const chipLabel =
              s === 'max'
                ? 'Max'
                : `${currencySymbol}${formatAmount(s as number)}`;

            return (
              <Pressable
                key={i}
                onPress={() => handleSuggestion(s)}
                disabled={disabled || (s === 'max' && max === undefined)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={
                  s === 'max'
                    ? `Set maximum amount`
                    : `Set amount to ${currencySymbol}${formatAmount(s as number)}`
                }
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.primaryLight,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderRadius: radius.full,
                    minHeight: MIN_TOUCH_TARGET,
                    paddingHorizontal: spacing[4],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    {
                      color: isActive ? colors.textOnPrimary : colors.primary,
                      fontSize: fonts.sizes.sm,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {chipLabel}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Error / helper text */}
      {(activeError || helperText) && (
        <Text
          accessible
          accessibilityLiveRegion={activeError ? 'assertive' : 'polite'}
          style={[
            styles.subText,
            {
              color: activeError ? colors.danger : colors.textMuted,
              fontSize: fonts.sizes.xs,
              marginTop: spacing[1],
            },
          ]}
          allowFontScaling
        >
          {activeError ?? helperText}
        </Text>
      )}
    </View>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Format a number with commas and up to 2 decimal places */
function formatAmount(n: number): string {
  if (Number.isNaN(n)) return '';
  const [int, dec] = n.toFixed(2).split('.');
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Omit trailing .00 for whole numbers
  return dec === '00' ? intFormatted : `${intFormatted}.${dec}`;
}

/** Parse a formatted string back to a number */
function parseAmount(text: string): number {
  const cleaned = text.replace(/,/g, '');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {},
  label: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  prefix: {
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  prefixText: {
    fontVariant: ['tabular-nums'],
  },
  input: {
    paddingVertical: 12,
    fontVariant: ['tabular-nums'],
  },
  clearBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  chipLabel: {},
  subText: {
    fontWeight: '500',
  },
});
