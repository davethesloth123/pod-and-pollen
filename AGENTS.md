# AGENTS.md — Pod & Pollen

## What this is

**Pod & Pollen is a specialist record-keeping platform for iris growers and hybridisers** — not a
generic gardening app. It replaces the spreadsheets, paper notes and loose photo folders that
serious iris breeders use to run a multi-year breeding programme, and its value lies in the
*links between records*: this seedling came from that cross, which used those two parents, and
has now flowered for three seasons with these measurements. The whole product is organised around
the real breeding lifecycle — plant → parentage → cross → seed pod → seed batch → germination →
seedling → first flower → evaluation → outcome. It is deliberately iris-specific today, built
mobile-first for use outdoors, and must stay usable by growers who are older or not confident
with software.

## Read before making substantial changes

Detailed documentation lives in **[`docs/handover/`](./docs/handover/)**. Start with
**[`POD_AND_POLLEN_HANDOVER.md`](./POD_AND_POLLEN_HANDOVER.md)** (root), then:

| Before you… | Read |
|---|---|
| Change any schema | [`DATA_MODEL.md`](./docs/handover/DATA_MODEL.md) |
| Add or change a feature | [`FEATURE_SPECIFICATION.md`](./docs/handover/FEATURE_SPECIFICATION.md) |
| Change navigation, state or data loading | [`TECHNICAL_ARCHITECTURE.md`](./docs/handover/TECHNICAL_ARCHITECTURE.md) |
| Fix a bug | [`KNOWN_ISSUES.md`](./docs/handover/KNOWN_ISSUES.md) — it may already be catalogued |
| Refactor | [`TECH_DEBT.md`](./docs/handover/TECH_DEBT.md) |
| Plan work | [`ROADMAP.md`](./docs/handover/ROADMAP.md) |
| Verify a change | [`TESTING_AND_QA.md`](./docs/handover/TESTING_AND_QA.md) |
| Set up an environment | [`ENVIRONMENT_AND_SERVICES.md`](./docs/handover/ENVIRONMENT_AND_SERVICES.md) |

Original sources, still authoritative: `docs/feedback-brief-2026-06-25.md` (the primary user's
QC feedback and resolved decisions), `docs/build-plan-2026-06-25.md`, and
`project/uploads/My_Iris_Tracker_Project_Brief_V2_1.pdf` (the founding brief).

## Commands

```bash
npm ci                 # install (lockfile v3; Node ≥ 18.18, 20+ recommended)
npm run dev            # dev server on :3000
npm run build          # production build — must pass
npm start              # serve the production build
npx tsc --noEmit       # type check — THE ONLY WORKING AUTOMATED CHECK. Must be clean.
npm run lint           # ⚠ BROKEN — no ESLint config exists; drops into an interactive prompt
# no test command — there are no tests
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
(copy `.env.example`). Never commit real values.

## Repository structure

```
src/
  app/                  Next.js App Router — ONLY TWO ROUTES
    (app)/page.tsx        "/"      → DataProvider → AppGate → AppShell (the whole app)
    auth/page.tsx         "/auth"  → welcome / sign-up / sign-in / forgot-password
    layout.tsx, globals.css, icon.svg
  middleware.ts         Supabase session refresh + auth redirects
  components/
    app/                app-shell.tsx (navigation, sheets, layouts), app-gate.tsx
    screens/            home, collection, iris-detail, garden, crosses, search,
                        settings, customize, import, calendar, in-flower,
                        onboarding, empty, seed-batch-card
    flows/              modal sheets: add-iris, add-location, add-photo, add-seedlings,
                        quick-note, record-flowering, record-pollination, evaluation,
                        eval-history, stage-sheet, photo-viewer
    layout/             bottom-nav (mobile), desktop-sidebar
    auth/               sign-up / sign-in / forgot-password flows
    ui/                 shared.tsx (primitives + style constants), icon.tsx, iris-bloom.tsx
  lib/
    data-context.tsx    DataProvider — loads and holds the ENTIRE dataset; all mutations
    data/index.ts       constants: palettes, lifecycle, widget catalogue, plant types, status
    db/queries.ts       THE ONLY module that talks to Postgres
    db/row-types.ts     hand-written snake_case row shapes (NOT generated)
    format.ts           region-aware date/length formatting
    rubric.ts           BIS evaluation rubric (data-driven)
    supabase/           browser + server clients
    use-is-desktop.ts   the single 1024px breakpoint
  types/index.ts        domain types
