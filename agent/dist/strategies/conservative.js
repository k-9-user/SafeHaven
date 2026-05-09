/**
 * SafeHaven — Conservative DeFi Strategy Templates
 *
 * Server-side strategy catalog (mirrors app/src/defi/strategies.ts).
 * The agent uses this to construct strategy recommendations.
 *
 * All strategies here are:
 *   - USDC-denominated (no volatile asset exposure)
 *   - Non-leveraged
 *   - From audited Solana protocols
 *   - Risk score <= 3
 *
 * APY data is fetched from live sources and cached.
 * APY is NEVER presented as guaranteed — always as a range estimate.
 */
import axios from 'axios';
export const CONSERVATIVE_STRATEGIES = [
    {
        id: 'kamino-usdc-main',
        protocol: 'kamino',
        name: 'Kamino USDC Lending',
        riskScore: 2,
        minDepositUSDC: 5,
        apyRangeIndicative: { min: 4.5, max: 8.5 },
        programId: 'KLend2g3cP87fffoy8q1mQqGKjrL1AyGulgtnNXHsSH',
        vaultAddress: 'H9UMrSzHDi5yGdMPGb5TS7R8n8AX5VHJvTSgFtQv5iE',
        auditLinks: [
            'https://kamino.finance/security',
        ],
        description: {
            en: 'Deposit USDC into Kamino Finance\'s lending pool. You earn interest when borrowers (who put up collateral) borrow your USDC. Your USDC stays in USDC — no price volatility.',
            fr: 'Déposez des USDC dans le pool de prêt de Kamino Finance. Vous gagnez des intérêts quand des emprunteurs (qui fournissent des garanties) empruntent vos USDC. Vos USDC restent en USDC — pas de volatilité des prix.',
            es: 'Deposita USDC en el pool de préstamos de Kamino Finance. Ganas intereses cuando los prestatarios (que proporcionan garantías) toman prestados tus USDC. Tu USDC se mantiene en USDC, sin volatilidad de precios.',
        },
        risks: {
            en: [
                'Smart contract risk: bugs in Kamino\'s code could lead to loss of funds',
                'Liquidity risk: in rare cases, withdrawals might be temporarily delayed',
                'APY fluctuates: the rate changes daily based on borrowing demand',
                'Protocol risk: Kamino Finance could be hacked or become insolvent',
            ],
            fr: [
                'Risque de contrat intelligent : des bugs dans le code de Kamino pourraient entraîner une perte de fonds',
                'Risque de liquidité : dans de rares cas, les retraits pourraient être temporairement retardés',
                'Le rendement fluctue : le taux change quotidiennement selon la demande d\'emprunt',
                'Risque de protocole : Kamino Finance pourrait être piraté ou devenir insolvable',
            ],
            es: [
                'Riesgo de contrato inteligente: errores en el código de Kamino podrían llevar a pérdida de fondos',
                'Riesgo de liquidez: en casos raros, los retiros podrían retrasarse temporalmente',
                'El APY fluctúa: la tasa cambia diariamente según la demanda de préstamos',
                'Riesgo del protocolo: Kamino Finance podría ser hackeado o volverse insolvente',
            ],
        },
        disclosure: {
            en: 'RISK DISCLOSURE: Depositing in DeFi protocols carries risks, including smart contract vulnerabilities, protocol insolvency, and liquidity constraints. The estimated APY (4.5%–8.5%) is not guaranteed, changes daily, and past performance does not predict future results. Only deposit funds you can afford to lose. SafeHaven does not custody your funds and cannot recover them if lost. This is not financial advice.',
            fr: 'DIVULGATION DES RISQUES : Le dépôt dans des protocoles DeFi comporte des risques, notamment des vulnérabilités de contrats intelligents, l\'insolvabilité du protocole et des contraintes de liquidité. Le rendement estimé (4,5 %–8,5 %) n\'est pas garanti, change quotidiennement et les performances passées ne prédisent pas les résultats futurs. Ne déposez que des fonds que vous pouvez vous permettre de perdre. SafeHaven ne conserve pas vos fonds et ne peut pas les récupérer en cas de perte. Il ne s\'agit pas d\'un conseil financier.',
            es: 'DIVULGACIÓN DE RIESGOS: Depositar en protocolos DeFi conlleva riesgos, incluidas vulnerabilidades de contratos inteligentes, insolvencia del protocolo y restricciones de liquidez. El APY estimado (4,5%–8,5%) no está garantizado, cambia diariamente y el rendimiento pasado no predice resultados futuros. Solo deposita fondos que puedas permitirte perder. SafeHaven no custodia tus fondos y no puede recuperarlos si se pierden. Esto no es asesoramiento financiero.',
        },
    },
    {
        id: 'marginfi-usdc-main',
        protocol: 'marginfi',
        name: 'MarginFi USDC Lending',
        riskScore: 2,
        minDepositUSDC: 5,
        apyRangeIndicative: { min: 4.0, max: 7.5 },
        programId: 'MFv2hWf31Z9kbCa1snEPdcgp7vGVw8Ly6SnGPGSJoX',
        vaultAddress: 'EihFwjNA4u9v5C8jFKgPEfnvZj6bPetRpkVqxEPbAjKu',
        auditLinks: [
            'https://docs.marginfi.com/security',
        ],
        description: {
            en: 'Deposit USDC into MarginFi\'s lending pool. Similar to a savings account: you earn interest paid by borrowers. MarginFi is fully non-custodial — you can withdraw at any time.',
            fr: 'Déposez des USDC dans le pool de prêt de MarginFi. Similaire à un compte d\'épargne : vous gagnez des intérêts payés par les emprunteurs. MarginFi est entièrement non-custodial — vous pouvez retirer à tout moment.',
            es: 'Deposita USDC en el pool de préstamos de MarginFi. Similar a una cuenta de ahorros: ganas intereses pagados por los prestatarios. MarginFi es completamente no custodio — puedes retirar en cualquier momento.',
        },
        risks: {
            en: [
                'Smart contract risk: bugs in MarginFi\'s code could lead to loss of funds',
                'Liquidity risk: withdrawals might be delayed if all liquidity is borrowed',
                'APY fluctuates: changes daily with market conditions',
                'Protocol risk: MarginFi could be hacked or become insolvent',
            ],
            fr: [
                'Risque de contrat intelligent : des bugs pourraient entraîner une perte de fonds',
                'Risque de liquidité : les retraits peuvent être retardés si toute la liquidité est empruntée',
                'Le rendement fluctue avec les conditions du marché',
                'Risque de protocole : MarginFi pourrait être piraté ou devenir insolvable',
            ],
            es: [
                'Riesgo de contrato inteligente: errores podrían llevar a pérdida de fondos',
                'Riesgo de liquidez: los retiros pueden retrasarse si toda la liquidez está prestada',
                'El APY fluctúa con las condiciones del mercado',
                'Riesgo del protocolo: MarginFi podría ser hackeado o volverse insolvente',
            ],
        },
        disclosure: {
            en: 'RISK DISCLOSURE: Depositing in DeFi protocols carries risks, including smart contract vulnerabilities, protocol insolvency, and liquidity constraints. The estimated APY (4.0%–7.5%) is not guaranteed, changes daily, and past performance does not predict future results. Only deposit funds you can afford to lose. SafeHaven does not custody your funds. This is not financial advice.',
            fr: 'DIVULGATION DES RISQUES : Le dépôt comporte des risques. Le rendement estimé (4,0 %–7,5 %) n\'est pas garanti. Ne déposez que des fonds que vous pouvez vous permettre de perdre. Il ne s\'agit pas d\'un conseil financier.',
            es: 'DIVULGACIÓN DE RIESGOS: El depósito conlleva riesgos. El APY estimado (4,0%–7,5%) no está garantizado. Solo deposita fondos que puedas permitirte perder. Esto no es asesoramiento financiero.',
        },
    },
];
const yieldCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
/**
 * Fetch current APY for a strategy from the protocol's API.
 * Returns cached value if fresh; fetches live otherwise.
 */
