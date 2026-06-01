'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { LIFECYCLE } from '@/lib/data'
import type { Iris } from '@/types'

interface StageSheetProps {
  open: boolean
  iris?: Iris
  stage?: string
  onClose: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: '1px solid var(--line-2)',
  background: 'var(--surface)',
  fontSize: 15.5,
  color: 'var(--ink)',
  fontFamily: 'Lexend, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--ink-3)',
  letterSpacing: 0.3,
  marginBottom: 6,
  display: 'block',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function StageSheet({ open, iris, stage, onClose }: StageSheetProps) {
  const [selected, setSelected] = useState<string>(stage || '')
  const [stageDate, setStageDate] = useState(todayStr())

  function handleSave() {
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Lifecycle Stage">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        {iris && (
          <div style={{ padding: '10px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <Icon name="flower" size={16} stroke="var(--accent)" sw={2} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--accent)' }}>{iris.name}</span>
          </div>
        )}

        <SectionLabel>Select stage</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 20 }}>
          {LIFECYCLE.map((s, i) => {
            const isSelected = selected === s.key
            const isCurrent = stage === s.key
            return (
              <button
                key={s.key}
                onClick={() => setSelected(s.key)}
                style={{
                  ...btnReset,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 14px',
                  borderRadius: 12,
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                  background: isSelected ? 'var(--accent-bg)' : i % 2 === 0 ? 'var(--surface)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? 'var(--accent)' : 'var(--surface)',
                  border: `2px solid ${isSelected ? 'var(--accent)' : isCurrent ? 'var(--green)' : 'var(--line-2)'}`,
                }}>
                  <Icon
                    name={s.icon}
                    size={17}
                    stroke={isSelected ? '#fff' : isCurrent ? 'var(--green)' : 'var(--ink-3)'}
                    sw={2}
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--ink)' }}>
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: 0.4,
                        color: 'var(--green)', background: 'var(--green-bg)',
                        border: '1px solid var(--green-line)',
                        padding: '2px 7px', borderRadius: 999,
                      }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{s.short}</div>
                </div>
                {isSelected && (
                  <Icon name="check" size={18} stroke="var(--accent)" sw={2.4} />
                )}
              </button>
            )
          })}
        </div>

        {selected && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>DATE FOR THIS STAGE</label>
            <input
              style={inputStyle}
              type="date"
              value={stageDate}
              onChange={e => setStageDate(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!selected}
          style={{
            ...btnReset,
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: selected ? 'var(--accent)' : 'var(--line)',
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="check" size={18} stroke="#fff" sw={2.4} />
          Move to Stage
        </button>
      </div>
    </Sheet>
  )
}
