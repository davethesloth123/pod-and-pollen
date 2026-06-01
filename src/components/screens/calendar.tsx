'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisThumb, IrisCard, SectionLabel, Chip, Segmented, btnReset, EmptyState } from '@/components/ui/shared'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { irises, locations, crosses, crossesList, crossStats, byId, PAL, STATUS } from '@/lib/data'
import type { Iris } from '@/types'

// ── Static bloom calendar data ────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthCounts = [0, 0, 0, 1, 7, 2, 0, 0, 0, 1, 0, 0]
const currentMonth = new Date().getMonth() // 0-indexed

// ── CalendarScreen ────────────────────────────────────────────
export function CalendarScreen({ go, wide }: {
  go: (screen: string, params?: Record<string, unknown>) => void
  wide?: boolean
}) {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)

  // Derive irises for selected month
  // Primary: check floweringHistory for first dates matching selected month
  // Fallback: show Flowering/First flower irises for May (index 4), otherwise none
  const monthIrises: Iris[] = irises.filter(iris => {
    // Check floweringHistory for any entry where first date falls in selected month
    if (iris.floweringHistory?.length) {
      return iris.floweringHistory.some(fh => {
        if (!fh.first) return false
        // fh.first format: "DD/MM/YYYY" or "MM/DD/YYYY" — data uses DD/MM/YYYY
        const parts = fh.first.split('/')
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10) - 1 // 0-indexed
          return month === selectedMonth
        }
        return false
      })
    }
    // Fallback: flowering/first-flower irises show in May
    if (selectedMonth === 4 && (iris.status === 'Flowering' || iris.status === 'First flower')) {
      return true
    }
    // October rebloomers
    if (selectedMonth === 9 && iris.cls?.includes('reblooming')) {
      return true
    }
    return false
  })

  const maxCount = Math.max(...monthCounts, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 16px' }}>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
          fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: -0.3,
        }}>
          Bloom calendar
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          When your irises flower through the year
        </p>
      </div>

      {/* Year bar chart */}
      <div style={{
        margin: '0 0 20px',
        background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)',
        padding: '18px 0 16px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, padding: '0 18px' }}>
          {MONTHS.map((m, i) => {
            const count = monthCounts[i]
            const isNow = i === currentMonth
            const isSelected = i === selectedMonth
            const barPct = count > 0 ? Math.min(Math.round((count / maxCount) * 88) + 8, 96) : 0
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(i)}
                style={{ ...btnReset, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
                  color: isNow ? 'var(--accent)' : isSelected ? 'var(--ink-2)' : 'var(--ink-4)',
                }}>
                  {m[0]}
                </div>
                <div style={{
                  width: '100%', height: 48, borderRadius: 6,
                  background: count
                    ? `linear-gradient(to top, var(--accent) ${barPct}%, var(--accent-bg) ${barPct}%)`
                    : 'var(--surface-2)',
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : isNow
                      ? '1.5px solid var(--accent-2)'
                      : '1px solid var(--line)',
                  transition: 'border .15s',
                }} />
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: count ? 'var(--ink-2)' : 'var(--ink-5)',
                }}>
                  {count || '–'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Month selector (scrollable chips) */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', padding: '0 18px 16px',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      } as React.CSSProperties}>
        {MONTHS.map((m, i) => (
          <Chip
            key={m}
            active={selectedMonth === i}
            onClick={() => setSelectedMonth(i)}
          >
            {m}
            {monthCounts[i] > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: 999, marginLeft: 2,
                background: selectedMonth === i ? 'rgba(255,255,255,0.25)' : 'var(--accent-bg)',
                color: selectedMonth === i ? '#fff' : 'var(--accent)',
                fontSize: 10, fontWeight: 700,
              }}>
                {monthCounts[i]}
              </span>
            )}
          </Chip>
        ))}
      </div>

      {/* Selected month content */}
      <div style={{ padding: '0 18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionLabel>
            {MONTHS[selectedMonth]} · {monthCounts[selectedMonth]} {monthCounts[selectedMonth] === 1 ? 'iris' : 'irises'}
          </SectionLabel>
          {currentMonth === selectedMonth && (
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
              padding: '3px 9px', borderRadius: 999,
              background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-line)',
            }}>
              This month
            </span>
          )}
        </div>

        {monthIrises.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={`Nothing blooming in ${MONTHS[selectedMonth]}`}
            body="No flowering records found for this month. Add flowering history to your irises to populate the calendar."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {monthIrises.map(iris => {
              // Find the flowering record for this month
              const fh = iris.floweringHistory?.find(r => {
                if (!r.first) return false
                const parts = r.first.split('/')
                return parts.length === 3 && parseInt(parts[1], 10) - 1 === selectedMonth
              })
              return (
                <button
                  key={iris.id}
                  onClick={() => go('detail', { id: iris.id })}
                  style={{ ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <div style={{
                    display: 'flex', gap: 13, alignItems: 'center', padding: 10,
                    background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
                  }}>
                    {/* Iris thumb */}
                    <div style={{ width: 66, height: 66, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                      <IrisThumb iris={iris} r={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600,
                        fontSize: 17, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {iris.name}
                      </div>
                      {fh ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                          {fh.first && (
                            <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="calendar" size={12} stroke="var(--ink-4)" sw={1.8} />
                              First: {fh.first}
                            </span>
                          )}
                          {fh.stems !== undefined && (
                            <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="leaf" size={12} stroke="var(--ink-4)" sw={1.8} />
                              {fh.stems} {fh.stems === 1 ? 'stem' : 'stems'}
                            </span>
                          )}
                          {fh.buds !== undefined && (
                            <span style={{ fontSize: 12.5, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Icon name="flower" size={12} stroke="var(--green)" sw={1.8} />
                              {fh.buds} buds
                            </span>
                          )}
                          {fh.year && (
                            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{fh.year}</span>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
                          {iris.cls} · {iris.loc}
                        </div>
                      )}
                    </div>
                    <Icon name="chevron" size={18} stroke="var(--ink-4)" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Season summary card */}
      <div style={{ margin: '-16px 18px 32px' }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)',
          padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 12 }}>
            Season overview
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Peak month</div>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
                {MONTHS[monthCounts.indexOf(Math.max(...monthCounts))]}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Season total</div>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
                {monthCounts.reduce((a, b) => a + b, 0)} recorded
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Active months</div>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
                {monthCounts.filter(c => c > 0).length} of 12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
