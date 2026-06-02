'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel, IrisContextHeader } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

interface RecordPollinationFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (otherName: string) => void
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

function ParentField({ label, value, search, onPick, onSearch, names }: {
  label: string; value: string; search: string
  onPick: (v: string) => void; onSearch: (v: string) => void; names: string[]
}) {
  const [focused, setFocused] = useState(false)
  const q = search.trim().toLowerCase()
  const matches = q ? names.filter(n => n.toLowerCase().includes(q)) : names
  const showList = focused && !value && matches.length > 0
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        placeholder={names.length ? 'Search or pick an iris…' : 'No irises in your collection yet'}
        value={value || search}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onChange={e => { onPick(''); onSearch(e.target.value) }}
      />
      {showList && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
          {matches.slice(0, 12).map(n => (
            <button key={n} onMouseDown={() => { onPick(n); onSearch(''); setFocused(false) }}
              style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>{n}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export function RecordPollinationFlow({ open, iris, onClose, onSaved }: RecordPollinationFlowProps) {
  const { irises, crosses, addCross } = useData()
  const [partner, setPartner] = useState('')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [role, setRole] = useState<'pod' | 'pollen'>('pod')
  const [podPick, setPodPick] = useState('')
  const [podPickSearch, setPodPickSearch] = useState('')
  const [pollenPick, setPollenPick] = useState('')
  const [pollenPickSearch, setPollenPickSearch] = useState('')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [goal, setGoal] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const irisNames = irises.map(i => i.name).filter(n => n !== iris?.name)

  function handleClose() {
    setPartner('')
    setPartnerSearch('')
    setRole('pod')
    setPodPick('')
    setPodPickSearch('')
    setPollenPick('')
    setPollenPickSearch('')
    setDate(todayStr())
    setNotes('')
    setGoal('')
    setCodeInput('')
    setSaving(false)
    setError('')
    onClose()
  }

  const podParent = iris ? (role === 'pod' ? iris.name : partner) : podPick
  const pollenParent = iris ? (role === 'pollen' ? iris.name : partner) : pollenPick

  async function handleSave() {
    if (saving || !canSave) return
    setSaving(true)
    setError('')
    try {
      const year = (date.split('-')[0]) || String(new Date().getFullYear())
      const seq = crosses.filter(c => c.season === year).length + 1
      const code = codeInput.trim() || `${year.slice(2)}-${String(seq).padStart(2, '0')}`
      const findId = (n: string) => irises.find(i => i.name === n)?.id ?? null
      await addCross({
        code,
        season: year,
        pod: podParent,
        podId: findId(podParent),
        pollen: pollenParent,
        pollenId: findId(pollenParent),
        date,
        goal: goal.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onSaved(iris ? partner : `${podParent} × ${pollenParent}`)
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  const canSave = !saving && (iris ? partner.trim().length > 0 : (podPick.trim().length > 0 && pollenPick.trim().length > 0))

  return (
    <Sheet open={open} onClose={handleClose} title="Create cross">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && <IrisContextHeader iris={iris} label="Parent plant" />}

        <div>
          <SectionLabel>Cross details</SectionLabel>
        </div>

        <div>
          <label style={labelStyle}>CROSS CODE</label>
          <input
            style={inputStyle}
            placeholder="Optional — auto-generated if left blank"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
          />
        </div>

        {iris ? (
          <>
            {/* Role toggle */}
            <div>
              <label style={labelStyle}>ROLE OF THIS PLANT</label>
              <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
                <button onClick={() => setRole('pod')} style={{ ...btnReset, flex: 1, padding: '12px 10px', fontSize: 14, fontWeight: 600, textAlign: 'center', cursor: 'pointer', background: role === 'pod' ? 'var(--accent)' : 'var(--surface)', color: role === 'pod' ? '#fff' : 'var(--ink-2)', borderRight: '1px solid var(--line)', transition: 'all .15s' }}>Pod parent</button>
                <button onClick={() => setRole('pollen')} style={{ ...btnReset, flex: 1, padding: '12px 10px', fontSize: 14, fontWeight: 600, textAlign: 'center', cursor: 'pointer', background: role === 'pollen' ? 'var(--accent)' : 'var(--surface)', color: role === 'pollen' ? '#fff' : 'var(--ink-2)', transition: 'all .15s' }}>Pollen parent</button>
              </div>
            </div>
            {/* Partner search */}
            <ParentField
              label={role === 'pod' ? 'POLLEN PARENT (PARTNER)' : 'POD PARENT (PARTNER)'}
              value={partner} search={partnerSearch} onPick={setPartner} onSearch={setPartnerSearch} names={irisNames}
            />
          </>
        ) : (
          <>
            <ParentField label="POD PARENT" value={podPick} search={podPickSearch} onPick={setPodPick} onSearch={setPodPickSearch} names={irisNames} />
            <ParentField label="POLLEN PARENT" value={pollenPick} search={pollenPickSearch} onPick={setPollenPick} onSearch={setPollenPickSearch} names={irisNames} />
          </>
        )}

        {/* Cross summary */}
        {podParent && pollenParent && (
          <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{podParent}</span>
            <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>×</span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{pollenParent}</span>
          </div>
        )}

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
          <label style={labelStyle}>GOAL FOR THIS CROSS</label>
          <input
            style={inputStyle}
            placeholder="e.g. Dark purple with strong branching…"
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Conditions, observations, pollen prep method…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
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
          <Icon name="dna" size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : 'Create cross'}
        </button>
      </div>
    </Sheet>
  )
}
