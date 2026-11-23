import { COURSES, CATEGORIES, getCourse } from "./data.js";
import {
  courseProgress, moduleProgress, overallStats, weeklyActivity,
  courseDurationMin, countLessons, findLesson, flatLessons,
} from "./progress.js";
import { scoreQuiz } from "./quiz.js";
import { formatMinutes, formatDate, matchesQuery, clamp } from "./utils.js";
import {
  loadState, enroll, markLessonComplete, recordQuizScore, setLastLesson,
} from "./store.js";

const state = loadState();
const view = document.getElementById("view");
const toastEl = document.getElementById("toast");

/* ---------------- helpers ---------------- */

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function go(hash) { location.hash = hash; }

function isEnrolled(courseId) { return Boolean(state.enrolled[courseId]); }

function thumb(course, cls = "thumb") {
  return `<div class="${cls}" style="background:linear-gradient(135deg,${course.accent[0]},${course.accent[1]})">
    <span class="thumb-icon">${esc(course.icon)}</span>
  </div>`;
}

function levelBadge(level) {
  return `<span class="badge level-${level.toLowerCase()}">${esc(level)}</span>`;
}

function priceLabel(course) {
  return course.price === 0 ? `<span class="price free">Free</span>` : `<span class="price">$${course.price}</span>`;
}

