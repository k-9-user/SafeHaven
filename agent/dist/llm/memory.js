/**
 * SafeHaven — Conversation Memory Module
 *
 * Server-side handler for POST /api/chat/summarize.
 *
 * Called by the mobile app when local conversation history exceeds 20 turns.
 * Compresses a batch of older turns into a dense summary paragraph that is
 * stored client-side and re-injected into Claude's system prompt context
 * via `ctx.conversationSummary` on future requests.
 *
 * Design:
 *   - Uses `summariseHistory()` from claude.ts (same model, separate request)
 *   - Input validated with Zod — rejects malformed or oversized payloads
 *   - Rate-limited upstream (see index.ts chat limiter)
 *   - Stateless: we never store conversation content server-side
 *   - Idempotent: the same turns always produce a deterministic-ish summary
 *
 * Security:
 *   - Max 10 turns per request (prevents abuse)
 *   - Max 500 chars per turn (prevents prompt injection via huge turns)
 *   - Content passes through filterInput() before reaching Claude
 */
import { Router } from 'express';
import { z } from 'zod';
import { summariseHistory } from './claude.js';
import { filterInput } from '../safety/guardrails.js';
export const memoryRouter = Router();
// ─── Schema ───────────────────────────────────────────────────────────────────
const SummarizeRequestSchema = z.object({
    messages: z
        .array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(500).trim(),
    }))
        .min(2) // need at least one exchange
        .max(10), // max batch size matches PRUNE_BATCH in useConversationStore
    locale: z
        .enum(['en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar'])
        .optional()
        .default('en'),
});
// ─── POST /api/chat/summarize ─────────────────────────────────────────────────
memoryRouter.post('/summarize', async (req, res) => {
    // 1. Validate request shape
    const parsed = SummarizeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            error: 'Invalid request',
            details: parsed.error.flatten(),
        });
        return;
    }
    const { messages, locale } = parsed.data;
    // 2. Safety-filter each user message before summarising
    //    (Prevents prompt-injection attempts in the turn content)
    const safeMessages = messages.map((msg) => {
        if (msg.role !== 'user')
            return msg;
        const filtered = filterInput(msg.content);
        return {
            role: msg.role,
            content: filtered.blocked
                ? '[message removed by safety filter]'
                : (filtered.sanitizedMessage ?? msg.content),
        };
    });
    try {
        const summary = await summariseHistory(safeMessages, locale);
        if (!summary) {
            res.status(500).json({ error: 'Summarisation produced empty result' });
            return;
        }
        res.json({ summary });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[memory] Summarisation failed:', message);
        res.status(500).json({ error: 'Summarisation failed. Please retry.' });
    }
});
// ─── GET /api/chat/summarize/health ──────────────────────────────────────────
// Simple ping so the client can check the memory endpoint before using it
memoryRouter.get('/summarize/health', (_req, res) => {
    res.json({ status: 'ok', endpoint: '/api/chat/summarize' });
});
//# sourceMappingURL=memory.js.map