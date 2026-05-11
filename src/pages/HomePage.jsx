import { useNavigate } from "react-router-dom";
import {
  GitBranch,
  Zap,
  LifeBuoy,
  Scale,
  BookOpen,
  Settings2,
  Terminal,
} from "lucide-react";
import CommitGraph from "@/components/graphs/CommitGraph";
import { Badge, Alert } from "@/components/ui/index.jsx";
import { getAllCommands } from "@/data/commands";

const STATS = [
  { n: "15+", label: "Command deep-dives",     color: "var(--accent)" },
  { n: "8",   label: "Interactive visualizers", color: "var(--cyan)" },
  { n: "10",  label: "Git internals sections",  color: "var(--emerald)" },
  { n: "∞",   label: "Sandbox interactions",    color: "var(--purple)" },
];

const FEATURED_IDS = ["rebase", "reset", "reflog", "cherry-pick"];

/* Playground removed — it already has a prominent CTA in the hero */
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
    desc: "Every command with internals, animated states, and recovery paths.",
    color: "var(--accent)",
    path: "/commands",
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
    desc: "merge vs rebase, reset vs revert, switch vs checkout.",
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

      {/* ── HERO (full-bleed, breaks out of content padding) ── */}
      <div
        style={{
          position: "relative",
          margin: "-32px -32px 0",
          padding: "64px 32px 56px",
          marginBottom: 48,
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* Atmospheric glows */}
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(140px)",
          pointerEvents: "none", zIndex: 0,
          background: "rgba(99,102,241,0.13)", width: 700, height: 700,
          top: -300, left: -200,
        }} />
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(120px)",
          pointerEvents: "none", zIndex: 0,
          background: "rgba(34,211,238,0.07)", width: 500, height: 500,
          top: -100, right: -150,
        }} />
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(100px)",
          pointerEvents: "none", zIndex: 0,
          background: "rgba(168,85,247,0.06)", width: 400, height: 400,
          bottom: -200, right: 100,
        }} />

        {/* Two-column grid */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 56,
          alignItems: "center",
          maxWidth: 1136,
          margin: "0 auto",
        }}>
          {/* Left: Headline + subtitle + CTAs */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--accent-dim)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 99, padding: "4px 12px", marginBottom: 20,
              fontSize: 11, color: "var(--accent)", fontFamily: "IBM Plex Mono",
              fontWeight: 600, letterSpacing: "0.04em",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              Interactive · Visual · Sandboxed
            </div>

            <h1
              className="font-heading"
              style={{
                fontSize: "clamp(32px, 4.5vw, 54px)",
                fontWeight: 900,
                lineHeight: 1.06,
                marginBottom: 20,
                letterSpacing: "-0.025em",
              }}
            >
              Git, explained{" "}
              <span className="gradient-brand">visually</span>
              <br />
              like never before.
            </h1>

            <p style={{
              fontSize: 15,
              color: "var(--muted)",
              lineHeight: 1.8,
              marginBottom: 36,
              maxWidth: 460,
            }}>
              Every command animated. Every concept interactive. Built for engineers
              who want to understand Git deeply — not just use it.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                className="btn btn-primary"
                style={{
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 0 28px rgba(99,102,241,0.5)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                  letterSpacing: "0.01em",
                }}
                onClick={() => navigate("/playground")}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 42px rgba(99,102,241,0.75)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(99,102,241,0.5)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Open Playground →
              </button>
              <button
                className="btn"
                style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => navigate("/commands")}
              >
                <BookOpen size={13} /> Commands
              </button>
              <button
                className="btn"
                style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => navigate("/internals")}
              >
                <Settings2 size={13} /> Internals
              </button>
            </div>
          </div>

          {/* Right: 2×2 stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {STATS.map((s, i) => (
              <div
                key={i}
                className="gitverse-card"
                style={{
                  padding: "22px 20px",
                  textAlign: "center",
                  borderTop: `2px solid ${s.color}`,
                }}
              >
                <div
                  className="font-heading"
                  style={{ fontSize: 36, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 6 }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LIVE COMMIT GRAPH (immediately after hero) ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h2 className="font-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              Live Commit Graph
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Click any node to inspect. Every commit is a real Git object.
            </p>
          </div>
          <button className="btn" style={{ fontSize: 12 }} onClick={() => navigate("/playground")}>
            Full Playground →
          </button>
        </div>

        <div className="gitverse-card" style={{ padding: "20px 20px 16px" }}>
          <CommitGraph scenario="feature_branch" animated showLabels showHead />
          <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { branch: "main",         color: "var(--accent)" },
              { branch: "feature/auth", color: "var(--cyan)" },
            ].map((b) => (
              <div key={b.branch} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: b.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 11, fontFamily: "IBM Plex Mono", color: "var(--muted)" }}>
                  {b.branch}
                </span>
              </div>
            ))}
            <span style={{
              fontSize: 11, color: "var(--dim)",
              fontFamily: "IBM Plex Mono", marginLeft: "auto",
            }}>
              ← click any node to inspect
            </span>
          </div>
        </div>
      </div>

      {/* ── FEATURED COMMANDS ── */}
      <div style={{ marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Featured Deep-Dives
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          The commands that trip up even experienced engineers — fully explained.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {featured.map((cmd) => (
            <div
              key={cmd.id}
              className="gitverse-card-interactive"
              style={{ padding: 18 }}
              onClick={() => navigate(`/commands/${cmd.id}`)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ display: "flex", alignItems: "center", color: "var(--accent)", flexShrink: 0 }}>
                  <Terminal size={22} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="font-heading" style={{ fontSize: 15, fontWeight: 700 }}>
                    {cmd.name}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                    <Badge variant={cmd.difficulty}>{cmd.difficulty}</Badge>
                    <Badge variant={cmd.danger}>{cmd.danger} risk</Badge>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 10 }}>
                {cmd.short}
              </p>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {cmd.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="purple">{t}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LEARNING PATHS ── */}
      <div style={{ marginBottom: 48 }}>
        <h2 className="font-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          Learning Paths
        </h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          Structured journeys from fundamentals to mastery.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PATHS.map((p) => (
            <div
              key={p.path}
              className="gitverse-card-interactive"
              style={{ padding: 18 }}
              onClick={() => navigate(p.path)}
            >
              <div style={{ marginBottom: 10, color: p.color }}>
                <p.Icon size={24} />
              </div>
              <div
                className="font-heading"
                style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--text)" }}
              >
                {p.title}
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.65, marginBottom: 14 }}>
                {p.desc}
              </p>
              <div style={{ fontSize: 11, color: p.color, fontFamily: "IBM Plex Mono", fontWeight: 600 }}>
                Start →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ALERT ── */}
      <Alert type="info">
        <div>
          <strong>Pro tip:</strong> The{" "}
          <button
            onClick={() => navigate("/playground")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--cyan)", textDecoration: "underline",
              padding: 0, fontSize: "inherit",
            }}
          >
            Terminal Playground
          </button>{" "}
          is a fully sandboxed Git repository — no risk to real repos. Command history, Tab autocomplete, live graph.
        </div>
      </Alert>
    </div>
  );
}
