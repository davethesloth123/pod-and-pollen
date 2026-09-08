# Pod & Pollen — Technical Debt

> Structural and maintainability concerns, distinct from the behavioural defects in
> [KNOWN_ISSUES.md](./KNOWN_ISSUES.md). Priorities are **High / Medium / Low** by the cost of
> leaving them in place as the product grows.
>
> Nothing here has been changed — this is an assessment.

---

## Summary

| # | Item | Priority |
|---|---|---|
| D-01 | Single-route SPA — no deep links, no URL state | **High** |
| D-02 | Untyped navigation view names | **High** |
| D-03 | No automated tests of any kind | **High** |
| D-04 | Lint is not configured; no CI | **High** |
| D-05 | Hand-written DB row types, unverified against migrations | **High** |
| D-06 | Enumerations duplicated and inconsistent across files | **High** |
| D-07 | No enum/constraint enforcement in the database | **High** |
| D-08 | Hard deletes everywhere, no soft delete, no audit trail | **High** |
| D-09 | Preferences in `localStorage` while `user_settings` sits unused | **High** |
| D-10 | Oversized components (1046 / 792 / 654 / 643 / 609 lines) | Medium |
| D-11 | `any` in navigation, sheet and screen prop types | Medium |
| D-12 | Load-everything data strategy will not scale | Medium |
| D-13 | Inline styles everywhere — no shared style system | Medium |
| D-14 | Dead columns, dead fields, dead code paths | Medium |
| D-15 | Dates stored as `text` | Medium |
| D-16 | Weak validation; nothing shared between UI and DB | Medium |
| D-17 | Missing error handling and no error boundaries | Medium |
| D-18 | Accessibility gaps | Medium |
| D-19 | Migrations applied by hand, with no record of what ran | Medium |
| D-20 | Google Fonts loaded from a third party at render time | Medium |
| D-21 | Business logic mixed into UI components | Medium |
| D-22 | Duplicated unit-conversion constants and logic | Low |
| D-23 | Legacy `bl_` localStorage prefix from the old product name | Low |
| D-24 | Stale comments and out-of-date `BACKLOG.md` | Low |
| D-25 | No `engines` field; no `typecheck` script | Low |
| D-26 | Transitive `sharp`/`libvips` advisories | Low |

---

## High priority

### D-01 · Single-route SPA
**What.** The entire application lives at `/`. Screens are swapped by React state
(`tab` + `stack`), not by URL.

**Why it matters.** No deep links to a plant or cross; the browser Back button exits the app;
refresh loses your place; nothing can be shared or bookmarked; no server-side rendering of record
data. Every one of these becomes a user complaint as soon as there is more than one user.

**Cost of delay.** Grows with every new screen. Retro-fitting routes means touching
`AppShell` and every `go()` call site.

**Direction.** Migrate to real App Router routes (`/iris/[id]`, `/garden/[id]`,
`/crosses/[id]`), keeping the current shell as a layout. Can be done incrementally — start with
the detail screens, which are the ones people want to link to.

### D-02 · Untyped navigation
**What.** `go(view: string | number, params: Record<string, any>)`. View names are bare strings
matched by a `switch`.

**Why it matters.** This has **already caused a live bug** — `go('irisDetail')` has no matching
case and renders a blank screen (K-04). Nothing catches a typo.

**Direction.** A `type View = 'home' | 'collection' | 'detail' | …` union and per-view param
types. Cheap, and it retires a whole class of defect. (Largely moot if D-01 is done first.)

### D-03 · No automated tests
**What.** No test runner, no test files, no `test` script. See
[TESTING_AND_QA.md](./TESTING_AND_QA.md).

**Why it matters.** The domain has real, subtle logic — flowering averages, day-of-year
averaging, unit conversion, rubric totals, the rename cascade, lifecycle derivation — all of it
currently verified only by someone clicking through the app. The handover to a new developer
removes the one person who knows what "correct" looks like.

**Direction.** Start with pure functions (`format.ts`, `rubric.ts`, `data/index.ts`), which need
no infrastructure and cover the highest-value logic.

### D-04 · Lint unconfigured, no CI
**What.** ESLint is installed but has no config file, so `npm run lint` fails interactively
(K-08). There is no `.github/` directory and no pipeline.

