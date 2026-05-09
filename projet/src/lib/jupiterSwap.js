import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js';

export const SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5Au57o4qveRsqdmQsmPhA2CvwwShdNsFCAkAB';
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const MAINNET_RPC_URL = 'https://api.mainnet-beta.solana.com';

const toLamports = (amountSol) => Math.floor(Number(amountSol || 0) * LAMPORTS_PER_SOL);

const decodeBase64Transaction = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return Transaction.from(bytes);
};

export const quoteJupiterSwap = async ({
  amountSol,
  slippageBps = 50,
  inputMint = SOL_MINT,
  outputMint = USDC_MINT,
}) => {
  const amountLamports = toLamports(amountSol);

  if (!amountLamports || amountLamports <= 0) {
    throw new Error('Enter a valid SOL amount');
  }

  const url = new URL(`${JUPITER_QUOTE_API}/quote`);
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', String(amountLamports));
  url.searchParams.set('slippageBps', String(slippageBps));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Jupiter quote failed (${response.status})`);
  }

  const data = await response.json();
  if (!data?.routePlan?.length) {
    throw new Error('No swap route found for this amount');
  }

  return data;
};

export const executeJupiterSwap = async ({
  walletAddress,
  amountSol,
  slippageBps = 50,
  inputMint = SOL_MINT,
  outputMint = USDC_MINT,
}) => {
  const solanaProvider = typeof window !== 'undefined' ? /** @type {any} */ (window).solana : undefined;

  if (!solanaProvider) {
    throw new Error('Connect a Phantom-compatible wallet first');
  }

  if (!walletAddress) {
    throw new Error('Missing wallet address');
  }

  const quoteResponse = await quoteJupiterSwap({ amountSol, slippageBps, inputMint, outputMint });
  const connection = new Connection(MAINNET_RPC_URL, 'confirmed');

  const swapResponse = await fetch(`${JUPITER_QUOTE_API}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey: walletAddress,
      wrapAndUnwrapSol: true,
      asLegacyTransaction: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });

  if (!swapResponse.ok) {
    throw new Error(`Jupiter swap failed (${swapResponse.status})`);
  }

  const swapData = await swapResponse.json();
  if (!swapData?.swapTransaction) {
    throw new Error('Jupiter did not return a swap transaction');
  }

  const transaction = decodeBase64Transaction(swapData.swapTransaction);
  const signedTransaction = await solanaProvider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });

  await connection.confirmTransaction(signature, 'confirmed');

  return {
    signature,
    estimatedInputSol: Number(amountSol),
    estimatedOutputUsdc: Number(quoteResponse.outAmount || 0) / 1_000_000,
    priceImpactPct: Number(quoteResponse.priceImpactPct || 0),
    routeTime: new Date().toISOString(),
  };
};

export const formatSwapAmount = (amount) => Number(amount || 0).toFixed(4);
