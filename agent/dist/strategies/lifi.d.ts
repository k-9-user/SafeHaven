export declare const LIFI_API_URL: string;
export declare const SOLANA_CHAIN_ID = 1151111081099710;
export interface BridgeIntent {
    sourceChainId: number;
    sourceTokenAddress: string;
    sourceTokenSymbol?: string;
    sourceAmountRaw: string;
    sourceWalletAddress: string;
    destinationWalletAddress: string;
}
export interface BridgePlan {
    sourceChainId: number;
    destinationChainId: number;
    sourceTokenSymbol: string;
    destinationTokenSymbol: string;
    routeName: string;
    estimatedFeeUSD: number;
    estimatedTimeMinutes: number;
    steps: string[];
    routeUrl?: string;
    rawRoute?: unknown;
}
export declare function getBestSolanaBridgeRoute(intent: BridgeIntent): Promise<any | null>;
export declare function createSolanaBridgePlan(intent: BridgeIntent): Promise<BridgePlan | null>;
//# sourceMappingURL=lifi.d.ts.map