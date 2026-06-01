// auth.jsx — Pod & Pollen sign in / sign up screens
// Exports: AuthWelcome, SignUpFlow, SignInFlow, ForgotPasswordFlow
const { useState: useStateA } = React;

// shared bg w/ soft bloom hero
function AuthBg({ children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, opacity: 0.55, filter: 'blur(8px)' }}>
        <IrisBloom s={BL.PAL.deepPurple.s} f={BL.PAL.deepPurple.f} beard={BL.PAL.deepPurple.beard} r={999} />
      </div>
      <div style={{ position: 'absolute', bottom: -100, left: -90, width: 280, height: 280, opacity: 0.42, filter: 'blur(10px)' }}>
        <IrisBloom s={BL.PAL.yellowBlue.s} f={BL.PAL.yellowBlue.f} beard={BL.PAL.yellowBlue.beard} r={999} />
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  );
}

function AuthInput({ label, ...rest }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: 0.1 }}>{label}</div>
      <input {...rest} style={{
        width: '100%', boxSizing: 'border-box', padding: '15px 16px', borderRadius: 14,
        border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 16,
        fontFamily: 'Lexend, sans-serif', color: 'var(--ink)', outline: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }} />
    </label>
  );
}

function AuthPrimary({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...window.blBtnReset, width: '100%', cursor: disabled ? 'default' : 'pointer',
      padding: '16px', borderRadius: 15,
      background: disabled ? 'var(--line-2)' : 'var(--accent)', color: '#fff',
      fontSize: 16.5, fontWeight: 600,
      boxShadow: disabled ? 'none' : '0 6px 18px var(--accent-shadow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

function AuthSecondary({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...window.blBtnReset, width: '100%', cursor: 'pointer',
      padding: '14px', borderRadius: 15,
      background: 'transparent', color: 'var(--ink-2)',
      border: '1px solid var(--line-2)',
      fontSize: 15.5, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  );
}

// ════════════════════════════════════════════════════════════
// AUTH WELCOME — landing page when signed out
// ════════════════════════════════════════════════════════════
function AuthWelcome({ onSignUp, onSignIn }) {
  return (
    <AuthBg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 28px 36px', textAlign: 'center' }}>
        {/* hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 130, height: 130, marginBottom: 28 }}>
            <IrisBloom s={BL.PAL.deepPurple.s} f={BL.PAL.deepPurple.f} beard={BL.PAL.deepPurple.beard} r={26} />
          </div>
          <div className="h-display" style={{ fontSize: 46, color: 'var(--ink)', lineHeight: 0.96, letterSpacing: -0.02, marginBottom: 16 }}>
            Pod <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>&amp;</span> Pollen
          </div>
          <div style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 320, marginBottom: 8 }}>
            A field notebook for serious gardeners.
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', maxWidth: 300 }}>
            Track plants, parents, crosses, seedlings, and first flowers — all connected.
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AuthPrimary onClick={onSignUp}>Create your account</AuthPrimary>
          <AuthSecondary onClick={onSignIn}>I already have an account</AuthSecondary>
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 12, lineHeight: 1.5 }}>
            By continuing you agree to our <span style={{ color: 'var(--accent)', fontWeight: 600 }}>terms</span> and <span style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy</span>.
          </div>
        </div>
      </div>
    </AuthBg>
  );
}

// ════════════════════════════════════════════════════════════
// SIGN UP FLOW — 3 steps (email → password → name & garden)
// ════════════════════════════════════════════════════════════
function SignUpFlow({ onDone, onBack, onSwitchToSignIn }) {
  const [step, setStep] = useStateA(0);
  const [email, setEmail] = useStateA('');
  const [password, setPassword] = useStateA('');
  const [showPw, setShowPw] = useStateA(false);
  const [name, setName] = useStateA('');
  const [garden, setGarden] = useStateA('');

  const next = () => step < 2 ? setStep(step + 1) : onDone({ email, password, name, garden });
  const back = () => step > 0 ? setStep(step - 1) : onBack();

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const pwValid = password.length >= 8;
  const nameValid = name.trim().length > 0;
  const canContinue = [emailValid, pwValid, nameValid][step];

  return (
    <AuthBg>
      {/* top bar */}
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={back} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="Back">
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
              <button onClick={() => setShowPw(!showPw)} style={{ ...window.blBtnReset, cursor: 'pointer', position: 'absolute', right: 12, top: 36, padding: 8, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
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
            <div style={{ marginTop: 22, fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>
              You can change these later in Settings.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        <AuthPrimary onClick={next} disabled={!canContinue}>
          {step === 2 ? <>Create account<Icon name="check" size={18} stroke="#fff" sw={2.4} /></> : <>Continue<Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></>}
        </AuthPrimary>
        {step === 0 && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5, color: 'var(--ink-3)' }}>
            Already have an account? <button onClick={onSwitchToSignIn} style={{ ...window.blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>Sign in</button>
          </div>
        )}
      </div>
    </AuthBg>
  );
}

// ════════════════════════════════════════════════════════════
// SIGN IN FLOW
// ════════════════════════════════════════════════════════════
function SignInFlow({ onDone, onBack, onSwitchToSignUp, onForgot }) {
  const [email, setEmail] = useStateA('dave@example.co.uk');
  const [password, setPassword] = useStateA('');
  const [showPw, setShowPw] = useStateA(false);
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;
  return (
    <AuthBg>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="Back">
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
          <AuthInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <div style={{ position: 'relative' }}>
            <AuthInput label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            <button onClick={() => setShowPw(!showPw)} style={{ ...window.blBtnReset, cursor: 'pointer', position: 'absolute', right: 12, top: 36, padding: 8, color: 'var(--ink-3)', fontSize: 12.5, fontWeight: 600 }}>{showPw ? 'Hide' : 'Show'}</button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onForgot} style={{ ...window.blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontSize: 13.5, fontWeight: 600, padding: '6px 4px' }}>Forgot password?</button>
        </div>
      </div>
      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        <AuthPrimary onClick={() => onDone({ email, password })} disabled={!valid}>
          Sign in<Icon name="chevron" size={18} stroke="#fff" sw={2.4} />
        </AuthPrimary>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13.5, color: 'var(--ink-3)' }}>
          New here? <button onClick={onSwitchToSignUp} style={{ ...window.blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>Create an account</button>
        </div>
      </div>
    </AuthBg>
  );
}

// ════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ════════════════════════════════════════════════════════════
function ForgotPasswordFlow({ onBack, onSent }) {
  const [email, setEmail] = useStateA('');
  const [sent, setSent] = useStateA(false);
  const valid = /\S+@\S+\.\S+/.test(email);
  return (
    <AuthBg>
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <button onClick={onBack} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 24px', position: 'relative', zIndex: 1 }}>
        {!sent ? <>
          <div className="h-display" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 10 }}>Reset your password</div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 26 }}>Enter the email on your account. We'll send you a link to choose a new password.</div>
          <AuthInput label="Email" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </> : <>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30, marginBottom: 22 }}>
            <span style={{ width: 78, height: 78, borderRadius: 999, background: 'var(--green-bg)', border: '1px solid var(--green-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={38} stroke="var(--green)" sw={2.2} />
            </span>
          </div>
          <div className="h-display" style={{ fontSize: 26, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10, textAlign: 'center' }}>Check your inbox</div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, textAlign: 'center', maxWidth: 320, margin: '0 auto' }}>
            We've sent a password reset link to <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{email}</span>. The link expires in 1 hour.
          </div>
        </>}
      </div>
      <div style={{ padding: '14px 22px 30px', borderTop: '1px solid var(--line)', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
        {!sent
          ? <AuthPrimary onClick={() => setSent(true)} disabled={!valid}>Send reset link<Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></AuthPrimary>
          : <AuthPrimary onClick={onSent}>Back to sign in<Icon name="chevron" size={18} stroke="#fff" sw={2.4} /></AuthPrimary>}
      </div>
    </AuthBg>
  );
}

Object.assign(window, { AuthWelcome, SignUpFlow, SignInFlow, ForgotPasswordFlow });
