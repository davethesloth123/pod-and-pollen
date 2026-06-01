// flows.jsx — Pod & Pollen add/edit flows (sheets)
// Exports: AddIrisFlow, QuickNoteFlow, AddPhotoFlow, StageSheet
const { useState: useStateF } = React;

function FLabel({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 7 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{children}</span>
      {hint && <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>{hint}</span>}
    </div>
  );
}
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '14px 15px', borderRadius: 13,
  border: '1px solid var(--line-2)', background: 'var(--surface)', fontSize: 16,
  fontFamily: 'Lexend, sans-serif', color: 'var(--ink)', outline: 'none',
};
function FInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function FArea(props) { return <textarea {...props} style={{ ...inputStyle, resize: 'none', lineHeight: 1.45, ...(props.style || {}) }} />; }
function FSelect({ value, onChange, options, placeholder, disabled, style }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value || ''} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 40,
          background: disabled ? 'var(--surface-2)' : 'var(--surface)',
          color: disabled ? 'var(--ink-4)' : (value ? 'var(--ink)' : 'var(--ink-4)'),
          cursor: disabled ? 'not-allowed' : 'pointer', ...(style || {}) }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: disabled ? 'var(--ink-4)' : 'var(--ink-3)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </span>
    </div>
  );
}

function ChoiceRow({ options, value, onChange, wrap }) {
  return (
    <div style={{ display: 'flex', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 8, overflowX: wrap ? 'visible' : 'auto', scrollbarWidth: 'none', margin: wrap ? 0 : '0 -2px', padding: '0 2px 2px' }}>
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)} style={{ ...blBtnReset, cursor: 'pointer', flexShrink: 0,
          padding: '10px 15px', borderRadius: 999, fontSize: 14.5, fontWeight: 500,
          background: value === o ? 'var(--accent)' : 'var(--surface)', color: value === o ? '#fff' : 'var(--ink-2)',
          border: `1px solid ${value === o ? 'var(--accent)' : 'var(--line-2)'}` }}>{o}</button>
      ))}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...blBtnReset, width: '100%', cursor: disabled ? 'default' : 'pointer',
      padding: '16px', borderRadius: 15, background: disabled ? 'var(--line-2)' : 'var(--accent)', color: '#fff',
      fontSize: 16.5, fontWeight: 600, boxShadow: disabled ? 'none' : '0 6px 16px var(--accent-shadow)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{children}</button>
  );
}