**Why it matters.** Nothing prevents a broken build, a type error or an obvious mistake from
reaching the deployed branch. `tsc --noEmit` passes today, but nothing enforces that it keeps
passing.

**Direction.** Add `eslint.config.mjs`; add a GitHub Actions workflow running `npm ci`,
`tsc --noEmit`, `eslint .` and `next build` on pull requests.

### D-05 · Hand-written row types
**What.** `src/lib/db/row-types.ts` mirrors the SQL by hand. The file itself notes this and
suggests swapping to Supabase-CLI-generated types.

**Why it matters.** Nothing verifies that these match the migrations. A column rename compiles
cleanly and fails at runtime, in production, with no warning.

**Direction.** `supabase gen types typescript` into a generated file, committed and regenerated
whenever a migration lands.

### D-06 · Duplicated and inconsistent enumerations
| List | Copies | Consistent? |
|---|---|---|
| Iris classifications (14) | `add-iris.tsx:26`, `add-seedlings.tsx:15` | ✅ identical today — will drift |
| Location kinds (6) | `add-location.tsx:13`, `garden.tsx:477` | ✅ identical today |
| Sun options | `add-location.tsx:14` (**3**), `garden.tsx:478` (**5**) | ❌ **already inconsistent** |
| Note types | migration comment, `quick-note.tsx:16`, `iris-detail.tsx:35` | ❌ **three different vocabularies** |
| Photo categories | migration comment vs `add-photo.tsx:15` | ❌ inconsistent |
| Iris statuses | `types/index.ts:7`, `data/index.ts:STATUS`, `iris-detail.tsx:32` | ✅ but triplicated |

**Direction.** Move every list into `src/lib/data/index.ts` (which already holds shared
constants) and derive the TypeScript union types from them.

### D-07 · No database-level constraints
Every enumerated column is free `text`. There are no `CHECK` constraints, no enum types, and no
uniqueness on iris name, cross code or evaluation year. All validation is client-side, so it is
bypassed by any non-UI write — an import, a script, a future API, or a second client.

**Direction.** Add `CHECK` constraints or Postgres enums for the stable vocabularies, plus
`UNIQUE (user_id, lower(name))` on irises and `UNIQUE (iris_id, eval_year)` on evaluations.
Sequence carefully — existing data may violate them.

### D-08 · Hard deletes, no audit trail
Every delete is permanent: irises, locations, crosses, notes, evaluations. Confirmation is a
single extra click. There is no soft delete, no undo, no trash and no log of who deleted what.

**Why it matters.** These are **irreplaceable multi-year breeding records**. A mis-tap on a
phone, outdoors, destroys a decade of history. The founding brief §12 calls for audit logging of
destructive actions before wider release.

**Direction.** `deleted_at` columns with filtered reads, a recoverable trash for 30 days, and
stronger confirmation for records that have descendants or flowering history.

### D-09 · Preferences in `localStorage`, `user_settings` unused
The `user_settings` table exists with `widget_ids`, `accent_color` and `text_size` and full RLS,
and **no code touches it**. Region, widget order and the onboarding flag all live in
`localStorage` instead, so they are per device, per browser — causing K-07 (onboarding re-runs
and duplicates a location).

**Direction.** Move all preferences to `user_settings`, add `region` and `onboarded` columns, keep
`localStorage` only as a fast cache.

---

## Medium priority

### D-10 · Oversized components
| File | Lines | Distinct responsibilities |
|---|---|---|
| `screens/iris-detail.tsx` | **1046** | ~10 sub-components: parent chips, colour card, photo strip, offspring strip, flowering summary, flowering history, notes, evaluations, lifecycle, status editor |
| `screens/garden.tsx` | **792** | Garden screen + map editor (with pointer-gesture handling) + list + detail + edit form + delete |
| `app/app-shell.tsx` | **654** | Connectivity banner + headers + navigation + sheet orchestration + two layouts + auth |
| `lib/db/queries.ts` | **643** | All CRUD for 8 tables plus all row mappers |
| `screens/crosses.tsx` | **609** | List + detail + compare + seedling cards |

None is unreadable, and each is internally organised with comment banners — but they concentrate
merge conflicts and make ownership unclear. `garden.tsx` in particular mixes a gesture-driven
canvas editor with CRUD forms.

**Direction.** Split by exported component; extract the map editor; split `queries.ts` per
entity.

