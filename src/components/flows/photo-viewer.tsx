'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icon'
import { IrisBloom } from '@/components/ui/iris-bloom'
import { btnReset } from '@/components/ui/shared'
import { PAL } from '@/lib/data'

interface PhotoViewerProps {
  open: boolean
  photos: any[]
  startIndex: number
  onClose: () => void
  onAction: (action: string, photo: any, payload?: any) => void
}

const CATEGORIES = ['Standards', 'Falls', 'Habit', 'Setting', 'Detail', 'Other']

function CategoryPicker({ current, onPick, onClose }: { current: string; onPick: (cat: string) => void; onClose: () => void }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8,
      background: 'rgba(30,20,40,0.97)',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.12)',
      padding: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 160,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      zIndex: 10,
    }}>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => { onPick(cat); onClose() }}
          style={{
            ...btnReset,
            padding: '9px 14px',
            borderRadius: 9,
            fontSize: 14.5,
            fontWeight: 500,
            textAlign: 'left',
            color: cat === current ? '#fff' : 'rgba(255,255,255,0.65)',
            background: cat === current ? 'rgba(255,255,255,0.15)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

export function PhotoViewer({ open, photos, startIndex, onClose, onAction }: PhotoViewerProps) {
  const [idx, setIdx] = useState(startIndex)
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (open) setIdx(startIndex)
  }, [open, startIndex])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  if (!open || photos.length === 0) return null

  const photo = photos[idx]
  const pal = photo?.pal ? (PAL[photo.pal] || PAL.deepPurple) : PAL.deepPurple

  function prev() { setIdx(i => (i - 1 + photos.length) % photos.length) }
  function next() { setIdx(i => (i + 1) % photos.length) }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') onClose()
  }

  function handleSaveToRoll() {
    onAction('save', photo)
    setToast('Saved to camera roll')
  }

  function handleDelete() {
    onAction('delete', photo)
    if (photos.length <= 1) { onClose(); return }
    setIdx(i => Math.min(i, photos.length - 2))
  }

  function handleCategoryChange(cat: string) {
    onAction('category', photo, cat)
    setToast(`Category set to ${cat}`)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'blFade .2s ease' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {photo?.cat && (
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 0.4,
              color: 'rgba(255,255,255,0.6)',
              background: 'rgba(255,255,255,0.1)',
              padding: '3px 9px', borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.12)',
              textTransform: 'uppercase',
            }}>
              {photo.cat}
            </span>
          )}
          {photos.length > 1 && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              {idx + 1} / {photos.length}
            </span>
          )}
        </div>
        <button onClick={onClose} style={{ ...btnReset, cursor: 'pointer', width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="x" size={22} stroke="rgba(255,255,255,0.8)" sw={2} />
        </button>
      </div>

      {/* Photo display */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Photo placeholder */}
        <div style={{ width: '90%', maxWidth: 420, aspectRatio: '3 / 4', borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 16px 56px rgba(0,0,0,0.7)' }}>
          {photo?.url ? (
            <img src={photo.url} alt={photo.cat || 'Photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <IrisBloom s={pal.s} f={pal.f} beard={pal.beard} r={16} label={photo?.cat} />
          )}
        </div>

        {/* Prev / next arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              style={{
                ...btnReset,
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="back" size={22} stroke="rgba(255,255,255,0.8)" sw={2.2} />
            </button>
            <button
              onClick={next}
              style={{
                ...btnReset,
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="chevron" size={22} stroke="rgba(255,255,255,0.8)" sw={2.2} />
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {photos.length > 1 && photos.length <= 12 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 0 8px' }}>
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                ...btnReset,
                width: i === idx ? 18 : 7,
                height: 7,
                borderRadius: 999,
                background: i === idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.28)',
                cursor: 'pointer',
                transition: 'all .2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          whiteSpace: 'nowrap',
          animation: 'blFade .2s ease',
          zIndex: 5,
        }}>
          <Icon name="check" size={16} stroke="#7ee0a8" sw={2.4} />
          {toast}
        </div>
      )}

      {/* Action bar */}
      <div style={{
        padding: '12px 20px 28px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        {/* Delete */}
        <button
          onClick={handleDelete}
          style={{
            ...btnReset,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(220,60,80,0.14)',
            border: '1px solid rgba(220,60,80,0.25)',
            color: '#f08090',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          <Icon name="x" size={20} stroke="#f08090" sw={2} />
          Delete
        </button>

        {/* Change category */}
        <div style={{ flex: 1, position: 'relative' }}>
          <button
            onClick={() => setShowCatPicker(p => !p)}
            style={{
              ...btnReset,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Icon name="tag" size={20} stroke="rgba(255,255,255,0.75)" sw={2} />
            Category
          </button>
          {showCatPicker && (
            <CategoryPicker
              current={photo?.cat || ''}
              onPick={handleCategoryChange}
              onClose={() => setShowCatPicker(false)}
            />
          )}
        </div>

        {/* Save to roll */}
        <button
          onClick={handleSaveToRoll}
          style={{
            ...btnReset,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.75)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          <Icon name="upload" size={20} stroke="rgba(255,255,255,0.75)" sw={2} />
          Save to roll
        </button>
      </div>
    </div>
  )
}
