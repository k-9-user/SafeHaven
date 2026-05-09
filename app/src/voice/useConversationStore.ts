/**
 * SafeHaven — Conversation Memory Store
 *
 * Manages the local conversation history with a 20-turn sliding window.
 * Turns older than the window are summarised server-side and injected
 * back into the system prompt via `conversationSummary`.
 *
 * Architecture:
 *   turns[]            → local ring buffer of last 20 turns
 *   conversationSummary → compressed text of pruned turns (from server)
 *   distressHistory    → last 5 distress signals for UI awareness
 *
 * Persistence: expo-secure-store (AES-256, WHEN_UNLOCKED_THIS_DEVICE_ONLY)
 * The store is reset on explicit logout but survives app restarts.
 *
 * Server sync: when turns exceed MAX_TURNS, the oldest half is sent to
 * POST /api/chat/summarize, which returns a paragraph injected back as
 * `conversationSummary` for the next Claude request.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// ─── Shared types (mirrors agent/src/llm/claude.ts — keep in sync) ────────────
export interface DistressSignal {
  level: 'none' | 'financial' | 'emotional' | 'crisis';
  triggers: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum turns retained in local memory */
const MAX_TURNS = 20;

/** How many turns to prune and summarise when window is full */
const PRUNE_BATCH = 10;

/** Minimum turns before we attempt summarisation (avoid tiny batches) */
const MIN_PRUNE_BATCH = 6;

const AGENT_URL = process.env['EXPO_PUBLIC_AGENT_URL'] ?? 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TurnRole = 'user' | 'assistant';

export interface ConversationTurn {
  id: string;
  role: TurnRole;
  content: string;
  /** ISO timestamp */
  timestamp: string;
  /** Token count estimate (content.length / 4) — used for context budget */
  estimatedTokens: number;
  /** Tool use name if this turn involved a tool call */
  toolName?: string;
  /** Distress level detected on this turn (for UI awareness) */
  distressLevel?: DistressSignal['level'];
}

export interface ConversationState {
  // ── Data ────────────────────────────────────────────────────────────────────
  /** Active turns within the 20-turn window */
  turns: ConversationTurn[];
  /** Server-compressed summary of pruned older turns */
  conversationSummary: string | null;
  /** Last 5 distress signals for UI indicators */
  distressHistory: Array<{ level: DistressSignal['level']; timestamp: string }>;
  /** Total turns ever in this session (monotonic counter) */
  totalTurnsCount: number;
  /** Whether a summarisation request is in-flight */
  isSummarising: boolean;
  /** ISO timestamp of session start */
  sessionStartedAt: string;
  /** Locale for summarisation language */
  locale: string;

  // ── Derived helpers (not persisted) ────────────────────────────────────────
  /** Claude-ready message array from current turns */
  getMessages: () => Array<{ role: TurnRole; content: string }>;
  /** Context object for ConversationContext (injected into Claude calls) */
  getClaudeContext: () => {
    conversationSummary?: string;
    locale: string;
  };

  // ── Mutations ────────────────────────────────────────────────────────────────
  /** Add a user turn and return its ID */
  addUserTurn: (content: string) => string;
  /** Add an assistant turn (after streaming completes) */
  addAssistantTurn: (
    content: string,
    opts?: { toolName?: string; distressLevel?: DistressSignal['level'] }
  ) => string;
  /** Update distress history (called after each assistant turn) */
  recordDistress: (signal: DistressSignal) => void;
  /** Set locale (used for server-side summarisation language) */
  setLocale: (locale: string) => void;
  /** Clear all conversation state (e.g. on logout or explicit reset) */
  clearConversation: () => void;
  /** Trigger summarisation of oldest PRUNE_BATCH turns (called internally) */
  pruneAndSummarise: () => Promise<void>;
}

// ─── SecureStore adapter for Zustand persist ──────────────────────────────────

