import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export interface StrategyRecommendationView {
  strategyId: string;
  name: string;
  protocol: string;
  category: 'money_market' | 'stablecoin_lending' | 'liquid_staking';
  plainDescription: string;
  expectedApyRange: { min: number; max: number };
  riskLevel: number;
  minAmountUSD: number;
  lockup: string;
  exitCost: string;
  allocationUSD: number;
  allocationPercent: number;
  matchScore: number;
  whyItFits: string;
  whatCanGoWrong: string[];
}

export interface StrategyCardProps {
  recommendation: StrategyRecommendationView;
  onPress?: (recommendation: StrategyRecommendationView) => void;
  compact?: boolean;
}

function formatApyRange(range: { min: number; max: number }): string {
  return `${range.min.toFixed(1)}% - ${range.max.toFixed(1)}%`;
}

export function StrategyCard({ recommendation, onPress, compact = false }: StrategyCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-cyan-600 text-white hover:bg-cyan-600">
                Risk {recommendation.riskLevel}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-700">
                {recommendation.protocol.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-xl text-slate-950">{recommendation.name}</CardTitle>
            <CardDescription className="max-w-2xl text-slate-600">
              {recommendation.plainDescription}
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-right text-white">
            <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.2em] text-slate-300">
              <TrendingUp className="h-3.5 w-3.5" /> APY
            </div>
            <p className="mt-1 text-lg font-semibold">{formatApyRange(recommendation.expectedApyRange)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Allocation</p>
            <p className="mt-1 text-base font-semibold text-slate-900">${recommendation.allocationUSD.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{recommendation.allocationPercent.toFixed(1)}% of savings</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Minimum</p>
            <p className="mt-1 text-base font-semibold text-slate-900">${recommendation.minAmountUSD.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Start small, then scale</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Exit</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{recommendation.lockup}</p>
            <p className="text-xs text-slate-500">{recommendation.exitCost}</p>
          </div>
        </div>
      </CardHeader>

      {!compact && (
        <CardContent className="space-y-4 pt-0">
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <div className="flex items-center gap-2 text-cyan-700">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">Why this fits</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation.whyItFits}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">What can go wrong?</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {recommendation.whatCanGoWrong.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-rose-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      {onPress && (
        <CardContent className="pt-0">
          <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => onPress(recommendation)}>
            View details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
