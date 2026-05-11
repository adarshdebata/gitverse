// ============================================================
// Badge
// ============================================================
export function Badge({ variant = "accent", children, className = "" }) {
  const classes = {
    beginner: "badge-beginner",
    intermediate: "badge-intermediate",
    advanced: "badge-advanced",
    safe: "badge-safe",
    medium: "badge-medium",
    high: "badge-high",
    deprecated: "badge-deprecated",
    cyan: "badge-cyan",
    purple: "badge-purple",
    accent: "badge-accent",
  };
  return (
    <span className={`badge ${classes[variant] || "badge-accent"} ${className}`}>{children}</span>
  );
}

// ============================================================
// Alert
// ============================================================
const ALERT_ICONS = {
  info: "ℹ️",
  warn: "⚠️",
  danger: "🚨",
  success: "✅",
};

export function Alert({ type = "info", children, className = "" }) {
  return (
    <div className={`alert alert-${type} ${className}`}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{ALERT_ICONS[type]}</span>
      <div>{children}</div>
    </div>
  );
}

// ============================================================
// CodeBlock
// ============================================================
import { useState } from "react";

function syntaxHighlight(line) {
  if (!line) return "";
  if (line.startsWith("#")) return `<span class="c-comment">${escHtml(line)}</span>`;
  // Highlight git commands + flags + arguments
  return escHtml(line)
    .replace(/^(git\s+\S+)/, '<span class="c-cmd">$1</span>')
    .replace(/(\s--?[\w-]+)/g, '<span class="c-flag">$1</span>')
    .replace(/"([^"]+)"/g, '"<span class="c-str">$1</span>"')
    .replace(/^(error:|fatal:)(.*)/, '<span class="c-err">$1$2</span>');
}

function escHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function CodeBlock({ code, language = "bash", showCopy = true, className = "" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const lines = code.split("\n");

  return (
    <div className={`codeblock ${className}`} style={{ position: "relative" }}>
      {showCopy && (
        <button
          onClick={handleCopy}
          title="Copy code"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: copied ? "var(--emerald-dim)" : "var(--card)",
            border: `1px solid ${copied ? "var(--emerald)" : "var(--border)"}`,
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 10,
            cursor: "pointer",
            color: copied ? "var(--emerald)" : "var(--muted)",
            fontFamily: "IBM Plex Mono",
            transition: "all 0.2s ease",
          }}
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      )}
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {lines.map((line, i) => (
          <span
            key={i}
            dangerouslySetInnerHTML={{
              __html: syntaxHighlight(line) + (i < lines.length - 1 ? "\n" : ""),
            }}
          />
        ))}
      </pre>
    </div>
  );
}

// ============================================================
// Tabs
// ============================================================
export function Tabs({ tabs, activeTab, onTabChange, className = "" }) {
  return (
    <div className={`tab-list ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span style={{ marginRight: 5 }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// SearchBox
// ============================================================
export function SearchBox({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`search-box ${className}`}>
      <span style={{ color: "var(--muted)", fontSize: 16, flexShrink: 0 }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 14,
            padding: "0 2px",
            flexShrink: 0,
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ============================================================
// SectionHeader
// ============================================================
export function SectionHeader({ title, subtitle, badge, className = "" }) {
  return (
    <div className={`${className}`} style={{ marginBottom: 28 }}>
      {badge && (
        <div style={{ marginBottom: 10 }}>
          <Badge variant="cyan">{badge}</Badge>
        </div>
      )}
      <h1
        className="font-heading"
        style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginBottom: 8 }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 640, lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ============================================================
// StepProgress
// ============================================================
export function StepProgress({ current, total }) {
  return (
    <div className="step-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`step-pip ${i <= current ? "active" : ""}`} />
      ))}
    </div>
  );
}

// ============================================================
// Collapsible
// ============================================================
export function Collapsible({ title, icon, children, defaultOpen = false, className = "" }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`gitverse-card ${className}`} style={{ overflow: "hidden", marginBottom: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text)",
          textAlign: "left",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--card-h)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
        <span className="font-heading" style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>
          {title}
        </span>
        <span
          style={{
            color: "var(--muted)",
            fontSize: 18,
            transition: "transform 0.2s ease",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ›
        </span>
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0 16px 16px",
            borderTop: "1px solid var(--border)",
            paddingTop: 14,
            color: "var(--muted)",
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// DangerModes table (for git reset)
// ============================================================
export function ModesTable({ modes }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="comp-table">
        <thead>
          <tr>
            <th>Flag</th>
            <th>HEAD</th>
            <th>Index (Staging)</th>
            <th>Working Tree</th>
            <th>Use Case</th>
            <th>Danger</th>
          </tr>
        </thead>
        <tbody>
          {modes.map((m) => (
            <tr key={m.flag}>
              <td>
                <code style={{ color: "var(--cyan)" }}>{m.flag}</code>
              </td>
              <td>
                <span style={{ color: m.head.startsWith("✓") ? "var(--emerald)" : "var(--rose)" }}>
                  {m.head}
                </span>
              </td>
              <td>
                <span
                  style={{ color: m.index === "unchanged" ? "var(--muted)" : "var(--emerald)" }}
                >
                  {m.index}
                </span>
              </td>
              <td>
                <span
                  style={{ color: m.working === "unchanged" ? "var(--muted)" : "var(--emerald)" }}
                >
                  {m.working}
                </span>
              </td>
              <td style={{ fontSize: 12 }}>{m.use || m.result}</td>
              <td>
                <Badge
                  variant={m.danger === "high" ? "high" : m.danger === "low" ? "easy" : "medium"}
                >
                  {m.danger}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// ComparisonTable
// ============================================================
export function ComparisonTable({ headers, rows, className = "" }) {
  return (
    <div className={`${className}`} style={{ overflowX: "auto" }}>
      <table className="comp-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ fontSize: ci === 0 ? 13 : 12 }}>
                  {typeof cell === "string" ? (
                    <span dangerouslySetInnerHTML={{ __html: cell }} />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// VizCanvas wrapper
// ============================================================
export function VizCanvas({ children, minHeight = 180, className = "" }) {
  return (
    <div className={`viz-canvas ${className}`} style={{ minHeight }}>
      {children}
    </div>
  );
}

// ============================================================
// InfoCard
// ============================================================
export function InfoCard({ icon, title, children, accentColor = "var(--accent)", className = "" }) {
  return (
    <div
      className={`gitverse-card ${className}`}
      style={{ padding: 16, borderLeft: `3px solid ${accentColor}` }}
    >
      <div
        className="font-heading"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <span>{title}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
