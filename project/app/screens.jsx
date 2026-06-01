// screens.jsx — Pod & Pollen screens
// Exports: HomeScreen, CollectionScreen, IrisDetailScreen, GardenScreen, SearchScreen, GardenDetailScreen
const { useState: useStateS } = React;

// Persisted state: remembers value across navigation/reload via localStorage
function usePersistedStateS(key, initial) {
  const [v, setV] = useStateS(() => {
    try { const s = localStorage.getItem(key); return s != null ? JSON.parse(s) : initial; } catch (e) { return initial; }
  });
  const setPersisted = (next) => {
    setV(next);
    try { localStorage.setItem(key, JSON.stringify(typeof next === 'function' ? next(v) : next)); } catch (e) {}
  };
  return [v, setPersisted];
}

// ════════════════════════════════════════════════════════════
// HOME — widget-composed dashboard
// ════════════════════════════════════════════════════════════
function HomeScreen({ go, wide, widgets, openAdd, openNote, openPhoto }) {
  const greeting = (() => {
    const h = 9; return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <div style={pageWrap}>
      {/* greeting */}
      <div style={{ padding: '14px 2px 22px' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 14, height: 1.5, background: 'var(--accent)' }} />Saturday 31 May
        </div>
        <div className="h-display" style={{ fontSize: 30, color: 'var(--ink)', marginTop: 10, lineHeight: 1.05 }}>
          {greeting}, <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>{BL.user.firstName}</span>
        </div>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 6, fontWeight: 500 }}>
          What's blooming today?
        </div>
      </div>

      <WidgetDashboard widgets={widgets || BL.DEFAULT_WIDGETS}
        go={go} wide={wide} openAdd={openAdd} openNote={openNote} openPhoto={openPhoto} />

      {/* customize footer link */}
      <button onClick={() => go('customize')} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', marginTop: 28, padding: 13, borderRadius: 14, background: 'transparent', border: '1.5px dashed var(--line-2)', color: 'var(--ink-3)', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <Icon name="sliders" size={17} stroke="var(--ink-3)" sw={1.9} />Customize home
      </button>
    </div>
  );
}

function TextLink({ children, onClick }) {
  return <button onClick={onClick} style={{ ...blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontSize: 14.5, fontWeight: 600 }}>{children}</button>;
}

