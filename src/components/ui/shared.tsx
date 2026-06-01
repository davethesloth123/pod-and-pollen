'use client'
import { Icon } from './icon'
import { IrisBloom } from './iris-bloom'
import { PAL } from '@/lib/data'
import type { Iris } from '@/types'

// ── Shared style helpers ─────────────────────────────────────
export const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', font: 'inherit', color: 'inherit',
}
export const iconBtn: React.CSSProperties = {
  width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--surface)', border: '1px solid var(--line)',
}

// ── Wordmark ─────────────────────────────────────────────────
export function Wordmark({ size = 22, plant = 'iris' }: { size?: number; plant?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 6px var(--accent-shadow)' }}>
        <Icon name={plant} size={19} stroke="#fff" sw={1.9} />
      </span>
      <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: size * 1.15,
        color: 'var(--ink)', letterSpacing: 0, lineHeight: 1 }}>
        Pod<span style={{ fontStyle: 'italic', color: 'var(--accent)', marginLeft: '0.18em', marginRight: '0.28em' }}>&</span>Pollen
      </span>
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────
const STATUS: Record<string, { c: string; icon: string }> = {
  'Growing':     { c: 'green',  icon: 'leaf' },
  'Flowering':   { c: 'rose',   icon: 'flower' },
  'First flower':{ c: 'amber',  icon: 'star' },
  'Watch':       { c: 'clay',   icon: 'eye' },
  'Archived':    { c: 'clay',   icon: 'tag' },
  'Named':       { c: 'green',  icon: 'tag' },
}
export function StatusBadge({ status, big }: { status: string; big?: boolean }) {
  const m = STATUS[status] || { c: 'green', icon: 'leaf' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: big ? '6px 12px 6px 9px' : '3px 9px 3px 6px', borderRadius: 999,
      background: `var(--${m.c}-bg)`, color: `var(--${m.c})`,
      fontSize: big ? 13.5 : 11.5, fontWeight: 600, lineHeight: 1, letterSpacing: 0.15,
      border: `1px solid var(--${m.c}-line)`, whiteSpace: 'nowrap', textTransform: 'uppercase',
    }}>
      <Icon name={m.icon} size={big ? 14 : 12} stroke={`var(--${m.c})`} sw={2} />
      {status}
    </span>
  )
}

// ── Chip ─────────────────────────────────────────────────────
export function Chip({ children, active, onClick, icon }: {
  children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: string
}) {
  return (
    <button onClick={onClick} style={{
      ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 14px', borderRadius: 999, whiteSpace: 'nowrap',
      fontSize: 14.5, fontWeight: 500, fontFamily: 'Lexend, sans-serif',
      background: active ? 'var(--ink)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--ink-2)',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      transition: 'all .15s', cursor: 'pointer',
    }}>
      {icon && <Icon name={icon} size={15} stroke={active ? '#fff' : 'var(--ink-2)'} sw={2} />}
      {children}
    </button>
  )
}

// ── Iris thumbnail ────────────────────────────────────────────
export function IrisThumb({ iris, r = 14, label }: { iris: Iris; r?: number; label?: string }) {
  const p = PAL[iris.pal] || PAL.deepPurple
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <IrisBloom s={p.s} f={p.f} beard={p.beard} r={r} label={label} />
    </div>
  )
}

// ── Seedling tag ──────────────────────────────────────────────
export function SeedlingTag({ light }: { light?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2,
      background: light ? 'rgba(255,255,255,0.92)' : 'var(--accent-bg)',
      color: 'var(--accent)', border: light ? 'none' : '1px solid var(--accent-line)',
      boxShadow: light ? '0 1px 4px rgba(0,0,0,0.15)' : 'none' }}>
      <Icon name="sprout" size={12} stroke="var(--accent)" sw={2} />SEEDLING
    </span>
  )
}

