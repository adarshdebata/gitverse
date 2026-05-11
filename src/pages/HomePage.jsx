import { useNavigate } from "react-router-dom";
import {
  GitBranch,
  Zap,
  Gamepad2,
  LifeBuoy,
  Scale,
  BookOpen,
  Settings2,
  Terminal,
  GitCommit,
} from "lucide-react";
import CommitGraph from "@/components/graphs/CommitGraph";
import { Badge, Alert } from "@/components/ui/index.jsx";
import { getAllCommands } from "@/data/commands";

const STATS = [
  { n: "15+", label: "Command deep-dives", color: "var(--accent)" },
  { n: "8", label: "Interactive visualizers", color: "var(--cyan)" },
  { n: "10", label: "Git internals sections", color: "var(--emerald)" },
  { n: "∞", label: "Sandbox interactions", color: "var(--purple)" },
];

const FEATURED_IDS = ["rebase", "reset", "reflog", "cherry-pick"];

const PATHS = [
  {
    Icon: GitBranch,
    title: "Git Foundations",
    desc: "Object model, SHA hashes, the three trees. Understand what Git actually does.",
    color: "var(--emerald)",
    path: "/fundamentals",
  },
  {
    Icon: Zap,
    title: "Command Mastery",
    desc: "Every command with animated before/after states, internals, and recovery paths.",
    color: "var(--accent)",
    path: "/commands",
  },
  {
    Icon: Gamepad2,
    title: "Interactive Playground",
    desc: "Type real Git commands in a simulated terminal. See the commit graph update live.",
    color: "var(--cyan)",
    path: "/playground",
  },
  {
    Icon: LifeBuoy,
    title: "Disaster Recovery",
    desc: "Step-by-step guides for every Git catastrophe. Bookmark this page.",
    color: "var(--rose)",
    path: "/recovery",
  },
  {
    Icon: GitBranch,
    title: "Workflows",
    desc: "GitFlow, trunk-based dev, monorepos, Conventional Commits, merge strategies.",
    color: "var(--purple)",
    path: "/workflows",
  },
  {
    Icon: Scale,
    title: "Comparisons",
    desc: "merge vs rebase, reset vs revert, switch vs checkout, GitHub vs GitLab.",
    color: "var(--amber)",
    path: "/compare",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const allCmds = getAllCommands();
  const featured = FEATURED_IDS.map((id) => allCmds.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="animate-fade-up">
      {/* ── HERO ─────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "48px 0 40px",
          marginBottom: 40,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Background glows */}
        <div
          className="hero-glow"
          style={{
            background: "rgba(99,102,241,0.1)",
            width: 500,
            height: 500,
            top: -200,
            left: -100,
          }}
        />
        <div
          className="hero-glow"
          style={{
            background: "rgba(34,211,238,0.06)",
            width: 400,
            height: 400,
            top: -100,
            right: -80,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>

          <h1
            className="font-heading"
            style={{
              fontSize: "clamp(30px, 5vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.08,
              marginBottom: 18,
              letterSpacing: "-0.02em",
            }}
          >
            Git, explained <span className="gradient-brand">visually</span>
            <br />
            like never before.
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "var(--muted)",
              maxWidth: 580,
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Every command animated. Every concept interactive. Built for senior engineers who want
            to understand Git deeply — not just use it. From SHA internals to enterprise recovery
            workflows.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              style={{ padding: "10px 22px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => navigate("/playground")}
            >
              <Zap size={14} /> Open Playground
            </button>
            <button
              className="btn"
              style={{ padding: "10px 22px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => navigate("/commands")}
            >
              <BookOpen size={14} /> Command Reference
            </button>
            <button
              className="btn"
              style={{ padding: "10px 22px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => navigate("/internals")}
            >
              <Settings2 size={14} /> Git Internals
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--border)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 40,
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "20px 24px",
              background: "var(--card)",
              textAlign: "center",
            }}
          >
            <div
              className="font-heading"
              style={{ fontSize: 32, fontWeight: 900, color: s.color, lineHeight: 1 }}
            >
              {s.n}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── LIVE COMMIT GRAPH ────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Live Commit Graph
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Click any commit node to inspect. Every node is a real Git object.
            </p>
          </div>
          <button className="btn" onClick={() => navigate("/playground")}>
            Full Playground →
          </button>
        </div>

        <div className="viz-canvas">
          <CommitGraph scenario="feature_branch" animated showLabels showHead />
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { branch: "main", color: "var(--accent)" },
              { branch: "feature/auth", color: "var(--cyan)" },
            ].map((b) => (
              <div key={b.branch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: b.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: "var(--muted)" }}>
                  {b.branch}
                </span>
              </div>
            ))}
            <span
              style={{
                fontSize: 11,
                color: "var(--dim)",
                fontFamily: "IBM Plex Mono",
                marginLeft: "auto",
              }}
            >
              ← click any node to inspect
            </span>
          </div>
        </div>
      </div>

      {/* ── FEATURED COMMANDS ────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          Featured Deep-Dives
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          The commands that trip up even experienced engineers — fully explained.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {featured.map((cmd) => (
            <div
              key={cmd.id}
              className="gitverse-card-interactive"
              style={{ padding: 18 }}
              onClick={() => navigate(`/commands/${cmd.id}`)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ display: "flex", alignItems: "center", color: "var(--accent)" }}>
                  <Terminal size={26} />
                </span>
                <div>
                  <div className="font-heading" style={{ fontSize: 16, fontWeight: 700 }}>
                    {cmd.name}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Badge variant={cmd.difficulty}>{cmd.difficulty}</Badge>
                    <Badge variant={cmd.danger}>{cmd.danger} risk</Badge>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>
                {cmd.short}
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {cmd.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="purple">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LEARNING PATHS ───────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <h2 className="font-heading" style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          Learning Paths
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          Structured journeys from fundamentals to mastery.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {PATHS.map((p) => (
            <div
              key={p.path}
              className="gitverse-card-interactive"
              style={{ padding: 18 }}
              onClick={() => navigate(p.path)}
            >
              <div style={{ marginBottom: 12, color: p.color }}>
                <p.Icon size={28} />
              </div>
              <div
                className="font-heading"
                style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: p.color }}
              >
                {p.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>
                {p.desc}
              </p>
              <div style={{ fontSize: 12, color: p.color, fontFamily: "IBM Plex Mono" }}>
                Start →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── QUICK REFERENCE ALERT ────────────────────────── */}
      <Alert type="info">
        <div>
          <strong>Pro tip:</strong> Use the{" "}
          <button
            onClick={() => navigate("/playground")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--cyan)",
              textDecoration: "underline",
              padding: 0,
              fontSize: "inherit",
            }}
          >
            Terminal Playground
          </button>{" "}
          to experiment safely — a full simulated Git repository with realistic output, command
          history (↑↓), and Tab autocomplete. No risk to real repos.
        </div>
      </Alert>
    </div>
  );
}
