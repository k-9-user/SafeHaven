// @ts-nocheck
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, ShieldCheck, Info } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const { t, lang }       = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('settings.title')}</h1>
        <p className="text-slate-500 mt-1 text-sm">{t('settings.subtitle')}</p>
      </div>

      {/* Profile */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> {t('settings.profile')}
          </CardTitle>
          <CardDescription>{t('settings.profile_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-600 text-xs">{t('settings.name')}</Label>
            <Input value={user?.name ?? ''} disabled className="mt-1 bg-slate-50 text-slate-700" />
          </div>
          <div>
            <Label className="text-slate-600 text-xs">{t('settings.email')}</Label>
            <Input value={user?.email ?? ''} disabled className="mt-1 bg-slate-50 text-slate-700" />
          </div>
          <p className="text-xs text-slate-400">{t('settings.profile_soon')}</p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> {t('settings.security')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">{t('settings.secure_auth')}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{t('settings.secure_auth_desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" /> {t('settings.about')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 leading-relaxed">{t('settings.about_desc')}</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Logout */}
      <div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );
}
