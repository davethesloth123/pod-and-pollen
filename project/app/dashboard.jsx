// dashboard.jsx — Pod & Pollen home dashboard widgets + customize screen
// Exports: WidgetDashboard, CustomizeDashboardScreen
const { useState: useStateD, useEffect: useEffectD, useMemo: useMemoD } = React;

// ════════════════════════════════════════════════════════════
// WidgetDashboard — composes widgets from a list of IDs
// ════════════════════════════════════════════════════════════
function WidgetDashboard({ widgets, go, openAdd, openNote, openPhoto, wide }) {
  const ctx = { go, openAdd, openNote, openPhoto, wide };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {widgets.map(id => {
        const def = BL.WIDGETS.find(w => w.id === id);
        if (!def) return null;
        return <WidgetSlot key={id} id={id} ctx={ctx} />;
      })}
    </div>
  );
}

function WidgetSlot({ id, ctx }) {
  switch (id) {
    case 'quick':     return <QuickActionsWidget {...ctx} />;
    case 'today':     return <TodayWidget {...ctx} />;
    case 'inflower':  return <InFlowerWidget {...ctx} />;
    case 'recent':    return <RecentWidget {...ctx} />;
    case 'watch':     return <WatchWidget {...ctx} />;
    case 'fav':       return <FavWidget {...ctx} />;
    case 'crosses':   return <CrossesWidget {...ctx} />;
    case 'photowall': return <PhotoWallWidget {...ctx} />;
    case 'gardenmap': return <GardenMapWidget {...ctx} />;
    case 'calendar':  return <CalendarWidget {...ctx} />;
    default: return null;
  }
}

// ─────────────── Locked / pro widget placeholder ───────────────
function LockedWidget({ def }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1.5px dashed var(--line-2)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={def.icon} size={20} stroke="var(--ink-4)" sw={1.9} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)' }}>{def.label}</span>
          <ProBadge />
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{def.sub} · Upgrade to enable</div>
      </div>
    </div>
  );
}
function ProBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 999, background: 'var(--accent-2-bg)', color: 'var(--accent-2-ink)', border: '1px solid var(--accent-2-line)', fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
      <svg width="9" height="9" viewBox="0 0 12 12"><path d="M6 1 L7.7 4.4 L11.5 5 L8.7 7.7 L9.4 11.5 L6 9.7 L2.6 11.5 L3.3 7.7 L0.5 5 L4.3 4.4 Z" fill="currentColor"/></svg>
      Pro
    </span>
  );
}

// ─────────────── Widget header (consistent across widgets) ───────────────
function WidgetHeader({ icon, title, count, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 14px', gap: 12 }}>
      <h3 style={{ display: 'flex', alignItems: 'baseline', gap: 9, margin: 0, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)', letterSpacing: -0.005, lineHeight: 1.2, minWidth: 0, flex: 1 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--accent)', flexShrink: 0, alignSelf: 'center' }} />
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{title}{count != null && <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)' }}> · {count}</span>}</span>
      </h3>
      {action}
    </div>
  );
}
function WidgetLink({ onClick, children }) {
  return <button onClick={onClick} style={{ ...blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontSize: 14.5, fontWeight: 600 }}>{children}</button>;
}

// ─────────────── Quick actions ───────────────
function QuickActionsWidget({ go, openAdd, openNote, openPhoto }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <ActionRow icon="plus" label="Add iris" onClick={openAdd} accent />
        <ActionRow icon="note" label="Quick note" onClick={openNote} />
        <ActionRow icon="camera" label="Add photo" onClick={openPhoto} />
        <ActionRow icon="search" label="Search" onClick={() => go('search')} />
      </div>
    </div>
  );
}

