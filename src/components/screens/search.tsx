'use client'
import { useState, useRef } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisCard, SectionLabel, btnReset, EmptyState } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'

// ── Search suggestions (static, generic — not tied to any iris) ──
const SUGGESTIONS = ['Tall Bearded', 'Flowering', 'Seedling', 'Reblooming']

// ── Filter option types ───────────────────────────────────────
type FilterKey = 'status' | 'location' | 'classification' | 'year'

interface ActiveFilters {
  status: string
  location: string
  classification: string
  year: string
}

// ── Filter expand panel ───────────────────────────────────────
function FilterPanel({
  filterKey,
  label,
  options,
  value,
  onSelect,
  onClose,
}: {
  filterKey: FilterKey
  label: string
  options: string[]
  value: string
  onSelect: (v: string) => void
  onClose: () => void
}) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14,
      padding: '12px 14px', boxShadow: 'var(--shadow-md)', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
        <button onClick={onClose} style={{ ...btnReset, cursor: 'pointer' }}>
          <Icon name="x" size={16} stroke="var(--ink-3)" sw={2} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <button
          onClick={() => onSelect('')}
          style={{
            ...btnReset, cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            background: value === '' ? 'var(--ink)' : 'var(--surface-2)',
            color: value === '' ? '#fff' : 'var(--ink-2)',
            border: `1px solid ${value === '' ? 'var(--ink)' : 'var(--line)'}`,
          }}
        >
          Any
        </button>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              ...btnReset, cursor: 'pointer', padding: '6px 12px', borderRadius: 999,
              fontSize: 13, fontWeight: 500,
              background: value === opt ? 'var(--ink)' : 'var(--surface-2)',
              color: value === opt ? '#fff' : 'var(--ink-2)',
              border: `1px solid ${value === opt ? 'var(--ink)' : 'var(--line)'}`,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── SearchScreen ──────────────────────────────────────────────
