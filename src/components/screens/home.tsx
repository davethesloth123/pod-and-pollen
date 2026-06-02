'use client'
import React from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisThumb, IrisCard, ActionRow, SectionLabel, btnReset } from '@/components/ui/shared'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { useData } from '@/lib/data-context'

// ─── Types ────────────────────────────────────────────────────

interface HomeScreenProps {
  go: (view: string | -1, params?: Record<string, any>) => void
  wide: boolean
  widgets: string[]
  openAdd: () => void
  openNote: () => void
  openPhoto: () => void
  userName?: string
}

// ─── Shared widget pieces ─────────────────────────────────────

function WidgetHeader({ title, count, action }: { title: string; count?: number; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 14px', gap: 12 }}>
      <h3 style={{ display: 'flex', alignItems: 'baseline', gap: 9, margin: 0, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', letterSpacing: -0.005, lineHeight: 1.2, minWidth: 0, flex: 1 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', flexShrink: 0, alignSelf: 'center' }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
          {title}{count != null && <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)' }}> · {count}</span>}
        </span>
      </h3>
      {action}
    </div>
  )
}

function EmptyHint({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 14, border: '1.5px dashed var(--line-2)', display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} stroke="var(--ink-4)" sw={1.9} />
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{body}</div>
      </div>
    </div>
  )
}

// ─── Widgets ──────────────────────────────────────────────────

function QuickActionsWidget({ openAdd, openNote, go }: { openAdd: () => void; openNote: () => void; go: (view: string | -1, params?: Record<string, any>) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <ActionRow icon="plus" label="Add iris" onClick={openAdd} accent />
        <ActionRow icon="note" label="Quick note" onClick={openNote} />
        <ActionRow icon="search" label="Search" onClick={() => go('search')} />
      </div>
    </div>
  )
}

