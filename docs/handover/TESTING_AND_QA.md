# Pod & Pollen — Testing and QA

---

## 1. Verification run performed for this handover

Executed against commit `3aa0c54` on a clean `npm ci` install (Node 22.x, npm 10.9.7).

| Check | Command | Result |
|---|---|---|
| Install | `npm ci` | ✅ **Pass** — exit 0, 264 packages, no install errors |
| Type check | `npx tsc --noEmit` | ✅ **Pass** — exit 0, **zero errors**, `strict: true` |
| Production build | `npx next build` | ✅ **Pass** — exit 0, compiled in 9.7 s, 6/6 static pages generated |
| Lint | `npm run lint` | ❌ **FAIL** — exit 1 |
| Unit tests | — | ⚠️ **None exist** |
| Integration tests | — | ⚠️ **None exist** |
| End-to-end tests | — | ⚠️ **None exist** |
| Dependency audit | `npm audit --omit=dev` | ⚠️ **4 high severity** |

### Build output
```
▲ Next.js 15.5.18
✓ Compiled successfully in 9.7s
✓ Generating static pages (6/6)

Route (app)                    Size  First Load JS
┌ ƒ /                       49.2 kB         225 kB
├ ○ /_not-found               996 B         103 kB
├ ○ /auth                   3.84 kB         179 kB
└ ○ /icon.svg                   0 B            0 B
+ First Load JS shared by all          102 kB
ƒ Middleware                                89.6 kB
```
The build required `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be present;
**placeholder values were used** and none were written to any file.

### Lint failure
```
`next lint` is deprecated and will be removed in Next.js 16.
? How would you like to configure ESLint?
❯  Strict (recommended)
   Base
   Cancel
exit code 1
```
**Cause:** ESLint and `eslint-config-next` are installed, but **no ESLint configuration file
exists** anywhere in the repository (no `.eslintrc*`, no `eslint.config.*`). `next lint` falls
into its interactive first-run setup and cannot complete unattended. See
[KNOWN_ISSUES.md K-08](./KNOWN_ISSUES.md).

### Dependency audit
4 high-severity advisories, all `libvips` vulnerabilities inherited through `sharp`
(CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 / GHSA-f88m-g3jw-g9cj). `sharp`
is a transitive dependency of Next.js image optimisation, which this app does not use.
`npm audit fix` is reported as available. Not applied — this was a documentation task.

### Secrets check
`git log -p` was not re-scanned exhaustively, but the working tree was checked: `.env.example`
contains **placeholder values only** (`https://your-project.supabase.co`, `your-anon-key`);
`.gitignore` correctly excludes `.env*.local`, `.env.staging` and `.env.production`; no `.env`
file is tracked; no service-role key appears anywhere in `src/`. **No secrets were introduced by
this documentation work.**

---

## 2. Existing automated tests

**There are none.** Specifically:

- No test runner — no Jest, Vitest, Playwright, Cypress or `node:test` usage.
- No test files — no `*.test.ts`, `*.spec.ts`, `__tests__/` or `e2e/` anywhere.
- No `test` script in `package.json`.
- No CI — there is no `.github/` directory, so nothing runs on push or pull request.

The only automated verification the project has ever had is the TypeScript compiler, and nothing
enforces that it keeps passing.

---

## 3. Manual QA process

Reconstructed from `docs/feedback-brief-2026-06-25.md` and the commit history. The process is
entirely human and works like this:

1. Work is developed on a `claude/*` branch by an AI coding session.
2. It is pushed and deployed to a Vercel preview.
3. **The project owner's father** — an experienced iris grower and hybridiser, and the product's
   primary user — reviews it against real-world use.
4. Feedback is collected into a written brief (as on 25 June 2026), triaged into
   bug / feature / schema / UI categories, and turned into a phased build plan.
5. Fixes ship and the cycle repeats.

