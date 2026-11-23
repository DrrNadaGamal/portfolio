// Enrollment + progress persistence. Works in the browser (localStorage)
// and degrades to in-memory when imported in Node (tests import pure modules,
// so this is only used by the app, but the guard keeps it import-safe).

const KEY = "novalearn:v1";

const memory = { value: null };

function backend() {
  if (typeof localStorage !== "undefined") return localStorage;
  return {
    getItem: () => memory.value,
    setItem: (_k, v) => { memory.value = v; },
  };
}

export function loadState() {
  try {
    const raw = backend().getItem(KEY);
    if (!raw) return { enrolled: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.enrolled) return { enrolled: {} };
    return parsed;
  } catch {
    return { enrolled: {} };
  }
}

export function saveState(state) {
  backend().setItem(KEY, JSON.stringify(state));
}

/** Start an enrollment record for a course if none exists. */
export function enroll(state, courseId) {
  if (!state.enrolled[courseId]) {
    state.enrolled[courseId] = {
      startedAt: new Date().toISOString(),
      completedLessons: [],
      completedAt: {},
      quizScores: {},
      lastLessonId: null,
    };
  }
  return state.enrolled[courseId];
}

export function markLessonComplete(state, courseId, lessonId) {
  const rec = enroll(state, courseId);
  if (!rec.completedLessons.includes(lessonId)) {
    rec.completedLessons.push(lessonId);
    rec.completedAt[lessonId] = new Date().toISOString();
  }
  rec.lastLessonId = lessonId;
  saveState(state);
  return rec;
}

export function recordQuizScore(state, courseId, lessonId, result) {
  const rec = enroll(state, courseId);
  const prev = rec.quizScores[lessonId];
  // Keep the best attempt.
  if (!prev || result.pct > prev.pct) {
    rec.quizScores[lessonId] = { score: result.score, total: result.total, pct: result.pct, passed: result.passed, at: new Date().toISOString() };
  }
  if (result.passed) {
    markLessonComplete(state, courseId, lessonId);
  } else {
    saveState(state);
  }
  return rec;
}

export function setLastLesson(state, courseId, lessonId) {
  const rec = enroll(state, courseId);
  rec.lastLessonId = lessonId;
  saveState(state);
}
