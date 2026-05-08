import { useAppStore } from '@/store/useAppStore'
import { Tabs, SectionHeader } from '@/components/ui/index.jsx'
import CommitGraph from '@/components/graphs/CommitGraph'
import TerminalEmulator from '@/components/terminal/TerminalEmulator'
import { RebaseViz, ResetViz, StashViz, MergeConflictViz, BisectViz } from '@/components/visualizers/index.jsx'
import { getBranchColor } from '@/data/graphs'

const TABS = [
  { id: 'terminal',    label: 'Terminal',         icon: '💻' },
  { id: 'graph',       label: 'Commit Graph',     icon: '🌿' },
  { id: 'rebase',      label: 'Rebase Sim',       icon: '🔁' },
  { id: 'reset',       label: 'Reset Sim',        icon: '⏪' },
  { id: 'stash',       label: 'Stash Sim',        icon: '🗃️' },
  { id: 'merge',       label: 'Merge Conflict',   icon: '⚔️' },
  { id: 'bisect',      label: 'Bisect Debugger',  icon: '🔬' },
]

export default function PlaygroundPage() {
  const { playgroundTab, setPlaygroundTab, repoState } = useAppStore()

  return (
    <div className="animate-fade-up">
      <SectionHeader
        title="Interactive Playground"
        subtitle="Type real git commands, explore branch state, and step through animated simulations. Everything is sandboxed — no real repos are affected."
        badge="interactive"
      />

      <Tabs tabs={TABS} activeTab={playgroundTab} onTabChange={setPlaygroundTab} />

      {/* ── TERMINAL ─────────────────────────────── */}
      {playgroundTab === 'terminal' && (
        <div className="animate-fade-in">
          <TerminalEmulator />
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <RepoStatePanel />
            <div className="gitverse-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 10,
                fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                📖 Tips
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.75 }}>
                • Use ↑↓ arrows for command history<br />
                • Press Tab for autocomplete<br />
                • Ctrl+C to cancel current input<br />
                • Type <code>help</code> for all commands<br />
                • Click "reset repo" to start fresh
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMIT GRAPH ─────────────────────────── */}
      {playgroundTab === 'graph' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Live visualization of the simulated repository. Run commands in the Terminal tab
            to update the commit history and branch state.
          </div>
          <div className="viz-canvas" style={{ marginBottom: 16 }}>
            <CommitGraph scenario="feature_branch" animated showLabels showHead />
          </div>
          <RepoStatePanel expanded />
        </div>
      )}

      {/* ── SIMULATORS ───────────────────────────── */}
      {playgroundTab === 'rebase' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Step through a complete git rebase operation — see how commits are detached,
            replayed on the new base, and assigned new SHAs.
          </div>
          <RebaseViz />
        </div>
      )}

      {playgroundTab === 'reset' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Visualize all three reset modes and their effect on the Three Trees:
            HEAD, Index (staging area), and Working Tree.
          </div>
          <ResetViz />
        </div>
      )}

      {playgroundTab === 'stash' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Step through a complete stash workflow: save work, switch branches,
            do a hotfix, then restore your in-progress changes.
          </div>
          <StashViz />
        </div>
      )}

      {playgroundTab === 'merge' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Simulate a merge conflict from start to resolution. See how Git writes
            conflict markers and how to resolve them properly.
          </div>
          <MergeConflictViz />
        </div>
      )}

      {playgroundTab === 'bisect' && (
        <div className="animate-fade-in">
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            Watch git bisect perform binary search to find the commit that introduced a bug.
            10 commits = only 4 steps needed.
          </div>
          <BisectViz />
        </div>
      )}
    </div>
  )
}

function RepoStatePanel({ expanded = false }) {
  const { repoState } = useAppStore()

  return (
    <div className="gitverse-card" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 12,
        fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        📊 Repository State
      </div>

      {/* Branch */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'IBM Plex Mono',
          textTransform: 'uppercase', marginBottom: 4 }}>Current Branch</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%',
            background: getBranchColor(repoState.branch) }} />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--accent)' }}>
            {repoState.branch}
          </span>
        </div>
      </div>

      {/* All branches */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'IBM Plex Mono',
          textTransform: 'uppercase', marginBottom: 4 }}>Branches</div>
        {repoState.branches.map(b => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%',
              background: getBranchColor(b) }} />
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 11,
              color: b === repoState.branch ? 'var(--accent)' : 'var(--muted)' }}>
              {b === repoState.branch ? '* ' : '  '}{b}
            </span>
          </div>
        ))}
      </div>

      {/* Recent commits */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'IBM Plex Mono',
          textTransform: 'uppercase', marginBottom: 4 }}>Recent Commits</div>
        {repoState.commits.slice(-5).reverse().map(c => (
          <div key={c.h} style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, marginBottom: 3 }}>
            <span style={{ color: 'var(--amber)' }}>{c.h}</span>
            {' '}
            <span style={{ color: 'var(--muted)' }}>{c.msg}</span>
          </div>
        ))}
      </div>

      {/* Working state */}
      {(repoState.staged.length > 0 || repoState.unstaged.length > 0) && (
        <div>
          {repoState.staged.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: 'var(--emerald)', fontFamily: 'IBM Plex Mono',
                textTransform: 'uppercase', marginBottom: 3 }}>Staged</div>
              {repoState.staged.map(f => (
                <div key={f} style={{ fontFamily: 'IBM Plex Mono', fontSize: 11,
                  color: 'var(--emerald)' }}>+ {f}</div>
              ))}
            </div>
          )}
          {repoState.unstaged.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--amber)', fontFamily: 'IBM Plex Mono',
                textTransform: 'uppercase', marginBottom: 3 }}>Unstaged</div>
              {repoState.unstaged.map(f => (
                <div key={f} style={{ fontFamily: 'IBM Plex Mono', fontSize: 11,
                  color: 'var(--amber)' }}>~ {f}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
