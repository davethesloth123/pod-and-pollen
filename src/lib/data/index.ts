'use client'
// ─────────────────────────────────────────────────────────────
// Pod & Pollen — sample data and app constants
// Mirrors the prototype's BL global, but as a proper ES module.
// ─────────────────────────────────────────────────────────────
import type { Iris, Location, Cross, SeedBatch, LifecycleStep, WidgetDef } from '@/types'

// ─── Color palettes ───────────────────────────────────────────
export const PAL: Record<string, { s: string[]; f: string[]; beard: string }> = {
  blackViolet: { s: ['#4a2d6b', '#1c0f2e'], f: ['#2a153f', '#0d0618'], beard: '#3a2358' },
  deepPurple:  { s: ['#7b4fc4', '#3f2470'], f: ['#5a2f9e', '#2a1450'], beard: '#e9c24b' },
  blueViolet:  { s: ['#7d8fe0', '#4253b0'], f: ['#5566c9', '#2d3a8c'], beard: '#e6b94a' },
  skyBlue:     { s: ['#cfe0f5', '#9db9e6'], f: ['#a9c4ee', '#5f86c9'], beard: '#f0d36b' },
  yellowBlue:  { s: ['#f4d96a', '#e0b53c'], f: ['#8fa6e0', '#4a5fb0'], beard: '#e89a2a' },
  pink:        { s: ['#f4c3cf', '#e191a7'], f: ['#efb0c0', '#d77b95'], beard: '#e8893f' },
  white:       { s: ['#ffffff', '#e6e3ee'], f: ['#f7f5fb', '#d8d3e4'], beard: '#f3c24a' },
  plicata:     { s: ['#f3eff8', '#d9cfe8'], f: ['#ffffff', '#cdb9e0'], beard: '#e8b84b' },
  apricot:     { s: ['#f7d49a', '#e7a85c'], f: ['#f3c178', '#d98e3f'], beard: '#d96b2a' },
  burgundy:    { s: ['#8a4660', '#4e2236'], f: ['#6e3047', '#371320'], beard: '#d99a3a' },
}

// ─── Locations ────────────────────────────────────────────────
export const locations: Location[] = [
  { id: 'L1', name: 'Top Bed',      kind: 'Bed',        count: 14, sun: 'Full sun',   soil: 'Sandy loam', x: 20, y: 4,  w: 38, h: 22, shape: 'rect' },
  { id: 'L2', name: 'Long Border',  kind: 'Border',     count: 22, sun: 'Full sun',   soil: 'Clay loam',  x: 4,  y: 32, w: 64, h: 16, shape: 'rect' },
  { id: 'L3', name: 'Trial Bed',    kind: 'Trial area', count: 31, sun: 'Full sun',   soil: 'Improved',   x: 4,  y: 54, w: 44, h: 42, shape: 'rect' },
  { id: 'L4', name: 'Greenhouse',   kind: 'Greenhouse', count: 9,  sun: 'Glass',      soil: 'Pots',       x: 52, y: 54, w: 22, h: 18, shape: 'rect' },
  { id: 'L5', name: 'Holding Area', kind: 'Holding',    count: 18, sun: 'Part shade', soil: 'Pots',       x: 52, y: 78, w: 22, h: 18, shape: 'rect' },
  { id: 'L6', name: 'Pots — Patio', shortName: 'Patio', kind: 'Pots', count: 12, sun: 'Mixed', soil: 'Pots', x: 78, y: 32, w: 18, h: 64, shape: 'rect' },
]

