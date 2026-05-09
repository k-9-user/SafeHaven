/**
 * GET /api/strategies — List strategies available for a given risk score
 */
import { Router } from 'express';
import { CONSERVATIVE_STRATEGIES } from '../strategies/conservative.js';
export const strategyRouter = Router();
strategyRouter.get('/', async (req, res) => {
    const riskScore = parseInt(req.query['riskScore'] ?? '2', 10);
    const locale = req.query['locale'] ?? 'en';
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
        description: s.description[locale] ?? s.description['en'],
        risks: s.risks[locale] ?? s.risks['en'],
        disclosure: s.disclosure[locale] ?? s.disclosure['en'],
    }));
    res.json({ strategies });
});
//# sourceMappingURL=strategies.js.map