/**
 * SafeHaven — Anthropic Claude Client  (v2)
 *
 * Changes from v1:
 *   - System prompt loaded from system-prompt.md (single source of truth)
 *   - Per-request context injection: language, tier, risk score, goals, capital
 *   - Voice-mode flag: strips markdown for natural speech output
 *   - Financial distress detection with severity levels
 *   - Conversation summarisation support (server-side, called by memory route)
 *   - Tool definitions expanded: confirm_action (on-chain gate), detect_scam
 *
 * Architecture:
 *   buildSystemPrompt(ctx)  → fills {{template}} variables in the markdown
 *   streamChat(msgs, ctx)   → streaming generator, yields text deltas
 *   chat(msgs, ctx)         → non-streaming, returns { content, toolUse }
 *   summariseHistory(turns) → compress older turns into a summary paragraph
 *   detectDistress(text)    → lightweight pattern scan before calling Claude
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL   = process.env['ANTHROPIC_MODEL']      ?? 'claude-sonnet-4-5';
const MAX_TOK = parseInt(process.env['ANTHROPIC_MAX_TOKENS'] ?? '1500', 10);
const SUM_TOK = parseInt(process.env['ANTHROPIC_SUMMARY_TOKENS'] ?? '400', 10);

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

// ─── System prompt template ────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_TEMPLATE = fs.readFileSync(
  path.join(__dirname, 'system-prompt.md'),
  'utf8',
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type UserTier = 'novice' | 'saver' | 'investor';
export type SupportedLocale = 'en' | 'fr' | 'es' | 'pt' | 'sw' | 'ha' | 'ar';

export interface ConversationContext {
  locale?: SupportedLocale;
  userTier?: UserTier;
  riskScore?: number;
  goals?: string[];
  monthlyCapitalUSD?: number;
  walletType?: 'starter' | 'mwa';
  /** If true, response is for TTS — strip markdown, use natural speech */
  voiceMode?: boolean;
  /** Summary of turns older than the 20-turn window */
  conversationSummary?: string;
}

export interface DistressSignal {
  level: 'none' | 'financial' | 'emotional' | 'crisis';
  triggers: string[];
}

export interface ChatResult {
  content: string;
  toolUse: Anthropic.ToolUseBlock | null;
  distress: DistressSignal;
  tokensUsed: number;
}

// ─── Locale display names ─────────────────────────────────────────────────────

const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  pt: 'Portuguese (Português)',
  sw: 'Swahili (Kiswahili)',
  ha: 'Hausa',
  ar: 'Arabic (العربية)',
};

// ─── System prompt builder ────────────────────────────────────────────────────

/**
 * Fill all {{template}} variables in the master system prompt.
 * Adds voice-mode and conversation-summary addenda.
 */
export function buildSystemPrompt(ctx: ConversationContext = {}): string {
  const {
    locale = 'en',
    userTier = 'novice',
    riskScore = 1,
    goals = [],
    monthlyCapitalUSD = 0,
    walletType = 'starter',
    voiceMode = false,
    conversationSummary,
  } = ctx;

  const languageName = LOCALE_NAMES[locale] ?? 'English';
  const goalsText = goals.length > 0 ? goals.join(', ') : 'not yet specified';
  const capitalText =
    monthlyCapitalUSD === 0
      ? 'just getting started'
      : `$${monthlyCapitalUSD} per month`;

  let prompt = PROMPT_TEMPLATE
    .replace(/\{\{language\}\}/g,         languageName)
    .replace(/\{\{user_tier\}\}/g,         userTier)
    .replace(/\{\{risk_score\}\}/g,        String(riskScore))
    .replace(/\{\{goals\}\}/g,             goalsText)
    .replace(/\{\{monthly_capital\}\}/g,   capitalText)
    .replace(/\{\{wallet_type\}\}/g,       walletType);

  // Reminder injected after all template replacements — extra enforcement
  prompt += `\n\n## 🌐 Language reminder\nRespond in **${languageName}** only. Every word. No exceptions.`;

  if (voiceMode) {
    prompt += `

## VOICE MODE ACTIVE [VOICE]
This response will be read aloud via text-to-speech. Rules:
- NO markdown: no **, no ##, no bullets (-), no *italics*, no backticks.
- Use natural spoken language. Short sentences. Use "..." for brief pauses.
- Say numbers as words: "$50" → "fifty dollars", "4-8% APY" → "four to eight percent per year".
- End with a warm spoken sign-off, e.g. "You've got this! Talk soon."
- Maximum 120 words.`;
  }

  if (conversationSummary) {
    prompt += `

## Earlier conversation summary
The following is a compressed summary of earlier turns in this session. Use it for context but do not reference it directly:

${conversationSummary}`;
  }

  return prompt;
}

