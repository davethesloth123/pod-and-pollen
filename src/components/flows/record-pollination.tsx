'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { irises } from '@/lib/data'
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

export function RecordPollinationFlow({ open, iris, onClose, onSaved }: RecordPollinationFlowProps) {
  const [partner, setPartner] = useState('')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [role, setRole] = useState<'pod' | 'pollen'>('pod')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [goal, setGoal] = useState('')

  const irisNames = irises.map(i => i.name).filter(n => n !== iris?.name)
  const filteredPartners = partnerSearch
    ? irisNames.filter(n => n.toLowerCase().includes(partnerSearch.toLowerCase()))
    : []

  function handleClose() {
    setPartner('')
    setPartnerSearch('')
    setRole('pod')
    setDate(todayStr())
    setNotes('')
    setGoal('')
    onClose()
  }

  function handleSave() {
    onSaved(partner)
    handleClose()
  }

  const canSave = partner.trim().length > 0

  const podParent  = role === 'pod'    ? (iris?.name || 'This plant') : partner
  const pollenParent = role === 'pollen' ? (iris?.name || 'This plant') : partner

  return (
    <Sheet open={open} onClose={handleClose} title="Record pollination">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && (
          <div style={{ padding: '10px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="flower" size={16} stroke="var(--accent)" sw={2} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--accent)' }}>{iris.name}</span>
          </div>
        )}

        <div>
          <SectionLabel>Cross details</SectionLabel>
        </div>

        {/* Role toggle */}
        <div>
          <label style={labelStyle}>ROLE OF THIS PLANT</label>
          <div style={{ display: 'flex', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setRole('pod')}
              style={{
                ...btnReset,
                flex: 1,
                padding: '12px 10px',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer',
                background: role === 'pod' ? 'var(--accent)' : 'var(--surface)',
                color: role === 'pod' ? '#fff' : 'var(--ink-2)',
                borderRight: '1px solid var(--line)',
                transition: 'all .15s',
              }}
            >
              Pod parent
            </button>
            <button
              onClick={() => setRole('pollen')}
              style={{
                ...btnReset,
                flex: 1,
                padding: '12px 10px',
                fontSize: 14,
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer',
                background: role === 'pollen' ? 'var(--accent)' : 'var(--surface)',
                color: role === 'pollen' ? '#fff' : 'var(--ink-2)',
                transition: 'all .15s',
              }}
            >
              Pollen parent
            </button>
          </div>
        </div>

        {/* Cross summary */}
        {partner && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            fontSize: 14,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{podParent}</span>
            <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>×</span>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{pollenParent}</span>
          </div>
        )}

        {/* Partner search */}
        <div>
          <label style={labelStyle}>
            {role === 'pod' ? 'POLLEN PARENT (PARTNER)' : 'POD PARENT (PARTNER)'}
          </label>
          <input
            style={inputStyle}
            placeholder="Search iris by name…"
            value={partner || partnerSearch}
            onChange={e => {
              setPartner('')
              setPartnerSearch(e.target.value)
            }}
          />
          {filteredPartners.length > 0 && !partner && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
              {filteredPartners.slice(0, 5).map(n => (
                <button
                  key={n}
                  onClick={() => { setPartner(n); setPartnerSearch('') }}
                  style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
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
          <Icon name="droplet" size={18} stroke="#fff" sw={2} />
          Record Cross
        </button>
      </div>
    </Sheet>
  )
}
