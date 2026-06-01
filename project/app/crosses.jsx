// crosses.jsx — Pod & Pollen breeding programme view + seedling comparison
// Exports: CrossesScreen, CrossDetailScreen, CompareScreen
const { useState: useStateX, useMemo: useMemoX } = React;

// ════════════════════════════════════════════════════════════
// CROSSES — top-level breeding programme list
// ════════════════════════════════════════════════════════════
// ────────────────────────────────────────────────────────────
// Record New Cross opens RecordPollinationFlow, NOT AddIris
// (the brief calls this out specifically — used to be wired to AddIris)
function CrossesScreen({ go, wide, openNewCross, openAdd }) {
  const [filter, setFilter] = useStateX('All');
  const all = BL.crossesList();
  const stats = useMemoX(() => {
    const total = all.length;
    const active = all.filter(c => c.status !== 'Archived').length;
    const seedlings = BL.irises.filter(i => i.kind === 'Seedling').length;
    const candidates = BL.irises.filter(i => {
      const e = BL.latestEval(i.id); return e && (e.outcome === 'Name candidate' || e.outcome === 'Registered');
    }).length;
    return { total, active, seedlings, candidates };
  }, [all]);

  const filters = ['All', 'Active', 'Sown', 'Growing on', 'Evaluating', 'Archived'];
  let list = all;
  if (filter === 'Active') list = list.filter(c => c.status !== 'Archived');
  else if (filter !== 'All') list = list.filter(c => c.status === filter);

  return (
    <div style={pageWrapX}>
      {/* programme summary card */}
      <div style={{ background: 'var(--ink)', borderRadius: 22, padding: '18px 18px 16px', marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(95,122,82,0.35), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, position: 'relative' }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="dna" size={18} stroke="#fff" sw={1.9} />
          </span>
          <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 17, color: '#fff', letterSpacing: 0.1 }}>Programme at a glance</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, position: 'relative' }}>
          {[
            { n: stats.total, l: 'Crosses' },
            { n: stats.active, l: 'Active' },
            { n: stats.seedlings, l: 'Seedlings' },
            { n: stats.candidates, l: 'Candidates' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: '#fff', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.62)', marginTop: 5, fontWeight: 500, letterSpacing: 0.3, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -18px 14px', padding: '2px 18px', scrollbarWidth: 'none' }}>
        {filters.map(f => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
      </div>

      <div style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{list.length} {list.length === 1 ? 'cross' : 'crosses'}</div>

      {/* cross cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {list.map(x => <CrossCard key={x.id} cross={x} go={go} wide={wide} />)}
      </div>

      {/* record new cross */}
      <button onClick={() => openNewCross && openNewCross()} style={{ ...blBtnReset, cursor: 'pointer', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, background: 'var(--surface)', borderRadius: 16, border: '1.5px dashed var(--line-2)', color: 'var(--accent)', fontWeight: 600, fontSize: 15 }}>
          <Icon name="droplet" size={20} stroke="var(--accent)" sw={2.1} />Record a new cross
        </div>
      </button>
    </div>
  );
}

