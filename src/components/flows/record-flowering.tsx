'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel, IrisContextHeader, inputStyle, selectStyle, labelStyle } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import { regionUnit, cmFromDisplay, displayFromCm } from '@/lib/format'
import type { Iris, FloweringRecord } from '@/types'

interface RecordFloweringFlowProps {
  open: boolean
  iris?: Iris
  editRecord?: FloweringRecord
  onClose: () => void
  onSaved: (date: string) => void
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function currentYear() {
  return new Date().getFullYear()
}

function yearOptions() {
  const y = currentYear()
  const out: number[] = []
  for (let i = y + 1; i >= y - 15; i--) out.push(i)
  return out
}

// Numeric field state is kept as strings so boxes can be left genuinely blank
// (not coerced to 0) — every measurement here is optional.
export function RecordFloweringFlow({ open, iris, editRecord, onClose, onSaved }: RecordFloweringFlowProps) {
  const { addFlowering, region } = useData()
  const editing = !!editRecord
  const unit = regionUnit(region).toUpperCase()

  const [year, setYear] = useState(String(currentYear()))
  const [firstDate, setFirstDate] = useState('')
  const [lastDate, setLastDate] = useState('')
  const [stems, setStems] = useState('')
  const [buds, setBuds] = useState('')
  const [branchCount, setBranchCount] = useState('')
  const [height, setHeight] = useState('')
  const [bloomHeight, setBloomHeight] = useState('')
  const [bloomWidth, setBloomWidth] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset (or prefill for edit) whenever the sheet opens
  useEffect(() => {
    if (!open) return
    setYear(String(editRecord?.year ?? currentYear()))
    setFirstDate(editRecord?.first || '')
    setLastDate(editRecord?.last || '')
    setStems(editRecord?.stems != null ? String(editRecord.stems) : '')
    setBuds(editRecord?.buds != null ? String(editRecord.buds) : '')
    setBranchCount(editRecord?.branchCount != null ? String(editRecord.branchCount) : '')
    setHeight(editRecord?.height != null ? String(displayFromCm(editRecord.height, region)) : '')
    setBloomHeight(editRecord?.bloomHeight != null ? String(displayFromCm(editRecord.bloomHeight, region)) : '')
    setBloomWidth(editRecord?.bloomWidth != null ? String(displayFromCm(editRecord.bloomWidth, region)) : '')
    setNotes(editRecord?.notes || '')
    setSaving(false)
    setError('')
  }, [open, editRecord, region])

  function handleClose() {
    onClose()
  }

  async function handleSave() {
    if (saving || !iris) return
    setSaving(true)
    setError('')
    try {
      const toCm = (v: string) => v.trim() ? cmFromDisplay(Number(v), region) : undefined
      const toNum = (v: string) => v.trim() ? Number(v) : undefined
      // Flowering is "on" only while there's a first-bloom date this year and no
      // last-bloom date yet. Entering a last date turns it off (back to Growing).
      // Only the current year's record drives the live status; editing a past
      // year shouldn't disturb it.
      const isCurrentYear = (Number(year) || currentYear()) === currentYear()
      let newStatus: string | undefined
      if (isCurrentYear) {
        if (lastDate) newStatus = 'Growing'          // finished flowering → off
        else if (firstDate) newStatus = 'Flowering'  // in bloom → on
      }
      await addFlowering({
        irisId: iris.id,
        year: Number(year) || currentYear(),
        first: firstDate || undefined,
        last: lastDate || undefined,
        stems: toNum(stems),
        buds: toNum(buds),
        branchCount: toNum(branchCount),
        height: toCm(height),
        bloomHeight: toCm(bloomHeight),
        bloomWidth: toCm(bloomWidth),
        notes: notes.trim() || undefined,
        setStatus: newStatus,
      })
      onSaved(firstDate || year)
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title={editing ? `Edit ${editRecord?.year} record` : 'Record flowering'}>
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && <IrisContextHeader iris={iris} label={editing ? 'Editing record for' : 'Flowering for'} />}

        <div style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>
          Every box below is optional — fill in only what you&apos;ve measured.
        </div>

        <div>
          <SectionLabel>Season</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>YEAR</label>
              {editing ? (
                <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: 'var(--ink-3)' }}>{editRecord?.year}</div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <select style={selectStyle} value={year} onChange={e => setYear(e.target.value)}>
                    {yearOptions().map(y => (<option key={y} value={y}>{y}</option>))}
                  </select>
                  <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Bloom dates</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>FIRST FLOWER</label>
              <input style={inputStyle} type="date" value={firstDate} onChange={e => setFirstDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>LAST FLOWER</label>
              <input style={inputStyle} type="date" value={lastDate} onChange={e => setLastDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Measurements</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>STEMS PER PLANT</label>
                <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder="e.g. 4" value={stems} onChange={e => setStems(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>BUD COUNT PER STEM</label>
                <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder="e.g. 9" value={buds} onChange={e => setBuds(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>BRANCH COUNT</label>
                <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder="e.g. 3" value={branchCount} onChange={e => setBranchCount(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>PLANT HEIGHT ({unit})</label>
                <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder={region === 'US' ? 'e.g. 36' : 'e.g. 90'} value={height} onChange={e => setHeight(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Bloom size</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>HEIGHT ({unit})</label>
              <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder={region === 'US' ? 'e.g. 6' : 'e.g. 15'} value={bloomHeight} onChange={e => setBloomHeight(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>WIDTH ({unit})</label>
              <input style={inputStyle} type="number" inputMode="numeric" min="0" placeholder={region === 'US' ? 'e.g. 5' : 'e.g. 13'} value={bloomWidth} onChange={e => setBloomWidth(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Conditions, observations…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
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
          <Icon name={editing ? 'check' : 'flower'} size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Record Flowering'}
        </button>
      </div>
    </Sheet>
  )
}
