# GitVerse

> Git, explained visually — like never before.

GitVerse is an interactive, fully client-side Git learning platform. No backend. No login. No "please subscribe to unlock the rest of the tutorial." Just you, a sandboxed terminal, animated graphs, and every Git concept explained until it actually makes sense.

Built for engineers who are tired of `man git-rebase` and Stack Overflow answers that start with "well, it's complicated."

---

## What it actually does

| Section | What you get |
|---|---|
| **Playground** | A sandboxed terminal with real Git command parsing, live commit graph, and repo state panel |
| **Commands** | 15+ deep-dives with syntax, internals, pitfalls, recovery paths, and animated state |
| **Fundamentals** | The three states, the object model, HEAD, refs — the stuff nobody explains properly |
| **Internals** | How Git actually stores your data: blobs, trees, commits, packfiles, hooks |
| **Visualizers** | Step-through animations for rebase, reset, stash, merge conflict, bisect, and more |
| **Workflows** | GitFlow, trunk-based dev, monorepos, Conventional Commits, merge strategies |
| **Recovery** | When you've `git reset --hard`'d something you shouldn't have — this is your page |
| **Comparisons** | `merge vs rebase`, `reset vs revert`, `switch vs checkout` — side by side |

---

## Getting Started

```bash
git clone https://github.com/yourusername/gitverse.git
cd gitverse
npm install
npm run dev
# → http://localhost:5173/gitverse/
```

That's it. No `.env` file. No database. No API keys. Just a Vite dev server and your browser.

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run deploy     # builds + pushes to GitHub Pages
npm run format     # prettier across the whole project
```

---

## Tech Stack

| Thing | Why |
|---|---|
| **React 18** | UI. You know what React is. |
| **Vite 5** | Build tool. Fast. No complaints. |
| **Zustand** | Global state. Tiny, no boilerplate, persists theme + sidebar state via middleware. |
| **React Router v7** | Client-side routing. Hash mode for GitHub Pages compatibility. |
| **Tailwind CSS** | Utility classes for layout. All color/theme is done via CSS custom properties, not Tailwind. |
| **D3.js** | Imported but only used for utility math — the commit graph is hand-rolled SVG. |
| **Lucide React** | Icon set. |
| **IBM Plex Mono** | Terminal and code typography. Non-negotiable. |
| **Outfit / Manrope** | UI headings and body text. |

No testing framework. No TypeScript. No SSR. No GraphQL. It's a learning tool, not a SaaS — the stack is intentionally lean.

---

## Project Architecture

```
src/
├── data/
│   ├── commands.js          ← The entire command database. Every git command, 16 attributes each.
│   └── graphs.js            ← Pre-built graph scenarios + layout algorithm + edge path builder
│
├── store/
│   └── useAppStore.js       ← Zustand store. Holds: theme, sidebar, terminal history,
│                               live repo state (commits, branches, HEAD, branchHeads, stash)
│
├── components/
│   ├── layout/
│   │   ├── Layout.jsx       ← App shell: top bar + collapsible sidebar + content area
│   │   └── Sidebar.jsx      ← Navigation links with icons, active state, collapse toggle
│   │
│   ├── ui/
│   │   └── index.jsx        ← Design system components:
│   │                           Badge, Alert, CodeBlock (with git syntax highlighting),
│   │                           Tabs, SearchBox, Collapsible, InfoCard, StepProgress,
│   │                           SectionHeader, VizCanvas
│   │
│   ├── graphs/
│   │   └── CommitGraph.jsx  ← SVG commit graph engine. Handles node layout, bezier edges,
│   │                           branch labels, HEAD pointer, click selection, hover tooltips.
│   │                           Accepts either a named `scenario` or a live `customGraph` prop.
│   │
│   ├── terminal/
│   │   ├── TerminalEmulator.jsx  ← Terminal UI: title bar, quick-command chips, scrollable
│   │   │                            output, live prompt, ↑↓ history, Tab autocomplete
│   │   └── terminalEngine.js     ← Command parser + repo state machine. Handles 30+ git
│   │                                subcommands. Returns { output: HTML string, repoUpdate: patch }.
│   │
│   └── visualizers/
│       └── index.jsx        ← All step-through visualizers: RebaseViz, ResetViz, StashViz,
│                               MergeConflictViz, BisectViz, StagingViz, ReflogViz, ObjectViz
│
├── pages/
│   ├── HomePage.jsx         ← Hero, live commit graph, featured commands, learning paths
│   ├── CommandsPage.jsx     ← Searchable/filterable command index with category badges
│   ├── CommandDetailPage.jsx← Full command deep-dive rendered from commands.js
│   ├── PlaygroundPage.jsx   ← Terminal tab + all simulator tabs + live graph sidebar
│   ├── pages.jsx            ← FundamentalsPage, InternalsPage, WorkflowsPage,
│   │                           RecoveryPage, ComparePage (all co-located here)
│   └── VisualizersPage.jsx  ← Gallery view of all visualizers
│
└── styles/
    └── globals.css          ← Complete design system: CSS custom properties, animations,
                                terminal color classes (.t-success, .t-error, etc.), all component styles
