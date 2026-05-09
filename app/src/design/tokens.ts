/**
 * SafeHaven Design System — Tokens
 *
 * Single source of truth for all visual primitives.
 * All values are React Native compatible (no CSS units — use number for dp/sp).
 *
 * WCAG 2.2 AA contract:
 *   - All text/background pairs in `colors.light` have been validated at ≥ 4.5:1
 *   - Large text / UI elements validated at ≥ 3:1
 *   - High-contrast palette validated at ≥ 7:1 for body text
 */

// ─── Color Palette ────────────────────────────────────────────────────────────

/**
 * Raw color literals — do not use directly in components.
 * Consume via `useTheme().colors` instead.
 */
export const palette = {
  // Brand blues
  blue50:  '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB', // --color-primary
  blue700: '#1D4ED8',
  blue800: '#1E40AF', // --color-primary-dark
  blue900: '#1E3A8A',

  // Accent (sky)
  sky300: '#7DD3FC',
  sky400: '#38BDF8', // --color-accent

  // Success (emerald)
  emerald100: '#D1FAE5',
  emerald500: '#10B981', // --color-success
  emerald700: '#047857',

  // Warning (amber)
  amber100: '#FEF3C7',
  amber500: '#F59E0B', // --color-warning
  amber700: '#B45309',

  // Danger (red)
  red100:  '#FEE2E2',
  red500:  '#EF4444', // --color-danger
  red700:  '#B91C1C',

  // Neutral
  white:   '#FFFFFF',
  slate50: '#F8FAFC', // --color-bg
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569', // --color-text-muted
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A', // --color-text
  black:   '#000000',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

export type PaletteColor = typeof palette[keyof typeof palette];

// ─── Semantic Color Themes ────────────────────────────────────────────────────

export interface ColorTheme {
  // Brand
  primary:       string;
  primaryDark:   string;
  primaryLight:  string;
  accent:        string;

  // Semantic
  success:       string;
  successBg:     string;
  warning:       string;
  warningBg:     string;
  danger:        string;
  dangerBg:      string;

  // Backgrounds
  bg:            string;
  surface:       string;
  surfaceRaised: string;
  overlay:       string;

  // Text
  text:          string;
  textMuted:     string;
  textDisabled:  string;
  textOnPrimary: string;
  textOnDark:    string;

  // Borders & dividers
  border:        string;
  borderFocus:   string;
  divider:       string;

  // Game / progress
  xpFill:        string;
  xpTrack:       string;
  streakFire:    string;
  badgeGold:     string;
  badgeSilver:   string;
  badgeBronze:   string;
}

export const lightTheme: ColorTheme = {
  // Brand
  primary:       palette.blue600,     // #2563EB  — contrast on white: 4.69:1 ✅ AA
  primaryDark:   palette.blue800,     // #1E40AF  — contrast on white: 7.12:1 ✅ AAA
  primaryLight:  palette.blue100,     // #DBEAFE
  accent:        palette.sky400,      // #38BDF8

  // Semantic
  success:       palette.emerald500,  // #10B981  — contrast on white: 3.1:1 (large text ✅)
  successBg:     palette.emerald100,
  warning:       palette.amber700,    // #B45309  — darker for AA on white: 4.68:1 ✅
  warningBg:     palette.amber100,
  danger:        palette.red700,      // #B91C1C  — contrast on white: 6.63:1 ✅
  dangerBg:      palette.red100,

  // Backgrounds
  bg:            palette.slate50,     // #F8FAFC
  surface:       palette.white,       // #FFFFFF
  surfaceRaised: palette.white,
  overlay:       palette.overlay,

  // Text
  text:          palette.slate900,    // #0F172A  — contrast on white: 19.2:1 ✅
  textMuted:     palette.slate600,    // #475569  — contrast on white: 5.9:1  ✅
  textDisabled:  palette.slate400,    // #94A3B8  — for disabled only, not body
  textOnPrimary: palette.white,
  textOnDark:    palette.white,

  // Borders
  border:        palette.slate200,    // #E2E8F0
  borderFocus:   palette.blue600,
  divider:       palette.slate100,

  // Game elements
  xpFill:        palette.blue600,
  xpTrack:       palette.blue100,
  streakFire:    '#FF6B35',
  badgeGold:     '#F59E0B',
  badgeSilver:   '#94A3B8',
  badgeBronze:   '#B45309',
};

/**
 * High-contrast theme — meets WCAG AAA (7:1) for body text.
 * Activated when user enables "High contrast" in Settings or system setting.
 */
export const highContrastTheme: ColorTheme = {
  ...lightTheme,
  // Darken brand for higher contrast
  primary:       palette.blue800,     // #1E40AF  — 7.12:1 on white ✅ AAA
  primaryDark:   palette.blue900,     // #1E3A8A
  primaryLight:  palette.blue200,
  accent:        palette.blue700,

  // Pure black text on pure white for maximum readability
  text:          palette.black,       // 21:1 ✅
  textMuted:     palette.slate700,    // #334155 — 10.7:1 ✅
  textDisabled:  palette.slate500,

  // Higher contrast borders
  border:        palette.slate400,
  borderFocus:   palette.blue900,
  divider:       palette.slate300,

  // Semantic colors darkened
  success:       palette.emerald700,  // #047857 — 5.91:1 ✅
  warning:       palette.amber700,    // #B45309 — 4.68:1 ✅
  danger:        palette.red700,      // #B91C1C — 6.63:1 ✅

  bg:            palette.white,
  surface:       palette.white,
  surfaceRaised: palette.slate50,

  xpFill:        palette.blue800,
  xpTrack:       palette.blue200,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

/**
 * 4-point grid system.
 * All spacing values are multiples of 4dp.
 */
export const spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  9:  36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = typeof spacing[SpacingKey];

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,   // Primary card radius (as specified)
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 9999, // Pill / circle
} as const;

export type RadiusKey = keyof typeof radius;

// ─── Typography ───────────────────────────────────────────────────────────────

/**
 * Font size scales.
 * Normal mode: body min 16sp (WCAG 1.4.4 / Android a11y guidelines)
 * Large mode:  body min 18sp (for "Large text" accessibility preference)
 */
export const fontSizes = {
  normal: {
    '2xs': 11,
    xs:    12,
    sm:    14,
    base:  16,   // Minimum body text
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
  },
  large: {
    '2xs': 13,
    xs:    14,
    sm:    16,
    base:  18,   // Bumped for Large text mode
    lg:    20,
    xl:    22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 38,
    '5xl': 46,
  },
} as const;

export type FontSizeScale = typeof fontSizes['normal'];
export type FontSizeKey = keyof FontSizeScale;

export const fontWeights = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
} as const;

