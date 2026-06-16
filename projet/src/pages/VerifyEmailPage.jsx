// @ts-nocheck
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { get } from '@/lib/api';

export default function VerifyEmailPage() {
  const [params]  = useSearchParams();
  const token     = params.get('token');
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Lien invalide : token manquant.');
      return;
    }

    get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setStatus('success');
        setMessage(data.message ?? 'Email confirmé avec succès !');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message ?? 'Lien invalide ou expiré.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.svg" alt="Safe Haven Money" className="h-12 w-12" />
          <div className="text-left">
            <h1 className="text-2xl font-black text-white leading-tight">Safe Haven Money</h1>
            <p className="text-xs text-slate-400">Finance & Protection</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/40 p-8 flex flex-col items-center gap-5 text-center">

          {status === 'loading' && (
            <>
              <Loader2 className="h-14 w-14 text-cyan-500 animate-spin" />
              <p className="text-slate-600 font-medium">Vérification en cours…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-11 w-11 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Email confirmé !</h2>
              <p className="text-slate-500 text-sm">{message}</p>
              <p className="text-slate-400 text-sm">Votre compte Safe Haven Money est maintenant actif.</p>
              <Link
                to="/dashboard"
                className="mt-2 inline-block w-full py-3 rounded-xl text-white font-bold text-sm text-center transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #1e6ff1, #00c8ff)' }}
              >
                Accéder à mon dashboard →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-11 w-11 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Lien invalide</h2>
              <p className="text-slate-500 text-sm">{message}</p>
              <p className="text-slate-400 text-sm">
                Connectez-vous et cliquez sur "Renvoyer l'email" pour obtenir un nouveau lien.
              </p>
              <Link
                to="/login"
                className="mt-2 inline-block w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm text-center hover:bg-slate-800 transition-colors"
              >
                Se connecter
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
