// data.jsx — Pod & Pollen sample data, iris imagery, icon set
// Exports to window: BL (data + helpers), Icon, IrisBloom

// ─────────────────────────────────────────────────────────────
// Icon set — consistent stroke icons (UI only). size + stroke props.
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 24, stroke = 'currentColor', sw = 1.8, fill = 'none', style }) {
  const p = { fill, stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 11.5 12 4l9 7.5" {...p} /><path d="M5 10v9h14v-9" {...p} /><path d="M9.5 19v-5h5v5" {...p} /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...p} /></>,
    search: <><circle cx="11" cy="11" r="6.5" {...p} /><path d="m20 20-3.6-3.6" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.4-2h7.2L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></>,
    note: <><path d="M6 3.5h9L19 7v13.5H6z" {...p} /><path d="M14.5 3.5V7H19" {...p} /><path d="M9 12h7M9 15.5h5" {...p} /></>,
    leaf: <><path d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13Z" {...p} /><path d="M5 19C8 14 12 11 16 9.5" {...p} /></>,
    flower: <><circle cx="12" cy="12" r="2.6" {...p} /><path d="M12 9.4c1-2.4.4-4.4-2-5.4-1.6 2 .6 4.6 2 5.4ZM12 14.6c-1 2.4-.4 4.4 2 5.4 1.6-2-.6-4.6-2-5.4ZM9.4 12c-2.4-1-4.4-.4-5.4 2 2 1.6 4.6-.6 5.4-2ZM14.6 12c2.4 1 4.4.4 5.4-2-2-1.6-4.6.6-5.4 2Z" {...p} /></>,
    pin: <><path d="M12 21s7-5.4 7-11a7 7 0 0 0-14 0c0 5.6 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.6" {...p} /></>,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...p} /><path d="M3.5 9.5h17M8 3v4M16 3v4" {...p} /></>,
    back: <><path d="M15 5l-7 7 7 7" {...p} /></>,
    chevron: <><path d="M9 5l7 7-7 7" {...p} /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" {...p} /></>,
    sliders: <><path d="M4 8h10M18 8h2M4 16h2M10 16h10" {...p} /><circle cx="16" cy="8" r="2.2" {...p} /><circle cx="8" cy="16" r="2.2" {...p} /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 6.5" {...p} /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" {...p} /></>,
    seed: <><path d="M12 3c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10Z" {...p} /><path d="M12 21v-9M12 12c-1.6-.6-2.6-1.8-3-3.6M12 12c1.6-.6 2.6-1.8 3-3.6" {...p} /></>,
    sprout: <><path d="M12 20v-7" {...p} /><path d="M12 13c-3.4 0-5.5-2-5.5-5 3.4 0 5.5 2 5.5 5ZM12 13c0-2.8 1.8-4.6 4.6-4.6C16.6 11.2 14.8 13 12 13Z" {...p} /></>,
    dna: <><path d="M7 3c0 5 10 5 10 10s-10 5-10 10M17 3c0 5-10 5-10 10s10 5 10 10" {...p} /><path d="M8.5 7h7M8.5 17h7" {...p} /></>,
    star: <><path d="M12 4l2.3 5 5.4.5-4.1 3.6 1.3 5.3L12 16.9 7.1 18.4l1.3-5.3L4.3 9.5 9.7 9z" {...p} /></>,
    eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} /><circle cx="12" cy="12" r="3" {...p} /></>,
    droplet: <><path d="M12 3c4 4.5 6 7.6 6 10.5a6 6 0 0 1-12 0C6 10.6 8 7.5 12 3Z" {...p} /></>,
    tag: <><path d="M4 12.5V5h7.5L20 13.5 13.5 20 4 12.5Z" {...p} /><circle cx="8.5" cy="9" r="1.4" {...p} fill={stroke} /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12" {...p} /><circle cx="4" cy="6" r="1.1" {...p} fill={stroke} /><circle cx="4" cy="12" r="1.1" {...p} fill={stroke} /><circle cx="4" cy="18" r="1.1" {...p} fill={stroke} /></>,
    more: <><circle cx="5" cy="12" r="1.6" {...p} fill={stroke} /><circle cx="12" cy="12" r="1.6" {...p} fill={stroke} /><circle cx="19" cy="12" r="1.6" {...p} fill={stroke} /></>,
    book: <><path d="M5 4.5h11A2.5 2.5 0 0 1 18.5 7v13H7.5A2.5 2.5 0 0 0 5 22.5z" {...p} /><path d="M5 4.5v18" {...p} /></>,
    sun: <><circle cx="12" cy="12" r="4" {...p} /><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" {...p} /></>,
    move: <><path d="M12 3v18M3 12h18" {...p} /><path d="m8 7 4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" {...p} /></>,
    scissors: <><circle cx="6" cy="6" r="2.5" {...p} /><circle cx="6" cy="18" r="2.5" {...p} /><path d="M8 7.5 20 18M8 16.5 20 6" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3 2" {...p} /></>,
    heart: <><path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11Z" {...p} /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" {...p} /><path d="M5 16v3.5h14V16" {...p} /></>,
    // Plant-type logo icons. Long-term plan: swap by user's plant type setting.
    // 'iris' is a stylised fleur-de-lys: 3 standards above, 3 falls below, a stem.
    iris: <>
      <path d="M12 3.2c-1.6 2-2.6 4-2.6 6.4 0 1.4 1 2.2 2.6 2.2s2.6-0.8 2.6-2.2c0-2.4-1-4.4-2.6-6.4Z" {...p} />
      <path d="M12 11.8c-3 0-5.4 2.2-6.4 5 2 1 4.5 0 6.4-2.4" {...p} />
      <path d="M12 11.8c3 0 5.4 2.2 6.4 5-2 1-4.5 0-6.4-2.4" {...p} />
      <path d="M8.5 13.6h7" {...p} />
      <path d="M12 14.4v6.4" {...p} />
    </>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0, ...style }}>
      {paths[name] || null}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// IrisBloom — procedural stock-style iris imagery, color-accurate.
