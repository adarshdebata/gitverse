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
  GitCommit,
  ArrowUp,
  ArrowDown,
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

export default function PlaygroundPage() {
  const { playgroundTab, setPlaygroundTab, repoState } = useAppStore();

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Interactive Playground"
        subtitle="Type real git commands, explore branch state, and step through animated simulations. Everything is sandboxed — no real repos are affected."
        badge="live sandbox"
      />

      <Tabs tabs={TABS} activeTab={playgroundTab} onTabChange={setPlaygroundTab} />

      {/* Tab description */}
      <p style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18, marginTop: -8 }}>
        {TAB_DESCRIPTIONS[playgroundTab]}
      </p>

      {/* ── TERMINAL ─────────────────────────────── */}
      {playgroundTab === "terminal" && (
        <div className="animate-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, alignItems: "start" }}>

            {/* Left column: terminal → repo state */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TerminalEmulator />
              <RepoStatePanel />
            </div>

            {/* Right column: live graph → shortcuts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Live graph card */}
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
                  <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--accent)", fontWeight: 600, opacity: 0.7 }}>
                    ● live
                  </span>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <CommitGraph scenario="feature_branch" animated showLabels showHead />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                  {[
                    { branch: "main",         color: "var(--accent)" },
                    { branch: "feature/auth", color: "var(--cyan)" },
                  ].map((b) => (
                    <div key={b.branch} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, fontFamily: "IBM Plex Mono", color: "var(--muted)" }}>
                        {b.branch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shortcuts card — just below graph */}
              <TipsPanel />
            </div>
          </div>
        </div>
      )}

      {/* ── COMMIT GRAPH ─────────────────────────── */}
      {playgroundTab === "graph" && (
        <div className="animate-fade-in">
          <div
            className="gitverse-card"
            style={{ padding: 20, marginBottom: 14 }}
          >
            <CommitGraph scenario="feature_branch" animated showLabels showHead />
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {[
                { branch: "main",         color: "var(--accent)" },
                { branch: "feature/auth", color: "var(--cyan)" },
              ].map((b) => (
                <div key={b.branch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: b.color, display: "block" }} />
                  <span style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: "var(--muted)" }}>
                    {b.branch}
                  </span>
                </div>
              ))}
              <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "IBM Plex Mono", marginLeft: "auto" }}>
                ← click any node to inspect
              </span>
            </div>
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

      {/* Active branch */}
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

      {/* All branches */}
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

      {/* Recent commits */}
      <Section label="Recent Commits">
        {repoState.commits.slice(-5).reverse().map((c) => (
          <div key={c.h} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, marginBottom: 4, display: "flex", gap: 7 }}>
            <span style={{ color: "var(--amber)", flexShrink: 0 }}>{c.h.slice(0, 7)}</span>
            <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.msg}
            </span>
          </div>
        ))}
      </Section>

      {/* Working state */}
      {repoState.staged.length > 0 && (
        <Section label="Staged">
          {repoState.staged.map((f) => (
            <div key={f} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--emerald)" }}>
              + {f}
            </div>
          ))}
        </Section>
      )}
      {repoState.unstaged.length > 0 && (
        <Section label="Unstaged">
          {repoState.unstaged.map((f) => (
            <div key={f} style={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: "var(--amber)" }}>
              ~ {f}
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
    </div>
  );
}
