'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, IrisContextHeader } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

interface QuickNoteFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (type: string) => void
}

const NOTE_TYPES = [
  { id: 'Observation', icon: 'eye' },
  { id: 'Weather',     icon: 'sun' },
  { id: 'Pest',        icon: 'leaf' },
  { id: 'Disease',     icon: 'sprout' },
  { id: 'Task',        icon: 'check' },
]

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
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export function QuickNoteFlow({ open, iris, onClose, onSaved }: QuickNoteFlowProps) {
  const { irises, addNote } = useData()
  const [noteType, setNoteType] = useState('Observation')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(todayStr())
  const [selectedIris, setSelectedIris] = useState<string>(iris?.name || '')
  const [irisSearch, setIrisSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const irisNames = irises.map(i => i.name)
  const filteredIrises = irisSearch
    ? irisNames.filter(n => n.toLowerCase().includes(irisSearch.toLowerCase()))
    : []

  function handleClose() {
    setNoteType('Observation')
    setBody('')
    setDate(todayStr())
    setSelectedIris(iris?.name || '')
    setIrisSearch('')
    setSaving(false)
    setError('')
    onClose()
  }

  async function handleSave() {
    if (saving || !body.trim()) return
    const target = iris ?? irises.find(i => i.name === selectedIris)
    if (!target) { setError('Pick an iris to attach this note to.'); return }
    setSaving(true)
    setError('')
    try {
      await addNote({ irisId: target.id, type: noteType, body: body.trim(), date })
      onSaved(noteType)
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  const canSave = body.trim().length > 0 && !saving

  return (
    <Sheet open={open} onClose={handleClose} title="Quick Note">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <label style={labelStyle}>NOTE TYPE</label>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {NOTE_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setNoteType(t.id)}
                style={{
                  ...btnReset,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  background: noteType === t.id ? 'var(--ink)' : 'var(--surface)',
                  color: noteType === t.id ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${noteType === t.id ? 'var(--ink)' : 'var(--line)'}`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <Icon name={t.icon} size={14} stroke={noteType === t.id ? '#fff' : 'var(--ink-3)'} sw={2} />
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {!iris && (
          <div>
            <label style={labelStyle}>IRIS</label>
            <input
              style={inputStyle}
              placeholder="Search for an iris…"
              value={selectedIris || irisSearch}
              onChange={e => {
                setSelectedIris('')
                setIrisSearch(e.target.value)
              }}
            />
            {filteredIrises.length > 0 && !selectedIris && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                {filteredIrises.slice(0, 5).map(n => (
                  <button
                    key={n}
                    onClick={() => { setSelectedIris(n); setIrisSearch('') }}
                    style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {iris && <IrisContextHeader iris={iris} label="Note for" />}

        <div>
          <label style={labelStyle}>NOTE</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="What did you observe?"
            value={body}
            onChange={e => setBody(e.target.value)}
            autoFocus
          />
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

        {error && (
          <div style={{ padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            ...btnReset,
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: canSave ? 'var(--accent)' : 'var(--line)',
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="note" size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </Sheet>
  )
}