// 3 falls (lower, drooping) + 3 standards (upper) + beard, soft-focus.
// ─────────────────────────────────────────────────────────────
function IrisBloom({ s, f, beard = '#E8B84B', bg, r = 0, label, dim = false }) {
  // s = standards color [light,dark], f = falls color [light,dark]
  // Stylised, magazine-like iris: distinct petals, soft watercolour edges, painterly bg.
  const grad = (c) => `linear-gradient(165deg, ${c[0]} 0%, ${c[1]} 100%)`;
  // standards: tall, upright, narrower; falls: wide, drooping
  const standard = (rot, scale = 1) => (
    <div style={{
      position: 'absolute', left: '50%', top: '48%',
      width: `${20 * scale}%`, height: `${44 * scale}%`,
      transform: `translate(-50%, -100%) rotate(${rot}deg)`,
      transformOrigin: '50% 100%',
      borderRadius: '60% 60% 50% 50% / 80% 80% 20% 20%',
      background: grad(s),
      boxShadow: 'inset -3px -4px 12px rgba(0,0,0,0.18), inset 2px 3px 8px rgba(255,255,255,0.28)',
      filter: 'blur(0.4px)',
    }} />
  );
  const fall = (rot, scale = 1, z = 1) => (
    <div style={{
      position: 'absolute', left: '50%', top: '48%',
      width: `${30 * scale}%`, height: `${44 * scale}%`,
      transform: `translate(-50%, 0) rotate(${rot}deg)`,
      transformOrigin: '50% 0%',
      borderRadius: '60% 60% 70% 70% / 25% 25% 78% 78%',
      background: grad(f), zIndex: z,
      boxShadow: 'inset 0 -10px 22px rgba(0,0,0,0.24), inset 0 4px 10px rgba(255,255,255,0.22)',
      filter: 'blur(0.4px)',
    }} />
  );
  const bgFill = bg || `radial-gradient(120% 110% at 50% 35%, ${tint(s[0], 0.22)} 0%, ${tint(f[1], 0.28)} 60%, ${tint(f[1], 0.45)} 100%)`;
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden',
      background: bgFill,
    }}>
      {/* soft painterly background blooms */}
      <div style={{ position: 'absolute', left: '20%', top: '20%', width: '80%', height: '80%', borderRadius: '50%',
        background: `radial-gradient(circle, ${tint(s[1], 0.35)} 0%, transparent 60%)`, filter: 'blur(20px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', right: '5%', bottom: '5%', width: '70%', height: '70%', borderRadius: '50%',
        background: `radial-gradient(circle, ${tint(f[1], 0.5)} 0%, transparent 60%)`, filter: 'blur(20px)', zIndex: 0 }} />

      {/* falls — three drooping below center */}
      {fall(-32, 0.95, 1)}
      {fall(0, 1.05, 2)}
      {fall(32, 0.95, 1)}

      {/* beard streak on central fall */}
      <div style={{
        position: 'absolute', left: '50%', top: '52%', width: '6%', height: '18%',
        transform: 'translateX(-50%)', borderRadius: 40, zIndex: 5,
        background: `linear-gradient(${beard}, ${tint(beard, 0.55)})`,
        boxShadow: `0 0 10px ${tint(beard, 0.4)}`, opacity: 0.92,
      }} />

      {/* standards — three rising above center */}
      {standard(-18, 0.95)}
      {standard(18, 0.95)}
      <div style={{ position: 'absolute', zIndex: 4 }}>{standard(0, 1.05)}</div>

      {/* soft center */}
      <div style={{
        position: 'absolute', left: '50%', top: '48%', width: '18%', height: '14%',
        transform: 'translate(-50%, -50%)', borderRadius: '50%', zIndex: 5,
        background: `radial-gradient(circle, ${tint(s[0], 0.65)} 0%, transparent 75%)`,
        filter: 'blur(3px)',
      }} />

      {/* photographic overlays */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, background:
        'radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.20), transparent 50%), radial-gradient(120% 120% at 50% 110%, rgba(0,0,0,0.28), transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 9, opacity: 0.4, mixBlendMode: 'overlay',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
      {dim && <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(33,28,18,0.18)' }} />}
      {label && (
        <div style={{ position: 'absolute', left: 10, bottom: 9, zIndex: 11, color: '#fff',
          fontFamily: 'Lexend, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: 0.2,
          textShadow: '0 1px 4px rgba(0,0,0,0.55)' }}>{label}</div>
      )}
    </div>
  );
}
function tint(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// ─────────────────────────────────────────────────────────────
// Color recipes per cultivar (standards / falls / beard)
// ─────────────────────────────────────────────────────────────
const PAL = {
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
};

// ─────────────────────────────────────────────────────────────
// Sample data
// ─────────────────────────────────────────────────────────────
const locations = [
  { id: 'L1', name: 'Top Bed',       kind: 'Bed',         count: 14, sun: 'Full sun',     soil: 'Sandy loam',  x: 20, y: 4,  w: 38, h: 22, shape: 'rect' },
  { id: 'L2', name: 'Long Border',   kind: 'Border',      count: 22, sun: 'Full sun',     soil: 'Clay loam',   x: 4,  y: 32, w: 64, h: 16, shape: 'rect' },
  { id: 'L3', name: 'Trial Bed',     kind: 'Trial area',  count: 31, sun: 'Full sun',     soil: 'Improved',    x: 4,  y: 54, w: 44, h: 42, shape: 'rect' },
  { id: 'L4', name: 'Greenhouse',    kind: 'Greenhouse',  count: 9,  sun: 'Glass',        soil: 'Pots',        x: 52, y: 54, w: 22, h: 18, shape: 'rect' },
  { id: 'L5', name: 'Holding Area',  kind: 'Holding',     count: 18, sun: 'Part shade',   soil: 'Pots',        x: 52, y: 78, w: 22, h: 18, shape: 'rect' },
  { id: 'L6', name: 'Pots — Patio',  shortName: 'Patio',  kind: 'Pots',        count: 12, sun: 'Mixed',        soil: 'Pots',        x: 78, y: 32, w: 18, h: 64, shape: 'rect' },
];

const irises = [
  {
    id: 'I1', name: 'Dusky Challenger', kind: 'Variety', cls: 'Tall Bearded', pal: 'blackViolet',
    status: 'Flowering', loc: 'Long Border', bed: 'Row B · 3',
    source: 'Schreiner\'s, 2019', planted: 'Oct 2019', firstFlower: 'May 2021',
    colour: 'Deep blue-violet self, near-black falls', height: '99 cm', season: 'Mid', fragrance: 'Light',
    podParent: 'Navy Strut', pollenParent: 'Titan\'s Glory',
    fav: true,
    firstEverFlower: '14/05/2021',
    floweringHistory: [
      { year: 2024, first: '12/05/2024', last: '01/06/2024', stems: 3, buds: 11, height: 99, notes: 'Mid season, three strong stems.' },
      { year: 2025, first: '08/05/2025', last: '24/05/2025', stems: 4, buds: 13, height: 100, notes: 'Earliest opening yet — warm April.' },
      { year: 2026, first: '10/05/2026', last: null,         stems: 3, buds: 12, height: 102, notes: 'Three stems open so far, exceptional substance.' },
    ],
    colorDef: {
      standards: 'Deep blue-violet, smooth velvety substance',
      falls: 'Near-black violet, slight blue undertone on flare',
      beard: 'Yellow at throat, tipped violet',
      styleArms: 'Dark violet, crested midrib',
    },
    notes: [
      { d: '18 May 2026', t: 'Flowering', x: 'Three stems open, exceptional substance this year. Best clump in the border.' },
      { d: '2 May 2026', t: 'Health', x: 'No sign of rot after the wet spring. Foliage clean.' },
      { d: '14 Apr 2025', t: 'Movement', x: 'Divided original clump, three fans to Trial Bed.' },
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
      { year: 2026, first: '03/05/2026', last: null,         stems: 4, buds: 9,  height: 94, notes: '9 buds counted on lead stem.' },
    ],
    colorDef: {
      standards: 'Soft butter-yellow, lightly ruffled',
      falls: 'Rich blue-violet with darker veining at the throat',
      beard: 'Tangerine-yellow',
      styleArms: 'Pale yellow, flushed lilac at the tip',
    },
    notes: [
      { d: '16 May 2026', t: 'Flowering', x: 'Reliable as ever. Strong branching, 9 buds counted on lead stem.' },
      { d: '20 Apr 2026', t: 'Photo', x: 'Whole-plant photo added before bloom.' },
    ],
  },
  {
    id: 'I3', name: 'Beverly Sills', kind: 'Variety', cls: 'Tall Bearded', pal: 'pink',
    status: 'Growing', loc: 'Top Bed', bed: 'Row A · 4',
    source: 'Woottens, 2021', planted: 'Sep 2021', firstFlower: 'May 2023',
    colour: 'Coral-pink self, tangerine beard', height: '89 cm', season: 'Mid', fragrance: 'Sweet',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [
      { d: '10 May 2026', t: 'Health', x: 'Buds forming, slightly behind the others. Healthy fans.' },
    ],
  },
  {
    id: 'I4', name: 'Superstition', kind: 'Variety', cls: 'Tall Bearded', pal: 'burgundy',
    status: 'Growing', loc: 'Long Border', bed: 'Row B · 7',
    source: 'Schreiner\'s, 2018', planted: 'Oct 2018', firstFlower: 'May 2020',
    colour: 'Ebony burgundy-black self', height: '91 cm', season: 'Mid–Late', fragrance: 'None',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [
      { d: '8 May 2026', t: 'General', x: 'Used as pollen parent for GI-26 crosses this season.' },
    ],
  },
  {
    id: 'I5', name: 'Jesse\'s Song', kind: 'Variety', cls: 'Tall Bearded', pal: 'plicata',
    status: 'Flowering', loc: 'Top Bed', bed: 'Row A · 6',
    source: 'Division from Dad, 2020', planted: 'Sep 2020', firstFlower: 'May 2022',
    colour: 'White ground, violet plicata margins', height: '90 cm', season: 'Mid', fragrance: 'Light',
    podParent: 'Unknown', pollenParent: 'Unknown',
    fav: true,
    notes: [
      { d: '17 May 2026', t: 'Flowering', x: 'Plicata marking very crisp this year.' },
    ],
  },
  {
    id: 'I6', name: 'Immortality', kind: 'Variety', cls: 'Tall Bearded (reblooming)', pal: 'white',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 2',
    source: 'Woottens, 2022', planted: 'Sep 2022', firstFlower: 'May 2023',
    colour: 'Pure white self, reliable rebloomer', height: '76 cm', season: 'Mid + Autumn', fragrance: 'Light',
    podParent: 'Unknown', pollenParent: 'Unknown',
    notes: [
      { d: '6 May 2026', t: 'General', x: 'Watching for autumn rebloom — fed in April.' },
    ],
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
      { d: '21 May 2026', t: 'Photo', x: 'First-flower photo captured at 8am, good light.' },
      { d: '3 Apr 2024', t: 'Movement', x: 'Planted out from final pots into Trial Bed, Row C.' },
    ],
  },
  {
    id: 'S2', name: 'GI-23-04 C', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'blueViolet',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 11',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: null,
    colour: 'Not yet flowered', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [
      { d: '12 May 2026', t: 'General', x: 'Strong fans, no buds yet — likely first flower next season.' },
    ],
  },
  {
    id: 'S3', name: 'GI-23-04 B', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'yellowBlue',
    status: 'Growing', loc: 'Trial Bed', bed: 'Row C · 10',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: null,
    colour: 'Not yet flowered — fans show yellow-tinted bases', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [
      { d: '15 May 2026', t: 'General', x: 'Vigorous — widest fans of the batch. Curious whether the yellow basal tint hints at Edith influence.' },
    ],
  },
  {
    id: 'S4', name: 'GI-23-04 D', kind: 'Seedling', cls: 'Seedling (TB)', pal: 'burgundy',
    status: 'Watch', loc: 'Holding Area', bed: 'Pot 14',
    source: 'Own cross', planted: 'Apr 2024', firstFlower: null,
    colour: 'Not yet flowered', height: '—', season: '—', fragrance: '—',
    cross: 'X1', seedBatch: 'B1', generation: 'F1',
    podParent: 'Dusky Challenger', pollenParent: 'Edith Wolford',
    notes: [
      { d: '4 May 2026', t: 'Health', x: 'Slower than siblings. Moved to Holding Area to assess before deciding to retain.' },
    ],
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
      { year: 2026, first: '20/05/2026', last: null,         stems: 2, buds: 9, height: 93, notes: 'Settled — considering for naming.' },
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
    source: 'Own cross', planted: 'Apr 2024', firstFlower: null,
    colour: 'Not yet flowered — fans show purple stippling at base', height: '—', season: '—', fragrance: '—',
    cross: 'X2', seedBatch: 'B2', generation: 'F1',
    podParent: "Jesse's Song", pollenParent: 'Superstition',
    notes: [
      { d: '14 May 2026', t: 'General', x: 'Strongest fan of the X2 siblings. Purple base striping a hopeful sign.' },
    ],
  },
];

