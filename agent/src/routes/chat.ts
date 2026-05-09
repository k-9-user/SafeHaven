/**
 * POST /api/chat
 * Main conversational endpoint — streams Claude responses to the app.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { streamChat, chat, type ChatMessage } from '../llm/claude.js';
import { filterInput, filterOutput, ensureDisclaimer } from '../safety/guardrails.js';

export const chatRouter = Router();

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).min(1).max(50),
  locale: z.enum(['en', 'fr', 'es', 'pt', 'sw', 'ha', 'ar']).optional().default('en'),
  userTier: z.enum(['novice', 'saver', 'investor']).optional(),
  riskScore: z.number().min(1).max(5).optional(),
  stream: z.boolean().optional().default(true),
});

chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const { messages, locale, userTier, riskScore, stream } = parsed.data;

  // Filter the last user message through safety layer
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role !== 'user') {
    res.status(400).json({ error: 'Last message must be from user' });
    return;
  }

  const inputResult = filterInput(lastMessage.content);
  if (inputResult.blocked) {
    res.json({ response: inputResult.safeResponse, blocked: true });
    return;
  }

  // Replace last message with sanitized version
  const sanitizedMessages: ChatMessage[] = [
    ...messages.slice(0, -1),
    { role: 'user', content: inputResult.sanitizedMessage! },
  ];

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';
      for await (const chunk of streamChat(sanitizedMessages, { locale, userTier, riskScore })) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Post-process the complete response
      const { clean } = filterOutput(fullResponse);
      const withDisclaimer = ensureDisclaimer(clean, locale);

      res.write(`data: ${JSON.stringify({ done: true, finalResponse: withDisclaimer })}\n\n`);
      res.end();
    } else {
      const { content, toolUse } = await chat(sanitizedMessages, { locale, userTier, riskScore });
      const { clean } = filterOutput(content);
      const withDisclaimer = ensureDisclaimer(clean, locale);
      res.json({ response: withDisclaimer, toolUse });
    }
  } catch (error) {
    console.error('[Chat] Error:', error);
    const fallbacks: Record<string, string> = {
      en: 'I cannot reach the AI right now. You can still browse lessons or check your balance. Please try again in a moment.',
      fr: 'Je ne peux pas joindre l\'IA pour le moment. Vous pouvez toujours parcourir les leçons ou vérifier votre solde.',
      es: 'No puedo conectarme a la IA ahora mismo. Puedes navegar las lecciones o verificar tu saldo.',
    };
    res.status(503).json({ response: fallbacks[locale] ?? fallbacks['en'], error: true });
  }
});
