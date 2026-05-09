/**
 * SafeHaven — Spanish Translation Bundle
 *
 * Writing guidelines:
 *   - Nivel de lectura: equivalente a 6° grado
 *   - Sin jerga financiera sin explicación inmediata
 *   - Tono amigable, alentador, nunca condescendiente
 *   - Español neutro (para LATAM)
 */

const es = {
  app: {
    name: 'SafeHaven',
    tagline: 'Tu guía de dinero con IA',
    loading: 'Cargando...',
    error: {
      generic: 'Algo salió mal. Por favor, inténtalo de nuevo.',
      network: 'Sin conexión a internet. Algunas funciones pueden no estar disponibles.',
      wallet: 'No se pudo conectar tu billetera. Por favor, inténtalo de nuevo.',
    },
  },

  nav: {
    home: 'Inicio',
    learn: 'Aprender',
    defi: 'Ahorrar',
    settings: 'Ajustes',
  },

  onboarding: {
    welcome: {
      title: 'Bienvenido a SafeHaven',
      subtitle: 'Tu guía de IA para manejar y hacer crecer tu dinero — de forma segura.',
      cta: 'Comenzar',
    },
    language: {
      title: 'Elige tu idioma',
      subtitle: 'SafeHaven habla tu idioma.',
    },
    goals: {
      title: '¿Cuál es tu objetivo principal?',
      options: {
        learn: 'Aprender sobre el dinero',
        save: 'Ahorrar de forma segura',
        grow: 'Hacer crecer mis ahorros',
        protect: 'Proteger lo que tengo',
      },
    },
    riskProfile: {
      title: 'Cuéntanos sobre ti',
      capitalQuestion: '¿Cuánto dinero piensas ahorrar o invertir?',
      capitalOptions: ['Menos de $50', '$50 – $200', '$200 – $1,000', 'Más de $1,000'],
      goalQuestion: '¿Cuál es tu objetivo principal de ahorro?',
      goalOptions: ['Fondo de emergencia', 'Gastos diarios', 'Compra futura', 'Jubilación'],
      toleranceQuestion: 'Si tus ahorros bajaran un 10%, ¿qué harías?',
      toleranceOptions: [
        'Retiraría todo de inmediato',
        'Me preocuparía pero esperaría',
        'Me mantendría tranquilo y esperaría',
        'Agregaría más dinero',
      ],
    },
    wallet: {
      title: 'Conecta tu billetera',
      subtitle: 'SafeHaven nunca guarda tu dinero. Siempre tú tienes el control.',
      cta: 'Conectar billetera',
      skip: 'Omitir por ahora',
      notice: 'Tus claves privadas permanecen en tu aplicación de billetera en todo momento.',
    },
  },

  home: {
    greeting: '¡Hola, {{name}}!',
    greetingGeneric: '¡Hola!',
    balance: {
      title: 'Tus ahorros',
      usdc: 'Saldo USDC',
      earning: 'Ganando actualmente',
      apy: '{{apy}}% por año (estimado)',
    },
    askAgent: {
      placeholder: 'Pregúntame cualquier cosa sobre tu dinero...',
      voiceHint: 'O toca el micrófono para hablar',
      micLabel: 'Iniciar entrada de voz',
      sendLabel: 'Enviar mensaje',
    },
    quickActions: {
      learn: 'Continuar aprendiendo',
      deposit: 'Agregar ahorros',
      withdraw: 'Retirar',
      bridge: 'Mover fondos',
    },
    progress: {
      title: 'Tu progreso',
      xp: '{{xp}} XP',
      tier: 'Nivel: {{tier}}',
      nextLevel: '{{xp}} XP para el siguiente nivel',
    },
  },

  learn: {
    title: 'Aprender',
    subtitle: 'Desarrolla tus habilidades financieras paso a paso.',
    startLesson: 'Comenzar lección',
    continueLesson: 'Continuar',
    completed: 'Completado',
    locked: 'Completa las lecciones anteriores para desbloquear',
    quiz: {
      title: 'Verificación rápida',
      submit: 'Enviar respuesta',
      correct: '¡Correcto! Bien hecho.',
      incorrect: 'No del todo — aquí está la respuesta correcta:',
      next: 'Siguiente',
      finish: 'Terminar lección',
    },
    badge: {
      earned: '¡Insignia obtenida!',
      view: 'Ver todas las insignias',
    },
    xp: {
      earned: '+{{xp}} XP',
    },
    tiers: {
      novice: 'Novato',
      saver: 'Ahorrador',
      investor: 'Inversor',
    },
  },

  defi: {
    title: 'Ahorrar',
    subtitle: 'Haz crecer tus ahorros en USDC de forma segura.',
    strategies: {
      title: 'Estrategias disponibles',
      riskScore: 'Puntuación de seguridad: {{score}}/10',
      apy: 'Est. {{min}}% – {{max}}% por año',
      apyDisclaimer: 'Esto es una estimación. Los rendimientos no están garantizados y pueden cambiar.',
      minDeposit: 'Mínimo: ${{amount}} USDC',
      deposit: 'Depositar USDC',
      withdraw: 'Retirar',
      audit: 'Auditorías de seguridad',
    },
    disclosure: {
      title: 'Por favor lee antes de continuar',
      acknowledge: 'Entiendo los riesgos y deseo continuar',
      cancel: 'Cancelar',
    },
    bridge: {
      title: 'Mover fondos desde otra cadena',
      subtitle: 'Lleva tu dinero a Solana desde Ethereum, Polygon y más.',
      from: 'Desde',
      to: 'Hacia (USDC en Solana)',
      getRoutes: 'Encontrar la mejor ruta',
      confirm: 'Confirmar transferencia',
      feeWarning: 'Comisiones totales: {{fee}}',
      timeWarning: 'Tiempo estimado: {{time}}',
    },
    wallet: {
      notConnected: 'Conecta una billetera para depositar o retirar.',
      connect: 'Conectar billetera',
    },
  },

  chat: {
    placeholder: 'Haz una pregunta sobre el dinero...',
    voiceStart: 'Toca para hablar',
    voiceStop: 'Toca para detener',
    voiceOff: 'Voz desactivada',
    voiceOn: 'Voz activada',
    sending: 'Pensando...',
    disclaimer: 'SafeHaven brinda información, no asesoramiento financiero personal. Consulta un asesor local para decisiones importantes.',
    errorFallback: 'No pude conectarme a la IA ahora mismo. Aún puedes navegar las lecciones o verificar tu saldo.',
  },

  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    accessibility: {
      title: 'Accesibilidad',
      largeText: 'Texto grande',
      highContrast: 'Alto contraste',
      reducedMotion: 'Reducir animaciones',
      haptics: 'Vibración de retroalimentación',
    },
    wallet: {
      title: 'Billetera',
      connected: 'Conectado: {{address}}',
      disconnect: 'Desconectar',
      connect: 'Conectar billetera',
    },
    about: {
      title: 'Acerca de SafeHaven',
      version: 'Versión {{version}}',
      privacy: 'Política de privacidad',
      terms: 'Términos de servicio',
    },
  },

  a11y: {
    backButton: 'Volver',
    closeButton: 'Cerrar',
    menuButton: 'Abrir menú',
    loading: 'Cargando, por favor espera',
    success: 'Éxito',
    error: 'Error',
    required: 'Obligatorio',
    walletAddress: 'Dirección de billetera: {{address}}',
    xpProgress: '{{current}} de {{total}} XP para el siguiente nivel',
    lessonProgress: '{{completed}} de {{total}} lecciones completadas',
  },

  errors: {
    network: 'Sin conexión a internet.',
    walletConnect: 'No se pudo conectar la billetera. Asegúrate de que haya una aplicación de billetera Solana instalada.',
    depositFailed: 'Depósito fallido. Por favor, inténtalo de nuevo.',
    withdrawFailed: 'Retiro fallido. Por favor, inténtalo de nuevo.',
    bridgeFailed: 'Transferencia fallida. Tus fondos no se movieron. Por favor, inténtalo de nuevo.',
    insufficientFunds: 'No hay suficiente USDC en tu billetera.',
    belowMinimum: 'El depósito mínimo es ${{min}} USDC.',
    scamWarning: 'Advertencia: Esto parece sospechoso. SafeHaven nunca te pedirá tu clave privada ni tu frase semilla.',
  },
};

export default es;
