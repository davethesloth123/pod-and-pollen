# Pod & Pollen — Known Issues

> Every item states its **source**: `QC` (raised by the project owner in
> `docs/feedback-brief-2026-06-25.md`), `INCOMPLETE` (a feature knowingly unfinished), or
> `INSPECTION` (found by reading the code during this handover audit).
>
> **Severity:** 🔴 Critical (data loss or false assurance) · 🟠 High (feature broken or
> materially misleading) · 🟡 Medium (wrong or confusing behaviour) · 🟢 Low (cosmetic/minor).
>
> Suggested directions are **suggestions only — nothing here has been implemented.**

---

## 🔴 Critical

### K-01 · The connectivity banner promises a sync that does not exist
**Severity:** 🔴 Critical · **Source:** INSPECTION

**Description.** `ConnectivityBanner` listens for browser `online`/`offline` events and displays
"Offline · Changes will sync later." → "Syncing changes…" (a 1.8 s `setTimeout`) → "All changes
synced". **There is no offline queue, no local cache, and no sync of any kind.** Every write goes
straight to Supabase and fails without a connection.

**Reproduction.**
1. Sign in, open a plant record.
2. Put the device into aeroplane mode. The banner appears: *"Offline · Changes will sync later."*
3. Record a flowering date, or add a note. The save fails.
4. Restore connectivity. The banner shows "Syncing changes…" then "All changes synced".
5. Reload. **The data was never saved.**

**Why it is critical.** The target user records observations outdoors, in bloom season, often
without signal — the exact scenario this banner mishandles. The user is told twice that data was
saved when it was lost.

**Code.** `src/components/app/app-shell.tsx:54–130`

