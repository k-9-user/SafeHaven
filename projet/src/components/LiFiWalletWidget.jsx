import { useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LiFiWidget } from '@lifi/widget';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards } from 'lucide-react';

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

  return <div ref={mountRef} className="min-h-[600px] w-full rounded-lg" />;
}

export default function LiFiWalletWidget() {
  const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

  const widgetConfig = useMemo(
    () => ({
      appearance: 'light',
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
    <div className="rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 p-4 sm:p-6">
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
            <Badge variant="outline" className="rounded-md border-blue-200 bg-white text-blue-800">
              Route-ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <IsolatedLiFiWidget config={widgetConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
