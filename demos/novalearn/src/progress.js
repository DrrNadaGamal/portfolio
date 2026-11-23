// Progress and stats math, pure functions, unit-tested in tests/progress.test.mjs.

export function countLessons(course) {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function courseDurationMin(course) {
  return course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMin || 0), 0),
    0
  );
}

/** Find a lesson (and its module) by id. Returns { module, lesson } or null. */
export function findLesson(course, lessonId) {
  for (const module of course.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module, lesson };
  }
  return null;
}

/** Flat ordered list of all lessons in a course. */
export function flatLessons(course) {
  const out = [];
  for (const module of course.modules) {
    for (const lesson of module.lessons) out.push({ module, lesson });
  }
  return out;
}

/**
 * Progress of one enrollment record against a course.
 * record: { completedLessons: string[], quizScores: {} , completedAt?: string }
 */
export function courseProgress(course, record) {
  const total = countLessons(course);
  const done = record ? record.completedLessons.filter((id) => findLesson(course, id)).length : 0;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct, complete: total > 0 && done === total };
}

export function moduleProgress(module, record) {
  const total = module.lessons.length;
  const done = record
    ? module.lessons.filter((l) => record.completedLessons.includes(l.id)).length
    : 0;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Aggregate stats across all enrolled courses. */
export function overallStats(courses, enrolled) {
  const ids = Object.keys(enrolled || {});
  const enrolledCourses = courses.filter((c) => ids.includes(c.id));
  let completed = 0;
  let pctSum = 0;
  let lessonsDone = 0;
  for (const c of enrolledCourses) {
    const p = courseProgress(c, enrolled[c.id]);
    pctSum += p.pct;
    lessonsDone += p.done;
    if (p.complete) completed += 1;
  }
  return {
    enrolledCount: enrolledCourses.length,
    completedCount: completed,
    avgPct: enrolledCourses.length ? Math.round(pctSum / enrolledCourses.length) : 0,
    lessonsDone,
    certificates: completed,
  };
}

/** Minutes of lessons completed in the last 7 days, per weekday (Mon..Sun). */
export function weeklyActivity(courses, enrolled, now = new Date()) {
  const minutes = [0, 0, 0, 0, 0, 0, 0]; // Monday-first
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const byId = new Map();
  for (const c of courses) {
    for (const { lesson } of flatLessons(c)) byId.set(lesson.id, lesson);
  }
  for (const rec of Object.values(enrolled || {})) {
    for (const [lessonId, ts] of Object.entries(rec.completedAt || {})) {
      const lesson = byId.get(lessonId);
      const when = new Date(ts);
      if (!lesson || Number.isNaN(when.getTime()) || when < start || when > now) continue;
      const day = (when.getDay() + 6) % 7; // Mon=0
      minutes[day] += lesson.durationMin || 0;
    }
  }
  return minutes;
}
