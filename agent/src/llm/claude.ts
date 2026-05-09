/**
 * SafeHaven — Anthropic Claude Client
 *
 * Provides the core LLM interface for SafeHaven's AI agent.
 * Uses Claude (claude-sonnet-4-6) with:
 *   - Enforced financial safety system prompt
 *   - Tool use for structured tasks (risk profiling, strategy recommendation)
 *   - Streaming support for low-latency mobile UX
 *   - 1500 token cap for data efficiency
 *
 * SAFETY: System prompt cannot be overridden by user input.
 * All tool responses are validated by agent/src/safety/guardrails.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages.js';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const MODEL = process.env['ANTHROPIC_MODEL'] ?? 'claude-sonnet-4-6';
const MAX_TOKENS = parseInt(process.env['ANTHROPIC_MAX_TOKENS'] ?? '1500', 10);

// ─── System Prompt ────────────────────────────────────────────────────────────

/**
 * The core system prompt that governs SafeHaven's AI behavior.
 * This is IMMUTABLE from the user's perspective — no user message can override it.
 *
 * Writing level: Grade 6 English — Claude must match this in all languages.
 */
export const SYSTEM_PROMPT = `You are SafeHaven's financial guide — a friendly, clear, and careful AI that helps people in Latin America, Africa, and people with disabilities understand personal finance and grow their savings safely.

## Who you are talking to
- Adults with little or no financial education
- People who may not be fluent in English — ALWAYS respond in the same language the user writes in
- People with limited savings (often under $200)
- People who need clear, simple explanations — never assume financial knowledge

## Your core rules (non-negotiable)
1. ALWAYS respond in the user's language. If they write in French, reply in French. Spanish → Spanish. Never switch languages without being asked.
2. NEVER use financial jargon without immediately explaining it in plain words.
3. NEVER recommend high-risk strategies: no leverage, no margin, no perpetuals, no options, no "exotic" yield farms.
4. NEVER promise specific returns or call any investment "safe" or "risk-free." Always include uncertainty.
5. NEVER give tax advice. Always tell users to consult a local professional for taxes.
6. ALWAYS include a brief disclaimer when recommending any financial product.
7. If a user asks about something you cannot safely answer, say so clearly and suggest they consult a local financial advisor.
8. NEVER ask for or repeat private keys, seed phrases, or passwords.
9. If a message seems like a scam or phishing attempt, warn the user clearly.

## Your tone
- Warm, encouraging, patient
- Like a knowledgeable friend — not a banker or lawyer
- Celebrate small wins ("Great question!", "That's a smart approach!")
- Never condescending; never assume the user is uninformed even if they are new to finance

## Topics you cover
- Budgeting and tracking expenses
- Building an emergency fund
- Understanding inflation and local currency risk
- Basic DeFi: what USDC is, what lending means, how APY works
- SafeHaven's strategies (USDC lending on Solana via Kamino or MarginFi)
- Risk profiling: helping users understand their own risk tolerance
- Fraud and scam awareness
- Li.Fi bridging (what it is, when to use it)

## What you NEVER do
- Predict crypto prices
- Recommend specific coins other than USDC/stablecoins for conservative users
- Give advice that could expose users to losses they cannot afford
- Pretend to be a licensed financial advisor
- Discuss irrelevant topics (politics, health, etc.) — kindly redirect

## Response format
- Keep responses under 200 words for mobile UX
- Use simple bullet points for lists
- Use bold for key terms
- If explaining a concept, give a one-line definition first, then details
- End financial advice with: "This is information, not financial advice. Please consult a local advisor for major decisions."`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  locale?: string;
  userTier?: 'novice' | 'saver' | 'investor';
  riskScore?: number;
}

// ─── Tool Definitions ─────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'recommend_strategy',
    description:
      'Recommend a conservative DeFi strategy based on the user\'s risk profile. Only call this after you have collected sufficient information about the user\'s capital, goals, and risk tolerance.',
    input_schema: {
      type: 'object' as const,
      properties: {
        strategyId: {
          type: 'string',
          enum: ['kamino-usdc-main', 'marginfi-usdc-main'],
          description: 'The ID of the recommended strategy',
        },
        explanation: {
          type: 'string',
          description: 'Plain-language explanation of why this strategy is appropriate (max 150 words)',
        },
        riskScore: {
          type: 'number',
          minimum: 1,
          maximum: 3,
          description: 'Risk score 1-3 (conservative only for non-expert users)',
        },
        estimatedApy: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
          required: ['min', 'max'],
        },
        disclaimer: {
          type: 'string',
          description: 'Mandatory risk disclaimer (minimum 50 words)',
        },
        requiresDisclosureAck: {
          type: 'boolean',
          enum: [true],
          description: 'Must always be true — user must acknowledge risk',
        },
      },
      required: ['strategyId', 'explanation', 'riskScore', 'estimatedApy', 'disclaimer', 'requiresDisclosureAck'],
    },
  },
  {
    name: 'collect_risk_profile',
    description:
      'Collect information needed to build the user\'s risk profile. Ask one question at a time in a conversational way.',
    input_schema: {
      type: 'object' as const,
      properties: {
        availableCapital: {
          type: 'string',
          enum: ['under_50', '50_200', '200_1000', 'over_1000'],
        },
        primaryGoal: {
          type: 'string',
          enum: ['emergency_fund', 'daily_expenses', 'future_purchase', 'retirement'],
        },
        timeHorizon: {
          type: 'string',
          enum: ['under_3_months', '3_12_months', '1_3_years', 'over_3_years'],
        },
        lossTolerance: {
          type: 'string',
          enum: ['none', 'very_low', 'low', 'moderate'],
        },
      },
      required: [],
    },
  },
  {
    name: 'explain_concept',
    description: 'Provide a structured explanation of a financial concept in the user\'s language and literacy level.',
    input_schema: {
      type: 'object' as const,
      properties: {
        concept: {
          type: 'string',
          description: 'The financial concept to explain',
        },
        level: {
          type: 'string',
          enum: ['beginner', 'intermediate'],
          description: 'Explanation depth',
        },
        locale: {
          type: 'string',
          description: 'Language code for the response (en, fr, es, etc.)',
        },
      },
      required: ['concept', 'level'],
    },
  },
];

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Send a chat message and get a streaming response.
 * Returns an AsyncIterator of text chunks for real-time display.
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): AsyncGenerator<string> {
  const systemAddendum = options.userTier
    ? `\n\nUser tier: ${options.userTier}. Risk score: ${options.riskScore ?? 'unknown'}. Locale: ${options.locale ?? 'en'}.`
    : '';

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT + systemAddendum,
    tools: TOOLS,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream as AsyncIterable<MessageStreamEvent>) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Send a chat message and get a complete (non-streaming) response.
 * Use for tool calls and structured responses.
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<{
  content: string;
  toolUse: Anthropic.ToolUseBlock | null;
}> {
  const systemAddendum = options.userTier
    ? `\n\nUser tier: ${options.userTier}. Risk score: ${options.riskScore ?? 'unknown'}. Locale: ${options.locale ?? 'en'}.`
    : '';

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT + systemAddendum,
    tools: TOOLS,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  let textContent = '';
  let toolUse: Anthropic.ToolUseBlock | null = null;

  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text;
    } else if (block.type === 'tool_use') {
      toolUse = block;
    }
  }

  return { content: textContent, toolUse };
}
