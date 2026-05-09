import { useMemo } from 'react'
import { LiFiWidget } from '@lifi/widget'
import './App.css'

function App() {
  const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

  const widgetConfig = useMemo(
    () => ({
      appearance: 'light',
      theme: {
        container: {
          border: '1px solid #e0e0e0',
          borderRadius: '16px',
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
  )

  return (
    <div style={{ padding: '20px' }}>
      <h1>SafeHaven - Widget LiFi</h1>
      <p>
        Connectez un wallet pour vous authentifier et démarrer un swap ou un
        bridge.
      </p>
      <div className="lifi-widget-container">
        <LiFiWidget integrator="SafeHaven" config={widgetConfig} />
      </div>
    </div>
  )
}

export default App