// ─── Sample irises ────────────────────────────────────────────
export const irises: Iris[] = [
  {
    id: 'I1', name: 'Dusky Challenger', kind: 'Variety', cls: 'Tall Bearded', pal: 'blackViolet',
    status: 'Flowering', loc: 'Long Border', bed: 'Row B · 3',
    source: "Schreiner's, 2019", planted: 'Oct 2019', firstFlower: 'May 2021',
    colour: 'Deep blue-violet self, near-black falls', height: '99 cm', season: 'Mid', fragrance: 'Light',
    podParent: 'Navy Strut', pollenParent: "Titan's Glory",
    fav: true,
    firstEverFlower: '14/05/2021',
    floweringHistory: [
      { year: 2024, first: '12/05/2024', last: '01/06/2024', stems: 3, buds: 11, height: 99, notes: 'Mid season, three strong stems.' },
      { year: 2025, first: '08/05/2025', last: '24/05/2025', stems: 4, buds: 13, height: 100, notes: 'Earliest opening yet — warm April.' },
      { year: 2026, first: '10/05/2026', last: null,    stems: 3, buds: 12, height: 102, notes: 'Three stems open so far, exceptional substance.' },
    ],
    colorDef: {
      standards: 'Deep blue-violet, smooth velvety substance',
      falls: 'Near-black violet, slight blue undertone on flare',
      beard: 'Yellow at throat, tipped violet',
      styleArms: 'Dark violet, crested midrib',
    },
    notes: [
      { d: '18 May 2026', t: 'Flowering', x: 'Three stems open, exceptional substance this year. Best clump in the border.' },
      { d: '2 May 2026',  t: 'Health',    x: 'No sign of rot after the wet spring. Foliage clean.' },
      { d: '14 Apr 2025', t: 'Movement',  x: 'Divided original clump, three fans to Trial Bed.' },
    ],
  },
  {
    id: 'I2', name: 'Edith Wolford', kind: 'Variety', cls: 'Tall Bearded', pal: 'yellowBlue',
    status: 'Flowering', loc: 'Top Bed', bed: 'Row A · 1',
    source: 'Gift from R. Hale, 2020', planted: 'Sep 2020', firstFlower: 'May 2022',
    colour: 'Yellow standards, blue-violet falls (Dykes Medal 1993)', height: '94 cm', season: 'Early–Mid', fragrance: 'Moderate',
    podParent: 'Unknown', pollenParent: 'Unknown',
    fav: true,
    firstEverFlower: '14/05/2022',
    floweringHistory: [
      { year: 2024, first: '06/05/2024', last: '23/05/2024', stems: 3, buds: 10, height: 92, notes: 'Excellent branching.' },
      { year: 2025, first: '04/05/2025', last: '18/05/2025', stems: 4, buds: 12, height: 95, notes: 'Earlier start, shorter display.' },
      { year: 2026, first: '03/05/2026', last: null,    stems: 4, buds: 9,  height: 94, notes: '9 buds counted on lead stem.' },
    ],
    colorDef: {
      standards: 'Soft butter-yellow, lightly ruffled',
      falls: 'Rich blue-violet with darker veining at the throat',
      beard: 'Tangerine-yellow',
      styleArms: 'Pale yellow, flushed lilac at the tip',
    },
    notes: [
      { d: '16 May 2026', t: 'Flowering', x: 'Reliable as ever. Strong branching, 9 buds counted on lead stem.' },
      { d: '20 Apr 2026', t: 'Photo',     x: 'Whole-plant photo added before bloom.' },
    ],
  },
  {
    id: 'I3', name: 'Beverly Sills', kind: 'Variety', cls: 'Tall Bearded', pal: 'pink',
    status: 'Growing', loc: 'Top Bed', bed: 'Row A · 4',
    source: 'Woottens, 2021', planted: 'Sep 2021', firstFlower: 'May 2023',
    colour: 'Coral-pink self, tangerine beard', height: '89 cm', season: 'Mid', fragrance: 'Sweet',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [{ d: '10 May 2026', t: 'Health', x: 'Buds forming, slightly behind the others. Healthy fans.' }],
  },
  {
    id: 'I4', name: 'Superstition', kind: 'Variety', cls: 'Tall Bearded', pal: 'burgundy',
    status: 'Growing', loc: 'Long Border', bed: 'Row B · 7',
    source: "Schreiner's, 2018", planted: 'Oct 2018', firstFlower: 'May 2020',
    colour: 'Ebony burgundy-black self', height: '91 cm', season: 'Mid–Late', fragrance: 'None',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [{ d: '8 May 2026', t: 'General', x: 'Used as pollen parent for GI-26 crosses this season.' }],
  },
  {
    id: 'I5', name: "Jesse's Song", kind: 'Variety', cls: 'Tall Bearded', pal: 'plicata',
    status: 'Flowering', loc: 'Top Bed', bed: 'Row A · 6',
    source: 'Division from Dad, 2020', planted: 'Sep 2020', firstFlower: 'May 2022',
    colour: 'White ground, violet plicata margins', height: '90 cm', season: 'Mid', fragrance: 'Light',
    podParent: 'Unknown', pollenParent: 'Unknown',
    fav: true,
    notes: [{ d: '17 May 2026', t: 'Flowering', x: 'Plicata marking very crisp this year.' }],
  },
  {
    id: 'I6', name: 'Immortality', kind: 'Variety', cls: 'Tall Bearded (reblooming)', pal: 'white',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 2',
    source: 'Woottens, 2022', planted: 'Sep 2022', firstFlower: 'May 2023',
    colour: 'Pure white self, reliable rebloomer', height: '76 cm', season: 'Mid + Autumn', fragrance: 'Light',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [{ d: '6 May 2026', t: 'General', x: 'Watching for autumn rebloom — fed in April.' }],
  },
  {
    id: 'S1', name: 'GI-23-04 A', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'deepPurple',
    status: 'First flower', loc: 'Trial Bed', bed: 'Row C · 9',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: 'May 2026',
    colour: 'Rich grape-purple, gold beard — promising form', height: '86 cm', season: 'Mid', fragrance: 'Moderate',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    fav: true,
    notes: [
      { d: '22 May 2026', t: 'Evaluation', x: 'FIRST FLOWER. Excellent substance, ruffled falls, gold beard pops against the purple. Definitely a keeper — watch branching next year.' },
      { d: '21 May 2026', t: 'Photo',      x: 'First-flower photo captured at 8am, good light.' },
      { d: '3 Apr 2024',  t: 'Movement',   x: 'Planted out from final pots into Trial Bed, Row C.' },
    ],
  },
  {
    id: 'S2', name: 'GI-23-04 C', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'blueViolet',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 11',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: undefined,
    colour: 'Not yet flowered', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [{ d: '12 May 2026', t: 'General', x: 'Strong fans, no buds yet — likely first flower next season.' }],
  },
  {
    id: 'S3', name: 'GI-23-04 B', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'yellowBlue',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 10',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: undefined,
    colour: 'Not yet flowered — fans show yellow-tinted bases', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [{ d: '15 May 2026', t: 'General', x: 'Vigorous — widest fans of the batch. Curious whether the yellow basal tint hints at Edith influence.' }],
  },
  {
    id: 'S4', name: 'GI-23-04 D', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'burgundy',
    status: 'Watch', loc: 'Holding Area', bed: 'Pot 14',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: undefined,
    colour: 'Not yet flowered', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [{ d: '4 May 2026', t: 'Health', x: 'Slower than siblings. Moved to Holding Area to assess before deciding to retain.' }],
  },
  {
    id: 'S5', name: 'GI-22-01 A', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'apricot',
    status: 'First flower', loc: 'Trial Bed', bed: 'Row D · 1',
    source: 'Own cross', planted: 'Apr 2023', firstFlower: 'May 2024',
    colour: 'Warm apricot self, deep copper beard — ruffled falls', height: '92 cm', season: 'Mid', fragrance: 'Light sweet',
    cross: 'X5', seedBatch: 'B5', generation: 'F1',
    podParent: 'Edith Wolford', pollenParent: 'Beverly Sills',
    fav: true,
    firstEverFlower: '15/05/2024',
    floweringHistory: [
      { year: 2024, first: '15/05/2024', last: '02/06/2024', stems: 1, buds: 5, height: 90, notes: 'First flower. Apricot tone very pleasing, stems weak in wind.' },
      { year: 2025, first: '18/05/2025', last: '01/06/2025', stems: 2, buds: 8, height: 92, notes: 'Second flowering, stems firmer.' },
      { year: 2026, first: '20/05/2026', last: null,    stems: 2, buds: 9, height: 93, notes: 'Settled — considering for naming.' },
    ],
    colorDef: {
      standards: 'Warm apricot, gently ruffled edges',
      falls: 'Apricot with deeper copper haft, smooth substance',
      beard: 'Copper-orange, dense',
      styleArms: 'Apricot, tinged pink at the cusp',
    },
    notes: [
      { d: '20 May 2026', t: 'Evaluation', x: 'Third flowering — settled. Considering for naming. Possible working name: "Sunday Bells".' },
      { d: '18 May 2025', t: 'Evaluation', x: 'Second flowering — stems firmer this year, branching improved.' },
      { d: '15 May 2024', t: 'Evaluation', x: 'First flower — apricot tone is very pleasing. Stems a bit weak in wind.' },
    ],
  },
  {
    id: 'S6', name: 'GI-23-07 A', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'plicata',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 14',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: undefined,
    colour: 'Not yet flowered — fans show purple stippling at base', height: '—', season: '—', fragrance: '—',
    cross: 'X2', seedBatch: 'B2', generation: 'F1',
    podParent: "Jesse's Song", pollenParent: 'Superstition',
    notes: [{ d: '14 May 2026', t: 'General', x: 'Strongest fan of the X2 siblings. Purple base striping a hopeful sign.' }],
  },
]

