# Shared persistent development environment

Decision: 9 September 2026, after audit commit `86d5da61d5020f2e67cb2597eae39c28fe97fe91`.

**The existing hosted `pod-pollen-dev` is the single active Supabase development project. It is shared and persistent, never disposable.** Its project reference is `ejdvmlpuwldgetchpsdl`. Do not create another project or a local Supabase stack. Existing users must remain active and able to use their records normally.

## Protected data

Existing accounts and their iris, flowering, crossing, seed-batch, evaluation, garden, note and other records are protected. Never use them as test fixtures, alter their credentials, bulk-update/delete them, automatically normalize historical data, truncate/drop tables, wipe auth users or reset/recreate the database. **Remote resets, including `supabase db reset --linked`, are prohibited.** A project named dev is not permission to destroy its contents.

Legacy slash flowering dates, year-only planting dates, the known parent-name mismatch and repeated-year legacy evaluations are compatibility requirements. Future code must tolerate them. Any deliberate historical data migration needs separate authorization; a cleaner model alone is not justification.

## Synthetic ownership

Two dedicated synthetic Codex accounts (A and B) support normal application and cross-user RLS tests. No real user credentials are used. Credentials belong in mode-0600 `.env.integration.local` (Git-ignored), not public environment variables or docs. Their purpose is tested through signed-in Auth identity, an explicit suite marker, and a private registry at `~/PodAndPollenBackups/codex-test-identities.json` created during provisioning. The registry pins the account IDs and original backup checksum. Existing pre-backup account IDs are explicitly excluded.

All fixtures use `CODEX TEST - ...` labels but **names are not an ownership boundary**. The fixture ledger records table, owner UUID and record UUID before each insert. Ordinary integration requests use only public Supabase credentials and those two signed-in users, with RLS enabled. No service-role key is used or exposed.

## Write and cleanup gates

`tests/integration/guard.mjs` rejects writes unless project URL/reference, explicit `hosted-integration` environment, both configured IDs/emails, private registry, backup checksum and signed-in user identities/markers agree. Transport checks reject other origins, RPCs, account/admin mutations, unknown tables, unregistered inserts, identity/owner updates and references outside the registered synthetic graph. Updates/deletes require exact owner and fixture-ID equality filters. Negative RLS probes can target the other synthetic owner only.

`npm run test:integration` verifies read-only isolation. Explicit `-- seed` creates the registered fixtures once; it refuses a nonempty ledger rather than guessing how to resume a partial seed. `-- rls` performs bounded synthetic CRUD/relationship probes. `-- cleanup-leaves` removes only registered note/photo/flowering/evaluation leaf rows by owner AND ID, retaining parent/cross/garden fixtures. Generic cascade-bearing cleanup is deliberately refused. Fresh standalone iris probes have a two-minute cleanup window and are never used as targets by this suite. Any broader cleanup requires a separate review of all affected references, including other users' rows, and must stop if ownership cannot be proven. Never turn RLS off to make tests pass.

Account provisioning is a one-time, separately scoped creation of the two fixed synthetic identities after backup; it necessarily precedes learning their Auth UUIDs. Committed integration tooling cannot provision accounts or accept arbitrary user IDs. No accounts are created in CI.

## Migration policy

1. Generate a new migration in Git; never edit/delete previously applied migrations or casually squash live history.
2. Review SQL and classify it as additive, transformative or destructive; assess all existing users and records.
3. Take and verify an appropriate backup before consequential schema/data changes; see [backup policy](BACKUP_AND_RECOVERY.md).
4. Prefer additive/backwards-compatible changes. Obtain task-specific authorization for migration application/data transformation.
5. Apply deliberately, then verify existing users and record compatibility. Never run a remote reset or automatic historical cleanup.

## Testing and CI

Node 24's built-in test runner executes TypeScript unit tests without Supabase. CI runs install/typecheck/lint/unit/build with deliberately unusable placeholders, never hosted credentials or integration writes. Known business defects remain explicit executed TODO tests until separately authorized fixes. Future browser tests must use separate A/B sessions and the same guarded fixture ownership; no whole E2E suite is introduced here.

The authoritative decision in this file supersedes the audit's earlier recommendation for a disposable database. Use pure mocks for destructive schema/migration tests that cannot safely occur in this shared project. Do not create an alternative database contrary to this decision.
