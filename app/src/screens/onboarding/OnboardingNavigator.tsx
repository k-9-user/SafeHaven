/**
 * SafeHaven — Onboarding Navigator
 *
 * A lightweight step-based navigator that controls the 7-screen onboarding flow.
 * Uses React Navigation's native stack if available; falls back to a simple
 * in-component state machine that works without any navigator context.
 *
 * Step index → Screen mapping:
 *   0  WelcomeScreen
 *   1  LanguageScreen
 *   2  AccessibilityScreen
 *   3  GoalSelectionScreen
 *   4  CapitalSnapshotScreen
 *   5  RiskProfilingScreen
 *   6  WalletConnectionScreen
 *
 * After step 6 completes, onComplete() fires — the parent AppNavigator
 * switches to the main app tabs.
 *
 * Deep-resume: if the store shows currentStep > 0 (app was killed mid-flow),
 * we resume at the saved step so users never lose progress.
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { WelcomeScreen }        from './WelcomeScreen';
import { LanguageScreen }       from './LanguageScreen';
import { AccessibilityScreen }  from './AccessibilityScreen';
import { GoalSelectionScreen }  from './GoalSelectionScreen';
import { CapitalSnapshotScreen } from './CapitalSnapshotScreen';
import { RiskProfilingScreen }  from './RiskProfilingScreen';
import { WalletConnectionScreen } from './WalletConnectionScreen';
import { useOnboardingStore }   from './useOnboardingStore';

export interface OnboardingNavigatorProps {
  /** Called when the last step completes — parent switches to main app */
  onComplete: () => void;
}

export function OnboardingNavigator({
  onComplete,
}: OnboardingNavigatorProps): React.ReactElement {
  const { currentStep, advanceStep, goToStep } = useOnboardingStore();

  const goNext = useCallback(() => advanceStep(), [advanceStep]);
  const goBack = useCallback(
    () => goToStep(Math.max(0, currentStep - 1)),
    [goToStep, currentStep],
  );

  const screenProps = { onNext: goNext, onBack: goBack };

  return (
    <View style={{ flex: 1 }}>
      {currentStep === 0 && (
        <WelcomeScreen onNext={goNext} />
      )}
      {currentStep === 1 && (
        <LanguageScreen {...screenProps} />
      )}
      {currentStep === 2 && (
        <AccessibilityScreen {...screenProps} />
      )}
      {currentStep === 3 && (
        <GoalSelectionScreen {...screenProps} />
      )}
      {currentStep === 4 && (
        <CapitalSnapshotScreen {...screenProps} />
      )}
      {currentStep === 5 && (
        <RiskProfilingScreen {...screenProps} />
      )}
      {currentStep === 6 && (
        <WalletConnectionScreen
          onNext={onComplete}
          onBack={goBack}
        />
      )}
    </View>
  );
}
