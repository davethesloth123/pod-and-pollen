import test from 'node:test'
import assert from 'node:assert/strict'
import { verifyConfig, PROJECT_REF, SUITE } from '../integration/guard.mjs'
function valid() {
  const accounts = ['A', 'B'].map((role,index) => ({ role, id: `${index+1}`.repeat(8)+'-1111-4111-8111-111111111111', email:`codex-pod-pollen-${role.toLowerCase()}-20260909@example.com` }))
  const env: Record<string,string> = { CODEX_TEST_ENV:'hosted-integration', CODEX_SUPABASE_PROJECT_REF:PROJECT_REF, NEXT_PUBLIC_SUPABASE_URL:`https://${PROJECT_REF}.supabase.co`, NEXT_PUBLIC_SUPABASE_ANON_KEY:'sb_publishable_unit_test_placeholder' }
  for (const account of accounts) {
    env[`CODEX_TEST_USER_${account.role}_ID`] = account.id
    env[`CODEX_TEST_USER_${account.role}_EMAIL`] = account.email
    env[`CODEX_TEST_USER_${account.role}_PASSWORD`] = 'synthetic-unit-test-placeholder-only'
  }
  return { env, registry:{ project_ref:PROJECT_REF, suite:SUITE, accounts }, backup:{ format:'pod-pollen-application-backup-v1', project_ref:PROJECT_REF, auth_account_map:[] as {id:string}[] } }
}
test('valid registered synthetic configuration is accepted without network', () => {
  const c=valid(); assert.equal(verifyConfig(c.env,c.registry,c.backup).length,2)
})
test('missing explicit environment, IDs or wrong project refuses all writes', () => {
  for (const key of ['CODEX_TEST_ENV','CODEX_TEST_USER_A_ID','CODEX_TEST_USER_B_ID','CODEX_SUPABASE_PROJECT_REF','NEXT_PUBLIC_SUPABASE_URL']) {
    const c=valid(); delete c.env[key]; assert.throws(()=>verifyConfig(c.env,c.registry,c.backup))
  }
})
test('protected pre-existing identities and server credentials are rejected', () => {
  const c=valid(); c.backup.auth_account_map.push({id:c.registry.accounts[0].id})
  assert.throws(()=>verifyConfig(c.env,c.registry,c.backup))
  const d=valid(); d.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='sb_secret_forbidden_secret_placeholder'
  assert.throws(()=>verifyConfig(d.env,d.registry,d.backup))
})
