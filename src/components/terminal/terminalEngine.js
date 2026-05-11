/**
 * GitVerse Terminal Engine
 * Parses git commands and returns realistic terminal output
 * while maintaining mock repository state.
 */

/** Escape HTML entities */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap text in a terminal color span */
const t = {
  success: (s) => `<span class="t-success">${esc(s)}</span>`,
  error: (s) => `<span class="t-error">${esc(s)}</span>`,
  warn: (s) => `<span class="t-warn">${esc(s)}</span>`,
  info: (s) => `<span class="t-info">${esc(s)}</span>`,
  dim: (s) => `<span class="t-dim">${esc(s)}</span>`,
  hash: (s) => `<span class="t-hash">${esc(s)}</span>`,
  branch: (s) => `<span class="t-branch">${esc(s)}</span>`,
  added: (s) => `<span class="t-added">${esc(s)}</span>`,
  removed: (s) => `<span class="t-removed">${esc(s)}</span>`,
  path: (s) => `<span class="t-path">${esc(s)}</span>`,
  bold: (s) => `<strong>${esc(s)}</strong>`,
};

/** Generate a realistic-looking short SHA */
function makeHash() {
  return Math.random().toString(16).slice(2, 9);
}

/**
 * Main command parser
 * @param {string}   input     - raw command string from user
 * @param {object}   repo      - current repo state
 * @returns {{ output: string, repoUpdate: object|null }}
 */
