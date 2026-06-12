// @ts-nocheck
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import COURSES from '@/data/coursesData';
import {
  isLessonRead,
  markLessonRead,
  addXP,
  getTotalXP,
  getLevel,
  isWorldUnlocked,
} from '@/lib/courseProgress';

// ─── XP bar component ────────────────────────────────────────────────────────

function XPBar({ xp, level, nextLevelXP }) {
  const pct =
    nextLevelXP === Infinity
      ? 100
      : Math.min(100, Math.round(((xp - level.xp) / (nextLevelXP - level.xp)) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-400">{xp} XP</span>
        <span className="text-xs text-slate-400">
          {nextLevelXP === Infinity ? 'MAX' : `${nextLevelXP} XP`}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Lesson node on the world path ───────────────────────────────────────────

function LessonNode({ lesson, isCompleted, isUnlocked, isSelected, isBoss, onClick, lang }) {
  const title = lesson.title[lang] ?? lesson.title.en;

  let nodeStyle = '';
  let icon = null;

  if (isBoss) {
    nodeStyle = isCompleted
      ? 'bg-yellow-500 border-yellow-400 text-white shadow-yellow-500/40'
      : isUnlocked
        ? 'bg-yellow-900/60 border-yellow-500 text-yellow-300 hover:bg-yellow-800/60'
        : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed';
    icon = isCompleted ? '✓' : isUnlocked ? '★' : '🔒';
  } else if (isCompleted) {
    nodeStyle = 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30';
    icon = '✓';
  } else if (isUnlocked) {
    nodeStyle = 'bg-cyan-900/60 border-cyan-500 text-cyan-300 hover:bg-cyan-800/60';
    icon = '▶';
  } else {
    nodeStyle = 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed';
    icon = '🔒';
  }

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={`flex flex-col items-center gap-1 group transition-all ${!isUnlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      title={title}
    >
      <div
        className={`relative flex items-center justify-center w-11 h-11 rounded-full border-2 shadow-lg transition-all duration-200 text-base font-bold
          ${nodeStyle}
          ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : isUnlocked ? 'hover:scale-105' : ''}
        `}
      >
        {icon}
      </div>
      <span className={`text-[10px] leading-tight text-center max-w-[52px] truncate ${isSelected ? 'text-white font-semibold' : 'text-slate-400'}`}>
        {lesson.xp}xp
      </span>
    </button>
  );
}

// ─── Connector between nodes ─────────────────────────────────────────────────

function NodeConnector({ done }) {
  return (
    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${done ? 'bg-emerald-500' : 'bg-slate-600'}`} />
  );
}

// ─── World card ──────────────────────────────────────────────────────────────

function WorldCard({ world, worldIndex, onSelectLesson, selectedLessonId, tick, lang, t }) {
  const unlocked = isWorldUnlocked(worldIndex);
  const title = world.title[lang] ?? world.title.en;
  const completedCount = world.lessons.filter((l) => isLessonRead(world.id, l.id)).length;
  const total = world.lessons.length;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        unlocked
          ? 'border-slate-700 bg-slate-800/80'
          : 'border-slate-800 bg-slate-900/60 opacity-60'
      }`}
    >
      {/* World header */}
      <div className={`flex items-center justify-between px-5 py-3.5 rounded-t-2xl bg-gradient-to-r ${world.color} bg-opacity-20`}>
        <div>
          <h3 className="font-bold text-white text-sm">{title}</h3>
          <p className="text-xs text-white/70 mt-0.5">
            {completedCount}/{total} {t('edu.lessons_done').toLowerCase()}
          </p>
        </div>
        {!unlocked && <span className="text-lg">🔒</span>}
        {unlocked && completedCount === total && <span className="text-lg">🏆</span>}
        {unlocked && completedCount > 0 && completedCount < total && (
          <div className="text-xs font-semibold text-white/80 bg-white/10 rounded-full px-2 py-0.5">
            {Math.round((completedCount / total) * 100)}%
          </div>
        )}
      </div>

      {/* Lesson path */}
      <div className="px-4 py-4">
        <div className="flex items-center">
          {world.lessons.map((lesson, idx) => {
            const completed = isLessonRead(world.id, lesson.id);
            const prevCompleted = idx === 0 || isLessonRead(world.id, world.lessons[idx - 1].id);
            const lessonUnlocked = unlocked && (idx === 0 || prevCompleted);
            const isBoss = !!lesson.isChallenge;
            const isSelected = selectedLessonId === lesson.id;

            return (
              <div key={lesson.id} className="flex items-center flex-1 min-w-0">
                <LessonNode
                  lesson={lesson}
                  isCompleted={completed}
                  isUnlocked={lessonUnlocked}
                  isSelected={isSelected}
                  isBoss={isBoss}
                  lang={lang}
                  onClick={() => onSelectLesson(world, lesson)}
                />
                {idx < world.lessons.length - 1 && (
                  <NodeConnector done={completed} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz section ─────────────────────────────────────────────────────────────

function QuizSection({ lesson, worldId, onComplete, lang, t }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const quiz = lesson.quiz;
  const question = quiz.question[lang] ?? quiz.question.en;
  const options = quiz.options.map((o) => o[lang] ?? o.en);
  const isCorrect = selected === quiz.correctIndex;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (isCorrect) {
      const alreadyDone = isLessonRead(worldId, lesson.id);
      if (!alreadyDone) {
        markLessonRead(worldId, lesson.id, true);
        addXP(lesson.xp);
      }
      onComplete(isCorrect);
    }
  };

  const handleSkip = () => {
    const alreadyDone = isLessonRead(worldId, lesson.id);
    if (!alreadyDone) {
      markLessonRead(worldId, lesson.id, true);
      addXP(Math.round(lesson.xp * 0.5)); // half XP for skip
    }
    onComplete(null);
  };

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/60 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Quiz</p>
      <p className="text-sm font-medium text-white leading-snug">{question}</p>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          let btnStyle = 'border-slate-600 bg-slate-700/60 text-slate-200 hover:border-cyan-500 hover:bg-slate-700';
          if (submitted) {
            if (idx === quiz.correctIndex) btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
            else if (idx === selected) btnStyle = 'border-red-500 bg-red-500/20 text-red-300';
            else btnStyle = 'border-slate-700 bg-slate-800 text-slate-500';
          } else if (selected === idx) {
            btnStyle = 'border-cyan-500 bg-cyan-500/15 text-white';
          }

          return (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              disabled={submitted}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div className={`flex items-center gap-2 text-sm font-semibold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCorrect ? `✅ ${t('common.correct')} +${lesson.xp} XP` : `❌ ${t('common.wrong')}`}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
          >
            {t('common.check')}
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-sm transition-all"
          >
            {t('common.skip')}
          </button>
        </div>
      )}

      {submitted && !isCorrect && (
        <button
          onClick={() => { setSelected(null); setSubmitted(false); }}
          className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition-all"
        >
          {t('common.back')} / Retry
        </button>
      )}
    </div>
  );
}

