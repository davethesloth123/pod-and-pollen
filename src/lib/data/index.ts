// ─────────────────────────────────────────────────────────────
// Pod & Pollen — app constants & pure helpers
// (Live data comes from Supabase via the DataProvider; this module
//  only holds palettes, the widget catalog, lifecycle, status map, etc.)
// ─────────────────────────────────────────────────────────────
import type { Iris, LifecycleStep, WidgetDef } from '@/types'

// ─── Color palettes (procedural iris illustrations) ───────────
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

// A seedling's own lifecycle excludes the cross/seed stages (those live on the cross record)
const SEEDLING_SKIP = new Set(['cross', 'seedpod', 'seedbatch', 'seedling'])

export function lifecycleFor(iris: Iris): LifecycleStep[] {
  if (iris.kind === 'Variety') {
    const steps: LifecycleStep[] = LIFECYCLE.map(s => ({ ...s, state: 'na', detail: '' }))
    const set = (key: string, state: LifecycleStep['state'], detail: string) => {
      const st = steps.find(s => s.key === key); if (st) { st.state = state; st.detail = detail }
    }
    set('variety', 'done', `Added ${iris.planted}`)
    set('parentage',
      iris.podParent && iris.podParent !== 'Unknown' ? 'done' : 'na',
      iris.podParent && iris.podParent !== 'Unknown' ? `${iris.podParent} × ${iris.pollenParent}` : 'Parentage not recorded'
    )
    set('firstflower', 'done', iris.firstFlower ? `First flowered ${iris.firstFlower}` : '')
    return steps
  }
  // Seedling — milestones that matter for the individual plant
  const steps: LifecycleStep[] = LIFECYCLE.filter(s => !SEEDLING_SKIP.has(s.key)).map(s => ({ ...s, state: 'na', detail: '' }))
  const set = (key: string, state: LifecycleStep['state'], detail: string) => {
    const st = steps.find(s => s.key === key); if (st) { st.state = state; st.detail = detail }
  }
  set('variety', 'done', `Seedling ${iris.name}`)
  if (iris.podParent) set('parentage', 'done', `${iris.podParent} × ${iris.pollenParent}`)
  if (iris.firstFlower || iris.status === 'Flowering' || iris.status === 'First flower') set('firstflower', 'done', iris.firstFlower ? `First flower ${iris.firstFlower}` : 'Flowered')
  const evals = iris.evaluations || []
  if (evals.length > 0) set('evaluation', 'done', `${evals.length} evaluation${evals.length > 1 ? 's' : ''}`)
  return steps
}

// ─── Widget catalog ───────────────────────────────────────────
// Each widget can optionally declare goalKey/goalLabel/goalSub/goalIcon, which
// power the "what matters most" onboarding step. Multiple widgets can share a
// goalKey; the first one with a goalLabel supplies the option's copy.
export const WIDGETS: WidgetDef[] = [
  { id: 'today',     label: 'Today focus',       sub: 'What needs you right now',     icon: 'star',
    goalKey: 'thisweek',  goalLabel: 'Knowing what to do this week',   goalSub: 'Daily/weekly attention list',    goalIcon: 'star' },
  { id: 'inflower',  label: 'In flower now',     sub: "What's blooming today",        icon: 'flower',
    goalKey: 'flowering', goalLabel: "Watching what's in flower",      goalSub: 'See blooms as they open',         goalIcon: 'flower' },
  { id: 'recent',    label: 'Recently updated',  sub: 'Latest notes & photos',        icon: 'clock', system: 'always-end' },
  { id: 'fav',       label: 'Favourites',        sub: 'Starred plants',               icon: 'heart' },
  { id: 'watch',     label: 'Watch list',        sub: 'Plants needing attention',     icon: 'eye',
    goalKey: 'thisweek' },
  { id: 'photowall', label: 'Photo wall',        sub: 'Latest captures',              icon: 'camera',
    goalKey: 'photos',    goalLabel: 'Capturing photos as records',   goalSub: 'Build a visual history',          goalIcon: 'camera' },
  { id: 'quick',     label: 'Quick actions',     sub: 'Common buttons',               icon: 'plus', system: 'always-start' },
  { id: 'gardenmap', label: 'Garden plan',       sub: 'Bed-by-bed mini map',          icon: 'pin',
    goalKey: 'mapping',   goalLabel: 'Mapping where things grow',      goalSub: 'Bed-by-bed layout',               goalIcon: 'pin' },
  { id: 'calendar',  label: 'Bloom calendar',    sub: 'Year-at-a-glance',             icon: 'calendar',
    goalKey: 'season',    goalLabel: 'Planning by bloom season',       goalSub: 'Year-at-a-glance view',           goalIcon: 'calendar' },
  { id: 'crosses',   label: 'Crosses progress',  sub: 'Breeding pipeline overview',   icon: 'dna',
    goalKey: 'breeding',  goalLabel: 'Tracking my breeding programme', goalSub: 'Crosses, seedlings, evaluations', goalIcon: 'dna' },
]