function ringSVG(pct, size = 46, stroke = 4) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (clamp(pct, 0, 100) / 100) * c;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle class="ring-bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"></circle>
    <circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"
      stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"></circle>
    <text x="50%" y="50%" class="ring-text" dominant-baseline="central" text-anchor="middle">${pct}%</text>
  </svg>`;
}

function lessonIcon(lesson, done) {
  if (done) return `<span class="l-icon done">✓</span>`;
  if (lesson.type === "quiz") return `<span class="l-icon quiz">?</span>`;
  if (lesson.type === "article") return `<span class="l-icon article">≡</span>`;
  return `<span class="l-icon video">▶</span>`;
}

/* ---------------- views ---------------- */

function dashboardView() {
  const stats = overallStats(COURSES, state.enrolled);
  const week = weeklyActivity(COURSES, state.enrolled);
  const maxMin = Math.max(...week, 1);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const continueCards = Object.keys(state.enrolled)
    .map((cid) => ({ course: getCourse(cid), rec: state.enrolled[cid] }))
    .filter((x) => x.course)
    .map(({ course, rec }) => {
      const p = courseProgress(course, rec);
      if (p.complete) return "";
      const flat = flatLessons(course);
      const next = flat.find(({ lesson }) => !rec.completedLessons.includes(lesson.id)) || flat[0];
      return `<a class="card continue-card" href="#/course/${course.id}/lesson/${next.lesson.id}">
        ${thumb(course, "thumb sm")}
        <div class="continue-body">
          <strong>${esc(course.title)}</strong>
          <span class="muted">Next: ${esc(next.lesson.title)}</span>
          <div class="bar"><div class="bar-fill" style="width:${p.pct}%"></div></div>
        </div>
        ${ringSVG(p.pct)}
      </a>`;
    })
    .join("");

  const recommended = COURSES
    .filter((c) => !state.enrolled[c.id])
    .slice(0, 3)
    .map(courseCard)
    .join("");

  const empty = stats.enrolledCount === 0
    ? `<div class="empty card"><h3>Start your first course</h3>
       <p class="muted">Browse the catalog and enroll, your progress, quiz scores and certificates are tracked locally in this demo.</p>
       <a class="btn primary" href="#/courses">Browse courses</a></div>`
    : "";

  return `
    <section class="hero card">
      <div>
        <p class="eyebrow">Welcome back</p>
        <h1>Keep the streak going, Nada.</h1>
        <p class="muted">Pick up where you left off, or find something new below.</p>
      </div>
      <div class="hero-stats">
        <div class="stat"><span class="stat-num">${stats.enrolledCount}</span><span class="stat-label">Enrolled</span></div>
        <div class="stat"><span class="stat-num">${stats.lessonsDone}</span><span class="stat-label">Lessons done</span></div>
        <div class="stat"><span class="stat-num">${stats.avgPct}%</span><span class="stat-label">Avg progress</span></div>
        <div class="stat"><span class="stat-num">${stats.certificates}</span><span class="stat-label">Certificates</span></div>
      </div>
    </section>

    <section>
      <h2 class="section-title">This week</h2>
      <div class="card chart-card">
        <div class="chart" role="img" aria-label="Study minutes per day this week">
          ${week.map((m, i) => `
            <div class="chart-col">
              <div class="chart-bar" style="height:${Math.max(3, (m / maxMin) * 100)}%" title="${m} min"></div>
              <span class="chart-day">${days[i]}</span>
            </div>`).join("")}
        </div>
        <p class="muted small">${week.some((m) => m > 0) ? "Minutes of lessons completed per day." : "No activity this week yet. Complete a lesson to see it here."}</p>
      </div>
    </section>

    ${continueCards ? `<section><h2 class="section-title">Continue learning</h2><div class="stack">${continueCards}</div></section>` : empty}

    ${recommended ? `<section><h2 class="section-title">Recommended for you</h2><div class="grid">${recommended}</div></section>` : ""}
  `;
}

function courseCard(course) {
  const rec = state.enrolled[course.id];
  const p = courseProgress(course, rec);
  return `<a class="card course-card" href="#/course/${course.id}">
    ${thumb(course)}
    <div class="course-body">
      <div class="course-top">${levelBadge(course.level)}<span class="muted small">${esc(course.category)}</span></div>
      <h3>${esc(course.title)}</h3>
      <p class="muted small clamp2">${esc(course.description)}</p>
      <div class="course-meta">
        <span>★ ${course.rating} (${course.ratingCount.toLocaleString()})</span>
        <span>·</span>
        <span>${countLessons(course)} lessons</span>
        <span>·</span>
        <span>${formatMinutes(courseDurationMin(course))}</span>
      </div>
      <div class="course-foot">
        ${priceLabel(course)}
        ${rec ? `<span class="muted small">${p.complete ? "✓ Completed" : p.pct + "% done"}</span>` : ""}
      </div>
    </div>
  </a>`;
}

function catalogView(params) {
  const q = params.get("q") || "";
  const cat = params.get("cat") || "All";
  const level = params.get("level") || "All";
  const sort = params.get("sort") || "popular";

  let list = COURSES.filter((c) =>
    matchesQuery(c, ["title", "description", "category", "tags", "level"], q)
  );
  if (cat !== "All") list = list.filter((c) => c.category === cat);
  if (level !== "All") list = list.filter((c) => c.level === level);
  const sorters = {
    popular: (a, b) => b.students - a.students,
    rating: (a, b) => b.rating - a.rating,
    title: (a, b) => a.title.localeCompare(b.title),
  };
  list = [...list].sort(sorters[sort] || sorters.popular);

  const opt = (v, cur, label = v) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(label)}</option>`;

  return `
    <h1 class="page-title">Browse courses</h1>
    <form class="filters card" id="filters">
      <input type="search" name="q" aria-label="Search courses" value="${esc(q)}" placeholder="Search topics, skills, courses…" />
      <select name="cat" aria-label="Category">
        ${opt("All", cat, "All categories")}
        ${CATEGORIES.map((c) => opt(c, cat)).join("")}
      </select>
      <select name="level" aria-label="Level">
        ${["All", "Beginner", "Intermediate", "Advanced"].map((l) => opt(l, level, l === "All" ? "All levels" : l)).join("")}
      </select>
      <select name="sort" aria-label="Sort by">
        ${opt("popular", sort, "Most popular")}${opt("rating", sort, "Highest rated")}${opt("title", sort, "Title A–Z")}
      </select>
    </form>
    <p class="muted small">${list.length} course${list.length === 1 ? "" : "s"} found</p>
    <div class="grid">${list.map(courseCard).join("") || `<div class="empty card"><h3>No matches</h3><p class="muted">Try a different search or clear the filters.</p></div>`}</div>
  `;
}

