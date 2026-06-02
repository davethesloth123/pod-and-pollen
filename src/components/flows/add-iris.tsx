'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'

// Section title without the accent dot (used only in this form)
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', letterSpacing: -0.005, margin: '2px 2px 0' }}>
      {children}
    </div>
  )
}

interface AddIrisFlowProps {
  open: boolean
  onClose: () => void
  onSaved: (name: string) => void
  presetCross?: any
}

const KINDS = ['Variety', 'Seedling']
const CLASSIFICATIONS = [
  'MDB', 'SDB', 'IB', 'BB', 'MTB', 'TB', 'AB',
  'Dutch Iris', 'SPU', 'SIB', 'JA', 'LA',
  'Iris reticulata', 'Iris laevigata',
]
const FRAGRANCE_LEVELS = ['Pronounced', 'Slight', 'Absent']
const FRAGRANCE_TYPES = ['Sweet', 'Spicy', 'Musky']
const RELEASE_YEARS = Array.from({ length: new Date().getFullYear() + 1 - 1900 + 1 }, (_, i) => new Date().getFullYear() + 1 - i)
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

export function AddIrisFlow({ open, onClose, onSaved, presetCross }: AddIrisFlowProps) {
  const { irises, locations, addIris } = useData()
  const [name, setName] = useState('')
  const [kind, setKind] = useState('Variety')
  const [cls, setCls] = useState('TB')
  const [colourType, setColourType] = useState('Self')
  const [colorStandards, setColorStandards] = useState('')
  const [colorFalls, setColorFalls] = useState('')
  const [colorBeard, setColorBeard] = useState('')
  const [colorStyleArms, setColorStyleArms] = useState('')
  const [height, setHeight] = useState('')
  const [floweringPeriod, setFloweringPeriod] = useState('')
  const [fragranceLevel, setFragranceLevel] = useState('')
  const [fragranceType, setFragranceType] = useState('')
  const [breeder, setBreeder] = useState('')
  const [yearReleased, setYearReleased] = useState('')
  const [podParent, setPodParent] = useState(presetCross?.pod || '')
  const [pollenParent, setPollenParent] = useState(presetCross?.pollen || '')
  const [podSearch, setPodSearch] = useState('')
  const [pollenSearch, setPollenSearch] = useState('')
  const [loc, setLoc] = useState('')
  const [gridRef, setGridRef] = useState('')
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
    setName('')
    setKind('Variety')
    setCls('TB')
    setColourType('Self')
    setColorStandards('')
    setColorFalls('')
    setColorBeard('')
    setColorStyleArms('')
    setHeight('')
    setFloweringPeriod('')
    setFragranceLevel('')
    setFragranceType('')
    setBreeder('')
    setYearReleased('')
    setPodParent('')
    setPollenParent('')
    setPodSearch('')
    setPollenSearch('')
    setLoc('')
    setGridRef('')
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
      const fragrance = isVariety ? [fragranceLevel, fragranceType].filter(Boolean).join(' · ') : ''
      await addIris({
        name: name.trim(),
        kind,
        classification: cls,
        colorType: isVariety ? colourType : undefined,
        podParent: podParent.trim() || undefined,
        pollenParent: pollenParent.trim() || undefined,
        locationId: loc || null,
        gridRef: gridRef.trim() || undefined,
        plantedDate: year.trim() || undefined,
        height: isVariety && height ? Number(height) : undefined,
        season: isVariety ? floweringPeriod || undefined : undefined,
        fragrance: fragrance || undefined,
        breeder: isVariety ? breeder.trim() || undefined : undefined,
        yearReleased: isVariety && yearReleased ? Number(yearReleased) : undefined,
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
    </>
  )

  // ── Breeder history (variety only) ──
  const breederFields = (
    <>
      <div>
        <label style={labelStyle}>BREEDER</label>
        <input style={inputStyle} placeholder="e.g. Schreiner's" value={breeder} onChange={e => setBreeder(e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>YEAR OF RELEASE</label>
        <div style={{ position: 'relative' }}>
          <select style={selectStyle} value={yearReleased} onChange={e => setYearReleased(e.target.value)}>
            <option value="">— Select year —</option>
            {RELEASE_YEARS.map(y => (<option key={y} value={y}>{y}</option>))}
          </select>
          <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
        </div>
      </div>
    </>
  )

  // ── Flower colour (variety only) ──
  const colourFields = (
    <>
      {[
        { label: 'STANDARDS', value: colorStandards, set: setColorStandards, ph: 'e.g. Deep blue-violet, velvety substance' },
        { label: 'FALLS', value: colorFalls, set: setColorFalls, ph: 'e.g. Near-black violet, blue undertone' },
        { label: 'BEARD', value: colorBeard, set: setColorBeard, ph: 'e.g. Yellow at throat, tipped violet' },
        { label: 'STYLE ARMS', value: colorStyleArms, set: setColorStyleArms, ph: 'e.g. Violet, crested midrib' },
      ].map(f => (
        <div key={f.label}>
          <label style={labelStyle}>{f.label}</label>
          <input style={inputStyle} placeholder={f.ph} value={f.value} onChange={e => f.set(e.target.value)} />
        </div>
      ))}
    </>
  )

  // ── Other (variety only): height, flowering period, fragrance ──
  const otherFields = (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          {/* Stored in cm; a future Settings option will let users switch to inches */}
          <label style={labelStyle}>HEIGHT (CM)</label>
          <input style={inputStyle} type="number" inputMode="numeric" placeholder="e.g. 95" value={height} onChange={e => setHeight(e.target.value)} min="0" max="250" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>FLOWERING PERIOD</label>
          <div style={{ position: 'relative' }}>
            <select style={selectStyle} value={floweringPeriod} onChange={e => setFloweringPeriod(e.target.value)}>
              <option value="">— Select —</option>
              {['Early', 'Mid', 'Late'].map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
            <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
      <div>
        <label style={labelStyle}>FRAGRANCE</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <select style={selectStyle} value={fragranceLevel} onChange={e => setFragranceLevel(e.target.value)}>
              <option value="">— Strength —</option>
              {FRAGRANCE_LEVELS.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
            <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <select style={selectStyle} value={fragranceType} onChange={e => setFragranceType(e.target.value)}>
              <option value="">— Character —</option>
              {FRAGRANCE_TYPES.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
            <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
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
        <label style={labelStyle}>GRID REFERENCE</label>
        <input style={inputStyle} placeholder="e.g. Row B · 3, or bed grid B4" value={gridRef} onChange={e => setGridRef(e.target.value)} />
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

  const isVariety = kind === 'Variety'

  // ── Single screen (mobile bottom sheet + desktop modal) ──
  return (
    <Sheet open={open} onClose={handleClose} title="Add Iris">
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {basicFields}
        </div>

        {isVariety && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionTitle>Breeder history</SectionTitle>
              {breederFields}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionTitle>Flower colour</SectionTitle>
              {colourFields}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SectionTitle>Other</SectionTitle>
              {otherFields}
            </div>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Parentage</SectionTitle>
          {parentFields}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionTitle>Location &amp; Notes</SectionTitle>
          {locationFields}
        </div>
        {saveButton}
      </div>
    </Sheet>
  )
}
