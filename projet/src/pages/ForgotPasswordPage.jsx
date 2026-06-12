import { useState } from 'react';
import { Link } from 'react-router-dom';
import { post } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await post('/api/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.svg" alt="Safe Haven Money" className="h-12 w-12" />
          <div className="text-left">
            <h1 className="text-2xl font-black text-white leading-tight">Safe Haven Money</h1>
            <p className="text-xs text-slate-400">Finance & Protection</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8">

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Email envoyé !</h2>
              <p className="text-sm text-slate-500">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien
                de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs text-slate-400">Vérifiez aussi vos spams.</p>
              <Link
                to="/login"
                className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
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

              <h2 className="text-2xl font-bold text-slate-900 mb-1">Mot de passe oublié</h2>
              <p className="text-sm text-slate-500 mb-6">
                Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    autoComplete="email"
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
                      Envoi en cours…
                    </span>
                  ) : 'Envoyer le lien'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
