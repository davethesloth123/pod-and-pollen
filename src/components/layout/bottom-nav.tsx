'use client'
import { Icon } from '@/components/ui/icon'
import { btnReset } from '@/components/ui/shared'

type Tab = 'home' | 'collection' | 'crosses' | 'garden' | 'search'

interface BottomNavProps {
  tab: Tab
  onTab: (k: string) => void
  onAdd: () => void
}

export function BottomNav({ tab, onTab, onAdd }: BottomNavProps) {
  const items = [
    { k: 'home',       icon: 'home',   label: 'Home' },
    { k: 'collection', icon: 'grid',   label: 'Collection' },
    { k: '__add',      icon: 'plus',   label: '' },
    { k: 'crosses',    icon: 'dna',    label: 'Crosses' },
    { k: 'garden',     icon: 'pin',    label: 'Garden' },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '6px 8px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)',
      position: 'sticky', bottom: 0, zIndex: 40,
    }}>
      {items.map(it => {
        if (it.k === '__add') {
          return (
            <button key="add" onClick={onAdd} style={{ ...btnReset, flex: 1, display: 'flex', justifyContent: 'center', padding: '4px 0' }} aria-label="Add iris">
              <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px var(--accent-shadow)' }}>
                <Icon name="plus" size={26} stroke="#fff" sw={2.4} />
              </span>
            </button>
          )
        }
        const active = tab === it.k
        return (
          <button key={it.k} onClick={() => onTab(it.k)} style={{
            ...btnReset, flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, padding: '8px 0 4px',
          }}>
            <Icon name={it.icon} size={24} stroke={active ? 'var(--accent)' : 'var(--ink-4)'} sw={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, color: active ? 'var(--accent)' : 'var(--ink-4)' }}>{it.label}</span>
          </button>
        )
      })}
    </div>
  )
}
