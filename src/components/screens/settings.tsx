'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { useData } from '@/lib/data-context'

// ─── ComingSoon pill ──────────────────────────────────────────
function ComingSoonPill() {
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
      color: 'var(--ink-4)', background: 'var(--surface-2)',
      border: '1px solid var(--line)', borderRadius: 999,
      padding: '2px 8px', textTransform: 'uppercase', flexShrink: 0,
    }}>
      Coming soon
    </span>
  )
}

// ─── SetSection ───────────────────────────────────────────────
function SetSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6,
        color: 'var(--ink-3)', textTransform: 'uppercase',
        padding: '0 4px', marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        background: 'var(--surface)', borderRadius: 16,
        border: '1px solid var(--line)', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── SetRow ───────────────────────────────────────────────────
interface SetRowProps {
  icon: string
  label: string
  sub?: string
  onClick?: () => void
  chevron?: boolean
  tint?: 'accent' | 'rose'
  isLast?: boolean
  comingSoon?: boolean
}

function SetRow({ icon, label, sub, onClick, chevron = true, tint = 'accent', isLast, comingSoon }: SetRowProps) {
  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      style={{
        ...btnReset,
        cursor: comingSoon ? 'default' : 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 14px',
        borderBottom: isLast ? 'none' : '1px solid var(--line)',
        opacity: comingSoon ? 0.55 : 1,
      }}
    >
      <span style={{
        width: 34, height: 34, borderRadius: 9,
        background: tint === 'rose' ? 'var(--rose-bg)' : 'var(--accent-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={17} stroke={comingSoon ? 'var(--ink-4)' : (tint === 'rose' ? 'var(--rose)' : 'var(--accent)')} sw={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: comingSoon ? 'var(--ink-3)' : (tint === 'rose' ? 'var(--rose)' : 'var(--ink)') }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {comingSoon ? <ComingSoonPill /> : (chevron && <Icon name="chevron" size={18} stroke="var(--ink-4)" />)}
    </button>
  )
}

// ─── Units segmented control ──────────────────────────────────
function UnitsRow({ units, setUnits, isLast }: { units: 'cm' | 'in'; setUnits: (u: 'cm' | 'in') => void; isLast?: boolean }) {
  const opts: { k: 'cm' | 'in'; label: string }[] = [
    { k: 'cm', label: 'cm' },
    { k: 'in', label: 'in' },
  ]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px',
      borderBottom: isLast ? 'none' : '1px solid var(--line)',
    }}>
      <span style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'var(--accent-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name="sliders" size={17} stroke="var(--accent)" sw={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Measurement units</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>Used for heights and spacing</div>
      </div>
      <div style={{
        display: 'flex', gap: 2, padding: 2, borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--line)', flexShrink: 0,
      }}>
        {opts.map(opt => {
          const active = units === opt.k
          return (
            <button
              key={opt.k}
              onClick={() => setUnits(opt.k)}
              style={{
                ...btnReset, cursor: 'pointer',
                padding: '6px 14px', borderRadius: 8,
                fontSize: 13.5, fontWeight: 600,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--ink-2)',
                transition: 'all .15s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── SettingsScreen ───────────────────────────────────────────
interface SettingsScreenProps {
  go: (view: string | number, params?: Record<string, any>) => void
  toast: (msg: string) => void
  signOut?: () => void
  user?: any
  onSignOut?: () => void
  onImport?: () => void
  wide?: boolean
}

export function SettingsScreen({ go, toast, signOut, user: userProp, onSignOut, onImport }: SettingsScreenProps) {
  const { units, setUnits } = useData()
  const [userData, setUserData] = useState<any>(userProp || null)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  useEffect(() => {
    if (userProp) { setUserData(userProp); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserData(data.user)
    })
  }, [userProp])

  const name = userData?.user_metadata?.name || userData?.email?.split('@')[0] || 'Gardener'
  const email = userData?.email || ''
  const initial = name[0]?.toUpperCase() || 'G'

  const handleSignOut = () => {
    if (!confirmSignOut) { setConfirmSignOut(true); return }
    if (onSignOut) onSignOut()
    else if (signOut) signOut()
  }

  return (
    <div style={{ padding: '20px 18px 48px' }}>

      {/* ── Profile card ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--surface)', borderRadius: 20,
        border: '1px solid var(--line)', padding: '18px 16px',
        marginBottom: 28, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 999,
          background: 'var(--accent-bg)', border: '2px solid var(--accent-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: 'var(--accent)', fontSize: 24, fontWeight: 700,
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
            fontWeight: 600, fontSize: 18, color: 'var(--ink)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {name}
          </div>
          {email && (
            <div style={{
              fontSize: 13, color: 'var(--ink-3)', marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {email}
            </div>
          )}
        </div>
        <button
          onClick={() => toast('Profile editing coming soon')}
          style={{
            ...btnReset, cursor: 'pointer',
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--surface-2)', border: '1px solid var(--line)',
            fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)',
          }}
        >
          Edit
        </button>
      </div>

      {/* ── Data ── */}
      <SetSection label="Data">
        <SetRow icon="sliders" label="Customize home" sub="Rearrange your dashboard widgets" onClick={() => go('customize')} />
        <SetRow icon="upload" label="Import" sub="Import irises from CSV or JSON" comingSoon />
        <SetRow icon="note" label="Export data" sub="Download all your data" comingSoon isLast />
      </SetSection>

      {/* ── Garden ── */}
      <SetSection label="Garden">
        <SetRow icon="pin" label="Add location" sub="Add a new bed, border, or pot area" onClick={() => toast('Add location coming soon')} />
        <SetRow icon="list" label="Manage locations" sub="Edit and reorder your garden locations" onClick={() => toast('Coming soon')} isLast />
      </SetSection>

      {/* ── Display ── */}
      <SetSection label="Display">
        <UnitsRow units={units} setUnits={setUnits} />
        <SetRow icon="eye" label="Text size" sub="Adjust reading comfort" comingSoon isLast />
      </SetSection>

      {/* ── Help & feedback ── */}
      <SetSection label="Help & feedback">
        <SetRow icon="heart" label="Send feedback" sub="We'd love to hear from you" onClick={() => toast('Thanks!')} />
        <SetRow
          icon="flower"
          label="About Pod & Pollen"
          sub="Version 0.1.0"
          onClick={() => toast('Pod & Pollen v0.1.0')}
          isLast
        />
      </SetSection>

      {/* ── Account ── */}
      <SetSection label="Account">
        {confirmSignOut ? (
          <div style={{ padding: '14px 14px' }}>
            <div style={{ fontSize: 14.5, color: 'var(--ink-2)', marginBottom: 12 }}>
              Are you sure you want to sign out?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmSignOut(false)}
                style={{
                  ...btnReset, cursor: 'pointer', flex: 1,
                  padding: '11px 0', borderRadius: 10,
                  background: 'var(--surface-2)', border: '1px solid var(--line)',
                  fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  ...btnReset, cursor: 'pointer', flex: 1,
                  padding: '11px 0', borderRadius: 10,
                  background: 'var(--rose-bg)', border: '1px solid var(--rose-line)',
                  fontSize: 14.5, fontWeight: 600, color: 'var(--rose)',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <SetRow
            icon="x"
            label="Sign out"
            tint="rose"
            onClick={handleSignOut}
            chevron={false}
            isLast
          />
        )}
      </SetSection>
    </div>
  )
}