// ─── Crosses ──────────────────────────────────────────────────
export const crosses: Record<string, Cross> = {
  X1: { id: 'X1', code: 'GI-23-04', season: '2023', pod: 'Dusky Challenger', pollen: 'Edith Wolford', date: '24 May 2023', podNo: '04', notes: 'Aiming for dark purple with strong branching. Pollen kept dry 2 days.', status: 'Evaluating', goal: 'Dark purple · strong branching' },
  X2: { id: 'X2', code: 'GI-23-07', season: '2023', pod: "Jesse's Song", pollen: 'Superstition', date: '26 May 2023', podNo: '07', notes: 'Plicata × black. Hoping for striking pattern.', status: 'Growing on', goal: 'Plicata pattern on dark ground' },
  X3: { id: 'X3', code: 'GI-24-02', season: '2024', pod: 'Beverly Sills', pollen: 'Edith Wolford', date: '18 May 2024', podNo: '02', notes: 'Pink × yellow-blue bicolour. Long shot.', status: 'Sown', goal: 'Pink with blue infusion' },
  X4: { id: 'X4', code: 'GI-24-05', season: '2024', pod: 'Dusky Challenger', pollen: 'Superstition', date: '22 May 2024', podNo: '05', notes: 'Two darks together. Looking for depth and substance.', status: 'Sown', goal: 'Near-black self' },
  X5: { id: 'X5', code: 'GI-22-01', season: '2022', pod: 'Edith Wolford', pollen: 'Beverly Sills', date: '18 May 2022', podNo: '01', notes: 'Tried for ruffled yellow-pink. Only one seedling worth keeping.', status: 'Archived', goal: 'Ruffled apricot bicolour' },
}

