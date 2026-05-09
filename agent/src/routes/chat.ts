/**
 * POST /api/chat
 *
 * Main conversational endpoint — streams Claude responses to the app.
 *
 * SSE event format:
 *   data: {"chunk": "..."}                        — streaming text delta
 *   data: {"done": true, "finalResponse": "...",  — stream complete
 *           "distressLevel": "none|financial|emotional|crisis",
 *           "tokensUsed": 1234}
 *
 * Non-streaming (stream: false):
 *   {"response": "...", "toolUse": null|{...}, "distressLevel": "none|..."}
 *
 * v2 additions:
 *   conversationSummary — compressed context injected into system prompt
 *   voiceMode           — strip markdown for TTS responses
 *   distressLevel       — propagated in SSE done event for UI awareness
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
  streamChat,
  chat,
  type ChatMessage,
  type ConversationContext,
} from '../llm/claude.js';
import { filterInput, filterOutput, ensureDisclaimer } from '../safety/guardrails.js';

export const chatRouter = Router();

// ─── Schema ───────────────────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role:    z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).min(1).max(50),
  locale:              z.enum(['en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar']).optional().default('en'),
  userTier:            z.enum(['novice', 'saver', 'investor']).optional(),
  riskScore:           z.number().min(1).max(5).optional(),
  conversationSummary: z.string().max(2000).optional(),
  voiceMode:           z.boolean().optional().default(false),
  stream:              z.boolean().optional().default(true),
});

// ─── POST /api/chat ───────────────────────────────────────────────────────────

chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { messages, locale, userTier, riskScore, conversationSummary, voiceMode, stream } =
    parsed.data;

  // Safety-filter the last user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role !== 'user') {
    res.status(400).json({ error: 'Last message must be from user' });
    return;
  }

  const inputResult = filterInput(lastMessage.content);
  if (inputResult.blocked) {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.write(`data: ${JSON.stringify({
        done: true, finalResponse: inputResult.safeResponse,
        distressLevel: 'none', tokensUsed: 0,
      })}\n\n`);
      res.end();
    } else {
      res.json({ response: inputResult.safeResponse, blocked: true, distressLevel: 'none' });
    }
    return;
  }

  const sanitizedMessages: ChatMessage[] = [
    ...messages.slice(0, -1),
    { role: 'user', content: inputResult.sanitizedMessage! },
  ];

  const ctx: ConversationContext = {
    locale:              locale as ConversationContext['locale'],
    userTier:            userTier as ConversationContext['userTier'],
    riskScore,
    conversationSummary,
    voiceMode,
  };

  try {
    // ── Streaming path ─────────────────────────────────────────────────────
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let accumulated    = '';
      let distressLevel  = 'none';
      let tokensUsed     = 0;

      for await (const event of streamChat(sanitizedMessages, ctx)) {
        if (event.type === 'chunk') {
          accumulated += event.text;
          res.write(`data: ${JSON.stringify({ chunk: event.text })}\n\n`);
        } else if (event.type === 'done') {
          distressLevel = event.distress.level;
          tokensUsed    = event.tokensUsed;
          if (event.content) accumulated = event.content;
        }
      }

      const { clean } = filterOutput(accumulated);
      const withDisclaimer = ensureDisclaimer(clean, locale);

      res.write(
        `data: ${JSON.stringify({
          done:          true,
          finalResponse: withDisclaimer,
          distressLevel,
          tokensUsed,
        })}\n\n`
      );
      res.end();

    // ── Non-streaming path ─────────────────────────────────────────────────
    } else {
      const { content, toolUse, distress, tokensUsed } = await chat(sanitizedMessages, ctx);
      const { clean } = filterOutput(content);
      const withDisclaimer = ensureDisclaimer(clean, locale);
      res.json({ response: withDisclaimer, toolUse, distressLevel: distress.level, tokensUsed });
    }
  } catch (error) {
    console.error('[Chat] Unhandled error:', error);
    const fallbacks: Record<string, string> = {
      en: "I can't reach my brain right now. You can still browse lessons or check your balance. Try again in a moment.",
      fr: "Je ne peux pas me connecter pour le moment. Vous pouvez parcourir les leçons ou vérifier votre solde.",
      es: "No puedo conectarme ahora mismo. Puedes navegar las lecciones o verificar tu saldo.",
      pt: "Não consigo me conectar agora. Você pode navegar pelas lições ou verificar seu saldo.",
      sw: "Siwezi kuungana sasa hivi. Unaweza kutazama masomo au kuangalia salio lako.",
      ha: "Ba zan iya haɗawa yanzu ba. Zaka iya duba darussa ko duba ma'auninka.",
      ar: "لا يمكنني الاتصال الآن. يمكنك تصفح الدروس أو فحص رصيدك.",
    };
  
    const fallback = fallbacks[locale] ?? fallbacks['en']!;
    if (stream && !res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`data: ${JSON.stringify({ done: true, finalResponse: fallback, distressLevel: 'none', tokensUsed: 0, error: true })}

`);
      res.end();
    } else if (!res.headersSent) {
      res.status(503).json({ response: fallback, error: true, distressLevel: 'none' });
    }
  }
});