// crosses & seed batches — for the lifecycle on seedlings
const crosses = {
  X1: { id: 'X1', code: 'GI-23-04', season: '2023', pod: 'Dusky Challenger', pollen: 'Edith Wolford', date: '24 May 2023', podNo: '04', notes: 'Aiming for dark purple with strong branching. Pollen kept dry 2 days.', status: 'Evaluating', goal: 'Dark purple · strong branching' },
  X2: { id: 'X2', code: 'GI-23-07', season: '2023', pod: "Jesse's Song", pollen: 'Superstition', date: '26 May 2023', podNo: '07', notes: 'Plicata × black. Hoping for striking pattern.', status: 'Growing on', goal: 'Plicata pattern on dark ground' },
  X3: { id: 'X3', code: 'GI-24-02', season: '2024', pod: 'Beverly Sills', pollen: 'Edith Wolford', date: '18 May 2024', podNo: '02', notes: 'Pink × yellow-blue bicolour. Long shot.', status: 'Sown', goal: 'Pink with blue infusion' },
  X4: { id: 'X4', code: 'GI-24-05', season: '2024', pod: 'Dusky Challenger', pollen: 'Superstition', date: '22 May 2024', podNo: '05', notes: 'Two darks together. Looking for depth and substance.', status: 'Sown', goal: 'Near-black self' },
  X5: { id: 'X5', code: 'GI-22-01', season: '2022', pod: 'Edith Wolford', pollen: 'Beverly Sills', date: '18 May 2022', podNo: '01', notes: 'Tried for ruffled yellow-pink. Only one seedling worth keeping.', status: 'Archived', goal: 'Ruffled apricot bicolour' },
};
const seedBatches = {
  B1: { id: 'B1', cross: 'X1', harvest: '2 Aug 2023', seeds: 31, treatment: 'Dried, then refrigerated 8 wks', sown: '14 Oct 2023', germ: '9 Feb 2024', germinated: 19, germPct: 61, repot: '20 Mar 2024', plantedOut: '3 Apr 2024', retained: 4, named: 0 },
  B2: { id: 'B2', cross: 'X2', harvest: '7 Aug 2023', seeds: 18, treatment: 'Dried, then refrigerated 8 wks', sown: '14 Oct 2023', germ: '14 Feb 2024', germinated: 11, germPct: 61, repot: '20 Mar 2024', plantedOut: '3 Apr 2024', retained: 6, named: 0 },
  B3: { id: 'B3', cross: 'X3', harvest: '4 Aug 2024', seeds: 8, treatment: 'Dried, refrigerated 8 wks', sown: '12 Oct 2024', germ: 'pending', germinated: 0, germPct: 0, repot: null, plantedOut: null, retained: 0, named: 0 },
  B4: { id: 'B4', cross: 'X4', harvest: '11 Aug 2024', seeds: 24, treatment: 'Dried, refrigerated 8 wks', sown: '12 Oct 2024', germ: 'pending', germinated: 0, germPct: 0, repot: null, plantedOut: null, retained: 0, named: 0 },
  B5: { id: 'B5', cross: 'X5', harvest: '4 Aug 2022', seeds: 22, treatment: 'Dried, refrigerated 9 wks', sown: '10 Oct 2022', germ: '5 Feb 2023', germinated: 14, germPct: 64, repot: '18 Mar 2023', plantedOut: '2 Apr 2023', retained: 1, named: 0 },
};

