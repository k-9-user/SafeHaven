/**
 * SafeHaven — French Translation Bundle
 *
 * Writing guidelines:
 *   - Niveau de lecture : CE2-CM2 (équivalent Grade 6 anglais)
 *   - Pas de jargon financier sans explication immédiate
 *   - Ton amical, encourageant, jamais condescendant
 */

const fr = {
  app: {
    name: 'SafeHaven',
    tagline: 'Votre guide IA pour l\'argent',
    loading: 'Chargement...',
    error: {
      generic: 'Une erreur s\'est produite. Réessayez.',
      network: 'Pas de connexion internet. Certaines fonctions peuvent ne pas marcher.',
      wallet: 'Impossible de connecter votre portefeuille. Réessayez.',
    },
  },

  nav: {
    home: 'Accueil',
    learn: 'Apprendre',
    defi: 'Épargner',
    settings: 'Paramètres',
  },

  onboarding: {
    welcome: {
      title: 'Bienvenue sur SafeHaven',
      subtitle: 'Votre guide IA pour gérer et faire fructifier votre argent — en toute sécurité.',
      cta: 'Commencer',
    },
    language: {
      title: 'Choisissez votre langue',
      subtitle: 'SafeHaven parle votre langue.',
    },
    goals: {
      title: 'Quel est votre objectif principal ?',
      options: {
        learn: 'Apprendre à gérer mon argent',
        save: 'Épargner en sécurité',
        grow: 'Faire fructifier mon épargne',
        protect: 'Protéger ce que j\'ai',
      },
    },
    riskProfile: {
      title: 'Parlez-nous de vous',
      capitalQuestion: 'Combien pensez-vous épargner ou investir ?',
      capitalOptions: ['Moins de 50 €', '50 € – 200 €', '200 € – 1 000 €', 'Plus de 1 000 €'],
      goalQuestion: 'Quel est votre principal objectif d\'épargne ?',
      goalOptions: ['Fonds d\'urgence', 'Dépenses quotidiennes', 'Achat futur', 'Retraite'],
      toleranceQuestion: 'Si votre épargne baissait de 10 %, que feriez-vous ?',
      toleranceOptions: [
        'Je retirerais tout immédiatement',
        'Je serais inquiet(e) mais j\'attendrais',
        'Je resterais calme et j\'attendrais',
        'J\'ajouterais de l\'argent',
      ],
    },
    wallet: {
      title: 'Connectez votre portefeuille',
      subtitle: 'SafeHaven ne garde jamais votre argent. Vous restez toujours maître de vos fonds.',
      cta: 'Connecter le portefeuille',
      skip: 'Passer pour l\'instant',
      notice: 'Vos clés privées restent dans votre application portefeuille en permanence.',
    },
  },

  home: {
    greeting: 'Bonjour, {{name}} !',
    greetingGeneric: 'Bonjour !',
    balance: {
      title: 'Votre épargne',
      usdc: 'Solde USDC',
      earning: 'Vous gagnez actuellement',
      apy: '{{apy}}% par an (estimé)',
    },
    askAgent: {
      placeholder: 'Posez une question sur votre argent...',
      voiceHint: 'Ou appuyez sur le micro pour parler',
      micLabel: 'Démarrer la saisie vocale',
      sendLabel: 'Envoyer le message',
    },
    quickActions: {
      learn: 'Continuer à apprendre',
      deposit: 'Ajouter de l\'épargne',
      withdraw: 'Retirer',
      bridge: 'Transférer des fonds',
    },
    progress: {
      title: 'Votre progression',
      xp: '{{xp}} XP',
      tier: 'Niveau : {{tier}}',
      nextLevel: '{{xp}} XP pour le prochain niveau',
    },
  },

  learn: {
    title: 'Apprendre',
    subtitle: 'Développez vos compétences financières étape par étape.',
    startLesson: 'Commencer la leçon',
    continueLesson: 'Continuer',
    completed: 'Terminé',
    locked: 'Complétez les leçons précédentes pour déverrouiller',
    quiz: {
      title: 'Vérification rapide',
      submit: 'Soumettre ma réponse',
      correct: 'Correct ! Bravo.',
      incorrect: 'Pas tout à fait — voici la bonne réponse :',
      next: 'Suivant',
      finish: 'Terminer la leçon',
    },
    badge: {
      earned: 'Badge obtenu !',
      view: 'Voir tous les badges',
    },
    xp: {
      earned: '+{{xp}} XP',
    },
    tiers: {
      novice: 'Novice',
      saver: 'Épargnant',
      investor: 'Investisseur',
    },
  },

  defi: {
    title: 'Épargner',
    subtitle: 'Faites fructifier vos USDC en toute sécurité.',
    strategies: {
      title: 'Stratégies disponibles',
      riskScore: 'Score de sécurité : {{score}}/10',
      apy: 'Est. {{min}}% – {{max}}% par an',
      apyDisclaimer: 'C\'est une estimation. Les rendements ne sont pas garantis et peuvent changer.',
      minDeposit: 'Minimum : {{amount}} $ USDC',
      deposit: 'Déposer des USDC',
      withdraw: 'Retirer',
      audit: 'Audits de sécurité',
    },
    disclosure: {
      title: 'Veuillez lire avant de continuer',
      acknowledge: 'Je comprends les risques et souhaite continuer',
      cancel: 'Annuler',
    },
    bridge: {
      title: 'Transférer des fonds depuis une autre chaîne',
      subtitle: 'Amenez votre argent sur Solana depuis Ethereum, Polygon, et plus.',
      from: 'Depuis',
      to: 'Vers (USDC sur Solana)',
      getRoutes: 'Trouver le meilleur itinéraire',
      confirm: 'Confirmer le transfert',
      feeWarning: 'Frais totaux : {{fee}}',
      timeWarning: 'Temps estimé : {{time}}',
    },
    wallet: {
      notConnected: 'Connectez un portefeuille pour déposer ou retirer.',
      connect: 'Connecter le portefeuille',
    },
  },

  chat: {
    placeholder: 'Posez une question sur l\'argent...',
    voiceStart: 'Appuyer pour parler',
    voiceStop: 'Appuyer pour arrêter',
    voiceOff: 'Voix désactivée',
    voiceOn: 'Voix activée',
    sending: 'En train de réfléchir...',
    disclaimer: 'SafeHaven fournit des informations, pas des conseils financiers personnels. Consultez un conseiller local pour les grandes décisions.',
    errorFallback: 'Je ne peux pas joindre l\'IA en ce moment. Vous pouvez toujours parcourir les leçons ou vérifier votre solde.',
  },

  settings: {
    title: 'Paramètres',
    language: 'Langue',
    accessibility: {
      title: 'Accessibilité',
      largeText: 'Grand texte',
      highContrast: 'Contraste élevé',
      reducedMotion: 'Réduire les animations',
      haptics: 'Retour vibratoire',
    },
    wallet: {
      title: 'Portefeuille',
      connected: 'Connecté : {{address}}',
      disconnect: 'Déconnecter',
      connect: 'Connecter le portefeuille',
    },
    about: {
      title: 'À propos de SafeHaven',
      version: 'Version {{version}}',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions d\'utilisation',
    },
  },

  a11y: {
    backButton: 'Retour',
    closeButton: 'Fermer',
    menuButton: 'Ouvrir le menu',
    loading: 'Chargement, veuillez patienter',
    success: 'Succès',
    error: 'Erreur',
    required: 'Obligatoire',
    walletAddress: 'Adresse du portefeuille : {{address}}',
    xpProgress: '{{current}} sur {{total}} XP pour le prochain niveau',
    lessonProgress: '{{completed}} sur {{total}} leçons terminées',
  },

  errors: {
    network: 'Pas de connexion internet.',
    walletConnect: 'Impossible de connecter le portefeuille. Assurez-vous qu\'une application portefeuille Solana est installée.',
    depositFailed: 'Dépôt échoué. Réessayez.',
    withdrawFailed: 'Retrait échoué. Réessayez.',
    bridgeFailed: 'Transfert échoué. Vos fonds n\'ont pas bougé. Réessayez.',
    insufficientFunds: 'Pas assez de USDC dans votre portefeuille.',
    belowMinimum: 'Le dépôt minimum est de {{min}} $ USDC.',
    scamWarning: 'Attention : Cela semble suspect. SafeHaven ne vous demandera jamais votre clé privée ou votre phrase secrète.',
  },
};

export default fr;