export const seedBatches: Record<string, SeedBatch> = {
  B1: { id: 'B1', cross: 'X1', harvest: '2 Aug 2023',  seeds: 31, treatment: 'Dried, then refrigerated 8 wks', sown: '14 Oct 2023', germ: '9 Feb 2024',  germinated: 19, germPct: 61, repot: '20 Mar 2024', plantedOut: '3 Apr 2024',  retained: 4, named: 0 },
  B2: { id: 'B2', cross: 'X2', harvest: '7 Aug 2023',  seeds: 18, treatment: 'Dried, then refrigerated 8 wks', sown: '14 Oct 2023', germ: '14 Feb 2024', germinated: 11, germPct: 61, repot: '20 Mar 2024', plantedOut: '3 Apr 2024',  retained: 6, named: 0 },
  B3: { id: 'B3', cross: 'X3', harvest: '4 Aug 2024',  seeds: 8,  treatment: 'Dried, refrigerated 8 wks',      sown: '12 Oct 2024', germ: 'pending',     germinated: 0,  germPct: 0,  repot: undefined, plantedOut: undefined,      retained: 0, named: 0 },
  B4: { id: 'B4', cross: 'X4', harvest: '11 Aug 2024', seeds: 24, treatment: 'Dried, refrigerated 8 wks',      sown: '12 Oct 2024', germ: 'pending',     germinated: 0,  germPct: 0,  repot: undefined, plantedOut: undefined,      retained: 0, named: 0 },
  B5: { id: 'B5', cross: 'X5', harvest: '4 Aug 2022',  seeds: 22, treatment: 'Dried, refrigerated 9 wks',      sown: '10 Oct 2022', germ: '5 Feb 2023',  germinated: 14, germPct: 64, repot: '18 Mar 2023', plantedOut: '2 Apr 2023', retained: 1, named: 0 },
}

