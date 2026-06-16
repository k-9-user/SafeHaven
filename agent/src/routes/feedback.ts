/**
 * POST /api/feedback  — public, no auth required
 * Stores user feedback (star ratings + free text).
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { addFeedback } from '../feedback/store.js';

export const feedbackRouter = Router();

const FeedbackSchema = z.object({
  ratings: z.object({
    ease:    z.number().int().min(1).max(5),
    content: z.number().int().min(1).max(5),
    ai:      z.number().int().min(1).max(5),
    overall: z.number().int().min(1).max(5),
  }),
  comment: z.string().max(2000).optional(),
  lang:    z.enum(['en', 'fr', 'es']).optional(),
  page:    z.string().max(200).optional(),
});

feedbackRouter.post('/', (req: Request, res: Response): void => {
  const parsed = FeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid feedback data' });
    return;
  }

  addFeedback({
    id: randomUUID(),
    ...parsed.data,
    submittedAt: new Date().toISOString(),
  });

  res.json({ ok: true });
});