function courseDetailView(course) {
  const rec = state.enrolled[course.id];
  const p = courseProgress(course, rec);
  const lessons = countLessons(course);
  const dur = courseDurationMin(course);

  const modulesHtml = course.modules.map((m, i) => {
    const mp = moduleProgress(m, rec);
    return `<details class="module card" ${i === 0 ? "open" : ""}>
      <summary>
        <span class="module-title">${esc(m.title)}</span>
        <span class="muted small">${mp.done}/${mp.total} · ${formatMinutes(m.lessons.reduce((s, l) => s + l.durationMin, 0))}</span>
      </summary>
      <ul class="lesson-list">
        ${m.lessons.map((l) => {
          const done = rec && rec.completedLessons.includes(l.id);
          const quizScore = rec && rec.quizScores[l.id];
          return `<li>
            <a href="#/course/${course.id}/lesson/${l.id}" class="lesson-row ${done ? "done" : ""}">
              ${lessonIcon(l, done)}
              <span class="lesson-name">${esc(l.title)}</span>
              ${quizScore ? `<span class="chip ${quizScore.passed ? "pass" : "fail"}">${quizScore.pct}%</span>` : ""}
              <span class="muted small">${formatMinutes(l.durationMin)}</span>
            </a>
          </li>`;
        }).join("")}
      </ul>
    </details>`;
  }).join("");

  const cta = rec
    ? (p.complete
      ? `<a class="btn primary" href="#/certificates">View certificate</a>`
      : `<a class="btn primary" href="#/course/${course.id}/lesson/${(flatLessons(course).find(({ lesson }) => !rec.completedLessons.includes(lesson.id)) || flatLessons(course)[0]).lesson.id}">Continue · ${p.pct}%</a>`)
    : `<button class="btn primary" data-action="enroll" data-course="${course.id}">Enroll ${course.price ? `· $${course.price}` : "for free"}</button>`;

  return `
    <a class="back" href="#/courses">← All courses</a>
    <section class="card course-hero">
      ${thumb(course, "thumb lg")}
      <div class="course-hero-body">
        <div class="course-top">${levelBadge(course.level)}<span class="muted small">${esc(course.category)}</span></div>
        <h1>${esc(course.title)}</h1>
        <p class="muted">${esc(course.description)}</p>
        <div class="course-meta">
          <span>★ ${course.rating} (${course.ratingCount.toLocaleString()} ratings)</span><span>·</span>
          <span>${course.students.toLocaleString()} students</span><span>·</span>
          <span>${lessons} lessons</span><span>·</span>
          <span>${formatMinutes(dur)}</span>
        </div>
        <div class="hero-cta">${cta}${rec && !p.complete ? `<span class="ring-wrap">${ringSVG(p.pct)}</span>` : ""}</div>
      </div>
    </section>

    <div class="two-col">
      <section>
        <h2 class="section-title">Curriculum</h2>
        ${modulesHtml}
      </section>
      <aside>
        <div class="card side-card">
          <h3>What you'll learn</h3>
          <ul class="ticks">${course.outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
        </div>
        <div class="card side-card instructor">
          <span class="avatar lg">${esc(course.instructor.initials)}</span>
          <div><strong>${esc(course.instructor.name)}</strong><p class="muted small">${esc(course.instructor.title)}</p></div>
        </div>
        <div class="card side-card">
          <h3>Tags</h3>
          <div class="tags">${course.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        </div>
      </aside>
    </div>
  `;
}

function lessonView(course, lessonId) {
  const found = findLesson(course, lessonId);
  if (!found) return notFoundView();
  const { module, lesson } = found;
  const rec = state.enrolled[course.id] || enroll(state, course.id);
  setLastLesson(state, course.id, lessonId);

  const flat = flatLessons(course);
  const idx = flat.findIndex((f) => f.lesson.id === lessonId);
  const prev = flat[idx - 1];
  const next = flat[idx + 1];
  const done = rec.completedLessons.includes(lessonId);
  const p = courseProgress(course, rec);

  const body = lesson.type === "quiz"
    ? quizBody(course, lesson, rec)
    : `
      ${lesson.type === "video"
        ? `<div class="video-frame" role="img" aria-label="Video placeholder">
             <span class="play">▶</span><span class="muted">Demo video player, content is synthetic</span>
           </div>`
        : `<article class="article card"><h3>${esc(lesson.title)}</h3><p>${esc(lesson.summary)}</p>
           <p>In the full course this article expands with worked examples, annotated screenshots and a short exercise. This demo keeps the content synthetic while the learning flow around it (progress, quizzes, certificates) works end to end.</p></article>`}
      <div class="lesson-actions">
        ${done
          ? `<span class="chip pass">✓ Completed</span>`
          : `<button class="btn primary" data-action="complete" data-course="${course.id}" data-lesson="${lesson.id}">Mark as complete</button>`}
      </div>`;

  return `
    <a class="back" href="#/course/${course.id}">← ${esc(course.title)}</a>
    <div class="lesson-layout">
      <section class="lesson-main">
        <p class="eyebrow">${esc(module.title)}</p>
        <h1>${esc(lesson.title)}</h1>
        <p class="muted small">${lessonIcon(lesson, false)} ${lesson.type} · ${formatMinutes(lesson.durationMin)}</p>
        ${body}
        <div class="lesson-nav">
          ${prev ? `<a class="btn ghost" href="#/course/${course.id}/lesson/${prev.lesson.id}">← ${esc(prev.lesson.title)}</a>` : "<span></span>"}
          ${next ? `<a class="btn ghost" href="#/course/${course.id}/lesson/${next.lesson.id}">${esc(next.lesson.title)} →</a>` : `<a class="btn ghost" href="#/course/${course.id}">Back to course</a>`}
        </div>
      </section>
      <aside class="card side-card lesson-toc">
        <h3>Course content ${ringSVG(p.pct, 40, 4)}</h3>
        ${course.modules.map((m) => `
          <p class="toc-module">${esc(m.title)}</p>
          <ul>${m.lessons.map((l) => {
            const d = rec.completedLessons.includes(l.id);
            return `<li><a class="toc-row ${l.id === lessonId ? "current" : ""} ${d ? "done" : ""}" href="#/course/${course.id}/lesson/${l.id}">${lessonIcon(l, d)}<span>${esc(l.title)}</span></a></li>`;
          }).join("")}</ul>`).join("")}
      </aside>
    </div>
  `;
}

