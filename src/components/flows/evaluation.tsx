'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel, RatingDots, IrisContextHeader } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'
import type { Iris } from '@/types'

interface EvaluationFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (result: { avg?: number }) => void
}

const OUTCOMES = [
  { id: 'Keep',   icon: 'check',  color: 'var(--green)',  bg: 'var(--green-bg)',  line: 'var(--green-line)' },
  { id: 'Watch',  icon: 'eye',    color: 'var(--amber)',  bg: 'var(--amber-bg)',  line: 'var(--amber-line)' },
  { id: 'Reject', icon: 'x',      color: 'var(--rose)',   bg: 'var(--rose-bg)',   line: 'var(--rose-line)'  },
  { id: 'Hold',   icon: 'clock',  color: 'var(--clay)',   bg: 'var(--clay-bg)',   line: 'var(--clay-line)'  },
]

const RATING_CATEGORIES = [
  { id: 'form',     label: 'Flower form',      icon: 'flower'  },
  { id: 'colour',   label: 'Colour saturation', icon: 'droplet' },
  { id: 'branching',label: 'Branching',         icon: 'sprout'  },
  { id: 'habit',    label: 'Plant habit',       icon: 'leaf'    },
  { id: 'vigour',   label: 'Vigour',            icon: 'seed'    },
  { id: 'overall',  label: 'Overall',           icon: 'star'    },
]

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--ink-3)',
  letterSpacing: 0.3,
  marginBottom: 6,
  display: 'block',
}

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

export function EvaluationFlow({ open, iris, onClose, onSaved }: EvaluationFlowProps) {
  const { addEvaluation } = useData()
  const [ratings, setRatings] = useState<Record<string, number>>({
    form: 0, colour: 0, branching: 0, habit: 0, vigour: 0, overall: 0,
  })
  const [seasonNotes, setSeasonNotes] = useState('')
  const [outcome, setOutcome] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function setRating(id: string, v: number) {
    setRatings(r => ({ ...r, [id]: v }))
  }

  function calcAvg() {
    const vals = Object.values(ratings).filter(v => v > 0)
    if (vals.length === 0) return undefined
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }

  function handleClose() {
    setRatings({ form: 0, colour: 0, branching: 0, habit: 0, vigour: 0, overall: 0 })
    setSeasonNotes('')
    setOutcome('')
    setSaving(false)
    setError('')
    onClose()
  }

  async function handleSave() {
    if (saving || !iris) return
    const a = calcAvg()
    setSaving(true)
    setError('')
    try {
      await addEvaluation({
        irisId: iris.id,
        form: ratings.form || undefined,
        colour: ratings.colour || undefined,
        substance: ratings.habit || undefined,
        branching: ratings.branching || undefined,
        vigour: ratings.vigour || undefined,
        avg: a,
        verdict: outcome || undefined,
        comments: seasonNotes.trim() || undefined,
      })
      onSaved({ avg: a })
      handleClose()
    } catch (e) {
      console.error(e)
      setError('Could not save. Please try again.')
      setSaving(false)
    }
  }

  const hasAny = Object.values(ratings).some(v => v > 0) && !saving
  const avg = calcAvg()

  return (
    <Sheet open={open} onClose={handleClose} title="Evaluation">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {iris && <IrisContextHeader iris={iris} label="Evaluating" />}

        <div>
          <SectionLabel>Ratings</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {RATING_CATEGORIES.map((cat, i) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i < RATING_CATEGORIES.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Icon name={cat.icon} size={16} stroke="var(--ink-3)" sw={1.9} />
                  <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{cat.label}</span>
                </div>
                <RatingDots
                  value={ratings[cat.id]}
                  max={5}
                  onChange={v => setRating(cat.id, v)}
                  size={26}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>SEASON NOTES</label>
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Notes about this season's performance, conditions, observations…"
            value={seasonNotes}
            onChange={e => setSeasonNotes(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle}>OUTCOME</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {OUTCOMES.map(o => {
              const active = outcome === o.id
              return (
                <button
                  key={o.id}
                  onClick={() => setOutcome(active ? '' : o.id)}
                  style={{
                    ...btnReset,
                    flex: 1,
                    padding: '10px 6px',
                    borderRadius: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 5,
                    background: active ? o.bg : 'var(--surface)',
                    color: active ? o.color : 'var(--ink-3)',
                    border: `1px solid ${active ? o.line : 'var(--line)'}`,
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  <Icon name={o.icon} size={16} stroke={active ? o.color : 'var(--ink-3)'} sw={2.2} />
                  {o.id}
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <div style={{ padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={!hasAny}
          style={{
            ...btnReset,
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: hasAny ? 'var(--accent)' : 'var(--line)',
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 600,
            cursor: hasAny ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="star" size={18} stroke="#fff" sw={2} />
          {saving ? 'Saving…' : `Save Evaluation${avg !== undefined ? ` · ${avg} / 5` : ''}`}
        </button>
      </div>
    </Sheet>
  )
}
