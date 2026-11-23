// Quiz scoring, pure functions, unit-tested in tests/quiz.test.mjs.

export const PASS_PCT = 70;

/**
 * Score a quiz.
 * questions: [{ options: [], answerIndex, ... }]
 * answers: array of chosen option indexes (use null/undefined for unanswered)
 * Returns { score, total, pct, passed, perQuestion: [{ correct, chosen, answerIndex }] }
 */
export function scoreQuiz(questions, answers) {
  const total = questions.length;
  const perQuestion = questions.map((q, i) => {
    const chosen = answers && i < answers.length ? answers[i] : null;
    const correct = chosen === q.answerIndex;
    return { chosen: chosen ?? null, answerIndex: q.answerIndex, correct };
  });
  const score = perQuestion.filter((r) => r.correct).length;
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, pct, passed: pct >= PASS_PCT, perQuestion };
}

/** Basic validation used by the data-integrity test. */
export function validateQuiz(quiz) {
  const problems = [];
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    problems.push("quiz has no questions");
    return problems;
  }
  quiz.questions.forEach((q, i) => {
    if (!q.q) problems.push(`question ${i} has no text`);
    if (!Array.isArray(q.options) || q.options.length < 2) {
      problems.push(`question ${i} needs at least 2 options`);
    } else if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.options.length) {
      problems.push(`question ${i} answerIndex out of range`);
    }
  });
  return problems;
}
