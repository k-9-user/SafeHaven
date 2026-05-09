/**
 * POST /api/risk-profile — Save or update a user's risk profile
 */
import { Router, type Request, type Response } from 'express';
import { RiskProfileSchema, computeRiskScore } from '../risk/profiler.js';

export const riskRouter = Router();

const RiskProfileRequestSchema = RiskProfileSchema.omit({ completedAt: true });

riskRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = RiskProfileRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid risk profile', details: parsed.error.flatten() });
    return;
  }
  const profile = { ...parsed.data, completedAt: new Date() };
  const assessment = computeRiskScore(profile);
  // TODO: persist profile to database keyed by userId
  res.json({ profile, assessment });
});
