/**
 * SafeHaven — Agent Safety Guardrails
 *
 * Two-stage safety system:
 *   1. PRE-LLM: Filter incoming user messages before they reach Claude
 *   2. POST-LLM: Validate and sanitize Claude's responses before sending to app
 *
 * The safety layer CANNOT be bypassed by user input or Claude's output.
 * It runs as middleware on every /api/chat request.
 */

// ─── Pre-LLM Input Filter ─────────────────────────────────────────────────────

/**
 * Topic blocklist — triggers that would prompt Claude to give harmful advice.
 * If any match, we respond with a safe refusal before calling Claude.
 * Responses are localized: en / fr / es.
 */
const BLOCKED_TOPICS: Array<{
  name: string;
  pattern: RegExp;
  responses: Record<string, string>;
}> = [
  {
    name: 'leverage_trading',
    pattern: /\b(leverage|margin\s*trade|leveraged\s*(position|trade|long|short)|10x|100x)\b/i,
    responses: {
      en: 'SafeHaven only supports safe, conservative savings strategies. We do not support leveraged trading, as it can result in losses larger than your initial deposit. Would you like to learn about USDC savings instead?',
      fr: 'SafeHaven propose uniquement des stratégies d\'épargne sécurisées et conservatrices. Nous ne soutenons pas le trading à effet de levier, car il peut entraîner des pertes supérieures à votre dépôt initial. Voulez-vous en savoir plus sur l\'épargne en USDC ?',
      es: 'SafeHaven solo ofrece estrategias de ahorro seguras y conservadoras. No apoyamos el trading con apalancamiento, ya que puede resultar en pérdidas mayores que tu depósito inicial. ¿Te gustaría aprender sobre el ahorro en USDC?',
    },
  },
  {
    name: 'perpetuals_options',
    pattern: /\b(perpetual|perp|options?\s*trading|calls?\s*and\s*puts?|futures?\s*contract)\b/i,
    responses: {
      en: 'SafeHaven does not support derivatives trading like perpetuals or options. These products carry significant risk and are not suitable for most users. Would you like to learn about safer savings options?',
      fr: 'SafeHaven ne propose pas de trading de produits dérivés comme les perpétuels ou les options. Ces produits comportent des risques importants et ne conviennent pas à la plupart des utilisateurs. Voulez-vous découvrir des options d\'épargne plus sécurisées ?',
      es: 'SafeHaven no ofrece trading de derivados como perpetuos u opciones. Estos productos conllevan riesgos significativos y no son adecuados para la mayoría de los usuarios. ¿Te gustaría conocer opciones de ahorro más seguras?',
    },
  },
  {
    name: 'private_key_request',
    pattern: /\b(private\s*key|seed\s*phrase|secret\s*phrase|mnemonic|recovery\s*phrase|12\s*words?|24\s*words?)\b/i,
    responses: {
      en: 'IMPORTANT: Never share your private key, seed phrase, or recovery words with anyone — including SafeHaven. Anyone asking for these is trying to steal your funds. If someone has asked you for this information, please stop immediately.',
      fr: 'IMPORTANT : Ne partagez jamais votre clé privée, phrase de récupération ou mots secrets avec qui que ce soit — y compris SafeHaven. Toute personne demandant ces informations cherche à voler vos fonds. Si quelqu\'un vous a demandé cela, arrêtez immédiatement.',
      es: 'IMPORTANTE: Nunca compartas tu clave privada, frase semilla o palabras de recuperación con nadie, incluido SafeHaven. Cualquiera que las solicite intenta robar tus fondos. Si alguien te ha pedido esta información, detente inmediatamente.',
    },
  },
  {
    name: 'guaranteed_returns',
    pattern: /\b(guaranteed?\s*(returns?|profit|yield|income)|risk\s*free\s*profit|100%\s*(safe|return))\b/i,
    responses: {
      en: 'No investment is guaranteed or risk-free. Anyone promising guaranteed returns is likely a scam. SafeHaven\'s USDC lending strategies have estimated returns of 4–8% per year, but these are not guaranteed and can change. Would you like to learn more about the actual risks?',
      fr: 'Aucun investissement n\'est garanti ou sans risque. Toute personne promettant des rendements garantis est probablement une arnaque. Les stratégies de prêt USDC de SafeHaven ont des rendements estimés de 4 à 8 % par an, mais cela n\'est pas garanti et peut changer.',
      es: 'Ninguna inversión está garantizada ni es libre de riesgos. Quien prometa rendimientos garantizados probablemente sea una estafa. Las estrategias de préstamo USDC de SafeHaven tienen rendimientos estimados del 4–8% anual, pero no están garantizados y pueden cambiar.',
    },
  },
  {
    name: 'tax_advice',
    pattern: /\b(how\s+much\s+tax|tax\s+return|minimize\s+tax|tax\s+evasion|avoid\s+paying\s+tax)\b/i,
    responses: {
      en: 'Tax rules vary significantly by country and personal situation. SafeHaven cannot give tax advice. Please consult a local tax professional or accountant for guidance specific to your situation.',
      fr: 'Les règles fiscales varient considérablement selon les pays et les situations personnelles. SafeHaven ne peut pas donner de conseils fiscaux. Veuillez consulter un professionnel fiscal ou un comptable local pour des conseils adaptés à votre situation.',
      es: 'Las normas fiscales varían significativamente según el país y la situación personal. SafeHaven no puede dar consejos fiscales. Por favor, consulta a un profesional fiscal o contable local para obtener orientación específica para tu situación.',
    },
  },
  {
    name: 'pyramid_scheme',
    pattern: /\b(mlm|pyramid\s*scheme|multi.?level\s*marketing|recruit\s*(friends|people)\s*to\s*(earn|invest)|referral\s*bonus\s*scheme)\b/i,
    responses: {
      en: 'This sounds like it could be a pyramid or multi-level marketing scheme. These are usually scams where early participants profit at the expense of later ones. SafeHaven only recommends regulated, audited DeFi protocols. Please be careful.',
      fr: 'Cela ressemble à une pyramide de Ponzi ou un système de marketing à plusieurs niveaux. Ce sont généralement des arnaques où les premiers participants profitent au détriment des suivants. SafeHaven ne recommande que des protocoles DeFi réglementés et audités. Soyez prudent.',
      es: 'Esto suena como un esquema piramidal o de marketing multinivel. Generalmente son estafas donde los primeros participantes se benefician a expensas de los posteriores. SafeHaven solo recomienda protocolos DeFi regulados y auditados. Por favor, ten cuidado.',
    },
  },
];

