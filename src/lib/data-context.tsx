'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location, Iris, Cross } from '@/types'
import {
  fetchLocations, insertLocation, type NewLocation,
  fetchIrises, insertIris, type NewIris,
  fetchNotes, insertNote, type NewNote, type IrisNoteRow,
  fetchFlowering, upsertFlowering, type NewFlowering, type FloweringRow,
  fetchEvaluations, insertEvaluation, type NewEval, type EvalRow,
  fetchCrosses, insertCross, type NewCross,
} from '@/lib/db/queries'

export interface RecentActivity { irisId: string; irisName: string; d: string; t: string; x: string; ts: string }
export interface CrossStats { seeds: number; total: number; flowering: number; firstFlower: number; flowered: number; growing: number; watch: number }

interface DataContextValue {
  ready: boolean
  locations: Location[]
  irises: Iris[]
  crosses: Cross[]
  recent: RecentActivity[]
  byId: (id: string) => Iris | undefined
  crossStats: (crossId: string) => CrossStats
  addLocation: (input: NewLocation) => Promise<void>
  addIris: (input: NewIris) => Promise<Iris>
  addNote: (input: NewNote) => Promise<void>
  addFlowering: (input: NewFlowering) => Promise<void>
  addEvaluation: (input: NewEval) => Promise<void>
  addCross: (input: NewCross) => Promise<void>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [ready, setReady] = useState(false)
  const [rawLocations, setRawLocations] = useState<Location[]>([])
  const [rawIrises, setRawIrises] = useState<Iris[]>([])
  const [notes, setNotes] = useState<IrisNoteRow[]>([])
  const [flowering, setFlowering] = useState<FloweringRow[]>([])
  const [evals, setEvals] = useState<EvalRow[]>([])
  const [crosses, setCrosses] = useState<Cross[]>([])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReady(true); return }
    try {
      const [locs, iris, ns, fl, ev, xs] = await Promise.all([
        fetchLocations(supabase, user.id),
        fetchIrises(supabase, user.id),
        fetchNotes(supabase, user.id),
        fetchFlowering(supabase, user.id),
        fetchEvaluations(supabase, user.id),
        fetchCrosses(supabase, user.id),
      ])
      setRawLocations(locs)
      setRawIrises(iris)
      setNotes(ns)
      setFlowering(fl)
      setEvals(ev)
      setCrosses(xs)
    } catch (e) {
      console.error('Failed to load data', e)
    }
    setReady(true)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // Irises with their related notes / flowering / evaluations attached
  const irises = useMemo<Iris[]>(() => rawIrises.map(i => ({
    ...i,
    notes: notes.filter(n => n.irisId === i.id),
    floweringHistory: flowering.filter(f => f.irisId === i.id).sort((a, b) => b.year - a.year),
    evaluations: evals.filter(e => e.irisId === i.id),
  })), [rawIrises, notes, flowering, evals])

  // Locations with live plant counts
  const locations = useMemo<Location[]>(
    () => rawLocations.map(l => ({ ...l, count: rawIrises.filter(i => i.locationId === l.id).length })),
    [rawLocations, rawIrises],
  )

  // Recent activity feed (latest notes across all irises)
  const recent = useMemo<RecentActivity[]>(() => {
    const nameById = new Map(rawIrises.map(i => [i.id, i.name]))
    return notes
      .filter(n => nameById.has(n.irisId))
      .slice()
      .sort((a, b) => (a.ts < b.ts ? 1 : -1))
      .slice(0, 8)
      .map(n => ({ irisId: n.irisId, irisName: nameById.get(n.irisId) || '', d: n.d, t: n.t, x: n.x, ts: n.ts }))
  }, [notes, rawIrises])

  const requireUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    return user
  }, [supabase])

  const addLocation = useCallback(async (input: NewLocation) => {
    const user = await requireUser()
    const loc = await insertLocation(supabase, user.id, input)
    setRawLocations(prev => [...prev, loc])
  }, [supabase, requireUser])

  const addIris = useCallback(async (input: NewIris) => {
    const user = await requireUser()
    const iris = await insertIris(supabase, user.id, input)
    setRawIrises(prev => [iris, ...prev])
    // The optional initial note is created server-side; refresh notes
    if (input.note && input.note.trim()) {
      try { setNotes(await fetchNotes(supabase, user.id)) } catch { /* ignore */ }
    }
    return iris
  }, [supabase, requireUser])

  const addNote = useCallback(async (input: NewNote) => {
    const user = await requireUser()
    const note = await insertNote(supabase, user.id, input)
    setNotes(prev => [note, ...prev])
  }, [supabase, requireUser])

  const addFlowering = useCallback(async (input: NewFlowering) => {
    const user = await requireUser()
    const rec = await upsertFlowering(supabase, user.id, input)
    setFlowering(prev => [rec, ...prev.filter(f => !(f.irisId === rec.irisId && f.year === rec.year))])
  }, [supabase, requireUser])

  const addEvaluation = useCallback(async (input: NewEval) => {
    const user = await requireUser()
    const rec = await insertEvaluation(supabase, user.id, input)
    setEvals(prev => [rec, ...prev])
  }, [supabase, requireUser])

  const addCross = useCallback(async (input: NewCross) => {
    const user = await requireUser()
    const cross = await insertCross(supabase, user.id, input)
    setCrosses(prev => [cross, ...prev])
  }, [supabase, requireUser])

  const byId = useCallback((id: string) => irises.find(i => i.id === id), [irises])

  // Cross funnel stats derived from real seedlings (seeds come later with batches)
  const crossStats = useCallback((crossId: string): CrossStats => {
    const seedlings = rawIrises.filter(i => i.crossId === crossId || i.cross === crossId)
    const flowering = seedlings.filter(i => i.status === 'Flowering').length
    const firstFlower = seedlings.filter(i => i.status === 'First flower').length
    return {
      seeds: 0,
      total: seedlings.length,
      flowering,
      firstFlower,
      flowered: flowering + firstFlower,
      growing: seedlings.filter(i => !['Archived'].includes(i.status ?? '')).length,
      watch: seedlings.filter(i => i.status === 'Watch').length,
    }
  }, [rawIrises])

  const value = useMemo<DataContextValue>(() => ({
    ready, locations, irises, crosses, recent, byId, crossStats,
    addLocation, addIris, addNote, addFlowering, addEvaluation, addCross, refresh: load,
  }), [ready, locations, irises, crosses, recent, byId, crossStats, addLocation, addIris, addNote, addFlowering, addEvaluation, addCross, load])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
