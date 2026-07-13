// Evaluation rubrics. The active region selects which rubric is used, so a
// US / other-region scorecard can be added later as data without code changes.
import type { Region } from '@/lib/format'

export interface RubricCategory { group: string; key: string; label: string; max: number }
export interface Rubric { id: string; label: string; total: number; categories: RubricCategory[] }

// British Iris Society judges' marking form (100 points).
export const BIS_UK: Rubric = {
  id: 'bis-uk',
  label: 'BIS Judges (UK)',
  total: 100,
  categories: [
    { group: 'Plant',        key: 'foliage',      label: 'Foliage',                                max: 10 },
    { group: 'Plant',        key: 'disease',      label: 'Disease resistance',                     max: 10 },
    { group: 'Plant',        key: 'growth',       label: 'Growth / increase',                      max: 10 },
    { group: 'Stem',         key: 'stem',         label: 'Proportion / strength, branching',       max: 15 },
    { group: 'Stem',         key: 'budstem',      label: 'Bud count, stem count & bloom sequence', max: 15 },
    { group: 'Flower',       key: 'colour',       label: 'Colour / pattern',                       max: 5  },
    { group: 'Flower',       key: 'form',         label: 'Form',                                   max: 10 },
    { group: 'Flower',       key: 'substance',    label: 'Substance',                              max: 10 },
    { group: 'Flower',       key: 'distinct',     label: 'Distinctiveness',                        max: 5  },
    { group: 'Presentation', key: 'presentation', label: 'Presentation / garden appeal',           max: 10 },
  ],
}

export function rubricFor(_region: Region): Rubric {
  // Only the UK rubric exists today; other regions plug in here later.
  return BIS_UK
}

export function rubricById(id: string | undefined | null): Rubric {
  // Single rubric for now; resolve by id once more are added.
  return BIS_UK
}

export function scoreTotal(scores: Record<string, number> | undefined, rubric: Rubric): number {
  if (!scores) return 0
  return rubric.categories.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0)
}

// Distinct group names in order, for section headers.
export function rubricGroups(rubric: Rubric): string[] {
  const seen: string[] = []
  for (const c of rubric.categories) if (!seen.includes(c.group)) seen.push(c.group)
  return seen
}
