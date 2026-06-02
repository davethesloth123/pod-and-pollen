// ─────────────────────────────────────────────────────────────
// Pod & Pollen — core domain types
// ─────────────────────────────────────────────────────────────

export type IrisKind = 'Variety' | 'Seedling'
export type IrisStatus = 'Growing' | 'Flowering' | 'Watch' | 'First flower' | 'Archived' | 'Named'

export interface ColorDef {
  standards?: string
  falls?: string
  beard?: string
  styleArms?: string
}

export interface FloweringRecord {
  year: number
  first: string | null   // DD/MM/YYYY
  last: string | null
  stems?: number
  buds?: number
  height?: number
  notes?: string
}

export interface IrisNote {
  id?: string
  d: string              // display date
  t: string              // type: Flowering | Health | Movement | Photo | Evaluation | General
  x: string              // body
}

export interface IrisPhoto {
  id?: string
  cat: string            // category
  url?: string
  storagePath?: string
}

export interface EvalRecord {
  id?: string
  year?: number
  form?: number
  colour?: number
  substance?: number
  branching?: number
  vigour?: number
  avg?: number
  verdict?: string       // Retain | Discard | Watch | Name
  comments?: string
  date?: string
}

export interface Iris {
  id: string
  name: string
  kind: IrisKind
  cls: string            // classification: Tall Bearded, etc.
  colorType?: string
  pal: string            // palette key
  status: IrisStatus
  fav?: boolean

  // Appearance
  colour?: string
  height?: string
  season?: string
  fragrance?: string

  // Color definition
  colorDef?: ColorDef

  // Location
  loc?: string           // location name (denormalized for display)
  locationId?: string
  bed?: string           // grid ref / row
  gridRef?: string

  // Provenance
  source?: string
  breeder?: string
  yearReleased?: number
  planted?: string
  firstFlower?: string
  firstEverFlower?: string

  // Parentage
  podParent?: string
  pollenParent?: string

  // Cross linkage (seedlings)
  cross?: string         // cross code (e.g. X1)
  crossId?: string
  seedBatch?: string     // batch code (e.g. B1)
  generation?: string

  // Data
  notes?: IrisNote[]
  photos?: IrisPhoto[]
  floweringHistory?: FloweringRecord[]
  evaluations?: EvalRecord[]
}

export interface Location {
  id: string
  name: string
  shortName?: string
  kind?: string
  count?: number
  sun?: string
  soil?: string
  x?: number
  y?: number
  w?: number
  h?: number
  shape?: string
}

export interface Cross {
  id: string
  code: string
  season: string
  pod: string
  pollen: string
  date?: string
  podNo?: string
  notes?: string
  status: string         // Sown | Germinated | Growing on | Evaluating | Archived
  goal?: string
}

export interface SeedBatch {
  id: string
  cross: string
  harvest?: string
  seeds?: number
  treatment?: string
  sown?: string
  germ?: string
  germinated?: number
  germPct?: number
  repot?: string
  plantedOut?: string
  transplanted?: number
  retained?: number
  named?: number
}

export interface LifecycleStep {
  key: string
  label: string
  icon: string
  short: string
  state: 'done' | 'active' | 'na'
  detail: string
}

// Widget system
export interface WidgetDef {
  id: string
  label: string
  sub: string
  icon: string
  goalKey?: string
  goalLabel?: string
  goalSub?: string
  goalIcon?: string
  system?: 'always-start' | 'always-end'
}

export interface UserProfile {
  id: string
  name?: string
  gardenName?: string
  initial?: string
}
