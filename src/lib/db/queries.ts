import type { SupabaseClient } from '@supabase/supabase-js'
import type { Location, Iris, IrisKind, IrisStatus, IrisNote, FloweringRecord, EvalRecord, Cross, SeedBatch } from '@/types'
import type {
  LocationRow, IrisRow, NoteRow, FloweringRowDb, EvalRowDb, CrossRow, SeedBatchRow,
} from '@/lib/db/row-types'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

// ─── Row → app-shape mappers ──────────────────────────────────
export function dbToLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? undefined,
    kind: row.kind ?? undefined,
    sun: row.sun ?? undefined,
    soil: row.soil ?? undefined,
    x: row.x ?? undefined,
    y: row.y ?? undefined,
    w: row.w ?? undefined,
    h: row.h ?? undefined,
    shape: row.shape ?? undefined,
    count: 0, // computed from irises once that slice lands
  }
}

// ─── Inputs for inserts ───────────────────────────────────────
export interface NewLocation {
  name: string
  shortName?: string
  kind?: string
  sun?: string
  soil?: string
}

// ─── Locations ────────────────────────────────────────────────
export async function fetchLocations(supabase: SupabaseClient, userId: string): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(dbToLocation)
}

export async function insertLocation(supabase: SupabaseClient, userId: string, input: NewLocation): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      user_id: userId,
      name: input.name,
      short_name: input.shortName || null,
      kind: input.kind || null,
      sun: input.sun || null,
      soil: input.soil || null,
    })
    .select()
    .single()
  if (error) throw error
  return dbToLocation(data)
}

// ─── Irises ───────────────────────────────────────────────────
export function dbToIris(row: IrisRow): Iris {
  const hasColorDef = row.color_standards || row.color_falls || row.color_beard || row.color_style_arms
  return {
    id: row.id,
    name: row.name,
    kind: (row.kind as IrisKind) || 'Variety',
    cls: row.classification ?? '',
    colorType: row.color_type ?? undefined,
    pal: row.palette ?? 'deepPurple',
    status: (row.status as IrisStatus) || 'Growing',
    fav: row.fav ?? false,
    colour: row.colour ?? undefined,
    height: row.height_cm != null ? `${row.height_cm} cm` : undefined,
    season: row.season ?? undefined,
    fragrance: row.fragrance ?? undefined,
    colorDef: hasColorDef ? {
      standards: row.color_standards ?? undefined,
      falls: row.color_falls ?? undefined,
      beard: row.color_beard ?? undefined,
      styleArms: row.color_style_arms ?? undefined,
    } : undefined,
    loc: row.location?.name ?? undefined,
    locationId: row.location_id ?? undefined,
    bed: row.grid_ref ?? undefined,
    gridRef: row.grid_ref ?? undefined,
    source: row.source ?? undefined,
    breeder: row.breeder ?? undefined,
    yearReleased: row.year_released ?? undefined,
    planted: row.planted_date ?? undefined,
    firstEverFlower: row.first_ever_flower ?? undefined,
    podParent: row.pod_parent ?? undefined,
    pollenParent: row.pollen_parent ?? undefined,
    podParentId: row.pod_parent_id ?? undefined,
    pollenParentId: row.pollen_parent_id ?? undefined,
    crossId: row.cross_id ?? undefined,
    cross: row.cross_id ?? undefined,
    seedBatch: row.seed_batch_id ?? undefined,
    generation: row.generation ?? undefined,
    notes: [],
    photos: [],
    floweringHistory: [],
    evaluations: [],
  }
}

export interface NewIris {
  name: string
  kind: string
  classification?: string
  colorType?: string
  status?: string
  locationId?: string | null
  gridRef?: string
  plantedDate?: string
  podParent?: string
  pollenParent?: string
  podParentId?: string | null
  pollenParentId?: string | null
  height?: number
  season?: string
  fragrance?: string
  breeder?: string
  yearReleased?: number
  colorStandards?: string
  colorFalls?: string
  colorBeard?: string
  colorStyleArms?: string
  note?: string
}

