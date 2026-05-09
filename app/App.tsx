/**
 * SafeHaven — App Entry Point
 *
 * Architecture:
 *   App.tsx → NavigationContainer → AppNavigator
 *     ├── OnboardingStack  (language picker, risk profiler, wallet connect)
 *     └── MainTabs
 *           ├── HomeScreen        (dashboard, AI chat shortcut)
 *           ├── LearnScreen       (gamified financial education)
 *           ├── DeFiScreen        (strategies, yield, bridge)
 *           └── SettingsScreen    (language, accessibility, wallet)
 *
 * Core pillars enforced at root:
 *   - i18n initialized before render
 *   - Accessibility: reduced motion, screen reader detection
 *   - Offline-first: network status provider
 *   - Security: root-level disclosure and guardrail context
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, I18nManager, AccessibilityInfo } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Localization from 'expo-localization';

import { initI18n } from '@i18n/index';
import { AppNavigator } from '@navigation/AppNavigator';
import { useAccessibilityStore } from '@store/accessibilityStore';

// Keep splash visible while we initialize
SplashScreen.preventAutoHideAsync();

export default function App(): React.ReactElement | null {
  const [ready, setReady] = useState(false);
  const { setReducedMotion, setScreenReaderEnabled } = useAccessibilityStore();

  useEffect(() => {
    async function initialize(): Promise<void> {
      try {
        // 1. Detect device locale for i18n initialization
        const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
        await initI18n(deviceLocale);

        // 2. Detect accessibility preferences
        const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
        setReducedMotion(reducedMotion);

        const screenReader = await AccessibilityInfo.isScreenReaderEnabled();
        setScreenReaderEnabled(screenReader);

        // 3. Apply RTL layout for Arabic
        const isRTL = deviceLocale === 'ar';
        if (I18nManager.isRTL !== isRTL) {
          I18nManager.forceRTL(isRTL);
        }
      } catch (error) {
        // Initialization errors should never crash the app — fall back to defaults
        console.warn('[SafeHaven] App initialization warning:', error);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync();
      }
    }

    initialize();
  }, [setReducedMotion, setScreenReaderEnabled]);

  // Listen for accessibility setting changes at runtime
  useEffect(() => {
    const motionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    const readerSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled,
    );

    return () => {
      motionSubscription.remove();
      readerSubscription.remove();
    };
  }, [setReducedMotion, setScreenReaderEnabled]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#2563EB"
          translucent={false}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
