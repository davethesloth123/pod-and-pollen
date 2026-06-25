'use client'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, RatingDots } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import { fmtDate } from '@/lib/format'
import type { Iris, EvalRecord } from '@/types'

interface EvalHistorySheetProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onEdit: (record: EvalRecord) => void
}

const OUTCOME_STYLE: Record<string, { color: string; bg: string; line: string }> = {
  'Keep':   { color: 'var(--green)', bg: 'var(--green-bg)', line: 'var(--green-line)' },
  'Watch':  { color: 'var(--amber)', bg: 'var(--amber-bg)', line: 'var(--amber-line)' },
  'Reject': { color: 'var(--rose)',  bg: 'var(--rose-bg)',  line: 'var(--rose-line)'  },
  'Hold':   { color: 'var(--clay)',  bg: 'var(--clay-bg)',  line: 'var(--clay-line)'  },
  'Retain': { color: 'var(--green)', bg: 'var(--green-bg)', line: 'var(--green-line)' },
  'Discard':{ color: 'var(--rose)',  bg: 'var(--rose-bg)',  line: 'var(--rose-line)'  },
  'Name':   { color: 'var(--accent)',bg: 'var(--accent-bg)',line: 'var(--accent-line)'},
}

function OutcomeBadge({ verdict }: { verdict?: string }) {
  if (!verdict) return null
  const style = OUTCOME_STYLE[verdict] || OUTCOME_STYLE['Hold']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
      color: style.color, background: style.bg, border: `1px solid ${style.line}`,
    }}>
      {verdict}
    </span>
  )
}

function EvalCard({ record, onEdit }: { record: EvalRecord; onEdit: (r: EvalRecord) => void }) {
  const { region } = useData()
  const excerpt = record.comments
    ? record.comments.length > 80 ? record.comments.slice(0, 80) + '…' : record.comments
    : null

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 14,
      border: '1px solid var(--line)',
      padding: '14px 14px 12px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>
            {fmtDate(record.date, region) || (record.year ? `${record.year}` : 'No date')}
          </div>
          {record.avg !== undefined && (
            <RatingDots value={Math.round(record.avg)} max={5} size={22} readOnly />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <OutcomeBadge verdict={record.verdict} />
          <button
            onClick={() => onEdit(record)}
            style={{
              ...btnReset,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--ink-2)',
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {record.avg !== undefined && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: excerpt ? 10 : 0 }}>
          {record.form !== undefined && <ScorePill label="Form" value={record.form} />}
          {record.colour !== undefined && <ScorePill label="Colour" value={record.colour} />}
          {record.branching !== undefined && <ScorePill label="Branch" value={record.branching} />}
          {record.vigour !== undefined && <ScorePill label="Vigour" value={record.vigour} />}
        </div>
      )}

      {excerpt && (
        <div style={{
          fontSize: 13.5,
          color: 'var(--ink-3)',
          lineHeight: 1.45,
          borderTop: '1px solid var(--line)',
          paddingTop: 10,
          marginTop: 2,
        }}>
          {excerpt}
        </div>
      )}
    </div>
  )
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 12, fontWeight: 600,
      background: 'var(--surface-2)', color: 'var(--ink-2)',
      border: '1px solid var(--line)',
    }}>
      {label} <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{value}</span>
    </span>
  )
}

export function EvalHistorySheet({ open, iris, onClose, onEdit }: EvalHistorySheetProps) {
  const evals: EvalRecord[] = iris?.evaluations
    ? [...iris.evaluations].sort((a, b) => {
        const da = a.date || String(a.year || 0)
        const db = b.date || String(b.year || 0)
        return db.localeCompare(da)
      })
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