// ─── Lifecycle steps ──────────────────────────────────────────
export const LIFECYCLE: Omit<LifecycleStep, 'state' | 'detail'>[] = [
  { key: 'variety',    label: 'Variety / plant',        icon: 'flower',  short: 'Record created' },
  { key: 'parentage',  label: 'Parentage',              icon: 'dna',     short: 'Pod × pollen parent' },
  { key: 'cross',      label: 'Pollination',            icon: 'droplet', short: 'Cross made' },
  { key: 'seedpod',    label: 'Seed pod',               icon: 'seed',    short: 'Harvest' },
  { key: 'seedbatch',  label: 'Seed batch',             icon: 'seed',    short: 'Treatment & sowing' },
  { key: 'germ',       label: 'Sowing & germination',   icon: 'sprout',  short: 'Germinated' },
  { key: 'seedling',   label: 'Seedling',               icon: 'sprout',  short: 'Growing on' },
  { key: 'firstflower',label: 'First flower',           icon: 'flower',  short: 'Bloomed' },
  { key: 'evaluation', label: 'Evaluation',             icon: 'star',    short: 'Assessed' },
  { key: 'outcome',    label: 'Outcome',                icon: 'tag',     short: 'Retain · name · register' },
]

export function lifecycleFor(iris: Iris): LifecycleStep[] {
  const steps: LifecycleStep[] = LIFECYCLE.map(s => ({ ...s, state: 'na', detail: '' }))
  const set = (key: string, state: LifecycleStep['state'], detail: string) => {
    const st = steps.find(s => s.key === key); if (st) { st.state = state; st.detail = detail }
  }
  if (iris.kind === 'Variety') {
    set('variety', 'done', `Added ${iris.planted}`)
    set('parentage',
      iris.podParent && iris.podParent !== 'Unknown' ? 'done' : 'na',
      iris.podParent && iris.podParent !== 'Unknown' ? `${iris.podParent} × ${iris.pollenParent}` : 'Parentage not recorded'
    )
    set('firstflower', 'done', iris.firstFlower ? `First flowered ${iris.firstFlower}` : '')
    return steps
  }
  // Seedling — rich lifecycle
  const x = iris.cross ? crosses[iris.cross] : null
  const b = iris.seedBatch ? seedBatches[iris.seedBatch] : null
  set('variety', 'done', `Seedling ${iris.name}`)
  set('parentage', 'done', `${iris.podParent} × ${iris.pollenParent}`)
  if (x) set('cross', 'done', `${x.code} · ${x.date}`)
  if (b?.harvest) set('seedpod', 'done', `Harvested ${b.harvest} · ${b.seeds} seeds`)
  if (b?.sown) set('seedbatch', 'done', `Sown ${b.sown}`)
  if (b?.germ && b.germ !== 'pending') set('germ', 'done', `${b.germinated} of ${b.seeds} germinated (${b.germPct}%)`)
  if (b?.plantedOut) set('seedling', 'done', `Planted out ${b.plantedOut}`)
  if (iris.firstFlower) set('firstflower', 'done', `First flower ${iris.firstFlower}`)
  const evals = iris.evaluations || []
  if (evals.length > 0) set('evaluation', 'done', `${evals.length} evaluation${evals.length > 1 ? 's' : ''}`)
  return steps
}

