'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

// ─── Sample preview rows ──────────────────────────────────────
const SAMPLE_ROWS = [
  { name: 'Dusky Challenger', class: 'Tall Bearded', status: 'Flowering', location: 'Long Border' },
  { name: 'Edith Wolford',    class: 'Tall Bearded', status: 'Flowering', location: 'Top Bed' },
  { name: 'Beverly Sills',   class: 'Tall Bearded', status: 'Growing',   location: 'Top Bed' },
  { name: 'Superstition',    class: 'Tall Bearded', status: 'Growing',   location: 'Long Border' },
  { name: "Jesse's Song",    class: 'Tall Bearded', status: 'Flowering', location: 'Top Bed' },
]

// ─── Step dots ────────────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 18 : 6, height: 6, borderRadius: 999,
            background: i <= step ? 'var(--accent)' : 'var(--line-2)',
            transition: 'all .2s',
          }}
        />
      ))}
    </div>
  )
}

// ─── ModeCard ─────────────────────────────────────────────────
function ModeCard({ selected, title, sub, onSelect }: {
  selected: boolean; title: string; sub: string; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        ...btnReset, cursor: 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: 13,
        padding: '16px 16px', borderRadius: 16,
        background: selected ? 'var(--accent-bg)' : 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
        textAlign: 'left', transition: 'all .15s',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0, marginTop: 1,
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--line-2)'}`,
        background: selected ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />}
      </span>
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--ink)', marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.45 }}>
          {sub}
        </div>
      </div>
    </button>
  )
}

// ─── ImportScreen ─────────────────────────────────────────────
interface ImportScreenProps {
  go: (view: string | number, params?: Record<string, any>) => void
  toast: (msg: string) => void
}