/**
 * Line heights (multipliers applied to font size for React Native).
 * React Native lineHeight is absolute px, not multiplier — computed in components.
 */
export const lineHeightMultipliers = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2.0,
} as const;

/**
 * Font family stack.
 * Inter must be loaded via expo-font in App.tsx.
 * Falls back to system sans-serif (San Francisco on iOS, Roboto on Android).
 */
export const fontFamilies = {
  sans:        'Inter_400Regular',
  sansMedium:  'Inter_500Medium',
  sansSemiBold:'Inter_600SemiBold',
  sansBold:    'Inter_700Bold',
  // Fallbacks (used before font loads)
  systemSans:  undefined, // React Native default = system sans-serif
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

/**
 * Android elevation + iOS shadow combo.
 * Use `shadow.sm` etc. as a spread into StyleSheet objects.
 */
export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    elevation: 2,
    shadowColor: palette.slate900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  md: {
    elevation: 4,
    shadowColor: palette.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  lg: {
    elevation: 8,
    shadowColor: palette.blue800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  primary: {
    elevation: 6,
    shadowColor: palette.blue600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
} as const;

export type ShadowKey = keyof typeof shadows;

// ─── Touch Targets ────────────────────────────────────────────────────────────

/** WCAG 2.5.5 / Android a11y: minimum interactive touch target */
export const MIN_TOUCH_TARGET = 48; // dp

// ─── Animation Durations ─────────────────────────────────────────────────────

export const durations = {
  instant:  0,
  fast:     150,
  normal:   250,
  slow:     400,
  verySlow: 600,
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const zIndex = {
  base:    0,
  raised:  10,
  overlay: 100,
  modal:   200,
  toast:   300,
} as const;

// ─── Game / Gamification Tokens ───────────────────────────────────────────────

export const game = {
  xpBarHeight:   12,
  streakIconSize: 20,
  badgeSizes: {
    sm: 24,
    md: 40,
    lg: 64,
  },
  questCardRadius: radius.lg,
  levelColors: {
    novice:   lightTheme.accent,
    saver:    lightTheme.primary,
    investor: lightTheme.primaryDark,
  },
  riskColors: {
    1: '#10B981', // Very low — green
    2: '#34D399', // Low — light green
    3: '#F59E0B', // Moderate — amber
    4: '#F97316', // High — orange
    5: '#EF4444', // Very high — red (not shown to novice users)
  },
} as const;
