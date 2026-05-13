import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { getAllCommands, CATEGORIES, searchCommands } from "@/data/commands";
import { Badge, SearchBox, SectionHeader } from "@/components/ui/index.jsx";
import { Search, Terminal, GitBranch, RotateCcw, LifeBuoy } from "lucide-react";

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

const GIT_VERSION = {
  add: null, commit: null, status: null, log: null, diff: null, branch: null,
  switch: "2.23+", restore: "2.23+", rebase: null, reset: null, revert: null,
  stash: null, cherry_pick: null, reflog: null, bisect: null,
  worktree: "2.5+", sparse_checkout: "2.25+",
};

const CATEGORY_ICONS = {
  daily: <Terminal size={16} />,
  advanced: <GitBranch size={16} />,
  legacy: <RotateCcw size={16} />,
  recovery: <LifeBuoy size={16} />,
};

export default function CommandsPage() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useAppStore();

  const filtered = searchCommands(searchQuery);
  const grouped = {};

  filtered.forEach((cmd) => {
    const cat = cmd.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(cmd);
  });

  // Sort each group by difficulty
  Object.values(grouped).forEach((g) =>
    g.sort((a, b) => (DIFFICULTY_ORDER[a.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.difficulty] ?? 0))
  );

  const categoryOrder = ["daily", "advanced", "legacy", "recovery"];

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Command Reference"
        subtitle="Deep-dives on every Git command — internals, edge cases, and recovery paths."
        badge="15+ commands"
      />

      <div style={{ maxWidth: 480, marginBottom: 24 }}>
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search commands, tags, concepts..."
        />
      </div>
      <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--muted)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Search size={32} />
          </div>
          <div>No commands found for "{searchQuery}"</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={() => setSearchQuery("")}>
            Clear search
          </button>
        </div>
      )}

      {categoryOrder.map((cat) => {
        const cmds = grouped[cat];
        if (!cmds || cmds.length === 0) return null;
        const catMeta = CATEGORIES[cat] || { label: cat };

        return (
          <div key={cat} style={{ marginBottom: 36, paddingTop: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", color: "var(--muted)" }}>
                {CATEGORY_ICONS[cat] || <Terminal size={16} />}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {catMeta.label}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--dim)",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                ({cmds.length})
              </span>
            </div>

            <div className="page-grid-2" style={{ gap: 14 }}>
              {cmds.map((cmd) => (
                <CommandCard
                  key={cmd.id}
                  cmd={cmd}
                  onClick={() => navigate(`/commands/${cmd.id}`)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CommandCard({ cmd, onClick }) {
  return (
    <div className="gitverse-card-interactive" style={{ padding: 18 }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", color: "var(--accent)", paddingTop: 2 }}>
          <Terminal size={24} />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            <span className="font-heading" style={{ fontSize: 15, fontWeight: 700 }}>
              {cmd.name}
            </span>
            <Badge variant={cmd.difficulty}>{cmd.difficulty}</Badge>
            {cmd.deprecated && <Badge variant="deprecated">deprecated</Badge>}
            <Badge variant={cmd.danger} style={{ marginLeft: "auto", flexShrink: 0 }}>
              {cmd.danger}
            </Badge>
          </div>

          {/* Short description */}
          <p
            style={{
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.55,
              marginBottom: 10,
            }}
          >
            {cmd.short}
          </p>

          {/* Tags + git version badge */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
            {cmd.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="purple">
                {t}
              </Badge>
            ))}
            {GIT_VERSION[cmd.id] && (
              <span style={{
                fontSize: 9, fontFamily: "IBM Plex Mono", color: "var(--cyan)",
                background: "var(--cyan-dim)", border: "1px solid rgba(34,211,238,0.25)",
                borderRadius: 4, padding: "1px 6px", marginLeft: 4, flexShrink: 0,
              }}>
                git {GIT_VERSION[cmd.id]}
              </span>
            )}
          </div>
        </div>

        <span
          style={{
            color: "var(--dim)",
            fontSize: 20,
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          ›
        </span>
      </div>
    </div>
  );
}
