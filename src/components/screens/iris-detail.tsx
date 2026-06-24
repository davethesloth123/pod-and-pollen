'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import {
  IrisThumb, SectionLabel, RatingDots, LifecycleRail,
  btnReset, StatusBadge,
} from '@/components/ui/shared'
import { PAL, lifecycleFor, latestEval } from '@/lib/data'
import { useData } from '@/lib/data-context'
import type { Iris, IrisNote, LifecycleStep } from '@/types'

function fmtHeight(cm: number, units: 'cm' | 'in') {
  return units === 'in' ? `${Math.round(cm / 2.54)}"` : `${cm} cm`
}

// ─── Types ────────────────────────────────────────────────────
interface IrisDetailScreenProps {
  id: string
  go: (view: string | number, params?: Record<string, any>) => void
  wide: boolean
  openNote: (iris: Iris) => void
  openPhoto: (iris: Iris) => void
  openStage: (iris: Iris, stage: string) => void
  openEval: (iris: Iris) => void
  openEvalHistory: (iris: Iris) => void
  openFlowering: (iris: Iris) => void
  openPollination: (iris: Iris) => void
  openPhotoViewer: (photos: any[], index: number) => void
  openEdit: (iris: Iris) => void
  toast: (msg: string) => void
}

const STATUS_OPTIONS = ['Growing', 'Flowering', 'First flower', 'Watch', 'Named', 'Archived']

// ─── Note type icon map ───────────────────────────────────────
const NOTE_ICONS: Record<string, string> = {
  observation: 'eye',
  evaluation: 'star',
  flowering:  'flower',
  pollination: 'dna',
  note: 'note',
  // data uses uppercase/different labels too
  Evaluation: 'star',
  Flowering:  'flower',
  Health:     'leaf',
  Movement:   'pin',
  Photo:      'camera',
  General:    'note',
}

function noteIcon(type: string): string {
  return NOTE_ICONS[type] || 'note'
}

function fmtDate(d: string): string {
  return d
}

// ─── ParentChip ───────────────────────────────────────────────
function ParentChip({
  role,
  name,
  id,
  go,
}: {
  role: string
  name?: string
  id?: string
  go: (view: string | number, params?: Record<string, any>) => void
}) {
  const { irises } = useData()
  if (!name || name === 'Unknown') return null
  const parent = (id ? irises.find((i) => i.id === id) : undefined) ?? irises.find((i) => i.name === name)
  return (
    <button
      onClick={() => parent && go('detail', { id: parent.id })}
      style={{
        ...btnReset,
        cursor: parent ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px 6px 9px',
        borderRadius: 999,
        background: 'var(--accent-bg)',
        border: '1px solid var(--accent-line)',
        fontSize: 13,
        color: 'var(--accent)',
        fontWeight: 500,
        maxWidth: '100%',
      }}
    >
      <Icon
        name={role === 'Pod' ? 'seed' : 'droplet'}
        size={13}
        stroke="var(--accent)"
        sw={2}
      />
      <span style={{ color: 'var(--ink-3)', fontSize: 12, fontWeight: 600, letterSpacing: 0.2, textTransform: 'uppercase' }}>
        {role}:
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {parent && (
        <Icon name="chevron" size={13} stroke="var(--accent)" sw={2} />
      )}
    </button>
  )
}

// ─── Colour definition card ───────────────────────────────────
function ColourDefinitionCard({ iris }: { iris: Iris }) {
  const c = iris.colorDef
  if (!c) return null

  const rows = [
    { label: 'Standards', value: c.standards },
    { label: 'Falls', value: c.falls },
    { label: 'Beard', value: c.beard },
    { label: 'Style arms', value: c.styleArms },
  ].filter(r => r.value)

  if (rows.length === 0) return null

  return (
    <div style={{ margin: '0 18px' }}>
      <SectionLabel>Colour</SectionLabel>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '4px 14px' }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 3 }}>{r.label}</div>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.45 }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Photo strip ──────────────────────────────────────────────
