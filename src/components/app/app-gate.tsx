'use client'
import { useState } from 'react'
import { useData } from '@/lib/data-context'
import { AppShell } from '@/components/app/app-shell'
import { Icon } from '@/components/ui/icon'

// Sits between DataProvider and AppShell. Normal loading is unchanged (the app
// renders immediately and fills in); only a failed initial load is intercepted
// with a retry screen instead of silently showing an empty app.
export function AppGate() {
  const { loadError, refresh } = useData()
  const [retrying, setRetrying] = useState(false)

  if (loadError) {
    const onRetry = async () => {
      setRetrying(true)
      try { await refresh() } finally { setRetrying(false) }
    }
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center',
      }}>
        <span style={{
          width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--rose-bg)', border: '1px solid var(--rose-line)',
        }}>
          <Icon name="alert" size={26} stroke="var(--rose)" sw={2} />
        </span>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>
          Couldn&apos;t load your garden
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', maxWidth: 320, lineHeight: 1.5 }}>
          Something went wrong reaching the server. Check your connection and try again.
        </div>
        <button onClick={onRetry} disabled={retrying} style={{
          cursor: retrying ? 'default' : 'pointer', padding: '12px 22px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="refresh" size={17} stroke="#fff" sw={2.2} />{retrying ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    )
  }

  return <AppShell />
}