// ─── Recent activity feed ─────────────────────────────────────
export const recent = [
  { iris: 'I1', d: '18 May', t: 'Flowering', x: 'Three stems open, exceptional substance this year.' },
  { iris: 'S1', d: '22 May', t: 'Evaluation', x: 'First flower! Keeper — watch branching next year.' },
  { iris: 'I2', d: '16 May', t: 'Flowering', x: 'Reliable as ever. Strong branching, 9 buds.' },
  { iris: 'S5', d: '20 May', t: 'Evaluation', x: 'Third flowering — settled. Considering for naming.' },
]

// ─── Widget catalog ───────────────────────────────────────────
export const WIDGETS: WidgetDef[] = [
  { id: 'quick',    label: 'Quick add',           sub: 'Log a note, photo, or new iris', icon: 'plus',     system: 'always-start' },
  { id: 'today',    label: 'Today',               sub: 'What needs your attention now',  icon: 'sun',      goalKey: 'track',   goalLabel: 'Track daily activity',   goalSub: 'Ready-to-evaluate, watch list, capture flowering', goalIcon: 'sun' },
  { id: 'recent',   label: 'Recent activity',     sub: 'Latest notes and photos',        icon: 'clock',    system: 'always-end' },
  { id: 'favs',     label: 'Favourites',          sub: 'Your starred irises',            icon: 'heart',    goalKey: 'collect',  goalLabel: 'Collect and curate',     goalSub: 'Focus on your favourite varieties', goalIcon: 'heart' },
  { id: 'flowering',label: 'Now flowering',       sub: 'What\'s blooming right now',     icon: 'flower',   goalKey: 'bloom',    goalLabel: 'Follow what\'s blooming', goalSub: 'Season calendar and flowering status', goalIcon: 'flower' },
  { id: 'seedlings',label: 'Seedling progress',   sub: 'Seedlings from your crosses',    icon: 'sprout',   goalKey: 'breed',    goalLabel: 'Breed new varieties',    goalSub: 'Crosses, seed batches, and seedling progress', goalIcon: 'dna' },
  { id: 'crosses',  label: 'Crosses progress',    sub: 'Funnel from pollen to flower',   icon: 'dna',      goalKey: 'breed' },
  { id: 'collection',label: 'Collection overview',sub: 'Stats across all your plants',  icon: 'grid',     goalKey: 'collect' },
  { id: 'calendar', label: 'Bloom calendar',      sub: 'Monthly flowering view',         icon: 'calendar', goalKey: 'bloom' },
  { id: 'garden',   label: 'Garden plan',         sub: 'Top-down bed map',               icon: 'pin',      goalKey: 'map',      goalLabel: 'Map your garden',        goalSub: 'Know what\'s where', goalIcon: 'pin' },
]

export const DEFAULT_WIDGETS = ['quick', 'today', 'flowering', 'collection', 'recent']

