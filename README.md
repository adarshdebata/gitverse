# GitVerse

> Learn Git visually — with a live sandbox, animated graphs, and deep-dives that actually make sense.

GitVerse is a fully interactive, browser-based Git learning platform. No account required. No backend. Just open it and start learning.

**[Live Demo →](https://adarshdebata.github.io/gitverse/)**

---

## What You Get

GitVerse has eight distinct learning modules. Here's what each one gives you:

---

### 1. Interactive Playground

The centerpiece. A sandboxed Git terminal in your browser where you can experiment freely — nothing is real, nothing can break.

**What you can do:**
- Type actual Git commands (`git commit`, `git merge`, `git rebase`, `git stash`, etc.)
- Watch a **live commit graph update in real time** as you type commands
- See your **repository state** — current branch, staged files, unstaged files, and stash — update live alongside the terminal
- Navigate command history with `↑ ↓` arrow keys
- Autocomplete commands with `Tab`
- Use quick-action chips for the most common read-only commands without typing

**30+ supported commands** including: `git init`, `git add`, `git commit`, `git branch`, `git switch`, `git checkout`, `git merge`, `git rebase`, `git cherry-pick`, `git reset`, `git revert`, `git stash`, `git log`, `git status`, `git diff`, `git reflog`, `git tag`, `git remote`, `git fetch`, `git pull`, `git push`, and more.

The terminal output uses color-coded output just like a real terminal — green for success, red for errors, amber for warnings, cyan for branch names.

![GitVerse Playground Terminal](./src/assets/screenshots/playground-terminal.png)

---

### 2. Live Commit Graph

Every command you type in the Playground is reflected instantly in a real DAG (Directed Acyclic Graph) commit graph.

**What you see:**
- Every commit as a node, color-coded by branch
- Merge commits correctly rendered with **two parent edges** — the merge topology is real
- Branch labels attached to their tip commits
- A `HEAD` pointer that moves as you switch branches or commit
- Hover over any commit node to see its **SHA, message, branch, author, and timestamp**
- Click a commit to inspect it in a detail bar below the graph

The graph handles the full topology: create a branch, commit a few times, switch back to `main`, commit, then `git merge feature/x` — the fork point, parallel lanes, and merge node all appear correctly.

![Live Commit Graph Light](./src/assets/screenshots/live-commit-graph-light.png)

---

### 3. Step-Through Visualizers

Five animated, step-by-step visualizers that walk you through the most misunderstood Git operations. Each visualizer lets you step forward and backward through each stage at your own pace.

| Visualizer | What it shows |
|---|---|
| **Rebase** | Commits detach from the base, replay one-by-one on the new base, and receive new SHAs |
| **Reset** | All three reset modes (`--soft`, `--mixed`, `--hard`) and exactly what each does to HEAD, the Index, and the Working Tree |
| **Stash** | The full stash workflow — save work, switch branches, apply a hotfix, restore your stash |
| **Merge Conflict** | A conflict from start to resolution — including the conflict markers in the file, resolving it, and completing the merge |
| **Bisect** | Binary search through commits to find the exact commit that introduced a bug |

Each step shows the relevant `git` command alongside the visual state change.

![Step-through visualizer](./src/assets/screenshots/visualiser.png)

---

### 4. Command Deep-Dives

A searchable, filterable library of **15+ Git commands** — each explained with far more depth than a man page.

**Every command page gives you:**
- A plain-English explanation of what the command does and *why* it exists
- A full **syntax table** with every common flag and what it does
- **Real-world examples** with code blocks, not toy examples
- **When to use it** — the scenarios where this command is the right tool
- **When NOT to use it** — the common mistakes and safer alternatives
- **What Git does under the hood** — the internals, not just the interface
- **Pitfalls and recovery** — what to do when it goes wrong
- **Danger level** — `safe`, `medium`, `high`, or `critical` at a glance
- A linked visualizer when one exists

Commands covered: `rebase`, `reset`, `reflog`, `cherry-pick`, `stash`, `bisect`, `merge`, `commit`, `branch`, `checkout`, `switch`, `restore`, `tag`, `remote`, `fetch`, `pull`, `push`, and more.

You can filter commands by **category** (daily, advanced, legacy, recovery) and **difficulty** (beginner, intermediate, advanced), and search by name or tag.

![Command library — browse and filter all 15+ commands](./src/assets/screenshots/Cmd-page-1.png)

![Command detail — in-depth explanation for each command](./src/assets/screenshots/Cmd-page-2.png)

![Syntax reference — all flags, options, and examples](./src/assets/screenshots/Cmd-page-3.png)


---

### 5. Git Fundamentals

The mental models behind Git — the ones most tutorials skip over and then wonder why beginners are confused.

**What's covered:**
- **What version control actually is** — centralized (SVN) vs. distributed (Git) with a side-by-side comparison
- **The Three States** — Modified, Staged, Committed — and what they physically mean on disk
- **The Three Trees** — Working Tree, Index (staging area), Repository — and how every Git command moves data between them
- **What HEAD really is** — attached vs. detached HEAD, what it points to, and why it matters
- **Refs and references** — branches, tags, `ORIG_HEAD`, `MERGE_HEAD`, and how they're all just files in `.git/`
- **Git config** — local, global, and system scope, and which one wins when they conflict
- **How Git's object model works** — why commits are immutable and why that's a feature, not a bug

Each section is expandable, and code examples show the actual Git commands alongside the concept.

![fundamentals](./src/assets/screenshots/fundamentals.png)

---

### 6. Git Internals

What happens inside `.git/` when you run a command. This section goes one layer deeper than fundamentals.

**What's covered:**

| Topic | What you learn |
|---|---|
| **Blob objects** | How Git stores file content — not diffs, but full snapshots hashed with SHA-1 |
| **Tree objects** | How blobs are assembled into directory snapshots |
| **Commit objects** | What a commit actually contains: tree pointer, parent pointer(s), author, committer, message |
| **Refs** | How branches and tags are just 41-byte text files in `.git/refs/` |
| **Packfiles** | How Git compresses many loose objects into a single `.pack` file for efficiency |
| **Hooks** | The pre-commit, commit-msg, pre-push, and other lifecycle hooks — and how to use them |
| **The Index** | What `.git/index` is and why it exists as a separate layer between working tree and commits |

![internals](./src/assets/screenshots/internals.png)

---

### 7. Disaster Recovery

The page you bookmark for when things go wrong. Step-by-step recovery guides for the most common Git catastrophes, written for the moment of panic — not as an academic exercise.

**Scenarios covered:**
- You ran `git reset --hard` and lost uncommitted changes
- You deleted a branch that wasn't merged
- You pushed to `main` by accident
- You committed a secret / API key and pushed it
- You ran `git clean -fd` and deleted untracked files
- Your rebase went wrong mid-way
- You got into a detached HEAD state and don't know how to get out
- Your merge conflict markers are everywhere and you don't know where to start

Each scenario gives you: what happened, whether it's recoverable, and the exact commands to fix it.

![recovery](./src/assets/screenshots/recovery.png)

---

### 8. Command Comparisons

Side-by-side comparisons of the commands developers confuse most — with a clear verdict on when to use each one.

| Comparison | The core question answered |
|---|---|
| **merge vs rebase** | When does history matter, and when is a clean line worth the rewrite? |
| **reset vs revert** | Should you undo or create an undo record? (Hint: on shared branches, always revert) |
| **switch vs checkout** | Why does `git switch` exist, and should you stop using `git checkout`? |
| **fetch vs pull** | Why `git fetch` first is almost always safer |
| **stash vs branch** | When context-switching, which should you reach for? |

Each comparison shows the behavior visually and states a clear recommended default.

![comparisons](./src/assets/screenshots/comparisons.png)

---

### 9. Workflow Guides

Reference guides for how teams work with Git in practice.

**Covered workflows:**
- **GitFlow** — the full branching model: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`
- **Trunk-Based Development** — continuous integration with short-lived branches
- **Monorepo strategies** — working with large repositories and tooling considerations
- **Conventional Commits** — structured commit messages (`feat:`, `fix:`, `chore:`) and why teams adopt them
- **Merge strategies** — merge commit vs. squash merge vs. rebase merge — what each preserves and destroys

---

### 10. Dark / Light Mode

Full dark and light theme support, with your preference saved across sessions. Toggle in the top bar — no account or login needed.

---

## Getting Started

```bash
git clone https://github.com/adarsh-debata/gitverse.git
cd gitverse
npm install
npm run dev
```

Open `http://localhost:5173/gitverse/` in your browser. That's it.

No `.env` file. No database. No API keys. Zero config.

```bash
npm run build      # production build → dist/
npm run preview    # preview production build locally
npm run deploy     # build + push to GitHub Pages
```

---

## Tech at a Glance

Built with **React 18 + Vite**, client-side only. State managed by **Zustand** (with persistence for theme). Routing via **React Router v7** in hash mode for GitHub Pages compatibility. Styling via **Tailwind CSS** + CSS custom properties for theming. The commit graph is rendered with custom SVG, using D3.js for layout calculations and path generation.

Fully static. Deploys anywhere that serves HTML.

---

## What It Doesn't Do

Honest list:

- **No real Git execution** — the terminal is a simulator. `git push` doesn't push anywhere. This is intentional.
- **No user accounts or progress tracking** — nothing is saved server-side because there is no server.
- **No mobile layout** — a commit graph on a 375px screen is not useful. Desktop only.

---

## License

MIT. Use it, fork it, learn from it, deploy it.