### D-11 · `any` in core types
Despite `strict: true`, `any` appears at the seams: `StackFrame.params: Record<string, any>`,
`SheetState: { kind: string; [key: string]: any }`, `user: any`, `presetCross?: any`,
`openPhotoViewer(photos: any[], …)`, and the `go` signature. These are precisely the boundaries
where D-02's bug lives.

### D-12 · Load-everything data strategy
`DataProvider` fetches every row the user owns on mount and holds it in memory. Excellent for
a small dataset and offline-friendly UX; unworkable for a grower with thousands of plants and a
decade of notes. There is no pagination, no windowing and no incremental loading anywhere.

Secondary effect: every mutation patches local arrays with `.map`/`.filter`, so a write triggers
recomputation of every `useMemo` over the whole dataset.

### D-13 · Inline styles everywhere
Every component builds React style objects inline, often 10–20 properties per element. There is
no theme abstraction beyond CSS custom properties and five shared style constants. Consequences:
no hover/focus/active pseudo-states without JS, no media queries in component styles (hence the
single JS breakpoint), heavy repetition, and larger JS payloads.

**Direction.** Not urgent, but a consistent approach (CSS Modules, or a small `styled` helper)
should be chosen before the surface area doubles.

### D-14 · Dead code and dead columns
- Columns nothing writes: `irises.colour`, `.source`, `.palette`, `.seed_batch_id`,
  `.first_ever_flower`; `crosses.pod_number`; `seed_batches.repot_date`, `.retained`, `.named`;
  `locations.sort_order`, `.shape`.
- Tables nothing uses: `user_settings`, `photos`. Table written but never read: `profiles`.
- Fields never populated but read: `Iris.firstFlower` (three dead branches).
- Legacy evaluation columns read by one UI, never written (K-06).
- `ImportScreen` — 449 lines, unreachable.
- `types/index.ts` `UserProfile` and `IrisPhoto` — declared, effectively unused.

### D-15 · Dates stored as `text`
`pollination_date`, `first_date`, `last_date`, `planted_date`, `harvest_date`, `sown_date`,
`germ_date`, `repot_date`, `planted_out_date` are all `text`. Postgres cannot sort, range-filter
or validate them. Legacy `DD/MM/YYYY` values coexist with ISO ones — `format.ts` explicitly
handles both. Any future reporting, calendar query or season comparison will want real `date`
columns. `planted_date` is worse still: it holds a **year** (`"2024"`), so migrating it needs a
semantic decision.

### D-16 · Weak validation, nothing shared
Validation is ad hoc per form: some inline `if`s, some `canSave` booleans, some HTML attributes
that are never re-checked on save. There is no schema library (Zod or similar), no shared rules
between the UI and the database, and no server-side validation at all — because there is no
server-side code.

### D-17 · Missing error handling
- **No error boundaries anywhere** — one uncaught render error blanks the app (K-23).
- Most mutation failures show a generic "Could not save. Please try again." Only Add Iris
  surfaces the real Supabase message (added in `ccb5a96` — worth generalising).
