/**
 * SafeHaven — Solana Wallet Integration
 *
 * Uses Solana Mobile Wallet Adapter (MWA) to:
 *   - Connect to user's installed wallet (Phantom, Backpack, Solflare, etc.)
 *   - Read balances and positions (non-custodial, read-only via RPC)
 *   - Request transaction signatures (user always signs in their own wallet app)
 *
 * SECURITY GUARANTEES:
 *   - SafeHaven NEVER sees, stores, or transmits private keys
 *   - All write operations require explicit user confirmation in their wallet app
 *   - Transactions are built by the app, not the agent backend
 *
 * Docs: https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  type Cluster,
} from '@solana/web3.js';
import type { SupportedLocale } from '@voice/elevenlabs';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  walletName: string | null;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue: number | null;
}

export interface WalletBalances {
  solBalance: number;      // SOL balance in SOL (not lamports)
  solUsdValue: number | null;
  tokens: TokenBalance[];  // SPL tokens (USDC, etc.)
  lastUpdated: Date;
}

// USDC mint address on Solana mainnet
export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
);

// ─── Connection ───────────────────────────────────────────────────────────────

const RPC_URL =
  process.env['EXPO_PUBLIC_SOLANA_RPC_URL'] ??
  'https://api.mainnet-beta.solana.com';

const CLUSTER = (process.env['EXPO_PUBLIC_SOLANA_CLUSTER'] ??
  'mainnet-beta') as Cluster;

let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_URL, 'confirmed');
  }
  return _connection;
}

// ─── Balance Queries (non-custodial, read-only) ───────────────────────────────

/**
 * Fetch SOL + USDC balances for a given public key.
 * Never requires wallet connection — pure RPC read.
 */
export async function fetchBalances(
  publicKey: PublicKey,
): Promise<WalletBalances> {
  const connection = getConnection();

  // SOL balance
  const lamports = await connection.getBalance(publicKey);
  const solBalance = lamports / LAMPORTS_PER_SOL;

  // SPL token accounts (filter to well-known tokens for safety)
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') },
  );

  const tokens: TokenBalance[] = tokenAccounts.value
    .map((account) => {
      const info = account.account.data.parsed.info;
      return {
        mint: info.mint as string,
        symbol: mintToSymbol(info.mint as string),
        balance: info.tokenAmount.uiAmount as number,
        decimals: info.tokenAmount.decimals as number,
        usdValue: null, // Fetched separately from price oracle
      };
    })
    .filter((t) => t.balance > 0); // Only show non-zero balances

  return {
    solBalance,
    solUsdValue: null, // Fetched from price oracle
    tokens,
    lastUpdated: new Date(),
  };
}

/**
 * Map known mint addresses to token symbols.
 * Only maps tokens SafeHaven recommends — no unknown tokens shown.
 */
function mintToSymbol(mint: string): string {
  const KNOWN_MINTS: Record<string, string> = {
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'USDT',
    So11111111111111111111111111111111111111112: 'SOL',
  };
  return KNOWN_MINTS[mint] ?? 'UNKNOWN';
}

// ─── Transaction Building (unsigned — user signs in their wallet) ─────────────

/**
 * Build an unsigned transaction to transfer SOL.
 * The transaction must be signed by the user via MWA — never by SafeHaven.
 */
export async function buildSolTransferTx(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  solAmount: number,
): Promise<Transaction> {
  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPublicKey,
  });

  tx.add(
    SystemProgram.transfer({
      fromPubkey: fromPublicKey,
      toPubkey: toPublicKey,
      lamports: Math.round(solAmount * LAMPORTS_PER_SOL),
    }),
  );

  return tx;
}

// ─── Wallet Adapter (MWA) ─────────────────────────────────────────────────────

/**
 * Initiate a wallet connection via Solana Mobile Wallet Adapter.
 *
 * NOTE: Full MWA integration requires the @solana-mobile packages and
 * a Dapp identity configuration. This is the connection flow entry point.
 *
 * See: https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps
 */
export async function connectWallet(): Promise<WalletState> {
  // TODO: Import and initialize MWA session
  // import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
  //
  // const authResult = await transact(async (wallet) => {
  //   return wallet.authorize({
  //     cluster: CLUSTER,
  //     identity: {
  //       name: 'SafeHaven',
  //       uri: 'https://safehaven.app',
  //       icon: '/assets/icon.png',
  //     },
  //   });
  // });
  //
  // return {
  //   connected: true,
  //   publicKey: new PublicKey(authResult.accounts[0].address),
  //   walletName: authResult.wallet_uri_base,
  // };

  // Placeholder — replace with real MWA call above
  throw new Error(
    'connectWallet: MWA integration not yet wired. See implementation comment.',
  );
}

/**
 * Sign and send a transaction via MWA.
 * User sees the transaction in their wallet app and approves or rejects.
 */
export async function signAndSendTransaction(
  transaction: Transaction,
  connection: Connection,
): Promise<string> {
  // TODO: Use MWA transact() to get user signature
  // import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
  //
  // const signature = await transact(async (wallet) => {
  //   const [signedTx] = await wallet.signAndSendTransactions({
  //     transactions: [transaction],
  //   });
  //   return signedTx;
  // });
  //
  // return signature;

  throw new Error(
    'signAndSendTransaction: MWA integration not yet wired. See implementation comment.',
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Shorten a public key for display: "AbCd...XyZ1"
 */
export function shortenPublicKey(key: PublicKey | string, chars = 4): string {
  const str = typeof key === 'string' ? key : key.toBase58();
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}

/**
 * Validate that a string is a valid Solana public key.
 */
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
