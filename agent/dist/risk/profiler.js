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
// ─── Types ───────────────────────────────────────────────────────────────────
export const CapitalRange = z.enum([
    'under_50', // < $50
    '50_200', // $50–$200
    '200_1000', // $200–$1,000
    'over_1000', // > $1,000
]);
export const PrimaryGoal = z.enum([
    'emergency_fund', // Build safety net
    'daily_expenses', // Supplement income
    'future_purchase', // Save for specific goal
    'retirement', // Long-term wealth
]);
export const TimeHorizon = z.enum([
    'under_3_months', // Very short — needs liquidity
    '3_12_months', // Short
    '1_3_years', // Medium
    'over_3_years', // Long
]);
export const LossTolerance = z.enum([
    'none', // Cannot afford any loss
    'very_low', // Can handle 1–2% loss
    'low', // Can handle up to 5% loss
    'moderate', // Can handle up to 10% loss
]);
export const RiskProfileSchema = z.object({
    userId: z.string().optional(),
    availableCapital: CapitalRange,
    primaryGoal: PrimaryGoal,
    timeHorizon: TimeHorizon,
    lossTolerance: LossTolerance,
    hasEmergencyFund: z.boolean(),
    completedAt: z.date(),
});
// ─── Scoring Logic ────────────────────────────────────────────────────────────
/**
 * Compute a risk score from a completed risk profile.
 * All scoring is conservative by design — we err on the side of safety.
 */
export function computeRiskScore(profile) {
    let score = 1;
    // Capital: more capital available → slightly higher score allowed
    switch (profile.availableCapital) {
        case 'under_50':
            score += 0;
            break;
        case '50_200':
            score += 0.5;
            break;
        case '200_1000':
            score += 1;
            break;
        case 'over_1000':
            score += 1.5;
            break;
    }
    // Time horizon: longer → slightly more tolerance for illiquidity
    switch (profile.timeHorizon) {
        case 'under_3_months':
            score += 0;
            break;
        case '3_12_months':
            score += 0.25;
            break;
        case '1_3_years':
            score += 0.5;
            break;
        case 'over_3_years':
            score += 1;
            break;
    }
    // Loss tolerance: primary driver of risk score
    switch (profile.lossTolerance) {
        case 'none':
            score += 0;
            break;
        case 'very_low':
            score += 0.25;
            break;
        case 'low':
            score += 0.5;
            break;
        case 'moderate':
            score += 1;
            break;
    }
    // Emergency fund check: if no emergency fund, cap at conservative
    if (!profile.hasEmergencyFund) {
        score = Math.min(score, 1.5);
    }
    // Safety cap: v1 maximum is 3 (conservative-moderate)
    const finalScore = Math.min(Math.round(Math.max(score, 1)), 3);
    const tier = finalScore <= 2 ? 'conservative' : 'moderate';
    // Conservative users (score 1–2): only USDC lending strategies
    // Moderate users (score 3): same strategies, potentially higher allocation
    const recommendedStrategyIds = finalScore >= 1
        ? ['kamino-usdc-main', 'marginfi-usdc-main']
        : [];
    return {
        score: finalScore,
        tier,
        maxStrategyRiskScore: finalScore,
        canUseDeFi: finalScore >= 2 && profile.hasEmergencyFund,
        recommendedStrategyIds,
        explanation: {
            en: buildExplanation(finalScore, profile, 'en'),
            fr: buildExplanation(finalScore, profile, 'fr'),
            es: buildExplanation(finalScore, profile, 'es'),
        },
    };
}
function buildExplanation(score, profile, locale) {
    const noEmergencyFund = !profile.hasEmergencyFund;
    if (locale === 'fr') {
        if (noEmergencyFund) {
            return `Votre score de risque est ${score}/5. Avant d'investir, nous recommandons de constituer d'abord un fonds d'urgence (3 mois de dépenses). Commencez par économiser en USDC dans votre portefeuille.`;
        }
        return `Votre score de risque est ${score}/5. Nous vous recommandons des stratégies de prêt USDC conservatrices avec un rendement estimé de 4 à 8 % par an.`;
    }
    if (locale === 'es') {
        if (noEmergencyFund) {
            return `Tu puntuación de riesgo es ${score}/5. Antes de invertir, te recomendamos construir primero un fondo de emergencia (3 meses de gastos). Comienza ahorrando en USDC en tu billetera.`;
        }
        return `Tu puntuación de riesgo es ${score}/5. Te recomendamos estrategias conservadoras de préstamo de USDC con un rendimiento estimado del 4 al 8% anual.`;
    }
    // English default
    if (noEmergencyFund) {
        return `Your risk score is ${score}/5. Before investing, we recommend building an emergency fund first (3 months of expenses). Start by saving in USDC in your wallet.`;
    }
    return `Your risk score is ${score}/5. We recommend conservative USDC lending strategies with an estimated return of 4–8% per year.`;
}
// ─── Validation ───────────────────────────────────────────────────────────────
/**
 * Validate and parse a raw risk profile object (e.g., from Claude tool call).
 */
export function parseRiskProfile(raw) {
    const result = RiskProfileSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors.toString() };
    }
    const profile = result.data;
    const assessment = computeRiskScore(profile);
    return { profile, assessment };
}
/**
 * Check if a risk profile has all required fields.
 */
export function isProfileComplete(partial) {
    return (partial.availableCapital !== undefined &&
        partial.primaryGoal !== undefined &&
        partial.timeHorizon !== undefined &&
        partial.lossTolerance !== undefined &&
        partial.hasEmergencyFund !== undefined);
}
//# sourceMappingURL=profiler.js.map