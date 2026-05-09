/**
 * SafeHaven — Accessibility Preferences Store (Zustand)
 *
 * Persists user accessibility preferences across sessions.
 */

import { create } from 'zustand';

interface AccessibilityState {
  reducedMotion: boolean;
  screenReaderEnabled: boolean;
  largeText: boolean;
  highContrast: boolean;
  hapticsEnabled: boolean;

  setReducedMotion: (val: boolean) => void;
  setScreenReaderEnabled: (val: boolean) => void;
  setLargeText: (val: boolean) => void;
  setHighContrast: (val: boolean) => void;
  setHapticsEnabled: (val: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  reducedMotion: false,
  screenReaderEnabled: false,
  largeText: false,
  highContrast: false,
  hapticsEnabled: true,

  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setScreenReaderEnabled: (screenReaderEnabled) => set({ screenReaderEnabled }),
  setLargeText: (largeText) => set({ largeText }),
  setHighContrast: (highContrast) => set({ highContrast }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
}));
