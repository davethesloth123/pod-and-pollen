'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisThumb, IrisCard, SectionLabel, Chip, Segmented, btnReset, EmptyState } from '@/components/ui/shared'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { irises, crosses, crossesList, crossStats, byId, PAL, STATUS } from '@/lib/data'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

// ── Kind colour map ───────────────────────────────────────────
function kindColor(kind?: string): string {
  return (
    {
      Bed: '#5F7A52',
      Border: '#7A9268',
      'Trial area': '#8E9F62',
      Greenhouse: '#C7B26A',
      Holding: '#9C8762',
      Pots: '#A88B58',
    } as Record<string, string>
  )[kind ?? ''] ?? 'var(--accent)'
}

const KIND_ICONS: Record<string, string> = {
  Bed: 'leaf',
  Border: 'flower',
  'Trial area': 'sliders',
  Greenhouse: 'sun',
  Holding: 'clock',
  Pots: 'droplet',
}

// ── SummaryStat ───────────────────────────────────────────────
function SummaryStat({ n, l, icon, tint = 'accent' }: { n: number | string; l: string; icon: string; tint?: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px 12px 10px', background: 'var(--surface)', borderRadius: 14,
      border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
    }}>
      <Icon name={icon} size={18} stroke={`var(--${tint})`} sw={1.9} />
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{l}</div>
    </div>
  )
}

