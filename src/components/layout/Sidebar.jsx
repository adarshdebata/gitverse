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
  X,
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
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const closeOnMobile = () => {
    if (window.matchMedia("(max-width: 640px)").matches && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={`sidebar-responsive${sidebarOpen ? " sidebar-mobile-open" : ""}`}
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
            width: 34,
            height: 34,
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #22d3ee 100%)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(99,102,241,0.45)",
          }}
        >
          {/* Git commit-graph logo: three nodes + branch lines */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {/* vertical trunk line */}
            <line x1="6" y1="4" x2="6" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            {/* branch line to feature */}
            <line x1="6" y1="7" x2="14" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            {/* commit nodes */}
            <circle cx="6"  cy="4"  r="2.2" fill="white" />
            <circle cx="6"  cy="10" r="2.2" fill="white" opacity="0.85"/>
            <circle cx="6"  cy="16" r="2.2" fill="white" opacity="0.7"/>
            <circle cx="14" cy="13" r="2.2" fill="white" opacity="0.9"/>
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

        <button
          className="sidebar-close-btn"
          onClick={toggleSidebar}
          title="Close menu"
        >
          <X size={16} />
        </button>
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
                  onClick={closeOnMobile}
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
