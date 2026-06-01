'use client'
import { useState, useEffect } from 'react'

// Returns true on desktop-width viewports (>= 1024px). SSR-safe: starts
// false (mobile-first) and upgrades after mount.
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isDesktop
}
