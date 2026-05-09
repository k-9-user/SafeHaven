import { SAFETY_CEILING, getStrategiesForRiskLevel } from './library.js';
import { createSolanaBridgePlan } from './lifi.js';
const GOAL_STRENGTH = {
    emergency_fund: {
        money_market: 30,
        liquid_staking: -25,
    },
    daily_expenses: {
        money_market: 26,
        liquid_staking: -20,
    },
    future_purchase: {
        money_market: 12,
        liquid_staking: 10,
    },
    retirement: {
        money_market: 10,
        liquid_staking: 18,
    },
};
const HORIZON_BONUS = {
    under_3_months: {
        money_market: 18,
        liquid_staking: -35,
    },
    '3_12_months': {
        money_market: 14,
        liquid_staking: -8,
    },
    '1_3_years': {
        money_market: 10,
        liquid_staking: 8,
    },
    'over_3_years': {
        money_market: 6,
        liquid_staking: 20,
    },
};
function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}
function buildWhyItFits(strategy, input) {
    if (strategy.isStablecoin) {
        if (input.goal === 'emergency_fund')
            return 'It keeps the money in USDC, which is better for short-term safety.';
        if (input.goal === 'daily_expenses')
            return 'It gives a simple yield on stablecoins without adding token price swings.';
        return 'It matches a conservative profile that wants yield with low day-to-day volatility.';
    }
    if (input.time_horizon === 'over_3_years') {
        return 'The long time horizon gives liquid staking more room to earn rewards despite SOL volatility.';
    }
    return 'This can fit a user who wants some SOL exposure and is comfortable with more movement in value.';
}
function scoreStrategy(strategy, input) {
    const savings = Math.max(0, input.savings ?? input.amount);
    const riskScore = input.risk_profile.score;
    const targetRisk = Math.max(1, Math.min(5, riskScore));
    let score = 0;
    if (!input.risk_profile.canUseDeFi && !strategy.isStablecoin) {
        return -1_000;
    }
    if (riskScore <= 3 && !strategy.isStablecoin) {
        return -1_000;
    }
    if (strategy.riskLevel > Math.max(targetRisk, input.risk_profile.maxStrategyRiskScore ?? targetRisk)) {
        return -1_000;
    }
    score += 40 - Math.abs(strategy.riskLevel - targetRisk) * 8;
    score += GOAL_STRENGTH[input.goal][strategy.category] ?? 0;
    score += HORIZON_BONUS[input.time_horizon][strategy.category] ?? 0;
    if (savings < strategy.minAmountUSD) {
        score -= 60;
    }
    else {
        score += Math.min(10, savings / 100);
    }
    if (strategy.isStablecoin && targetRisk <= 2) {
        score += 18;
    }
    if (!strategy.isStablecoin && targetRisk >= 4) {
        score += 14;
    }
    if (strategy.lockupDays > 0 && input.time_horizon === 'under_3_months') {
        score -= 30;
    }
    return score;
}
function allocateRecommendations(recommendations, savings, riskScore) {
    if (recommendations.length === 0 || savings <= 0) {
        return recommendations.map((recommendation) => ({ ...recommendation, allocationUSD: 0, allocationPercent: 0 }));
    }
    const scored = recommendations.map((recommendation) => ({
        recommendation,
        weight: Math.max(0, recommendation.matchScore),
    }));
    const nonStablecoinTotalWeight = scored
        .filter(({ recommendation }) => recommendation.category !== 'money_market')
        .reduce((sum, item) => sum + item.weight, 0);
    if (riskScore <= 2) {
        const cappedNonStablecoinUSD = nonStablecoinTotalWeight > 0 ? Math.min(savings * SAFETY_CEILING, savings) : 0;
        const stablecoinUSD = nonStablecoinTotalWeight > 0 ? savings - cappedNonStablecoinUSD : savings;
        const stablecoinWeight = scored
            .filter(({ recommendation }) => recommendation.category === 'money_market')
            .reduce((sum, item) => sum + item.weight, 0);
        const totalStablecoinWeight = stablecoinWeight > 0 ? stablecoinWeight : 1;
        return recommendations.map((recommendation) => {
            if (recommendation.category !== 'money_market') {
                return {
                    ...recommendation,
                    allocationUSD: 0,
                    allocationPercent: 0,
                };
            }
            const matchingScore = scored.find((item) => item.recommendation.strategyId === recommendation.strategyId)?.weight ?? 0;
            const fraction = matchingScore > 0 ? matchingScore / totalStablecoinWeight : 1 / recommendations.length;
            const allocationUSD = roundToTwo(stablecoinUSD * fraction);
            return {
                ...recommendation,
                allocationUSD,
                allocationPercent: roundToTwo((allocationUSD / savings) * 100),
            };
        });
    }
    const totalWeight = scored.reduce((sum, recommendation) => sum + recommendation.weight, 0) || recommendations.length;
    if (nonStablecoinTotalWeight > 0) {
        return recommendations.map((recommendation) => {
            const fraction = (recommendation.matchScore > 0 ? recommendation.matchScore : 1) / totalWeight;
            const allocationUSD = roundToTwo(savings * fraction);
            return {
                ...recommendation,
                allocationUSD,
                allocationPercent: roundToTwo((allocationUSD / savings) * 100),
            };
        });
    }
    return recommendations.map((recommendation) => ({
        ...recommendation,
        allocationUSD: roundToTwo(savings / recommendations.length),
        allocationPercent: roundToTwo(100 / recommendations.length),
    }));
}
export function recommendStrategies(input) {
    const savings = Math.max(0, input.savings ?? input.amount);
    const candidates = getStrategiesForRiskLevel(input.risk_profile.score)
        .filter((strategy) => strategy.isLeveraged === false)
        .map((strategy) => ({
        strategy,
        matchScore: scoreStrategy(strategy, input),
    }))
        .filter(({ matchScore }) => matchScore > -1_000)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);
    const recommendations = candidates.map(({ strategy, matchScore }) => ({
        strategyId: strategy.id,
        name: strategy.name,
        protocol: strategy.protocol,
        category: strategy.category,
        plainDescription: strategy.plainDescription,
        expectedApyRange: strategy.expectedApyRange,
        riskLevel: strategy.riskLevel,
        minAmountUSD: strategy.minAmountUSD,
        lockup: strategy.lockup,
        exitCost: strategy.exitCost,
        matchScore,
        whyItFits: buildWhyItFits(strategy, input),
        whatCanGoWrong: strategy.whatCanGoWrong,
        allocationUSD: 0,
        allocationPercent: 0,
    }));
    return allocateRecommendations(recommendations, savings, input.risk_profile.score);
}
export async function buildDeFiPlan(input) {
    const recommendations = recommendStrategies(input);
    const hasBridgeIntent = typeof input.sourceChainId === 'number' &&
        typeof input.sourceTokenAddress === 'string' &&
        typeof input.sourceAmountRaw === 'string' &&
        typeof input.sourceWalletAddress === 'string' &&
        typeof input.destinationWalletAddress === 'string';
    const bridgePlan = hasBridgeIntent && input.sourceChainId !== 1151111081099710
        ? await createSolanaBridgePlan({
            sourceChainId: input.sourceChainId,
            sourceTokenAddress: input.sourceTokenAddress,
            sourceAmountRaw: input.sourceAmountRaw,
            sourceWalletAddress: input.sourceWalletAddress,
            destinationWalletAddress: input.destinationWalletAddress,
            sourceTokenSymbol: input.sourceTokenSymbol,
        })
        : null;
    return {
        recommendations,
        safetyCeiling: SAFETY_CEILING,
        bridgePlan,
    };
}
//# sourceMappingURL=recommend.js.map