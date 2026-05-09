/**
 * SafeHaven — Onboarding State Store
 *
 * Zustand store that accumulates all data collected during the 7-step
 * onboarding flow. Persisted locally with expo-secure-store (AES-256).
 *
 * After completion the profile is:
 *   1. Stored locally (encrypted) — works offline.
 *   2. Synced to the agent backend — enables personalised recommendations.
 *
 * The store is deliberately flat — no nested objects — to make Zustand
 * partial updates easy and serialisation predictable.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import type { SupportedLocale } from '../../i18n/index';

const AGENT_URL = process.env['EXPO_PUBLIC_AGENT_URL'] ?? 'http://localhost:3001';
const STORE_KEY = 'safehaven_onboarding_v1';

// ─── Goal types ───────────────────────────────────────────────────────────────

export type OnboardingGoal =
  | 'emergency_fund'
  | 'send_money_home'
  | 'save_for_goal'
  | 'grow_slowly';

// ─── Risk quiz answer types ───────────────────────────────────────────────────

export type RiskAnswerKey = 'q1' | 'q2' | 'q3' | 'q4';
export type RiskAnswerValue = 'a' | 'b' | 'c';
export type RiskAnswers = Partial<Record<RiskAnswerKey, RiskAnswerValue>>;

// ─── Wallet types ─────────────────────────────────────────────────────────────

export type WalletType = 'mwa' | 'starter';

export interface WalletInfo {
  type: WalletType;
  publicKey: string;       // base58 Solana public key
  walletName?: string;     // e.g. "Phantom", "Backpack", or "SafeHaven Starter"
}

// ─── Full onboarding state ────────────────────────────────────────────────────

export interface OnboardingState {
  // Progress
  currentStep: number;           // 0–6 (matches screen index)
  completedAt: string | null;    // ISO date string

  // Step 1: Language
  locale: SupportedLocale;

  // Step 2: Accessibility
  voiceFirstMode: boolean;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;

  // Step 3: Goals (multi-select)
  goals: OnboardingGoal[];

  // Step 4: Capital
  monthlyCapitalUSD: number;     // 0–1000+, from slider or voice

  // Step 5: Risk quiz
  riskAnswers: RiskAnswers;
  riskScore: number | null;      // 1–5, computed after step 5

  // Step 6: Wallet
  wallet: WalletInfo | null;

  // Actions
  setLocale: (locale: SupportedLocale) => void;
  setAccessibility: (prefs: {
    voiceFirstMode?: boolean;
    largeText?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
  }) => void;
  toggleGoal: (goal: OnboardingGoal) => void;
  setMonthlyCapital: (amount: number) => void;
  setRiskAnswer: (question: RiskAnswerKey, answer: RiskAnswerValue) => void;
  setRiskScore: (score: number) => void;
  setWallet: (wallet: WalletInfo) => void;
  advanceStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

// ─── Secure storage adapter ───────────────────────────────────────────────────

/**
 * Expo SecureStore adapter for Zustand persist middleware.
 * Uses AES-256 encryption on iOS (Keychain) and Android (Keystore).
 */
const secureStorage = createJSONStorage(() => ({
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (error) {
      console.warn('[OnboardingStore] SecureStore write failed:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore — key may not exist
    }
  },
}));

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: Omit<OnboardingState,
  | 'setLocale' | 'setAccessibility' | 'toggleGoal' | 'setMonthlyCapital'
  | 'setRiskAnswer' | 'setRiskScore' | 'setWallet' | 'advanceStep'
  | 'goToStep' | 'completeOnboarding' | 'resetOnboarding'
> = {
  currentStep: 0,
  completedAt: null,
  locale: 'en',
  voiceFirstMode: false,
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  goals: [],
  monthlyCapitalUSD: 0,
  riskAnswers: {},
  riskScore: null,
  wallet: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setLocale: (locale) => set({ locale }),

      setAccessibility: (prefs) => set((s) => ({ ...s, ...prefs })),

      toggleGoal: (goal) =>
        set((s) => ({
          goals: s.goals.includes(goal)
            ? s.goals.filter((g) => g !== goal)
            : [...s.goals, goal],
        })),

      setMonthlyCapital: (amount) =>
        set({ monthlyCapitalUSD: Math.max(0, Math.round(amount)) }),

      setRiskAnswer: (question, answer) =>
        set((s) => ({
          riskAnswers: { ...s.riskAnswers, [question]: answer },
        })),

      setRiskScore: (score) => set({ riskScore: score }),

      setWallet: (wallet) => set({ wallet }),

      advanceStep: () =>
        set((s) => ({ currentStep: Math.min(s.currentStep + 1, 6) })),

      goToStep: (step) =>
        set({ currentStep: Math.max(0, Math.min(step, 6)) }),

      completeOnboarding: async () => {
        const completedAt = new Date().toISOString();
        set({ completedAt });

        // Sync to agent backend (fire-and-forget — works offline gracefully)
        const state = get();
        try {
          await axios.post(
            `${AGENT_URL}/api/risk/profile`,
            {
              locale: state.locale,
              goals: state.goals,
              monthlyCapitalUSD: state.monthlyCapitalUSD,
              riskAnswers: state.riskAnswers,
              riskScore: state.riskScore,
              walletType: state.wallet?.type,
              publicKey: state.wallet?.publicKey,
              completedAt,
            },
            { timeout: 10_000 },
          );
        } catch (error) {
          // Profile is saved locally — sync will retry on next launch
          console.warn('[OnboardingStore] Backend sync failed (will retry):', error);
        }
      },

      resetOnboarding: () =>
        set({
          ...INITIAL_STATE,
          // Preserve locale and a11y prefs across reset
          locale: get().locale,
          voiceFirstMode: get().voiceFirstMode,
          largeText: get().largeText,
          highContrast: get().highContrast,
          reducedMotion: get().reducedMotion,
        }),
    }),
    {
      name: STORE_KEY,
      storage: secureStorage,
      // Only persist the data fields, not the action functions
      partialize: (state) => ({
        currentStep:       state.currentStep,
        completedAt:       state.completedAt,
        locale:            state.locale,
        voiceFirstMode:    state.voiceFirstMode,
        largeText:         state.largeText,
        highContrast:      state.highContrast,
        reducedMotion:     state.reducedMotion,
        goals:             state.goals,
        monthlyCapitalUSD: state.monthlyCapitalUSD,
        riskAnswers:       state.riskAnswers,
        riskScore:         state.riskScore,
        wallet:            state.wallet,
      }),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

/** True if the user has already completed onboarding */
export function selectOnboardingComplete(s: OnboardingState): boolean {
  return s.completedAt !== null;
}

/** Number of risk answers submitted (0–4) */
export function selectRiskAnswerCount(s: OnboardingState): number {
  return Object.keys(s.riskAnswers).length;
}