function PhotoDrop({ tall }) {
  return (
    <div style={{ width: '100%', height: tall ? 200 : 130, borderRadius: 16, border: '1.5px dashed var(--line-2)',
      background: 'var(--surface-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
      <span style={{ width: 50, height: 50, borderRadius: 999, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="camera" size={26} stroke="var(--accent)" sw={1.8} />
      </span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-2)' }}>Take or choose a photo</span>
      <span style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>Uses your camera or photo library</span>
    </div>
  );
}

// ── ADD IRIS ──────────────────────────────────────────────
// If presetCross is provided (Cross detail \u2192 "Add seedling from this cross"),
// the flow opens in Seedling mode with pod/pollen parents pre-filled and locked.
function AddIrisFlow({ open, onClose, onSaved, presetCross }) {
  const [name, setName] = useStateF('');
  const [kind, setKind] = useStateF(presetCross ? 'Seedling' : 'Variety');
  const [status, setStatus] = useStateF('Growing');
  const [classification, setClassification] = useStateF('');
  const [classificationOther, setClassificationOther] = useStateF('');
  const [colorType, setColorType] = useStateF('');
  const [location, setLocation] = useStateF('');
  const [grid, setGrid] = useStateF('');
  const [podParent, setPodParent] = useStateF(presetCross?.pod || '');
  const [pollenParent, setPollenParent] = useStateF(presetCross?.pollen || '');
  const [notes, setNotes] = useStateF('');
  const [adv, setAdv] = useStateF(!!presetCross);

  React.useEffect(() => {
    if (open) {
      setName(''); setStatus('Growing'); setClassification(''); setClassificationOther('');
      setColorType(''); setLocation(''); setGrid(''); setNotes('');
      if (presetCross) {
        setKind('Seedling');
        setPodParent(presetCross.pod || '');
        setPollenParent(presetCross.pollen || '');
        setAdv(true);
      } else {
        setKind('Variety');
        setPodParent(''); setPollenParent('');
        setAdv(false);
      }
    }
  }, [open, presetCross]);

  const locationOptions = (BL.locations || []).map(l => l.name);
  const gardenSetup = locationOptions.length > 0;
  const classificationsList = BL.IRIS_CLASSIFICATIONS;
  const colorTypeList = BL.IRIS_COLOR_TYPES;
  const statusList = BL.STATUS_OPTIONS;

  return (
    <Sheet open={open} onClose={onClose} title={presetCross ? `Add seedling from ${presetCross.code}` : 'Add an iris'} height="92%">
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {presetCross && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 13, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)' }}>
            <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="dna" size={18} stroke="#fff" sw={1.9} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Parentage locked to</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{presetCross.pod} × {presetCross.pollen}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Cross {presetCross.code}</div>
            </div>
          </div>
        )}
        <PhotoDrop />
        <div>
          <FLabel hint="required">{presetCross ? 'Seedling code' : 'Name or seedling code'}</FLabel>
          <FInput value={name} onChange={e => setName(e.target.value)} placeholder={presetCross ? `e.g. ${presetCross.code} A` : 'e.g. Dusky Challenger or GI-26-01'} />
        </div>
        {!presetCross && (
          <div>
            <FLabel>This record is a</FLabel>
            <ChoiceRow options={['Variety', 'Seedling']} value={kind} onChange={setKind} wrap />
          </div>
        )}
        <div>
          <FLabel>Status</FLabel>
          <FSelect value={status} onChange={setStatus} options={statusList} placeholder="Choose a status" />
        </div>

        {/* Classification + Color type — side by side on wider phones, stack on narrow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div>
            <FLabel>Classification</FLabel>
            <FSelect value={classification} onChange={setClassification} options={classificationsList} placeholder="Choose…" />
            {classification === 'Other' && (
              <div style={{ marginTop: 8 }}>
                <FInput value={classificationOther} onChange={e => setClassificationOther(e.target.value)} placeholder="Type a classification" />
              </div>
            )}
          </div>
          <div>
            <FLabel>Color type</FLabel>
            <FSelect value={colorType} onChange={setColorType} options={colorTypeList} placeholder="Choose…" />
          </div>
        </div>

        {/* Location + grid reference */}
        <div>
          <FLabel hint={gardenSetup ? 'optional' : 'set up garden first'}>Location</FLabel>
          <FSelect value={location} onChange={setLocation} options={locationOptions} placeholder={gardenSetup ? 'Choose a location' : 'No locations yet'} disabled={!gardenSetup} />
          {!gardenSetup && (
            <div style={{ marginTop: 8, padding: '11px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="pin" size={17} stroke="var(--accent)" sw={2} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>Set up your garden first to assign locations.</span>
            </div>
          )}
        </div>
        <div>
          <FLabel hint="optional">Grid reference</FLabel>
          <FInput value={grid} onChange={e => setGrid(e.target.value)} placeholder="e.g. B4 or Row C · 3" />
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 6, lineHeight: 1.4 }}>
            A short reference so you can find this plant in the bed. Free text — use whatever convention works for you.
          </div>
        </div>

        <button onClick={() => setAdv(!adv)} style={{ ...blBtnReset, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 14.5, fontWeight: 600, padding: '4px 0' }}>
          <Icon name="sliders" size={18} stroke="var(--accent)" sw={1.9} />
          {adv ? 'Hide parentage & notes' : 'Add parentage & notes'}
          <Icon name="chevron" size={15} stroke="var(--accent)" style={{ transform: adv ? 'rotate(90deg)' : 'rotate(0)' }} />
        </button>
        {adv && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 0 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div><FLabel>Pod parent</FLabel><FInput value={podParent} onChange={e => setPodParent(e.target.value)} placeholder="Optional" /></div>
              <div><FLabel>Pollen parent</FLabel><FInput value={pollenParent} onChange={e => setPollenParent(e.target.value)} placeholder="Optional" /></div>
            </div>
            <div><FLabel hint="optional">Notes</FLabel><FArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything worth remembering…" /></div>
          </div>
        )}
        <div style={{ marginTop: 4 }}>
          <PrimaryBtn disabled={!name.trim()} onClick={() => onSaved(name)}>
            <Icon name="check" size={20} stroke="#fff" sw={2.2} />Save iris
          </PrimaryBtn>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', marginTop: 11 }}>Only a name is required. You can fill in the rest any time.</div>
        </div>
      </div>
    </Sheet>
  );
}

