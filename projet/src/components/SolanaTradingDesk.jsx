import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRightLeft, ShieldCheck, Sparkles, TriangleAlert, CheckCircle2 } from 'lucide-react';
import { executeJupiterSwap, formatSwapAmount } from '@/lib/jupiterSwap';

export default function SolanaTradingDesk({
  walletAddress,
  solanaBalance,
  demoMode = false,
  onTradeStatus,
  onTradeComplete,
}) {
  const [tradeAmount, setTradeAmount] = useState('0.25');
  const [slippageBps, setSlippageBps] = useState('50');
  const [isTrading, setIsTrading] = useState(false);
  const [status, setStatus] = useState('Ready to trade');
  const [txHash, setTxHash] = useState('');
  const [estimate, setEstimate] = useState(null);

  const availableAmount = useMemo(() => {
    const parsed = Number(tradeAmount || 0);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return Math.min(parsed, Number(solanaBalance || 0));
  }, [tradeAmount, solanaBalance]);

  const updateStatus = (message) => {
    setStatus(message);
    if (onTradeStatus) onTradeStatus(message);
  };

  const setPreset = (percentage) => {
    const amount = Math.max((Number(solanaBalance || 0) * percentage) / 100, 0.01);
    setTradeAmount(formatSwapAmount(amount));
  };

  const handleExecuteTrade = async () => {
    if (!walletAddress) {
      updateStatus('Connect a wallet first');
      return;
    }

    if (availableAmount <= 0) {
      updateStatus('Enter a valid SOL amount');
      return;
    }

    try {
      setIsTrading(true);
      updateStatus(demoMode ? 'Demo secure flow running...' : 'Requesting Jupiter quote...');

      if (demoMode) {
        const fakeHash = `demo-${Date.now().toString(36)}`;
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setTxHash(fakeHash);
        setEstimate({ input: availableAmount, output: availableAmount * 141.25, impact: 0.05 });
        updateStatus('Demo mode: assets secured conceptually into USDC');
      } else {
        const result = await executeJupiterSwap({
          walletAddress,
          amountSol: availableAmount,
          slippageBps: Number(slippageBps || 50),
        });
        setTxHash(result.signature);
        setEstimate({
          input: result.estimatedInputSol,
          output: result.estimatedOutputUsdc,
          impact: result.priceImpactPct,
        });
        updateStatus('Trade executed through Jupiter and secured on Solana');
        if (onTradeComplete) onTradeComplete(result);
      }
    } catch (error) {
      console.error('Trade execution failed:', error);
      updateStatus(error.message || 'Trade failed');
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-2xl">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-blue-950 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowRightLeft className="h-5 w-5 text-cyan-300" />
              Trading Desk
            </CardTitle>
            <CardDescription className="text-slate-300">
              Convert SOL to USDC through Jupiter with real wallet signing or demo mode.
            </CardDescription>
          </div>
          <Badge className={demoMode ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-500 text-white'}>
            {demoMode ? 'DEMO' : 'LIVE'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <Alert className={demoMode ? 'border-yellow-200 bg-yellow-50' : 'border-cyan-200 bg-cyan-50'}>
          {demoMode ? <TriangleAlert className="h-4 w-4 text-yellow-700" /> : <ShieldCheck className="h-4 w-4 text-cyan-700" />}
          <AlertDescription className={demoMode ? 'text-yellow-900' : 'text-cyan-900'}>
            {demoMode
              ? 'Demo mode stays available. Trades are simulated locally without a wallet signature.'
              : 'Live mode is connected to Jupiter and will sign the swap with your Solana wallet.'}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">From</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">SOL</p>
              <p className="text-sm text-slate-500">Solana native token</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">To</p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">USDC</p>
              <p className="text-sm text-slate-500">Stable protection layer</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Amount SOL</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={tradeAmount}
              onChange={(event) => setTradeAmount(event.target.value)}
              className="border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Slippage bps</label>
            <Input
              type="number"
              min="10"
              step="10"
              value={slippageBps}
              onChange={(event) => setSlippageBps(event.target.value)}
              className="border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={() => setPreset(25)} className="border-slate-200">
            25%
          </Button>
          <Button variant="outline" onClick={() => setPreset(50)} className="border-slate-200">
            50%
          </Button>
          <Button variant="outline" onClick={() => setPreset(100)} className="border-slate-200">
            Max
          </Button>
        </div>

        {estimate && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Estimated result</p>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <div>Input: {formatSwapAmount(estimate.input)} SOL</div>
              <div>Output: {estimate.output.toFixed(2)} USDC</div>
              <div>Impact: {Number(estimate.impact || 0).toFixed(2)}%</div>
            </div>
          </div>
        )}

        <Button
          onClick={handleExecuteTrade}
          disabled={isTrading || !walletAddress}
          className="w-full bg-slate-950 text-white hover:bg-slate-800"
        >
          {isTrading ? 'Executing...' : demoMode ? 'Run demo secure trade' : 'Swap SOL to USDC'}
        </Button>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-cyan-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Status</p>
              <p className="text-sm text-slate-600">{status}</p>
              {txHash && (
                <p className="mt-2 break-all text-xs text-slate-500">
                  {demoMode ? 'Demo tx' : 'Tx'}: {txHash}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
