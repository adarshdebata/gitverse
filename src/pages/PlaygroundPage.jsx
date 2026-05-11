import { useAppStore } from "@/store/useAppStore";
import { Tabs, SectionHeader } from "@/components/ui/index.jsx";
import CommitGraph from "@/components/graphs/CommitGraph";
import TerminalEmulator from "@/components/terminal/TerminalEmulator";
import {
  RebaseViz,
  ResetViz,
  StashViz,
  MergeConflictViz,
  BisectViz,
} from "@/components/visualizers/index.jsx";
import { getBranchColor } from "@/data/graphs";
import {
  Terminal,
  GitBranch,
  RefreshCw,
  RotateCcw,
  Archive,
  GitMerge,
  Microscope,
  BookOpen,
  BarChart3,
} from "lucide-react";

const TABS = [
  { id: "terminal", label: "Terminal",        icon: <Terminal    size={13} /> },
  { id: "graph",    label: "Commit Graph",    icon: <GitBranch   size={13} /> },
  { id: "rebase",   label: "Rebase Sim",      icon: <RefreshCw   size={13} /> },
  { id: "reset",    label: "Reset Sim",       icon: <RotateCcw   size={13} /> },
  { id: "stash",    label: "Stash Sim",       icon: <Archive     size={13} /> },
  { id: "merge",    label: "Merge Conflict",  icon: <GitMerge    size={13} /> },
  { id: "bisect",   label: "Bisect Debugger", icon: <Microscope  size={13} /> },
];

const TAB_DESCRIPTIONS = {
  terminal: "Type real Git commands into a fully sandboxed repository. Branch state and commit history update live.",
  graph:    "Visual representation of the live sandbox repository. Every commit is a real Git object.",
  rebase:   "Step through a complete git rebase — see commits detach, replay, and receive new SHAs.",
  reset:    "Visualize all three reset modes and their effect on HEAD, Index, and Working Tree.",
  stash:    "Complete stash workflow — save, switch, hotfix, restore.",
  merge:    "Simulate a merge conflict from start to resolution with conflict markers.",
  bisect:   "Binary-search through commits to find the bug with git bisect.",
};

/**
 * Converts live repoState into a CommitGraph-compatible customGraph.
 * Uses parentHash on each commit to build a real DAG — branch creation,
 * merge commits and commit flow are all rendered with correct topology.
 */
function buildLiveGraph(repoState) {
  const { commits, branches, branch: currentBranch, head, branchHeads } = repoState;
  if (!commits || commits.length === 0) return null;

  const knownHashes = new Set(commits.map((c) => c.h));

  // Nodes carry metadata used by the hover tooltip
  const nodes = commits.map((c) => ({
    id: c.h,
    sha: c.h,
    message: c.msg,
    branch: c.branch || "main",
    merge: Boolean(c.merge),
    time: c.time || "",
    author: "Developer",
  }));

  // Edges derived from parentHash — gives a proper DAG instead of a flat line
  const edges = [];
  commits.forEach((c) => {
    const parents = Array.isArray(c.parentHash)
      ? c.parentHash
      : c.parentHash
        ? [c.parentHash]
        : [];
    parents.forEach((ph) => {
      if (knownHashes.has(ph)) edges.push({ from: ph, to: c.h });
    });
  });

  // Branch label map: use branchHeads from store, then scan commits as fallback
  const branchLabels = {};
  branches.forEach((b) => {
    const tip = (branchHeads || {})[b] || [...commits].reverse().find((c) => c.branch === b)?.h;
    if (tip && knownHashes.has(tip)) branchLabels[b] = tip;
  });
  // Always pin the current branch to the actual HEAD
  const safeHead = knownHashes.has(head) ? head : commits.at(-1)?.h;
  if (safeHead) branchLabels[currentBranch] = safeHead;

  return { nodes, edges, head: safeHead, branches: branchLabels };
}

