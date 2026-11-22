# HabitFlow — Daily Habit Tracker

A dependency-free habit tracker built with vanilla HTML, CSS and JavaScript. No frameworks, no build step, no network calls — open it and it works.

## Features

- **Unlimited habits** with custom colors, create / edit / delete with confirmation
- **One-tap daily check-in**, plus a clickable history: tap any past day to correct it
- **GitHub-style heatmap** per habit (18 weeks, Monday-first, future days locked)
- **Streaks**: current streak (survives an unfinished today) and all-time best
- **Live stats**: check-ins this week, best current streak, average 30-day completion rate
- **Dark / light theme**, remembered across visits, respects `prefers-color-scheme` on first load
- **Local persistence** via `localStorage` — data never leaves the browser
- **Backup & restore**: export and import the full dataset as JSON, with input validation
- **Responsive layout** down to small phones, keyboard-focusable controls, `prefers-reduced-motion` support

## Run it

No build step required. Either open `index.html` directly in a browser, or serve the folder:

```bash
# Python
python3 -m http.server 8080

# or Node
npx serve .
```

Then visit `http://localhost:8080`.

## Project structure

```
habitflow/
├── index.html        # Markup, dialog and <template> for habit cards
├── css/
│   └── style.css     # Theme tokens (CSS custom properties), components, responsive rules
├── js/
│   ├── logic.js      # Pure date/streak/heatmap logic — no DOM, shared with the tests
│   └── app.js        # State store, localStorage persistence, rendering, events
└── tests/
    └── logic.test.js # Node test suite for the pure logic
```

## Design decisions

- **Single source of truth**: all state lives in one store object; every mutation re-renders from state. The DOM never holds data the store doesn't have.
- **Pure logic separated from UI**: `js/logic.js` contains only date and streak math (UMD pattern), so the exact same code the browser runs is unit-tested in Node.
- **Streak semantics**: a streak counts back from today; if today isn't checked in yet, it counts back from yesterday. Your streak is "at risk", not broken, until the day ends.
- **Completion rate is fair to new habits**: a habit created 3 days ago is rated over 3 days, not 30.
- **Storage schema is versioned** (`habitflow.v1`) so future migrations have a clean hook.

## Tests

```bash
node tests/logic.test.js
```

Covers date-key round-trips, month-boundary streaks, streak-at-risk behavior, completion-rate edge cases and heatmap grid shape.

## Browser support

Works in current Chrome, Firefox, Safari and Edge (uses `<dialog>`, CSS custom properties and `localStorage`).
