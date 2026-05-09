/**
 * SafeHaven — Client-Side Security Layer
 *
 * Guards against:
 *   - PII leakage to the agent backend
 *   - Phishing / scam links in AI responses
 *   - Malformed strategy responses
 *   - Users bypassing risk disclosures
 *   - Suspicious agent instructions
 *
 * This module runs BEFORE any data leaves the device and AFTER any
 * data arrives from the agent.
 */

import { z } from 'zod';
import type { Strategy } from '@defi/strategies';

// ─── PII Scrubbing ────────────────────────────────────────────────────────────

/**
 * Patterns for PII that should never be sent to the agent backend.
 * Regex patterns are conservative — prefer false positives.
 */
const PII_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  // Phone numbers (international formats)
  { name: 'phone', pattern: /(\+?\d[\s\-.]?){10,15}/g },
  // Email addresses
  { name: 'email', pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  // Government ID patterns (generic)
  { name: 'national_id', pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g }, // US SSN format
  // Wallet seed phrases (12 or 24 word patterns)
  {
    name: 'seed_phrase',
    pattern:
      /\b([a-z]+\s+){11}[a-z]+\b|\b([a-z]+\s+){23}[a-z]+\b/gi,
  },
  // Private key patterns (base58 64-char strings common in crypto)
  { name: 'private_key', pattern: /[1-9A-HJ-NP-Za-km-z]{87,88}/g },
  // Credit card numbers
  { name: 'credit_card', pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g },
];

/**
 * Remove PII from a user message before sending to the agent.
 * Replaces detected PII with a placeholder.
 */
export function stripPII(text: string): { cleaned: string; detected: string[] } {
  let cleaned = text;
  const detected: string[] = [];

  for (const { name, pattern } of PII_PATTERNS) {
    const matches = cleaned.match(pattern);
    if (matches && matches.length > 0) {
      detected.push(name);
      cleaned = cleaned.replace(pattern, `[${name.toUpperCase()}_REMOVED]`);
    }
  }

  return { cleaned, detected };
}

// ─── Scam / Phishing Detection ────────────────────────────────────────────────

/**
 * Patterns and keywords associated with scams, phishing, and fraud.
 * Used to flag suspicious content in agent responses.
 */
const SCAM_PATTERNS = [
  // Direct key requests
  /private\s*key/i,
  /seed\s*phrase/i,
  /recovery\s*phrase/i,
  /secret\s*words/i,
  /mnemonic/i,
  // Guaranteed returns
  /guaranteed?\s*(return|profit|gain|yield)/i,
  /risk[\s-]free\s*(investment|profit)/i,
  /100%\s*(safe|guaranteed|profit)/i,
  // Impersonation
  /official\s*safehaven/i,
  /safehaven\s*team\s*(is\s*asking|needs|requires)/i,
  // Urgency / pressure tactics
  /act\s*now\s*or\s*lose/i,
  /limited\s*time\s*offer/i,
  /your\s*account\s*will\s*be\s*(closed|frozen|suspended)/i,
  // "Double your money" patterns
  /double\s*(your\s*)?(money|investment|crypto)/i,
  /multiply\s*(your\s*)?(money|investment)\s*by/i,
  // Suspicious link patterns
  /bit\.ly\//i,
  /tinyurl\.com\//i,
  /t\.me\//i, // Telegram links in finance advice
];

export interface ScanResult {
  suspicious: boolean;
  flags: string[];
  severity: 'low' | 'medium' | 'high';
}

/**
 * Scan agent response text for scam / phishing indicators.
 * Call on every incoming agent message.
 */
export function scanForScams(text: string): ScanResult {
  const flags: string[] = [];

  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(text)) {
      flags.push(pattern.source);
    }
  }

  const suspicious = flags.length > 0;
  const severity =
    flags.length >= 3 ? 'high' : flags.length >= 1 ? 'medium' : 'low';

  return { suspicious, flags, severity };
}

/**
 * Detect suspicious URLs in text.
 * Returns list of URLs that should be warned about.
 */
