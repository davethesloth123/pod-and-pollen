# Pod & Pollen — Current Implementation Audit

> Repository-wide audit at commit `3aa0c54` (branch `dev`).
> 51 commits of history · 54 source files · **11,930 lines** in `src/` · 7 SQL migrations.
> `tsc --noEmit` ✅ clean · `next build` ✅ succeeds · `npm run lint` ❌ broken · tests: **none**.

---

## 1. Routes

| URL | File | Render | Guard |
|---|---|---|---|
| `/` | `src/app/(app)/page.tsx` | Dynamic `ƒ` | `(app)/layout.tsx` server-side `getUser()` → `redirect('/auth')` |
| `/auth` | `src/app/auth/page.tsx` | Static `○` | middleware redirects signed-in users to `/` |
| `/icon.svg` | `src/app/icon.svg` | Static | — |
| `/_not-found` | Next default | Static | — |

**That is the complete route table.** Everything else is component state. See
[TECHNICAL_ARCHITECTURE.md §3](./TECHNICAL_ARCHITECTURE.md) for the consequences (no deep links,
Back button exits the app, refresh loses your place).

## 2. In-app "screens" (`AppShell` view names)

Dispatched by the `switch` in `src/components/app/app-shell.tsx:364–487`.

| View name | Component | File | Lines | Status |
|---|---|---|---|---|
| `home` | `HomeScreen` | `screens/home.tsx` | 585 | ✅ |
| `collection` | `CollectionScreen` | `screens/collection.tsx` | 309 | ✅ |
| `crosses` | `CrossesScreen` | `screens/crosses.tsx` | 609 | ✅ |
| `garden` | `GardenScreen` | `screens/garden.tsx` | 792 | ✅ |
| `detail` | `IrisDetailScreen` | `screens/iris-detail.tsx` | 1046 | ✅ |
| `gardenDetail` | `GardenDetailScreen` | `screens/garden.tsx` | (same file) | ✅ |
| `crossDetail` | `CrossDetailScreen` | `screens/crosses.tsx` | (same file) | ✅ |
| `compare` | `CompareScreen` | `screens/crosses.tsx` | (same file) | ✅ |
| `search` | `SearchScreen` | `screens/search.tsx` | 324 | ✅ |
| `settings` | `SettingsScreen` | `screens/settings.tsx` | 303 | 🟡 many rows are "Coming soon" |
| `customize` | `CustomizeDashboardScreen` | `screens/customize.tsx` | 258 | ✅ |
| `import` | `ImportScreen` | `screens/import.tsx` | 449 | ❌ **façade + unreachable** |
| `calendar` | `CalendarScreen` | `screens/calendar.tsx` | 279 | ✅ |
| `inflower` | `InFlowerScreen` | `screens/in-flower.tsx` | 52 | 🟡 status-based, not date-based |
| *(overlay)* | `OnboardingFlow` | `screens/onboarding.tsx` | 247 | 🟡 per-device flag |
| *(inline)* | `EmptyHome` etc. | `screens/empty.tsx` | 188 | ✅ |
| *(embedded)* | `SeedBatchCard` | `screens/seed-batch-card.tsx` | 160 | 🟡 one batch per cross |

> **`irisDetail` is referenced but not handled.** `garden.tsx:784` calls
> `go('irisDetail', …)`; no `case` matches, so `renderScreen()` returns `null` — a blank screen.
> Every other caller (17 of them) uses `'detail'`.

## 3. Flows (modal sheets)

All rendered together in `AppShell`'s `overlays` and gated on `sheet?.kind`.

| `kind` | Component | File | Lines | Status |
|---|---|---|---|---|
| `add` | `AddIrisFlow` (add **and** edit) | `flows/add-iris.tsx` | 492 | ✅ |
| `location` | `AddLocationFlow` | `flows/add-location.tsx` | 163 | ✅ |
| `note` | `QuickNoteFlow` (add + edit) | `flows/quick-note.tsx` | 206 | ✅ |
| `photo` | `AddPhotoFlow` | `flows/add-photo.tsx` | 169 | ❌ **façade — saves nothing** |
| `stage` | `StageSheet` | `flows/stage-sheet.tsx` | 142 | ✅ |
| `evaluate` | `EvaluationFlow` | `flows/evaluation.tsx` | 197 | ✅ |
| `evalHistory` | `EvalHistorySheet` | `flows/eval-history.tsx` | 142 | ✅ |
| `flowering` | `RecordFloweringFlow` | `flows/record-flowering.tsx` | 236 | ✅ |
| `pollination` | `RecordPollinationFlow` | `flows/record-pollination.tsx` | 231 | ✅ |
| `seedlings` | `AddSeedlingsFlow` | `flows/add-seedlings.tsx` | 179 | ✅ |
| `photoViewer` | `PhotoViewer` | `flows/photo-viewer.tsx` | 337 | 🟡 only ever shows procedural SVGs |

