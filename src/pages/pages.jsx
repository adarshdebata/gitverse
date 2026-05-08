// ============================================================
// FundamentalsPage
// ============================================================
import { SectionHeader, Collapsible, Alert, CodeBlock, InfoCard } from '@/components/ui/index.jsx'

export function FundamentalsPage() {
  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Git Fundamentals"
        subtitle="The mental models every developer must internalize before using advanced Git features. These are the concepts that make everything else click."
        badge="foundations"
      />

      <Collapsible icon="📜" title="What is Version Control?" defaultOpen>
        <p style={{ marginBottom: 12 }}>
          Version control is a system that records changes to files over time, enabling you to recall
          specific versions later and understand who changed what, when, and why.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <InfoCard icon="🏛️" title="Before Git (CVS, SVN)" accentColor="var(--rose)">
            Centralized server holds all history. Developers check out snapshots.
            Requires network for most operations. Single point of failure.
            Lock-based workflow. Offline work impossible.
          </InfoCard>
          <InfoCard icon="⚡" title="Git (Distributed)" accentColor="var(--emerald)">
            Every clone IS the full repository with complete history.
            Offline commits, branches, merges all work locally.
            Multiple remotes. No single point of failure. Peer-to-peer capable.
          </InfoCard>
        </div>
        <p>Git's radical innovation: every clone is a full backup. "origin" is just a convention.</p>
      </Collapsible>

      <Collapsible icon="🌐" title="Distributed vs Centralized VCS">
        <Alert type="info" style={{ marginBottom: 12 }}>
          In Git, "origin" is just a named remote — a convention, not a special server.
          You can push to multiple remotes, pull from peers, and work entirely offline indefinitely.
        </Alert>
        <CodeBlock code={`# Git thinks about remotes as just named URLs
git remote add origin   https://github.com/company/repo.git
git remote add upstream https://github.com/original/repo.git
git remote add backup   git@backup-server.com:repo.git

# You can push to any of them
git push backup main
git fetch upstream && git rebase upstream/main`} />
      </Collapsible>

      <Collapsible icon="🔄" title="The Three States of Git">
        <p style={{ marginBottom: 16 }}>
          Every tracked file in Git lives in one of three states:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {[
            { state: 'Modified', color: 'var(--amber)',   desc: 'Changed in working directory but NOT staged. Git knows about the file but hasn\'t prepared it for commit.' },
            { state: 'Staged',   color: 'var(--accent)',  desc: 'Marked in the Index (.git/index) to go into the NEXT commit. Exact snapshot of what will be committed.' },
            { state: 'Committed',color: 'var(--emerald)', desc: 'Safely stored in the local Git database as an immutable object with a SHA-1 hash. Permanent record.' },
          ].map(s => (
            <div key={s.state} className="gitverse-card" style={{ padding: 14, borderLeft: `3px solid ${s.color}` }}>
              <strong style={{ color: s.color }}>{s.state}</strong>
              <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 12 }}>{s.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          This maps to three physical areas: Working Tree (disk files), Index (.git/index), Repository (.git/objects).
        </p>
      </Collapsible>

      <Collapsible icon="📍" title="Understanding HEAD — The Key Pointer">
        <p style={{ color: 'var(--muted)', marginBottom: 12 }}>
          HEAD is a special reference that points to the current commit. Most of the time, HEAD is
          "attached" to a branch (pointing to the branch ref, which points to a commit).
        </p>
        <CodeBlock code={`# Attached HEAD (normal state)
$ cat .git/HEAD
ref: refs/heads/main     ← points to branch

# Detached HEAD (dangerous if you commit here)
$ git switch --detach abc123
$ cat .git/HEAD
abc123def456...          ← points directly to commit SHA

# DANGER: commits made in detached HEAD are NOT on any branch
# They'll be orphaned when you switch away
# Save with: git switch -c new-branch`} style={{ marginBottom: 12 }} />
        <Alert type="warn">
          <strong>Detached HEAD:</strong> Any commits you make won't be on any branch.
          They'll appear in reflog for 90 days, then be garbage collected.
          Always run <code>git switch -c branch-name</code> to save your work.
        </Alert>
      </Collapsible>

      <Collapsible icon="⚙️" title="Git Configuration Hierarchy">
        <CodeBlock code={`# Three levels — each overrides the previous:

# 1. System (all users on machine)
git config --system  # /etc/gitconfig

# 2. User (your account — most common)
git config --global  # ~/.gitconfig

# 3. Repository (this repo only — highest priority)
git config --local   # .git/config

# Essential global setup
git config --global user.name  "Your Name"
git config --global user.email "you@company.com"
git config --global init.defaultBranch main
git config --global pull.rebase true       # cleaner than merge commits
git config --global push.default current   # push current branch
git config --global core.editor "code --wait"  # VS Code

# Useful aliases
git config --global alias.st     "status"
git config --global alias.undo   "reset --soft HEAD~1"
git config --global alias.lg     "log --oneline --graph --decorate"
git config --global alias.recent "branch --sort=-committerdate"`} />
      </Collapsible>

      <Collapsible icon="🔑" title="SSH vs HTTPS Authentication">
        <CodeBlock code={`# HTTPS (password/token-based)
git clone https://github.com/company/repo.git
# Requires: personal access token (PAT) or OAuth
# Store credentials: git config --global credential.helper store

# SSH (key-based — recommended for developers)
git clone git@github.com:company/repo.git
# Requires: SSH key pair

# Generate SSH key
ssh-keygen -t ed25519 -C "you@company.com"
# Add to SSH agent
ssh-add ~/.ssh/id_ed25519
# Copy public key to GitHub: cat ~/.ssh/id_ed25519.pub
# Test: ssh -T git@github.com

# Switch existing repo from HTTPS to SSH
git remote set-url origin git@github.com:company/repo.git`} />
      </Collapsible>
    </div>
  )
}

// ============================================================
// InternalsPage
// ============================================================
import { Tabs } from '@/components/ui/index.jsx'
import { useState } from 'react'
import { GitObjectModel } from '@/components/visualizers/index.jsx'

export function InternalsPage() {
  const [tab, setTab] = useState('objects')
  const tabs = [
    { id: 'objects',   label: 'Object Model',   icon: '📦' },
    { id: 'refs',      label: 'References',      icon: '🔗' },
    { id: 'index',     label: 'The Index',       icon: '📋' },
    { id: 'packfiles', label: 'Packfiles & GC',  icon: '📦' },
    { id: 'hooks',     label: 'Git Hooks',       icon: '🪝' },
  ]

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Git Internals"
        subtitle="How Git actually works under the hood. Understanding the object model makes every command make sense — and every error message debuggable."
        badge="deep dive"
      />
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'objects' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 20 }}>
            Every Git object is stored in <code>.git/objects/</code> by its SHA-1 hash.
            Four types: <strong>blob</strong> (file content), <strong>tree</strong> (directory),
            <strong>commit</strong> (snapshot), <strong>tag</strong> (named reference).
          </Alert>
          <GitObjectModel />
          <div style={{ marginTop: 20 }}>
            <InfoCard icon="🔐" title="SHA-1 Content Addressing" accentColor="var(--amber)">
              <p>Git computes: <code>SHA1("blob " + size + "\0" + content)</code></p>
              <p style={{ marginTop: 8 }}>
                Two identical files = same SHA = same blob object = stored ONCE.
                Change one byte anywhere in history and every downstream SHA changes.
                This is what makes Git tamper-evident: you cannot secretly modify history.
              </p>
            </InfoCard>
          </div>
        </div>
      )}

      {tab === 'refs' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 20 }}>
            References are human-readable names for commit SHAs. They live in{' '}
            <code>.git/refs/</code> as plain text files containing a 40-char SHA-1.
            A branch IS just a file containing a SHA. That's all.
          </Alert>
          <CodeBlock code={`# A branch is just a 41-byte file
$ cat .git/refs/heads/main
d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2

# Symbolic refs (HEAD points to a branch)
$ cat .git/HEAD
ref: refs/heads/main

# Remote-tracking refs (cached remote branch tips)
$ cat .git/refs/remotes/origin/main
c3d4e5f6g7h8...

# Tags (annotated = object, lightweight = raw SHA)
$ cat .git/refs/tags/v2.0.0
a1b2c3d4...  (lightweight: just a SHA)
# Annotated tags point to a tag object, not a commit`} style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { type: 'Branch Refs', path: '.git/refs/heads/main', desc: 'A branch = movable pointer to a commit. Creating a branch = writing one 41-byte file. Free and instant.' },
              { type: 'Remote Refs', path: '.git/refs/remotes/origin/main', desc: 'Read-only cached copies of remote branch tips. Updated on git fetch. Never commit directly to these.' },
              { type: 'Tags',        path: '.git/refs/tags/v2.0.0', desc: 'Lightweight: SHA of a commit. Annotated: SHA of a tag object (with message + tagger). Always use annotated for releases.' },
              { type: 'ORIG_HEAD',   path: '.git/ORIG_HEAD', desc: 'Saved by merge, rebase, cherry-pick. Points to pre-operation HEAD. Allows: git reset --hard ORIG_HEAD to undo.' },
            ].map(r => (
              <div key={r.type} className="gitverse-card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 6 }}>{r.type}</div>
                <code style={{ fontSize: 10, color: 'var(--cyan)', display: 'block', marginBottom: 8 }}>{r.path}</code>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'index' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 16 }}>
            The Index (staging area) is a binary file at <code>.git/index</code>.
            It's a sorted list of file paths mapped to blob SHAs, representing
            the <em>next commit's tree</em> before it's committed.
          </Alert>
          <CodeBlock code={`# Inspect the index directly
git ls-files --stage
# Output: mode blob_sha stage_number path
100644 a1b2c3d4e5f6... 0 src/api.js
100644 b2c3d4e5f6g7... 0 src/auth.js
100644 c3d4e5f6g7h8... 0 tests/api.test.js

# Stage numbers:
# 0 = normal (no conflict)
# 1 = base/ancestor (during merge conflict)
# 2 = ours (during merge conflict)
# 3 = theirs (during merge conflict)`} style={{ marginBottom: 16 }} />
          <InfoCard icon="💡" title="Why the Index enables selective staging" accentColor="var(--cyan)">
            <code>git add -p</code> works by reading the index, computing diff against HEAD,
            and letting you choose which diff hunks to write as new partial blob objects.
            The index can have a DIFFERENT version of a file than both HEAD and working tree.
            This three-way divergence is exactly what makes git add -p possible.
          </InfoCard>
        </div>
      )}

      {tab === 'packfiles' && (
        <div className="animate-fade-in">
          <Alert type="warn" style={{ marginBottom: 16 }}>
            Without packfiles, Git stores every version of every file as a separate blob.
            For a 1000-commit repo with a frequently-changed file, that's 1000 blobs.
            Packfiles compress them with delta encoding — storing only differences.
          </Alert>
          <CodeBlock code={`# Manually trigger garbage collection + repacking
git gc
# or more aggressive:
git gc --aggressive --prune=now

# Check object database statistics
git count-objects -vH
# Output:
# count: 0 (loose objects)
# size: 0
# in-pack: 2847
# packs: 1
# size-pack: 1.23 MiB
# prune-packable: 0

# Verify integrity of all objects
git fsck

# Show what gc would clean up
git gc --dry-run`} style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <InfoCard icon="📄" title="Loose Objects" accentColor="var(--cyan)">
              Each object is a separate compressed file in .git/objects/ab/cdef...
              Created immediately on git add/commit. Git auto-packs when count exceeds ~6700.
            </InfoCard>
            <InfoCard icon="📦" title="Packed Objects" accentColor="var(--emerald)">
              .pack + .idx file pairs. Delta compression against similar blobs.
              The .idx allows O(log n) lookup by SHA. Dramatically reduces disk usage.
            </InfoCard>
          </div>
        </div>
      )}

      {tab === 'hooks' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 16 }}>
            Git hooks are scripts in <code>.git/hooks/</code> that fire at lifecycle events.
            They're NOT committed to the repo — use <strong>Husky</strong> or{' '}
            <strong>lefthook</strong> to share them with teams.
          </Alert>
          <div style={{ overflowX: 'auto' }}>
            <table className="comp-table">
              <thead><tr><th>Hook</th><th>Fires</th><th>Exit ≠ 0</th><th>Common Use</th></tr></thead>
              <tbody>
                {[
                  ['pre-commit',        'Before commit created',     'Abort commit',  'Linting, tests, secret scanning'],
                  ['commit-msg',        'After message written',     'Abort commit',  'Conventional Commits enforcement'],
                  ['post-commit',       'After commit created',      'Ignored',       'Notifications, local CI trigger'],
                  ['pre-push',          'Before push to remote',     'Abort push',    'Full test suite, coverage check'],
                  ['pre-rebase',        'Before rebase starts',      'Abort rebase',  'Safety checks on shared branches'],
                  ['post-merge',        'After merge completes',     'Ignored',       'npm install, db migrations'],
                  ['prepare-commit-msg','Before editor opens',       'Abort commit',  'Auto-populate message template'],
                  ['post-checkout',     'After checkout/switch',     'Ignored',       'Update submodules, node_modules'],
                ].map(([h, f, e, u]) => (
                  <tr key={h}>
                    <td><code style={{ color: 'var(--cyan)' }}>{h}</code></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{f}</td>
                    <td style={{ fontSize: 12, color: 'var(--amber)' }}>{e}</td>
                    <td style={{ fontSize: 12 }}>{u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CodeBlock code={`# Install Husky for team-wide hooks
npm install --save-dev husky
npx husky init

# .husky/pre-commit
#!/bin/sh
npx lint-staged

# .husky/commit-msg
#!/bin/sh
npx --no -- commitlint --edit $1

# .husky/pre-push
#!/bin/sh
npm test`} style={{ marginTop: 16 }} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// WorkflowsPage
// ============================================================
export function WorkflowsPage() {
  const [tab, setTab] = useState('gitflow')
  const tabs = [
    { id: 'gitflow',       label: 'GitFlow' },
    { id: 'trunk',         label: 'Trunk-Based Dev' },
    { id: 'commits',       label: 'Commit Conventions' },
    { id: 'mergestrats',   label: 'Merge Strategies' },
    { id: 'monorepo',      label: 'Monorepos' },
    { id: 'forcepush',     label: 'Force Push Safety' },
  ]

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Workflows & Patterns"
        subtitle="Real-world branching strategies, commit conventions, and enterprise patterns used by teams at scale."
        badge="production patterns"
      />
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {tab === 'gitflow' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 20 }}>
            GitFlow works best for <strong>scheduled-release software</strong> (mobile apps, desktop software,
            versioned APIs). For SaaS with continuous delivery, Trunk-Based Development is usually better.
          </Alert>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <h3 className="font-heading" style={{ fontWeight: 700, marginBottom: 12 }}>Branch Types</h3>
              {[
                { b: 'main',        c: 'var(--accent)',  desc: 'Production-only. Every commit is a tagged release.' },
                { b: 'develop',     c: 'var(--emerald)', desc: 'Integration branch. All features merge here first.' },
                { b: 'feature/*',   c: 'var(--cyan)',    desc: 'New features. Branch from develop, merge to develop.' },
                { b: 'release/*',   c: 'var(--amber)',   desc: 'Release prep. Bug fixes only. Merges to main + develop.' },
                { b: 'hotfix/*',    c: 'var(--rose)',    desc: 'Critical prod fixes. From main, merges to main + develop.' },
              ].map(b => (
                <div key={b.b} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontFamily: 'IBM Plex Mono',
                    fontSize: 11, background: `${b.c}20`, color: b.c, flexShrink: 0 }}>
                    {b.b}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 2 }}>{b.desc}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-heading" style={{ fontWeight: 700, marginBottom: 12 }}>When to Use GitFlow</h3>
              <InfoCard icon="✅" title="Good fit" accentColor="var(--emerald)" style={{ marginBottom: 10 }}>
                Scheduled releases. Multiple versions maintained. Large teams with dedicated QA/release cycles.
                Mobile apps. Packaged software. Versioned public APIs.
              </InfoCard>
              <InfoCard icon="❌" title="Poor fit" accentColor="var(--rose)">
                SaaS / continuous delivery. Small teams. Rapid iteration.
                Overhead outweighs benefits. Leads to long-lived merge-conflict-prone branches.
              </InfoCard>
            </div>
          </div>
          <CodeBlock code={`# GitFlow CLI (optional tool)
git flow init
git flow feature start user-auth
# ... develop ...
git flow feature finish user-auth  # merges to develop

git flow release start v2.0.0
# ... fix release bugs only ...
git flow release finish v2.0.0    # merges to main + develop, creates tag`} />
        </div>
      )}

      {tab === 'trunk' && (
        <div className="animate-fade-in">
          <Alert type="success" style={{ marginBottom: 20 }}>
            <strong>Trunk-Based Development</strong> is used by Google (Piper), Meta, Netflix, Amazon.
            Everyone integrates to main at least daily. Feature flags gate incomplete work.
          </Alert>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <InfoCard icon="⚡" title="Core Principles" accentColor="var(--emerald)">
              • Short-lived branches (&lt;1 day ideally)<br />
              • Commit to main at least daily<br />
              • Feature flags for incomplete work<br />
              • CI must pass before any merge<br />
              • No long-lived feature branches<br />
              • Pair programming or pair reviews
            </InfoCard>
            <InfoCard icon="🔧" title="Required Infrastructure" accentColor="var(--accent)">
              • Fast automated test suite (&lt;10 min)<br />
              • Feature toggle system (LaunchDarkly, etc.)<br />
              • Deployment pipeline (canary deployments)<br />
              • Branch-by-abstraction for large changes<br />
              • Comprehensive observability
            </InfoCard>
          </div>
          <CodeBlock code={`# Trunk-based workflow
git switch main && git pull --rebase
git switch -c feat/add-oauth  # short-lived: hours to 1 day

# ... small, focused commits ...
git commit -m "feat(auth): add OAuth provider interface"
git commit -m "feat(auth): implement Google OAuth2 flow"

# Feature is behind a flag
if (featureFlags.GOOGLE_OAUTH_ENABLED) {
  // new code
}

git push origin feat/add-oauth
# PR → CI green → squash merge → delete branch
# Feature invisible until flag enabled for %users`} />
        </div>
      )}

      {tab === 'commits' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 16 }}>
            Conventional Commits: <code>type(scope): description</code>.
            Enables automatic CHANGELOG generation and semantic versioning with semantic-release.
          </Alert>
          <table className="comp-table" style={{ marginBottom: 20 }}>
            <thead><tr><th>Type</th><th>Usage</th><th>Version Bump</th><th>Example</th></tr></thead>
            <tbody>
              {[
                ['feat',            'New user-facing feature',    'minor', 'feat(auth): add OAuth2 Google login'],
                ['fix',             'Bug fix',                    'patch', 'fix(api): handle null response in /users'],
                ['BREAKING CHANGE', 'Breaking API change',        'MAJOR', 'feat!: remove deprecated /v1 endpoints'],
                ['docs',            'Documentation only',         'none',  'docs: update authentication guide'],
                ['refactor',        'Code change, no behavior',   'none',  'refactor(db): extract query builder'],
                ['perf',            'Performance improvement',    'patch', 'perf(query): add composite index on email'],
                ['test',            'Tests only',                 'none',  'test(auth): add JWT expiry edge cases'],
                ['chore',           'Build, deps, config',        'none',  'chore(deps): upgrade axios to 1.6.0'],
                ['ci',              'CI configuration',           'none',  'ci: add parallel test matrix'],
              ].map(([type, use, bump, ex]) => (
                <tr key={type}>
                  <td><code style={{ color: 'var(--cyan)' }}>{type}</code></td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{use}</td>
                  <td>
                    <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', padding: '2px 6px',
                      borderRadius: 4, background: bump === 'MAJOR' ? 'var(--rose-dim)' :
                        bump === 'minor' ? 'var(--amber-dim)' : bump === 'patch' ? 'var(--emerald-dim)' : 'var(--surface)',
                      color: bump === 'MAJOR' ? 'var(--rose)' : bump === 'minor' ? 'var(--amber)' :
                        bump === 'patch' ? 'var(--emerald)' : 'var(--muted)' }}>
                      {bump}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: 'var(--text)' }}>{ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <CodeBlock code={`# Enforce with commitlint
npm install --save-dev @commitlint/cli @commitlint/config-conventional

# commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] }

# Add to Husky pre-commit hook
npx --no -- commitlint --edit $1

# Automate releases with semantic-release
npm install --save-dev semantic-release
# Reads commit types → bumps version → generates CHANGELOG → publishes`} />
        </div>
      )}

      {tab === 'mergestrats' && (
        <div className="animate-fade-in">
          <table className="comp-table" style={{ marginBottom: 20 }}>
            <thead><tr><th>Strategy</th><th>History</th><th>Commits Created</th><th>Best For</th></tr></thead>
            <tbody>
              {[
                ['Merge commit',    'Preserves all history with merge node', '1 merge commit (+ all originals)', 'GitFlow, feature branches needing context'],
                ['Squash merge',    'Linear — one commit per PR', '1 commit (all changes squashed)', 'Clean main, trunk-based dev, code review'],
                ['Rebase merge',    'Linear — all commits inlined with new SHAs', 'n commits (new SHAs)', 'Linear + full granularity, small PRs'],
                ['Fast-forward',    'Linear — no merge commit at all', '0 extra (pointer moves)', 'Small branches, no divergence'],
              ].map(([strat, hist, commits, use]) => (
                <tr key={strat}>
                  <td style={{ fontWeight: 600 }}>{strat}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{hist}</td>
                  <td style={{ fontSize: 12, fontFamily: 'IBM Plex Mono', color: 'var(--cyan)' }}>{commits}</td>
                  <td style={{ fontSize: 12 }}>{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Alert type="warn">
            <strong>Pick ONE and enforce it.</strong> Mixing strategies in a repo makes git log
            and git bisect unreliable. Configure in GitHub/GitLab branch protection rules.
          </Alert>
        </div>
      )}

      {tab === 'monorepo' && (
        <div className="animate-fade-in">
          <Alert type="info" style={{ marginBottom: 16 }}>
            Monorepos (single repo, multiple packages/apps) need specialized Git tooling.
            Key challenges: large history, slow clones, noisy git log, partial ownership.
          </Alert>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <h3 className="font-heading" style={{ fontWeight: 700, marginBottom: 10 }}>Sparse Checkout</h3>
              <CodeBlock code={`# Only checkout needed directories
git clone --filter=blob:none --sparse <url>
git sparse-checkout init --cone
git sparse-checkout set apps/frontend packages/ui

# See what's checked out
git sparse-checkout list`} />
            </div>
            <div>
              <h3 className="font-heading" style={{ fontWeight: 700, marginBottom: 10 }}>Partial Clone</h3>
              <CodeBlock code={`# Treeless: no file blobs upfront
git clone --filter=tree:0 <url>

# Blobless: no file content upfront
git clone --filter=blob:none <url>

# Objects fetched on demand
# Reduces clone time dramatically`} />
            </div>
          </div>
          <CodeBlock code={`# CODEOWNERS for monorepo ownership
# .github/CODEOWNERS
apps/frontend/            @frontend-team
apps/backend/             @backend-team
packages/shared/          @architecture @frontend-team
*.security.ts             @security-team
/infrastructure/          @devops-team
/docs/                    @docs-team`} />
        </div>
      )}

      {tab === 'forcepush' && (
        <div className="animate-fade-in">
          <Alert type="danger" style={{ marginBottom: 20 }}>
            <strong>git push --force</strong> overwrites remote history WITHOUT checking if
            anyone has pushed since your last fetch. This can destroy teammates' work.
            <strong> Always use --force-with-lease instead.</strong>
          </Alert>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <InfoCard icon="🚫" title="--force (dangerous)" accentColor="var(--rose)">
              Overwrites remote regardless of its current state.
              If a teammate pushed after your last fetch, their commits are gone.
              The only safe use is on your personal fork where you're the only committer.
            </InfoCard>
            <InfoCard icon="✅" title="--force-with-lease (safe)" accentColor="var(--emerald)">
              Checks that the remote hasn't changed since you last fetched.
              If someone else pushed, your push is rejected with a clear error.
              Use this for all force pushes without exception.
            </InfoCard>
          </div>
          <CodeBlock code={`# NEVER:
git push --force origin main  # dangerous!
git push -f origin main       # same thing!

# ALWAYS:
git push --force-with-lease origin feat/auth
# If remote changed: rejected → git pull --rebase then retry

# Configure alias:
git config --global alias.fpush "push --force-with-lease"

# Prevent accidental --force on protected branches (GitHub):
# Settings → Branches → Branch protection rules
# ✓ "Require linear history"
# ✓ "Restrict force pushes"`} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// RecoveryPage
// ============================================================
export function RecoveryPage() {
  const scenarios = [
    {
      icon: '💥', title: 'Accidental git reset --hard', severity: 'critical',
      steps: [
        'STAY CALM — commits live in reflog for 90 days',
        'git reflog  →  find HEAD@{n} — the state before the reset',
        'git reset --hard HEAD@{n}  OR  git checkout -b recovery HEAD@{n}',
        'git log --oneline  →  verify your commits are restored',
      ],
      cmd: `git reflog\n# Find: HEAD@{2}: commit: your last good commit\ngit reset --hard HEAD@{2}\n# Or create a rescue branch:\ngit checkout -b rescue HEAD@{2}`,
    },
    {
      icon: '🗑️', title: 'Deleted branch (not pushed)', severity: 'high',
      steps: [
        'git reflog --all  →  find the tip commit of the deleted branch',
        'git checkout -b <branch-name> <sha>  →  recreate the branch',
        'git push -u origin <branch-name>  →  push if needed',
      ],
      cmd: `git reflog --all | grep "branch-name"\n# Or search all: git reflog | grep "commit:"\ngit checkout -b recovered-feature abc123d\ngit push -u origin recovered-feature`,
    },
    {
      icon: '🔀', title: 'Force-pushed over teammate\'s work', severity: 'critical',
      steps: [
        'Ask teammates if they still have the original commits locally',
        'Teammate: git push --force-with-lease origin main (from their copy)',
        'Or collect commits from everyone who pulled, using their reflogs',
        'LESSON: Always use --force-with-lease and enable branch protection',
      ],
      cmd: `# Prevention (should have done this):
git push --force-with-lease origin main  # not --force

# Recovery if team member has old version:
# Teammate runs: git push origin main (from their local copy)
# Then you: git pull --rebase origin main`,
    },
    {
      icon: '📌', title: 'Lost commits in detached HEAD state', severity: 'medium',
      steps: [
        'git reflog  →  find your detached HEAD commits (they show as HEAD@{n})',
        'git switch -c save-my-work <sha>  →  create branch to rescue them',
        'Your commits are now on a branch — not orphaned anymore',
      ],
      cmd: `git reflog\n# Find: HEAD@{3}: commit: my-important-work\ngit switch -c rescue-branch HEAD@{3}\n# Commits are now on rescue-branch — safe!`,
    },
    {
      icon: '🔀', title: 'Reverting a bad merge commit', severity: 'medium',
      steps: [
        'git log --oneline  →  identify the merge commit SHA',
        'git revert -m 1 <merge-sha>  (-m 1 keeps mainline/parent 1)',
        'Creates a revert commit — history preserved, bad code undone',
        'Note: to re-apply the branch later, revert the revert first',
      ],
      cmd: `git log --oneline --graph | grep "Merge"\ngit revert -m 1 abc123merge\ngit push origin main\n\n# Later, to re-apply the merged branch:\ngit revert <revert-of-merge-sha>  # revert the revert\ngit merge feature-branch          # now merge cleanly`,
    },
    {
      icon: '🔐', title: '⚠️ Accidentally committed secrets/credentials', severity: 'critical',
      steps: [
        '1️⃣ IMMEDIATELY rotate the exposed credential (assume compromised)',
        '2️⃣ Install git-filter-repo: pip install git-filter-repo',
        '3️⃣ git filter-repo --invert-paths --path secrets.env (rewrites ALL history)',
        '4️⃣ git push --force-with-lease --all  (update all branches)',
        '5️⃣ Notify ALL collaborators to delete and re-clone',
        '6️⃣ Add to .gitignore immediately to prevent recurrence',
      ],
      cmd: `# Step 1: ROTATE THE CREDENTIAL NOW (before anything else)

# Step 2: Purge from all history
pip install git-filter-repo
git filter-repo --invert-paths --path .env
git filter-repo --invert-paths --path secrets.json

# Step 3: Force update ALL branches and tags
git push origin --force --all
git push origin --force --tags

# Step 4: Everyone must re-clone (their copies still have the secret)
# Send team: "git clone <url>" (NOT git pull)

# Step 5: Prevent future incidents
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore
# Install: git-secrets or gitleaks`,
    },
  ]

  const severityColor = { critical: 'var(--rose)', high: 'var(--amber)', medium: 'var(--cyan)' }

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Disaster Recovery"
        subtitle="Step-by-step recovery guides for every Git catastrophe. Bookmark this page — you'll need it someday."
        badge="emergency guide"
      />

      <Alert type="info" style={{ marginBottom: 28 }}>
        <span>
          <strong>Git is very safe by design.</strong> Most "disasters" are fully recoverable via{' '}
          <code>git reflog</code>. Your commits survive for 90 days after becoming unreachable.
          The one true exception: <strong>never commit credentials</strong> — rotate immediately if you do.
        </span>
      </Alert>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {scenarios.map((s, i) => (
          <div
            key={i}
            className="gitverse-card"
            style={{ padding: 20, borderLeft: `3px solid ${severityColor[s.severity]}` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <h3 className="font-heading" style={{ fontWeight: 700, fontSize: 16 }}>{s.title}</h3>
                  <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                    fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: `${severityColor[s.severity]}20`, color: severityColor[s.severity],
                    border: `1px solid ${severityColor[s.severity]}50` }}>
                    {s.severity}
                  </span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  {s.steps.map((step, si) => (
                    <div key={si} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: severityColor[s.severity], fontWeight: 700,
                        flexShrink: 0, fontFamily: 'IBM Plex Mono' }}>
                        {si + 1}.
                      </span>
                      <span style={{ color: 'var(--muted)' }}>{step}</span>
                    </div>
                  ))}
                </div>

                <CodeBlock code={s.cmd} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// ComparePage
// ============================================================
export function ComparePage() {
  const [tab, setTab] = useState('merge-vs-rebase')
  const tabs = [
    { id: 'merge-vs-rebase',   label: 'merge vs rebase' },
    { id: 'reset-vs-revert',   label: 'reset vs revert' },
    { id: 'switch-vs-checkout',label: 'switch vs checkout' },
    { id: 'fetch-vs-pull',     label: 'fetch vs pull' },
    { id: 'github-vs-gitlab',  label: 'GitHub vs GitLab' },
  ]

  const comparisons = {
    'merge-vs-rebase': {
      left: 'git merge', right: 'git rebase',
      rows: [
        ['History',           'Preserves complete history with merge commits',          'Rewrites history — linear, clean'],
        ['Safety',            '✅ Safe to use on shared branches',                       '⚠️ Never rebase shared branches'],
        ['Merge commits',     'Creates a merge commit node',                            'No merge commit — linear'],
        ['Traceability',      'Clear when branches diverged and merged',                'Harder to trace original feature branch'],
        ['Conflicts',         'Resolved once during merge',                             'Resolved per-commit during replay'],
        ['SHA rewriting',     '❌ No rewriting',                                        '⚠️ All rebased commits get new SHAs'],
        ['Use case',          'GitFlow, preserving full context, shared branches',      'Feature cleanup before PR, local branches'],
        ['Force push needed', 'No',                                                     'Yes — after rebasing a pushed branch'],
      ],
    },
    'reset-vs-revert': {
      left: 'git reset', right: 'git revert',
      rows: [
        ['History',           '⚠️ Rewrites history — commit disappears',               '✅ Creates new commit — history preserved'],
        ['Shared branches',   '⚠️ NEVER on pushed/shared commits',                    '✅ Safe on any branch, any time'],
        ['Audit trail',       'Commit removed from log',                               'Both original + undo visible in log'],
        ['Use case',          'Local cleanup before push',                             'Undoing deployed changes safely'],
        ['Recovery',          'Via reflog (90-day window)',                            'No recovery needed — history preserved'],
        ['Enterprise',        '⚠️ Avoid on shared history',                           '✅ Preferred — full audit trail'],
        ['Complexity',        'Simple (one command)',                                  'Can be complex for merge commits (-m 1)'],
      ],
    },
    'switch-vs-checkout': {
      left: 'git switch', right: 'git checkout',
      rows: [
        ['Introduced',        'Git 2.23 (2019)',                                        'Ancient Git (still works)'],
        ['Purpose',           'Branch switching ONLY — single responsibility',          'Both branches AND file restoration (overloaded)'],
        ['Safety',            'Refuses to overwrite uncommitted changes',              'Can silently overwrite with -f'],
        ['Error messages',    'Clear, specific error messages',                        'Confusing dual-behavior errors'],
        ['Detach HEAD',       'git switch --detach <commit>',                          'git checkout <commit> (also works)'],
        ['Create branch',     'git switch -c <branch>',                               'git checkout -b <branch>'],
        ['File restoration',  'Use git restore instead',                              'git checkout -- <file>  (confusing)'],
        ['Recommendation',    '✅ Use for all branch operations',                      '⚠️ Use switch/restore instead'],
      ],
    },
    'fetch-vs-pull': {
      left: 'git fetch', right: 'git pull',
      rows: [
        ['What it does',      'Downloads remote changes only (no integration)',        'Downloads + integrates (fetch + merge/rebase)'],
        ['Working tree',      '✅ Never modified',                                     'Updated to merged/rebased state'],
        ['Safe to run anytime','✅ Always 100% safe',                                  'May cause conflicts or unwanted merge commits'],
        ['Control',           'Maximum — review before integrating',                  'Convenient but less control'],
        ['Typical use',       'See what changed → decide how to integrate',           'Quick sync when working tree is clean'],
        ['Best practice',     'git fetch → git log origin/main → git rebase',         'git pull --rebase (avoids merge commits)'],
        ['Team awareness',    'Lets you see others\' work before integration',        'Integrates immediately without review'],
      ],
    },
    'github-vs-gitlab': {
      left: 'GitHub', right: 'GitLab',
      rows: [
        ['Primary focus',     'Code collaboration & developer community',              'Full DevOps platform'],
        ['CI/CD',             'GitHub Actions (excellent, marketplace ecosystem)',     'GitLab CI/CD (built-in, very mature)'],
        ['Self-hosting',      'GitHub Enterprise Server (paid only)',                  'GitLab CE (free) or EE (paid)'],
        ['Issue tracking',    'Basic issues + Projects (Kanban)',                      'Advanced: epics, roadmaps, OKRs'],
        ['Container registry','ghcr.io (GitHub Container Registry)',                  'Built-in per-project registry'],
        ['Security scanning', 'Via Actions marketplace + partners',                   'Built-in SAST/DAST/dependency scanning'],
        ['Package registry',  'GitHub Packages',                                      'Built-in package registry (all formats)'],
        ['Best for',          'OSS community, developer tools, Microsoft ecosystem',  'Enterprise, regulated industries, self-host needs'],
      ],
    },
  }

  const comp = comparisons[tab]

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Comparisons"
        subtitle="Side-by-side comparisons of Git commands and platforms that are commonly confused or debated."
        badge="reference"
      />
      <Tabs tabs={tabs} activeTab={tab} onTabChange={setTab} />

      {comp && (
        <div className="animate-fade-in">
          <div style={{ overflowX: 'auto' }}>
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th style={{ color: 'var(--accent)' }}>{comp.left}</th>
                  <th style={{ color: 'var(--cyan)' }}>{comp.right}</th>
                </tr>
              </thead>
              <tbody>
                {comp.rows.map(([dim, l, r], i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--muted)' }}>{dim}</td>
                    <td style={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: l }} />
                    <td style={{ fontSize: 12 }} dangerouslySetInnerHTML={{ __html: r }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// VisualizersPage
// ============================================================
import { StagingViz } from '@/components/visualizers/index.jsx'
import { ReflogViz }  from '@/components/visualizers/index.jsx'

export function VisualizersPage() {
  const [active, setActive] = useState('staging')
  const items = [
    { id: 'staging',  label: 'Staging Area',    icon: '📦', Comp: StagingViz },
    { id: 'rebase',   label: 'Rebase',          icon: '🔁', Comp: RebaseViz },
    { id: 'reset',    label: 'Reset Modes',     icon: '⏪', Comp: ResetViz },
    { id: 'stash',    label: 'Stash',           icon: '🗃️', Comp: StashViz },
    { id: 'reflog',   label: 'Reflog',          icon: '🔍', Comp: ReflogViz },
    { id: 'merge',    label: 'Merge Conflict',  icon: '⚔️', Comp: MergeConflictViz },
    { id: 'bisect',   label: 'Bisect',          icon: '🔬', Comp: BisectViz },
    { id: 'objects',  label: 'Object Model',    icon: '⚙️', Comp: GitObjectModel },
  ]

  const ActiveComp = items.find(i => i.id === active)?.Comp

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Visual Explainers"
        subtitle="Interactive, step-by-step visualizations of Git's most complex operations. Each one is animated and fully explorable."
        badge="8 visualizers"
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {items.map(item => (
          <button
            key={item.id}
            className={`btn ${active === item.id ? 'btn-primary' : ''}`}
            onClick={() => setActive(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {ActiveComp && (
        <div className="animate-fade-in">
          <ActiveComp />
        </div>
      )}
    </div>
  )
}
