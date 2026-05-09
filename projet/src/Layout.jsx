import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Wallet, ShieldCheck, LogOut, LogIn, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      await base44.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
      window.location.reload();
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .retro-text {
          font-family: 'Press Start 2P', cursive;
          text-shadow: 
            3px 3px 0px #FF1744,
            6px 6px 0px #FFD600,
            9px 9px 0px #00E676;
        }
        
        .pixel-border {
          box-shadow: 
            0 0 0 2px #000,
            0 0 0 4px #FFF,
            0 0 0 6px #FF1744,
            0 0 20px rgba(255, 23, 68, 0.5);
        }
        
        .retro-glow {
          animation: retro-pulse 2s ease-in-out infinite;
        }
        
        @keyframes retro-pulse {
          0%, 100% { 
            box-shadow: 0 0 10px #FF1744, 0 0 20px #FFD600, 0 0 30px #00E676;
          }
          50% { 
            box-shadow: 0 0 20px #FF1744, 0 0 40px #FFD600, 0 0 60px #00E676;
          }
        }
        
        @keyframes pixel-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
        
        .pixel-grid {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .logo-shadow {
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)) 
                  drop-shadow(0 0 20px rgba(255, 23, 68, 0.3))
                  drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
      `}</style>

      {/* Navigation Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-blue-600/90 backdrop-blur-xl border-b-2 md:border-b-4 border-blue-400 pixel-grid"
      >
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <Link to={createPageUrl('EducationalHub')} onClick={closeMenu}>
              <motion.div 
                className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-700/80 via-blue-600/80 to-blue-700/80 border-2 md:border-3 border-blue-400 rounded-lg logo-shadow"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(37, 99, 235, 0.95) 50%, rgba(30, 58, 138, 0.95) 100%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-baseline gap-2">
                  <h1 
                    className="text-xl md:text-3xl font-black tracking-wider"
                    style={{
                      fontFamily: "'Press Start 2P', cursive",
                      background: 'linear-gradient(to bottom, #3B82F6 0%, #0EA5E9 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(2px 2px 0px #1E3A8A) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))'
                    }}
                  >
                    SAFE
                  </h1>
                  <p 
                    className="text-sm md:text-xl font-black" 
                    style={{ 
                      fontFamily: "'Press Start 2P', cursive", 
                      color: '#0EA5E9',
                      textShadow: '1px 1px 0px #0369A1, 0 0 10px rgba(14, 165, 233, 0.5)'
                    }}
                  >
                    HAVEN
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link to={createPageUrl('EducationalHub')}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-none font-bold text-sm transition-all border-2 md:border-4 ${
                    currentPageName === 'EducationalHub'
                      ? 'bg-blue-400 text-white border-blue-600 shadow-lg shadow-blue-400/50'
                      : 'bg-blue-600 text-white border-blue-800 hover:bg-blue-500'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  <BookOpen className="w-4 h-4" />
                  EDUCATION
                </motion.button>
              </Link>

              <Link to={createPageUrl('EducationalHub')}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-none font-bold text-sm transition-all border-2 md:border-4 ${
                    currentPageName === 'EducationalHub'
                      ? 'bg-blue-400 text-white border-blue-600 shadow-lg shadow-blue-400/50'
                      : 'bg-slate-700 text-white border-slate-900 hover:bg-slate-600'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  <Wallet className="w-4 h-4" />
                  WALLET
                </motion.button>
              </Link>

              <Link to={createPageUrl('EducationalHub')}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-none font-bold text-sm transition-all border-2 md:border-4 ${
                    currentPageName === 'EducationalHub'
                      ? 'bg-blue-400 text-white border-blue-600 shadow-lg shadow-blue-400/50'
                      : 'bg-cyan-500 text-white border-cyan-700 hover:bg-cyan-400'
                  }`}
                  style={{ fontFamily: 'monospace' }}
                >
                  <ShieldCheck className="w-4 h-4" />
                  PLATFORM
                </motion.button>
              </Link>

              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-none font-bold text-sm bg-red-600 text-white border-2 md:border-4 border-red-800 hover:bg-red-500 transition-all"
                      style={{ fontFamily: 'monospace' }}
                    >
                      <LogOut className="w-4 h-4" />
                      EXIT
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogin}
                      className="flex items-center gap-2 px-4 py-2 rounded-none font-bold text-sm bg-green-500 text-white border-2 md:border-4 border-green-700 hover:bg-green-400 transition-all"
                      style={{ fontFamily: 'monospace' }}
                    >
                      <LogIn className="w-4 h-4" />
                      START
                    </motion.button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-blue-400 border-2 border-blue-600"
              style={{ fontFamily: 'monospace' }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-3 space-y-2 overflow-hidden"
              >
                <Link to={createPageUrl('EducationalHub')} onClick={closeMenu}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none font-bold text-sm transition-all border-2 ${
                      currentPageName === 'EducationalHub'
                        ? 'bg-blue-400 text-white border-blue-600 shadow-lg'
                        : 'bg-blue-600 text-white border-blue-800'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    <BookOpen className="w-5 h-5" />
                    EDUCATION
                  </motion.button>
                </Link>

                <Link to={createPageUrl('EducationalHub')} onClick={closeMenu}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none font-bold text-sm transition-all border-2 ${
                      currentPageName === 'EducationalHub'
                        ? 'bg-blue-400 text-white border-blue-600 shadow-lg'
                        : 'bg-slate-700 text-white border-slate-900'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    <Wallet className="w-5 h-5" />
                    WALLET
                  </motion.button>
                </Link>

                <Link to={createPageUrl('EducationalHub')} onClick={closeMenu}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none font-bold text-sm transition-all border-2 ${
                      currentPageName === 'EducationalHub'
                        ? 'bg-blue-400 text-white border-blue-600 shadow-lg'
                        : 'bg-cyan-500 text-white border-cyan-700'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    PLATFORM
                  </motion.button>
                </Link>

                {!isLoading && (
                  <>
                    {isAuthenticated ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none font-bold text-sm bg-red-600 text-white border-2 border-red-800 transition-all"
                        style={{ fontFamily: 'monospace' }}
                      >
                        <LogOut className="w-5 h-5" />
                        EXIT GAME
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          handleLogin();
                          closeMenu();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-none font-bold text-sm bg-green-500 text-white border-2 border-green-700 transition-all"
                        style={{ fontFamily: 'monospace' }}
                      >
                        <LogIn className="w-5 h-5" />
                        START GAME
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Page Content */}
      <div className="pt-16 md:pt-20">
        {children}
      </div>

      {/* Retro Footer Badge - Hidden on small mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-2 md:bottom-4 right-2 md:right-4 z-40 hidden sm:block"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white px-2 md:px-4 py-1 md:py-2 border-2 md:border-4 border-black shadow-lg"
          style={{ fontFamily: 'monospace' }}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-sm md:text-base"
            >
              🎮
            </motion.span>
            <span className="text-[10px] md:text-xs font-black">RETRO MODE</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}