const COURSES = [
  {
    id: 'finance-basics',
    title: 'Finance Basics',
    description: 'Build the foundation for safe money management.',
    lessons: [
      {
        id: 'budgeting',
        title: 'Budgeting 101',
        content: `Why budgets matter\n\nA simple budget tracks income and expenses. Start with a 50/30/20 split: 50% needs, 30% wants, 20% savings. Use a notebook or a phone app to record weekly expenses and review every month.`,
        quiz: {
          question: 'In the 50/30/20 method, what percentage is usually dedicated to savings?',
          options: ['10%', '20%', '40%'],
          correctIndex: 1,
        },
      },
      {
        id: 'emergency-fund',
        title: 'Emergency Fund',
        content: `How to build an emergency fund\n\nAim for 3 months of expenses. Set up automatic recurring transfers to a separate account or stablecoin vault. Prioritise small, consistent savings if cash is tight.`,
        quiz: {
          question: 'A practical first emergency fund target is:',
          options: ['3 months of expenses', '1 week of salary', '100% of annual income'],
          correctIndex: 0,
        },
      },
      {
        id: 'debt-control',
        title: 'Debt Control',
        content: `Paying down high-interest debt\n\nList debts by interest rate and target the highest first (avalanche). Alternatively, use the snowball method for quick wins. Avoid new high-interest credit while reducing balances.`,
        quiz: {
          question: 'The avalanche method focuses first on debt with:',
          options: ['Smallest balance', 'Highest interest rate', 'Longest duration'],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'investment-safety',
    title: 'Investment Safety',
    description: 'Learn how to invest without exposing all your assets.',
    lessons: [
      {
        id: 'risk-reward',
        title: 'Risk vs Reward',
        content: `Understand risk and time horizon\n\nHigher returns usually mean higher volatility. Match investments to goals: short-term = safe assets, long-term = growth assets. Use diversification to reduce single-asset risk.`,
        quiz: {
          question: 'For short-term goals, which profile is usually safer?',
          options: ['High-volatility growth assets', 'Safer and more stable assets', 'Only meme coins'],
          correctIndex: 1,
        },
      },
      {
        id: 'diversification',
        title: 'Diversification',
        content: `Diversify across assets and regions\n\nDon't put all money in one asset class. Consider stablecoins, local currency holdings, and low-cost ETFs where available. Rebalance annually.`,
        quiz: {
          question: 'Diversification mainly helps to:',
          options: ['Eliminate all risk', 'Reduce single-asset concentration risk', 'Guarantee profits'],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'market-protection',
    title: 'Market Protection',
    description: 'How AI and stablecoins protect assets during volatility.',
    lessons: [
      {
        id: 'signals',
        title: 'Market Signals',
        content: `Recognising downside signals\n\nWatch price drop percentages, volume spikes, and news events. AI systems can aggregate signals and act faster than manual monitoring.`,
        quiz: {
          question: 'Which is a common downside market signal?',
          options: ['Rapid price drop with volume spike', 'Flat price and low volume', 'Stable peg behavior'],
          correctIndex: 0,
        },
      },
      {
        id: 'usdc-usage',
        title: 'Using USDC for Stability',
        content: `Why stablecoins help\n\nUSDC is pegged to USD and reduces volatility for crypto holdings. On Solana, swaps are fast and cheap allowing quick protective moves.`,
        quiz: {
          question: 'USDC is typically used in this app to:',
          options: ['Increase volatility', 'Protect value during market drops', 'Mine new tokens'],
          correctIndex: 1,
        },
      },
    ],
  },
  {
    id: 'global-trading',
    title: 'Global Trading',
    description: 'Trade with a Solana wallet and keep control of your capital.',
    lessons: [
      {
        id: 'wallet-signing',
        title: 'Wallet Signing',
        content: `How wallet signing works\n\nYour private key never leaves your wallet. Transactions are signed locally (Phantom) and broadcast to the network. Always verify the transaction details before signing.`,
        quiz: {
          question: 'With wallet signing, your private key should:',
          options: ['Be sent to the server', 'Stay inside your wallet', 'Be posted to explorers'],
          correctIndex: 1,
        },
      },
      {
        id: 'onchain',
        title: 'On-chain Transfers',
        content: `Sending and receiving tokens\n\nUse the Solana explorer to verify addresses. For cross-border payments, prefer native token or stablecoin transfers to avoid local currency rails when possible.`,
        quiz: {
          question: 'Before sending funds, best practice is to:',
          options: ['Skip verification for speed', 'Verify destination address on explorer', 'Send a large test transaction first'],
          correctIndex: 1,
        },
      },
    ],
  },
];

export default COURSES;
