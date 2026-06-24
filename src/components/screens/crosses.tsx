'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisThumb, IrisCard, SectionLabel, Chip, Segmented, btnReset, EmptyState, RatingDots, StatusBadge } from '@/components/ui/shared'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { PAL } from '@/lib/data'
import { useData } from '@/lib/data-context'
import { SeedBatchCard } from '@/components/screens/seed-batch-card'
import type { Iris, Cross } from '@/types'

// ── Status badge for cross status ────────────────────────────
const CROSS_STATUS: Record<string, string> = {
  'Sown':        'clay',
  'Germinated':  'green',
  'Growing on':  'green',
  'Evaluating':  'amber',
  'Archived':    'clay',
}

function CrossStatusBadge({ status }: { status: string }) {
  const c = CROSS_STATUS[status] || 'clay'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      background: `var(--${c}-bg)`, color: `var(--${c})`,
      border: `1px solid var(--${c}-line)`,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
    }}>
      {status}
    </span>
  )
}

// ── Thumb pair ────────────────────────────────────────────────
function ThumbPair({ podIris, polIris }: { podIris?: Iris; polIris?: Iris }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
        {podIris
          ? <IrisThumb iris={podIris} r={12} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="flower" size={22} stroke="var(--ink-4)" /></div>
        }
      </div>
      <span style={{ fontSize: 16, color: 'var(--ink-3)', fontWeight: 700 }}>×</span>
      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid var(--line)' }}>
        {polIris
          ? <IrisThumb iris={polIris} r={12} />
          : <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="droplet" size={22} stroke="var(--ink-4)" /></div>
        }
      </div>
    </div>
  )
}

// ── Cross card ────────────────────────────────────────────────
function CrossCard({ cross, go }: { cross: Cross; go: (screen: string, params?: Record<string, unknown>) => void }) {
  const { irises, crossStats } = useData()
  const podIris = irises.find(i => i.id === cross.podId) ?? irises.find(i => i.name === cross.pod)
  const polIris = irises.find(i => i.id === cross.pollenId) ?? irises.find(i => i.name === cross.pollen)
  const s = crossStats(cross.id)
  return (
    <button onClick={() => go('crossDetail', { id: cross.id })} style={{ ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)',
        padding: '14px 15px', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <ThumbPair podIris={podIris} polIris={polIris} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{
                fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
                fontSize: 15, color: 'var(--ink)', letterSpacing: 0.1,
              }}>
                {cross.code}
              </span>
              <CrossStatusBadge status={cross.status} />
            </div>
            <div style={{
              fontSize: 13, color: 'var(--ink-3)', marginBottom: 6,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {podIris?.name ?? cross.pod} × {polIris?.name ?? cross.pollen}
            </div>
            {cross.goal && (
              <div style={{
                fontSize: 12, color: 'var(--accent)', fontWeight: 600,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
                borderRadius: 8, padding: '3px 8px', display: 'inline-block', marginBottom: 8,
              }}>
                {cross.goal}
              </div>
            )}
            {/* Funnel stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="seed" size={13} stroke="var(--ink-3)" sw={1.8} />
                {s.total + ' seedlings'}
              </span>
              {s.growing > 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="sprout" size={13} stroke="var(--green)" sw={2} />
                  {s.growing + ' growing'}
                </span>
              )}
              {(s.firstFlower + s.flowering) > 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--rose)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="flower" size={13} stroke="var(--rose)" sw={2} />
                  {(s.firstFlower + s.flowering) + ' flowered'}
                </span>
              )}
            </div>
          </div>
          <Icon name="chevron" size={18} stroke="var(--ink-4)" style={{ flexShrink: 0, marginTop: 2 }} />
        </div>
      </div>
    </button>
  )
}

// ── CrossesScreen ─────────────────────────────────────────────
export function CrossesScreen({ go, wide, openAdd, openNewCross }: {
  go: (screen: string, params?: Record<string, unknown>) => void
  wide?: boolean
  openAdd?: () => void
  openNewCross?: () => void
}) {
  const { crosses, irises } = useData()
  const [filter, setFilter] = useState('All')
  const FILTERS = ['All', 'Active', 'Complete', 'Archived']

  const list = crosses
  const totalSeedlings = irises.filter(i => i.kind === 'Seedling').length
  const active = list.filter(c => c.status !== 'Archived').length
  const archived = list.filter(c => c.status === 'Archived').length

  const filtered = list.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Active') return c.status !== 'Archived' && c.status !== 'Evaluating'
    if (filter === 'Complete') return c.status === 'Evaluating'
    if (filter === 'Archived') return c.status === 'Archived'
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 14px' }}>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
          fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: -0.3,
        }}>
          Crosses
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          {active} active · {totalSeedlings} seedlings total
        </p>
      </div>

      {/* Stats card */}
      <div style={{ margin: '0 18px 18px', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { n: list.length, l: 'Total', icon: 'dna', tint: 'accent' },
            { n: active, l: 'Active', icon: 'sprout', tint: 'green' },
            { n: totalSeedlings, l: 'Seedlings', icon: 'flower', tint: 'rose' },
          ].map((stat, i) => (
            <div key={stat.l} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '0 8px',
              borderRight: i < 2 ? '1px solid var(--line)' : 'none',
            }}>
              <Icon name={stat.icon} size={18} stroke={`var(--${stat.tint})`} sw={1.9} />
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--ink)', lineHeight: 1 }}>{stat.n}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{stat.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 14px',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      } as React.CSSProperties}>
        {FILTERS.map(f => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
        ))}
      </div>

      {/* Cross list */}
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionLabel>
          {filtered.length} {filtered.length === 1 ? 'cross' : 'crosses'}
        </SectionLabel>
        {filtered.length === 0 ? (
          <EmptyState
            icon="dna"
            title="No crosses here"
            body="No crosses match this filter."
          />
        ) : (
          filtered.map(cross => (
            <CrossCard key={cross.id} cross={cross} go={go} />
          ))
        )}
      </div>

      {/* Add cross button */}
      <div style={{ padding: '16px 18px 32px' }}>
        <button
          onClick={openNewCross}
          style={{
            ...btnReset, cursor: 'pointer', width: '100%',
            border: '1.5px dashed var(--line-2)', borderRadius: 16, padding: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            color: 'var(--ink-3)', fontSize: 14.5, fontWeight: 600,
            background: 'var(--surface-2)',
          }}
        >
          <Icon name="plus" size={18} stroke="var(--ink-3)" sw={2} />
          Record new cross
        </button>
      </div>
    </div>
  )
}

