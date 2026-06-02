'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Cross } from '@/types'

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 12px', borderRadius: 10, border: '1px solid var(--line-2)',
  background: 'var(--surface)', fontSize: 14.5, color: 'var(--ink)', fontFamily: 'Lexend, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, marginBottom: 5, display: 'block' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ flex: 1, minWidth: 0 }}><label style={labelStyle}>{label}</label>{children}</div>
}

export function SeedBatchCard({ cross }: { cross: Cross }) {
  const { seedBatchFor, saveSeedBatch } = useData()
  const batch = seedBatchFor(cross.id)

  const [harvest, setHarvest] = useState('')
  const [seeds, setSeeds] = useState('')
  const [treatment, setTreatment] = useState('')
  const [sown, setSown] = useState('')
  const [germ, setGerm] = useState('')
  const [germinated, setGerminated] = useState('')
  const [plantedOut, setPlantedOut] = useState('')
  const [transplanted, setTransplanted] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  // Hydrate from the stored batch
  useEffect(() => {
    setHarvest(batch?.harvest || '')
    setSeeds(batch?.seeds != null ? String(batch.seeds) : '')
    setTreatment(batch?.treatment || '')
    setSown(batch?.sown || '')
    setGerm(batch?.germ || '')
    setGerminated(batch?.germinated != null ? String(batch.germinated) : '')
    setPlantedOut(batch?.plantedOut || '')
    setTransplanted(batch?.transplanted != null ? String(batch.transplanted) : '')
  }, [batch?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const seedsN = seeds ? Number(seeds) : null
  const germN = germinated ? Number(germinated) : null
  const germPct = seedsN && germN != null && seedsN > 0 ? Math.round((germN / seedsN) * 100) : null

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      await saveSeedBatch(cross.id, {
        harvest, seeds: seeds ? Number(seeds) : null, treatment, sown, germ,
        germinated: germinated ? Number(germinated) : null,
        germPct,
        plantedOut, transplanted: transplanted ? Number(transplanted) : null,
      })
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 1800)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  return (
    <div style={{ margin: '22px 18px 0' }}>
      <SectionLabel>Seed batch &amp; progress</SectionLabel>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="HARVEST DATE"><input type="date" style={inputStyle} value={harvest} onChange={e => setHarvest(e.target.value)} /></Field>
          <Field label="SEED COUNT"><input type="number" inputMode="numeric" style={inputStyle} value={seeds} onChange={e => setSeeds(e.target.value)} placeholder="0" /></Field>
        </div>

        <Field label="SEED TREATMENT"><input style={inputStyle} value={treatment} onChange={e => setTreatment(e.target.value)} placeholder="e.g. Dried, refrigerated 8 wks" /></Field>

        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="DATE SOWN"><input type="date" style={inputStyle} value={sown} onChange={e => setSown(e.target.value)} /></Field>
          <Field label="FIRST GERMINATION"><input type="date" style={inputStyle} value={germ} onChange={e => setGerm(e.target.value)} /></Field>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <Field label="GERMINATIONS"><input type="number" inputMode="numeric" style={inputStyle} value={germinated} onChange={e => setGerminated(e.target.value)} placeholder="0" /></Field>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>SUCCESS RATE</label>
            <div style={{ ...inputStyle, background: 'var(--surface-2)', color: germPct != null ? 'var(--accent)' : 'var(--ink-4)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              {germPct != null ? `${germPct}%` : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="TRANSPLANTED DATE"><input type="date" style={inputStyle} value={plantedOut} onChange={e => setPlantedOut(e.target.value)} /></Field>
          <Field label="NUMBER TRANSPLANTED"><input type="number" inputMode="numeric" style={inputStyle} value={transplanted} onChange={e => setTransplanted(e.target.value)} placeholder="0" /></Field>
        </div>

        <button onClick={save} disabled={saving} style={{ ...btnReset, cursor: saving ? 'default' : 'pointer', width: '100%', padding: '13px', borderRadius: 12, background: savedMsg ? 'var(--green)' : 'var(--accent)', color: '#fff', fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .2s' }}>
          <Icon name="check" size={17} stroke="#fff" sw={2.4} />{saving ? 'Saving…' : savedMsg ? 'Saved' : 'Save batch progress'}
        </button>
      </div>
    </div>
  )
}