export function parseCommand(input, repo) {
  const raw = input.trim();
  const parts = raw.split(/\s+/);
  const cmd = parts[0];
  const sub = parts[1];
  const args = parts.slice(2);

  // ── Non-git commands ──────────────────────────────────────
  if (raw === "clear") {
    return { output: "CLEAR", repoUpdate: null };
  }

  if (raw === "help" || raw === "git help") {
    const sec = (t) => `<div class="t-help-sec">${esc(t)}</div>`;
    const row = (cmd, desc) =>
      `<div class="t-help-row"><span>${esc(cmd)}</span><span>${esc(desc)}</span></div>`;

    return {
      output: `<div class="t-help">
<div class="t-help-header">── GitVerse Terminal · available commands ──</div>
${sec("STATUS & INFO")}
${row("git status",                "show working tree status")}
${row("git log --oneline",         "compact commit log")}
${row("git log --graph",           "ASCII branch graph")}
${row("git log --stat",            "log with file change stats")}
${row("git diff",                  "unstaged changes")}
${row("git diff --staged",         "staged changes")}
${row("git branch",                "list all branches")}
${row("git reflog",                "HEAD movement history")}
${row("git show",                  "show latest commit details")}
${sec("STAGING & COMMITS")}
${row("git add .",                 "stage all changes")}
${row("git add -p",                "stage by hunk (interactive)")}
${row('git commit -m "msg"',       "create a new commit")}
${row("git commit --amend",        "amend last commit")}
${row("git commit --allow-empty",  "create empty commit")}
${sec("BRANCHES")}
${row("git switch <branch>",       "switch to existing branch")}
${row("git switch -c <name>",      "create & switch to new branch")}
${row("git branch -d <name>",      "delete a branch")}
${row("git checkout -b <name>",    "legacy: create & switch")}
${sec("UNDO")}
${row("git reset --soft HEAD~1",   "undo commit, keep staged")}
${row("git reset --mixed HEAD~1",  "undo commit, keep unstaged")}
${row("git reset --hard HEAD~1",   "undo + discard all changes")}
${row("git revert HEAD",           "safe undo (adds new commit)")}
${row("git restore <file>",        "discard working tree change")}
${row("git restore --staged <f>",  "unstage a file")}
${sec("REMOTE")}
${row("git fetch",                 "fetch from origin")}
${row("git pull --rebase",         "pull with rebase (recommended)")}
${row("git push",                  "push to origin")}
${row("git push --force-with-lease","safe force-push")}
${row("git remote -v",             "show remotes")}
${sec("HISTORY & INSPECTION")}
${row("git blame <file>",          "line-by-line author history")}
${row("git cat-file -p HEAD",      "inspect raw git object")}
${row("git ls-files --stage",      "show staging index")}
${row("git tag <name>",            "create a tag at HEAD")}
${row("git config --list",         "show all config settings")}
${sec("STASH & ADVANCED")}
${row("git stash",                 "stash current changes")}
${row("git stash pop",             "apply and drop top stash")}
${row("git stash list",            "list all stash entries")}
${row("git cherry-pick <sha>",     "apply a specific commit")}
${row("git rebase -i HEAD~3",      "interactive rebase")}
${row("git bisect start",          "start binary bug hunt")}
${row("git gc",                    "run garbage collection")}
${row("git fsck",                  "check object connectivity")}
${row("clear",                     "clear terminal output")}
<div class="t-help-footer">↑↓ history · Tab autocomplete · Ctrl+C cancel</div>
</div>`,
      repoUpdate: null,
    };
  }

  if (raw === "ls" || raw === "ls -la") {
    return {
      output: [
        t.dim("total 48"),
        `${t.dim("drwxr-xr-x")} ${t.path("src/")}`,
        `${t.dim("drwxr-xr-x")} ${t.path("tests/")}`,
        `${t.dim("-rw-r--r--")} ${t.added("package.json")}`,
        `${t.dim("-rw-r--r--")} README.md`,
        `${t.dim("-rw-r--r--")} ${t.warn(".env")} ${t.dim("(should be in .gitignore!)")}`,
      ].join("\n"),
      repoUpdate: null,
    };
  }

  if (raw === "pwd") {
    return { output: t.path("/home/dev/project"), repoUpdate: null };
  }

  if (cmd !== "git") {
    return {
      output: t.error(`command not found: ${esc(cmd)}\ntype 'help' for available git commands`),
      repoUpdate: null,
    };
  }

  // ── git commands ──────────────────────────────────────────

  // git status
  if (sub === "status") {
    const lines = [
      `${t.dim("On branch")} ${t.branch(repo.branch)}`,
      `${t.dim("Your branch is up to date with")} ${t.hash("origin/" + repo.branch)}`,
    ];

    if (repo.staged.length > 0) {
      lines.push(`\n${t.success("Changes to be committed:")}`);
      lines.push(t.dim('  (use "git restore --staged <file>" to unstage)'));
      repo.staged.forEach((f) => lines.push(`\t${t.added("modified:   " + f)}`));
    }

    if (repo.unstaged.length > 0) {
      lines.push(`\n${t.warn("Changes not staged for commit:")}`);
      lines.push(t.dim('  (use "git add <file>" to update what will be committed)'));
      lines.push(t.dim('  (use "git restore <file>" to discard changes in working directory)'));
      repo.unstaged.forEach((f) => lines.push(`\t${t.removed("modified:   " + f)}`));
    }

    if ((repo.untracked || []).length > 0) {
      lines.push(`\n${t.warn("Untracked files:")}`);
      lines.push(t.dim('  (use "git add <file>" to include in what will be committed)'));
      repo.untracked.forEach((f) => lines.push(`\t${t.removed(f)}`));
    }

    if (
      repo.staged.length === 0 &&
      repo.unstaged.length === 0 &&
      (repo.untracked || []).length === 0
    ) {
      lines.push(`\n${t.success("nothing to commit, working tree clean")}`);
    }

    return { output: lines.join("\n"), repoUpdate: null };
  }

  // git log
  if (sub === "log") {
    const oneline = parts.includes("--oneline");
    const graph = parts.includes("--graph");
    const stat = parts.includes("--stat");
    const commits = [...repo.commits].reverse();

    if (oneline && graph) {
      return {
        output: [
          `${t.success("*")} ${t.hash(commits[0].h)} ${t.success(`(HEAD → ${repo.branch})`)} ${commits[0].msg}`,
          `${t.success("*")} ${t.hash(commits[1]?.h || "0000000")} ${commits[1]?.msg || ""}`,
          `${t.added("|\\")}`,
          `${t.added("|")} ${t.success("*")} ${t.hash("b8c9d0e")} ${t.branch("(feature/auth)")} Auth middleware`,
          `${t.added("|/")}`,
          `${t.success("*")} ${t.hash(commits[2]?.h || "0000000")} ${commits[2]?.msg || ""}`,
          `${t.success("*")} ${t.hash(commits[3]?.h || "0000000")} ${commits[3]?.msg || ""}`,
        ].join("\n"),
        repoUpdate: null,
      };
    }

    if (oneline) {
      const lines = commits.map(
        (c, i) =>
          `${t.hash(c.h)} ${i === 0 ? t.success(`(HEAD → ${repo.branch}, origin/${repo.branch}) `) : ""}${esc(c.msg)}`
      );
      return { output: lines.join("\n"), repoUpdate: null };
    }

    if (stat) {
      const lines = commits.map((c) =>
        [
          `${t.info("commit")} ${t.hash(c.h + "f1e2d3c4b5a697868574")}`,
          `${t.dim("Author: Developer <dev@company.com>")}`,
          `${t.dim("Date:   " + c.time)}\n`,
          `    ${esc(c.msg)}\n`,
          ` ${t.added("src/api.js")}  | ${t.added("+24")} ${t.removed("-3")}`,
          t.dim(" 1 file changed, 24 insertions(+), 3 deletions(-)"),
        ].join("\n")
      );
      return { output: lines.join("\n\n"), repoUpdate: null };
    }

    // Full log
    const lines = commits.map((c) =>
      [
        `${t.info("commit")} ${t.hash(c.h + "f1e2d3c4b5a697868574")} ${
          c === commits[0] ? t.success(`(HEAD → ${repo.branch})`) : ""
        }`,
        t.dim("Author: Developer <dev@company.com>"),
        t.dim("Date:   " + c.time),
        "",
        `    ${esc(c.msg)}`,
      ].join("\n")
    );
    return { output: lines.join("\n\n"), repoUpdate: null };
  }

  // git diff
  if (sub === "diff") {
    const staged = parts.includes("--staged") || parts.includes("--cached");

    if (staged) {
      if (repo.staged.length === 0) {
        return { output: t.dim("(no staged changes)"), repoUpdate: null };
      }
      return {
        output: [
          t.info("diff --git a/src/api.js b/src/api.js"),
          t.dim("index 7f3a2b1..9c4d5e6 100644"),
          t.dim("--- a/src/api.js"),
          t.dim("+++ b/src/api.js"),
          t.dim("@@ -42,6 +42,9 @@ async function login(req, res) {"),
          t.dim(" const user = await findUser(req.body.email)"),
          t.added('+  const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" });'),
          t.added('+  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });'),
          t.added("+  return res.json({ token: accessToken });"),
          t.dim(" }"),
        ].join("\n"),
        repoUpdate: null,
      };
    }

    if (repo.unstaged.length === 0) {
      return { output: t.dim("(no unstaged changes)"), repoUpdate: null };
    }

    return {
      output: [
        t.info("diff --git a/src/api.js b/src/api.js"),
        t.dim("index 7f3a2b1..9c4d5e6 100644"),
        t.dim("--- a/src/api.js"),
        t.dim("+++ b/src/api.js"),
        t.dim('@@ -18,7 +18,10 @@ const express = require("express")'),
        t.dim(" const router = express.Router()"),
        t.removed('-const JWT_SECRET = "hardcoded-secret"  // TODO: fix this'),
        t.added("+const JWT_SECRET = process.env.JWT_SECRET"),
        t.added('+if (!JWT_SECRET) throw new Error("JWT_SECRET env var required")'),
        t.dim(" "),
        t.dim(" module.exports = router"),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // git show
  if (sub === "show" && !args[0]) {
    const last = repo.commits[repo.commits.length - 1];
    return {
      output: [
        `${t.info("commit")} ${t.hash(last.h + "f1e2d3c4b5a697868574")} ${t.success(`(HEAD → ${repo.branch})`)}`,
        t.dim("Author: Developer <dev@company.com>"),
        t.dim(`Date:   ${last.time}`),
        "",
        `    ${esc(last.msg)}`,
        "",
        t.info("diff --git a/src/api.js b/src/api.js"),
        t.dim("index 7f3a2b1..9c4d5e6 100644"),
        t.added('+  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: "7d" });'),
        t.added("+  return res.json({ token, refreshToken });"),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // git add
  if (sub === "add") {
    const target = args[0];

    if (target === "-p" || target === "--patch") {
      return {
        output: [
          t.info("diff --git a/src/api.js b/src/api.js"),
          t.dim("index 7f3a2b1..9c4d5e6 100644"),
          t.dim("@@ -42,6 +42,9 @@ async function login(req, res) {"),
          t.added('+  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: "7d" });'),
          t.added('+  res.cookie("refreshToken", refreshToken, { httpOnly: true });'),
          "",
          `${t.dim("Stage this hunk?")} [y,n,q,a,d,e,?] ${t.success("y")}`,
          t.success("hunk applied to index"),
        ].join("\n"),
        repoUpdate: {
          staged: [...repo.staged, "src/api.js (partial)"],
          unstaged: repo.unstaged.filter((f) => f !== "src/api.js"),
        },
      };
    }

    if (target === "-u") {
      const updates = repo.unstaged;
      return {
        output:
          updates.length > 0
            ? t.success(`staged ${updates.length} tracked file(s): ${updates.join(", ")}`)
            : t.warn("nothing to update"),
        repoUpdate: { staged: [...repo.staged, ...repo.unstaged], unstaged: [] },
      };
    }

    if (target === "." || target === "-A" || target === "--all") {
      const all = [...repo.unstaged, ...(repo.untracked || [])];
      if (all.length === 0) return { output: t.warn("nothing to stage"), repoUpdate: null };
      return {
        output: t.success(`staged ${all.length} file(s)`),
        repoUpdate: { staged: [...repo.staged, ...all], unstaged: [], untracked: [] },
      };
    }

    if (target === "--dry-run") {
      const all = [...repo.unstaged, ...(repo.untracked || [])];
      return {
        output:
          all.map((f) => `${t.success("add")} '${f}'`).join("\n") ||
          t.dim("nothing would be staged"),
        repoUpdate: null,
      };
    }

    if (target && repo.unstaged.includes(target)) {
      return {
        output: t.success(`staged '${esc(target)}'`),
        repoUpdate: {
          staged: [...repo.staged, target],
          unstaged: repo.unstaged.filter((f) => f !== target),
        },
      };
    }

    return {
      output: target
        ? t.error(`pathspec '${esc(target)}' did not match any files`)
        : t.error('nothing specified — use "git add ." or "git add <file>"'),
      repoUpdate: null,
    };
  }

  // git commit
  if (sub === "commit") {
    const amend = parts.includes("--amend");
    const mIdx = parts.indexOf("-m");
    const allowEmp = parts.includes("--allow-empty");
    let msg = "";

    if (mIdx !== -1) {
      // Grab everything after -m, join and strip surrounding quotes
      msg = parts
        .slice(mIdx + 1)
        .join(" ")
        .replace(/^["']|["']$/g, "");
    }

    if (amend) {
      if (repo.commits.length === 0)
        return { output: t.error("nothing to amend"), repoUpdate: null };
      const noEdit = parts.includes("--no-edit");
      const last = repo.commits[repo.commits.length - 1];
      const newMsg = noEdit ? last.msg : msg || last.msg;
      const newHash = makeHash();
      return {
        output: [
          t.warn("⚠️  Amending rewrites the last commit SHA."),
          t.warn("   Only do this BEFORE pushing to a shared branch."),
          `${t.success("[" + repo.branch + " " + newHash + "]")} ${esc(newMsg)}`,
          t.dim(" Date updated: just now"),
        ].join("\n"),
        repoUpdate: {
          commits: [...repo.commits.slice(0, -1), { h: newHash, msg: newMsg, time: "just now", branch: repo.branch }],
          staged: [],
          head: newHash,
        },
      };
    }

    if (!allowEmp && repo.staged.length === 0) {
      return {
        output: [
          t.error("nothing to commit"),
          t.dim("hint: use git add to stage files before committing"),
          t.dim("hint: use --allow-empty to create an empty commit"),
        ].join("\n"),
        repoUpdate: null,
      };
    }

    if (!msg && !allowEmp) {
      return {
        output: t.error('abort: empty commit message\nhint: git commit -m "your message"'),
        repoUpdate: null,
      };
    }

    const hash = makeHash();
    const newRepo = {
      commits: [...repo.commits, { h: hash, msg: msg || "(empty commit)", time: "just now", branch: repo.branch }],
      staged: [],
      head: hash,
    };

    return {
      output: [
        `${t.success("[" + repo.branch + " " + hash + "]")} ${esc(msg || "(empty commit)")}`,
        t.dim(` ${repo.staged.length} file(s) changed`),
        ...repo.staged.map((f) => t.added(`  create/modify: ${esc(f)}`)),
      ].join("\n"),
      repoUpdate: newRepo,
    };
  }

  // git branch
  if (sub === "branch") {
    const deleteFl = parts.includes("-d") || parts.includes("-D");
    const name = args.find((a) => !a.startsWith("-")) || null;

    if (!name && !deleteFl) {
      // List branches
      return {
        output: repo.branches
          .map((b) => (b === repo.branch ? `${t.success("* ")}${t.branch(b)}` : `  ${t.dim(b)}`))
          .join("\n"),
        repoUpdate: null,
      };
    }

    if (deleteFl && name) {
      if (name === repo.branch) {
        return {
          output: t.error(`error: cannot delete the currently checked-out branch '${esc(name)}'`),
          repoUpdate: null,
        };
      }
      if (!repo.branches.includes(name)) {
        return { output: t.error(`error: branch '${esc(name)}' not found`), repoUpdate: null };
      }
      return {
        output: t.success(`Deleted branch ${esc(name)}.`),
        repoUpdate: { branches: repo.branches.filter((b) => b !== name) },
      };
    }

    if (name) {
      if (repo.branches.includes(name)) {
        return {
          output: t.error(`fatal: A branch named '${esc(name)}' already exists.`),
          repoUpdate: null,
        };
      }
      return {
        output: t.success(`Created branch '${esc(name)}' at ${repo.head}`),
        repoUpdate: { branches: [...repo.branches, name] },
      };
    }
  }

  // git switch
  if (sub === "switch") {
    const create = parts.includes("-c") || parts.includes("-C");
    const detach = parts.includes("--detach");
    const name = args.find((a) => !a.startsWith("-"));

    if (!name) return { output: t.error("usage: git switch <branch>"), repoUpdate: null };

    if (create) {
      if (repo.branches.includes(name) && !parts.includes("-C")) {
        return {
          output: t.error(`fatal: A branch named '${esc(name)}' already exists.`),
          repoUpdate: null,
        };
      }
      const newBranches = repo.branches.includes(name) ? repo.branches : [...repo.branches, name];
      return {
        output: t.success(`Switched to a new branch '${esc(name)}'`),
        repoUpdate: { branch: name, branches: newBranches },
      };
    }

    if (name === "-") {
      return {
        output: t.success(`Switched to branch '${esc(repo.branch)}'`),
        repoUpdate: null,
      };
    }

    if (!repo.branches.includes(name)) {
      return {
        output: [
          t.error(`error: pathspec '${esc(name)}' did not match any branch`),
          t.dim(`hint: if this is a new branch, use: git switch -c ${esc(name)}`),
        ].join("\n"),
        repoUpdate: null,
      };
    }

    return {
      output: t.success(`Switched to branch '${esc(name)}'`),
      repoUpdate: { branch: name },
    };
  }

  // git checkout (legacy)
  if (sub === "checkout") {
    const createFl = parts.includes("-b");
    const name = args.find((a) => !a.startsWith("-"));

    return {
      output: [
        t.warn(`⚠️  git checkout is overloaded and confusing.`),
        t.warn(
          `   Use ${t.success("git switch")} for branches, ${t.success("git restore")} for files.`
        ),
        "",
        name && createFl
          ? t.success(`Switched to a new branch '${esc(name)}'`)
          : name && repo.branches.includes(name)
            ? t.success(`Switched to branch '${esc(name)}'`)
            : t.error(`error: pathspec '${esc(name)}' did not match`),
      ].join("\n"),
      repoUpdate: name && repo.branches.includes(name) ? { branch: name } : null,
    };
  }

  // git restore
  if (sub === "restore") {
    const staged = parts.includes("--staged");
    const file = args.find((a) => !a.startsWith("-"));

    if (staged) {
      if (!file) {
        return {
          output: t.success("Unstaged all files."),
          repoUpdate: { staged: [], unstaged: [...repo.staged, ...repo.unstaged] },
        };
      }
      if (repo.staged.includes(file)) {
        return {
          output: t.success(`Unstaged '${esc(file)}'`),
          repoUpdate: {
            staged: repo.staged.filter((f) => f !== file),
            unstaged: [...repo.unstaged, file],
          },
        };
      }
      return { output: t.warn(`'${esc(file)}' is not staged`), repoUpdate: null };
    }

    // --worktree (default)
    return {
      output: [
        t.warn(`⚠️  This PERMANENTLY discards changes to '${esc(file || ".")}'.`),
        repo.unstaged.length > 0
          ? t.success("Discarded working directory changes.")
          : t.dim("No unstaged changes to discard."),
      ].join("\n"),
      repoUpdate: file ? { unstaged: repo.unstaged.filter((f) => f !== file) } : { unstaged: [] },
    };
  }

  // git stash
  if (sub === "stash") {
    const stashSub = parts[2];

    if (!stashSub || stashSub === "push") {
      const mIdx = parts.indexOf("-m");
      const desc =
        mIdx !== -1
          ? parts
              .slice(mIdx + 1)
              .join(" ")
              .replace(/^"|"$/g, "")
          : `WIP on ${repo.branch}: ${repo.head} ${repo.commits.at(-1)?.msg || ""}`;
      const hasChanges = repo.staged.length > 0 || repo.unstaged.length > 0;

      if (!hasChanges) {
        return { output: t.warn("No local changes to save"), repoUpdate: null };
      }

      return {
        output: [
          t.success(`Saved working directory and index state`),
          t.dim(`stash@{0}: ${esc(desc)}`),
        ].join("\n"),
        repoUpdate: {
          stash: [{ files: [...repo.staged, ...repo.unstaged], msg: desc }, ...repo.stash],
          staged: [],
          unstaged: [],
        },
      };
    }

    if (stashSub === "list") {
      return {
        output:
          repo.stash.length === 0
            ? t.dim("(no stash entries)")
            : repo.stash
                .map((s, i) => `${t.hash("stash@{" + i + "}")}${t.dim(": ")}: ${esc(s.msg)}`)
                .join("\n"),
        repoUpdate: null,
      };
    }

    if (stashSub === "pop" || stashSub === "apply") {
      if (repo.stash.length === 0) {
        return { output: t.error("error: No stash entries found."), repoUpdate: null };
      }
      const [top, ...rest] = repo.stash;
      const update =
        stashSub === "pop"
          ? { stash: rest, unstaged: [...repo.unstaged, ...top.files] }
          : { stash: repo.stash, unstaged: [...repo.unstaged, ...top.files] };
      return {
        output: [
          t.success(`On branch ${repo.branch}`),
          t.warn("Changes not staged for commit:"),
          ...top.files.map((f) => `\t${t.removed("modified:   " + f)}`),
          stashSub === "pop" ? t.dim("Dropped stash@{0}") : t.dim("(stash kept)"),
        ].join("\n"),
        repoUpdate: update,
      };
    }

    if (stashSub === "drop") {
      if (repo.stash.length === 0)
        return { output: t.error("error: No stash entry"), repoUpdate: null };
      return {
        output: t.success("Dropped stash@{0}"),
        repoUpdate: { stash: repo.stash.slice(1) },
      };
    }

    if (stashSub === "clear") {
      return {
        output: t.warn("Cleared all stash entries."),
        repoUpdate: { stash: [] },
      };
    }

    if (stashSub === "show") {
      const entry = repo.stash[0];
      if (!entry) return { output: t.error("No stash entries"), repoUpdate: null };
      return {
        output: [
          entry.files.map((f) => ` ${t.added(f)} | ${t.added("changed")}`).join("\n"),
          t.dim(` ${entry.files.length} file(s) changed`),
        ].join("\n"),
        repoUpdate: null,
      };
    }
  }

  // git reset
  if (sub === "reset") {
    const mode = ["--soft", "--mixed", "--hard"].find((f) => parts.includes(f)) || "--mixed";
    const toHead = parts.some((p) => p.startsWith("HEAD~")) || parts.includes("HEAD^");

    if (args[0] && !args[0].startsWith("HEAD") && !args[0].startsWith("-")) {
      // Unstage file
      const file = args[0];
      return {
        output: t.success(`Unstaged '${esc(file)}'`),
        repoUpdate: {
          staged: repo.staged.filter((f) => f !== file),
          unstaged: [...repo.unstaged, file],
        },
      };
    }

    if (repo.commits.length < 2) {
      return { output: t.error("Already at first commit — nothing to reset to"), repoUpdate: null };
    }

    const messages = {
      "--soft": [t.success("HEAD moved back."), t.info("Changes kept in staging area.")],
      "--mixed": [t.success("HEAD moved back."), t.info("Changes unstaged.")],
      "--hard": [
        t.warn("⚠️  HEAD moved back."),
        t.error("ALL changes permanently discarded."),
        t.dim("Recovery: git reflog → find SHA → git reset --hard <sha>"),
      ],
    };

    const newCommits = repo.commits.slice(0, -1);
    const newHead = newCommits.at(-1)?.h || repo.head;
    const update = {
      commits: newCommits,
      head: newHead,
      staged: mode === "--soft" ? [...repo.staged, "(from undone commit)"] : [],
      unstaged: mode === "--hard" ? [] : repo.unstaged,
    };

    return {
      output: messages[mode].join("\n"),
      repoUpdate: update,
    };
  }

  // git revert
  if (sub === "revert") {
    const sha = args.find((a) => !a.startsWith("-")) || "HEAD";
    const hash = makeHash();
    return {
      output: [
        t.info(`Reverting commit ${sha}...`),
        t.success(`[${repo.branch} ${hash}] Revert: ${esc(repo.commits.at(-1)?.msg || sha)}`),
        t.dim(" 1 file changed, 5 insertions(+), 8 deletions(-)"),
        t.dim("History preserved — use git log to see both commits."),
      ].join("\n"),
      repoUpdate: {
        commits: [
          ...repo.commits,
          { h: hash, msg: `Revert: ${repo.commits.at(-1)?.msg || sha}`, time: "just now", branch: repo.branch },
        ],
        head: hash,
      },
    };
  }

  // git reflog
  if (sub === "reflog") {
    const entries = [
      `${t.hash(repo.head)} HEAD@{0}: ${t.success("commit: " + (repo.commits.at(-1)?.msg || "latest"))}`,
      `${t.hash(repo.commits.at(-2)?.h || "0000000")} HEAD@{1}: ${t.success("commit: " + (repo.commits.at(-2)?.msg || ""))}`,
      `${t.hash(repo.commits.at(-3)?.h || "0000000")} HEAD@{2}: ${t.info("checkout: moving from feature/auth to " + repo.branch)}`,
      `${t.hash("b8c9d0e")} HEAD@{3}: ${t.success("commit: Auth middleware")}`,
      `${t.hash(repo.commits[1]?.h || "0000000")} HEAD@{4}: ${t.success("commit: " + (repo.commits[1]?.msg || ""))}`,
      `${t.hash(repo.commits[0]?.h || "0000000")} HEAD@{5}: ${t.success("commit (initial): " + (repo.commits[0]?.msg || ""))}`,
      "",
      t.dim("tip: git reset --hard HEAD@{n}  →  recover any previous state"),
      t.dim("tip: git checkout -b recovery HEAD@{n}  →  create rescue branch"),
    ];
    return { output: entries.join("\n"), repoUpdate: null };
  }

  // git cherry-pick
  if (sub === "cherry-pick") {
    const sha = args[0];
    const hash = makeHash();
    return {
      output: sha
        ? [
            t.info(`Cherry-picking ${sha}...`),
            t.success(`[${repo.branch} ${hash}] Cherry-picked commit applied`),
            t.dim(`(cherry picked from commit ${sha})`),
          ].join("\n")
        : t.error("usage: git cherry-pick <commit>"),
      repoUpdate: sha
        ? {
            commits: [...repo.commits, { h: hash, msg: `Cherry-picked: ${sha}`, time: "just now", branch: repo.branch }],
            head: hash,
          }
        : null,
    };
  }

  // git rebase
  if (sub === "rebase") {
    const interactive = parts.includes("-i");
    const base = args.find((a) => !a.startsWith("-"));

    if (interactive) {
      const count = parseInt(base?.replace("HEAD~", "") || "3", 10);
      const recentCommits = repo.commits.slice(-count).reverse();
      return {
        output: [
          t.info(`Opening interactive rebase editor for last ${count} commits...`),
          "",
          t.dim("# Rebase todo list:"),
          ...recentCommits.map((c, i) => `${t.success("pick")} ${t.hash(c.h)} ${esc(c.msg)}`),
          "",
          t.dim("# Commands:"),
          t.dim("# p, pick   = use commit"),
          t.dim("# r, reword = use commit, edit message"),
          t.dim("# e, edit   = stop for amending"),
          t.dim("# s, squash = meld into previous commit"),
          t.dim("# f, fixup  = meld, discard message"),
          t.dim("# d, drop   = remove commit"),
          "",
          t.success(`Successfully rebased ${count} commits.`),
        ].join("\n"),
        repoUpdate: null,
      };
    }

    return {
      output: base
        ? [
            t.info(`Rebasing onto ${base}...`),
            t.warn("⚠️  This rewrites commit SHAs."),
            t.warn("   If already pushed: git push --force-with-lease required."),
            t.success("Successfully rebased and updated refs/heads/" + repo.branch),
          ].join("\n")
        : t.error("usage: git rebase <branch>"),
      repoUpdate: null,
    };
  }

  // git bisect
  if (sub === "bisect") {
    const bisectSub = args[0];
    if (bisectSub === "start")
      return {
        output: t.success("Bisect started. Mark commits: git bisect bad / git bisect good <sha>"),
        repoUpdate: null,
      };
    if (bisectSub === "bad")
      return { output: t.info("Marked as bad. Bisecting: ~8 steps remaining."), repoUpdate: null };
    if (bisectSub === "good")
      return {
        output: t.success("Marked as good. Bisecting: ~4 steps remaining."),
        repoUpdate: null,
      };
    if (bisectSub === "reset")
      return { output: t.success("Bisect reset. Back to HEAD."), repoUpdate: null };
    if (bisectSub === "run")
      return {
        output: [
          t.info(`Running: ${args.slice(1).join(" ")}`),
          t.dim("... 8 bisect steps ..."),
          t.success(`${t.hash(repo.commits.at(-2)?.h || "abc123")} is the first bad commit`),
          t.dim(`commit ${repo.commits.at(-2)?.h || "abc123"}`),
          t.dim("Author: Developer <dev@company.com>"),
          t.dim(`\n    ${repo.commits.at(-2)?.msg || "Something changed here"}`),
          "",
          t.success("bisect run success"),
        ].join("\n"),
        repoUpdate: null,
      };
    return {
      output: t.info("git bisect start → git bisect bad → git bisect good <sha>"),
      repoUpdate: null,
    };
  }

  // git cat-file
  if (sub === "cat-file") {
    const flag = args[0];
    if (flag === "-t") return { output: t.success("commit"), repoUpdate: null };
    if (flag === "-p") {
      const last = repo.commits.at(-1);
      return {
        output: [
          `${t.info("tree")} ${t.hash("a1b2c3d4e5f6789012345678901234567890abcd")}`,
          `${t.info("parent")} ${t.hash(repo.commits.at(-2)?.h + "f1e2d3c4b5a697868574" || "0000000")}`,
          `${t.info("author")} Developer <dev@company.com> 1704067200 +0000`,
          `${t.info("committer")} Developer <dev@company.com> 1704067200 +0000`,
          "",
          `    ${esc(last?.msg || "latest commit")}`,
        ].join("\n"),
        repoUpdate: null,
      };
    }
    return { output: t.error("usage: git cat-file -t|-p <object>"), repoUpdate: null };
  }

  // git ls-files
  if (sub === "ls-files") {
    const stage = parts.includes("--stage");
    if (stage) {
      return {
        output: [
          `100644 ${t.hash("a1b2c3d4e5f6")} 0\tsrc/api.js`,
          `100644 ${t.hash("b2c3d4e5f6g7")} 0\tsrc/auth.js`,
          `100644 ${t.hash("c3d4e5f6g7h8")} 0\ttests/api.test.js`,
          `100644 ${t.hash("d4e5f6g7h8i9")} 0\tpackage.json`,
          "",
          t.dim("# stage 0 = normal, 1 = ancestor, 2 = ours, 3 = theirs (merge conflict)"),
        ].join("\n"),
        repoUpdate: null,
      };
    }
    return {
      output: ["src/api.js", "src/auth.js", "tests/api.test.js", "package.json"].join("\n"),
      repoUpdate: null,
    };
  }

  // git remote
  if (sub === "remote") {
    const remoteSub = args[0];
    if (!remoteSub || remoteSub === "-v") {
      return {
        output: [
          `origin\thttps://github.com/company/project.git ${t.success("(fetch)")}`,
          `origin\thttps://github.com/company/project.git ${t.success("(push)")}`,
        ].join("\n"),
        repoUpdate: null,
      };
    }
  }

  // git fetch / pull / push
  if (sub === "fetch") {
    return {
      output: [
        t.info(`From https://github.com/company/project`),
        `   ${t.hash(repo.head)}..${t.hash(makeHash())}  ${repo.branch} → origin/${repo.branch}`,
        t.dim("Fetched. Use: git log origin/main to see upstream changes."),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  if (sub === "pull") {
    const rebaseFlag = parts.includes("--rebase");
    return {
      output: [
        rebaseFlag ? t.info("Rebasing on top of origin/main...") : t.info("Merging origin/main..."),
        t.success("Already up to date."),
        t.dim(rebaseFlag ? "tip: git config --global pull.rebase true  (set permanently)" : ""),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  if (sub === "push") {
    const force = parts.includes("--force-with-lease");
    const forceUnsafe = parts.includes("--force") || parts.includes("-f");

    if (forceUnsafe && !force) {
      return {
        output: [
          t.error("⚠️  Using --force is dangerous!"),
          t.warn("   Use --force-with-lease instead:"),
          t.info("   git push --force-with-lease"),
          t.dim("   --force-with-lease verifies remote hasn't changed since your last fetch"),
        ].join("\n"),
        repoUpdate: null,
      };
    }

    return {
      output: force
        ? [
            t.success(`Pushed to origin/${repo.branch} (--force-with-lease)`),
            t.dim("Remote verified — no concurrent pushes lost."),
          ].join("\n")
        : [
            t.info(`Enumerating objects: ${repo.commits.length}, done.`),
            t.info("Counting objects: 100%, done."),
            t.info("Writing objects: 100%, done."),
            `${t.hash("abc123")}..${t.hash(repo.head)}  ${repo.branch} → origin/${repo.branch}`,
          ].join("\n"),
      repoUpdate: null,
    };
  }

  // git init
  if (sub === "init") {
    return {
      output: [
        t.success("Initialized empty Git repository in /home/dev/project/.git/"),
        t.dim('hint: Using "main" as the default branch name.'),
        t.dim("hint: git config --global init.defaultBranch main"),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // git clone
  if (sub === "clone") {
    return {
      output: [
        t.info("Cloning into 'project'..."),
        t.dim("remote: Enumerating objects: 847, done."),
        t.dim("remote: Counting objects: 100% (847/847), done."),
        t.success("Receiving objects: 100%, done."),
        t.success("Resolving deltas: 100%, done."),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // git tag
  if (sub === "tag") {
    const tag = args[0];
    if (!tag) {
      return { output: ["v1.0.0", "v1.1.0", "v2.0.0", "v2.0.1"].join("\n"), repoUpdate: null };
    }
    return {
      output: t.success(`Created tag '${esc(tag)}' at ${repo.head}`),
      repoUpdate: null,
    };
  }

  // git config
  if (sub === "config") {
    const global = parts.includes("--global");
    const list = parts.includes("--list") || parts.includes("-l");
    if (list) {
      return {
        output: [
          `user.name=Developer`,
          `user.email=dev@company.com`,
          `init.defaultbranch=main`,
          `pull.rebase=true`,
          `push.default=current`,
          `alias.st=status`,
          `alias.lg=log --oneline --graph --decorate`,
          `alias.undo=reset --soft HEAD~1`,
        ].join("\n"),
        repoUpdate: null,
      };
    }
    return { output: t.success("Config updated"), repoUpdate: null };
  }

  // git blame
  if (sub === "blame") {
    return {
      output: [
        `${t.hash("a1b2c3d")} (Developer  2024-01-15  1) const express = require('express')`,
        `${t.hash("b2c3d4e")} (Developer  2024-01-16  2) const router = express.Router()`,
        `${t.hash("d4e5f6g")} (Dev2       2024-01-20  3) const JWT_SECRET = process.env.JWT_SECRET`,
        `${t.hash("c3d4e5f")} (Developer  2024-01-17  4) `,
        `${t.hash("c3d4e5f")} (Developer  2024-01-17  5) async function login(req, res) {`,
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // git gc / fsck
  if (sub === "gc") {
    return {
      output: [
        t.info("Enumerating objects: 847, done."),
        t.info("Counting objects: 100%, done."),
        t.info("Compressing objects: 100%, done."),
        t.success("Writing pack file: .git/objects/pack/pack-abc123.pack, done."),
        t.dim("Pruning loose objects: done."),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  if (sub === "fsck") {
    return {
      output: [
        t.info("Checking object connectivity and validity..."),
        t.success("Checking connectivity: done."),
        t.success("No broken links found."),
        t.dim("dangling commit a1b2c3d (old rebase — accessible via reflog)"),
      ].join("\n"),
      repoUpdate: null,
    };
  }

  // Unknown git command
  return {
    output: [
      t.error(`git: '${esc(sub || "")}' is not a recognized git command`),
      t.dim(`hint: type 'help' to see available commands`),
    ].join("\n"),
    repoUpdate: null,
  };
}
