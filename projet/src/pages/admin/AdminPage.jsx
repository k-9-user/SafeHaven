// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGet, adminPatch, adminDel } from '@/lib/api';
import {
  Users, BarChart3, UserX, Trash2,
  RefreshCw, Crown, ArrowLeft, UserCheck, TrendingUp, LogOut,
  Star, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Helpers visuels ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = 'cyan' }) {
  const colors = {
    cyan:    'bg-cyan-500/10 text-cyan-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber:   'bg-amber-500/10 text-amber-500',
    red:     'bg-red-500/10 text-red-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function ActiveBadge({ active }) {
  return active
    ? <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Actif</span>
    : <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Désactivé</span>;
}

// ── Page principale ────────────────────────────────────────────────────────────

function StarDisplay({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star
          key={n}
          size={12}
          className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{value}/5</span>
    </span>
  );
}

function AvgBar({ label, value }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-bold text-slate-700">{value ?? '—'}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #1e6ff1, #00c8ff)' }}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [tab,      setTab]      = useState('users');
  const [users,    setUsers]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [working,  setWorking]  = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes, feedbackRes] = await Promise.all([
        adminGet('/api/admin/users'),
        adminGet('/api/admin/stats'),
        adminGet('/api/admin/feedback'),
      ]);
      setUsers(usersRes.users);
      setStats(statsRes);
      setFeedback(feedbackRes);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('safehaven_admin_token');
        navigate('/admin/login', { replace: true });
      } else {
        setError(err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleActive = async (id, current) => {
    setWorking(id);
    try {
      await adminPatch(`/api/admin/users/${id}`, { isActive: !current });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  const removeUser = async (id, name) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${name} ?`)) return;
    setWorking(id);
    try {
      await adminDel(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('safehaven_admin_token');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900">Administration</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 text-red-500 border-red-200 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Déconnexion admin
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        {[
          { id: 'stats',    label: 'Statistiques', icon: BarChart3 },
          { id: 'users',    label: 'Utilisateurs',  icon: Users },
          { id: 'feedback', label: `Avis (${feedback?.total ?? 0})`, icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Statistiques ───────────────────────────────────────────── */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}      label="Comptes total"    value={stats?.total}     color="cyan" />
            <StatCard icon={UserCheck}  label="Comptes actifs"   value={stats?.active}    color="emerald" />
            <StatCard icon={UserX}      label="Désactivés"       value={stats?.inactive}  color="red" />
            <StatCard icon={TrendingUp} label="7 derniers jours" value={stats?.last7days} color="amber" />
          </div>

          {stats?.newestUsers?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Derniers inscrits</h2>
              <div className="space-y-3">
                {stats.newestUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-600 text-sm font-bold">
                        {u.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Feedback ──────────────────────────────────────────────── */}
      {tab === 'feedback' && (
        <div className="space-y-5">
          {/* Moyennes */}
          {feedback?.total > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">
                Moyennes — {feedback.total} réponse{feedback.total > 1 ? 's' : ''}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <AvgBar label="Facilité d'utilisation" value={feedback.averages?.ease} />
                <AvgBar label="Contenu éducatif"       value={feedback.averages?.content} />
                <AvgBar label="Coach IA (Coco)"        value={feedback.averages?.ai} />
                <AvgBar label="Expérience générale"    value={feedback.averages?.overall} />
              </div>
            </div>
          )}

          {/* Liste des avis */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Chargement…
              </div>
            ) : !feedback?.feedback?.length ? (
              <p className="text-center py-16 text-slate-400">Aucun avis reçu pour l'instant.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {feedback.feedback.map((entry) => (
                  <div key={entry.id} className="px-5 py-4 space-y-2.5">
                    {/* Date + page + langue */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>{new Date(entry.submittedAt).toLocaleString('fr-FR')}</span>
                      {entry.page && (
                        <span className="bg-slate-100 rounded px-1.5 py-0.5 font-mono">{entry.page}</span>
                      )}
                      {entry.lang && (
                        <span className="bg-blue-50 text-blue-500 rounded px-1.5 py-0.5 font-semibold uppercase">
                          {entry.lang}
                        </span>
                      )}
                    </div>
                    {/* Notes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                      <div>Utilisation <StarDisplay value={entry.ratings.ease} /></div>
                      <div>Contenu <StarDisplay value={entry.ratings.content} /></div>
                      <div>IA Coco <StarDisplay value={entry.ratings.ai} /></div>
                      <div>Global <StarDisplay value={entry.ratings.overall} /></div>
                    </div>
                    {/* Commentaire libre */}
                    {entry.comment && (
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
                        "{entry.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Onglet Utilisateurs ───────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Chargement…
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-16 text-slate-400">Aucun utilisateur.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inscription</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(u => {
                    const busy = working === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-bold shrink-0">
                              {u.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><ActiveBadge active={u.isActive} /></td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={busy}
                              onClick={() => toggleActive(u.id, u.isActive)}
                              title={u.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              disabled={busy}
                              onClick={() => removeUser(u.id, u.name)}
                              title="Supprimer le compte"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
