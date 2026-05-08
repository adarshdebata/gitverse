import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { getAllCommands, CATEGORIES, searchCommands } from "@/data/commands";
import { Badge, SearchBox, SectionHeader } from "@/components/ui/index.jsx";

const DIFFICULTY_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

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
        subtitle="Every Git command with full internals, visualization, and recovery paths. Click any command for the complete deep-dive."
        badge="15+ commands"
      />

      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search commands, tags, concepts..."
        className="mb-6"
        style={{ maxWidth: 480, marginBottom: 28 }}
      />

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--muted)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div>No commands found for "{searchQuery}"</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={() => setSearchQuery("")}>
            Clear search
          </button>
        </div>
      )}

      {categoryOrder.map((cat) => {
        const cmds = grouped[cat];
        if (!cmds || cmds.length === 0) return null;
        const catMeta = CATEGORIES[cat] || { label: cat, icon: "📄" };

        return (
          <div key={cat} style={{ marginBottom: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16 }}>{catMeta.icon}</span>
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}
            >
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
        <span style={{ fontSize: 26, flexShrink: 0 }}>{cmd.emoji}</span>

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

          {/* Tags */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {cmd.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="purple">
                {t}
              </Badge>
            ))}
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
