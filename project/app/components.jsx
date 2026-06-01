// components.jsx — Pod & Pollen shared UI
// Exports to window: Wordmark, TopBar, StatusBadge, Chip, IrisCard, IrisThumb,
//   QuickTile, ActionRow, BottomNav, LifecycleRail, Field, SectionLabel, Sheet, FAB, Segmented

const { useState, useRef, useEffect } = React;

// ── Wordmark ──────────────────────────────────────────────
// ── Wordmark ──────────────────────────────────────────────
// The icon swatch is keyed to a plant type so it can change for future
// platforms (roses, dahlias, …). Today only `iris` is implemented; the
// rest of the wordmark stays identical no matter which plant is active.
function Wordmark({ size = 22, plant = 'iris' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{
        width: 30, height: 30, borderRadius: 9, background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 6px var(--accent-shadow)',
      }}>
        <Icon name={plant} size={19} stroke="#fff" sw={1.9} />
      </span>
      <span style={{
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: size * 1.15,
        color: 'var(--ink)', letterSpacing: 0, lineHeight: 1,
      }}>Pod <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>&amp;</span> Pollen</span>
    </div>
  );
}

// ── Top bar (custom, not iOS) ─────────────────────────────
function TopBar({ title, onBack, action, sub, large }) {
  return (
    <div style={{
      padding: onBack ? '8px 16px 10px' : '10px 18px 8px',
      display: 'flex', flexDirection: 'column', gap: large ? 8 : 4,
      background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30,
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 44 }}>
        {onBack && (
          <button onClick={onBack} style={btnReset} aria-label="Back">
            <span style={iconBtn}><Icon name="back" size={23} stroke="var(--ink)" /></span>
          </button>
        )}
        {title ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600,
              fontSize: large ? 27 : 20, color: 'var(--ink)', lineHeight: 1.1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{title}</div>
            {sub && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
          </div>
        ) : <div style={{ flex: 1 }}><Wordmark /></div>}
        {action}
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status, big }) {
  const m = BL.STATUS[status] || { c: 'green', icon: 'leaf' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: big ? '6px 12px 6px 9px' : '3px 9px 3px 6px', borderRadius: 999,
      background: `var(--${m.c}-bg)`, color: `var(--${m.c})`,
      fontSize: big ? 13.5 : 11.5, fontWeight: 600, lineHeight: 1, letterSpacing: 0.15,
      border: `1px solid var(--${m.c}-line)`, whiteSpace: 'nowrap', textTransform: 'uppercase',
    }}>
      <Icon name={m.icon} size={big ? 14 : 12} stroke={`var(--${m.c})`} sw={2} />
      {status}
    </span>
  );
}

// ── Chip ──────────────────────────────────────────────────
function Chip({ children, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      ...btnReset, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 14px', borderRadius: 999, whiteSpace: 'nowrap',
      fontSize: 14.5, fontWeight: 500, fontFamily: 'Lexend, sans-serif',
      background: active ? 'var(--ink)' : 'var(--surface)',
      color: active ? '#fff' : 'var(--ink-2)',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      transition: 'all .15s', cursor: 'pointer',
    }}>
      {icon && <Icon name={icon} size={15} stroke={active ? '#fff' : 'var(--ink-2)'} sw={2} />}
      {children}
    </button>
  );
}

// ── Iris thumbnail (uses palette) ─────────────────────────
function IrisThumb({ iris, r = 14, label }) {
  const p = BL.PAL[iris.pal];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <IrisBloom s={p.s} f={p.f} beard={p.beard} r={r} label={label} />
    </div>
  );
}

