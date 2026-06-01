'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Sheet, btnReset, SectionLabel } from '@/components/ui/shared'
import { irises } from '@/lib/data'
import type { Iris } from '@/types'

interface AddPhotoFlowProps {
  open: boolean
  iris?: Iris
  onClose: () => void
  onSaved: (category: string) => void
}

const CATEGORIES = ['Standards', 'Falls', 'Habit', 'Setting', 'Detail', 'Other']

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  borderRadius: 12,
  border: '1px solid var(--line-2)',
  background: 'var(--surface)',
  fontSize: 15.5,
  color: 'var(--ink)',
  fontFamily: 'Lexend, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--ink-3)',
  letterSpacing: 0.3,
  marginBottom: 6,
  display: 'block',
}

export function AddPhotoFlow({ open, iris, onClose, onSaved }: AddPhotoFlowProps) {
  const [category, setCategory] = useState('Standards')
  const [caption, setCaption] = useState('')
  const [selectedIris, setSelectedIris] = useState<string>(iris?.name || '')
  const [irisSearch, setIrisSearch] = useState('')

  const irisNames = irises.map(i => i.name)
  const filteredIrises = irisSearch
    ? irisNames.filter(n => n.toLowerCase().includes(irisSearch.toLowerCase()))
    : []

  function handleClose() {
    setCategory('Standards')
    setCaption('')
    setSelectedIris(iris?.name || '')
    setIrisSearch('')
    onClose()
  }

  function handleSave() {
    onSaved(category)
    handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Add Photo">
      <div style={{ padding: '4px 18px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <label style={labelStyle}>CATEGORY</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  ...btnReset,
                  padding: '9px 15px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  background: category === cat ? 'var(--ink)' : 'var(--surface)',
                  color: category === cat ? '#fff' : 'var(--ink-2)',
                  border: `1px solid ${category === cat ? 'var(--ink)' : 'var(--line)'}`,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {!iris && (
          <div>
            <label style={labelStyle}>IRIS</label>
            <input
              style={inputStyle}
              placeholder="Search for an iris…"
              value={selectedIris || irisSearch}
              onChange={e => {
                setSelectedIris('')
                setIrisSearch(e.target.value)
              }}
            />
            {filteredIrises.length > 0 && !selectedIris && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, marginTop: 4, overflow: 'hidden' }}>
                {filteredIrises.slice(0, 5).map(n => (
                  <button
                    key={n}
                    onClick={() => { setSelectedIris(n); setIrisSearch('') }}
                    style={{ ...btnReset, width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 15, color: 'var(--ink)', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {iris && (
          <div style={{ padding: '10px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 9 }}>
            <Icon name="flower" size={16} stroke="var(--accent)" sw={2} />
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--accent)' }}>{iris.name}</span>
          </div>
        )}

        {/* Upload area */}
        <div>
          <label style={labelStyle}>PHOTO</label>
          <div style={{
            width: '100%',
            minHeight: 160,
            borderRadius: 14,
            border: '2px dashed var(--line-2)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            boxSizing: 'border-box',
            padding: 20,
          }}>
            <span style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={28} stroke="var(--accent)" sw={1.8} />
            </span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)' }}>Take or upload photo</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}>Tap to open camera or choose from library</div>
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>CAPTION</label>
          <input
            style={inputStyle}
            placeholder="Optional caption or note about this photo…"
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          style={{
            ...btnReset,
            width: '100%',
            padding: '15px',
            borderRadius: 14,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 15.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon name="upload" size={18} stroke="#fff" sw={2} />
          Save Photo
        </button>
      </div>
    </Sheet>
  )
}