function CrossCard({ cross, go, wide }) {
  const s = BL.crossStats(cross.id);
  const podIris = BL.irises.find(i => i.name === cross.pod);
  const polIris = BL.irises.find(i => i.name === cross.pollen);
  const statusMap = {
    'Sown': { c: 'amber', icon: 'seed' },
    'Growing on': { c: 'green', icon: 'sprout' },
    'Evaluating': { c: 'rose', icon: 'star' },
    'Archived': { c: 'clay', icon: 'tag' },
  };
  const st = statusMap[cross.status] || statusMap.Evaluating;

  return (
    <button onClick={() => go('crossDetail', { id: cross.id })} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {/* top meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 0' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--accent)', textTransform: 'uppercase' }}>{cross.code}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--ink-5)' }} />
          <span style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 500 }}>{cross.season}</span>
          <span style={{ flex: 1 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px 3px 7px', borderRadius: 999,
            background: `var(--${st.c}-bg)`, color: `var(--${st.c})`, border: `1px solid var(--${st.c}-line)`,
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', flexShrink: 0 }}>
            <Icon name={st.icon} size={11} stroke={`var(--${st.c})`} sw={2.1} />{cross.status}
          </span>
        </div>

        {/* parents row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 12px' }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            {podIris ? <IrisThumb iris={podIris} r={11} /> : <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-2)' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pod</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cross.pod}</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="x" size={13} stroke="var(--accent)" sw={2.4} />
          </div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2, textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pollen</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cross.pollen}</div>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 11, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
            {polIris ? <IrisThumb iris={polIris} r={11} /> : <div style={{ position: 'absolute', inset: 0, background: 'var(--surface-2)' }} />}
          </div>
        </div>

        {/* goal */}
        {cross.goal && (
          <div style={{ padding: '0 14px 12px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <Icon name="star" size={13} stroke="var(--ink-4)" sw={1.9} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontStyle: 'italic' }}>{cross.goal}</span>
          </div>
        )}

        {/* funnel */}
        <CrossFunnel s={s} />
      </div>
    </button>
  );
}

// ── Funnel: seeds → germinated → seedlings → flowered → retained ──
function CrossFunnel({ s }) {
  const steps = [
    { l: 'Seeds', n: s.seeds, icon: 'seed' },
    { l: 'Germ.', n: s.germinated, icon: 'sprout' },
    { l: 'Growing', n: s.growing, icon: 'leaf' },
    { l: 'Flowered', n: s.flowered, icon: 'flower' },
    { l: 'Retained', n: s.retained, icon: 'star' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, padding: '0 12px 14px' }}>
      {steps.map((st, i) => {
        const active = st.n > 0;
        return (
          <div key={i} style={{ padding: '7px 2px', borderRadius: 10,
            background: active ? 'var(--accent-bg)' : 'var(--surface-2)',
            border: '1px solid ' + (active ? 'var(--accent-line)' : 'var(--line)'),
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            opacity: active ? 1 : 0.55 }}>
            <Icon name={st.icon} size={13} stroke={active ? 'var(--accent)' : 'var(--ink-4)'} sw={1.9} />
            <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16, color: active ? 'var(--ink)' : 'var(--ink-4)', lineHeight: 1.1 }}>{st.n}</div>
            <div style={{ fontSize: 9, color: active ? 'var(--ink-3)' : 'var(--ink-4)', fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>{st.l}</div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CROSS DETAIL — parents, seedlings from this cross, compare
// ════════════════════════════════════════════════════════════
function CrossDetailScreen({ id, go, wide, openPollination, openAddSeedling }) {
  const cross = BL.crosses[id]; if (!cross) return null;
  const s = BL.crossStats(id);
  const podIris = BL.irises.find(i => i.name === cross.pod);
  const polIris = BL.irises.find(i => i.name === cross.pollen);
  const sibs = s.sibs;
  const batch = s.b;

  return (
    <div>
      {/* hero */}
      <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: 'linear-gradient(135deg, #1f2a1c 0%, #2c3a25 60%, #1a2316 100%)' }}>
        {/* soft blurred bloom bg from both parents */}
        {podIris && (
          <div style={{ position: 'absolute', left: '-12%', top: '-20%', width: '65%', height: '160%', opacity: 0.4, filter: 'blur(30px)' }}>
            <IrisThumb iris={podIris} r={0} />
          </div>
        )}
        {polIris && (
          <div style={{ position: 'absolute', right: '-12%', top: '-20%', width: '65%', height: '160%', opacity: 0.4, filter: 'blur(30px)' }}>
            <IrisThumb iris={polIris} r={0} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,18,12,0.78) 0%, rgba(15,18,12,0.2) 50%, rgba(15,18,12,0.4) 100%)' }} />

        <button onClick={() => go(-1)} style={{ ...blBtnReset, position: 'absolute', top: 14, left: 14, cursor: 'pointer', zIndex: 25 }} aria-label="Back">
          <span style={glassRoundX}><Icon name="back" size={22} stroke="#fff" /></span>
        </button>

        {/* code stripe at top */}
        <div style={{ position: 'absolute', top: 18, left: 0, right: 0, zIndex: 15, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, opacity: 0.78, textTransform: 'uppercase' }}>{cross.code}  ·  {cross.season}</div>
        </div>

        {/* parent lineage */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '38px 16px 70px', zIndex: 10 }}>
          <ParentThumb iris={podIris} role="Pod parent" go={go} />
          <div style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(255,255,255,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 -6px 28px', zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            <Icon name="x" size={19} stroke="var(--accent)" sw={2.4} />
          </div>
          <ParentThumb iris={polIris} role="Pollen parent" go={go} />
        </div>

        {/* title stripe at bottom */}
        <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, zIndex: 15, color: '#fff', textAlign: 'center' }}>
          <div className="h-display" style={{ fontSize: 20, color: '#fff', lineHeight: 1.15, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>{cross.pod} × {cross.pollen}</div>
        </div>
      </div>

      <div style={{ ...pageWrapX, paddingTop: 18 }}>
        {/* goal */}
        {cross.goal && (
          <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 16, padding: '13px 15px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <Icon name="star" size={18} stroke="var(--accent)" sw={1.9} style={{ marginTop: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: 'var(--accent)', textTransform: 'uppercase' }}>Goal</div>
              <div style={{ fontSize: 14.5, color: 'var(--ink)', marginTop: 3, fontStyle: 'italic', lineHeight: 1.4 }}>{cross.goal}</div>
            </div>
          </div>
        )}

        {/* funnel */}
        <SectionLabel>Yield</SectionLabel>
        <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', marginBottom: 20, paddingTop: 12 }}>
          <CrossFunnel s={s} />
        </div>

        {/* batch detail */}
        {batch && (
          <>
            <SectionLabel>Pod</SectionLabel>
            <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', padding: '2px 16px 8px', marginBottom: 22 }}>
              <FieldRow l="Cross date" v={cross.date} />
              <FieldRow l="Pod harvested" v={batch.harvest} />
              <FieldRow l="Seeds" v={batch.seeds} />
              <FieldRow l="Treatment" v={batch.treatment} />
              <FieldRow l="Sown" v={batch.sown} />
              <FieldRow l="Germinated" v={batch.germ === 'pending' ? 'Awaiting germination' : `${batch.germinated}/${batch.seeds} (${batch.germPct}%) · ${batch.germ}`} />
              {batch.plantedOut && <FieldRow l="Planted out" v={batch.plantedOut} />}
            </div>
          </>
        )}

        {/* seedlings from this cross */}
        {(sibs.length > 0 || true) && (
          <>
            <SectionLabel action={
              sibs.length >= 2 ? <TextLinkX onClick={() => go('compare', { ids: sibs.map(i => i.id) })}>Compare</TextLinkX> : null
            }>Seedlings from this cross<span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)', marginLeft: 7 }}> · {sibs.length}</span></SectionLabel>
            {sibs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(3,1fr)' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                {sibs.map(iris => (
                  <button key={iris.id} onClick={() => go('detail', { id: iris.id })} style={{ ...blBtnReset, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ background: 'var(--surface)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                        <IrisThumb iris={iris} r={0} />
                        {iris.fav && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 999, background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="star" size={14} stroke="var(--accent)" fill="var(--accent)" sw={1.5} />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '9px 11px 11px' }}>
                        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 14.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
                        <div style={{ marginTop: 5 }}><StatusBadge status={iris.status} /></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => openAddSeedling && openAddSeedling(cross)} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1.5px dashed var(--line-2)', color: 'var(--accent)', fontWeight: 600, fontSize: 14.5 }}>
                <Icon name="plus" size={19} stroke="var(--accent)" sw={2.1} />Add seedling from this cross
              </div>
            </button>
          </>
        )}

        {/* notes */}
        {cross.notes && (
          <>
            <SectionLabel>Cross notes</SectionLabel>
            <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: 14, marginBottom: 24, boxShadow: 'var(--shadow-sm)', fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              {cross.notes}
            </div>
          </>
        )}

        {/* repeat the cross */}
        {podIris && polIris && cross.status !== 'Archived' && (
          <button onClick={() => openPollination && openPollination(podIris)} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'var(--accent-bg)', borderRadius: 14, border: '1px solid var(--accent-line)', color: 'var(--accent)', fontWeight: 600, fontSize: 15 }}>
              <Icon name="droplet" size={19} stroke="var(--accent)" sw={2} />Repeat this cross
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

function ParentThumb({ iris, role, go }) {
  return (
    <button onClick={() => iris && go('detail', { id: iris.id })} disabled={!iris} style={{ ...blBtnReset, cursor: iris ? 'pointer' : 'default', textAlign: 'center', flex: 1 }}>
      <div style={{ width: 96, height: 96, borderRadius: 16, overflow: 'hidden', margin: '0 auto', position: 'relative', border: '3px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}>
        {iris ? <IrisThumb iris={iris} r={0} /> : <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)' }} />}
      </div>
      <div style={{ marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{role}</div>
      <div style={{ marginTop: 2, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 13.5, color: '#fff', lineHeight: 1.15, padding: '0 4px' }}>{iris ? iris.name : '—'}</div>
    </button>
  );
}

function FieldRow({ l, v }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.2, flexShrink: 0 }}>{l}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', textAlign: 'right', lineHeight: 1.4 }}>{v}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// COMPARE — side-by-side seedling comparison
// ════════════════════════════════════════════════════════════
function CompareScreen({ ids, go, wide }) {
  const [selected, setSelected] = useStateX(ids || []);
  const irises = selected.map(id => BL.byId(id)).filter(Boolean);
  const [pickerOpen, setPickerOpen] = useStateX(false);

  // Build comparison rows
  const evalKeys = ['vigor', 'stem', 'branching', 'colour', 'form', 'substance', 'distinct', 'appeal'];
  const labelFor = (k) => {
    for (const g of BL.EVAL_GROUPS) for (const it of g.items) if (it.k === k) return it.label;
    return k;
  };

  const remove = (id) => setSelected(s => s.filter(x => x !== id));
  const add = (id) => { if (!selected.includes(id)) setSelected(s => [...s, id]); setPickerOpen(false); };

  return (
    <div>
      {/* header */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: 'var(--ink)', lineHeight: 1.1 }}>Compare seedlings</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{irises.length} selected</div>
        </div>
        <button onClick={() => setPickerOpen(true)} style={{ ...blBtnReset, cursor: 'pointer', padding: '8px 14px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px var(--accent-shadow)' }}>
          <Icon name="plus" size={17} stroke="#fff" sw={2.2} />Add
        </button>
      </div>

      {/* horizontal scrolling columns */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', padding: '14px 16px 22px' }}>
        {irises.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>
            <Icon name="dna" size={36} stroke="var(--ink-4)" />
            <div style={{ marginTop: 10, fontWeight: 600, color: 'var(--ink-2)' }}>Nothing to compare yet</div>
            <div style={{ fontSize: 13.5, marginTop: 4 }}>Add seedlings to compare side-by-side.</div>
          </div>
        ) : (() => {
          // Define rows with consistent heights so labels & values align
          const rows = [
            { head: true, label: 'Status' },
            { key: 'status' },
            { key: 'location' },
            { head: true, label: 'Avg score' },
            { key: 'avg', h: 50 },
            ...evalKeys.map(k => ({ key: 'score:' + k, scoreKey: k, label: labelFor(k) })),
            { head: true, label: 'Outcome' },
            { key: 'outcome' },
            { key: 'parents', h: 42 },
          ];
          const renderCell = (iris, row) => {
            const e = BL.latestEval(iris.id);
            const scores = e ? e.scores : {};
            if (row.head) return null;
            if (row.key === 'status') return <StatusBadge status={iris.status} />;
            if (row.key === 'location') return <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{iris.loc}</span>;
            if (row.key === 'avg') return e
              ? <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: 'var(--accent)', lineHeight: 1 }}>{BL.evalAverage(scores).toFixed(1)}<span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}> /5</span></span>
              : <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>Not evaluated</span>;
            if (row.scoreKey) return e && scores[row.scoreKey] != null
              ? <ScoreBar v={scores[row.scoreKey]} />
              : <span style={{ fontSize: 12, color: 'var(--ink-5)' }}>—</span>;
            if (row.key === 'outcome') return e
              ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-line)', padding: '3px 9px', borderRadius: 999 }}>{e.outcome}</span>
              : <span style={{ fontSize: 12.5, color: 'var(--ink-5)' }}>—</span>;
            if (row.key === 'parents') return <div style={{ fontSize: 11.5, color: 'var(--ink-2)', lineHeight: 1.35, whiteSpace: 'normal' }}>{iris.podParent} × {iris.pollenParent}</div>;
            return null;
          };

          return (
            <div style={{ display: 'inline-flex', gap: 10, minWidth: '100%', alignItems: 'flex-start' }}>
              {/* labels column */}
              <div style={{ width: 110, flexShrink: 0, paddingTop: 196 }}>
                {rows.map((row, i) => (
                  <CompareRow key={i} h={row.h} head={row.head}>
                    {row.head ? row.label : (row.label || '')}
                  </CompareRow>
                ))}
              </div>
              {/* iris columns */}
              {irises.map(iris => (
                <div key={iris.id} style={{ width: 154, flexShrink: 0, background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => go('detail', { id: iris.id })} style={{ ...blBtnReset, cursor: 'pointer', width: '100%' }}>
                      <div style={{ width: '100%', height: 140, position: 'relative' }}><IrisThumb iris={iris} r={0} /></div>
                    </button>
                    <button onClick={() => remove(iris.id)} style={{ ...blBtnReset, position: 'absolute', top: 7, right: 7, cursor: 'pointer', width: 26, height: 26, borderRadius: 999, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove">
                      <Icon name="x" size={15} stroke="#fff" sw={2.4} />
                    </button>
                  </div>
                  <div style={{ padding: '10px 11px 4px' }}>
                    <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
                  </div>
                  <div style={{ padding: '0 11px 12px' }}>
                    {rows.map((row, i) => (
                      <CompareRow key={i} h={row.h} head={row.head}>
                        {renderCell(iris, row)}
                      </CompareRow>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* add picker */}
      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Add to comparison">
        <div style={{ padding: '12px 18px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BL.irises.filter(i => i.kind === 'Seedling' && !selected.includes(i.id)).map(iris => (
            <button key={iris.id} onClick={() => add(iris.id)} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
                <div style={{ width: 50, height: 50, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={10} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 15.5, color: 'var(--ink)' }}>{iris.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{iris.status} · {iris.podParent} × {iris.pollenParent}</div>
                </div>
                <Icon name="plus" size={20} stroke="var(--accent)" sw={2.2} />
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

function CompareRow({ children, head, h = 32 }) {
  if (head) {
    return (
      <div style={{ height: 34, display: 'flex', alignItems: 'flex-end', paddingBottom: 6, marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{children}</span>
      </div>
    );
  }
  return (
    <div style={{ height: h, display: 'flex', alignItems: 'center', fontSize: 12.5, color: 'var(--ink-3)' }}>{children}</div>
  );
}
function ScoreBar({ v }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden', border: '1px solid var(--line)' }}>
        <div style={{ height: '100%', width: `${(v / 5) * 100}%`, background: 'var(--accent)' }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-2)', minWidth: 18, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function TextLinkX({ children, onClick }) {
  return <button onClick={onClick} style={{ ...blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontSize: 14.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="sliders" size={15} stroke="var(--accent)" sw={2} />{children}</button>;
}

const pageWrapX = { padding: '12px 18px 20px' };
const glassRoundX = { width: 40, height: 40, borderRadius: 999, background: 'rgba(30,18,46,0.42)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.18)' };

Object.assign(window, { CrossesScreen, CrossDetailScreen, CompareScreen });
