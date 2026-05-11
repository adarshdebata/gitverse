import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, ChevronDown } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";

function TopBar() {
  const { toggleSidebar, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();
  const [versionOpen, setVersionOpen] = useState(false);
  const versionRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (versionRef.current && !versionRef.current.contains(e.target)) setVersionOpen(false);
    }
    if (versionOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [versionOpen]);

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

      {/* Git version selector */}
      <div ref={versionRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setVersionOpen(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            fontSize: 10, fontFamily: "IBM Plex Mono",
            color: "var(--muted)", background: "var(--card)",
            border: "1px solid var(--border)", borderRadius: 6,
            padding: "4px 10px", cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-b)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          git 2.44+ <ChevronDown size={10} />
        </button>
        {versionOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 0", zIndex: 100, minWidth: 160,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          }}>
            {[
              { v: "2.44+", label: "Latest (2.44+)", note: "all features" },
              { v: "2.38+", label: "2.38 – 2.43",   note: "no sparse-index" },
              { v: "2.23+", label: "2.23 – 2.37",   note: "switch/restore added" },
            ].map(item => (
              <button key={item.v}
                onClick={() => setVersionOpen(false)}
                style={{
                  display: "flex", flexDirection: "column", width: "100%",
                  padding: "8px 14px", background: "none", border: "none",
                  textAlign: "left", cursor: "pointer", gap: 2,
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: 12, color: "var(--text)", fontFamily: "IBM Plex Mono" }}>{item.label}</span>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{item.note}</span>
              </button>
            ))}
          </div>
        )}
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
