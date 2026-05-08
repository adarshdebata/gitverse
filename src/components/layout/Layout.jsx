import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";

function TopBar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
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
        ☰
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
    </header>
  );
}

export default function Layout({ children }) {
  const { theme } = useAppStore();

  // Apply theme class to html element
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
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
