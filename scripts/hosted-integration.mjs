import assert from 'node:assert/strict'
import { safeContext, TABLES } from '../tests/integration/guard.mjs'
import { BIS_UK } from '../src/lib/rubric.ts'

const mode = process.argv[2] || 'verify'
assert.ok(['verify', 'seed', 'rls', 'cleanup-leaves'].includes(mode), 'Unsupported mode')
const ctx = await safeContext()
const { clients, ids, registry, ledger, register, persist } = ctx
const result = { mode, project_verified: true, identities_verified: 2, results: [] }
const rowKey = (role, label) => ledger.find(x => x.owner === ids[role] && x.label === label)
const checked = (response, description) => {
  assert.ok(!response.error, `${description} failed (${response.error?.code || 'unknown'}; details redacted)`)
  return response.data
}
async function insert(role, table, label, fields) {
  assert.ok(!rowKey(role, label), `Fixture already registered: ${label}; use verify, do not reseed blindly`)
  const id = register(table, ids[role], label)
  const data = checked(await clients[role].from(table).insert({ ...fields, id, user_id: ids[role] }).select('id').single(), `Insert ${label}`)
  assert.equal(data.id, id)
  return id
}

if (mode === 'seed') {
  assert.ok(!ledger.length, 'Existing fixture ledger: refuse duplicate seed run; investigate partial state manually')
  for (const role of [0, 1]) {
    const prefix = `CODEX TEST - ${role === 0 ? 'A' : 'B'}`
    const location = await insert(role, 'locations', 'garden', { name: `${prefix} Garden`, kind: 'Bed', x: 10, y: 10, w: 20, h: 20 })
    const parent = await insert(role, 'irises', 'parent', { name: `${prefix} Parent 95cm`, kind: 'Variety', classification: 'TB', height_cm: 95, location_id: location, grid_ref: 'A1', status: 'Growing' })
    const pollen = await insert(role, 'irises', 'pollen', { name: `${prefix} Pollen`, kind: 'Variety', classification: 'TB', height_cm: 100, location_id: location, grid_ref: 'A2', status: 'Growing' })
    const cross = await insert(role, 'crosses', 'cross', { code: `${prefix} CROSS 01`, pod_parent_id: parent, pollen_parent_id: pollen, pod_parent: `${prefix} Parent 95cm`, pollen_parent: `${prefix} Pollen`, season: '2025', pollination_date: '2025-05-10', status: 'Sown' })
    const batch = await insert(role, 'seed_batches', 'batch', { cross_id: cross, seeds_count: 10, germinated: 6, germ_pct: 60, treatment: 'CODEX TEST - synthetic cold treatment', sown_date: '2025-09-01' })
    const child = await insert(role, 'irises', 'child', { name: `${prefix} Seedling 01`, kind: 'Seedling', classification: 'TB', pod_parent_id: parent, pollen_parent_id: pollen, cross_id: cross, seed_batch_id: batch, location_id: location, grid_ref: 'B1', status: 'Growing' })
    await insert(role, 'irises', 'partial-save', { name: `${prefix} Partial-save fixture`, kind: 'Variety', classification: 'TB', height_cm: 95, status: 'Growing' })
    await insert(role, 'notes', 'note', { iris_id: parent, body: 'CODEX TEST - synthetic observation, not grower data', note_type: 'General' })
    await insert(role, 'flowering_records', 'flowering-2025', { iris_id: child, year: 2025, first_date: '2025-05-10', last_date: '2025-05-20', height_cm: 95, stems: 2, buds: 5, notes: 'CODEX TEST - preserve this prior year' })
    await insert(role, 'flowering_records', 'flowering-2026', { iris_id: child, year: 2026, first_date: '2026-05-12', last_date: null, height_cm: null, buds: null, notes: 'CODEX TEST - optional measurements' })
    await insert(role, 'evaluations', 'evaluation', { iris_id: child, eval_year: 2026, rubric: BIS_UK.id, scores: Object.fromEntries(BIS_UK.categories.map(c => [c.key, c.max])), total: 100, comments: 'CODEX TEST - synthetic complete scorecard' })
  }
  result.results.push({ seeded: ledger.length })
}

for (const role of [0, 1]) {
  for (const table of TABLES) {
    const owner = table === 'profiles' ? 'id' : 'user_id'
    const rows = checked(await clients[role].from(table).select(table === 'profiles' ? 'id' : 'id,user_id').in(owner, ids), `Read ${table}`)
    assert.ok(rows.every(row => row[owner] === ids[role]), 'Cross-user visibility detected; content redacted')
  }
}
result.results.push({ ordinary_account_isolation: 'pass', tables: TABLES.length })

