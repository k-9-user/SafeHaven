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
  expectedApyRange: { min: number; max: number };
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

export const SAFETY_CEILING = 0.05;

export const STRATEGY_LIBRARY: StrategyTemplate[] = [
  {
    id: 'kamino-usdc-main',
    name: 'Kamino USDC Lending',
    protocol: 'kamino',
    category: 'money_market',
    plainDescription: 'Put USDC into Kamino lending and earn interest from borrowers while staying in a stablecoin position.',
    expectedApyRange: { min: 4.5, max: 8.5 },
    riskLevel: 1,
    minAmountUSD: 5,
    lockup: 'No hard lockup. Withdraw anytime if liquidity is available.',
    lockupDays: 0,
    exitCost: 'Network fees only. No protocol exit fee.',
    supportsGoals: ['emergency_fund', 'daily_expenses', 'future_purchase', 'retirement'],
    whatCanGoWrong: [
      'The smart contract could have a bug.',
      'Withdrawals can be slower when many users leave at once.',
      'The APY can fall when borrowing demand drops.',
    ],
    isStablecoin: true,
    isLeveraged: false,
    auditLinks: ['https://kamino.finance/security'],
    description: {
      en: 'USDC lending on Kamino. Simple, liquid, and designed for conservative users who want yield without taking token price risk.',
      fr: 'Prêt USDC sur Kamino. Simple, liquide et conçu pour les utilisateurs prudents qui veulent du rendement sans risque de prix.',
      es: 'Préstamo de USDC en Kamino. Simple, líquido y pensado para usuarios conservadores que buscan rendimiento sin riesgo de precio.',
    },
  },
  {
    id: 'marginfi-usdc-main',
    name: 'MarginFi USDC Lending',
    protocol: 'marginfi',
    category: 'money_market',
    plainDescription: 'Deposit USDC into MarginFi to earn interest in a savings-account style money market.',
    expectedApyRange: { min: 4.0, max: 7.5 },
    riskLevel: 2,
    minAmountUSD: 5,
    lockup: 'No hard lockup. Usually withdrawable on demand.',
    lockupDays: 0,
    exitCost: 'Network fees only. No protocol exit fee.',
    supportsGoals: ['emergency_fund', 'daily_expenses', 'future_purchase', 'retirement'],
    whatCanGoWrong: [
      'A bug in the protocol could affect funds.',
      'Liquidity can tighten if everyone borrows at the same time.',
      'Rates move up and down with market demand.',
    ],
    isStablecoin: true,
    isLeveraged: false,
    auditLinks: ['https://docs.marginfi.com/security'],
    description: {
      en: 'USDC lending on MarginFi. A conservative money-market position that keeps your capital in a dollar-pegged asset.',
      fr: 'Prêt USDC sur MarginFi. Une position de money market conservatrice qui garde votre capital dans un actif indexé sur le dollar.',
      es: 'Préstamo de USDC en MarginFi. Una posición conservadora de money market que mantiene tu capital en un activo vinculado al dólar.',
    },
  },
  {
    id: 'jito-sol',
    name: 'JitoSOL Liquid Staking',
    protocol: 'jito',
    category: 'liquid_staking',
    plainDescription: 'Stake SOL through Jito and receive a liquid staking token that can still be traded or used later.',
    expectedApyRange: { min: 6.0, max: 9.0 },
    riskLevel: 4,
    minAmountUSD: 10,
    lockup: 'No hard lockup, but unstaking and rebalancing can take time.',
    lockupDays: 2,
    exitCost: 'Small network fee plus potential spread when swapping back to SOL or USDC.',
    supportsGoals: ['future_purchase', 'retirement'],
    whatCanGoWrong: [
      'SOL price can still drop even if staking rewards are earned.',
      'The liquid staking token can trade slightly above or below its peg.',
      'Protocol or validator issues can affect rewards.',
    ],
    isStablecoin: false,
    isLeveraged: false,
    auditLinks: ['https://www.jito.network/'],
    description: {
      en: 'Liquid staking on Jito for medium-to-higher risk users who want SOL exposure plus staking rewards.',
      fr: 'Liquid staking sur Jito pour les utilisateurs au risque moyen à plus élevé qui veulent une exposition au SOL plus des récompenses de staking.',
      es: 'Liquid staking en Jito para usuarios de riesgo medio-alto que quieren exposición a SOL más recompensas de staking.',
    },
  },
  {
    id: 'msol-liquid-staking',
    name: 'mSOL Liquid Staking',
    protocol: 'marinade',
    category: 'liquid_staking',
    plainDescription: 'Stake SOL through Marinade and receive mSOL, a liquid token that keeps earning staking yield.',
    expectedApyRange: { min: 5.5, max: 8.5 },
    riskLevel: 4,
    minAmountUSD: 10,
    lockup: 'No hard lockup, but unstaking may take a few days.',
    lockupDays: 3,
    exitCost: 'Small network fee plus possible swap spread when exiting.',
    supportsGoals: ['future_purchase', 'retirement'],
    whatCanGoWrong: [
      'The SOL market can move sharply while you are staking.',
      'mSOL can drift from its target value briefly during stress.',
      'Validator or protocol issues can reduce rewards.',
    ],
    isStablecoin: false,
    isLeveraged: false,
    auditLinks: ['https://marinade.finance/'],
    description: {
      en: 'Liquid staking on Marinade for users who want a simple long-term SOL position with staking rewards.',
      fr: 'Liquid staking sur Marinade pour les utilisateurs qui veulent une position SOL long terme simple avec récompenses de staking.',
      es: 'Liquid staking en Marinade para usuarios que quieren una posición SOL simple de largo plazo con recompensas de staking.',
    },
  },
];

export const CONSERVATIVE_STRATEGIES = STRATEGY_LIBRARY.filter((strategy) => strategy.isStablecoin);

export function getStrategyById(strategyId: string): StrategyTemplate | undefined {
  return STRATEGY_LIBRARY.find((strategy) => strategy.id === strategyId);
}

export function getStrategiesForRiskLevel(riskLevel: number): StrategyTemplate[] {
  if (riskLevel <= 3) {
    return STRATEGY_LIBRARY.filter((strategy) => strategy.isStablecoin && strategy.riskLevel <= 2);
  }

  return STRATEGY_LIBRARY.filter((strategy) => strategy.riskLevel <= riskLevel && !strategy.isLeveraged);
}