## 4. Components

**Layout** — `layout/bottom-nav.tsx` (53), `layout/desktop-sidebar.tsx` (83),
`app/app-shell.tsx` (654), `app/app-gate.tsx` (48).

**Auth** — `auth/auth-welcome.tsx` (33), `auth/sign-up-flow.tsx` (134),
`auth/sign-in-flow.tsx` (74), `auth/forgot-password-flow.tsx` (72), `auth/auth-bg.tsx` (61).

**UI primitives** — `ui/shared.tsx` (463) exports `btnReset`, `iconBtn`, `inputStyle`,
`selectStyle`, `labelStyle`, `Wordmark`, `StatusBadge`, `IrisContextHeader`, `Chip`,
`IrisThumb`, `SeedlingTag`, `IrisCard`, `ActionRow`, `SectionLabel`, `Field`, `Sheet`,
`Segmented`, `Toggle`, `RatingDots`, `EmptyState`, `SetRow`, `Toast`, `LifecycleRail`.
`ui/icon.tsx` (65) is an inline SVG icon set. `ui/iris-bloom.tsx` (97) draws the procedural iris.

## 5. State management

`src/lib/data-context.tsx` (405 lines) — a single `DataProvider` context. See
[TECHNICAL_ARCHITECTURE.md §4](./TECHNICAL_ARCHITECTURE.md) for the full description. In brief:
loads all seven tables in parallel on mount, holds everything in `useState`, derives joined views
with `useMemo`, and patches local state after each awaited mutation. No optimistic updates, no
refetch-on-focus, no pagination.

Per-device preferences live in `localStorage` (`bl_region_*`, `bl_widgets_*`, `bl_onboarded_*`)
rather than in the `user_settings` table that exists for them.

## 6. Backend and database

Supabase Postgres, 10 tables, RLS on all of them, 7 hand-applied migrations. Full detail in
[DATA_MODEL.md](./DATA_MODEL.md).

All database access is funnelled through `src/lib/db/queries.ts` (643 lines) — the only module
importing `SupabaseClient` for data work. Row shapes are hand-written in
`src/lib/db/row-types.ts` (126 lines) and are **not generated**, so nothing guarantees they match
the migrations.

## 7. Authentication

Supabase email + password. Sign-up is a 3-step flow writing `user_metadata` and upserting
`profiles`. Password reset via `resetPasswordForEmail`. Two layered guards (middleware + server
layout). Sign-out clears the session and pushes `/auth`.

**❓ NEEDS VERIFICATION:** `sign-up-flow.tsx:45` calls `getUser()` immediately after `signUp()`.
If the Supabase project has **email confirmation enabled**, no session exists at that moment, the
`profiles` upsert is silently skipped, and `router.push('/')` bounces back to `/auth` with no
explanation. Whether confirmation is on cannot be determined from the repository — it is a
Supabase dashboard setting.

## 8. Persistence

| Where | What |
|---|---|
| Supabase Postgres | All records |
| `localStorage` | Region, widget order, onboarding flag (per device, per user) |
| Supabase Storage | **Nothing — bucket never created** |
| Cookies | Supabase session, managed by `@supabase/ssr` |

## 9. APIs

None. No route handlers, no server actions, no edge functions. The browser talks directly to
PostgREST.

## 10. Forms and validation

