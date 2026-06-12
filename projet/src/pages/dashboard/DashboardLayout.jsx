import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard, BookOpen, ShieldCheck, MessageSquare,
  Settings, LogOut, Menu, X,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard',            label: 'Vue d\'ensemble', icon: LayoutDashboard, end: true },
  { to: '/dashboard/education',  label: 'Éducation',       icon: BookOpen },
  { to: '/dashboard/platform',   label: 'Plateforme',      icon: ShieldCheck },
  { to: '/dashboard/chat',       label: 'Coach IA',        icon: MessageSquare },
  { to: '/dashboard/settings',   label: 'Paramètres',      icon: Settings },
];

function SidebarContent({ onClose, user, onLogout }) {
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
        {NAV.map(({ to, label, icon: Icon, end }) => (
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
            {label}
          </NavLink>
        ))}

      </nav>

      {/* User footer */}
      <div className="border-t border-slate-700/60 px-4 py-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Utilisateur'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
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
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col z-10">
            <SidebarContent user={user} onLogout={handleLogout} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Safe Haven Money" className="h-7 w-7" />
            <span className="font-bold text-slate-900 text-sm">Safe Haven Money</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
