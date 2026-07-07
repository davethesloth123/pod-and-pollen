'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, IrisContextHeader, inputStyle, labelStyle } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris, IrisNote } from '@/types'

interface QuickNoteFlowProps {
  open: boolean
  iris?: Iris
  editNote?: IrisNote
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

function todayStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export function QuickNoteFlow({ open, iris, editNote, onClose, onSaved }: QuickNoteFlowProps) {
  const { irises, addNote, updateNote } = useData()
  const editing = !!editNote
  const [noteType, setNoteType] = useState('Observation')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(todayStr())
  const [selectedIris, setSelectedIris] = useState<string>(iris?.name || '')
  const [irisSearch, setIrisSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset (or prefill for edit) whenever the sheet opens
  useEffect(() => {
    if (!open) return
    setNoteType(editNote?.t || 'Observation')
    setBody(editNote?.x || '')
    setDate(editNote?.d || todayStr())
    setSelectedIris(iris?.name || '')
    setIrisSearch('')
    setSaving(false)
    setError('')
  }, [open, editNote, iris])

  const irisNames = irises.map(i => i.name)
  const filteredIrises = irisSearch
    ? irisNames.filter(n => n.toLowerCase().includes(irisSearch.toLowerCase()))
    : []

  // If an existing note's type isn't one of the standard chips (e.g. legacy
  // 'General' notes), still show it as a selectable chip so it stays visible.
  const chipTypes = NOTE_TYPES.some(t => t.id === noteType)
    ? NOTE_TYPES
    : [{ id: noteType, icon: 'note' }, ...NOTE_TYPES]

  function handleClose() {
    onClose()
  }

  async function handleSave() {
    if (saving || !body.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editing && editNote?.id) {
        await updateNote(editNote.id, { type: noteType, body: body.trim(), date })
      } else {
        const target = iris ?? irises.find(i => i.name === selectedIris)
        if (!target) { setError('Pick an iris to attach this note to.'); setSaving(false); return }
        await addNote({ irisId: target.id, type: noteType, body: body.trim(), date })
      }
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
    <Sheet open={open} onClose={handleClose} title={editing ? 'Edit Note' : 'Quick Note'}>
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <label style={labelStyle}>NOTE TYPE</label>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {chipTypes.map(t => (
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

        {!iris && !editing && (
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

        {iris && <IrisContextHeader iris={iris} label={editing ? 'Editing note for' : 'Note for'} />}

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
          <Icon name={editing ? 'check' : 'note'} size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Note'}
        </button>
      </div>
    </Sheet>
  )
}