supabase/migrations/    001–007, applied BY HAND in the Supabase SQL editor
docs/handover/          this handover package
docs/                   feedback brief + build plan (original sources)
seed/                   xlsx fixture + generator (the future import template)
project/, chats/        Claude Design handoff bundle — design prototypes and transcripts
```

## Architectural rules

1. **Only `src/lib/db/queries.ts` talks to the database.** Never call Supabase from a component.
2. **`DataProvider` owns all server state.** Mutations follow: `await` the DB write → patch local
   state with the returned row. No optimistic updates.
3. **Canonical storage is region-independent.** Dates are ISO `yyyy-mm-dd`; lengths are **whole
   centimetres**. Region affects **display only**, via `src/lib/format.ts`. Never store inches,
   and never store a localised date string.
4. **There are only two routes.** Screens are swapped by state in `AppShell`. Adding a "page"
   means adding a `case` to `renderScreen()` and a `go('<name>')` call — and the names are
   untyped strings, which has already caused a live bug. Check both sides.
5. **Mobile-first.** One breakpoint (`useIsDesktop()`, 1024px). Design for a phone held outdoors
   first.
6. **Row Level Security is the authorisation model.** Every user-owned table has `user_id` and an
   `auth.uid() = user_id` policy. Queries also filter `.eq('user_id', …)` as defence in depth.
   Keep both.
7. **No new dependencies without a good reason.** The tree is deliberately tiny: 5 runtime deps.
   No CSS framework, no state library, no ORM.
8. **`row-types.ts` is hand-written.** If you change a migration, change it too — nothing checks
   this, and a mismatch fails at runtime, not at compile time.

## Business rules that must not be broken

1. **Nothing overwrites flowering history.** One record per plant per year, guaranteed by
   `UNIQUE (iris_id, year)` and an upsert on that constraint. This is the product's central
   promise. Recording 2026 must never touch 2025.
2. **Renaming a plant must never break a breeding line.** `updateIris` cascades the new name to
   every child iris and every cross that referenced it, by id or by old name. If you touch
   parentage or renaming, exercise this.
3. **Parentage is stored twice on purpose** — as a name *and* as an id — because a parent may be
   a plant the user does not own. Keep both in sync; ids are healed from names at load.
4. **Evaluation is all-or-nothing.** A BIS scorecard is complete or absent — no partial cards.
   Each category is capped at its maximum. The rubric totals exactly 100.
5. **Every flowering measurement is optional.** Explicitly confirmed by the primary user. Never
   coerce a blank to `0`.
6. **A seedling's number is permanent provenance.** (Not yet built — but when it is, naming a
   seedling must *retain* its number, never replace it.)
7. **Records are private by default.** There is no sharing model; do not add one casually.
8. **UK = `dd-mm-yyyy` + centimetres. US = `mm-dd-yyyy` + inches.** Do **not** describe these as
   "metric" and "imperial" profiles — that inversion has already caused confusion. The UI says
   "Region & units".
9. **Never show a success message for something that did not happen.** Three features currently
   break this rule (photos, import, offline sync) and it is the top item on the roadmap. Do not
   add a fourth.

## Data migration rules

- Migrations live in `supabase/migrations/NNN_description.sql`, numbered sequentially, and are
  **applied by hand in the Supabase SQL editor for each environment**. There is no runner and no
  `schema_migrations` table.
- Write them **idempotently** (`add column if not exists`) — 002–007 all are. 001 is not.
- Never edit a migration that has been applied anywhere. Add a new one.
- Update `src/lib/db/row-types.ts` **in the same change**.
- If a migration backfills data (as 004 did for parent ids), say so in a comment and keep the
  backfill re-runnable.
- Record any new table or column in
  [`docs/handover/DATA_MODEL.md`](./docs/handover/DATA_MODEL.md).

## Testing expectations

There are **no tests today**. Until that changes:

- `npx tsc --noEmit` must be clean, and `npm run build` must pass, before any push.
- Then run the manual smoke path in
  [`TESTING_AND_QA.md §7`](./docs/handover/TESTING_AND_QA.md) — in particular step 6 (record a
  second year of flowering and confirm the first survives), which protects rule #1 above.
- If you add logic to `lib/format.ts`, `lib/rubric.ts` or `lib/data/index.ts`, **add a test** —
  these are pure functions and need no infrastructure. That is the cheapest place to start
  building a suite.

## Coding conventions found in the repository

- TypeScript `strict: true`. Path alias `@/*` → `./src/*`.
- **No semicolons.** Single quotes. Two-space indent. Trailing commas in multiline literals.
- Named exports throughout; components are `PascalCase`, files are `kebab-case.tsx`.
- `'use client'` at the top of every interactive component. Server components are rare (only the
  `(app)` layout).
- **Styling is inline React style objects** referencing CSS custom properties from
  `src/app/globals.css` (`var(--accent)`, `var(--ink-2)`, `var(--surface)`). Shared constants
  (`btnReset`, `inputStyle`, `selectStyle`, `labelStyle`) come from `components/ui/shared.tsx`.
  There is no CSS framework — match the surrounding style rather than introducing one.
- Section banner comments (`// ─── Name ───…`) separate logical blocks in longer files.
- Domain vocabulary is British English in user-facing copy ("Colour", "Favourites", "Rebloomer")
  while database columns are US-spelled (`color_type`, `colour`) — **both appear, deliberately.**
  Follow whichever the surrounding code uses.
- Errors surface as inline red boxes in flows; background failures go to `console.error`.

## Keeping documentation current

When you materially change architecture, a business rule, the schema, or the status of a feature,
**update the affected document in `docs/handover/` in the same pull request**. The three that go
stale fastest are `CURRENT_IMPLEMENTATION.md` (the feature-status matrix), `KNOWN_ISSUES.md` (as
defects are fixed) and `DATA_MODEL.md` (with every migration). Stale documentation is worse than
none — this handover exists because context was lost once already.