| Form | Required | Client validation | Server/DB validation |
|---|---|---|---|
| Sign up | email, password, name | email regex, password ≥ 8, name non-empty | Supabase Auth |
| Sign in | email, password | non-empty | Supabase Auth |
| Add/Edit Iris | name | non-empty; **case-insensitive uniqueness**; height `min=0 max=250` (attribute only) | `name not null` only |
| Add Location | name | non-empty | `name not null` |
| Quick Note | body | non-empty | `body not null` |
| Record Flowering | none | all optional by design; numeric inputs kept as strings so blanks stay blank | `UNIQUE (iris_id, year)` |
| Evaluation | **all categories** | clamped to `[0, max]`, floored; save disabled until complete | none |
| Record Pollination | pod + pollen | non-empty; cross code unique per season | none |
| Add Seedlings | count | rows default-named | none |

**Systemic gaps:** the `min`/`max` on height are HTML attributes never re-checked in
`handleSave`; no length limits on any text field; no enum enforcement anywhere; no dates
validated (a last-bloom date before the first-bloom date is accepted, and `daysBetweenIso`
silently returns `undefined` for the negative result).

## 11. Image handling

Not implemented. `next.config.ts` whitelists `*.supabase.co/storage/v1/object/**` for a
`next/image` usage that does not exist; the two `<img>` tags in `photo-viewer.tsx` and
`iris-detail.tsx` are guarded by `photo.url`, which is always undefined. Every image is
`IrisBloom`, an inline SVG.

## 12. Search, filter and sort

| Screen | Capability |
|---|---|
| Search | Free text over name, classification, location, pod/pollen parent and note bodies; facets for status, location, classification, year (options derived from real data) |
| Collection | Filters: All / In flower / Named Varieties / Seedlings / Favourites. Sorts: name, recently added, classification, colour type, height, rebloomer, breeder, latest BIS total |
| Crosses | Alphabetical sort only — **no search** (specified but not built) |
| Calendar | Filter by month of first bloom |
| Garden | Map / List toggle |

All filtering and sorting is client-side over the fully loaded dataset.

## 13. Garden builder

Implemented as a drag-and-resize bed layout editor persisting percentage rects — see
[FEATURE_SPECIFICATION.md §C4](./FEATURE_SPECIFICATION.md). `BACKLOG.md` incorrectly states this
is not built.

## 14. Responsive behaviour and device assumptions

Mobile-first. One breakpoint at **1024px** via `useIsDesktop()`.

- **Mobile:** sticky header, bottom navigation with a centre `+`, flows as bottom sheets,
  `100dvh`, safe-area insets respected in onboarding.
- **Desktop:** left sidebar, content column capped at 1020px, flows as centred modals.

Because `useIsDesktop()` starts `false` for SSR safety, desktop users see a **flash of the
mobile layout** on first paint.

**Accessibility:** `layout.tsx` sets `maximumScale: 1, userScalable: false`, which **disables
pinch-zoom** — a WCAG 1.4.4 failure and directly contrary to the product's stated older-user
audience.

## 15. PWA / offline

Not implemented. `manifest: '/manifest.json'` is declared but there is **no `public/`
directory**, so it 404s. No service worker. See
[FEATURE_SPECIFICATION.md §F](./FEATURE_SPECIFICATION.md) — including the connectivity banner
that falsely claims changes will sync.

## 16. Error handling

| Layer | Behaviour |
|---|---|
| Initial load | `try/catch` → `loadError` flag → `AppGate` renders a retry screen |
| Mutations in flows | `try/catch` → inline red error box; Add Iris surfaces the real Supabase message (commit `ccb5a96`), most others show a generic "Could not save. Please try again." |
| Rename cascade | Per-record `try/catch` that logs and continues — **a partial cascade can leave lineage half-updated with no user-visible warning** |
| Background failures | `console.error` only |
| React errors | **No error boundaries anywhere** — an uncaught render error blanks the app |
| Reporting | None |

## 17. Loading states

`DataProvider.ready` gates the whole app; `AppGate` shows a loading state, then an error state
with retry, then the shell. Individual buttons show "Saving…" and disable while in flight. There
are **no skeletons** and no per-section loading — it is all-or-nothing.

## 18. Empty states

Good coverage: `EmptyHome`, `EmptyCollection`, `EmptyGarden` (`screens/empty.tsx`) plus the
shared `EmptyState` used inline for no-search-results, no-plants-in-location, no-crosses and
nothing-flowering. Each offers a relevant call to action.

---

## 19. Feature-status matrix

