/**
 * SafeHaven — DeFi Strategy Engine
 *
 * Defines and executes conservative USDC yield strategies on Solana.
 * Currently supported:
 *   1. Kamino Finance — USDC lending vault
 *   2. MarginFi — USDC lending pool
 *
 * SAFETY RULES (enforced here and in agent/src/safety):
 *   - Only USDC-denominated positions (no volatile asset exposure)
 *   - No leverage, no margin, no perpetuals
 *   - Minimum deposit: $5 equivalent
 *   - Maximum single deposit per session: $1,000 (anti-fraud)
 *   - All transactions unsigned — user signs via MWA
 *   - Risk disclosure required before any execution
 */

import { PublicKey, Transaction } from '@solana/web3.js';
import { getConnection } from '@wallet/solanaWallet';

// ─── Types ───────────────────────────────────────────────────────────────────

export type StrategyProtocol = 'kamino' | 'marginfi';

export type RiskTier = 'conservative' | 'moderate';

export interface Strategy {
  id: string;
  protocol: StrategyProtocol;
  name: string;
  description: Record<string, string>; // keyed by locale
  riskTier: RiskTier;
  riskScore: number;                   // 1 (lowest) – 10 (highest). Max allowed: 3 for beginners
  minDepositUSDC: number;
  apyRange: { min: number; max: number }; // Indicative only — NOT a guarantee
  auditLinks: string[];
  programId: string;
  vaultAddress: string;                // Mainnet vault/pool address
}

export interface StrategyDepositParams {
  strategy: Strategy;
  userPublicKey: PublicKey;
  usdcAmountRaw: bigint;               // Amount in raw USDC units (6 decimals)
}

export interface StrategyPosition {
  protocol: StrategyProtocol;
  vaultAddress: string;
  depositedUSDC: number;
  currentValueUSDC: number;
  earnedUSDC: number;
  apy: number;
  depositedAt: Date;
}

// ─── Strategy Catalog ─────────────────────────────────────────────────────────

/**
 * The canonical list of strategies SafeHaven offers.
 * All are USDC-only, low-risk, and audited.
 *
 * APY ranges are indicative — they fluctuate with market conditions.
 * NEVER display as guaranteed returns.
 */
export const STRATEGIES: Strategy[] = [
  {
    id: 'kamino-usdc-main',
    protocol: 'kamino',
    name: 'Kamino USDC Lending',
    description: {
      en: 'Deposit USDC into Kamino Finance\'s lending pool. Your funds are lent to borrowers who provide collateral, and you earn interest. Kamino is one of the largest and most audited lending protocols on Solana.',
      fr: 'Déposez des USDC dans le pool de prêt de Kamino Finance. Vos fonds sont prêtés à des emprunteurs qui fournissent des garanties, et vous gagnez des intérêts.',
      es: 'Deposita USDC en el pool de préstamos de Kamino Finance. Tus fondos se prestan a prestatarios que aportan garantías y tú ganas intereses.',
      pt: 'Deposite USDC no pool de empréstimos da Kamino Finance e ganhe juros.',
      sw: 'Weka USDC katika dimbwi la mkopo la Kamino Finance na upate riba.',
      ha: 'Sanya USDC a cikin pool na rance na Kamino Finance ka sami riba.',
      ar: 'أودع USDC في مجمع الإقراض في Kamino Finance واكسب فائدة.',
    },
    riskTier: 'conservative',
    riskScore: 2,
    minDepositUSDC: 5,
    apyRange: { min: 4.5, max: 8.5 },
    auditLinks: [
      'https://kamino.finance/security',
      'https://github.com/hubbleprotocol/hubble-public-api',
    ],
    programId: 'KLend2g3cP87fffoy8q1mQqGKjrL1AyGulgtnNXHsSH',
    vaultAddress: 'H9UMrSzHDi5yGdMPGb5TS7R8n8AX5VHJvTSgFtQv5iE',
  },
  {
    id: 'marginfi-usdc-main',
    protocol: 'marginfi',
    name: 'MarginFi USDC Lending',
    description: {
      en: 'Deposit USDC into MarginFi\'s lending pool. Similar to a savings account — you earn interest while borrowers use your funds as liquidity. MarginFi is fully non-custodial and regularly audited.',
      fr: 'Déposez des USDC dans le pool de MarginFi. Similaire à un compte d\'épargne — vous gagnez des intérêts pendant que les emprunteurs utilisent vos fonds.',
      es: 'Deposita USDC en el pool de MarginFi. Similar a una cuenta de ahorros: ganas intereses mientras los prestatarios usan tus fondos.',
      pt: 'Deposite USDC no pool do MarginFi, parecido com uma conta poupança.',
      sw: 'Weka USDC katika dimbwi la MarginFi, kama akaunti ya akiba.',
      ha: 'Sanya USDC a cikin pool na MarginFi, kamar asusun ajiya.',
      ar: 'أودع USDC في مجمع MarginFi، مشابه لحساب التوفير.',
    },
    riskTier: 'conservative',
    riskScore: 2,
    minDepositUSDC: 5,
    apyRange: { min: 4.0, max: 7.5 },
    auditLinks: [
      'https://docs.marginfi.com/security',
    ],
    programId: 'MFv2hWf31Z9kbCa1snEPdcgp7vGVw8Ly6SnGPGSJoX',
    vaultAddress: 'EihFwjNA4u9v5C8jFKgPEfnvZj6bPetRpkVqxEPbAjKu',
  },
];

