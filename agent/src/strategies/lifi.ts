import axios from 'axios';

export const LIFI_API_URL = process.env['EXPO_PUBLIC_LIFI_API_URL'] ?? 'https://li.quest/v1';
export const SOLANA_CHAIN_ID = 1151111081099710;

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

function readUsd(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readDurationSeconds(route: any): number {
  const seconds = Number(route?.estimate?.duration ?? route?.estimatedDurationSeconds ?? 0);
  return Number.isFinite(seconds) ? seconds : 0;
}

export async function getBestSolanaBridgeRoute(intent: BridgeIntent): Promise<any | null> {
  try {
    const response = await axios.post(
      `${LIFI_API_URL}/advanced/routes`,
      {
        fromChainId: intent.sourceChainId,
        fromTokenAddress: intent.sourceTokenAddress,
        fromAmount: intent.sourceAmountRaw,
        toChainId: SOLANA_CHAIN_ID,
        toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        fromAddress: intent.sourceWalletAddress,
        toAddress: intent.destinationWalletAddress,
        options: {
          slippage: 0.005,
          integrator: 'safehaven',
          order: 'RECOMMENDED',
          maxPriceImpact: 0.05,
          allowSwitchChain: true,
        },
      },
      {
        timeout: 20_000,
        headers: {
          'x-lifi-integrator': 'safehaven',
        },
      },
    );

    return response.data?.routes?.[0] ?? null;
  } catch (error) {
    console.error('[LiFi] Bridge route lookup failed:', error);
    return null;
  }
}

export async function createSolanaBridgePlan(intent: BridgeIntent): Promise<BridgePlan | null> {
  const route = await getBestSolanaBridgeRoute(intent);
  if (!route) {
    return null;
  }

  const steps = Array.isArray(route.steps)
    ? route.steps.map((step: any, index: number) => {
        const name = step?.tool || step?.action?.tool || `Step ${index + 1}`;
        const type = step?.type || 'bridge';
        return `${index + 1}. ${type.toUpperCase()} via ${name}`;
      })
    : [];

  return {
    sourceChainId: intent.sourceChainId,
    destinationChainId: SOLANA_CHAIN_ID,
    sourceTokenSymbol: intent.sourceTokenSymbol ?? 'Unknown',
    destinationTokenSymbol: 'USDC',
    routeName: route.tags?.[0] ?? route.tool ?? 'Recommended route',
    estimatedFeeUSD: readUsd(route?.feeCostUSD) + readUsd(route?.gasCostUSD),
    estimatedTimeMinutes: Math.max(1, Math.ceil(readDurationSeconds(route) / 60)),
    steps,
    routeUrl: route?.url,
    rawRoute: route,
  };
}
