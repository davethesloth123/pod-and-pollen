'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { btnReset } from '@/components/ui/shared'
import { PLANT_TYPES, getGoals, recommendWidgets, DEFAULT_WIDGETS } from '@/lib/data'

interface OnboardingFlowProps {
  onComplete?: (recommendedWidgets?: string[]) => void
  onDone?: (data: unknown) => void
}

const TOTAL_STEPS = 5 // welcome, plant, matters, gardenType, garden

export function OnboardingFlow({ onComplete, onDone }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [matters, setMatters] = useState<string[]>([])
  const [gardenType, setGardenType] = useState('')
  const [gardenName, setGardenName] = useState('')

  // Complete onboarding, building the dashboard from the chosen answers
  const finish = (mattersKeys = matters, gType = gardenType) => {
    const recommended = recommendWidgets({ matters: mattersKeys, gardenType: gType || 'mixed', frequency: 'weekly' })
    onComplete?.(recommended)
    onDone?.({ matters: mattersKeys, gardenType: gType, gardenName })
  }

  // Exit with a sensible default dashboard (no personalisation)
  const useDefault = () => {
    onComplete?.(DEFAULT_WIDGETS)
    onDone?.({ matters: [], gardenType: '', gardenName })
  }

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1)
    else finish()
  }
  const back = () => step > 0 && setStep(step - 1)

  // Top-right skip behaviour by step:
  //  0,1 → "Skip" exits onboarding entirely (default dashboard)
  //  2,3 → "Use default" exits with default widgets
  //  4   → "Skip" finishes with whatever's set so far
  const isPersonalization = step === 2 || step === 3
  const topSkip = isPersonalization ? useDefault : (step === 4 ? () => finish() : useDefault)
  const topSkipLabel = isPersonalization ? 'Use default' : 'Skip'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'blFade .3s ease' }}>
      {/* progress + back */}
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 16px) 18px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={back} disabled={step === 0} style={{ ...btnReset, cursor: step ? 'pointer' : 'default', opacity: step ? 1 : 0 }} aria-label="Back">
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'background .2s' }} />
          ))}
        </div>
        <button onClick={topSkip} style={{ ...btnReset, cursor: 'pointer', color: 'var(--ink-3)', fontSize: 14, fontWeight: 500 }}>
          {topSkipLabel}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 24px', display: 'flex', flexDirection: 'column' }}>
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepPlant />}
        {step === 2 && <StepMatters value={matters} onChange={setMatters} />}
        {step === 3 && <StepGardenType value={gardenType} onChange={setGardenType} />}
        {step === 4 && <StepGarden value={gardenName} onChange={setGardenName} />}
      </div>

      <div style={{ padding: '14px 22px calc(env(safe-area-inset-bottom) + 28px)', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button onClick={next} style={{ ...btnReset, width: '100%', cursor: 'pointer', padding: 16, borderRadius: 15, background: 'var(--accent)', color: '#fff', fontSize: 16.5, fontWeight: 600, boxShadow: '0 6px 18px var(--accent-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {step === TOTAL_STEPS - 1
            ? <>Finish Account Setup<Icon name="chevron" size={20} stroke="#fff" sw={2.2} /></>
            : <>Continue<Icon name="chevron" size={20} stroke="#fff" sw={2.2} /></>}
        </button>
      </div>
    </div>
  )
}

// ─── Step 0: Welcome ──────────────────────────────────────────
function StepWelcome() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 0 40px' }}>
      <div style={{ width: 150, height: 150, borderRadius: 38, marginBottom: 28, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 38px var(--accent-shadow)' }}>
        <Icon name="iris" size={88} stroke="#fff" sw={1.5} />
      </div>
      <div className="h-display" style={{ fontWeight: 600, fontSize: 38, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 14 }}>Welcome to<br />Pod &amp; Pollen</div>
      <div style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 320, marginBottom: 10 }}>
        A field notebook for serious iris growers — plants, parents, crosses, seedlings, and first flowers, all connected.
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-3)', maxWidth: 280 }}>
        Built for the garden. Works in any browser, on phone, tablet, or desktop.
      </div>
    </div>
  )
}