// ── QUICK NOTE ────────────────────────────────────────────
function QuickNoteFlow({ open, onClose, onSaved, iris }) {
  const [type, setType] = useStateF('Flowering');
  const [text, setText] = useStateF('');
  return (
    <Sheet open={open} onClose={onClose} title="Quick note">
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {iris && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 10, background: 'var(--surface)', borderRadius: 13, border: '1px solid var(--line)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={10} /></div>
            <div><div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Note for</div><div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{iris.name}</div></div>
          </div>
        )}
        <div>
          <FLabel>Type</FLabel>
          <ChoiceRow options={BL.noteTypes} value={type} onChange={setType} />
        </div>
        <div>
          <FLabel>Note</FLabel>
          <FArea autoFocus rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="What did you notice today?" />
        </div>
        <button style={{ ...blBtnReset, cursor: 'pointer', display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 600 }}>
          <Icon name="camera" size={18} stroke="var(--accent)" sw={1.9} />Attach photo
        </button>
        <PrimaryBtn disabled={!text.trim()} onClick={() => onSaved(type)}>
          <Icon name="check" size={20} stroke="#fff" sw={2.2} />Save note
        </PrimaryBtn>
      </div>
    </Sheet>
  );
}

// ── ADD PHOTO ─────────────────────────────────────────────
function AddPhotoFlow({ open, onClose, onSaved, iris }) {
  const [cat, setCat] = useStateF('Main flower');
  const [saveToRoll, setSaveToRoll] = useStateF(true);
  const cats = ['Main flower', 'Parent', 'Seedling', 'Whole plant', 'Stem', 'Foliage / disease', 'Registration'];
  return (
    <Sheet open={open} onClose={onClose} title="Add photo" height="auto">
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {iris && (
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>Adding to <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{iris.name}</span></div>
        )}
        <PhotoDrop tall />
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={btnHalf}><Icon name="camera" size={20} stroke="#fff" sw={1.9} />Take photo</button>
          <button style={{ ...btnHalf, background: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line-2)' }}>
            <Icon name="upload" size={20} stroke="var(--accent)" sw={1.9} />Choose
          </button>
        </div>
        <div>
          <FLabel>Photo category</FLabel>
          <ChoiceRow options={cats} value={cat} onChange={setCat} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', cursor: 'pointer' }}>
          <input type="checkbox" checked={saveToRoll} onChange={e => setSaveToRoll(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Also save to camera roll</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1, lineHeight: 1.4 }}>Useful if a photo is accidentally assigned to the wrong record.</div>
          </div>
        </label>
        <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <Icon name="upload" size={14} stroke="var(--ink-3)" sw={2} />
          <span style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.45 }}>
            Large photos will be resized automatically before upload to keep things fast in the field.
          </span>
        </div>
        <PrimaryBtn onClick={() => onSaved(cat)}><Icon name="check" size={20} stroke="#fff" sw={2.2} />Save photo</PrimaryBtn>
      </div>
    </Sheet>
  );
}
const btnHalf = { ...window.blBtnReset, flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', borderRadius: 13, background: 'var(--accent)', color: '#fff', fontSize: 15.5, fontWeight: 600 };

// ── LIFECYCLE STAGE DETAIL ────────────────────────────────
function StageSheet({ open, onClose, iris, stage }) {
  if (!stage) return null;
  const x = iris && BL.crosses[iris.cross];
  const b = iris && BL.seedBatches[iris.seedBatch];
  let rows = [];
  if (stage.key === 'cross' && x) rows = [['Season', x.season], ['Pod parent', x.pod], ['Pollen parent', x.pollen], ['Cross date', x.date], ['Pod number', x.podNo], ['Notes', x.notes]];
  else if (stage.key === 'seedpod' && b) rows = [['Harvest date', b.harvest], ['Seeds in pod', b.seeds], ['Source', 'Own cross']];
  else if (stage.key === 'seedbatch' && b) rows = [['Treatment', b.treatment], ['Sown', b.sown], ['Seed quantity', b.seeds]];
  else if (stage.key === 'germ' && b) rows = [['First germination', b.germ], ['Germinated', `${b.germinated} of ${b.seeds}`], ['Germination rate', `${b.germPct}%`], ['Repotted', b.repot], ['Planted out', b.plantedOut]];
  else if (stage.key === 'parentage') rows = [['Pod parent', iris.podParent], ['Pollen parent', iris.pollenParent]];
  else if (stage.key === 'firstflower') rows = [['First flowered', iris.firstFlower || 'Not yet'], ['Height', iris.height], ['Season', iris.season]];
  else rows = [['Detail', stage.detail || 'No record yet']];

  return (
    <Sheet open={open} onClose={onClose} title={stage.label}>
      <div style={{ padding: '8px 18px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, margin: '6px 0 16px' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={stage.icon} size={24} stroke="var(--accent)" sw={1.9} />
          </span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{iris.name}</div>
            <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 600 }}>{stage.short}</div>
          </div>
        </div>
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--line)', padding: '2px 16px 8px' }}>
          {rows.map(([k, v], i) => <Field key={i} label={k} value={String(v)} />)}
        </div>
        <div style={{ marginTop: 16 }}>
          <PrimaryBtn onClick={onClose}><Icon name="check" size={20} stroke="#fff" sw={2.2} />Done</PrimaryBtn>
        </div>
      </div>
    </Sheet>
  );
}

