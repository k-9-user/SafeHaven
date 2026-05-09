/**
 * SafeHaven Onboarding — Step 2: Accessibility Setup
 *
 * Four quick-start accessibility toggles with live previews:
 *   1. Voice-First Mode   — Coco narrates every screen automatically
 *   2. Large Text         — bumps base font 16sp → 18sp
 *   3. High Contrast      — WCAG AAA colour mode
 *   4. Reduced Motion     — disables all non-essential animations
 *
 * The screen also reads system accessibility flags (TalkBack / VoiceOver
 * enabled, bold text, reduce motion) and pre-fills the toggles accordingly.
 *
 * Preferences are written to both:
 *   - OnboardingStore (persisted via SecureStore)
 *   - AccessibilityStore (used by ThemeProvider throughout the app)
 *   - ThemeProvider (applied immediately via toggleHighContrast / toggleLargeText)
 *
 * Accessibility:
 *   - Each row: accessibilityRole="switch"
 *   - Switch state read "On" / "Off" by screen reader
 *   - Live preview text changes size/contrast as toggles flip
 *   - Voice reads each feature description when focused (voice-first only)
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { useTheme } from '../../design/Theme';
import { Button } from '../../design/components/Button';
import { Card } from '../../design/components/Card';
import { OnboardingShell } from './OnboardingShell';
import { useOnboardingStore } from './useOnboardingStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { synthesizeSpeech, stopSpeech } from '../../voice/elevenlabs';

// ─── Toggle config ────────────────────────────────────────────────────────────

interface ToggleConfig {
  key: 'voiceFirstMode' | 'largeText' | 'highContrast' | 'reducedMotion';
  icon: string;
  title: string;
  description: string;
  voiceDescription: string;
}

const TOGGLES: ToggleConfig[] = [
  {
    key: 'voiceFirstMode',
    icon: '🔊',
    title: 'Voice-First Mode',
    description: "Coco will read every screen out loud automatically. Great for low-literacy or visual impairment.",
    voiceDescription: "Voice-First Mode: Coco will narrate every screen automatically for you.",
  },
  {
    key: 'largeText',
    icon: '🔤',
    title: 'Large Text',
    description: "Makes all text bigger and easier to read. You can also adjust this in Settings.",
    voiceDescription: "Large Text mode: All text in the app will be bigger and easier to read.",
  },
  {
    key: 'highContrast',
    icon: '🎨',
    title: 'High Contrast',
    description: "Stronger color contrast for better visibility in bright light or for low-vision users.",
    voiceDescription: "High Contrast mode: Colors will have stronger contrast for better visibility.",
  },
  {
    key: 'reducedMotion',
    icon: '✋',
    title: 'Reduced Motion',
    description: "Turns off animations and transitions. Helps if movement on screen causes discomfort.",
    voiceDescription: "Reduced Motion mode: Animations and transitions will be turned off.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface AccessibilityScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function AccessibilityScreen({
  onNext,
  onBack,
}: AccessibilityScreenProps): React.ReactElement {
  const { colors, fonts, spacing, radius, toggleHighContrast, toggleLargeText, isHighContrast, isLargeText } = useTheme();

  const {
    voiceFirstMode, largeText, highContrast, reducedMotion,
    locale,
    setAccessibility,
  } = useOnboardingStore();

  const {
    setLargeText, setHighContrast, setReducedMotion, setScreenReaderEnabled,
  } = useAccessibilityStore();

  // Pre-fill from OS accessibility settings
  useEffect(() => {
    async function detectOSPrefs(): Promise<void> {
      const [isReduceMotion, isScreenReader, isBoldText] = await Promise.all([
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isScreenReaderEnabled(),
        // Bold text (iOS only — graceful if unavailable)
        AccessibilityInfo.isBoldTextEnabled?.() ?? Promise.resolve(false),
      ]);

      setAccessibility({
        reducedMotion: isReduceMotion,
        voiceFirstMode: isScreenReader,
        largeText: isBoldText,
      });
      setReducedMotion(isReduceMotion);
      setScreenReaderEnabled(isScreenReader);
      if (isBoldText) setLargeText(true);
    }
    detectOSPrefs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = useCallback(
    async (key: ToggleConfig['key'], value: boolean) => {
      setAccessibility({ [key]: value });

      // Sync to AccessibilityStore
      if (key === 'largeText') {
        setLargeText(value);
        // Also toggle in ThemeProvider for immediate visual feedback
        if (value !== isLargeText) toggleLargeText();
      }
      if (key === 'highContrast') {
        setHighContrast(value);
        if (value !== isHighContrast) toggleHighContrast();
      }
      if (key === 'reducedMotion') setReducedMotion(value);
      if (key === 'voiceFirstMode') setScreenReaderEnabled(value);

      // Voice feedback if voice-first mode is on
      if (voiceFirstMode || key === 'voiceFirstMode' && value) {
        const toggle = TOGGLES.find((t) => t.key === key);
        if (toggle) {
          await stopSpeech();
          await synthesizeSpeech(
            `${toggle.title}: ${value ? 'On' : 'Off'}. ${value ? toggle.voiceDescription : ''}`,
            { locale },
          );
        }
      }
    },
    [
      setAccessibility, setLargeText, setHighContrast, setReducedMotion, setScreenReaderEnabled,
      toggleLargeText, toggleHighContrast, isLargeText, isHighContrast, voiceFirstMode, locale,
    ],
  );

  const currentValues: Record<ToggleConfig['key'], boolean> = {
    voiceFirstMode,
    largeText,
    highContrast,
    reducedMotion,
  };

  return (
    <OnboardingShell
      step={2}
      screenTitle="Accessibility settings"
      onBack={onBack}
      showVoiceReplay={voiceFirstMode}
      onVoiceReplay={async () => {
        await synthesizeSpeech(
          "These are your accessibility settings. Voice-First Mode, Large Text, High Contrast, and Reduced Motion. Toggle what feels right for you.",
          { locale },
        );
      }}
      footer={
        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onNext}
          accessibilityLabel="Continue to goal selection"
          accessibilityHint="Moves to the next step"
        />
      }
    >
      {/* Heading */}
      <Text
        accessible
        accessibilityRole="header"
        style={[
          styles.heading,
          { color: colors.text, fontSize: fonts.sizes.xl, fontWeight: '800', marginBottom: spacing[1] },
        ]}
        allowFontScaling
      >
        Make it yours
      </Text>
      <Text
        style={{ color: colors.textMuted, fontSize: fonts.sizes.sm, marginBottom: spacing[5] }}
        allowFontScaling
      >
        These settings help us work better for you. You can change them any time.
      </Text>

      {/* Live preview card */}
      <Card
        variant="elevated"
        style={{ marginBottom: spacing[5] }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: fonts.sizes.base,
            fontWeight: '600',
            marginBottom: 4,
          }}
          allowFontScaling
        >
          Preview
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fonts.sizes.sm,
            lineHeight: fonts.lineHeight(fonts.sizes.sm, 'relaxed'),
          }}
          allowFontScaling
        >
          This is how text will look throughout SafeHaven. Toggle Large Text to see the difference.
        </Text>
      </Card>

      {/* Toggles */}
      <View style={styles.toggleList}>
        {TOGGLES.map((toggle) => (
          <AccessibilityToggleRow
            key={toggle.key}
            config={toggle}
            value={currentValues[toggle.key]}
            onToggle={(v) => handleToggle(toggle.key, v)}
            colors={colors}
            fonts={fonts}
            spacing={spacing}
            radius={radius}
          />
        ))}
      </View>

      {/* "All on" preset */}
      <Button
        label="Enable all for maximum accessibility"
        variant="ghost"
        size="sm"
        fullWidth
        style={{ marginTop: spacing[4] }}
        onPress={() => {
          TOGGLES.forEach((t) => handleToggle(t.key, true));
        }}
        accessibilityLabel="Enable all accessibility features"
        accessibilityHint="Turns on voice-first mode, large text, high contrast, and reduced motion"
      />
    </OnboardingShell>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

