// @ts-nocheck
import { createContext, useContext, useState, useCallback } from 'react';

const TRANSLATIONS = {
  en: {
    'nav.overview':   'Overview',
    'nav.education':  'Education',
    'nav.platform':   'Platform',
    'nav.chat':       'AI Coach',
    'nav.settings':   'Settings',
    'nav.logout':     'Logout',

    'common.start':    'Start',
    'common.continue': 'Continue',
    'common.complete': 'Complete',
    'common.next':     'Next',
    'common.back':     'Back',
    'common.check':    'Check',
    'common.correct':  'Correct!',
    'common.wrong':    'Wrong answer',
    'common.skip':     'Skip',
    'common.locked':   'Locked',

    'edu.world1':          '💰 Money Fundamentals',
    'edu.world2':          '🛡️ Protect Your Money',
    'edu.world3':          '⛓️ Blockchain & Wallets',
    'edu.world4':          '🌾 DeFi & Yields',
    'edu.world5':          '🌉 Bridge & Grow',
    'edu.xp_earned':       'XP Earned',
    'edu.level_up':        'Level Up!',
    'edu.chapter_complete':'Chapter Complete',
    'edu.boss_challenge':  'Boss Challenge',
    'edu.novice':          'Novice',
    'edu.apprentice':      'Apprentice',
    'edu.saver':           'Saver',
    'edu.investor':        'Investor',
    'edu.master':          'DeFi Master',
    'edu.lessons_done':    'Lessons Done',
    'edu.total_xp':        'Total XP',
    'edu.your_progress':   'Your Progress',
    'edu.next_lesson':     'Next lesson →',

    'settings.language': 'Language',
    'settings.account':  'Account',
    'settings.security': 'Security',
    'settings.about':    'About',

    'auth.login_title':    'Welcome back',
    'auth.register_title': 'Create an account',
    'auth.email':          'Email',
    'auth.password':       'Password',
    'auth.name':           'Full name',
    'auth.login_btn':      'Sign in',
    'auth.register_btn':   'Create account',
    'auth.no_account':     "Don't have an account?",
    'auth.have_account':   'Already have an account?',

    'voice.placeholder_en': 'Ask Coco a question…',
    'voice.placeholder_fr': 'Posez une question à Coco…',
    'voice.placeholder_es': 'Hazle una pregunta a Coco…',

    'overview.welcome':      'Welcome, {name} 👋',
    'overview.subtitle':     'Here is an overview of your financial progress.',
    'overview.quick_actions':'Quick actions',
    'overview.mission_title':'Mission Safe Haven Money',
    'overview.mission_body': 'Providing access to financial education and secure DeFi tools on Solana for unbanked populations in Africa and Latin America.',

    'settings.title':        'Settings',
    'settings.subtitle':     'Manage your Safe Haven Money account.',
    'settings.profile':      'Profile',
    'settings.profile_desc': 'Your account information.',
    'settings.name':         'Name',
    'settings.email':        'Email',
    'settings.profile_soon': 'Profile editing coming soon.',
    'settings.secure_auth':  'Secure Authentication',
    'settings.secure_auth_desc': 'Your session is protected by a JWT token (7 days). Your password is hashed with bcrypt.',
    'settings.about_desc':   'Safe Haven Money is a financial education platform and secure access to DeFi tools on Solana, designed for unbanked populations in Africa and Latin America. Powered by Claude (Anthropic) · ElevenLabs · LI.FI.',
  },

  fr: {
    'nav.overview':   'Vue d\'ensemble',
    'nav.education':  'Éducation',
    'nav.platform':   'Plateforme',
    'nav.chat':       'Coach IA',
    'nav.settings':   'Paramètres',
    'nav.logout':     'Déconnexion',

    'common.start':    'Commencer',
    'common.continue': 'Continuer',
    'common.complete': 'Terminer',
    'common.next':     'Suivant',
    'common.back':     'Retour',
    'common.check':    'Vérifier',
    'common.correct':  'Correct !',
    'common.wrong':    'Mauvaise réponse',
    'common.skip':     'Passer',
    'common.locked':   'Verrouillé',

    'edu.world1':          '💰 Bases de l\'Argent',
    'edu.world2':          '🛡️ Protéger Son Argent',
    'edu.world3':          '⛓️ Blockchain & Wallets',
    'edu.world4':          '🌾 DeFi & Rendements',
    'edu.world5':          '🌉 Bridge & Croissance',
    'edu.xp_earned':       'XP Gagnés',
    'edu.level_up':        'Niveau Supérieur !',
    'edu.chapter_complete':'Chapitre Terminé',
    'edu.boss_challenge':  'Défi du Boss',
    'edu.novice':          'Novice',
    'edu.apprentice':      'Apprenti',
    'edu.saver':           'Épargnant',
    'edu.investor':        'Investisseur',
    'edu.master':          'Maître DeFi',
    'edu.lessons_done':    'Leçons Terminées',
    'edu.total_xp':        'XP Total',
    'edu.your_progress':   'Votre Progression',
    'edu.next_lesson':     'Leçon suivante →',

    'settings.language': 'Langue',
    'settings.account':  'Compte',
    'settings.security': 'Sécurité',
    'settings.about':    'À propos',

    'auth.login_title':    'Bon retour',
    'auth.register_title': 'Créer un compte',
    'auth.email':          'Email',
    'auth.password':       'Mot de passe',
    'auth.name':           'Nom complet',
    'auth.login_btn':      'Se connecter',
    'auth.register_btn':   'Créer un compte',
    'auth.no_account':     'Pas encore de compte ?',
    'auth.have_account':   'Déjà un compte ?',

    'voice.placeholder_en': 'Ask Coco a question…',
    'voice.placeholder_fr': 'Posez une question à Coco…',
    'voice.placeholder_es': 'Hazle una pregunta a Coco…',

    'overview.welcome':      'Bienvenue, {name} 👋',
    'overview.subtitle':     'Voici un aperçu de votre progression financière.',
    'overview.quick_actions':'Actions rapides',
    'overview.mission_title':'Mission Safe Haven Money',
    'overview.mission_body': 'Donner accès à l\'éducation financière et aux outils DeFi sécurisés sur Solana aux populations non bancarisées d\'Afrique et d\'Amérique Latine.',

    'settings.title':        'Paramètres',
    'settings.subtitle':     'Gérez votre compte Safe Haven Money.',
    'settings.profile':      'Profil',
    'settings.profile_desc': 'Vos informations de compte.',
    'settings.name':         'Nom',
    'settings.email':        'Email',
    'settings.profile_soon': 'La modification du profil sera disponible prochainement.',
    'settings.secure_auth':  'Authentification sécurisée',
    'settings.secure_auth_desc': 'Votre session est protégée par un jeton JWT (7 jours). Votre mot de passe est haché avec bcrypt.',
    'settings.about_desc':   'Safe Haven Money est une plateforme d\'éducation financière et d\'accès sécurisé aux outils DeFi sur Solana, conçue pour les populations non bancarisées d\'Afrique et d\'Amérique Latine. Propulsé par Claude (Anthropic) · ElevenLabs · LI.FI.',
  },

  es: {
    'nav.overview':   'Resumen',
    'nav.education':  'Educación',
    'nav.platform':   'Plataforma',
    'nav.chat':       'Coach IA',
    'nav.settings':   'Ajustes',
    'nav.logout':     'Cerrar sesión',

    'common.start':    'Comenzar',
    'common.continue': 'Continuar',
    'common.complete': 'Completar',
    'common.next':     'Siguiente',
    'common.back':     'Atrás',
    'common.check':    'Verificar',
    'common.correct':  '¡Correcto!',
    'common.wrong':    'Respuesta incorrecta',
    'common.skip':     'Saltar',
    'common.locked':   'Bloqueado',

    'edu.world1':          '💰 Fundamentos del Dinero',
    'edu.world2':          '🛡️ Proteger Tu Dinero',
    'edu.world3':          '⛓️ Blockchain y Wallets',
    'edu.world4':          '🌾 DeFi y Rendimientos',
    'edu.world5':          '🌉 Bridge y Crecimiento',
    'edu.xp_earned':       'XP Ganados',
    'edu.level_up':        '¡Subiste de Nivel!',
    'edu.chapter_complete':'Capítulo Completo',
    'edu.boss_challenge':  'Desafío del Jefe',
    'edu.novice':          'Novato',
    'edu.apprentice':      'Aprendiz',
    'edu.saver':           'Ahorrador',
    'edu.investor':        'Inversor',
    'edu.master':          'Maestro DeFi',
    'edu.lessons_done':    'Lecciones Completadas',
    'edu.total_xp':        'XP Total',
    'edu.your_progress':   'Tu Progreso',
    'edu.next_lesson':     'Siguiente lección →',

    'settings.language': 'Idioma',
    'settings.account':  'Cuenta',
    'settings.security': 'Seguridad',
    'settings.about':    'Acerca de',

    'auth.login_title':    'Bienvenido de nuevo',
    'auth.register_title': 'Crear una cuenta',
    'auth.email':          'Correo electrónico',
    'auth.password':       'Contraseña',
    'auth.name':           'Nombre completo',
    'auth.login_btn':      'Iniciar sesión',
    'auth.register_btn':   'Crear cuenta',
    'auth.no_account':     '¿No tienes una cuenta?',
    'auth.have_account':   '¿Ya tienes una cuenta?',

    'voice.placeholder_en': 'Ask Coco a question…',
    'voice.placeholder_fr': 'Posez une question à Coco…',
    'voice.placeholder_es': 'Hazle una pregunta a Coco…',

    'overview.welcome':      'Bienvenido, {name} 👋',
    'overview.subtitle':     'Aquí tienes un resumen de tu progreso financiero.',
    'overview.quick_actions':'Acciones rápidas',
    'overview.mission_title':'Misión Safe Haven Money',
    'overview.mission_body': 'Proporcionar acceso a educación financiera y herramientas DeFi seguras en Solana para poblaciones no bancarizadas en África y América Latina.',

    'settings.title':        'Ajustes',
    'settings.subtitle':     'Gestiona tu cuenta Safe Haven Money.',
    'settings.profile':      'Perfil',
    'settings.profile_desc': 'Tu información de cuenta.',
    'settings.name':         'Nombre',
    'settings.email':        'Correo electrónico',
    'settings.profile_soon': 'La edición de perfil estará disponible próximamente.',
    'settings.secure_auth':  'Autenticación segura',
    'settings.secure_auth_desc': 'Tu sesión está protegida por un token JWT (7 días). Tu contraseña está cifrada con bcrypt.',
    'settings.about_desc':   'Safe Haven Money es una plataforma de educación financiera y acceso seguro a herramientas DeFi en Solana, diseñada para poblaciones no bancarizadas en África y América Latina. Impulsado por Claude (Anthropic) · ElevenLabs · LI.FI.',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('shm_lang');
      if (saved && ['en', 'fr', 'es'].includes(saved)) return saved;
    } catch (_) { /* ignore */ }
    return 'en';
  });

  const switchLang = useCallback((newLang) => {
    if (!['en', 'fr', 'es'].includes(newLang)) return;
    setLang(newLang);
    try { localStorage.setItem('shm_lang', newLang); } catch (_) { /* ignore */ }
  }, []);

  const t = useCallback((key) => {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en']?.[key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t, switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

export default LanguageContext;
