import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPost } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Crown, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const navigate                        = useNavigate();
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { adminToken } = await adminPost('/api/admin/login', { username, password });
      localStorage.setItem('safehaven_admin_token', adminToken);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black text-white">Administration</h1>
            <p className="text-xs text-slate-400">SafeHaven — Accès restreint</p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700/60 p-7">
          {error && (
            <div className="mb-4 rounded-xl bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-slate-300 text-sm">Identifiant</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Identifiant admin"
                required
                autoComplete="username"
                className="mt-1.5 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 text-sm">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Cacher' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-black font-bold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion…
                </span>
              ) : 'Accéder au panel'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
