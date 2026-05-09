/**
 * Coco the Coin Coach — SafeHaven Mascot
 *
 * A friendly blue blob creature that guides users through
 * their financial learning journey.
 *
 * Built with react-native-svg (included in Expo SDK 52).
 *
 * Variants:
 *   - 'idle'     → neutral, calm expression
 *   - 'happy'    → wide smile, star burst (on XP gain, badge earn)
 *   - 'thinking' → eyes up, thoughtful (when AI is processing)
 *   - 'warning'  → cautious eyebrows (on risk disclosure screens)
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  G,
  Rect,
  Polygon,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../Theme';

export type CocoVariant = 'idle' | 'happy' | 'thinking' | 'warning';

export interface CocoPetProps {
  variant?: CocoVariant;
  size?: number;
  /** Disable idle floating animation (respects reducedMotion automatically) */
  animated?: boolean;
}

export function CocoPet({
  variant = 'idle',
  size = 80,
  animated = true,
}: CocoPetProps): React.ReactElement {
  const { reducedMotion, colors } = useTheme();
  const shouldAnimate = animated && !reducedMotion;

  // Gentle floating animation for idle state
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shouldAnimate && variant === 'idle') {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1200 }),
          withTiming(0, { duration: 1200 }),
        ),
        -1,
        true,
      );
    } else if (shouldAnimate && variant === 'happy') {
      scale.value = withSequence(
        withSpring(1.15, { damping: 6 }),
        withSpring(1.0, { damping: 8 }),
      );
    } else {
      translateY.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [variant, shouldAnimate, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const primaryBlue = colors.primary;
  const darkBlue = colors.primaryDark;
  const lightBlue = colors.primaryLight;
  const coinColor = '#F59E0B';
  const white = '#FFFFFF';

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Defs>
          <RadialGradient id="bodyGrad" cx="40%" cy="35%" r="60%">
            <Stop offset="0%" stopColor={colors.accent} stopOpacity="1" />
            <Stop offset="100%" stopColor={primaryBlue} stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="coinGrad" cx="40%" cy="30%" r="65%">
            <Stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
            <Stop offset="100%" stopColor={coinColor} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Body — rounded blob */}
        <Ellipse
          cx="40"
          cy="44"
          rx="26"
          ry="28"
          fill="url(#bodyGrad)"
        />

        {/* Small ears / bumps on top */}
        <Circle cx="22" cy="22" r="8" fill={primaryBlue} />
        <Circle cx="58" cy="22" r="8" fill={primaryBlue} />
        <Circle cx="22" cy="22" r="5" fill={lightBlue} />
        <Circle cx="58" cy="22" r="5" fill={lightBlue} />

        {/* USDC Coin on belly */}
        <Circle cx="40" cy="50" r="11" fill="url(#coinGrad)" />
        <Circle cx="40" cy="50" r="8.5" fill="none" stroke={coinColor} strokeWidth="1" />
        {/* Dollar sign on coin */}
        <Path
          d="M40 43 L40 57 M37 45.5 Q37 43 40 43 Q43 43 43 45.5 Q43 48 40 48 Q37 48 37 50.5 Q37 53 40 53 Q43 53 43 50.5"
          stroke={darkBlue}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyes — changes with variant */}
        {variant === 'idle' && (
          <G>
            {/* Left eye */}
            <Circle cx="32" cy="34" r="5" fill={white} />
            <Circle cx="33" cy="34" r="3" fill={darkBlue} />
            <Circle cx="34" cy="33" r="1" fill={white} />
            {/* Right eye */}
            <Circle cx="48" cy="34" r="5" fill={white} />
            <Circle cx="49" cy="34" r="3" fill={darkBlue} />
            <Circle cx="50" cy="33" r="1" fill={white} />
            {/* Smile */}
            <Path
              d="M34 40 Q40 45 46 40"
              stroke={white}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        )}

        {variant === 'happy' && (
          <G>
            {/* Happy arched eyes */}
            <Path d="M28 33 Q32 28 36 33" stroke={white} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M44 33 Q48 28 52 33" stroke={white} strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Big smile */}
            <Path
              d="M31 40 Q40 48 49 40"
              stroke={white}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rosy cheeks */}
            <Circle cx="27" cy="39" r="4" fill="#FF9BB8" opacity={0.5} />
            <Circle cx="53" cy="39" r="4" fill="#FF9BB8" opacity={0.5} />
            {/* Star sparkles */}
            <Polygon points="16,16 17.5,20 21,20 18.5,22.5 19.5,26 16,24 12.5,26 13.5,22.5 11,20 14.5,20" fill={coinColor} opacity={0.9} />
            <Polygon points="64,10 65,13 68,13 66,15 67,18 64,16.5 61,18 62,15 60,13 63,13" fill={coinColor} opacity={0.8} />
          </G>
        )}

        {variant === 'thinking' && (
          <G>
            {/* Eyes looking up */}
            <Circle cx="32" cy="34" r="5" fill={white} />
            <Circle cx="32" cy="32" r="3" fill={darkBlue} />
            <Circle cx="48" cy="34" r="5" fill={white} />
            <Circle cx="48" cy="32" r="3" fill={darkBlue} />
            {/* Neutral mouth */}
            <Path
              d="M35 41 Q40 41 45 41"
              stroke={white}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Thought dots */}
            <Circle cx="54" cy="22" r="2" fill={white} opacity={0.8} />
            <Circle cx="59" cy="17" r="2.5" fill={white} opacity={0.7} />
            <Circle cx="65" cy="12" r="3" fill={white} opacity={0.6} />
          </G>
        )}

        {variant === 'warning' && (
          <G>
            {/* Worried eyebrows */}
            <Path d="M27 29 Q32 26 36 30" stroke={white} strokeWidth="2" strokeLinecap="round" fill="none" />
            <Path d="M44 30 Q48 26 53 29" stroke={white} strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Eyes */}
            <Circle cx="32" cy="35" r="4.5" fill={white} />
            <Circle cx="32" cy="35" r="2.5" fill={darkBlue} />
            <Circle cx="48" cy="35" r="4.5" fill={white} />
            <Circle cx="48" cy="35" r="2.5" fill={darkBlue} />
            {/* Concerned mouth */}
            <Path
              d="M34 42 Q40 39 46 42"
              stroke={white}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Warning indicator */}
            <Polygon points="68,60 64,68 72,68" fill="#F59E0B" />
            <Rect x="67.5" y="62" width="1" height="3" rx="0.5" fill={darkBlue} />
            <Circle cx="68" cy="67" r="0.7" fill={darkBlue} />
          </G>
        )}

        {/* Small shadow under body */}
        <Ellipse cx="40" cy="72" rx="18" ry="4" fill={primaryBlue} opacity={0.15} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Compact Coco avatar used in headers and chat bubbles.
 */
export function CocoAvatar({ size = 32 }: { size?: number }): React.ReactElement {
  return (
    <View style={{ width: size, height: size }}>
      <CocoPet size={size} animated={false} variant="idle" />
    </View>
  );
}