- The rename cascade logs failures and continues, leaving lineage half-updated (K-20).
- Background failures (`insertIris`'s initial note, the post-flowering status update) are
  swallowed to `console.error`.
- No error reporting service, so nothing is known about production failures.

### D-18 · Accessibility
For a product that names "older or less technical users" as a key group:
- **Pinch-zoom disabled** (`userScalable: false`) — WCAG 1.4.4 failure (K-27).
- Colour contrast is unverified; `--ink-4: #9CA398` on `--surface: #FFFFFF` is roughly 2.6:1,
  below the 4.5:1 minimum, and is used for secondary text throughout.
- Focus styles are not defined for the inline-styled buttons; `btnReset` removes the default
  outline.
- Custom controls (`Segmented`, `Toggle`, `RatingDots`, `Chip`) are `<button>`s and `<div>`s
  without ARIA roles or state.
- Sheets and the onboarding overlay do not trap focus or set `aria-modal`.
- `aria-label` is used in some places (`"Open settings"`, `"Go back"`) but inconsistently.
- Text size is fixed — the "Text size" setting is "Coming soon" and `user_settings.text_size` is
  unused.

### D-19 · Hand-applied migrations
Every migration says "Run in the Supabase SQL editor for each environment." There is no runner,
no `schema_migrations` table and no way to check what an environment has actually received. With
several environments this becomes guesswork — and a mismatch between the deployed code and the
applied schema fails at runtime.

**Direction.** Adopt the Supabase CLI (`supabase db push` / `supabase migration`), which also
unlocks generated types (D-05).

### D-20 · Google Fonts at render time
`globals.css` starts with `@import url('https://fonts.googleapis.com/...')`. This blocks first
paint on a third-party request, fails silently offline (falling back to `system-ui`, changing the
whole look), and sends user IP addresses to Google — a GDPR consideration for a UK/EU product
approaching commercial release. `next/font` self-hosts and removes all three problems.

### D-21 · Business logic inside UI components
The founding brief §10.3 asks explicitly to *"keep business logic separate from UI components
where possible, so the app can later be wrapped or adapted."* In practice:
- Flowering averages are computed inside `FloweringSummary` in `iris-detail.tsx`.
- The flowering-status rule lives inside `record-flowering.tsx`'s save handler.
- Cross-code generation lives inside `record-pollination.tsx`.
- Unit conversion is re-implemented inside `add-iris.tsx` rather than using `format.ts`.

Good counter-examples exist — `lib/format.ts`, `lib/rubric.ts` and `lib/data/index.ts` are clean,
pure and testable. The pattern is there; it just is not applied consistently.

---

## Low priority

### D-22 · Duplicated conversion logic
`CM_PER_IN = 2.54` is defined in both `src/lib/format.ts:3` and
`src/components/flows/add-iris.tsx:49`, and `add-iris.tsx` re-implements the conversion inline
instead of calling `cmFromDisplay`/`displayFromCm`. This duplication is directly implicated in
the rounding-drift defect (K-05).

### D-23 · Legacy `bl_` prefix
All `localStorage` keys are prefixed `bl_` — from **Bloomline**, the project's original name
(visible in `chats/chat1.md`). Harmless, but confusing to a newcomer. Renaming needs a migration
path or users lose their settings.

### D-24 · Stale comments and documentation
- `BACKLOG.md` says the garden map editor is not built; it is (K-34).
- `add-iris.tsx:328` — "a future Settings option will let users switch to inches"; that option
  exists.
- `calendar.tsx:13` — says dates are "primarily DD/MM/YYYY"; they are ISO. *(The parser
  coincidentally handles both correctly, so this is a comment problem only.)*
- `docs/build-plan-2026-06-25.md` Phase 2 proposes an `annual_records` table in migration 006;
  the work was actually done by extending `flowering_records` in migration 005.
- `queries.ts:31` — `count: 0, // computed from irises once that slice lands`; that landed.

### D-25 · Missing project hygiene
No `engines` field in `package.json`; no `typecheck` script despite `tsc --noEmit` being the only
working check; no Prettier or EditorConfig; no `CONTRIBUTING.md`; the root `README.md` is still
the **Claude Design handoff bundle instructions**, not a project README (this handover adds
`AGENTS.md` and `POD_AND_POLLEN_HANDOVER.md` to compensate).

### D-26 · Transitive dependency advisories
4 high-severity `libvips` advisories via `sharp`, pulled in by Next.js image optimisation which
the app does not use. `npm audit fix` is reported as available (K-33).

---

## Areas that will become difficult as Pod & Pollen grows

Ordered by when they will start to hurt.

1. **Multi-location plants** — the single-location assumption is baked into the schema and every
   read path. Every record added under it increases the migration cost. Change this before the
   data grows.
2. **The bed grid** — free-text `grid_ref` cannot become a structured grid without parsing or
   discarding existing values. Same argument: earlier is cheaper.
3. **Seed lots** — the "one batch per cross" assumption is in the code, not the schema, which
   makes it cheaper to fix now than after a season of single-batch data.
4. **Routing** — every new screen deepens the SPA assumption.
5. **Dataset size** — the load-everything strategy is fine at hundreds of records and
   uncomfortable at thousands.
6. **Multi-genus support** — iris-specific fields are on the `irises` table directly. Supporting
   roses means either a `plant_type` discriminator with sparse columns, or a per-genus attribute
   model. The brief's constraint — *do not weaken the iris product* — makes this a genuinely hard
   design problem that should not be started casually.
7. **Offline sync** — becomes exponentially harder once there is multi-device usage and no
   `updated_at`, no tombstones and a rename cascade that performs many dependent writes.
