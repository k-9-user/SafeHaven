/**
 * SafeHaven — Gamified Learning Module
 *
 * Teaches personal finance through bite-sized lessons and quizzes.
 * Progression: Novice → Saver → Investor (each tier unlocks DeFi features)
 *
 * Design principles:
 *   - All content reads at Grade 6 or below (Flesch-Kincaid)
 *   - No jargon without an explanation
 *   - Lessons work fully offline (bundled JSON)
 *   - XP / badge system stored locally (no account required)
 *   - Accessible: large text, high contrast, screen-reader labels on all elements
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type LessonCategory =
  | 'budget'
  | 'emergency_fund'
  | 'inflation'
  | 'saving'
  | 'intro_defi'
  | 'usdc_stablecoins'
  | 'risk_management';

export type UserTier = 'novice' | 'saver' | 'investor';

export interface QuizQuestion {
  id: string;
  question: Record<string, string>; // keyed by locale
  options: Record<string, string[]>; // keyed by locale
  correctIndex: number;
  explanation: Record<string, string>; // keyed by locale
}

export interface Lesson {
  id: string;
  category: LessonCategory;
  title: Record<string, string>;
  content: Record<string, string>;   // Markdown content per locale
  xpReward: number;
  quiz: QuizQuestion[];
  requiredTier: UserTier;
  badge?: Badge;
}

export interface Badge {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  iconName: string;                  // lucide-react-native icon name
  color: string;                     // Hex color
}

export interface UserProgress {
  tier: UserTier;
  totalXP: number;
  completedLessonIds: string[];
  earnedBadgeIds: string[];
  quizScores: Record<string, number>; // lessonId → correct answers count
  lastStudiedAt: Date | null;
  streakDays: number;
}

export interface CourseModule {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  lessons: Lesson[];
  requiredTier: UserTier;
  completionBadge?: Badge;
}

// ─── XP & Tier Thresholds ─────────────────────────────────────────────────────

export const XP_THRESHOLDS: Record<UserTier, number> = {
  novice: 0,
  saver: 100,
  investor: 300,
};

export const TIER_LABELS: Record<UserTier, Record<string, string>> = {
  novice: { en: 'Novice', fr: 'Novice', es: 'Novato' },
  saver: { en: 'Saver', fr: 'Épargnant', es: 'Ahorrador' },
  investor: { en: 'Investor', fr: 'Investisseur', es: 'Inversor' },
};

export const TIER_COLORS: Record<UserTier, string> = {
  novice: '#60A5FA',   // Light blue
  saver: '#2563EB',    // Primary blue
  investor: '#1E3A8A', // Dark blue
};

// ─── Default Progress ─────────────────────────────────────────────────────────

export const DEFAULT_PROGRESS: UserProgress = {
  tier: 'novice',
  totalXP: 0,
  completedLessonIds: [],
  earnedBadgeIds: [],
  quizScores: {},
  lastStudiedAt: null,
  streakDays: 0,
};

// ─── Course Catalog (MVP — English/French/Spanish) ─────────────────────────────

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'module-budget-basics',
    requiredTier: 'novice',
    title: {
      en: 'Budget Basics',
      fr: 'Les bases du budget',
      es: 'Fundamentos del presupuesto',
    },
    description: {
      en: 'Learn how to track your money and make it work for you.',
      fr: 'Apprenez à suivre votre argent et à le faire travailler pour vous.',
      es: 'Aprende a controlar tu dinero y a hacer que trabaje para ti.',
    },
    completionBadge: {
      id: 'badge-budget-master',
      name: { en: 'Budget Master', fr: 'Maître du budget', es: 'Maestro del presupuesto' },
      description: {
        en: 'Completed all budget basics lessons',
        fr: 'A complété toutes les leçons de base sur le budget',
        es: 'Completó todas las lecciones básicas de presupuesto',
      },
      iconName: 'calculator',
      color: '#2563EB',
    },
    lessons: [
      {
        id: 'lesson-what-is-budget',
        category: 'budget',
        requiredTier: 'novice',
        xpReward: 20,
        title: {
          en: 'What is a budget?',
          fr: "Qu'est-ce qu'un budget ?",
          es: '¿Qué es un presupuesto?',
        },
        content: {
          en: `## What is a budget?\n\nA budget is a simple plan for your money.\n\nIt tells you:\n- **How much money comes in** (your income)\n- **How much money goes out** (your expenses)\n- **What is left over** (your savings)\n\n### Why does it matter?\n\nWithout a budget, it is easy to spend more than you earn. A budget helps you see where your money goes — so you can control it.\n\n### A simple rule: 50 / 30 / 20\n\n- **50%** of your income → needs (food, rent, transport)\n- **30%** of your income → wants (entertainment, eating out)\n- **20%** of your income → savings\n\n*If saving 20% feels hard right now, start with 5%. Every small step counts.*`,
          fr: `## Qu'est-ce qu'un budget ?\n\nUn budget est un plan simple pour votre argent.\n\nIl vous dit :\n- **Combien d'argent entre** (vos revenus)\n- **Combien d'argent sort** (vos dépenses)\n- **Ce qu'il reste** (vos économies)\n\n### La règle 50 / 30 / 20\n\n- **50%** de vos revenus → besoins (nourriture, loyer, transport)\n- **30%** de vos revenus → envies\n- **20%** de vos revenus → épargne`,
          es: `## ¿Qué es un presupuesto?\n\nUn presupuesto es un plan simple para tu dinero.\n\n### La regla 50 / 30 / 20\n\n- **50%** de tus ingresos → necesidades\n- **30%** de tus ingresos → deseos\n- **20%** de tus ingresos → ahorros`,
        },
        quiz: [
          {
            id: 'q-budget-1',
            question: {
              en: 'In the 50/30/20 rule, what should 20% of your income go toward?',
              fr: 'Dans la règle 50/30/20, à quoi 20% de vos revenus doivent-ils aller ?',
              es: 'En la regla 50/30/20, ¿hacia dónde debe ir el 20% de tus ingresos?',
            },
            options: {
              en: ['Rent and food', 'Entertainment', 'Savings', 'Taxes'],
              fr: ['Loyer et nourriture', 'Divertissement', 'Épargne', 'Impôts'],
              es: ['Alquiler y comida', 'Entretenimiento', 'Ahorros', 'Impuestos'],
            },
            correctIndex: 2,
            explanation: {
              en: 'In the 50/30/20 rule, 20% of your income should go to savings. Even if you cannot save 20% right now, saving something — even 5% — is a great start.',
              fr: 'Dans la règle 50/30/20, 20% de vos revenus doivent aller à l\'épargne.',
              es: 'En la regla 50/30/20, el 20% de tus ingresos debe destinarse al ahorro.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'module-emergency-fund',
    requiredTier: 'novice',
    title: {
      en: 'Emergency Fund',
      fr: "Fonds d'urgence",
      es: 'Fondo de emergencia',
    },
    description: {
      en: 'Build a financial safety net before investing anything.',
      fr: "Constituez un filet de sécurité financier avant d'investir quoi que ce soit.",
      es: 'Construye una red de seguridad financiera antes de invertir.',
    },
    lessons: [
      {
        id: 'lesson-what-is-emergency-fund',
        category: 'emergency_fund',
        requiredTier: 'novice',
        xpReward: 25,
        title: {
          en: 'What is an emergency fund?',
          fr: "Qu'est-ce qu'un fonds d'urgence ?",
          es: '¿Qué es un fondo de emergencia?',
        },
        content: {
          en: `## What is an emergency fund?\n\nAn emergency fund is money you set aside for unexpected events.\n\n**Examples of emergencies:**\n- Lost job\n- Medical bill\n- Car or phone repair\n- Unexpected travel\n\n### How much should you save?\n\nAim for **3 to 6 months** of your basic living expenses.\n\n*If that feels too large, start with a goal of just $50 or $100. Something is always better than nothing.*\n\n### Where should you keep it?\n\nYour emergency fund should be:\n- **Easy to access** (not locked for months)\n- **Safe** (not in risky investments)\n- **Separate** from your daily spending account\n\nSaving in USDC on Solana is one option — it keeps its value in dollars, even if your local currency loses value.`,
          fr: `## Qu'est-ce qu'un fonds d'urgence ?\n\nUn fonds d'urgence est de l'argent mis de côté pour les imprévus.\n\n### Combien épargner ?\n\nVisez **3 à 6 mois** de dépenses essentielles. Commencez par 50€ ou 100€ si c'est trop.`,
          es: `## ¿Qué es un fondo de emergencia?\n\nEs dinero reservado para imprevistos.\n\n### ¿Cuánto ahorrar?\n\nApunta a **3 a 6 meses** de gastos básicos. Empieza con $50 si es necesario.`,
        },
        quiz: [
          {
            id: 'q-ef-1',
            question: {
              en: 'What is the main purpose of an emergency fund?',
              fr: "Quel est l'objectif principal d'un fonds d'urgence ?",
              es: '¿Cuál es el propósito principal de un fondo de emergencia?',
            },
            options: {
              en: [
                'To invest in crypto',
                'To cover unexpected expenses',
                'To buy luxury items',
                'To pay for vacations',
              ],
              fr: [
                'Investir en crypto',
                'Couvrir les dépenses imprévues',
                'Acheter des articles de luxe',
                'Payer les vacances',
              ],
              es: [
                'Invertir en cripto',
                'Cubrir gastos inesperados',
                'Comprar artículos de lujo',
                'Pagar vacaciones',
              ],
            },
            correctIndex: 1,
            explanation: {
              en: 'An emergency fund covers unexpected expenses like medical bills or job loss — without going into debt.',
              fr: "Un fonds d'urgence couvre les dépenses imprévues sans s'endetter.",
              es: 'Un fondo de emergencia cubre gastos inesperados sin endeudarse.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'module-intro-defi',
    requiredTier: 'saver', // Unlocked after reaching Saver tier
    title: {
      en: 'Intro to DeFi',
      fr: 'Introduction à la DeFi',
      es: 'Introducción a DeFi',
    },
    description: {
      en: 'What is DeFi and how can it help you grow your savings safely?',
      fr: "Qu'est-ce que la DeFi et comment peut-elle vous aider à faire fructifier vos économies ?",
      es: '¿Qué es DeFi y cómo puede ayudarte a hacer crecer tus ahorros?',
    },
    lessons: [
      {
        id: 'lesson-what-is-defi',
        category: 'intro_defi',
        requiredTier: 'saver',
        xpReward: 30,
        title: {
          en: 'What is DeFi?',
          fr: "Qu'est-ce que la DeFi ?",
          es: '¿Qué es DeFi?',
        },
        content: {
          en: `## What is DeFi?\n\nDeFi stands for **Decentralized Finance**.\n\nThink of it as financial services — like loans or savings — but run by computer programs instead of banks.\n\n### How is it different from a bank?\n\n| Bank | DeFi |\n|------|------|\n| Controlled by people | Controlled by code |\n| Requires ID | Just needs a wallet |\n| Slow transfers | Instant |\n| Limited hours | 24/7 |\n\n### Is it safe?\n\nDeFi has risks. The code could have bugs. Prices can change fast. **SafeHaven only shows you the safest, most trusted DeFi options.**\n\n**Never invest money you cannot afford to lose.**`,
          fr: `## Qu'est-ce que la DeFi ?\n\nDeFi signifie **Finance Décentralisée**. C'est comme des services bancaires mais gérés par des programmes informatiques.\n\n**SafeHaven ne vous montre que les options DeFi les plus sûres.**`,
          es: `## ¿Qué es DeFi?\n\nDeFi significa **Finanzas Descentralizadas**. Son servicios financieros gestionados por programas informáticos.\n\n**SafeHaven solo te muestra las opciones DeFi más seguras.**`,
        },
        quiz: [
          {
            id: 'q-defi-1',
            question: {
              en: 'What does DeFi stand for?',
              fr: 'Que signifie DeFi ?',
              es: '¿Qué significa DeFi?',
            },
            options: {
              en: [
                'Digital Finance',
                'Decentralized Finance',
                'Delayed Finance',
                'Default Finance',
              ],
              fr: [
                'Finance Digitale',
                'Finance Décentralisée',
                'Finance Différée',
                'Finance par Défaut',
              ],
              es: [
                'Finanzas Digitales',
                'Finanzas Descentralizadas',
                'Finanzas Diferidas',
                'Finanzas por Defecto',
              ],
            },
            correctIndex: 1,
            explanation: {
              en: 'DeFi stands for Decentralized Finance — financial services run by computer code instead of banks.',
              fr: 'DeFi signifie Finance Décentralisée — des services financiers gérés par du code informatique.',
              es: 'DeFi significa Finanzas Descentralizadas — servicios financieros gestionados por código informático.',
            },
          },
        ],
      },
    ],
  },
];

// ─── Progress Logic ───────────────────────────────────────────────────────────

export function getTierForXP(xp: number): UserTier {
  if (xp >= XP_THRESHOLDS.investor) return 'investor';
  if (xp >= XP_THRESHOLDS.saver) return 'saver';
  return 'novice';
}

export function getXPToNextTier(currentXP: number): {
  nextTier: UserTier | null;
  xpNeeded: number;
  xpToGo: number;
} {
  if (currentXP >= XP_THRESHOLDS.investor) {
    return { nextTier: null, xpNeeded: XP_THRESHOLDS.investor, xpToGo: 0 };
  }
  if (currentXP >= XP_THRESHOLDS.saver) {
    return {
      nextTier: 'investor',
      xpNeeded: XP_THRESHOLDS.investor,
      xpToGo: XP_THRESHOLDS.investor - currentXP,
    };
  }
  return {
    nextTier: 'saver',
    xpNeeded: XP_THRESHOLDS.saver,
    xpToGo: XP_THRESHOLDS.saver - currentXP,
  };
}

export function getLessonById(id: string): Lesson | undefined {
  for (const module of COURSE_MODULES) {
    const lesson = module.lessons.find((l) => l.id === id);
    if (lesson) return lesson;
  }
  return undefined;
}

export function isLessonCompleted(
  progress: UserProgress,
  lessonId: string,
): boolean {
  return progress.completedLessonIds.includes(lessonId);
}

export function isModuleUnlocked(
  progress: UserProgress,
  module: CourseModule,
): boolean {
  const tierOrder: UserTier[] = ['novice', 'saver', 'investor'];
  const userTierIndex = tierOrder.indexOf(progress.tier);
  const requiredTierIndex = tierOrder.indexOf(module.requiredTier);
  return userTierIndex >= requiredTierIndex;
}
