'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/icon'
import { AuthBg, AuthInput, AuthPrimary } from './auth-bg'
import { btnReset } from '@/components/ui/shared'

interface SignUpFlowProps {
  onBack: () => void
  onSwitchToSignIn: () => void
}

export function SignUpFlow({ onBack, onSwitchToSignIn }: SignUpFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState('')
  const [garden, setGarden] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailValid = /\S+@\S+\.\S+/.test(email)
  const pwValid = password.length >= 8
  const nameValid = name.trim().length > 0
  const canContinue = [emailValid, pwValid, nameValid][step]

  const back = () => step > 0 ? setStep(step - 1) : onBack()

  const next = async () => {
    if (step < 2) { setStep(step + 1); return }
    // Step 2 → create account
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, garden_name: garden || `${name}'s Garden` } },
    })
    if (signUpError) {
      setError(signUpError.message); setLoading(false); return
    }
    // Update profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, name, garden_name: garden || `${name}'s Garden` })
    }
    router.push('/')
  }

  return (
    <AuthBg>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={back} style={{ ...btnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'background .2s' }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 24px', position: 'relative', zIndex: 1 }}>
        {step === 0 && (
          <div>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8 }}>What's your email?</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>We'll use this to sign you in and recover your account.</div>
            <AuthInput label="Email address" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            <div style={{ marginTop: 22, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="leaf" size={16} stroke="var(--accent)" sw={1.9} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Private by default</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.45 }}>Your records and photos stay yours. No ads, no third-party sharing.</div>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8 }}>Choose a password</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>At least 8 characters. Mix of letters and numbers recommended.</div>
            <div style={{ position: 'relative' }}>
              <AuthInput label="Password" type={showPw ? 'text' : 'password'} autoFocus value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
              <button onClick={() => setShowPw(!showPw)} style={{ ...btnReset, position: 'absolute', right: 12, top: 36, padding: 8, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { ok: password.length >= 8, label: '8+ characters' },
                { ok: /[A-Z]/.test(password) || /[0-9]/.test(password), label: 'Includes a number or capital letter' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: c.ok ? 'var(--green)' : 'var(--ink-3)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: c.ok ? 'var(--green-bg)' : 'transparent', border: `1.5px solid ${c.ok ? 'var(--green)' : 'var(--line-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.ok && <Icon name="check" size={12} stroke="var(--green)" sw={2.4} />}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 8 }}>Almost there</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>Tell us your name so we can personalise your garden.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AuthInput label="First name" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Margaret" />
              <AuthInput label="Garden name (optional)" value={garden} onChange={e => setGarden(e.target.value)} placeholder={name ? `e.g. ${name}'s Garden` : 'e.g. Walnut Tree Garden'} />
            </div>
            {error && <div style={{ marginTop: 14, padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>}
            <div style={{ marginTop: 22, fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>You can change these later in Settings.</div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        <AuthPrimary onClick={next} disabled={!canContinue || loading}>
          {loading ? 'Creating account…' : step === 2 ? <><>Create account</><Icon name="check" size={18} stroke="#fff" sw={2.4} /></> : <><>Continue</><Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></>}
        </AuthPrimary>
        {step === 0 && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5, color: 'var(--ink-3)' }}>
            Already have an account? <button onClick={onSwitchToSignIn} style={{ ...btnReset, color: 'var(--accent)', fontWeight: 600 }}>Sign in</button>
          </div>
        )}
      </div>
    </AuthBg>
  )
}