interface AccessibilityToggleRowProps {
  config: ToggleConfig;
  value: boolean;
  onToggle: (v: boolean) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radius: ReturnType<typeof useTheme>['radius'];
}

function AccessibilityToggleRow({
  config,
  value,
  onToggle,
  colors,
  fonts,
  spacing,
  radius,
}: AccessibilityToggleRowProps): React.ReactElement {
  return (
    <View
      accessible
      accessibilityRole="switch"
      accessibilityLabel={`${config.title}. ${config.description}. Currently ${value ? 'on' : 'off'}.`}
      accessibilityState={{ checked: value }}
      style={[
        styles.toggleRow,
        {
          backgroundColor: value ? colors.primaryLight : colors.surface,
          borderColor: value ? colors.primary : colors.border,
          borderRadius: radius.md,
          borderWidth: value ? 2 : 1,
          padding: spacing[4],
          marginBottom: spacing[3],
        },
      ]}
    >
      {/* Icon */}
      <Text style={styles.toggleIcon} accessible={false}>{config.icon}</Text>

      {/* Label + description */}
      <View style={styles.toggleText}>
        <Text
          style={{
            color: value ? colors.primaryDark : colors.text,
            fontSize: fonts.sizes.base,
            fontWeight: '700',
          }}
          allowFontScaling
        >
          {config.title}
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fonts.sizes.sm,
            lineHeight: fonts.lineHeight(fonts.sizes.sm, 'normal'),
            marginTop: 2,
          }}
          allowFontScaling
        >
          {config.description}
        </Text>
      </View>

      {/* Switch */}
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
        accessible={false} // Parent View is the accessible element
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    letterSpacing: -0.3,
  },
  toggleList: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
});
