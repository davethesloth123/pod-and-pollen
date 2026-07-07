'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel, IrisContextHeader, inputStyle, labelStyle } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

interface RecordFloweringFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (date: string) => void
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
      const [y] = date.split('-')
      // Store ISO (yyyy-mm-dd); display is formatted per-region at render.
      const newStatus = (iris.kind === 'Seedling' && iris.status === 'Growing') ? 'First flower' : 'Flowering'
      await addFlowering({
        irisId: iris.id,
        year: y ? Number(y) : new Date().getFullYear(),
        first: date,
        notes: notes.trim() || undefined,
        setStatus: newStatus,
      })
      onSaved(date)
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

        {iris && <IrisContextHeader iris={iris} label="Flowering for" />}

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