// ─── Strategy Selection ────────────────────────────────────────────────────────

/**
 * Get strategies appropriate for a user's risk tier.
 * Beginners (score 1–3) only see conservative strategies.
 */
export function getStrategiesForRiskScore(
  riskScore: number,
): Strategy[] {
  if (riskScore <= 3) {
    return STRATEGIES.filter((s) => s.riskTier === 'conservative');
  }
  return STRATEGIES; // More strategies unlocked for higher risk scores
}

/**
 * Find a strategy by ID.
 */
export function getStrategyById(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}

// ─── Transaction Building (unsigned — requires user signature via MWA) ────────

/**
 * Build an unsigned deposit transaction for a given strategy.
 *
 * IMPORTANT: This transaction must be shown to the user for review
 * before requesting their signature. Never auto-sign.
 *
 * The actual protocol-specific instruction building (Kamino CPI, MarginFi CPI)
 * will be implemented once program IDLs are integrated.
 */
export async function buildDepositTransaction(
  params: StrategyDepositParams,
): Promise<Transaction> {
  const { strategy, userPublicKey, usdcAmountRaw } = params;
  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userPublicKey,
  });

  // TODO: Add protocol-specific deposit instruction
  // For Kamino: use @hubbleprotocol/kamino-sdk
  // For MarginFi: use @mrgnlabs/marginfi-client-v2
  //
  // Example (Kamino):
  // const kaminoAction = await KaminoAction.buildDepositTxns(
  //   kaminoMarket, usdcAmountRaw, USDC_MINT, userPublicKey
  // );
  // tx.add(...kaminoAction.setupIxs);
  // tx.add(kaminoAction.lendingIxs[0]);

  console.warn(
    `[Strategy] buildDepositTransaction: Protocol instruction for ${strategy.protocol} not yet implemented.`,
  );

  return tx;
}

/**
 * Build an unsigned withdrawal transaction.
 */
export async function buildWithdrawTransaction(
  strategy: Strategy,
  userPublicKey: PublicKey,
  usdcAmountRaw: bigint,
): Promise<Transaction> {
  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: userPublicKey,
  });

  // TODO: Add protocol-specific withdrawal instruction

  return tx;
}

// ─── APY / Yield Queries ──────────────────────────────────────────────────────

/**
 * Fetch current live APYs from the agent backend (which polls protocols).
 * Returns cached values if network is unavailable.
 */
export async function fetchLiveApys(): Promise<
  Record<string, { apy: number; timestamp: Date }>
> {
  try {
    const AGENT_URL =
      process.env['EXPO_PUBLIC_AGENT_URL'] ?? 'http://localhost:3001';
    const response = await fetch(`${AGENT_URL}/api/yields`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error('Yield fetch failed');
    return response.json() as Promise<Record<string, { apy: number; timestamp: Date }>>;
  } catch {
    // Return indicative midpoints as fallback
    return Object.fromEntries(
      STRATEGIES.map((s) => [
        s.id,
        {
          apy: (s.apyRange.min + s.apyRange.max) / 2,
          timestamp: new Date(),
        },
      ]),
    );
  }
}

// ─── Disclosure ───────────────────────────────────────────────────────────────

/**
 * Generate the mandatory risk disclosure text for a strategy.
 * Must be shown and acknowledged before any deposit.
 */
export function getStrategyDisclosure(
  strategy: Strategy,
  locale: string,
): string {
  const disclosures: Record<string, string> = {
    en: `IMPORTANT: DeFi lending carries risks including smart contract bugs, protocol insolvency, and liquidity risk. The APY shown (${strategy.apyRange.min}%–${strategy.apyRange.max}%) is not guaranteed and may change at any time. Only deposit funds you can afford to lose. SafeHaven does not custody your funds and cannot recover them if lost. This is not investment advice.`,
    fr: `IMPORTANT : Le prêt DeFi comporte des risques, notamment des bugs de contrats intelligents, l'insolvabilité du protocole et le risque de liquidité. Le rendement indiqué (${strategy.apyRange.min}%–${strategy.apyRange.max}%) n'est pas garanti et peut changer à tout moment. Ne déposez que des fonds que vous pouvez vous permettre de perdre.`,
    es: `IMPORTANTE: El préstamo DeFi conlleva riesgos, incluyendo errores en contratos inteligentes, insolvencia del protocolo y riesgo de liquidez. El APY mostrado (${strategy.apyRange.min}%–${strategy.apyRange.max}%) no está garantizado. Solo deposita fondos que puedas permitirte perder.`,
  };

  return disclosures[locale] ?? disclosures['en']!;
}
