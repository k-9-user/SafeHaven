/**
 * GET /api/yields — Current on-chain APY snapshot (cached 5 min)
 */
import { Router } from 'express';
import { getAllYields } from '../strategies/conservative.js';
export const yieldsRouter = Router();
yieldsRouter.get('/', async (_req, res) => {
    try {
        const yields = await getAllYields();
        res.json(yields);
    }
    catch (error) {
        console.error('[Yields] Error:', error);
        res.status(503).json({ error: 'Could not fetch current yields. Please try again shortly.' });
    }
});
//# sourceMappingURL=yields.js.map