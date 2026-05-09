import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Wallet, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * NFTMintBridge Component
 * 
 * Displays a collection of NFT badges for students to mint on XRPL.
 * 
 * FUTURE INTEGRATION:
 * - Connect to Xaman Wallet SDK for secure NFT minting
 * - Sign transactions via Xaman mobile app
 * - Verify minting status on XRPL Ledger
 * 
 * @param {Array} nftCollection - Array of NFT objects { name, description, image, id, status }
 * @param {Function} onMint - Callback when mint button is clicked (wallet, nftId)
 * @param {String} userWallet - User's XRPL wallet address
 */
export default function NFTMintBridge({ 
  nftCollection = [], 
  onMint = null, 
  userWallet = null 
}) {
  const [mintingNFT, setMintingNFT] = useState(null);

  const handleMintClick = async (nft) => {
    if (!onMint) {
      console.log('⚠️ Mint function not connected yet - Xaman SDK integration pending');
      return;
    }

    setMintingNFT(nft.id);
    
    try {
      // Call the onMint callback (placeholder for now)
      await onMint(userWallet, nft.id);
    } catch (error) {
      console.error('Minting error:', error);
    } finally {
      setMintingNFT(null);
    }
  };

  // Mock data for demo if no collection provided
  const nfts = nftCollection.length > 0 ? nftCollection : [
    { 
      id: 1,
      name: "POP Badge #1", 
      description: "Reward for first savings goal", 
      image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=300&h=300&fit=crop",
      status: "available",
      rarity: "common"
    },
    { 
      id: 2,
      name: "POP Badge #2", 
      description: "Reward for currency conversion", 
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=300&fit=crop",
      status: "available",
      rarity: "rare"
    }
  ];

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'from-gray-500 to-gray-700',
      rare: 'from-blue-500 to-purple-600',
      epic: 'from-purple-500 to-pink-600',
      legendary: 'from-yellow-400 to-orange-500'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity) => {
    const borders = {
      common: 'border-gray-500',
      rare: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-yellow-400'
    };
    return borders[rarity] || borders.common;
  };

  return (
    <div className="w-full space-y-4">
      <style jsx>{`
        @keyframes pixel-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 23, 68, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 23, 68, 0.5);
          }
        }
        
        .nft-glow {
          animation: pixel-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm border-4 border-yellow-400">
          <CardHeader className="p-4 border-b-2 border-yellow-400/50">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-yellow-400 font-black" style={{ fontFamily: 'monospace' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="w-6 h-6" />
              </motion.div>
              NFT BADGE COLLECTION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Wallet Status */}
            {userWallet ? (
              <Alert className="bg-green-900/50 border-2 border-green-500 mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-200 text-xs md:text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Wallet className="w-4 h-4" />
                    <span className="break-all">WALLET: {userWallet.substring(0, 10)}...{userWallet.substring(userWallet.length - 6)}</span>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-orange-900/50 border-2 border-orange-500 mb-4">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <AlertDescription className="text-orange-200 text-xs md:text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                  ⚠️ CONNECT YOUR WALLET TO MINT NFTs
                </AlertDescription>
              </Alert>
            )}

            {/* Xaman SDK Notice */}
            {!onMint && (
              <Alert className="bg-blue-900/50 border-2 border-blue-500 mb-4">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <AlertDescription className="text-blue-200 text-xs md:text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                  💡 MINT FUNCTIONALITY COMING SOON VIA XAMAN SDK
                </AlertDescription>
              </Alert>
            )}

            <p className="text-gray-300 text-xs md:text-sm mb-4 text-center font-bold" style={{ fontFamily: 'monospace' }}>
              🎮 COLLECT BADGES • 🏆 UNLOCK ACHIEVEMENTS • 💎 OWN ON BLOCKCHAIN
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft, index) => (
          <motion.div
            key={nft.id || index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className={`bg-black/60 backdrop-blur-sm border-4 ${getRarityBorder(nft.rarity)} hover:shadow-2xl transition-all duration-300 overflow-hidden ${
              nft.status === 'minted' ? 'nft-glow' : ''
            }`}>
              {/* NFT Image */}
              <div className="relative overflow-hidden h-48 md:h-56 border-b-4 border-black">
                <motion.img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Rarity Badge */}
                {nft.rarity && (
                  <div className={`absolute top-2 right-2 bg-gradient-to-r ${getRarityColor(nft.rarity)} px-3 py-1 border-2 border-black`}>
                    <span className="text-white text-xs font-black" style={{ fontFamily: 'monospace' }}>
                      {nft.rarity.toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Minted Badge */}
                {nft.status === 'minted' && (
                  <div className="absolute top-2 left-2 bg-green-500 px-3 py-1 border-2 border-black">
                    <span className="text-white text-xs font-black flex items-center gap-1" style={{ fontFamily: 'monospace' }}>
                      <CheckCircle2 className="w-3 h-3" />
                      OWNED
                    </span>
                  </div>
                )}
              </div>

              {/* NFT Details */}
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-yellow-400 font-black text-sm md:text-base mb-1" style={{ fontFamily: 'monospace' }}>
                    {nft.name}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm font-bold" style={{ fontFamily: 'monospace' }}>
                    {nft.description}
                  </p>
                </div>

                {/* ============================================ */}
                {/* MINT BUTTON - XAMAN SDK INTEGRATION POINT   */}
                {/* ============================================ */}
                {nft.status !== 'minted' ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => handleMintClick(nft)}
                      disabled={!userWallet || mintingNFT === nft.id || !onMint}
                      className={`w-full h-10 md:h-12 font-black text-xs md:text-sm border-4 border-black transition-all ${
                        !userWallet || !onMint
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {mintingNFT === nft.id ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block mr-2"
                          >
                            <Zap className="w-4 h-4" />
                          </motion.div>
                          MINTING...
                        </>
                      ) : !userWallet ? (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          CONNECT WALLET
                        </>
                      ) : !onMint ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          COMING SOON
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          MINT NFT ⚡
                        </>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="bg-green-900/30 border-2 border-green-500 rounded p-3 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    </motion.div>
                    <p className="text-green-400 text-xs font-black" style={{ fontFamily: 'monospace' }}>
                      IN YOUR WALLET! 🎉
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Integration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50">
          <CardHeader className="p-3 border-b-2 border-cyan-500/30">
            <CardTitle className="flex items-center gap-2 text-sm text-cyan-400 font-black" style={{ fontFamily: 'monospace' }}>
              <Sparkles className="w-4 h-4" />
              XAMAN SDK INTEGRATION ROADMAP
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="text-gray-300 text-xs md:text-sm space-y-2 font-bold" style={{ fontFamily: 'monospace' }}>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">1.</span>
                <span>Initialize Xaman SDK with API credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">2.</span>
                <span>Create NFTokenMint transaction payload</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">3.</span>
                <span>Generate sign request and open Xaman app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">4.</span>
                <span>Monitor transaction status and update UI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">5.</span>
                <span>Verify NFT ownership on XRPL Ledger</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}