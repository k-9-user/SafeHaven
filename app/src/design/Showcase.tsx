/**
 * SafeHaven Design System — Showcase
 *
 * QA preview screen that renders every design-system component in all
 * its variants, states, and accessibility modes.
 *
 * Intended for use in Storybook-style dev builds only — exclude from
 * production bundles via Metro bundler environment check:
 *
 *   if (__DEV__) { /* import Showcase *\/ }
 *
 * Navigation: rendered at /dev/showcase in the developer tab.
 */

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ThemeProvider, useTheme } from './Theme';

// Components
import { Button }         from './components/Button';
import { Card, CardAccent } from './components/Card';
import { ProgressBar, XPBar } from './components/ProgressBar';
import { BadgeChip, TierBadge } from './components/BadgeChip';
import { QuestCard }      from './components/QuestCard';
import { VoiceMicButton } from './components/VoiceMicButton';
import { InfoTooltip }    from './components/InfoTooltip';
import { RiskMeter }      from './components/RiskMeter';
import { AmountInput }    from './components/AmountInput';
import { CocoPet, CocoAvatar } from './components/CocoPet';

// ─── Entry point ──────────────────────────────────────────────────────────────

/**
 * Wrap with ThemeProvider so the Showcase can toggle modes
 * independently of the rest of the app.
 */
export function Showcase(): React.ReactElement {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <ThemeProvider
      initialHighContrast={highContrast}
      initialLargeText={largeText}
    >
      <ShowcaseInner
        highContrast={highContrast}
        largeText={largeText}
        onToggleHighContrast={setHighContrast}
        onToggleLargeText={setLargeText}
        reducedMotionOverride={reducedMotion}
        onToggleReducedMotion={setReducedMotion}
      />
    </ThemeProvider>
  );
}

// ─── Inner (consumes theme) ───────────────────────────────────────────────────

interface InnerProps {
  highContrast: boolean;
  largeText: boolean;
  onToggleHighContrast: (v: boolean) => void;
  onToggleLargeText: (v: boolean) => void;
  reducedMotionOverride: boolean;
  onToggleReducedMotion: (v: boolean) => void;
}

