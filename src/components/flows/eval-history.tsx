'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import { fmtDate } from '@/lib/format'
import { rubricById } from '@/lib/rubric'
import type { Iris, EvalRecord } from '@/types'

interface EvalHistorySheetProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onEdit: (record: EvalRecord) => void
}

function ScorePill({ label, value, max }: { label: string; value: number; max?: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 12, fontWeight: 600,
      background: 'var(--surface-2)', color: 'var(--ink-2)',
      border: '1px solid var(--line)',
    }}>
      {label} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{value}{max ? `/${max}` : ''}</span>
    </span>
  )
}

function EvalCard({ record, onEdit }: { record: EvalRecord; onEdit: (r: EvalRecord) => void }) {
  const { region, deleteEvaluation } = useData()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isBis = record.total !== undefined && !!record.scores
  const rubric = rubricById(record.rubric)
  const excerpt = record.comments
    ? record.comments.length > 90 ? record.comments.slice(0, 90) + '…' : record.comments
    : null

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)',
      padding: '14px 14px 12px', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>
            {record.year ? `${record.year}` : (fmtDate(record.date, region) || 'No date')}
          </div>
          {isBis ? (
            <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>
              {record.total}<span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 600 }}> / {rubric.total}</span>
            </div>
          ) : record.avg !== undefined ? (
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Legacy score {record.avg.toFixed(1)} / 5</div>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => onEdit(record)} style={{ ...btnReset, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer' }}>
            Edit
          </button>
          <button onClick={() => setConfirmDelete(true)} aria-label="Delete evaluation" style={{ ...btnReset, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--rose-line)', background: 'var(--rose-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={15} stroke="var(--rose)" sw={2} />
          </button>
        </div>
      </div>

      {isBis && record.scores && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: excerpt ? 10 : 0 }}>
          {rubric.categories.filter(c => record.scores![c.key] !== undefined).map(c => (
            <ScorePill key={c.key} label={c.label.split(' ')[0]} value={record.scores![c.key]} max={c.max} />
          ))}
        </div>
      )}

      {!isBis && record.avg !== undefined && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: excerpt ? 10 : 0 }}>
          {record.form !== undefined && <ScorePill label="Form" value={record.form} />}
          {record.colour !== undefined && <ScorePill label="Colour" value={record.colour} />}
          {record.branching !== undefined && <ScorePill label="Branch" value={record.branching} />}
          {record.vigour !== undefined && <ScorePill label="Vigour" value={record.vigour} />}
        </div>
      )}

      {excerpt && (
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.45, borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 2 }}>
          {excerpt}
        </div>
      )}

      {confirmDelete && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-3)' }}>Delete this evaluation?</span>
          <button onClick={() => setConfirmDelete(false)} style={{ ...btnReset, cursor: 'pointer', padding: '7px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Cancel</button>
          <button onClick={async () => { try { if (record.id) await deleteEvaluation(record.id) } catch { /* ignore */ } finally { setConfirmDelete(false) } }} style={{ ...btnReset, cursor: 'pointer', padding: '7px 12px', borderRadius: 8, background: 'var(--rose)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Delete</button>
        </div>
      )}
    </div>
  )
}

export function EvalHistorySheet({ open, iris, onClose, onEdit }: EvalHistorySheetProps) {
  const evals: EvalRecord[] = iris?.evaluations
    ? [...iris.evaluations].sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (b.date || '').localeCompare(a.date || ''))
    : []

  return (
    <Sheet open={open} onClose={onClose} title="Evaluation history">
      <div style={{ padding: '4px 18px 28px' }}>
        {iris && (
          <div style={{ padding: '10px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <Icon name="flower" size={16} stroke="var(--accent)" sw={2} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--accent)' }}>{iris.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-3)' }}>
              {evals.length} {evals.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        )}

        {evals.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
            <span style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, border: '1px solid var(--accent-line)' }}>
              <Icon name="star" size={30} stroke="var(--accent)" sw={1.7} />
            </span>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif' }}>
              No evaluations yet
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Add an evaluation to track how this iris performs over multiple seasons.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {evals.map((rec, i) => (
              <EvalCard key={rec.id || i} record={rec} onEdit={onEdit} />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}
