'use client'

function tint(hex: string, a: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

interface IrisBloomProps {
  s: string[]    // standards colors [light, dark]
  f: string[]    // falls colors [light, dark]
  beard?: string
  bg?: string
  r?: number     // border radius
  label?: string
  dim?: boolean
}

export function IrisBloom({ s, f, beard = '#E8B84B', bg, r = 0, label, dim = false }: IrisBloomProps) {
  const grad = (c: string[]) => `linear-gradient(165deg, ${c[0]} 0%, ${c[1]} 100%)`

  const standard = (rot: number, scale = 1) => (
    <div style={{
      position: 'absolute', left: '50%', top: '48%',
      width: `${20 * scale}%`, height: `${44 * scale}%`,
      transform: `translate(-50%, -100%) rotate(${rot}deg)`,
      transformOrigin: '50% 100%',
      borderRadius: '60% 60% 50% 50% / 80% 80% 20% 20%',
      background: grad(s),
      boxShadow: 'inset -3px -4px 12px rgba(0,0,0,0.18), inset 2px 3px 8px rgba(255,255,255,0.28)',
      filter: 'blur(0.4px)',
    }} />
  )

  const fall = (rot: number, scale = 1, z = 1) => (
    <div style={{
      position: 'absolute', left: '50%', top: '48%',
      width: `${30 * scale}%`, height: `${44 * scale}%`,
      transform: `translate(-50%, 0) rotate(${rot}deg)`,
      transformOrigin: '50% 0%',
      borderRadius: '60% 60% 70% 70% / 25% 25% 78% 78%',
      background: grad(f), zIndex: z,
      boxShadow: 'inset 0 -10px 22px rgba(0,0,0,0.24), inset 0 4px 10px rgba(255,255,255,0.22)',
      filter: 'blur(0.4px)',
    }} />
  )

  const bgFill = bg || `radial-gradient(120% 110% at 50% 35%, ${tint(s[0], 0.22)} 0%, ${tint(f[1], 0.28)} 60%, ${tint(f[1], 0.45)} 100%)`

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', background: bgFill }}>
      {/* soft painterly background blooms */}
      <div style={{ position: 'absolute', left: '20%', top: '20%', width: '80%', height: '80%', borderRadius: '50%',
        background: `radial-gradient(circle, ${tint(s[1], 0.35)} 0%, transparent 60%)`, filter: 'blur(20px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '5%', bottom: '5%', width: '70%', height: '70%', borderRadius: '50%',
        background: `radial-gradient(circle, ${tint(f[1], 0.5)} 0%, transparent 60%)`, filter: 'blur(20px)', zIndex: 0 }} />

      {/* falls */}
      {fall(-32, 0.95, 1)}
      {fall(0, 1.05, 2)}
      {fall(32, 0.95, 1)}

      {/* beard streak */}
      <div style={{
        position: 'absolute', left: '50%', top: '52%', width: '6%', height: '18%',
        transform: 'translateX(-50%)', borderRadius: 40, zIndex: 5,
        background: `linear-gradient(${beard}, ${tint(beard, 0.55)})`,
        boxShadow: `0 0 10px ${tint(beard, 0.4)}`, opacity: 0.92,
      }} />

      {/* standards */}
      {standard(-18, 0.95)}
      {standard(18, 0.95)}
      <div style={{ position: 'absolute', zIndex: 4 }}>{standard(0, 1.05)}</div>

      {/* soft center */}
      <div style={{
        position: 'absolute', left: '50%', top: '48%', width: '18%', height: '14%',
        transform: 'translate(-50%, -50%)', borderRadius: '50%', zIndex: 5,
        background: `radial-gradient(circle, ${tint(s[0], 0.65)} 0%, transparent 75%)`,
        filter: 'blur(3px)',
      }} />

      {/* photographic overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, background:
        'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.20), transparent 50%), radial-gradient(120% 120% at 50% 110%, rgba(0,0,0,0.28), transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 9, opacity: 0.4, mixBlendMode: 'overlay',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
      {dim && <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(33,28,18,0.18)' }} />}
      {label && (
        <div style={{ position: 'absolute', left: 10, bottom: 9, zIndex: 11, color: '#fff',
          fontFamily: 'Lexend, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.55)' }}>{label}</div>
      )}
    </div>
  )
}
