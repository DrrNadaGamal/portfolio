/*
 * HabitFlow — pure date/streak logic.
 * No DOM access here so the same module powers the UI and the Node test suite.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.HabitLogic = api;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;

  /** Format a Date as a local YYYY-MM-DD key. */
  function toKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /** Parse a YYYY-MM-DD key into a local Date at midnight. Returns null on bad input. */
  function parseKey(key) {
    if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  /** Return a new Date shifted by n days. */
  function addDays(date, n) {
    const copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function todayKey() {
    return toKey(new Date());
  }

  /**
   * Current streak: consecutive completed days ending today.
   * If today is not completed yet, the streak counts back from yesterday
   * (the streak is "at risk" but not broken until the day ends).
   * completions: object map of dateKey -> true.
   */
  function currentStreak(completions, fromDate) {
    const from = fromDate || new Date();
    let cursor = toKey(from);
    if (!completions[cursor]) {
      cursor = toKey(addDays(parseKey(cursor), -1));
    }
    let streak = 0;
    while (completions[cursor]) {
      streak += 1;
      cursor = toKey(addDays(parseKey(cursor), -1));
    }
    return streak;
  }

  /** Longest run of consecutive completed days in the whole history. */
  function bestStreak(completions) {
    const keys = Object.keys(completions).filter((k) => completions[k]).sort();
    if (keys.length === 0) return 0;
    let best = 1;
    let run = 1;
    for (let i = 1; i < keys.length; i += 1) {
      const prev = parseKey(keys[i - 1]);
      const cur = parseKey(keys[i]);
      const gap = Math.round((cur - prev) / DAY_MS);
      if (gap === 1) {
        run += 1;
        if (run > best) best = run;
      } else if (gap > 1) {
        run = 1;
      }
    }
    return best;
  }

  /** Total number of completed days. */
  function totalCheckins(completions) {
    return Object.keys(completions).filter((k) => completions[k]).length;
  }

  /**
   * Completion rate over the last `days` days including today, as a percentage
   * (0-100, rounded). A habit younger than `days` is rated over its own age.
   */
  function completionRate(completions, days, createdAtKey, fromDate) {
    const from = fromDate || new Date();
    const end = parseKey(toKey(from));
    let start = addDays(end, -(days - 1));
    const created = createdAtKey ? parseKey(createdAtKey) : null;
    if (created && created > start) start = created;
    if (start > end) return 0;
    const span = Math.round((end - start) / DAY_MS) + 1;
    let done = 0;
    for (let i = 0; i < span; i += 1) {
      if (completions[toKey(addDays(start, i))]) done += 1;
    }
    return Math.round((done / span) * 100);
  }

  /** Check-ins within the last 7 days including today. */
  function checkinsThisWeek(completions, fromDate) {
    const from = fromDate || new Date();
    const end = parseKey(toKey(from));
    let count = 0;
    for (let i = 0; i < 7; i += 1) {
      if (completions[toKey(addDays(end, -i))]) count += 1;
    }
    return count;
  }

  /**
   * Build the heatmap grid: `weeks` columns of 7 days (Monday-first),
   * ending with the week containing `fromDate`. Oldest first.
   * Each cell: { key, inFuture, isToday }.
   */
  function buildHeatmap(weeks, fromDate) {
    const from = fromDate || new Date();
    const today = toKey(from);
    const end = parseKey(today);
    // Monday = 0 ... Sunday = 6
    const weekday = (end.getDay() + 6) % 7;
    const weekEnd = addDays(end, 6 - weekday); // Sunday of the current week
    const start = addDays(weekEnd, -(weeks * 7 - 1));
    const cells = [];
    for (let i = 0; i < weeks * 7; i += 1) {
      const date = addDays(start, i);
      const key = toKey(date);
      cells.push({
        key,
        inFuture: key > today,
        isToday: key === today,
      });
    }
    return cells;
  }

  return {
    toKey,
    parseKey,
    addDays,
    todayKey,
    currentStreak,
    bestStreak,
    totalCheckins,
    completionRate,
    checkinsThisWeek,
    buildHeatmap,
  };
});
