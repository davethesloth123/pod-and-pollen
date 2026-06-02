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
  const [editing, setEditing] = useState(false)

  const [harvest, setHarvest] = useState('')
  const [seeds, setSeeds] = useState('')
  const [treatment, setTreatment] = useState('')
  const [sown, setSown] = useState('')
  const [germ, setGerm] = useState('')
  const [germinated, setGerminated] = useState('')
  const [plantedOut, setPlantedOut] = useState('')
  const [transplanted, setTransplanted] = useState('')
  const [saving, setSaving] = useState(false)

  // Hydrate the form from the stored batch
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

  const hasBatch = !!batch && (
    batch.harvest || batch.seeds != null || batch.treatment || batch.sown ||
    batch.germ || batch.germinated != null || batch.plantedOut || batch.transplanted != null
  )

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
      setEditing(false)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  // ── Static (collapsed) view ──
  if (!editing) {
    const storedPct = batch?.germPct ?? (batch?.seeds && batch?.germinated != null && batch.seeds > 0 ? Math.round((batch.germinated / batch.seeds) * 100) : null)
    const rows = [
      batch?.harvest ? { label: 'Harvest date', value: batch.harvest } : null,
      batch?.seeds != null ? { label: 'Seed count', value: String(batch.seeds) } : null,
      batch?.treatment ? { label: 'Seed treatment', value: batch.treatment } : null,
      batch?.sown ? { label: 'Date sown', value: batch.sown } : null,
      batch?.germ ? { label: 'First germination', value: batch.germ } : null,
      batch?.germinated != null ? { label: 'Germinations', value: String(batch.germinated) } : null,
      storedPct != null ? { label: 'Germination success rate', value: `${storedPct}%` } : null,
      batch?.plantedOut ? { label: 'Transplanted date', value: batch.plantedOut } : null,
      batch?.transplanted != null ? { label: 'Number transplanted', value: String(batch.transplanted) } : null,
    ].filter(Boolean) as { label: string; value: string }[]

    return (
      <div style={{ margin: '22px 18px 0' }}>
        <SectionLabel
          action={hasBatch ? (
            <button onClick={() => setEditing(true)} style={{ ...btnReset, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
              <Icon name="sliders" size={14} stroke="var(--accent)" sw={1.9} />Edit
            </button>
          ) : undefined}
        >Seed batch &amp; progress</SectionLabel>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', padding: hasBatch ? '4px 14px' : 16 }}>
          {hasBatch ? (
            rows.map((r, i) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-4)' }}>{r.label}</span>
                <span style={{ fontSize: 14, color: r.label === 'Germination success rate' ? 'var(--accent)' : 'var(--ink)', fontWeight: r.label === 'Germination success rate' ? 700 : 500, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Track this cross from pod to seedling — harvest, sowing, germination and transplanting.</div>
              <button onClick={() => setEditing(true)} style={{ ...btnReset, cursor: 'pointer', padding: '10px 16px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <Icon name="plus" size={16} stroke="#fff" sw={2.2} />Add seed batch &amp; progress
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Edit view ──
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
            <label style={labelStyle}>GERMINATION SUCCESS RATE</label>
            <div style={{ ...inputStyle, background: 'var(--surface-2)', color: germPct != null ? 'var(--accent)' : 'var(--ink-4)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
              {germPct != null ? `${germPct}%` : '—'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Field label="TRANSPLANTED DATE"><input type="date" style={inputStyle} value={plantedOut} onChange={e => setPlantedOut(e.target.value)} /></Field>
          <Field label="NUMBER TRANSPLANTED"><input type="number" inputMode="numeric" style={inputStyle} value={transplanted} onChange={e => setTransplanted(e.target.value)} placeholder="0" /></Field>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {hasBatch && (
            <button onClick={() => setEditing(false)} style={{ ...btnReset, flex: 1, cursor: 'pointer', padding: '13px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)' }}>Cancel</button>
          )}
          <button onClick={save} disabled={saving} style={{ ...btnReset, flex: 2, cursor: saving ? 'default' : 'pointer', padding: '13px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="check" size={17} stroke="#fff" sw={2.4} />{saving ? 'Saving…' : 'Save batch progress'}
          </button>
        </div>
      </div>
    </div>
  )
}