// ── GardenMap ─────────────────────────────────────────────────
function GardenMap({ onPick }: { onPick: (id: string) => void }) {
  const { locations } = useData()
  // Group irises by location name, with flowering sub-list
  const byLoc: Record<string, { flowering: Iris[] }> = {}
  for (const loc of locations) {
    const inLoc = irises.filter(i => i.loc === loc.name)
    byLoc[loc.name] = { flowering: inLoc.filter(i => i.status === 'Flowering' || i.status === 'First flower') }
  }

  return (
    <div style={{
      position: 'relative', aspectRatio: '1 / 1', width: '100%',
      background: 'linear-gradient(180deg, #F0EAD7 0%, #E8E0C7 100%)',
      borderRadius: 20, border: '1.5px solid #D6CCBA', overflow: 'hidden',
    }}>
      {/* North arrow */}
      <div style={{
        position: 'absolute', top: 10, right: 12,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <svg width={12} height={10} viewBox="0 0 12 10">
          <polygon points="6,0 11,10 6,7 1,10" fill="#9C8762" opacity={0.8} />
        </svg>
        <span style={{ fontSize: 9, fontWeight: 800, color: '#9C8762', letterSpacing: 0.5 }}>N</span>
      </div>

      {locations.map(loc => {
        const col = kindColor(loc.kind)
        const fl = byLoc[loc.name]?.flowering ?? []
        return (
          <div
            key={loc.id}
            onClick={() => onPick(loc.id)}
            style={{
              position: 'absolute',
              left: `${loc.x}%`,
              top: `${loc.y}%`,
              width: `${loc.w}%`,
              height: `${loc.h}%`,
              background: `${col}26`,
              border: `1.5px solid ${col}`,
              borderRadius: 5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{
              fontSize: 8, fontWeight: 700, color: col, textAlign: 'center',
              lineHeight: 1.2, padding: '0 2px', overflow: 'hidden',
            }}>
              {loc.shortName ?? loc.name}
            </div>
            {fl.length > 0 && (
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--rose)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── GardenList ────────────────────────────────────────────────
function GardenList({ onPick }: { onPick: (id: string) => void }) {
  const { locations } = useData()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {locations.map(loc => {
        const col = kindColor(loc.kind)
        const inLoc = irises.filter(i => i.loc === loc.name)
        const flowering = inLoc.filter(i => i.status === 'Flowering' || i.status === 'First flower')
        const icon = KIND_ICONS[loc.kind ?? ''] ?? 'leaf'
        return (
          <button
            key={loc.id}
            onClick={() => onPick(loc.id)}
            style={{ ...btnReset, width: '100%', textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{
              background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)', padding: '13px 15px',
              display: 'flex', alignItems: 'center', gap: 13,
            }}>
              {/* Kind icon */}
              <span style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${col}18`, border: `1.5px solid ${col}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={icon} size={22} stroke={col} sw={1.9} />
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600,
                    fontSize: 16, color: 'var(--ink)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {loc.name}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>
                    {loc.count ?? inLoc.length} plants
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {loc.kind && (
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                      background: `${col}18`, color: col, border: `1px solid ${col}40`,
                    }}>
                      {loc.kind}
                    </span>
                  )}
                  {loc.sun && (
                    <span style={{
                      fontSize: 11.5, color: 'var(--ink-3)', padding: '2px 8px', borderRadius: 999,
                      background: 'var(--surface-2)', border: '1px solid var(--line)',
                    }}>
                      {loc.sun}
                    </span>
                  )}
                  {loc.soil && (
                    <span style={{
                      fontSize: 11.5, color: 'var(--ink-3)', padding: '2px 8px', borderRadius: 999,
                      background: 'var(--surface-2)', border: '1px solid var(--line)',
                    }}>
                      {loc.soil}
                    </span>
                  )}
                  {flowering.length > 0 && (
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                      background: 'var(--rose-bg)', color: 'var(--rose)', border: '1px solid var(--rose-line)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--rose)' }} />
                      {flowering.length} flowering
                    </span>
                  )}
                </div>
              </div>

              <Icon name="chevron" size={18} stroke="var(--ink-4)" />
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── GardenScreen ─────────────────────────────────────────────
export function GardenScreen({ go, wide, openAdd, openLocation, toast }: {
  go: (screen: string, params?: Record<string, unknown>) => void
  wide?: boolean
  openAdd?: () => void
  openLocation?: (id: string) => void
  toast?: (msg: string) => void
}) {
  const { locations } = useData()
  const [view, setView] = useState<'map' | 'list'>('map')

  const totalPlants = irises.length
  const totalLocations = locations.length
  const flowering = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower').length

  function handlePick(id: string) {
    go('gardenDetail', { id })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 14px' }}>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
          fontSize: 28, color: 'var(--ink)', margin: 0, letterSpacing: -0.3,
        }}>
          Garden
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          {totalLocations} locations · {totalPlants} plants
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 10, padding: '0 18px 18px' }}>
        <SummaryStat n={totalPlants} l="Plants" icon="leaf" tint="green" />
        <SummaryStat n={totalLocations} l="Locations" icon="pin" />
        <SummaryStat n={flowering} l="Flowering" icon="flower" tint="rose" />
      </div>

      {/* Map/List toggle */}
      <div style={{ padding: '0 18px 16px' }}>
        <Segmented
          options={[
            { v: 'map', label: 'Map', icon: 'pin' },
            { v: 'list', label: 'List', icon: 'grid' },
          ]}
          value={view}
          onChange={v => setView(v as 'map' | 'list')}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '0 18px' }}>
        {view === 'map' ? (
          <GardenMap onPick={handlePick} />
        ) : (
          <GardenList onPick={handlePick} />
        )}
      </div>

      {/* Add location button */}
      <div style={{ padding: '16px 18px 8px' }}>
        <button
          onClick={openAdd}
          style={{
            ...btnReset, cursor: 'pointer', width: '100%',
            border: '1.5px dashed var(--line-2)', borderRadius: 16, padding: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            color: 'var(--ink-3)', fontSize: 14.5, fontWeight: 600,
            background: 'var(--surface-2)',
          }}
        >
          <Icon name="plus" size={18} stroke="var(--ink-3)" sw={2} />
          Add location
        </button>
      </div>

      {/* Grid reference info card */}
      <div style={{ margin: '10px 18px 32px' }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)',
          padding: '13px 15px', display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <Icon name="pin" size={18} stroke="var(--ink-4)" sw={1.8} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 3 }}>Grid references</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.45 }}>
              Each plant can be assigned a grid reference (e.g. Row B · 3) to help locate it in a bed.
              Tap any location to see the full planting plan.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── BedTag ───────────────────────────────────────────────────
function BedTag({ icon, l, tint = 'accent' }: { icon: string; l: string; tint?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 10px 5px 8px', borderRadius: 999,
      background: `var(--${tint}-bg)`, color: `var(--${tint})`,
      border: `1px solid var(--${tint}-line)`, fontSize: 12, fontWeight: 600,
    }}>
      <Icon name={icon} size={13} stroke={`var(--${tint})`} sw={2} />{l}
    </span>
  )
}

// ── GardenDetailScreen ────────────────────────────────────────
export function GardenDetailScreen({ id, go }: {
  id: string
  go: (screen: string, params?: Record<string, unknown>) => void
}) {
  const { locations } = useData()
  const loc = locations.find(l => l.id === id)
  if (!loc) {
    return (
      <div style={{ padding: 18 }}>
        <EmptyState icon="pin" title="Location not found" body="This location no longer exists." />
      </div>
    )
  }

  const col = kindColor(loc.kind)
  const icon = KIND_ICONS[loc.kind ?? ''] ?? 'leaf'
  const plants = irises.filter(i => i.loc === loc.name)
  const flowering = plants.filter(i => i.status === 'Flowering' || i.status === 'First flower')
  const seedlings = plants.filter(i => i.kind === 'Seedling')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => go('garden')} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}>
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
            {loc.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            {loc.kind} · {loc.count ?? plants.length} plants
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{
        margin: '18px 18px 0',
        background: `${col}12`, border: `1.5px solid ${col}30`,
        borderRadius: 20, padding: '20px 20px 18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{
            width: 50, height: 50, borderRadius: 14, flexShrink: 0,
            background: `${col}22`, border: `1.5px solid ${col}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name={icon} size={26} stroke={col} sw={1.8} />
          </span>
          <div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700,
              fontSize: 20, color: 'var(--ink)', lineHeight: 1.1,
            }}>
              {loc.name}
            </div>
            {loc.kind && (
              <div style={{ fontSize: 13.5, color: col, fontWeight: 600, marginTop: 2 }}>{loc.kind}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {loc.sun && <BedTag icon="sun" l={loc.sun} tint="amber" />}
          {loc.soil && <BedTag icon="leaf" l={loc.soil} tint="green" />}
          {flowering.length > 0 && <BedTag icon="flower" l={`${flowering.length} flowering`} tint="rose" />}
          {seedlings.length > 0 && <BedTag icon="sprout" l={`${seedlings.length} seedlings`} />}
        </div>
      </div>

      {/* Plant list */}
      <div style={{ padding: '22px 18px' }}>
        <SectionLabel>{loc.count ?? plants.length} plants</SectionLabel>

        {plants.length === 0 ? (
          <EmptyState
            icon="leaf"
            title="No plants here yet"
            body="Add irises to this location to see them here."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plants.map(iris => (
              <IrisCard
                key={iris.id}
                iris={iris}
                variant="list"
                onClick={() => go('irisDetail', { id: iris.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
