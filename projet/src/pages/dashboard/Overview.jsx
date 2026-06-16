// @ts-nocheck
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, MessageSquare, ShieldCheck, Star, TrendingUp, Zap } from 'lucide-react';
import { getTotalXP, isLessonRead } from '@/lib/courseProgress';
import COURSES from '@/data/coursesData';

export default function Overview() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const totalLessons     = COURSES.reduce((s, c) => s + c.lessons.length, 0);
  const completedLessons = COURSES.reduce(
    (s, c) => s + c.lessons.filter((l) => isLessonRead(c.id, l.id)).length, 0
  );
  const xp  = getTotalXP();
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const stats = [
    { label: t('edu.lessons_done'), value: completedLessons, icon: BookOpen,     color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: t('edu.total_xp'),     value: xp,               icon: Star,          color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: t('edu.your_progress'),value: `${pct}%`,         icon: TrendingUp,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'AI Sessions',         value: '—',               icon: MessageSquare, color: 'text-purple-600',  bg: 'bg-purple-50' },
  ];

  const actions = [
    {
      to: '/dashboard/education',
      label: { en: 'Continue Learning', fr: 'Continuer l\'apprentissage', es: 'Continuar aprendiendo' }[lang] ?? 'Continue Learning',
      desc:  { en: 'Resume your financial journey', fr: 'Reprendre votre parcours', es: 'Retoma tu camino financiero' }[lang] ?? '',
      icon: BookOpen, bg: 'bg-blue-600',
    },
    {
      to: '/dashboard/chat',
      label: { en: 'Talk to Coco', fr: 'Parler à Coco', es: 'Hablar con Coco' }[lang] ?? 'Talk to Coco',
      desc:  { en: 'Get personalised advice', fr: 'Obtenez des conseils personnalisés', es: 'Obtén consejos personalizados' }[lang] ?? '',
      icon: MessageSquare, bg: 'bg-purple-600',
    },
    {
      to: '/dashboard/platform',
      label: { en: 'DeFi Platform', fr: 'Plateforme DeFi', es: 'Plataforma DeFi' }[lang] ?? 'DeFi Platform',
      desc:  { en: 'Manage your assets safely', fr: 'Gérez vos actifs en toute sécurité', es: 'Gestiona tus activos de forma segura' }[lang] ?? '',
      icon: ShieldCheck, bg: 'bg-cyan-600',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('overview.welcome').replace('{name}', user?.name ?? 'User')}
        </h1>
        <p className="text-slate-500 mt-1 text-sm">{t('overview.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('overview.quick_actions')}</p>
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
          {actions.map(({ to, label, desc, icon: Icon, bg }) => (
            <Link key={to} to={to}>
              <Card className="border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-white shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Mission banner */}
      <Card className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 border-0">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 shrink-0 mt-0.5">
            <Zap className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{t('overview.mission_title')}</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{t('overview.mission_body')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
