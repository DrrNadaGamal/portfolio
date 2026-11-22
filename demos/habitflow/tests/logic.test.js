/*
 * HabitFlow logic tests — run with: node tests/logic.test.js
 * Uses only the Node standard library.
 */
"use strict";

const assert = require("node:assert/strict");
const L = require("../js/logic.js");

function key(y, m, d) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

/* toKey / parseKey round-trip */
test("toKey and parseKey round-trip", () => {
  const date = new Date(2026, 10, 22); // Nov 22 2026 local
  const k = L.toKey(date);
  assert.equal(k, "2026-11-22");
  const back = L.parseKey(k);
  assert.equal(L.toKey(back), k);
});

test("parseKey rejects invalid input", () => {
  assert.equal(L.parseKey("not-a-date"), null);
  assert.equal(L.parseKey("2026-13-40"), null);
  assert.equal(L.parseKey("2026-02-30"), null);
  assert.equal(L.parseKey(42), null);
});

test("addDays shifts across month boundaries", () => {
  assert.equal(L.toKey(L.addDays(new Date(2026, 0, 31), 1)), "2026-02-01");
  assert.equal(L.toKey(L.addDays(new Date(2026, 2, 1), -1)), "2026-02-28");
});

/* currentStreak */
test("currentStreak counts back from today", () => {
  const today = new Date(2026, 10, 22);
  const completions = {
    [key(2026, 11, 22)]: true,
    [key(2026, 11, 21)]: true,
    [key(2026, 11, 20)]: true,
    [key(2026, 11, 18)]: true, // gap on the 19th
  };
  assert.equal(L.currentStreak(completions, today), 3);
});

test("currentStreak survives an incomplete today", () => {
  const today = new Date(2026, 10, 22);
  const completions = {
    [key(2026, 11, 21)]: true,
    [key(2026, 11, 20)]: true,
  };
  assert.equal(L.currentStreak(completions, today), 2);
});

test("currentStreak is 0 when today and yesterday are both missed", () => {
  const today = new Date(2026, 10, 22);
  const completions = { [key(2026, 11, 19)]: true };
  assert.equal(L.currentStreak(completions, today), 0);
});

/* bestStreak */
test("bestStreak finds the longest run", () => {
  const completions = {
    [key(2026, 11, 1)]: true,
    [key(2026, 11, 2)]: true,
    [key(2026, 11, 3)]: true,
    [key(2026, 11, 5)]: true,
    [key(2026, 11, 6)]: true,
  };
  assert.equal(L.bestStreak(completions), 3);
});

test("bestStreak spans month boundaries", () => {
  const completions = {
    [key(2026, 10, 30)]: true,
    [key(2026, 10, 31)]: true,
    [key(2026, 11, 1)]: true,
  };
  assert.equal(L.bestStreak(completions), 3);
});

test("bestStreak of empty history is 0", () => {
  assert.equal(L.bestStreak({}), 0);
});

/* completionRate */
test("completionRate over 30 days", () => {
  const today = new Date(2026, 10, 22);
  const completions = {};
  for (let d = 1; d <= 15; d += 1) completions[key(2026, 11, d)] = true;
  // 15 of the last 30 days
  assert.equal(L.completionRate(completions, 30, null, today), 50);
});

test("completionRate respects habit creation date", () => {
  const today = new Date(2026, 10, 22);
  const completions = {
    [key(2026, 11, 21)]: true,
    [key(2026, 11, 22)]: true,
  };
  // Habit created yesterday: rated over 2 days, both done
  assert.equal(L.completionRate(completions, 30, key(2026, 11, 21), today), 100);
});

test("completionRate is 0 for a habit created in the future", () => {
  const today = new Date(2026, 10, 22);
  assert.equal(L.completionRate({}, 30, key(2026, 11, 30), today), 0);
});

/* checkinsThisWeek */
test("checkinsThisWeek counts only the last 7 days", () => {
  const today = new Date(2026, 10, 22);
  const completions = {
    [key(2026, 11, 22)]: true,
    [key(2026, 11, 16)]: true, // 6 days ago, inside
    [key(2026, 11, 15)]: true, // 7 days ago, outside
  };
  assert.equal(L.checkinsThisWeek(completions, today), 2);
});

/* buildHeatmap */
test("buildHeatmap returns weeks*7 cells ending with the current week", () => {
  const today = new Date(2026, 10, 22); // a Sunday
  const cells = L.buildHeatmap(18, today);
  assert.equal(cells.length, 126);
  const last = cells[cells.length - 1];
  assert.equal(last.key, "2026-11-22");
  assert.equal(last.isToday, true);
  // Monday-first: first cell of the grid is a Monday
  const firstDate = L.parseKey(cells[0].key);
  assert.equal(firstDate.getDay(), 1);
});

test("buildHeatmap marks future cells", () => {
  const today = new Date(2026, 10, 18); // a Wednesday
  const cells = L.buildHeatmap(1, today);
  const future = cells.filter((c) => c.inFuture);
  assert.equal(future.length, 4); // Thu–Sunday of the current week
  assert.equal(cells.filter((c) => c.isToday).length, 1);
});

console.log(`\n${passed} tests passed`);
