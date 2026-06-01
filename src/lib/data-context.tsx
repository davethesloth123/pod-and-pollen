'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Location } from '@/types'
import { fetchLocations, insertLocation, type NewLocation } from '@/lib/db/queries'

interface DataContextValue {
  ready: boolean
  locations: Location[]
  addLocation: (input: NewLocation) => Promise<void>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [ready, setReady] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReady(true); return }
    try {
      const locs = await fetchLocations(supabase, user.id)
      setLocations(locs)
    } catch (e) {
      console.error('Failed to load locations', e)
    }
    setReady(true)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const addLocation = useCallback(async (input: NewLocation) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const loc = await insertLocation(supabase, user.id, input)
    setLocations(prev => [...prev, loc])
  }, [supabase])

  const value = useMemo<DataContextValue>(
    () => ({ ready, locations, addLocation, refresh: load }),
    [ready, locations, addLocation, load],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
