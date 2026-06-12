import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, ShieldCheck, Info } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 mt-1 text-sm">Gérez votre compte SafeHaven.</p>
      </div>

      {/* Profil */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Profil
          </CardTitle>
          <CardDescription>Vos informations de compte.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-600 text-xs">Nom</Label>
            <Input value={user?.name ?? ''} disabled className="mt-1 bg-slate-50 text-slate-700" />
          </div>
          <div>
            <Label className="text-slate-600 text-xs">Email</Label>
            <Input value={user?.email ?? ''} disabled className="mt-1 bg-slate-50 text-slate-700" />
          </div>
          <p className="text-xs text-slate-400">La modification du profil sera disponible prochainement.</p>
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Authentification sécurisée</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Votre session est protégée par un jeton JWT (7 jours). Votre mot de passe est haché avec bcrypt.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* À propos */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" /> À propos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 leading-relaxed">
            SafeHaven est une plateforme d'éducation financière et d'accès sécurisé aux outils DeFi sur Solana,
            conçue pour les populations non bancarisées d'Afrique et d'Amérique Latine.
            Propulsé par Claude (Anthropic) · ElevenLabs · LI.FI.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Déconnexion */}
      <div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
