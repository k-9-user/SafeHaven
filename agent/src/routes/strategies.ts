/**
 * GET /api/strategies — List strategies available for a given risk score
 */
import { Router, type Request, type Response } from 'express';
import { CONSERVATIVE_STRATEGIES } from '../strategies/conservative.js';

export const strategyRouter = Router();

strategyRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const riskScore = parseInt((req.query['riskScore'] as string) ?? '2', 10);
  const locale = (req.query['locale'] as string) ?? 'en';
  const strategies = CONSERVATIVE_STRATEGIES
    .filter((s) => s.riskScore <= Math.min(riskScore, 3))
    .map((s) => ({
      id: s.id,
      protocol: s.protocol,
      name: s.name,
      riskScore: s.riskScore,
      minDepositUSDC: s.minDepositUSDC,
      apyRangeIndicative: s.apyRangeIndicative,
      auditLinks: s.auditLinks,
      description: s.description[locale as keyof typeof s.description] ?? s.description['en'],
      risks: s.risks[locale as keyof typeof s.risks] ?? s.risks['en'],
      disclosure: s.disclosure[locale as keyof typeof s.disclosure] ?? s.disclosure['en'],
    }));
  res.json({ strategies });
});