function PhotoStrip({
  iris,
  openPhoto,
  openPhotoViewer,
}: {
  iris: Iris
  openPhoto: (iris: Iris) => void
  openPhotoViewer: (photos: any[], index: number) => void
}) {
  const photos = iris.photos || []
  const pal = PAL[iris.pal] || PAL.deepPurple

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        padding: '0 18px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      } as React.CSSProperties}
    >
      {photos.map((photo, i) => (
        <button
          key={photo.id || i}
          onClick={() => openPhotoViewer(photos, i)}
          style={{
            ...btnReset,
            cursor: 'pointer',
            flexShrink: 0,
            width: 80,
            height: 80,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid var(--line)',
            position: 'relative',
            background: 'var(--surface-2)',
          }}
        >
          {photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.url}
              alt={photo.cat || 'Photo'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0 }}>
              <IrisBloom s={pal.s} f={pal.f} beard={pal.beard} r={0} />
            </div>
          )}
        </button>
      ))}

      {/* Add photo button */}
      <button
        onClick={() => openPhoto(iris)}
        style={{
          ...btnReset,
          cursor: 'pointer',
          flexShrink: 0,
          width: 80,
          height: 80,
          borderRadius: 12,
          border: '1.5px dashed var(--line-2)',
          background: 'var(--surface-2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <Icon name="camera" size={22} stroke="var(--ink-4)" sw={1.8} />
        <span style={{ fontSize: 10.5, color: 'var(--ink-4)', fontWeight: 500 }}>Add</span>
      </button>
    </div>
  )
}

// ─── Note row ─────────────────────────────────────────────────
function NoteRow({ note }: { note: IrisNote }) {
  const icon = noteIcon(note.t)
  return (
    <div
      style={{
        display: 'flex',
        gap: 11,
        paddingBottom: 14,
        borderBottom: '1px solid var(--line)',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'var(--surface-2)',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon name={icon} size={15} stroke="var(--ink-3)" sw={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: 0.3,
            }}
          >
            {note.t}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{fmtDate(note.d)}</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{note.x}</div>
      </div>
    </div>
  )
}

// ─── Evaluation score card ────────────────────────────────────
function EvalCard({
  iris,
  openEvalHistory,
}: {
  iris: Iris
  openEvalHistory: (iris: Iris) => void
}) {
  const ev = latestEval(iris)
  if (!ev) return null

  return (
    <div
      style={{
        margin: '0 18px',
        padding: 14,
        background: 'var(--surface)',
        borderRadius: 16,
        border: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <SectionLabel>Latest evaluation</SectionLabel>
        <button
          onClick={() => openEvalHistory(iris)}
          style={{
            ...btnReset,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--accent)',
            fontWeight: 600,
          }}
        >
          History
        </button>
      </div>

      {ev.year && (
        <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginBottom: 10 }}>
          {ev.year}{ev.date ? ` · ${ev.date}` : ''}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 10,
        }}
      >
        {ev.form !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Form</div>
            <RatingDots value={ev.form} max={5} readOnly size={22} />
          </div>
        )}
        {ev.colour !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Colour</div>
            <RatingDots value={ev.colour} max={5} readOnly size={22} />
          </div>
        )}
        {ev.substance !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Substance</div>
            <RatingDots value={ev.substance} max={5} readOnly size={22} />
          </div>
        )}
        {ev.branching !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Branching</div>
            <RatingDots value={ev.branching} max={5} readOnly size={22} />
          </div>
        )}
        {ev.vigour !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Vigour</div>
            <RatingDots value={ev.vigour} max={5} readOnly size={22} />
          </div>
        )}
        {ev.avg !== undefined && (
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 4 }}>Overall</div>
            <div
              style={{
                fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--accent)',
              }}
            >
              {ev.avg.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {ev.verdict && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 11px',
            borderRadius: 999,
            background: 'var(--green-bg)',
            color: 'var(--green)',
            border: '1px solid var(--green-line)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            marginBottom: ev.comments ? 10 : 0,
          }}
        >
          <Icon name="tag" size={12} stroke="var(--green)" sw={2} />
          {ev.verdict}
        </div>
      )}

      {ev.comments && (
        <div
          style={{
            fontSize: 13.5,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            marginTop: 8,
          }}
        >
          {ev.comments}
        </div>
      )}
    </div>
  )
}

