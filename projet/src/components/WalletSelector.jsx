import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, AlertCircle, ExternalLink, Smartphone } from 'lucide-react';

export default function WalletSelector({ onWalletSelect, onConnect }) {
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const phantomProvider = typeof window !== 'undefined' ? /** @type {any} */ (window).solana : undefined;

  const wallets = [
    {
      id: 'phantom',
      name: 'Phantom',
      icon: Wallet,
      description: 'Solana wallet with Mobile Wallet Adapter support on Android Chrome',
      downloadUrl: 'https://phantom.app/',
      color: 'from-blue-700 to-cyan-600',
      colorBorder: 'border-blue-400',
      installed: !!phantomProvider?.isPhantom,
    },
    {
      id: 'solana-mobile',
      name: 'Solana Mobile',
      icon: Smartphone,
      description: 'Android MWA path for Seeker/Saga-style mobile signing',
      downloadUrl: 'https://docs.solanamobile.com/mobile-wallet-adapter/mobile-apps',
      color: 'from-slate-900 to-blue-700',
      colorBorder: 'border-cyan-400',
      installed: false,
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: Wallet,
      description: 'MWA-compatible Solana wallet',
      downloadUrl: 'https://solflare.com/',
      color: 'from-blue-600 to-sky-500',
      colorBorder: 'border-sky-400',
      installed: false,
    },
    {
      id: 'demo',
      name: 'Guided Demo',
      icon: Check,
      description: 'Try the full education and protection flow without funds',
      downloadUrl: 'https://docs.solana.com/wallet-guide',
      color: 'from-emerald-600 to-cyan-600',
      colorBorder: 'border-emerald-400',
      installed: false,
    },
  ];

  const handleWalletConnect = async (wallet) => {
    try {
      setError(null);
      setConnecting(true);
      onWalletSelect(wallet.id);

      // Always allow a demo connect so the flow works without an extension installed.
      if (onConnect) {
        await onConnect(wallet.id, { demo: !wallet.installed });
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="rounded-lg bg-gradient-to-b from-blue-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 border-4 border-white shadow-lg">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-blue-700">
            Choose a Solana wallet to start your SafeHaven journey
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="bg-red-100 border-2 border-red-400">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 font-semibold">
                  {error}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {wallets.map((wallet, index) => {
            const Icon = wallet.icon;
            return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative"
            >
              <Card className={`bg-gradient-to-br ${wallet.color} bg-opacity-10 border-2 ${wallet.colorBorder} overflow-hidden h-full`}>
                {/* Installation Status Badge */}
                {wallet.installed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/90 text-blue-800"
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl text-blue-900">
                        {wallet.name}
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        {wallet.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {wallet.installed ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-green-100 border-2 border-green-400 rounded-lg"
                    >
                      <p className="text-green-800 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Installed & Ready
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg"
                    >
                      <p className="text-yellow-800 font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Demo mode available
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        You can still test the flow without installing the extension
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Button
                      onClick={() => handleWalletConnect(wallet)}
                      disabled={connecting}
                      className={`w-full h-12 font-bold text-lg border-2 ${
                        wallet.installed
                          ? `bg-gradient-to-r ${wallet.color} border-white hover:shadow-lg`
                          : 'bg-gradient-to-r from-slate-700 to-slate-900 border-white hover:shadow-lg'
                      }`}
                    >
                      {connecting ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          Connecting...
                        </motion.span>
                      ) : wallet.installed ? (
                        'Connect Now'
                      ) : (
                        'Demo Connect'
                      )}
                    </Button>
                  </motion.div>

                  {!wallet.installed && (
                    <a
                      href={wallet.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className="w-full bg-white text-blue-900 border-2 border-blue-400 hover:bg-blue-50 h-10 font-semibold"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Download {wallet.name}
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-blue-900/10 border-2 border-blue-400">
            <CardHeader>
              <CardTitle className="text-blue-900">Why connect a wallet?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <Wallet className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <p className="font-bold text-blue-900">Secure</p>
                  <p className="text-blue-700 text-sm">Your private keys stay with you, never shared</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Check className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <p className="font-bold text-blue-900">Complete Transactions</p>
                  <p className="text-blue-700 text-sm">Send payments and mint NFTs on Solana</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Smartphone className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <p className="font-bold text-blue-900">Mobile-ready</p>
                  <p className="text-blue-700 text-sm">Built around Solana Mobile Wallet Adapter readiness</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* DevNet Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Alert className="bg-orange-100 border-2 border-orange-400">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-600">
              <strong>Demo safety:</strong> Use Guided Demo for judging and onboarding. Live swaps require explicit wallet approval and real funds.
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    </div>
  );
}
