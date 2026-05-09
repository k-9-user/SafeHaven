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
// ─── Schema definitions ───────────────────────────────────────────────────────
/** The 4 story-based quiz questions (mobile onboarding step 5) */
export const OnboardingQuizAnswerSchema = z.object({
    /** Market drop scenario: a=panic, b=wait, c=buy more */
    q1: z.enum(['a', 'b', 'c']),
    /** Found $200 scenario: a=emergency fund, b=spend+save, c=invest */
    q2: z.enum(['a', 'b', 'c']),
    /** Time horizon: a=<3mo, b=3-12mo, c=1-3yr */
    q3: z.enum(['a', 'b', 'c']),
    /** Emergency fund status: a=3m+, b=working on it, c=not yet */
    q4: z.enum(['a', 'b', 'c']),
}).partial(); // Partial — unanswered questions default to most conservative
/** Goals collected in onboarding step 3 */
export const UserGoalSchema = z.enum([
    'emergency_fund',
    'send_money_home',
    'save_for_goal',
    'grow_slowly',
]);
/** Wallet type chosen in onboarding step 6 */
export const WalletTypeSchema = z.enum(['mwa', 'starter']);
/** Full onboarding payload (POST /api/risk/profile) */
export const OnboardingProfilePayloadSchema = z.object({
    /** i18n locale selected by user */
    locale: z.string().default('en'),
    /** Goals selected in step 3 */
    goals: z.array(UserGoalSchema).min(1),
    /** Monthly capital in USD from step 4 */
    monthlyCapitalUSD: z.number().min(0).max(99999).default(0),
    /** Quiz answers from step 5 */
    riskAnswers: OnboardingQuizAnswerSchema.default({}),
    /** Client-computed risk score (server validates & may override) */
    riskScore: z.number().min(1).max(5).optional(),
    /** Wallet info from step 6 */
    walletType: WalletTypeSchema.optional(),
    publicKey: z.string().optional(),
    /** ISO timestamp of onboarding completion */
    completedAt: z.string().datetime(),
    /** Optional user ID (set after auth, may be absent for anonymous) */
    userId: z.string().uuid().optional(),
});
// ─── Weight tables (mirrors mobile riskScoring.ts) ────────────────────────────
const Q1_WEIGHTS = { a: 0, b: 1, c: 2 };
const Q2_WEIGHTS = { a: 0, b: 1, c: 2 };
const Q3_WEIGHTS = { a: 0, b: 1, c: 2 };
const Q4_WEIGHTS = { a: 2, b: 1, c: 0 };
function weightToRawScore(weight) {
    if (weight <= 1)
        return 1;
    if (weight <= 3)
        return 2;
    return 3;
}
// ─── Core scoring function ────────────────────────────────────────────────────
/**
 * Compute a validated risk assessment from an onboarding payload.
 *
 * Server-side scoring is the authoritative source — the client-submitted
 * `riskScore` is logged but never trusted directly.
 */