// lifecycle stage definitions (the priority — the breeding lifecycle model)
const LIFECYCLE = [
  { key: 'variety', label: 'Variety / plant', icon: 'flower', short: 'Record created' },
  { key: 'parentage', label: 'Parentage', icon: 'dna', short: 'Pod × pollen parent' },
  { key: 'cross', label: 'Pollination', icon: 'droplet', short: 'Cross made' },
  { key: 'seedpod', label: 'Seed pod', icon: 'seed', short: 'Harvest' },
  { key: 'seedbatch', label: 'Seed batch', icon: 'seed', short: 'Treatment & sowing' },
  { key: 'germ', label: 'Sowing & germination', icon: 'sprout', short: 'Germinated' },
  { key: 'seedling', label: 'Seedling', icon: 'sprout', short: 'Growing on' },
  { key: 'firstflower', label: 'First flower', icon: 'flower', short: 'Bloomed' },
  { key: 'evaluation', label: 'Evaluation', icon: 'star', short: 'Assessed' },
  { key: 'outcome', label: 'Outcome', icon: 'tag', short: 'Retain · name · register' },
];

// Build the lifecycle state for a given iris
function lifecycleFor(iris) {
  const steps = LIFECYCLE.map(s => ({ ...s, state: 'na', detail: '' }));
  const set = (key, state, detail) => { const st = steps.find(s => s.key === key); if (st) { st.state = state; st.detail = detail; } };
  if (iris.kind === 'Variety') {
    // Named cultivar: it's a parent/plant record; breeding lifecycle largely N/A
    set('variety', 'done', `Added ${iris.planted}`);
    set('parentage', iris.podParent && iris.podParent !== 'Unknown' ? 'done' : 'na',
      iris.podParent && iris.podParent !== 'Unknown' ? `${iris.podParent} × ${iris.pollenParent}` : 'Parentage not recorded');
    set('firstflower', 'done', iris.firstFlower ? `First flowered ${iris.firstFlower}` : '');
    return steps;
  }
  // Seedling — rich lifecycle
  const x = crosses[iris.cross]; const b = seedBatches[iris.seedBatch];
  set('variety', 'done', `Seedling ${iris.name}`);
  set('parentage', 'done', `${iris.podParent} × ${iris.pollenParent}`);
  if (x) set('cross', 'done', `${x.date} · pod #${x.podNo}`);
  if (b) {
    set('seedpod', 'done', `Harvested ${b.harvest} · ${b.seeds} seeds`);
    set('seedbatch', 'done', `${b.treatment}`);
    set('germ', 'done', `${b.germinated}/${b.seeds} germinated (${b.germPct}%) · ${b.germ}`);
  }
  set('seedling', 'done', `Planted out ${iris.planted}`);
  if (iris.status === 'First flower') {
    set('firstflower', 'done', `First flowered ${iris.firstFlower}`);
    set('evaluation', 'active', 'In evaluation — looking strong');
    set('outcome', 'next', 'Decision pending');
  } else {
    set('firstflower', 'active', 'Awaiting first bloom');
    set('evaluation', 'next', '');
    set('outcome', 'next', '');
  }
  return steps;
}

