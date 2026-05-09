/**
 * SafeHaven — Onboarding Shell
 *
 * Shared layout wrapper used by every onboarding screen.
 * Provides:
 *   - SafeAreaView with theme background
 *   - Progress dots (top)
 *   - Back chevron (optional)
 *   - Coco avatar (header)
 *   - ScrollView body
 *   - Fixed bottom CTA area
 *   - Voice replay FAB (voice-first mode)
 *
 * Accessibility:
 *   - Screen title announced on mount via AccessibilityInfo
 *   - Progress dots have accessibilityLabel "Step N of 7"
 *   - Back button has accessibilityLabel "Go back"
 *   - Voice FAB has accessibilityLabel + hint
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  AccessibilityInfo,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../design/Theme';
import { CocoAvatar } from '../../design/components/CocoPet';
import { MIN_TOUCH_TARGET } from '../../design/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingShellProps {
  /** Current step index (0-based, 0–6) */
  step: number;
  /** Total steps */
  totalSteps?: number;
  /** Screen accessibility title announced on mount */
  screenTitle: string;
  children: React.ReactNode;
  /** CTA button slot (pinned to bottom) */
  footer?: React.ReactNode;
  /** If false, hide back arrow (e.g. first screen) */
  showBack?: boolean;
  onBack?: () => void;
  /** Voice replay button shown when voiceFirstMode */
  showVoiceReplay?: boolean;
  onVoiceReplay?: () => void;
  /** Coco mood */
  cocoVariant?: 'idle' | 'happy' | 'thinking' | 'warning';
  contentStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingShell({
  step,
  totalSteps = 7,
  screenTitle,
  children,
  footer,
  showBack = true,
  onBack,
  showVoiceReplay = false,
  onVoiceReplay,
  cocoVariant = 'idle',
  contentStyle,
}: OnboardingShellProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();

  // Announce screen title to screen readers on mount
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(screenTitle);
  }, [screenTitle]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <View style={[styles.topBar, { paddingHorizontal: spacing[4] }]}>
        {/* Back button */}
        {showBack ? (
          <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {/* Progress dots */}
        <ProgressDots
          step={step}
          total={totalSteps}
          colors={colors}
        />

        {/* Coco avatar */}
        <CocoAvatar size={36} />
      </View>

      {/* ── Scrollable body ───────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing[5], paddingBottom: footer ? 120 : spacing[8] },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={!reducedMotion ? FadeInDown.duration(280).springify() : undefined}
        >
          {children}
        </Animated.View>
      </ScrollView>

      {/* ── Fixed footer ──────────────────────────────────────────── */}
      {footer && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.bg,
              paddingHorizontal: spacing[5],
              paddingBottom: spacing[4],
              borderTopColor: colors.divider,
            },
          ]}
        >
          {footer}
        </View>
      )}

      {/* ── Voice replay FAB ──────────────────────────────────────── */}
      {showVoiceReplay && onVoiceReplay && (
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Replay voice explanation"
          accessibilityHint="Double-tap to hear this screen explained again"
          onPress={onVoiceReplay}
          style={[
            styles.voiceFab,
            {
              backgroundColor: colors.primary,
              bottom: footer ? 110 : spacing[6],
              right: spacing[5],
              shadowColor: colors.primary,
            },
          ]}
        >
          <SpeakerIcon size={22} color="#FFFFFF" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// ─── Progress Dots ────────────────────────────────────────────────────────────

function ProgressDots({
  step,
  total,
  colors,
}: {
  step: number;
  total: number;
  colors: ReturnType<typeof useTheme>['colors'];
}): React.ReactElement {
  return (
    <View
      accessible
      accessibilityLabel={`Step ${step + 1} of ${total}`}
      style={styles.dotsRow}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === step
                ? colors.primary
                : i < step
                ? colors.primaryDark
                : colors.border,
              width: i === step ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function ChevronLeft({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function SpeakerIcon({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
  },
  backBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: MIN_TOUCH_TARGET,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  voiceFab: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