// ── Iris card (grid + list variants) ─────────────────────────
export function IrisCard({ iris, onClick, variant = 'grid' }: { iris: Iris; onClick?: () => void; variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <button onClick={onClick} style={{ ...btnReset, width: '100%', textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ display: 'flex', gap: 13, alignItems: 'center', padding: 10,
          background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 66, height: 66, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <IrisThumb iris={iris} r={12} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</span>
              {iris.kind === 'Seedling' && <SeedlingTag />}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '2px 0 7px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {iris.cls} · {iris.loc}
            </div>
            <StatusBadge status={iris.status} />
          </div>
          <Icon name="chevron" size={18} stroke="var(--ink-4)" />
        </div>
      </button>
    )
  }
  return (
    <button onClick={onClick} style={{ ...btnReset, width: '100%', textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
          <IrisThumb iris={iris} r={0} />
          {iris.kind === 'Seedling' && (
            <div style={{ position: 'absolute', top: 9, left: 9 }}><SeedlingTag light /></div>
          )}
          {iris.fav && (
            <div style={{ position: 'absolute', top: 9, right: 9, width: 28, height: 28, borderRadius: 999,
              background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              <Icon name="star" size={15} stroke="var(--accent)" fill="var(--accent)" sw={1.5} />
            </div>
          )}
        </div>
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 17.5, color: 'var(--ink)',
            lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', margin: '3px 0 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="pin" size={13} stroke="var(--ink-4)" sw={1.8} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.loc}</span>
          </div>
          <StatusBadge status={iris.status} />
        </div>
      </div>
    </button>
  )
}

// ── Quick action tile ─────────────────────────────────────────
export function ActionRow({ icon, label, onClick, accent }: {
  icon: string; label: string; onClick?: () => void; accent?: boolean
}) {
  return (
    <button onClick={onClick} style={{
      ...btnReset, flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 7, padding: '14px 6px', borderRadius: 16,
      background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent ? 'var(--accent)' : 'var(--accent-bg)' }}>
        <Icon name={icon} size={22} stroke={accent ? '#fff' : 'var(--accent)'} sw={1.9} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.15 }}>{label}</span>
    </button>
  )
}

// ── Section label ─────────────────────────────────────────────
export function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 2px 14px', gap: 12 }}>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 9, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', letterSpacing: -0.005, lineHeight: 1 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', display: 'inline-block', transform: 'translateY(-2px)' }} />
        {children}
      </span>
      {action}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────
export function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.2, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.4 }}>{value || '—'}</div>
    </div>
  )
}

