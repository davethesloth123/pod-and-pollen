'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { recommendWidgets } from '@/lib/data'

// ─── Types ────────────────────────────────────────────────────
interface OnboardingFlowProps {
  onDone?: (data: any) => void
  onComplete?: (recommendedWidgets?: string[]) => void
}

// ─── Option card (multi-select) ───────────────────────────────
function OptionCard({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        ...btnReset,
        cursor: 'pointer',
        padding: '13px 18px',
        borderRadius: 14,
        background: selected ? 'var(--accent-bg)' : 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
        color: selected ? 'var(--accent)' : 'var(--ink)',
        fontWeight: selected ? 600 : 500,
        fontSize: 15,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all .15s',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--line-2)'}`,
        background: selected ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <Icon name="check" size={13} stroke="#fff" sw={2.6} />}
      </span>
      {label}
    </button>
  )
}

// ─── Single-select card ───────────────────────────────────────
function SingleCard({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        ...btnReset,
        cursor: 'pointer',
        padding: '13px 18px',
        borderRadius: 14,
        background: selected ? 'var(--accent-bg)' : 'var(--surface)',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
        color: selected ? 'var(--accent)' : 'var(--ink)',
        fontWeight: selected ? 600 : 500,
        fontSize: 15,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all .15s',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: 999, flexShrink: 0,
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--line-2)'}`,
        background: selected ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />}
      </span>
      {label}
    </button>
  )
}

// ─── Progress bar (4 segments) ────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: 999,
            background: i < step ? 'var(--accent)' : 'var(--line-2)',
            transition: 'background .25s',
          }}
        />
      ))}
    </div>
  )
}