export async function fetchIrises(supabase: SupabaseClient, userId: string): Promise<Iris[]> {
  const { data, error } = await supabase
    .from('irises')
    .select('*, location:locations(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToIris)
}

export async function insertIris(supabase: SupabaseClient, userId: string, input: NewIris): Promise<Iris> {
  const { data, error } = await supabase
    .from('irises')
    .insert({
      user_id: userId,
      name: input.name,
      kind: input.kind || 'Variety',
      classification: input.classification || null,
      color_type: input.colorType || null,
      status: input.status || 'Growing',
      location_id: input.locationId || null,
      grid_ref: input.gridRef || null,
      planted_date: input.plantedDate || null,
      pod_parent: input.podParent || null,
      pollen_parent: input.pollenParent || null,
      pod_parent_id: input.podParentId || null,
      pollen_parent_id: input.pollenParentId || null,
      height_cm: input.height ?? null,
      season: input.season || null,
      fragrance: input.fragrance || null,
      breeder: input.breeder || null,
      year_released: input.yearReleased ?? null,
      color_standards: input.colorStandards || null,
      color_falls: input.colorFalls || null,
      color_beard: input.colorBeard || null,
      color_style_arms: input.colorStyleArms || null,
    })
    .select('*, location:locations(name)')
    .single()
  if (error) throw error
  const iris = dbToIris(data)
  // Persist the optional free-text note as a note row
  if (input.note && input.note.trim()) {
    try {
      await supabase.from('notes').insert({
        user_id: userId, iris_id: iris.id, note_type: 'General', body: input.note.trim(),
      })
    } catch (e) {
      console.error('Failed to save initial note', e)
    }
  }
  return iris
}

// ─── Notes ────────────────────────────────────────────────────
export type IrisNoteRow = IrisNote & { irisId: string; ts: string }

export function dbToNote(row: NoteRow): IrisNoteRow {
  return {
    irisId: row.iris_id,
    id: row.id,
    d: fmtDate(row.noted_at),
    t: row.note_type ?? 'General',
    x: row.body,
    ts: row.noted_at,
  }
}

export interface NewNote { irisId: string; type: string; body: string; date?: string }

export async function fetchNotes(supabase: SupabaseClient, userId: string): Promise<IrisNoteRow[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('noted_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToNote)
}

export async function insertNote(supabase: SupabaseClient, userId: string, input: NewNote): Promise<IrisNoteRow> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      iris_id: input.irisId,
      note_type: input.type || 'General',
      body: input.body,
      noted_at: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return dbToNote(data)
}

// ─── Flowering records ────────────────────────────────────────
export type FloweringRow = FloweringRecord & { irisId: string }

export function dbToFlowering(row: FloweringRowDb): FloweringRow {
  return {
    irisId: row.iris_id,
    year: row.year,
    first: row.first_date ?? null,
    last: row.last_date ?? null,
    stems: row.stems ?? undefined,
    buds: row.buds ?? undefined,
    height: row.height_cm ?? undefined,
    notes: row.notes ?? undefined,
  }
}

export interface NewFlowering {
  irisId: string; year: number; first?: string; last?: string
  stems?: number; buds?: number; height?: number; notes?: string
}

export async function fetchFlowering(supabase: SupabaseClient, userId: string): Promise<FloweringRow[]> {
  const { data, error } = await supabase
    .from('flowering_records')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToFlowering)
}

export async function upsertFlowering(supabase: SupabaseClient, userId: string, input: NewFlowering): Promise<FloweringRow> {
  const { data, error } = await supabase
    .from('flowering_records')
    .upsert({
      user_id: userId,
      iris_id: input.irisId,
      year: input.year,
      first_date: input.first || null,
      last_date: input.last || null,
      stems: input.stems ?? null,
      buds: input.buds ?? null,
      height_cm: input.height ?? null,
      notes: input.notes || null,
    }, { onConflict: 'iris_id,year' })
    .select()
    .single()
  if (error) throw error
  return dbToFlowering(data)
}

// ─── Evaluations ──────────────────────────────────────────────
export type EvalRow = EvalRecord & { irisId: string }

export function dbToEval(row: EvalRowDb): EvalRow {
  return {
    irisId: row.iris_id,
    id: row.id,
    year: row.eval_year ?? undefined,
    form: row.form ?? undefined,
    colour: row.colour ?? undefined,
    substance: row.substance ?? undefined,
    branching: row.branching ?? undefined,
    vigour: row.vigour ?? undefined,
    avg: row.average ?? undefined,
    verdict: row.verdict ?? undefined,
    comments: row.comments ?? undefined,
    date: fmtDate(row.evaluated_at),
  }
}

export interface NewEval {
  irisId: string; year?: number
  form?: number; colour?: number; substance?: number; branching?: number; vigour?: number
  avg?: number; verdict?: string; comments?: string
}

