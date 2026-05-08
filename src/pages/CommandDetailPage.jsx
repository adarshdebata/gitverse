import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { COMMANDS } from '@/data/commands'
import { Badge, Alert, CodeBlock, Tabs, ModesTable, ComparisonTable, InfoCard } from '@/components/ui/index.jsx'
import CommitGraph from '@/components/graphs/CommitGraph'
import {
  StagingViz, RebaseViz, ResetViz, StashViz, ReflogViz,
  MergeConflictViz, BisectViz, GitObjectModel
} from '@/components/visualizers/index.jsx'

const VIZ_MAP = {
  staging:    StagingViz,
  rebase:     RebaseViz,
  reset:      ResetViz,
  stash:      StashViz,
  reflog:     ReflogViz,
  merge:      MergeConflictViz,
  bisect:     BisectViz,
  internals:  GitObjectModel,
}

const TABS = [
  { id: 'overview',   label: 'Overview',       icon: '📋' },
  { id: 'syntax',     label: 'Syntax',          icon: '💻' },
  { id: 'viz',        label: 'Visualization',   icon: '🎨' },
  { id: 'internals',  label: 'Git Internals',   icon: '⚙️' },
  { id: 'pitfalls',   label: 'Pitfalls & Recovery', icon: '🛡️' },
]