// ─── OnboardingFlow ───────────────────────────────────────────
export function OnboardingFlow({ onDone, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [plantTypes, setPlantTypes] = useState<string[]>([])
  const [matters, setMatters] = useState<string[]>([])
  const [gardenType, setGardenType] = useState('')
  const [gardenName, setGardenName] = useState('')

  const PLANT_TYPES = [
    'Tall Bearded',
    'Intermediate Bearded',
    'Species & Wild types',
    'Other irises',
    'Mixed collection',
  ]

  const MATTERS = [
    'Colour combinations',
    'Tracking crosses',
    'Monitoring seedlings',
    'Photo journal',
    'Garden planning',
  ]

  const GARDEN_TYPES = [
    'Open beds',
    'Mixed borders',
    'Greenhouse',
    'Pots & containers',
    'Show garden',
    'Mixed',
  ]

  const togglePlantType = (v: string) =>
    setPlantTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const toggleMatter = (v: string) =>
    setMatters(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const handleDone = () => {
    const data = { plantTypes, matters, gardenType, gardenName }

    const matterToGoalKey: Record<string, string> = {
      'Colour combinations': 'collect',
      'Tracking crosses': 'breed',
      'Monitoring seedlings': 'breed',
      'Photo journal': 'track',
      'Garden planning': 'map',
    }
    const goalKeys = matters.map(m => matterToGoalKey[m]).filter(Boolean)
    const recommended = recommendWidgets({ matters: goalKeys, gardenType })

    if (onComplete) onComplete(recommended)
    if (onDone) onDone(data)
  }

  const canNext = () => {
    if (step === 1) return plantTypes.length > 0
    if (step === 2) return matters.length > 0
    if (step === 3) return gardenType !== ''
    return true
  }

  const palette = PAL.deepPurple

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 100,
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
      animation: 'blFade .3s ease',
    }}>

      {/* ── Step 0: Welcome ── */}
      {step === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 28px 40px',
        }}>
          <div style={{
            width: 180, height: 180, borderRadius: 999, position: 'relative',
            marginBottom: 36, boxShadow: 'var(--shadow-lg)',
          }}>
            <IrisBloom s={palette.s} f={palette.f} beard={palette.beard} r={999} />
          </div>

          <div style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 700, fontSize: 30, color: 'var(--ink)',
            letterSpacing: -0.02, lineHeight: 1.1, textAlign: 'center', marginBottom: 14,
          }}>
            Welcome to Pod&nbsp;&amp;&nbsp;Pollen
          </div>
          <div style={{ fontSize: 16, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.6, maxWidth: 320, marginBottom: 44 }}>
            Your iris garden companion — track varieties, plan crosses, and follow every bloom.
          </div>

          <button
            onClick={() => setStep(1)}
            style={{
              ...btnReset, cursor: 'pointer',
              padding: '16px 40px', borderRadius: 999,
              background: 'var(--accent)', color: '#fff',
              fontSize: 16.5, fontWeight: 700,
              boxShadow: '0 6px 20px var(--accent-shadow)',
            }}
          >
            Get started
          </button>

          <button
            onClick={handleDone}
            style={{ ...btnReset, cursor: 'pointer', marginTop: 18, fontSize: 14, color: 'var(--ink-4)', fontWeight: 500 }}
          >
            Skip setup
          </button>
        </div>
      )}

      {/* ── Steps 1–4 ── */}
      {step > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Header */}
          <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setStep(s => s - 1)}
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
              <ProgressBar step={step} total={4} />
            </div>
            <button
              onClick={handleDone}
              style={{ ...btnReset, cursor: 'pointer', fontSize: 14, color: 'var(--ink-4)', fontWeight: 500, flexShrink: 0 }}
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '32px 24px 24px' }}>

            {/* Step 1: Plant types */}
            {step === 1 && (
              <>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
                  What do you grow?
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.5 }}>
                  Select all that apply — we'll tailor your app.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PLANT_TYPES.map(opt => (
                    <OptionCard
                      key={opt}
                      label={opt}
                      selected={plantTypes.includes(opt)}
                      onToggle={() => togglePlantType(opt)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Step 2: What matters most */}
            {step === 2 && (
              <>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
                  What matters most?
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.5 }}>
                  We'll build your home screen around these priorities.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MATTERS.map(opt => (
                    <OptionCard
                      key={opt}
                      label={opt}
                      selected={matters.includes(opt)}
                      onToggle={() => toggleMatter(opt)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Step 3: Garden type */}
            {step === 3 && (
              <>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
                  Garden type
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.5 }}>
                  How do you primarily grow your irises?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {GARDEN_TYPES.map(opt => (
                    <SingleCard
                      key={opt}
                      label={opt}
                      selected={gardenType === opt}
                      onSelect={() => setGardenType(opt)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Step 4: Garden name */}
            {step === 4 && (
              <>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 8 }}>
                  Where do you grow?
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginBottom: 28, lineHeight: 1.5 }}>
                  Give your garden a name (optional) — it'll appear across the app.
                </div>
                <input
                  type="text"
                  placeholder="e.g. Dave's Garden"
                  value={gardenName}
                  onChange={e => setGardenName(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: 14,
                    background: 'var(--surface)', border: '1.5px solid var(--line)',
                    fontSize: 16, color: 'var(--ink)', outline: 'none',
                    fontFamily: 'Lexend, system-ui, sans-serif',
                    boxSizing: 'border-box',
                  }}
                  autoFocus
                />
                <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 10 }}>
                  You can always change this later in Settings.
                </div>

                {/* Summary card */}
                {(plantTypes.length > 0 || matters.length > 0 || gardenType) && (
                  <div style={{
                    marginTop: 28, padding: '14px 16px', borderRadius: 14,
                    background: 'var(--surface)', border: '1px solid var(--line)',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Your setup
                    </div>
                    {plantTypes.length > 0 && (
                      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--ink-4)' }}>Growing: </span>
                        {plantTypes.join(', ')}
                      </div>
                    )}
                    {matters.length > 0 && (
                      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginBottom: 4 }}>
                        <span style={{ color: 'var(--ink-4)' }}>Focus: </span>
                        {matters.join(', ')}
                      </div>
                    )}
                    {gardenType && (
                      <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
                        <span style={{ color: 'var(--ink-4)' }}>Garden: </span>
                        {gardenType}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer nav */}
          <div style={{ padding: '12px 24px 40px', display: 'flex', gap: 12 }}>
            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                style={{
                  ...btnReset, cursor: canNext() ? 'pointer' : 'not-allowed', flex: 1,
                  padding: '15px 0', borderRadius: 999,
                  background: canNext() ? 'var(--accent)' : 'var(--line-2)',
                  color: canNext() ? '#fff' : 'var(--ink-4)',
                  fontSize: 16, fontWeight: 700,
                  transition: 'all .15s',
                }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleDone}
                style={{
                  ...btnReset, cursor: 'pointer', flex: 1,
                  padding: '15px 0', borderRadius: 999,
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 16, fontWeight: 700,
                  boxShadow: '0 6px 20px var(--accent-shadow)',
                }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