// ─── Distress detection ────────────────────────────────────────────────────────

const CRISIS_PATTERNS: RegExp[] = [
  /don't want to (live|be here|exist|continue)/i,
  /end (my|this) life/i,
  /kill (myself|me)/i,
  /no reason to live/i,
  /suicide/i,
  /self.harm/i,
];

const EMOTIONAL_PATTERNS: RegExp[] = [
  /lost everything/i,
  /can't (pay|afford|eat|feed)/i,
  /scammed (me|out of)/i,
  /sent.*to (someone|a person|a man|a woman) (I|i) met online/i,
  /can't stop (gambling|betting|losing)/i,
  /need to win (it|everything|it all) back/i,
  /desperate/i,
  /hopeless/i,
];

const FINANCIAL_DISTRESS_PATTERNS: RegExp[] = [
  /can't pay (rent|bills|mortgage)/i,
  /going (broke|bankrupt)/i,
  /lost (my savings|my money|everything I had)/i,
  /debt (collector|spiral)/i,
  /overdue (bills|rent|loan)/i,
];

/**
 * Lightweight pre-LLM scan for distress signals in the user's message.
 * Used to decide whether to inject distress-protocol context and slow down.
 */
export function detectDistress(text: string): DistressSignal {
  const crisis    = CRISIS_PATTERNS.filter((p) => p.test(text));
  const emotional = EMOTIONAL_PATTERNS.filter((p) => p.test(text));
  const financial = FINANCIAL_DISTRESS_PATTERNS.filter((p) => p.test(text));

  if (crisis.length > 0) {
    return { level: 'crisis', triggers: crisis.map((p) => p.source) };
  }
  if (emotional.length > 0) {
    return { level: 'emotional', triggers: emotional.map((p) => p.source) };
  }
  if (financial.length > 0) {
    return { level: 'financial', triggers: financial.map((p) => p.source) };
  }
  return { level: 'none', triggers: [] };
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'recommend_strategy',
    description:
      "Recommend a conservative DeFi savings strategy. Only call after collecting: the user's capital range, goal, time horizon, and loss tolerance. Always include APY as a range, never a fixed number.",
    input_schema: {
      type: 'object' as const,
      properties: {
        strategyId: {
          type: 'string',
          enum: ['kamino-usdc-main', 'marginfi-usdc-main', 'usdc-savings-basic'],
        },
        explanation:      { type: 'string', description: 'Plain-language explanation ≤ 150 words' },
        riskScore:        { type: 'number', minimum: 1, maximum: 3 },
        estimatedApy: {
          type: 'object',
          properties: { min: { type: 'number' }, max: { type: 'number' } },
          required: ['min', 'max'],
        },
        disclaimer:             { type: 'string', description: 'Risk disclaimer ≥ 50 words' },
        requiresDisclosureAck:  { type: 'boolean', enum: [true] },
      },
      required: ['strategyId', 'explanation', 'riskScore', 'estimatedApy', 'disclaimer', 'requiresDisclosureAck'],
    },
  },
  {
    name: 'confirm_action',
    description:
      'Request explicit user confirmation before any on-chain action (deposit, withdraw, bridge, sign). Always call this before describing a transaction. Include a plain-language summary and fee estimate.',
    input_schema: {
      type: 'object' as const,
      properties: {
        actionType:     { type: 'string', enum: ['deposit', 'withdraw', 'bridge', 'swap'] },
        amountUSD:      { type: 'number', minimum: 0 },
        destinationLabel: { type: 'string', description: 'Human-readable destination (e.g. "Kamino USDC pool")' },
        estimatedFeeUSD:  { type: 'number', minimum: 0 },
        plainSummary:   { type: 'string', description: 'One-sentence plain-language description of what will happen' },
        riskReminder:   { type: 'string', description: 'One-sentence DeFi risk reminder' },
      },
      required: ['actionType', 'amountUSD', 'destinationLabel', 'estimatedFeeUSD', 'plainSummary', 'riskReminder'],
    },
  },
  {
    name: 'flag_distress',
    description:
      "Call when the user shows signs of financial distress, scam victimisation, compulsive behaviour, or emotional crisis. This triggers the app's support protocol — do not recommend new investments after calling this.",
    input_schema: {
      type: 'object' as const,
      properties: {
        level:    { type: 'string', enum: ['financial', 'emotional', 'crisis'] },
        summary:  { type: 'string', description: 'Brief, private summary of the concern (not shown to user)' },
        locale:   { type: 'string' },
      },
      required: ['level', 'summary'],
    },
  },
  {
    name: 'explain_concept',
    description: 'Provide a structured plain-language explanation of a financial or DeFi concept.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concept: { type: 'string' },
        level:   { type: 'string', enum: ['beginner', 'intermediate'] },
        locale:  { type: 'string' },
      },
      required: ['concept', 'level'],
    },
  },
];

