import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const PROJECT_REF = 'ejdvmlpuwldgetchpsdl'
export const SUITE = 'codex-phase-a-2026-09-09'
export const TABLES = ['profiles', 'user_settings', 'locations', 'irises', 'crosses', 'seed_batches', 'notes', 'photos', 'flowering_records', 'evaluations']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const registryPath = path.join(os.homedir(), 'PodAndPollenBackups', 'codex-test-identities.json')

export function verifyConfig(env, registry, backup) {
  assert.equal(env.CODEX_TEST_ENV, 'hosted-integration', 'Explicit integration environment required')
  assert.equal(env.CODEX_SUPABASE_PROJECT_REF, PROJECT_REF, 'Unexpected project reference')
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, `https://${PROJECT_REF}.supabase.co`, 'Unexpected Supabase URL')
  assert.equal(registry.project_ref, PROJECT_REF)
  assert.equal(registry.suite, SUITE)
  assert.equal(backup.project_ref, PROJECT_REF)
  assert.equal(backup.format, 'pod-pollen-application-backup-v1')
  assert.equal(registry.accounts.length, 2)
  const ids = registry.accounts.map(a => a.id)
  assert.equal(new Set(ids).size, 2, 'Two distinct registered test users required')
  for (const [index, role] of ['A', 'B'].entries()) {
    const account = registry.accounts[index]
    assert.match(account.id, UUID)
    assert.equal(account.role, role)
    assert.equal(env[`CODEX_TEST_USER_${role}_ID`], account.id, 'Test identity mismatch')
    assert.equal(env[`CODEX_TEST_USER_${role}_EMAIL`], account.email, 'Test email mismatch')
    assert.equal(account.email, `codex-pod-pollen-${role.toLowerCase()}-20260909@example.com`)
    assert.ok(!backup.auth_account_map.some(a => a.id === account.id), 'Existing protected account cannot be a test user')
    assert.ok(env[`CODEX_TEST_USER_${role}_PASSWORD`]?.length >= 24, 'Missing synthetic password')
  }
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  assert.ok(key.length > 20 && !key.startsWith('sb_secret_'), 'Public key required')
  if (key.split('.').length === 3) {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
    assert.equal(claims.role, 'anon', 'Only an anon browser key is allowed')
  } else assert.ok(key.startsWith('sb_publishable_'), 'Only public credentials are allowed')
  return ids
}

// All write-capable requests pass through this independent final transport guard.
// Negative RLS probes may target the OTHER registered synthetic owner, never a real owner.
export function validateRequest(url, method, body, ids, ledger) {
  const u = new URL(url)
  assert.equal(u.origin, `https://${PROJECT_REF}.supabase.co`, 'Unexpected request origin')
  if (u.pathname.startsWith('/auth/v1/')) {
    assert.ok((method === 'GET' && u.pathname === '/auth/v1/user') ||
      (method === 'POST' && u.pathname === '/auth/v1/token' && u.searchParams.get('grant_type') === 'password'), 'Auth mutation not permitted by integration transport')
    return
  }
  assert.ok(u.pathname.startsWith('/rest/v1/'), 'Only Auth login/user and Data API supported')
  const table = u.pathname.slice('/rest/v1/'.length)
  assert.ok(TABLES.includes(table), 'Unexpected table or RPC')
  if (method === 'GET' || method === 'HEAD') return
  assert.ok(['POST', 'PATCH', 'DELETE'].includes(method), 'Unexpected write method')
  assert.notEqual(table, 'profiles', 'Profile writes are outside integration fixture scope')
  assert.notEqual(table, 'user_settings', 'Settings writes are outside integration fixture scope')
  const entries = Array.isArray(body) ? body : [body]
  if (method === 'POST') {
    assert.ok(entries.length > 0)
    for (const row of entries) {
      assert.ok(ids.includes(row?.user_id), 'Insert requires registered owner')
      assert.ok(ledger.some(x => x.table === table && x.id === row.id && x.owner === row.user_id), 'Insert ID must be registered before writing')
      for (const field of ['iris_id', 'location_id', 'pod_parent_id', 'pollen_parent_id', 'cross_id', 'seed_batch_id']) {
        if (row[field]) assert.ok(ledger.some(x => x.id === row[field] && ids.includes(x.owner)), 'References must target registered synthetic fixtures')
      }
    }
  } else {
    const owner = u.searchParams.get('user_id')
    assert.ok(owner?.startsWith('eq.') && ids.includes(owner.slice(3)), 'Explicit synthetic owner equality filter required')
    const target = u.searchParams.get('id')
    assert.ok(target?.startsWith('eq.'), 'Explicit single fixture ID equality filter required')
    assert.ok(ledger.some(x => x.table === table && x.id === target.slice(3) && x.owner === owner.slice(3)), 'Write target must be an owned registered fixture')
    if (method === 'DELETE' && !['notes', 'photos', 'flowering_records', 'evaluations'].includes(table)) {
      const entry = ledger.find(x => x.id === target.slice(3))
      assert.ok(table === 'irises' && entry.delete_probe === true && Date.now() - Date.parse(entry.created_at) < 120000, 'Cascade-bearing fixture cleanup forbidden; only freshly created standalone probes may be deleted')
    }
    if (body) {
      assert.ok(!('user_id' in body) && !('id' in body), 'Ownership/identity updates forbidden')
      for (const field of ['iris_id', 'location_id', 'pod_parent_id', 'pollen_parent_id', 'cross_id', 'seed_batch_id']) {
        if (body[field]) assert.ok(ledger.some(x => x.id === body[field] && ids.includes(x.owner)), 'References must stay synthetic')
      }
    }
  }
}

export async function safeContext(env = process.env) {
  assert.equal(fs.statSync('.env.integration.local').mode & 0o077, 0, 'Integration credential file must be private')
  assert.equal(fs.statSync(registryPath).mode & 0o077, 0, 'Identity registry must be private')
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  const bytes = fs.readFileSync(registry.backup_path)
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), registry.backup_sha256, 'Backup checksum mismatch')
  const backup = JSON.parse(bytes)
  const ids = verifyConfig(env, registry, backup)
  const ledger = registry.fixtures || []
  const clients = []
  for (const account of registry.accounts) {
    const guardedFetch = async (input, init = {}) => {
      const request = new Request(input, init)
      const rawBody = ['GET', 'HEAD'].includes(request.method) ? '' : await request.clone().text()
      const body = rawBody ? JSON.parse(rawBody) : undefined
      validateRequest(request.url, request.method, body, ids, ledger)
      return fetch(request)
    }
    const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: guardedFetch },
    })
    const login = await client.auth.signInWithPassword({ email: account.email, password: env[`CODEX_TEST_USER_${account.role}_PASSWORD`] })
    assert.ok(!login.error, 'Synthetic login failed (details redacted)')
    const { data, error } = await client.auth.getUser()
    assert.ok(!error && data.user, 'Cannot verify synthetic identity')
    assert.equal(data.user.id, account.id)
    assert.equal(data.user.email, account.email)
    assert.equal(data.user.user_metadata.codex_suite, SUITE)
    assert.equal(data.user.user_metadata.codex_test, true)
    clients.push(client)
  }
  function persist() { fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n', { mode: 0o600 }) }
  function register(table, owner, label) {
    assert.ok(TABLES.includes(table) && ids.includes(owner))
    const id = crypto.randomUUID()
    const entry = { table, owner, id, label, created_at: new Date().toISOString() }
    ledger.push(entry); registry.fixtures = ledger; persist()
    return id
  }
  return { clients, ids, registry, ledger, register, persist }
}
