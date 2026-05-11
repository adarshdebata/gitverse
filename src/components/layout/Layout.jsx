import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";

function TopBar() {
  const { toggleSidebar, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: 52,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px 0 14px",
        background: "var(--surface)",
        gap: 12,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          fontSize: 18,
          padding: 4,
          borderRadius: 6,
          transition: "color 0.15s ease",
          display: "flex",
          alignItems: "center",
        }}
        title="Toggle sidebar"
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
      >
        <Menu size={18} />
      </button>

      {/* Quick nav bar */}
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {[
          { label: "Commands", path: "/commands" },
          { label: "Internals", path: "/internals" },
          { label: "Playground", path: "/playground" },
          { label: "Recovery", path: "/recovery" },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="btn"
            style={{ fontSize: 12, padding: "5px 12px" }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Git version badge */}
      <div
        style={{
          fontSize: 10,
          fontFamily: "IBM Plex Mono",
          color: "var(--muted)",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "4px 10px",
          flexShrink: 0,
        }}
      >
        git 2.44+
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          cursor: "pointer",
          color: "var(--muted)",
          fontSize: 15,
          padding: "4px 8px",
          display: "flex",
          alignItems: "center",
          transition: "border-color 0.15s ease, color 0.15s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-b)";
          e.currentTarget.style.color = "var(--text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--muted)";
        }}
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </header>
  );
}

export default function Layout({ children }) {
  const { theme } = useAppStore();

  // Sync theme class on mount and on change (covers persisted state on first load)
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Sidebar />

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <TopBar />

        {/* Main content area */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ padding: "32px 32px 60px", maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
