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
import { z } from 'zod';
export declare const memoryRouter: import("express-serve-static-core").Router;
declare const SummarizeRequestSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "user" | "assistant";
    }, {
        content: string;
        role: "user" | "assistant";
    }>, "many">;
    locale: z.ZodDefault<z.ZodOptional<z.ZodEnum<["en", "fr", "es", "pt", "sw", "ha", "ar"]>>>;
}, "strip", z.ZodTypeAny, {
    locale: "en" | "fr" | "es" | "pt" | "sw" | "ha" | "ar";
    messages: {
        content: string;
        role: "user" | "assistant";
    }[];
}, {
    messages: {
        content: string;
        role: "user" | "assistant";
    }[];
    locale?: "en" | "fr" | "es" | "pt" | "sw" | "ha" | "ar" | undefined;
}>;
export type SummarizeRequest = z.infer<typeof SummarizeRequestSchema>;
export {};
//# sourceMappingURL=memory.d.ts.map