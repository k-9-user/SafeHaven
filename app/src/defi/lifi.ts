/**
 * SafeHaven — Li.Fi Cross-Chain Bridge Integration
 *
 * Allows users to bring funds from EVM chains (Ethereum, Polygon, BSC, etc.)
 * into Solana USDC — without leaving the SafeHaven app.
 *
 * Flow:
 *   1. User selects source chain and token
 *   2. Li.Fi SDK finds optimal route (best rate, lowest fees)
 *   3. SafeHaven displays route details + disclaimer
 *   4. User confirms → signs in their wallet (MWA or EVM wallet)
 *   5. Li.Fi executes bridge + swap → user receives USDC on Solana
 *
 * Docs: https://docs.li.fi/introduction/solana-ecosystem
 *
 * SAFETY RULES:
 *   - Always show estimated fees and time before execution
 *   - Never auto-execute — require explicit user confirmation
 *   - Show slippage and price impact prominently
 *   - Default slippage: 0.5% (conservative for beginners)
 */

import axios from 'axios';

const LIFI_API_URL =
  process.env['EXPO_PUBLIC_LIFI_API_URL'] ?? 'https://li.quest/v1';

const INTEGRATOR = 'safehaven';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BridgeToken {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface BridgeRoute {
  id: string;
  fromChainId: number;
  fromToken: BridgeToken;
  fromAmount: string;        // Raw amount (with decimals)
  fromAmountUSD: string;
  toChainId: number;
  toToken: BridgeToken;
  toAmount: string;          // Estimated output (with decimals)
  toAmountMin: string;       // Minimum output (after slippage)
  toAmountUSD: string;
  gasCostUSD: string;
  feeCostUSD: string;
  estimatedDurationSeconds: number;
  tags: string[];            // e.g. ['RECOMMENDED', 'CHEAPEST', 'FASTEST']
  steps: BridgeStep[];
}

export interface BridgeStep {
  type: 'swap' | 'cross' | 'protocol';
  tool: string;              // Bridge/DEX name (e.g. 'Wormhole', 'Jupiter')
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: BridgeToken;
    toToken: BridgeToken;
    slippage: number;
  };
}

export interface GetRoutesParams {
  fromChainId: number;
  fromTokenAddress: string;
  fromAmount: string;        // Raw amount string
  toChainId: number;
  toTokenAddress: string;
  fromAddress: string;       // User's source wallet address
  toAddress: string;         // User's Solana address (destination)
  slippage?: number;         // Default: 0.005 (0.5%)
}

// Solana chain ID in Li.Fi
export const SOLANA_CHAIN_ID = 1151111081099710;

// USDC on Solana (native address)
export const SOLANA_USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// Common source chain IDs
export const CHAIN_IDS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BSC: 56,
  ARBITRUM: 42161,
  OPTIMISM: 10,
  AVALANCHE: 43114,
  SOLANA: SOLANA_CHAIN_ID,
} as const;

// ─── Route Discovery ──────────────────────────────────────────────────────────

/**
 * Fetch available bridge routes from Li.Fi.
 * Returns routes sorted by: recommended first, then cheapest.
 *
 * Conservative defaults for beginner users:
 *   - 0.5% slippage (not customizable in UI for novice tier)
 *   - Only shows routes with positive slippage tolerance (no MEV risk routes)
 */
export async function getBridgeRoutes(
  params: GetRoutesParams,
): Promise<BridgeRoute[]> {
  const {
    fromChainId,
    fromTokenAddress,
    fromAmount,
    toChainId,
    toTokenAddress,
    fromAddress,
    toAddress,
    slippage = 0.005, // 0.5% default — conservative
  } = params;

  const response = await axios.post<{ routes: BridgeRoute[] }>(
    `${LIFI_API_URL}/advanced/routes`,
    {
      fromChainId,
      fromTokenAddress,
      fromAmount,
      toChainId,
      toTokenAddress,
      fromAddress,
      toAddress,
      options: {
        slippage,
        integrator: INTEGRATOR,
        order: 'RECOMMENDED',
        maxPriceImpact: 0.05, // Block routes with >5% price impact
        allowSwitchChain: true,
      },
    },
    {
      timeout: 20_000,
      headers: {
        'x-lifi-integrator': INTEGRATOR,
      },
    },
  );

  return response.data.routes ?? [];
}

/**
 * Get the best recommended route for a bridge.
 * Returns null if no route is available.
 */
export async function getBestRoute(
  params: GetRoutesParams,
): Promise<BridgeRoute | null> {
  const routes = await getBridgeRoutes(params);
  return routes[0] ?? null;
}

