/**
 * SafeHaven Design System — Theme Provider
 *
 * Provides the design token context to the entire app.
 * Supports:
 *   - Light mode (default)
 *   - High-contrast mode (for visual impairment / user preference)
 *   - Large text mode (bumps all font sizes up one step)
 *   - Reduced motion mode (disables non-essential animations)
 *
 * Usage:
 *   <ThemeProvider> ... </ThemeProvider>
 *   const { colors, fonts, spacing, reducedMotion } = useTheme();
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  lightTheme,
  highContrastTheme,
  fontSizes,
  fontWeights,
  fontFamilies,
  lineHeightMultipliers,
  spacing,
  radius,
  shadows,
  durations,
  game,
  type ColorTheme,
  type FontSizeScale,
} from './tokens';

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface ThemeContextValue {
  // Color palette (responds to high-contrast toggle)
  colors: ColorTheme;

  // Typography (responds to large-text toggle)
  fonts: {
    sizes: FontSizeScale;
    weights: typeof fontWeights;
    families: typeof fontFamilies;
    lineHeight: (size: number, multiplier?: keyof typeof lineHeightMultipliers) => number;
  };

  // Spatial tokens (fixed — not affected by theme mode)
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  durations: typeof durations;
  game: typeof game;

  // Mode flags
  isHighContrast: boolean;
  isLargeText: boolean;
  reducedMotion: boolean;

  // Toggles (called from Settings screen)
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: ReactNode;
  /** Override initial high-contrast (e.g., from persisted settings) */
  initialHighContrast?: boolean;
  /** Override initial large text (e.g., from persisted settings) */
  initialLargeText?: boolean;
}

export function ThemeProvider({
  children,
  initialHighContrast = false,
  initialLargeText = false,
}: ThemeProviderProps): React.ReactElement {
  const [isHighContrast, setIsHighContrast] = useState(initialHighContrast);
  const [isLargeText, setIsLargeText] = useState(initialLargeText);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Sync with OS accessibility settings
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);

    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => sub.remove();
  }, []);

  const toggleHighContrast = useCallback(
    () => setIsHighContrast((v) => !v),
    [],
  );

  const toggleLargeText = useCallback(
    () => setIsLargeText((v) => !v),
    [],
  );

  const colors = isHighContrast ? highContrastTheme : lightTheme;
  const fontScale = isLargeText ? fontSizes.large : fontSizes.normal;

  const lineHeight = useCallback(
    (size: number, multiplier: keyof typeof lineHeightMultipliers = 'normal') =>
      Math.round(size * lineHeightMultipliers[multiplier]),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      fonts: {
        sizes: fontScale,
        weights: fontWeights,
        families: fontFamilies,
        lineHeight,
      },
      spacing,
      radius,
      shadows,
      durations,
      game,
      isHighContrast,
      isLargeText,
      reducedMotion,
      toggleHighContrast,
      toggleLargeText,
    }),
    [colors, fontScale, lineHeight, isHighContrast, isLargeText, reducedMotion,
      toggleHighContrast, toggleLargeText],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the design system theme from any component.
 *
 * @example
 * const { colors, fonts, spacing } = useTheme();
 * <Text style={{ color: colors.text, fontSize: fonts.sizes.base }}>Hello</Text>
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}

// ─── Convenience hook ─────────────────────────────────────────────────────────

/**
 * Returns just the color tokens — shorthand for color-only usage.
 */
export function useColors(): ColorTheme {
  return useTheme().colors;
}
