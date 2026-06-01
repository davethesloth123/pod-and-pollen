'use client'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { PAL } from '@/lib/data'

export function AuthBg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -120, right: -120, width: 360, height: 360, opacity: 0.55, filter: 'blur(8px)', pointerEvents: 'none' }}>
        <IrisBloom s={PAL.deepPurple.s} f={PAL.deepPurple.f} beard={PAL.deepPurple.beard} r={999} />
      </div>
      <div style={{ position: 'absolute', bottom: -100, left: -90, width: 280, height: 280, opacity: 0.42, filter: 'blur(10px)', pointerEvents: 'none' }}>
        <IrisBloom s={PAL.yellowBlue.s} f={PAL.yellowBlue.f} beard={PAL.yellowBlue.beard} r={999} />
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </div>
  )
}

export function AuthInput({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: 0.1 }}>{label}</div>
      <input {...rest} style={{
        width: '100%', boxSizing: 'border-box', padding: '15px 16px', borderRadius: 14,
        border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 16,
        fontFamily: 'Lexend, sans-serif', color: 'var(--ink)', outline: 'none',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        ...(rest as React.CSSProperties & { style?: React.CSSProperties }).style,
      }} />
    </label>
  )
}

export function AuthPrimary({ children, onClick, disabled }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', cursor: disabled ? 'default' : 'pointer',
      padding: '16px', borderRadius: 15,
      background: disabled ? 'var(--line-2)' : 'var(--accent)', color: '#fff',
      border: 'none', margin: 0, font: 'inherit',
      fontSize: 16.5, fontWeight: 600,
      boxShadow: disabled ? 'none' : '0 6px 18px var(--accent-shadow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  )
}

export function AuthSecondary({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', cursor: 'pointer',
      padding: '14px', borderRadius: 15,
      background: 'transparent', color: 'var(--ink-2)',
      border: '1px solid var(--line-2)',
      margin: 0, font: 'inherit',
      fontSize: 15.5, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children}</button>
  )
}
