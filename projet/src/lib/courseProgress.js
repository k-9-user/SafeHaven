// @ts-nocheck
const STORAGE_KEY = 'safehaven_course_progress_v1';
const SCORE_STORAGE_KEY = 'safehaven_course_quiz_scores_v1';

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

function readScoreStore() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeScoreStore(data) {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function isLessonRead(courseId, lessonId) {
  if (typeof window === 'undefined') return false;
  const store = readStore();
  return !!(store[courseId] && store[courseId][lessonId]);
}

export function markLessonRead(courseId, lessonId, read = true) {
  if (typeof window === 'undefined') return;
  const store = readStore();
  if (!store[courseId]) store[courseId] = {};
  store[courseId][lessonId] = !!read;
  writeStore(store);
  return store[courseId];
}

export function getCourseProgress(courseId) {
  if (typeof window === 'undefined') return { completed: 0, total: 0 };
  const store = readStore();
  const lessons = store[courseId] || {};
  const total = Object.keys(lessons).length;
  const completed = Object.values(lessons).filter(Boolean).length;
  return { completed, total };
}

export function setLessonScore(courseId, lessonId, scorePercent) {
  if (typeof window === 'undefined') return;
  const store = readScoreStore();
  if (!store[courseId]) store[courseId] = {};
  store[courseId][lessonId] = Number(scorePercent);
  writeScoreStore(store);
}

export function getLessonScore(courseId, lessonId) {
  if (typeof window === 'undefined') return null;
  const store = readScoreStore();
  const score = store?.[courseId]?.[lessonId];
  return Number.isFinite(score) ? score : null;
}

export function getCourseScoreSummary(courseId) {
  if (typeof window === 'undefined') return { answered: 0, avgScore: 0 };
  const store = readScoreStore();
  const entries = Object.values(store?.[courseId] || {}).map(Number).filter(Number.isFinite);
  if (!entries.length) return { answered: 0, avgScore: 0 };
  const total = entries.reduce((sum, current) => sum + current, 0);
  return {
    answered: entries.length,
    avgScore: Math.round((total / entries.length) * 100) / 100,
  };
}

// ─── XP & Level system ───────────────────────────────────────────────────────

const XP_KEY = 'shm_xp';

const LEVELS = [
  { level: 1, name: 'Novice',      xp: 0,    nextLevelXP: 200  },
  { level: 2, name: 'Apprentice',  xp: 200,  nextLevelXP: 500  },
  { level: 3, name: 'Saver',       xp: 500,  nextLevelXP: 1000 },
  { level: 4, name: 'Investor',    xp: 1000, nextLevelXP: 2000 },
  { level: 5, name: 'DeFi Master', xp: 2000, nextLevelXP: Infinity },
];

export function getTotalXP() {
  if (typeof window === 'undefined') return 0;
  try {
    const val = Number(localStorage.getItem(XP_KEY));
    return Number.isFinite(val) && val >= 0 ? val : 0;
  } catch (_) {
    return 0;
  }
}

export function addXP(amount) {
  if (typeof window === 'undefined') return getTotalXP();
  const current = getTotalXP();
  const next = current + Math.max(0, Number(amount) || 0);
  try { localStorage.setItem(XP_KEY, String(next)); } catch (_) { /* ignore */ }
  return next;
}

export function getLevel() {
  const xp = getTotalXP();
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
    else break;
  }
  return { ...current, xp };
}

export function isWorldUnlocked(worldIndex) {
  if (worldIndex === 0) return true;
  if (typeof window === 'undefined') return false;

  // Dynamically import to avoid circular deps at runtime
  // We check progress via the store directly
  const store = readStore();

  // World IDs mapped by index
  const WORLD_IDS = ['world1', 'world2', 'world3', 'world4', 'world5'];
  const prevWorldId = WORLD_IDS[worldIndex - 1];
  if (!prevWorldId) return false;

  const prevWorldProgress = store[prevWorldId] || {};
  const completedCount = Object.values(prevWorldProgress).filter(Boolean).length;

  // Each world has 5 lessons (4 + 1 boss). World is unlocked when all 5 are done.
  return completedCount >= 5;
}

export default {
  isLessonRead,
  markLessonRead,
  getCourseProgress,
  setLessonScore,
  getLessonScore,
  getCourseScoreSummary,
  addXP,
  getTotalXP,
  getLevel,
  isWorldUnlocked,
};