// ── Iris card (grid + list) ───────────────────────────────
function IrisCard({ iris, onClick, variant = 'grid' }) {
  if (variant === 'list') {
    return (
      <button onClick={onClick} style={{ ...btnReset, width: '100%', textAlign: 'left' }}>
        <div style={{
          display: 'flex', gap: 13, alignItems: 'center', padding: 10,
          background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ width: 66, height: 66, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            <IrisThumb iris={iris} r={12} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</span>
              {iris.kind === 'Seedling' && <SeedlingTag />}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '2px 0 7px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {iris.cls} · {iris.loc}
            </div>
            <StatusBadge status={iris.status} />
          </div>
          <Icon name="chevron" size={18} stroke="var(--ink-4)" />
        </div>
      </button>
    );
  }
  return (
    <button onClick={onClick} style={{ ...btnReset, width: '100%', textAlign: 'left' }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 18, overflow: 'hidden',
        border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
          <IrisThumb iris={iris} r={0} />
          <div style={{ position: 'absolute', top: 9, left: 9 }}>
            {iris.kind === 'Seedling' && <SeedlingTag light />}
          </div>
          {iris.fav && (
            <div style={{ position: 'absolute', top: 9, right: 9, width: 28, height: 28, borderRadius: 999,
              background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              <Icon name="star" size={15} stroke="var(--accent)" fill="var(--accent)" sw={1.5} />
            </div>
          )}
        </div>
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 17.5, color: 'var(--ink)',
            lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', margin: '3px 0 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="pin" size={13} stroke="var(--ink-4)" sw={1.8} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.loc}</span>
          </div>
          <StatusBadge status={iris.status} />
        </div>
      </div>
    </button>
  );
}

function SeedlingTag({ light }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2,
      background: light ? 'rgba(255,255,255,0.92)' : 'var(--accent-bg)',
      color: 'var(--accent)', border: light ? 'none' : '1px solid var(--accent-line)',
      boxShadow: light ? '0 1px 4px rgba(0,0,0,0.15)' : 'none' }}>
      <Icon name="sprout" size={12} stroke="var(--accent)" sw={2} />SEEDLING
    </span>
  );
}

// ── Quick action tile (big, senior-friendly) ──────────────
function QuickTile({ icon, label, sub, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      ...btnReset, width: '100%', textAlign: 'left', cursor: 'pointer',
      background: accent ? 'var(--accent)' : 'var(--surface)',
      borderRadius: 20, padding: 18, border: `1px solid ${accent ? 'var(--accent)' : 'var(--line)'}`,
      boxShadow: accent ? '0 6px 18px var(--accent-shadow)' : 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 116,
      justifyContent: 'space-between', transition: 'transform .12s',
    }}>
      <span style={{
        width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent ? 'rgba(255,255,255,0.18)' : 'var(--accent-bg)',
      }}>
        <Icon name={icon} size={25} stroke={accent ? '#fff' : 'var(--accent)'} sw={1.9} />
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 17, fontWeight: 600, color: accent ? '#fff' : 'var(--ink)' }}>{label}</span>
        {sub && <span style={{ display: 'block', fontSize: 13, marginTop: 2, color: accent ? 'rgba(255,255,255,0.82)' : 'var(--ink-3)' }}>{sub}</span>}
      </span>
    </button>
  );
}

// ── Compact action row button ─────────────────────────────
function ActionRow({ icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      ...btnReset, flex: 1, cursor: 'pointer', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 7, padding: '14px 6px', borderRadius: 16,
      background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
    }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent ? 'var(--accent)' : 'var(--accent-bg)' }}>
        <Icon name={icon} size={22} stroke={accent ? '#fff' : 'var(--accent)'} sw={1.9} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.15 }}>{label}</span>
    </button>
  );
}

// ── Lifecycle rail (THE hero) ─────────────────────────────
function LifecycleRail({ iris, onStage }) {
  const steps = BL.lifecycleFor(iris);
  const stateColor = { done: 'var(--green)', active: 'var(--accent)', next: 'var(--ink-4)', na: 'var(--ink-5)' };
  const stateBg = { done: 'var(--green-bg)', active: 'var(--accent-bg)', next: 'var(--surface-2)', na: 'var(--surface-2)' };
  return (
    <div style={{ padding: '4px 2px' }}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const dotC = stateColor[s.state];
        const isDone = s.state === 'done', isActive = s.state === 'active', isNa = s.state === 'na';
        return (
          <div key={s.key} style={{ display: 'flex', gap: 13, opacity: isNa ? 0.5 : 1 }}>
            {/* rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: stateBg[s.state], border: `2px solid ${dotC}`,
                boxShadow: isActive ? '0 0 0 4px var(--accent-ring)' : 'none',
              }}>
                {isDone
                  ? <Icon name="check" size={18} stroke={dotC} sw={2.4} />
                  : <Icon name={s.icon} size={17} stroke={dotC} sw={2} />}
              </span>
              {!last && <span style={{ width: 2, flex: 1, minHeight: 16,
                background: isDone ? 'var(--green)' : 'var(--line)', borderRadius: 2 }} />}
            </div>
            {/* content */}
            <button onClick={() => onStage && onStage(s)} disabled={isNa} style={{
              ...btnReset, flex: 1, textAlign: 'left', paddingBottom: last ? 2 : 16, marginTop: 5,
              cursor: isNa ? 'default' : 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15.5, fontWeight: 600, color: isNa ? 'var(--ink-4)' : 'var(--ink)' }}>{s.label}</span>
                {isActive && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-2-ink)', letterSpacing: 0.4,
                  background: 'var(--accent-2-bg)', border: '1px solid var(--accent-2-line)', padding: '2px 8px', borderRadius: 999 }}>NOW</span>}
                {isNa && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>· not applicable</span>}
              </div>
              {s.detail && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>{s.detail}</div>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Field row ─────────────────────────────────────────────
function Field({ label, value, full }) {
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.2, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.4 }}>{value || '—'}</div>
    </div>
  );
}

