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

export default {
  isLessonRead,
  markLessonRead,
  getCourseProgress,
  setLessonScore,
  getLessonScore,
  getCourseScoreSummary,
};