export function detectSuspiciousLinks(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlPattern) ?? [];

  // Allowlist of known-safe domains
  const SAFE_DOMAINS = new Set([
    'kamino.finance',
    'marginfi.com',
    'li.fi',
    'solana.com',
    'jup.ag',
    'solscan.io',
    'explorer.solana.com',
    'anthropic.com',
    'elevenlabs.io',
    'safehaven.app',
  ]);

  return urls.filter((url) => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      return !SAFE_DOMAINS.has(domain);
    } catch {
      return true; // Malformed URL — flag it
    }
  });
}

// ─── Strategy Response Validation ─────────────────────────────────────────────

/**
 * Zod schema for a validated strategy recommendation from the agent.
 * Ensures the agent cannot inject unexpected fields.
 */
const StrategyRecommendationSchema = z.object({
  strategyId: z.string(),
  explanation: z.string().max(2000),
  riskScore: z.number().min(1).max(3), // Only conservative (1–3) for novice users
  estimatedApy: z.object({
    min: z.number().min(0).max(50),
    max: z.number().min(0).max(50),
  }),
  disclaimer: z.string().min(50), // Disclaimer must be present and non-trivial
  requiresDisclosureAck: z.literal(true), // Always required
});

export type ValidatedStrategyRecommendation = z.infer<
  typeof StrategyRecommendationSchema
>;

/**
 * Validate a strategy recommendation received from the agent.
 * Returns null if validation fails — never show unvalidated strategy data.
 */
export function validateStrategyResponse(
  data: unknown,
): ValidatedStrategyRecommendation | null {
  const result = StrategyRecommendationSchema.safeParse(data);
  if (!result.success) {
    console.error(
      '[Security] Strategy response validation failed:',
      result.error.flatten(),
    );
    return null;
  }
  return result.data;
}

// ─── Disclosure Enforcement ───────────────────────────────────────────────────

/**
 * Token issued when a user has acknowledged a risk disclosure.
 * Expires after 30 minutes — requires re-acknowledgement for subsequent deposits.
 */
export interface DisclosureToken {
  strategyId: string;
  acknowledgedAt: number; // Unix timestamp (ms)
  expiresAt: number;
}

const DISCLOSURE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Create a disclosure acknowledgement token.
 */
export function createDisclosureToken(strategyId: string): DisclosureToken {
  const now = Date.now();
  return {
    strategyId,
    acknowledgedAt: now,
    expiresAt: now + DISCLOSURE_EXPIRY_MS,
  };
}

/**
 * Validate that a disclosure token is still valid for a given strategy.
 */
export function isDisclosureValid(
  token: DisclosureToken | null,
  strategyId: string,
): boolean {
  if (!token) return false;
  if (token.strategyId !== strategyId) return false;
  if (Date.now() > token.expiresAt) return false;
  return true;
}

// ─── Deposit Guard ────────────────────────────────────────────────────────────

const MAX_SINGLE_DEPOSIT_USDC = 1000; // Anti-fraud: max per session
const MIN_DEPOSIT_USDC = 5;

export interface DepositGuardResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Run pre-deposit safety checks.
 * Call before building any deposit transaction.
 */
export function guardDeposit(
  amountUSDC: number,
  strategy: Strategy,
  disclosureToken: DisclosureToken | null,
): DepositGuardResult {
  if (amountUSDC < MIN_DEPOSIT_USDC) {
    return {
      allowed: false,
      reason: `Minimum deposit is $${MIN_DEPOSIT_USDC} USDC.`,
    };
  }

  if (amountUSDC > MAX_SINGLE_DEPOSIT_USDC) {
    return {
      allowed: false,
      reason: `Maximum single deposit is $${MAX_SINGLE_DEPOSIT_USDC} USDC for safety. Please contact support to increase this limit.`,
    };
  }

  if (amountUSDC < strategy.minDepositUSDC) {
    return {
      allowed: false,
      reason: `This strategy requires a minimum of $${strategy.minDepositUSDC} USDC.`,
    };
  }

  if (!isDisclosureValid(disclosureToken, strategy.id)) {
    return {
      allowed: false,
      reason: 'You must acknowledge the risk disclosure before depositing.',
    };
  }

  if (strategy.riskScore > 3) {
    return {
      allowed: false,
      reason: 'This strategy is not available for your current level. Complete more lessons to unlock it.',
    };
  }

  return { allowed: true };
}
