'use client'
import { Icon } from '@/components/ui/icon'
import { IrisCard, btnReset } from '@/components/ui/shared'
import { useData } from '@/lib/data-context'

// "Now flowering" list — reached from the Home widgets' View all / See all.
// NOTE: the flowering predicate is status-based for now; Phase 6 switches it to
// the date rule (first-flower date this year AND no last-flower date).
export function InFlowerScreen({ go }: { go: (view: string | number, params?: Record<string, any>) => void }) {
  const { irises } = useData()
  const flowering = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower')

  return (
    <div style={{ minHeight: '100%', paddingBottom: 40 }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg)', borderBottom: '1px solid var(--line)',
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => go(-1)} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--line)' }}>
            <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
          </span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 700, fontSize: 19, color: 'var(--ink)' }}>
            Now flowering
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            {flowering.length} {flowering.length === 1 ? 'plant' : 'plants'} in bloom
          </div>
        </div>
      </div>

      {flowering.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', background: 'var(--rose-bg)', border: '1px solid var(--rose-line)', marginBottom: 14 }}>
            <Icon name="flower" size={26} stroke="var(--rose)" sw={1.8} />
          </span>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', marginBottom: 6 }}>Nothing flowering yet</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', maxWidth: 300, margin: '0 auto', lineHeight: 1.5 }}>Mark plants as Flowering when their buds open, and they&apos;ll appear here.</div>
        </div>
      ) : (
        <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
          {flowering.map(iris => (
            <IrisCard key={iris.id} iris={iris} onClick={() => go('detail', { id: iris.id })} />
          ))}
        </div>
      )}
    </div>
  )
}
