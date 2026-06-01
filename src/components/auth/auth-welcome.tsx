'use client'
import { Icon } from '@/components/ui/icon'
import { AuthBg, AuthPrimary, AuthSecondary } from './auth-bg'

export function AuthWelcome({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  return (
    <AuthBg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 28px 36px', textAlign: 'center' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 116, height: 116, borderRadius: 30, marginBottom: 28, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 34px var(--accent-shadow)' }}>
            <Icon name="iris" size={68} stroke="#fff" sw={1.6} />
          </div>
          <div className="h-display" style={{ fontSize: 46, color: 'var(--ink)', lineHeight: 0.96, letterSpacing: -0.02, marginBottom: 16 }}>
            Pod<span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500, marginLeft: '0.18em', marginRight: '0.28em' }}>&</span>Pollen
          </div>
          <div style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 320, marginBottom: 8 }}>
            A field notebook for serious gardeners.
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', maxWidth: 300 }}>
            Track plants, parents, crosses, seedlings, and first flowers — all connected.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AuthPrimary onClick={onSignUp}>Create your account</AuthPrimary>
          <AuthSecondary onClick={onSignIn}>I already have an account</AuthSecondary>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 12, lineHeight: 1.5 }}>
            By continuing you agree to our <span style={{ color: 'var(--accent)', fontWeight: 600 }}>terms</span> and <span style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy</span>.
          </div>
        </div>
      </div>
    </AuthBg>
  )
}
