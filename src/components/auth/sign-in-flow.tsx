'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/icon'
import { AuthBg, AuthInput, AuthPrimary } from './auth-bg'
import { btnReset } from '@/components/ui/shared'

interface SignInFlowProps {
  onBack: () => void
  onSwitchToSignUp: () => void
  onForgot: () => void
}

export function SignInFlow({ onBack, onSwitchToSignUp, onForgot }: SignInFlowProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6

  const signIn = async () => {
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message); setLoading(false); return
    }
    router.push('/')
  }

  return (
    <AuthBg>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ ...btnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 24px', position: 'relative', zIndex: 1 }}>
        <div className="h-display" style={{ fontSize: 32, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 10 }}>
          Welcome <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>back</span>
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>Sign in to pick up where you left off.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AuthInput label="Email" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <div style={{ position: 'relative' }}>
            <AuthInput label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            <button onClick={() => setShowPw(!showPw)} style={{ ...btnReset, position: 'absolute', right: 12, top: 36, padding: 8, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onForgot} style={{ ...btnReset, color: 'var(--accent)', fontSize: 13.5, fontWeight: 600, padding: '6px 4px' }}>Forgot password?</button>
        </div>
        {error && <div style={{ marginTop: 14, padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>}
      </div>

      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        <AuthPrimary onClick={signIn} disabled={!valid || loading}>
          {loading ? 'Signing in…' : <><>Sign in</><Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></>}
        </AuthPrimary>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5, color: 'var(--ink-3)' }}>
          New here? <button onClick={onSwitchToSignUp} style={{ ...btnReset, color: 'var(--accent)', fontWeight: 600 }}>Create an account</button>
        </div>
      </div>
    </AuthBg>
  )
}
