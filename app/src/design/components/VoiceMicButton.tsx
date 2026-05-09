/**
 * SafeHaven Design System — VoiceMicButton
 *
 * Large circular microphone button for voice input.
 *
 * States:
 *   idle       → blue circle, mic icon, "Tap to speak" label
 *   recording  → red/pulsing ring, waveform-like animation
 *   processing → spinner, "Processing…" label
 *   error      → shake animation, error color
 *
 * Accessibility:
 *   - accessibilityRole="button"
 *   - accessibilityLabel changes with state
 *   - accessibilityHint provides context
 *   - Announces state change to screen reader on each transition
 *   - Pulse animation disabled in reducedMotion
 *   - 64dp minimum size (larger than standard 48dp for voice use case)
 *   - Haptic feedback: medium on start, light on stop
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../Theme';

export type MicState = 'idle' | 'recording' | 'processing' | 'error';

export interface VoiceMicButtonProps {
  state: MicState;
  onPress: () => void;
  size?: number;
  label?: string;
  accessibilityHint?: string;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VoiceMicButton({
  state,
  onPress,
  size = 72,
  label,
  accessibilityHint = 'Double-tap to start or stop voice input',
  disabled = false,
}: VoiceMicButtonProps): React.ReactElement {
  const { colors, fonts, reducedMotion } = useTheme();

  // Pulse ring animation (recording state)
  const pulseScale  = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  // Press scale
  const pressScale = useSharedValue(1);

  // Shake animation (error state)
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'recording' && !reducedMotion) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 800 }),
          withTiming(1.0, { duration: 800 }),
        ),
        -1,
        false,
      );
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 400 }),
          withTiming(0.05, { duration: 800 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }

    if (state === 'error' && !reducedMotion) {
      shake.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8,  { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(6,  { duration: 60 }),
        withTiming(0,  { duration: 60 }),
      );
    }
  }, [state, reducedMotion, pulseScale, pulseOpacity, shake]);

  // Announce state changes to screen reader
  useEffect(() => {
    const announcements: Record<MicState, string> = {
      idle:       'Microphone ready',
      recording:  'Recording started',
      processing: 'Processing your speech',
      error:      'Microphone error. Tap to try again.',
    };
    AccessibilityInfo.announceForAccessibility(announcements[state]);
  }, [state]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shake.value },
      { scale: pressScale.value },
    ],
  }));

  const { bgColor, iconColor } = getStateColors(state, colors);

  const a11yLabel = label ?? getA11yLabel(state);
  const isDisabled = disabled || state === 'processing';

  function handlePress(): void {
    if (isDisabled) return;
    if (state === 'idle' || state === 'error') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }

  function handlePressIn(): void {
    if (!reducedMotion && !isDisabled) {
      pressScale.value = withSpring(0.92, { damping: 15, stiffness: 500 });
    }
  }

  function handlePressOut(): void {
    if (!reducedMotion) {
      pressScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    }
  }

  return (
    <View style={styles.wrapper} accessible={false}>
      {/* Pulse ring — behind the button */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            backgroundColor: state === 'recording' ? colors.danger : colors.primary,
          },
          pulseStyle,
        ]}
        accessible={false}
        pointerEvents="none"
      />

      {/* Main button */}
      <AnimatedPressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: state === 'processing' }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
          containerStyle,
          // Elevation / shadow
          {
            elevation: 6,
            shadowColor: bgColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
          },
        ]}
      >
        {state === 'processing' ? (
          <ProcessingIcon size={size * 0.38} color={iconColor} />
        ) : (
          <MicIcon size={size * 0.38} color={iconColor} />
        )}
      </AnimatedPressable>

      {/* State label below button */}
      <Text
        style={[
          styles.stateLabel,
          {
            color: state === 'error' ? colors.danger : colors.textMuted,
            fontSize: fonts.sizes.xs,
            marginTop: 8,
          },
        ]}
        accessible={false}
        numberOfLines={1}
      >
        {getStateLabel(state)}
      </Text>
    </View>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MicIcon({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M12 1C10.34 1 9 2.34 9 4v8c0 1.66 1.34 3 3 3s3-1.34 3-3V4c0-1.66-1.34-3-3-3z"
        fill={color}
      />
      <Path
        d="M19 10v2c0 3.86-3.14 7-7 7s-7-3.14-7-7v-2H3v2c0 4.42 3.16 8.08 7.36 8.86L10 21H8v2h8v-2h-2l-.36-.14C17.84 20.08 21 16.42 21 12v-2h-2z"
        fill={color}
      />
    </Svg>
  );
}

function ProcessingIcon({ size, color }: { size: number; color: string }): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
      <Path
        d="M12 4V2M12 22v-2M4.93 4.93l-1.41 1.41M20.48 20.48l-1.41-1.41M2 12H4M22 12h-2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStateColors(
  state: MicState,
  colors: ReturnType<typeof useTheme>['colors'],
): { bgColor: string; iconColor: string } {
  switch (state) {
    case 'idle':       return { bgColor: colors.primary, iconColor: '#FFFFFF' };
    case 'recording':  return { bgColor: colors.danger,  iconColor: '#FFFFFF' };
    case 'processing': return { bgColor: colors.primaryLight, iconColor: colors.primary };
    case 'error':      return { bgColor: colors.dangerBg, iconColor: colors.danger };
  }
}

function getA11yLabel(state: MicState): string {
  switch (state) {
    case 'idle':       return 'Start voice input';
    case 'recording':  return 'Stop recording';
    case 'processing': return 'Processing, please wait';
    case 'error':      return 'Microphone error, tap to try again';
  }
}

function getStateLabel(state: MicState): string {
  switch (state) {
    case 'idle':       return 'Tap to speak';
    case 'recording':  return 'Listening…';
    case 'processing': return 'Processing…';
    case 'error':      return 'Try again';
  }
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateLabel: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
