'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location, Iris } from '@/types'
import {
  fetchLocations, insertLocation, type NewLocation,
  fetchIrises, insertIris, type NewIris,
} from '@/lib/db/queries'

interface DataContextValue {
  ready: boolean
  locations: Location[]
  irises: Iris[]
  byId: (id: string) => Iris | undefined
  addLocation: (input: NewLocation) => Promise<void>
  addIris: (input: NewIris) => Promise<Iris>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [ready, setReady] = useState(false)
  const [rawLocations, setRawLocations] = useState<Location[]>([])
  const [irises, setIrises] = useState<Iris[]>([])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReady(true); return }
    try {
      const [locs, iris] = await Promise.all([
        fetchLocations(supabase, user.id),
        fetchIrises(supabase, user.id),
      ])
      setRawLocations(locs)
      setIrises(iris)
    } catch (e) {
      console.error('Failed to load data', e)
    }
    setReady(true)
  }, [supabase])

  useEffect(() => { load() }, [load])

  // Locations with live plant counts derived from irises
  const locations = useMemo<Location[]>(
    () => rawLocations.map(l => ({ ...l, count: irises.filter(i => i.locationId === l.id).length })),
    [rawLocations, irises],
  )

  const addLocation = useCallback(async (input: NewLocation) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const loc = await insertLocation(supabase, user.id, input)
    setRawLocations(prev => [...prev, loc])
  }, [supabase])

  const addIris = useCallback(async (input: NewIris) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const iris = await insertIris(supabase, user.id, input)
    setIrises(prev => [iris, ...prev])
    return iris
  }, [supabase])

  const byId = useCallback((id: string) => irises.find(i => i.id === id), [irises])

  const value = useMemo<DataContextValue>(
    () => ({ ready, locations, irises, byId, addLocation, addIris, refresh: load }),
    [ready, locations, irises, byId, addLocation, addIris, load],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
