import { describe, expect, it } from '@jest/globals';
import { SAFETY_CEILING } from './library.js';
import { recommendStrategies } from './recommend.js';
describe('recommendStrategies', () => {
    it('returns only USDC lending for low-risk users', () => {
        const recommendations = recommendStrategies({
            risk_profile: {
                score: 1,
                tier: 'conservative',
                maxStrategyRiskScore: 1,
                canUseDeFi: true,
            },
            amount: 1000,
            savings: 1000,
            goal: 'emergency_fund',
            time_horizon: 'under_3_months',
        });
        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.every((recommendation) => recommendation.category === 'money_market')).toBe(true);
        expect(recommendations.every((recommendation) => recommendation.name.includes('USDC'))).toBe(true);
        expect(recommendations.reduce((sum, recommendation) => sum + recommendation.allocationUSD, 0)).toBeCloseTo(1000, 1);
        expect(recommendations.every((recommendation) => recommendation.allocationUSD <= 1000 * SAFETY_CEILING || recommendation.category === 'money_market')).toBe(true);
    });
    it('shows liquid staking for high-risk users', () => {
        const recommendations = recommendStrategies({
            risk_profile: {
                score: 5,
                tier: 'aggressive',
                maxStrategyRiskScore: 5,
                canUseDeFi: true,
            },
            amount: 1000,
            savings: 1000,
            goal: 'retirement',
            time_horizon: 'over_3_years',
        });
        expect(recommendations.some((recommendation) => recommendation.category === 'liquid_staking')).toBe(true);
        expect(recommendations.some((recommendation) => recommendation.name.toLowerCase().includes('jito') || recommendation.name.toLowerCase().includes('msol'))).toBe(true);
    });
    it('never recommends leveraged products', () => {
        const lowRisk = recommendStrategies({
            risk_profile: {
                score: 2,
                tier: 'conservative',
                maxStrategyRiskScore: 2,
                canUseDeFi: true,
            },
            amount: 500,
            savings: 500,
            goal: 'daily_expenses',
            time_horizon: '3_12_months',
        });
        const highRisk = recommendStrategies({
            risk_profile: {
                score: 5,
                tier: 'aggressive',
                maxStrategyRiskScore: 5,
                canUseDeFi: true,
            },
            amount: 500,
            savings: 500,
            goal: 'retirement',
            time_horizon: 'over_3_years',
        });
        expect(lowRisk.every((recommendation) => !recommendation.name.toLowerCase().includes('leverage'))).toBe(true);
        expect(highRisk.every((recommendation) => !recommendation.name.toLowerCase().includes('leverage'))).toBe(true);
    });
});
//# sourceMappingURL=recommend.test.js.map