export interface InputFilterResult {
  blocked: boolean;
  blockedReason?: string;
  safeResponse?: string;
  sanitizedMessage?: string;
}

/**
 * PII patterns to strip from user input before sending to Claude.
 * We don't need to see phone numbers, IDs, etc. to answer financial questions.
 */
const PII_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'phone', pattern: /(\+?\d[\s\-.]?){10,15}/g },
  { name: 'email', pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { name: 'ssn', pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g },
  { name: 'private_key_hex', pattern: /\b[0-9a-fA-F]{64}\b/g },
  { name: 'base58_key', pattern: /[1-9A-HJ-NP-Za-km-z]{87,88}/g },
  { name: 'credit_card', pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g },
];

/**
 * Filter and sanitize incoming user messages.
 * Returns either a block reason + localized canned response, or the sanitized message.
 */
export function filterInput(message: string, locale = 'en'): InputFilterResult {
  // 1. Check for blocked topics (respond without calling Claude)
  for (const { name, pattern, responses } of BLOCKED_TOPICS) {
    if (pattern.test(message)) {
      console.log(`[Safety] Blocked topic detected: ${name}`);
      return {
        blocked: true,
        blockedReason: name,
        safeResponse: responses[locale] ?? responses['en']!,
      };
    }
  }

  // 2. Strip PII before sending to Claude
  let sanitized = message;
  for (const { name, pattern } of PII_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.log(`[Safety] PII stripped: ${name}`);
      sanitized = sanitized.replace(pattern, `[${name}_REDACTED]`);
    }
  }

  // 3. Length limit (prevent abuse / injection via very long messages)
  if (sanitized.length > 2000) {
    sanitized = sanitized.slice(0, 2000) + '...';
  }

  return { blocked: false, sanitizedMessage: sanitized };
}

// ─── Post-LLM Output Filter ───────────────────────────────────────────────────

/**
 * Patterns that should never appear in Claude's response.
 * If found, the offending content is replaced with a safe alternative.
 */