This is genuinely good domain QA — the feedback brief contains exactly the kind of finding only a
real practitioner produces ("all cells must be optional", "the seedling number must be retained
once a variety is named", "seed lots are for germination tracking only"). It is also **entirely
dependent on one reviewer**, has no written regression checklist, and produces no artefact a new
developer can re-run.

---

## 4. Areas with no automated coverage

Everything. The following carry real, non-obvious logic and are verified today only by someone
clicking through the app:

| Area | Code | Why it matters |
|---|---|---|
| Date formatting per region | `lib/format.ts:fmtDate` | Handles ISO, legacy `DD/MM/YYYY`, and arbitrary strings |
| Unit conversion | `lib/format.ts:fmtHeight/cmFromDisplay/displayFromCm` | **Already known to drift on edit** (K-05) |
| Average first-flower date | `lib/format.ts:avgDayMonth` | Day-of-year averaging with leap-year normalisation |
| Flowering duration | `lib/format.ts:daysBetweenIso` | Silently returns `undefined` for negative spans (K-30) |
| Rubric totalling | `lib/rubric.ts:scoreTotal` | Must sum to exactly 100; caps per category |
| Lifecycle derivation | `lib/data/index.ts:lifecycleFor` | Different stage sets for varieties vs seedlings |
| Widget recommendation | `lib/data/index.ts:recommendWidgets` | Ordering and de-duplication from onboarding answers |
| Row → app mappers | `lib/db/queries.ts:dbTo*` | Every null-coalescing default |
| Parent-id self-healing | `lib/data-context.tsx:135–140` | Name→id resolution at load |
| **Rename cascade** | `lib/data-context.tsx:280–318` | **Highest-risk logic in the codebase** |
| Flowering upsert | `queries.ts:upsertFlowering` | The one-record-per-year guarantee |
| Cross-code generation | `record-pollination.tsx:94` | Reuses codes after deletion (K-21) |
| Flowering status rule | `record-flowering.tsx:82–91` | Only current-year records affect status |
| Collection sorting | `collection.tsx:112–132` | Eight sort modes with tie-breaking |
| RLS isolation | migrations | **Never verified that user A cannot read user B's data** |

---

## 5. Known fragile workflows

Ordered by risk. These are the ones to exercise most carefully after any change.

1. **The rename cascade.** Renaming a plant issues a sequential, non-transactional update to
   every child iris and every cross referencing it, matching by id *or* by old name. A failure
   part-way leaves lineage inconsistent, and the user is still told "updated" (K-20). This is the
   single most dangerous piece of code in the repository.
2. **Region switching combined with editing.** Round-trips through whole inches lose precision
   permanently (K-05).
3. **Flowering record upsert.** Correct today, but the `UNIQUE (iris_id, year)` constraint is the
   guarantee that history is never overwritten — the product's central promise. Any change here
   must be tested with multiple years and re-recorded years.
4. **Parentage with free-typed names.** A parent typed but not selected stores a name with a null
   id. The healing logic depends on exact string matching, so trailing whitespace or a case
   difference silently breaks the link.
5. **Deleting a cross or a location.** Both leave dependent records intentionally orphaned
   (seedlings unlinked, plants unassigned). The local state update mirrors the database's
   `ON DELETE SET NULL` by hand — if those ever disagree, the UI lies until a reload.
6. **Onboarding on a second device.** Re-runs and can create a duplicate location (K-07), which
   then mis-groups plants because three paths group by location name (K-16).
7. **Evaluation editing.** No `UNIQUE (iris_id, eval_year)`, so duplicates are possible and
   `latestEval()` picks arbitrarily among same-year records (K-15).
8. **Sign-up.** Depends on a Supabase dashboard setting (email confirmation) that the repository
   cannot see, and fails silently if it is enabled.

---

## 6. Tests that should exist but do not

Recommended in priority order. **These are recommendations — none were written as part of this
task.**

### Tier 1 — pure functions (no infrastructure needed; highest value per hour)
A test runner (Vitest is the natural fit for a Vite-less Next project too) plus:

- `lib/format.ts`
  - `fmtDate` for UK and US: ISO input, legacy `DD/MM/YYYY` input, free text passthrough,
    empty/null.
  - `fmtHeight` / `cmFromDisplay` / `displayFromCm`: **a round-trip property test asserting no
    drift** — this is the regression test for K-05.
  - `avgDayMonth`: single date, multiple dates, leap years, unparseable values, empty.
  - `daysBetweenIso`: normal span, same day, **reversed dates**, invalid input.
- `lib/rubric.ts`
  - `BIS_UK.categories` sum to exactly **100** (a guard against a future rubric edit).
  - `scoreTotal` with partial, complete and unknown keys.
  - `rubricGroups` ordering.
- `lib/data/index.ts`
  - `lifecycleFor` for a variety with and without parentage, and for a seedling at each stage.
  - `recommendWidgets` — ordering, de-duplication, system-pinned first/last.
  - `liveParentNames` — id resolution beating stale stored names.
- `lib/db/queries.ts` mappers — `dbToIris`, `dbToFlowering`, `dbToEval` (including the legacy
  evaluation path), `dbToCross` with all-null rows.

### Tier 2 — component and integration (Testing Library + a mocked Supabase client)
- Add Iris: duplicate-name guard; variety-only fields hidden for seedlings; height conversion in
  both regions.
- Record Flowering: all-optional fields stay blank rather than becoming `0`; the current-year
  status rule; editing a past year does **not** change status.
- Evaluation: category caps; save disabled until every category is filled; total sums correctly.
- Flowering summary: averages across several years, including years with missing measurements.
- Seedlings strip: matches by id, and by name where the id is absent.
- **Navigation: every `go()` target resolves to a real case** — this test alone would have caught
  K-04.

### Tier 3 — end-to-end (Playwright; Chromium is already available in this environment)
- Sign up → onboard → add a location → add an iris → record flowering → view averages.
- Create a cross → add seedlings → evaluate one → check the cross detail.
- Rename a plant that has children and crosses → assert lineage survives everywhere.
- Region switch → assert dates and units change and stored values do not.

### Tier 4 — database
- **An RLS isolation test**: create two users, confirm neither can read or write the other's
  rows across all ten tables. This is a security-critical guarantee that has never been verified.
- Migration idempotency: 002–007 are `if not exists`; 001 is not.
- Constraint tests for `UNIQUE (iris_id, year)`.

---

## 7. How to verify the app before and after a change

**Every time, before you start:**
```bash
npm ci
npx tsc --noEmit          # must be clean — this is the only working automated check
npm run build             # must succeed
```

**After a change, at minimum:**
```bash
npx tsc --noEmit
npm run build
```

**Then the manual smoke path** — no automated equivalent exists, so run it by hand:

1. **Auth** — sign out, sign in; confirm redirect to `/`.
2. **Home** — dashboard renders; widgets in the expected order.
3. **Add an iris** — a Named Variety with breeder, colour type, height and parentage. Confirm the
   toast and that it appears in the Collection.
4. **Edit it** — change the name. **Confirm children and crosses still show the new name.**
5. **Record flowering** — current year, first date only. Confirm status flips to Flowering and
   the plant appears in "In flower". Add a last date; confirm the status returns to Growing.
6. **Record a second year** — confirm the first year is **still present** and the averages panel
   recalculates. *(This is the product's central promise — never skip it.)*
7. **Evaluate** — confirm a partial card cannot be saved, caps are enforced, the total is right.
8. **Garden** — add a location; drag it on the map; reload and confirm the position persisted.
9. **Region** — switch UK↔US; confirm dates and units change. **Then re-open an iris for editing
   in each region and confirm the height has not changed** (the K-05 regression check).
10. **Search** — by name and by parent name; apply a facet.
11. **Delete** — a note, then a location; confirm plants survive and become unassigned.
12. **Desktop and mobile** — check both sides of the 1024px breakpoint.

**Known-failing paths to expect** (do not report these as new regressions):
- Garden → location → tap a plant → **blank screen** (K-04).
- Add photo → **saves nothing** despite the toast (K-02).
- Settings → Import / Export / Text size / Profile edit → "Coming soon".
- Settings → Garden → Add / Manage locations → "Coming soon" **despite working elsewhere** (K-10).
- Offline → banner **claims** changes will sync; they will not (K-01).
- Cross detail → seedling evaluation panel is **blank** (K-06).

---

## 8. QC issues raised by the project owner that remain relevant

From `docs/feedback-brief-2026-06-25.md`, cross-referenced with the build plan and verified
against the code. Phases 0–3 shipped; what follows is what is still outstanding.

| Item | Source | Status |
|---|---|---|
| Seedling permanent number + registered name (number retained once named) | §1.3 | ❌ **Not started** |
| Seedling outcome status: Discarded / Growing on / Retained / Registered | §1.3 | ❌ **Not started** |
| Discarded seedlings shown only in a Collection "Discarded" section, still counted in cross summaries | §1.3, §4 | ❌ **Not started** |
| Status box reads "Named variety" for varieties, outcome status for seedlings | §2 | ❌ **Not started** |
| Seedlings allowed the same descriptive fields as varieties | §2 | ❌ **Not started** |
| Carry harvest / sowing / germination dates from the cross onto the seedling | §2 | ❌ **Not started** |
| Multiple current locations per plant | §1.4 | ❌ **Not started** |
| Bed setup: rows × max plants per row → generated named grid (with the owner's exact help text) | §2 | ❌ **Not started** |
| Reassign a plant to a grid cell | §2 | ❌ **Not started** |
| Multiple seed lots per cross, to compare treatments | §1.5 | ❌ **Not started** — one batch per cross |
| Edit a cross | §2 | ❌ **Not started** |
| Search on the Crosses screen | §2 | ❌ **Not started** |
| Cross summary: avg eval score, avg flowering period, counts by outcome | §2 | ❌ **Not started** (needs outcome statuses) |
| Collection **filters** by classification / colour type / breeder / rebloom | §2 | 🟡 Implemented as **sorts**, not filters |
| Collection sort by individual scoring element, and by flowering period | §2 | ❌ **Not started** |
| "Now flowering" date rule applied **everywhere** | §2 | 🟡 Write path only; all read paths still status-based |
| One evaluation scorecard per plant per year | §1.2 | 🟡 Not enforced by DB or app |
| Photos: max 4/plant, resize/compress, square display | §2 | ⛔ **Blocked** on storage backend |
| Non-UK evaluation rubric | §1.2, §5 | ⛔ **Blocked** on that region's official marking form |
| Delete a cross | §2 | ✅ Done (`2586a4b`) |
| Rebloom toggle | §2 | ✅ Done (`006_rebloom.sql`) |
| Breeder autocomplete | §2 | ✅ Done (`5f80fcd`) |
| Unique-name guard | §2 | ✅ Done — app-level only |
| "Named Variety" label | §2 | ✅ Done |
| Quick-Note dropdown widened | §2 | ✅ Done |
| Home "No crosses yet" bug | §2 | ✅ Done |
| Home "In flower → View all" doing nothing | §2 | ✅ Done — `InFlowerScreen` |
| Annual flowering records + averaged primary panel | §1.1 | ✅ Done |
| BIS 100-point scorecard, capped, all-or-nothing | §1.2 | ✅ Done |
| Region switch UK/US with canonical storage | §2 | ✅ Done — but see K-05 and K-11 |
