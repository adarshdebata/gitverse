import { useState } from "react";
import {
  FolderOpen,
  ClipboardList,
  Database,
  Tag,
  Archive,
  FileText,
  GitCommit,
  Bug,
} from "lucide-react";
import CommitGraph from "@/components/graphs/CommitGraph";
import { Alert, Badge, CodeBlock, StepProgress, VizCanvas } from "@/components/ui/index.jsx";

// ============================================================
// Shared step controls
// ============================================================
function StepControls({ step, maxStep, onPrev, onNext, onReset, label }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
    >
      <button className="btn" onClick={onReset}>
        ↺ Reset
      </button>
      <button className="btn" onClick={onPrev} disabled={step === 0}>
        ← Prev
      </button>
      <button className="btn btn-primary" onClick={onNext} disabled={step === maxStep}>
        Next →
      </button>
      {label && (
        <span style={{ color: "var(--muted)", fontSize: 12, fontFamily: "IBM Plex Mono" }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ============================================================
// StagingViz — git add animation
// ============================================================
const STAGING_STEPS = [
  {
    cmd: null,
    desc: "You have modified files in your working directory. The staging area (index) is empty.",
    working: ["src/api.js (modified)", "src/auth.js (modified)", "tests/api.test.js (new)"],
    staged: [],
    history: ["Initial commit", "Add user model"],
  },
  {
    cmd: "git add src/api.js src/auth.js",
    desc: "git add moves file snapshots into the staging area. Only the selected files — not tests yet.",
    working: ["tests/api.test.js (new)"],
    staged: ["src/api.js", "src/auth.js"],
    history: ["Initial commit", "Add user model"],
  },
  {
    cmd: "git add tests/api.test.js",
    desc: "Now all three files are staged. Git has written blob objects for each file into .git/objects/.",
    working: [],
    staged: ["src/api.js", "src/auth.js", "tests/api.test.js"],
    history: ["Initial commit", "Add user model"],
  },
  {
    cmd: 'git commit -m "feat: add JWT authentication"',
    desc: "Commit creates a tree object + commit object. The staging area is cleared. HEAD moves to the new commit.",
    working: [],
    staged: [],
    history: ["Initial commit", "Add user model", "feat: add JWT authentication ← HEAD"],
  },
];

export function StagingViz() {
  const [step, setStep] = useState(0);
  const s = STAGING_STEPS[step];

  const Zone = ({ label, icon, color, files, placeholder }) => (
    <div
      className="gitverse-card"
      style={{
        padding: 12,
        borderColor: files.length > 0 ? color : "var(--border)",
        transition: "border-color 0.4s ease",
        minHeight: 110,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: files.length > 0 ? color : "var(--muted)",
          marginBottom: 10,
          fontFamily: "IBM Plex Mono",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          transition: "color 0.4s ease",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span> {label}
      </div>
      {files.length === 0 ? (
        <div style={{ color: "var(--dim)", fontSize: 11, fontFamily: "IBM Plex Mono" }}>
          {placeholder}
        </div>
      ) : (
        files.map((f, i) => (
          <div
            key={i}
            className="animate-slide-r"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 5,
              animationDelay: `${i * 60}ms`,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }}
            />
            <span style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: "var(--text)" }}>
              {f}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div>
      <StepControls
        step={step}
        maxStep={STAGING_STEPS.length - 1}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onReset={() => setStep(0)}
        label={`Step ${step + 1}/${STAGING_STEPS.length}`}
      />

      {s.cmd && <CodeBlock code={s.cmd} className="mb-3" style={{ marginBottom: 12 }} />}

      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14, lineHeight: 1.65 }}>
        {s.desc}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr auto 1fr",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Zone
          label="Working Directory"
          icon={<FolderOpen size={14} />}
          color="var(--cyan)"
          files={s.working}
          placeholder="(clean)"
        />
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: step >= 1 ? "var(--accent)" : "var(--dim)",
            fontFamily: "IBM Plex Mono",
            transition: "color 0.4s",
            lineHeight: 1.6,
            padding: "0 4px",
          }}
        >
          git add
          <br />→
        </div>
        <Zone
          label="Staging Area (Index)"
          icon={<ClipboardList size={14} />}
          color="var(--accent)"
          files={s.staged}
          placeholder="(empty)"
        />
        <div
          style={{
            textAlign: "center",
            fontSize: 10,
            color: step >= 3 ? "var(--emerald)" : "var(--dim)",
            fontFamily: "IBM Plex Mono",
            transition: "color 0.4s",
            lineHeight: 1.6,
            padding: "0 4px",
          }}
        >
          git commit
          <br />→
        </div>
        <Zone
          label="Repository (.git)"
          icon={<Database size={14} />}
          color="var(--emerald)"
          files={s.history}
          placeholder="(no commits)"
        />
      </div>

      <StepProgress current={step} total={STAGING_STEPS.length} />
    </div>
  );
}

// ============================================================
// RebaseViz — step-by-step rebase animation
// ============================================================
const REBASE_STEPS = [
  {
    title: "Before Rebase",
    desc: "Feature branch (feature/auth) branched off main at commit B. Meanwhile, main advanced to commit C with new work. The branches have diverged.",
    scenario: "rebase_before",
    callout: null,
  },
  {
    title: "Detaching Commits",
    desc: 'Git identifies commits D and E on feature/auth. It saves each as a patch (diff) and temporarily detaches them. The branch is now "floating".',
    scenario: "rebase_before",
    callout: {
      type: "warn",
      text: "Commits D and E are saved as patches. Their SHAs will change.",
    },
  },
  {
    title: "Replaying on New Base",
    desc: "Git applies each saved patch on top of C (the new base). A new commit D' is created — identical changes, but with a new SHA (different parent pointer).",
    scenario: "rebase_after",
    callout: {
      type: "info",
      text: "D' and E' have new SHAs. Same code changes. Different hashes.",
    },
  },
  {
    title: "Rebase Complete — Linear History",
    desc: "feature/auth now sits on top of main's latest commit C. History is perfectly linear. If merged with fast-forward, no merge commit is needed.",
    scenario: "rebase_after",
    callout: {
      type: "warn",
      text: "SHAs changed — git push --force-with-lease required if already pushed.",
    },
  },
];

export function RebaseViz() {
  const [step, setStep] = useState(0);
  const s = REBASE_STEPS[step];

  return (
    <div>
      <StepControls
        step={step}
        maxStep={REBASE_STEPS.length - 1}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onReset={() => setStep(0)}
        label={`Step ${step + 1}/${REBASE_STEPS.length}: ${s.title}`}
      />

      <div className="gitverse-card" style={{ padding: 16, marginBottom: 14 }}>
        <div
          className="font-heading"
          style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "var(--accent)" }}
        >
          {s.title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.7,
            marginBottom: s.callout ? 12 : 0,
          }}
        >
          {s.desc}
        </p>
        {s.callout && <Alert type={s.callout.type}>{s.callout.text}</Alert>}
      </div>

      <VizCanvas minHeight={200}>
        <CommitGraph scenario={s.scenario} animated={false} />
      </VizCanvas>

      <StepProgress current={step} total={REBASE_STEPS.length} />

      {step === REBASE_STEPS.length - 1 && (
        <div className="animate-fade-in" style={{ marginTop: 14 }}>
          <CodeBlock
            code={`git switch feat/auth\ngit fetch origin\ngit rebase origin/main\n# resolve any conflicts...\ngit push --force-with-lease  # required after rebase`}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// ResetViz — soft / mixed / hard mode visualization
// ============================================================
const RESET_MODES = ["--soft", "--mixed", "--hard"];

const RESET_MODE_DATA = {
  "--soft": {
    head: { label: "HEAD", affected: true, result: "Moved back 1 commit" },
    index: {
      label: "Index (Staging)",
      affected: false,
      result: "Unchanged — changes still staged",
    },
    working: { label: "Working Tree", affected: false, result: "Unchanged — your files intact" },
    desc: "Undo commit. Changes stay staged — you can immediately re-commit differently.",
    use: "Restructure last commit: split it, reword it, re-stage selectively.",
    danger: "easy",
    cmd: "git reset --soft HEAD~1",
  },
  "--mixed": {
    head: { label: "HEAD", affected: true, result: "Moved back 1 commit" },
    index: { label: "Index (Staging)", affected: true, result: "Reset to HEAD — changes unstaged" },
    working: { label: "Working Tree", affected: false, result: "Unchanged — your files intact" },
    desc: "Undo commit and unstage everything. Changes remain in your working directory.",
    use: "Undo commit to re-stage files differently with git add -p.",
    danger: "easy",
    cmd: "git reset HEAD~1  # or git reset --mixed HEAD~1",
  },
  "--hard": {
    head: { label: "HEAD", affected: true, result: "Moved back 1 commit" },
    index: { label: "Index (Staging)", affected: true, result: "Reset to HEAD — staging cleared" },
    working: { label: "Working Tree", affected: true, result: "Reset to HEAD — CHANGES LOST" },
    desc: "DESTRUCTIVE: Moves HEAD, resets staging, resets all files. Changes are gone.",
    use: "Sync to remote, discard all local divergence. Emergency cleanup.",
    danger: "high",
    cmd: "git reset --hard HEAD~1",
  },
};

export function ResetViz() {
  const [mode, setMode] = useState("--soft");
  const data = RESET_MODE_DATA[mode];

  const TreeLayer = ({ layer, icon }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        transition: "all 0.3s ease",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0, color: "var(--muted)" }}>{icon}</span>
      <div
        className="gitverse-card"
        style={{
          flex: 1,
          padding: "10px 14px",
          borderColor: layer.affected
            ? data.danger === "high" && layer.label.includes("Working")
              ? "var(--rose)"
              : "var(--amber)"
            : "var(--border)",
          background: layer.affected
            ? data.danger === "high" && layer.label.includes("Working")
              ? "var(--rose-dim)"
              : "var(--amber-dim)"
            : "var(--card)",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{layer.label}</span>
          <Badge
            variant={
              layer.affected
                ? data.danger === "high" && layer.label.includes("Working")
                  ? "high"
                  : "medium"
                : "safe"
            }
          >
            {layer.affected ? "RESET" : "UNCHANGED"}
          </Badge>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{layer.result}</div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {RESET_MODES.map((m) => (
          <button
            key={m}
            className={`btn ${mode === m ? "btn-primary" : ""}`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <Alert
        type={data.danger === "high" ? "danger" : data.danger === "easy" ? "success" : "warn"}
        className="mb-3"
        style={{ marginBottom: 14 }}
      >
        <span>{data.desc}</span>
      </Alert>

      {/* Three-tree visualization */}
      <div style={{ marginBottom: 16 }}>
        <TreeLayer layer={data.head} icon={<Tag size={20} />} />
        <TreeLayer layer={data.index} icon={<ClipboardList size={20} />} />
        <TreeLayer layer={data.working} icon={<FolderOpen size={20} />} />
      </div>

      <div
        style={{
          marginBottom: 12,
          padding: 12,
          background: "var(--surface)",
          borderRadius: 8,
          border: "1px solid var(--border)",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--text)" }}>Best use:</strong> {data.use}
      </div>

      <CodeBlock code={data.cmd} />

      {mode === "--hard" && (
        <div className="animate-fade-in" style={{ marginTop: 12 }}>
          <Alert type="info">
            <strong>Recovery:</strong> If you reset --hard by accident, check{" "}
            <code>git reflog</code> — commits survive for 90 days. Then:{" "}
            <code>git reset --hard HEAD@{"{n}"}</code>
          </Alert>
        </div>
      )}
    </div>
  );
}

// ============================================================
// StashViz — push/pop animation
// ============================================================
const STASH_STEPS = [
  {
    cmd: null,
    desc: "Working directory has in-progress changes. You need to urgently fix a bug on another branch.",
    stash: [],
    working: ["src/api.js (half-finished auth)", "src/auth.js (new — WIP)"],
    branch: "feat/auth",
  },
  {
    cmd: 'git stash push -m "wip: auth refactor in progress"',
    desc: "git stash saves your changes as a special commit stack. Working directory is now clean.",
    stash: ["stash@{0}: wip: auth refactor in progress"],
    working: [],
    branch: "feat/auth",
  },
  {
    cmd: "git switch hotfix/critical-login",
    desc: "With a clean working directory, you can switch branches freely. Do your hotfix work here.",
    stash: ["stash@{0}: wip: auth refactor in progress"],
    working: ["hotfix/login.js (fixed)"],
    branch: "hotfix/critical-login",
  },
  {
    cmd: "git switch feat/auth && git stash pop",
    desc: "Back on feat/auth. git stash pop restores your WIP changes and removes the stash entry.",
    stash: [],
    working: [
      "src/api.js (auth refactor restored)",
      "src/auth.js (WIP restored)",
      "hotfix/login.js (applied too)",
    ],
    branch: "feat/auth",
  },
];

export function StashViz() {
  const [step, setStep] = useState(0);
  const s = STASH_STEPS[step];

  return (
    <div>
      <StepControls
        step={step}
        maxStep={STASH_STEPS.length - 1}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onReset={() => setStep(0)}
        label={`Step ${step + 1}/${STASH_STEPS.length} — on branch: ${s.branch}`}
      />

      {s.cmd && <CodeBlock code={s.cmd} style={{ marginBottom: 12 }} />}

      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14, lineHeight: 1.65 }}>
        {s.desc}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          className="gitverse-card"
          style={{ padding: 14, borderColor: "var(--amber)", minHeight: 110 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--amber)",
              marginBottom: 10,
              fontFamily: "IBM Plex Mono",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Archive size={14} /> Stash Stack
          </div>
          {s.stash.length === 0 ? (
            <div style={{ color: "var(--dim)", fontSize: 11, fontFamily: "IBM Plex Mono" }}>
              (empty)
            </div>
          ) : (
            s.stash.map((entry, i) => (
              <div
                key={i}
                className="animate-slide-r"
                style={{
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono",
                  padding: "5px 8px",
                  background: "var(--amber-dim)",
                  borderRadius: 5,
                  marginBottom: 5,
                  color: "var(--text)",
                }}
              >
                {entry}
              </div>
            ))
          )}
        </div>

        <div
          className="gitverse-card"
          style={{ padding: 14, borderColor: "var(--cyan)", minHeight: 110 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--cyan)",
              marginBottom: 10,
              fontFamily: "IBM Plex Mono",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <FolderOpen size={14} /> Working Tree ({s.branch})
          </div>
          {s.working.length === 0 ? (
            <div style={{ color: "var(--emerald)", fontSize: 11, fontFamily: "IBM Plex Mono" }}>
              ✓ clean
            </div>
          ) : (
            s.working.map((f, i) => (
              <div
                key={i}
                style={{
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono",
                  color: "var(--text)",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--cyan)",
                    flexShrink: 0,
                  }}
                />
                {f}
              </div>
            ))
          )}
        </div>
      </div>

      <StepProgress current={step} total={STASH_STEPS.length} />
    </div>
  );
}

// ============================================================
// ReflogViz — safety net visualization
// ============================================================
const REFLOG_ENTRIES = [
  {
    sha: "d4e5f6g",
    idx: 0,
    action: "commit",
    msg: "Fix session expiry bug",
    ago: "2h",
    highlight: true,
    recovery: false,
  },
  {
    sha: "c3d4e5f",
    idx: 1,
    action: "commit",
    msg: "Implement JWT refresh tokens",
    ago: "5h",
    highlight: false,
    recovery: false,
  },
  {
    sha: "b2c3d4e",
    idx: 2,
    action: "checkout",
    msg: "moving from feature/auth to main",
    ago: "7h",
    highlight: false,
    recovery: false,
  },
  {
    sha: "b8c9d0e",
    idx: 3,
    action: "commit",
    msg: "Auth middleware [BRANCH DELETED]",
    ago: "8h",
    highlight: false,
    recovery: true,
  },
  {
    sha: "b2c3d4e",
    idx: 4,
    action: "commit",
    msg: "Add user authentication",
    ago: "1d",
    highlight: false,
    recovery: false,
  },
  {
    sha: "a1b2c3d",
    idx: 5,
    action: "commit",
    msg: "Initial commit",
    ago: "3d",
    highlight: false,
    recovery: false,
  },
];

export function ReflogViz() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <Alert type="info" style={{ marginBottom: 16 }}>
        <span>
          Reflog records every local HEAD movement. Click any entry to see its recovery command.
          Even after <code>git reset --hard</code>, you can recover commits for up to 90 days.
        </span>
      </Alert>

      <div style={{ overflowX: "auto" }}>
        <table className="comp-table">
          <thead>
            <tr>
              <th>SHA</th>
              <th>Entry</th>
              <th>Action</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {REFLOG_ENTRIES.map((e) => (
              <tr
                key={e.idx}
                onClick={() => setSelected(selected === e.idx ? null : e.idx)}
                style={{
                  cursor: "pointer",
                  background: e.highlight
                    ? "rgba(99,102,241,0.05)"
                    : e.recovery
                      ? "rgba(244,63,94,0.05)"
                      : "transparent",
                  transition: "background 0.15s ease",
                }}
              >
                <td>
                  <code style={{ color: "var(--amber)", fontSize: 11 }}>{e.sha}</code>
                </td>
                <td>
                  <code style={{ color: "var(--muted)", fontSize: 11 }}>
                    HEAD@{"{" + e.idx + "}"}
                  </code>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 11,
                      color: e.action === "commit" ? "var(--emerald)" : "var(--amber)",
                      fontFamily: "IBM Plex Mono",
                    }}
                  >
                    {e.action}
                  </span>
                </td>
                <td style={{ fontSize: 12 }}>
                  {e.msg}
                  {e.recovery && (
                    <Badge variant="high" className="ml-2" style={{ marginLeft: 8 }}>
                      recoverable
                    </Badge>
                  )}
                </td>
                <td style={{ color: "var(--muted)", fontSize: 11 }}>{e.ago}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected !== null && (
        <div className="animate-fade-in" style={{ marginTop: 14 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
            Recovery command for HEAD@{"{" + selected + "}"}:
          </div>
          <CodeBlock
            code={`# Option 1: restore to exactly this state\ngit reset --hard HEAD@{${selected}}\n\n# Option 2: create a rescue branch here\ngit checkout -b recovery-branch HEAD@{${selected}}`}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// MergeConflictViz — step-by-step conflict simulation
// ============================================================
const CONFLICT_STEPS = [
  {
    title: "Two developers edit the same line",
    desc: "Dev A (main) and Dev B (feature/auth) both modified line 42 of api.js. Their changes are incompatible.",
    devA: "const secret = process.env.JWT_SECRET",
    devB: 'const secret = require("./config").jwtSecret',
    phase: "diverged",
  },
  {
    title: "git merge attempt",
    desc: "When feature/auth is merged into main, Git cannot auto-resolve the conflict. It marks the file with conflict markers.",
    phase: "conflict",
    conflictFile: `<<<<<<< HEAD (main)
const secret = process.env.JWT_SECRET
=======
const secret = require("./config").jwtSecret
>>>>>>> feature/auth`,
  },
  {
    title: "Manual resolution",
    desc: "You edit the file, choose the correct version (or merge both), then mark as resolved with git add.",
    phase: "resolved",
    resolvedFile: `// Both approaches unified — env var with config fallback
const secret = process.env.JWT_SECRET || require("./config").jwtSecret`,
  },
  {
    title: "Commit the resolution",
    desc: "After resolving all conflicts and running git add, git commit finalizes the merge.",
    phase: "committed",
    cmd: `git add src/api.js\ngit commit  # merge commit created automatically`,
  },
];

export function MergeConflictViz() {
  const [step, setStep] = useState(0);
  const s = CONFLICT_STEPS[step];

  return (
    <div>
      <StepControls
        step={step}
        maxStep={CONFLICT_STEPS.length - 1}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onReset={() => setStep(0)}
        label={`Step ${step + 1}/${CONFLICT_STEPS.length}: ${s.title}`}
      />

      <div
        className="gitverse-card"
        style={{ padding: 14, marginBottom: 14, borderLeft: "3px solid var(--accent)" }}
      >
        <div
          className="font-heading"
          style={{ fontWeight: 700, marginBottom: 6, color: "var(--accent)" }}
        >
          {s.title}
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7 }}>{s.desc}</p>
      </div>

      {s.phase === "diverged" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="gitverse-card" style={{ padding: 12, borderColor: "var(--accent)" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: 8,
                fontFamily: "IBM Plex Mono",
              }}
            >
              main — Dev A's version
            </div>
            <div className="codeblock" style={{ fontSize: 12 }}>
              {s.devA}
            </div>
          </div>
          <div className="gitverse-card" style={{ padding: 12, borderColor: "var(--cyan)" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--cyan)",
                marginBottom: 8,
                fontFamily: "IBM Plex Mono",
              }}
            >
              feature/auth — Dev B's version
            </div>
            <div className="codeblock" style={{ fontSize: 12 }}>
              {s.devB}
            </div>
          </div>
        </div>
      )}

      {s.phase === "conflict" && (
        <div>
          <Alert type="danger" style={{ marginBottom: 12 }}>
            Git writes conflict markers into the file. The file is now unmerged — you must resolve
            manually.
          </Alert>
          <div className="codeblock">
            <pre style={{ margin: 0 }}>
              <span style={{ color: "var(--rose)" }}>{"<<<<<<< HEAD (main)"}</span>
              {"\n"}
              <span style={{ color: "var(--accent)" }}>
                {"const secret = process.env.JWT_SECRET"}
              </span>
              {"\n"}
              <span style={{ color: "var(--muted)" }}>{"======="}</span>
              {"\n"}
              <span style={{ color: "var(--cyan)" }}>
                {'const secret = require("./config").jwtSecret'}
              </span>
              {"\n"}
              <span style={{ color: "var(--rose)" }}>{">>>>>>> feature/auth"}</span>
            </pre>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--text)" }}>Conflict markers:</strong>
            <br />• <code>{"<<<<<<< HEAD"}</code> — start of your current branch's version
            <br />• <code>{"======="}</code> — divider between the two versions
            <br />• <code>{">>>>>>> feature/auth"}</code> — end of the incoming branch's version
          </div>
        </div>
      )}

      {s.phase === "resolved" && (
        <div>
          <Alert type="success" style={{ marginBottom: 12 }}>
            Conflict markers removed. You chose the unified approach. Now run git add.
          </Alert>
          <CodeBlock code={s.resolvedFile} />
        </div>
      )}

      {s.phase === "committed" && (
        <div>
          <Alert type="success" style={{ marginBottom: 12 }}>
            Merge complete! A merge commit is created preserving both histories.
          </Alert>
          <CodeBlock code={s.cmd} />
          <VizCanvas style={{ marginTop: 14 }}>
            <CommitGraph scenario="feature_branch" animated={false} />
          </VizCanvas>
        </div>
      )}

      <StepProgress current={step} total={CONFLICT_STEPS.length} />
    </div>
  );
}

// ============================================================
// BisectViz — binary search debugging
// ============================================================
const BISECT_COMMITS = [
  { n: 1, label: "v3.0.0 ✓", good: true },
  { n: 2, label: null, good: true },
  { n: 3, label: null, good: true },
  { n: 4, label: null, good: true },
  { n: 5, label: null, good: null },
  { n: 6, label: null, good: null },
  { n: 7, label: null, good: null },
  { n: 8, label: null, good: false },
  { n: 9, label: null, good: false },
  { n: 10, label: "HEAD ✗", good: false },
];

const BISECT_STEPS = [
  { midpoint: null, tested: [], marked: { good: [0], bad: [9] }, step: "start" },
  { midpoint: 4, tested: [4], marked: { good: [0], bad: [9] }, step: "test" },
  { midpoint: 7, tested: [4, 7], marked: { good: [0, 4], bad: [9] }, step: "test" },
  { midpoint: 5, tested: [4, 5, 7], marked: { good: [0, 4], bad: [7, 9] }, step: "test" },
  {
    midpoint: 5,
    tested: [4, 5, 7],
    marked: { good: [0, 4], bad: [5, 7, 9] },
    step: "found",
    culprit: 5,
  },
];

export function BisectViz() {
  const [step, setStep] = useState(0);
  const s = BISECT_STEPS[step];

  return (
    <div>
      <StepControls
        step={step}
        maxStep={BISECT_STEPS.length - 1}
        onPrev={() => setStep((s) => s - 1)}
        onNext={() => setStep((s) => s + 1)}
        onReset={() => setStep(0)}
        label={`Bisect step ${step + 1}/${BISECT_STEPS.length}`}
      />

      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>
        Binary search: <strong style={{ color: "var(--text)" }}>10 commits</strong> = only{" "}
        <strong style={{ color: "var(--accent)" }}>4 steps</strong> to find the bug. Math: log₂(10)
        ≈ 3.3 → 4 steps.
      </div>

      {/* Commit timeline */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {BISECT_COMMITS.map((c, i) => {
          const isGoodMarked = s.marked.good.includes(i);
          const isBadMarked = s.marked.bad.includes(i);
          const isMidpoint = s.midpoint === i + 1;
          const isCulprit = s.culprit === i + 1;

          let bg = "var(--surface)";
          let border = "var(--border)";
          let color = "var(--muted)";

          if (isGoodMarked) {
            bg = "var(--emerald-dim)";
            border = "var(--emerald)";
            color = "var(--emerald)";
          }
          if (isBadMarked) {
            bg = "var(--rose-dim)";
            border = "var(--rose)";
            color = "var(--rose)";
          }
          if (isMidpoint) {
            bg = "var(--accent-dim)";
            border = "var(--accent)";
            color = "var(--accent)";
          }
          if (isCulprit) {
            bg = "var(--rose-dim)";
            border = "var(--rose)";
            color = "var(--rose)";
          }

          return (
            <div
              key={i}
              style={{
                width: 52,
                padding: "8px 4px",
                borderRadius: 7,
                border: `1.5px solid ${border}`,
                background: bg,
                textAlign: "center",
                transition: "all 0.3s ease",
                fontSize: 10,
                fontFamily: "IBM Plex Mono",
              }}
            >
              <div style={{ color, fontWeight: 700 }}>c{c.n}</div>
              {c.label && (
                <div style={{ color: "var(--muted)", fontSize: 8, marginTop: 2 }}>{c.label}</div>
              )}
              {isGoodMarked && <div style={{ color: "var(--emerald)", fontSize: 8 }}>✓ good</div>}
              {isBadMarked && <div style={{ color: "var(--rose)", fontSize: 8 }}>✗ bad</div>}
              {isMidpoint && !isBadMarked && !isCulprit && (
                <div style={{ color: "var(--accent)", fontSize: 8 }}>← test</div>
              )}
              {isCulprit && (
                <div style={{ color: "var(--rose)", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                  <Bug size={8} /> BUG
                </div>
              )}
            </div>
          );
        })}
      </div>

      {s.step === "found" ? (
        <Alert type="success">
          <strong>Found!</strong> Commit c{s.culprit} is the first bad commit. Run{" "}
          <code>git show c{s.culprit}</code> to inspect it. Then <code>git bisect reset</code> to
          return to HEAD.
        </Alert>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {s.midpoint && (
            <div
              className="gitverse-card"
              style={{ padding: 12, flex: 1, borderColor: "var(--accent)" }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  marginBottom: 6,
                  fontFamily: "IBM Plex Mono",
                }}
              >
                Testing c{s.midpoint}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Git checked out the midpoint commit. Run your test → mark good or bad.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GitObjectModel — internals visualization
// ============================================================
export function GitObjectModel() {
  const [selected, setSelected] = useState(null);

  const objects = [
    {
      id: "blob",
      type: "blob",
      color: "var(--cyan)",
      icon: <FileText size={18} />,
      title: "BLOB (Binary Large Object)",
      sha: "a1b2c3d4",
      content: `type blob
size 247

const express = require('express')
const jwt = require('jsonwebtoken')
// ... rest of api.js`,
      desc: "Stores raw file content ONLY. No filename, no permissions, no path. Identical files across commits share the same blob object — this is how Git deduplicates storage.",
    },
    {
      id: "tree",
      type: "tree",
      color: "var(--emerald)",
      icon: <FolderOpen size={18} />,
      title: "TREE",
      sha: "b2c3d4e5",
      content: `type tree

100644 blob a1b2c3d4  api.js
100644 blob e5f6g7h8  auth.js
040000 tree i9j0k1l2  src/
100644 blob m3n4o5p6  package.json`,
      desc: "Represents a directory snapshot. Maps filenames → blob/tree SHAs. Contains file permissions (mode). A new tree object is created on every commit, even if only one file changed.",
    },
    {
      id: "commit",
      type: "commit",
      color: "var(--accent)",
      icon: <GitCommit size={18} />,
      title: "COMMIT",
      sha: "c3d4e5f6",
      content: `type commit

tree    b2c3d4e5f6g7
parent  z9y8x7w6v5u4
author  Dev <dev@co.com> 1704067200 +0000
committer Dev <dev@co.com> 1704067200 +0000

feat: add JWT authentication`,
      desc: "Points to a tree (full project snapshot), parent commits, and metadata. The SHA-1 is computed from ALL this content — any change to anything creates a completely different hash.",
    },
    {
      id: "tag",
      type: "tag",
      color: "var(--purple)",
      icon: <Tag size={18} />,
      title: "ANNOTATED TAG",
      sha: "d4e5f6g7",
      content: `type tag

object  c3d4e5f6g7h8
type    commit
tag     v2.0.0
tagger  Dev <dev@co.com> 1704067200 +0000

Release v2.0.0 - JWT Authentication`,
      desc: "Annotated tags are full Git objects pointing to a commit with extra metadata. Lightweight tags are just refs (files in .git/refs/tags/) — no object is created.",
    },
  ];

  const selected_obj = objects.find((o) => o.id === selected);

  return (
    <div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 16 }}
      >
        {objects.map((obj) => (
          <div
            key={obj.id}
            className="gitverse-card-interactive"
            style={{ padding: 14, borderColor: selected === obj.id ? obj.color : "var(--border)" }}
            onClick={() => setSelected(selected === obj.id ? null : obj.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ display: "flex", alignItems: "center", color: obj.color }}>{obj.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: obj.color,
                  fontFamily: "IBM Plex Mono",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {obj.type}
              </span>
              <code style={{ fontSize: 9, color: "var(--amber)", marginLeft: "auto" }}>
                {obj.sha}...
              </code>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
              {obj.desc.slice(0, 90)}...
            </p>
          </div>
        ))}
      </div>

      {selected_obj && (
        <div
          className="gitverse-card animate-fade-in"
          style={{ padding: 16, borderColor: selected_obj.color }}
        >
          <div
            className="font-heading"
            style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: selected_obj.color, display: "flex", alignItems: "center", gap: 8 }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>{selected_obj.icon}</span>
            {selected_obj.title}
          </div>
          <CodeBlock code={selected_obj.content} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75 }}>
            {selected_obj.desc}
          </p>
        </div>
      )}

      {/* Object relationship diagram */}
      <div style={{ marginTop: 20 }}>
        <div className="font-heading" style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          Object Relationship Graph
        </div>
        <svg viewBox="0 0 640 150" style={{ width: "100%", maxHeight: 150 }}>
          {/* HEAD → commit */}
          <text
            x={20}
            y={75}
            fontSize={10}
            fill="var(--accent)"
            fontFamily="IBM Plex Mono"
            fontWeight="700"
          >
            HEAD → main →
          </text>

          {/* commit box */}
          <rect
            x={140}
            y={40}
            width={110}
            height={70}
            rx={6}
            fill="var(--card)"
            stroke="var(--accent)"
            strokeWidth={1.5}
          />
          <text
            x={195}
            y={58}
            textAnchor="middle"
            fontSize={9}
            fill="var(--accent)"
            fontFamily="IBM Plex Mono"
            fontWeight="700"
          >
            COMMIT
          </text>
          <text
            x={195}
            y={73}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            tree: b2c3d4
          </text>
          <text
            x={195}
            y={86}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            parent: z9y8x7
          </text>
          <text
            x={195}
            y={99}
            textAnchor="middle"
            fontSize={8}
            fill="var(--accent)"
            fontFamily="IBM Plex Mono"
          >
            c3d4e5f
          </text>

          {/* tree box */}
          <rect
            x={310}
            y={25}
            width={110}
            height={70}
            rx={6}
            fill="var(--card)"
            stroke="var(--emerald)"
            strokeWidth={1.5}
          />
          <text
            x={365}
            y={43}
            textAnchor="middle"
            fontSize={9}
            fill="var(--emerald)"
            fontFamily="IBM Plex Mono"
            fontWeight="700"
          >
            TREE
          </text>
          <text
            x={365}
            y={58}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            api.js → a1b2c3
          </text>
          <text
            x={365}
            y={71}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            auth.js → e5f6g7
          </text>
          <text
            x={365}
            y={84}
            textAnchor="middle"
            fontSize={8}
            fill="var(--emerald)"
            fontFamily="IBM Plex Mono"
          >
            b2c3d4
          </text>

          {/* blob boxes */}
          <rect
            x={490}
            y={10}
            width={90}
            height={40}
            rx={6}
            fill="var(--card)"
            stroke="var(--cyan)"
            strokeWidth={1.5}
          />
          <text
            x={535}
            y={28}
            textAnchor="middle"
            fontSize={9}
            fill="var(--cyan)"
            fontFamily="IBM Plex Mono"
            fontWeight="700"
          >
            BLOB
          </text>
          <text
            x={535}
            y={42}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            api.js content
          </text>

          <rect
            x={490}
            y={80}
            width={90}
            height={40}
            rx={6}
            fill="var(--card)"
            stroke="var(--cyan)"
            strokeWidth={1.5}
          />
          <text
            x={535}
            y={98}
            textAnchor="middle"
            fontSize={9}
            fill="var(--cyan)"
            fontFamily="IBM Plex Mono"
            fontWeight="700"
          >
            BLOB
          </text>
          <text
            x={535}
            y={112}
            textAnchor="middle"
            fontSize={8}
            fill="var(--muted)"
            fontFamily="IBM Plex Mono"
          >
            auth.js content
          </text>

          {/* Arrows */}
          <line
            x1={250}
            y1={75}
            x2={310}
            y2={60}
            stroke="var(--accent)"
            strokeWidth={1.5}
            markerEnd="url(#a1)"
          />
          <line
            x1={420}
            y1={50}
            x2={490}
            y2={30}
            stroke="var(--emerald)"
            strokeWidth={1.5}
            markerEnd="url(#a1)"
          />
          <line
            x1={420}
            y1={60}
            x2={490}
            y2={100}
            stroke="var(--emerald)"
            strokeWidth={1.5}
            markerEnd="url(#a1)"
          />

          <defs>
            <marker id="a1" markerWidth={6} markerHeight={6} refX={5} refY={3} orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
}
