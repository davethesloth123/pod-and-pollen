'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

// ─── CustomizeDashboardScreen ─────────────────────────────────
interface CustomizeDashboardScreenProps {
  go: (view: string | number, params?: Record<string, any>) => void
  widgets: string[]
  setWidgets: (w: string[]) => void
  toast: (msg: string) => void
}

export function CustomizeDashboardScreen({ go, widgets, setWidgets, toast }: CustomizeDashboardScreenProps) {
  const [list, setList] = useState<string[]>(widgets)

  // Sort: enabled widgets in user order, then disabled ones in catalog order
  const ordered = [
    ...list.map(id => WIDGETS.find(w => w.id === id)).filter(Boolean),
    ...WIDGETS.filter(w => !list.includes(w.id)),
  ] as typeof WIDGETS

  const isEnabled = (id: string) => list.includes(id)
  const isSystem = (id: string) => {
    const w = WIDGETS.find(x => x.id === id)
    return !!w?.system
  }

  const toggle = (id: string) => {
    if (isSystem(id)) {
      toast('This widget is always shown')
      return
    }
    setList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const moveUp = (id: string) => {
    const idx = list.indexOf(id)
    if (idx <= 0) return
    const next = [...list]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setList(next)
  }

  const moveDown = (id: string) => {
    const idx = list.indexOf(id)
    if (idx === -1 || idx >= list.length - 1) return
    const next = [...list]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setList(next)
  }

  const handleSave = () => {
    setWidgets(list)
    toast('Home updated')
    go(-1)
  }

  const handleReset = () => {
    setList([...DEFAULT_WIDGETS])
    toast('Reset to defaults')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => go(-1)}
          style={{
            ...btnReset, cursor: 'pointer',
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 600, fontSize: 18, color: 'var(--ink)', lineHeight: 1.1,
          }}>
            Customize home
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
            {list.length} widget{list.length !== 1 ? 's' : ''} shown
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            ...btnReset, cursor: 'pointer',
            padding: '10px 18px', borderRadius: 10,
            background: 'var(--accent)', color: '#fff',
            fontSize: 14.5, fontWeight: 700,
            boxShadow: '0 4px 12px var(--accent-shadow)',
          }}
        >
          Save
        </button>
      </div>

      {/* ── Hint ── */}
      <div style={{ padding: '14px 18px 4px' }}>
        <div style={{
          padding: '11px 14px', borderRadius: 12,
          background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
          fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5,
        }}>
          Tap a widget to toggle it on or off. Use the arrows to reorder enabled widgets.
        </div>
      </div>

      {/* ── Widget list ── */}
      <div style={{ padding: '12px 18px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ordered.map((widget) => {
          const enabled = isEnabled(widget.id)
          const sys = isSystem(widget.id)
          const idx = list.indexOf(widget.id)
          const canMoveUp = enabled && idx > 0
          const canMoveDown = enabled && idx < list.length - 1

          return (
            <div
              key={widget.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 16,
                background: 'var(--surface)', border: `1.5px solid ${enabled ? 'var(--accent-line)' : 'var(--line)'}`,
                boxShadow: enabled ? 'var(--shadow-sm)' : 'none',
                opacity: sys ? 0.75 : 1,
                transition: 'all .15s',
              }}
            >
              {/* Toggle button (left) */}
              <button
                onClick={() => toggle(widget.id)}
                style={{
                  ...btnReset, cursor: sys ? 'default' : 'pointer',
                  width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                  border: `2px solid ${enabled ? 'var(--accent)' : 'var(--line-2)'}`,
                  background: enabled ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {enabled && <Icon name="check" size={14} stroke="#fff" sw={2.6} />}
              </button>

              {/* Icon */}
              <span style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: enabled ? 'var(--accent-bg)' : 'var(--surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${enabled ? 'var(--accent-line)' : 'var(--line)'}`,
              }}>
                <Icon
                  name={widget.icon}
                  size={17}
                  stroke={enabled ? 'var(--accent)' : 'var(--ink-4)'}
                  sw={1.9}
                />
              </span>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600,
                  color: enabled ? 'var(--ink)' : 'var(--ink-3)',
                }}>
                  {widget.label}
                  {sys && (
                    <span style={{
                      marginLeft: 7, fontSize: 10.5, fontWeight: 700,
                      letterSpacing: 0.4, textTransform: 'uppercase',
                      color: 'var(--ink-4)',
                    }}>
                      Always
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 1 }}>{widget.sub}</div>
              </div>

              {/* Up/Down arrows (only for enabled non-system) */}
              {enabled && !sys && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={() => moveUp(widget.id)}
                    disabled={!canMoveUp}
                    style={{
                      ...btnReset,
                      cursor: canMoveUp ? 'pointer' : 'not-allowed',
                      width: 28, height: 28, borderRadius: 7,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: canMoveUp ? 'var(--surface-2)' : 'transparent',
                      opacity: canMoveUp ? 1 : 0.3,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(widget.id)}
                    disabled={!canMoveDown}
                    style={{
                      ...btnReset,
                      cursor: canMoveDown ? 'pointer' : 'not-allowed',
                      width: 28, height: 28, borderRadius: 7,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: canMoveDown ? 'var(--surface-2)' : 'transparent',
                      opacity: canMoveDown ? 1 : 0.3,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Reset defaults ── */}
      <div style={{ padding: '4px 18px 48px' }}>
        <button
          onClick={handleReset}
          style={{
            ...btnReset, cursor: 'pointer',
            width: '100%', padding: '13px 0', borderRadius: 14,
            border: '1.5px dashed var(--line-2)',
            fontSize: 14, fontWeight: 600, color: 'var(--ink-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}
        >
          <Icon name="x" size={16} stroke="var(--ink-3)" sw={2} />
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
