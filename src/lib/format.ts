// Region-aware display formatting. Canonical storage is ISO dates (yyyy-mm-dd)
// and whole centimetres; the active region only changes how values are shown.

export type Region = 'UK' | 'US'
export const CM_PER_IN = 2.54

export function regionUnit(region: Region): 'cm' | 'in' {
  return region === 'US' ? 'in' : 'cm'
}

// Format an ISO date / timestamp for display. UK = dd-mm-yyyy, US = mm-dd-yyyy.
// Non-ISO free text (e.g. "Oct 2019") is returned unchanged.
export function fmtDate(value: string | null | undefined, region: Region): string {
  if (!value) return ''
  const s = String(value)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    const [, y, mo, d] = iso
    return region === 'US' ? `${mo}-${d}-${y}` : `${d}-${mo}-${y}`
  }
  // Legacy values were stored as UK dd/mm/yyyy strings — reinterpret and reformat.
  const uk = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (uk) {
    const [, d, mo, y] = uk
    return region === 'US' ? `${mo}-${d}-${y}` : `${d}-${mo}-${y}`
  }
  const dt = new Date(s)
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear()
    const mo = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    return region === 'US' ? `${mo}-${d}-${y}` : `${d}-${mo}-${y}`
  }
  return s
}

// Length is stored as whole cm; display rounds to the nearest whole unit.
export function fmtHeight(cm: number, region: Region): string {
  return region === 'US' ? `${Math.round(cm / CM_PER_IN)}"` : `${Math.round(cm)} cm`
}

// Convert a number typed in the region's unit back to canonical whole cm.
export function cmFromDisplay(value: number, region: Region): number {
  return region === 'US' ? Math.round(value * CM_PER_IN) : Math.round(value)
}

// Convert canonical whole cm to the region's display unit (whole number).
export function displayFromCm(cm: number, region: Region): number {
  return region === 'US' ? Math.round(cm / CM_PER_IN) : Math.round(cm)
}

// Whole days between two ISO dates (first bloom → last bloom), or undefined
// if either is missing/invalid/negative.
export function daysBetweenIso(a: string | null | undefined, b: string | null | undefined): number | undefined {
  if (!a || !b) return undefined
  const da = new Date(a)
  const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return undefined
  const diff = Math.round((db.getTime() - da.getTime()) / 86400000)
  return diff >= 0 ? diff : undefined
}