// ─────────────── Today focus ───────────────
function TodayWidget({ go, openPhoto, wide }) {
  return (
    <div>
      <WidgetHeader icon="star" title="Today" />
      <TodayFocusInner go={go} wide={wide} openPhoto={openPhoto} />
    </div>
  );
}
// We delegate to the existing TodayFocus logic but skip its own header
function TodayFocusInner({ go, wide, openPhoto }) {
  const f = BL.todayFocus();
  const cards = [];
  if (f.seedlingsToEval.length) {
    const top = f.seedlingsToEval[0];
    cards.push({ key: 'eval', tint: 'accent', icon: 'star', label: 'Ready to evaluate', count: f.seedlingsToEval.length, title: top.name, sub: 'First flower — score it before it fades', cta: 'Open', onClick: () => go('detail', { id: top.id }) });
  }
  if (f.seedlingsReEval.length) {
    const top = f.seedlingsReEval[0];
    cards.push({ key: 'reeval', tint: 'green', icon: 'sprout', label: 'Re-evaluate this season', count: f.seedlingsReEval.length, title: top.name, sub: 'Last scored ' + (BL.latestEval(top.id) || {}).date, cta: 'Re-score', onClick: () => go('detail', { id: top.id }) });
  }
  if (f.watchList.length) {
    const top = f.watchList[0];
    cards.push({ key: 'watch', tint: 'amber', icon: 'eye', label: 'On the watch list', count: f.watchList.length, title: top.name, sub: 'Decide whether to retain', cta: 'Review', onClick: () => go('detail', { id: top.id }) });
  }
  if (f.inFlower.length) {
    cards.push({ key: 'flower', tint: 'rose', icon: 'flower', label: 'In flower today', count: f.inFlower.length, title: 'Capture this season', sub: 'Photos & flowering notes pay off later', cta: 'Add photo', onClick: () => openPhoto && openPhoto() });
  }
  if (!cards.length) return <EmptyHint icon="check" title="All caught up" body="Nothing needs your attention right now." />;
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -18px', padding: '2px 18px 6px' }}>
      {cards.map(c => <TodayCard key={c.key} {...c} wide={wide} />)}
    </div>
  );
}

