import { useLanguage } from '@/lib/LanguageContext';

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
];

export default function LanguageSwitcher({ className = '' }) {
  const { lang, switchLang } = useLanguage();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            lang === code
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
