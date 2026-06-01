// main.jsx — Pod & Pollen app shell
const { useState: useS, useEffect: useE, useRef: useR } = React;

// ── tweak defaults ──
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "device": "Phone",
  "dashboardRecipe": "Custom",
  "accent": "#5F7A52",
  "textSize": "Standard",
  "demoState": "Populated",
  "connectivity": "Online"
}/*EDITMODE-END*/;

function hexToRgb(hex) { const h = hex.replace('#',''); const n = parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function applyAccent(root, hex) {
  const [r,g,b] = hexToRgb(hex);
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-bg', `rgba(${r},${g},${b},0.10)`);
  root.style.setProperty('--accent-line', `rgba(${r},${g},${b},0.22)`);
  root.style.setProperty('--accent-shadow', `rgba(${r},${g},${b},0.32)`);
  root.style.setProperty('--accent-ring', `rgba(${r},${g},${b},0.16)`);
}

// ── Offline / sync awareness banner ──
function ConnectivityBanner({ state }) {
  if (!state || state === 'Online') return null;
  const cfg = {
    Offline: { icon: 'x', label: 'Offline', sub: 'Changes will sync later.', tint: 'clay' },
    Syncing: { icon: 'sprout', label: 'Back online', sub: 'Syncing changes…', tint: 'amber', spin: true },
    Synced:  { icon: 'check', label: 'All changes synced', sub: 'Up to date.', tint: 'green' },
  }[state];
  if (!cfg) return null;
  return (
    <div style={{ flexShrink: 0, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
      background: `var(--${cfg.tint}-bg)`, borderBottom: `1px solid var(--${cfg.tint}-line)`, color: `var(--${cfg.tint})` }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, background: `var(--${cfg.tint})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: cfg.spin ? 'blSpin 1.2s linear infinite' : 'none' }}>
        <Icon name={cfg.icon} size={14} stroke="#fff" sw={2.4} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{cfg.label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-2)', marginTop: 1 }}>{cfg.sub}</div>
      </div>
    </div>
  );
}
// ── Mobile / tablet browser URL bar ──
function MobileBrowserBar({ wide }) {
  const padH = wide ? 18 : 12;
  return (
    <div style={{
      height: 46, flexShrink: 0, background: '#E9E5DC',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', gap: 8, padding: `0 ${padH}px`,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l-6-6 6-6"/></svg>
      </span>
      <div style={{ flex: 1, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 12px', color: 'rgba(0,0,0,0.62)', fontSize: 13, fontWeight: 500 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>podandpollen.app</span>
      </div>
      <span style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.45)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      </span>
    </div>
  );
}

// ── Tablet device shell ──
function TabletShell({ children, width = 820, height = 1100 }) {
  return (
    <div style={{ width, height, borderRadius: 42, background: '#F2F2F7', position: 'relative', overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)', fontFamily: 'Lexend, system-ui, sans-serif' }}>
      <div style={{ position: 'absolute', top: 13, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, borderRadius: 999, background: '#1a1a1a', zIndex: 50 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}><IOSStatusBar /></div>
      <div style={{ height: '100%' }}>{children}</div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 60, height: 26, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: 7, pointerEvents: 'none' }}>
        <div style={{ width: 150, height: 5, borderRadius: 100, background: 'rgba(0,0,0,0.22)' }} />
      </div>
    </div>
  );
}

// ── Desktop body (sidebar + content) ──
function DesktopBody({ tab, onTab, openAdd, view, go, children }) {
  const items = [
    { k: 'home', icon: 'home', label: 'Home' },
    { k: 'collection', icon: 'grid', label: 'Collection' },
    { k: 'crosses', icon: 'dna', label: 'Crosses' },
    { k: 'garden', icon: 'pin', label: 'Garden' },
  ];
  const titles = { collection: 'Collection', crosses: 'Crosses', garden: 'Your garden', settings: 'Settings', search: 'Search' };
  const subs = { garden: '106 plants · 6 locations', crosses: 'Breeding programme' };
  const showTitle = titles[view] && view !== 'detail' && view !== 'gardenDetail';
  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg)' }}>
      <aside style={{ width: 240, flexShrink: 0, padding: '22px 14px 18px', borderRight: '1px solid var(--line)', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ padding: '4px 8px 16px' }}><Wordmark /></div>
        <button onClick={openAdd} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px', borderRadius: 12, background: 'var(--accent)', color: '#fff', fontSize: 14.5, fontWeight: 600, boxShadow: '0 4px 12px var(--accent-shadow)', marginBottom: 6 }}>
          <Icon name="plus" size={20} stroke="#fff" sw={2.2} />Add iris
        </button>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(it => {
            const active = (tab === it.k) || (view === it.k);
            return (
              <button key={it.k} onClick={() => onTab(it.k)} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: active ? 'var(--accent-bg)' : 'transparent', border: active ? '1px solid var(--accent-line)' : '1px solid transparent', color: active ? 'var(--accent)' : 'var(--ink-2)', fontSize: 14.5, fontWeight: active ? 600 : 500, textAlign: 'left' }}>
                <Icon name={it.icon} size={20} stroke={active ? 'var(--accent)' : 'var(--ink-3)'} sw={active ? 2 : 1.8} />{it.label}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1 }} />
        <button onClick={() => go('settings')} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: view === 'settings' ? 'var(--accent-bg)' : 'transparent', border: view === 'settings' ? '1px solid var(--accent-line)' : '1px solid transparent', color: view === 'settings' ? 'var(--accent)' : 'var(--ink-2)', fontSize: 14.5, fontWeight: 500, textAlign: 'left' }}>
          <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-line)', color: 'var(--accent)', fontWeight: 600, fontSize: 12.5 }}>D</span>
          Settings
        </button>
      </aside>
      <main className="bl-scroll" style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {showTitle && (
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '24px 32px 8px', maxWidth: 1020, margin: '0 auto' }}>
            <div>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 30, color: 'var(--ink)', lineHeight: 1.1 }}>{titles[view]}</div>
              {subs[view] && <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 3 }}>{subs[view]}</div>}
            </div>
          </div>
        )}
        <div style={{ maxWidth: 1020, margin: '0 auto', padding: showTitle ? '0 14px' : '0' }}>{children}</div>
      </main>
    </div>
  );
}

// ── App header (sticky) ──
function AppHeader({ view, go, onAvatar }) {
  if (view === 'home') {
    return (
      <div style={hdrWrap}>
        <Wordmark />
        <button onClick={onAvatar} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Settings">
          <span style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-line)', color: 'var(--accent)', fontWeight: 700, fontSize: 15 }}>{BL.user.initial}</span>
        </button>
      </div>
    );
  }
  const titles = { collection: 'Collection', crosses: 'Crosses', garden: 'Your garden', settings: 'Settings' };
  const subs = { garden: '106 plants · 6 locations', crosses: 'Breeding programme' };
  return (
    <div style={{ ...hdrWrap, alignItems: 'baseline' }}>
      <div>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 25, color: 'var(--ink)', lineHeight: 1.1 }}>{titles[view]}</div>
        {subs[view] && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>{subs[view]}</div>}
      </div>
    </div>
  );
}
const hdrWrap = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px 10px', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' };

// ── Settings header (with back) ──
function SettingsHeader({ go }) {
  return (
    <div style={{ padding: '10px 18px 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
      <button onClick={() => go(-1)} style={{ ...blBtnReset, cursor: 'pointer' }} aria-label="Back">
        <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
      </button>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--ink)' }}>Settings</div>
    </div>
  );
}

// ── Toast ──
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 90,
      background: 'var(--ink)', color: '#fff', padding: '13px 20px', borderRadius: 14, fontSize: 14.5, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap',
      animation: 'blToast .25s ease', maxWidth: 'calc(100% - 32px)' }}>
      <Icon name="check" size={18} stroke="#7ee0a8" sw={2.4} />{msg}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useS('home');
  const [stack, setStack] = useS([]);
  const [sheet, setSheet] = useS(null);
  const [photoView, setPhotoView] = useS(null); // {photos, index}
  const [toastMsg, setToastMsg] = useS('');
  const [onboardDone, setOnboardDone] = useS(false);
  const [authView, setAuthView] = useS('in'); // 'in' | 'welcome' | 'signup' | 'signin' | 'forgot'
  // Saved user widget set (from onboarding answers) — separate from preview Tweak
  const [savedWidgets, setSavedWidgets] = useS(() => {
    try { const s = localStorage.getItem('bl_widgets'); if (s) return JSON.parse(s); } catch (e) {}
    return BL.DEFAULT_WIDGETS;
  });
  const [seenCustomizeToast, setSeenCustomizeToast] = useS(() => {
    try { return localStorage.getItem('bl_seen_customize_toast') === '1'; } catch (e) { return false; }
  });
  const rootRef = useR(null);
  const toastTimer = useR(null);

  // Persist widgets
  useE(() => {
    try { localStorage.setItem('bl_widgets', JSON.stringify(savedWidgets)); } catch (e) {}
  }, [savedWidgets]);

  // Empty data view: swap BL data shadows
  const isEmpty = t.demoState === 'Empty';
  const isOnboarding = t.demoState === 'Onboarding' && !onboardDone;
  const isSignedOut = t.demoState === 'Signed out';

  // Stash + swap data based on demoState
  useE(() => {
    if (!window.__BL_FULL) window.__BL_FULL = { irises: BL.irises, locations: BL.locations, recent: BL.recent };
    if (isEmpty) {
      BL.irises = []; BL.locations = []; BL.recent = [];
    } else {
      BL.irises = window.__BL_FULL.irises; BL.locations = window.__BL_FULL.locations; BL.recent = window.__BL_FULL.recent;
    }
    setStack([]); setTab('home'); setSheet(null);
  }, [t.demoState]);

  // Reset onboarding when re-entered
  useE(() => { setOnboardDone(false); }, [t.demoState]);

  // Sync auth view with demoState
  useE(() => {
    if (t.demoState === 'Signed out') setAuthView('welcome');
    else setAuthView('in');
  }, [t.demoState]);

  const isDesktop = t.device === 'Desktop';
  const wide = t.device === 'Tablet' || isDesktop;
  const zoom = { Standard: 1, Large: 1.1, Larger: 1.2 }[t.textSize] || 1;

  useE(() => { if (rootRef.current) applyAccent(rootRef.current, t.accent); }, [t.accent]);

  const toast = (m) => {
    setToastMsg(m); clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  };
  const go = (view, params) => {
    if (view === -1) { setStack(s => s.slice(0, -1)); return; }
    if (['home', 'collection', 'garden', 'crosses'].includes(view) && !params) { setTab(view); setStack([]); return; }
    setStack(s => [...s, { view, params: params || {} }]);
  };
  const onTab = (k) => { if (k === 'search') { go('search'); } else { setTab(k); setStack([]); } };

  const openAdd = () => setSheet({ kind: 'add' });
  const openLocation = () => setSheet({ kind: 'location' });
  const openNewCross = () => setSheet({ kind: 'pollination', iris: null });
  const openAddSeedling = (cross) => setSheet({ kind: 'addSeedling', cross });

  const top = stack[stack.length - 1];
  const view = top ? top.view : tab;
  const bleed = view === 'detail';
  const showAppHeader = stack.length === 0 && view !== 'search';
  const SB = wide ? 46 : 56;

  // current screen
  let screen;
  if (view === 'home') {
    // Compute active widget set from Tweaks recipe override or saved
    const recipe = t.dashboardRecipe || 'Custom';
    const activeWidgets = (recipe === 'Custom' || !BL.WIDGET_RECIPES[recipe])
      ? savedWidgets
      : BL.WIDGET_RECIPES[recipe];
    screen = isEmpty
      ? <EmptyHome openAdd={openAdd} go={go} />
      : <HomeScreen go={go} wide={wide} widgets={activeWidgets}
          openAdd={openAdd} openNote={() => setSheet({ kind: 'note' })} openPhoto={() => setSheet({ kind: 'photo' })} />;
  } else if (view === 'collection') {
    screen = <CollectionScreen go={go} wide={wide} openAdd={openAdd} params={top && top.params} />;
  } else if (view === 'garden') {
    screen = <GardenScreen go={go} wide={wide} openAdd={openAdd} openLocation={openLocation} toast={toast} />;
  } else if (view === 'gardenDetail') {
    screen = <GardenDetailScreen id={top.params.id} go={go} />;
  } else if (view === 'crosses') {
    screen = <CrossesScreen go={go} wide={wide} openAdd={openAdd} openNewCross={openNewCross} />;
  } else if (view === 'crossDetail') {
    screen = <CrossDetailScreen id={top.params.id} go={go} wide={wide} openPollination={(iris) => setSheet({ kind: 'pollination', iris })} openAddSeedling={openAddSeedling} />;
  } else if (view === 'compare') {
    screen = <CompareScreen ids={top.params.ids} go={go} wide={wide} />;
  } else if (view === 'search') {
    screen = <SearchScreen go={go} />;
  } else if (view === 'settings') {
    screen = <SettingsScreen go={go} toast={toast} signOut={handleSignOut} />;
  } else if (view === 'customize') {
    screen = <CustomizeDashboardScreen go={go} widgets={savedWidgets} setWidgets={(w) => { setSavedWidgets(w); setTweak('dashboardRecipe', 'Custom'); }} toast={toast} />;
  } else if (view === 'import') {
    screen = <ImportScreen go={go} toast={toast} />;
  } else if (view === 'calendar') {
    screen = <CalendarScreen go={go} wide={wide} />;
  } else if (view === 'detail') {
    screen = <IrisDetailScreen id={top.params.id} go={go} wide={wide}
      openNote={(iris) => setSheet({ kind: 'note', iris })}
      openPhoto={(iris) => setSheet({ kind: 'photo', iris })}
      openStage={(iris, stage) => setSheet({ kind: 'stage', iris, stage })}
      openEval={(iris) => setSheet({ kind: 'eval', iris })}
      openEvalHistory={(iris) => setSheet({ kind: 'evalHistory', iris })}
      openFlowering={(iris) => setSheet({ kind: 'flowering', iris })}
      openPollination={(iris) => setSheet({ kind: 'pollination', iris })}
      openPhotoViewer={(photos, index) => setPhotoView({ photos, index })}
      toast={toast} />;
  }

  const isAuthed = authView === 'in';
  const handleSignUpDone = (data) => {
    setTweak('demoState', 'Onboarding');
    setOnboardDone(false);
    setAuthView('in');
    setStack([]); setTab('home');
    toast(`Welcome to Pod & Pollen, ${data.name || 'there'}!`);
  };
  const handleSignInDone = () => {
    setTweak('demoState', 'Populated');
    setAuthView('in');
    setStack([]); setTab('home');
    toast('Signed in');
  };
  const handleSignOut = () => {
    setTweak('demoState', 'Signed out');
    setStack([]); setTab('home');
  };

  // Onboarding completion → build widget set
  const handleOnboardDone = (data) => {
    if (data && !data.skipPers && (data.matters || data.gardenType)) {
      const widgets = BL.recommendWidgets({ matters: data.matters || [], gardenType: data.gardenType || 'mixed', frequency: 'weekly' });
      setSavedWidgets(widgets);
      setTweak('dashboardRecipe', 'Custom');
    } else {
      setSavedWidgets(BL.DEFAULT_WIDGETS);
    }
    setOnboardDone(true);
    setTweak('demoState', 'Empty');
    // queue the customize toast for first dashboard load
    setTimeout(() => {
      if (!seenCustomizeToast) {
        toast('Tip: customize your home in Settings → Customize home');
        setSeenCustomizeToast(true);
        try { localStorage.setItem('bl_seen_customize_toast', '1'); } catch (e) {}
      }
    }, 700);
  };

  const appBody = (
    <div ref={rootRef} className="bl-root" style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {!isDesktop && <div style={{ height: SB, flexShrink: 0, background: 'transparent', zIndex: 5 }} />}
      {!isDesktop && <MobileBrowserBar wide={wide} />}
      {isAuthed && <ConnectivityBanner state={t.connectivity} />}
      {!isAuthed ? (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {authView === 'welcome' && <AuthWelcome onSignUp={() => setAuthView('signup')} onSignIn={() => setAuthView('signin')} />}
          {authView === 'signup' && <SignUpFlow onBack={() => setAuthView('welcome')} onSwitchToSignIn={() => setAuthView('signin')} onDone={handleSignUpDone} />}
          {authView === 'signin' && <SignInFlow onBack={() => setAuthView('welcome')} onSwitchToSignUp={() => setAuthView('signup')} onForgot={() => setAuthView('forgot')} onDone={handleSignInDone} />}
          {authView === 'forgot' && <ForgotPasswordFlow onBack={() => setAuthView('signin')} onSent={() => setAuthView('signin')} />}
        </div>
      ) : isDesktop ? <DesktopBody tab={tab} onTab={onTab} openAdd={openAdd} view={view} go={go}>{screen}</DesktopBody> : (
        <div className="bl-scroll" style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
          <div style={{ zoom, minHeight: '100%' }}>
            {view === 'settings' && <SettingsHeader go={go} />}
            {showAppHeader && view !== 'settings' && <AppHeader view={view} go={go} onAvatar={() => go('settings')} />}
            {screen}
          </div>
        </div>
      )}
      {!isDesktop && isAuthed && <BottomNav tab={tab} onTab={onTab} onAdd={openAdd} />}

      {/* sheets */}
      <AddIrisFlow open={sheet?.kind === 'add'} onClose={() => setSheet(null)} onSaved={(n) => { setSheet(null); toast(`"${n}" added to your collection`); }} />
      <AddIrisFlow open={sheet?.kind === 'addSeedling'} presetCross={sheet?.cross} onClose={() => setSheet(null)} onSaved={(n) => { setSheet(null); toast(`Seedling "${n}" added to ${sheet?.cross?.code}`); }} />
      <AddLocationFlow open={sheet?.kind === 'location'} onClose={() => setSheet(null)} onSaved={(d) => { setSheet(null); toast(`“${d.name}” added to your garden`); }} />
      <QuickNoteFlow open={sheet?.kind === 'note'} iris={sheet?.iris} onClose={() => setSheet(null)} onSaved={(ty) => { setSheet(null); toast(`${ty} note saved`); }} />
      <AddPhotoFlow open={sheet?.kind === 'photo'} iris={sheet?.iris} onClose={() => setSheet(null)} onSaved={(c) => { setSheet(null); toast(`${c} photo added`); }} />
      <StageSheet open={sheet?.kind === 'stage'} iris={sheet?.iris} stage={sheet?.stage} onClose={() => setSheet(null)} />
      <EvaluationFlow open={sheet?.kind === 'eval'} iris={sheet?.iris} onClose={() => setSheet(null)} onSaved={(r) => { setSheet(null); toast(`Evaluation saved · ${r.avg ? r.avg.toFixed(1) : '—'} avg`); }} />
      <EvalHistorySheet open={sheet?.kind === 'evalHistory'} iris={sheet?.iris} onClose={() => setSheet(null)} onEdit={(rec) => setSheet({ kind: 'eval', iris: sheet.iris, edit: rec })} />
      <RecordFloweringFlow open={sheet?.kind === 'flowering'} iris={sheet?.iris} onClose={() => setSheet(null)} onSaved={(d) => { setSheet(null); toast(`Flowering recorded · ${d}`); }} />
      <RecordPollinationFlow open={sheet?.kind === 'pollination'} iris={sheet?.iris} onClose={() => setSheet(null)} onSaved={(other) => { setSheet(null); toast(`Cross recorded with ${other}`); }} />

      <PhotoViewer open={!!photoView} photos={photoView?.photos || []} startIndex={photoView?.index || 0} onClose={() => setPhotoView(null)}
        onAction={(action, photo, payload) => {
          if (action === 'delete') { setPhotoView(null); toast('Photo deleted'); }
          else if (action === 'category') toast(`Category changed to ${payload}`);
          else if (action === 'move') toast('Photo moved');
          else if (action === 'saveToRoll') toast('Saved to camera roll');
        }} />

      {/* onboarding overlay */}
      {isOnboarding && <OnboardingFlow onDone={handleOnboardDone} />}

      <Toast msg={toastMsg} />
    </div>
  );

  // ── stage scaling ──
  const W = isDesktop ? 1280 : wide ? 820 : 402, H = isDesktop ? 820 : wide ? 1100 : 874;
  const [scale, setScale] = useS(1);
  useE(() => {
    const fit = () => {
      const pad = 48;
      const s = Math.min((window.innerWidth - pad) / W, (window.innerHeight - pad) / H, 1.18);
      setScale(s > 0 ? s : 1);
    };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, [W, H]);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--stage)', overflow: 'hidden' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {isDesktop
          ? <ChromeWindow width={W} height={H} url="podandpollen.app/home">{appBody}</ChromeWindow>
          : wide
            ? <TabletShell width={W} height={H}>{appBody}</TabletShell>
            : <IOSDevice width={W} height={H}>{appBody}</IOSDevice>}
      </div>

      <TweaksPanel>
        <TweakSection label="Demo state" />
        <TweakSelect label="What to show" value={t.demoState} options={['Signed out', 'Onboarding', 'Empty', 'Populated']} onChange={(v) => setTweak('demoState', v)} />
        <TweakSelect label="Dashboard recipe" value={t.dashboardRecipe} options={['Custom', 'Breeder', 'Collector', 'Casual', 'Mapper', 'Everything']} onChange={(v) => setTweak('dashboardRecipe', v)} />
        <TweakRadio label="Connectivity" value={t.connectivity} options={['Online', 'Offline', 'Syncing', 'Synced']} onChange={(v) => setTweak('connectivity', v)} />
        <TweakRadio label="Device" value={t.device} options={['Phone', 'Tablet', 'Desktop']} onChange={(v) => setTweak('device', v)} />
        <TweakSection label="Appearance" />
        <TweakColor label="Accent" value={t.accent} options={['#5F7A52', '#4A6E40', '#3F5C36', '#7A9268', '#8E9F62', '#6B5E96', '#8C5A8C', '#9B5460', '#C18B3A', '#8C7220']} onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Text size" value={t.textSize} options={['Standard', 'Large', 'Larger']} onChange={(v) => setTweak('textSize', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
