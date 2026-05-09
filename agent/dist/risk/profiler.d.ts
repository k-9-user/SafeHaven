/**
 * SafeHaven — Risk Profiler
 *
 * Builds a user's risk profile through conversational data collection.
 * The profile determines which DeFi strategies the user is shown.
 *
 * Risk Score Scale (1–5):
 *   1 = Ultra-conservative (USDC savings only, no DeFi)
 *   2 = Conservative (USDC lending — Kamino / MarginFi)
 *   3 = Conservative-moderate (USDC lending + minor diversification)
 *   4 = Moderate (not yet unlocked in SafeHaven v1)
 *   5 = Aggressive (not available — SafeHaven does not serve this)
 *
 * For v1: ALL users are capped at score 3. Higher scores unlock in future versions
 * after they complete the advanced learning modules.
 */
import { z } from 'zod';
export declare const CapitalRange: z.ZodEnum<["under_50", "50_200", "200_1000", "over_1000"]>;
export declare const PrimaryGoal: z.ZodEnum<["emergency_fund", "daily_expenses", "future_purchase", "retirement"]>;
export declare const TimeHorizon: z.ZodEnum<["under_3_months", "3_12_months", "1_3_years", "over_3_years"]>;
export declare const LossTolerance: z.ZodEnum<["none", "very_low", "low", "moderate"]>;
export declare const RiskProfileSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    availableCapital: z.ZodEnum<["under_50", "50_200", "200_1000", "over_1000"]>;
    primaryGoal: z.ZodEnum<["emergency_fund", "daily_expenses", "future_purchase", "retirement"]>;
    timeHorizon: z.ZodEnum<["under_3_months", "3_12_months", "1_3_years", "over_3_years"]>;
    lossTolerance: z.ZodEnum<["none", "very_low", "low", "moderate"]>;
    hasEmergencyFund: z.ZodBoolean;
    completedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    availableCapital: "under_50" | "50_200" | "200_1000" | "over_1000";
    primaryGoal: "emergency_fund" | "daily_expenses" | "future_purchase" | "retirement";
    timeHorizon: "under_3_months" | "3_12_months" | "1_3_years" | "over_3_years";
    lossTolerance: "none" | "very_low" | "low" | "moderate";
    hasEmergencyFund: boolean;
    completedAt: Date;
    userId?: string | undefined;
}, {
    availableCapital: "under_50" | "50_200" | "200_1000" | "over_1000";
    primaryGoal: "emergency_fund" | "daily_expenses" | "future_purchase" | "retirement";
    timeHorizon: "under_3_months" | "3_12_months" | "1_3_years" | "over_3_years";
    lossTolerance: "none" | "very_low" | "low" | "moderate";
    hasEmergencyFund: boolean;
    completedAt: Date;
    userId?: string | undefined;
}>;
export type RiskProfile = z.infer<typeof RiskProfileSchema>;
export type RiskTier = 'conservative' | 'moderate' | 'aggressive';
export interface RiskAssessment {
    score: number;
    tier: RiskTier;
    maxStrategyRiskScore: number;
    canUseDeFi: boolean;
    recommendedStrategyIds: string[];
    explanation: Record<string, string>;
}
/**
 * Compute a risk score from a completed risk profile.
 * All scoring is conservative by design — we err on the side of safety.
 */
export declare function computeRiskScore(profile: RiskProfile): RiskAssessment;
/**
 * Validate and parse a raw risk profile object (e.g., from Claude tool call).
 */
export declare function parseRiskProfile(raw: unknown): {
    profile: RiskProfile;
    assessment: RiskAssessment;
} | {
    error: string;
};
/**
 * Check if a risk profile has all required fields.
 */
export declare function isProfileComplete(partial: Partial<RiskProfile>): boolean;
//# sourceMappingURL=profiler.d.ts.map