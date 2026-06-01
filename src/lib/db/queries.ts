import type { SupabaseClient } from '@supabase/supabase-js'
import type { Location, Iris, IrisKind, IrisStatus } from '@/types'

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
  plantedDate?: string
  podParent?: string
  pollenParent?: string
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
      planted_date: input.plantedDate || null,
      pod_parent: input.podParent || null,
      pollen_parent: input.pollenParent || null,
      color_standards: input.colorStandards || null,
      color_falls: input.colorFalls || null,
      color_beard: input.colorBeard || null,
      color_style_arms: input.colorStyleArms || null,
    })
    .select('*, location:locations(name)')
    .single()
  if (error) throw error
  const iris = dbToIris(data)
  // Persist the optional free-text note as a note row (display lands in the notes slice)
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