function SectionLabel({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 2px 14px', gap: 12 }}>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 9, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', letterSpacing: -0.005, lineHeight: 1 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', display: 'inline-block', transform: 'translateY(-2px)' }} />
        {children}
      </span>
      {action}
    </div>
  );
}

// ── Bottom sheet ──────────────────────────────────────────
function Sheet({ open, onClose, children, title, height = 'auto' }) {
  if (!open) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,15,46,0.4)', animation: 'blFade .2s ease' }} />
      <div style={{
        position: 'relative', background: 'var(--bg)', borderRadius: '26px 26px 0 0',
        maxHeight: '92%', height, display: 'flex', flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)', animation: 'blSheet .26s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0 4px' }}>
          <span style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--line-2)' }} />
        </div>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 18px 12px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>{title}</span>
            <button onClick={onClose} style={btnReset}><span style={iconBtn}><Icon name="x" size={21} stroke="var(--ink-2)" /></span></button>
          </div>
        )}
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── FAB ───────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Add" style={{
      ...btnReset, position: 'absolute', cursor: 'pointer',
      width: 60, height: 60, borderRadius: 999, background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 22px var(--accent-shadow), 0 2px 6px rgba(0,0,0,0.15)',
      border: '2.5px solid var(--bg)',
    }}>
      <Icon name="plus" size={30} stroke="#fff" sw={2.4} />
    </button>
  );
}