// ─────────────── In flower now ───────────────
function InFlowerWidget({ go, wide }) {
  const flowering = BL.irises.filter(i => i.status === 'Flowering' || i.status === 'First flower');
  if (!flowering.length) return <EmptyHint icon="flower" title="Nothing flowering yet" body="When plants bloom, they'll show up here." />;
  return (
    <div>
      <WidgetHeader title="In flower now" count={flowering.length} action={<WidgetLink onClick={() => go('collection')}>See all</WidgetLink>} />
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -18px', padding: '2px 18px 6px', scrollbarWidth: 'none' }}>
        {flowering.map(iris => (
          <button key={iris.id} onClick={() => go('detail', { id: iris.id })} style={{ ...blBtnReset, cursor: 'pointer', width: wide ? 200 : 160, flexShrink: 0 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ position: 'relative', width: '100%', height: wide ? 200 : 160 }}><IrisThumb iris={iris} r={0} /></div>
              <div style={{ padding: '9px 11px 11px' }}>
                <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{iris.loc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Recently updated ───────────────
function RecentWidget({ go }) {
  if (!BL.recent.length) return <EmptyHint icon="clock" title="No activity yet" body="Notes and photos you add will appear here." />;
  return (
    <div>
      <WidgetHeader title="Recently updated" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BL.recent.map((r, i) => {
          const iris = BL.byId(r.id); if (!iris) return null;
          return (
            <button key={i} onClick={() => go('detail', { id: r.id })} style={{ ...blBtnReset, width: '100%', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 11, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={12} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }}>{iris.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-4)', flexShrink: 0 }}>{r.when}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.type} · </span>{r.note}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────── Watch list ───────────────
function WatchWidget({ go }) {
  const watch = BL.irises.filter(i => i.status === 'Watch');
  if (!watch.length) return <EmptyHint icon="eye" title="Nothing to watch" body="Plants flagged for monitoring will appear here." />;
  return (
    <div>
      <WidgetHeader title="Watch list" count={watch.length} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {watch.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
      </div>
    </div>
  );
}

// ─────────────── Favourites ───────────────
function FavWidget({ go, wide }) {
  const favs = BL.irises.filter(i => i.fav);
  if (!favs.length) return <EmptyHint icon="heart" title="No favourites yet" body="Star a plant to add it here." />;
  return (
    <div>
      <WidgetHeader title="Favourites" count={favs.length} />
      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(4,1fr)' : '1fr 1fr', gap: 12 }}>
        {favs.slice(0, wide ? 8 : 4).map(iris => <IrisCard key={iris.id} iris={iris} onClick={() => go('detail', { id: iris.id })} />)}
      </div>
    </div>
  );
}

// ─────────────── Crosses progress ───────────────
function CrossesWidget({ go }) {
  const list = BL.crossesList().filter(c => c.status !== 'Archived').slice(0, 3);
  if (!list.length) return <EmptyHint icon="dna" title="No crosses yet" body="Record a pollination to start your breeding programme." />;
  return (
    <div>
      <WidgetHeader title="Crosses progress" action={<WidgetLink onClick={() => go('crosses')}>See all</WidgetLink>} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {list.map(x => {
          const s = BL.crossStats(x.id);
          const podIris = BL.irises.find(i => i.name === x.pod);
          const polIris = BL.irises.find(i => i.name === x.pollen);
          return (
            <button key={x.id} onClick={() => go('crossDetail', { id: x.id })} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', padding: 11, display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', position: 'relative' }}>{podIris && <IrisThumb iris={podIris} r={9} />}</div>
                  <Icon name="x" size={12} stroke="var(--ink-4)" sw={2.2} />
                  <div style={{ width: 36, height: 36, borderRadius: 9, overflow: 'hidden', position: 'relative' }}>{polIris && <IrisThumb iris={polIris} r={9} />}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{x.code} · {x.status}</div>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.pod} × {x.pollen}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                    <span><strong style={{ color: 'var(--ink-2)' }}>{s.seeds}</strong> seeds</span>
                    <span>·</span>
                    <span><strong style={{ color: 'var(--ink-2)' }}>{s.growing}</strong> growing</span>
                    <span>·</span>
                    <span><strong style={{ color: 'var(--ink-2)' }}>{s.flowered}</strong> flowered</span>
                  </div>
                </div>
                <Icon name="chevron" size={18} stroke="var(--ink-4)" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────── Photo wall ───────────────
function PhotoWallWidget({ go, wide }) {
  const photos = BL.irises.filter(i => i.photos && i.photos.length).flatMap(i => i.photos.slice(0, 2).map((p, j) => ({ iris: i, p, key: i.id + j }))).slice(0, wide ? 12 : 9);
  if (!photos.length) return <EmptyHint icon="camera" title="No photos yet" body="Photos you add will appear here." />;
  return (
    <div>
      <WidgetHeader title="Photo wall" />
      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(4,1fr)' : 'repeat(3,1fr)', gap: 6 }}>
        {photos.map(({ iris, p, key }) => (
          <button key={key} onClick={() => go('detail', { id: iris.id })} style={{ ...blBtnReset, cursor: 'pointer' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden' }}>
              <IrisBloom s={BL.PAL[p.pal].s} f={BL.PAL[p.pal].f} beard={BL.PAL[p.pal].beard} r={10} dim={p.dim || 0} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────── Garden mini map ───────────────
function GardenMapWidget({ go, wide }) {
  // mini map: render the same layout in a small box
  const irisesByLoc = {};
  BL.irises.forEach(i => {
    irisesByLoc[i.loc] = irisesByLoc[i.loc] || { all: [], flowering: [] };
    irisesByLoc[i.loc].all.push(i);
    if (i.status === 'Flowering' || i.status === 'First flower') irisesByLoc[i.loc].flowering.push(i);
  });
  const kindColor = (kind) => ({ 'Bed': '#5F7A52', 'Border': '#7A9268', 'Trial area': '#8E9F62', 'Greenhouse': '#C7B26A', 'Holding': '#9C8762', 'Pots': '#A88B58' })[kind] || 'var(--accent)';
  return (
    <div>
      <WidgetHeader title="Garden plan" action={<WidgetLink onClick={() => go('garden')}>Open</WidgetLink>} />
      <button onClick={() => go('garden')} style={{ ...blBtnReset, cursor: 'pointer', width: '100%' }}>
        <div style={{ background: 'linear-gradient(180deg, #F0EAD7 0%, #E8E0C7 100%)', borderRadius: 16, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden', aspectRatio: wide ? '3/1' : '2/1', boxShadow: 'var(--shadow-sm)' }}>
          {BL.locations.map(loc => {
            const stats = irisesByLoc[loc.name] || { flowering: [] };
            const col = kindColor(loc.kind);
            const flw = stats.flowering.length;
            return (
              <div key={loc.id} style={{ position: 'absolute', left: `${loc.x}%`, top: `${loc.y}%`, width: `${loc.w}%`, height: `${loc.h}%`,
                background: `${col}26`, border: `1.2px solid ${col}`, borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                {flw > 0 && (
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--rose)', boxShadow: '0 0 0 2px rgba(255,255,255,0.7)' }} />
                )}
              </div>
            );
          })}
        </div>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 8, fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--rose)' }} />in flower</span>
        <span>·</span>
        <span>{BL.locations.length} locations</span>
      </div>
    </div>
  );
}

// ─────────────── Calendar mini ───────────────
function CalendarWidget({ go }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthSeason = { Jan: 0, Feb: 0, Mar: 0, Apr: 1, May: 7, Jun: 2, Jul: 0, Aug: 0, Sep: 0, Oct: 1, Nov: 0, Dec: 0 };
  const today = 4;
  return (
    <div>
      <WidgetHeader title="Bloom calendar" action={<WidgetLink onClick={() => go('calendar')}>Open</WidgetLink>} />
      <button onClick={() => go('calendar')} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            {months.map((m, i) => {
              const count = monthSeason[m] || 0;
              const isNow = i === today;
              return (
                <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isNow ? 'var(--accent)' : 'var(--ink-4)', letterSpacing: 0.3 }}>{m[0]}</div>
                  <div style={{ width: '100%', height: 42, borderRadius: 6,
                    background: count ? `linear-gradient(to top, var(--accent) ${Math.min(count * 12, 92)}%, var(--accent-bg) ${Math.min(count * 12, 92)}%, var(--accent-bg) 100%)` : 'var(--surface-2)',
                    border: isNow ? '1.5px solid var(--accent-2)' : '1px solid var(--line)' }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: count ? 'var(--ink-2)' : 'var(--ink-5)' }}>{count || '–'}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{monthSeason.May} cultivars</span> in flower this month
          </div>
        </div>
      </button>
    </div>
  );
}

// ─────────────── Empty hint ───────────────
function EmptyHint({ icon, title, body }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--surface)', borderRadius: 14, border: '1.5px dashed var(--line-2)', display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} stroke="var(--ink-4)" sw={1.9} />
      </span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{body}</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CustomizeDashboardScreen — Settings → Customize your home
// ════════════════════════════════════════════════════════════
function CustomizeDashboardScreen({ go, widgets, setWidgets, toast }) {
  const [list, setList] = useStateD(widgets);

  const has = (id) => list.includes(id);
  const toggle = (id) => {
    setList(l => l.includes(id) ? l.filter(x => x !== id) : [...l, id]);
  };
  const move = (id, dir) => {
    setList(l => {
      const i = l.indexOf(id); if (i < 0) return l;
      const j = i + dir; if (j < 0 || j >= l.length) return l;
      const next = l.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const save = () => { setWidgets(list); toast('Dashboard updated'); go(-1); };
  const reset = () => { setList(BL.DEFAULT_WIDGETS); toast('Reset to recommended'); };

  // sort: included widgets in user order, then unincluded (catalog order)
  const ordered = [
    ...list.map(id => BL.WIDGETS.find(w => w.id === id)).filter(Boolean),
    ...BL.WIDGETS.filter(w => !list.includes(w.id)),
  ];

  return (
    <div>
      {/* header */}
      <div style={{ padding: '10px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1 }}>
          <div className="h-display" style={{ fontSize: 21, color: 'var(--ink)', lineHeight: 1.1 }}>Customize home</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{list.length} {list.length === 1 ? 'widget' : 'widgets'}</div>
        </div>
        <button onClick={save} style={{ ...blBtnReset, cursor: 'pointer', padding: '8px 14px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13.5, fontWeight: 600 }}>Save</button>
      </div>

      <div style={{ padding: '14px 18px 28px' }}>
        <SectionLabel>Tap to toggle · arrows to reorder</SectionLabel>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '4px 12px', boxShadow: 'var(--shadow-sm)', marginBottom: 18 }}>
          {ordered.map((def, i, a) => {
            const enabled = has(def.id);
            const idxInList = list.indexOf(def.id);
            return (
              <div key={def.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: enabled ? 'var(--accent-bg)' : 'var(--surface-2)', border: '1px solid ' + (enabled ? 'var(--accent-line)' : 'var(--line)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={def.icon} size={19} stroke={enabled ? 'var(--accent)' : 'var(--ink-4)'} sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: enabled ? 'var(--ink)' : 'var(--ink-2)' }}>{def.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{def.sub}</div>
                </div>
                {enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginRight: 4 }}>
                    <button onClick={() => move(def.id, -1)} disabled={idxInList === 0} style={{ ...blBtnReset, cursor: idxInList === 0 ? 'default' : 'pointer', opacity: idxInList === 0 ? 0.3 : 1, width: 24, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Move up">
                      <svg width="11" height="7" viewBox="0 0 11 7"><path d="M1 6 L5.5 1 L10 6" fill="none" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button onClick={() => move(def.id, 1)} disabled={idxInList === list.length - 1} style={{ ...blBtnReset, cursor: idxInList === list.length - 1 ? 'default' : 'pointer', opacity: idxInList === list.length - 1 ? 0.3 : 1, width: 24, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Move down">
                      <svg width="11" height="7" viewBox="0 0 11 7"><path d="M1 1 L5.5 6 L10 1" fill="none" stroke="var(--ink-2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>
                )}
                <Toggle on={enabled} onClick={() => toggle(def.id)} />
              </div>
            );
          })}
        </div>

        <button onClick={reset} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', padding: 13, borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink-2)', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          Reset to recommended
        </button>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center', lineHeight: 1.5 }}>
          Your home dashboard updates instantly.
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...blBtnReset, cursor: disabled ? 'not-allowed' : 'pointer',
      width: 44, height: 26, borderRadius: 999,
      background: on && !disabled ? 'var(--accent)' : 'var(--line-2)',
      position: 'relative', flexShrink: 0, opacity: disabled ? 0.4 : 1, transition: 'background .15s' }}>
      <span style={{ position: 'absolute', top: 3, left: on && !disabled ? 21 : 3, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .15s' }} />
    </button>
  );
}

Object.assign(window, { WidgetDashboard, CustomizeDashboardScreen });
