/**
 * SafeHaven — App Navigator
 *
 * Top-level navigation structure:
 *   AppNavigator
 *     ├── OnboardingStack  (shown until onboarding complete)
 *     └── MainTabs         (home, learn, defi, settings)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES } from '@a11y/index';

// ─── Placeholder screen imports (to be implemented) ───────────────────────────
// import HomeScreen from '@screens/HomeScreen';
// import LearnScreen from '@screens/LearnScreen';
// import DeFiScreen from '@screens/DeFiScreen';
// import SettingsScreen from '@screens/SettingsScreen';
// import OnboardingScreen from '@screens/OnboardingScreen';

// ─── Route param types ────────────────────────────────────────────────────────

export type OnboardingStackParamList = {
  Welcome: undefined;
  LanguagePicker: undefined;
  GoalPicker: undefined;
  RiskProfiler: undefined;
  WalletConnect: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Learn: undefined;
  DeFi: undefined;
  Settings: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

function MainTabNavigator(): React.ReactElement {
  return (
    <MainTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 64, // Larger for accessibility
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.label,
          fontWeight: '600',
        },
        // All tab bars must have accessible labels (set per screen below)
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.surface,
        headerTitleStyle: { fontSize: FONT_SIZES.heading3, fontWeight: '700' },
      }}
    >
      {/* Screens to be implemented */}
      {/* <MainTabs.Screen name="Home" component={HomeScreen} /> */}
      {/* <MainTabs.Screen name="Learn" component={LearnScreen} /> */}
      {/* <MainTabs.Screen name="DeFi" component={DeFiScreen} /> */}
      {/* <MainTabs.Screen name="Settings" component={SettingsScreen} /> */}
    </MainTabs.Navigator>
  );
}

export function AppNavigator(): React.ReactElement {
  // TODO: Check if onboarding is complete (from secure store)
  const onboardingComplete = false;

  return (
    <NavigationContainer>
      {onboardingComplete ? (
        <MainTabNavigator />
      ) : (
        <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
          {/* Screens to be implemented */}
          {/* <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} /> */}
        </OnboardingStack.Navigator>
      )}
    </NavigationContainer>
  );
}