// ─── Streaming chat ────────────────────────────────────────────────────────────

/**
 * Stream a Claude response. Yields text chunks as they arrive.
 * Tool-use blocks are collected and returned via the done event.
 *
 * Usage:
 *   for await (const event of streamChat(messages, ctx)) {
 *     if (event.type === 'chunk') process(event.text);
 *     if (event.type === 'done') finalize(event);
 *   }
 */
export type StreamEvent =
  | { type: 'chunk';  text: string }
  | { type: 'done';   content: string; toolUse: Anthropic.ToolUseBlock | null;
      distress: DistressSignal; tokensUsed: number };

export async function* streamChat(
  messages: ChatMessage[],
  ctx: ConversationContext = {},
): AsyncGenerator<StreamEvent> {
  const lastUser = getLastUserMessage(messages);
  const distress = detectDistress(lastUser);

  // Inject distress flag into system prompt context
  const effectiveCtx: ConversationContext = { ...ctx };
  if (distress.level !== 'none') {
    effectiveCtx.voiceMode = ctx.voiceMode; // keep voice mode
  }

  const systemPrompt = buildSystemPrompt(effectiveCtx);

  let fullContent = '';
  let toolUse: Anthropic.ToolUseBlock | null = null;

  const stream = await client.messages.stream({
    model:      MODEL,
    max_tokens: MAX_TOK,
    system:     systemPrompt,
    tools:      TOOLS,
    messages:   messages.map((m) => ({ role: m.role, content: m.content })),
  });

  let inputTokens  = 0;
  let outputTokens = 0;

  for await (const event of stream as AsyncIterable<MessageStreamEvent>) {
    if (event.type === 'message_start') {
      inputTokens = event.message.usage.input_tokens;
    }
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text;
      yield { type: 'chunk', text: event.delta.text };
    }
    if (event.type === 'content_block_stop' && 'content_block' in event) {
      const block = event.content_block as Anthropic.ContentBlock;
      if (block.type === 'tool_use') {
        toolUse = block as Anthropic.ToolUseBlock;
      }
    }
    if (event.type === 'message_delta') {
      outputTokens = event.usage.output_tokens;
    }
  }

  yield {
    type: 'done',
    content: fullContent,
    toolUse,
    distress,
    tokensUsed: inputTokens + outputTokens,
  };
}

// ─── Non-streaming chat ────────────────────────────────────────────────────────

/**
 * Blocking Claude call. Use for tool-result handling and structured tasks.
 */
export async function chat(
  messages: ChatMessage[],
  ctx: ConversationContext = {},
): Promise<ChatResult> {
  const lastUser = getLastUserMessage(messages);
  const distress = detectDistress(lastUser);

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: MAX_TOK,
    system:     buildSystemPrompt(ctx),
    tools:      TOOLS,
    messages:   messages.map((m) => ({ role: m.role, content: m.content })),
  });

  let textContent = '';
  let toolUse: Anthropic.ToolUseBlock | null = null;

  for (const block of response.content) {
    if (block.type === 'text')     textContent += block.text;
    if (block.type === 'tool_use') toolUse = block;
  }

  return {
    content:    textContent,
    toolUse,
    distress,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

function getLastUserMessage(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role === 'user') {
      return message.content;
    }
  }
  return '';
}

// ─── Conversation summarisation ────────────────────────────────────────────────

/**
 * Compress a batch of older conversation turns into a single summary paragraph.
 * Called by the memory route when turn count exceeds the 20-turn window.
 *
 * The summary is stored server-side and re-injected into the system prompt
 * for subsequent requests via `ctx.conversationSummary`.
 */
export async function summariseHistory(
  turns: ChatMessage[],
  locale: SupportedLocale = 'en',
): Promise<string> {
  const transcript = turns
    .map((t) => `${t.role === 'user' ? 'User' : 'Coco'}: ${t.content}`)
    .join('\n');

  const response = await client.messages.create({
    model:      MODEL,
    max_tokens: SUM_TOK,
    system:
      `You are summarising a financial coaching conversation for context injection. ` +
      `Write a dense, factual 3–5 sentence summary in ${LOCALE_NAMES[locale] ?? 'English'}. ` +
      `Include: user's stated goals, financial situation mentioned, any strategies discussed, ` +
      `and any concerns flagged. Do not include PII. Write in third person.`,
    messages: [{ role: 'user', content: `Summarise this conversation:\n\n${transcript}` }],
  });

  const block = response.content[0];
  return block?.type === 'text' ? block.text : '';
}
