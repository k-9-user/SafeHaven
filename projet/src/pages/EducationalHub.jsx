// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
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

// ─── Icons (inline SVG via lucide-react) ──────────────────────────────────────
import {
  BookOpen,
  Shield,
  Link,
  Leaf,
  Globe,
  Star,
  Lock,
  CheckCircle2,
  PlayCircle,
  Sword,
  Trophy,
  ChevronDown,
  X,
  Zap,
} from 'lucide-react';

// World icon map
const WORLD_ICONS = [BookOpen, Shield, Link, Leaf, Globe];
const WORLD_ACCENT = [
  { border: 'border-amber-500',  glow: 'shadow-amber-500/30',  text: 'text-amber-400',  bg: 'bg-amber-500/10',  badge: 'bg-amber-900/40 text-amber-300' },
  { border: 'border-cyan-500',   glow: 'shadow-cyan-500/30',   text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   badge: 'bg-cyan-900/40 text-cyan-300' },
  { border: 'border-violet-500', glow: 'shadow-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10', badge: 'bg-violet-900/40 text-violet-300' },
  { border: 'border-emerald-500',glow: 'shadow-emerald-500/30',text: 'text-emerald-400',bg: 'bg-emerald-500/10',badge: 'bg-emerald-900/40 text-emerald-300' },
  { border: 'border-rose-500',   glow: 'shadow-rose-500/30',   text: 'text-rose-400',   bg: 'bg-rose-500/10',   badge: 'bg-rose-900/40 text-rose-300' },
];

// ─── XP bar ──────────────────────────────────────────────────────────────────