export function computeRiskAssessment(payload) {
    const { riskAnswers, monthlyCapitalUSD, goals, locale } = payload;
    const flags = [];
    // ── Step 1: Quiz weight sum ────────────────────────────────────────────────
    const w1 = Q1_WEIGHTS[riskAnswers.q1 ?? 'a'] ?? 0;
    const w2 = Q2_WEIGHTS[riskAnswers.q2 ?? 'a'] ?? 0;
    const w3 = Q3_WEIGHTS[riskAnswers.q3 ?? 'a'] ?? 0;
    const w4 = Q4_WEIGHTS[riskAnswers.q4 ?? 'c'] ?? 0;
    const totalWeight = w1 + w2 + w3 + w4;
    let score = weightToRawScore(totalWeight);
    // ── Step 2: Emergency fund cap ─────────────────────────────────────────────
    if (riskAnswers.q4 === 'c' || riskAnswers.q4 === undefined) {
        if (score > 1) {
            flags.push('no_emergency_fund');
            score = 1;
        }
    }
    else if (riskAnswers.q4 === 'b') {
        if (score > 2) {
            flags.push('emergency_fund_incomplete');
            score = 2;
        }
    }
    // ── Step 3: Capital cap ───────────────────────────────────────────────────
    // Very low capital (<$20) → cap at conservative regardless of quiz
    if (monthlyCapitalUSD < 20 && score > 2) {
        flags.push('low_capital');
        score = 2;
    }
    // ── Step 4: Goal alignment ─────────────────────────────────────────────────
    // Emergency fund as primary goal → always start at 1 (build fund first)
    if (goals.includes('emergency_fund') && !goals.includes('grow_slowly')) {
        if (score > 2) {
            flags.push('emergency_fund_goal_primary');
            score = 2;
        }
    }
    // ── Step 5: v1 hard cap (score 3 max) ─────────────────────────────────────
    const finalScore = Math.max(1, Math.min(score, 3));
    // ── Step 6: Derive tier and permissions ───────────────────────────────────
    const tier = finalScore === 1 ? 'ultra_conservative' :
        finalScore === 2 ? 'conservative' :
            'conservative_moderate';
    const canUseDeFi = finalScore >= 2 &&
        (riskAnswers.q4 === 'a' || riskAnswers.q4 === 'b') &&
        monthlyCapitalUSD >= 10;
    const recommendedStrategyIds = getRecommendedStrategies(finalScore, canUseDeFi);
    return {
        score: finalScore,
        tier,
        maxStrategyRiskScore: finalScore,
        canUseDeFi,
        recommendedStrategyIds,
        explanation: buildExplanations(finalScore, flags, locale),
        assessedAt: new Date().toISOString(),
        flags,
    };
}
// ─── Strategy recommendations ──────────────────────────────────────────────────
function getRecommendedStrategies(score, canUseDeFi) {
    if (!canUseDeFi) {
        return ['usdc-savings-basic']; // Simple USDC savings, no DeFi
    }
    if (score === 2) {
        return ['kamino-usdc-main', 'marginfi-usdc-main'];
    }
    // score === 3
    return ['kamino-usdc-main', 'marginfi-usdc-main', 'kamino-usdc-jlp'];
}
// ─── Multilingual explanations ────────────────────────────────────────────────
function buildExplanations(score, flags, _primaryLocale) {
    const noEmergencyFund = flags.includes('no_emergency_fund');
    const buildingFund = flags.includes('emergency_fund_incomplete');
    const templates = {
        en: {
            base: `Your risk score is ${score} out of 5.`,
            noEmergencyFund: " Before earning yield, we recommend saving 3 months of expenses as an emergency fund. We'll guide you to build it first.",
            buildingFund: " You're building your emergency fund — great! Once it's complete, you'll unlock more earning options.",
            score1: " We'll start with a simple USDC savings account — safe, liquid, and growing.",
            score2: " We'll recommend low-risk USDC lending earning 4–8% APY — accessible anytime.",
            score3: " We'll show you conservative USDC lending strategies with the best safety-adjusted yields.",
        },
        fr: {
            base: `Votre score de risque est ${score} sur 5.`,
            noEmergencyFund: " Avant de générer des rendements, nous recommandons d'épargner 3 mois de dépenses comme fonds d'urgence. Nous vous guiderons pour le constituer.",
            buildingFund: " Vous constituez votre fonds d'urgence — excellent ! Une fois terminé, vous débloquerez plus d'options.",
            score1: " Nous commencerons avec un simple compte d'épargne USDC — sûr, liquide et croissant.",
            score2: " Nous recommanderons des prêts USDC à faible risque avec 4–8% APY — accessible à tout moment.",
            score3: " Nous vous montrerons des stratégies conservatrices de prêt USDC avec les meilleurs rendements ajustés au risque.",
        },
        es: {
            base: `Tu puntuación de riesgo es ${score} de 5.`,
            noEmergencyFund: " Antes de generar rendimientos, recomendamos ahorrar 3 meses de gastos como fondo de emergencia. Te guiaremos para construirlo.",
            buildingFund: " Estás construyendo tu fondo de emergencia — ¡excelente! Una vez completo, desbloquearás más opciones.",
            score1: " Comenzaremos con una cuenta de ahorro USDC simple — segura, líquida y creciendo.",
            score2: " Recomendaremos préstamos USDC de bajo riesgo con 4–8% APY — accesibles en cualquier momento.",
            score3: " Te mostraremos estrategias conservadoras de préstamo USDC con los mejores rendimientos ajustados al riesgo.",
        },
    };
    const build = (t) => {
        let msg = t.base;
        if (noEmergencyFund)
            msg += t.noEmergencyFund;
        else if (buildingFund)
            msg += t.buildingFund;
        if (score === 1)
            msg += t.score1;
        else if (score === 2)
            msg += t.score2;
        else
            msg += t.score3;
        return msg;
    };
    return {
        en: build(templates.en),
        fr: build(templates.fr),
        es: build(templates.es),
    };
}
// ─── Payload validation ────────────────────────────────────────────────────────
/**
 * Parse and validate a raw request body for POST /api/risk/profile.
 * Returns { payload, assessment } on success, or { error } on failure.
 */
export function parseAndAssessProfile(raw) {
    const result = OnboardingProfilePayloadSchema.safeParse(raw);
    if (!result.success) {
        const issues = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('; ');
        return { error: `Validation failed: ${issues}` };
    }
    const payload = result.data;
    const assessment = computeRiskAssessment(payload);
    return { payload, assessment };
}
/**
 * Build a history entry from a parsed payload and assessment.
 * ID generation uses crypto.randomUUID() (Node.js 14.17+).
 */
export function buildHistoryEntry(payload, assessment, source = 'onboarding') {
    return {
        entryId: crypto.randomUUID(),
        userId: payload.userId,
        publicKey: payload.publicKey,
        payload,
        assessment,
        source,
        createdAt: new Date().toISOString(),
    };
}
//# sourceMappingURL=profile.js.map