'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import {
  IrisCard, SectionLabel, Chip, Segmented, btnReset, EmptyState,
} from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

// ─── Types ────────────────────────────────────────────────────
interface CollectionScreenProps {
  go: (view: string | number, params?: Record<string, any>) => void
  wide: boolean
  openAdd: () => void
  params?: { cross?: string }
}

// ─── Filters ─────────────────────────────────────────────────
const FILTERS = ['All', 'In flower', 'Named Varieties', 'Seedlings', 'Favourites']

// ─── Cross filter banner ──────────────────────────────────────
function CrossBanner({
  crossCode,
  pod,
  pollen,
  onClear,
}: {
  crossCode: string
  pod: string
  pollen: string
  onClear: () => void
}) {
  return (
    <div
      style={{
        margin: '0 0 12px',
        padding: '10px 14px',
        background: 'var(--accent-bg)',
        border: '1px solid var(--accent-line)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Icon name="dna" size={18} stroke="var(--accent)" sw={2} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
          }}
        >
          {crossCode}
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-2)',
            marginTop: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {pod} × {pollen}
        </div>
      </div>
      <button
        onClick={onClear}
        style={{
          ...btnReset,
          cursor: 'pointer',
          width: 28,
          height: 28,
          borderRadius: 999,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="x" size={14} stroke="var(--ink-3)" sw={2.2} />
      </button>
    </div>
  )
}

// ─── Collection screen ────────────────────────────────────────
const SORTS: { v: string; label: string }[] = [
  { v: 'name', label: 'Name (A–Z)' },
  { v: 'created', label: 'Recently created' },
  { v: 'cls', label: 'Classification' },
  { v: 'colorType', label: 'Colour type' },
  { v: 'height', label: 'Height' },
  { v: 'rebloom', label: 'Rebloomer' },
  { v: 'breeder', label: 'Breeder' },
]

function sortIrises(list: Iris[], sortBy: string): Iris[] {
  const byName = (a: Iris, b: Iris) => a.name.localeCompare(b.name, undefined, { numeric: true })
  const arr = [...list]
  switch (sortBy) {
    case 'created':
      return arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '') || byName(a, b))
    case 'cls':
      return arr.sort((a, b) => (a.cls ?? '').localeCompare(b.cls ?? '') || byName(a, b))
    case 'colorType':
      return arr.sort((a, b) => (a.colorType ?? '').localeCompare(b.colorType ?? '') || byName(a, b))
    case 'height':
      return arr.sort((a, b) => (b.heightCm ?? -1) - (a.heightCm ?? -1) || byName(a, b))
    case 'rebloom':
      return arr.sort((a, b) => (b.rebloom ? 1 : 0) - (a.rebloom ? 1 : 0) || byName(a, b))
    case 'breeder':
      return arr.sort((a, b) => (a.breeder ?? '').localeCompare(b.breeder ?? '') || byName(a, b))
    default:
      return arr.sort(byName)
  }
}

export function CollectionScreen({ go, wide, openAdd, params }: CollectionScreenProps) {
  const { irises, crosses } = useData()
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [crossFilter, setCrossFilter] = useState(params?.cross)

  // Resolve cross info for the banner
  const crossObj = crossFilter ? crosses.find(c => c.id === crossFilter) : null

  // Apply filters
  let list: Iris[] = irises
  if (crossFilter) list = list.filter((i) => i.cross === crossFilter)
  if (filter === 'In flower') list = list.filter((i) => i.status === 'Flowering' || i.status === 'First flower')
  else if (filter === 'Named Varieties') list = list.filter((i) => i.kind === 'Variety')
  else if (filter === 'Seedlings') list = list.filter((i) => i.kind === 'Seedling')
  else if (filter === 'Favourites') list = list.filter((i) => i.fav)

  // Sort (default alphabetical)
  list = sortIrises(list, sortBy)

  // Empty collection (no irises at all)
  if (irises.length === 0) {
    return (
      <div style={{ padding: '10px 18px 32px' }}>
        <EmptyState
          icon="leaf"
          title="No plants yet"
          body="Add your first iris to get started."
          action={{ label: 'Add iris', onClick: openAdd }}
        />
      </div>
    )
  }

  return (
    <div style={{ padding: '10px 18px 32px' }}>
      {/* Search + view toggle row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
        <button
          onClick={() => go('search')}
          style={{
            ...btnReset,
            cursor: 'pointer',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '10px 14px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon name="search" size={17} stroke="var(--ink-4)" sw={2} />
          <span style={{ fontSize: 14.5, color: 'var(--ink-4)', fontWeight: 400 }}>
            Search irises…
          </span>
        </button>
        <Segmented
          options={[
            { v: 'grid', label: '', icon: 'grid' },
            { v: 'list', label: '', icon: 'list' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'grid' | 'list')}
        />
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          marginBottom: 14,
          paddingBottom: 2,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        } as React.CSSProperties}
      >
        {FILTERS.map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      {/* Sort row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 600, flexShrink: 0 }}>Sort</span>
        <div style={{ position: 'relative', flex: 1, maxWidth: 220 }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%', appearance: 'none', cursor: 'pointer',
              padding: '9px 32px 9px 12px', borderRadius: 10, border: '1px solid var(--line)',
              background: 'var(--surface)', fontSize: 13.5, color: 'var(--ink)', fontWeight: 500,
              fontFamily: 'Lexend, sans-serif', outline: 'none',
            }}
          >
            {SORTS.map((s) => (<option key={s.v} value={s.v}>{s.label}</option>))}
          </select>
          <Icon name="chevron" size={15} stroke="var(--ink-3)" style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Cross filter banner */}
      {crossFilter && crossObj && (
        <CrossBanner
          crossCode={crossObj.code}
          pod={crossObj.pod}
          pollen={crossObj.pollen}
          onClear={() => setCrossFilter(undefined)}
        />
      )}

      {/* Plant count label */}
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>
          {list.length} {list.length === 1 ? 'plant' : 'plants'}
        </SectionLabel>
      </div>

      {/* Empty filtered state */}
      {list.length === 0 && (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            color: 'var(--ink-3)',
            fontSize: 14.5,
          }}
        >
          No irises match this filter.
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && list.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          {list.map((iris) => (
            <IrisCard
              key={iris.id}
              iris={iris}
              onClick={() => go('detail', { id: iris.id })}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && list.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((iris) => (
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
  )
}