// ───────────── FLOWERING HISTORY HELPERS ─────────────
// Parse a DD/MM/YYYY date string to a Date, or null if unparseable.
function parseDMY(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
}
function formatDuration(days) {
  if (days == null || !isFinite(days) || days < 0) return '—';
  if (days === 0) return '0 days';
  if (days < 7) return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
  const w = Math.floor(days / 7); const d = Math.round(days - w * 7);
  if (d === 0) return `${w} week${w === 1 ? '' : 's'}`;
  return `${w} week${w === 1 ? '' : 's'} ${d} day${d === 1 ? '' : 's'}`;
}
// Returns { firstEver, byYear, averagePeriodDays, latestComplete }
function flowerStats(iris) {
  const hist = (iris && iris.floweringHistory) || [];
  // Each year-record's flowering display window in days (only when both dates exist)
  const completed = hist.filter(r => r.first && r.last);
  const days = completed.map(r => {
    const a = parseDMY(r.first), b = parseDMY(r.last);
    if (!a || !b) return null;
    return Math.max(0, Math.round((b - a) / 86400000));
  }).filter(d => d != null);
  const averagePeriodDays = days.length ? days.reduce((a, b) => a + b, 0) / days.length : null;
  // Sort newest first
  const byYear = [...hist].sort((a, b) => (b.year || 0) - (a.year || 0));
  return {
    firstEver: iris && (iris.firstEverFlower || iris.firstFlower) || null,
    byYear, averagePeriodDays,
    latestComplete: completed[completed.length - 1] || null,
  };
}

// status → color token name. The full list is editable here; refine as needed.
const STATUS = {
  'Not planted':       { c: 'ink',    icon: 'clock' },
  'Growing':           { c: 'green',  icon: 'leaf' },
  'In bud':            { c: 'accent', icon: 'sprout' },
  'Flowering':         { c: 'rose',   icon: 'flower' },
  'First flower':      { c: 'accent', icon: 'flower' },
  'Flowered this year':{ c: 'clay',   icon: 'flower' },
  'Needs evaluation':  { c: 'amber',  icon: 'star' },
  'Watch':             { c: 'amber',  icon: 'eye' },
  'Keep':              { c: 'green',  icon: 'check' },
  'Discard':           { c: 'clay',   icon: 'x' },
  'Lost':              { c: 'clay',   icon: 'x' },
  'Archived':          { c: 'ink',    icon: 'clock' },
};