const secureStorage = createJSONStorage<ConversationState>(() => ({
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch {
      // SecureStore can fail if device is locked during background save — ignore
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
}));

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  turns: [] as ConversationTurn[],
  conversationSummary: null as string | null,
  distressHistory: [] as Array<{ level: DistressSignal['level']; timestamp: string }>,
  totalTurnsCount: 0,
  isSummarising: false,
  sessionStartedAt: new Date().toISOString(),
  locale: 'en',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTurnId(): string {
  return `turn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function makeTurn(
  role: TurnRole,
  content: string,
  opts: { toolName?: string; distressLevel?: DistressSignal['level'] } = {}
): ConversationTurn {
  return {
    id: makeTurnId(),
    role,
    content,
    timestamp: new Date().toISOString(),
    estimatedTokens: estimateTokens(content),
    toolName: opts.toolName,
    distressLevel: opts.distressLevel,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── Derived ─────────────────────────────────────────────────────────────

      getMessages: () => {
        return get().turns.map((t) => ({ role: t.role, content: t.content }));
      },

      getClaudeContext: () => {
        const { conversationSummary, locale } = get();
        return {
          ...(conversationSummary ? { conversationSummary } : {}),
          locale,
        };
      },

      // ── Mutations ────────────────────────────────────────────────────────────

      addUserTurn: (content: string) => {
        const turn = makeTurn('user', content);
        set((state) => ({
          turns: [...state.turns, turn],
          totalTurnsCount: state.totalTurnsCount + 1,
        }));
        // Kick off pruning asynchronously if over limit
        if (get().turns.length > MAX_TURNS) {
          void get().pruneAndSummarise();
        }
        return turn.id;
      },

      addAssistantTurn: (
        content: string,
        opts: { toolName?: string; distressLevel?: DistressSignal['level'] } = {}
      ) => {
        const turn = makeTurn('assistant', content, opts);
        set((state) => ({
          turns: [...state.turns, turn],
          totalTurnsCount: state.totalTurnsCount + 1,
        }));
        if (get().turns.length > MAX_TURNS) {
          void get().pruneAndSummarise();
        }
        return turn.id;
      },

      recordDistress: (signal: DistressSignal) => {
        if (signal.level === 'none') return;
        set((state) => ({
          distressHistory: [
            { level: signal.level, timestamp: new Date().toISOString() },
            ...state.distressHistory,
          ].slice(0, 5), // keep last 5
        }));
      },

      setLocale: (locale: string) => set({ locale }),

      clearConversation: () =>
        set({
          ...INITIAL_STATE,
          // Preserve locale — user shouldn't have to re-select
          locale: get().locale,
          sessionStartedAt: new Date().toISOString(),
        }),

      // ── Summarisation ────────────────────────────────────────────────────────

      pruneAndSummarise: async () => {
        const state = get();

        // Guard: don't overlap requests; need a minimum batch worth compressing
        if (state.isSummarising) return;
        const batchSize = Math.min(PRUNE_BATCH, state.turns.length - MAX_TURNS + PRUNE_BATCH);
        if (batchSize < MIN_PRUNE_BATCH) return;

        set({ isSummarising: true });

        // Slice the oldest `batchSize` turns for summarisation
        const toSummarise = state.turns.slice(0, batchSize);
        const remaining  = state.turns.slice(batchSize);

        try {
          const messages = toSummarise.map((t) => ({ role: t.role, content: t.content }));

          const response = await fetch(`${AGENT_URL}/api/chat/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, locale: get().locale }),
            signal: AbortSignal.timeout(15_000),
          });

          if (!response.ok) {
            throw new Error(`Summarize HTTP ${response.status}`);
          }

          const { summary } = (await response.json()) as { summary: string };

          // Append new summary to any existing one (multi-round sessions)
          const existingSummary = get().conversationSummary;
          const combined = existingSummary
            ? `${existingSummary}\n\n${summary}`
            : summary;

          set({
            turns: remaining,
            conversationSummary: combined,
            isSummarising: false,
          });
        } catch (err) {
          // Summarisation failed — keep full turns, don't block the user
          console.warn('[ConversationStore] Summarisation failed, keeping full turns:', err);

          // Soft prune: if turns are way over limit, hard-drop the oldest ones
          // without a summary to prevent the context window from exploding
          if (state.turns.length > MAX_TURNS * 1.5) {
            set({
              turns: state.turns.slice(-MAX_TURNS),
              isSummarising: false,
            });
          } else {
            set({ isSummarising: false });
          }
        }
      },
    }),

    // ── Persist config ─────────────────────────────────────────────────────────
    {
      name: 'safehaven_conversation_v1',
      storage: secureStorage,
      // Only persist data fields — omit derived functions and in-flight flags
      partialize: (state) => ({
        turns: state.turns,
        conversationSummary: state.conversationSummary,
        distressHistory: state.distressHistory,
        totalTurnsCount: state.totalTurnsCount,
        sessionStartedAt: state.sessionStartedAt,
        locale: state.locale,
        // isSummarising is intentionally excluded — always starts false
      }),
    }
  )
);

// ─── Selector helpers ─────────────────────────────────────────────────────────

/** True if the last N turns include any distress signal */
export function selectRecentDistress(
  state: ConversationState,
  withinLastN = 2,
): DistressSignal['level'] {
  const recent = state.turns.slice(-withinLastN);
  for (const turn of recent.reverse()) {
    if (turn.distressLevel && turn.distressLevel !== 'none') {
      return turn.distressLevel;
    }
  }
  return 'none';
}

/** Total estimated token count of the current window */
export function selectWindowTokens(state: ConversationState): number {
  return state.turns.reduce((sum, t) => sum + t.estimatedTokens, 0);
}

/** True when the session has at least one complete exchange */
export function selectHasHistory(state: ConversationState): boolean {
  return state.turns.length >= 2;
}
