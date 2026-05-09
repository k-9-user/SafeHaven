/**
 * SafeHaven Onboarding — Barrel export
 *
 * Public API of the onboarding module.
 * Import from here — not from individual screen files.
 *
 * @example
 *   import { OnboardingNavigator, useOnboardingStore } from '@screens/onboarding';
 */

export { OnboardingNavigator }        from './OnboardingNavigator';
export { useOnboardingStore, selectOnboardingComplete, selectRiskAnswerCount }
  from './useOnboardingStore';
export { computeOnboardingRiskScore, getRiskScoreInfo }
  from './riskScoring';

// Screen components (exported for deep-linking / testing)
export { WelcomeScreen }             from './WelcomeScreen';
export { LanguageScreen }            from './LanguageScreen';
export { AccessibilityScreen }       from './AccessibilityScreen';
export { GoalSelectionScreen }       from './GoalSelectionScreen';
export { CapitalSnapshotScreen }     from './CapitalSnapshotScreen';
export { RiskProfilingScreen }       from './RiskProfilingScreen';
export { WalletConnectionScreen }    from './WalletConnectionScreen';

// Types
export type { OnboardingGoal, WalletInfo, WalletType, RiskAnswers }
  from './useOnboardingStore';