// ── Bottom sheet ──────────────────────────────────────────────
export function Sheet({ open, onClose, children, title, height = 'auto' }: {
  open: boolean; onClose: () => void; children: React.ReactNode; title?: string; height?: string | number
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,46,0.4)', animation: 'blFade .2s ease' }} />
      <div style={{
        position: 'relative', background: 'var(--bg)', borderRadius: '26px 26px 0 0',
        maxHeight: '92%', height, display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)', animation: 'blSheet .26s cubic-bezier(.2,.8,.2,1)',
        maxWidth: 640, width: '100%', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0 4px' }}>
          <span style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--line-2)' }} />
        </div>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 12px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>{title}</span>
            <button onClick={onClose} style={{ ...btnReset, cursor: 'pointer' }}>
              <span style={iconBtn}><Icon name="x" size={21} stroke="var(--ink-2)" /></span>
            </button>
          </div>
        )}
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Segmented control ─────────────────────────────────────────
export function Segmented({ options, value, onChange }: {
  options: { v: string; label: string; icon?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 3, border: '1px solid var(--line)', gap: 3 }}>
      {options.map(o => {
        const active = o.v === value
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            ...btnReset, flex: 1, cursor: 'pointer', padding: '8px 6px', borderRadius: 9,
            fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: active ? 'var(--surface)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none',
          }}>
            {o.icon && <Icon name={o.icon} size={17} stroke={active ? 'var(--accent)' : 'var(--ink-3)'} sw={2} />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────
export function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...btnReset, cursor: disabled ? 'not-allowed' : 'pointer',
      width: 44, height: 26, borderRadius: 999,
      background: on && !disabled ? 'var(--accent)' : 'var(--line-2)',
      position: 'relative', flexShrink: 0, opacity: disabled ? 0.4 : 1, transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 3, left: on && !disabled ? 21 : 3, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .15s' }} />
    </button>
  )
}

// ── Rating dots ───────────────────────────────────────────────
export function RatingDots({ value = 0, max = 5, onChange, size = 28, color, readOnly }: {
  value?: number; max?: number; onChange?: (v: number) => void; size?: number; color?: string; readOnly?: boolean
}) {
  const c = color || 'var(--accent)'
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value
        return (
          <button key={i} disabled={readOnly} onClick={() => onChange?.(i + 1)} style={{
            ...btnReset, width: size, height: size, borderRadius: 999, cursor: readOnly ? 'default' : 'pointer',
            background: filled ? c : 'transparent', border: `1.8px solid ${filled ? c : 'var(--line-2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {filled && <span style={{ width: size * 0.34, height: size * 0.34, borderRadius: 999, background: '#fff' }} />}
          </button>
        )
      })}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon = 'flower', title, body, action, secondary }: {
  icon?: string; title: string; body: string
  action?: { label: string; onClick: () => void }
  secondary?: { label: string; onClick: () => void }
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 32px', textAlign: 'center' }}>
      <span style={{ width: 80, height: 80, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid var(--accent-line)' }}>
        <Icon name={icon} size={40} stroke="var(--accent)" sw={1.7} />
      </span>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, maxWidth: 320, marginBottom: 22 }}>{body}</div>
      {action && (
        <button onClick={action.onClick} style={{ ...btnReset, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600,
          boxShadow: '0 6px 18px var(--accent-shadow)' }}>
          <Icon name="plus" size={20} stroke="#fff" sw={2.2} />{action.label}
        </button>
      )}
      {secondary && (
        <button onClick={secondary.onClick} style={{ ...btnReset, cursor: 'pointer', marginTop: 12,
          color: 'var(--accent)', fontSize: 14.5, fontWeight: 600 }}>{secondary.label}</button>
      )}
    </div>
  )
}

// ── Settings row ──────────────────────────────────────────────
export function SetRow({ icon, label, sub, onClick, value, danger, isLast }: {
  icon?: string; label: string; sub?: string; onClick?: () => void
  value?: string; danger?: boolean; isLast?: boolean
}) {
  return (
    <button onClick={onClick} style={{ ...btnReset, cursor: onClick ? 'pointer' : 'default', width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      {icon && (
        <span style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'var(--rose-bg)' : 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={19} stroke={danger ? 'var(--rose)' : 'var(--accent)'} sw={1.9} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 500, color: danger ? 'var(--rose)' : 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {value && <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{value}</span>}
      {onClick && <Icon name="chevron" size={18} stroke="var(--ink-4)" />}
    </button>
  )
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null
  return (
    <div style={{ position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 90,
      background: 'var(--ink)', color: '#fff', padding: '13px 20px', borderRadius: 14, fontSize: 14.5, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap',
      animation: 'blToast .25s ease', maxWidth: 'calc(100% - 32px)' }}>
      <Icon name="check" size={18} stroke="#7ee0a8" sw={2.4} />{msg}
    </div>
  )
}

// ── Lifecycle rail ────────────────────────────────────────────
import { lifecycleFor } from '@/lib/data'
import type { LifecycleStep } from '@/types'

export function LifecycleRail({ iris, onStage }: { iris: Iris; onStage?: (s: LifecycleStep) => void }) {
  const steps = lifecycleFor(iris)
  const stateColor: Record<string, string> = { done: 'var(--green)', active: 'var(--accent)', next: 'var(--ink-4)', na: 'var(--ink-5)' }
  const stateBg: Record<string, string> = { done: 'var(--green-bg)', active: 'var(--accent-bg)', next: 'var(--surface-2)', na: 'var(--surface-2)' }
  return (
    <div style={{ padding: '4px 2px' }}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const dotC = stateColor[s.state]
        const isDone = s.state === 'done', isActive = s.state === 'active', isNa = s.state === 'na'
        return (
          <div key={s.key} style={{ display: 'flex', gap: 13, opacity: isNa ? 0.5 : 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: stateBg[s.state], border: `2px solid ${dotC}`,
                boxShadow: isActive ? '0 0 0 4px var(--accent-ring)' : 'none',
              }}>
                {isDone
                  ? <Icon name="check" size={18} stroke={dotC} sw={2.4} />
                  : <Icon name={s.icon} size={17} stroke={dotC} sw={2} />}
              </span>
              {!last && <span style={{ width: 2, flex: 1, minHeight: 16,
                background: isDone ? 'var(--green)' : 'var(--line)', borderRadius: 2 }} />}
            </div>
            <button onClick={() => onStage?.(s)} disabled={isNa} style={{
              ...btnReset, flex: 1, textAlign: 'left', paddingBottom: last ? 2 : 16, marginTop: 5,
              cursor: isNa ? 'default' : 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: isNa ? 'var(--ink-4)' : 'var(--ink)' }}>{s.label}</span>
                {isActive && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-2-ink)', letterSpacing: 0.4,
                  background: 'var(--accent-2-bg)', border: '1px solid var(--accent-2-line)', padding: '2px 8px', borderRadius: 999 }}>NOW</span>}
                {isNa && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>· not applicable</span>}
              </div>
              {s.detail && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>{s.detail}</div>}
            </button>
          </div>
        )
      })}
    </div>
  )
}
