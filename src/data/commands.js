// ================================================================
// GITVERSE — COMPLETE COMMAND DATABASE
// Every command: purpose · syntax · internals · visualization
// danger levels: safe | medium | high | critical
// ================================================================

export const COMMANDS = {
  add: {
    id: 'add',
    name: 'git add',
    emoji: '📦',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['staging', 'index', 'workflow', 'snapshot'],
    short: 'Stage changes from the working directory into the index',
    purpose: `git add moves changes from the working directory into the staging area (index).
It does NOT modify the repository — it only prepares a snapshot of what will go into the next commit.
The staging area lets you craft precise commits by selecting exactly which changes to include.`,
    syntax: [
      { cmd: 'git add <file>',    desc: 'Stage a specific file' },
      { cmd: 'git add .',         desc: 'Stage all changes in current directory (recursive)' },
      { cmd: 'git add -A',        desc: 'Stage everything: new, modified, deleted files' },
      { cmd: 'git add -p',        desc: 'Interactive patch mode — stage by individual hunk' },
      { cmd: 'git add -u',        desc: 'Stage only tracked file changes (not new files)' },
      { cmd: 'git add -N <file>', desc: 'Intent to add — track new file without staging content' },
      { cmd: 'git add -e',        desc: 'Open patch editor to edit hunks before staging' },
    ],
    examples: [
      {
        title: 'Stage specific files',
        code: `git add src/api.js tests/api.test.js
git status  # verify what's staged`
      },
      {
        title: 'Interactive staging — choose hunks',
        code: `git add -p
# For each hunk you'll see:
# y — stage this hunk
# n — don't stage this hunk
# s — split into smaller hunks
# e — manually edit the hunk
# ? — show help`
      },
      {
        title: 'Stage tracked changes only (no new files)',
        code: `git add -u
# Stages: modifications + deletions
# Ignores: untracked new files`
      },
      {
        title: 'Stage everything for a clean commit',
        code: `# Review first!
git diff                  # see unstaged changes
git add -A                # stage everything
git diff --staged         # verify staging
git commit -m "feat: add auth layer"`
      },
    ],
    when_to_use: [
      'Before every git commit to prepare your snapshot',
      'Use -p to stage partial file changes for cleaner commits',
      'Use -u when you only want to stage changes to already-tracked files',
    ],
    when_not_to_use: [
      "Never git add . blindly — always review with git status first",
      "Don't stage .env files, secrets, API keys, or generated build artifacts",
      "Don't stage debug code, commented-out experiments, or console.log statements",
    ],
    mistakes: [
      "git add . without reviewing: accidentally stages .env, node_modules, or debug files",
      "Staging every change in one commit instead of logical units",
      "Not using -p when you've mixed multiple features in the same file",
    ],
    safer_alternatives: [
      { cmd: 'git add -p', reason: 'Review every diff hunk before it enters the staging area' },
      { cmd: 'git diff --staged', reason: 'Always verify your staged snapshot before committing' },
    ],
    related: ['commit', 'restore', 'status', 'diff', 'reset'],
    internals: `When you run git add, Git computes the SHA-1 hash of the file content and stores it as a
blob object in .git/objects/ (two-char directory + 38-char filename). It then updates the
binary file .git/index (the staging area) to map the file path to the new blob SHA.
git add -p works by splitting the file diff into hunks, applying only selected hunks to
create a partial blob object — this is why staged and working-tree versions of a file can differ.`,
    visualization: 'staging',
    enterprise_note: 'Use pre-commit hooks (Husky + lint-staged) to run linting/formatting on staged files. Integrate git-secrets or detect-secrets to prevent credential staging.',
  },

  commit: {
    id: 'commit',
    name: 'git commit',
    emoji: '💾',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['snapshot', 'history', 'workflow', 'SHA'],
    short: 'Create an immutable snapshot of the staging area',
    purpose: `Creates a new commit object in the Git object database. A commit is an immutable
snapshot containing: the tree SHA (full directory snapshot), parent SHA(s), author identity,
committer identity, timestamps, and commit message. The SHA-1 hash is computed from all this
content — change anything and you get a different commit.`,
    syntax: [
      { cmd: 'git commit -m "message"',         desc: 'Commit with inline message' },
      { cmd: 'git commit',                       desc: 'Open editor to write detailed message' },
      { cmd: 'git commit -am "message"',         desc: 'Stage tracked changes + commit in one step' },
      { cmd: 'git commit --amend',               desc: 'Modify the most recent commit (unpushed only!)' },
      { cmd: 'git commit --amend --no-edit',     desc: 'Amend without changing the message' },
      { cmd: 'git commit -v',                    desc: 'Show diff in the commit message editor' },
      { cmd: 'git commit --fixup <hash>',        desc: 'Create fixup! commit for later autosquash' },
      { cmd: 'git commit --squash <hash>',       desc: 'Create squash! commit for interactive rebase' },
      { cmd: 'git commit --allow-empty -m "msg"', desc: 'Create commit with no file changes (CI trigger)' },
    ],
    examples: [
      {
        title: 'Conventional Commits format',
        code: `# Format: type(scope): description
git commit -m "feat(auth): add OAuth2 Google login"
git commit -m "fix(api): handle null response in /users"
git commit -m "refactor(db): extract query builder class"
git commit -m "docs: update authentication guide"
git commit -m "chore(deps): upgrade axios to 1.7.0"`
      },
      {
        title: 'Amend last commit (before pushing)',
        code: `# Fix a typo in last commit message
git commit --amend -m "feat(auth): add OAuth2 Google login"

# Add a forgotten file to last commit
git add src/forgot-this.js
git commit --amend --no-edit

# NEVER amend commits that have been pushed!`
      },
      {
        title: 'Fixup workflow for interactive rebase',
        code: `# Working on commit abc123, found a bug
git add src/fix.js
git commit --fixup abc123   # Creates "fixup! original message"

# Later, clean up history before PR:
git rebase -i --autosquash HEAD~5`
      },
    ],
    when_to_use: [
      'After staging a complete, logical unit of work',
      '--amend to fix the last commit before pushing to remote',
      '--fixup for later interactive squashing with --autosquash',
    ],
    when_not_to_use: [
      "NEVER --amend commits already pushed to shared branches",
      "Don't commit broken, untested code to main/master",
      "Avoid mega-commits mixing unrelated changes",
    ],
    mistakes: [
      'Vague messages: "fix", "update", "changes", "wip", "asdf"',
      'Amending pushed commits — forces teammates to git pull --rebase',
      'One giant commit per PR — makes review and bisect painful',
    ],
    safer_alternatives: [
      { cmd: 'git commit --fixup + rebase -i --autosquash', reason: 'Cleaner than amending old commits' },
    ],
    related: ['add', 'push', 'log', 'rebase', 'amend'],
    internals: `A commit object is a text file stored in .git/objects/ containing:
- "tree <sha>" — points to a tree object (directory snapshot)
- "parent <sha>" — previous commit(s). Merge commits have two parents.
- "author Name <email> <timestamp> <tz>"
- "committer Name <email> <timestamp> <tz>"
- blank line, then the commit message

The SHA-1 is computed from this ENTIRE text. This means two identical changes made at
different times produce different commit SHAs. Git guarantees integrity this way.`,
    visualization: 'commit',
    enterprise_note: 'Enforce Conventional Commits via commitlint + Husky. This enables automated CHANGELOG generation (standard-version / semantic-release) and automatic semver bumping.',
  },

  switch: {
    id: 'switch',
    name: 'git switch',
    emoji: '⚡',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['branches', 'HEAD', 'navigation', 'modern', 'git-2.23'],
    short: 'Modern branch switching — clear replacement for git checkout <branch>',
    purpose: `Introduced in Git 2.23 to replace the branch-switching responsibility of the
overloaded git checkout command. git switch has a cleaner, safer API — it refuses to
overwrite uncommitted changes by default, and --detach makes detached HEAD explicit.`,
    syntax: [
      { cmd: 'git switch <branch>',           desc: 'Switch to an existing branch' },
      { cmd: 'git switch -c <new-branch>',    desc: 'Create and switch to new branch' },
      { cmd: 'git switch -C <branch>',        desc: 'Force-create or reset an existing branch' },
      { cmd: 'git switch -',                  desc: 'Switch to previous branch (like cd -)' },
      { cmd: 'git switch --detach <commit>',  desc: 'Enter detached HEAD state explicitly' },
      { cmd: 'git switch -c <b> origin/<b>',  desc: 'Create local branch tracking a remote' },
    ],
    examples: [
      {
        title: 'Feature branch workflow',
        code: `git switch main
git pull
git switch -c feature/user-auth   # create + switch
# ... code ...
git switch -                       # back to main (prev branch)
git switch feature/user-auth       # back to feature`
      },
      {
        title: 'Track a remote branch',
        code: `# After git fetch, a colleague's branch exists as origin/feature/payments
git switch -c feature/payments origin/feature/payments
# Or shorthand (Git auto-detects tracking):
git switch feature/payments`
      },
    ],
    when_to_use: [
      'All new branch switching — prefer over git checkout for clarity',
      'Use switch - for rapid back-and-forth between two branches',
      'Use --detach to explicitly enter read-only detached HEAD state',
    ],
    when_not_to_use: [
      "Don't use for restoring files — use git restore instead",
      "On Git versions older than 2.23 (use git checkout)",
    ],
    related: ['restore', 'checkout', 'branch', 'stash', 'worktree'],
    internals: `git switch updates .git/HEAD to "ref: refs/heads/<branch>". It checks out the tree
of the branch tip commit into the working directory and updates the index to match.
It refuses to switch if changes in the working tree would be overwritten (unlike checkout -f).
--detach writes a bare SHA to .git/HEAD: "detached HEAD" state.`,
    visualization: 'switch',
  },

  restore: {
    id: 'restore',
    name: 'git restore',
    emoji: '🔄',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'medium',
    deprecated: false,
    tags: ['undo', 'files', 'staging', 'modern', 'git-2.23'],
    short: 'Restore files — modern replacement for git checkout -- <file>',
    purpose: `Restores working tree files or staging area entries from a specified source.
Introduced in Git 2.23 alongside git switch to replace the file-restoration half of
git checkout. Safer because it separates branch and file operations.`,
    syntax: [
      { cmd: 'git restore <file>',                        desc: '⚠️ Discard working tree changes (irreversible without stash)' },
      { cmd: 'git restore --staged <file>',               desc: 'Unstage file — keep working tree changes' },
      { cmd: 'git restore --staged --worktree <file>',    desc: 'Unstage AND discard working tree changes' },
      { cmd: 'git restore --source=<commit> <file>',      desc: 'Restore file from a specific commit' },
      { cmd: 'git restore --source=HEAD~3 src/',          desc: 'Restore entire directory from 3 commits ago' },
      { cmd: 'git restore .',                             desc: '⚠️ Discard ALL working tree changes' },
    ],
    examples: [
      {
        title: 'Undo accidental edits to a file',
        code: `# You edited src/api.js and want to discard changes
git restore src/api.js
# IRREVERSIBLE — file reverts to index (staged) version`
      },
      {
        title: 'Unstage files without losing work',
        code: `# You staged too much — unstage specific file
git restore --staged src/unrelated.js
# The file changes remain in working tree, just unstaged`
      },
      {
        title: 'Recover a file from a specific commit',
        code: `# Get config.json from 5 commits ago
git restore --source=HEAD~5 config/settings.json
# Now it's in your working tree (unstaged)
git add config/settings.json
git commit -m "restore: revert settings to v2.1 config"`
      },
    ],
    when_to_use: [
      'Discarding unwanted edits in the working directory',
      'Unstaging accidentally staged files',
      'Recovering specific files from older commits',
    ],
    when_not_to_use: [
      'git restore <file> permanently destroys uncommitted changes — use git stash first if unsure',
      "Don't use for branch switching — that's git switch",
    ],
    mistakes: [
      'Running git restore . and losing hours of work',
      'Not realizing git restore (no --staged) uses the INDEX as source, not HEAD',
    ],
    related: ['checkout', 'reset', 'stash', 'add'],
    internals: `Default source (--worktree): copies blob from index into working tree file.
--staged: resets index entry back to HEAD commit version — does NOT touch working tree.
--source=<commit>: copies the blob from that commit's tree into working tree and/or index.
The content is never destroyed — it's still in the object database — but working tree files
are overwritten and not in reflog.`,
    visualization: 'restore',
  },

  checkout: {
    id: 'checkout',
    name: 'git checkout',
    emoji: '🔀',
    category: 'daily',
    difficulty: 'intermediate',
    danger: 'medium',
    deprecated: true,
    deprecation_note: 'git checkout is overloaded — it does both branch switching AND file restoration. Git 2.23+ introduces git switch (branches) and git restore (files) as explicit replacements. checkout still works but its dual behavior confuses beginners.',
    tags: ['branches', 'HEAD', 'deprecated', 'overloaded', 'navigation'],
    short: '⚠️ Overloaded legacy command — use git switch and git restore instead',
    purpose: `The original command for both switching branches and restoring files. Its dual
responsibility caused enormous confusion (checkout -b, checkout HEAD~2, checkout -- file, 
checkout <branch> all do very different things). Still fully functional but superseded.`,
    syntax: [
      { cmd: 'git checkout <branch>',          desc: '⚠️ Use: git switch <branch>', deprecated: true },
      { cmd: 'git checkout -b <branch>',        desc: '⚠️ Use: git switch -c <branch>', deprecated: true },
      { cmd: 'git checkout <commit>',           desc: 'Enter detached HEAD — still valid use case' },
      { cmd: 'git checkout -- <file>',          desc: '⚠️ Use: git restore <file>', deprecated: true },
      { cmd: 'git checkout <commit> -- <file>', desc: '⚠️ Use: git restore --source=<commit> <file>', deprecated: true },
    ],
    modern_alternatives: [
      { old: 'git checkout <branch>',          new: 'git switch <branch>' },
      { old: 'git checkout -b <branch>',        new: 'git switch -c <branch>' },
      { old: 'git checkout -- <file>',          new: 'git restore <file>' },
      { old: 'git checkout <commit> -- <file>', new: 'git restore --source=<commit> <file>' },
      { old: 'git checkout <commit>',           new: 'git switch --detach <commit>' },
    ],
    when_to_use: [
      'Legacy scripts that cannot be updated',
      'Git versions older than 2.23',
      'Some specific detached HEAD workflows',
    ],
    when_not_to_use: [
      'Any new workflow — use switch and restore',
      'When teaching Git to beginners (causes HEAD confusion)',
    ],
    related: ['switch', 'restore', 'branch', 'stash'],
    internals: `For branch switching: reads .git/refs/heads/<branch>, writes SHA to .git/HEAD as
"ref: refs/heads/<branch>", updates working tree to match commit tree.
For detached HEAD: writes bare SHA to .git/HEAD.
For file restore: reads blob from index or commit tree, overwrites working tree file.
This is why checkout is "overloaded" — the same command has three distinct internal code paths.`,
    visualization: 'switch',
  },

  rebase: {
    id: 'rebase',
    name: 'git rebase',
    emoji: '🔁',
    category: 'advanced',
    difficulty: 'advanced',
    danger: 'high',
    deprecated: false,
    tags: ['history', 'linear', 'rewrite', 'cleanup', 'interactive', 'squash'],
    short: 'Replay commits onto a new base — creates clean linear history',
    purpose: `Rebase replays commits from one branch onto a new base commit, creating new commit
objects with new SHAs. This produces a clean, linear history but REWRITES commit history.
The golden rule: never rebase commits that exist on a shared remote branch other people
have based their work on.`,
    syntax: [
      { cmd: 'git rebase <base>',                 desc: 'Rebase current branch onto base' },
      { cmd: 'git rebase main',                   desc: 'Update feature branch with latest main' },
      { cmd: 'git rebase -i HEAD~3',              desc: 'Interactive rebase: squash/reorder/drop 3 commits' },
      { cmd: 'git rebase -i --autosquash',        desc: 'Auto-apply fixup! / squash! commits' },
      { cmd: 'git rebase --onto <new> <old>',     desc: 'Transplant branch to entirely new base' },
      { cmd: 'git rebase --abort',                desc: 'Cancel in-progress rebase, restore original state' },
      { cmd: 'git rebase --continue',             desc: 'Continue after resolving conflict' },
      { cmd: 'git rebase --skip',                 desc: 'Skip conflicting commit and continue' },
      { cmd: 'git rebase --exec "npm test" HEAD~5', desc: 'Run command after each replayed commit' },
    ],
    examples: [
      {
        title: 'Update feature branch with main',
        code: `git switch feature/auth
git rebase main

# If conflicts:
# 1. Resolve conflicting files
# 2. git add <resolved-files>
# 3. git rebase --continue
# Or to bail out: git rebase --abort

# Push (requires force because SHAs changed):
git push --force-with-lease origin feature/auth`
      },
      {
        title: 'Interactive rebase — clean up commits before PR',
        code: `git rebase -i HEAD~4
# Opens editor:
# pick a1b2c3 feat: start auth module
# pick b2c3d4 WIP: debugging
# pick c3d4e5 fix: typo
# pick d4e5f6 WIP: more auth

# Change to:
# pick a1b2c3 feat: start auth module
# fixup b2c3d4    (squash, discard msg)
# fixup c3d4e5    (squash, discard msg)
# reword d4e5f6   (squash, keep/edit msg)

# Result: 1 clean commit with combined changes`
      },
      {
        title: 'Transplant branch onto different base (--onto)',
        code: `# Scenario: branch was accidentally based on feature-a, not main
# Before: main → feature-a → your-feature
# After:  main → your-feature

git rebase --onto main feature-a your-feature`
      },
    ],
    when_to_use: [
      'Cleaning up feature branch history before opening a PR',
      'Keeping a feature branch up-to-date with main (rebasing onto main)',
      'Squashing WIP commits into logical, reviewable units',
      'Creating a linear history in repos with that policy',
    ],
    when_not_to_use: [
      '⚠️ NEVER on shared branches (main, develop, release) that other devs have pulled',
      '⚠️ On any commit others have based their work on — will cause diverged histories',
      'When merge commit history is required for audit trails',
      'When you are unsure — use git merge as the safe default',
    ],
    mistakes: [
      'Rebasing main or develop — strands every team member',
      'Using git push --force instead of --force-with-lease after rebase',
      'Not running git rebase --abort when a rebase goes wrong',
      'Rebasing a branch you already opened a PR for (changes all commit SHAs)',
    ],
    safer_alternatives: [
      { cmd: 'git merge',          reason: 'Preserves full history, safe on shared branches' },
      { cmd: 'git merge --squash', reason: 'Squash without rewriting feature branch history' },
    ],
    recovery: 'If you rebased wrongly: git reflog to find original commit SHA → git reset --hard <sha> to restore it. Your original commits survived in the reflog for 90 days.',
    related: ['merge', 'cherry-pick', 'reset', 'reflog', 'push'],
    internals: `For each commit being rebased, Git:
1. Computes the diff patch (parent → commit)
2. Applies the patch to the new base
3. Creates a NEW commit object with: new parent SHA, same author/message but new committer timestamp
4. New SHA because parent SHA changed
5. Original commits become orphaned (not pointed to by any ref)
6. These orphans are accessible via git reflog for ~90 days, then garbage collected.

Interactive rebase builds a "todo list" in .git/rebase-merge/git-rebase-todo and
processes each entry sequentially, stopping for conflicts or "edit" instructions.`,
    visualization: 'rebase',
    enterprise_note: 'Configure branch protection to require linear history (enforces rebase merges). Use --force-with-lease which checks remote ref before overwriting — prevents accidentally overwriting a colleague\'s push.',
  },

  reset: {
    id: 'reset',
    name: 'git reset',
    emoji: '⏪',
    category: 'advanced',
    difficulty: 'advanced',
    danger: 'high',
    deprecated: false,
    tags: ['undo', 'HEAD', 'destructive', 'three-trees', 'dangerous'],
    short: 'Move HEAD pointer with three modes that affect index and working tree differently',
    purpose: `git reset moves the HEAD pointer (and current branch tip) to a target commit.
The three modes (--soft, --mixed, --hard) control what happens to the staging area and
working tree. The most misunderstood Git command — and the most dangerous.
The "three trees" mental model is essential to understand before using this command.`,
    syntax: [
      { cmd: 'git reset --soft HEAD~1',   desc: 'Move HEAD back — keep changes staged' },
      { cmd: 'git reset HEAD~1',          desc: 'Move HEAD back + unstage (default: --mixed)' },
      { cmd: 'git reset --hard HEAD~1',   desc: '⚠️ Move HEAD + discard ALL changes permanently' },
      { cmd: 'git reset <file>',          desc: 'Unstage specific file (--mixed mode, file only)' },
      { cmd: 'git reset --hard origin/main', desc: '⚠️ Nuclear: sync to remote, discarding everything local' },
      { cmd: 'git reset ORIG_HEAD',       desc: 'Undo last merge/rebase (Git sets ORIG_HEAD before these)' },
    ],
    modes: [
      { flag: '--soft',  head: '✓ moved', index: 'unchanged',  working: 'unchanged', useCase: 'Undo last commit, keep changes staged for re-commit' },
      { flag: '--mixed', head: '✓ moved', index: '✓ reset',    working: 'unchanged', useCase: 'Undo last commit, unstage everything (default)' },
      { flag: '--hard',  head: '✓ moved', index: '✓ reset',    working: '✓ reset',   useCase: '⚠️ Full destroy — only safe if changes are truly unwanted' },
    ],
    examples: [
      {
        title: 'Split a commit into two logical commits',
        code: `# You committed everything but want two separate commits
git reset --soft HEAD~1  # undo commit, keep everything staged

git restore --staged src/unrelated.js  # unstage unrelated file

git commit -m "feat: add JWT authentication"
git add src/unrelated.js
git commit -m "refactor: extract validation helpers"`
      },
      {
        title: 'Hard reset to sync with remote (destructive)',
        code: `# USE WITH CAUTION — permanently discards local commits
git fetch origin
git reset --hard origin/main

# Safer alternative: check what you'd lose first
git log HEAD..origin/main  # commits only on remote
git log origin/main..HEAD  # YOUR commits that would be lost`
      },
    ],
    when_to_use: [
      '--soft: Restructure the last commit before pushing',
      '--mixed: Unstage everything and start staging again from scratch',
      '--hard: Completely abandon local changes and sync to a clean state',
    ],
    when_not_to_use: [
      '⚠️ --hard on commits shared with others (permanent data loss)',
      "On commits other people have based their work on",
      "When git revert is more appropriate (on public branches)",
      "When you're not 100% sure — use git stash first",
    ],
    mistakes: [
      'git reset --hard without realizing there were important uncommitted changes',
      'Resetting shared branch history and forcing teammates to recover',
      'Not knowing about git reflog for recovery',
    ],
    safer_alternatives: [
      { cmd: 'git revert',           reason: 'Safe undo for public history — creates new commit' },
      { cmd: 'git restore --staged', reason: 'Unstage files without touching HEAD at all' },
      { cmd: 'git commit --amend',   reason: 'Fix last commit without resetting' },
      { cmd: 'git stash',            reason: 'Temporarily shelve changes before any destructive operation' },
    ],
    recovery: 'If you reset --hard and lost commits: git reflog → find the SHA you were at → git reset --hard <sha> OR git checkout -b recovery-branch <sha>. Commits survive in reflog for 90 days.',
    related: ['revert', 'reflog', 'restore', 'stash', 'commit'],
    internals: `Git maintains three "trees":
1. HEAD — a pointer to the latest commit (in .git/HEAD → .git/refs/heads/<branch>)
2. Index — the staging area (.git/index binary file)
3. Working Tree — your actual files on disk

--soft:  moves HEAD (branch pointer) only. Index and working tree unchanged.
--mixed: moves HEAD + copies HEAD's tree into the index. Working tree unchanged.
--hard:  moves HEAD + resets index to HEAD's tree + overwrites working tree files.

None of these operations delete objects from .git/objects. The previous commits are
still there, just unreachable via refs — until git gc runs (usually after 90 days).`,
    visualization: 'reset',
    enterprise_note: 'Enable branch protection on main/develop to prevent force pushes. require pull request reviews prevents accidental reset + force push disasters.',
  },

  revert: {
    id: 'revert',
    name: 'git revert',
    emoji: '🛡️',
    category: 'advanced',
    difficulty: 'intermediate',
    danger: 'safe',
    deprecated: false,
    tags: ['undo', 'safe', 'history-safe', 'enterprise', 'audit', 'public'],
    short: 'Safely undo changes by creating an inverse commit — never rewrites history',
    purpose: `git revert creates a NEW commit that applies the exact inverse diff of a target commit.
History is NEVER rewritten — both the original commit and the revert commit remain visible.
This is the enterprise-safe, audit-compliant way to undo changes on public/shared branches.`,
    syntax: [
      { cmd: 'git revert <commit>',           desc: 'Revert a specific commit (opens editor for message)' },
      { cmd: 'git revert HEAD',               desc: 'Revert the most recent commit' },
      { cmd: 'git revert HEAD~3..HEAD',       desc: 'Revert last 3 commits (creates 3 revert commits)' },
      { cmd: 'git revert --no-commit <sha>',  desc: 'Stage the revert without creating a commit' },
      { cmd: 'git revert -m 1 <merge-sha>',   desc: 'Revert a merge commit (-m 1 = keep parent 1 / mainline)' },
      { cmd: 'git revert -n HEAD~3..HEAD',    desc: 'Stage multiple reverts, commit manually as one' },
    ],
    examples: [
      {
        title: 'Revert a bad deployment commit',
        code: `# Find the bad commit
git log --oneline -10

# Revert it (creates new "Revert ..." commit)
git revert abc123def
# Edit the commit message if needed

# Push normally — no force push required
git push origin main`
      },
      {
        title: 'Revert a merge commit',
        code: `# Find the merge commit SHA
git log --oneline --merges -5

# -m 1 = keep parent 1 (the branch we merged INTO)
# -m 2 = keep parent 2 (the feature branch)
git revert -m 1 merge_commit_sha

# NOTE: If you re-merge the branch later, you must revert the revert first:
git revert revert_commit_sha  # then re-merge`
      },
      {
        title: 'Batch revert multiple commits into one',
        code: `# Stage 3 reverts without committing
git revert -n HEAD~3..HEAD

# Review the staged changes
git diff --staged

# Commit them all as one revert
git commit -m "revert: undo experimental payment changes (3 commits)"`
      },
    ],
    when_to_use: [
      'Undoing commits on shared/public branches (main, develop)',
      'Enterprise environments with audit trail requirements',
      'Any situation where git reset would require a force push',
      'Reverting individual commits from a merge without reverting the whole merge',
    ],
    when_not_to_use: [
      'On your own local unshared branch (git reset is simpler)',
      'Reverting many interdependent commits (can get very complex)',
    ],
    related: ['reset', 'cherry-pick', 'log', 'bisect'],
    internals: `Git computes the inverse diff of the target commit: if the commit added line X,
the revert removes it. If it deleted line Y, the revert adds it back.
History structure: A → B → C → C′ (C′ = inverse of C)
Both C and C′ remain in history. SHA tree: C′ points to C as its "parent" via revert reference.
Conflicts can occur if later commits also modified the same code — Git cannot always compute
a clean inverse diff.`,
    visualization: 'revert',
  },

  reflog: {
    id: 'reflog',
    name: 'git reflog',
    emoji: '🔍',
    category: 'advanced',
    difficulty: 'intermediate',
    danger: 'safe',
    deprecated: false,
    tags: ['recovery', 'debug', 'safety-net', 'internals', 'time-machine'],
    short: 'Your ultimate safety net — records every single HEAD movement',
    purpose: `git reflog is a local log of every movement of HEAD and branch tips. Even after
a destructive git reset --hard, accidental branch deletion, or lost detached HEAD commits,
reflog lets you recover. Entries persist for 90 days by default. This is your time machine.`,
    syntax: [
      { cmd: 'git reflog',                              desc: 'Show HEAD movement history' },
      { cmd: 'git reflog <branch>',                     desc: 'Show movement history of a specific branch' },
      { cmd: 'git reflog --date=iso',                   desc: 'Show entries with full ISO timestamps' },
      { cmd: 'git reflog show HEAD',                    desc: 'Same as git reflog (HEAD is default)' },
      { cmd: 'git reflog expire --expire=30.days --all', desc: 'Manually expire entries older than 30 days' },
      { cmd: 'git reflog delete HEAD@{n}',              desc: 'Delete a specific reflog entry' },
    ],
    recovery_workflows: [
      {
        scenario: 'Accidental git reset --hard',
        steps: [
          'git reflog  — find the commit SHA before the reset (HEAD@{n})',
          'git reset --hard HEAD@{n}  — restore to that exact state',
          'Or: git checkout -b recovery-branch HEAD@{n}  — safer option',
        ],
      },
      {
        scenario: 'Deleted branch (not pushed)',
        steps: [
          'git reflog  — scan for last commit on that branch',
          'git checkout -b <branch-name> <SHA>  — recreate the branch',
        ],
      },
      {
        scenario: 'Lost detached HEAD commits',
        steps: [
          'git reflog  — find your last detached HEAD commits',
          'git switch -c rescue-branch <SHA>  — save commits to a named branch',
        ],
      },
      {
        scenario: 'Interactive rebase went wrong',
        steps: [
          'git reflog  — find the ORIG_HEAD or pre-rebase state',
          'git reset --hard <original-SHA>  — restore to before rebase',
        ],
      },
    ],
    related: ['reset', 'stash', 'cherry-pick', 'fsck', 'log'],
    internals: `Reflog entries are stored as plain text files in .git/logs/:
- HEAD movements → .git/logs/HEAD
- Branch movements → .git/logs/refs/heads/<branch>
- Remote tracking → .git/logs/refs/remotes/<remote>/<branch>

Each entry format: <old-sha> <new-sha> <identity> <timestamp> <tz>\t<action>: <message>

Entries expire via gc.reflogExpire (default: 90 days for reachable, 30 for unreachable).
Configure: git config gc.reflogExpire "180 days" to extend the recovery window.
reflog is LOCAL only — it is NOT shared when you push/pull.`,
    visualization: 'reflog',
  },

  stash: {
    id: 'stash',
    name: 'git stash',
    emoji: '🗃️',
    category: 'daily',
    difficulty: 'intermediate',
    danger: 'safe',
    deprecated: false,
    tags: ['workflow', 'temporary', 'context-switch', 'stack'],
    short: 'Temporarily shelve uncommitted changes onto a WIP stack',
    purpose: `git stash saves your uncommitted changes (both staged and unstaged) onto a
temporary stack, giving you a clean working directory. Essential for context switching
between tasks without creating WIP commits. Push onto the stack, pop off when you return.`,
    syntax: [
      { cmd: 'git stash',                         desc: 'Stash tracked changes with auto-name' },
      { cmd: 'git stash push -m "description"',   desc: 'Stash with a meaningful description (recommended)' },
      { cmd: 'git stash push -u',                 desc: 'Include untracked files in stash' },
      { cmd: 'git stash push -a',                 desc: 'Include untracked AND ignored files' },
      { cmd: 'git stash list',                    desc: 'Show all stashes' },
      { cmd: 'git stash show stash@{0}',          desc: 'Show what changed in the top stash' },
      { cmd: 'git stash pop',                     desc: 'Apply top stash AND remove from stack' },
      { cmd: 'git stash apply stash@{2}',         desc: 'Apply specific stash (keep it in stack)' },
      { cmd: 'git stash drop stash@{0}',          desc: 'Delete a specific stash' },
      { cmd: 'git stash clear',                   desc: '⚠️ Delete ALL stashes permanently' },
      { cmd: 'git stash branch <name>',           desc: 'Create new branch from stash (avoids pop conflicts)' },
    ],
    examples: [
      {
        title: 'Classic context switch workflow',
        code: `# Working on feature/auth, urgent bug reported
git stash push -m "wip: jwt refresh token implementation"

git switch hotfix/login-crash
# fix the bug...
git commit -m "fix: null pointer in login handler"
git push origin hotfix/login-crash

# Return to feature work
git switch feature/auth
git stash pop  # restores your WIP`
      },
      {
        title: 'Apply stash to a different branch',
        code: `# You accidentally worked on main instead of feature branch
git stash push -m "accidental changes on main"
git switch feature/my-feature
git stash pop  # apply changes here instead`
      },
      {
        title: 'Stash branch — cleanest approach for old stashes',
        code: `# Stash has been sitting for a while, conflicts likely
git stash branch feature/stashed-work stash@{0}
# Creates new branch at the commit when you stashed
# Applies stash, deletes it from stack
# Now you have a proper branch, no conflicts`
      },
    ],
    when_to_use: [
      'Switching branches while mid-task with uncommitted changes',
      'Pulling latest changes when working tree is dirty',
      'Quick context switch to review/fix something urgent',
    ],
    when_not_to_use: [
      "Don't use stash as long-term storage — use feature branches",
      "Don't build up many unnamed stashes — they become confusing",
      "Don't stash if you can commit a WIP commit (easier to manage)",
    ],
    mistakes: [
      'Building up a stack of 10+ unnamed stashes: stash@{0..9} with no descriptions',
      'Using stash for work spanning days instead of a proper branch',
      'Forgetting --include-untracked (-u) and losing new files',
      'git stash clear accidentally deleting months of work',
    ],
    related: ['switch', 'restore', 'worktree', 'branch'],
    internals: `A stash creates 2–3 special commit objects not pointed to by any branch:
- WI (work index): a commit snapshotting the index state
- WT (work tree): a commit with the working tree state, parent = WI
- u (untracked): optional third commit for untracked files

All stored as a linked list under refs/stash. git stash list walks this list.
git stash pop = git stash apply + git stash drop (applies and removes the entry).
git stash apply re-applies the patch; if conflicts occur, the stash is NOT dropped.`,
    visualization: 'stash',
  },

  cherrypick: {
    id: 'cherry-pick',
    name: 'git cherry-pick',
    emoji: '🍒',
    category: 'advanced',
    difficulty: 'intermediate',
    danger: 'medium',
    deprecated: false,
    tags: ['selective', 'backport', 'workflow', 'copy-commit'],
    short: 'Copy a specific commit and replay it on the current branch',
    purpose: `git cherry-pick applies the changes introduced by a specific commit to the current branch,
creating a new commit with a new SHA. Essential for backporting bug fixes to release branches
or selectively applying specific commits across branches.`,
    syntax: [
      { cmd: 'git cherry-pick <sha>',            desc: 'Apply a single commit to current branch' },
      { cmd: 'git cherry-pick A..B',             desc: 'Apply commits A+1 through B (exclusive start)' },
      { cmd: 'git cherry-pick A^..B',            desc: 'Apply commits A through B (inclusive)' },
      { cmd: 'git cherry-pick --no-commit <sha>', desc: 'Apply changes without committing (stage only)' },
      { cmd: 'git cherry-pick -x <sha>',         desc: 'Append "(cherry picked from <sha>)" to message' },
      { cmd: 'git cherry-pick -e <sha>',         desc: 'Edit commit message before creating' },
      { cmd: 'git cherry-pick --abort',           desc: 'Abort in-progress cherry-pick' },
      { cmd: 'git cherry-pick --continue',        desc: 'Continue after resolving conflict' },
    ],
    examples: [
      {
        title: 'Backport a security fix to a release branch',
        code: `# Security fix was made on main: commit abc123
git log main --oneline | grep "security"
# abc123 fix(security): prevent SQL injection in user query

# Apply it to the release branch
git switch release/2.1
git cherry-pick -x abc123   # -x records the source SHA

# Push the hotfix
git push origin release/2.1`
      },
      {
        title: 'Apply multiple commits from feature branch',
        code: `# Apply a range of commits (abc123 through def456)
git cherry-pick abc123^..def456

# If conflicts occur:
git status                  # see what conflicted
# resolve files...
git add <resolved-file>
git cherry-pick --continue`
      },
    ],
    when_to_use: [
      'Backporting bug fixes to multiple release branches (2.0, 2.1, 3.0)',
      'Applying a hotfix commit across several long-lived branches',
      'Selectively including specific commits without merging a full branch',
    ],
    when_not_to_use: [
      "Don't cherry-pick when you should be merging the full branch",
      "Avoid cherry-picking commits with complex interdependencies (use merge/rebase instead)",
      "Creates duplicate commits — can confuse later merges if the original branch is also merged",
    ],
    mistakes: [
      'Cherry-picking then also merging the same branch — creates duplicate commits',
      'Not using -x flag: losing track of the source commit in backport workflows',
      'Cherry-picking interdependent commits out of order causing conflicts',
    ],
    related: ['rebase', 'merge', 'revert', 'log'],
    internals: `Git computes the diff introduced by the cherry-picked commit (parent → commit)
and applies that patch to the current HEAD. Creates a new commit object with:
- new parent: current HEAD SHA
- new SHA (because parent changed)
- same author/message (unless -e)
- different committer timestamp

The original commit still exists on its original branch. These are logically identical
changes but different Git objects with different SHAs.`,
    visualization: 'cherrypick',
  },

  bisect: {
    id: 'bisect',
    name: 'git bisect',
    emoji: '🔬',
    category: 'advanced',
    difficulty: 'intermediate',
    danger: 'safe',
    deprecated: false,
    tags: ['debug', 'binary-search', 'regression', 'investigation'],
    short: 'Binary-search through commit history to find the regression commit',
    purpose: `git bisect performs binary search through commit history to identify the exact commit
that introduced a bug. Extremely efficient: 1,000 commits requires only ~10 steps (log₂(1000) ≈ 10).
Can be fully automated with a test script that exits 0 (good) or non-zero (bad).`,
    syntax: [
      { cmd: 'git bisect start',             desc: 'Begin a bisect session' },
      { cmd: 'git bisect bad',               desc: 'Mark current commit as bad (has the bug)' },
      { cmd: 'git bisect bad <sha>',         desc: 'Mark a specific commit as bad' },
      { cmd: 'git bisect good <sha>',        desc: 'Mark a known-good commit (no bug)' },
      { cmd: 'git bisect good',              desc: 'Mark current commit as good' },
      { cmd: 'git bisect skip',              desc: 'Skip untestable commit (broken build etc.)' },
      { cmd: 'git bisect run <script>',      desc: 'Automate: script exit 0=good, 1=bad, 125=skip' },
      { cmd: 'git bisect reset',             desc: 'End session, return to original HEAD' },
      { cmd: 'git bisect log',               desc: 'Show session log' },
      { cmd: 'git bisect visualize',         desc: 'Show remaining range in gitk' },
    ],
    examples: [
      {
        title: 'Manual bisect workflow',
        code: `git bisect start
git bisect bad             # current HEAD is broken
git bisect good v2.1.0     # this tag had no bug

# Git checks out midpoint commit
# Test your application...
git bisect good  # or git bisect bad

# Repeat ~10 times until Git reports:
# "abc123def is the first bad commit"
# commit abc123def
# Author: Developer <dev@co.com>
# feat: refactor user query builder

git bisect reset  # return to HEAD`
      },
      {
        title: 'Fully automated bisect with test script',
        code: `# Create a test script: test.sh
#!/bin/bash
npm run test:integration -- --testNamePattern "user query"
# exit 0 = pass (good), exit 1 = fail (bad)

# Run automated bisect
git bisect start
git bisect bad HEAD
git bisect good v2.0.0
git bisect run ./test.sh
# Git runs 10 test iterations automatically
# Reports the first bad commit

git bisect reset`
      },
    ],
    when_to_use: [
      'Regression bugs: "this worked in v2.0 but not v2.1"',
      'Performance regressions found in production',
      'Any bug where you have a known-good historical state',
    ],
    when_not_to_use: [
      "Problems introduced by external factors (API changes, env differences)",
      "When the bug is obviously in recent changes (git log -p is faster)",
    ],
    related: ['log', 'blame', 'revert', 'cherry-pick'],
    internals: `git bisect maintains state in .git/BISECT_START, .git/BISECT_BAD, .git/BISECT_GOOD.
It builds a commit range and performs binary search: after marking good/bad, it checkouts
the midpoint of the remaining range. The algorithm is O(log n) in the number of commits.
"git bisect run" automation works by interpreting exit codes:
  0 = good, 1-124 & 126-127 = bad, 125 = skip (untestable)`,
    visualization: 'bisect',
  },

  merge: {
    id: 'merge',
    name: 'git merge',
    emoji: '🔀',
    category: 'daily',
    difficulty: 'intermediate',
    danger: 'safe',
    deprecated: false,
    tags: ['branches', 'integration', 'history', 'merge-commit'],
    short: 'Integrate changes from another branch into the current branch',
    purpose: `git merge integrates changes from one branch into another. Unlike rebase, merge
preserves the complete history including when branches diverged and reconnected.
Git automatically chooses the best merge strategy: fast-forward (linear) or
three-way merge (with merge commit) depending on branch divergence.`,
    syntax: [
      { cmd: 'git merge <branch>',            desc: 'Merge branch into current branch' },
      { cmd: 'git merge --no-ff <branch>',    desc: 'Force a merge commit even if fast-forward is possible' },
      { cmd: 'git merge --squash <branch>',   desc: 'Squash all branch commits into one staged commit' },
      { cmd: 'git merge --abort',             desc: 'Abort in-progress merge (restore pre-merge state)' },
      { cmd: 'git merge --continue',          desc: 'Continue after resolving conflicts' },
      { cmd: 'git merge -X ours <branch>',    desc: 'Auto-resolve conflicts using current branch version' },
      { cmd: 'git merge -X theirs <branch>',  desc: 'Auto-resolve conflicts using merging branch version' },
      { cmd: 'git merge --ff-only <branch>',  desc: 'Fail if merge requires a merge commit' },
    ],
    examples: [
      {
        title: 'Standard merge with merge commit record',
        code: `git switch main
git merge --no-ff feature/auth
# Opens editor for merge commit message:
# "Merge branch 'feature/auth' into main"
# Creates a merge commit with 2 parents`
      },
      {
        title: 'Handling merge conflicts',
        code: `git merge feature/new-api
# CONFLICT (content): Merge conflict in src/api.js

# Open conflicting file:
# <<<<<<< HEAD (your changes)
# const API_VERSION = 'v2';
# =======
# const API_VERSION = 'v3';
# >>>>>>> feature/new-api

# Resolve manually, then:
git add src/api.js
git merge --continue   # or git commit`
      },
    ],
    when_to_use: [
      'Integrating completed feature branches into main',
      'Long-running branches where history preservation matters',
      'Merging in a way that teammates can see the merge boundary clearly',
    ],
    when_not_to_use: [
      "When a clean linear history is required (use rebase + fast-forward instead)",
      "On active development branches (can create a messy merge-commit history)",
    ],
    related: ['rebase', 'cherry-pick', 'diff', 'log', 'branch'],
    internals: `Three-way merge: Git finds the common ancestor (merge base) of the two branches,
then applies changes from both branches relative to the ancestor.
If both branches changed the same lines → CONFLICT (manual resolution required).
A merge commit has TWO parent SHAs — this is what creates the non-linear history.
Fast-forward: if the current branch is a direct ancestor, Git just moves the pointer forward — no merge commit.`,
    visualization: 'merge',
  },

  log: {
    id: 'log',
    name: 'git log',
    emoji: '📜',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['history', 'inspection', 'search', 'visualization'],
    short: 'Show the commit history with powerful filtering and formatting options',
    purpose: `git log displays the commit history, walking backwards from HEAD (or a specified commit).
One of the most powerful Git commands — its formatting and filtering options make it an
essential tool for code archaeology, debugging, and team visibility.`,
    syntax: [
      { cmd: 'git log',                                desc: 'Full commit history from HEAD' },
      { cmd: 'git log --oneline',                     desc: 'Compact: one line per commit' },
      { cmd: 'git log --oneline --graph --all',       desc: 'ASCII branch graph for all branches' },
      { cmd: 'git log --stat',                        desc: 'Show file change statistics per commit' },
      { cmd: 'git log -p',                            desc: 'Show full diff for each commit' },
      { cmd: 'git log --author="Name"',               desc: 'Filter by author' },
      { cmd: 'git log --since="2 weeks ago"',         desc: 'Filter by time range' },
      { cmd: 'git log --grep="JIRA-123"',             desc: 'Search commit messages' },
      { cmd: 'git log -S "functionName"',             desc: 'Pickaxe: find when string was added/removed' },
      { cmd: 'git log --follow src/file.js',          desc: 'Track file history through renames' },
      { cmd: 'git log main..feature',                 desc: 'Commits on feature NOT yet on main' },
      { cmd: 'git log --format="%H %an %s" --no-merges', desc: 'Custom format, no merge commits' },
    ],
    examples: [
      {
        title: 'Visualize branch structure',
        code: `git log --oneline --graph --all --decorate
# * d4e5f6g (HEAD -> main, origin/main) Fix session bug
# * c3d4e5f Implement JWT refresh
# |\\
# | * b8c9d0e (origin/feature/auth) Auth middleware
# |/
# * b2c3d4e Add user authentication`
      },
      {
        title: 'Find when a bug was introduced',
        code: `# Find commits that changed a specific function
git log -S "validateToken" --oneline

# Find commits that changed a specific file
git log --oneline -- src/auth/jwt.js

# Show what changed in each commit to that file
git log -p -- src/auth/jwt.js`
      },
    ],
    related: ['reflog', 'diff', 'blame', 'show', 'bisect'],
    internals: `git log walks the commit graph from a starting point (default: HEAD) following
parent pointers. It reads commit objects from .git/objects/ and formats them. --graph builds
an ASCII representation by tracking lane assignments for each branch pointer.
-S (pickaxe) reads blob diffs for each commit looking for additions/removals of the string.`,
    visualization: 'commit',
  },

  blame: {
    id: 'blame',
    name: 'git blame',
    emoji: '👈',
    category: 'advanced',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['inspection', 'debug', 'archaeology', 'annotation'],
    short: 'Annotate every line of a file with the commit that last changed it',
    purpose: `git blame shows which commit last modified each line of a file, along with author
and timestamp. Essential for code archaeology — understanding WHY a line exists, not just
what it does. Note: "blame" is about understanding context, not assigning fault.`,
    syntax: [
      { cmd: 'git blame <file>',            desc: 'Annotate all lines with commit info' },
      { cmd: 'git blame -L 40,60 <file>',   desc: 'Annotate only lines 40–60' },
      { cmd: 'git blame -w <file>',         desc: 'Ignore whitespace changes' },
      { cmd: 'git blame -M <file>',         desc: 'Detect moved lines within the file' },
      { cmd: 'git blame -C <file>',         desc: 'Detect lines copied from other files' },
      { cmd: 'git blame <sha> -- <file>',   desc: 'Blame at a specific historical commit' },
    ],
    related: ['log', 'show', 'bisect', 'diff'],
    internals: 'Reads each line of the file and walks backwards through commit history finding the most recent commit that changed each line. -M and -C options use diff similarity detection to track code movement.',
    visualization: 'commit',
  },

  push: {
    id: 'push',
    name: 'git push',
    emoji: '🚀',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'medium',
    deprecated: false,
    tags: ['remote', 'publish', 'workflow', 'sharing'],
    short: 'Upload local commits to a remote repository',
    purpose: `git push uploads local branch commits to a remote repository. The most common
operation in team workflows. Force push variants require care — always use
--force-with-lease instead of --force to prevent overwriting teammates' work.`,
    syntax: [
      { cmd: 'git push origin main',              desc: 'Push main to origin' },
      { cmd: 'git push',                          desc: 'Push current branch to its tracked remote' },
      { cmd: 'git push -u origin <branch>',       desc: 'Push and set upstream tracking' },
      { cmd: 'git push --force-with-lease',       desc: 'Force push safely (checks remote first)' },
      { cmd: 'git push --force',                  desc: '⚠️ Force push — can overwrite teammates\' work' },
      { cmd: 'git push origin --delete <branch>', desc: 'Delete a remote branch' },
      { cmd: 'git push --tags',                   desc: 'Push all local tags to remote' },
      { cmd: 'git push origin v2.1.0',            desc: 'Push a specific tag' },
    ],
    when_to_use: [
      'After committing to share work with the team',
      '--force-with-lease after rebasing a feature branch (never --force on shared branches)',
    ],
    when_not_to_use: [
      '⚠️ --force on main/develop — catastrophic if others have pulled',
      'Before running your test suite',
    ],
    related: ['pull', 'fetch', 'remote', 'branch'],
    internals: 'Sends pack data (missing objects) to the remote, then requests the remote update its refs. Force push bypasses the "fast-forward only" check. --force-with-lease includes the expected SHA of the remote ref — if it differs, the push is rejected.',
    visualization: 'commit',
  },

  fetch: {
    id: 'fetch',
    name: 'git fetch',
    emoji: '⬇️',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['remote', 'sync', 'safe', 'inspection'],
    short: 'Download remote changes without modifying your working tree',
    purpose: `git fetch downloads commits, refs, and objects from a remote repository into your
local remote-tracking branches (origin/main, origin/feature/*) WITHOUT modifying your
working tree or current branch. The safe way to see what the remote has before integrating.`,
    syntax: [
      { cmd: 'git fetch',                     desc: 'Fetch all remotes' },
      { cmd: 'git fetch origin',              desc: 'Fetch from origin specifically' },
      { cmd: 'git fetch origin main',         desc: 'Fetch only main branch from origin' },
      { cmd: 'git fetch --all',               desc: 'Fetch from all configured remotes' },
      { cmd: 'git fetch --prune',             desc: 'Also delete local refs to deleted remote branches' },
      { cmd: 'git fetch --tags',              desc: 'Fetch all tags from remote' },
    ],
    related: ['pull', 'push', 'remote', 'merge'],
    internals: 'Downloads missing commit/tree/blob objects from the remote and updates remote-tracking refs in .git/refs/remotes/. Does NOT modify HEAD, local branches, or working tree.',
    visualization: 'commit',
  },

  diff: {
    id: 'diff',
    name: 'git diff',
    emoji: '🔎',
    category: 'daily',
    difficulty: 'beginner',
    danger: 'safe',
    deprecated: false,
    tags: ['inspection', 'comparison', 'changes', 'review'],
    short: 'Show differences between commits, branches, files, or staging',
    purpose: `git diff compares states in your repository. Without arguments it shows unstaged changes.
With --staged it shows what's queued for the next commit. Indispensable for reviewing
changes before committing or understanding what diverged between branches.`,
    syntax: [
      { cmd: 'git diff',                      desc: 'Unstaged changes (working tree vs index)' },
      { cmd: 'git diff --staged',             desc: 'Staged changes (index vs HEAD commit)' },
      { cmd: 'git diff HEAD',                 desc: 'All changes since last commit' },
      { cmd: 'git diff <sha1> <sha2>',        desc: 'Compare two specific commits' },
      { cmd: 'git diff main..feature',        desc: 'Compare tips of two branches' },
      { cmd: 'git diff main...feature',       desc: 'Changes on feature since it diverged from main' },
      { cmd: 'git diff --stat',               desc: 'Summary: which files changed and by how much' },
      { cmd: 'git diff --word-diff',          desc: 'Inline word-level diff' },
      { cmd: 'git diff -- <file>',            desc: 'Diff a specific file only' },
    ],
    related: ['add', 'commit', 'log', 'show'],
    internals: 'Reads blob objects and applies the Myers diff algorithm to produce unified diff output. --staged reads from .git/index vs HEAD commit tree. Three-dot notation (A...B) finds the merge base first.',
    visualization: 'staging',
  },
};

