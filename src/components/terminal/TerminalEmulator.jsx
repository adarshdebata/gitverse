import { useRef, useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { parseCommand } from "./terminalEngine";
import { Trash2, RotateCcw, ChevronRight } from "lucide-react";

const QUICK_CMDS = [
  "git status",
  "git log --oneline",
  "git branch",
  "git diff",
  "git diff --staged",
  "git stash list",
  "git reflog",
  "git log --graph",
];

function HighlightedCmd({ cmd }) {
  const parts = cmd.trim().split(/\s+/);
  return (
    <>
      {parts.map((p, i) => {
        let color;
        if (i === 0 && p === "git")   color = "#10b981";
        else if (i === 0)             color = "#e2e2f4";
        else if (i === 1)             color = "#10b981";
        else if (p.startsWith("--")) color = "#6366f1";
        else if (p.startsWith("-"))  color = "#f59e0b";
        else if (/^[0-9a-f]{6,}$/.test(p)) color = "#f59e0b";
        else if (p.startsWith('"') || p.startsWith("'")) color = "#22d3ee";
        else color = "#e2e2f4";
        return <span key={i} style={{ color }}>{i > 0 ? " " : ""}{p}</span>;
      })}
    </>
  );
}

export default function TerminalEmulator() {
  const { repoState, terminalHistory, appendTerminalLine, clearTerminal, resetRepo, updateRepo } =
    useAppStore();

  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const cmdHistory = terminalHistory.filter((e) => e.type === "command").map((e) => e.cmd);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [terminalHistory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runCommand = useCallback(
    (cmd) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      if (trimmed === "clear") {
        clearTerminal();
        setInput("");
        return;
      }

      const { output, repoUpdate } = parseCommand(trimmed, repoState);
      appendTerminalLine({ type: "command", cmd: trimmed, branch: repoState.branch });
      appendTerminalLine({ type: "output", output });
      if (repoUpdate) updateRepo(repoUpdate);

      setInput("");
      setHistIdx(-1);
    },
    [repoState, appendTerminalLine, updateRepo, clearTerminal]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") { runCommand(input); return; }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
        setHistIdx(newIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - newIdx] || "");
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const newIdx = Math.max(histIdx - 1, -1);
        setHistIdx(newIdx);
        setInput(newIdx === -1 ? "" : cmdHistory[cmdHistory.length - 1 - newIdx] || "");
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const completions = [
          "git status", "git add", "git commit", "git push", "git pull",
          "git branch", "git switch", "git stash", "git reset", "git revert",
          "git log", "git diff", "git reflog", "git cherry-pick", "git rebase", "git bisect",
        ];
        const match = completions.find((c) => c.startsWith(input) && c !== input);
        if (match) setInput(match);
        return;
      }

      if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        appendTerminalLine({ type: "output", output: '<span class="t-warn">^C</span>' });
        setInput("");
        return;
      }
    },
    [input, histIdx, cmdHistory, runCommand, appendTerminalLine]
  );

  return (
    <div className="terminal-root">
      {/* Title bar */}
      <div className="terminal-bar">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div className="terminal-dot terminal-dot-red" />
          <div className="terminal-dot terminal-dot-yellow" />
          <div className="terminal-dot terminal-dot-green" />
        </div>
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            color: "var(--muted)",
            marginLeft: 10,
            flex: 1,
          }}
        >
          GitVerse Terminal
          <span style={{ color: "var(--accent)", marginLeft: 6 }}>— {repoState.branch}</span>
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          <button
            className="btn"
            style={{ padding: "3px 9px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}
            onClick={clearTerminal}
            title="Clear terminal"
          >
            <Trash2 size={10} /> clear
          </button>
          <button
            className="btn btn-danger"
            style={{ padding: "3px 9px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}
            onClick={resetRepo}
            title="Reset repository state"
          >
            <RotateCcw size={10} /> reset repo
          </button>
        </div>
      </div>

      {/* Quick command chips */}
      <div className="terminal-quick-bar">
        {QUICK_CMDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => runCommand(cmd)}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              padding: "3px 10px",
              fontSize: 10,
              color: "var(--text-muted)",
              fontFamily: "IBM Plex Mono, monospace",
              cursor: "pointer",
              transition: "all 0.14s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-dim)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Output body — always dark */}
      <div
        className="terminal-body"
        ref={bodyRef}
        onClick={() => inputRef.current?.focus()}
      >
        {terminalHistory.length === 0 && (
          <div style={{ marginBottom: 14, borderLeft: "2px solid #6366f1", paddingLeft: 12 }}>
            <div style={{ color: "#6366f1", fontWeight: 700, fontSize: 12, marginBottom: 5, letterSpacing: "0.02em" }}>
              GitVerse Terminal
            </div>
            <div style={{ color: "#3a3a60", fontSize: 11, lineHeight: 1.7 }}>
              <span style={{ color: "#10b981" }}>$</span>{" "}
              <span style={{ color: "#4a4a7a" }}>git init &amp;&amp; git commit -m "Initial commit" --allow-empty</span>
            </div>
            <div style={{ color: "#4a4a7a", fontSize: 11, lineHeight: 1.7 }}>
              Initialized empty Git repository · [main (root-commit) <span style={{ color: "#f59e0b" }}>a1b2c3d</span>] Initial commit
            </div>
            <div style={{ color: "#6e6e9e", marginTop: 6, fontSize: 11 }}>
              Sandbox ready — type{" "}
              <span style={{ color: "#6366f1", fontWeight: 600 }}>help</span>{" "}
              for all commands, or click a quick-action above.
            </div>
            <div style={{ color: "#3a3a60", marginTop: 2, fontSize: 10.5 }}>
              ↑↓ history · Tab autocomplete · Ctrl+C cancel
            </div>
          </div>
        )}

        {terminalHistory.map((entry, i) => {
          if (entry.type === "command") {
            return (
              <div key={i} style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <span className="t-prompt">dev@gitverse</span>
                <span className="t-path">~/project</span>
                <span style={{ color: "#6e6e9e" }}>(</span>
                <span className="t-branch">{entry.branch}</span>
                <span style={{ color: "#6e6e9e" }}>)</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>$</span>
                <HighlightedCmd cmd={entry.cmd} />
              </div>
            );
          }
          if (entry.type === "output") {
            return (
              <div
                key={i}
                style={{ marginBottom: 8, paddingLeft: 2, whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: entry.output }}
              />
            );
          }
          return null;
        })}

        {/* Live input line */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span className="t-prompt">dev@gitverse</span>
          <span className="t-path">~/project</span>
          <span className="t-prompt">(</span>
          <span className="t-branch">{repoState.branch}</span>
          <span className="t-prompt">)</span>
          <span className="t-prompt" style={{ display: "flex", alignItems: "center" }}>
            <ChevronRight size={12} />
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type a git command…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="terminal-input"
          />
        </div>
      </div>
    </div>
  );
}
