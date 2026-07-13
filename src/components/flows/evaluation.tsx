'use client'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel, IrisContextHeader, inputStyle, selectStyle, labelStyle } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import { rubricFor, rubricGroups, scoreTotal } from '@/lib/rubric'
import type { Iris, EvalRecord } from '@/types'

interface EvaluationFlowProps {
  open: boolean
  iris?: Iris
  editRecord?: EvalRecord
  onClose: () => void
  onSaved: (result: { total?: number }) => void
}

function currentYear() { return new Date().getFullYear() }
function yearOptions() {
  const y = currentYear()
  const out: number[] = []
  for (let i = y + 1; i >= y - 15; i--) out.push(i)
  return out
}

export function EvaluationFlow({ open, iris, editRecord, onClose, onSaved }: EvaluationFlowProps) {
  const { addEvaluation, updateEvaluation, region } = useData()
  const rubric = useMemo(() => rubricFor(region), [region])
  const editing = !!editRecord

  const [year, setYear] = useState(String(currentYear()))
  const [scores, setScores] = useState<Record<string, string>>({})
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setYear(String(editRecord?.year ?? currentYear()))
    const init: Record<string, string> = {}
    if (editRecord?.scores) {
      for (const c of rubric.categories) {
        const v = editRecord.scores[c.key]
        init[c.key] = v != null ? String(v) : ''
      }
    }
    setScores(init)
    setComments(editRecord?.comments || '')
    setSaving(false)
    setError('')
  }, [open, editRecord, rubric])

  function setScore(key: string, max: number, raw: string) {
    if (raw === '') { setScores(s => ({ ...s, [key]: '' })); return }
    let n = Math.floor(Number(raw))
    if (isNaN(n)) return
    if (n < 0) n = 0
    if (n > max) n = max
    setScores(s => ({ ...s, [key]: String(n) }))
  }

  const numericScores = useMemo(() => {
    const out: Record<string, number> = {}
    for (const c of rubric.categories) {
      const v = scores[c.key]
      if (v !== undefined && v !== '') out[c.key] = Number(v)
    }
    return out
  }, [scores, rubric])

  const filledCount = rubric.categories.filter(c => scores[c.key] !== undefined && scores[c.key] !== '').length
  const allFilled = filledCount === rubric.categories.length
  const anyFilled = filledCount > 0
  const total = scoreTotal(numericScores, rubric)
  const canSave = allFilled && !saving

  function handleClose() { onClose() }

  async function handleSave() {
    if (!canSave || !iris) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        year: Number(year) || currentYear(),
        scores: numericScores,
        total,
        rubric: rubric.id,
        comments: comments.trim() || undefined,
      }
      if (editing && editRecord?.id) {
        await updateEvaluation(editRecord.id, payload)
      } else {
        await addEvaluation({ irisId: iris.id, ...payload })
      }
      onSaved({ total })
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title={editing ? `Edit ${editRecord?.year} evaluation` : 'Evaluation'}>
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && <IrisContextHeader iris={iris} label={editing ? 'Editing evaluation for' : 'Evaluating'} />}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>
            {rubric.label} — score every category, or leave them all blank.
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 22, color: anyFilled ? 'var(--accent)' : 'var(--ink-4)', lineHeight: 1 }}>
              {total}<span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 600 }}> / {rubric.total}</span>
            </div>
          </div>
        </div>

        <div>
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

        {rubricGroups(rubric).map(group => (
          <div key={group}>
            <SectionLabel>{group}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {rubric.categories.filter(c => c.group === group).map((c, i, arr) => (
                <div key={c.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                }}>
                  <span style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, flex: 1, minWidth: 0 }}>{c.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <input
                      type="number" inputMode="numeric" min={0} max={c.max}
                      placeholder="—"
                      value={scores[c.key] ?? ''}
                      onChange={e => setScore(c.key, c.max, e.target.value)}
                      style={{ ...inputStyle, width: 62, textAlign: 'center', padding: '10px 8px', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 600, width: 30 }}>/ {c.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label style={labelStyle}>NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Performance this season, conditions, anything a hybridiser should know…"
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </div>

        {anyFilled && !allFilled && (
          <div style={{ padding: 12, background: 'var(--amber-bg)', border: '1px solid var(--amber-line)', borderRadius: 12, fontSize: 13, color: 'var(--amber)' }}>
            Score every category to save, or clear them all to leave this year unrecorded. {filledCount} of {rubric.categories.length} filled.
          </div>
        )}

        {error && (
          <div style={{ padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            ...btnReset, width: '100%', padding: '15px', borderRadius: 14,
            background: canSave ? 'var(--accent)' : 'var(--line)', color: '#fff', fontSize: 15.5, fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Icon name={editing ? 'check' : 'star'} size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : editing ? 'Save changes' : `Save evaluation · ${total} / ${rubric.total}`}
        </button>
      </div>
    </Sheet>
  )
}
