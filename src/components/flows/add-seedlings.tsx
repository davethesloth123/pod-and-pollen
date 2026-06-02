'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Cross } from '@/types'

interface AddSeedlingsFlowProps {
  open: boolean
  cross?: Cross
  onClose: () => void
  onSaved: (count: number) => void
}

const CLASSIFICATIONS = ['MDB', 'SDB', 'IB', 'BB', 'MTB', 'TB', 'AB', 'Dutch Iris', 'SPU', 'SIB', 'JA', 'LA', 'Iris reticulata', 'Iris laevigata']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--line-2)',
  background: 'var(--surface)', fontSize: 15.5, color: 'var(--ink)', fontFamily: 'Lexend, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', cursor: 'pointer' }
const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: 0.3, marginBottom: 6, display: 'block' }

function defaultName(code: string, i: number): string {
  const letter = i < 26 ? String.fromCharCode(65 + i) : String(i + 1)
  return code ? `${code} ${letter}` : `Seedling ${letter}`
}

interface Row { name: string; locationId: string; gridRef: string }

export function AddSeedlingsFlow({ open, cross, onClose, onSaved }: AddSeedlingsFlowProps) {
  const { locations, addSeedlings } = useData()
  const [step, setStep] = useState(0)
  const [count, setCount] = useState(3)
  const [cls, setCls] = useState('TB')
  const [defaultLoc, setDefaultLoc] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset when (re)opened
  useEffect(() => {
    if (open) { setStep(0); setCount(3); setCls('TB'); setDefaultLoc(''); setRows([]); setSaving(false); setError('') }
  }, [open])

  function goNaming() {
    const code = cross?.code || ''
    setRows(Array.from({ length: count }, (_, i) => ({ name: defaultName(code, i), locationId: defaultLoc, gridRef: '' })))
    setStep(1)
  }

  // Changing the shared default location pre-fills every row's location
  function applyDefaultLoc(v: string) {
    setDefaultLoc(v)
    setRows(prev => prev.map(r => ({ ...r, locationId: v })))
  }

  function setRow(i: number, patch: Partial<Row>) {
    setRows(prev => prev.map((r, j) => j === i ? { ...r, ...patch } : r))
  }

  function handleClose() { onClose() }

  async function handleSave() {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const payload = rows.map(r => ({
        name: r.name.trim() || 'Seedling',
        classification: cls,
        locationId: r.locationId || null,
        gridRef: r.gridRef.trim() || undefined,
        status: 'Growing',
        podParent: cross?.pod,
        pollenParent: cross?.pollen,
        crossId: cross?.id,
      }))
      await addSeedlings(payload)
      onSaved(payload.length)
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Add seedlings">
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Parentage (auto) */}
        {cross && (
          <div style={{ padding: '11px 13px', borderRadius: 14, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--accent)' }}>From cross {cross.code}</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginTop: 2 }}>{cross.pod} <span style={{ color: 'var(--ink-3)' }}>×</span> {cross.pollen}</div>
          </div>
        )}

        {step === 0 && (
          <>
            <div>
              <label style={labelStyle}>HOW MANY SEEDLINGS?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setCount(c => Math.max(1, c - 1))} style={{ ...btnReset, cursor: 'pointer', width: 44, height: 44, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 22, fontWeight: 600, color: 'var(--ink-2)' }}>–</button>
                <input
                  type="number" min={1} max={200} value={count}
                  onChange={e => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 20, fontWeight: 700, width: 90, flex: 'none' }}
                />
                <button onClick={() => setCount(c => Math.min(200, c + 1))} style={{ ...btnReset, cursor: 'pointer', width: 44, height: 44, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 22, fontWeight: 600, color: 'var(--ink-2)' }}>+</button>
                <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>seedling records</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>
              Each gets its own record so you can track and evaluate it individually. You&apos;ll name them on the next step.
            </div>
            <button onClick={goNaming} style={{ ...btnReset, width: '100%', cursor: 'pointer', padding: '15px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              Continue<Icon name="chevron" size={18} stroke="#fff" sw={2.2} />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <SectionLabel>Shared settings</SectionLabel>
            <div>
              <label style={labelStyle}>CLASSIFICATION</label>
              <div style={{ position: 'relative' }}>
                <select style={selectStyle} value={cls} onChange={e => setCls(e.target.value)}>
                  {CLASSIFICATIONS.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
                <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>DEFAULT LOCATION <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-4)' }}>— applies to all, editable per seedling</span></label>
              <div style={{ position: 'relative' }}>
                <select style={selectStyle} value={defaultLoc} onChange={e => applyDefaultLoc(e.target.value)}>
                  <option value="">{locations.length ? '— Select location —' : '— No locations yet —'}</option>
                  {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                </select>
                <Icon name="chevron" size={16} stroke="var(--ink-3)" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
              </div>
            </div>

            <SectionLabel>Seedlings</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rows.map((r, i) => (
                <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 22, fontSize: 12.5, fontWeight: 700, color: 'var(--ink-4)', flexShrink: 0 }}>{i + 1}</span>
                    <input style={inputStyle} placeholder="Seedling name" value={r.name} onChange={e => setRow(i, { name: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, paddingLeft: 32 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <select style={{ ...selectStyle, fontSize: 14 }} value={r.locationId} onChange={e => setRow(i, { locationId: e.target.value })}>
                        <option value="">— Location —</option>
                        {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                      </select>
                      <Icon name="chevron" size={14} stroke="var(--ink-3)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none' }} />
                    </div>
                    <input style={{ ...inputStyle, flex: 1, fontSize: 14 }} placeholder="Grid ref" value={r.gridRef} onChange={e => setRow(i, { gridRef: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ ...btnReset, flex: 1, cursor: 'pointer', padding: '14px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>Back</button>
              <button onClick={handleSave} disabled={saving} style={{ ...btnReset, flex: 2, cursor: saving ? 'default' : 'pointer', padding: '14px', borderRadius: 14, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="check" size={18} stroke="#fff" sw={2.4} />{saving ? 'Saving…' : `Create ${rows.length} seedling${rows.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
