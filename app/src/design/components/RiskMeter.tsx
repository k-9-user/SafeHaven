/**
 * SafeHaven Design System — RiskMeter
 *
 * A visual gauge (1–5) that communicates investment / protocol risk level.
 * Designed for DeFi strategy cards, yield product disclosures, and
 * the AI recommendation explainer.
 *
 * Risk scale:
 *   1 = Very Low  — emerald
 *   2 = Low       — light green
 *   3 = Moderate  — amber
 *   4 = High      — orange
 *   5 = Very High — red
 *
 * Visual options:
 *   'bar'    → horizontal segmented bar (5 segments, compact)
 *   'gauge'  → semicircular SVG needle gauge (large, centrepiece)
 *   'dots'   → 5 coloured dot indicators (inline / compact)
 *
 * Accessibility:
 *   - accessibilityRole="progressbar" with min/max/now values
 *   - accessibilityLabel: "Risk level N of 5: <label>" (e.g., "Risk level 3 of 5: Moderate")
 *   - accessibilityHint explains what risk means in context
 *   - Color is NEVER the only differentiator — level number + label always shown
 *   - Segment animation respects reducedMotion
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../Theme';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type RiskVariant = 'bar' | 'gauge' | 'dots';

export interface RiskMeterProps {
  level: RiskLevel;
  variant?: RiskVariant;
  /** Show numeric label + text description below */
  showLabel?: boolean;
  /** Override the default description text */
  descriptionOverride?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  /** Width for bar/dots variant (gauge uses aspect ratio) */
  width?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RISK_META: Record<RiskLevel, { label: string; color: string; trackColor: string }> = {
  1: { label: 'Very Low',  color: '#10B981', trackColor: '#D1FAE5' },
  2: { label: 'Low',       color: '#34D399', trackColor: '#D1FAE5' },
  3: { label: 'Moderate',  color: '#F59E0B', trackColor: '#FEF3C7' },
  4: { label: 'High',      color: '#F97316', trackColor: '#FFEDD5' },
  5: { label: 'Very High', color: '#EF4444', trackColor: '#FEE2E2' },
};

// ─── Main component ──────────────────────────────────────────────────────────

export function RiskMeter({
  level,
  variant = 'bar',
  showLabel = true,
  descriptionOverride,
  accessibilityHint = 'Risk level reflects potential for capital loss. Higher risk may offer higher returns.',
  style,
  width = 240,
}: RiskMeterProps): React.ReactElement {
  const { colors, fonts, spacing } = useTheme();
  const meta = RISK_META[level];
  const a11yLabel = `Risk level ${level} of 5: ${meta.label}`;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={a11yLabel}
      accessibilityHint={accessibilityHint}
      accessibilityValue={{ min: 1, max: 5, now: level }}
      style={[styles.container, style]}
    >
      {variant === 'bar'   && <BarMeter   level={level} width={width} />}
      {variant === 'gauge' && <GaugeMeter level={level} width={width} />}
      {variant === 'dots'  && <DotsMeter  level={level} />}

      {showLabel && (
        <View style={[styles.labelRow, { marginTop: spacing[2] }]}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: meta.color, marginRight: spacing[1] },
            ]}
          />
          <Text
            style={[
              styles.levelNumber,
              { color: meta.color, fontSize: fonts.sizes.sm, fontWeight: '700' },
            ]}
          >
            {level}/5
          </Text>
          <Text
            style={[
              styles.levelLabel,
              { color: colors.text, fontSize: fonts.sizes.sm, fontWeight: '600', marginLeft: spacing[1] },
            ]}
          >
            {descriptionOverride ?? meta.label}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Bar variant ─────────────────────────────────────────────────────────────

