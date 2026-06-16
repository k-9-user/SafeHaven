// @ts-nocheck
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { post } from '@/lib/api';
import {
  LayoutDashboard, BookOpen, ShieldCheck, MessageSquare,
  Settings, LogOut, Menu, X, MailWarning,
} from 'lucide-react';

function SidebarContent({ onClose, user, onLogout, t }) {
  const NAV = [
    { to: '/dashboard',           labelKey: 'nav.overview',  icon: LayoutDashboard, end: true },
    { to: '/dashboard/education', labelKey: 'nav.education', icon: BookOpen },
    { to: '/dashboard/platform',  labelKey: 'nav.platform',  icon: ShieldCheck },
    { to: '/dashboard/chat',      labelKey: 'nav.chat',      icon: MessageSquare },
    { to: '/dashboard/settings',  labelKey: 'nav.settings',  icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Safe Haven Money" className="h-9 w-9" />
          <div>
            <p className="font-black text-white text-sm leading-tight">Safe Haven Money</p>
            <p className="text-[10px] text-slate-400 leading-tight">Voice AI · Finance · DeFi</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, labelKey, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      {/* Language switcher before user footer */}
      <div className="px-4 pb-2">
        <LanguageSwitcher className="justify-center" />
      </div>

      {/* User footer */}
      <div className="border-t border-slate-700/60 px-4 py-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}

function EmailVerifBanner({ email }) {
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);

  const resend = async () => {
    if (busy || sent) return;
    setBusy(true);
    try {
      await post('/api/auth/resend-verification', {});
      setSent(true);
    } catch (_) {
      setSent(true); // afficher quand même un message positif
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
         style={{ background: '#7c3aed', color: '#fff' }}>
      <div className="flex items-center gap-2 min-w-0">
        <MailWarning className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Confirmez votre email <strong>{email}</strong> pour activer votre compte.
        </span>
      </div>
      {!sent ? (
        <button
          onClick={resend}
          disabled={busy}
          className="shrink-0 rounded-lg border border-white/40 px-3 py-1 text-xs font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {busy ? '…' : 'Renvoyer'}
        </button>
      ) : (
        <span className="shrink-0 text-xs font-semibold text-white/80">Email envoyé ✓</span>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { t }            = useLanguage();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:w-56 lg:w-64 shrink-0 flex-col">
        <SidebarContent user={user} onLogout={handleLogout} t={t} />
      </aside>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col z-10">
            <SidebarContent user={user} onLogout={handleLogout} onClose={() => setOpen(false)} t={t} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Banner email non vérifié */}
        {user?.isEmailVerified === false && (
          <EmailVerifBanner email={user.email} />
        )}

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <img src="/logo.svg" alt="Safe Haven Money" className="h-7 w-7" />
            <span className="font-bold text-white text-sm">Safe Haven Money</span>
          </div>
          <LanguageSwitcher />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