export const COMMAND_CATEGORIES = {
  daily:    { label: 'Daily Workflow',  color: 'var(--emerald)', desc: 'Commands used in every development session' },
  advanced: { label: 'Advanced',        color: 'var(--amber)',   desc: 'History manipulation, deep debugging, complex workflows' },
  recovery: { label: 'Recovery',        color: 'var(--rose)',    desc: 'Getting out of trouble and recovering lost work' },
};

export const BRANCH_COLORS = {
  'main':          '#6366f1',
  'master':        '#6366f1',
  'feature/auth':  '#22d3ee',
  'feature/ui':    '#10b981',
  'hotfix/login':  '#f59e0b',
  'develop':       '#a855f7',
  'release/2.1':   '#f97316',
  'default':       '#a855f7',
};

export const SAMPLE_REPO = {
  branch: 'main',
  branches: ['main', 'feature/auth', 'hotfix/login'],
  commits: [
    { h: 'a1b2c3d', msg: 'Initial commit', time: '3 days ago',   author: 'Alice' },
    { h: 'b2c3d4e', msg: 'Add user authentication', time: '2 days ago', author: 'Bob' },
    { h: 'c3d4e5f', msg: 'Implement JWT refresh tokens', time: '1 day ago', author: 'Alice' },
    { h: 'd4e5f6g', msg: 'Fix session expiry bug',   time: '4 hours ago', author: 'Charlie' },
  ],
  staged:   [],
  unstaged: ['src/api.js', 'tests/api.test.js'],
  stash:    [],
  head:     'd4e5f6g',
  remote:   'origin',
};

// ────────────────────────────────────────────────────────────
// Utility helpers (used by pages)
// ────────────────────────────────────────────────────────────

/** All commands as array */
export function getAllCommands() {
  return Object.values(COMMANDS)
}

/** Filter by category */
export function getCommandsByCategory(cat) {
  return getAllCommands().filter(c => c.category === cat)
}

/** Filter by difficulty */
export function getCommandsByDifficulty(level) {
  return getAllCommands().filter(c => c.difficulty === level)
}

/** Search by query string */
export function searchCommands(query) {
  if (!query || !query.trim()) return getAllCommands()
  const q = query.toLowerCase()
  return getAllCommands().filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.short || '').toLowerCase().includes(q) ||
    (c.purpose || '').toLowerCase().includes(q) ||
    (c.tags || []).some(t => t.toLowerCase().includes(q))
  )
}

/** Legacy alias */
export const CATEGORIES = COMMAND_CATEGORIES
