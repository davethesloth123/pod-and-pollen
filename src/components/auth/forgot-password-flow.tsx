'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Icon } from '@/components/ui/icon'
import { AuthBg, AuthInput, AuthPrimary } from './auth-bg'
import { btnReset } from '@/components/ui/shared'

interface ForgotPasswordFlowProps {
  onBack: () => void
}

export function ForgotPasswordFlow({ onBack }: ForgotPasswordFlowProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const valid = /\S+@\S+\.\S+/.test(email)

  const send = async () => {
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })
    if (resetError) {
      setError(resetError.message); setLoading(false); return
    }
    setSent(true); setLoading(false)
  }

  return (
    <AuthBg>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ ...btnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 24px', position: 'relative', zIndex: 1 }}>
        {!sent ? (
          <>
            <div className="h-display" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 10 }}>Reset your password</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>Enter the email on your account. We'll send you a link to choose a new password.</div>
            <AuthInput label="Email" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            {error && <div style={{ marginTop: 14, padding: 12, background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', borderRadius: 12, fontSize: 13.5, color: 'var(--rose)' }}>{error}</div>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, marginBottom: 22 }}>
              <span style={{ width: 78, height: 78, borderRadius: 999, background: 'var(--green-bg)', border: '1px solid var(--green-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={38} stroke="var(--green)" sw={2.2} />
              </span>
            </div>
            <div className="h-display" style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10, textAlign: 'center' }}>Check your inbox</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
              We've sent a password reset link to <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{email}</span>. The link expires in 1 hour.
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        {!sent
          ? <AuthPrimary onClick={send} disabled={!valid || loading}>{loading ? 'Sending…' : <><>Send reset link</><Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></>}</AuthPrimary>
          : <AuthPrimary onClick={onBack}><>Back to sign in</><Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></AuthPrimary>}
      </div>
    </AuthBg>
  )
}