export const WIDGET_RECIPES: Record<string, string[]> = {
  Breeder:   ['quick', 'today', 'seedlings', 'crosses', 'recent'],
  Collector: ['quick', 'favs', 'collection', 'flowering', 'recent'],
  Casual:    ['quick', 'flowering', 'recent'],
  Mapper:    ['quick', 'garden', 'collection', 'recent'],
  Everything:['quick', 'today', 'favs', 'flowering', 'seedlings', 'crosses', 'collection', 'calendar', 'garden', 'recent'],
}

export function getGoals() {
  return WIDGETS
    .filter(w => w.goalKey && w.goalLabel)
    .filter((w, i, arr) => arr.findIndex(x => x.goalKey === w.goalKey) === i)
}

export function recommendWidgets(opts: { matters: string[]; gardenType: string; frequency?: string }): string[] {
  const { matters } = opts
  const widgetIds: string[] = ['quick']
  const seen = new Set<string>(['quick'])
  const add = (id: string) => { if (!seen.has(id)) { widgetIds.push(id); seen.add(id) } }
  matters.forEach(goalKey => {
    WIDGETS.filter(w => w.goalKey === goalKey && !w.system).forEach(w => add(w.id))
  })
  add('recent')
  return widgetIds
}

// ─── User stub (for demo state) ───────────────────────────────
export const user = { name: 'Dave', initial: 'D', gardenName: "Dave's Garden" }

// ─── Status colour map ────────────────────────────────────────
export const STATUS: Record<string, { c: string; icon: string }> = {
  'Growing':      { c: 'green', icon: 'leaf' },
  'Flowering':    { c: 'rose',  icon: 'flower' },
  'First flower': { c: 'amber', icon: 'star' },
  'Watch':        { c: 'clay',  icon: 'eye' },
  'Archived':     { c: 'clay',  icon: 'tag' },
  'Named':        { c: 'green', icon: 'tag' },
}

// ─── Lookup helpers ───────────────────────────────────────────
export function byId(id: string): Iris | undefined {
  return irises.find(i => i.id === id)
}

// ─── Crosses helpers ──────────────────────────────────────────
export function crossesList(): Cross[] {
  return Object.values(crosses)
}

export function crossStats(crossId: string): { seeds: number; total: number; flowering: number; firstFlower: number; growing: number; watch: number; flowered: number } {
  const seedlings = irises.filter(i => i.cross === crossId)
  const batch = Object.values(seedBatches).find(b => b.cross === crossId)
  const flowering  = seedlings.filter(i => i.status === 'Flowering').length
  const firstFlower = seedlings.filter(i => i.status === 'First flower').length
  return {
    seeds:      batch?.seeds ?? 0,
    total:      seedlings.length,
    flowering,
    firstFlower,
    flowered:   flowering + firstFlower,
    growing:    seedlings.filter(i => !['Culled','Rejected','Archived'].includes(i.status ?? '')).length,
    watch:      seedlings.filter(i => i.status === 'Watch').length,
  }
}

// ─── Today focus ─────────────────────────────────────────────
export function todayFocus(): {
  seedlingsToEval: Iris[]
  seedlingsReEval: Iris[]
  watchList: Iris[]
  inFlower: Iris[]
} {
  const seedlingsToEval = irises.filter(i => i.kind === 'Seedling' && i.status === 'First flower')
  const seedlingsReEval = irises.filter(i => i.kind === 'Seedling' && i.status === 'Flowering' && (i.evaluations?.length ?? 0) > 0)
  const watchList       = irises.filter(i => i.status === 'Watch')
  const inFlower        = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower')
  return { seedlingsToEval, seedlingsReEval, watchList, inFlower }
}

// ─── Latest evaluation ────────────────────────────────────────
export function latestEval(iris: Iris): import('@/types').EvalRecord | undefined {
  if (!iris.evaluations?.length) return undefined
  return iris.evaluations[iris.evaluations.length - 1]
}