export function SearchScreen({ go }: {
  go: (screen: string, params?: Record<string, unknown>) => void
}) {
  const { irises, locations } = useData()
  const [q, setQ] = useState('')
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)
  const [filters, setFilters] = useState<ActiveFilters>({ status: '', location: '', classification: '', year: '' })
  const inputRef = useRef<HTMLInputElement>(null)

  // Derive unique filter options from the user's real data
  const statusOptions = Array.from(new Set(irises.map(i => i.status).filter(Boolean))).sort() as string[]
  const locationOptions = locations.map(l => l.name)
  const classOptions = Array.from(new Set(irises.map(i => i.cls).filter(Boolean))).sort() as string[]
  // Best-effort 4-digit year parse from `planted`; fall back to flowering years if absent
  const yearSet = new Set<string>()
  for (const i of irises) {
    const m = i.planted?.match(/\b(\d{4})\b/)
    if (m) yearSet.add(m[1])
    else for (const fh of i.floweringHistory ?? []) if (fh.year) yearSet.add(String(fh.year))
  }
  const yearOptions = Array.from(yearSet).sort().reverse()

  const filterDefs: { key: FilterKey; label: string; options: string[] }[] = [
    { key: 'status',         label: 'Status',         options: statusOptions },
    { key: 'location',       label: 'Location',       options: locationOptions },
    { key: 'classification', label: 'Classification', options: classOptions },
    { key: 'year',           label: 'Year planted',   options: yearOptions },
  ]

  // Filter logic
  let results = irises
  if (q.trim()) {
    const lq = q.toLowerCase()
    results = results.filter(i =>
      (i.name + i.cls + (i.loc ?? '') + (i.podParent ?? '') + (i.pollenParent ?? '') + (i.colour ?? ''))
        .toLowerCase().includes(lq)
    )
  }
  if (filters.status)         results = results.filter(i => i.status === filters.status)
  if (filters.location)       results = results.filter(i => i.loc === filters.location)
  if (filters.classification) results = results.filter(i => i.cls === filters.classification)
  if (filters.year)           results = results.filter(i =>
    i.planted?.includes(filters.year) || (i.floweringHistory ?? []).some(fh => String(fh.year) === filters.year)
  )

  const hasQuery = q.trim().length > 0
  const hasFilters = Object.values(filters).some(Boolean)
  const showResults = hasQuery || hasFilters
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  function clearFilter(key: FilterKey) {
    setFilters(prev => ({ ...prev, [key]: '' }))
  }

  function toggleFilter(key: FilterKey) {
    setOpenFilter(prev => prev === key ? null : key)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Sticky search bar */}
      <div style={{
        position: 'sticky', top: 0, background: 'var(--bg)',
        padding: '12px 16px', zIndex: 30, borderBottom: '1px solid var(--line)',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface)', border: '1.5px solid var(--line)', borderRadius: 14,
          padding: '10px 14px', boxShadow: 'var(--shadow-sm)',
        }}>
          <Icon name="search" size={18} stroke="var(--ink-4)" sw={2} />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search irises…"
            style={{
              flex: 1, border: 'none', background: 'none', outline: 'none',
              fontSize: 15.5, color: 'var(--ink)', fontFamily: 'Lexend, sans-serif',
            }}
          />
          {q && (
            <button onClick={() => { setQ(''); inputRef.current?.focus() }} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="x" size={16} stroke="var(--ink-3)" sw={2.2} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10,
          WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        } as React.CSSProperties}>
          {filterDefs.map(fd => {
            const isActive = !!filters[fd.key]
            const isOpen = openFilter === fd.key
            return (
              <button
                key={fd.key}
                onClick={() => toggleFilter(fd.key)}
                style={{
                  ...btnReset, cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 999, fontSize: 13.5, fontWeight: 500,
                  background: isActive ? 'var(--ink)' : isOpen ? 'var(--surface-2)' : 'var(--surface)',
                  color: isActive ? '#fff' : isOpen ? 'var(--ink)' : 'var(--ink-2)',
                  border: `1px solid ${isActive ? 'var(--ink)' : isOpen ? 'var(--line-2)' : 'var(--line)'}`,
                }}
              >
                {isActive && (
                  <span
                    onClick={e => { e.stopPropagation(); clearFilter(fd.key) }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <Icon name="x" size={13} stroke="#fff" sw={2.4} />
                  </span>
                )}
                {fd.label}
                {isActive && (
                  <span style={{ fontSize: 12, opacity: 0.85 }}>: {filters[fd.key]}</span>
                )}
                {!isActive && <Icon name="chevron" size={13} stroke="var(--ink-3)" sw={2} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s' }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Filter expand panels */}
      {openFilter && (
        <div style={{ padding: '10px 16px 0' }}>
          {filterDefs
            .filter(fd => fd.key === openFilter)
            .map(fd => (
              <FilterPanel
                key={fd.key}
                filterKey={fd.key}
                label={fd.label}
                options={fd.options}
                value={filters[fd.key]}
                onSelect={v => { setFilters(prev => ({ ...prev, [fd.key]: v })); setOpenFilter(null) }}
                onClose={() => setOpenFilter(null)}
              />
            ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, padding: '14px 16px 32px' }}>
        {!showResults ? (
          /* Suggestions + quick browse */
          <div>
            <SectionLabel>Suggestions</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SUGGESTIONS.map(term => (
                <button
                  key={term}
                  onClick={() => setQ(term)}
                  style={{
                    ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 4px', borderBottom: '1px solid var(--line)',
                  }}
                >
                  <Icon name="clock" size={16} stroke="var(--ink-4)" sw={1.8} />
                  <span style={{ fontSize: 14.5, color: 'var(--ink-2)', flex: 1 }}>{term}</span>
                  <Icon name="chevron" size={16} stroke="var(--ink-4)" />
                </button>
              ))}
            </div>

            {/* All irises quick browse */}
            <div style={{ marginTop: 24 }}>
              {irises.length === 0 ? (
                <EmptyState
                  icon="flower"
                  title="No irises yet"
                  body="Add irises to your collection and they'll show up here for quick searching."
                />
              ) : (
              <>
              <SectionLabel>{irises.length} plants in collection</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {irises.slice(0, 5).map(iris => (
                  <IrisCard
                    key={iris.id}
                    iris={iris}
                    variant="list"
                    onClick={() => go('detail', { id: iris.id })}
                  />
                ))}
                {irises.length > 5 && (
                  <button
                    onClick={() => setQ(' ')}
                    style={{
                      ...btnReset, cursor: 'pointer', textAlign: 'center',
                      padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--accent)',
                    }}
                  >
                    Show all {irises.length} plants
                  </button>
                )}
              </div>
              </>
              )}
            </div>
          </div>
        ) : (
          /* Search results */
          <div>
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>
                {results.length} {results.length === 1 ? 'result' : 'results'}
                {q.trim() ? ` for "${q.trim()}"` : ''}
              </SectionLabel>
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="Nothing found"
                body={`No irises match "${q.trim() || 'these filters'}". Try different terms or clear some filters.`}
                action={{ label: 'Clear all', onClick: () => { setQ(''); setFilters({ status: '', location: '', classification: '', year: '' }) } }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.map(iris => (
                  <IrisCard
                    key={iris.id}
                    iris={iris}
                    variant="list"
                    onClick={() => go('detail', { id: iris.id })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