const noteTypes = ['Flowering', 'Health', 'Movement', 'Pollination', 'Evaluation', 'Photo', 'General'];

// recently-updated feed (derived)
const recent = [
  { id: 'S1', note: 'First flower — definitely a keeper', when: 'Today', type: 'Evaluation' },
  { id: 'I1', note: 'Three stems open, best clump in the border', when: 'Today', type: 'Flowering' },
  { id: 'I5', note: 'Plicata marking very crisp this year', when: 'Yesterday', type: 'Flowering' },
  { id: 'I2', note: '9 buds counted on lead stem', when: '2 days ago', type: 'Flowering' },
];

// ───────────── PHOTOS ─────────────
// Map of parent name -> palette key so seedlings can show parent photos
const PARENT_PAL = {
  'Dusky Challenger': 'blackViolet', 'Edith Wolford': 'yellowBlue',
  'Beverly Sills': 'pink', 'Superstition': 'burgundy',
  "Jesse's Song": 'plicata', 'Immortality': 'white',
};
function photosFor(iris) {
  const ph = [];
  if (iris.kind === 'Variety') {
    ph.push({ cat: 'Main flower', cap: `Bloom · May 2026`, pal: iris.pal });
    ph.push({ cat: 'Main flower', cap: 'Previous season', pal: iris.pal, dim: 0.12 });
    ph.push({ cat: 'Whole plant', cap: `Clump · May 2026`, pal: iris.pal, dim: 0.28 });
    ph.push({ cat: 'Stem', cap: 'Stem & branching', pal: iris.pal, dim: 0.1 });
    ph.push({ cat: 'Foliage', cap: 'Fans · Mar 2026', pal: iris.pal, dim: 0.4 });
  } else {
    if (iris.firstFlower) {
      ph.push({ cat: 'Main flower', cap: `First flower · ${iris.firstFlower}`, pal: iris.pal });
      ph.push({ cat: 'Main flower', cap: 'Closeup · beard detail', pal: iris.pal });
      ph.push({ cat: 'Stem', cap: 'Stem & branching', pal: iris.pal, dim: 0.1 });
    }
    ph.push({ cat: 'Whole plant', cap: `Whole plant · ${iris.planted}`, pal: iris.pal, dim: 0.3 });
    ph.push({ cat: 'Foliage', cap: 'Foliage check', pal: iris.pal, dim: 0.4 });
    if (PARENT_PAL[iris.podParent]) ph.push({ cat: 'Parent', cap: `Pod: ${iris.podParent}`, pal: PARENT_PAL[iris.podParent] });
    if (PARENT_PAL[iris.pollenParent]) ph.push({ cat: 'Parent', cap: `Pollen: ${iris.pollenParent}`, pal: PARENT_PAL[iris.pollenParent] });
  }
  return ph;
}
irises.forEach(i => { i.photos = photosFor(i); });
const PHOTO_CATS = ['Main flower', 'Whole plant', 'Stem', 'Foliage', 'Parent', 'Disease', 'Registration'];

