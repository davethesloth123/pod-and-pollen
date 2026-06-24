// Hand-written DB row shapes (snake_case), mirroring the SQL migrations.
// These replace `any` in the row → app-shape mappers. If you later wire up the
// Supabase CLI, these can be swapped for generated `Database['public']['Tables']` types.

export interface LocationRow {
  id: string
  name: string
  short_name: string | null
  kind: string | null
  sun: string | null
  soil: string | null
  x: number | null
  y: number | null
  w: number | null
  h: number | null
  shape: string | null
}

export interface IrisRow {
  id: string
  name: string
  kind: string | null
  classification: string | null
  color_type: string | null
  palette: string | null
  status: string | null
  fav: boolean | null
  colour: string | null
  height_cm: number | null
  season: string | null
  fragrance: string | null
  color_standards: string | null
  color_falls: string | null
  color_beard: string | null
  color_style_arms: string | null
  location_id: string | null
  grid_ref: string | null
  source: string | null
  breeder: string | null
  year_released: number | null
  planted_date: string | null
  first_ever_flower: string | null
  pod_parent: string | null
  pollen_parent: string | null
  pod_parent_id: string | null
  pollen_parent_id: string | null
  cross_id: string | null
  seed_batch_id: string | null
  generation: string | null
  // Joined via select('*, location:locations(name)')
  location?: { name: string | null } | null
}

export interface NoteRow {
  id: string
  iris_id: string
  note_type: string | null
  body: string
  noted_at: string
}

export interface FloweringRowDb {
  iris_id: string
  year: number
  first_date: string | null
  last_date: string | null
  stems: number | null
  buds: number | null
  height_cm: number | null
  notes: string | null
}

export interface EvalRowDb {
  id: string
  iris_id: string
  eval_year: number | null
  form: number | null
  colour: number | null
  substance: number | null
  branching: number | null
  vigour: number | null
  average: number | null
  verdict: string | null
  comments: string | null
  evaluated_at: string
}

export interface CrossRow {
  id: string
  code: string
  season: string | null
  pod_parent: string | null
  pollen_parent: string | null
  pod_parent_id: string | null
  pollen_parent_id: string | null
  pollination_date: string | null
  pod_number: string | null
  notes: string | null
  status: string | null
  goal: string | null
}

export interface SeedBatchRow {
  id: string
  cross_id: string
  harvest_date: string | null
  seeds_count: number | null
  treatment: string | null
  sown_date: string | null
  germ_date: string | null
  germinated: number | null
  germ_pct: number | null
  repot_date: string | null
  planted_out_date: string | null
  transplanted: number | null
  retained: number | null
  named: number | null
}