// ── Segmented control ─────────────────────────────────────
function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 3, border: '1px solid var(--line)', gap: 3 }}>
      {options.map(o => {
        const active = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            ...btnReset, flex: 1, cursor: 'pointer', padding: '8px 6px', borderRadius: 9,
            fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: active ? 'var(--surface)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none',
          }}>
            {o.icon && <Icon name={o.icon} size={17} stroke={active ? 'var(--accent)' : 'var(--ink-3)'} sw={2} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Bottom navigation ─────────────────────────────────────
function BottomNav({ tab, onTab, onAdd }) {
  const items = [
    { k: 'home', icon: 'home', label: 'Home' },
    { k: 'collection', icon: 'grid', label: 'Collection' },
    { k: '__add', icon: 'plus', label: '' },
    { k: 'crosses', icon: 'dna', label: 'Crosses' },
    { k: 'garden', icon: 'pin', label: 'Garden' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      padding: '6px 8px 24px', background: 'var(--surface)', borderTop: '1px solid var(--line)',
      position: 'relative', zIndex: 40,
    }}>
      {items.map(it => {
        if (it.k === '__add') {
          return (
            <button key="add" onClick={onAdd} style={{ ...btnReset, cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center', padding: '4px 0' }} aria-label="Add">
              <span style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 10px var(--accent-shadow)' }}>
                <Icon name="plus" size={26} stroke="#fff" sw={2.4} />
              </span>
            </button>
          );
        }
        const active = tab === it.k;
        return (
          <button key={it.k} onClick={() => onTab(it.k)} style={{
            ...btnReset, cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, padding: '8px 0 4px',
          }}>
            <Icon name={it.icon} size={24} stroke={active ? 'var(--accent)' : 'var(--ink-4)'} sw={active ? 2.1 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, color: active ? 'var(--accent)' : 'var(--ink-4)' }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Rating dots (1–5, tappable) ───────────────────────────
function RatingDots({ value = 0, max = 5, onChange, size = 28, color, readOnly }) {
  const c = color || 'var(--accent)';
  return (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <button key={i} disabled={readOnly} onClick={() => onChange && onChange(i + 1)} style={{
            ...btnReset, width: size, height: size, borderRadius: 999, cursor: readOnly ? 'default' : 'pointer',
            background: filled ? c : 'transparent', border: `1.8px solid ${filled ? c : 'var(--line-2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {filled && <span style={{ width: size * 0.34, height: size * 0.34, borderRadius: 999, background: '#fff' }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Photo cell (renders an IrisBloom-styled placeholder photo) ──
function PhotoCell({ photo, aspect = '1/1', r = 12, onClick, caption = true }) {
  const p = BL.PAL[photo.pal] || BL.PAL.deepPurple;
  return (
    <button onClick={onClick} style={{ ...btnReset, cursor: onClick ? 'pointer' : 'default', width: '100%', padding: 0 }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: aspect, borderRadius: r, overflow: 'hidden' }}>
        <IrisBloom s={p.s} f={p.f} beard={p.beard} r={r} dim={false} label={caption ? photo.cap : undefined} />
        <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 20,
          padding: '3px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3,
          background: 'rgba(255,255,255,0.92)', color: 'var(--ink)', textTransform: 'uppercase' }}>{photo.cat}</span>
      </div>
    </button>
  );
}

// ── Photo strip: chip filter + grid ───────────────────────
function PhotoStrip({ photos, onOpen }) {
  const cats = ['All', ...Array.from(new Set(photos.map(p => p.cat)))];
  const [cat, setCat] = useState('All');
  const list = cat === 'All' ? photos : photos.filter(p => p.cat === cat);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -18px 12px', padding: '2px 18px' }}>
        {cats.map(c => <Chip key={c} active={c === cat} onClick={() => setCat(c)}>{c}{c !== 'All' && <span style={{ color: 'inherit', opacity: 0.55, marginLeft: 2 }}> · {photos.filter(p => p.cat === c).length}</span>}</Chip>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {list.map((p, i) => <PhotoCell key={i} photo={p} onClick={() => onOpen(list, i)} caption={false} />)}
      </div>
    </div>
  );
}

// ── Sibling card (compact iris pill with bloom thumb) ─────
function SiblingCard({ iris, onClick }) {
  return (
    <button onClick={onClick} style={{ ...btnReset, cursor: 'pointer', flexShrink: 0, width: 130 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: '100%', height: 100, position: 'relative' }}><IrisThumb iris={iris} r={0} /></div>
        <div style={{ padding: '8px 10px 10px' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{iris.status}</div>
        </div>
      </div>
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────
function EmptyState({ icon = 'flower', title, body, action, secondary }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 32px', textAlign: 'center' }}>
      <span style={{ width: 80, height: 80, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid var(--accent-line)' }}>
        <Icon name={icon} size={40} stroke="var(--accent)" sw={1.7} />
      </span>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, maxWidth: 320, marginBottom: 22 }}>{body}</div>
      {action && (
        <button onClick={action.onClick} style={{ ...btnReset, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 22px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600,
          boxShadow: '0 6px 18px var(--accent-shadow)' }}>
          <Icon name="plus" size={20} stroke="#fff" sw={2.2} />{action.label}
        </button>
      )}
      {secondary && (
        <button onClick={secondary.onClick} style={{ ...btnReset, cursor: 'pointer', marginTop: 12,
          color: 'var(--accent)', fontSize: 14.5, fontWeight: 600 }}>{secondary.label}</button>
      )}
    </div>
  );
}

// ── Settings row ──────────────────────────────────────────
function SetRow({ icon, label, sub, onClick, value, danger, isLast }) {
  return (
    <button onClick={onClick} style={{ ...btnReset, cursor: onClick ? 'pointer' : 'default', width: '100%', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0',
      borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      {icon && (
        <span style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'var(--rose-bg)' : 'var(--accent-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={19} stroke={danger ? 'var(--rose)' : 'var(--accent)'} sw={1.9} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 500, color: danger ? 'var(--rose)' : 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {value && <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{value}</span>}
      {onClick && <Icon name="chevron" size={18} stroke="var(--ink-4)" />}
    </button>
  );
}

Object.assign(window, { RatingDots, PhotoCell, PhotoStrip, SiblingCard, EmptyState, SetRow });

// shared inline styles
const btnReset = { background: 'none', border: 'none', padding: 0, margin: 0, font: 'inherit', color: 'inherit' };
const iconBtn = { width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'var(--surface)', border: '1px solid var(--line)' };

Object.assign(window, {
  Wordmark, TopBar, StatusBadge, Chip, IrisCard, IrisThumb, SeedlingTag,
  QuickTile, ActionRow, BottomNav, LifecycleRail, Field, SectionLabel, Sheet, FAB, Segmented,
  blBtnReset: btnReset, blIconBtn: iconBtn,
});
