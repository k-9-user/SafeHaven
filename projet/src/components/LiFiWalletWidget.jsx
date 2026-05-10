import { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LiFiWidget } from '@lifi/widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards } from 'lucide-react';

const SOLANA_CHAIN_ID = 1151111081099710;
const SOL_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112';
const SOLANA_USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

function IsolatedLiFiWidget({ config }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const root = createRoot(mountRef.current);
    root.render(<LiFiWidget integrator="SafeHaven" config={config} />);

    return () => {
      root.unmount();
    };
  }, [config]);

  return <div ref={mountRef} className="safehaven-lifi-widget min-h-[600px] w-full rounded-lg" />;
}

export default function LiFiWalletWidget() {
  const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

  const widgetConfig = useMemo(
    () => ({
      appearance: 'light',
      fromChain: SOLANA_CHAIN_ID,
      toChain: SOLANA_CHAIN_ID,
      fromToken: SOL_TOKEN_ADDRESS,
      toToken: SOLANA_USDC_ADDRESS,
      fromAmount: '0.25',
      languageResources: {
        en: {
          button: {
            connectWallet: 'Exchange when funds are sufficient',
            connectChainWallet: 'Exchange when funds are sufficient',
            exchange: 'Exchange and proceed',
            swapReview: 'Review exchange',
            startSwapping: 'Proceed with exchange',
          },
          info: {
            message: {
              missingRouteRequiredAccount: '',
            },
          },
        },
      },
      theme: {
        container: {
          border: '1px solid #dbeafe',
          borderRadius: '8px',
          boxShadow: 'none',
          minHeight: '600px',
        },
      },
      walletConfig: {
        forceInternalWalletManagement: true,
        walletConnect: walletConnectProjectId
          ? { projectId: walletConnectProjectId }
          : undefined,
      },
    }),
    [walletConnectProjectId],
  );

  return (
    <div className="safehaven-lifi-widget-shell rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 p-4 sm:p-6">
      <style>
        {`
          .safehaven-lifi-widget-shell .safehaven-lifi-widget .MuiCollapse-root:has([data-testid="WalletIcon"]) {
            display: none !important;
          }
        `}
      </style>
      <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
        <CardHeader className="border-b border-blue-200 bg-white/75">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <WalletCards className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-blue-950">
                  LI.FI Wallet Connect
                </CardTitle>
                <CardDescription className="mt-1 max-w-2xl text-blue-800">
                  Choose chains and tokens freely, then compare swap or bridge routes that match the user's financial goals.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <IsolatedLiFiWidget config={widgetConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
