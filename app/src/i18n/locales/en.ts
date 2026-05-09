/**
 * SafeHaven — English Translation Bundle
 *
 * Writing guidelines for all locales:
 *   - Reading level: Grade 6 or below
 *   - No financial jargon without immediate explanation
 *   - Active voice, short sentences
 *   - Inclusive, non-judgmental tone
 */

const en = {
  // ─── App Shell ─────────────────────────────────────────────────────────────
  app: {
    name: 'SafeHaven',
    tagline: 'Your AI money guide',
    loading: 'Loading...',
    error: {
      generic: 'Something went wrong. Please try again.',
      network: 'No internet connection. Some features may not work.',
      wallet: 'Could not connect to your wallet. Please try again.',
    },
  },

  // ─── Navigation ────────────────────────────────────────────────────────────
  nav: {
    home: 'Home',
    learn: 'Learn',
    defi: 'Earn',
    settings: 'Settings',
  },

  // ─── Onboarding ────────────────────────────────────────────────────────────
  onboarding: {
    welcome: {
      title: 'Welcome to SafeHaven',
      subtitle: 'Your AI guide to managing and growing your money — safely.',
      cta: 'Get Started',
    },
    language: {
      title: 'Choose your language',
      subtitle: 'SafeHaven speaks your language.',
    },
    goals: {
      title: 'What is your main goal?',
      options: {
        learn: 'Learn about money',
        save: 'Save safely',
        grow: 'Grow my savings',
        protect: 'Protect what I have',
      },
    },
    riskProfile: {
      title: 'Tell us about yourself',
      capitalQuestion: 'How much money are you thinking of saving or investing?',
      capitalOptions: ['Less than $50', '$50 – $200', '$200 – $1,000', 'More than $1,000'],
      goalQuestion: 'What is your main saving goal?',
      goalOptions: ['Emergency fund', 'Daily expenses', 'Future purchase', 'Retirement'],
      toleranceQuestion: 'If your savings went down 10%, what would you do?',
      toleranceOptions: [
        'I would withdraw everything immediately',
        'I would feel worried but wait',
        'I would keep calm and hold',
        'I would add more money',
      ],
    },
    wallet: {
      title: 'Connect your wallet',
      subtitle: 'SafeHaven never holds your money. You always stay in control.',
      cta: 'Connect Wallet',
      skip: 'Skip for now',
      notice: 'Your private keys stay in your wallet app at all times.',
    },
  },

  // ─── Home Screen ───────────────────────────────────────────────────────────
  home: {
    greeting: 'Hello, {{name}}!',
    greetingGeneric: 'Hello!',
    balance: {
      title: 'Your savings',
      usdc: 'USDC Balance',
      earning: 'Currently earning',
      apy: '{{apy}}% per year (estimated)',
    },
    askAgent: {
      placeholder: 'Ask me anything about your money...',
      voiceHint: 'Or tap the mic to speak',
      micLabel: 'Start voice input',
      sendLabel: 'Send message',
    },
    quickActions: {
      learn: 'Continue learning',
      deposit: 'Add savings',
      withdraw: 'Withdraw',
      bridge: 'Move funds',
    },
    progress: {
      title: 'Your progress',
      xp: '{{xp}} XP',
      tier: 'Level: {{tier}}',
      nextLevel: '{{xp}} XP to next level',
    },
  },

  // ─── Learning Module ───────────────────────────────────────────────────────
  learn: {
    title: 'Learn',
    subtitle: 'Build your money skills step by step.',
    startLesson: 'Start lesson',
    continueLesson: 'Continue',
    completed: 'Completed',
    locked: 'Complete previous lessons to unlock',
    quiz: {
      title: 'Quick check',
      submit: 'Submit answer',
      correct: 'Correct! Well done.',
      incorrect: 'Not quite — here is the right answer:',
      next: 'Next',
      finish: 'Finish lesson',
    },
    badge: {
      earned: 'Badge earned!',
      view: 'View all badges',
    },
    xp: {
      earned: '+{{xp}} XP',
    },
    tiers: {
      novice: 'Novice',
      saver: 'Saver',
      investor: 'Investor',
    },
  },

  // ─── DeFi / Earn Screen ────────────────────────────────────────────────────
  defi: {
    title: 'Earn',
    subtitle: 'Grow your USDC savings safely.',
    strategies: {
      title: 'Available strategies',
      riskScore: 'Safety score: {{score}}/10',
      apy: 'Est. {{min}}% – {{max}}% per year',
      apyDisclaimer: 'This is an estimate. Returns are not guaranteed and will change.',
      minDeposit: 'Minimum: ${{amount}} USDC',
      deposit: 'Deposit USDC',
      withdraw: 'Withdraw',
      audit: 'Security audits',
    },
    disclosure: {
      title: 'Please read before continuing',
      acknowledge: 'I understand the risks and want to continue',
      cancel: 'Cancel',
    },
    bridge: {
      title: 'Move funds from another chain',
      subtitle: 'Bring your money to Solana from Ethereum, Polygon, and more.',
      from: 'From',
      to: 'To (USDC on Solana)',
      getRoutes: 'Find best route',
      confirm: 'Confirm bridge',
      feeWarning: 'Total fees: {{fee}}',
      timeWarning: 'Estimated time: {{time}}',
    },
    wallet: {
      notConnected: 'Connect a wallet to deposit or withdraw.',
      connect: 'Connect Wallet',
    },
  },

  // ─── AI Chat ───────────────────────────────────────────────────────────────
  chat: {
    placeholder: 'Ask a question about money...',
    voiceStart: 'Tap to speak',
    voiceStop: 'Tap to stop',
    voiceOff: 'Voice off',
    voiceOn: 'Voice on',
    sending: 'Thinking...',
    disclaimer: 'SafeHaven provides information, not personal financial advice. Consult a local financial advisor for major decisions.',
    errorFallback: 'I could not reach the AI right now. You can still browse lessons or check your balance.',
  },

  // ─── Settings ──────────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    language: 'Language',
    accessibility: {
      title: 'Accessibility',
      largeText: 'Large text',
      highContrast: 'High contrast',
      reducedMotion: 'Reduce animation',
      haptics: 'Vibration feedback',
    },
    wallet: {
      title: 'Wallet',
      connected: 'Connected: {{address}}',
      disconnect: 'Disconnect',
      connect: 'Connect Wallet',
    },
    about: {
      title: 'About SafeHaven',
      version: 'Version {{version}}',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
  },

  // ─── Accessibility ─────────────────────────────────────────────────────────
  a11y: {
    backButton: 'Go back',
    closeButton: 'Close',
    menuButton: 'Open menu',
    loading: 'Loading, please wait',
    success: 'Success',
    error: 'Error',
    required: 'Required',
    walletAddress: 'Wallet address: {{address}}',
    xpProgress: '{{current}} of {{total}} XP to next level',
    lessonProgress: '{{completed}} of {{total}} lessons completed',
  },

  // ─── Errors ────────────────────────────────────────────────────────────────
  errors: {
    network: 'No internet connection.',
    walletConnect: 'Could not connect to wallet. Make sure a Solana wallet app is installed.',
    depositFailed: 'Deposit failed. Please try again.',
    withdrawFailed: 'Withdrawal failed. Please try again.',
    bridgeFailed: 'Bridge failed. Your funds were not moved. Please try again.',
    insufficientFunds: 'Not enough USDC in your wallet.',
    belowMinimum: 'Minimum deposit is ${{min}} USDC.',
    scamWarning: 'Warning: This looks suspicious. SafeHaven will never ask for your private key or seed phrase.',
  },
};

export default en;
export type TranslationKeys = typeof en;