export async function fetchEvaluations(supabase: SupabaseClient, userId: string): Promise<EvalRow[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('user_id', userId)
    .order('evaluated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToEval)
}

export async function insertEvaluation(supabase: SupabaseClient, userId: string, input: NewEval): Promise<EvalRow> {
  const { data, error } = await supabase
    .from('evaluations')
    .insert({
      user_id: userId,
      iris_id: input.irisId,
      eval_year: input.year ?? new Date().getFullYear(),
      form: input.form ?? null,
      colour: input.colour ?? null,
      substance: input.substance ?? null,
      branching: input.branching ?? null,
      vigour: input.vigour ?? null,
      average: input.avg ?? null,
      verdict: input.verdict || null,
      comments: input.comments || null,
    })
    .select()
    .single()
  if (error) throw error
  return dbToEval(data)
}

// ─── Crosses ──────────────────────────────────────────────────
export function dbToCross(row: CrossRow): Cross {
  return {
    id: row.id,
    code: row.code,
    season: row.season ?? '',
    pod: row.pod_parent ?? '',
    pollen: row.pollen_parent ?? '',
    podId: row.pod_parent_id ?? undefined,
    pollenId: row.pollen_parent_id ?? undefined,
    date: row.pollination_date ?? undefined,
    podNo: row.pod_number ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status ?? 'Sown',
    goal: row.goal ?? undefined,
  }
}

export interface NewCross {
  code: string
  season?: string
  pod: string
  podId?: string | null
  pollen: string
  pollenId?: string | null
  date?: string
  goal?: string
  notes?: string
  status?: string
}

export async function fetchCrosses(supabase: SupabaseClient, userId: string): Promise<Cross[]> {
  const { data, error } = await supabase
    .from('crosses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToCross)
}

export async function insertCross(supabase: SupabaseClient, userId: string, input: NewCross): Promise<Cross> {
  const { data, error } = await supabase
    .from('crosses')
    .insert({
      user_id: userId,
      code: input.code,
      season: input.season || null,
      pod_parent: input.pod || null,
      pod_parent_id: input.podId || null,
      pollen_parent: input.pollen || null,
      pollen_parent_id: input.pollenId || null,
      pollination_date: input.date || null,
      goal: input.goal || null,
      notes: input.notes || null,
      status: input.status || 'Pollinated',
    })
    .select()
    .single()
  if (error) throw error
  return dbToCross(data)
}

// ─── Seed batches (one per cross) ─────────────────────────────
export function dbToSeedBatch(row: SeedBatchRow): SeedBatch {
  return {
    id: row.id,
    cross: row.cross_id,
    harvest: row.harvest_date ?? undefined,
    seeds: row.seeds_count ?? undefined,
    treatment: row.treatment ?? undefined,
    sown: row.sown_date ?? undefined,
    germ: row.germ_date ?? undefined,
    germinated: row.germinated ?? undefined,
    germPct: row.germ_pct ?? undefined,
    repot: row.repot_date ?? undefined,
    plantedOut: row.planted_out_date ?? undefined,
    transplanted: row.transplanted ?? undefined,
    retained: row.retained ?? undefined,
    named: row.named ?? undefined,
  }
}

export interface SeedBatchPatch {
  harvest?: string; seeds?: number | null; treatment?: string; sown?: string
  germ?: string; germinated?: number | null; germPct?: number | null
  plantedOut?: string; transplanted?: number | null
}

export async function fetchSeedBatches(supabase: SupabaseClient, userId: string): Promise<SeedBatch[]> {
  const { data, error } = await supabase.from('seed_batches').select('*').eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(dbToSeedBatch)
}

const BATCH_COL_MAP: Record<string, string> = {
  harvest: 'harvest_date', seeds: 'seeds_count', treatment: 'treatment', sown: 'sown_date',
  germ: 'germ_date', germinated: 'germinated', germPct: 'germ_pct',
  plantedOut: 'planted_out_date', transplanted: 'transplanted',
}

// Upsert the single seed batch for a cross (find existing → update, else insert)
export async function saveSeedBatch(supabase: SupabaseClient, userId: string, crossId: string, patch: SeedBatchPatch): Promise<SeedBatch> {
  const col: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue
    const c = BATCH_COL_MAP[k]
    if (!c) continue
    col[c] = v === '' ? null : v
  }
  const { data: existing } = await supabase.from('seed_batches').select('id').eq('user_id', userId).eq('cross_id', crossId).maybeSingle()
  if (existing?.id) {
    const { data, error } = await supabase.from('seed_batches').update(col).eq('id', existing.id).eq('user_id', userId).select().single()
    if (error) throw error
    return dbToSeedBatch(data)
  }
  const { data, error } = await supabase.from('seed_batches').insert({ user_id: userId, cross_id: crossId, ...col }).select().single()
  if (error) throw error
  return dbToSeedBatch(data)
}

// ─── Bulk seedling creation (from a cross) ────────────────────
export interface NewSeedling {
  name: string
  classification?: string
  locationId?: string | null
  gridRef?: string
  generation?: string
  status?: string
  podParent?: string
  pollenParent?: string
  podParentId?: string | null
  pollenParentId?: string | null
  crossId?: string
}

export async function insertSeedlings(supabase: SupabaseClient, userId: string, rows: NewSeedling[]): Promise<Iris[]> {
  const payload = rows.map(r => ({
    user_id: userId,
    name: r.name,
    kind: 'Seedling',
    classification: r.classification || null,
    location_id: r.locationId || null,
    grid_ref: r.gridRef || null,
    generation: r.generation || null,
    status: r.status || 'Growing',
    pod_parent: r.podParent || null,
    pollen_parent: r.pollenParent || null,
    pod_parent_id: r.podParentId || null,
    pollen_parent_id: r.pollenParentId || null,
    cross_id: r.crossId || null,
  }))
  const { data, error } = await supabase.from('irises').insert(payload).select('*, location:locations(name)')
  if (error) throw error
  return (data ?? []).map(dbToIris)
}

// ─── Updates & deletes ────────────────────────────────────────
export interface IrisPatch {
  name?: string; kind?: string; classification?: string; colorType?: string
  status?: string; fav?: boolean; locationId?: string | null; gridRef?: string
  plantedDate?: string; podParent?: string; pollenParent?: string
  podParentId?: string | null; pollenParentId?: string | null
  height?: number | null; season?: string; fragrance?: string; breeder?: string; yearReleased?: number | null
  colorStandards?: string; colorFalls?: string; colorBeard?: string; colorStyleArms?: string
  firstEverFlower?: string
}

const IRIS_COL_MAP: Record<string, string> = {
  name: 'name', kind: 'kind', classification: 'classification', colorType: 'color_type',
  status: 'status', fav: 'fav', locationId: 'location_id', gridRef: 'grid_ref',
  plantedDate: 'planted_date', podParent: 'pod_parent', pollenParent: 'pollen_parent',
  podParentId: 'pod_parent_id', pollenParentId: 'pollen_parent_id',
  height: 'height_cm', season: 'season', fragrance: 'fragrance', breeder: 'breeder',
  yearReleased: 'year_released', colorStandards: 'color_standards', colorFalls: 'color_falls',
  colorBeard: 'color_beard', colorStyleArms: 'color_style_arms', firstEverFlower: 'first_ever_flower',
}

export async function updateIris(supabase: SupabaseClient, userId: string, id: string, patch: IrisPatch): Promise<Iris> {
  const col: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue
    const c = IRIS_COL_MAP[k]
    if (!c) continue
    col[c] = v === '' ? null : v
  }
  const { data, error } = await supabase
    .from('irises').update(col).eq('id', id).eq('user_id', userId)
    .select('*, location:locations(name)').single()
  if (error) throw error
  return dbToIris(data)
}