function TodayCard({ tint, icon, label, count, title, sub, cta, onClick }: {
  tint: string; icon: string; label: string; count: number; title: string; sub: string; cta: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{ ...btnReset, cursor: 'pointer', width: 160, flexShrink: 0 }}>
      <div style={{ background: `var(--${tint}-bg)`, border: `1px solid var(--${tint}-line)`, borderRadius: 16, padding: '13px 13px 14px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%', boxSizing: 'border-box', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: `var(--${tint})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={15} stroke="#fff" sw={2.2} />
          </span>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: `var(--${tint})`, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}{count > 1 ? ` · ${count}` : ''}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="h-display" style={{ fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.2, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: `var(--${tint})` }}>{cta} →</div>
      </div>
    </button>
  )
}

function TodayWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const seedlingsToEval = irises.filter(i => i.kind === 'Seedling' && i.status === 'First flower')
  const seedlingsReEval = irises.filter(i => i.kind === 'Seedling' && i.status === 'Flowering' && (i.evaluations?.length ?? 0) > 0)
  const watchList = irises.filter(i => i.status === 'Watch')
  const inFlower = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower')

  const cards: React.ReactNode[] = []

  if (seedlingsToEval.length > 0) {
    const first = seedlingsToEval[0]
    cards.push(
      <TodayCard
        key="eval"
        tint="accent"
        icon="star"
        label="Evaluate"
        count={seedlingsToEval.length}
        title={seedlingsToEval.length === 1 ? first.name : `${seedlingsToEval.length} seedlings`}
        sub={seedlingsToEval.length === 1 ? 'First flower — ready to assess' : 'First flowers ready to assess'}
        cta="Evaluate"
        onClick={() => go('detail', { id: first.id })}
      />
    )
  }

  if (seedlingsReEval.length > 0) {
    const first = seedlingsReEval[0]
    cards.push(
      <TodayCard
        key="reeval"
        tint="green"
        icon="flower"
        label="Re-evaluate"
        count={seedlingsReEval.length}
        title={seedlingsReEval.length === 1 ? first.name : `${seedlingsReEval.length} seedlings`}
        sub="Flowering again — update your notes"
        cta="Review"
        onClick={() => go('detail', { id: first.id })}
      />
    )
  }

  if (watchList.length > 0) {
    const first = watchList[0]
    cards.push(
      <TodayCard
        key="watch"
        tint="amber"
        icon="eye"
        label="Watch"
        count={watchList.length}
        title={watchList.length === 1 ? first.name : `${watchList.length} irises`}
        sub="Needs your attention today"
        cta="Check"
        onClick={() => go('detail', { id: first.id })}
      />
    )
  }

  if (inFlower.length > 0) {
    cards.push(
      <TodayCard
        key="inflower"
        tint="rose"
        icon="flower"
        label="In flower"
        count={inFlower.length}
        title={`${inFlower.length} blooming`}
        sub="Capture notes and photos while they're open"
        cta="View all"
        onClick={() => go('inflower')}
      />
    )
  }

  return (
    <div>
      <WidgetHeader title="Today" />
      {cards.length === 0 ? (
        <EmptyHint icon="check" title="All caught up" body="No seedlings to evaluate, nothing on the watch list." />
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -18px', padding: '2px 18px 6px' }}>
          {cards}
        </div>
      )}
    </div>
  )
}

function InFlowerWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const flowering = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower')

  return (
    <div>
      <WidgetHeader
        title="Now Flowering"
        count={flowering.length}
        action={
          <button onClick={() => go('inflower')} style={{ ...btnReset, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            See all
          </button>
        }
      />
      {flowering.length === 0 ? (
        <EmptyHint icon="flower" title="Nothing flowering yet" body="Mark irises as Flowering when buds open." />
      ) : (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -18px', padding: '2px 18px 6px' }}>
          {flowering.map(iris => (
            <button
              key={iris.id}
              onClick={() => go('detail', { id: iris.id })}
              style={{ ...btnReset, cursor: 'pointer', width: 160, flexShrink: 0 }}
            >
              <div style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ position: 'relative', width: '100%', height: 160 }}>
                  <IrisThumb iris={iris} r={0} />
                </div>
                <div style={{ padding: '9px 11px 11px' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {iris.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={11} stroke="var(--ink-4)" sw={1.8} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.loc}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RecentWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { recent, byId } = useData()
  if (recent.length === 0) {
    return (
      <div>
        <WidgetHeader title="Recent Activity" />
        <EmptyHint icon="clock" title="No recent activity" body="Notes and photos you add will appear here." />
      </div>
    )
  }
  return (
    <div>
      <WidgetHeader title="Recent Activity" count={recent.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recent.map((item, idx) => {
          const iris = byId(item.irisId)
          return (
            <button
              key={item.irisId + item.ts + idx}
              onClick={() => go('detail', { id: item.irisId })}
              style={{ ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 2px', borderBottom: idx < recent.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {iris && <IrisThumb iris={iris} r={12} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{item.irisName}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-4)', flexShrink: 0 }}>{item.d}</span>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>{item.t}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.x}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function WatchWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const watchItems = irises.filter(i => i.status === 'Watch')

  return (
    <div>
      <WidgetHeader title="Watch List" count={watchItems.length} />
      {watchItems.length === 0 ? (
        <EmptyHint icon="eye" title="Nothing on watch" body="Irises marked Watch will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {watchItems.map(iris => (
            <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />
          ))}
        </div>
      )}
    </div>
  )
}

function FavWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const favs = irises.filter(i => i.fav === true)

  return (
    <div>
      <WidgetHeader
        title="Favourites"
        count={favs.length}
        action={
          <button onClick={() => go('collection', { filter: 'fav' })} style={{ ...btnReset, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            See all
          </button>
        }
      />
      {favs.length === 0 ? (
        <EmptyHint icon="star" title="No favourites yet" body="Star irises to build your favourites list." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {favs.map(iris => (
            <IrisCard key={iris.id} iris={iris} onClick={() => go('detail', { id: iris.id })} />
          ))}
        </div>
      )}
    </div>
  )
}

function CrossesWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  // Live crosses land with the crosses slice.
  return (
    <div>
      <WidgetHeader
        title="Crosses"
        action={
          <button onClick={() => go('crosses')} style={{ ...btnReset, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            See all
          </button>
        }
      />
      <EmptyHint icon="dna" title="No crosses yet" body="Record pollinations to track your breeding programme." />
    </div>
  )
}

function PhotoWallWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const photos = irises
    .filter(i => i.photos?.length)
    .flatMap(i => i.photos!.slice(0, 2).map((p, j) => ({ iris: i, p, key: i.id + j })))
    .slice(0, 9)

  return (
    <div>
      <WidgetHeader title="Photo Wall" />
      {photos.length === 0 ? (
        <EmptyHint icon="camera" title="No photos yet" body="Add photos to your irises to build your gallery." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6 }}>
          {photos.map(({ iris, p, key }) => (
            <button
              key={key}
              onClick={() => go('detail', { id: iris.id })}
              style={{ ...btnReset, cursor: 'pointer', aspectRatio: '1', position: 'relative', borderRadius: 10, overflow: 'hidden' }}
            >
              {p.url
                ? <img src={p.url} alt={iris.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <IrisBloom s={PAL[iris.pal]?.s ?? PAL.deepPurple.s} f={PAL[iris.pal]?.f ?? PAL.deepPurple.f} beard={PAL[iris.pal]?.beard ?? PAL.deepPurple.beard} r={10} />
                  </div>
                )
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GardenMapWidget({ go }: { go: (view: string | -1, params?: Record<string, any>) => void }) {
  const { irises, locations } = useData()
  const kindColor = (kind: string) =>
    ({ Bed: '#5F7A52', Border: '#7A9268', 'Trial area': '#8E9F62', Greenhouse: '#C7B26A', Holding: '#9C8762', Pots: '#A88B58' })[kind] || 'var(--accent)'

  const floweringNames = new Set(
    irises.filter(i => i.status === 'Flowering' || i.status === 'First flower').map(i => i.loc)
  )

  return (
    <div>
      <WidgetHeader
        title="Garden Map"
        action={
          <button onClick={() => go('garden')} style={{ ...btnReset, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            Full map
          </button>
        }
      />
      <button onClick={() => go('garden')} style={{ ...btnReset, cursor: 'pointer', width: '100%' }}>
        <div style={{ background: 'linear-gradient(180deg, #F0EAD7 0%, #E8E0C7 100%)', aspectRatio: '2/1', borderRadius: 16, position: 'relative', overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          {locations.map(loc => {
            const hasFlowering = floweringNames.has(loc.name)
            const color = kindColor(loc.kind ?? '')
            return (
              <div
                key={loc.id}
                style={{
                  position: 'absolute',
                  left: `${loc.x ?? 0}%`,
                  top: `${loc.y ?? 0}%`,
                  width: `${loc.w ?? 10}%`,
                  height: `${loc.h ?? 10}%`,
                  background: color,
                  borderRadius: 4,
                  opacity: 0.82,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  padding: 3,
                }}
              >
                {hasFlowering && (
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--rose)', border: '1.5px solid #fff', display: 'block', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
          {/* Legend overlay */}
          <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.72)', borderRadius: 8, padding: '4px 8px' }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--rose)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>Flowering</span>
          </div>
        </div>
      </button>
    </div>
  )
}

function CalendarWidget() {
  const monthCounts = [0, 0, 0, 1, 7, 2, 0, 0, 0, 1, 0, 0]
  const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  const currentMonth = new Date().getMonth() // 0-indexed
  const maxCount = Math.max(...monthCounts, 1)

  return (
    <div>
      <WidgetHeader title="Bloom Calendar" />
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', padding: '16px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 72 }}>
          {monthCounts.map((count, i) => {
            const isCurrent = i === currentMonth
            const barH = count > 0 ? Math.max((count / maxCount) * 56, 8) : 3
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: '100%',
                    height: barH,
                    borderRadius: 4,
                    background: isCurrent
                      ? 'var(--accent)'
                      : count > 0
                        ? 'var(--rose)'
                        : 'var(--line-2)',
                    transition: 'height .3s',
                    opacity: isCurrent ? 1 : count > 0 ? 0.75 : 0.5,
                  }}
                />
                <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--accent)' : 'var(--ink-4)' }}>
                  {monthLabels[i]}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>
          Peak flowering: May — {maxCount} irises open
        </div>
      </div>
    </div>
  )
}

// ─── Widget slot dispatcher ───────────────────────────────────

function WidgetSlot({ id, go, wide, openAdd, openNote, openPhoto }: {
  id: string
  go: (view: string | -1, params?: Record<string, any>) => void
  wide: boolean
  openAdd: () => void
  openNote: () => void
  openPhoto: () => void
}) {
  switch (id) {
    case 'quick':
      return <QuickActionsWidget openAdd={openAdd} openNote={openNote} go={go} />
    case 'today':
      return <TodayWidget go={go} />
    case 'inflower':
      return <InFlowerWidget go={go} />
    case 'recent':
      return <RecentWidget go={go} />
    case 'watch':
      return <WatchWidget go={go} />
    case 'fav':
      return <FavWidget go={go} />
    case 'crosses':
      return <CrossesWidget go={go} />
    case 'photowall':
      return <PhotoWallWidget go={go} />
    case 'gardenmap':
      return <GardenMapWidget go={go} />
    case 'calendar':
      return <CalendarWidget />
    default:
      return null
  }
}

// ─── Widget dashboard ─────────────────────────────────────────

function WidgetDashboard({ widgets, go, wide, openAdd, openNote, openPhoto }: {
  widgets: string[]
  go: (view: string | -1, params?: Record<string, any>) => void
  wide: boolean
  openAdd: () => void
  openNote: () => void
  openPhoto: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {widgets.map(id => (
        <WidgetSlot key={id} id={id} go={go} wide={wide} openAdd={openAdd} openNote={openNote} openPhoto={openPhoto} />
      ))}
    </div>
  )
}

// ─── Home screen ──────────────────────────────────────────────

export function HomeScreen({ go, wide, widgets, openAdd, openNote, openPhoto, userName }: HomeScreenProps) {
  const greeting = (() => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  })()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const firstName = userName?.trim().split(' ')[0] || 'there'

  return (
    <div style={{ padding: '10px 18px 32px' }}>
      {/* Greeting */}
      <div style={{ padding: '14px 2px 22px' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1.5, background: 'var(--accent)', display: 'inline-block' }} />
          {today}
        </div>
        <div className="h-display" style={{ fontSize: 30, color: 'var(--ink)', marginTop: 10, lineHeight: 1.05 }}>
          {greeting}, <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>{firstName}</span>
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 6, fontWeight: 500 }}>
          What's blooming today?
        </div>
      </div>

      <WidgetDashboard widgets={widgets} go={go} wide={wide} openAdd={openAdd} openNote={openNote} openPhoto={openPhoto} />

      <button
        onClick={() => go('customize')}
        style={{ ...btnReset, cursor: 'pointer', width: '100%', marginTop: 28, padding: 13, borderRadius: 14, background: 'transparent', border: '1.5px dashed var(--line-2)', color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
      >
        <Icon name="sliders" size={17} stroke="var(--ink-3)" sw={1.9} />Customize home
      </button>
    </div>
  )
}
