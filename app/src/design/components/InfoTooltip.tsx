/**
 * SafeHaven Design System — InfoTooltip
 *
 * A tappable ⓘ icon that reveals a contextual tooltip bubble.
 * Used alongside financial terms, risk disclosures, and DeFi jargon.
 *
 * Accessibility:
 *   - accessibilityRole="button" on trigger
 *   - accessibilityLabel: "More information about <topic>"
 *   - accessibilityHint: "Double-tap to show explanation"
 *   - Tooltip body has accessibilityLiveRegion="polite" so VoiceOver/TalkBack
 *     announces it automatically when it appears
 *   - Dismiss on outside tap, Escape key (RN Pressable backdrop), or second tap
 *   - Reduced motion: no fade — instant show/hide
 *   - Min tap target on trigger: 48×48dp
 *
 * Layout:
 *   The tooltip bubble positions itself above or below the trigger
 *   based on available vertical space (simple heuristic — no portal needed
 *   for inline tooltips). Pass placement="below" to force downward.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  type ViewStyle,
  type LayoutRectangle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../Theme';
import { MIN_TOUCH_TARGET, shadows, zIndex } from '../tokens';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InfoTooltipProps {
  /** Short topic label (used in accessibility label: "More info about <topic>") */
  topic: string;
  /** Tooltip body text. Supports basic newlines. */
  content: string;
  /** Optional URL or CTA label shown at bottom of tooltip */
  linkLabel?: string;
  onLinkPress?: () => void;
  /** Icon size (default 20) */
  iconSize?: number;
  /** Colour override for the ⓘ icon */
  iconColor?: string;
  placement?: 'auto' | 'above' | 'below';
  style?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InfoTooltip({
  topic,
  content,
  linkLabel,
  onLinkPress,
  iconSize = 20,
  iconColor,
  placement = 'auto',
  style,
}: InfoTooltipProps): React.ReactElement {
  const { colors, fonts, spacing, radius, reducedMotion } = useTheme();
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-6);

  const show = useCallback(() => {
    setVisible(true);
    opacity.value = withTiming(1, { duration: reducedMotion ? 0 : 180 });
    translateY.value = withSpring(0, { damping: 18, stiffness: 300 });
  }, [opacity, translateY, reducedMotion]);

  const hide = useCallback(() => {
    opacity.value = withTiming(0, { duration: reducedMotion ? 0 : 120 }, () => {
      // dismiss modal after fade-out completes
    });
    translateY.value = withTiming(-4, { duration: reducedMotion ? 0 : 120 });
    // Slight delay to let animation finish before unmounting
    setTimeout(() => setVisible(false), reducedMotion ? 0 : 140);
  }, [opacity, translateY, reducedMotion]);

  const toggle = useCallback(() => {
    if (visible) {
      hide();
    } else {
      triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        show();
      });
    }
  }, [visible, show, hide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const resolvedIconColor = iconColor ?? colors.primary;

  // Estimate tooltip position (above trigger by default, below if near top)
  const TOOLTIP_WIDTH = 260;
  const TOOLTIP_EST_HEIGHT = 120;
  const tooltipStyle: ViewStyle = triggerLayout
    ? {
        position: 'absolute',
        left: Math.max(
          8,
          Math.min(
            triggerLayout.x - TOOLTIP_WIDTH / 2 + triggerLayout.width / 2,
            // Ensure it doesn't overflow right — approximate screen width 390
            390 - TOOLTIP_WIDTH - 8,
          ),
        ),
        top:
          placement === 'below' ||
          (placement === 'auto' && triggerLayout.y < 160)
            ? triggerLayout.y + triggerLayout.height + 8
            : triggerLayout.y - TOOLTIP_EST_HEIGHT - 8,
        width: TOOLTIP_WIDTH,
        zIndex: zIndex.tooltip,
      }
    : {};

  return (
    <>
      {/* Trigger button — meets 48×48dp tap target */}
      <View ref={triggerRef} style={[styles.triggerWrapper, style]}>
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel={`More information about ${topic}`}
          accessibilityHint="Double-tap to show explanation"
          accessibilityState={{ expanded: visible }}
          onPress={toggle}
          style={styles.trigger}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <InfoIcon size={iconSize} color={resolvedIconColor} />
        </Pressable>
      </View>

      {/* Tooltip overlay */}
      {visible && (
        <Modal
          transparent
          visible={visible}
          animationType="none"
          onRequestClose={hide}
          statusBarTranslucent
        >
          {/* Backdrop — tap to dismiss */}
          <Pressable
            style={styles.backdrop}
            onPress={hide}
            accessible={false}
          />

          {/* Tooltip bubble */}
          <Animated.View
            accessible
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${topic}: ${content}`}
            style={[
              styles.bubble,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderColor: colors.border,
                ...shadows.lg,
              },
              tooltipStyle,
              animatedStyle,
            ]}
          >
            {/* Header */}
            <View style={[styles.bubbleHeader, { borderBottomColor: colors.divider }]}>
              <InfoIcon size={14} color={colors.primary} />
              <Text
                style={[
                  styles.bubbleTopic,
                  {
                    color: colors.primary,
                    fontSize: fonts.sizes.xs,
                    marginLeft: spacing[1],
                  },
                ]}
                numberOfLines={1}
              >
                {topic}
              </Text>
              {/* Dismiss X */}
              <Pressable
                onPress={hide}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close tooltip"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.closeBtn}
              >
                <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 18 }}>×</Text>
              </Pressable>
            </View>

            {/* Content */}
            <Text
              style={[
                styles.bubbleContent,
                {
                  color: colors.text,
                  fontSize: fonts.sizes.sm,
                  lineHeight: fonts.lineHeight(fonts.sizes.sm, 'relaxed'),
                  padding: spacing[3],
                },
              ]}
              allowFontScaling
              maxFontSizeMultiplier={1.3}
            >
              {content}
            </Text>

            {/* Optional link CTA */}
            {linkLabel && onLinkPress && (
              <Pressable
                onPress={() => { onLinkPress(); hide(); }}
                accessible
                accessibilityRole="link"
                accessibilityLabel={linkLabel}
                style={[styles.linkRow, { borderTopColor: colors.divider, paddingHorizontal: spacing[3], paddingVertical: spacing[2] }]}
              >
                <Text
                  style={{ color: colors.primary, fontSize: fonts.sizes.sm, fontWeight: '600' }}
                >
                  {linkLabel} →
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

// ─── Info icon (SVG ⓘ) ──────────────────────────────────────────────────────

function InfoIcon({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <Path
        d="M12 8h.01M12 12v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  triggerWrapper: {
    alignSelf: 'flex-start',
  },
  trigger: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  bubble: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  bubbleTopic: {
    flex: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    marginLeft: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: {
    fontWeight: '400',
  },
  linkRow: {
    borderTopWidth: 1,
  },
});
