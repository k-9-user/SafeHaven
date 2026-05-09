/**
 * SafeHaven — Onboarding Risk Scoring
 *
 * Maps the 4 story-based quiz answers to a 1–5 risk score.
 * Each answer carries a weight (0–2). Total weight (0–8) maps to score 1–5.
 *
 * Score scale:
 *   1 = Ultra-conservative  (total weight 0–1)
 *   2 = Conservative        (total weight 2–3)
 *   3 = Conservative-moderate (total weight 4–5) ← v1 max
 *   4 = Moderate            (not served in v1)
 *   5 = Aggressive          (not served in v1)
 *
 * Emergency fund answer (q4) also acts as a hard cap:
 *   - "Not yet" (weight 0) → score capped at 1
 *   - "Working on it" (weight 1) → score capped at 2
 *   - "Yes, 3m+" (weight 2) → no cap applied (up to v1 max of 3)
 */

import type { RiskAnswers } from './useOnboardingStore';

// ─── Weight maps ──────────────────────────────────────────────────────────────

const Q1_WEIGHTS: Record<string, number> = { a: 0, b: 1, c: 2 };
const Q2_WEIGHTS: Record<string, number> = { a: 0, b: 1, c: 2 };
const Q3_WEIGHTS: Record<string, number> = { a: 0, b: 1, c: 2 };
const Q4_WEIGHTS: Record<string, number> = { a: 2, b: 1, c: 0 };

/** Maps total weight (0–8) to risk score (1–3 in v1) */
function weightToScore(weight: number): number {
  if (weight <= 1) return 1;
  if (weight <= 3) return 2;
  return 3; // v1 cap — 4 and 5 unlocked in future via learning modules
}

// ─── Main scoring function ────────────────────────────────────────────────────

/**
 * Compute risk score from the 4 onboarding quiz answers.
 * Always returns 1–3 (v1 cap enforced).
 * Defaults any unanswered question to the most conservative option (weight 0).
 */
export function computeOnboardingRiskScore(answers: RiskAnswers): number {
  const w1 = Q1_WEIGHTS[answers.q1 ?? 'a'] ?? 0;
  const w2 = Q2_WEIGHTS[answers.q2 ?? 'a'] ?? 0;
  const w3 = Q3_WEIGHTS[answers.q3 ?? 'a'] ?? 0;
  const w4 = Q4_WEIGHTS[answers.q4 ?? 'c'] ?? 0;

  const totalWeight = w1 + w2 + w3 + w4;
  const baseScore = weightToScore(totalWeight);

  // Emergency fund hard cap
  const q4Answer = answers.q4 ?? 'c';
  if (q4Answer === 'c') return Math.min(baseScore, 1); // No emergency fund → cap at 1
  if (q4Answer === 'b') return Math.min(baseScore, 2); // Building it → cap at 2
  return baseScore; // Has 3m+ emergency fund → no cap
}

// ─── Score metadata ───────────────────────────────────────────────────────────

export interface RiskScoreInfo {
  score: number;
  label: string;
  description: string;
  strategies: string[];
  cocoMessage: string;
  icon: string;
}

export function getRiskScoreInfo(score: number): RiskScoreInfo {
  switch (score) {
    case 1:
      return {
        score: 1,
        label: 'Safety First',
        description: "You prioritise protecting what you have. We'll focus on building your emergency fund and keeping your savings safe.",
        strategies: ['USDC savings', 'High-yield USDC account'],
        cocoMessage: "Great news — there's zero pressure to take risks! Keeping your savings safe is the smartest move right now. 🛡️",
        icon: '🛡️',
      };
    case 2:
      return {
        score: 2,
        label: 'Steady & Safe',
        description: "You're open to gentle growth while keeping your money accessible. We'll recommend low-risk USDC lending.",
        strategies: ['USDC lending — Kamino', 'USDC lending — MarginFi'],
        cocoMessage: "Solid choice! Low-risk USDC lending can earn 4–8% per year while keeping your money accessible. 💰",
        icon: '💰',
      };
    case 3:
    default:
      return {
        score: 3,
        label: 'Cautiously Growing',
        description: "You're ready to explore conservative DeFi opportunities. We'll show you the safest yield strategies.",
        strategies: ['USDC lending — Kamino', 'USDC lending — MarginFi', 'Conservative liquidity'],
        cocoMessage: "You're ready to grow! Conservative DeFi can earn more than a bank savings account — let's find the right strategy for you. 🌱",
        icon: '🌱',
      };
  }
}
