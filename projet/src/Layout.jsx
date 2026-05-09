import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Wallet, ShieldCheck, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'education', label: 'EDUCATION', icon: BookOpen },
  { id: 'wallet', label: 'WALLET', icon: Wallet },
  { id: 'platform', label: 'PLATFORM', icon: ShieldCheck },
];

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeSection = location.hash.replace('#', '') || 'education';

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const navigateToSection = (section) => {
    closeMenu();
    navigate(`/educationalhub#${section}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigateToSection('education')}
              className="flex items-center gap-3 text-left"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-2 text-white shadow-sm transition-all md:px-5 md:py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-sm font-black text-white">
                  S
                </div>
                <div className="leading-tight">
                  <h1 className="text-sm font-semibold tracking-wide md:text-base">SafeHaven</h1>
                  <p className="text-xs text-slate-300">Finance, education and protection</p>
                </div>
              </motion.div>
            </button>

            <div className="hidden items-center gap-2 md:flex">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigateToSection(item.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'border-cyan-500 bg-cyan-50 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => navigateToSection(activeSection)}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
              >
                Open
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid gap-2 overflow-hidden md:hidden"
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateToSection(item.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'border-cyan-500 bg-cyan-50 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <div className="pt-20 md:pt-24">
        {children}
      </div>
    </div>
  );
}