if (mode === 'rls') {
  assert.ok(rowKey(0, 'parent') && rowKey(1, 'parent'), 'Seed fixtures first')
  // A standalone disposable iris is never used as a parent/cross/child by this suite.
  const disposable = await insert(1, 'irises', `delete-probe-${Date.now()}`, { name: 'CODEX TEST - B Disposable CRUD probe', kind: 'Variety', classification: 'TB', height_cm: 95 })
  const target = ledger.find(x => x.id === disposable)
  target.delete_probe = true; persist()
  const read = checked(await clients[0].from('irises').select('id').eq('user_id', ids[1]).eq('id', disposable), 'Negative read')
  const update = checked(await clients[0].from('irises').update({ height_cm: 96 }).eq('user_id', ids[1]).eq('id', disposable).select('id'), 'Negative update')
  const remove = checked(await clients[0].from('irises').delete().eq('user_id', ids[1]).eq('id', disposable).select('id'), 'Negative delete')
  result.results.push({ a_read_b_blocked: read.length === 0, a_update_b_blocked: update.length === 0, a_delete_b_blocked: remove.length === 0 })
  assert.equal(remove.length, 0, 'RLS deletion failure on synthetic probe; stop for investigation')
  checked(await clients[1].from('irises').update({ height_cm: 97 }).eq('user_id', ids[1]).eq('id', disposable).select('id').single(), 'Own update')
  const own = checked(await clients[1].from('irises').select('height_cm').eq('user_id', ids[1]).eq('id', disposable).single(), 'Own read')
  assert.equal(own.height_cm, 97)
  checked(await clients[1].from('irises').delete().eq('user_id', ids[1]).eq('id', disposable).select('id').single(), 'Own disposable delete')
  result.results.push({ synthetic_iris_crud: 'pass' })
  for (const [label, fields] of [
    ['foreign-parent', { pod_parent_id: rowKey(1, 'parent').id }],
    ['foreign-location', { location_id: rowKey(1, 'garden').id }],
    ['foreign-cross', { cross_id: rowKey(1, 'cross').id }],
    ['foreign-batch', { seed_batch_id: rowKey(1, 'batch').id }],
  ]) {
    const id = register('irises', ids[0], `probe-${label}-${Date.now()}`)
    ledger.find(x => x.id === id).delete_probe = true; persist()
    const response = await clients[0].from('irises').insert({ id, user_id: ids[0], name: `CODEX TEST - ${label}`, kind: 'Seedling', classification: 'TB', ...fields }).select('id')
    result.results.push({ probe: label, foreign_relationship_accepted: !response.error, error_code: response.error?.code || null })
    if (!response.error) checked(await clients[0].from('irises').delete().eq('user_id', ids[0]).eq('id', id).select('id').single(), 'Remove synthetic relationship probe')
  }
  const noteId = register('notes', ids[0], `probe-foreign-note-${Date.now()}`)
  const linked = await clients[0].from('notes').insert({ id: noteId, user_id: ids[0], iris_id: rowKey(1, 'parent').id, body: 'CODEX TEST - foreign owned iris reference probe' }).select('id')
  result.results.push({ probe: 'foreign-iris-note', foreign_relationship_accepted: !linked.error, error_code: linked.error?.code || null })
  if (!linked.error) checked(await clients[0].from('notes').delete().eq('user_id', ids[0]).eq('id', noteId).select('id').single(), 'Remove note probe')
}

if (mode === 'cleanup-leaves') {
  // Deliberately cannot delete garden/cross/parent fixtures: those have cascading inbound FKs.
  // A full cleanup requires separately reviewed all-owner reference evidence, not this helper.
  const leaves = ['notes', 'photos', 'flowering_records', 'evaluations']
  for (const entry of ledger.filter(x => leaves.includes(x.table))) {
    const role = ids.indexOf(entry.owner)
    checked(await clients[role].from(entry.table).delete().eq('user_id', entry.owner).eq('id', entry.id).select('id'), 'Leaf fixture cleanup')
  }
  result.results.push({ cleanup: 'registered leaf fixtures only; parents, locations and crosses retained' })
}
registry.last_result = { ...result, completed_at: new Date().toISOString() }; persist()
console.log(JSON.stringify(result, null, 2))
