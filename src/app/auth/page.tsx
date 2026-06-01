'use client'
import { useState } from 'react'
import { AuthWelcome } from '@/components/auth/auth-welcome'
import { SignUpFlow } from '@/components/auth/sign-up-flow'
import { SignInFlow } from '@/components/auth/sign-in-flow'
import { ForgotPasswordFlow } from '@/components/auth/forgot-password-flow'

type AuthView = 'welcome' | 'signup' | 'signin' | 'forgot'

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('welcome')

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {view === 'welcome' && (
        <AuthWelcome
          onSignUp={() => setView('signup')}
          onSignIn={() => setView('signin')}
        />
      )}
      {view === 'signup' && (
        <SignUpFlow
          onBack={() => setView('welcome')}
          onSwitchToSignIn={() => setView('signin')}
        />
      )}
      {view === 'signin' && (
        <SignInFlow
          onBack={() => setView('welcome')}
          onSwitchToSignUp={() => setView('signup')}
          onForgot={() => setView('forgot')}
        />
      )}
      {view === 'forgot' && (
        <ForgotPasswordFlow
          onBack={() => setView('signin')}
        />
      )}
    </div>
  )
}