export default function PlaygroundPage() {
  const { playgroundTab, setPlaygroundTab, repoState } = useAppStore();
  const liveGraph = buildLiveGraph(repoState);

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Interactive Playground"
        subtitle="Type real git commands, explore branch state, and step through animated simulations. Everything is sandboxed — no real repos are affected."
        badge="live sandbox"
      />

      <Tabs tabs={TABS} activeTab={playgroundTab} onTabChange={setPlaygroundTab} />

      <p style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18, marginTop: -8 }}>
        {TAB_DESCRIPTIONS[playgroundTab]}
      </p>

      {/* ── TERMINAL ─────────────────────────────── */}
      {playgroundTab === "terminal" && (
        <div className="animate-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>

            {/* Left: terminal → repo state */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TerminalEmulator />
              <RepoStatePanel />
            </div>

            {/* Right: live graph → shortcuts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <LiveGraphCard liveGraph={liveGraph} repoState={repoState} />
              <TipsPanel />
            </div>
          </div>
        </div>
      )}

      {/* ── COMMIT GRAPH ─────────────────────────── */}
      {playgroundTab === "graph" && (
        <div className="animate-fade-in">
          <div className="gitverse-card" style={{ padding: 20, marginBottom: 14 }}>
            {liveGraph ? (
              <CommitGraph customGraph={liveGraph} animated={false} showLabels showHead />
            ) : (
              <CommitGraph scenario="feature_branch" animated showLabels showHead />
            )}
            <BranchLegend repoState={repoState} />
          </div>
          <RepoStatePanel expanded />
        </div>
      )}

      {/* ── SIMULATORS ───────────────────────────── */}
      {playgroundTab === "rebase" && <div className="animate-fade-in"><RebaseViz /></div>}
      {playgroundTab === "reset"  && <div className="animate-fade-in"><ResetViz /></div>}
      {playgroundTab === "stash"  && <div className="animate-fade-in"><StashViz /></div>}
      {playgroundTab === "merge"  && <div className="animate-fade-in"><MergeConflictViz /></div>}
      {playgroundTab === "bisect" && <div className="animate-fade-in"><BisectViz /></div>}
    </div>
  );
}

/* ── Live Graph Card ──────────────────────────────────────── */
function LiveGraphCard({ liveGraph, repoState }) {
  return (
    <div className="gitverse-card" style={{
      padding: 14,
      borderTop: "2px solid var(--accent)",
      boxShadow: "0 0 24px rgba(99,102,241,0.07)",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--muted)", marginBottom: 10,
        fontFamily: "IBM Plex Mono", textTransform: "uppercase", letterSpacing: "0.07em",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <GitBranch size={11} /> Live Graph
        <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--accent)", fontWeight: 600, opacity: 0.8 }}>
          ● live
        </span>
      </div>

      <div style={{ overflow: "hidden" }}>
        {liveGraph ? (
          <CommitGraph
            customGraph={liveGraph}
            animated={false}
            showLabels
            showHead
          />
        ) : (
          <div style={{ color: "var(--dim)", fontFamily: "IBM Plex Mono", fontSize: 11, padding: "12px 0" }}>
            No commits yet
          </div>
        )}
      </div>

      <BranchLegend repoState={repoState} compact />
    </div>
  );
}

/* ── Branch Legend ────────────────────────────────────────── */
function BranchLegend({ repoState, compact = false }) {
  const { branches, branch: currentBranch } = repoState;
  return (
    <div style={{
      display: "flex", gap: compact ? 10 : 16,
      marginTop: compact ? 10 : 14,
      flexWrap: "wrap",
    }}>
      {branches.map((b) => (
        <div key={b} style={{ display: "flex", alignItems: "center", gap: compact ? 5 : 6 }}>
          <span style={{
            width: compact ? 7 : 9, height: compact ? 7 : 9,
            borderRadius: "50%",
            background: getBranchColor(b),
            flexShrink: 0,
            opacity: b === currentBranch ? 1 : 0.65,
          }} />
          <span style={{
            fontSize: compact ? 10 : 11,
            fontFamily: "IBM Plex Mono",
            color: b === currentBranch ? getBranchColor(b) : "var(--muted)",
            fontWeight: b === currentBranch ? 600 : 400,
          }}>
            {b === currentBranch ? "✦ " : ""}{b}
          </span>
        </div>
      ))}
      {!compact && (
        <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "IBM Plex Mono", marginLeft: "auto" }}>
          ← click node to inspect
        </span>
      )}
    </div>
  );
}

