import test from 'node:test'
import assert from 'node:assert/strict'
import { fmtDate, cmFromDisplay, displayFromCm, daysBetweenIso, avgDayMonth } from '../../src/lib/format.ts'
import { BIS_UK, scoreTotal, rubricGroups } from '../../src/lib/rubric.ts'

test('canonical centimetres and blank dates stay distinguishable', () => {
  assert.equal(cmFromDisplay(0, 'UK'), 0)
  assert.equal(displayFromCm(95, 'UK'), 95)
  assert.equal(fmtDate(null, 'UK'), '')
  assert.equal(fmtDate(undefined, 'US'), '')
})
test('date duration rejects absent, invalid and reversed intervals', () => {
  assert.equal(daysBetweenIso(null, '2026-05-02'), undefined)
  assert.equal(daysBetweenIso('invalid', '2026-05-02'), undefined)
  assert.equal(daysBetweenIso('2026-05-03', '2026-05-02'), undefined)
  assert.equal(daysBetweenIso('2026-05-01', '2026-05-03'), 2)
})
test('BIS rubric has unique categories totaling exactly 100', () => {
  assert.equal(new Set(BIS_UK.categories.map(c => c.key)).size, BIS_UK.categories.length)
  assert.equal(scoreTotal(Object.fromEntries(BIS_UK.categories.map(c => [c.key, c.max])), BIS_UK), 100)
  assert.equal(scoreTotal(undefined, BIS_UK), 0)
  assert.deepEqual(rubricGroups(BIS_UK), ['Plant', 'Stem', 'Flower', 'Presentation'])
})
// Executed TODO tests expose known audit defects without blessing their current behavior.
// Remove TODO when the separately authorized application remediation makes them pass.
test('P1-02: unedited canonical measurement survives the current conversion chain', { todo: 'Form must preserve untouched canonical cm, not round-trip display input' }, () => {
  assert.equal(cmFromDisplay(displayFromCm(95, 'US'), 'US'), 95)
})
test('P2-02: leap-year average preserves May 1', { todo: 'Existing avgDayMonth leap-year defect; no application fix in foundation' }, () => {
  assert.equal(avgDayMonth(['2024-05-01'], 'UK'), '1 May')
})
test('current UK/US requirement uses slash dates', { todo: 'Historical implementation still formats hyphens' }, () => {
  assert.equal(fmtDate('2026-05-08', 'UK'), '08/05/2026')
  assert.equal(fmtDate('2026-05-08', 'US'), '05/08/2026')
})