// ════════════════════════════════════════════════════════════
// COLLECTION
// ════════════════════════════════════════════════════════════
function CollectionScreen({ go, wide, openAdd, params }) {
  const [filter, setFilter] = useStateS('All');
  const [view, setView] = usePersistedStateS('bl_view_collection', 'grid');
  const crossFilter = params && params.cross;
  const filters = ['All', 'In flower', 'Varieties', 'Seedlings', 'Favourites'];
  let list = BL.irises;
  if (crossFilter) list = list.filter(i => i.cross === crossFilter);
  if (filter === 'In flower') list = list.filter(i => i.status === 'Flowering' || i.status === 'First flower');
  else if (filter === 'Varieties') list = list.filter(i => i.kind === 'Variety');
  else if (filter === 'Seedlings') list = list.filter(i => i.kind === 'Seedling');
  else if (filter === 'Favourites') list = list.filter(i => i.fav);

  if (BL.irises.length === 0) return <EmptyCollection openAdd={openAdd} />;

  const crossLabel = crossFilter && BL.crosses[crossFilter]
    ? `${BL.crosses[crossFilter].pod} × ${BL.crosses[crossFilter].pollen}` : null;

  return (
    <div style={pageWrap}>
      {crossLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '10px 14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 14 }}>
          <Icon name="dna" size={18} stroke="var(--accent)" sw={1.9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, color: 'var(--accent)', textTransform: 'uppercase' }}>Siblings from cross</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{crossLabel}</div>
          </div>
          <button onClick={() => go('collection')} style={{ ...blBtnReset, cursor: 'pointer' }}><Icon name="x" size={20} stroke="var(--accent)" sw={2} /></button>
        </div>
      )}
      <button onClick={() => go('search')} style={{ ...blBtnReset, width: '100%', cursor: 'pointer', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
          <Icon name="search" size={20} stroke="var(--ink-4)" />
          <span style={{ color: 'var(--ink-4)', fontSize: 15.5 }}>Search names, codes, parents…</span>
        </div>
      </button>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -18px 14px', padding: '2px 18px', scrollbarWidth: 'none' }}>
        {filters.map(f => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>{list.length} {list.length === 1 ? 'plant' : 'plants'}</span>
        <div style={{ width: 132 }}>
          <Segmented value={view} onChange={setView} options={[{ v: 'grid', icon: 'grid' }, { v: 'list', icon: 'list' }]} />
        </div>
      </div>
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(4,1fr)' : '1fr 1fr', gap: 13 }}>
          {list.map(iris => <IrisCard key={iris.id} iris={iris} onClick={() => go('detail', { id: iris.id })} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// IRIS DETAIL — lifecycle is the hero
// ════════════════════════════════════════════════════════════
function IrisDetailScreen({ id, go, wide, openNote, openPhoto, openStage, openEval, openEvalHistory, openFlowering, openPollination, openPhotoViewer, toast }) {
  const iris = BL.byId(id);
  const [adv, setAdv] = useStateS(false);
  const [fav, setFav] = useStateS(!!iris.fav);
  if (!iris) return null;
  const isSeedling = iris.kind === 'Seedling';
  const evalRec = BL.latestEval(iris.id);
  const evalHistory = BL.evalHistoryAvgs(iris.id);
  const siblings = BL.siblingsOf(iris);
  // Crosses where this plant is a parent + seedlings produced from them
  const childCrosses = Object.values(BL.crosses).filter(c => c.pod === iris.name || c.pollen === iris.name);
  const childSeedlings = childCrosses.flatMap(c => BL.irises.filter(i => i.cross === c.id));

  // Scroll the scroll container to top whenever we navigate into a different iris.
  React.useEffect(() => {
    const scroller = document.querySelector('.bl-scroll');
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'instant' });
  }, [iris && iris.id]);

  const quick = isSeedling
    ? [
        { icon: 'camera', label: 'Add photo',  onClick: () => openPhoto(iris) },
        { icon: 'note',   label: 'Add note',   onClick: () => openNote(iris) },
        { icon: 'flower', label: 'Flowering',  onClick: () => openFlowering(iris) },
        { icon: 'star',   label: 'Evaluate',   onClick: () => openEval(iris), accent: !evalRec },
      ]
    : [
        { icon: 'camera',  label: 'Add photo',  onClick: () => openPhoto(iris) },
        { icon: 'note',    label: 'Add note',   onClick: () => openNote(iris) },
        { icon: 'flower',  label: 'Flowering',  onClick: () => openFlowering(iris) },
        { icon: 'droplet', label: 'Pollinate',  onClick: () => openPollination(iris) },
      ];

  return (
    <div>
      {/* sticky back bar — always visible on detail */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(245,242,234,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Icon name="back" size={20} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1, minWidth: 0, padding: '0 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFav(!fav)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Favourite">
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Icon name="star" size={18} stroke="var(--ink)" fill={fav ? 'var(--ink)' : 'none'} sw={1.8} /></span>
          </button>
          <button style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="More">
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}><Icon name="more" size={20} stroke="var(--ink)" /></span>
          </button>
        </div>
      </div>

      {/* hero */}
      <div style={{ position: 'relative', width: '100%', height: wide ? 460 : 340, overflow: 'hidden', marginTop: -59 /* pull under sticky bar */ }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}><IrisThumb iris={iris} r={0} /></div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: 'linear-gradient(to top, rgba(15,8,25,0.82) 0%, rgba(15,8,25,0.32) 38%, transparent 56%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 15, background: 'linear-gradient(to bottom, rgba(15,8,25,0.55) 0%, transparent 25%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: wide ? 32 : 18, bottom: wide ? 28 : 18, right: wide ? 32 : 18, zIndex: 25, maxWidth: wide ? 720 : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            {iris.kind === 'Seedling' && <SeedlingTag light />}
            <StatusBadge status={iris.status} />
          </div>
          <div className="h-display" style={{ fontSize: wide ? 52 : 38, color: '#fff', lineHeight: 0.98, textShadow: '0 2px 14px rgba(0,0,0,0.5)', letterSpacing: -0.02 }}>{iris.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.86)', fontSize: wide ? 15 : 13.5, marginTop: 7, letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span>{iris.cls}</span>
            <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.4)' }} />
            <span>{iris.loc}</span>
            {iris.bed && <>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.4)' }} />
              <span>{iris.bed}</span>
            </>}
          </div>
        </div>
      </div>

      <div style={{ ...pageWrap, paddingTop: 16 }}>
        {/* quick actions */}
        <div style={{ display: 'flex', gap: 9, marginBottom: 22 }}>
          {quick.map((q, i) => <ActionRow key={i} {...q} />)}
        </div>

        {/* LIFECYCLE — hero section */}
        <div style={{ background: 'var(--surface)', borderRadius: 22, border: '1px solid var(--line)', padding: '20px 18px 12px', marginBottom: 26, boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-bg), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="dna" size={18} stroke="var(--accent)" sw={1.9} />
            </span>
            <div>
              <div className="h-display" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>Breeding lifecycle</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500, letterSpacing: 0.3, marginTop: 3 }}>{isSeedling ? 'Cross → seedling → first flower → evaluation' : 'Established variety'}</div>
            </div>
          </div>
          <LifecycleRail iris={iris} onStage={(s) => openStage(iris, s)} />
        </div>

        {/* parentage */}
        <SectionLabel>Parentage</SectionLabel>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '4px 14px', marginBottom: 22, boxShadow: 'var(--shadow-sm)' }}>
          <ParentRow role="Pod parent" name={iris.podParent} go={go} />
          <ParentRow role="Pollen parent" name={iris.pollenParent} go={go} isLast />
        </div>

        {/* siblings (seedlings only) */}
        {isSeedling && siblings.length > 0 && (
          <>
            <SectionLabel action={<TextLink onClick={() => go('collection', { cross: iris.cross })}>See all {siblings.length + 1}</TextLink>}>Seedlings from this cross</SectionLabel>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -18px 22px', padding: '2px 18px 6px', scrollbarWidth: 'none' }}>
              {siblings.map(s => <SiblingCard key={s.id} iris={s} onClick={() => go('detail', { id: s.id })} />)}
            </div>
          </>
        )}

        {/* Crosses this plant has been used in (varieties + seedlings that have been bred from) */}
        {childCrosses.length > 0 && (
          <>
            <SectionLabel>Crosses with this plant<span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)', marginLeft: 7 }}> · {childCrosses.length}</span></SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: childSeedlings.length ? 14 : 22 }}>
              {childCrosses.map(c => {
                const role = c.pod === iris.name ? 'Pod parent' : 'Pollen parent';
                const partner = c.pod === iris.name ? c.pollen : c.pod;
                const sibs = BL.irises.filter(i => i.cross === c.id);
                return (
                  <button key={c.id} onClick={() => go('crossDetail', { id: c.id })} style={{ ...blBtnReset, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="dna" size={19} stroke="var(--accent)" sw={1.9} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 15.5, color: 'var(--ink)' }}>{c.code}</span>
                          <span style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600, padding: '2px 8px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 999 }}>{role}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.35 }}>
                          × {partner}<span style={{ color: 'var(--ink-3)' }}> · {sibs.length} seedling{sibs.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                      <Icon name="chevron" size={18} stroke="var(--ink-4)" />
                    </div>
                  </button>
                );
              })}
            </div>
            {childSeedlings.length > 0 && (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-3)', textTransform: 'uppercase', margin: '0 4px 9px' }}>Seedlings produced</div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', margin: '0 -18px 22px', padding: '2px 18px 6px', scrollbarWidth: 'none' }}>
                  {childSeedlings.map(s => <SiblingCard key={s.id} iris={s} onClick={() => go('detail', { id: s.id })} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* evaluation summary (seedlings with eval) */}
        {isSeedling && evalRec && (
          <>
            <SectionLabel action={<TextLink onClick={() => openEvalHistory(iris)}>View history</TextLink>}>Latest evaluation</SectionLabel>
            <button onClick={() => openEvalHistory(iris)} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 22 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 30, color: 'var(--accent)', lineHeight: 1 }}>{BL.evalAverage(evalRec.scores).toFixed(1)}</span>
                      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>/ 5 avg</span>
                      {evalHistory.length > 1 && (() => {
                        const prev = evalHistory[evalHistory.length - 2];
                        const cur = evalHistory[evalHistory.length - 1];
                        const delta = cur.avg - prev.avg;
                        if (Math.abs(delta) < 0.05) return null;
                        const up = delta > 0;
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: up ? 'var(--green)' : 'var(--rose)', marginLeft: 2 }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: up ? 'none' : 'rotate(180deg)' }}><path d="M6 2 L10 8 L8 8 L8 10 L4 10 L4 8 L2 8 Z" fill={up ? 'var(--green)' : 'var(--rose)'} /></svg>
                            {up ? '+' : ''}{delta.toFixed(1)}
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>
                      Evaluated {evalRec.date}{evalHistory.length > 1 && ` · ${evalHistory.length} years tracked`}
                    </div>
                  </div>
                  <span style={{ padding: '5px 12px', borderRadius: 999, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-line)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{evalRec.outcome}</span>
                </div>
                {/* sparkline (multi-year) */}
                {evalHistory.length > 1 && <EvalSparkline history={evalHistory} />}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: evalHistory.length > 1 ? 14 : 0 }}>
                  {topScores(evalRec.scores).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                      <span style={{ color: 'var(--ink-2)' }}>{evalLabel(k)}</span>
                      <RatingDots value={v} size={11} readOnly />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  “{evalRec.notes}”
                </div>
              </div>
            </button>
          </>
        )}

        {/* Flowering history */}
        <FloweringHistoryCard iris={iris} onRecord={() => openFlowering(iris)} />

        {/* Colour definition — appears once the plant has flowered */}
        {(iris.firstEverFlower || iris.firstFlower) && (
          <ColourDefinitionCard iris={iris} />
        )}

        {/* photos */}
        <SectionLabel action={<TextLink onClick={() => openPhoto(iris)}>Add photo</TextLink>}>Photos<span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)', marginLeft: 7 }}> · {iris.photos.length}</span></SectionLabel>
        <div style={{ marginBottom: 22 }}>
          <PhotoStrip photos={iris.photos} onOpen={(list, i) => openPhotoViewer(list, i)} />
        </div>

        {/* details */}
        <SectionLabel>Details</SectionLabel>
        <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', padding: '2px 16px 8px', marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
          <Field label="Colour" value={iris.colour} />
          <Field label="Classification" value={iris.cls} />
          <Field label="Location" value={iris.loc} />
          <Field label="Grid reference" value={iris.bed || '—'} />
          <Field label="Source" value={iris.source} />
          <Field label="Planted" value={iris.planted} />
          {adv && <>
            <Field label="Height" value={iris.height} />
            <Field label="Bloom season" value={iris.season} />
            <Field label="Fragrance" value={iris.fragrance} />
            <Field label="First flowered" value={iris.firstFlower || 'Not yet'} />
          </>}
          <button onClick={() => setAdv(!adv)} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', padding: '13px 0 11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--accent)', fontSize: 14.5, fontWeight: 600 }}>
            {adv ? 'Show less' : 'Show all details'}
            <Icon name="chevron" size={16} stroke="var(--accent)" style={{ transform: adv ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
          </button>
        </div>

        {/* notes */}
        <SectionLabel action={<TextLink onClick={() => openNote(iris)}>Add note</TextLink>}>Notes & observations</SectionLabel>
        <NotesFeed notes={iris.notes} onTapEvaluation={evalRec ? () => openEvalHistory(iris) : null} />
      </div>
    </div>
  );
}

// Filterable notes feed
function NotesFeed({ notes, onTapEvaluation }) {
  const types = ['All', ...Array.from(new Set(notes.map(n => n.t)))];
  const [type, setType] = useStateS('All');
  const list = type === 'All' ? notes : notes.filter(n => n.t === type);
  return (
    <div style={{ marginBottom: 30 }}>
      {types.length > 2 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', margin: '-2px -18px 12px', padding: '2px 18px' }}>
          {types.map(t => (
            <Chip key={t} active={t === type} onClick={() => setType(t)}>
              {t}{t !== 'All' && <span style={{ opacity: 0.55, marginLeft: 2 }}> · {notes.filter(n => n.t === t).length}</span>}
            </Chip>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', padding: '4px 16px', boxShadow: 'var(--shadow-sm)' }}>
        {list.map((n, i) => {
          const isEval = n.t === 'Evaluation' && onTapEvaluation;
          const row = (
            <div style={{ display: 'flex', gap: 12, padding: '13px 0', borderBottom: i < list.length - 1 ? '1px solid var(--line)' : 'none', cursor: isEval ? 'pointer' : 'default' }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon name={noteIcon(n.t)} size={16} stroke="var(--accent)" sw={1.9} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>{n.t}{isEval && <span style={{ marginLeft: 7, fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>→ view history</span>}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{n.d}</span>
                </div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.45, marginTop: 3 }}>{n.x}</div>
              </div>
            </div>
          );
          return isEval
            ? <button key={i} onClick={onTapEvaluation} style={{ ...blBtnReset, cursor: 'pointer', textAlign: 'left', width: '100%' }}>{row}</button>
            : <React.Fragment key={i}>{row}</React.Fragment>;
        })}
        {list.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>No {type.toLowerCase()} notes yet.</div>
        )}
      </div>
    </div>
  );
}

function ParentChip({ role, name, go }) {
  const known = name && name !== 'Unknown';
  const parent = known ? BL.irises.find(i => i.name === name) : null;
  return (
    <button onClick={() => parent && go('detail', { id: parent.id })} disabled={!parent} style={{ ...blBtnReset, flex: 1, cursor: parent ? 'pointer' : 'default', textAlign: 'left' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', padding: 11, display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--surface-2)' }}>
          {parent ? <IrisThumb iris={parent} r={10} /> : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="dna" size={20} stroke="var(--ink-4)" /></div>}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>{role}</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: known ? 'var(--ink)' : 'var(--ink-4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        </div>
      </div>
    </button>
  );
}
function ParentRow({ role, name, go, isLast }) {
  const known = name && name !== 'Unknown';
  const parent = known ? BL.irises.find(i => i.name === name) : null;
  return (
    <button onClick={() => parent && go('detail', { id: parent.id })} disabled={!parent} style={{ ...blBtnReset, width: '100%', textAlign: 'left', cursor: parent ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 2px', borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--surface-2)' }}>
        {parent ? <IrisThumb iris={parent} r={11} /> : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="dna" size={20} stroke="var(--ink-4)" /></div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{role}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: known ? 'var(--ink)' : 'var(--ink-4)', marginTop: 1, lineHeight: 1.25, wordBreak: 'break-word' }}>{name}</div>
      </div>
      {parent && <Icon name="chevron" size={18} stroke="var(--ink-4)" />}
    </button>
  );
}
function topScores(scores) {
  const entries = Object.entries(scores);
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 6);
}
function evalLabel(k) {
  for (const g of BL.EVAL_GROUPS) for (const it of g.items) if (it.k === k) return it.label;
  return k;
}
function noteIcon(t) {
  return { Flowering: 'flower', Health: 'leaf', Movement: 'move', Pollination: 'droplet', Evaluation: 'star', Photo: 'camera', General: 'note' }[t] || 'note';
}

// ════════════════════════════════════════════════════════════
// GARDEN — map + list views, with "in flower now" per bed
// ════════════════════════════════════════════════════════════
function GardenScreen({ go, wide, openAdd, openLocation, toast }) {
  const [view, setView] = usePersistedStateS('bl_view_garden', 'map');
  if (BL.locations.length === 0) return <EmptyGarden openAdd={openAdd} openLocation={openLocation} toast={toast} />;

  // Map plants → location for "in flower now" counts
  const irisesByLoc = {};
  BL.irises.forEach(i => {
    irisesByLoc[i.loc] = irisesByLoc[i.loc] || { all: [], flowering: [] };
    irisesByLoc[i.loc].all.push(i);
    if (i.status === 'Flowering' || i.status === 'First flower') irisesByLoc[i.loc].flowering.push(i);
  });

  // Total flowering across all locations
  const totalFlowering = BL.irises.filter(i => i.status === 'Flowering' || i.status === 'First flower').length;

  return (
    <div style={pageWrap}>
      {/* summary strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <SummaryStat n={BL.irises.length || 106} l="Plants" icon="leaf" />
        <SummaryStat n={BL.locations.length} l="Locations" icon="pin" />
        <SummaryStat n={totalFlowering} l="Flowering" icon="flower" tint="rose" />
      </div>

      {/* view switch */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <Segmented value={view} onChange={setView} options={[
            { v: 'map', icon: 'pin', label: wide ? 'Map' : '' },
            { v: 'list', icon: 'list', label: wide ? 'List' : '' },
          ]} />
        </div>
      </div>

      {view === 'map' ? (
        <GardenMap locations={BL.locations} byLoc={irisesByLoc} onPick={(id) => go('gardenDetail', { id })} wide={wide} />
      ) : (
        <GardenList locations={BL.locations} byLoc={irisesByLoc} go={go} wide={wide} />
      )}

      <button onClick={openLocation} style={{ ...blBtnReset, cursor: 'pointer', width: '100%', marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'var(--surface)', borderRadius: 16, border: '1.5px dashed var(--line-2)', color: 'var(--accent)', fontWeight: 600, fontSize: 15 }}>
          <Icon name="plus" size={20} stroke="var(--accent)" sw={2.1} />Add location
        </div>
      </button>

      {/* Grid reference primer */}
      <div style={{ marginTop: 16, padding: '13px 14px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--accent-line)' }}>
          <Icon name="pin" size={16} stroke="var(--accent)" sw={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Grid references</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Use grid references to help locate plants within a bed. For example, <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Bed A, grid B4</span>. Set the reference on each plant record — free text, your convention.
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ n, l, icon, tint = 'accent' }) {
  return (
    <div style={{ flex: 1, padding: '12px 12px 10px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
      <Icon name={icon} size={18} stroke={`var(--${tint})`} sw={1.9} />
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{l}</div>
    </div>
  );
}

function GardenMap({ locations, byLoc, onPick, wide }) {
  const kindColor = (kind) => ({
    'Bed': '#5F7A52', 'Border': '#7A9268', 'Trial area': '#8E9F62',
    'Greenhouse': '#C7B26A', 'Holding': '#9C8762', 'Pots': '#A88B58',
  })[kind] || 'var(--accent)';
  const kindIcon = (kind) => ({
    'Bed': 'leaf', 'Border': 'flower', 'Trial area': 'sliders',
    'Greenhouse': 'sun', 'Holding': 'clock', 'Pots': 'droplet',
  })[kind] || 'pin';

  // Aspect: taller on phone so plots have room
  const aspect = wide ? '5/3' : '1/1';

  return (
    <div>
      {/* small caption above */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px 8px', gap: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>
          <Icon name="pin" size={13} stroke="var(--accent)" sw={2} />Garden plan
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--rose)' }} />in flower
        </div>
      </div>

      <div style={{ background: 'linear-gradient(180deg, #F0EAD7 0%, #E8E0C7 100%)',
        borderRadius: 20, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden',
        aspectRatio: aspect, marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
        {/* north arrow */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, width: 28, height: 28, borderRadius: 999, background: 'rgba(255,255,255,0.85)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: 'var(--accent)', letterSpacing: 0.3, lineHeight: 1 }}>N</div>
          <svg width="10" height="7" viewBox="0 0 14 10"><path d="M7 0 L11 9 L7 7 L3 9 Z" fill="var(--accent)" /></svg>
        </div>

        {/* path lines suggesting garden structure */}
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            <pattern id="gmGrass" patternUnits="userSpaceOnUse" width="3" height="3">
              <circle cx="1.5" cy="1.5" r="0.3" fill="rgba(95,122,82,0.15)" />
            </pattern>
          </defs>
          <rect width="100" height="80" fill="url(#gmGrass)" />
          {/* paths between beds */}
          <path d="M2 24 L66 24 M2 44 L66 44 M50 23 L50 80 M70 23 L70 80" stroke="rgba(168,139,88,0.35)" strokeWidth="1.2" strokeDasharray="0.7 1.2" fill="none" />
        </svg>

        {/* location plots */}
        {locations.map(loc => {
          const stats = byLoc[loc.name] || { all: [], flowering: [] };
          const flowering = stats.flowering.length;
          const col = kindColor(loc.kind);
          const isSmall = loc.w < 22 || loc.h < 14;
          return (
            <button key={loc.id} onClick={() => onPick(loc.id)} style={{
              ...blBtnReset, cursor: 'pointer', position: 'absolute',
              left: `${loc.x}%`, top: `${loc.y}%`, width: `${loc.w}%`, height: `${loc.h}%`,
              padding: 0,
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 10,
                background: `${col}1f`, border: `1.5px solid ${col}`,
                position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: isSmall ? '4px 6px' : '6px 8px',
                boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 2px 6px rgba(34,28,18,0.06)' }}>
                {/* hatching for non-soil areas */}
                {(loc.kind === 'Greenhouse' || loc.kind === 'Pots') && (
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} preserveAspectRatio="none" viewBox="0 0 40 40">
                    <defs>
                      <pattern id={`hatch-${loc.id}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke={col} strokeWidth="0.8" />
                      </pattern>
                    </defs>
                    <rect width="40" height="40" fill={`url(#hatch-${loc.id})`} />
                  </svg>
                )}
                {/* label */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                  <Icon name={kindIcon(loc.kind)} size={isSmall ? 9 : 11} stroke={col} sw={2.1} />
                  <span style={{ fontSize: isSmall ? 9 : 10.5, fontWeight: 700, color: 'var(--ink)', letterSpacing: 0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.1 }}>{loc.shortName || loc.name}</span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4 }}>
                  <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: isSmall ? 12 : 14, color: 'var(--ink)', lineHeight: 1 }}>
                    {loc.count}<span style={{ fontSize: isSmall ? 8 : 8.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.2, marginLeft: 2 }}>plants</span>
                  </span>
                  {flowering > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
                      padding: '2px 6px', borderRadius: 999,
                      background: 'var(--rose)', color: '#fff', fontSize: isSmall ? 8.5 : 9, fontWeight: 700, letterSpacing: 0.2, textTransform: 'uppercase' }}>
                      <span style={{ width: 4, height: 4, borderRadius: 999, background: '#fff' }} />{flowering}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontWeight: 500, padding: '0 4px 8px', textAlign: 'center' }}>
        Tap a plot to open
      </div>
    </div>
  );
}

function GardenList({ locations, byLoc, go, wide }) {
  const kindIcon = (kind) => ({ Bed: 'leaf', Border: 'flower', 'Trial area': 'sliders', Greenhouse: 'sun', Holding: 'clock', Pots: 'droplet' })[kind] || 'pin';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(2,1fr)' : '1fr', gap: 12 }}>
      {locations.map(loc => {
        const stats = byLoc[loc.name] || { all: [], flowering: [] };
        return (
          <button key={loc.id} onClick={() => go('gardenDetail', { id: loc.id })} style={{ ...blBtnReset, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={kindIcon(loc.kind)} size={23} stroke="var(--accent)" sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 17, color: 'var(--ink)' }}>{loc.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 1 }}>{loc.kind} · {loc.count} plants · {loc.sun}</div>
                </div>
                {stats.flowering.length > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 7px', borderRadius: 999,
                    background: 'var(--rose-bg)', color: 'var(--rose)', border: '1px solid var(--rose-line)',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', flexShrink: 0 }}>
                    <Icon name="flower" size={11} stroke="var(--rose)" sw={2.1} />{stats.flowering.length}
                  </span>
                )}
              </div>
              {/* Flowering preview thumbs */}
              {stats.flowering.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px 12px' }}>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', marginRight: 4 }}>Flowering</span>
                  {stats.flowering.slice(0, 5).map(iris => (
                    <div key={iris.id} style={{ width: 28, height: 28, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0, border: '1.5px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <IrisThumb iris={iris} r={6} />
                    </div>
                  ))}
                  {stats.flowering.length > 5 && (
                    <span style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>+{stats.flowering.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GardenDetailScreen({ id, go }) {
  const loc = BL.locations.find(l => l.id === id);
  if (!loc) return null;
  const list = BL.irises.filter(i => i.loc === loc.name);
  const flowering = list.filter(i => i.status === 'Flowering' || i.status === 'First flower');
  const seedlings = list.filter(i => i.kind === 'Seedling');
  const kindIcon = { Bed: 'leaf', Border: 'flower', 'Trial area': 'sliders', Greenhouse: 'sun', Holding: 'clock', Pots: 'droplet' };
  return (
    <div>
      {/* sticky header with back */}
      <div style={{ padding: '10px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 19, color: 'var(--ink)', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{loc.kind} · {loc.count} plants</div>
        </div>
      </div>

      {/* hero strip */}
      <div style={{ background: 'linear-gradient(135deg, var(--accent-bg) 0%, rgba(95,122,82,0.04) 100%)',
        borderBottom: '1px solid var(--line)', padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px var(--accent-shadow)' }}>
            <Icon name={kindIcon[loc.kind] || 'pin'} size={26} stroke="#fff" sw={1.9} />
          </span>
          <div style={{ flex: 1 }}>
            <div className="h-display" style={{ fontSize: 23, color: 'var(--ink)', lineHeight: 1.05 }}>{loc.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 3 }}>{loc.kind} · {loc.count} plants</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
          <BedTag icon="sun" l={loc.sun} />
          <BedTag icon="leaf" l={loc.soil} />
          {flowering.length > 0 && <BedTag icon="flower" l={`${flowering.length} flowering`} tint="rose" />}
          {seedlings.length > 0 && <BedTag icon="sprout" l={`${seedlings.length} seedlings`} tint="green" />}
        </div>
      </div>

      <div style={pageWrap}>
        {list.length === 0
          ? <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '40px 0', fontSize: 15 }}>No detailed records in this location yet.</div>
          : (
            <>
              <SectionLabel>Plants here<span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 14, color: 'var(--ink-3)', marginLeft: 7 }}> · {list.length} detailed</span></SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {list.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
              </div>
            </>
          )}
      </div>
    </div>
  );
}
function BedTag({ icon, l, tint = 'accent' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px 5px 8px', borderRadius: 999,
      background: `var(--${tint}-bg)`, color: `var(--${tint})`, border: `1px solid var(--${tint}-line)`,
      fontSize: 12, fontWeight: 600 }}>
      <Icon name={icon} size={13} stroke={`var(--${tint})`} sw={2} />{l}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════════════════
function SearchScreen({ go }) {
  const [q, setQ] = useStateS('');
  const [filters, setFilters] = useStateS({}); // { status: 'Flowering', loc: 'Top Bed', cls: 'Tall Bearded', year: 2024 }
  const recents = ['Dusky Challenger', 'GI-23', 'Trial Bed'];

  const filterDefs = [
    { key: 'status', icon: 'flower', label: 'Status',
      options: Object.keys(BL.STATUS) },
    { key: 'loc', icon: 'pin', label: 'Location',
      options: BL.locations.map(l => l.name) },
    { key: 'cls', icon: 'tag', label: 'Classification',
      options: Array.from(new Set(BL.irises.map(i => i.cls))) },
    { key: 'year', icon: 'calendar', label: 'Year planted',
      options: Array.from(new Set(BL.irises.map(i => (i.planted || '').match(/\d{4}$/)?.[0]).filter(Boolean))).sort().reverse() },
  ];

  const hasFilters = Object.values(filters).some(v => v);
  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: f[k] === v ? null : v }));
  const clearFilters = () => setFilters({});

  let results;
  if (q.trim()) {
    results = BL.irises.filter(i => (i.name + i.cls + i.loc + i.podParent + i.pollenParent).toLowerCase().includes(q.toLowerCase()));
  } else if (hasFilters) {
    results = BL.irises.filter(i => {
      if (filters.status && i.status !== filters.status) return false;
      if (filters.loc && i.loc !== filters.loc) return false;
      if (filters.cls && i.cls !== filters.cls) return false;
      if (filters.year && !(i.planted || '').includes(filters.year)) return false;
      return true;
    });
  } else {
    results = null;
  }

  return (
    <div>
      <div style={{ padding: '8px 16px 12px', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', background: 'var(--surface)', borderRadius: 14, border: '1.5px solid var(--accent)' }}>
            <Icon name="search" size={20} stroke="var(--ink-3)" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search names, codes, parents…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontSize: 16, fontFamily: 'Lexend, sans-serif', color: 'var(--ink)' }} />
            {q && <button onClick={() => setQ('')} style={{ ...blBtnReset, cursor: 'pointer' }}><Icon name="x" size={18} stroke="var(--ink-3)" /></button>}
          </div>
          <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 15.5 }}>Cancel</button>
        </div>
        {/* active filter chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.entries(filters).filter(([_, v]) => v).map(([k, v]) => (
              <button key={k} onClick={() => setFilter(k, v)} style={{ ...blBtnReset, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 9px 5px 11px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 12.5, fontWeight: 600 }}>
                {v}<Icon name="x" size={13} stroke="#fff" sw={2.4} />
              </button>
            ))}
            <button onClick={clearFilters} style={{ ...blBtnReset, cursor: 'pointer', padding: '5px 10px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)' }}>Clear all</button>
          </div>
        )}
      </div>
      <div style={pageWrap}>
        {!q && !hasFilters && <>
          <SectionLabel>Recent searches</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {recents.map(r => <Chip key={r} icon="clock" onClick={() => setQ(r)}>{r}</Chip>)}
          </div>
          <SectionLabel>Filter by</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filterDefs.map(def => (
              <div key={def.key}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, padding: '0 2px' }}>
                  <Icon name={def.icon} size={16} stroke="var(--accent)" sw={1.9} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: 0.2 }}>{def.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {def.options.map(opt => (
                    <Chip key={opt} active={filters[def.key] === opt} onClick={() => setFilter(def.key, opt)}>{opt}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}
        {results !== null && <>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, margin: '4px 2px 14px' }}>
            {results.length} {results.length === 1 ? 'result' : 'results'}{q ? ` for “${q}”` : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
          </div>
          {results.length === 0 && <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '40px 0', fontSize: 15 }}>No matches. Try different filters.</div>}
        </>}
      </div>
    </div>
  );
}

const pageWrap = { padding: '12px 18px 20px' };
const glassRound = { width: 40, height: 40, borderRadius: 999, background: 'rgba(30,18,46,0.42)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.18)' };

// ════════════════════════════════════════════════════════════
// TODAY FOCUS — "What needs me right now?"
// ════════════════════════════════════════════════════════════
function TodayFocus({ go, wide, openPhoto }) {
  const f = BL.todayFocus();
  const cards = [];

  if (f.seedlingsToEval.length) {
    const top = f.seedlingsToEval[0];
    cards.push({
      key: 'eval', tint: 'accent', icon: 'star',
      label: 'Ready to evaluate',
      count: f.seedlingsToEval.length,
      title: top.name,
      sub: 'First flower — score it before it fades',
      cta: 'Open',
      onClick: () => go('detail', { id: top.id }),
    });
  }
  if (f.seedlingsReEval.length) {
    const top = f.seedlingsReEval[0];
    cards.push({
      key: 'reeval', tint: 'green', icon: 'sprout',
      label: 'Re-evaluate this season',
      count: f.seedlingsReEval.length,
      title: top.name,
      sub: 'Last scored ' + (BL.latestEval(top.id) || {}).date,
      cta: 'Re-score',
      onClick: () => go('detail', { id: top.id }),
    });
  }
  if (f.watchList.length) {
    const top = f.watchList[0];
    cards.push({
      key: 'watch', tint: 'amber', icon: 'eye',
      label: 'On the watch list',
      count: f.watchList.length,
      title: top.name,
      sub: 'Decide whether to retain',
      cta: 'Review',
      onClick: () => go('detail', { id: top.id }),
    });
  }
  if (f.inFlower.length) {
    cards.push({
      key: 'flower', tint: 'rose', icon: 'flower',
      label: 'In flower today',
      count: f.inFlower.length,
      title: 'Capture this season',
      sub: 'Photos & flowering notes pay off later',
      cta: 'Add photo',
      onClick: () => openPhoto && openPhoto(),
    });
  }

  if (cards.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionLabel>
        Today
        <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 13, color: 'var(--ink-3)', marginLeft: 8 }}> · what needs you</span>
      </SectionLabel>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -18px', padding: '2px 18px 6px' }}>
        {cards.map(c => <TodayCard key={c.key} {...c} wide={wide} />)}
      </div>
    </div>
  );
}
function TodayCard({ tint, icon, label, count, title, sub, cta, onClick, wide }) {
  return (
    <button onClick={onClick} style={{ ...blBtnReset, cursor: 'pointer', flexShrink: 0, width: wide ? 260 : 252, textAlign: 'left' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', padding: 14, boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden', minHeight: 178, height: 178, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: -32, right: -32, width: 90, height: 90, borderRadius: '50%', background: `var(--${tint}-bg)`, opacity: 0.55, pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 9, marginBottom: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: `var(--${tint}-bg)`, border: `1px solid var(--${tint}-line)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={icon} size={18} stroke={`var(--${tint})`} sw={1.9} />
          </span>
          {count > 0 && (
            <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 26, color: `var(--${tint})`, lineHeight: 0.9, textShadow: '0 0 8px var(--surface)' }}>{count}</span>
          )}
        </div>
        <div style={{ position: 'relative', zIndex: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, color: `var(--${tint})`, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
        <div style={{ position: 'relative', zIndex: 2, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16.5, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 4,
          display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</div>
        <div style={{ position: 'relative', zIndex: 2, fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.4, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sub}</div>
        <div style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', marginTop: 10 }}>
          {cta}<Icon name="chevron" size={15} stroke="var(--accent)" sw={2.2} />
        </div>
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// CALENDAR HOME — interactive: tap a month to see what flowers then
// ════════════════════════════════════════════════════════════
function CalendarHome({ months, monthSeason, today, go, flowering, GardenStrip, Header }) {
  const [selected, setSelected] = useStateS(today);
  const monthName = months[selected];
  const longName = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  const cultivars = monthSeason[monthName] || [];
  const irisesForMonth = cultivars.map(name => BL.irises.find(i => i.name === name)).filter(Boolean);

  return (
    <div style={pageWrap}>
      {Header}
      <SectionLabel>Bloom season<span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 500, fontSize: 13, color: 'var(--ink-3)', marginLeft: 8 }}> · tap to explore</span></SectionLabel>
      <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', padding: '16px 14px 14px', marginBottom: 18, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, marginBottom: 14 }}>
          {months.map((m, i) => {
            const count = monthSeason[m].length;
            const isNow = i === today;
            const isSel = i === selected;
            return (
              <button key={m} onClick={() => setSelected(i)} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isNow ? 'var(--accent)' : isSel ? 'var(--ink)' : 'var(--ink-4)', letterSpacing: 0.3 }}>{m.toUpperCase()}</div>
                <div style={{ width: '100%', height: 56, borderRadius: 8, position: 'relative',
                  background: count ? `linear-gradient(to top, var(--accent) ${Math.min(count * 12, 92)}%, var(--accent-bg) ${Math.min(count * 12, 92)}%, var(--accent-bg) 100%)` : 'var(--surface-2)',
                  border: isSel ? '2px solid var(--ink)' : isNow ? '2px solid var(--accent-2)' : '1px solid var(--line)',
                  boxShadow: isSel ? '0 2px 8px rgba(0,0,0,0.12)' : 'none', transition: 'all .15s' }}>
                  {isNow && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 999, background: 'var(--accent-2)', border: '1.5px solid var(--accent)' }} />}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: count ? (isSel ? 'var(--ink)' : 'var(--ink-2)') : 'var(--ink-5)' }}>{count || '–'}</div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          {cultivars.length > 0
            ? <><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{cultivars.length} {cultivars.length === 1 ? 'cultivar' : 'cultivars'}</span> flower in {longName[monthName]}{selected === today && ' · this month'}</>
            : <span>Nothing in flower in {longName[monthName]}</span>}
        </div>
      </div>

      {/* What's in flower in the selected month */}
      {irisesForMonth.length > 0 && (
        <>
          <SectionLabel>In flower in {longName[monthName]}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
            {irisesForMonth.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
          </div>
        </>
      )}
      {irisesForMonth.length === 0 && (
        <div style={{ padding: '24px 18px 28px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', marginBottom: 22 }}>
          <Icon name="leaf" size={28} stroke="var(--ink-4)" />
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>Garden quiet in {longName[monthName]}</div>
          <div style={{ fontSize: 12.5, marginTop: 3 }}>Plan for next season — or pick a different month above.</div>
        </div>
      )}

      <SectionLabel>Upcoming this season</SectionLabel>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '4px 14px', boxShadow: 'var(--shadow-sm)', marginBottom: 22 }}>
        {[
          { icon: 'flower', t: 'Late bloomers — June', s: 'Superstition, Immortality' },
          { icon: 'droplet', t: 'Cross window closing', s: '~10 days for new pollinations' },
          { icon: 'star', t: 'Evaluate seedlings', s: '3 seedlings ready to score' },
        ].map((u, i, a) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={u.icon} size={18} stroke="var(--accent)" sw={1.9} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{u.t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{u.s}</div>
            </div>
          </div>
        ))}
      </div>
      <GardenStrip />
    </div>
  );
}

Object.assign(window, { TodayFocus, CalendarHome });

// ── Eval sparkline (year-on-year average) ─────────────────
function EvalSparkline({ history }) {
  if (!history || history.length < 2) return null;
  const W = 280, H = 50, PAD = 8;
  const minY = Math.min(2.5, ...history.map(h => h.avg));
  const maxY = Math.max(5, ...history.map(h => h.avg));
  const range = maxY - minY || 1;
  const xFor = (i) => PAD + (i / (history.length - 1)) * (W - PAD * 2);
  const yFor = (v) => H - PAD - ((v - minY) / range) * (H - PAD * 2);
  const points = history.map((h, i) => `${xFor(i)},${yFor(h.avg)}`).join(' ');
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Year-on-year</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{history[0].year}–{history[history.length - 1].year}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 50 }}>
        {/* gridline at 5 */}
        <line x1={PAD} y1={yFor(5)} x2={W - PAD} y2={yFor(5)} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" />
        {/* fill under line */}
        <polyline points={`${PAD},${H - PAD} ${points} ${W - PAD},${H - PAD}`} fill="var(--accent-bg)" />
        {/* line */}
        <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* dots + year labels */}
        {history.map((h, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(h.avg)} r="3.5" fill="#fff" stroke="var(--accent)" strokeWidth="2" />
            <text x={xFor(i)} y={H - 1} fontSize="9" fontFamily="Lexend, sans-serif" fontWeight="600" fill="var(--ink-3)" textAnchor="middle">{h.year}</text>
          </g>
        ))}
        {/* current value label */}
        <text x={xFor(history.length - 1)} y={yFor(history[history.length - 1].avg) - 7} fontSize="10" fontFamily="Lexend, sans-serif" fontWeight="700" fill="var(--accent)" textAnchor="middle">
          {history[history.length - 1].avg.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}

Object.assign(window, { EvalSparkline });

// ════════════════════════════════════════════════════════════
// CALENDAR SCREEN — full bloom calendar, tap a month to explore
// ════════════════════════════════════════════════════════════
function CalendarScreen({ go, wide }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const longName = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
  // Mapping of cultivar -> months in flower. Sample data.
  const monthSeason = {
    Jan: [], Feb: [], Mar: [],
    Apr: ['Edith Wolford'],
    May: ['Edith Wolford', 'Dusky Challenger', "Jesse's Song", 'Beverly Sills', 'Superstition', 'Immortality', 'GI-23-04 A', 'GI-22-01 A'],
    Jun: ['Superstition', 'Immortality'],
    Jul: [], Aug: [], Sep: [],
    Oct: ['Immortality'],
    Nov: [], Dec: [],
  };
  const today = 4; // May
  const [selected, setSelected] = useStateS(today);
  const monthName = months[selected];
  const cultivars = monthSeason[monthName] || [];
  const irisesForMonth = cultivars.map(name => BL.irises.find(i => i.name === name)).filter(Boolean);

  return (
    <div>
      {/* sticky header with back */}
      <div style={{ padding: '10px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1 }}>
          <div className="h-display" style={{ fontSize: 21, color: 'var(--ink)', lineHeight: 1.1 }}>Bloom calendar</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Tap a month to see what flowers then</div>
        </div>
      </div>

      <div style={pageWrap}>
        {/* Year bar chart */}
        <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', padding: '16px 14px 14px', marginBottom: 18, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4, marginBottom: 14 }}>
            {months.map((m, i) => {
              const count = monthSeason[m].length;
              const isNow = i === today;
              const isSel = i === selected;
              return (
                <button key={m} onClick={() => setSelected(i)} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: isNow ? 'var(--accent)' : isSel ? 'var(--ink)' : 'var(--ink-4)', letterSpacing: 0.3 }}>{m.toUpperCase()}</div>
                  <div style={{ width: '100%', height: 64, borderRadius: 8, position: 'relative',
                    background: count ? `linear-gradient(to top, var(--accent) ${Math.min(count * 12, 92)}%, var(--accent-bg) ${Math.min(count * 12, 92)}%, var(--accent-bg) 100%)` : 'var(--surface-2)',
                    border: isSel ? '2px solid var(--ink)' : isNow ? '2px solid var(--accent-2)' : '1px solid var(--line)',
                    boxShadow: isSel ? '0 2px 8px rgba(0,0,0,0.12)' : 'none', transition: 'all .15s' }}>
                    {isNow && <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: 999, background: 'var(--accent-2)', border: '1.5px solid var(--accent)' }} />}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: count ? (isSel ? 'var(--ink)' : 'var(--ink-2)') : 'var(--ink-5)' }}>{count || '–'}</div>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: 10 }}>
            {cultivars.length > 0
              ? <><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{cultivars.length} {cultivars.length === 1 ? 'cultivar' : 'cultivars'}</span> in flower in {longName[monthName]}{selected === today && ' · this month'}</>
              : <span>Nothing in flower in {longName[monthName]}</span>}
          </div>
        </div>

        {/* What's in flower in the selected month */}
        {irisesForMonth.length > 0 ? (
          <>
            <SectionLabel>In flower in {longName[monthName]}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
              {irisesForMonth.map(iris => <IrisCard key={iris.id} iris={iris} variant="list" onClick={() => go('detail', { id: iris.id })} />)}
            </div>
          </>
        ) : (
          <div style={{ padding: '24px 18px 28px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', marginBottom: 22 }}>
            <Icon name="leaf" size={28} stroke="var(--ink-4)" />
            <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--ink-2)' }}>Garden quiet in {longName[monthName]}</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}>Plan for next season — or pick a different month above.</div>
          </div>
        )}

        {/* Upcoming reminders */}
        <SectionLabel>Upcoming this season</SectionLabel>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '4px 14px', boxShadow: 'var(--shadow-sm)', marginBottom: 22 }}>
          {[
            { icon: 'flower', t: 'Late bloomers — June', s: 'Superstition, Immortality' },
            { icon: 'droplet', t: 'Cross window closing', s: '~10 days for new pollinations' },
            { icon: 'star', t: 'Evaluate seedlings', s: '3 seedlings ready to score' },
          ].map((u, i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < a.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={u.icon} size={18} stroke="var(--accent)" sw={1.9} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{u.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{u.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// FLOWERING HISTORY + COLOUR DEFINITION (iris detail)
// ════════════════════════════════════════════════════════════
function FloweringHistoryCard({ iris, onRecord }) {
  const stats = BL.flowerStats(iris);
  const hist = stats.byYear;
  const hasAny = hist.length > 0 || stats.firstEver;
  if (!hasAny) {
    return (
      <>
        <SectionLabel action={<TextLink onClick={onRecord}>Record flowering</TextLink>}>Flowering history</SectionLabel>
        <div style={{ background: 'var(--surface)', border: '1.5px dashed var(--line-2)', borderRadius: 18, padding: '20px 18px', marginBottom: 22, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.5 }}>No flowering recorded yet.<br/>Add the first flower date when it opens.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionLabel action={<TextLink onClick={onRecord}>Record flowering</TextLink>}>Flowering history</SectionLabel>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 16, marginBottom: 22, boxShadow: 'var(--shadow-sm)' }}>
        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: hist.length ? 14 : 0, paddingBottom: hist.length ? 14 : 0, borderBottom: hist.length ? '1px solid var(--line)' : 'none' }}>
          <FlowerStat label="Years" value={hist.length || '\u2014'} />
          <FlowerStat label="First ever" value={stats.firstEver || '\u2014'} small />
          <FlowerStat label="Avg display" value={BL.formatDuration(stats.averagePeriodDays)} small />
        </div>
        {/* Year records */}
        {hist.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {hist.map((r, i) => {
              const a = BL.parseDMY(r.first), b = BL.parseDMY(r.last);
              const days = a && b ? Math.max(0, Math.round((b - a) / 86400000)) : null;
              const ongoing = r.first && !r.last;
              return (
                <div key={r.year} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < hist.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ width: 48, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 17, color: 'var(--accent)', lineHeight: 1 }}>{r.year}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, marginBottom: 3 }}>
                      {r.first || '—'} {ongoing ? <span style={{ color: 'var(--rose)', fontWeight: 600 }}>→ ongoing</span> : (r.last ? <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>— {r.last}</span> : '')}
                    </div>
                    {(r.stems || r.buds || r.height) && (
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: r.notes ? 4 : 0 }}>
                        {r.stems ? <span>{r.stems} stems</span> : null}
                        {r.buds ? <span>{r.buds} buds</span> : null}
                        {r.height ? <span>{r.height} cm</span> : null}
                      </div>
                    )}
                    {r.notes && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>{r.notes}</div>}
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: ongoing ? 'var(--rose-bg)' : 'var(--surface-2)', border: `1px solid ${ongoing ? 'var(--rose-line)' : 'var(--line)'}`, whiteSpace: 'nowrap' }}>
                    {ongoing ? 'In flower' : BL.formatDuration(days)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function FlowerStat({ label, value, small }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 11px', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: small ? 14 : 22, color: 'var(--ink)', lineHeight: 1.05, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function ColourDefinitionCard({ iris }) {
  const c = iris.colorDef || {};
  const rows = [
    { k: 'standards', l: 'Standards' },
    { k: 'falls',     l: 'Falls' },
    { k: 'beard',     l: 'Beard' },
    { k: 'styleArms', l: 'Style arms' },
  ];
  const hasAny = rows.some(r => c[r.k]);
  return (
    <>
      <SectionLabel action={<TextLink onClick={() => {}}>Edit</TextLink>}>Colour definition</SectionLabel>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '4px 16px', marginBottom: 22, boxShadow: 'var(--shadow-sm)' }}>
        {!hasAny && (
          <div style={{ padding: '14px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>
            Describe standards, falls, beard, and style arms in your own words once the plant has flowered.
          </div>
        )}
        {rows.map((r, i) => (
          <div key={r.k} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ width: 80, flexShrink: 0, fontSize: 12, fontWeight: 700, letterSpacing: 0.4, color: 'var(--ink-3)', textTransform: 'uppercase', paddingTop: 2 }}>{r.l}</div>
            <div style={{ flex: 1, fontSize: 14, color: c[r.k] ? 'var(--ink)' : 'var(--ink-4)', lineHeight: 1.45 }}>
              {c[r.k] || `Describe the ${r.l.toLowerCase()}\u2026`}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

Object.assign(window, { FloweringHistoryCard, ColourDefinitionCard });

Object.assign(window, {
  HomeScreen, CollectionScreen, IrisDetailScreen, GardenScreen, GardenDetailScreen, SearchScreen, CalendarScreen,
});
