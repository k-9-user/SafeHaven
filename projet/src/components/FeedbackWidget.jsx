// @ts-nocheck
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Star, X, Send, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { post } from '@/lib/api';

const QUESTIONS = [
  {
    key: 'ease',
    label: { en: 'Ease of use', fr: 'Facilité d\'utilisation', es: 'Facilidad de uso' },
  },
  {
    key: 'content',
    label: { en: 'Educational content', fr: 'Contenu éducatif', es: 'Contenido educativo' },
  },
  {
    key: 'ai',
    label: { en: 'AI Coach (Coco)', fr: 'Coach IA (Coco)', es: 'Coach IA (Coco)' },
  },
  {
    key: 'overall',
    label: { en: 'Overall experience', fr: 'Expérience générale', es: 'Experiencia general' },
  },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-600'
            }
          />
        </button>
      ))}
    </div>
  );
}

export default function FeedbackWidget() {
  const { lang } = useLanguage();
  const [open, setOpen]     = useState(false);
  const [ratings, setRatings] = useState({ ease: 0, content: 0, ai: 0, overall: 0 });
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone]     = useState(false);

  const canSubmit = Object.values(ratings).every((v) => v > 0);

  const TEXT = {
    en: {
      btn:         'Give feedback',
      title:       'Your opinion',
      subtitle:    'Help us improve Safe Haven Money',
      placeholder: 'Your experience, suggestions, ideas…',
      submit:      'Send',
      success:     'Thank you! Your feedback has been saved. 🙏',
      required:    'Please rate all 4 categories before sending.',
    },
    fr: {
      btn:         'Donner mon avis',
      title:       'Votre avis',
      subtitle:    'Aidez-nous à améliorer Safe Haven Money',
      placeholder: 'Votre expérience, suggestions, idées…',
      submit:      'Envoyer',
      success:     'Merci ! Votre avis a bien été enregistré. 🙏',
      required:    'Notez les 4 catégories avant d\'envoyer.',
    },
    es: {
      btn:         'Dar mi opinión',
      title:       'Tu opinión',
      subtitle:    'Ayúdanos a mejorar Safe Haven Money',
      placeholder: 'Tu experiencia, sugerencias, ideas…',
      submit:      'Enviar',
      success:     '¡Gracias! Tu opinión ha sido guardada. 🙏',
      required:    'Valora las 4 categorías antes de enviar.',
    },
  };
  const T = TEXT[lang] ?? TEXT.en;

  const handleSubmit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    try {
      await post('/api/feedback', {
        ratings,
        comment: comment.trim() || undefined,
        lang,
        page: window.location.pathname,
      });
    } catch (_) {
      // don't block user on error
    } finally {
      setSending(false);
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setRatings({ ease: 0, content: 0, ai: 0, overall: 0 });
        setComment('');
      }, 3000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDone(false);
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-white text-xs font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none"
        style={{ background: 'linear-gradient(135deg, #0B1F4E 0%, #1e6ff1 100%)' }}
        aria-label={T.btn}
      >
        <img src="/logo.svg" alt="" className="h-5 w-5 shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">{T.btn}</span>
        <MessageSquarePlus size={14} className="sm:hidden" />
      </button>

      {/* ── Modal overlay ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div
            className="relative w-full sm:w-[420px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0d1b3e', border: '1px solid #1a2f5a' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                background: 'linear-gradient(90deg, #0B1F4E, #0d2150)',
                borderBottom: '1px solid #1a2f5a',
              }}
            >
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="" className="h-8 w-8 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{T.title}</p>
                  <p className="text-slate-400 text-[11px]">{T.subtitle}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {done ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 px-6 text-center">
                <CheckCircle2 size={44} className="text-[#00c853]" />
                <p className="text-white font-bold text-base">{T.success}</p>
              </div>
            ) : (
              <div className="px-5 py-5 space-y-4">
                {/* Star questions */}
                {QUESTIONS.map((q) => (
                  <div key={q.key} className="flex items-center justify-between gap-3">
                    <p className="text-slate-300 text-sm flex-1 leading-snug">
                      {q.label[lang] ?? q.label.en}
                    </p>
                    <StarRating
                      value={ratings[q.key]}
                      onChange={(v) => setRatings((r) => ({ ...r, [q.key]: v }))}
                    />
                  </div>
                ))}

                <div
                  className="w-full h-px"
                  style={{ background: '#1a2f5a' }}
                />

                {/* Free text */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={T.placeholder}
                  maxLength={2000}
                  rows={3}
                  className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-[#1e6ff1] transition-all"
                  style={{ background: '#060d1a', border: '1px solid #1a2f5a' }}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || sending}
                  title={!canSubmit ? T.required : undefined}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                  style={{
                    background: canSubmit
                      ? 'linear-gradient(90deg, #1e6ff1, #00c8ff)'
                      : '#1a2f5a',
                  }}
                >
                  <Send size={14} />
                  {sending ? '…' : T.submit}
                </button>

                {!canSubmit && (
                  <p className="text-center text-[11px] text-slate-500">{T.required}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
