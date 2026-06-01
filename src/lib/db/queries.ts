import type { SupabaseClient } from '@supabase/supabase-js'
import type { Location } from '@/types'

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