// ── CrossDetailScreen ─────────────────────────────────────────
export function CrossDetailScreen({ id, go, wide, openAddSeedlings }: {
  id: string
  go: (screen: string, params?: Record<string, unknown>) => void
  wide?: boolean
  openAddSeedlings?: (cross: Cross) => void
}) {
  const { crosses, irises, crossStats } = useData() // CrossDetailScreen
  const cross = crosses.find(c => c.id === id)

  if (!cross) {
    return (
      <div style={{ padding: 18 }}>
        <EmptyState icon="dna" title="Cross not found" body="This cross no longer exists." />
      </div>
    )
  }

  const podIris = irises.find(i => i.id === cross.podId) ?? irises.find(i => i.name === cross.pod)
  const polIris = irises.find(i => i.id === cross.pollenId) ?? irises.find(i => i.name === cross.pollen)
  const s = crossStats(cross.id)
  const seedlings = irises.filter(i => i.crossId === cross.id || i.cross === cross.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => go('crosses')} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', border: '1px solid var(--line)',
          }}>
            <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
            fontSize: 19, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {cross.code}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Season {cross.season}
          </div>
        </div>
        <CrossStatusBadge status={cross.status} />
      </div>

      {/* Hero: parent pair */}
      <div style={{ margin: '18px 18px 0', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 140 }}>
          {/* Pod parent */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {podIris ? (
              <IrisThumb iris={podIris} r={0} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                <Icon name="flower" size={36} stroke="var(--ink-4)" />
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
              padding: '24px 12px 10px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Pod parent</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{podIris?.name ?? cross.pod}</div>
            </div>
          </div>

          {/* × divider */}
          <div style={{
            width: 40, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-3)' }}>×</span>
          </div>

          {/* Pollen parent */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {polIris ? (
              <IrisThumb iris={polIris} r={0} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 140 }}>
                <Icon name="droplet" size={36} stroke="var(--ink-4)" />
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
              padding: '24px 12px 10px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Pollen parent</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{polIris?.name ?? cross.pollen}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal card */}
      {cross.goal && (
        <div style={{ margin: '14px 18px 0', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 14, padding: '13px 15px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Icon name="star" size={18} stroke="var(--accent)" sw={1.9} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Breeding objective</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>{cross.goal}</div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div style={{ margin: '14px 18px 0', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '4px 16px', boxShadow: 'var(--shadow-sm)' }}>
        {[
          { label: 'Cross date', value: cross.date },
          { label: 'Pod number', value: cross.podNo ? `Pod ${cross.podNo}` : undefined },
          { label: 'Season', value: cross.season },
          { label: 'Notes', value: cross.notes },
        ].filter(r => r.value).map((row, i, arr) => (
          <div key={row.label} style={{
            padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2, marginBottom: 3 }}>{row.label}</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.4 }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div style={{ margin: '14px 18px 0' }}>
        <SectionLabel>Progress funnel</SectionLabel>
        <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {[
              { n: s.total, l: 'Seedlings', icon: 'seed', tint: 'ink-2' },
              { n: s.growing, l: 'Growing', icon: 'sprout', tint: 'green' },
              { n: s.firstFlower + s.flowering, l: 'Flowered', icon: 'flower', tint: 'rose' },
            ].map((stat, i) => (
              <div key={stat.l} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '0 6px', borderRight: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <Icon name={stat.icon} size={17} stroke={stat.tint === 'ink-2' ? 'var(--ink-2)' : `var(--${stat.tint})`} sw={1.9} />
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>{stat.n}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seed batch & progress */}
      <SeedBatchCard cross={cross} />

      {/* Seedlings */}
      <div style={{ padding: '22px 18px 0' }}>
        <SectionLabel>{seedlings.length} seedlings</SectionLabel>
        {seedlings.length === 0 ? (
          <EmptyState
            icon="sprout"
            title="No seedlings yet"
            body="Use the button below to add seedlings from this cross and track their progress."
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: wide ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: 12,
          }}>
            {seedlings.map(iris => (
              <IrisCard
                key={iris.id}
                iris={iris}
                onClick={() => go('detail', { id: iris.id })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add seedlings (single, central) */}
      <div style={{ padding: '20px 18px 32px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => openAddSeedlings && openAddSeedlings(cross)}
          style={{
            ...btnReset, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 999, background: 'var(--accent)', color: '#fff',
            fontSize: 14.5, fontWeight: 600, boxShadow: '0 4px 14px var(--accent-shadow)',
          }}
        >
          <Icon name="sprout" size={17} stroke="#fff" sw={2.2} />
          Add seedlings
        </button>
      </div>
    </div>
  )
}

// ── CompareScreen ─────────────────────────────────────────────
export function CompareScreen({ ids, go, wide }: {
  ids: string[]
  go: (screen: string, params?: Record<string, unknown>) => void
  wide?: boolean
}) {
  const { irises } = useData()
  const subjects = ids.slice(0, 2).map(id => irises.find(i => i.id === id)).filter(Boolean) as Iris[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => go(-1 as unknown as string)} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', border: '1px solid var(--line)',
          }}>
            <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
          </span>
        </button>
        <span style={{
          fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
          fontSize: 19, color: 'var(--ink)',
        }}>
          Compare seedlings
        </span>
      </div>

      {subjects.length < 2 ? (
        <div style={{ padding: 18 }}>
          <EmptyState icon="sliders" title="Select two seedlings" body="Choose two seedlings to compare them side by side." />
        </div>
      ) : (
        <div style={{ padding: '18px' }}>
          {/* Side-by-side columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {subjects.map(iris => {
              const latestEv = iris.evaluations?.[iris.evaluations.length - 1]
              return (
                <div key={iris.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Thumb */}
                  <div style={{ aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden', position: 'relative', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                    <IrisThumb iris={iris} r={0} />
                  </div>

                  {/* Name + status */}
                  <div>
                    <div style={{
                      fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
                      fontSize: 15, color: 'var(--ink)', marginBottom: 5, lineHeight: 1.2,
                    }}>
                      {iris.name}
                    </div>
                    <StatusBadge status={iris.status} />
                  </div>

                  {/* Meta */}
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                    <div>{iris.cls}</div>
                    {iris.loc && <div>{iris.loc}</div>}
                    {iris.firstFlower && <div>First flower: {iris.firstFlower}</div>}
                  </div>

                  {/* Evaluation scores */}
                  {latestEv && (
                    <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--line)', padding: '12px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 }}>
                        Evaluation {latestEv.year || ''}
                      </div>
                      {[
                        { label: 'Form',      value: latestEv.form },
                        { label: 'Colour',    value: latestEv.colour },
                        { label: 'Substance', value: latestEv.substance },
                        { label: 'Branching', value: latestEv.branching },
                        { label: 'Vigour',    value: latestEv.vigour },
                      ].map(row => (
                        <div key={row.label} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 3 }}>{row.label}</div>
                          <RatingDots value={row.value ?? 0} max={5} readOnly size={20} />
                        </div>
                      ))}
                      {latestEv.avg !== undefined && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>Average</span>
                          <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{latestEv.avg.toFixed(1)}</span>
                        </div>
                      )}
                      {latestEv.verdict && (
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4,
                            padding: '3px 9px', borderRadius: 999,
                            background: latestEv.verdict === 'Retain' ? 'var(--green-bg)' : latestEv.verdict === 'Discard' ? 'var(--rose-bg)' : 'var(--amber-bg)',
                            color: latestEv.verdict === 'Retain' ? 'var(--green)' : latestEv.verdict === 'Discard' ? 'var(--rose)' : 'var(--amber)',
                            border: `1px solid ${latestEv.verdict === 'Retain' ? 'var(--green-line)' : latestEv.verdict === 'Discard' ? 'var(--rose-line)' : 'var(--amber-line)'}`,
                          }}>
                            {latestEv.verdict}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {!latestEv && (
                    <div style={{
                      background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--line)',
                      padding: '14px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13,
                    }}>
                      No evaluations yet
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Notes comparison */}
          {subjects.some(i => i.notes?.length) && (
            <div>
              <SectionLabel>Recent notes</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {subjects.map(iris => (
                  <div key={iris.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(iris.notes?.slice(0, 2) ?? []).map((note, ni) => (
                      <div key={ni} style={{
                        background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--line)',
                        padding: '10px 12px', boxShadow: 'var(--shadow-sm)',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 3 }}>{note.t}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>{note.x}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{note.d}</div>
                      </div>
                    ))}
                    {!iris.notes?.length && (
                      <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '8px 0' }}>No notes</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