| Feature | Intended | Current status | Relevant code | Missing work | Notes |
|---|---|---|---|---|---|
| Auth (email/password) | Supabase Auth, verified accounts | ✅ IMPLEMENTED | `auth/*`, `middleware.ts`, `(app)/layout.tsx` | Change password in-app; account deletion | Email-confirmation behaviour ❓ unverified |
| Row Level Security | Every user-owned table | ✅ IMPLEMENTED | all migrations | — | Correct from migration 001 |
| Iris records CRUD | Central object | ✅ IMPLEMENTED | `flows/add-iris.tsx`, `queries.ts` | — | Name uniqueness is app-only |
| Classifications (14) | MDB…Iris laevigata | ✅ IMPLEMENTED | `add-iris.tsx:26` | De-duplicate the list | **Verified exact match** |
| Colour types (12) | Self…Space Age | ✅ IMPLEMENTED | `add-iris.tsx:35` | Allow for seedlings | **Verified exact match** |
| Parentage (pod/pollen) | Structured + tolerant of unknowns | ✅ IMPLEMENTED | `add-iris.tsx`, `data-context.tsx` | Bee-pod flag; complex-parentage free text | Dual name+id storage |
| Children / offspring | Both directions traversable | ✅ IMPLEMENTED | `iris-detail.tsx:413` | Multi-generation pedigree | Includes varieties, not just seedlings |
| Rename cascade | Renames must not break lineage | ✅ IMPLEMENTED | `data-context.tsx:280` | Transactional safety | Partial failures logged only |
| Annual flowering records | One per plant per year, never overwritten | ✅ IMPLEMENTED | `record-flowering.tsx`, `flowering_records` | — | **Best-built feature** |
| Flowering averages panel | Primary averaged view | ✅ IMPLEMENTED | `iris-detail.tsx:568` | — | Matches the spec exactly |
| Flowering duration | Per year + average | ✅ IMPLEMENTED | `format.ts:daysBetweenIso` | — | |
| First flowering ever | Recorded and shown | ❌ NOT BUILT | column `first_ever_flower` exists | Derive from `MIN(first_date)` or write it | Column empty; `Iris.firstFlower` dead |
| "Now flowering" date rule | first-date this year AND no last-date | 🟡 PARTIAL | `record-flowering.tsx:82` sets status | Convert all read paths | Deferral documented in `in-flower.tsx:7` |
| BIS evaluation scorecard | 100 pts, capped, all-or-nothing | ✅ IMPLEMENTED | `lib/rubric.ts`, `flows/evaluation.tsx` | `UNIQUE(iris_id, eval_year)` | Rubric is data-driven |
| Non-UK rubric | Region-selected | 📐 PARKED | `rubricFor()` hook exists | The official non-UK marking form | ⛔ external dependency |
| Legacy eval display | — | ⚠ BUG | `crosses.tsx:534` | Switch to `scores`/`total` | Renders permanently blank |
| Crosses — create/delete | Full management | 🟡 PARTIAL | `flows/record-pollination.tsx`, `screens/crosses.tsx` | **Edit**, **search**, **summary** | Plan Phase 5 |
| Seed batches | **Multiple lots** per cross | 🟡 PARTIAL | `seed-batch-card.tsx`, `queries.ts:498` | Multi-lot model + comparison | Single batch enforced in code |
| Seedling identity | Permanent number + registered name | 📐 NOT BUILT | — | `seedling_number`, `registered_name` columns | Plan Phase 4 — **largest gap** |
| Seedling outcome status | Discarded/Growing on/Retained/Registered | 📐 NOT BUILT | — | Column + UI + Discarded section | Blocks cross summaries |
| Seedling descriptive fields | Same as varieties | 📐 NOT BUILT | `add-iris.tsx` gates on `isVariety` | Ungate the fields | |
| Locations CRUD | Beds, borders, pots… | ✅ IMPLEMENTED | `flows/add-location.tsx`, `garden.tsx` | Reorder (`sort_order`) | Settings rows falsely say "coming soon" |
| Garden map editor | Drag/resize/reshape beds | 🟡 PARTIAL | `garden.tsx:55–260` | Shape choice; coords on insert | **`BACKLOG.md` wrongly says not built** |
| Bed grid (rows × plants) | Generated named grid | 📐 NOT BUILT | — | Schema + generator + help text | User supplied exact copy |
| Grid references | Structured cell reference | 🟡 PARTIAL | `irises.grid_ref` free text | Everything structural | No occupancy model |
| Multiple current locations | One plant, many places | 📐 NOT BUILT | — | `plant_locations` join table | Highest-cost latent migration |
| Move / reassign a plant | Dedicated action | 🟡 PARTIAL | via Edit Iris | Dedicated move UI; movement notes | |
| Photos | Upload, ≤4/plant, compress, square | ❌ **FAÇADE** | `flows/add-photo.tsx` | **Everything** | ⛔ blocked on storage backend; shows false success toast |
| Notes | Dated, typed, searchable | ✅ IMPLEMENTED | `flows/quick-note.tsx` | Reconcile 3 type vocabularies | |
| Search | Text + facets | ✅ IMPLEMENTED | `screens/search.tsx` | Stale suggestion chips | |
| Collection filter/sort | Filter by class/colour/breeder/rebloom | 🟡 PARTIAL | `screens/collection.tsx` | Those as **filters**; per-element sort; Discarded section | Currently sorts only |
| Bloom calendar | Year at a glance | ✅ IMPLEMENTED | `screens/calendar.tsx` | — | Uses real records |
| Home dashboard widgets | Personalised | ✅ IMPLEMENTED | `screens/home.tsx`, `lib/data/index.ts` | Persist to `user_settings` | Device-local only |
| Region & units (display) | UK cm/dd-mm · US in/mm-dd | ✅ IMPLEMENTED | `lib/format.ts`, `settings.tsx` | — | Canonical storage is correct |
| Unit-change prompt | Ask convert vs unchanged | 📐 NOT BUILT | — | Dialog + option-2 semantics | Settings copy is currently **wrong** |
| Rounding drift on edit | No drift | ⚠ BUG | `add-iris.tsx:93,157` | Keep canonical cm on edit | 95 → 94 cm per US edit |
| Export | CSV, an MVP feature | ❌ NOT BUILT | — | Everything | Onboarding falsely promises it |
| Import | CSV/XLSX + mapping + preview | ❌ **FAÇADE + unreachable** | `screens/import.tsx` | Everything | `seed/*` is the fixture |
| Backup / restore | Automated | ❌ NOT BUILT | — | Everything | Relies on Supabase plan |
| Account deletion | Planned | ❌ NOT BUILT | — | Everything | Brief §12 |
| Text size / accent colour | Settings | ❌ NOT BUILT | `user_settings` columns exist | Everything | "Coming soon" |
| Profile editing | Name, garden name | ❌ NOT BUILT | `profiles` written at sign-up | Read + edit | Table is write-only |
| Onboarding | Guided first run | 🟡 PARTIAL | `screens/onboarding.tsx` | Server-side flag; fix false claims | Duplicates a location per device |
| Help / glossary | In-app manual | 📐 NOT BUILT | — | Everything | Brief §11 |
| Offline / PWA | Installable, offline drafts | ❌ **NOT BUILT — falsely claimed** | `app-shell.tsx:54` banner | Manifest, icons, SW, queue | **Highest-risk UX issue** |
| Wants list | Track wanted varieties | 🔭 FUTURE | — | Everything | Brief §7.11 |
| Future cross planner | Plan crosses | 🔭 FUTURE | — | Everything | Brief §7.12 |
| Sharing / visibility | Private → shared → public | 🔭 FUTURE | — | Everything | Brief Phase 5 |
| Multiple gardens | Per user | 🔭 FUTURE | — | `gardens` table | Brief §7.1 |
| Other genera (roses…) | Multi-plant platform | 🔭 FUTURE | `PLANT_TYPES` placeholder | Everything | Brief §16 |
| Subscriptions / billing | Commercial | 🔭 FUTURE | — | Everything | Brief §15 — **not agreed** |
| Automated tests | — | ❌ NONE | — | Everything | No runner, no tests |
| CI | — | ❌ NONE | — | Everything | No `.github/` |
| Lint | `next lint` | ❌ **BROKEN** | no ESLint config file | Add `eslint.config.mjs` | Prompts interactively, exits 1 |
