'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'

interface AddLocationFlowProps {
  open: boolean
  onClose: () => void
  onSaved: (data: { name: string }) => void
}

const KINDS = ['Bed', 'Border', 'Trial area', 'Greenhouse', 'Holding', 'Pots']
const SUN_OPTIONS = ['Full sun', 'Partial shade', 'Full shade']

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

export function AddLocationFlow({ open, onClose, onSaved }: AddLocationFlowProps) {
  const { addLocation } = useData()
  const [name, setName] = useState('')
  const [kind, setKind] = useState('Bed')
  const [sun, setSun] = useState('Full sun')
  const [soil, setSoil] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    setName('')
    setKind('Bed')
    setSun('Full sun')
    setSoil('')
    setSaving(false)
    setError('')
    onClose()
  }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      await addLocation({ name: name.trim(), kind, sun, soil: soil.trim() || undefined })
      onSaved({ name: name.trim() })
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  const canSave = name.trim().length > 0 && !saving

  return (
    <Sheet open={open} onClose={handleClose} title="Add Location">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <SectionLabel>Location details</SectionLabel>

        <div>
          <label style={labelStyle}>NAME</label>
          <input
            style={inputStyle}
            placeholder="e.g. Top Bed, Long Border…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>KIND</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {KINDS.map(k => (
              <button
                key={k}
                onClick={() => setKind(k)}
                style={{
                  ...btnReset,
                  padding: '9px 15px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  background: kind === k ? 'var(--ink)' : 'var(--surface)',
                  color: kind === k ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${kind === k ? 'var(--ink)' : 'var(--line)'}`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>SUN EXPOSURE</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {SUN_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSun(s)}
                style={{
                  ...btnReset,
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 500,
                  textAlign: 'center',
                  background: sun === s ? 'var(--accent-bg)' : 'var(--surface)',
                  color: sun === s ? 'var(--accent)' : 'var(--ink-2)',
                  border: `1px solid ${sun === s ? 'var(--accent-line)' : 'var(--line)'}`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                  lineHeight: 1.3,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>SOIL TYPE</label>
          <input
            style={inputStyle}
            placeholder="e.g. Sandy loam, Clay loam, Pots…"
            value={soil}
            onChange={e => setSoil(e.target.value)}
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
            marginTop: 4,
          }}
        >
          <Icon name="pin" size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : 'Save Location'}
        </button>
      </div>
    </Sheet>
  )
}