function quizBody(course, lesson, rec) {
  const existing = rec.quizScores[lesson.id];
  const q = lesson.quiz;
  return `
    <form class="quiz card" id="quizForm" data-course="${course.id}" data-lesson="${lesson.id}">
      ${existing ? `<p class="muted small">Best attempt so far: <strong class="${existing.passed ? "pass-text" : "fail-text"}">${existing.pct}% (${existing.passed ? "passed" : "not passed"})</strong>, pass mark is 70%. You can retake below.</p>` : `<p class="muted small">Pass mark: 70%. Your best score counts toward completion.</p>`}
      ${q.questions.map((question, i) => `
        <fieldset class="quiz-q" data-q="${i}">
          <legend><strong>${i + 1}. ${esc(question.q)}</strong></legend>
          ${question.options.map((option, j) => `
            <label class="quiz-opt">
              <input type="radio" name="q${i}" value="${j}" required />
              <span>${esc(option)}</span>
            </label>`).join("")}
          <p class="quiz-explain hidden" data-explain="${i}"></p>
        </fieldset>`).join("")}
      <button class="btn primary" type="submit">Submit answers</button>
      <div id="quizResult"></div>
    </form>
  `;
}

function myLearningView() {
  const ids = Object.keys(state.enrolled);
  if (!ids.length) {
    return `<h1 class="page-title">My learning</h1>
      <div class="empty card"><h3>Nothing enrolled yet</h3>
      <p class="muted">Enroll in a course and it will show up here with your progress.</p>
      <a class="btn primary" href="#/courses">Browse courses</a></div>`;
  }
  const rows = ids.map((cid) => {
    const course = getCourse(cid);
    if (!course) return "";
    const rec = state.enrolled[cid];
    const p = courseProgress(course, rec);
    const flat = flatLessons(course);
    const next = flat.find(({ lesson }) => !rec.completedLessons.includes(lesson.id));
    const target = p.complete ? `#/course/${cid}` : `#/course/${cid}/lesson/${(next || flat[0]).lesson.id}`;
    return `<a class="card continue-card" href="${target}">
      ${thumb(course, "thumb sm")}
      <div class="continue-body">
        <strong>${esc(course.title)}</strong>
        <span class="muted small">Started ${formatDate(rec.startedAt)} · ${p.done}/${p.total} lessons</span>
        <div class="bar"><div class="bar-fill" style="width:${p.pct}%"></div></div>
      </div>
      ${p.complete ? `<span class="chip pass">✓ Done</span>` : ringSVG(p.pct)}
    </a>`;
  }).join("");
  return `<h1 class="page-title">My learning</h1><div class="stack">${rows}</div>`;
}

function certificatesView() {
  const earned = Object.keys(state.enrolled)
    .map((cid) => ({ course: getCourse(cid), rec: state.enrolled[cid] }))
    .filter((x) => x.course && courseProgress(x.course, x.rec).complete);
  const locked = COURSES.filter((c) => state.enrolled[c.id] && !courseProgress(c, state.enrolled[c.id]).complete);

  const certCard = ({ course, rec }) => {
    const last = Object.values(rec.completedAt).sort().pop();
    return `<div class="card certificate">
      <div class="cert-frame">
        <p class="eyebrow">NovaLearn certificate</p>
        <h3>${esc(course.title)}</h3>
        <p class="muted small">Awarded to <strong>Nada G.</strong> · ${formatDate(last)}</p>
        <p class="muted small">${countLessons(course)} lessons · ${formatMinutes(courseDurationMin(course))}</p>
        <span class="cert-seal">✓</span>
      </div>
    </div>`;
  };

  return `<h1 class="page-title">Certificates</h1>
    ${earned.length ? `<div class="grid">${earned.map(certCard).join("")}</div>`
      : `<div class="empty card"><h3>No certificates yet</h3><p class="muted">Finish every lesson in a course (and pass its quizzes) to earn a certificate.</p></div>`}
    ${locked.length ? `<h2 class="section-title">In progress</h2><div class="grid">${locked.map(courseCard).join("")}</div>` : ""}
  `;
}