export async function fetchStrategyApy(strategyId) {
    const cached = yieldCache.get(strategyId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.apy;
    }
    const strategy = CONSERVATIVE_STRATEGIES.find((s) => s.id === strategyId);
    if (!strategy)
        throw new Error(`Unknown strategy: ${strategyId}`);
    try {
        let apy;
        if (strategy.protocol === 'kamino') {
            apy = await fetchKaminoApy(strategy.vaultAddress);
        }
        else {
            apy = await fetchMarginFiApy(strategy.vaultAddress);
        }
        yieldCache.set(strategyId, { apy, fetchedAt: Date.now() });
        return apy;
    }
    catch {
        // Return indicative midpoint as fallback
        return (strategy.apyRangeIndicative.min + strategy.apyRangeIndicative.max) / 2;
    }
}
async function fetchKaminoApy(vaultAddress) {
    // Kamino API endpoint (public)
    const response = await axios.get(`https://api.kamino.finance/v2/strategies/${vaultAddress}/metrics`, { timeout: 8_000 });
    return parseFloat(response.data?.lendingApy ?? '0') * 100;
}
async function fetchMarginFiApy(_poolAddress) {
    // MarginFi API endpoint
    const response = await axios.get('https://marginfi.com/api/banks', { timeout: 8_000 });
    const usdcBank = response.data?.find((b) => b.tokenSymbol === 'USDC');
    return usdcBank ? parseFloat(usdcBank.lendingRate) * 100 : 5.0;
}
/**
 * Get current APY snapshot for all strategies.
 * Used by GET /api/yields endpoint.
 */
export async function getAllYields() {
    const results = {};
    await Promise.allSettled(CONSERVATIVE_STRATEGIES.map(async (strategy) => {
        const apy = await fetchStrategyApy(strategy.id);
        results[strategy.id] = {
            apy,
            timestamp: new Date().toISOString(),
        };
    }));
    return results;
}
//# sourceMappingURL=conservative.js.map