// ─── Lesson panel ─────────────────────────────────────────────────────────────

function LessonPanel({ world, lesson, onClose, onComplete, lang, t }) {
  const title = lesson.title[lang] ?? lesson.title.en;
  const content = lesson.content[lang] ?? lesson.content.en;
  const alreadyDone = isLessonRead(world.id, lesson.id);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-700 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {lesson.isChallenge && <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest">⚔️ {t('edu.boss_challenge')}</span>}
            {!lesson.isChallenge && <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Lesson · {lesson.xp} XP</span>}
            {alreadyDone && <span className="text-emerald-400 text-xs font-semibold">✓ Done</span>}
          </div>
          <h2 className="text-base font-bold text-white leading-snug">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-slate-400 hover:text-white text-lg leading-none mt-0.5"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Lesson content */}
        <div className="space-y-3">
          {content.split('\n\n').map((para, i) => (
            <p key={i} className="text-sm text-slate-300 leading-relaxed">{para}</p>
          ))}
        </div>

        {/* Quiz */}
        {lesson.quiz && (
          <QuizSection
            lesson={lesson}
            worldId={world.id}
            onComplete={onComplete}
            lang={lang}
            t={t}
          />
        )}

        {/* Already done, no quiz needed */}
        {alreadyDone && !lesson.quiz && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            ✅ {t('edu.chapter_complete')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

const LEVEL_COLORS = ['', 'text-slate-300', 'text-blue-300', 'text-green-300', 'text-yellow-300', 'text-purple-300'];
const LEVEL_BG    = ['', 'bg-slate-700', 'bg-blue-900/60', 'bg-green-900/60', 'bg-yellow-900/60', 'bg-purple-900/60'];

function LevelBadge({ levelData, t }) {
  const levelNames = {
    Novice:      t('edu.novice'),
    Apprentice:  t('edu.apprentice'),
    Saver:       t('edu.saver'),
    Investor:    t('edu.investor'),
    'DeFi Master': t('edu.master'),
  };
  const displayName = levelNames[levelData.name] ?? levelData.name;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${LEVEL_BG[levelData.level]}`}>
      <span className="text-sm font-black text-white">Lvl {levelData.level}</span>
      <span className={`text-xs font-semibold ${LEVEL_COLORS[levelData.level]}`}>{displayName}</span>
    </div>
  );
}

// ─── Main EducationalHub component ───────────────────────────────────────────

export default function EducationalHub() {
  const { lang, t } = useLanguage();
  const [tick, setTick] = useState(0); // force re-render after XP/progress changes
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const levelData = getLevel();
  const totalXP = getTotalXP();

  const handleSelectLesson = (world, lesson) => {
    setSelectedWorld(world);
    setSelectedLesson(lesson);
  };

  const handleClose = () => {
    setSelectedLesson(null);
    setSelectedWorld(null);
  };

  const handleComplete = (wasCorrect) => {
    const prevLevel = levelData.level;
    setTick((n) => n + 1);
    const newLevel = getLevel();
    if (newLevel.level > prevLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    if (wasCorrect !== false) {
      // keep panel open to show result; user can close manually
    }
  };

  const completedTotal = COURSES.reduce(
    (sum, w) => sum + w.lessons.filter((l) => isLessonRead(w.id, l.id)).length,
    0
  );
  const totalLessons = COURSES.reduce((sum, w) => sum + w.lessons.length, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Level-up toast */}
      {showLevelUp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-3 bg-yellow-500 text-slate-900 px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm">
            🎉 {t('edu.level_up')} → Level {getLevel().level}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Header: XP bar + stats ── */}
        <div className="rounded-2xl bg-slate-800 border border-slate-700 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <LevelBadge levelData={levelData} t={t} />
              <div className="text-sm text-slate-400">
                {t('edu.total_xp')}: <span className="text-white font-bold">{totalXP}</span>
              </div>
              <div className="text-sm text-slate-400">
                {t('edu.lessons_done')}: <span className="text-white font-bold">{completedTotal}/{totalLessons}</span>
              </div>
            </div>
          </div>
          <XPBar
            xp={totalXP}
            level={levelData}
            nextLevelXP={levelData.nextLevelXP}
          />
        </div>

        {/* ── Main grid: worlds + lesson panel ── */}
        <div className={`grid gap-5 ${selectedLesson ? 'lg:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>

          {/* World list */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
              {t('edu.your_progress')}
            </h2>
            {COURSES.map((world, idx) => (
              <WorldCard
                key={world.id}
                world={world}
                worldIndex={idx}
                onSelectLesson={handleSelectLesson}
                selectedLessonId={selectedLesson?.id ?? null}
                tick={tick}
                lang={lang}
                t={t}
              />
            ))}
          </div>

          {/* Lesson detail panel */}
          {selectedLesson && selectedWorld && (
            <div className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-hidden">
              <LessonPanel
                world={selectedWorld}
                lesson={selectedLesson}
                onClose={handleClose}
                onComplete={handleComplete}
                lang={lang}
                t={t}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
