/**
 * SafeHaven — i18n Configuration
 *
 * Uses i18next with react-i18next.
 * Supports: en, fr, es, pt, sw, ha, ar
 * MVP focus: en, fr, es
 *
 * RTL: Arabic uses I18nManager.forceRTL (applied in App.tsx)
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Locale bundles — all bundled for offline support
import en from './locales/en';
import fr from './locales/fr';
import es from './locales/es';

export type SupportedLocale = 'en' | 'fr' | 'es' | 'pt' | 'sw' | 'ha' | 'ar';

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  'en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar',
];

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  sw: 'Kiswahili',
  ha: 'Hausa',
  ar: 'العربية',
};

export const RTL_LOCALES: SupportedLocale[] = ['ar'];

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  // Placeholder resources for future locales
  pt: { translation: en },
  sw: { translation: en },
  ha: { translation: en },
  ar: { translation: en },
};

/**
 * Detect the best supported locale from device locale list.
 * Falls back to 'en' if no match found.
 */
function detectLocale(preferredLocale?: string): SupportedLocale {
  const candidates = preferredLocale
    ? [preferredLocale, ...Localization.getLocales().map((l) => l.languageCode ?? '')]
    : Localization.getLocales().map((l) => l.languageCode ?? '');

  for (const candidate of candidates) {
    const code = candidate.split('-')[0]?.toLowerCase() as SupportedLocale;
    if (SUPPORTED_LOCALES.includes(code)) {
      return code;
    }
  }
  return 'en';
}

/**
 * Initialize i18n. Must be called before any component renders.
 */
export async function initI18n(preferredLocale?: string): Promise<void> {
  const detectedLocale = detectLocale(preferredLocale);

  await i18n.use(initReactI18next).init({
    resources,
    lng: detectedLocale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    compatibilityJSON: 'v4',
  });
}

/**
 * Change the app language at runtime.
 * Also handles RTL layout switching for Arabic.
 */
export async function changeLocale(locale: SupportedLocale): Promise<void> {
  await i18n.changeLanguage(locale);
}

export default i18n;