// ─── Route Execution ──────────────────────────────────────────────────────────

/**
 * Get the transaction data for executing a Li.Fi route step.
 * Returns the unsigned transaction — user must sign via their wallet.
 *
 * NEVER auto-execute. This data must be presented to the user first.
 */
export async function getRouteTransactionData(
  route: BridgeRoute,
  stepIndex: number = 0,
): Promise<{
  to: string;
  data: string;
  value: string;
  chainId: number;
}> {
  const step = route.steps[stepIndex];
  if (!step) {
    throw new Error(`No step at index ${stepIndex} in route ${route.id}`);
  }

  const response = await axios.post(
    `${LIFI_API_URL}/advanced/stepTransaction`,
    {
      ...step,
      integrator: INTEGRATOR,
    },
    {
      timeout: 20_000,
      headers: {
        'x-lifi-integrator': INTEGRATOR,
      },
    },
  );

  return response.data.transactionRequest;
}

// ─── Status Tracking ──────────────────────────────────────────────────────────

export type BridgeStatus =
  | 'NOT_FOUND'
  | 'INVALID'
  | 'PENDING'
  | 'DONE'
  | 'FAILED';

export interface BridgeStatusResult {
  status: BridgeStatus;
  sending?: { txHash: string; chainId: number };
  receiving?: { txHash: string; chainId: number; amount: string };
  substatus?: string;
}

/**
 * Poll the status of a bridge transaction.
 * Call repeatedly (every 10–15 seconds) until status is DONE or FAILED.
 */
export async function getBridgeTxStatus(
  sendingTxHash: string,
  fromChainId: number,
  toChainId: number,
): Promise<BridgeStatusResult> {
  const response = await axios.get<BridgeStatusResult>(
    `${LIFI_API_URL}/status`,
    {
      params: {
        txHash: sendingTxHash,
        fromChain: fromChainId,
        toChain: toChainId,
        integrator: INTEGRATOR,
      },
      timeout: 10_000,
    },
  );

  return response.data;
}

// ─── Supported Chains ─────────────────────────────────────────────────────────

export interface SupportedChain {
  id: number;
  name: string;
  nativeToken: string;
  logoURI?: string;
}

/**
 * Fetch Li.Fi supported chains (filtered to chains relevant for our users).
 */
export async function getSupportedChains(): Promise<SupportedChain[]> {
  const response = await axios.get<{ chains: SupportedChain[] }>(
    `${LIFI_API_URL}/chains`,
    { timeout: 10_000 },
  );

  // Filter to chains most relevant for LATAM / Africa users
  const RELEVANT_CHAIN_IDS = new Set([
    CHAIN_IDS.ETHEREUM,
    CHAIN_IDS.POLYGON,
    CHAIN_IDS.BSC,
    CHAIN_IDS.ARBITRUM,
    CHAIN_IDS.SOLANA,
  ]);

  return response.data.chains.filter((c) => RELEVANT_CHAIN_IDS.has(c.id));
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

/**
 * Format a bridge route for display in the consent screen.
 * Returns human-readable strings — no raw numbers.
 */
export function formatRouteForDisplay(route: BridgeRoute): {
  fromSummary: string;
  toSummary: string;
  totalFee: string;
  estimatedTime: string;
  priceImpactWarning: string | null;
} {
  const fromAmount = parseFloat(route.fromAmountUSD).toFixed(2);
  const toAmount = parseFloat(route.toAmountUSD).toFixed(2);
  const totalFee = (
    parseFloat(route.gasCostUSD) + parseFloat(route.feeCostUSD)
  ).toFixed(2);
  const minutes = Math.ceil(route.estimatedDurationSeconds / 60);

  const priceImpact =
    ((parseFloat(route.fromAmountUSD) - parseFloat(route.toAmountUSD)) /
      parseFloat(route.fromAmountUSD)) *
    100;

  return {
    fromSummary: `${route.fromToken.symbol} on ${chainIdToName(route.fromChainId)} (~$${fromAmount})`,
    toSummary: `${route.toToken.symbol} on Solana (~$${toAmount})`,
    totalFee: `~$${totalFee} in fees`,
    estimatedTime: `~${minutes} minute${minutes !== 1 ? 's' : ''}`,
    priceImpactWarning:
      priceImpact > 1
        ? `Price impact: ${priceImpact.toFixed(1)}% — you will receive less than you send`
        : null,
  };
}

function chainIdToName(chainId: number): string {
  const MAP: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    56: 'BNB Chain',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    [SOLANA_CHAIN_ID]: 'Solana',
  };
  return MAP[chainId] ?? `Chain ${chainId}`;
}
