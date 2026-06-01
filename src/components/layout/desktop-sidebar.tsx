'use client'
import { Icon } from '@/components/ui/icon'
import { Wordmark, btnReset } from '@/components/ui/shared'

interface DesktopSidebarProps {
  tab: string
  activeView: string
  onTab: (k: string) => void
  onAdd: () => void
  onSettings: () => void
  user: { user_metadata?: { name?: string }; email?: string } | null
}

const NAV = [
  { k: 'home',       icon: 'home', label: 'Home' },
  { k: 'collection', icon: 'grid', label: 'Collection' },
  { k: 'crosses',    icon: 'dna',  label: 'Crosses' },
  { k: 'garden',     icon: 'pin',  label: 'Garden' },
]

export function DesktopSidebar({ tab, activeView, onTab, onAdd, onSettings, user }: DesktopSidebarProps) {
  const initial =
    user?.user_metadata?.name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <aside style={{
      width: 240, flexShrink: 0, height: '100%', overflowY: 'auto',
      padding: '22px 14px 18px', borderRight: '1px solid var(--line)',
      background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ padding: '4px 8px 16px' }}>
        <Wordmark />
      </div>

      <button onClick={onAdd} style={{
        ...btnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 14px', borderRadius: 12, background: 'var(--accent)', color: '#fff',
        fontSize: 14.5, fontWeight: 600, boxShadow: '0 4px 12px var(--accent-shadow)', marginBottom: 6,
      }}>
        <Icon name="plus" size={20} stroke="#fff" sw={2.2} />Add iris
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(it => {
          const active = tab === it.k && activeView === it.k
          return (
            <button key={it.k} onClick={() => onTab(it.k)} style={{
              ...btnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 10,
              background: active ? 'var(--accent-bg)' : 'transparent',
              border: active ? '1px solid var(--accent-line)' : '1px solid transparent',
              color: active ? 'var(--accent)' : 'var(--ink-2)',
              fontSize: 14.5, fontWeight: active ? 600 : 500, textAlign: 'left',
            }}>
              <Icon name={it.icon} size={20} stroke={active ? 'var(--accent)' : 'var(--ink-3)'} sw={active ? 2 : 1.8} />
              {it.label}
            </button>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <button onClick={onSettings} style={{
        ...btnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11,
        padding: '10px 12px', borderRadius: 10,
        background: activeView === 'settings' ? 'var(--accent-bg)' : 'transparent',
        border: activeView === 'settings' ? '1px solid var(--accent-line)' : '1px solid transparent',
        color: activeView === 'settings' ? 'var(--accent)' : 'var(--ink-2)',
        fontSize: 14.5, fontWeight: 500, textAlign: 'left',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 999, background: 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--accent-line)', color: 'var(--accent)', fontWeight: 700, fontSize: 12.5,
        }}>{initial}</span>
        Settings
      </button>
    </aside>
  )
}