**Suggested direction.** Immediately change the copy to state the truth (e.g. "Offline — you
can't save changes right now") and disable save buttons while offline. Build real offline support
separately and deliberately; see [FEATURE_SPECIFICATION.md §F5](./FEATURE_SPECIFICATION.md).

---

### K-02 · Add Photo confirms a save that never happens
**Severity:** 🔴 Critical · **Source:** INCOMPLETE + INSPECTION

**Description.** `AddPhotoFlow` presents a category picker, an iris selector, a large
"Take or upload photo" dropzone and a caption field, then a "Save Photo" button. **The dropzone
contains no `<input type="file">`.** `handleSave()` calls `onSaved(category)` and closes; nothing
is uploaded and no row is written. `AppShell` then shows the toast `"<Category> photo added"`.

**Reproduction.** Open any plant → Add photo → pick a category → tap **Save Photo** → see the
toast "Standards photo added" → look at the photo strip → nothing is there.

**Code.** `src/components/flows/add-photo.tsx:37–40` (save), `:106–131` (fake dropzone) ·
`src/components/app/app-shell.tsx:533` (toast)

**Suggested direction.** Until the storage backend is decided, mark the flow as unavailable
rather than showing a false confirmation. ⛔ The whole photo feature is parked on that decision —
and the two source documents disagree about it (founding brief: private Supabase Storage;
feedback brief: R2 / Images / Bunny). **Confirm the decision before any work starts.**

---

### K-03 · The Import screen is a façade offering a destructive "replace" mode
**Severity:** 🔴 Critical *(latent — currently unreachable)* · **Source:** INCOMPLETE + INSPECTION

**Description.** A complete-looking four-step import wizard exists. It accepts a file and
**never parses it**; the preview always shows the same five hardcoded rows; "Import" toasts
"Import complete" and does nothing. It also offers an **"add" vs "replace"** mode with no
implementation behind it.

It is currently harmless **only because it is unreachable** — the Settings row that would open it
is disabled with a "Coming soon" pill, so the `onImport` callback is never fired.

**Reproduction.** Not reachable through the UI. Visible in `AppShell`'s `case 'import'`.

**Code.** `src/components/screens/import.tsx:10` (`SAMPLE_ROWS`), `:86–102` (no parsing, fake
confirm) · `src/components/screens/settings.tsx:236` (disabled row)

**Suggested direction.** Do **not** enable the Settings row until a real parser exists. Build
against `seed/pod_and_pollen_seed_data.xlsx`. Treat "replace" as requiring an explicit typed
confirmation and a prior export.

---

## 🟠 High

### K-04 · Tapping a plant from a garden location opens a blank screen
**Severity:** 🟠 High · **Source:** INSPECTION

**Description.** `GardenDetailScreen`'s plant list navigates with `go('irisDetail', { id })`.
`AppShell.renderScreen()` has **no `case 'irisDetail'`** — the correct view name is `'detail'`,
which all 17 other call sites use. The switch falls through to `default: return null`, rendering
an **empty screen** with only the nav visible.

**Reproduction.**
1. Garden tab → tap any location with at least one plant.
2. Scroll to the plant list at the bottom.
3. Tap any plant card. → **Blank content area.** The in-app back button still works.

**Code.** `src/components/screens/garden.tsx:784` vs
`src/components/app/app-shell.tsx:404` (`case 'detail'`)

**Suggested direction.** One-character-class fix: use `'detail'`. The underlying cause is that
view names are untyped strings — a `type View = 'home' | 'detail' | …` union would have caught
this at compile time.

---

### K-05 · Length measurements lose precision on every edit in US region
**Severity:** 🟠 High · **Source:** INSPECTION

**Description.** Lengths are stored canonically as **whole centimetres**. When a form is opened
in US region, the value is converted to whole inches for display; on save it is converted back to
whole centimetres. Both steps round, so the stored value drifts downward.

**Reproduction.**
1. Settings → Region → **UK**. Add an iris with height **95**. (Stored: 95 cm.)
2. Settings → Region → **US**. Edit that iris — the height shows **37** (95 ÷ 2.54 = 37.4 → 37).
3. Save without changing anything. (Stored: 37 × 2.54 = 93.98 → **94 cm**.)
4. Switch back to UK: the height now reads **94 cm**. Repeat for further drift.

The same applies to plant height and bloom size on annual flowering records.

**Code.** `src/components/flows/add-iris.tsx:93` (prefill), `:157` (save) ·
`src/components/flows/record-flowering.tsx:61,77` · `src/lib/format.ts:29–39`

**Note:** `docs/build-plan-2026-06-25.md` Phase 1 lists "no value drift on repeated toggling" as
a test criterion. **Toggling is genuinely safe** — the defect is in *editing*, which the test did
not cover.

**Suggested direction.** Keep the canonical cm value in component state and write it back
unchanged unless the user actually edits the field (compare the displayed value against the
prefill before converting).

---

### K-06 · Cross detail shows evaluation scores that are always blank
**Severity:** 🟠 High · **Source:** INSPECTION

**Description.** The seedling cards on a cross detail render the **legacy 1–5** evaluation fields
(`form`, `colour`, `substance`, `branching`, `vigour`, `avg`, `verdict`) as five-dot ratings.
Migration 007 replaced these with the BIS `scores`/`total`/`rubric` columns and states the legacy
columns "are no longer written". Every evaluation created since then therefore renders as **an
"Evaluation <year>" card with five empty rows of dots** and no total.

**Reproduction.** Create a cross → add seedlings → evaluate a seedling with the BIS scorecard →
open the cross detail → the seedling's evaluation panel shows empty dots and no average, while
the plant's own detail screen shows the correct total out of 100.

**Code.** `src/components/screens/crosses.tsx:534–560` · `supabase/migrations/007_evaluation_rubric.sql`

**Suggested direction.** Render `total` / `rubric.total` as the detail screen does, keeping a
legacy branch for pre-007 records.

---

### K-07 · Onboarding re-runs per device and can duplicate a location
**Severity:** 🟠 High · **Source:** INSPECTION

**Description.** The onboarding-complete flag is `localStorage['bl_onboarded_<userId>']`. It is
not stored server-side, so a user signing in on a second device — or after clearing site data, or
in a private window — sees the full five-step onboarding again. If they type a growing-location
name at step 5, `addLocation` runs again and **creates a duplicate location**.

Widget layout and region preference share the same weakness: they do not follow the user.

**Reproduction.** Complete onboarding on device A, entering "Top Bed". Sign in as the same user
on device B. Onboarding runs again. Enter "Top Bed". → Two "Top Bed" locations, and because three
UI paths group plants by location **name**, both entries show the same plants.

**Code.** `src/components/app/app-shell.tsx:296,350` · `src/lib/data-context.tsx:79–92`

**Suggested direction.** The `user_settings` table already exists with `widget_ids`,
`accent_color` and `text_size` and full RLS. Add an `onboarded` flag and a `region` column and
move all four preferences there, keeping `localStorage` as a cache.

---

### K-08 · `npm run lint` cannot run
**Severity:** 🟠 High · **Source:** INSPECTION

**Description.** ESLint and `eslint-config-next` are installed but **no ESLint config file
exists**. `next lint` therefore drops into an interactive setup prompt and exits 1. Static
analysis has effectively been off for the whole project, and this would block any CI.

**Reproduction.** `npm run lint` → `? How would you like to configure ESLint?` → exit code 1.

**Suggested direction.** Add `eslint.config.mjs` extending `next/core-web-vitals`, switch the
script to `eslint .`, and fix what it surfaces. (`next lint` is deprecated and removed in
Next.js 16 regardless.)

---

### K-09 · "First flowering ever" is never recorded, and one field is entirely dead
**Severity:** 🟠 High · **Source:** QC + INSPECTION

**Description.** Two separate defects around the same concept:
1. `irises.first_ever_flower` exists, is read by `dbToIris`, and is patchable — but **no flow
   writes it**. It is permanently empty.
2. `Iris.firstFlower` is a *different* property that `dbToIris` **never sets at all**, yet three
   code paths read it. All three are dead:
   - `src/lib/data/index.ts:50` — the variety lifecycle "First flower" detail is always `''`
   - `src/lib/data/index.ts:64` — the seedling lifecycle always falls back to "Flowered"
   - `src/components/screens/crosses.tsx:524` — "First flower: …" never renders

**Reproduction.** Record flowering for a plant, then look at its lifecycle rail: the "First
flower" stage shows no date, even for a plant with five years of history.

**Suggested direction.** Derive first-ever-flower as `MIN(first_date)` over the plant's flowering
records rather than storing it — that removes the synchronisation problem entirely — and delete
`Iris.firstFlower`.

---

### K-10 · Settings claims working features are "coming soon"
**Severity:** 🟠 High *(trust/usability)* · **Source:** INSPECTION

**Description.** Settings → Garden offers "Add location" (`toast('Add location coming soon')`)
and "Manage locations" (`toast('Coming soon')`). **Both work perfectly** from the Garden tab —
`AddLocationFlow` creates locations and `GardenDetailScreen` edits and deletes them. A user who
looks in the obvious place is told a feature they already have does not exist.

("Manage locations" is partly honest: **reordering** genuinely does not exist, though
`locations.sort_order` is in the schema.)

**Code.** `src/components/screens/settings.tsx:236–237`

**Suggested direction.** Wire these two rows to the existing flows, or remove them.

---

## 🟡 Medium

### K-11 · Region help text describes a conversion that does not happen
**Severity:** 🟡 Medium · **Source:** QC + INSPECTION

The Region row's help text reads *"Switching converts length measurements from cm to the nearest
whole inch, or from inches to the nearest whole cm."* **Nothing is converted.** Storage is always
canonical whole centimetres; only the display changes. The wording implies records are rewritten.

This is doubly misleading because the current requirement is to **ask the user** whether to
convert or leave values numerically unchanged — see
[FEATURE_SPECIFICATION.md §G2](./FEATURE_SPECIFICATION.md). No prompt exists.

**Code.** `src/components/screens/settings.tsx:138–141`

---

### K-12 · The Garden screen promises a "planting plan" that does not exist
**Severity:** 🟡 Medium · **Source:** INSPECTION

The grid-reference information card says *"Tap any location to see the full planting plan."*
Tapping a location shows a hero strip, an edit form and a **flat list of plant cards**. There is
no plan, no grid and no spatial arrangement — the map places beds, not plants.

**Code.** `src/components/screens/garden.tsx:441–444`

---

### K-13 · Onboarding promises photos and export, neither of which exists
**Severity:** 🟡 Medium · **Source:** INSPECTION

Onboarding step 5 reassures the user: *"Your records are private by default. Photos stay yours.
Export anytime."* Records **are** private (RLS is correct), but photos are not implemented and
export is not implemented. Two of three claims are false, in the app's very first impression.

**Code.** `src/components/screens/onboarding.tsx:243`

---

### K-14 · "Now flowering" is status-driven, not date-driven
**Severity:** 🟡 Medium · **Source:** QC (feedback brief §"Home page")

**Agreed rule:** a plant is in flower when its first-flower date has a value for the current year
**and** there is no last-flower date — to be applied *everywhere* "now/in flower" appears.

**Current:** saving a current-year flowering record sets the plant's status correctly, but every
**read** path still filters on `status`. Because status is also editable by hand from a dropdown,
the two can desynchronise — a plant manually marked "Flowering" appears in flower with no dates
at all.

**Affected:** `home.tsx:93,180,396` · `in-flower.tsx:11` · `collection.tsx:148` ·
`garden.tsx:68,271,503`. Honestly documented at `in-flower.tsx:7–8` as a Phase 6 item.

---

### K-15 · Duplicate evaluation scorecards for the same plant-year are possible
**Severity:** 🟡 Medium · **Source:** QC + INSPECTION

The confirmed rule is **one scorecard per plant per year**. Neither the database nor the
application enforces it: there is no `UNIQUE (iris_id, eval_year)` and `insertEvaluation` always
inserts. Evaluating the same plant twice in a year creates two rows, and `latestEval()` picks one
arbitrarily among same-year records.

Contrast `flowering_records`, which correctly carries `UNIQUE (iris_id, year)` and upserts.

---

### K-16 · Plants are grouped by location *name* in three places
**Severity:** 🟡 Medium · **Source:** INSPECTION

`garden.tsx:68` (map grouping), `:271` (list) and `:503` (detail) all use
`irises.filter(i => i.loc === loc.name)` rather than `locationId`. Two locations with the same
name — which nothing prevents, and which K-07 actively causes — will each display the other's
plants. `DataProvider`'s own count calculation correctly uses `location_id`, so **the badge count
and the listed plants can disagree**.

---

### K-17 · Date inputs ignore the app's region setting
**Severity:** 🟡 Medium · **Source:** INSPECTION

All date entry uses `<input type="date">`, which renders in the **browser/OS locale**. A UK user
on a US-configured device sees `mm/dd/yyyy` in the picker while every displayed date elsewhere
reads `dd-mm-yyyy`. For a product whose region switch exists specifically to control date format,
this is a visible inconsistency.

---

### K-18 · Three incompatible note-type vocabularies
**Severity:** 🟡 Medium · **Source:** INSPECTION

| Source | Values |
|---|---|
| Migration 001 | Flowering, Health, Movement, General, Photo, Evaluation |
| Quick Note UI | **Observation, Weather, Pest, Disease, Task** |
| Icon map | tries to cover both, plus lowercase variants |

The Quick Note flow defensively prepends unknown incoming types to its chip list, which is the
only reason notes created by other paths still display. The feedback brief's item about the note
type dropdown being *"too narrow — widen to fit the note types"* was addressed, but the
underlying vocabulary conflict was not.

---

### K-19 · Every plant is drawn with the same illustration
**Severity:** 🟡 Medium · **Source:** INSPECTION

`irises.palette` selects the procedural iris colouring, and ten palettes are defined — but
**no UI ever writes it**, so `dbToIris` defaults every record to `deepPurple`. Every plant in the
collection, calendar, photo wall and garden looks identical, which defeats the purpose of a
visual placeholder. Colour type and colour description are captured but not used to pick a
palette.

---

### K-20 · The rename cascade can partially fail, silently
**Severity:** 🟡 Medium · **Source:** INSPECTION

Renaming a plant loops over affected children and crosses, issuing one update per record inside a
`try/catch` that **logs and continues**. There is no transaction. A network failure part-way
leaves some descendants pointing at the old name and others at the new one, with **no user-visible
warning** — the toast still says "updated". With many descendants this is also a burst of
sequential round-trips.

**Code.** `src/lib/data-context.tsx:280–318`

---

### K-21 · Cross codes are reused after deletion
**Severity:** 🟡 Medium · **Source:** INSPECTION

Auto-generated codes use `crosses.filter(c => c.season === year).length + 1`. Delete cross
`26-02` and the next new cross that season is also numbered `26-02`. Cross codes are the human
identifier for a breeding line and appear in seedling names (`"26-02 A"`), so reuse creates real
ambiguity in the records.

**Code.** `src/components/flows/record-pollination.tsx:94`

---

### K-22 · `insertCross` writes a status outside the documented set
**Severity:** 🟡 Medium · **Source:** INSPECTION

The schema and `src/types/index.ts` document cross status as
`Sown | Germinated | Growing on | Evaluating | Archived` with a default of `'Sown'`, but
`insertCross` writes **`'Pollinated'`**. Since nothing constrains the column, the value persists
and any code switching on the documented set will not match it.

**Code.** `src/lib/db/queries.ts:451`

---

### K-23 · No error boundaries
**Severity:** 🟡 Medium · **Source:** INSPECTION

There is no React error boundary anywhere. Because the entire application renders inside one
component tree under `AppShell`, a single uncaught render error **blanks the whole app** with no
recovery short of a reload. Given the amount of optional, possibly-null data flowing through the
detail screens, this is a realistic failure mode.

---

### K-24 · "Send feedback" silently discards feedback
**Severity:** 🟡 Medium · **Source:** INSPECTION

Settings → Help & feedback → "Send feedback" shows `toast('Thanks!')`. There is no form, no
recipient and no storage. A tester who reports a bug through the obvious route is thanked and
ignored. The founding brief anticipates a `feedback_requests` table.

---

## 🟢 Low

### K-25 · Desktop users see a flash of the mobile layout
`useIsDesktop()` starts `false` for SSR safety and upgrades after mount, so the bottom-nav
layout renders briefly before the sidebar replaces it. **Source:** INSPECTION ·
`src/lib/use-is-desktop.ts`

### K-26 · Search suggestion chips do not match stored data
`SUGGESTIONS = ['Tall Bearded', 'Flowering', 'Seedling', 'Reblooming']`. Classifications are
stored as codes (`TB`), and rebloom is a boolean, so two of the four chips return nothing.
**Source:** INSPECTION · `src/components/screens/search.tsx:8`

### K-27 · Pinch-zoom is disabled
`viewport` sets `maximumScale: 1, userScalable: false`. This is a WCAG 1.4.4 failure and is
directly contrary to the product's stated older-user audience. **Source:** INSPECTION ·
`src/app/layout.tsx:15–21`

### K-28 · `/manifest.json` returns 404
`layout.tsx` declares `manifest: '/manifest.json'` and `appleWebApp`, but there is **no `public/`
directory in the repository**, so there is no manifest and no icon set. The app cannot be
installed. **Source:** INSPECTION

### K-29 · Adding a plant does not open it
After saving, the sheet closes and a toast appears, but the user is left where they were rather
than being taken to the new record — so a plant added from the Home screen has to be found again
to add anything to it. **Source:** INSPECTION · `src/components/app/app-shell.tsx:509`

### K-30 · No validation that last bloom follows first bloom
A last-flower date earlier than the first is accepted. `daysBetweenIso` silently returns
`undefined` for the negative result, so the duration simply disappears rather than flagging the
error. **Source:** INSPECTION · `src/lib/format.ts:76–84`

### K-31 · Height limits are not enforced on save
The height input carries `min="0" max="250"` as HTML attributes, but `handleSave` never
re-checks. Programmatic or pasted values outside the range are stored. **Source:** INSPECTION ·
`src/components/flows/add-iris.tsx:329`

### K-32 · Unused environment variables in `.env.example`
`NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_ENV` are documented but referenced nowhere in `src/`.
`NEXT_PUBLIC_ENV` is described as showing an environment label in the app header — no such label
exists. **Source:** INSPECTION

### K-33 · Four high-severity npm advisories
`npm audit --omit=dev` reports 4 high-severity `libvips` vulnerabilities inherited via `sharp`, a
transitive dependency of Next.js image optimisation (which the app does not use). `npm audit fix`
is available. **Source:** INSPECTION

### K-34 · `BACKLOG.md` is out of date
Its first entry says the garden map editor is not built. It **was** built (commit `438bdcd`) —
drag to move, corner handle to resize, auto-saving percentages. Only shape selection and
coordinates-on-insert are genuinely outstanding. **Source:** INSPECTION

---

## Unresolved QC items still outstanding

From `docs/feedback-brief-2026-06-25.md`, tracked against `docs/build-plan-2026-06-25.md`:

| Plan phase | Scope | Status |
|---|---|---|
| Phase 0 | Home bugs, note dropdown, record-type label, breeder autocomplete, unique-name guard | ✅ **Done** (`5f80fcd`) |
| Phase 1 | Region & units foundation | ✅ **Done** (`03cac09`, `c85f2f7`) — but see K-05, K-11 |
| Phase 2 | Annual records + averaged primary panel | ✅ **Done** (`9ecb7fd`) |
| Phase 3 | BIS evaluation scorecard | ✅ **Done** (`d005b8a`) — but see K-06, K-15 |
| **Phase 4** | **Seedling identity, naming, outcome status, Discarded section** | ❌ **NOT STARTED** — largest outstanding gap |
| **Phase 5** | Crosses: **edit**, **search**, **seed lots**, **cross summary** | 🟡 **Partial** — only *delete* was done (`2586a4b`) |
| **Phase 6** | Collection **filters**, now-flowering **date rule** | 🟡 **Partial** — rebloom ✅, sorts ✅, filters ❌, date rule ❌ |
| **Phase 7** | Multiple locations, bed grid, reassign | ❌ **NOT STARTED** |
| Phase 8 | Photos | ⛔ **Blocked** on the storage-backend decision |
| Parked | Non-UK evaluation rubric | ⛔ **Blocked** — needs that region's official marking form |
