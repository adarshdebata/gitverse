# GitVerse — The Definitive Visual Git Learning Platform

> Every command animated. Every concept interactive. Built for engineers who want to understand Git deeply — not just use it.

## ✨ Features

- **15+ Command Deep-Dives** — Full 16-point documentation per command: purpose, syntax, examples, animations, before/after state, internals, pitfalls, and recovery
- **8 Interactive Visualizers** — Staging area, Rebase, Reset, Stash, Merge conflict, Reflog, Bisect, Git Object Model
- **Live Terminal Simulator** — Type real git commands with realistic output and persistent repository state
- **Animated Commit Graphs** — SVG-based, clickable, with branch labels and HEAD pointer
- **Dark/Light Mode** — Persistent theme preference
- **Static Deploy** — GitHub Pages compatible, no backend required

## 🛠️ Tech Stack

| Technology       | Purpose                           |
| ---------------- | --------------------------------- |
| React 18         | UI framework                      |
| Vite             | Build tool                        |
| Zustand          | State management                  |
| React Router v6  | Hash-based routing (GitHub Pages) |
| Tailwind CSS     | Utility-first styling             |
| D3.js            | Data viz utilities                |
| IBM Plex Mono    | Terminal/code typography          |
| Outfit + Manrope | UI typography                     |

## 🚀 Getting Started

```bash
# Clone and install
git clone https://github.com/yourusername/gitverse.git
cd gitverse
npm install

# Start dev server
npm run dev
# → http://localhost:5173/gitverse/

# Production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Architecture

```
src/
├── data/
│   ├── commands.js          # Complete command database (15+ commands, 16 attrs each)
│   └── graphs.js            # Commit graph scenarios + layout algorithm
├── store/
│   └── useAppStore.js       # Zustand global state + terminal repo state
├── components/
│   ├── layout/
│   │   ├── Layout.jsx       # App shell: sidebar + top bar + content
│   │   └── Sidebar.jsx      # Navigation with collapse support
│   ├── ui/
│   │   └── index.jsx        # Badge, Alert, CodeBlock, Tabs, SearchBox, etc.
│   ├── graphs/
│   │   └── CommitGraph.jsx  # SVG commit graph engine with animations
│   ├── terminal/
│   │   ├── TerminalEmulator.jsx  # Interactive terminal UI
│   │   └── terminalEngine.js     # Git command parser + repo state machine
│   └── visualizers/
│       └── index.jsx        # All 8 interactive visualizers
├── pages/
│   ├── HomePage.jsx         # Landing page with hero + featured content
│   ├── CommandsPage.jsx     # Searchable command index
│   ├── CommandDetailPage.jsx # Full 16-point command deep-dive
│   ├── FundamentalsPage.jsx # Git basics: HEAD, three states, config
│   ├── InternalsPage.jsx    # Object model, refs, index, packfiles, hooks
│   ├── PlaygroundPage.jsx   # Terminal + all simulators
│   ├── VisualizersPage.jsx  # Gallery of all visualizers
│   ├── WorkflowsPage.jsx    # GitFlow, trunk-based, commits, merge strategies
│   ├── RecoveryPage.jsx     # Disaster recovery step-by-step guides
│   └── ComparePage.jsx      # Side-by-side command comparisons
└── styles/
    └── globals.css          # Design system: CSS vars, animations, component classes
```

## 🎨 Design System

CSS custom properties control the entire color system in `src/styles/globals.css`:

```css
--bg, --surface, --card        /* backgrounds */
--border, --border-b           /* borders */
--accent, --cyan, --emerald    /* brand colors */
--amber, --rose, --purple      /* semantic colors */
--text, --muted, --dim         /* typography */
```

## 📖 Adding New Commands

1. Add entry to `src/data/commands.js`:

```js
export const COMMANDS = {
  yourCommand: {
    id: "yourCommand",
    name: "git your-command",
    emoji: "🔧",
    category: "daily", // daily | advanced | legacy | recovery
    difficulty: "intermediate", // beginner | intermediate | advanced
    danger: "medium", // safe | medium | high
    deprecated: false,
    tags: ["tag1", "tag2"],
    short: "One-line description",
    purpose: "Full explanation...",
    syntax: [{ cmd: "git your-command", desc: "What it does" }],
    examples: [{ title: "Example", code: "git your-command..." }],
    when_to_use: ["Scenario 1", "Scenario 2"],
    when_not_to_use: ["Anti-pattern 1"],
    mistakes: ["Common mistake"],
    safer_alternatives: [{ cmd: "safer cmd", reason: "why" }],
    related: ["add", "commit"],
    internals: "How Git implements this internally...",
    visualization: "staging", // key from VIZ_MAP in CommandDetailPage
    danger_level: "medium",
    recovery: "How to undo this...",
    team_workflow: "How teams use this...",
  },
};
```

2. The command automatically appears in the index, search, and routing.

## 🌐 Deploy to GitHub Pages

```bash
# Update vite.config.js base to your repo name:
# base: '/your-repo-name/'

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

## 🏗️ Architecture Decisions

| Decision             | Choice                  | Reason                                            |
| -------------------- | ----------------------- | ------------------------------------------------- |
| Routing              | HashRouter              | GitHub Pages static hosting compatibility         |
| State management     | Zustand                 | Simple, no boilerplate, persistent via middleware |
| Styling              | Tailwind + CSS vars     | Utility classes + design system flexibility       |
| Animations           | Pure CSS keyframes      | No Framer Motion dependency, full control         |
| Commit graphs        | Custom SVG              | No React Flow needed, full animation control      |
| Content architecture | JavaScript data objects | Type-safe, searchable, importable everywhere      |

## 🎯 Target Audience

- Senior software engineers
- DevOps / platform engineers
- Backend developers working in team environments
- Advanced students learning production-grade Git workflows

## 📄 License

MIT — Free to use, modify, and deploy.