function BarMeter({ level, width }: { level: RiskLevel; width: number }): React.ReactElement {
  const { reducedMotion } = useTheme();
  const SEGMENT_GAP = 4;
  const segmentWidth = (width - SEGMENT_GAP * 4) / 5;
  const HEIGHT = 14;

  return (
    <View style={{ flexDirection: 'row', gap: SEGMENT_GAP, width }}>
      {([1, 2, 3, 4, 5] as RiskLevel[]).map((seg) => (
        <BarSegment
          key={seg}
          active={seg <= level}
          color={RISK_META[seg].color}
          trackColor={RISK_META[seg].trackColor}
          width={segmentWidth}
          height={HEIGHT}
          delay={reducedMotion ? 0 : (seg - 1) * 60}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}

function BarSegment({
  active,
  color,
  trackColor,
  width,
  height,
  delay,
  reducedMotion,
}: {
  active: boolean;
  color: string;
  trackColor: string;
  width: number;
  height: number;
  delay: number;
  reducedMotion: boolean;
}): React.ReactElement {
  const opacity = useSharedValue(active ? 1 : 0.3);
  const scaleX = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    if (active) {
      opacity.value = withDelay(delay, withTiming(1, { duration: reducedMotion ? 0 : 300 }));
      scaleX.value = withDelay(delay, withTiming(1, { duration: reducedMotion ? 0 : 300 }));
    } else {
      opacity.value = withTiming(0.25, { duration: reducedMotion ? 0 : 150 });
      scaleX.value = withTiming(0, { duration: reducedMotion ? 0 : 150 });
    }
  }, [active, delay, reducedMotion, opacity, scaleX]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={{
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
      accessible={false}
    >
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor: color,
            position: 'absolute',
          },
          animStyle,
        ]}
      />
    </View>
  );
}

// ─── Gauge variant ────────────────────────────────────────────────────────────

function GaugeMeter({ level, width }: { level: RiskLevel; width: number }): React.ReactElement {
  const { reducedMotion } = useTheme();
  const height = width * 0.55;
  const cx = width / 2;
  const cy = height - 10;
  const R = width * 0.38;

  // Map level 1–5 → angle -150° to -30° (180° sweep)
  const targetAngle = -150 + ((level - 1) / 4) * 150;
  const needleAngle = useSharedValue(-150);

  useEffect(() => {
    needleAngle.value = withTiming(targetAngle, {
      duration: reducedMotion ? 0 : 700,
    });
  }, [targetAngle, reducedMotion, needleAngle]);

  // Arc segments (5 colored arcs across 150° sweep)
  const arcColors = ['#10B981', '#34D399', '#F59E0B', '#F97316', '#EF4444'];
  const segmentSweep = 30; // degrees per segment
  const startAngle = -150;

  function polarToXY(angleDeg: number, r: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(startDeg: number, endDeg: number, r: number): string {
    const start = polarToXY(startDeg, r);
    const end = polarToXY(endDeg, r);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cx },
      { translateY: cy },
      { rotate: `${needleAngle.value}deg` },
      { translateX: -cx },
      { translateY: -cy },
    ],
  }));

  return (
    <View style={{ width, height }} accessible={false}>
      <Svg width={width} height={height}>
        {/* Track arc segments */}
        {arcColors.map((color, i) => {
          const segStart = startAngle + i * segmentSweep;
          const segEnd = segStart + segmentSweep - 2;
          return (
            <Path
              key={i}
              d={describeArc(segStart, segEnd, R)}
              stroke={color}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
              opacity={i + 1 <= level ? 1 : 0.2}
            />
          );
        })}

        {/* Center pivot */}
        <Circle cx={cx} cy={cy} r={6} fill="#1E40AF" />

        {/* Level labels 1–5 */}
        {([1, 2, 3, 4, 5] as RiskLevel[]).map((l) => {
          const angle = -150 + ((l - 1) / 4) * 150;
          const pos = polarToXY(angle, R + 18);
          return (
            <SvgText
              key={l}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={10}
              fontWeight="600"
              fill={l <= level ? RISK_META[l].color : '#94A3B8'}
            >
              {l}
            </SvgText>
          );
        })}
      </Svg>

      {/* Needle (rendered as Animated.View overlay for reanimated) */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          animStyle,
        ]}
        pointerEvents="none"
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {/* Needle line from center */}
          <Line
            x1={cx}
            y1={cy}
            x2={cx + R * 0.75}
            y2={cy}
            stroke="#0F172A"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ─── Dots variant ─────────────────────────────────────────────────────────────

function DotsMeter({ level }: { level: RiskLevel }): React.ReactElement {
  const DOT_SIZE = 12;
  const GAP = 6;

  return (
    <View style={{ flexDirection: 'row', gap: GAP, alignItems: 'center' }} accessible={false}>
      {([1, 2, 3, 4, 5] as RiskLevel[]).map((dot) => (
        <View
          key={dot}
          style={{
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: dot <= level ? RISK_META[dot].color : RISK_META[dot].trackColor,
          }}
        />
      ))}
    </View>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelNumber: {
    fontVariant: ['tabular-nums'],
  },
  levelLabel: {},
});
