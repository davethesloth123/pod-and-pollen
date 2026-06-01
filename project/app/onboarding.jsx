// onboarding.jsx — Pod & Pollen first-run + settings + empty states
// Exports: OnboardingFlow, SettingsScreen, EmptyHome, EmptyCollection, EmptyGarden
const { useState: useStateO } = React;

// ════════════════════════════════════════════════════════════
// ONBOARDING — welcome → plant type → garden → personalization
// ════════════════════════════════════════════════════════════
function OnboardingFlow({ onDone }) {
  const [step, setStep] = useStateO(0);
  const [plant, setPlant] = useStateO('iris');
  const [garden, setGarden] = useStateO('');
  const [matters, setMatters] = useStateO([]);
  const [gardenType, setGardenType] = useStateO('');
  const [skipPers, setSkipPers] = useStateO(false);

  const totalSteps = 5; // welcome, plant, matters, gardenType, garden
  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else finish();
  };
  const back = () => step > 0 && setStep(step - 1);
  const finish = () => onDone({ plant, garden, matters, gardenType, skipPers });
  const skipPersonalization = () => { setSkipPers(true); onDone({ plant, garden, matters: [], gardenType: '', skipPers: true }); };

  // Top-right skip behaviour by step:
  //  0,1 (welcome, plant) → "Skip" exits onboarding entirely
  //  2,3 (matters, gardenType) → "Use default" exits with default widgets
  //  4   (garden) → "Skip" finishes with whatever's set so far (no garden name)
  const isPersonalization = step === 2 || step === 3;
  const topSkip = isPersonalization ? skipPersonalization : (step === 4 ? finish : onDone);
  const topSkipLabel = isPersonalization ? 'Use default' : 'Skip';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* progress + back */}
      <div style={{ padding: '54px 18px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={back} disabled={step === 0} style={{ ...window.blBtnReset, cursor: step ? 'pointer' : 'default', opacity: step ? 1 : 0 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="back" size={22} stroke="var(--ink)" />
          </span>
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--accent)' : 'var(--line)', transition: 'background .2s' }} />
          ))}
        </div>
        <button onClick={topSkip} style={{ ...window.blBtnReset, cursor: 'pointer', color: 'var(--ink-3)', fontSize: 14, fontWeight: 500 }}>
          {topSkipLabel}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px 24px', display: 'flex', flexDirection: 'column' }}>
        {step === 0 && <StepWelcome />}
        {step === 1 && <StepPlant value={plant} onChange={setPlant} />}
        {step === 2 && <StepMatters value={matters} onChange={setMatters} />}
        {step === 3 && <StepGardenType value={gardenType} onChange={setGardenType} />}
        {step === 4 && <StepGarden value={garden} onChange={setGarden} />}
      </div>

      <div style={{ padding: '14px 22px 36px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button onClick={next} disabled={step === 1 && plant !== 'iris'} style={{ ...window.blBtnReset, width: '100%', cursor: 'pointer',
          padding: 16, borderRadius: 15, background: 'var(--accent)', color: '#fff', fontSize: 16.5, fontWeight: 600,
          boxShadow: '0 6px 18px var(--accent-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {step === totalSteps - 1 ? <>Open Pod & Pollen<Icon name="chevron" size={20} stroke="#fff" sw={2.2} /></> : <>Continue<Icon name="chevron" size={20} stroke="#fff" sw={2.2} /></>}
        </button>
      </div>
    </div>
  );
}

function StepWelcome() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 0 40px' }}>
      <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 28 }}>
        <IrisBloom s={BL.PAL.deepPurple.s} f={BL.PAL.deepPurple.f} beard={BL.PAL.deepPurple.beard} r={28} />
      </div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 38, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 14 }}>Welcome to<br/>Pod & Pollen</div>
      <div style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 320, marginBottom: 10 }}>
        A field notebook for serious iris growers — plants, parents, crosses, seedlings, and first flowers, all connected.
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-3)', maxWidth: 280 }}>
        Built for the garden. Works in any browser, on phone, tablet, or desktop.
      </div>
    </div>
  );
}