// ───────────── EVALUATION ─────────────
const EVAL_GROUPS = [
  { group: 'Plant performance', items: [
    { k: 'foliage',  label: 'Foliage',           hint: 'Health, vigour, colour' },
    { k: 'disease',  label: 'Disease resistance', hint: 'Spot, rot, rust' },
    { k: 'vigor',    label: 'Growth & vigour' },
    { k: 'stem',     label: 'Stem strength',     hint: 'Self-supporting?' },
  ]},
  { group: 'Bloom & branching', items: [
    { k: 'branching', label: 'Branching',         hint: 'Branch count & placement' },
    { k: 'bud',       label: 'Bud count' },
    { k: 'sequence',  label: 'Bloom sequence',    hint: 'Length of display' },
  ]},
  { group: 'Bloom quality', items: [
    { k: 'colour',    label: 'Colour' },
    { k: 'form',      label: 'Form',              hint: 'Standards, falls, ruffling' },
    { k: 'substance', label: 'Substance' },
    { k: 'distinct',  label: 'Distinctiveness' },
    { k: 'appeal',    label: 'Garden appeal' },
  ]},
];
const EVAL_OUTCOMES = ['Watch', 'Retain', 'Discard', 'Name candidate', 'Registered', 'Introduced', 'Archived'];
const evaluations = {
  S1: [
    { date: '22 May 2026', year: 2026,
      scores: { foliage: 4, disease: 5, vigor: 5, stem: 4, branching: 3, bud: 4, sequence: 4, colour: 5, form: 5, substance: 5, distinct: 4, appeal: 5 },
      outcome: 'Retain',
      notes: 'Excellent substance and ruffled falls; gold beard pops against the grape-purple. Branching only fair (3) — reassess next year before considering a name. Form and garden appeal both strong on first flowering.' },
  ],
  // Multi-year history on a hypothetical named candidate from the older cross
  S5: [
    { date: '15 May 2024', year: 2024,
      scores: { foliage: 3, disease: 3, vigor: 4, stem: 3, branching: 3, bud: 3, sequence: 3, colour: 4, form: 4, substance: 4, distinct: 4, appeal: 4 },
      outcome: 'Watch', notes: 'First flower. Promising warm tone but stems flopped. Watch substance.' },
    { date: '18 May 2025', year: 2025,
      scores: { foliage: 4, disease: 4, vigor: 4, stem: 4, branching: 4, bud: 4, sequence: 4, colour: 4, form: 4, substance: 4, distinct: 4, appeal: 4 },
      outcome: 'Watch', notes: 'Second flowering. Stems firmer, branching improved. Colour holding.' },
    { date: '20 May 2026', year: 2026,
      scores: { foliage: 4, disease: 5, vigor: 5, stem: 5, branching: 4, bud: 5, sequence: 4, colour: 5, form: 5, substance: 5, distinct: 5, appeal: 5 },
      outcome: 'Name candidate', notes: 'Third flowering — settled. Distinctive warm apricot with copper beard. Considering for naming next season.' },
  ],
};
function evalAverage(scores) {
  const v = Object.values(scores); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length) : 0;
}
function latestEval(irisId) {
  const list = evaluations[irisId];
  return list && list.length ? list[list.length - 1] : null;
}
function evalHistoryAvgs(irisId) {
  const list = evaluations[irisId];
  if (!list || !list.length) return [];
  return list.map(e => ({ year: e.year, avg: evalAverage(e.scores), outcome: e.outcome }));
}
function crossStats(crossId) {
  const x = crosses[crossId]; if (!x) return null;
  const b = Object.values(seedBatches).find(b => b.cross === crossId);
  const sibs = irises.filter(i => i.cross === crossId);
  const flowered = sibs.filter(i => i.firstFlower).length;
  const retained = sibs.filter(i => i.fav || (latestEval(i.id) && (latestEval(i.id).outcome === 'Retain' || latestEval(i.id).outcome === 'Name candidate'))).length;
  return { x, b, sibs, flowered, retained,
    seeds: b ? b.seeds : 0, germinated: b ? b.germinated : 0,
    growing: sibs.length, };
}
// "Today" — actionable items right now (May 31, 2026)
function todayFocus() {
  const inFlower = irises.filter(i => i.status === 'Flowering' || i.status === 'First flower');
  const seedlingsToEval = irises.filter(i => i.status === 'First flower' && !latestEval(i.id));
  const seedlingsReEval = irises.filter(i => {
    if (i.kind !== 'Seedling') return false;
    const e = latestEval(i.id);
    return e && e.year < 2026 && i.firstFlower;
  });
  const watchList = irises.filter(i => i.status === 'Watch');
  const noPhotoRecent = irises.filter(i => i.status === 'Flowering' && !(i.notes || []).some(n => n.t === 'Photo' && (n.d || '').includes('2026')));
  return { inFlower, seedlingsToEval, seedlingsReEval, watchList, noPhotoRecent };
}

// ───────────── CLASSIFICATION & COLOR TYPE ─────────────
// Editable lists used by Add Iris.
const IRIS_CLASSIFICATIONS = [
  'MDB', 'SDB', 'IB', 'BB', 'MTB', 'TB', 'AB',
  'Dutch Iris', 'SPU', 'SIB', 'JA', 'LA',
  'Iris reticulata', 'Iris laevigata', 'Other',
];
const IRIS_COLOR_TYPES = [
  'Self', 'Bicolour', 'Bitone', 'Reverse Bitone',
  'Plicata', 'Luminata', 'Neglecta', 'Blend', 'Amoena',
  'Broken', 'Line and Speckles', 'Space Age',
];
const STATUS_OPTIONS = Object.keys(STATUS); // ordered, taken from STATUS map above

// ───────────── DASHBOARD WIDGETS ─────────────
// Each widget can optionally declare:
//   goalKey / goalLabel / goalSub / goalIcon — "what matters" option metadata
//     (multiple widgets can share the same goalKey; the first one with goalLabel
//      provides the StepMatters copy, the rest just opt in to that goal)
//   system: 'always-start' | 'always-end' — pinned slot, not user-pickable as a goal
const WIDGETS = [
  { id: 'today',     label: 'Today focus',       sub: 'What needs you right now',     icon: 'star',
    goalKey: 'thisweek',  goalLabel: 'Knowing what to do this week',     goalSub: 'Daily/weekly attention list',      goalIcon: 'star' },
  { id: 'inflower',  label: 'In flower now',     sub: 'What\'s blooming today',        icon: 'flower',
    goalKey: 'flowering', goalLabel: 'Watching what\'s in flower',       goalSub: 'See blooms as they open',           goalIcon: 'flower' },
  { id: 'recent',    label: 'Recently updated',  sub: 'Latest notes & photos',         icon: 'clock',
    system: 'always-end' },
  { id: 'fav',       label: 'Favourites',        sub: 'Starred plants',                icon: 'heart' },
  { id: 'watch',     label: 'Watch list',        sub: 'Plants needing attention',      icon: 'eye',
    goalKey: 'thisweek' /* shares the 'thisweek' goal with `today` */ },
  { id: 'photowall', label: 'Photo wall',        sub: 'Latest captures',               icon: 'camera',
    goalKey: 'photos',    goalLabel: 'Capturing photos as records',      goalSub: 'Build a visual history',            goalIcon: 'camera' },
  { id: 'quick',     label: 'Quick actions',     sub: 'Common buttons',                icon: 'plus',
    system: 'always-start' },
  { id: 'gardenmap', label: 'Garden plan',       sub: 'Bed-by-bed mini map',           icon: 'pin',
    goalKey: 'mapping',   goalLabel: 'Mapping where things grow',        goalSub: 'Bed-by-bed layout',                 goalIcon: 'pin' },
  { id: 'calendar',  label: 'Bloom calendar',    sub: 'Year-at-a-glance',              icon: 'calendar',
    goalKey: 'season',    goalLabel: 'Planning by bloom season',         goalSub: 'Year-at-a-glance view',             goalIcon: 'calendar' },
  { id: 'crosses',   label: 'Crosses progress',  sub: 'Breeding pipeline overview',    icon: 'dna',
    goalKey: 'breeding',  goalLabel: 'Tracking my breeding programme',   goalSub: 'Crosses, seedlings, evaluations',   goalIcon: 'dna' },
];