function ShowcaseInner({
  highContrast,
  largeText,
  onToggleHighContrast,
  onToggleLargeText,
  reducedMotionOverride,
  onToggleReducedMotion,
}: InnerProps): React.ReactElement {
  const { colors, fonts, spacing, radius } = useTheme();

  // Stateful demo helpers
  const [micState, setMicState] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [depositAmount, setDepositAmount] = useState<number | undefined>(undefined);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [xp] = useState(340);

  const cycleMic = useCallback(() => {
    setMicState((s) => {
      if (s === 'idle')       return 'recording';
      if (s === 'recording')  return 'processing';
      if (s === 'processing') return 'error';
      return 'idle';
    });
  }, []);

  const simulateLoad = useCallback(() => {
    setLoadingBtn(true);
    setTimeout(() => setLoadingBtn(false), 2000);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={highContrast ? 'dark-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[4] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <View style={[styles.headerRow, { marginBottom: spacing[4] }]}>
          <CocoAvatar size={48} />
          <View style={{ marginLeft: spacing[3], flex: 1 }}>
            <Text
              style={[
                styles.pageTitle,
                { color: colors.text, fontSize: fonts.sizes['2xl'], fontWeight: '800' },
              ]}
            >
              Design Showcase
            </Text>
            <Text
              style={{ color: colors.textMuted, fontSize: fonts.sizes.sm }}
            >
              SafeHaven · Blue Theme · GitMastery-inspired
            </Text>
          </View>
        </View>

        {/* ── Accessibility Toggles ─────────────────────────────────── */}
        <Section title="⚙️ Accessibility Modes" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <ToggleRow
            label="High Contrast"
            value={highContrast}
            onToggle={onToggleHighContrast}
            hint="Boosts all contrast ratios to WCAG AAA (7:1+)"
            colors={colors}
            fonts={fonts}
          />
          <ToggleRow
            label="Large Text"
            value={largeText}
            onToggle={onToggleLargeText}
            hint="Bumps body text from 16sp → 18sp, comfortable → 20sp"
            colors={colors}
            fonts={fonts}
          />
          <ToggleRow
            label="Reduced Motion"
            value={reducedMotionOverride}
            onToggle={onToggleReducedMotion}
            hint="Disables all non-essential animations"
            colors={colors}
            fonts={fonts}
          />
        </Section>

        {/* ── Color Palette ─────────────────────────────────────────── */}
        <Section title="🎨 Color Palette" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <View style={styles.swatchGrid}>
            {([
              ['Primary',      colors.primary      ],
              ['Primary Dark', colors.primaryDark   ],
              ['Primary Light',colors.primaryLight  ],
              ['Accent',       colors.accent        ],
              ['Success',      colors.success       ],
              ['Warning',      colors.warning       ],
              ['Danger',       colors.danger        ],
              ['Text',         colors.text          ],
              ['Text Muted',   colors.textMuted     ],
              ['Surface',      colors.surface       ],
              ['BG',           colors.bg            ],
              ['Border',       colors.border        ],
            ] as [string, string][]).map(([name, hex]) => (
              <View key={name} style={styles.swatchItem}>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: hex,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                />
                <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 4, textAlign: 'center' }}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Typography ────────────────────────────────────────────── */}
        <Section title="🖋 Typography" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          {([
            ['4xl — Display',   fonts.sizes['4xl'], '800'],
            ['3xl — Heading 1', fonts.sizes['3xl'], '700'],
            ['2xl — Heading 2', fonts.sizes['2xl'], '700'],
            ['xl  — Heading 3', fonts.sizes.xl,     '600'],
            ['lg  — Lead',      fonts.sizes.lg,     '500'],
            ['base— Body',      fonts.sizes.base,   '400'],
            ['sm  — Caption',   fonts.sizes.sm,     '400'],
            ['xs  — Label',     fonts.sizes.xs,     '500'],
          ] as [string, number, string][]).map(([label, size, weight]) => (
            <Text
              key={label}
              style={{
                color: colors.text,
                fontSize: size,
                fontWeight: weight as any,
                marginBottom: 4,
              }}
              allowFontScaling
            >
              {label}
            </Text>
          ))}
        </Section>

        {/* ── Coco the Coin Coach ───────────────────────────────────── */}
        <Section title="🐾 Coco the Coin Coach" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <View style={styles.cocoRow}>
            {(['idle', 'happy', 'thinking', 'warning'] as const).map((v) => (
              <View key={v} style={{ alignItems: 'center', gap: 6 }}>
                <CocoPet variant={v} size={80} animated />
                <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs }}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <Section title="🔘 Buttons" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <SubHeading label="Variants" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            {(['primary', 'secondary', 'ghost', 'danger', 'success'] as const).map((v) => (
              <Button key={v} label={v} variant={v} size="md" />
            ))}
          </View>

          <SubHeading label="Sizes" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            <Button label="Small" size="sm" />
            <Button label="Medium" size="md" />
            <Button label="Large" size="lg" />
          </View>

          <SubHeading label="States" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            <Button label="Loading" loading={loadingBtn} onPress={simulateLoad} />
            <Button label="Disabled" disabled />
            <Button label="Full width →" fullWidth onPress={() => {}} />
          </View>
        </Section>

        {/* ── Cards ─────────────────────────────────────────────────── */}
        <Section title="🃏 Cards" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          {(['default', 'elevated', 'outlined'] as const).map((v) => (
            <Card key={v} variant={v} style={{ marginBottom: spacing[3] }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: fonts.sizes.base }}>
                {v.charAt(0).toUpperCase() + v.slice(1)} Card
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>
                Rounded 16px corners, soft shadow, clean surface.
              </Text>
            </Card>
          ))}

          {/* Quest / accent cards */}
          {(['quest', 'success', 'warning'] as const).map((v) => (
            <Card
              key={v}
              variant={v}
              onPress={() => {}}
              accessibilityLabel={`${v} card — tap to open`}
              style={{ marginBottom: spacing[3] }}
            >
              <CardAccent
                color={
                  v === 'success' ? colors.success :
                  v === 'warning' ? colors.warning :
                  colors.primary
                }
              />
              <View style={{ flex: 1, padding: spacing[3] }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: fonts.sizes.base }}>
                  {v.charAt(0).toUpperCase() + v.slice(1)} Card
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginTop: 4 }}>
                  GitMastery-inspired accent strip. Pressable with scale animation.
                </Text>
              </View>
            </Card>
          ))}
        </Section>

        {/* ── Progress Bars ─────────────────────────────────────────── */}
        <Section title="📊 Progress Bars" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <SubHeading label="XP Bar" colors={colors} fonts={fonts} />
          <XPBar currentXP={xp} maxXP={500} tierLabel="Saver Tier" />

          <SubHeading label="Variants" colors={colors} fonts={fonts} />
          <View style={{ gap: spacing[3] }}>
            <ProgressBar value={72} variant="xp"      height={14} showLabel label="XP Progress: 72%" />
            <ProgressBar value={45} variant="lesson"  height={10} showLabel label="Lesson 45% complete" />
            <ProgressBar value={28} variant="neutral" height={8}  showLabel label="28%" />
          </View>
        </Section>

        {/* ── Badge Chips ────────────────────────────────────────────── */}
        <Section title="🏅 Badge Chips" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <SubHeading label="Presets" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            <BadgeChip label="Primary"  preset="primary"  icon="⚡" />
            <BadgeChip label="Success"  preset="success"  icon="✅" />
            <BadgeChip label="Warning"  preset="warning"  icon="⚠️" />
            <BadgeChip label="Danger"   preset="danger"   icon="🔴" />
            <BadgeChip label="Muted"    preset="muted"    />
          </View>

          <SubHeading label="Tier Badges" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            <TierBadge tier="novice"   />
            <TierBadge tier="saver"    />
            <TierBadge tier="investor" />
          </View>

          <SubHeading label="Sizes" colors={colors} fonts={fonts} />
          <View style={styles.chipRow}>
            <BadgeChip label="Small"  size="sm" preset="primary" />
            <BadgeChip label="Medium" size="md" preset="primary" />
            <BadgeChip label="Large"  size="lg" preset="primary" />
          </View>

          <SubHeading label="Earned animation" colors={colors} fonts={fonts} />
          <BadgeChip label="+150 XP Earned!" icon="🎉" preset="gold" size="lg" earned />
        </Section>

        {/* ── Quest Cards ───────────────────────────────────────────── */}
        <Section title="⚔️ Quest Cards" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          {(
            [
              {
                title: 'Build your first budget',
                description: 'Learn the 50/30/20 rule and create a budget that actually works for your lifestyle.',
                xpReward: 100,
                state: 'available' as const,
                category: 'Budget',
                estimatedMinutes: 5,
                enterDelay: 0,
              },
              {
                title: 'Understanding DeFi yields',
                description: 'Explore how liquidity pools generate passive income and calculate your projected APY.',
                xpReward: 200,
                state: 'in_progress' as const,
                progress: 60,
                category: 'DeFi',
                categoryColor: '#8B5CF6',
                estimatedMinutes: 12,
                enterDelay: 80,
              },
              {
                title: 'Emergency fund basics',
                description: 'You completed this quest and earned the Safety Net badge!',
                xpReward: 75,
                state: 'completed' as const,
                category: 'Savings',
                categoryColor: '#10B981',
                estimatedMinutes: 4,
                enterDelay: 160,
              },
              {
                title: 'Advanced yield strategies',
                description: 'Unlock this quest by completing the DeFi yields module first.',
                xpReward: 350,
                state: 'locked' as const,
                category: 'DeFi',
                estimatedMinutes: 20,
                enterDelay: 240,
              },
            ]
          ).map((q, i) => (
            <QuestCard
              key={i}
              {...q}
              onPress={() => {}}
              style={{ marginBottom: spacing[3] }}
            />
          ))}
        </Section>

        {/* ── Voice Mic Button ──────────────────────────────────────── */}
        <Section title="🎙 Voice Mic Button" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing[3] }}>
            Current state: <Text style={{ fontWeight: '700', color: colors.text }}>{micState}</Text>
            {'\n'}Tap the mic to cycle through states.
          </Text>
          <View style={{ alignItems: 'center' }}>
            <VoiceMicButton
              state={micState}
              onPress={cycleMic}
              size={80}
            />
          </View>

          <SubHeading label="All States" colors={colors} fonts={fonts} />
          <View style={[styles.chipRow, { justifyContent: 'space-around', marginTop: spacing[4] }]}>
            {(['idle', 'recording', 'processing', 'error'] as const).map((s) => (
              <View key={s} style={{ alignItems: 'center', gap: 8 }}>
                <VoiceMicButton state={s} onPress={() => {}} size={56} />
                <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs }}>{s}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Info Tooltip ─────────────────────────────────────────── */}
        <Section title="ℹ️ Info Tooltip" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing[2] }}>
            Tap the ⓘ button to open a contextual tooltip.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
            <Text style={{ color: colors.text, fontSize: fonts.sizes.base, fontWeight: '600' }}>
              APY
            </Text>
            <InfoTooltip
              topic="APY"
              content="Annual Percentage Yield (APY) reflects the real rate of return on your deposit, accounting for compound interest over one year. A higher APY means your money grows faster."
              linkLabel="Learn more about APY"
              onLinkPress={() => {}}
            />

            <Text style={{ color: colors.text, fontSize: fonts.sizes.base, fontWeight: '600', marginLeft: spacing[4] }}>
              Liquidation Risk
            </Text>
            <InfoTooltip
              topic="Liquidation Risk"
              content="If your collateral value drops below the protocol's minimum threshold, your position may be partially or fully liquidated to repay the loan. Keep an eye on your health factor."
              iconColor={colors.warning}
            />
          </View>
        </Section>

        {/* ── Risk Meter ───────────────────────────────────────────── */}
        <Section title="⚠️ Risk Meter" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <SubHeading label="Bar variant — all levels" colors={colors} fonts={fonts} />
          <View style={{ gap: spacing[3] }}>
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <RiskMeter key={level} level={level} variant="bar" showLabel />
            ))}
          </View>

          <SubHeading label="Gauge variant" colors={colors} fonts={fonts} />
          <View style={{ alignItems: 'center', gap: spacing[3] }}>
            <RiskMeter level={3} variant="gauge" showLabel width={260} />
          </View>

          <SubHeading label="Dots variant (inline)" colors={colors} fonts={fonts} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[4], flexWrap: 'wrap' }}>
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <RiskMeter key={level} level={level} variant="dots" showLabel />
            ))}
          </View>
        </Section>

        {/* ── Amount Input ─────────────────────────────────────────── */}
        <Section title="💵 Amount Input" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <SubHeading label="Default (USDC)" colors={colors} fonts={fonts} />
          <AmountInput
            label="Deposit amount"
            value={depositAmount}
            onChange={setDepositAmount}
            currencySymbol="$"
            currencyName="US dollars"
            min={5}
            max={10000}
            suggestions={[10, 50, 100, 500, 'max']}
            helperText="Minimum deposit: $5 · Maximum: $10,000"
          />

          <SubHeading label="With external error" colors={colors} fonts={fonts} />
          <AmountInput
            label="Withdrawal amount"
            value={250}
            onChange={() => {}}
            currencySymbol="$"
            error="Insufficient balance. Your available balance is $183.44"
            suggestions={[50, 100]}
          />

          <SubHeading label="Disabled state" colors={colors} fonts={fonts} />
          <AmountInput
            label="Locked amount"
            value={1000}
            onChange={() => {}}
            disabled
            helperText="Amount is locked during the 30-day cooldown period."
          />
        </Section>

        {/* ── Streak Counter (bonus game element) ───────────────────── */}
        <Section title="🔥 Streak Counter" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <StreakDisplay streak={7} colors={colors} fonts={fonts} spacing={spacing} radius={radius} />
        </Section>

        {/* ── Level Badge ──────────────────────────────────────────── */}
        <Section title="🏆 Level Badges" colors={colors} fonts={fonts} spacing={spacing} radius={radius}>
          <View style={styles.chipRow}>
            {[1, 5, 10, 25, 50].map((lvl) => (
              <LevelBadge key={lvl} level={lvl} colors={colors} fonts={fonts} />
            ))}
          </View>
        </Section>

        {/* Footer spacer */}
        <View style={{ height: spacing[12] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function Section({
  title,
  children,
  colors,
  fonts,
  spacing,
  radius,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radius: ReturnType<typeof useTheme>['radius'];
}): React.ReactElement {
  return (
    <View style={{ marginBottom: spacing[8] }}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text, fontSize: fonts.sizes.lg, marginBottom: spacing[4] },
        ]}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing[4],
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function SubHeading({
  label,
  colors,
  fonts,
}: {
  label: string;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
}): React.ReactElement {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: fonts.sizes.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 16,
        marginBottom: 10,
      }}
    >
      {label}
    </Text>
  );
}

