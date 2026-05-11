import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Settings2,
  Terminal,
  Scale,
  Gamepad2,
  BarChart3,
  GitBranch,
  LifeBuoy,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const NAV_SECTIONS = [
  {
    label: "",
    items: [{ to: "/", icon: Home, label: "Home" }],
  },
  {
    label: "Learn",
    items: [
      { to: "/fundamentals", icon: BookOpen, label: "Git Fundamentals" },
      { to: "/internals", icon: Settings2, label: "Git Internals" },
    ],
  },
  {
    label: "Reference",
    items: [
      { to: "/commands", icon: Terminal, label: "Command Reference" },
      { to: "/compare", icon: Scale, label: "Comparisons" },
    ],
  },
  {
    label: "Interactive",
    items: [
      { to: "/playground", icon: Gamepad2, label: "Playground" },
      { to: "/visualizers", icon: BarChart3, label: "Visualizers" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { to: "/workflows", icon: GitBranch, label: "Workflows" },
      { to: "/recovery", icon: LifeBuoy, label: "Disaster Recovery" },
    ],
  },
];

export default function Sidebar() {
  const { sidebarOpen } = useAppStore();

  return (
    <aside
      style={{
        width: sidebarOpen ? 230 : 58,
        minWidth: sidebarOpen ? 230 : 58,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        transition: "width 0.25s ease, min-width 0.25s ease",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #22d3ee)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
        </div>
        {sidebarOpen && (
          <div className="animate-fade-in">
            <div
              className="font-heading"
              style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}
            >
              GitVerse
            </div>
            <div className="font-mono" style={{ fontSize: 9, color: "var(--muted)" }}>
              v2.0 · visual reference
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && sidebarOpen && (
              <div
                style={{
                  padding: "10px 14px 4px",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontFamily: "IBM Plex Mono",
                }}
              >
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const IconComp = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <IconComp size={16} />
                  </span>
                  {sidebarOpen && (
                    <span
                      className="animate-fade-in"
                      style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div
            className="animate-fade-in font-mono"
            style={{
              fontSize: 9,
              color: "var(--dim)",
              textAlign: "center",
              padding: "4px 0",
            }}
          >
            Git 2.44+ · All commands current
          </div>
        </div>
      )}
    </aside>
  );
}
