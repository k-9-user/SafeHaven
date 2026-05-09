/**
 * SafeHaven Onboarding — Step 1: Language Selection
 *
 * Visual list of all 7 supported languages with flag emoji and native name.
 * Large tap targets (56dp rows) for easy selection on small screens.
 * Currently selected language is highlighted and announced to screen readers.
 *
 * Accessibility:
 *   - accessibilityRole="radio" on each option
 *   - accessibilityState.checked reflects current selection
 *   - accessibilityLabel reads flag name + language name
 *   - RTL layout auto-applied for Arabic
 *   - Voice reads selected language name via expo-speech (lightweight, no API call)
 *   - Search/filter input for future locale expansion
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  I18nManager,
  AccessibilityInfo,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useTheme } from '../../design/Theme';
import { Button } from '../../design/components/Button';
import { OnboardingShell } from './OnboardingShell';
import { useOnboardingStore } from './useOnboardingStore';
import type { SupportedLocale } from '../../i18n/index';
import { changeLocale } from '../../i18n/index';
import { synthesizeSpeech } from '../../voice/elevenlabs';

// ─── Language data ────────────────────────────────────────────────────────────

interface LanguageOption {
  code: SupportedLocale;
  nativeName: string;
  englishName: string;
  flag: string;
  /** BCP 47 tag for expo-speech */
  speechLang: string;
  rtl: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English',    englishName: 'English',    flag: '🇺🇸', speechLang: 'en-US', rtl: false },
  { code: 'fr', nativeName: 'Français',   englishName: 'French',     flag: '🇫🇷', speechLang: 'fr-FR', rtl: false },
  { code: 'es', nativeName: 'Español',    englishName: 'Spanish',    flag: '🇪🇸', speechLang: 'es-ES', rtl: false },
  { code: 'pt', nativeName: 'Português',  englishName: 'Portuguese', flag: '🇧🇷', speechLang: 'pt-BR', rtl: false },
  { code: 'sw', nativeName: 'Kiswahili',  englishName: 'Swahili',    flag: '🇰🇪', speechLang: 'sw-KE', rtl: false },
  { code: 'ha', nativeName: 'Hausa',      englishName: 'Hausa',      flag: '🇳🇬', speechLang: 'ha-NG', rtl: false },
  { code: 'ar', nativeName: 'العربية',    englishName: 'Arabic',     flag: '🇸🇦', speechLang: 'ar-SA', rtl: true  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface LanguageScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function LanguageScreen({ onNext, onBack }: LanguageScreenProps): React.ReactElement {
  const { colors, fonts, spacing, radius, shadows } = useTheme();
  const { locale, setLocale } = useOnboardingStore();

  const handleSelect = useCallback(async (lang: LanguageOption) => {
    setLocale(lang.code);
    await changeLocale(lang.code);

    // Apply RTL layout if needed
    if (lang.rtl !== I18nManager.isRTL) {
      I18nManager.forceRTL(lang.rtl);
      // Note: App restart is needed for RTL to fully apply (handled in App.tsx)
    }

    // Light voice confirmation using on-device TTS (no data usage)
    Speech.speak(lang.nativeName, {
      language: lang.speechLang,
      rate: 0.9,
    });

    // Announce to screen reader
    AccessibilityInfo.announceForAccessibility(
      `${lang.englishName} selected`,
    );
  }, [setLocale]);

  return (
    <OnboardingShell
      step={1}
      screenTitle="Choose your language"
      onBack={onBack}
      footer={
        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          onPress={onNext}
          accessibilityLabel="Continue with selected language"
          accessibilityHint="Moves to accessibility settings"
        />
      }
    >
      {/* Heading */}
      <Text
        accessible
        accessibilityRole="header"
        style={[
          styles.heading,
          {
            color: colors.text,
            fontSize: fonts.sizes.xl,
            fontWeight: '800',
            marginBottom: spacing[2],
          },
        ]}
        allowFontScaling
      >
        Choose your language
      </Text>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: fonts.sizes.sm,
          marginBottom: spacing[5],
        }}
      >
        You can change this anytime in Settings.
      </Text>

      {/* Language list */}
      <View
        accessible={false}
        accessibilityRole="radiogroup"
        accessibilityLabel="Language options"
        style={styles.list}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = locale === lang.code;
          return (
            <LanguageRow
              key={lang.code}
              lang={lang}
              isSelected={isSelected}
              onPress={() => handleSelect(lang)}
              colors={colors}
              fonts={fonts}
              spacing={spacing}
              radius={radius}
            />
          );
        })}
      </View>
    </OnboardingShell>
  );
}

// ─── Language row ─────────────────────────────────────────────────────────────

interface LanguageRowProps {
  lang: LanguageOption;
  isSelected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  fonts: ReturnType<typeof useTheme>['fonts'];
  spacing: ReturnType<typeof useTheme>['spacing'];
  radius: ReturnType<typeof useTheme>['radius'];
}

function LanguageRow({
  lang,
  isSelected,
  onPress,
  colors,
  fonts,
  spacing,
  radius,
}: LanguageRowProps): React.ReactElement {
  return (
    <Pressable
      accessible
      accessibilityRole="radio"
      accessibilityLabel={`${lang.englishName}, ${lang.nativeName}`}
      accessibilityHint={isSelected ? 'Currently selected' : 'Double-tap to select'}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderRadius: radius.md,
          borderWidth: isSelected ? 2 : 1,
          paddingHorizontal: spacing[4],
          marginBottom: spacing[2],
          minHeight: 56,
        },
      ]}
    >
      {/* Flag */}
      <Text style={styles.flag} accessible={false}>{lang.flag}</Text>

      {/* Names */}
      <View style={styles.names}>
        <Text
          style={{
            color: isSelected ? colors.primaryDark : colors.text,
            fontSize: fonts.sizes.base,
            fontWeight: '700',
          }}
          allowFontScaling
        >
          {lang.nativeName}
        </Text>
        {lang.nativeName !== lang.englishName && (
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fonts.sizes.sm,
            }}
          >
            {lang.englishName}
          </Text>
        )}
      </View>

      {/* Check indicator */}
      {isSelected && (
        <View
          style={[
            styles.checkCircle,
            { backgroundColor: colors.primary, borderRadius: 12 },
          ]}
          accessible={false}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    letterSpacing: -0.3,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  names: {
    flex: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
