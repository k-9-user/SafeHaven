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
import Anthropic from '@anthropic-ai/sdk';
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
/**
 * Fill all {{template}} variables in the master system prompt.
 * Adds voice-mode and conversation-summary addenda.
 */
export declare function buildSystemPrompt(ctx?: ConversationContext): string;
/**
 * Lightweight pre-LLM scan for distress signals in the user's message.
 * Used to decide whether to inject distress-protocol context and slow down.
 */
export declare function detectDistress(text: string): DistressSignal;
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
export type StreamEvent = {
    type: 'chunk';
    text: string;
} | {
    type: 'done';
    content: string;
    toolUse: Anthropic.ToolUseBlock | null;
    distress: DistressSignal;
    tokensUsed: number;
};
export declare function streamChat(messages: ChatMessage[], ctx?: ConversationContext): AsyncGenerator<StreamEvent>;
/**
 * Blocking Claude call. Use for tool-result handling and structured tasks.
 */
export declare function chat(messages: ChatMessage[], ctx?: ConversationContext): Promise<ChatResult>;
/**
 * Compress a batch of older conversation turns into a single summary paragraph.
 * Called by the memory route when turn count exceeds the 20-turn window.
 *
 * The summary is stored server-side and re-injected into the system prompt
 * for subsequent requests via `ctx.conversationSummary`.
 */
export declare function summariseHistory(turns: ChatMessage[], locale?: SupportedLocale): Promise<string>;
//# sourceMappingURL=claude.d.ts.map