```

---

## The Playground — How It Works

The playground is the most complex piece. Here's the full data flow:

```
User types a command
        ↓
TerminalEmulator.jsx
  handles input, ↑↓ history, Tab autocomplete, Ctrl+C
        ↓
terminalEngine.js → parseCommand(input, repoState)
        ↓ returns { output: HTML string, repoUpdate: object | null }
        ↓
appendTerminalLine()  → writes to terminalHistory (displayed in the body)
updateRepo(repoUpdate) → patches repoState in Zustand
        ↓
CommitGraph re-renders via buildLiveGraph(repoState)
RepoStatePanel re-renders from repoState
```

### Repo State Shape

The full shape of `repoState` in the Zustand store:

```js
repoState = {
  branch: "main",                   // currently checked-out branch name
  branches: ["main", "feature/auth", "hotfix/login"],
  commits: [
    {
      h: "a1b2c3d",                 // short SHA (7 chars)
      msg: "Initial commit",        // commit message
      time: "4 days ago",           // human-readable time
      branch: "main",               // which branch this was committed on
      parentHash: null,             // null for root commit
                                    // string SHA for normal commits
                                    // [sha1, sha2] array for merge commits
      merge: false,                 // true only for merge commits
    },
    // ...
  ],
  head: "d4e5f6g",                  // current HEAD SHA
  branchHeads: {                    // tip SHA per branch — used by graph + switch
    main: "d4e5f6g",
    "feature/auth": "fa12345",
    "hotfix/login": "b2c3d4e",
  },
  staged: [],                       // file names staged for commit
  unstaged: ["src/api.js"],         // modified but not yet staged
  untracked: ["src/utils/new.js"], // new files Git doesn't know about
  stash: [],                        // [{ files: string[], msg: string }]
  remotes: ["origin"],
}
```

### Live Graph — `buildLiveGraph()`

`buildLiveGraph(repoState)` in `PlaygroundPage.jsx` converts the flat `commits` array into a proper DAG:

- Each commit's `parentHash` field becomes a directed graph edge
- Merge commits (`parentHash: [sha1, sha2]`) produce two incoming edges, rendering the merge topology
- Branch tip labels come from `branchHeads` in the store
- The result `{ nodes, edges, head, branches }` is passed as `customGraph` to `<CommitGraph animated={false} />`

When you run `git switch -c feat/x`, commit a few times, then `git merge feat/x`, the graph correctly shows the fork point, parallel lanes, and merge node.

### Terminal Engine — Adding New Commands

`terminalEngine.js` exports one function: `parseCommand(input, repo)`.

To add a new git subcommand, drop an `if`-block inside `parseCommand`:

```js
if (sub === "your-command") {
  const flag = parts.includes("--some-flag");
  const target = args[0]; // first non-flag argument

  const hash = makeHash(); // generates a realistic short SHA

  return {
    output: [
      t.success("Command succeeded"),
      t.dim("Some secondary detail"),
    ].join("\n"),

    // Return null if the command doesn't modify repo state.
    // Otherwise return a partial patch — only include fields you want to change.
    repoUpdate: {
      commits: [
        ...repo.commits,
        {
          h: hash,
          msg: "Your commit message",
          time: "just now",
          branch: repo.branch,
          parentHash: repo.head,
        },
      ],
      head: hash,
      branchHeads: { ...(repo.branchHeads || {}), [repo.branch]: hash },
    },
  };
}
```

**Terminal color helpers.** Each wraps its string in a `<span class="t-*">`. Always pass plain strings — never nest these inside each other, or the inner HTML gets escaped:

```js
t.success("text")   // green  — success messages
t.error("text")     // red    — errors and fatal messages
t.warn("text")      // amber  — warnings
t.info("text")      // indigo — informational lines
t.dim("text")       // muted  — hints, secondary text
t.hash("abc1234")   // amber  — commit SHAs
t.branch("main")    // cyan   — branch names
t.added("+line")    // green  — diff additions
t.removed("-line")  // red    — diff removals
t.path("src/file")  // purple — file paths
```

> **Don't do this:** `t.warn(\`Use ${t.success("git switch")}\`)` — the inner `t.success()` returns HTML, then `t.warn()` calls `esc()` on it, which turns `<` into `&lt;`. Write raw HTML instead: `` `Use <span class="t-success">git switch</span>` ``

---

## The Command Database

`src/data/commands.js` is a plain JS object where each key is a command ID. Every command has these 16 attributes:

```js
{
  id: "rebase",
  name: "git rebase",
  emoji: "🔄",
  category: "advanced",        // daily | advanced | legacy | recovery
  difficulty: "advanced",      // beginner | intermediate | advanced
  danger: "high",              // safe | medium | high | critical
  deprecated: false,
  tags: ["history", "rewrite"],
  short: "One-liner shown in the command index card",
  purpose: "Full multi-paragraph explanation at the top of the detail page",
  syntax: [
    { cmd: "git rebase main", desc: "Replay current branch commits onto main" },
    { cmd: "git rebase -i HEAD~3", desc: "Interactively rewrite the last 3 commits" },
  ],
  examples: [
    { title: "Clean up before PR", code: "git rebase -i HEAD~3\n# squash, reword, drop" },
  ],
  when_to_use: ["Before opening a PR to clean up messy commit history"],
  when_not_to_use: ["Never on branches other people are using"],
  mistakes: ["Rebasing after pushing without --force-with-lease"],
  safer_alternatives: [
    { cmd: "git merge", reason: "Preserves topology, safer on shared branches" },
  ],
  related: ["merge", "cherry-pick", "reset"],
  internals: "Explanation of what Git does under the hood",
  visualization: "rebase",     // key matching a VIZ_MAP entry in CommandDetailPage
  danger_level: "high",
  recovery: "How to recover if you mess this up",
  team_workflow: "How teams should agree to use this command",
}
```

Dropping a new entry into the object is all you need. It automatically appears in:
- The command index (`/commands`) with search and category filter
- Its own detail page (`/commands/:id`)
- Related links on other command pages

---

## The Commit Graph Engine

`src/data/graphs.js` has two roles:

**1. Pre-built named scenarios** — used by the home page, visualizers, and `CommitGraph` when you pass `scenario="..."`:

| Scenario key | What it shows |
|---|---|
| `feature_branch` | Classic fork from main, commits on feature branch, merge back |
| `rebase_before` | Feature branch diverged from an older commit on main |
| `rebase_after` | Same history after rebase — commits replayed, new SHAs, linear |
| `reset_demo` | Three commits on main — used by the Reset visualizer |
| `gitflow` | Full GitFlow: main, develop, feature, release, hotfix lanes |
| `cherry_pick` | A commit copied from one branch to another with `C` indicator |

**2. Layout utilities** — used by `CommitGraph.jsx` to convert a graph definition into SVG coordinates:

```js
layoutGraph(nodes, edges)
// → Kahn's topological sort assigns X position (commit age)
// → Branch name → lane number assigns Y position
// → Returns nodes with { x, y } added

buildEdgePath(from, to)
// → Straight line if same Y lane
// → Cubic bezier curve if crossing lanes

getGraphBounds(nodes)
// → { width, height } for SVG viewBox

getBranchColor(branchName)
// → Deterministic color per branch name
// → Known branches (main, feature/auth, etc.) have fixed colors
// → Unknown branches get a consistent color from a palette via hash
```

`CommitGraph.jsx` accepts either:

```jsx
// Static pre-built scenario:
<CommitGraph scenario="feature_branch" animated showLabels showHead />

// Dynamic live graph from terminal state:
<CommitGraph customGraph={buildLiveGraph(repoState)} animated={false} showLabels showHead />
```

The hover tooltip (`CommitTooltip`) is an SVG-native component rendered **after** all nodes in document order so it always paints on top. It auto-flips left when near the right edge of the viewBox, and down when the node is near the top.

---

## Design System

All theming lives in `src/styles/globals.css` as CSS custom properties. Light mode toggles a `.light` class on `<html>`.

```css
/* Background layers */
--bg          /* page background */
--surface     /* slightly elevated */
--card        /* card background */
--card-deep   /* terminal title bar, deepest layer */

/* Text */
--text        /* primary */
--muted       /* secondary */
--dim         /* tertiary / placeholders */

/* Brand colors */
--accent      /* indigo  #6366f1 */
--cyan        /* cyan    #22d3ee */
--emerald     /* green   #10b981 */
--amber       /* amber   #f59e0b */
--rose        /* red     #f43f5e */
--purple      /* purple  #a855f7 */

/* Dim variants for backgrounds */
--accent-dim, --cyan-dim, --emerald-dim, --amber-dim
```

**Component classes** you should use in JSX instead of reaching for inline styles:

```css
.gitverse-card              /* standard card */
.gitverse-card-interactive  /* card with hover lift + cursor pointer */
.btn                        /* ghost button */
.btn-primary                /* filled accent button */
.btn-danger                 /* red destructive button */
.badge-beginner / .badge-intermediate / .badge-advanced
.badge-safe / .badge-medium / .badge-high
.terminal-root              /* wraps the whole terminal component */
.terminal-body              /* always-dark output area regardless of theme */
.t-success / .t-error / .t-warn / .t-info / .t-dim
.t-hash / .t-branch / .t-added / .t-removed / .t-path
.animate-fade-up            /* page entrance animation */
.animate-fade-in            /* element fade-in */
.font-heading               /* Outfit font, used for titles and numbers */
.gradient-brand             /* indigo → cyan text gradient */
```

---

## What It Has

- ✅ Sandboxed terminal that parses 30+ git subcommands with realistic output
- ✅ Live commit graph that reflects your terminal commands in real time
- ✅ Proper DAG graph topology — branch creation, merges, and cherry-picks render correctly
- ✅ `git merge <branch>` creates a real two-parent merge commit in the graph
- ✅ `git switch` and `git checkout` update HEAD to the correct branch tip
- ✅ Hover tooltips on commit nodes: SHA, message, branch, author, timestamp
- ✅ Click-to-inspect detail bar below the graph
- ✅ Syntax highlighting in the terminal input (quoted strings stay intact, flags, SHAs, paths each get their own color)
- ✅ Command history (↑↓ arrows), Tab autocomplete, Ctrl+C cancel
- ✅ Quick-action chips for the most common read-only commands
- ✅ Repository state panel (branch, staged, unstaged, stash) that updates live
- ✅ Step-through visualizers: Rebase, Reset, Stash, Merge Conflict, Bisect
- ✅ 15+ command deep-dives with syntax table, examples, internals, pitfalls, and recovery
- ✅ Git fundamentals: three states, three trees, HEAD, refs, config
- ✅ Git internals: blobs, trees, commits, refs, packfiles, hooks, the index
- ✅ Disaster recovery guides for the most common catastrophes
- ✅ Workflow guides: GitFlow, trunk-based dev, Conventional Commits
- ✅ Side-by-side command comparisons with clear verdict
- ✅ Dark/light mode with persistent preference via Zustand `persist`
- ✅ Fully static — deploys to GitHub Pages, zero backend required
- ✅ Code-split bundle (vendor, store, icons separated via Vite `manualChunks`)

---

## What It Doesn't Have

Honest list. Some of these are intentional, some are just not built yet:

- ❌ **Real git execution** — The terminal is a simulator. `git push` doesn't push anywhere. This is intentional. Nobody wants a learning app touching real repos.
- ❌ **User accounts / progress tracking** — No backend, no auth. Nothing to sync, nothing to lose.
- ❌ **Mobile layout** — The terminal and graph panels need horizontal space. A commit graph on a phone is just a blob. It's not designed for small screens and pretending otherwise would be dishonest.
- ❌ **Per-branch commit history in the terminal** — Switching branches doesn't restore a separate commit list. The terminal state is a single shared timeline. Real Git tracks this with separate ref pointers; the simulator simplifies it. This is the biggest known fidelity gap.
- ❌ **Git LFS, submodules, worktrees** — Useful features, genuinely painful to explain interactively. Out of scope for now.
- ❌ **Collaborative / real-time sessions** — A shared playground where you and a colleague type commands and watch the same graph update would be genuinely cool. It also requires a backend. See constraint one.
- ❌ **Tests** — Vitest is not configured. The project is a learning tool, not production infrastructure. PRs adding a test suite for `terminalEngine.js` will be welcomed with open arms.
- ❌ **TypeScript** — Plain JavaScript. JSDoc comments on the data shapes are the current compromise.

---

## Future Scope

Ordered by impact, not by how fun they'd be to build:

### High impact
- **Per-branch commit history** — The biggest correctness gap. When you `git switch feature/auth`, HEAD should restore to that branch's actual commits. Needs a `commitsByBranch` map alongside the flat `commits` array.
- **`git bisect` terminal integration** — The visualizer exists and is good. The terminal `git bisect` handler just prints text. Connecting the two so a `git bisect start` in the terminal drives the step-through would close the loop nicely.
- **Fully dynamic `git log` output** — Currently `git log --oneline` is mostly derived from `repoState.commits`, but some output still has hardcoded references. It should be 100% derived from live state.
- **More command coverage** — `git worktree`, `git sparse-checkout`, `git notes`, `git bundle`, `git archive`. Legitimate daily-use commands that are almost entirely underdocumented.

### Medium impact
- **Animated graph transitions** — When a new commit appears in the live graph, animate the new node instead of a hard re-render. Smooth branch appearance on `git switch -c` would be particularly satisfying.
- **Keyboard navigation for visualizers** — Arrow keys should step through animations. The buttons work but they shouldn't be the only way.
- **Configurable initial repo state** — Let users pick a starting scenario: clean repo, mid-conflict, mid-rebase, stashed changes. The sandboxed terminal always resets to the same seed.
- **Export terminal session** — As a `.sh` script or an annotated `.md` walkthrough. Genuinely useful for teaching workshops.
- **Search inside terminal output** — Ctrl+F equivalent for the terminal body. Useful when `git log` is long.

### Nice to have
- **TypeScript migration** — Would catch the class of bug where you set `branch: "main"` in one handler and forget it in another. The data shapes are complex enough to warrant it.
- **Test suite** — `terminalEngine.js` has enough edge cases that unit tests would pay for themselves. `parseCommand("git reset --hard HEAD~3", repo)` should be verifiable.
- **Theme customization** — More color palettes beyond dark/light (Monokai, Catppuccin, Solarized).
- **Shareable playground URLs** — Encode repo state in the URL hash so you can share a specific terminal session.
- **PWA** — Service worker for offline use. The app is already fully static, this would be straightforward.

---

## Adding a New Visualizer

1. Write a new component in `src/components/visualizers/index.jsx`:

```jsx
const MY_STEPS = [
  { cmd: null,             desc: "Starting state",    /* ...state */ },
  { cmd: "git something",  desc: "After the command",  /* ...state */ },
];

export function MyNewViz() {
  const [step, setStep] = useState(0);
  const s = MY_STEPS[step];

  return (
    <div className="gitverse-card" style={{ padding: 20 }}>
      <StepControls
        step={step} maxStep={MY_STEPS.length - 1}
        onPrev={() => setStep(s => s - 1)}
        onNext={() => setStep(s => s + 1)}
        onReset={() => setStep(0)}
        label={`Step ${step + 1} / ${MY_STEPS.length}`}
      />
      {/* Render s.whatever here */}
    </div>
  );
}
```

2. Add it to `PlaygroundPage.jsx`:

```jsx
import { ..., MyNewViz } from "@/components/visualizers/index.jsx";

// In TABS:
{ id: "mynew", label: "My Viz", icon: <SomeIcon size={13} /> }

// In TAB_DESCRIPTIONS:
mynew: "One-sentence description of what this visualizer shows."

// In the render:
{playgroundTab === "mynew" && <div className="animate-fade-in"><MyNewViz /></div>}
```

---

## Deploy to GitHub Pages

```bash
# 1. Set your repo name in vite.config.js:
base: "/your-repo-name/",

# 2. Make sure gh-pages is installed:
npm install --save-dev gh-pages

# 3. Ship it:
npm run deploy
```

The `deploy` script runs `npm run build && gh-pages -d dist`. The `gh-pages` package pushes the built `dist/` to the `gh-pages` branch. GitHub Pages serves from there automatically.

---

## Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Routing | Hash-based via React Router | GitHub Pages doesn't support SPA fallback — hash mode works on any static host |
| State | Zustand | Dead simple API, no Provider wrapper, built-in `persist` middleware for theme/sidebar |
| Styling | Tailwind + CSS custom properties | Tailwind handles layout utilities; CSS vars handle the design system and theming |
| Animations | Pure CSS keyframes | Zero dependency cost, full control, no runtime overhead |
| Commit graph | Hand-rolled SVG | No React Flow or D3 graph dep needed; custom layout gives exact control over lane assignment |
| Terminal output | `dangerouslySetInnerHTML` | Color spans are pre-built HTML strings from the engine — safe and intentional, not lazy |
| Content | Plain JS data objects | No CMS, no markdown parsing at runtime, fully searchable and importable anywhere |
| Bundle splitting | Vite `manualChunks` | vendor / store / icons in separate chunks — terminal tab doesn't pull in the icon library on first paint |

---

## Contributing

The bar is low. Open a PR.

**Will be merged fast:**
- New command entries in `commands.js` — just match the existing shape
- Bug fixes in `terminalEngine.js` — there are edge cases lurking everywhere
- New step-through content in existing visualizers
- Documentation fixes, including this README

**Needs discussion first:**
- Changes to the `repoState` shape in `useAppStore.js` — the terminal engine, graph builder, and state panel all depend on it simultaneously
- New top-level routes — routing, navigation, and sidebar all need updating together
- Design system changes — CSS custom properties are used across hundreds of rules; renames cascade

---

## License

MIT. Use it, fork it, learn from it, deploy it, put it in your portfolio.

Just don't rip out the commit graph and call it your own Git explainer. That would be rude, and we'd know.