// Canonical dashboard render order (also the priority used by recommendWidgets)
export const WIDGET_PRIORITY = ['quick', 'today', 'inflower', 'watch', 'fav', 'crosses', 'photowall', 'gardenmap', 'calendar', 'recent']

export interface Goal { k: string; icon: string; label: string; sub: string }

// Derive the "what matters" options from widget metadata.
export function getGoals(): Goal[] {
  const seen = new Set<string>()
  const goals: Goal[] = []
  for (const w of WIDGETS) {
    if (!w.goalKey || !w.goalLabel || seen.has(w.goalKey)) continue
    seen.add(w.goalKey)
    goals.push({ k: w.goalKey, icon: w.goalIcon || w.icon, label: w.goalLabel, sub: w.goalSub || '' })
  }
  return goals
}

// Build a recommended widget set from onboarding answers.
export function recommendWidgets({ matters = [], gardenType = 'mixed', frequency = 'weekly' }: { matters?: string[]; gardenType?: string; frequency?: string } = {}): string[] {
  const order: string[] = []
  const add = (id: string) => { if (id && !order.includes(id)) order.push(id) }

  for (const w of WIDGETS) if (w.system === 'always-start') add(w.id)
  for (const w of WIDGETS) if (w.goalKey && matters.includes(w.goalKey)) add(w.id)

  if (gardenType === 'collector') { add('inflower'); add('fav'); add('photowall') }
  if (gardenType === 'breeder')   { add('today'); add('crosses'); add('watch') }
  if (gardenType === 'mixed')     { add('inflower'); add('today') }

  if (frequency === 'daily') { add('today'); add('inflower') }
  if (frequency === 'rare')  { add('recent') }

  for (const w of WIDGETS) if (w.system === 'always-end') add(w.id)

  return order.sort((a, b) => WIDGET_PRIORITY.indexOf(a) - WIDGET_PRIORITY.indexOf(b))
}

export const WIDGET_RECIPES: Record<string, string[]> = {
  Breeder:    recommendWidgets({ matters: ['breeding', 'thisweek', 'flowering'], gardenType: 'breeder', frequency: 'daily' }),
  Collector:  recommendWidgets({ matters: ['flowering', 'photos', 'season'], gardenType: 'collector', frequency: 'weekly' }),
  Casual:     recommendWidgets({ matters: ['flowering'], gardenType: 'mixed', frequency: 'rare' }),
  Mapper:     recommendWidgets({ matters: ['mapping', 'flowering', 'season'], gardenType: 'mixed', frequency: 'weekly' }),
  Everything: ['quick', 'today', 'inflower', 'watch', 'fav', 'crosses', 'photowall', 'gardenmap', 'calendar', 'recent'],
}

// Reasonable default if the user skips personalisation
export const DEFAULT_WIDGETS = WIDGET_RECIPES.Collector

// ─── Plant types (future-platform anchor; only irises available today) ──
export interface PlantType { k: string; label: string; avail: boolean; blurb: string; pal: string; eta?: string }
export const PLANT_TYPES: PlantType[] = [
  { k: 'iris',   label: 'Irises',  avail: true,  blurb: 'Tall bearded, intermediate, dwarf, beardless, Siberian, and more.', pal: 'deepPurple' },
  { k: 'rose',   label: 'Roses',   avail: false, blurb: 'Hybrid tea, floribunda, shrub, climber',  pal: 'pink',    eta: 'Planned' },
  { k: 'dahlia', label: 'Dahlias', avail: false, blurb: 'Cactus, decorative, ball, pompon',        pal: 'apricot', eta: 'Planned' },
  { k: 'other',  label: 'Other',   avail: false, blurb: 'Lilies, daffodils, fuchsias…',            pal: 'white',   eta: 'Later' },
]

// ─── Status colour map ────────────────────────────────────────
export const STATUS: Record<string, { c: string; icon: string }> = {
  'Growing':      { c: 'green', icon: 'leaf' },
  'Flowering':    { c: 'rose',  icon: 'flower' },
  'First flower': { c: 'amber', icon: 'star' },
  'Watch':        { c: 'clay',  icon: 'eye' },
  'Archived':     { c: 'clay',  icon: 'tag' },
  'Named':        { c: 'green', icon: 'tag' },
}

// ─── Latest evaluation ────────────────────────────────────────
export function latestEval(iris: Iris): import('@/types').EvalRecord | undefined {
  if (!iris.evaluations?.length) return undefined
  return iris.evaluations[iris.evaluations.length - 1]
}
