// Synthetic course catalog for the NovaLearn demo.
// All people, companies, ratings and content are fictional sample data.

export const CATEGORIES = [
  "Web Development",
  "Data Science",
  "Design",
  "Marketing",
];

export const COURSES = [
  {
    id: "fullstack-bootcamp",
    title: "Full-Stack Web Development Bootcamp",
    category: "Web Development",
    level: "Beginner",
    rating: 4.8,
    ratingCount: 2314,
    students: 18420,
    price: 0,
    accent: ["#6c5ce7", "#4834d4"],
    icon: "</>" ,
    tags: ["html", "css", "javascript", "node", "career"],
    description:
      "A guided path from your first HTML tag to a deployed full-stack app. You build three projects, learn how the web actually works, and finish with a portfolio-ready capstone.",
    outcomes: [
      "Build semantic, accessible pages with HTML and modern CSS",
      "Ship interactive UIs with vanilla JavaScript",
      "Create a REST API with Node.js and Express",
      "Deploy a full-stack project and explain every layer",
    ],
    instructor: { name: "Laila Hassan", title: "Senior Frontend Engineer", initials: "LH" },
    modules: [
      {
        id: "fs-m1",
        title: "How the web works",
        lessons: [
          { id: "fs-m1l1", title: "Clients, servers and the request lifecycle", type: "video", durationMin: 14, summary: "What really happens between typing a URL and seeing a page: DNS, HTTP, and the rendering pipeline in plain language." },
          { id: "fs-m1l2", title: "Your first page, the semantic way", type: "video", durationMin: 22, summary: "Set up a project and mark up a real page with semantic elements instead of div soup." },
          { id: "fs-m1l3", title: "Reading: accessibility is not optional", type: "article", durationMin: 9, summary: "Why semantics, contrast and keyboard support decide who can use what you build, and the cheap habits that cover 80% of it." },
          { id: "fs-m1q", title: "Checkpoint: web foundations", type: "quiz", durationMin: 10, quiz: {
            questions: [
              { q: "What does DNS resolve?", options: ["A domain name to an IP address", "HTML to pixels", "HTTP to HTTPS", "A database query to rows"], answerIndex: 0, explanation: "DNS maps human-readable names like example.com to IP addresses." },
              { q: "Which element best wraps standalone, self-contained content?", options: ["<div>", "<article>", "<span>", "<br>"], answerIndex: 1, explanation: "<article> represents a self-contained composition." },
              { q: "Which of these is an HTTP method?", options: ["FETCH", "GET", "SEND", "PULL"], answerIndex: 1, explanation: "GET, POST, PUT, PATCH and DELETE are the common methods." },
              { q: "The minimum color-contrast habit for normal body text is roughly…", options: ["2:1", "3:1", "4.5:1", "10:1"], answerIndex: 2, explanation: "WCAG AA asks for 4.5:1 for normal text." },
            ],
          } },
        ],
      },
      {
        id: "fs-m2",
        title: "JavaScript in the browser",
        lessons: [
          { id: "fs-m2l1", title: "DOM selection and events without tears", type: "video", durationMin: 26, summary: "querySelector, addEventListener, and the event object, the three tools behind every interactive page." },
          { id: "fs-m2l2", title: "State, rendering and why frameworks exist", type: "video", durationMin: 24, summary: "Build a tiny render loop by hand to understand the problem React later solves for you." },
          { id: "fs-m2l3", title: "Project: an accessible modal and a tab panel", type: "article", durationMin: 18, summary: "Two patterns you will rebuild forever, done with focus management and ARIA done right." },
        ],
      },
      {
        id: "fs-m3",
        title: "Back end and capstone",
        lessons: [
          { id: "fs-m3l1", title: "REST APIs with Node and Express", type: "video", durationMin: 31, summary: "Routes, middleware, JSON bodies and status codes, a small API that a front end can consume." },
          { id: "fs-m3l2", title: "Capstone brief: ship a bookmark manager", type: "article", durationMin: 12, summary: "Requirements, data model and acceptance criteria for the course capstone." },
          { id: "fs-m3q", title: "Final exam: full-stack foundations", type: "quiz", durationMin: 15, quiz: {
            questions: [
              { q: "Which status code means “created”?", options: ["200", "201", "301", "404"], answerIndex: 1, explanation: "201 signals a resource was created." },
              { q: "Middleware in Express is…", options: ["A database driver", "A function in the request/response pipeline", "A CSS preprocessor", "A template engine"], answerIndex: 1, explanation: "Middleware functions run between receiving the request and sending the response." },
              { q: "JSON bodies are parsed with…", options: ["express.json()", "express.static()", "res.render()", "app.listen()"], answerIndex: 0, explanation: "express.json() parses incoming JSON request bodies." },
              { q: "Which is the safest place for a session secret?", options: ["In the front-end bundle", "In a public repo", "In a server-side environment variable", "In the URL"], answerIndex: 2, explanation: "Secrets belong on the server, out of version control." },
              { q: "A 404 response means…", options: ["Server error", "Unauthorized", "Resource not found", "Redirect"], answerIndex: 2, explanation: "404 = the requested resource does not exist at that path." },
            ],
          } },
        ],
      },
    ],
  },

  {
    id: "advanced-js",
    title: "Advanced JavaScript: From ES6 to Architecture",
    category: "Web Development",
    level: "Advanced",
    rating: 4.9,
    ratingCount: 1187,
    students: 8930,
    price: 49,
    accent: ["#f39c12", "#e67e22"],
    icon: "JS",
    tags: ["javascript", "es6", "performance", "patterns"],
    description:
      "Closures, the event loop, prototypes and module architecture, the parts of JavaScript that interviews and real codebases actually test.",
    outcomes: [
      "Reason precisely about scope, closures and this",
      "Predict async behavior using the event-loop model",
      "Apply module and state patterns to medium-size apps",
      "Profile and fix common performance footguns",
    ],
    instructor: { name: "Omar Tarek", title: "Staff Engineer, ex-fintech", initials: "OT" },
    modules: [
      {
        id: "aj-m1",
        title: "The language, properly",
        lessons: [
          { id: "aj-m1l1", title: "Closures without the mystery", type: "video", durationMin: 28, summary: "Lexical scope as a mechanical model you can run in your head, with five classic closure puzzles." },
          { id: "aj-m1l2", title: "The event loop, task queues and microtasks", type: "video", durationMin: 33, summary: "Why setTimeout(0) is not now, and why promise callbacks jump the queue." },
          { id: "aj-m1q", title: "Checkpoint: core mechanics", type: "quiz", durationMin: 12, quiz: {
            questions: [
              { q: "A closure is…", options: ["A private class field", "A function bundled with its lexical scope", "A minified module", "An async callback"], answerIndex: 1, explanation: "A closure keeps access to the scope where it was created." },
              { q: "Which runs first after the current script?", options: ["setTimeout callback", "Promise.then callback", "requestAnimationFrame", "They are identical"], answerIndex: 1, explanation: "Microtasks (promises) drain before the next macrotask (timers)." },
              { q: "In a method call obj.f(), `this` is…", options: ["The global object", "Always undefined", "obj", "The function itself"], answerIndex: 2, explanation: "Method calls bind `this` to the receiver." },
            ],
          } },
        ],
      },
      {
        id: "aj-m2",
        title: "Architecture and performance",
        lessons: [
          { id: "aj-m2l1", title: "Modules, barrels and dependency direction", type: "article", durationMin: 16, summary: "How to keep imports acyclic and modules honest as a codebase grows." },
          { id: "aj-m2l2", title: "State patterns: store, events and selectors", type: "video", durationMin: 27, summary: "A dependency-free store pattern you can reuse in any app, and when to reach for a library instead." },
          { id: "aj-m2l3", title: "Profiling: find the real bottleneck first", type: "video", durationMin: 21, summary: "Use the Performance panel to separate layout thrash, long tasks and memory churn." },
        ],
      },
    ],
  },

  {
    id: "react-in-practice",
    title: "React in Practice: Components to Production",
    category: "Web Development",
    level: "Intermediate",
    rating: 4.7,
    ratingCount: 1602,
    students: 12075,
    price: 59,
    accent: ["#0984e3", "#0652dd"],
    icon: "⚛",
    tags: ["react", "hooks", "testing", "frontend"],
    description:
      "Hooks, data fetching, forms and testing, taught by building and refactoring one real app instead of ten toy examples.",
    outcomes: [
      "Design component APIs that stay pleasant to use",
      "Manage server state without useEffect spaghetti",
      "Write component tests that survive refactors",
      "Ship with code splitting and sensible error boundaries",
    ],
    instructor: { name: "Sara Mahmoud", title: "Frontend Lead", initials: "SM" },
    modules: [
      {
        id: "rc-m1",
        title: "Thinking in components",
        lessons: [
          { id: "rc-m1l1", title: "Props, composition and the children pattern", type: "video", durationMin: 24, summary: "Why composition beats configuration for flexible components." },
          { id: "rc-m1l2", title: "Hooks rules and the mental model", type: "video", durationMin: 29, summary: "What the rules of hooks are really protecting you from." },
          { id: "rc-m1l3", title: "Reading: colocation over abstraction", type: "article", durationMin: 11, summary: "Keep state, styles and tests near the component until a real pattern emerges." },
        ],
      },
      {
        id: "rc-m2",
        title: "Data and production concerns",
        lessons: [
          { id: "rc-m2l1", title: "Fetching data without race conditions", type: "video", durationMin: 26, summary: "Cancellation, staleness and why a query library pays for itself." },
          { id: "rc-m2l2", title: "Testing components people rely on", type: "video", durationMin: 23, summary: "Test behavior at the boundary a user sees, not implementation details." },
          { id: "rc-m2q", title: "Checkpoint: production React", type: "quiz", durationMin: 10, quiz: {
            questions: [
              { q: "The children pattern mainly helps with…", options: ["SEO", "Composition and avoiding prop drilling", "Bundle size", "SSR only"], answerIndex: 1, explanation: "Passing composed elements down avoids threading props." },
              { q: "A good component test asserts on…", options: ["State variable names", "Rendered behavior a user can observe", "Internal functions", "Hook call order"], answerIndex: 1, explanation: "Behavioral tests survive refactors." },
              { q: "Code splitting in React is usually done with…", options: ["React.lazy and Suspense", "useMemo", "context", "keys"], answerIndex: 0, explanation: "React.lazy plus Suspense loads bundles on demand." },
            ],
          } },
        ],
      },
    ],
  },

  {
    id: "python-data-analysis",
    title: "Data Analysis with Python",
    category: "Data Science",
    level: "Beginner",
    rating: 4.6,
    ratingCount: 987,
    students: 9640,
    price: 0,
    accent: ["#00b894", "#019875"],
    icon: "Py",
    tags: ["python", "pandas", "data", "analysis"],
    description:
      "From CSV to insight: pandas, cleaning messy data, and charts that answer a question instead of decorating a slide.",
    outcomes: [
      "Load, inspect and clean real-world tables with pandas",
      "Reshape data with groupby, merge and pivot",
      "Choose the right chart for a question",
      "Write a reproducible analysis notebook",
    ],
    instructor: { name: "Khaled Nasser", title: "Data Analyst & Instructor", initials: "KN" },
    modules: [
      {
        id: "pd-m1",
        title: "Tables and cleaning",
        lessons: [
          { id: "pd-m1l1", title: "DataFrames from first principles", type: "video", durationMin: 25, summary: "Indexes, columns and vectorized thinking." },
          { id: "pd-m1l2", title: "Messy data clinic: nulls, dupes and dtypes", type: "video", durationMin: 30, summary: "A repeatable checklist for the first hour with a new dataset." },
          { id: "pd-m1q", title: "Checkpoint: cleaning", type: "quiz", durationMin: 10, quiz: {
            questions: [
              { q: "df.dropna() removes…", options: ["Columns", "Rows with missing values", "Duplicates", "Outliers"], answerIndex: 1, explanation: "dropna drops rows (or columns) containing NA values." },
              { q: "A column of numbers stored as text is fixed with…", options: ["astype", "groupby", "merge", "pivot"], answerIndex: 0, explanation: "astype converts dtypes." },
              { q: "Duplicated rows are detected with…", options: ["df.unique()", "df.duplicated()", "df.null()", "df.rows()"], answerIndex: 1, explanation: "df.duplicated() flags repeated rows." },
            ],
          } },
        ],
      },
      {
        id: "pd-m2",
        title: "Analysis and storytelling",
        lessons: [
          { id: "pd-m2l1", title: "groupby, merge and pivot by example", type: "video", durationMin: 28, summary: "The three verbs behind most real analysis work." },
          { id: "pd-m2l2", title: "Charts that answer questions", type: "article", durationMin: 14, summary: "A decision guide: trend, comparison, distribution or relationship." },
        ],
      },
    ],
  },

  {
    id: "sql-analytics",
    title: "SQL for Data Analysts",
    category: "Data Science",
    level: "Intermediate",
    rating: 4.8,
    ratingCount: 845,
    students: 7210,
    price: 39,
    accent: ["#e17055", "#d63031"],
    icon: "▦",
    tags: ["sql", "analytics", "databases"],
    description:
      "Joins, window functions and query thinking on a realistic store database. Write SQL you are proud to paste into a code review.",
    outcomes: [
      "Compose multi-join queries with confidence",
      "Use window functions for running totals and rankings",
      "Read an execution plan well enough to fix slow queries",
      "Avoid the five most common analytic SQL mistakes",
    ],
    instructor: { name: "Khaled Nasser", title: "Data Analyst & Instructor", initials: "KN" },
    modules: [
      {
        id: "sq-m1",
        title: "Core querying",
        lessons: [
          { id: "sq-m1l1", title: "Joins as set operations", type: "video", durationMin: 22, summary: "Inner, left and anti joins drawn as sets so the results stop surprising you." },
          { id: "sq-m1l2", title: "Aggregations and GROUP BY traps", type: "video", durationMin: 19, summary: "Why mixing grouped and raw columns breaks, and what the database is really asking." },
        ],
      },
      {
        id: "sq-m2",
        title: "Window functions",
        lessons: [
          { id: "sq-m2l1", title: "ROW_NUMBER, RANK and partitions", type: "video", durationMin: 26, summary: "Top-N-per-group in one query instead of three." },
          { id: "sq-m2l2", title: "Running totals and moving averages", type: "article", durationMin: 13, summary: "Frame clauses explained with revenue examples." },
          { id: "sq-m2q", title: "Checkpoint: window functions", type: "quiz", durationMin: 10, quiz: {
            questions: [
              { q: "ROW_NUMBER() over a partition gives…", options: ["The same number to ties", "A unique sequential number per partition", "A random id", "The row count"], answerIndex: 1, explanation: "ROW_NUMBER assigns a unique sequential value within each partition." },
              { q: "RANK differs from DENSE_RANK by…", options: ["Skipping numbers after ties", "Being faster", "Ignoring NULLs", "Ordering DESC"], answerIndex: 0, explanation: "RANK leaves gaps after ties; DENSE_RANK does not." },
              { q: "A running total uses…", options: ["GROUP BY", "SUM() OVER (ORDER BY …)", "HAVING", "DISTINCT"], answerIndex: 1, explanation: "An ordered window frame turns SUM into a cumulative total." },
            ],
          } },
        ],
      },
    ],
  },

  {
    id: "uiux-foundations",
    title: "UI/UX Design Foundations",
    category: "Design",
    level: "Beginner",
    rating: 4.7,
    ratingCount: 1290,
    students: 10380,
    price: 0,
    accent: ["#e84393", "#b53471"],
    icon: "✎",
    tags: ["design", "ux", "ui", "accessibility"],
    description:
      "Hierarchy, spacing, typography and feedback, the design fundamentals that make developer work look professional.",
    outcomes: [
      "Create clear visual hierarchy with type and space",
      "Build a small, consistent color system",
      "Design empty, loading and error states",
      "Run a five-minute usability sanity check",
    ],
    instructor: { name: "Farida Adel", title: "Product Designer", initials: "FA" },
    modules: [
      {
        id: "ux-m1",
        title: "Visual fundamentals",
        lessons: [
          { id: "ux-m1l1", title: "Hierarchy: what the eye does first", type: "video", durationMin: 20, summary: "Size, weight, color and spacing as ranking signals." },
          { id: "ux-m1l2", title: "An 8-point spacing system you can keep", type: "article", durationMin: 10, summary: "Consistent spacing is 70% of looking designed." },
          { id: "ux-m1l3", title: "Type scales and readable line lengths", type: "article", durationMin: 9, summary: "Pick two fonts, a scale, and stop fiddling." },
        ],
      },
      {
        id: "ux-m2",
        title: "Interface states",
        lessons: [
          { id: "ux-m2l1", title: "Empty, loading, error and success", type: "video", durationMin: 18, summary: "The states people actually hit, designed on purpose." },
          { id: "ux-m2q", title: "Checkpoint: design foundations", type: "quiz", durationMin: 8, quiz: {
            questions: [
              { q: "The strongest hierarchy signal is usually…", options: ["Color", "Size and weight", "Borders", "Shadows"], answerIndex: 1, explanation: "Size and weight are read first." },
              { q: "Body text is most readable around…", options: ["20–30 characters", "45–75 characters", "100–120 characters", "Any length"], answerIndex: 1, explanation: "45–75 characters per line is the comfortable range." },
              { q: "An empty state should…", options: ["Be blank", "Explain and offer the next action", "Show an error", "Hide the page"], answerIndex: 1, explanation: "Empty states teach and route the user forward." },
            ],
          } },
        ],
      },
    ],
  },

  {
    id: "design-systems-figma",
    title: "Design Systems in Figma",
    category: "Design",
    level: "Intermediate",
    rating: 4.5,
    ratingCount: 512,
    students: 4150,
    price: 45,
    accent: ["#a29bfe", "#6c5ce7"],
    icon: "◧",
    tags: ["figma", "design-systems", "tokens", "components"],
    description:
      "Tokens, components, variants and documentation: build a small design system in Figma that developers can actually implement.",
    outcomes: [
      "Structure color, type and spacing tokens",
      "Build variant-driven components that stay maintainable",
      "Document usage so the system survives handoff",
      "Version a library without breaking consumers",
    ],
    instructor: { name: "Farida Adel", title: "Product Designer", initials: "FA" },
    modules: [
      {
        id: "ds-m1",
        title: "Tokens and primitives",
        lessons: [
          { id: "ds-m1l1", title: "Design tokens: naming that scales", type: "video", durationMin: 21, summary: "Primitive vs semantic tokens, and why “blue-500” is not a decision." },
          { id: "ds-m1l2", title: "Buttons, inputs and the anatomy of a component", type: "video", durationMin: 25, summary: "States, slots and variants on the two components every system starts with." },
          { id: "ds-m1l3", title: "Reading: a token file developers can consume", type: "article", durationMin: 10, summary: "How to export tokens as JSON and keep Figma variables and code constants in sync." },
        ],
      },
      {
        id: "ds-m2",
        title: "System in practice",
        lessons: [
          { id: "ds-m2l1", title: "Documentation people read", type: "article", durationMin: 12, summary: "Usage, do/don't and code mapping on one page per component." },
          { id: "ds-m2q", title: "Checkpoint: design systems", type: "quiz", durationMin: 8, quiz: {
            questions: [
              { q: "A semantic token like `surface-danger` is better than `red-500` because…", options: ["It is shorter", "It records intent, so themes can change the value", "It renders faster", "Figma requires it"], answerIndex: 1, explanation: "Semantic names describe purpose, not appearance." },
              { q: "Variants in Figma are best for…", options: ["Random artboards", "One component's related states and sizes", "Pages", "Prototyping flows"], answerIndex: 1, explanation: "Variants group related states of one component." },
              { q: "Good component docs always include…", options: ["The designer's bio", "Usage guidance and a code mapping", "Only a screenshot", "Lorem ipsum"], answerIndex: 1, explanation: "Usage plus implementation mapping is what makes a system adoptable." },
            ],
          } },
        ],
      },
    ],
  },

  {
    id: "digital-marketing-strategy",
    title: "Digital Marketing Strategy for Builders",
    category: "Marketing",
    level: "Beginner",
    rating: 4.4,
    ratingCount: 389,
    students: 3560,
    price: 29,
    accent: ["#00cec9", "#01a3a4"],
    icon: "◈",
    tags: ["marketing", "seo", "content", "growth"],
    description:
      "Positioning, channels and measurement for developers and freelancers who ship things and then wonder why nobody shows up.",
    outcomes: [
      "Write a one-line positioning statement that survives contact with a stranger",
      "Pick one channel to win before adding a second",
      "Set up measurement you will actually look at",
      "Plan a launch checklist for a side project",
    ],
    instructor: { name: "Hana Samir", title: "Growth Consultant", initials: "HS" },
    modules: [
      {
        id: "mk-m1",
        title: "Positioning and channels",
        lessons: [
          { id: "mk-m1l1", title: "Positioning in one sentence", type: "video", durationMin: 17, summary: "Who it is for, what it replaces, why you." },
          { id: "mk-m1l2", title: "Choose one channel: a decision framework", type: "article", durationMin: 11, summary: "Match the channel to where your audience already looks, not where you like posting." },
          { id: "mk-m1l3", title: "Reading: pricing signals for indie products", type: "article", durationMin: 9, summary: "Free, freemium, paid upfront, what each price tells the buyer before they read a word." },
        ],
      },
      {
        id: "mk-m2",
        title: "Measurement and launch",
        lessons: [
          { id: "mk-m2l1", title: "Metrics that map to decisions", type: "video", durationMin: 19, summary: "Activation, retention and the vanity-metric trap." },
          { id: "mk-m2l2", title: "Launch checklist for side projects", type: "article", durationMin: 8, summary: "A 12-point list from landing page to follow-up email." },
        ],
      },
    ],
  },
];

/** Course lookup by id. */
export function getCourse(id) {
  return COURSES.find((c) => c.id === id) || null;
}
