export type StrategyRiskLevel = 1 | 2 | 3 | 4 | 5;
export type StrategyCategory = 'stablecoin_lending' | 'liquid_staking' | 'money_market';
export type StrategyGoal = 'emergency_fund' | 'daily_expenses' | 'future_purchase' | 'retirement';
export type TimeHorizon = 'under_3_months' | '3_12_months' | '1_3_years' | 'over_3_years';
export interface StrategyTemplate {
    id: string;
    name: string;
    protocol: 'kamino' | 'marginfi' | 'jito' | 'marinade';
    category: StrategyCategory;
    plainDescription: string;
    expectedApyRange: {
        min: number;
        max: number;
    };
    riskLevel: StrategyRiskLevel;
    minAmountUSD: number;
    lockup: string;
    lockupDays: number;
    exitCost: string;
    supportsGoals: StrategyGoal[];
    whatCanGoWrong: string[];
    isStablecoin: boolean;
    isLeveraged: boolean;
    auditLinks: string[];
    description: Record<'en' | 'fr' | 'es', string>;
}
export declare const SAFETY_CEILING = 0.05;
export declare const STRATEGY_LIBRARY: StrategyTemplate[];
export declare const CONSERVATIVE_STRATEGIES: StrategyTemplate[];
export declare function getStrategyById(strategyId: string): StrategyTemplate | undefined;
export declare function getStrategiesForRiskLevel(riskLevel: number): StrategyTemplate[];
//# sourceMappingURL=library.d.ts.map