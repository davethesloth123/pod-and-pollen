# Phase A foundation status

Branch `codex/phase-a-safe-foundation`, created from exact audit commit `86d5da61d5020f2e67cb2597eae39c28fe97fe91` on 9 September 2026.

## Completed locally

- Shared persistent hosted-database policy and agent safeguards; no alternative project/local stack.
- Node 24 built-in TypeScript unit tests and transport/configuration guard tests, no new test dependencies.
- Manual hosted integration fixture/RLS tooling with private identity registry and backup prerequisites. It is **not yet live-validated**.
- ESLint flat config: no errors; 115 existing source warnings retained (55 unused variables, 51 explicit-any, 5 unescaped entities, 2 hook dependencies, 2 plain images). No application source rewrite; CI caps warnings at the current 115 baseline.
- Safe CI for install/typecheck/lint/unit/build, immutable official Action refs, read-only repository permission, no persistent checkout credential, no Supabase credentials or hosted writes.
- Typecheck and production build passed; unit/guard suite has 10 passing checks and 3 explicit executed TODOs for existing application defects. No application defect was fixed.
- Version changes: none. Only scripts/runtime engine metadata changed in package files; existing lockfile resolutions are preserved. See [security recommendation](SECURITY_DEPENDENCY_REVIEW.md).

## Backup gate and hosted work

Dashboard Free-plan backup limitation confirmed. A consistent application/catalog SELECT was prepared/executed, but automatic approval review rejected downloading the private-data export. Explicit user approval was requested for the exact private backup destination; no workaround was attempted.

Until that download is approved, saved and verified, **no Codex accounts or fixtures have been created, and no hosted write/RLS probes or authenticated Codex-user browser checks have run**. The private identity registry and local test credentials are consequently not provisioned. `npm run test:integration` refuses to start without them. The backup directory alone is not a backup.

No existing-user records/accounts were edited or deleted by this phase. No migrations, schema/Auth/RLS changes, reset or service-role use occurred. Application source and historical migration files are unchanged. Final live count/hash comparison is still required after the blocked hosted work becomes possible. Existing audit read-only results must not be described as new live integration results.

## Resume order

1. Approve/download/verify the private backup using `scripts/application-backup.sql` and `scripts/verify-backup.mjs`; record actual coverage/checksums privately.
2. Provision exactly two synthetic accounts through normal Auth, save private identity registry/credentials, excluding all pre-backup users.
3. Run guarded seed/verify/RLS modes and inspect with synthetic browser sessions; document actual outcomes and any defects without fixes.
4. Re-export/compare protected records and accounts; verify RLS and refs remain intact. Update this status and commit the observed results.

First application remediation remains the smallest tested fix preventing same-year flowering observations from being erased; preserve other years, optional values and untouched canonical measurements. Separately authorize the narrow runtime security update promptly.
