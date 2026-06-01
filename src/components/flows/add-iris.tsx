'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { useData } from '@/lib/data-context'

interface AddIrisFlowProps {
  open: boolean
  onClose: () => void
  onSaved: (name: string) => void
  presetCross?: any
}

const KINDS = ['Variety', 'Seedling']
const CLASSIFICATIONS = [
  'Tall Bearded',
  'Intermediate Bearded',
  'Border Bearded',
  'Miniature Tall Bearded',
  'Standard Dwarf Bearded',
  'Miniature Dwarf Bearded',
  'Arilbred',
  'Species',
]
const COLOUR_TYPES = [
  'Self',
  'Bicolour',
  'Bitone',
  'Reverse Bitone',
  'Plicata',
  'Luminata',
  'Neglecta',
  'Blend',
  'Amoena',
  'Broken',
  'Line and Speckles',
  'Space Age',
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--ink-3)',
  letterSpacing: 0.3,
  marginBottom: 6,
  display: 'block',
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '4px 0 16px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === step ? 22 : 8,
          height: 8,
          borderRadius: 999,
          background: i === step ? 'var(--accent)' : 'var(--line-2)',
          transition: 'all .2s',
        }} />
      ))}
    </div>
  )
}

export function AddIrisFlow({ open, onClose, onSaved, presetCross }: AddIrisFlowProps) {
  const isDesktop = useIsDesktop()
  const { irises, locations, addIris } = useData()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [kind, setKind] = useState('Variety')
  const [cls, setCls] = useState('Tall Bearded')
  const [colourType, setColourType] = useState('Self')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [colorStyleArms, setColorStyleArms] = useState('')
  const [colorStandards, setColorStandards] = useState('')
  const [colorFalls, setColorFalls] = useState('')
  const [colorBeard, setColorBeard] = useState('')
  const [podParent, setPodParent] = useState(presetCross?.pod || '')
  const [pollenParent, setPollenParent] = useState(presetCross?.pollen || '')
  const [podSearch, setPodSearch] = useState('')
  const [pollenSearch, setPollenSearch] = useState('')
  const [loc, setLoc] = useState('')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const irisNames = irises.map(i => i.name)

  const filteredPod = podSearch
    ? irisNames.filter(n => n.toLowerCase().includes(podSearch.toLowerCase()))
    : []
  const filteredPollen = pollenSearch
    ? irisNames.filter(n => n.toLowerCase().includes(pollenSearch.toLowerCase()))
    : []

  function handleClose() {
    setStep(0)
    setName('')
    setKind('Variety')
    setCls('Tall Bearded')
    setColourType('Self')
    setAdvancedOpen(false)
    setColorStyleArms('')
    setColorStandards('')
    setColorFalls('')
    setColorBeard('')
    setPodParent('')
    setPollenParent('')
    setPodSearch('')
    setPollenSearch('')
    setLoc('')
    setYear(new Date().getFullYear().toString())
    setNotes('')
    setSaving(false)
    setError('')
    onClose()
  }

  async function handleSave() {
    if (saving || !name.trim()) return
    setSaving(true)
    setError('')
    try {
      const isVariety = kind === 'Variety'
      await addIris({
        name: name.trim(),
        kind,
        classification: cls,
        colorType: isVariety ? colourType : undefined,
        podParent: podParent.trim() || undefined,
        pollenParent: pollenParent.trim() || undefined,
        locationId: loc || null,
        plantedDate: year.trim() || undefined,
        colorStandards: isVariety ? colorStandards.trim() || undefined : undefined,
        colorFalls: isVariety ? colorFalls.trim() || undefined : undefined,
        colorBeard: isVariety ? colorBeard.trim() || undefined : undefined,
        colorStyleArms: isVariety ? colorStyleArms.trim() || undefined : undefined,
        note: notes.trim() || undefined,
      })
      onSaved(name.trim())
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  const canSave = name.trim().length > 0 && !saving

  // ── Reusable field groups (shared by mobile steps + desktop single screen) ──
  const basicFields = (
    <>
      <div>
        <label style={labelStyle}>NAME</label>
        <input style={inputStyle} placeholder="e.g. Dusky Challenger" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>
      <div>
        <label style={labelStyle}>RECORD TYPE</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KINDS.map(k => (
            <button key={k} onClick={() => setKind(k)} style={{
              ...btnReset, padding: '9px 16px', borderRadius: 999, fontSize: 14, fontWeight: 500,
              background: kind === k ? 'var(--ink)' : 'var(--surface)',
              color: kind === k ? '#fff' : 'var(--ink-2)',
              border: `1px solid ${kind === k ? 'var(--ink)' : 'var(--line)'}`, cursor: 'pointer', transition: 'all .15s',
            }}>{k}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={labelStyle}>CLASSIFICATION</label>
        <div style={{ position: 'relative' }}>
          <select style={selectStyle} value={cls} onChange={e => setCls(e.target.value)}>
            {CLASSIFICATIONS.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
          <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
        </div>
      </div>
      {kind === 'Variety' && (
        <div>
          <label style={labelStyle}>COLOUR TYPE</label>
          <div style={{ position: 'relative' }}>
            <select style={selectStyle} value={colourType} onChange={e => setColourType(e.target.value)}>
              {COLOUR_TYPES.map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
            <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}
      {kind === 'Variety' && (
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen(o => !o)}
            style={{ ...btnReset, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)' }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>Advanced options</span>
            <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ transform: advancedOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .15s' }} />
          </button>
          {advancedOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <SectionLabel>Flower colour</SectionLabel>
              {[
                { label: 'STYLE ARMS', value: colorStyleArms, set: setColorStyleArms, ph: 'e.g. Violet, crested midrib' },
                { label: 'STANDARDS', value: colorStandards, set: setColorStandards, ph: 'e.g. Deep blue-violet, velvety substance' },
                { label: 'FALLS', value: colorFalls, set: setColorFalls, ph: 'e.g. Near-black violet, blue undertone' },
                { label: 'BEARD', value: colorBeard, set: setColorBeard, ph: 'e.g. Yellow at throat, tipped violet' },
              ].map(f => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={inputStyle} placeholder={f.ph} value={f.value} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )

  const parentFields = (
    <>
      <div>
        <label style={labelStyle}>POD PARENT</label>
        <input style={inputStyle} placeholder="Search or type name…" value={podParent || podSearch}
          onChange={e => { setPodParent(''); setPodSearch(e.target.value) }} />
        {filteredPod.length > 0 && !podParent && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
            {filteredPod.slice(0, 5).map(n => (
              <button key={n} onClick={() => { setPodParent(n); setPodSearch('') }}
                style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
        )}
      </div>
      <div>
        <label style={labelStyle}>POLLEN PARENT</label>
        <input style={inputStyle} placeholder="Search or type name…" value={pollenParent || pollenSearch}
          onChange={e => { setPollenParent(''); setPollenSearch(e.target.value) }} />
        {filteredPollen.length > 0 && !pollenParent && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
            {filteredPollen.slice(0, 5).map(n => (
              <button key={n} onClick={() => { setPollenParent(n); setPollenSearch('') }}
                style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
        )}
      </div>
    </>
  )

  const locationFields = (
    <>
      <div>
        <label style={labelStyle}>LOCATION</label>
        <div style={{ position: 'relative' }}>
          <select style={selectStyle} value={loc} onChange={e => setLoc(e.target.value)}>
            <option value="">{locations.length ? '— Select location —' : '— No locations yet —'}</option>
            {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
          </select>
          <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>YEAR ACQUIRED / PLANTED</label>
        <input style={inputStyle} type="number" value={year} onChange={e => setYear(e.target.value)} min="1990" max={new Date().getFullYear() + 1} />
      </div>
      <div>
        <label style={labelStyle}>NOTES</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
          placeholder="Source, colour description, anything notable…" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
    </>
  )

  const saveButton = (
    <div>
      {error && (
        <div style={{ marginBottom: 10, padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
      )}
      <button onClick={handleSave} disabled={!canSave} style={{
        ...btnReset, width: '100%', padding: '15px', borderRadius: 14,
        background: canSave ? 'var(--accent)' : 'var(--line)', color: '#fff', fontSize: 15.5, fontWeight: 600,
        cursor: canSave ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon name="check" size={18} stroke="#fff" sw={2.4} />{saving ? 'Saving…' : 'Save Iris'}
      </button>
    </div>
  )

  // ── Desktop: everything on one screen ──
  if (isDesktop) {
    return (
      <Sheet open={open} onClose={handleClose} title="Add Iris">
        <div style={{ padding: '18px 20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionLabel>Basic details</SectionLabel>
            {basicFields}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionLabel>Parentage</SectionLabel>
            {parentFields}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SectionLabel>Location & notes</SectionLabel>
            {locationFields}
          </div>
          {saveButton}
        </div>
      </Sheet>
    )
  }

  // ── Mobile: 3-step flow ──
  return (
    <Sheet open={open} onClose={handleClose} title="Add Iris">
      <div style={{ padding: '0 18px 24px' }}>
        <StepDots step={step} total={3} />

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SectionLabel>Basic details</SectionLabel>
            {basicFields}
            <button onClick={() => setStep(1)} disabled={!canSave} style={{
              ...btnReset, width: '100%', padding: '15px', borderRadius: 14,
              background: canSave ? 'var(--accent)' : 'var(--line)', color: '#fff', fontSize: 15.5, fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed', marginTop: 4,
            }}>Next — Parents</button>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SectionLabel>Parentage</SectionLabel>
            {parentFields}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ ...btnReset, flex: 1, padding: '14px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>Back</button>
              <button onClick={() => setStep(2)} style={{ ...btnReset, flex: 2, padding: '14px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>Next — Location</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <SectionLabel>Location & notes</SectionLabel>
            {locationFields}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setStep(1)} style={{ ...btnReset, flex: 1, padding: '14px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>Back</button>
              <div style={{ flex: 2 }}>{saveButton}</div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}