function ToggleRow({
  label,
  value,
  onToggle,
  hint,
  colors,
  fonts,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  hint: string;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
}): React.ReactElement {
  return (
    <View
      accessible
      accessibilityLabel={`${label} toggle. ${value ? 'On' : 'Off'}. ${hint}`}
      style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: fonts.sizes.base, fontWeight: '600' }}>
          {label}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fonts.sizes.xs, marginTop: 2 }}>
          {hint}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

function StreakDisplay({
  streak,
  colors,
  fonts,
  spacing,
  radius,
}: {
  streak: number;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radius: ReturnType<typeof useTheme>['radius'];
}): React.ReactElement {
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <View
      accessible
      accessibilityLabel={`${streak}-day streak. Keep it up!`}
      style={{ alignItems: 'center', gap: spacing[3] }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing[2],
          backgroundColor: '#FFF7ED',
          borderRadius: radius.xl,
          paddingHorizontal: spacing[5],
          paddingVertical: spacing[3],
        }}
      >
        <Text style={{ fontSize: 28 }}>🔥</Text>
        <Text style={{ fontSize: fonts.sizes['3xl'], fontWeight: '800', color: '#EA580C' }}>
          {streak}
        </Text>
        <Text style={{ fontSize: fonts.sizes.base, color: '#C2410C', fontWeight: '600' }}>
          day streak
        </Text>
      </View>

      {/* Day dots */}
      <View style={{ flexDirection: 'row', gap: spacing[2] }}>
        {DAYS.map((d, i) => {
          const active = i < streak;
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                gap: 4,
              }}
              accessible={false}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: active ? '#EA580C' : colors.bg,
                  borderWidth: active ? 0 : 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>{active ? '🔥' : ''}</Text>
              </View>
              <Text style={{ color: active ? '#EA580C' : colors.textMuted, fontSize: 10, fontWeight: '600' }}>
                {d}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LevelBadge({
  level,
  colors,
  fonts,
}: {
  level: number;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
}): React.ReactElement {
  const tierColor =
    level >= 50 ? '#38BDF8' :
    level >= 25 ? '#F59E0B' :
    level >= 10 ? '#94A3B8' :
    level >= 5  ? '#CD7F32' :
    colors.primary;

  return (
    <View
      accessible
      accessibilityLabel={`Level ${level} badge`}
      style={{ alignItems: 'center', gap: 6 }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: `${tierColor}20`,
          borderWidth: 2.5,
          borderColor: tierColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: level >= 10 ? fonts.sizes.base : fonts.sizes.lg,
            fontWeight: '800',
            color: tierColor,
          }}
        >
          {level}
        </Text>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}>
        LVL {level}
      </Text>
    </View>
  );
}

// ─── Static styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchItem: {
    alignItems: 'center',
    width: 56,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  cocoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
});
