'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { SectionLabel, btnReset } from '@/components/ui/shared'
import { DEFAULT_WIDGETS, WIDGETS, PAL } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'

// ─── Shared container ─────────────────────────────────────────
const emptyWrap: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 32px',
  textAlign: 'center',
  minHeight: 400,
}

// ─── EmptyHome ────────────────────────────────────────────────
interface EmptyHomeProps {
  openAdd: () => void
  go: (view: string | number, params?: Record<string, any>) => void
}

export function EmptyHome({ openAdd, go }: EmptyHomeProps) {
  const palette = PAL.deepPurple

  return (
    <div style={emptyWrap}>
      {/* Hero bloom */}
      <div style={{
        width: 160, height: 160, borderRadius: 999,
        position: 'relative', marginBottom: 32,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <IrisBloom s={palette.s} f={palette.f} beard={palette.beard} r={999} />
      </div>

      <div style={{
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
        fontWeight: 700, fontSize: 24, color: 'var(--ink)',
        marginBottom: 10, letterSpacing: -0.01,
      }}>
        Your collection is empty
      </div>

      <div style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>
        Add your first iris to get started.
      </div>

      <button
        onClick={openAdd}
        style={{
          ...btnReset, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 9,
          padding: '15px 28px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff',
          fontSize: 16, fontWeight: 700,
          boxShadow: '0 6px 20px var(--accent-shadow)',
        }}
      >
        <Icon name="plus" size={20} stroke="#fff" sw={2.2} />
        Add iris
      </button>
    </div>
  )
}

// ─── EmptyCollection ──────────────────────────────────────────
interface EmptyCollectionProps {
  openAdd: () => void
}

export function EmptyCollection({ openAdd }: EmptyCollectionProps) {
  return (
    <div style={emptyWrap}>
      {/* Icon circle */}
      <span style={{
        width: 80, height: 80, borderRadius: 999,
        background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon name="sprout" size={38} stroke="var(--accent)" sw={1.7} />
      </span>

      <div style={{
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
        fontWeight: 700, fontSize: 22, color: 'var(--ink)',
        marginBottom: 9,
      }}>
        No plants yet
      </div>

      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, maxWidth: 280, marginBottom: 28 }}>
        Add your first iris to begin tracking.
      </div>

      <button
        onClick={openAdd}
        style={{
          ...btnReset, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 24px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff',
          fontSize: 15.5, fontWeight: 600,
          boxShadow: '0 6px 18px var(--accent-shadow)',
        }}
      >
        <Icon name="plus" size={19} stroke="#fff" sw={2.2} />
        Add iris
      </button>
    </div>
  )
}

// ─── EmptyGarden ─────────────────────────────────────────────
interface EmptyGardenProps {
  openAdd: () => void
  openLocation?: () => void
  toast: (msg: string) => void
}

export function EmptyGarden({ openAdd, openLocation, toast }: EmptyGardenProps) {
  const handleAddLocation = () => {
    if (openLocation) openLocation()
    else toast('Add location coming soon')
  }

  return (
    <div style={emptyWrap}>
      {/* Icon circle */}
      <span style={{
        width: 80, height: 80, borderRadius: 999,
        background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon name="pin" size={36} stroke="var(--accent)" sw={1.7} />
      </span>

      <div style={{
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
        fontWeight: 700, fontSize: 22, color: 'var(--ink)',
        marginBottom: 9,
      }}>
        No locations yet
      </div>

      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.6, maxWidth: 300, marginBottom: 32 }}>
        Locations are the beds, borders, and pot areas where you grow your irises. Add one to map your garden and track where each plant lives.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
        <button
          onClick={handleAddLocation}
          style={{
            ...btnReset, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px', borderRadius: 999,
            background: 'var(--accent)', color: '#fff',
            fontSize: 15.5, fontWeight: 600,
            boxShadow: '0 6px 18px var(--accent-shadow)',
          }}
        >
          <Icon name="pin" size={18} stroke="#fff" sw={2} />
          Add a location
        </button>

        <button
          onClick={openAdd}
          style={{
            ...btnReset, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 24px', borderRadius: 999,
            background: 'var(--surface)', color: 'var(--ink-2)',
            border: '1.5px solid var(--line)',
            fontSize: 15.5, fontWeight: 600,
          }}
        >
          <Icon name="plus" size={18} stroke="var(--ink-2)" sw={2} />
          Add your first iris
        </button>
      </div>
    </div>
  )
}
