/**
 * SafeHaven — Conservative DeFi Strategy Templates
 *
 * Server-side strategy catalog (mirrors app/src/defi/strategies.ts).
 * The agent uses this to construct strategy recommendations.
 *
 * All strategies here are:
 *   - USDC-denominated (no volatile asset exposure)
 *   - Non-leveraged
 *   - From audited Solana protocols
 *   - Risk score <= 3
 *
 * APY data is fetched from live sources and cached.
 * APY is NEVER presented as guaranteed — always as a range estimate.
 */
export interface ConservativeStrategy {
    id: string;
    protocol: 'kamino' | 'marginfi';
    name: string;
    riskScore: number;
    minDepositUSDC: number;
    apyRangeIndicative: {
        min: number;
        max: number;
    };
    programId: string;
    vaultAddress: string;
    auditLinks: string[];
    description: {
        en: string;
        fr: string;
        es: string;
    };
    risks: {
        en: string[];
        fr: string[];
        es: string[];
    };
    disclosure: {
        en: string;
        fr: string;
        es: string;
    };
}
export declare const CONSERVATIVE_STRATEGIES: ConservativeStrategy[];
/**
 * Fetch current APY for a strategy from the protocol's API.
 * Returns cached value if fresh; fetches live otherwise.
 */
export declare function fetchStrategyApy(strategyId: string): Promise<number>;
/**
 * Get current APY snapshot for all strategies.
 * Used by GET /api/yields endpoint.
 */
export declare function getAllYields(): Promise<Record<string, {
    apy: number;
    timestamp: string;
}>>;
//# sourceMappingURL=conservative.d.ts.map