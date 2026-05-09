import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BadgeAlert, Clock3, Link2, ShieldAlert } from 'lucide-react';
import type { StrategyRecommendationView } from './StrategyCard';

export interface BridgePlanView {
  routeName: string;
  sourceChainId: number;
  destinationChainId: number;
  sourceTokenSymbol: string;
  destinationTokenSymbol: string;
  estimatedFeeUSD: number;
  estimatedTimeMinutes: number;
  steps: string[];
  routeUrl?: string;
}

export interface StrategyDetailProps {
  recommendation: StrategyRecommendationView | null;
  bridgePlan?: BridgePlanView | null;
  onBack?: () => void;
  onConfirm?: (recommendation: StrategyRecommendationView) => void;
}

function formatApy(range: { min: number; max: number }): string {
  return `${range.min.toFixed(1)}% - ${range.max.toFixed(1)}%`;
}

export function StrategyDetail({ recommendation, bridgePlan, onBack, onConfirm }: StrategyDetailProps) {
  if (!recommendation) {
    return (
      <Card className="border-slate-200 bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">No strategy selected</CardTitle>
          <CardDescription>Select a recommendation to see details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-cyan-500 text-slate-950 hover:bg-cyan-500">Risk {recommendation.riskLevel}</Badge>
              <Badge variant="outline" className="border-white/20 text-white">
                {recommendation.protocol.toUpperCase()}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-3xl text-white">{recommendation.name}</CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-slate-300">
                {recommendation.plainDescription}
              </CardDescription>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Expected APY</p>
            <p className="mt-1 text-2xl font-black text-white">{formatApy(recommendation.expectedApyRange)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Allocation</p>
            <p className="mt-2 text-2xl font-black text-slate-950">${recommendation.allocationUSD.toFixed(2)}</p>
            <p className="text-sm text-slate-600">{recommendation.allocationPercent.toFixed(1)}% of savings</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Minimum amount</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">${recommendation.minAmountUSD.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Recommended starter size</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exit</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{recommendation.lockup}</p>
            <p className="text-sm text-slate-600">{recommendation.exitCost}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
            <div className="flex items-center gap-2 text-cyan-700">
              <BadgeAlert className="h-4 w-4" />
              <p className="font-semibold">Why this fits</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{recommendation.whyItFits}</p>
          </div>

          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
            <div className="flex items-center gap-2 text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              <p className="font-semibold">What can go wrong?</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {recommendation.whatCanGoWrong.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-rose-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {bridgePlan && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Link2 className="h-4 w-4 text-cyan-600" />
                <p className="font-semibold">Bridge into Solana first</p>
              </div>
              <Badge className="bg-slate-900 text-white hover:bg-slate-900">{bridgePlan.routeName}</Badge>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Fee</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">${bridgePlan.estimatedFeeUSD.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Time</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">~{bridgePlan.estimatedTimeMinutes} min</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Route</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{bridgePlan.sourceTokenSymbol} → {bridgePlan.destinationTokenSymbol}</p>
              </div>
            </div>

            {bridgePlan.steps.length > 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Clock3 className="h-4 w-4 text-cyan-600" />
                  <p className="font-semibold">Route steps</p>
                </div>
                <ol className="mt-3 space-y-2 text-sm text-slate-700">
                  {bridgePlan.steps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="text-cyan-600">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          {onConfirm && (
            <Button type="button" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => onConfirm(recommendation)}>
              Confirm strategy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
