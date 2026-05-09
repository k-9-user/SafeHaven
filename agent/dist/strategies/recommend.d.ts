import type { RiskAssessment } from '../risk/profiler.js';
import { type StrategyGoal, type StrategyTemplate, type TimeHorizon } from './library.js';
import { type BridgePlan, type BridgeIntent } from './lifi.js';
export interface RecommendationInput {
    risk_profile: Pick<RiskAssessment, 'score' | 'tier' | 'maxStrategyRiskScore' | 'canUseDeFi'>;
    amount: number;
    savings?: number;
    goal: StrategyGoal;
    time_horizon: TimeHorizon;
    locale?: 'en' | 'fr' | 'es';
}
export interface StrategyRecommendation {
    strategyId: string;
    name: string;
    protocol: StrategyTemplate['protocol'];
    category: StrategyTemplate['category'];
    plainDescription: string;
    expectedApyRange: StrategyTemplate['expectedApyRange'];
    riskLevel: number;
    minAmountUSD: number;
    lockup: string;
    exitCost: string;
    allocationUSD: number;
    allocationPercent: number;
    matchScore: number;
    whyItFits: string;
    whatCanGoWrong: string[];
}
export interface StrategyRecommendationBundle {
    recommendations: StrategyRecommendation[];
    safetyCeiling: number;
    bridgePlan: BridgePlan | null;
}
export declare function recommendStrategies(input: RecommendationInput): StrategyRecommendation[];
export declare function buildDeFiPlan(input: RecommendationInput & Partial<BridgeIntent>): Promise<StrategyRecommendationBundle>;
//# sourceMappingURL=recommend.d.ts.map