/*
 * HabitFlow — UI layer.
 * State lives in a single store object, persisted to localStorage.
 * Every mutation re-renders the affected parts from state (no DOM truth).
 */
(function () {
  "use strict";

  const L = window.HabitLogic;
  const STORAGE_KEY = "habitflow.v1";
  const THEME_KEY = "habitflow.theme";
  const HEATMAP_WEEKS = 18;

  const PALETTE = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#e84393", "#f39c12", "#d63031"];

  /* ---------- State ---------- */

  function defaultState() {
    return { habits: [] };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.habits)) return defaultState();
      return parsed;
    } catch (err) {
      console.warn("Could not read saved data, starting fresh.", err);
      return defaultState();
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function createHabit(name, color) {
    return {
      id: "h_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      color,
      createdAt: L.todayKey(),
      completions: {},
    };
  }

  function findHabit(id) {
    return state.habits.find((h) => h.id === id) || null;
  }

  let state = loadState();

  /* ---------- DOM handles ---------- */

  const habitListEl = document.getElementById("habitList");
  const emptyStateEl = document.getElementById("emptyState");
  const template = document.getElementById("habitCardTemplate");
  const toastEl = document.getElementById("toast");
  const dialog = document.getElementById("habitDialog");
  const habitForm = document.getElementById("habitForm");
  const habitNameInput = document.getElementById("habitName");
  const nameError = document.getElementById("nameError");
  const swatchesEl = document.getElementById("colorSwatches");

  let editingHabitId = null;
  let selectedColor = PALETTE[0];
  let toastTimer = null;

  /* ---------- Theme ---------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }

  /* ---------- Toast ---------- */

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("toast--visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("toast--visible"), 2200);
  }

  /* ---------- Rendering ---------- */

  function renderStats() {
    const habits = state.habits;
    document.getElementById("statHabits").textContent = String(habits.length);

    const weekTotal = habits.reduce((sum, h) => sum + L.checkinsThisWeek(h.completions), 0);
    document.getElementById("statWeek").textContent = String(weekTotal);

    const bestCurrent = habits.reduce((max, h) => Math.max(max, L.currentStreak(h.completions)), 0);
    document.getElementById("statStreak").childNodes[0].nodeValue = String(bestCurrent);

    const rates = habits.map((h) => L.completionRate(h.completions, 30, h.createdAt));
    const avg = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    document.getElementById("statRate").childNodes[0].nodeValue = String(avg);
  }

  function renderHeatmap(container, habit) {
    container.textContent = "";
    const cells = L.buildHeatmap(HEATMAP_WEEKS);
    const done = habit.completions;
    const frag = document.createDocumentFragment();
    for (const cell of cells) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "heat-cell";
      btn.dataset.date = cell.key;
      btn.dataset.habit = habit.id;
      const isDone = Boolean(done[cell.key]);
      if (isDone) btn.style.background = habit.color;
      if (cell.inFuture) btn.classList.add("heat-cell--future");
      if (cell.isToday) btn.classList.add("heat-cell--today");
      const labelDate = new Date(cell.key + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      btn.setAttribute("aria-label", `${habit.name} on ${labelDate}: ${isDone ? "done" : "not done"}. Activate to toggle.`);
      btn.title = `${labelDate} — ${isDone ? "done" : "not done"}`;
      btn.disabled = cell.inFuture;
      frag.appendChild(btn);
    }
    container.appendChild(frag);
  }

  function renderHabits() {
    habitListEl.textContent = "";
    emptyStateEl.hidden = state.habits.length > 0;

    for (const habit of state.habits) {
      const node = template.content.firstElementChild.cloneNode(true);
      node.dataset.id = habit.id;

      node.querySelector(".habit-card__dot").style.background = habit.color;
      node.querySelector(".habit-card__name").textContent = habit.name;

      const streak = L.currentStreak(habit.completions);
      const best = L.bestStreak(habit.completions);
      const streakEl = node.querySelector(".habit-card__streak");
      streakEl.innerHTML = "";
      const streakStrong = document.createElement("strong");
      streakStrong.textContent = `${streak} day${streak === 1 ? "" : "s"}`;
      streakEl.append("Streak: ", streakStrong, ` (best ${best})`);

      const rate = L.completionRate(habit.completions, 30, habit.createdAt);
      const rateEl = node.querySelector(".habit-card__rate");
      rateEl.innerHTML = "";
      const rateStrong = document.createElement("strong");
      rateStrong.textContent = `${rate}%`;
      rateEl.append("Last 30 days: ", rateStrong);

      renderHeatmap(node.querySelector(".habit-card__heatmap"), habit);

      const total = L.totalCheckins(habit.completions);
      node.querySelector(".habit-card__total").textContent = `${total} check-in${total === 1 ? "" : "s"} all time`;

      const todayBtn = node.querySelector(".habit-card__today");
      const doneToday = Boolean(habit.completions[L.todayKey()]);
      todayBtn.setAttribute("aria-pressed", String(doneToday));
      todayBtn.style.borderColor = habit.color;
      if (doneToday) {
        todayBtn.style.background = habit.color;
        todayBtn.style.color = "#fff";
        todayBtn.textContent = "Done today ✓";
      } else {
        todayBtn.style.background = "transparent";
        todayBtn.style.color = habit.color;
        todayBtn.textContent = "Mark today done";
      }

      habitListEl.appendChild(node);
    }
  }

  function render() {
    renderStats();
    renderHabits();
  }

  /* ---------- Mutations ---------- */

  function toggleCompletion(habitId, dateKey) {
    const habit = findHabit(habitId);
    if (!habit || dateKey > L.todayKey()) return;
    if (habit.completions[dateKey]) {
      delete habit.completions[dateKey];
    } else {
      habit.completions[dateKey] = true;
    }
    saveState();
    render();
  }

  function deleteHabit(habitId) {
    const habit = findHabit(habitId);
    if (!habit) return;
    const ok = window.confirm(`Delete "${habit.name}" and its whole history? This cannot be undone.`);
    if (!ok) return;
    state.habits = state.habits.filter((h) => h.id !== habitId);
    saveState();
    render();
    showToast("Habit deleted");
  }

  /* ---------- Dialog ---------- */

  function renderSwatches() {
    swatchesEl.textContent = "";
    for (const color of PALETTE) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = color;
      btn.dataset.color = color;
      btn.setAttribute("aria-pressed", String(color === selectedColor));
      btn.setAttribute("aria-label", `Choose color ${color}`);
      swatchesEl.appendChild(btn);
    }
  }

  function openDialog(habitId) {
    editingHabitId = habitId;
    const habit = habitId ? findHabit(habitId) : null;
    document.getElementById("dialogTitle").textContent = habit ? "Edit habit" : "New habit";
    document.getElementById("saveHabitBtn").textContent = habit ? "Save changes" : "Save habit";
    habitNameInput.value = habit ? habit.name : "";
    selectedColor = habit ? habit.color : PALETTE[state.habits.length % PALETTE.length];
    nameError.hidden = true;
    renderSwatches();
    dialog.showModal();
    habitNameInput.focus();
  }

  function closeDialog() {
    dialog.close();
    editingHabitId = null;
    habitForm.reset();
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) {
      nameError.hidden = false;
      habitNameInput.focus();
      return;
    }
    if (editingHabitId) {
      const habit = findHabit(editingHabitId);
      if (habit) {
        habit.name = name;
        habit.color = selectedColor;
      }
      showToast("Habit updated");
    } else {
      state.habits.push(createHabit(name, selectedColor));
      showToast("Habit created — day one starts now");
    }
    saveState();
    render();
    closeDialog();
  }

  /* ---------- Export / import ---------- */

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = L.todayKey();
    a.href = url;
    a.download = `habitflow-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  }

  function validateImport(data) {
    if (!data || !Array.isArray(data.habits)) return null;
    const habits = [];
    for (const h of data.habits) {
      if (!h || typeof h.name !== "string" || !h.name.trim()) return null;
      const completions = {};
      if (h.completions && typeof h.completions === "object") {
        for (const key of Object.keys(h.completions)) {
          if (L.parseKey(key) && h.completions[key]) completions[key] = true;
        }
      }
      habits.push({
        id: typeof h.id === "string" && h.id ? h.id : createHabit(h.name, PALETTE[0]).id,
        name: h.name.trim().slice(0, 60),
        color: PALETTE.includes(h.color) ? h.color : PALETTE[0],
        createdAt: L.parseKey(h.createdAt) ? h.createdAt : L.todayKey(),
        completions,
      });
    }
    return { habits };
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const clean = validateImport(parsed);
        if (!clean) throw new Error("bad shape");
        state = clean;
        saveState();
        render();
        showToast(`Imported ${clean.habits.length} habit${clean.habits.length === 1 ? "" : "s"}`);
      } catch (err) {
        showToast("That file is not a valid HabitFlow backup");
      }
    };
    reader.readAsText(file);
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    document.getElementById("themeToggle").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });

    document.getElementById("addHabitBtn").addEventListener("click", () => openDialog(null));
    document.getElementById("emptyAddBtn").addEventListener("click", () => openDialog(null));
    document.getElementById("cancelDialogBtn").addEventListener("click", closeDialog);
    habitForm.addEventListener("submit", handleFormSubmit);

    swatchesEl.addEventListener("click", (event) => {
      const btn = event.target.closest(".swatch");
      if (!btn) return;
      selectedColor = btn.dataset.color;
      renderSwatches();
    });

    habitListEl.addEventListener("click", (event) => {
      const card = event.target.closest(".habit-card");
      if (!card) return;
      const habitId = card.dataset.id;

      const heatCell = event.target.closest(".heat-cell");
      if (heatCell) {
        toggleCompletion(heatCell.dataset.habit, heatCell.dataset.date);
        return;
      }
      if (event.target.closest(".habit-card__today")) {
        toggleCompletion(habitId, L.todayKey());
        return;
      }
      if (event.target.closest(".habit-card__edit")) {
        openDialog(habitId);
        return;
      }
      if (event.target.closest(".habit-card__delete")) {
        deleteHabit(habitId);
      }
    });

    document.getElementById("exportBtn").addEventListener("click", exportData);
    const importFile = document.getElementById("importFile");
    document.getElementById("importBtn").addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", () => {
      if (importFile.files && importFile.files[0]) importData(importFile.files[0]);
      importFile.value = "";
    });
  }

  /* ---------- Boot ---------- */

  initTheme();
  bindEvents();
  render();
})();