/* ── Repo State Panel ─────────────────────────────────────── */
function RepoStatePanel({ expanded = false }) {
  const { repoState } = useAppStore();

  return (
    <div className="gitverse-card" style={{ padding: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--muted)",
        marginBottom: 12, fontFamily: "IBM Plex Mono",
        textTransform: "uppercase", letterSpacing: "0.07em",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <BarChart3 size={12} /> Repository State
      </div>

      <Section label="Branch">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: getBranchColor(repoState.branch), flexShrink: 0,
          }} />
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
            {repoState.branch}
          </span>
        </div>
      </Section>

      <Section label="Branches">
        {repoState.branches.map((b) => (
          <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: getBranchColor(b), flexShrink: 0,
              opacity: b === repoState.branch ? 1 : 0.6,
            }} />
            <span style={{
              fontFamily: "IBM Plex Mono", fontSize: 11,
              color: b === repoState.branch ? "var(--accent)" : "var(--muted)",
              fontWeight: b === repoState.branch ? 600 : 400,
            }}>
              {b === repoState.branch ? "✦ " : "  "}{b}
            </span>
          </div>
        ))}
      </Section>

      <Section label="Recent Commits">
        {repoState.commits.slice(-6).reverse().map((c) => (
          <div key={c.h} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, marginBottom: 4, display: "flex", gap: 7 }}>
            <span style={{ color: "var(--amber)", flexShrink: 0 }}>{c.h.slice(0, 7)}</span>
            <span style={{
              color: c.branch && c.branch !== "main" ? getBranchColor(c.branch) : "var(--muted)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {c.msg}
            </span>
          </div>
        ))}
      </Section>

      {repoState.staged.length > 0 && (
        <Section label="Staged">
          {repoState.staged.map((f) => (
            <div key={f} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--emerald)" }}>+ {f}</div>
          ))}
        </Section>
      )}
      {repoState.unstaged.length > 0 && (
        <Section label="Unstaged">
          {repoState.unstaged.map((f) => (
            <div key={f} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--amber)" }}>~ {f}</div>
          ))}
        </Section>
      )}
      {(repoState.stash || []).length > 0 && (
        <Section label="Stash">
          {repoState.stash.map((s, i) => (
            <div key={i} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--cyan)" }}>
              stash@&#123;{i}&#125;: {s.msg}
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 9, color: "var(--dim)", fontFamily: "IBM Plex Mono",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
        fontWeight: 700,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

/* ── Tips Panel ───────────────────────────────────────────── */
function TipsPanel() {
  const tips = [
    { keys: "↑ / ↓",   desc: "command history" },
    { keys: "Tab",      desc: "autocomplete" },
    { keys: "Ctrl+C",   desc: "cancel input" },
    { keys: "clear",    desc: "clear output" },
    { keys: "help",     desc: "list all commands" },
  ];

  return (
    <div className="gitverse-card" style={{ padding: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--muted)",
        marginBottom: 12, fontFamily: "IBM Plex Mono",
        textTransform: "uppercase", letterSpacing: "0.07em",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <BookOpen size={12} /> Shortcuts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {tips.map(({ keys, desc }) => (
          <div key={keys} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{
              fontFamily: "IBM Plex Mono", fontSize: 10, color: "var(--accent)",
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 4, padding: "2px 6px", flexShrink: 0,
            }}>
              {keys}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted)", textAlign: "right" }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* Quick reference */}
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: "1px solid var(--border)",
        fontSize: 10, fontFamily: "IBM Plex Mono",
        color: "var(--dim)", lineHeight: 1.8,
      }}>
        <div style={{ color: "var(--muted)", fontWeight: 700, marginBottom: 4, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          Try these
        </div>
        {[
          'git switch -c feat/x',
          'git add .',
          'git commit -m "msg"',
          'git log --oneline',
          'git stash',
        ].map((cmd) => (
          <div key={cmd} style={{ color: "var(--accent)", opacity: 0.75 }}>{cmd}</div>
        ))}
      </div>
    </div>
  );
}