// Derive the "what matters" options from widget metadata. The first widget to
// declare a given goalKey contributes the option's label/sub/icon; later widgets
// with the same goalKey just opt in to it.
function getGoals() {
  const seen = new Set();
  const goals = [];
  for (const w of WIDGETS) {
    if (!w.goalKey || !w.goalLabel || seen.has(w.goalKey)) continue;
    seen.add(w.goalKey);
    goals.push({ k: w.goalKey, icon: w.goalIcon || w.icon, label: w.goalLabel, sub: w.goalSub || '' });
  }
  return goals;
}

// Render order on the dashboard (also used as priority for recommendWidgets).
const WIDGET_PRIORITY = ['quick', 'today', 'inflower', 'watch', 'fav', 'crosses', 'photowall', 'gardenmap', 'calendar', 'recent'];

// Build a recommended widget set from onboarding answers.
// answers = { matters: string[], gardenType: string, frequency: string }
function recommendWidgets({ matters = [], gardenType = 'mixed', frequency = 'weekly' } = {}) {
  const order = [];
  const add = (id) => { if (id && !order.includes(id)) order.push(id); };

  // System: always-start widgets pinned to top
  for (const w of WIDGETS) if (w.system === 'always-start') add(w.id);

  // From "what matters" multi-select — every widget whose goalKey was selected
  for (const w of WIDGETS) if (w.goalKey && matters.includes(w.goalKey)) add(w.id);

  // Garden type tilt
  if (gardenType === 'collector') { add('inflower'); add('fav'); add('photowall'); }
  if (gardenType === 'breeder') { add('today'); add('crosses'); add('watch'); }
  if (gardenType === 'mixed') { add('inflower'); add('today'); }

  // Frequency tilt
  if (frequency === 'daily') { add('today'); add('inflower'); }
  if (frequency === 'rare') { add('recent'); }

  // System: always-end widgets pinned to bottom
  for (const w of WIDGETS) if (w.system === 'always-end') add(w.id);

  // Reorder by canonical priority
  return order.sort((a, b) => WIDGET_PRIORITY.indexOf(a) - WIDGET_PRIORITY.indexOf(b));
}

// Demo recipes — for preview in Tweaks
const WIDGET_RECIPES = {
  Custom: null, // user's saved set
  Breeder: recommendWidgets({ matters: ['breeding', 'thisweek', 'flowering'], gardenType: 'breeder', frequency: 'daily' }),
  Collector: recommendWidgets({ matters: ['flowering', 'photos', 'season'], gardenType: 'collector', frequency: 'weekly' }),
  Casual: recommendWidgets({ matters: ['flowering'], gardenType: 'mixed', frequency: 'rare' }),
  Mapper: recommendWidgets({ matters: ['mapping', 'flowering', 'season'], gardenType: 'mixed', frequency: 'weekly' }),
  Everything: ['quick', 'today', 'inflower', 'watch', 'fav', 'crosses', 'photowall', 'gardenmap', 'calendar', 'recent'],
};

const DEFAULT_WIDGETS = WIDGET_RECIPES.Collector; // reasonable default if no answers

// ───────────── PLANT TYPES (future-platform anchor) ─────────────
const PLANT_TYPES = [
  { k: 'iris',    label: 'Irises',   avail: true,  blurb: 'Tall bearded, intermediate, dwarf, beardless, Siberian', pal: 'deepPurple' },
  { k: 'rose',    label: 'Roses',    avail: false, blurb: 'Hybrid tea, floribunda, shrub, climber', pal: 'pink',     eta: 'Planned' },
  { k: 'dahlia',  label: 'Dahlias',  avail: false, blurb: 'Cactus, decorative, ball, pompon', pal: 'apricot',  eta: 'Planned' },
  { k: 'other',   label: 'Other',    avail: false, blurb: 'Lilies, daffodils, fuchsias…', pal: 'white',    eta: 'Later' },
];

window.BL = {
  PAL, locations, irises, crosses, seedBatches, LIFECYCLE, lifecycleFor,
  STATUS, noteTypes, recent,
  PHOTO_CATS, EVAL_GROUPS, EVAL_OUTCOMES, evaluations, evalAverage,
  latestEval, evalHistoryAvgs, crossStats, todayFocus, PLANT_TYPES,
  parseDMY, formatDuration, flowerStats,
  WIDGETS, WIDGET_RECIPES, DEFAULT_WIDGETS, recommendWidgets, getGoals,
  IRIS_CLASSIFICATIONS, IRIS_COLOR_TYPES, STATUS_OPTIONS,
  user: { firstName: 'Dave', gardenName: "Dave's Garden", initial: 'D', email: 'dave@example.co.uk', region: 'UK' },
  byId: (id) => irises.find(i => i.id === id),
  siblingsOf: (iris) => iris.cross ? irises.filter(i => i.cross === iris.cross && i.id !== iris.id) : [],
  crossesList: () => Object.values(crosses),
};
window.Icon = Icon;
window.IrisBloom = IrisBloom;
