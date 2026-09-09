# Testing boundaries

Use Node 24 and `npm test` for the built-in Node test runner executing TypeScript directly. Unit tests require no network or Supabase credentials. Known audit defects are explicitly marked **executed TODO** tests: their failures remain visible, are not fixes, and must not be mistaken for passing coverage. Remove TODO only in the relevant remediation.

Hosted integration tests are manual, excluded from `npm test` and CI, and use only the two registered Codex accounts in `pod-pollen-dev`. Read `docs/development/DATA_ENVIRONMENT.md` and `BACKUP_AND_RECOVERY.md` first. Credentials belong in `.env.integration.local`, never in `NEXT_PUBLIC_*` test-password variables. The identity registry and backup remain outside Git.

Future browser E2E: use the same verified identities, separate browser contexts for A/B, and the guarded fixture manager. Never persist browser auth state under tracked paths. Do not submit real users' records or run unrestricted cleanup. This foundation does not add a full browser suite.