// ── ADD LOCATION (Garden builder) ─────────────────────────
function AddLocationFlow({ open, onClose, onSaved }) {
  const [name, setName] = useStateF('');
  const [kind, setKind] = useStateF('Bed');
  const [size, setSize] = useStateF('');
  const [notes, setNotes] = useStateF('');
  const kinds = ['Bed', 'Border', 'Trial area', 'Greenhouse', 'Pots', 'Holding', 'Other'];
  return (
    <Sheet open={open} onClose={onClose} title="Add a location" height="auto">
      <div style={{ padding: '16px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <FLabel hint="required">Name</FLabel>
          <FInput value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bed A, Long Border, Greenhouse" />
        </div>
        <div>
          <FLabel>Type</FLabel>
          <FSelect value={kind} onChange={setKind} options={kinds} />
        </div>
        <div>
          <FLabel hint="optional">Size or layout</FLabel>
          <FInput value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. 6 m × 2 m, or 3 rows × 8 cols" />
        </div>
        <div>
          <FLabel hint="optional">Notes</FLabel>
          <FArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Sun, soil, drainage, anything else worth remembering." />
        </div>

        <div style={{ padding: '11px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Icon name="pin" size={17} stroke="var(--accent)" sw={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>About grid references</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
              Grid references are set on each plant record, not the bed. Use whatever convention works — “B4”, “Row C · 3”, or just a short note. They help you locate a plant within this location.
            </div>
          </div>
        </div>

        <PrimaryBtn disabled={!name.trim()} onClick={() => onSaved({ name, kind, size, notes })}>
          <Icon name="check" size={20} stroke="#fff" sw={2.2} />Save location
        </PrimaryBtn>
      </div>
    </Sheet>
  );
}

Object.assign(window, { AddIrisFlow, QuickNoteFlow, AddPhotoFlow, StageSheet, AddLocationFlow });

// ════════════════════════════════════════════════════════════
// EVALUATION — structured BIS-style scoring
// ════════════════════════════════════════════════════════════
function EvaluationFlow({ open, onClose, onSaved, iris }) {
  const initial = (iris && BL.latestEval(iris.id)) || { date: 'Today', scores: {}, outcome: 'Watch', notes: '' };
  const [scores, setScores] = useStateF(initial.scores);
  const [outcome, setOutcome] = useStateF(initial.outcome);
  const [notes, setNotes] = useStateF(initial.notes);
  const setScore = (k, v) => setScores(s => ({ ...s, [k]: v }));
  const filled = Object.keys(scores).length;
  const totalCriteria = BL.EVAL_GROUPS.reduce((a, g) => a + g.items.length, 0);
  const avg = filled ? BL.evalAverage(scores) : 0;
  return (
    <Sheet open={open} onClose={onClose} title="Evaluate seedling" height="94%">
      <div style={{ padding: '14px 18px 26px' }}>
        {iris && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 11, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={11} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{iris.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{iris.podParent} × {iris.pollenParent}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>{avg ? avg.toFixed(1) : '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{filled} / {totalCriteria} scored</div>
            </div>
          </div>
        )}

        {BL.EVAL_GROUPS.map(g => (
          <div key={g.group} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 10px' }}>
              <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.8 }}>{g.group}</span>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: '4px 14px', boxShadow: 'var(--shadow-sm)' }}>
              {g.items.map((it, i) => (
                <div key={it.k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
                  borderBottom: i < g.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)' }}>{it.label}</div>
                    {it.hint && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 1 }}>{it.hint}</div>}
                  </div>
                  <RatingDots value={scores[it.k] || 0} onChange={(v) => setScore(it.k, v)} size={26} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 16 }}>
          <FLabel>Outcome</FLabel>
          <ChoiceRow options={BL.EVAL_OUTCOMES} value={outcome} onChange={setOutcome} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <FLabel>Notes</FLabel>
          <FArea rows={4} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Form, substance, distinctiveness, garden appeal — anything to remember for next year." />
        </div>
        <PrimaryBtn onClick={() => onSaved({ avg, outcome })}>
          <Icon name="check" size={20} stroke="#fff" sw={2.2} />Save evaluation
        </PrimaryBtn>
      </div>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════
// RECORD FLOWERING — annual flowering record
// ════════════════════════════════════════════════════════════
function todayDMY() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function RecordFloweringFlow({ open, onClose, onSaved, iris }) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useStateF(thisYear);
  const [first, setFirst] = useStateF(todayDMY());
  const [last, setLast] = useStateF('');
  const [stillFlowering, setStillFlowering] = useStateF(true);
  const [stems, setStems] = useStateF('');
  const [buds, setBuds] = useStateF('');
  const [height, setHeight] = useStateF('');
  const [notes, setNotes] = useStateF('');

  const yearOptions = [thisYear - 2, thisYear - 1, thisYear].map(String);
  return (
    <Sheet open={open} onClose={onClose} title="Record flowering">
      <div style={{ padding: '16px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {iris && <FlowHeader iris={iris} blurb="Add or update an annual flowering record" />}
        <div>
          <FLabel>Year</FLabel>
          <ChoiceRow options={yearOptions} value={String(year)} onChange={(v) => setYear(parseInt(v, 10))} />
        </div>
        <div>
          <FLabel hint="DD/MM/YYYY">First flower</FLabel>
          <FInput value={first} onChange={e => setFirst(e.target.value)} placeholder="e.g. 14/05/2026" />
        </div>
        <div>
          <FLabel hint="DD/MM/YYYY">Last flower</FLabel>
          <FInput value={last} onChange={e => { setLast(e.target.value); if (e.target.value) setStillFlowering(false); }} placeholder="e.g. 28/05/2026" disabled={stillFlowering} style={stillFlowering ? { background: 'var(--surface-2)', color: 'var(--ink-4)' } : null} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-2)' }}>
            <input type="checkbox" checked={stillFlowering} onChange={e => { setStillFlowering(e.target.checked); if (e.target.checked) setLast(''); }} style={{ width: 17, height: 17, accentColor: 'var(--accent)' }} />
            Still flowering
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div><FLabel hint="optional">Stems</FLabel><FInput type="number" value={stems} onChange={e => setStems(e.target.value)} placeholder="3" /></div>
          <div><FLabel hint="optional">Buds</FLabel><FInput type="number" value={buds} onChange={e => setBuds(e.target.value)} placeholder="9" /></div>
          <div><FLabel hint="cm">Height</FLabel><FInput type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="92" /></div>
        </div>
        <div>
          <FLabel hint="optional">Notes</FLabel>
          <FArea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Branching, substance, weather, anything to remember." />
        </div>
        <button style={attachBtn}><Icon name="camera" size={18} stroke="var(--accent)" sw={1.9} />Attach photo</button>
        <PrimaryBtn disabled={!first.trim()} onClick={() => onSaved(first)}>
          <Icon name="flower" size={20} stroke="#fff" sw={2} />Save flowering record
        </PrimaryBtn>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)' }}>
          Saves under {year}. The average flowering period is recalculated from completed years.
        </div>
      </div>
    </Sheet>
  );
}

// ════════════════════════════════════════════════════════════
// RECORD POLLINATION — creates a new cross
// If iris is provided, that plant is one of the parents (you pick the other).
// If iris is null (Crosses screen → "Record a new cross"), pick both parents.
// ════════════════════════════════════════════════════════════
function RecordPollinationFlow({ open, onClose, onSaved, iris }) {
  const noFocus = !iris;
  const [role, setRole] = useStateF('Pod');
  const [other, setOther] = useStateF('');
  const [pod, setPod] = useStateF('');
  const [pollen, setPollen] = useStateF('');
  const [date, setDate] = useStateF('Today');
  const [podNo, setPodNo] = useStateF('');
  React.useEffect(() => { if (open) { setRole('Pod'); setOther(''); setPod(''); setPollen(''); setDate('Today'); setPodNo(''); } }, [open, iris]);
  const candidates = BL.irises.filter(i => i.kind === 'Variety' && i.id !== iris?.id).map(i => i.name);
  const canSave = noFocus ? (pod.trim() && pollen.trim()) : !!other.trim();
  const savedLabel = noFocus ? `${pod} × ${pollen}` : other;

  return (
    <Sheet open={open} onClose={onClose} title={noFocus ? 'Record a new cross' : 'Record pollination'} height="auto">
      <div style={{ padding: '16px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {iris && <FlowHeader iris={iris} blurb="Creating a new cross" />}
        {!iris && (
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, padding: '11px 13px', background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', borderRadius: 12 }}>
            Pick the pod and pollen parents from your collection (or type a name).
          </div>
        )}
        {!noFocus && (
          <>
            <div>
              <FLabel>This plant is the</FLabel>
              <ChoiceRow options={['Pod parent', 'Pollen parent']} value={role + ' parent'} onChange={(v) => setRole(v.split(' ')[0])} wrap />
            </div>
            <div>
              <FLabel>{role === 'Pod' ? 'Pollen parent' : 'Pod parent'}</FLabel>
              <div style={{ position: 'relative' }}>
                <FInput value={other} onChange={e => setOther(e.target.value)} placeholder="Search your collection, or type a name…" />
                {!other && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>
                    {candidates.slice(0, 4).map(n => (
                      <button key={n} onClick={() => setOther(n)} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '7px 11px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', fontSize: 13, color: 'var(--ink-2)' }}>{n}</button>
                    ))}
                    <button onClick={() => setOther('Unknown / bee')} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '7px 11px', borderRadius: 999, background: 'var(--surface)', border: '1px dashed var(--line-2)', fontSize: 13, color: 'var(--ink-3)' }}>+ Unknown / bee</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {noFocus && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <FLabel>Pod parent</FLabel>
              <FInput value={pod} onChange={e => setPod(e.target.value)} placeholder="e.g. Dusky Challenger" />
            </div>
            <div>
              <FLabel>Pollen parent</FLabel>
              <FInput value={pollen} onChange={e => setPollen(e.target.value)} placeholder="e.g. Edith Wolford" />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1.4 }}><FLabel>Date</FLabel><ChoiceRow options={['Today', 'Yesterday', 'Earlier']} value={date} onChange={setDate} /></div>
          <div style={{ flex: 1 }}><FLabel hint="optional">Pod #</FLabel><FInput value={podNo} onChange={e => setPodNo(e.target.value)} placeholder="e.g. 01" /></div>
        </div>
        <PrimaryBtn disabled={!canSave} onClick={() => onSaved(savedLabel)}>
          <Icon name="droplet" size={20} stroke="#fff" sw={2} />Save cross
        </PrimaryBtn>
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)' }}>A new cross record will be created. You can add seedlings to it any time.</div>
      </div>
    </Sheet>
  );
}

function FlowHeader({ iris, blurb }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 10, background: 'var(--surface)', borderRadius: 13, border: '1px solid var(--line)' }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={10} /></div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{blurb}</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>{iris.name}</div>
      </div>
    </div>
  );
}
const attachBtn = { ...window.blBtnReset, cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 600 };

// ════════════════════════════════════════════════════════════
// PHOTO VIEWER — fullscreen swipeable, with manage menu
// ════════════════════════════════════════════════════════════
function PhotoViewer({ open, onClose, photos = [], startIndex = 0, onAction }) {
  const [i, setI] = useStateF(startIndex);
  const [menu, setMenu] = useStateF(null); // 'menu' | 'delete' | 'category' | 'move'
  React.useEffect(() => { setI(startIndex); setMenu(null); }, [startIndex, open]);
  if (!open || !photos.length) return null;
  const p = photos[i];
  const pal = BL.PAL[p.pal] || BL.PAL.deepPurple;
  const prev = () => setI(x => (x - 1 + photos.length) % photos.length);
  const next = () => setI(x => (x + 1) % photos.length);
  const handle = (action, payload) => {
    setMenu(null);
    onAction && onAction(action, p, payload);
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 95, background: '#0E0817', display: 'flex', flexDirection: 'column', animation: 'blFade .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 6px', color: '#fff' }}>
        <button onClick={onClose} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="Close">
          <span style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={22} stroke="#fff" /></span>
        </button>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8 }}>{i + 1} / {photos.length}</div>
        <button onClick={() => setMenu('menu')} style={{ ...window.blBtnReset, cursor: 'pointer' }} aria-label="More">
          <span style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="more" size={22} stroke="#fff" /></span>
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 380, aspectRatio: '1 / 1', borderRadius: 18, overflow: 'hidden' }}>
          <IrisBloom s={pal.s} f={pal.f} beard={pal.beard} r={18} />
        </div>
        {photos.length > 1 && (
          <>
            <button onClick={prev} style={{ ...window.blBtnReset, cursor: 'pointer', position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}><span style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={22} stroke="#fff" /></span></button>
            <button onClick={next} style={{ ...window.blBtnReset, cursor: 'pointer', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}><span style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron" size={22} stroke="#fff" /></span></button>
          </>
        )}
      </div>
      <div style={{ padding: '12px 22px 30px', color: '#fff' }}>
        <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>{p.cat}</div>
        <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18 }}>{p.cap}</div>
      </div>

      {/* Action menu / confirm / picker overlays */}
      {menu && (
        <div onClick={() => setMenu(null)} style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: 'var(--bg)', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '8px 0 18px', maxHeight: '75%', overflow: 'auto', animation: 'blSheet .25s ease' }}>
            <div style={{ width: 36, height: 4, background: 'var(--line-2)', borderRadius: 4, margin: '7px auto 12px' }} />
            {menu === 'menu' && (
              <div style={{ padding: '0 18px' }}>
                <PhotoMenuRow icon="tag" label="Change category" sub={`Currently \u2018${p.cat}\u2019`} onClick={() => setMenu('category')} />
                <PhotoMenuRow icon="arrow-right" label="Move to another iris" sub="Reassign this photo to a different record" onClick={() => setMenu('move')} />
                <PhotoMenuRow icon="upload" label="Save to camera roll" sub="Copy this photo to your device library" onClick={() => handle('saveToRoll')} />
                <PhotoMenuRow icon="x" label="Delete photo" sub="Remove from this iris record" danger onClick={() => setMenu('delete')} isLast />
              </div>
            )}
            {menu === 'delete' && (
              <div style={{ padding: '4px 22px 8px' }}>
                <div className="h-display" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 6 }}>Delete this photo?</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: 18 }}>
                  This will remove the photo from this iris record. The original on your device is unaffected.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setMenu(null)} style={{ ...window.blBtnReset, cursor: 'pointer', flex: 1, padding: '14px', borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', fontSize: 15, fontWeight: 600 }}>Cancel</button>
                  <button onClick={() => handle('delete')} style={{ ...window.blBtnReset, cursor: 'pointer', flex: 1, padding: '14px', borderRadius: 13, background: 'var(--rose)', color: '#fff', fontSize: 15, fontWeight: 600 }}>Delete photo</button>
                </div>
              </div>
            )}
            {menu === 'category' && (
              <div style={{ padding: '4px 22px 8px' }}>
                <div className="h-display" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 12 }}>Change category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {BL.PHOTO_CATS.map(c => (
                    <button key={c} onClick={() => handle('category', c)} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '13px 14px', borderRadius: 12, background: c === p.cat ? 'var(--accent-bg)' : 'var(--surface)', border: c === p.cat ? '1.5px solid var(--accent)' : '1px solid var(--line)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="tag" size={15} stroke="var(--accent)" sw={1.9} /></span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{c}</span>
                      {c === p.cat && <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>Current</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {menu === 'move' && (
              <div style={{ padding: '4px 22px 8px' }}>
                <div className="h-display" style={{ fontSize: 20, color: 'var(--ink)', marginBottom: 6 }}>Move to another iris</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.4 }}>
                  Pick the iris that should own this photo. Useful if it was assigned to the wrong record.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '40vh', overflow: 'auto' }}>
                  {BL.irises.slice(0, 10).map(iris => (
                    <button key={iris.id} onClick={() => handle('move', iris.id)} style={{ ...window.blBtnReset, cursor: 'pointer', padding: '11px 12px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--line)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}><IrisThumb iris={iris} r={8} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{iris.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{iris.cls} · {iris.loc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoMenuRow({ icon, label, sub, onClick, danger, isLast }) {
  return (
    <button onClick={onClick} style={{ ...window.blBtnReset, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', borderBottom: isLast ? 'none' : '1px solid var(--line)' }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: danger ? 'var(--rose-bg)' : 'var(--accent-bg)', border: `1px solid ${danger ? 'var(--rose-line)' : 'var(--accent-line)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon === 'arrow-right' ? 'chevron' : icon} size={17} stroke={danger ? 'var(--rose)' : 'var(--accent)'} sw={2} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: danger ? 'var(--rose)' : 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>}
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// EVALUATION HISTORY — view-only with edit confirmation
// ════════════════════════════════════════════════════════════
function EvalHistorySheet({ open, onClose, iris, onEdit }) {
  const [editFor, setEditFor] = useStateF(null); // year being confirmed
  if (!iris) return null;
  const all = (BL.evaluations[iris.id] || []).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
  return (
    <Sheet open={open} onClose={onClose} title="Evaluation history" height="92%">
      <div style={{ padding: '12px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {iris && <FlowHeader iris={iris} blurb={`${all.length} evaluation${all.length === 1 ? '' : 's'} on record`} />}

        {all.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--ink-3)', background: 'var(--surface)', border: '1px dashed var(--line-2)', borderRadius: 16 }}>
            No evaluations recorded yet.
          </div>
        ) : all.map((e, idx) => {
          const avg = BL.evalAverage(e.scores);
          return (
            <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 26, color: 'var(--accent)', lineHeight: 1 }}>{e.year}</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{e.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>{avg.toFixed(1)}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>/ 5 average</span>
                  </div>
                </div>
                <span style={{ padding: '5px 11px', borderRadius: 999, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-line)', fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{e.outcome}</span>
              </div>

              {/* scores breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '2px 12px', marginBottom: 12 }}>
                {BL.EVAL_GROUPS.map(g => g.items.map((it, i) => (
                  <div key={`${g.group}-${it.k}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{it.label}</div>
                    </div>
                    <RatingDots value={e.scores[it.k] || 0} size={14} readOnly />
                  </div>
                )))}
              </div>

              {e.notes && (
                <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, padding: '4px 0 10px' }}>
                  “{e.notes}”
                </div>
              )}

              {editFor === idx ? (
                <div style={{ padding: '12px 13px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)' }}>
                  <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, marginBottom: 5 }}>Edit this evaluation?</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 11 }}>
                    Historical scores are usually kept unchanged so you can compare seasons accurately.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditFor(null)} style={{ ...window.blBtnReset, cursor: 'pointer', flex: 1, padding: '11px 14px', borderRadius: 11, background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', fontSize: 14, fontWeight: 600 }}>Cancel</button>
                    <button onClick={() => { setEditFor(null); onEdit && onEdit(e); onClose(); }} style={{ ...window.blBtnReset, cursor: 'pointer', flex: 1, padding: '11px 14px', borderRadius: 11, background: 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600 }}>Edit evaluation</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditFor(idx)} style={{ ...window.blBtnReset, cursor: 'pointer', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-2)', fontSize: 13, fontWeight: 600 }}>
                  <Icon name="sliders" size={15} stroke="var(--accent)" sw={2} />Edit evaluation
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}

Object.assign(window, { EvaluationFlow, RecordFloweringFlow, RecordPollinationFlow, PhotoViewer, EvalHistorySheet });
