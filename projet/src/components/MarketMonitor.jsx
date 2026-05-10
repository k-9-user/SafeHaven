import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MarketMonitor({ walletAddress, solanaBalance, onAutoSecure }) {
  const [marketData, setMarketData] = useState({
    solPrice: 141.25,
    priceChange24h: -3.2, // -3.2%
    riskLevel: 'medium', // low, medium, high
    marketCap: 52400000000,
    volatility: 2.4, // %
  });
  const [autoSecured, setAutoSecured] = useState(false);
  const [secureThreshold] = useState(-8); // trigger at -8% change
  const [loading, setLoading] = useState(false);

  const deriveRiskLevel = (priceChange24h) => {
    if (priceChange24h <= -10) return 'high';
    if (priceChange24h <= -4) return 'medium';
    return 'low';
  };

  const syncRiskState = (priceChange24h, solPrice) => {
    const nextVolatility = Math.min(12, Math.max(0.4, Math.abs(priceChange24h) * 0.35 + 1.2));

    setMarketData((prev) => ({
      ...prev,
      solPrice,
      priceChange24h,
      riskLevel: deriveRiskLevel(priceChange24h),
      volatility: nextVolatility,
      marketCap: 0,
    }));
  };

  // Real market data: fetch SOL price and 24h delta from CoinGecko
  useEffect(() => {
    let intervalId = null;

    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
        );
        const data = await response.json();

        if (data?.solana) {
          syncRiskState(
            Number(data.solana.usd_24h_change?.toFixed?.(2) ?? data.solana.usd_24h_change ?? 0),
            Number(data.solana.usd?.toFixed?.(2) ?? data.solana.usd ?? 0),
          );
        }

        intervalId = setInterval(async () => {
          try {
            const refreshResponse = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
            );
            const refreshData = await refreshResponse.json();

            if (refreshData?.solana) {
              syncRiskState(
                Number(refreshData.solana.usd_24h_change?.toFixed?.(2) ?? refreshData.solana.usd_24h_change ?? 0),
                Number(refreshData.solana.usd?.toFixed?.(2) ?? refreshData.solana.usd ?? 0),
              );
            }
          } catch (refreshError) {
            console.error('Error refreshing Solana market data:', refreshError);
          }
        }, 30000);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Check if auto-secure should trigger
  useEffect(() => {
    if (marketData.priceChange24h <= secureThreshold && !autoSecured && walletAddress) {
      // Trigger auto-secure
      triggerAutoSecure();
    }
  }, [marketData.priceChange24h, autoSecured, walletAddress, secureThreshold, onAutoSecure, solanaBalance]);

  const triggerAutoSecure = async () => {
    setLoading(true);
    try {
      const secureResult = onAutoSecure
        ? await onAutoSecure({
            walletAddress,
            solAmount: solanaBalance,
            secureReason: `Market risk: ${marketData.priceChange24h.toFixed(2)}% decline`,
          })
        : await fetch('/api/crypto/auto-secure-usdc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress,
              solAmount: solanaBalance,
              secureReason: `Market risk: ${marketData.priceChange24h.toFixed(2)}% decline`,
            }),
          }).then((response) => (response.ok ? response.json() : null));

      if (secureResult) {
        setAutoSecured(true);
        // Show success notification
        console.log('Auto-secure triggered: SOL → USDC');
      }
    } catch (error) {
      console.error('Error triggering auto-secure:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Monitor Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-blue-900">AI Risk Guard</CardTitle>
              <CardDescription>Live SOL market tracking with automatic asset protection</CardDescription>
            </div>
            <Badge variant="outline" className={`px-3 py-2 text-lg font-semibold ${getRiskColor(marketData.riskLevel)}`}>
              {marketData.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Market Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 font-medium">SOL Price</p>
              <p className="text-2xl font-bold text-blue-900">${marketData.solPrice.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 font-medium">24h Change</p>
              <p className={`text-2xl font-bold ${marketData.priceChange24h < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {marketData.priceChange24h > 0 ? '+' : ''}
                {marketData.priceChange24h.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 font-medium">Volatility</p>
              <p className="text-2xl font-bold text-blue-900">{marketData.volatility.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-600 font-medium">Your Balance</p>
              <p className="text-2xl font-bold text-blue-900">{solanaBalance?.toFixed(2) || '0'} SOL</p>
            </div>
          </div>

          {/* Auto-Secure Status */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800">Auto-Secure Status</span>
              </div>
              {autoSecured ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  ACTIVE (Secured in USDC)
                </Badge>
              ) : (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">ARMED</Badge>
              )}
            </div>

            {autoSecured && (
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  Your SOL has been automatically converted to USDC to protect against market downside.
                </AlertDescription>
              </Alert>
            )}

            {!autoSecured && marketData.priceChange24h < -5 && (
              <Alert className="bg-yellow-50 border-yellow-200 mb-4">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 ml-2">
                  Market volatility is increasing. Auto-secure will trigger at -{Math.abs(secureThreshold).toFixed(0)}% decline.
                </AlertDescription>
              </Alert>
            )}

            {!autoSecured && (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Trigger Threshold: <span className="font-semibold text-red-600">{secureThreshold}% change</span>
                </p>
                {marketData.priceChange24h <= secureThreshold && (
                  <Button
                    onClick={triggerAutoSecure}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Securing...' : 'Manually Secure Now (SOL → USDC)'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-blue-900 mb-1">How the AI guard works:</p>
            <ul className="space-y-1">
              <li>✓ Monitors SOL/USD price in real time</li>
              <li>✓ Automatically swaps SOL → USDC if risk threshold is hit</li>
              <li>✓ USDC stays pegged to $1 USD</li>
              <li>✓ Low fees and fast settlement on Solana</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {walletAddress && (
        <div className="flex gap-3">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            View Holdings
          </Button>
          <Button variant="outline" className="flex-1 border-blue-200">
            Swap SOL ↔ USDC
          </Button>
        </div>
      )}
    </div>
  );
}