export default function CommandDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [tab, setTab] = useState('overview')

  const cmd = COMMANDS[id] || Object.values(COMMANDS).find(c => c.id === id)

  if (!cmd) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 className="font-heading" style={{ marginBottom: 12 }}>Command not found: {id}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/commands')}>
          ← Back to Commands
        </button>
      </div>
    )
  }

  const VizComponent = VIZ_MAP[cmd.visualization]

  return (
    <div className="animate-fade-up">
      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 52 }}>{cmd.emoji}</div>

        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <h1 className="font-heading" style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900 }}>
              {cmd.name}
            </h1>
            <Badge variant={cmd.difficulty}>{cmd.difficulty}</Badge>
            <Badge variant={cmd.danger}>{cmd.danger} risk</Badge>
            {cmd.deprecated && <Badge variant="deprecated">deprecated</Badge>}
          </div>

          <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 680, lineHeight: 1.75, marginBottom: 10 }}>
            {cmd.short}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {cmd.tags.map(t => (
              <Badge key={t} variant="purple">{t}</Badge>
            ))}
          </div>

          {/* Deprecation notice */}
          {cmd.deprecation_note && (
            <Alert type="warn" style={{ marginTop: 10 }}>
              {cmd.deprecation_note}
            </Alert>
          )}
        </div>

        <button
          className="btn"
          style={{ flexShrink: 0 }}
          onClick={() => navigate('/commands')}
        >
          ← Back
        </button>
      </div>

      {/* Related commands quick-nav */}
      {cmd.related && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12, fontFamily: 'IBM Plex Mono' }}>
            Related:
          </span>
          {cmd.related.map(r => {
            const relCmd = COMMANDS[r]
            return relCmd ? (
              <button
                key={r}
                className="btn"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => { navigate(`/commands/${r}`); setTab('overview') }}
              >
                {relCmd.emoji} {r}
              </button>
            ) : null
          })}
        </div>
      )}

      {/* ── TABS ───────────────────────────────────────── */}
      <Tabs tabs={TABS} activeTab={tab} onTabChange={setTab} />

      {/* ── TAB: OVERVIEW ──────────────────────────────── */}
      {tab === 'overview' && (
        <div className="animate-fade-in">
          {/* Purpose */}
          <InfoCard icon="🎯" title="Purpose" accentColor="var(--accent)" style={{ marginBottom: 16 }}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{cmd.purpose}</p>
          </InfoCard>

          {/* When to use / not */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="gitverse-card" style={{ padding: 16, borderColor: 'rgba(16,185,129,0.3)' }}>
              <div style={{ fontWeight: 700, color: 'var(--emerald)', marginBottom: 12, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'IBM Plex Mono' }}>
                ✅ When to use
              </div>
              {(cmd.when_to_use || []).map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--emerald)', flexShrink: 0 }}>→</span>
                  <span style={{ color: 'var(--muted)' }}>{w}</span>
                </div>
              ))}
            </div>

            <div className="gitverse-card" style={{ padding: 16, borderColor: 'rgba(244,63,94,0.3)' }}>
              <div style={{ fontWeight: 700, color: 'var(--rose)', marginBottom: 12, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'IBM Plex Mono' }}>
                🚫 When NOT to use
              </div>
              {(cmd.when_not_to_use || []).map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--rose)', flexShrink: 0 }}>→</span>
                  <span style={{ color: 'var(--muted)' }}>{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reset modes table */}
          {cmd.modes && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Mode Comparison
              </h3>
              <ModesTable modes={cmd.modes} />
            </div>
          )}

          {/* Interactive rebase commands */}
          {cmd.interactive_rebase_commands && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Interactive Rebase Commands
              </h3>
              <ComparisonTable
                headers={['Command', 'Alias', 'Effect']}
                rows={cmd.interactive_rebase_commands.map(c => [
                  <code style={{ color: 'var(--cyan)' }}>{c.cmd}</code>,
                  <code style={{ color: 'var(--muted)' }}>{c.alias}</code>,
                  c.desc,
                ])}
              />
            </div>
          )}

          {/* Modern alternatives */}
          {cmd.modern_alternatives && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                ✨ Modern Alternatives
              </h3>
              <div className="gitverse-card" style={{ padding: 16 }}>
                {cmd.modern_alternatives.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12,
                    fontFamily: 'IBM Plex Mono', fontSize: 12, flexWrap: 'wrap',
                  }}>
                    <code style={{ color: 'var(--rose)', textDecoration: 'line-through' }}>{a.old}</code>
                    <span style={{ color: 'var(--muted)' }}>→</span>
                    <code style={{ color: 'var(--emerald)' }}>{a.new}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Before/After state */}
          {cmd.before_state && (
            <div style={{ marginBottom: 16 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Before / After State
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="gitverse-card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--rose)', marginBottom: 10, fontSize: 12,
                    fontFamily: 'IBM Plex Mono' }}>BEFORE</div>
                  {Object.entries(cmd.before_state).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'IBM Plex Mono',
                        textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                      {v.map((item, i) => (
                        <div key={i} style={{ fontSize: 11, fontFamily: 'IBM Plex Mono',
                          color: 'var(--text)', padding: '2px 0' }}>· {item}</div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="gitverse-card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--emerald)', marginBottom: 10, fontSize: 12,
                    fontFamily: 'IBM Plex Mono' }}>AFTER</div>
                  {Object.entries(cmd.after_state).map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'IBM Plex Mono',
                        textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                      {v.map((item, i) => (
                        <div key={i} style={{ fontSize: 11, fontFamily: 'IBM Plex Mono',
                          color: 'var(--text)', padding: '2px 0' }}>· {item}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enterprise note */}
          {cmd.enterprise_note && (
            <Alert type="info" style={{ marginBottom: 16 }}>
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>🏢 Enterprise note</strong>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.65 }}>
                  {cmd.enterprise_note}
                </pre>
              </div>
            </Alert>
          )}

          {/* Recovery workflows */}
          {cmd.recovery_workflows && (
            <div>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                🛟 Recovery Workflows
              </h3>
              {cmd.recovery_workflows.map((r, i) => (
                <div
                  key={i}
                  className="gitverse-card"
                  style={{ padding: 16, marginBottom: 12, borderLeft: '3px solid var(--emerald)' }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--emerald)', marginBottom: 10 }}>
                    {r.scenario}
                  </div>
                  {r.steps.map((s, si) => (
                    <div key={si} style={{ fontFamily: 'IBM Plex Mono', fontSize: 12,
                      color: 'var(--muted)', marginBottom: 4 }}>
                      {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Team workflow */}
          {cmd.team_workflow && (
            <InfoCard icon="👥" title="Team Workflow" accentColor="var(--purple)" style={{ marginTop: 16 }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'IBM Plex Mono', fontSize: 12 }}>
                {cmd.team_workflow}
              </pre>
            </InfoCard>
          )}
        </div>
      )}

      {/* ── TAB: SYNTAX ────────────────────────────────── */}
      {tab === 'syntax' && (
        <div className="animate-fade-in">
          <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Syntax Reference
          </h3>

          <div style={{ marginBottom: 24 }}>
            {cmd.syntax.map((s, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div className="codeblock" style={{ flex: 1, display: 'flex', alignItems: 'center',
                    gap: 8, padding: '10px 14px' }}>
                    <span style={{ color: 'var(--accent)', userSelect: 'none', flexShrink: 0 }}>$</span>
                    <code style={{ background: 'none', border: 'none', padding: 0,
                      color: 'var(--cyan)', fontSize: 13 }}>
                      {s.cmd}
                    </code>
                    {s.deprecated && (
                      <Badge variant="deprecated" style={{ marginLeft: 'auto' }}>deprecated</Badge>
                    )}
                  </div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 5, marginLeft: 2 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Examples */}
          {cmd.examples && (
            <div>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                Real-World Examples
              </h3>
              {cmd.examples.map((ex, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: 'var(--text)' }}>
                    {ex.title}
                  </div>
                  <CodeBlock code={ex.code} />
                </div>
              ))}
            </div>
          )}

          {/* Manual workflow steps */}
          {cmd.example_workflow_manual && (
            <div style={{ marginTop: 16 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Step-by-Step Workflow
              </h3>
              <CodeBlock code={cmd.example_workflow_manual.join('\n')} />
            </div>
          )}
        </div>
      )}

      {/* ── TAB: VISUALIZATION ─────────────────────────── */}
      {tab === 'viz' && (
        <div className="animate-fade-in">
          <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            Interactive Visualization
          </h3>

          {VizComponent ? (
            <VizComponent />
          ) : (
            <div>
              <div className="viz-canvas" style={{ marginBottom: 16 }}>
                <CommitGraph scenario="feature_branch" animated />
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
                  Commit graph showing {cmd.name} operations. Click nodes to inspect.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: INTERNALS ─────────────────────────────── */}
      {tab === 'internals' && (
        <div className="animate-fade-in">
          <InfoCard icon="⚙️" title="Git Internals" accentColor="var(--accent)" style={{ marginBottom: 20 }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Manrope', fontSize: 13, lineHeight: 1.75 }}>
              {cmd.internals}
            </pre>
          </InfoCard>

          <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            Inspect the Object Database
          </h3>
          <CodeBlock code={`# Inspect the object database directly
git cat-file -t HEAD        # type: commit
git cat-file -p HEAD        # print commit object content
git ls-tree HEAD            # show tree for current commit
git ls-files --stage        # inspect the index entries
cat .git/HEAD               # see current HEAD pointer
ls .git/refs/heads/         # see all branch refs`} style={{ marginBottom: 16 }} />

          {cmd.danger !== 'safe' && (
            <Alert type="danger">
              <strong>SHA implication:</strong> {cmd.name} rewrites commit objects.
              New SHAs are generated. Anyone who has fetched the old SHAs must
              rebase their work — this is why force-pushing rewrites breaks teams.
            </Alert>
          )}
        </div>
      )}

      {/* ── TAB: PITFALLS ──────────────────────────────── */}
      {tab === 'pitfalls' && (
        <div className="animate-fade-in">
          {/* Mistakes */}
          {cmd.mistakes?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Common Mistakes
              </h3>
              {cmd.mistakes.map((m, i) => (
                <Alert key={i} type="warn" style={{ marginBottom: 8 }}>
                  {m}
                </Alert>
              ))}
            </div>
          )}

          {/* Safer alternatives */}
          {cmd.safer_alternatives?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                Safer Alternatives
              </h3>
              {cmd.safer_alternatives.map((a, i) => (
                <div key={i} className="gitverse-card" style={{
                  padding: 14, marginBottom: 10,
                  display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap',
                }}>
                  <code style={{ color: 'var(--cyan)', fontSize: 13, flexShrink: 0 }}>{a.cmd}</code>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{a.reason}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recovery path */}
          {cmd.recovery && (
            <div>
              <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                🛟 Recovery Path
              </h3>
              <div className="gitverse-card" style={{ padding: 16, borderLeft: '3px solid var(--emerald)' }}>
                <pre style={{ fontFamily: 'IBM Plex Mono', fontSize: 12, color: 'var(--muted)',
                  whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                  {cmd.recovery}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