function notFoundView() {
  return `<div class="empty card"><h3>Page not found</h3><p class="muted">That link does not match anything in this demo.</p><a class="btn primary" href="#/">Go to dashboard</a></div>`;
}

/* ---------------- router ---------------- */

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  return { path, params: new URLSearchParams(qs || "") };
}

function setActiveNav(path) {
  document.querySelectorAll("#nav a").forEach((a) => {
    const r = a.getAttribute("data-route");
    const active = r === "/" ? path === "/" : path.startsWith(r);
    a.classList.toggle("active", active);
  });
}

function render() {
  const { path, params } = parseHash();
  const parts = path.split("/").filter(Boolean);
  let html;
  if (path === "/") html = dashboardView();
  else if (parts[0] === "courses") html = catalogView(params);
  else if (parts[0] === "course" && parts.length === 2) {
    const c = getCourse(parts[1]);
    html = c ? courseDetailView(c) : notFoundView();
  } else if (parts[0] === "course" && parts[2] === "lesson" && parts.length === 4) {
    const c = getCourse(parts[1]);
    html = c ? lessonView(c, parts[3]) : notFoundView();
  } else if (parts[0] === "my-learning") html = myLearningView();
  else if (parts[0] === "certificates") html = certificatesView();
  else html = notFoundView();

  view.innerHTML = html;
  setActiveNav("/" + (parts[0] || ""));
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  document.getElementById("sidebar").classList.remove("open");
}

/* ---------------- events ---------------- */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const { action, course, lesson } = btn.dataset;
  if (action === "enroll") {
    enroll(state, course);
    const c = getCourse(course);
    toast(`Enrolled in ${c.title}`);
    render();
  } else if (action === "complete") {
    markLessonComplete(state, course, lesson);
    const p = courseProgress(getCourse(course), state.enrolled[course]);
    toast(p.complete ? "Course complete, certificate earned 🎉" : "Lesson marked complete");
    render();
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.id === "topSearch") {
    e.preventDefault();
    const q = document.getElementById("topSearchInput").value.trim();
    go(`#/courses?q=${encodeURIComponent(q)}`);
    return;
  }
  if (e.target.id === "filters") {
    e.preventDefault();
    const fd = new FormData(e.target);
    const qs = new URLSearchParams();
    for (const k of ["q", "cat", "level", "sort"]) {
      const v = (fd.get(k) || "").toString();
      if (v && v !== "All" && !(k === "sort" && v === "popular")) qs.set(k, v);
    }
    go(`#/courses?${qs.toString()}`);
    return;
  }
  if (e.target.id === "quizForm") {
    e.preventDefault();
    const { course, lesson } = e.target.dataset;
    const c = getCourse(course);
    const { lesson: quizLesson } = findLesson(c, lesson);
    const questions = quizLesson.quiz.questions;
    const answers = questions.map((_q, i) => {
      const checked = e.target.querySelector(`input[name="q${i}"]:checked`);
      return checked ? Number(checked.value) : null;
    });
    const result = scoreQuiz(questions, answers);
    recordQuizScore(state, course, lesson, result);

    // Inline feedback per question.
    questions.forEach((q, i) => {
      const fs = e.target.querySelector(`[data-q="${i}"]`);
      fs.classList.toggle("correct", result.perQuestion[i].correct);
      fs.classList.toggle("wrong", !result.perQuestion[i].correct);
      const ex = e.target.querySelector(`[data-explain="${i}"]`);
      ex.textContent = (result.perQuestion[i].correct ? "Correct. " : `Correct answer: ${q.options[q.answerIndex]}. `) + (q.explanation || "");
      ex.classList.remove("hidden");
    });

    const box = e.target.querySelector("#quizResult");
    box.innerHTML = `
      <div class="quiz-result ${result.passed ? "pass" : "fail"}">
        <strong>${result.pct}%, ${result.passed ? "Passed 🎉" : "Not passed yet"}</strong>
        <span>${result.score}/${result.total} correct · pass mark 70%</span>
        ${result.passed ? `<a class="btn primary" href="#/course/${course}">Back to course</a>`
          : `<button class="btn ghost" type="button" onclick="location.reload()">Retake quiz</button>`}
      </div>`;
    toast(result.passed ? "Quiz passed" : "Quiz submitted, review the answers");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

document.addEventListener("change", (e) => {
  if (e.target.closest("#filters") && e.target.tagName === "SELECT") {
    e.target.closest("form").requestSubmit();
  }
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

window.addEventListener("hashchange", render);
render();
