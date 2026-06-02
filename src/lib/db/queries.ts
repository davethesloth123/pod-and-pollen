import type { SupabaseClient } from '@supabase/supabase-js'
import type { Location, Iris, IrisKind, IrisStatus, IrisNote, FloweringRecord, EvalRecord } from '@/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

// ─── Row → app-shape mappers ──────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */

export function dbToLocation(row: any): Location {
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
export function dbToIris(row: any): Iris {
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

export function dbToNote(row: any): IrisNoteRow {
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

export function dbToFlowering(row: any): FloweringRow {
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

export function dbToEval(row: any): EvalRow {
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
