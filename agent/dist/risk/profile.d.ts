/**
 * SafeHaven Agent — Risk Profile
 *
 * Canonical server-side risk profile type and scoring logic.
 * Consumed by:
 *   - POST /api/risk/profile  (receives onboarding data from mobile app)
 *   - Strategy filtering      (determines which strategies a user can access)
 *   - AI coaching context     (Claude uses this to personalise responses)
 *   - Compliance logging      (audit trail for all risk assessments)
 *
 * Design principles:
 *   1. CONSERVATIVE BY DEFAULT — when in doubt, assign the lower score.
 *   2. TRANSPARENT — every score includes a human-readable explanation.
 *   3. REVERSIBLE — users can retake the quiz; we keep history (not replace).
 *   4. CAPPED — v1 serves only scores 1–3; 4–5 unlock via learning milestones.
 *
 * Risk Score Scale:
 *   1 = Ultra-conservative  → USDC savings only, no DeFi
 *   2 = Conservative        → USDC lending (Kamino / MarginFi)
 *   3 = Conservative-moderate → USDC lending + conservative liquidity
 *   4 = Moderate            → Not served in v1 (future roadmap)
 *   5 = Aggressive          → Not served in SafeHaven (out of scope)
 */
import { z } from 'zod';
/** The 4 story-based quiz questions (mobile onboarding step 5) */
export declare const OnboardingQuizAnswerSchema: z.ZodObject<{
    q1: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
    q2: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
    q3: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
    q4: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
}, "strip", z.ZodTypeAny, {
    q1?: "a" | "b" | "c" | undefined;
    q2?: "a" | "b" | "c" | undefined;
    q3?: "a" | "b" | "c" | undefined;
    q4?: "a" | "b" | "c" | undefined;
}, {
    q1?: "a" | "b" | "c" | undefined;
    q2?: "a" | "b" | "c" | undefined;
    q3?: "a" | "b" | "c" | undefined;
    q4?: "a" | "b" | "c" | undefined;
}>;
export type OnboardingQuizAnswers = z.infer<typeof OnboardingQuizAnswerSchema>;
/** Goals collected in onboarding step 3 */
export declare const UserGoalSchema: z.ZodEnum<["emergency_fund", "send_money_home", "save_for_goal", "grow_slowly"]>;
export type UserGoal = z.infer<typeof UserGoalSchema>;
/** Wallet type chosen in onboarding step 6 */
export declare const WalletTypeSchema: z.ZodEnum<["mwa", "starter"]>;
export type WalletType = z.infer<typeof WalletTypeSchema>;
/** Full onboarding payload (POST /api/risk/profile) */
export declare const OnboardingProfilePayloadSchema: z.ZodObject<{
    /** i18n locale selected by user */
    locale: z.ZodDefault<z.ZodString>;
    /** Goals selected in step 3 */
    goals: z.ZodArray<z.ZodEnum<["emergency_fund", "send_money_home", "save_for_goal", "grow_slowly"]>, "many">;
    /** Monthly capital in USD from step 4 */
    monthlyCapitalUSD: z.ZodDefault<z.ZodNumber>;
    /** Quiz answers from step 5 */
    riskAnswers: z.ZodDefault<z.ZodObject<{
        q1: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
        q2: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
        q3: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
        q4: z.ZodOptional<z.ZodEnum<["a", "b", "c"]>>;
    }, "strip", z.ZodTypeAny, {
        q1?: "a" | "b" | "c" | undefined;
        q2?: "a" | "b" | "c" | undefined;
        q3?: "a" | "b" | "c" | undefined;
        q4?: "a" | "b" | "c" | undefined;
    }, {
        q1?: "a" | "b" | "c" | undefined;
        q2?: "a" | "b" | "c" | undefined;
        q3?: "a" | "b" | "c" | undefined;
        q4?: "a" | "b" | "c" | undefined;
    }>>;
    /** Client-computed risk score (server validates & may override) */
    riskScore: z.ZodOptional<z.ZodNumber>;
    /** Wallet info from step 6 */
    walletType: z.ZodOptional<z.ZodEnum<["mwa", "starter"]>>;
    publicKey: z.ZodOptional<z.ZodString>;
    /** ISO timestamp of onboarding completion */
    completedAt: z.ZodString;
    /** Optional user ID (set after auth, may be absent for anonymous) */
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    locale: string;
    goals: ("emergency_fund" | "send_money_home" | "save_for_goal" | "grow_slowly")[];
    monthlyCapitalUSD: number;
    completedAt: string;
    riskAnswers: {
        q1?: "a" | "b" | "c" | undefined;
        q2?: "a" | "b" | "c" | undefined;
        q3?: "a" | "b" | "c" | undefined;
        q4?: "a" | "b" | "c" | undefined;
    };
    riskScore?: number | undefined;
    walletType?: "starter" | "mwa" | undefined;
    userId?: string | undefined;
    publicKey?: string | undefined;
}, {
    goals: ("emergency_fund" | "send_money_home" | "save_for_goal" | "grow_slowly")[];
    completedAt: string;
    locale?: string | undefined;
    riskScore?: number | undefined;
    monthlyCapitalUSD?: number | undefined;
    walletType?: "starter" | "mwa" | undefined;
    userId?: string | undefined;
    riskAnswers?: {
        q1?: "a" | "b" | "c" | undefined;
        q2?: "a" | "b" | "c" | undefined;
        q3?: "a" | "b" | "c" | undefined;
        q4?: "a" | "b" | "c" | undefined;
    } | undefined;
    publicKey?: string | undefined;
}>;
export type OnboardingProfilePayload = z.infer<typeof OnboardingProfilePayloadSchema>;
export type RiskTier = 'ultra_conservative' | 'conservative' | 'conservative_moderate';
export interface RiskAssessment {
    /** Validated score 1–3 (server cap enforced regardless of client value) */
    score: number;
    tier: RiskTier;
    /** Maximum strategy riskScore accessible to this user */
    maxStrategyRiskScore: number;
    /** Whether the user qualifies for any DeFi strategies */
    canUseDeFi: boolean;
    /** Strategy IDs recommended based on profile */
    recommendedStrategyIds: string[];
    /** Human-readable explanation (en / fr / es) */
    explanation: Record<string, string>;
    /** ISO timestamp of this assessment */
    assessedAt: string;
    /** Flags that led to score reduction (for audit + user transparency) */
    flags: string[];
}
/**
 * Compute a validated risk assessment from an onboarding payload.
 *
 * Server-side scoring is the authoritative source — the client-submitted
 * `riskScore` is logged but never trusted directly.
 */
export declare function computeRiskAssessment(payload: OnboardingProfilePayload): RiskAssessment;
/**
 * Parse and validate a raw request body for POST /api/risk/profile.
 * Returns { payload, assessment } on success, or { error } on failure.
 */
export declare function parseAndAssessProfile(raw: unknown): {
    payload: OnboardingProfilePayload;
    assessment: RiskAssessment;
} | {
    error: string;
};
/**
 * A single entry in a user's risk profile history.
 * Multiple assessments accumulate — we never delete old ones.
 */
export interface RiskProfileHistoryEntry {
    entryId: string;
    userId?: string;
    publicKey?: string;
    payload: OnboardingProfilePayload;
    assessment: RiskAssessment;
    source: 'onboarding' | 'retake' | 'admin_override';
    createdAt: string;
}
/**
 * Build a history entry from a parsed payload and assessment.
 * ID generation uses crypto.randomUUID() (Node.js 14.17+).
 */
export declare function buildHistoryEntry(payload: OnboardingProfilePayload, assessment: RiskAssessment, source?: RiskProfileHistoryEntry['source']): RiskProfileHistoryEntry;
//# sourceMappingURL=profile.d.ts.map