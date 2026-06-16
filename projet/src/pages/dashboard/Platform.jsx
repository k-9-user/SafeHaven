// @ts-nocheck
import { Suspense, lazy, useState } from 'react';
import MarketMonitor from '@/components/MarketMonitor';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WalletCards } from 'lucide-react';

const LiFiWalletWidget = lazy(() => import('@/components/LiFiWalletWidget'));

function WidgetSkeleton() {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-950">
          <WalletCards className="h-5 w-5" />
          LI.FI Wallet Connect
        </CardTitle>
        <CardDescription>Loading wallet widget…</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[360px] animate-pulse rounded-xl bg-blue-50" />
      </CardContent>
    </Card>
  );
}

export default function Platform() {
  const [solanaBalance, setSolanaBalance] = useState(12.5);
  const { lang } = useLanguage();

  const TITLE = { en: 'Platform', fr: 'Plateforme', es: 'Plataforma' }[lang] ?? 'Platform';
  const DESC  = {
    en: 'Monitor the market and manage your Solana assets securely.',
    fr: 'Surveillez le marché et gérez vos actifs Solana en toute sécurité.',
    es: 'Supervisa el mercado y gestiona tus activos Solana de forma segura.',
  }[lang] ?? '';

  const handleAutoSecure = async ({ walletAddress, solAmount }) => {
    if (!walletAddress) throw new Error('Connect a wallet first');
    if (String(walletAddress).startsWith('DEMO-')) {
      setSolanaBalance((prev) => Math.max(0, prev - Number(solAmount || 0)));
      return {
        signature:           `demo-${Date.now().toString(36)}`,
        estimatedInputSol:   Number(solAmount || 0),
        estimatedOutputUsdc: Number(solAmount || 0) * 141.25,
        priceImpactPct:      0.05,
      };
    }
    throw new Error('Real wallet required for transactions');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header with logo */}
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="Safe Haven Money" className="h-10 w-10 shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{TITLE}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">{DESC}</p>
        </div>
      </div>

      <MarketMonitor
        walletAddress="DEMO-SAFEHAVEN-PLATFORM"
        solanaBalance={solanaBalance}
        onAutoSecure={handleAutoSecure}
      />

      <Suspense fallback={<WidgetSkeleton />}>
        <LiFiWalletWidget />
      </Suspense>
    </div>
  );
}