// ─── Action button ────────────────────────────────────────────
function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...btnReset,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '14px 10px',
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'var(--accent-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={21} stroke="var(--accent)" sw={1.9} />
      </span>
      <span
        style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--ink-2)',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ─── Seedlings strip ──────────────────────────────────────────
function SeedlingsStrip({
  iris,
  go,
}: {
  iris: Iris
  go: (view: string | number, params?: Record<string, any>) => void
}) {
  const { irises } = useData()
  const seedlings = irises.filter(
    (i) =>
      i.kind === 'Seedling' &&
      (i.podParentId === iris.id || i.pollenParentId === iris.id ||
        ((!i.podParentId && i.podParent === iris.name) || (!i.pollenParentId && i.pollenParent === iris.name))),
  )
  if (seedlings.length === 0) return null

  return (
    <div style={{ margin: '22px 18px 0' }}>
      <SectionLabel>{seedlings.length} seedling{seedlings.length !== 1 ? 's' : ''} from this plant</SectionLabel>
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
      >
        {seedlings.map((s) => {
          const pal = PAL[s.pal] || PAL.deepPurple
          return (
            <button
              key={s.id}
              onClick={() => go('detail', { id: s.id })}
              style={{
                ...btnReset,
                cursor: 'pointer',
                flexShrink: 0,
                width: 100,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 80,
                    position: 'relative',
                  }}
                >
                  <IrisBloom s={pal.s} f={pal.f} beard={pal.beard} r={0} />
                </div>
                <div style={{ padding: '7px 8px 8px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--ink-4)',
                      marginTop: 2,
                    }}
                  >
                    {s.status}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Crosses strip ────────────────────────────────────────────
function CrossRow({ cross, go }: { cross: import('@/types').Cross; go: (view: string | number, params?: Record<string, any>) => void }) {
  return (
    <button onClick={() => go('crossDetail', { id: cross.id })} style={{ ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
      <div style={{ padding: '11px 13px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="dna" size={18} stroke="var(--accent)" sw={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)', letterSpacing: 0.2 }}>{cross.code}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cross.pod} × {cross.pollen}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', flexShrink: 0 }}>{cross.season}</div>
        <Icon name="chevron" size={16} stroke="var(--ink-4)" />
      </div>
    </button>
  )
}

function CrossesSection({
  iris,
  go,
}: {
  iris: Iris
  go: (view: string | number, params?: Record<string, any>) => void
}) {
  const { crosses } = useData()
  const asPod = crosses.filter(x => x.podId === iris.id || (!x.podId && x.pod === iris.name))
  const asPollen = crosses.filter(x => x.pollenId === iris.id || (!x.pollenId && x.pollen === iris.name))
  if (asPod.length === 0 && asPollen.length === 0) return null

  return (
    <div style={{ margin: '22px 18px 0' }}>
      {asPod.length > 0 && (
        <>
          <SectionLabel>Crosses as pod parent</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: asPollen.length > 0 ? 20 : 0 }}>
            {asPod.map(cross => <CrossRow key={cross.id} cross={cross} go={go} />)}
          </div>
        </>
      )}
      {asPollen.length > 0 && (
        <>
          <SectionLabel>Crosses as pollen parent</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {asPollen.map(cross => <CrossRow key={cross.id} cross={cross} go={go} />)}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Flowering history ────────────────────────────────────────
function FloweringHistory({ iris }: { iris: Iris }) {
  const { units } = useData()
  const history = iris.floweringHistory
  if (!history || history.length === 0) return null

  return (
    <div style={{ margin: '22px 18px 0' }}>
      <SectionLabel>Flowering history</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {[...history].reverse().map((rec, i) => (
          <div
            key={rec.year}
            style={{
              padding: '12px 0',
              borderBottom:
                i < history.length - 1 ? '1px solid var(--line)' : 'none',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--accent)',
                minWidth: 44,
                lineHeight: 1,
                paddingTop: 2,
              }}
            >
              {rec.year}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: rec.notes ? 6 : 0,
                }}
              >
                {rec.first && (
                  <span
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ink-3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Icon name="flower" size={12} stroke="var(--rose)" sw={2} />
                    {rec.first}
                    {rec.last ? ` – ${rec.last}` : ' (ongoing)'}
                  </span>
                )}
                {rec.stems !== undefined && (
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                    {rec.stems} stem{rec.stems !== 1 ? 's' : ''}
                  </span>
                )}
                {rec.buds !== undefined && (
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                    {rec.buds} buds
                  </span>
                )}
                {rec.height !== undefined && (
                  <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                    {fmtHeight(rec.height, units)}
                  </span>
                )}
              </div>
              {rec.notes && (
                <div
                  style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.4 }}
                >
                  {rec.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── IrisDetailScreen ─────────────────────────────────────────
export function IrisDetailScreen({
  id,
  go,
  wide,
  openNote,
  openPhoto,
  openStage,
  openEval,
  openEvalHistory,
  openFlowering,
  openPollination,
  openPhotoViewer,
  openEdit,
  toast,
}: IrisDetailScreenProps) {
  const { byId, toggleFav, setStatus, deleteIris, units } = useData()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fmtH = (cm: number) => fmtHeight(cm, units)
  const iris = byId(id)

  if (!iris) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 20,
            color: 'var(--ink)',
            marginBottom: 8,
          }}
        >
          Plant not found
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginBottom: 20 }}>
          This plant no longer exists.
        </div>
        <button
          onClick={() => go(-1)}
          style={{
            ...btnReset,
            cursor: 'pointer',
            padding: '12px 20px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Go back
        </button>
      </div>
    )
  }

  const sortedNotes = [...(iris.notes || [])].sort((a, b) => {
    // Sort by date descending (display string, best-effort)
    return b.d.localeCompare(a.d)
  })

  return (
    <div style={{ minHeight: '100%', paddingBottom: 40 }}>
      {/* ── Sticky header ── */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          borderBottom: '1px solid var(--line)',
        }}
      >
        <button
          onClick={() => go(-1)}
          style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 19,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {iris.name}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
            {iris.cls} · {iris.loc}
          </div>
        </div>
      </div>

      {/* ── Hero image (always at the very top) ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/10',
          background: 'var(--surface-2)',
        }}
      >
        <IrisThumb iris={iris} r={0} />
      </div>

      {/* ── Controls: status / favourite / edit / delete (below the image, right-aligned) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <select
            value={iris.status}
            onChange={e => { setStatus(iris.id, e.target.value).then(() => toast('Status updated')).catch(() => toast('Could not update')) }}
            style={{ appearance: 'none', padding: '8px 30px 8px 12px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', fontFamily: 'Lexend, sans-serif', cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
          <Icon name="chevron" size={14} stroke="var(--ink-3)" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
        </div>

        <button
          onClick={() => { toggleFav(iris.id).then(() => toast(iris.fav ? 'Removed from favourites' : 'Added to favourites')) }}
          style={{ ...btnReset, cursor: 'pointer', width: 38, height: 38, borderRadius: 10, border: `1px solid ${iris.fav ? 'var(--amber-line)' : 'var(--line)'}`, background: iris.fav ? 'var(--amber-bg)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle favourite"
        >
          <Icon name="star" size={18} stroke={iris.fav ? 'var(--amber)' : 'var(--ink-4)'} sw={2} />
        </button>

        <button
          onClick={() => openEdit(iris)}
          style={{ ...btnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}
        >
          <Icon name="sliders" size={15} stroke="var(--ink-2)" sw={1.9} />Edit
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ ...btnReset, cursor: 'pointer', width: 38, height: 38, borderRadius: 10, border: '1px solid var(--rose-line)', background: 'var(--rose-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Delete plant"
          >
            <Icon name="x" size={18} stroke="var(--rose)" sw={2} />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ ...btnReset, cursor: 'pointer', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Cancel</button>
            <button onClick={async () => { try { await deleteIris(iris.id); toast('Plant deleted'); go(-1) } catch { toast('Could not delete') } }} style={{ ...btnReset, cursor: 'pointer', padding: '8px 12px', borderRadius: 10, background: 'var(--rose)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Delete plant</button>
          </div>
        )}
      </div>

      {/* ── Identity section ── */}
      <div style={{ padding: '18px 18px 0' }}>
        <div
          style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: 'var(--ink)',
            letterSpacing: -0.3,
            lineHeight: 1.1,
          }}
        >
          {iris.name}
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 5 }}>
          {iris.kind}
        </div>

        {/* Parentage */}
        {iris.podParent && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Parentage</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <ParentChip role="Pod" name={iris.podParent} id={iris.podParentId} go={go} />
              <ParentChip role="Pollen" name={iris.pollenParent} id={iris.pollenParentId} go={go} />
            </div>
          </div>
        )}

        {/* Clean spec list */}
        <div style={{ marginTop: 16, borderTop: '1px solid var(--line)' }}>
          {([
            { label: 'Classification', value: iris.cls },
            iris.colorType ? { label: 'Colour type', value: iris.colorType } : null,
            (iris.loc || iris.gridRef) ? { label: 'Location', value: [iris.loc, iris.gridRef].filter(Boolean).join(' · ') } : null,
            iris.planted ? { label: 'Planted', value: iris.planted } : null,
            (iris.height && iris.height !== '—') ? { label: 'Height', value: Number.isFinite(parseInt(iris.height, 10)) ? fmtH(parseInt(iris.height, 10)) : iris.height } : null,
            (iris.season && iris.season !== '—') ? { label: 'Flowering', value: iris.season } : null,
            (iris.fragrance && iris.fragrance !== '—') ? { label: 'Fragrance', value: iris.fragrance } : null,
            iris.breeder ? { label: 'Breeder', value: iris.breeder } : null,
            iris.yearReleased ? { label: 'Year released', value: String(iris.yearReleased) } : null,
          ].filter(Boolean) as { label: string; value: string }[]).map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-4)' }}>{f.label}</span>
              <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lifecycle rail (seedlings only — milestones matter while growing on) ── */}
      {iris.kind === 'Seedling' && (
        <div style={{ padding: '22px 18px 0' }}>
          <SectionLabel>Lifecycle</SectionLabel>
          <LifecycleRail
            iris={iris}
            onStage={(step: LifecycleStep) => openStage(iris, step.key)}
          />
        </div>
      )}

      {/* ── Colour definition ── */}
      <div style={{ marginTop: 22 }}>
        <ColourDefinitionCard iris={iris} />
      </div>

      {/* ── Photo strip ── */}
      <div style={{ marginTop: 22 }}>
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <SectionLabel>Photos</SectionLabel>
        </div>
        <PhotoStrip iris={iris} openPhoto={openPhoto} openPhotoViewer={openPhotoViewer} />
      </div>

      {/* ── Latest evaluation ── */}
      {iris.evaluations && iris.evaluations.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <EvalCard iris={iris} openEvalHistory={openEvalHistory} />
        </div>
      )}

      {/* ── Notes feed ── */}
      {sortedNotes.length > 0 && (
        <div style={{ margin: '22px 18px 0' }}>
          <SectionLabel>Notes</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sortedNotes.map((note, i) => (
              <NoteRow key={note.id || `${note.d}-${i}`} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          margin: '22px 18px 0',
        }}
      >
        <ActionButton
          icon="flower"
          label="Record flowering"
          onClick={() => openFlowering(iris)}
        />
        <ActionButton
          icon="dna"
          label="Create cross"
          onClick={() => openPollination(iris)}
        />
        <ActionButton
          icon="note"
          label="Add note"
          onClick={() => openNote(iris)}
        />
        <ActionButton
          icon="star"
          label="Evaluate"
          onClick={() => openEval(iris)}
        />
      </div>

      {/* ── Seedlings strip ── */}
      <SeedlingsStrip iris={iris} go={go} />

      {/* ── Crosses ── */}
      <CrossesSection iris={iris} go={go} />

      {/* ── Flowering history ── */}
      <FloweringHistory iris={iris} />
    </div>
  )
}