export async function deleteIris(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('irises').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

// Patch a cross's denormalized parent name + id link (used by rename cascade)
export interface CrossParentPatch { pod?: string; podId?: string | null; pollen?: string; pollenId?: string | null }
export async function updateCrossParents(supabase: SupabaseClient, userId: string, id: string, patch: CrossParentPatch): Promise<Cross> {
  const col: Record<string, unknown> = {}
  if (patch.pod !== undefined) col.pod_parent = patch.pod || null
  if (patch.podId !== undefined) col.pod_parent_id = patch.podId || null
  if (patch.pollen !== undefined) col.pollen_parent = patch.pollen || null
  if (patch.pollenId !== undefined) col.pollen_parent_id = patch.pollenId || null
  const { data, error } = await supabase
    .from('crosses').update(col).eq('id', id).eq('user_id', userId).select('*').single()
  if (error) throw error
  return dbToCross(data)
}

export interface LocationPatch {
  name?: string; shortName?: string; kind?: string; sun?: string; soil?: string
  x?: number; y?: number; w?: number; h?: number; shape?: string
}
const LOC_COL_MAP: Record<string, string> = {
  name: 'name', shortName: 'short_name', kind: 'kind', sun: 'sun', soil: 'soil',
  x: 'x', y: 'y', w: 'w', h: 'h', shape: 'shape',
}
export async function updateLocation(supabase: SupabaseClient, userId: string, id: string, patch: LocationPatch): Promise<Location> {
  const col: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue
    const c = LOC_COL_MAP[k]
    if (!c) continue
    col[c] = v === '' ? null : v
  }
  const { data, error } = await supabase
    .from('locations').update(col).eq('id', id).eq('user_id', userId).select().single()
  if (error) throw error
  return dbToLocation(data)
}

export async function deleteLocation(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function deleteNote(supabase: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}