function XPBar({ xp, level }) {
  const nextXP = level.nextLevelXP;
  const pct =
    nextXP === Infinity
      ? 100
      : Math.min(100, Math.round(((xp - level.xp) / (nextXP - level.xp)) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-[#4d9fff] font-semibold tracking-wide">
          {xp} XP
        </span>
        <span className="text-[11px] text-slate-500">
          {nextXP === Infinity ? 'MAX LEVEL' : `${nextXP} XP`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#0d1b3e] border border-[#1a2f5a] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #1e6ff1, #00c8ff)',
            boxShadow: '0 0 8px rgba(30,111,241,0.6)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Lesson status helpers ────────────────────────────────────────────────────

function getLessonStatus(world, lesson, lessonIndex, worldUnlocked) {
  if (!worldUnlocked) return 'locked';
  const completed = isLessonRead(world.id, lesson.id);
  if (completed) return 'completed';
  // First lesson unlocked if world unlocked
  if (lessonIndex === 0) return 'available';
  // Boss: unlocked if all normal lessons done
  if (lesson.isChallenge) {
    const normalLessons = world.lessons.filter((l) => !l.isChallenge);
    const allNormalDone = normalLessons.every((l) => isLessonRead(world.id, l.id));
    return allNormalDone ? 'available' : 'locked';
  }
  // Normal lesson: unlocked if previous lesson done
  const prevLesson = world.lessons[lessonIndex - 1];
  const prevDone = isLessonRead(world.id, prevLesson.id);
  return prevDone ? 'available' : 'locked';
}

// ─── Vertical connector ────────────────────────────────────────────────────────

function VerticalConnector({ done }) {
  return (
    <div className="flex justify-center py-1">
      <div
        className="flex flex-col items-center gap-0.5"
        style={{ height: 32 }}
      >
        <div
          className="w-px flex-1"
          style={{
            borderLeft: `2px dashed ${done ? '#00c853' : '#2a4a7a'}`,
          }}
        />
        <ChevronDown
          size={12}
          className={done ? 'text-[#00c853]' : 'text-[#2a4a7a]'}
        />
      </div>
    </div>
  );
}

// ─── Horizontal branch connector ──────────────────────────────────────────────

function HorizontalConnector({ done }) {
  return (
    <div
      className="flex-1 mx-1"
      style={{
        borderTop: `2px dashed ${done ? '#00c853' : '#2a4a7a'}`,
        marginTop: 28,
      }}
    />
  );
}

// ─── Lesson card ──────────────────────────────────────────────────────────────

function LessonNode({ lesson, worldId, worldAccent, status, onSelect, lang }) {
  const title = lesson.title[lang] ?? lesson.title.en;
  const isBoss = !!lesson.isChallenge;

  const cardStyle = {
    locked: {
      border: 'border-[#2a3548]',
      bg: 'bg-[#0d1b3e]',
      opacity: 'opacity-60',
      shadow: '',
      cursor: 'cursor-not-allowed',
    },
    available: {
      border: 'border-[#1e6ff1]',
      bg: 'bg-[#0d1b3e]',
      opacity: '',
      shadow: 'shadow-[0_0_12px_rgba(30,111,241,0.4)]',
      cursor: 'cursor-pointer hover:shadow-[0_0_20px_rgba(30,111,241,0.6)] hover:border-[#4d9fff]',
    },
    completed: {
      border: 'border-[#00c853]',
      bg: 'bg-[#0d1b3e]',
      opacity: '',
      shadow: 'shadow-[0_0_8px_rgba(0,200,83,0.2)]',
      cursor: 'cursor-pointer hover:shadow-[0_0_14px_rgba(0,200,83,0.4)]',
    },
  }[status] ?? cardStyle?.locked;

  const badgeMap = {
    locked: (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1a2436] text-slate-500">
        <Lock size={8} /> Locked
      </span>
    ),
    available: (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1e3a6e] text-[#4d9fff]">
        <PlayCircle size={8} /> Available
      </span>
    ),
    completed: (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#0a3320] text-[#00c853]">
        <CheckCircle2 size={8} /> Done
      </span>
    ),
  };

  return (
    <button
      onClick={status !== 'locked' ? onSelect : undefined}
      disabled={status === 'locked'}
      className={`relative w-full rounded-lg border p-3 text-left transition-all duration-200 group
        ${cardStyle.border} ${cardStyle.bg} ${cardStyle.opacity} ${cardStyle.shadow} ${cardStyle.cursor}
      `}
    >
      {/* Boss crown */}
      {isBoss && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <span className="text-amber-400 text-xs">⚔️</span>
        </div>
      )}

      {/* Top row: icon + XP */}
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1 rounded-md ${worldAccent.bg}`}>
          {isBoss
            ? <Sword size={12} className="text-amber-400" />
            : status === 'completed'
              ? <CheckCircle2 size={12} className="text-[#00c853]" />
              : status === 'locked'
                ? <Lock size={12} className="text-slate-500" />
                : <PlayCircle size={12} className={worldAccent.text} />
          }
        </div>
        <span className="flex items-center gap-0.5 text-[9px] font-bold rounded-full px-1.5 py-0.5 bg-amber-900/40 text-amber-400">
          <Zap size={7} />{lesson.xp}
        </span>
      </div>

      {/* Title */}
      <p className="text-white text-[10px] font-bold tracking-widest uppercase leading-tight text-center mb-2 min-h-[28px] flex items-center justify-center">
        {title}
      </p>

      {/* Status badge */}
      <div className="flex justify-center">
        {badgeMap[status]}
      </div>
    </button>
  );
}

// ─── World map ────────────────────────────────────────────────────────────────

function WorldMap({ world, worldIndex, worldAccent, onSelectLesson, selectedLessonId, lang, tick }) {
  const unlocked = isWorldUnlocked(worldIndex);
  const title = world.title[lang] ?? world.title.en;
  const Icon = WORLD_ICONS[worldIndex] ?? BookOpen;
  const completedCount = world.lessons.filter((l) => isLessonRead(world.id, l.id)).length;
  const total = world.lessons.length;
  const pct = Math.round((completedCount / total) * 100);

  // Separate normal lessons from boss
  const normalLessons = world.lessons.filter((l) => !l.isChallenge);
  const bossLesson = world.lessons.find((l) => !!l.isChallenge);

  // Normal lessons layout: rows of max 2 per row, arranged with branches
  // Row 1: lesson[0]         Row 2: lesson[1]         Branch: lesson[2] + lesson[3] if exist
  // This function builds a layout tree
  const buildRows = (lessons) => {
    const rows = [];
    let i = 0;
    while (i < lessons.length) {
      if (i === 0) {
        // First lesson always alone
        rows.push({ type: 'single', lessons: [lessons[i]] });
        i++;
      } else if (i === 1 && lessons.length > 3) {
        // Second lesson alone before branch
        rows.push({ type: 'single', lessons: [lessons[i]] });
        i++;
      } else if (lessons.length - i >= 2) {
        // Branch: two parallel lessons
        rows.push({ type: 'branch', lessons: [lessons[i], lessons[i + 1]] });
        i += 2;
      } else {
        // Single remaining
        rows.push({ type: 'single', lessons: [lessons[i]] });
        i++;
      }
    }
    return rows;
  };

  const rows = buildRows(normalLessons);

  // Get status for any lesson
  const getStatus = (lesson) => {
    const idx = world.lessons.findIndex((l) => l.id === lesson.id);
    return getLessonStatus(world, lesson, idx, unlocked);
  };

  const prevRowLastLesson = (rowIndex) => {
    // get last lesson of previous row for connector color
    if (rowIndex === 0) return null;
    const prev = rows[rowIndex - 1];
    return prev.lessons[prev.lessons.length - 1];
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all
        ${unlocked ? `border-[#1a2f5a] bg-[#060d1a]` : 'border-[#0f1a2e] bg-[#060d1a] opacity-70'}
      `}
    >
      {/* World header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-[#1a2f5a]`}
        style={{
          background: unlocked
            ? 'linear-gradient(90deg, rgba(13,27,62,1) 0%, rgba(6,13,26,1) 100%)'
            : 'rgba(6,13,26,0.8)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${worldAccent.border} ${worldAccent.bg}`}>
            <Icon size={16} className={worldAccent.text} />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold leading-tight">{title}</h3>
            <p className="text-slate-500 text-[10px] mt-0.5">
              {completedCount}/{total} lessons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!unlocked && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a2436] border border-[#2a3548]">
              <Lock size={10} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 font-semibold">Locked</span>
            </div>
          )}
          {unlocked && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${worldAccent.badge}`}>
              {pct}%
            </div>
          )}
          {unlocked && completedCount === total && (
            <Trophy size={16} className="text-amber-400" />
          )}
        </div>
      </div>

      {/* Skill tree body */}
      <div className="px-4 pb-4 pt-3">
        {rows.map((row, rowIdx) => {
          const prevLast = prevRowLastLesson(rowIdx);
          const connectorDone = prevLast ? isLessonRead(world.id, prevLast.id) : false;

          return (
            <div key={rowIdx}>
              {/* Vertical connector before this row (except first) */}
              {rowIdx > 0 && <VerticalConnector done={connectorDone} />}

              {/* Row content */}
              {row.type === 'single' ? (
                <div className="max-w-[160px] mx-auto">
                  <LessonNode
                    lesson={row.lessons[0]}
                    worldId={world.id}
                    worldAccent={worldAccent}
                    status={getStatus(row.lessons[0])}
                    onSelect={() => onSelectLesson(world, row.lessons[0])}
                    lang={lang}
                  />
                </div>
              ) : (
                <div className="flex items-start">
                  <div className="flex-1">
                    <LessonNode
                      lesson={row.lessons[0]}
                      worldId={world.id}
                      worldAccent={worldAccent}
                      status={getStatus(row.lessons[0])}
                      onSelect={() => onSelectLesson(world, row.lessons[0])}
                      lang={lang}
                    />
                  </div>
                  <HorizontalConnector
                    done={
                      isLessonRead(world.id, row.lessons[0].id) &&
                      isLessonRead(world.id, row.lessons[1].id)
                    }
                  />
                  <div className="flex-1">
                    <LessonNode
                      lesson={row.lessons[1]}
                      worldId={world.id}
                      worldAccent={worldAccent}
                      status={getStatus(row.lessons[1])}
                      onSelect={() => onSelectLesson(world, row.lessons[1])}
                      lang={lang}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Boss lesson */}
        {bossLesson && (
          <>
            <VerticalConnector
              done={normalLessons.every((l) => isLessonRead(world.id, l.id))}
            />
            <div className="max-w-[160px] mx-auto">
              <LessonNode
                lesson={bossLesson}
                worldId={world.id}
                worldAccent={worldAccent}
                status={getStatus(bossLesson)}
                onSelect={() => onSelectLesson(world, bossLesson)}
                lang={lang}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Quiz section ─────────────────────────────────────────────────────────────

function QuizSection({ lesson, worldId, onComplete, onNext, lang, t }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const quiz = lesson.quiz;
  if (!quiz) return null;

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
      onComplete(true);
    }
  };

  const handleSkip = () => {
    const alreadyDone = isLessonRead(worldId, lesson.id);
    if (!alreadyDone) {
      markLessonRead(worldId, lesson.id, true);
      addXP(Math.round(lesson.xp * 0.5));
    }
    setSkipped(true);
    setSubmitted(true);
    onComplete(null);
  };

  return (
    <div className="rounded-xl border border-[#1a2f5a] bg-[#0a1628] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d9fff]">Quiz</p>
      <p className="text-sm font-medium text-white leading-snug">{question}</p>

      <div className="space-y-2">
        {options.map((opt, idx) => {
          let cls = 'border-[#1a2f5a] bg-[#0d1b3e] text-slate-300 hover:border-[#1e6ff1] hover:bg-[#0d1b3e]';
          if (submitted) {
            if (idx === quiz.correctIndex) cls = 'border-[#00c853] bg-[#0a3320] text-[#00c853]';
            else if (idx === selected)     cls = 'border-red-500 bg-red-900/20 text-red-400';
            else                           cls = 'border-[#0f1a2e] bg-[#060d1a] text-slate-600';
          } else if (selected === idx) {
            cls = 'border-[#1e6ff1] bg-[#0d2150] text-white';
          }

          return (
            <button
              key={idx}
              onClick={() => !submitted && setSelected(idx)}
              disabled={submitted}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div className="space-y-3">
          {/* Result message */}
          <div className={`flex items-center gap-2 text-sm font-bold ${(isCorrect || skipped) ? 'text-[#00c853]' : 'text-red-400'}`}>
            {isCorrect
              ? `✓ ${t('common.correct')} +${lesson.xp} XP 🎉`
              : skipped
              ? `◌ ${t('common.skip')} · +${Math.round(lesson.xp * 0.5)} XP`
              : `✗ ${t('common.wrong')}`}
          </div>
          {/* Next lesson button after success or skip */}
          {(isCorrect || skipped) && onNext && (
            <button
              onClick={onNext}
              className="w-full py-2.5 rounded-lg text-white text-sm font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #00c853, #009940)' }}
            >
              {t('edu.next_lesson')}
            </button>
          )}
          {/* Retry after wrong answer */}
          {!isCorrect && !skipped && (
            <button
              onClick={() => { setSelected(null); setSubmitted(false); }}
              className="w-full py-2 rounded-lg bg-[#0d1b3e] border border-[#1a2f5a] text-slate-400 hover:text-white text-sm transition-all"
            >
              {t('common.back')} / Retry
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="flex-1 py-2 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(90deg, #1e6ff1, #0e4fbb)' }}
          >
            {t('common.check')}
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-lg bg-[#0d1b3e] border border-[#1a2f5a] text-slate-400 hover:text-white text-sm transition-all"
          >
            {t('common.skip')}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Lesson panel ─────────────────────────────────────────────────────────────

function LessonPanel({ world, lesson, onClose, onComplete, onNext, lang, t }) {
  const title = lesson.title[lang] ?? lesson.title.en;
  const content = lesson.content[lang] ?? lesson.content.en;
  const alreadyDone = isLessonRead(world.id, lesson.id);
  const isBoss = !!lesson.isChallenge;
  const worldIndex = ['world1','world2','world3','world4','world5'].indexOf(world.id);
  const worldAccent = WORLD_ACCENT[worldIndex] ?? WORLD_ACCENT[0];

  return (
    <div className="flex flex-col h-full bg-[#060d1a] rounded-xl border border-[#1a2f5a] overflow-hidden">
      {/* Panel header */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-[#1a2f5a] shrink-0"
        style={{ background: 'linear-gradient(90deg, rgba(13,27,62,0.8) 0%, rgba(6,13,26,0.8) 100%)' }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isBoss && (
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Sword size={10} /> {t('edu.boss_challenge')}
              </span>
            )}
            {!isBoss && (
              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${worldAccent.text}`}>
                <BookOpen size={10} /> Lesson · {lesson.xp} XP
              </span>
            )}
            {alreadyDone && (
              <span className="text-[#00c853] text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 size={10} /> Done
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-white leading-snug">{title}</h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-slate-500 hover:text-white transition-colors mt-0.5"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Content */}
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
            onNext={onNext}
            lang={lang}
            t={t}
          />
        )}

        {/* Already done, no quiz */}
        {alreadyDone && !lesson.quiz && (
          <div className="flex items-center gap-2 text-[#00c853] text-sm font-bold border border-[#00c853]/30 bg-[#0a3320] rounded-lg px-4 py-3">
            <CheckCircle2 size={16} />
            {t('edu.chapter_complete')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Level badge ──────────────────────────────────────────────────────────────

const LEVEL_COLORS = {
  1: 'text-slate-300',
  2: 'text-[#4d9fff]',
  3: 'text-emerald-300',
  4: 'text-amber-300',
  5: 'text-violet-300',
};

function LevelBadge({ levelData, t }) {
  const nameMap = {
    Novice:        t('edu.novice'),
    Apprentice:    t('edu.apprentice'),
    Saver:         t('edu.saver'),
    Investor:      t('edu.investor'),
    'DeFi Master': t('edu.master'),
  };
  const displayName = nameMap[levelData.name] ?? levelData.name;
  const color = LEVEL_COLORS[levelData.level] ?? 'text-slate-300';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1b3e] border border-[#1a2f5a]">
      <Star size={13} className="text-amber-400" />
      <span className="text-white text-sm font-black">Lvl {levelData.level}</span>
      <span className={`text-xs font-semibold ${color}`}>{displayName}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EducationalHub() {
  const { lang, t } = useLanguage();
  const [tick, setTick] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevelRef, setPrevLevelRef] = useState(() => getLevel().level);

  const levelData = getLevel();
  const totalXP = getTotalXP();

  const completedTotal = COURSES.reduce(
    (sum, w) => sum + w.lessons.filter((l) => isLessonRead(w.id, l.id)).length,
    0
  );
  const totalLessons = COURSES.reduce((sum, w) => sum + w.lessons.length, 0);

  const handleSelectLesson = useCallback((world, lesson) => {
    setSelectedWorld(world);
    setSelectedLesson(lesson);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedLesson(null);
    setSelectedWorld(null);
  }, []);

  const handleComplete = useCallback((wasCorrect) => {
    const newLevel = getLevel();
    if (newLevel.level > prevLevelRef) {
      setShowLevelUp(true);
      setPrevLevelRef(newLevel.level);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setTick((n) => n + 1);
  }, [prevLevelRef]);

  const handleNext = useCallback(() => {
    if (!selectedWorld || !selectedLesson) return;
    const lessons = selectedWorld.lessons;
    const currentIdx = lessons.findIndex((l) => l.id === selectedLesson.id);
    const nextLesson = lessons[currentIdx + 1];
    if (nextLesson) {
      setSelectedLesson(nextLesson);
    } else {
      setSelectedLesson(null);
      setSelectedWorld(null);
    }
  }, [selectedWorld, selectedLesson]);

  return (
    <div className="min-h-screen pb-16" style={{ background: '#060d1a', color: '#fff' }}>

      {/* Level-up toast */}
      {showLevelUp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className="flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce"
            style={{ background: 'linear-gradient(90deg, #1e6ff1, #00c8ff)', color: '#fff' }}
          >
            <Trophy size={18} className="text-amber-300" />
            {t('edu.level_up')} — Level {getLevel().level}!
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Header ── */}
        <div
          className="rounded-xl border border-[#1a2f5a] px-5 py-4 mb-5 space-y-3"
          style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #060d1a 100%)' }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <LevelBadge levelData={levelData} t={t} />
              <div className="text-sm text-slate-400">
                {t('edu.lessons_done')}:{' '}
                <span className="text-white font-bold">{completedTotal}/{totalLessons}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              SafeHaven Academy
            </div>
          </div>
          <XPBar xp={totalXP} level={levelData} />
        </div>

        {/* ── Grid: worlds + lesson panel ── */}
        <div className={selectedLesson ? 'flex flex-col md:flex-row gap-5 items-start' : ''}>

          {/* Worlds grid */}
          <div className={`grid gap-4 ${selectedLesson
            ? 'w-full md:flex-1 grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {COURSES.map((world, idx) => (
              <WorldMap
                key={world.id}
                world={world}
                worldIndex={idx}
                worldAccent={WORLD_ACCENT[idx] ?? WORLD_ACCENT[0]}
                onSelectLesson={handleSelectLesson}
                selectedLessonId={selectedLesson?.id ?? null}
                lang={lang}
                tick={tick}
              />
            ))}
          </div>

          {/* Lesson panel — side by side on md+, stacked on mobile */}
          {selectedLesson && selectedWorld && (
            <div
              className="w-full md:w-[400px] md:shrink-0 md:sticky md:top-4 md:self-start"
              style={{ maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}
            >
              <LessonPanel
                world={selectedWorld}
                lesson={selectedLesson}
                onClose={handleClose}
                onComplete={handleComplete}
                onNext={handleNext}
                lang={lang}
                t={t}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Legend bar ── */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-6 justify-center py-3 border-t border-[#1a2f5a] text-xs text-slate-400"
        style={{ background: 'rgba(6,13,26,0.95)', backdropFilter: 'blur(8px)' }}
      >
        <span className="flex items-center gap-1.5"><Lock size={10} className="text-slate-600" /> Locked</span>
        <span className="flex items-center gap-1.5 text-[#4d9fff]"><PlayCircle size={10} /> Available</span>
        <span className="flex items-center gap-1.5 text-amber-400"><Star size={10} /> In Progress</span>
        <span className="flex items-center gap-1.5 text-[#00c853]"><CheckCircle2 size={10} /> Completed</span>
      </div>
    </div>
  );
}
