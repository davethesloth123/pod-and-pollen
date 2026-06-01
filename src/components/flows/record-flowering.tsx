'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

interface RecordFloweringFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (date: string) => void
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

export function RecordFloweringFlow({ open, iris, onClose, onSaved }: RecordFloweringFlowProps) {
  const { addFlowering } = useData()
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    setDate(todayStr())
    setNotes('')
    setSaving(false)
    setError('')
    onClose()
  }

  async function handleSave() {
    if (saving || !iris) return
    setSaving(true)
    setError('')
    try {
      const [y, m, d] = date.split('-')
      const displayDate = y ? `${d}/${m}/${y}` : date
      await addFlowering({
        irisId: iris.id,
        year: y ? Number(y) : new Date().getFullYear(),
        first: displayDate,
        notes: notes.trim() || undefined,
      })
      onSaved(displayDate)
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Record flowering">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && (
          <div style={{ padding: '10px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="flower" size={16} stroke="var(--accent)" sw={2} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--accent)' }}>{iris.name}</span>
            {iris.kind === 'Seedling' && iris.firstFlower === undefined && (
              <span style={{
                marginLeft: 'auto', fontSize: 12, fontWeight: 700,
                color: 'var(--amber)', background: 'var(--amber-bg)',
                border: '1px solid var(--amber-line)',
                padding: '2px 8px', borderRadius: 999,
              }}>
                FIRST FLOWER
              </span>
            )}
          </div>
        )}

        <div>
          <SectionLabel>Flowering details</SectionLabel>
        </div>

        <div>
          <label style={labelStyle}>DATE</label>
          <input
            style={inputStyle}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Stem count, bud count, height, conditions, observations…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            autoFocus
          />
        </div>

        {/* Photo prompt */}
        <button
          style={{
            ...btnReset,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1px dashed var(--line-2)',
            background: 'var(--surface)',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="camera" size={20} stroke="var(--accent)" sw={1.9} />
          </span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>Add photo</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Capture this flowering moment</div>
          </div>
          <Icon name="chevron" size={18} stroke="var(--ink-4)" style={{ marginLeft: 'auto' }} />
        </button>

        {error && (
          <div style={{ padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...btnReset,
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 4,
          }}
        >
          <Icon name="flower" size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : 'Record Flowering'}
        </button>
      </div>
    </Sheet>
  )
}
