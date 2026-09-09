import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRequest, PROJECT_REF } from '../integration/guard.mjs'
const a = '11111111-1111-4111-8111-111111111111'
const b = '22222222-2222-4222-8222-222222222222'
const id = '33333333-3333-4333-8333-333333333333'
const ledger = [{ table: 'irises', id, owner: a, delete_probe: true, created_at: new Date().toISOString() }]
const base = `https://${PROJECT_REF}.supabase.co/rest/v1/irises`
test('transport refuses unrestricted and arbitrary-owner deletion', () => {
  assert.throws(() => validateRequest(base, 'DELETE', undefined, [a, b], ledger))
  assert.throws(() => validateRequest(`${base}?user_id=eq.not-a-test-user&id=eq.${id}`, 'DELETE', undefined, [a, b], ledger))
  assert.throws(() => validateRequest(`${base}?user_id=eq.${a}`, 'DELETE', undefined, [a, b], ledger))
})
test('transport permits only registered fixture and owner pairs', () => {
  assert.doesNotThrow(() => validateRequest(`${base}?user_id=eq.${a}&id=eq.${id}`, 'DELETE', undefined, [a, b], ledger))
  assert.throws(() => validateRequest(`${base}?user_id=eq.${b}&id=eq.${id}`, 'DELETE', undefined, [a, b], ledger))
})
test('transport rejects wrong project, RPC and external FK targets', () => {
  assert.throws(() => validateRequest('https://other.supabase.co/rest/v1/irises', 'POST', {}, [a,b], ledger))
  assert.throws(() => validateRequest(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc/reset`, 'POST', {}, [a,b], ledger))
  assert.throws(() => validateRequest(base, 'POST', { id, user_id: a, location_id: 'real-location' }, [a,b], ledger))
  assert.throws(() => validateRequest(`${base}?user_id=eq.${a}&id=eq.${id}`, 'PATCH', { user_id:b }, [a,b], ledger))
})

test('cascade-bearing cleanup and stale standalone probes fail closed', () => {
  assert.throws(() => validateRequest(`${base}?user_id=eq.${a}&id=eq.${id}`, 'DELETE', undefined, [a,b], [{ table:'irises', id, owner:a }]))
  assert.throws(() => validateRequest(`${base}?user_id=eq.${a}&id=eq.${id}`, 'DELETE', undefined, [a,b], [{ table:'irises', id, owner:a, delete_probe:true, created_at:'2020-01-01T00:00:00Z' }]))
})
