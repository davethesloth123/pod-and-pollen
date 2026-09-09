# Pod & Pollen — Codex takeover summary

**9 September 2026** · Application baseline `ec2fbc6a1e4d70bf6ab4a6446822fe42824b7cd8` · `codex/initial-audit`

## Health

A useful specialist iris/breeding application with real persistence and a coherent UI, ready for scoped development. **Not ready for wider use as the only copy of irreplaceable records or for commercialization.** This audit changes documentation only. See the [full 33-section audit](CODEX_INITIAL_AUDIT.md) for evidence, feature/mutation matrices and test/roadmap details.

**Findings: 0 P0, 10 P1, 18 P2, 4 P3 groups.** No catastrophic incident or successful security breach was confirmed. Important source-confirmed loss paths and affected dependencies still require early action.

## Five strongest parts

1. Specialist connected plant/parent/cross/seedling model with real Supabase persistence.
2. Unique annual flowering records and intentionally optional measurements.
3. Data-driven, complete BIS scoring totaling 100, with legacy data retained.
4. Owner-filtered queries and RLS on all ten tables; anonymous protected reads empty.
5. Coherent mobile-first UI, working map geometry editor, reproducible lockfile and passing compilation baseline.

## Five biggest risks

1. Same-year flowering entry can erase prior fields; US edit forms can change untouched centimetres.
2. Hard deletion cascades into history without a verified recovery workflow or export.
3. Multi-step saves can silently succeed only partly; photo/offline/stage actions make unsupported completion claims.
4. RLS checks row ownership but not ownership consistency of linked records; no cross-owner links found, but hostile writes remain untested.
5. Locked Next/sharp runtime dependencies have current serious advisories; affected versions confirmed, deployed exploitability not established.

## Verification and existing data

Signed-out localhost rendering and Supabase initialization work; all expected tables respond. A clean browser rendered auth screens without observed console errors at the inspected state. Authenticated local UI and write flows were **not** exercised. No database writes, auth emails, migrations or settings changes occurred.

Read-only aggregates found 162 irises, 67 crosses, 61 batches, 12 flowering rows and 8 evaluations. No missing FK targets, cross-owner references or ancestry cycles were found. One stored parent-name mismatch, one repeated evaluation-year group, two flowering rows with slash dates and 54 non-ISO planting dates need careful compatibility handling; none was changed. Zero photo rows/buckets and zero settings rows corroborate incomplete integrations. No private names, record IDs or credentials are included in the audit.

Final typecheck and production build passed. Lint exited 1 at the missing-configuration prompt; no automated test suite/CI exists. Details are in section 21 of the full audit. History pattern scan found no secret matches in 309 reachable blobs; `.env.local` remains ignored.

## Five development priorities

1. Establish recovery/test boundaries, truthful save/offline/photo behavior and a focused dependency security review.
2. Protect annual flowering observations and untouched canonical measurements with regression tests.
3. Make linked writes/relationship ownership and seed-batch identity reliable.
4. Complete recovery/export/auth recovery; improve deletion safeguards and CI.
5. Repair navigation/search/garden state, then implement permanent seedling identity, lots, structured gardens, photos and later offline support.

## Claude handover accuracy

**Partially accurate and broadly useful.** The major warnings are supported, but import is currently unreachable; the map editor exists; the legacy scorecard defect belongs to CompareScreen rather than CrossDetail; the 95→94 conversion example stabilizes rather than drifting forever; sheet Escape handling exists; and locked Supabase requires Node >=20. Current user requirements specify slash dates even though older documentation says hyphens. Corrections are catalogued without rewriting the historical handover.

## Decisions affecting upcoming work

Agree an isolated write-test/recovery environment and deletion retention policy; permanent seedling identity/outcomes and repeated-year evaluation semantics; confirm lot/multiple-location scope; choose private photo storage/backup; authorize auth configuration testing later. UK/US slash formatting is already decided. The documentation push also needs resolution of a possible automatic Vercel preview versus the no-deployment instruction; no hosting settings were changed.

## Recommended first phase

Protect existing evidence. Begin with a small tested flowering create/edit change that preserves existing same-year fields and untouched US measurements. Review the smallest compatible security dependency update immediately and make unfinished actions honest. Do not start with a rewrite, broad upgrades, import, or live-data cleanup. No remediation is authorized by this summary.
