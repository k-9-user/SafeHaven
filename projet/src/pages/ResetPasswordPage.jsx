import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, CheckCircle2, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams]                  = useSearchParams();
  const navigate                        = useNavigate();
  const token                           = searchParams.get('token') ?? '';

  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8 max-w-md w-full text-center">
          <p className="text-slate-700 mb-4">Lien invalide ou manquant.</p>
          <Link to="/forgot-password" className="font-semibold text-cyan-600 hover:text-cyan-700">
            Faire une nouvelle demande
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError('');
    setLoading(true);
    try {
      await post('/api/auth/reset-password', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Lien invalide ou expiré. Faites une nouvelle demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 shadow-lg shadow-cyan-500/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-white leading-tight">SafeHaven</h1>
            <p className="text-xs text-slate-400">Finance & Protection</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8">

          {done ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Mot de passe mis à jour !</h2>
              <p className="text-sm text-slate-500">
                Votre mot de passe a bien été changé. Redirection vers la connexion…
              </p>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>

              <h2 className="text-2xl font-bold text-slate-900 mb-1">Nouveau mot de passe</h2>
              <p className="text-sm text-slate-500 mb-6">Choisissez un mot de passe sécurisé (min. 8 caractères).</p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-slate-700">Nouveau mot de passe</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 caractères"
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Cacher' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm" className="text-slate-700">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    autoComplete="new-password"
                    className="mt-1.5"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mise à jour…
                    </span>
                  ) : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
