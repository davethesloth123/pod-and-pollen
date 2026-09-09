// Offline verification only. Never connects to Supabase and never restores data.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { PROJECT_REF, TABLES } from '../tests/integration/guard.mjs'
const filename = process.argv[2]
assert.ok(filename, 'Pass an existing private application-backup.json path outside the repository')
const absolute = fs.realpathSync(filename)
const repo = fs.realpathSync(process.cwd())
assert.ok(!absolute.startsWith(repo + path.sep), 'Backups must stay outside the repository')
assert.equal(fs.statSync(absolute).mode & 0o077, 0, 'Backup file must be private')
const bytes = fs.readFileSync(absolute)
const backup = JSON.parse(bytes)
assert.equal(backup.format, 'pod-pollen-application-backup-v1')
assert.equal(backup.project_ref, PROJECT_REF)
assert.ok(!Number.isNaN(Date.parse(backup.captured_at)))
assert.ok(Array.isArray(backup.auth_account_map) && backup.auth_account_map.length >= 2)
assert.ok(backup.catalog.columns.length >= 135)
assert.equal(backup.catalog.tables.length, 10)
assert.ok(backup.catalog.tables.every(t => t.rls === true))
assert.ok(backup.catalog.constraints.every(c => c.validated))
const owners = new Set(backup.auth_account_map.map(a => a.id))
const tables = {}
for (const table of TABLES) {
  const rows = backup.data[table]
  assert.ok(Array.isArray(rows), `Missing ${table}`)
  assert.equal(new Set(rows.map(r => r.id)).size, rows.length, `Duplicate IDs in ${table}`)
  assert.ok(rows.every(r => owners.has(table === 'profiles' ? r.id : r.user_id)), `Unknown owner in ${table}`)
  tables[table] = { count:rows.length, sha256:crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex') }
}
const report = { format:'pod-pollen-backup-verification-v1', project_ref:PROJECT_REF, captured_at:backup.captured_at, sha256:crypto.createHash('sha256').update(bytes).digest('hex'), accounts:owners.size, tables, recovery_limit:'Application rows/catalog only; not an Auth password/session or platform restore; no restore executed.' }
fs.writeFileSync(path.join(path.dirname(absolute), 'verification.json'), JSON.stringify(report,null,2)+'\n', {mode:0o600,flag:'wx'})
console.log(JSON.stringify({verified:true,accounts:owners.size,counts:Object.fromEntries(Object.entries(tables).map(([t,v])=>[t,v.count]))},null,2))