// ─── Step 1: Plant type (irises today; built in for future genera) ──
function StepPlant() {
  const iris = PLANT_TYPES.find(p => p.k === 'iris')!
  return (
    <div>
      <div className="h-display" style={{ fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>A field notebook for irises</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 22 }}>
        Pod &amp; Pollen is built around the iris breeding lifecycle — varieties, parents, crosses, seedlings, and first flowers, all connected.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, background: 'var(--accent-bg)', border: '1.5px solid var(--accent)', boxShadow: '0 4px 14px var(--accent-shadow)' }}>
        <span style={{ width: 60, height: 60, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px var(--accent-shadow)' }}>
          <Icon name="iris" size={32} stroke="#fff" sw={1.9} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h-display" style={{ fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>Irises</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>{iris.blurb}</div>
        </div>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={16} stroke="#fff" sw={2.6} />
        </span>
      </div>
    </div>
  )
}

// ─── Step 2: What matters most (drives the dashboard) ─────────
function StepMatters({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const options = getGoals()
  const toggle = (k: string) => {
    if (value.includes(k)) onChange(value.filter(x => x !== k))
    else if (value.length < 4) onChange([...value, k])
  }
  return (
    <div>
      <div className="h-display" style={{ fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>What matters most to you?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 18 }}>
        Pick up to 4. We&apos;ll set up your home dashboard around what you care about — you can change it anytime in Settings.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {options.map(opt => {
          const active = value.includes(opt.k)
          const atLimit = !active && value.length >= 4
          return (
            <button key={opt.k} onClick={() => toggle(opt.k)} disabled={atLimit} style={{ ...btnReset, cursor: atLimit ? 'default' : 'pointer', opacity: atLimit ? 0.45 : 1, width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 14, background: active ? 'var(--accent-bg)' : 'var(--surface)', border: active ? '1.5px solid var(--accent)' : '1px solid var(--line)', boxShadow: active ? '0 2px 8px var(--accent-shadow)' : 'var(--shadow-sm)', transition: 'all .15s' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: active ? 'var(--accent)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
                  <Icon name={opt.icon} size={20} stroke={active ? '#fff' : 'var(--accent)'} sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1, lineHeight: 1.35 }}>{opt.sub}</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: 999, border: active ? '0' : '1.5px solid var(--line-2)', background: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <Icon name="check" size={14} stroke="#fff" sw={2.6} />}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 12, textAlign: 'center' }}>{value.length}/4 selected</div>
    </div>
  )
}

// ─── Step 3: Garden type (tilts the recommended widgets) ──────
function StepGardenType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { k: 'collector', icon: 'flower', label: 'Mostly collecting named varieties', sub: 'I grow established cultivars' },
    { k: 'breeder',   icon: 'dna',    label: 'Active breeding programme',         sub: 'I make crosses and grow seedlings' },
    { k: 'mixed',     icon: 'leaf',   label: 'A mix of both',                     sub: 'I do a bit of each' },
  ]
  return (
    <div>
      <div className="h-display" style={{ fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>How would you describe your garden?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 18 }}>
        This helps us pick the right starting widgets for your home.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(opt => {
          const active = value === opt.k
          return (
            <button key={opt.k} onClick={() => onChange(opt.k)} style={{ ...btnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 16, background: active ? 'var(--accent-bg)' : 'var(--surface)', border: active ? '1.5px solid var(--accent)' : '1px solid var(--line)', boxShadow: active ? '0 4px 14px var(--accent-shadow)' : 'var(--shadow-sm)', transition: 'all .15s' }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: active ? 'var(--accent)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={opt.icon} size={24} stroke={active ? '#fff' : 'var(--accent)'} sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.35 }}>{opt.sub}</div>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: 999, border: active ? '0' : '1.5px solid var(--line-2)', background: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <Icon name="check" size={15} stroke="#fff" sw={2.6} />}
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div style={{ marginTop: 18, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <Icon name="sliders" size={17} stroke="var(--accent)" sw={2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>You can change this anytime</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Settings → Customize home. Add or remove widgets, change the order, or rerun this setup.</div>
      </div>
    </div>
  )
}

// ─── Step 4: Where do you grow (first location) ───────────────
function StepGarden({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="h-display" style={{ fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>Where do you grow?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 22 }}>
        Add your first growing location. Beds, borders, pots, greenhouse — whatever you use. You can add more later.
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="e.g. Top Bed"
        style={{ width: '100%', boxSizing: 'border-box', padding: '16px 18px', borderRadius: 14, border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 18, fontFamily: 'Lexend, sans-serif', color: 'var(--ink)', outline: 'none' }}
      />
      <div style={{ marginTop: 24, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
          <Icon name="check" size={18} stroke="var(--green)" sw={2.2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>You&apos;re set up</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Your records are private by default. Photos stay yours. Export anytime.</div>
      </div>
    </div>
  )
}