const RESPONSE_FILTERS: Array<{
  pattern: RegExp;
  replacement: string;
}> = [
  // Never include executable Solana transaction data
  {
    pattern: /\b[A-Za-z0-9+/=]{200,}\b/g, // Base64-encoded blobs
    replacement: '[transaction_data_removed]',
  },
  // Never include raw private key material
  {
    pattern: /[1-9A-HJ-NP-Za-km-z]{87,88}/g,
    replacement: '[key_data_removed]',
  },
  // Never include raw 32-byte hex keys
  {
    pattern: /\b[0-9a-fA-F]{64}\b/g,
    replacement: '[key_data_removed]',
  },
];

export interface OutputFilterResult {
  clean: string;
  wasModified: boolean;
  modifications: string[];
}

/**
 * Sanitize Claude's response before sending to the mobile app.
 * Removes any accidentally included sensitive data.
 */
export function filterOutput(response: string): OutputFilterResult {
  let clean = response;
  const modifications: string[] = [];

  for (const { pattern, replacement } of RESPONSE_FILTERS) {
    if (pattern.test(clean)) {
      modifications.push(pattern.source.slice(0, 50));
      clean = clean.replace(pattern, replacement);
    }
  }

  return {
    clean,
    wasModified: modifications.length > 0,
    modifications,
  };
}

// ─── Response Quality Checks ──────────────────────────────────────────────────

/**
 * Verify that financial advice responses include appropriate disclaimers.
 * Claude is prompted to include them, but this is a belt-and-suspenders check.
 */
const FINANCIAL_ADVICE_TRIGGERS = [
  /\binvest\b/i,
  /\bdeposit\b/i,
  /\bstrategy\b/i,
  /\bAPY\b/i,
  /\byield\b/i,
  /\blending\b/i,
];

const DISCLAIMER_PATTERNS = [
  /not\s*(financial|investment)\s*advice/i,
  /consult\s*a\s*(financial|local)\s*advisor/i,
  /not\s*guaranteed/i,
  /past\s*performance/i,
];

/**
 * Check if a response that contains financial advice also contains a disclaimer.
 * If not, append a standard disclaimer.
 */
export function ensureDisclaimer(response: string, locale = 'en'): string {
  const hasFinancialAdvice = FINANCIAL_ADVICE_TRIGGERS.some((p) => p.test(response));
  const hasDisclaimer = DISCLAIMER_PATTERNS.some((p) => p.test(response));

  if (hasFinancialAdvice && !hasDisclaimer) {
    const disclaimers: Record<string, string> = {
      en: '\n\n*This is information, not financial advice. Returns are not guaranteed. Please consult a local financial advisor for major decisions.*',
      fr: '\n\n*Il s\'agit d\'informations, pas de conseils financiers. Les rendements ne sont pas garantis. Consultez un conseiller financier local pour les décisions importantes.*',
      es: '\n\n*Esta es información, no asesoramiento financiero. Los rendimientos no están garantizados. Consulta a un asesor financiero local para decisiones importantes.*',
    };
    return response + (disclaimers[locale] ?? disclaimers['en']!);
  }

  return response;
}

// ─── Scam Detection ───────────────────────────────────────────────────────────

const SCAM_INDICATORS = [
  /guaranteed?\s*(return|profit|gain)/i,
  /double\s*(your\s*)?(money|investment)/i,
  /risk\s*free\s*(investment|crypto)/i,
  /100%\s*(safe|guaranteed)/i,
  /private\s*key/i,
  /seed\s*phrase/i,
];

export interface ScamCheckResult {
  isSuspicious: boolean;
  warningMessage?: string;
}

/**
 * Check if a message the user received (e.g., from another source)
 * shows signs of being a scam. Used when user asks "is this legitimate?"
 */
export function checkForScam(text: string): ScamCheckResult {
  const matched = SCAM_INDICATORS.filter((p) => p.test(text));

  if (matched.length === 0) {
    return { isSuspicious: false };
  }

  return {
    isSuspicious: true,
    warningMessage:
      'WARNING: This message shows signs of a scam. Legitimate financial services never guarantee returns, never promise to "double your money," and will NEVER ask for your private key or seed phrase. Please do not send any money or share any wallet information.',
  };
}