function StepPlant({ value, onChange }) {
  const iris = BL.PLANT_TYPES.find(p => p.k === 'iris');
  const pal = BL.PAL[iris.pal];
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>A field notebook for irises</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 22 }}>
        Pod &amp; Pollen is built around the iris breeding lifecycle — varieties, parents, crosses, seedlings, and first flowers, all connected.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16,
        background: 'var(--accent-bg)', border: '1.5px solid var(--accent)', boxShadow: '0 4px 14px var(--accent-shadow)' }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          <IrisBloom s={pal.s} f={pal.f} beard={pal.beard} r={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>Irises</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.4 }}>Tall bearded, intermediate, dwarf, beardless, Siberian, and more.</div>
        </div>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="check" size={16} stroke="#fff" sw={2.6} />
        </span>
      </div>
    </div>
  );
}

function StepGarden({ value, onChange }) {
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>Where do you grow?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 22 }}>
        Add your first garden location. Beds, borders, pots, greenhouse — whatever you use. You can add more later.
      </div>
      <FInput value={value} onChange={e => onChange(e.target.value)} placeholder="e.g. Top Bed" style={{ fontSize: 18, padding: '16px 18px' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {['Top Bed', 'Long Border', 'Trial Bed', 'Greenhouse', 'Pots — Patio'].map(s => (
          <button key={s} onClick={() => onChange(s)} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '8px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', fontSize: 13.5, color: 'var(--ink-2)' }}>{s}</button>
        ))}
      </div>
      <div style={{ marginTop: 24, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 7 }}>
          <Icon name="check" size={18} stroke="var(--green)" sw={2.2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>You're set up</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Your records are private by default. Photos stay yours. Export anytime.</div>
      </div>
    </div>
  );
}

// ─── Personalization: what matters most ────────────────────
function StepMatters({ value, onChange }) {
  const options = BL.getGoals();
  const toggle = (k) => {
    if (value.includes(k)) onChange(value.filter(x => x !== k));
    else if (value.length < 4) onChange([...value, k]);
  };
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>What matters most to you?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 18 }}>
        Pick up to 4. We'll set up your home dashboard around what you care about — you can change it anytime in Settings.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {options.map(opt => {
          const active = value.includes(opt.k);
          const atLimit = !active && value.length >= 4;
          return (
            <button key={opt.k} onClick={() => toggle(opt.k)} disabled={atLimit} style={{ ...window.blBtnReset, cursor: atLimit ? 'default' : 'pointer', opacity: atLimit ? 0.45 : 1, width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 14,
                background: active ? 'var(--accent-bg)' : 'var(--surface)',
                border: active ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                boxShadow: active ? '0 2px 8px var(--accent-shadow)' : 'var(--shadow-sm)', transition: 'all .15s' }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: active ? 'var(--accent)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}>
                  <Icon name={opt.icon} size={20} stroke={active ? '#fff' : 'var(--accent)'} sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1, lineHeight: 1.35 }}>{opt.sub}</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: 999, border: active ? '0' : '1.5px solid var(--line-2)', background: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <Icon name="check" size={14} stroke="#fff" sw={2.6} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 12, textAlign: 'center' }}>{value.length}/4 selected</div>
    </div>
  );
}