export function ImportScreen({ go, toast }: ImportScreenProps) {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'add' | 'replace'>('add')
  const [dragging, setDragging] = useState(false)

  const stepLabels = ['Choose file', 'Preview', 'Import mode', 'Confirm']

  const handleFile = (f: File | null | undefined) => {
    if (!f) return
    setFile(f)
    setStep(1)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleConfirmImport = () => {
    toast('Import complete')
    go(-1)
  }

  const ext = file?.name.split('.').pop()?.toUpperCase() || ''
  const rowCount = SAMPLE_ROWS.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => {
            if (step > 0) setStep(s => s - 1)
            else go(-1)
          }}
          style={{
            ...btnReset, cursor: 'pointer',
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 600, fontSize: 18, color: 'var(--ink)', lineHeight: 1.1,
          }}>
            {stepLabels[step]}
          </div>
          <div style={{ marginTop: 6 }}>
            <StepDots step={step} total={4} />
          </div>
        </div>

        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              ...btnReset, cursor: 'pointer',
              padding: '10px 16px', borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--line)',
              fontSize: 14, fontWeight: 600, color: 'var(--ink-2)',
            }}
          >
            Next
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '24px 18px 48px' }}>

        {/* Step 0: Choose file */}
        {step === 0 && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--line-2)'}`,
                borderRadius: 20, padding: '48px 24px', textAlign: 'center',
                background: dragging ? 'var(--accent-bg)' : 'var(--surface)',
                transition: 'all .15s',
              }}
            >
              <Icon name="upload" size={36} stroke="var(--ink-4)" sw={1.6} />
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginTop: 14 }}>
                Drop file here
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>
                CSV or JSON format
              </div>
              <label style={{
                display: 'inline-block', marginTop: 20,
                padding: '12px 24px', background: 'var(--accent)',
                color: '#fff', borderRadius: 12, cursor: 'pointer', fontWeight: 600,
                fontSize: 15,
              }}>
                Choose file
                <input
                  type="file"
                  accept=".csv,.json"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files?.[0])}
                />
              </label>
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 12,
              }}>
                Supported formats
              </div>
              {[
                { ext: 'CSV', desc: 'Spreadsheet export — columns: name, class, status, location, …' },
                { ext: 'JSON', desc: 'Full data export from Pod & Pollen or compatible apps' },
              ].map(f => (
                <div key={f.ext} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '11px 14px', marginBottom: 8,
                  background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--line)',
                }}>
                  <span style={{
                    padding: '3px 9px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                    background: 'var(--accent-bg)', color: 'var(--accent)',
                    border: '1px solid var(--accent-line)', flexShrink: 0,
                  }}>
                    {f.ext}
                  </span>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Preview */}
        {step === 1 && (
          <>
            {/* File info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
              padding: '12px 14px', background: 'var(--surface)',
              borderRadius: 14, border: '1px solid var(--line)',
            }}>
              <span style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="note" size={18} stroke="var(--accent)" sw={2} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file?.name || 'file.csv'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>
                  {ext} · {rowCount} rows found
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setStep(0) }}
                style={{
                  ...btnReset, cursor: 'pointer',
                  width: 30, height: 30, borderRadius: 999,
                  background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="x" size={15} stroke="var(--ink-3)" sw={2} />
              </button>
            </div>

            {/* Preview heading */}
            <div style={{
              fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, color: 'var(--ink-4)',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              First 5 rows
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--surface)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                    {['Name', 'Class', 'Status', 'Location'].map(col => (
                      <th key={col} style={{
                        padding: '10px 12px', textAlign: 'left',
                        fontWeight: 700, fontSize: 11.5, color: 'var(--ink-3)',
                        letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < SAMPLE_ROWS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{row.name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{row.class}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{row.status}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 12, textAlign: 'center' }}>
              Showing 5 of {rowCount} records
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                ...btnReset, cursor: 'pointer',
                width: '100%', marginTop: 24,
                padding: '15px 0', borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                fontSize: 16, fontWeight: 700,
                boxShadow: '0 6px 18px var(--accent-shadow)',
              }}
            >
              Looks good — continue
            </button>
          </>
        )}

        {/* Step 2: Import mode */}
        {step === 2 && (
          <>
            <div style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
              fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 8,
            }}>
              How should we import?
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 28 }}>
              Choose how the imported records should be handled.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ModeCard
                selected={mode === 'add'}
                title="Add to existing"
                sub="Imported irises are added alongside your current collection. Duplicates are skipped."
                onSelect={() => setMode('add')}
              />
              <ModeCard
                selected={mode === 'replace'}
                title="Replace all"
                sub="Your entire collection is replaced with the imported data. This cannot be undone."
                onSelect={() => setMode('replace')}
              />
            </div>

            {mode === 'replace' && (
              <div style={{
                marginTop: 16, padding: '12px 14px', borderRadius: 12,
                background: 'var(--rose-bg)', border: '1px solid var(--rose-line)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <Icon name="eye" size={17} stroke="var(--rose)" sw={2} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 13.5, color: 'var(--rose)', lineHeight: 1.45 }}>
                  Replace all will permanently delete your existing collection before importing. Make sure you have a backup.
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              style={{
                ...btnReset, cursor: 'pointer',
                width: '100%', marginTop: 28,
                padding: '15px 0', borderRadius: 999,
                background: 'var(--accent)', color: '#fff',
                fontSize: 16, fontWeight: 700,
                boxShadow: '0 6px 18px var(--accent-shadow)',
              }}
            >
              Next
            </button>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <>
            <div style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
              fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 8,
            }}>
              Ready to import
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 24 }}>
              Review the summary below before confirming.
            </div>

            {/* Summary card */}
            <div style={{
              background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)',
              overflow: 'hidden', marginBottom: 24,
            }}>
              {[
                { label: 'File', value: file?.name || 'file.csv' },
                { label: 'Format', value: ext || 'CSV' },
                { label: 'Records', value: `${rowCount} irises` },
                { label: 'Mode', value: mode === 'add' ? 'Add to existing' : 'Replace all' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>{row.label}</span>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: row.label === 'Mode' && mode === 'replace' ? 'var(--rose)' : 'var(--ink)',
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmImport}
              style={{
                ...btnReset, cursor: 'pointer',
                width: '100%', padding: '15px 0', borderRadius: 999,
                background: mode === 'replace' ? 'var(--rose)' : 'var(--accent)',
                color: '#fff', fontSize: 16, fontWeight: 700,
                boxShadow: `0 6px 18px ${mode === 'replace' ? 'rgba(155,84,96,0.35)' : 'var(--accent-shadow)'}`,
              }}
            >
              {mode === 'replace' ? 'Replace & import' : 'Import'}
            </button>

            <button
              onClick={() => setStep(2)}
              style={{
                ...btnReset, cursor: 'pointer',
                width: '100%', marginTop: 12,
                padding: '13px 0', borderRadius: 999,
                background: 'transparent', color: 'var(--ink-3)',
                fontSize: 14.5, fontWeight: 600,
              }}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  )
}
