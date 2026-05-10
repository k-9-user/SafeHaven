import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { USDC_MINT } from '@/lib/jupiterSwap';

export const LIFI_SOLANA_CHAIN_ID = '1151111081099710';
export const LIFI_NATIVE_SOL = '11111111111111111111111111111111';
const LIFI_API_BASE = 'https://li.quest/v1';

const toLamports = (amountSol) => Math.floor(Number(amountSol || 0) * LAMPORTS_PER_SOL);

export async function getLifiSolanaUsdcQuote({
  walletAddress,
  amountSol,
  slippage = 0.005,
  order = 'CHEAPEST',
}) {
  const amountLamports = toLamports(amountSol);

  if (!walletAddress) {
    throw new Error('Connect a wallet before requesting a LI.FI route');
  }

  if (!amountLamports || amountLamports <= 0) {
    throw new Error('Enter a valid SOL amount');
  }

  const url = new URL(`${LIFI_API_BASE}/quote`);
  url.searchParams.set('fromChain', LIFI_SOLANA_CHAIN_ID);
  url.searchParams.set('toChain', LIFI_SOLANA_CHAIN_ID);
  url.searchParams.set('fromToken', LIFI_NATIVE_SOL);
  url.searchParams.set('toToken', USDC_MINT);
  url.searchParams.set('fromAmount', String(amountLamports));
  url.searchParams.set('fromAddress', walletAddress);
  url.searchParams.set('toAddress', walletAddress);
  url.searchParams.set('slippage', String(slippage));
  url.searchParams.set('order', order);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`LI.FI route failed (${response.status})`);
  }

  const quote = await response.json();
  const estimate = quote?.estimate || {};
  const tool = estimate.tool || quote?.tool || 'LI.FI';
  const toAmount = Number(estimate.toAmount || 0) / 1_000_000;
  const toAmountMin = Number(estimate.toAmountMin || 0) / 1_000_000;

  return {
    tool,
    toAmount,
    toAmountMin,
    executionDuration: estimate.executionDuration,
    includedSteps: quote?.includedSteps?.map((step) => step.toolDetails?.name || step.tool).filter(Boolean) || [],
    raw: quote,
  };
}