// ─── Personalization: garden type ──────────────────────────
function StepGardenType({ value, onChange }) {
  const options = [
    { k: 'collector', icon: 'flower', label: 'Mostly collecting named varieties', sub: 'I grow established cultivars' },
    { k: 'breeder',   icon: 'dna',    label: 'Active breeding programme',         sub: 'I make crosses and grow seedlings' },
    { k: 'mixed',     icon: 'leaf',   label: 'A mix of both',                     sub: 'I do a bit of each' },
  ];
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 28, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 10 }}>How would you describe your garden?</div>
      <div style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 18 }}>
        This helps us pick the right starting widgets for your home.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(opt => {
          const active = value === opt.k;
          return (
            <button key={opt.k} onClick={() => onChange(opt.k)} style={{ ...window.blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 16, borderRadius: 16,
                background: active ? 'var(--accent-bg)' : 'var(--surface)',
                border: active ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                boxShadow: active ? '0 4px 14px var(--accent-shadow)' : 'var(--shadow-sm)', transition: 'all .15s' }}>
                <span style={{ width: 46, height: 46, borderRadius: 12, background: active ? 'var(--accent)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={opt.icon} size={24} stroke={active ? '#fff' : 'var(--accent)'} sw={1.9} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.35 }}>{opt.sub}</div>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: 999, border: active ? '0' : '1.5px solid var(--line-2)', background: active ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <Icon name="check" size={15} stroke="#fff" sw={2.6} />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 18, padding: 14, background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <Icon name="sliders" size={17} stroke="var(--accent)" sw={2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>You can change this anytime</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>Settings → Customize home. Add or remove widgets, change the order, or rerun this setup.</div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
function SettingsScreen({ go, toast, signOut }) {
  return (
    <div>
      <div style={{ padding: '0 18px 24px' }}>
        {/* profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 0 22px' }}>
          <span style={{ width: 60, height: 60, borderRadius: 999, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 26, boxShadow: '0 4px 12px var(--accent-shadow)' }}>{BL.user.initial}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 20, color: 'var(--ink)' }}>{BL.user.gardenName}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{BL.user.email} · {BL.user.region}</div>
          </div>
          <button onClick={() => toast('Edit profile')} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '8px 13px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Edit</button>
        </div>

        <SetSection label="Data">
          <div style={cardStyle}>
            <SetRow icon="upload" label="Import from spreadsheet" sub="XLSX or CSV · preview, column mapping, merge or replace" onClick={() => go('import')} />
            <SetRow icon="grid" label="Download blank template" sub="XLSX with one sheet per record type" onClick={() => toast('Blank template downloaded \u00b7 pod-and-pollen-template.xlsx')} />
            <SetRow icon="seed" label="Download sample data" sub="XLSX with a small example set you can edit" onClick={() => toast('Sample data downloaded \u00b7 pod-and-pollen-sample.xlsx')} />
            <SetRow icon="upload" label="Export everything" sub="XLSX with plants, crosses, seedlings, flowering, locations, notes" onClick={() => toast('Preparing your XLSX export\u2026')} />
            <SetRow icon="seed" label="Export crosses & seed batches" sub="Spreadsheet for breeding season records" onClick={() => toast('Cross export started')} isLast />
          </div>
        </SetSection>

        <SetSection label="Your garden">
          <div style={cardStyle}>
            <SetRow icon="pin" label="Set up garden" sub="Add and edit beds, borders, greenhouse, holding area" onClick={() => go('garden')} isLast />
          </div>
        </SetSection>

        <SetSection label="Display">
          <div style={cardStyle}>
            <SetRow icon="sliders" label="Customize home" sub="Choose which widgets show on your dashboard" onClick={() => go('customize')} />
            <SetRow icon="eye" label="Text size" value="Standard" onClick={() => toast('Adjust text size in the Tweaks panel')} />
            <SetRow icon="sun" label="Theme" value="Light" onClick={() => toast('Dark mode is coming')} />
            <SetRow icon="pin" label="Region & units" value="UK · metric" onClick={() => toast('Switch region')} isLast />
          </div>
        </SetSection>

        <SetSection label="Help & privacy">
          <div style={cardStyle}>
            <SetRow icon="book" label="Help & glossary" sub="Plain-English guides for every workflow" onClick={() => toast('Open help')} />
            <SetRow icon="heart" label="Send feedback" onClick={() => toast('Open feedback form')} />
            <SetRow icon="leaf" label="Privacy & data" sub="Your records and photos are private by default" onClick={() => toast('Open privacy')} isLast />
          </div>
        </SetSection>

        <SetSection label="Account">
          <div style={cardStyle}>
            <SetRow icon="x" label="Sign out" onClick={() => signOut ? signOut() : toast('Signed out')} isLast />
          </div>
        </SetSection>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)', marginTop: 18 }}>Pod & Pollen · v0.1 preview</div>
      </div>
    </div>
  );
}

function SetSection({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-3)', textTransform: 'uppercase', margin: '2px 4px 8px' }}>{label}</div>
      {children}
    </div>
  );
}
const cardStyle = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '0 14px', boxShadow: 'var(--shadow-sm)' };

// ════════════════════════════════════════════════════════════
// EMPTY STATES
// ════════════════════════════════════════════════════════════
function EmptyHome({ openAdd, go }) {
  return (
    <div style={{ padding: '16px 18px 30px' }}>
      <div style={{ padding: '6px 2px 4px' }}>
        <div style={{ fontSize: 14.5, color: 'var(--ink-3)', fontWeight: 500 }}>Welcome to Pod & Pollen</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 26, color: 'var(--ink)', marginTop: 2 }}>Let's add your first iris</div>
      </div>
      <div style={{ marginTop: 14, padding: 18, background: 'var(--accent)', borderRadius: 20, color: '#fff', boxShadow: '0 8px 22px var(--accent-shadow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
          <Icon name="flower" size={22} stroke="#fff" sw={1.9} /><span style={{ fontWeight: 600, fontSize: 14, opacity: 0.92, letterSpacing: 0.3, textTransform: 'uppercase' }}>Get started</span>
        </div>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, lineHeight: 1.2, marginBottom: 8 }}>Add a named cultivar, or a seedling code</div>
        <div style={{ fontSize: 13.5, opacity: 0.86, lineHeight: 1.5, marginBottom: 14 }}>Just the name is required. You can add photos, parentage and notes any time.</div>
        <button onClick={openAdd} style={{ ...window.blBtnReset, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 999, background: '#fff', color: 'var(--accent)', fontWeight: 600, fontSize: 14.5 }}>
          <Icon name="plus" size={18} stroke="var(--accent)" sw={2.2} />Add your first iris
        </button>
      </div>

      <div style={{ marginTop: 22, marginBottom: 12, fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>What you can do</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[
          ['flower', 'Track plants & seedlings', 'Names, codes, classification, location'],
          ['dna', 'Record parentage & crosses', 'Pod parent × pollen parent, with photos'],
          ['seed', 'Follow the seed lifecycle', 'Harvest → sowing → germination → first flower'],
          ['star', 'Evaluate seedlings', 'BIS-style structured scoring'],
        ].map(([ic, t, s]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={20} stroke="var(--accent)" sw={1.9} /></span>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => go('garden')} style={{ ...window.blBtnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 16, padding: 14, borderRadius: 14, background: 'var(--surface)', border: '1.5px dashed var(--line-2)', color: 'var(--accent)', fontWeight: 600, fontSize: 14.5 }}>
        <Icon name="pin" size={20} stroke="var(--accent)" sw={1.9} />Set up your garden first
      </button>
    </div>
  );
}

function EmptyCollection({ openAdd }) {
  return (
    <div style={{ padding: '8px 18px' }}>
      <EmptyState icon="flower" title="No irises yet" body="Add your first cultivar or seedling to start building your collection. Pod & Pollen keeps everything connected — parents, crosses, seedlings, first flowers." action={{ label: 'Add an iris', onClick: openAdd }} />
    </div>
  );
}

function EmptyGarden({ openAdd, openLocation, toast }) {
  return (
    <div style={{ padding: '8px 18px' }}>
      <EmptyState icon="pin" title="No locations yet" body="Add beds, borders, pots, greenhouse, trial areas, or a holding area. You'll use these to organise plants and track movements." action={{ label: 'Add a location', onClick: openLocation || (() => toast('Add location')) }} secondary={{ label: 'Or add an iris first', onClick: openAdd }} />

      {/* Grid reference primer */}
      <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--accent-line)' }}>
          <Icon name="pin" size={17} stroke="var(--accent)" sw={2} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>How grid references work</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
            Grids help you locate a plant inside a bed. Save the location once, then set a grid reference on each plant record — e.g. <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Bed A, grid B4</span>. Free text, your convention.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingFlow, SettingsScreen, EmptyHome, EmptyCollection, EmptyGarden });

// ════════════════════════════════════════════════════════════
// IMPORT FROM SPREADSHEET (Settings → Import)
// Multi-step: upload → preview/mapping → mode (merge/replace) → confirm
// Replace mode requires a second confirmation per the brief.
// ════════════════════════════════════════════════════════════
function ImportScreen({ go, toast }) {
  const [step, setStep] = useStateO(0); // 0 upload, 1 preview, 2 mode, 3 confirm, 4 replace-confirm
  const [filename, setFilename] = useStateO('');
  const [mode, setMode] = useStateO(''); // 'merge' | 'replace'

  // Sample mapping data
  const sheets = [
    { name: 'Irises',            rows: 24,  cols: 11, ok: true },
    { name: 'Crosses',           rows: 8,   cols: 9,  ok: true },
    { name: 'Seedlings',         rows: 12,  cols: 10, ok: true },
    { name: 'Flowering records', rows: 43,  cols: 7,  ok: true },
    { name: 'Garden locations',  rows: 6,   cols: 5,  ok: true },
    { name: 'Notes',             rows: 118, cols: 4,  ok: true },
  ];
  const totalRows = sheets.reduce((a, b) => a + b.rows, 0);

  const next = () => setStep(s => s + 1);
  const back = () => step > 0 ? setStep(step - 1) : go(-1);

  // Step content
  let body;
  if (step === 0) body = (
    <ImportStep title="Upload a spreadsheet" sub="XLSX is preferred — it can include every record type in one file. CSV is accepted as a single-sheet fallback.">
      <button onClick={() => { setFilename('garden-2026-records.xlsx'); next(); }} style={{ ...window.blBtnReset, cursor: 'pointer', width: '100%', borderRadius: 16, padding: 24, background: 'var(--surface-2)', border: '1.5px dashed var(--line-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
        <span style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="upload" size={26} stroke="var(--accent)" sw={1.9} />
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Choose XLSX or CSV file</span>
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.4 }}>Tap to browse your files. We'll preview before anything is imported.</span>
      </button>
      <ImportInfoCard>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Need a starting point?</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 9 }}>Download the blank template or the sample data XLSX from Settings → Data, then edit and import.</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.45 }}>An XLSX export of your current records is created on every backup, so you always have something to restore.</div>
      </ImportInfoCard>
    </ImportStep>
  );

  if (step === 1) body = (
    <ImportStep title="Preview" sub={`${totalRows} rows detected across ${sheets.length} sheets in ${filename}.`}>
      <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-line)', borderRadius: 12, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Icon name="check" size={18} stroke="var(--green)" sw={2.3} />
        <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>All required columns matched</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sheets.map(s => (
          <div key={s.name} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="grid" size={15} stroke="var(--accent)" sw={2} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{s.rows} rows \u00b7 {s.cols} columns mapped</div>
            </div>
            <Icon name="check" size={16} stroke="var(--green)" sw={2.3} />
          </div>
        ))}
      </div>
      <button onClick={() => toast('Column mapping is auto-detected for the prototype.')} style={{ ...window.blBtnReset, cursor: 'pointer', alignSelf: 'flex-start', marginTop: 10, fontSize: 13.5, color: 'var(--accent)', fontWeight: 600, padding: '6px 2px' }}>Adjust column mapping</button>
    </ImportStep>
  );

  if (step === 2) body = (
    <ImportStep title="How should we handle existing records?" sub="Pick how this import combines with your current data.">
      <button onClick={() => { setMode('merge'); next(); }} style={importModeBtn(mode === 'merge')}>
        <span style={importModeIcon('var(--green)')}><Icon name="leaf" size={20} stroke="#fff" sw={2} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Merge with existing records</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>Adds new records and updates matching records where possible. Existing records that aren't in the file are kept.</div>
        </div>
        <Icon name="chevron" size={18} stroke="var(--ink-3)" />
      </button>
      <button onClick={() => { setMode('replace'); next(); }} style={importModeBtn(mode === 'replace', true)}>
        <span style={importModeIcon('var(--rose)')}><Icon name="x" size={20} stroke="#fff" sw={2.3} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>Replace existing records</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>Deletes your current records and replaces them with the uploaded file. Can't be undone unless you have an export backup.</div>
        </div>
        <Icon name="chevron" size={18} stroke="var(--ink-3)" />
      </button>
    </ImportStep>
  );

  if (step === 3) body = (
    <ImportStep title={mode === 'replace' ? 'Confirm replace' : 'Confirm import'} sub={mode === 'replace' ? 'Read carefully before continuing.' : 'Review the summary before applying.'}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}><span style={{ color: 'var(--ink-2)' }}>File</span><span style={{ fontWeight: 600 }}>{filename}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line)' }}><span style={{ color: 'var(--ink-2)' }}>Total rows</span><span style={{ fontWeight: 600 }}>{totalRows}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}><span style={{ color: 'var(--ink-2)' }}>Mode</span><span style={{ fontWeight: 600, color: mode === 'replace' ? 'var(--rose)' : 'var(--green)' }}>{mode === 'replace' ? 'Replace' : 'Merge'}</span></div>
      </div>
      {mode === 'replace' ? (
        <div style={{ background: 'var(--rose-bg)', border: '1.5px solid var(--rose-line)', borderRadius: 14, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: 'var(--rose)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15} stroke="#fff" sw={2.6} /></span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--rose)' }}>Destructive action</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
            This will <strong>replace your current Pod &amp; Pollen data</strong>. This cannot be undone unless you have an export backup.
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-line)', borderRadius: 14, padding: 16, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          We'll add new records and update matching ones. Anything in your library that isn't in the file is left alone.
        </div>
      )}
    </ImportStep>
  );

  if (step === 4) body = (
    <ImportStep title="One more check" sub="Final confirmation before replacing your data.">
      <div style={{ background: 'var(--rose-bg)', border: '1.5px solid var(--rose-line)', borderRadius: 14, padding: 18 }}>
        <div className="h-display" style={{ fontSize: 22, color: 'var(--rose)', marginBottom: 8 }}>Are you absolutely sure?</div>
        <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55 }}>
          All current records in this app will be removed and rebuilt from {filename}. We recommend running an XLSX export from Settings → Data first.
        </div>
      </div>
    </ImportStep>
  );

  // Bottom action bar
  const primary = (() => {
    if (step === 0) return null; // upload step has its own button
    if (step === 1) return { label: 'Continue', onClick: next };
    if (step === 2) return null;
    if (step === 3) return mode === 'replace'
      ? { label: 'Continue', onClick: next, danger: true }
      : { label: 'Apply import', onClick: () => { toast(`Merge complete \u00b7 ${totalRows} rows imported`); go(-1); } };
    if (step === 4) return { label: 'Yes, replace my data', onClick: () => { toast(`Replace complete \u00b7 ${totalRows} rows imported`); go(-1); }, danger: true };
  })();

  return (
    <div>
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--line)' }}>
        <button onClick={back} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="Back">
          <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="var(--ink)" /></span>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 19, color: 'var(--ink)' }}>Import from spreadsheet</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>Step {Math.min(step + 1, 4)} of 4</div>
        </div>
      </div>
      <div style={{ padding: '8px 14px 30px' }}>
        {body}
      </div>
      {primary && (
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 26px', background: 'linear-gradient(180deg, transparent, var(--bg) 22%)' }}>
          <button onClick={primary.onClick} style={{ ...window.blBtnReset, cursor: 'pointer', width: '100%', padding: 16, borderRadius: 15, background: primary.danger ? 'var(--rose)' : 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 600, boxShadow: primary.danger ? '0 6px 18px rgba(155,84,96,0.4)' : '0 6px 18px var(--accent-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {primary.label}<Icon name="chevron" size={18} stroke="#fff" sw={2.2} />
          </button>
        </div>
      )}
    </div>
  );
}

function ImportStep({ title, sub, children }) {
  return (
    <div style={{ padding: '6px 4px 0' }}>
      <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 24, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 16 }}>{sub}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}
function ImportInfoCard({ children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', boxShadow: 'var(--shadow-sm)' }}>
      {children}
    </div>
  );
}
const importModeBtn = (active, danger) => ({
  ...window.blBtnReset, cursor: 'pointer', textAlign: 'left',
  background: 'var(--surface)',
  border: active ? `1.5px solid ${danger ? 'var(--rose)' : 'var(--accent)'}` : '1px solid var(--line)',
  borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12,
  boxShadow: active ? `0 4px 14px ${danger ? 'rgba(155,84,96,0.16)' : 'var(--accent-shadow)'}` : 'var(--shadow-sm)',
});
const importModeIcon = (bg) => ({
  width: 38, height: 38, borderRadius: 10, background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
});

Object.assign(window, { ImportScreen });
