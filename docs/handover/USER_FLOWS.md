# Pod & Pollen — User Flows

> Each journey states **Current behaviour** (what the code does today, with file references) and
> **Intended behaviour** (what the sources specify). Where they are the same, that is said
> explicitly.
>
> A reminder that colours every flow below: **the app has two URLs.** All navigation is
> in-memory. The browser Back button leaves the app, and a refresh returns you to Home.

---

## 1. First launch / onboarding

**Current**
1. Unauthenticated visitor hits any path → middleware or the `(app)` layout redirects to `/auth`.
2. `AuthWelcome` offers Sign up / Sign in.
3. **Sign up** is 3 steps: email → password (≥ 8 chars) → first name + optional garden name.
   `supabase.auth.signUp` is called with `{ name, garden_name }` metadata, then `profiles` is
   upserted, then `router.push('/')`.
4. `AppShell` mounts, reads `bl_onboarded_<userId>` from `localStorage`, finds nothing, and
   renders `OnboardingFlow` as a full-screen overlay.
5. Five steps: Welcome → "A field notebook for irises" → "What matters most" (pick ≤ 4 goals) →
   "How would you describe your garden?" (collector / breeder / mixed) → "Where do you grow?"
   (one location name).
6. "Finish Account Setup" creates the location (`kind: 'Bed'`), computes a recommended widget
   set from the answers, writes `bl_onboarded_<userId>` and `bl_widgets_<userId>`, and reveals
   the Home screen with empty states.

**Files:** `src/app/auth/page.tsx` · `src/components/auth/sign-up-flow.tsx` ·
`src/components/screens/onboarding.tsx` · `src/components/app/app-shell.tsx:283–302`

**Intended, and the gaps**
- ❌ The onboarding flag should be **server-side**. Today it is per device, so signing in on a
  phone after setting up on a laptop **re-runs the whole flow and creates a second location**.
- ❌ Step 5 claims *"Your records are private by default. Photos stay yours. Export anytime."* —
  photos and export do not exist.
- ❌ No explanation of locations, grid references or the pod/pollen concept at any point.
- ❓ If Supabase email confirmation is enabled, step 3 breaks silently (no session → profile
  upsert skipped → redirect bounces back to `/auth`). Unverifiable from the repository.

---

## 2. Creating a garden

**Current** — there is **no garden entity**. `profiles.garden_name` is captured at sign-up and
in onboarding, written once, and **never read or displayed anywhere**. The Garden tab is simply
the collection of the user's locations.

**Intended** — the founding brief §7.1 specifies "each user has a profile and **at least one
garden**", with every record belonging to a user and/or garden, and future club/shared gardens
permitted by the schema. 📐 A `gardens` table does not exist.

---

## 3. Creating beds / locations

**Current**
- Garden tab → "Add location" (dashed button below the map), or the empty-garden state.
- `AddLocationFlow` sheet: **Name** (required), Kind (Bed / Border / Trial area / Greenhouse /
  Holding / Pots), Sun (Full sun / Partial shade / Full shade), Soil (free text).
- Saves; toast `"<name>" added`; the location appears on the map at a **staggered default
  position** and in the list with a live plant count.
- Edit from Garden → tap a location → Edit (name, short name, kind, sun, soil).
- Delete from the same screen, two-step confirm; plants are unassigned, not deleted.

**Files:** `src/components/flows/add-location.tsx` · `src/components/screens/garden.tsx:481–792`

**Gaps**
- ⚠ Settings → Garden → "Add location" shows `toast('Add location coming soon')` and "Manage
  locations" shows `toast('Coming soon')` — **both features exist**; the Settings rows are stale.
- ❌ `AddLocationFlow` never sets `short_name` (only the Garden edit form does) and cannot set
  map coordinates.
- ❌ No rows/columns are ever declared, so no grid is created (§4).
- ❌ No reordering, despite `locations.sort_order` existing.
- ⚠ Nothing prevents two locations sharing a name, and three UI paths group plants by location
  **name** rather than id.

---

## 4. Understanding and using grid references

**Current** — a grid reference is a **free-text string** on the plant
(`placeholder="e.g. Row B · 3, or bed grid B4"`). It is displayed on the detail screen and set
in Add/Edit Iris or per-row in Add Seedlings. Nothing validates it, nothing enforces uniqueness,
and nothing knows which references exist for a given bed.

The Garden screen shows an information card:
> "Each plant can be assigned a grid reference (e.g. Row B · 3) to help locate it in a bed. **Tap
> any location to see the full planting plan.**"

⚠ **There is no planting plan.** Tapping a location shows a flat list of plant cards.

**Intended** (feedback brief §"Garden / bed setup"; build plan Phase 7) 📐
1. When setting up a bed, the user declares **number of rows** and **maximum plants per row**.
2. The system **generates a named table/grid** of cells accordingly.
3. Cells are empty or occupied; a plant is assigned to a cell and can be moved between cells.
4. The help text (user's own wording) is shown at setup — reproduced in
   [FEATURE_SPECIFICATION.md §C2](./FEATURE_SPECIFICATION.md).

None of this exists.

---

## 5. Adding an iris

**Current**
1. `+` in the bottom nav (mobile) or sidebar (desktop), or an empty-state button.
2. `AddIrisFlow` opens as a **single scrolling sheet** (deliberately flattened from a multi-step
   wizard in commit `87c091a`), grouped into sections:
   - **Basics** — Name*, Record Type (Named Variety / Seedling), Classification (14 codes,
     default TB), Colour Type (12 patterns, default Self — *varieties only*)
   - **Breeder history** *(varieties only)* — Breeder (autocompletes from breeders already
     entered), Year of Release (dropdown, 1900 → next year)
   - **Flower colour** *(varieties only)* — Standards, Falls, Beard, Style arms (free text)
   - **Other** *(varieties only)* — Height (labelled in the region's unit, 0–250), Flowering
     period (Early/Mid/Late), Rebloomer (Yes/No), Fragrance (strength · character)
   - **Parentage** — Pod parent, Pollen parent (type-ahead over the collection, free typing
     allowed)
   - **Location & Notes** — Location dropdown, Grid reference, Year acquired/planted, Notes
3. Save validates a non-empty, case-insensitively unique name, converts height to canonical cm,
   resolves parent ids where the typed name matches a record, inserts the iris, and writes the
   optional note as a `General` note row.
4. Toast `"<name>" added`. The sheet closes. **The user is not taken to the new record.**

**Files:** `src/components/flows/add-iris.tsx` · `src/lib/db/queries.ts:159`

**Gaps vs. intent**
- The brief calls for guided steps rather than one long form for advanced workflows; on mobile
  this is a long scroll.
- Seedlings cannot be given descriptive fields (📐 specified in the feedback brief).
- Seedlings have no permanent seedling number (📐 Phase 4).
- No contextual help on any specialist field.

---

## 6. Editing an iris

**Current** — Detail screen → pencil icon → the *same* `AddIrisFlow` in edit mode, prefilled.
Empty strings are mapped to `null` on save so fields can be cleared. Renaming triggers the
**cascade** that updates children and crosses. Toast `"<name>" updated`.

⚠ **Rounding drift:** in US region the prefill converts canonical cm to whole inches and the save
converts back — 95 cm becomes 94 cm. Each US-region edit loses a little more.

**Intended** — identical, minus the drift.

---

## 7. Assigning an iris to a garden location

**Current** — a single-select dropdown in Add/Edit Iris writing `location_id`, plus the free-text
grid reference. In Add Seedlings, a shared default location can be applied to all rows and each
row can carry its own grid ref.

**Intended** 📐 — a plant may occupy **multiple current locations** simultaneously (a clump split
between beds), each with its own optional grid reference; assignment is add / remove / overwrite.
The schema supports one location only.

---

## 8. Moving an iris

**Current** — edit the plant, change the location dropdown and/or the grid-ref text, save.

**Gaps**
- ❌ No dedicated "Move plant" action.
- ❌ No drag-and-drop on the garden plan (the plan places beds, not plants).
- ❌ No automatic movement note, despite `Movement` being a documented note type nothing writes.
- ❌ No bulk move.
- ❌ No move history — though this is **deliberate**: the feedback brief §1.4 explicitly replaced
  the earlier "location history timeline" idea with current-locations-only.

---

## 9. Recording parentage

**Current**
- **On a plant:** Add/Edit Iris → Parentage → type in Pod parent / Pollen parent. Matching
  records appear as a list (max 5); picking one stores **name + id**, typing freely stores the
  name with a null id (intentional — the parent may not be in the collection).
- **As a cross:** Detail screen → "Record pollination", or Crosses tab → new cross. Captures
  season, pod parent, pollen parent (both type-ahead), pollination date, cross code
  (auto-generated `<yy>-<nn>` if blank), goal and notes.
- **From a cross to seedlings:** Cross detail → "Add seedlings" → choose a count and
  classification → auto-named `"<code> A"`, `"<code> B"` … → each row gets a location and grid
  ref → parentage and `cross_id` are inherited automatically.

**Files:** `src/components/flows/record-pollination.tsx` · `src/components/flows/add-seedlings.tsx`

**Gaps** — no explicit bee-pod / open-pollinated flag; `"Unknown"` is treated as magic in code
but never offered as an option; no free-text complex-parentage field (brief §7.6).

---

## 10. Finding parents and children

**Current** — both directions work, and this is one of the strongest parts of the app.
- **Up:** the detail screen shows `POD: <name>` and `POLLEN: <name>` chips. Tapping one navigates
  to that parent when it resolves to a record. The chip shows the parent's *current* name, so
  renames are reflected immediately.
- **Down:** "N children from this plant" — a horizontally scrolling strip of **every** plant
  (variety or seedling) naming this one as pod or pollen parent, matched by id or by name where
  no id was captured.

**Files:** `src/components/screens/iris-detail.tsx:55` (`ParentChip`), `:413` (`SeedlingsStrip`)

**Gaps** — no multi-generation pedigree view; no way to see siblings; a plant can be recorded as
its own ancestor (no cycle check).

---

## 11. Recording flowering information for a new year

**Current** — the best-implemented journey in the product.
1. Detail screen → "Record flowering".
2. Choose the **Year** (dropdown, next year back to 15 years ago; fixed when editing).
3. **Bloom dates:** First flower, Last flower (`<input type="date">`).
4. **Measurements:** stems per plant, bud count per stem, branch count, plant height (labelled in
   the region's unit).
5. **Bloom size:** height × width.
6. **Notes.**
7. Explicit copy: *"Every box below is optional — fill in only what you've measured."*
8. Save **upserts** on `(iris_id, year)` — so re-recording a year updates it, and **previous
   years are untouched**.
9. If the record is for the **current** year, the plant's status is updated: `Flowering` when a
   first date exists with no last date; back to `Growing` once a last date is entered. Editing a
   past year deliberately leaves the live status alone.
10. Toast `Flowering recorded · <date>`.

**Files:** `src/components/flows/record-flowering.tsx` · `src/lib/db/queries.ts:295`

**Gaps** — `<input type="date">` renders in the **browser locale**, not the app region, so a UK
user on a US device sees `mm/dd/yyyy`. `first_ever_flower` is never written. No validation that
the last date follows the first.

---

## 12. Viewing historical flowering information

**Current** — the detail screen shows two panels:
- **Averages** (`FloweringSummary`) — headed "N years recorded — averages": average first-flower
  date (day + month, averaged across day-of-year), average flowering period in days, average
  stems, buds, branch count, plant height and bloom size.
- **Flowering history** (`FloweringHistory`) — one row per year, newest first: year, date range
  (or "(ongoing)"), duration in days, stems, buds, branches, height, bloom size, notes, and an
  edit pencil.

The **Bloom calendar** aggregates all users' flowering records by month of first bloom.

**Files:** `src/components/screens/iris-detail.tsx:568`, `:621` ·
`src/components/screens/calendar.tsx`

**Matches the intent exactly.** No known gaps.

---

## 13. Changing settings

**Current** — Home → avatar (mobile) or sidebar (desktop) → Settings. Sections: profile card,
Data, Garden, Region & display, Help & feedback, Account.

**Working:** Customize home; Region & units; Sign out (with confirm).
**"Coming soon":** Import, Export data, Text size, Profile editing, Add location*, Manage
locations*, Send feedback (`toast('Thanks!')`, input discarded).
*\* these two actually work elsewhere in the app — the Settings rows are stale.*

**Gaps** — no Help section, no glossary, no change-password, no account deletion, no accent
colour despite the column existing.

---

## 14. Changing units / region

**Current**
1. Settings → Region & display → the UK / US segmented control.
2. Selection is applied **immediately and silently**, and written to
   `localStorage['bl_region_<userId>']`.
3. The whole app re-renders: dates flip between `dd-mm-yyyy` and `mm-dd-yyyy`; lengths flip
   between whole cm and whole inches; input labels and placeholders change unit.
4. **Stored data is never touched** — canonical storage is ISO dates and whole centimetres.

**Intended** 📐 — on switching, the app should **ask** whether existing measurements should:
1. be **converted** to the nearest appropriate whole number, or
2. remain **numerically unchanged**.

No prompt exists. The app always behaves as option 1, at the display layer only. Option 2 would
require rewriting stored values (95 cm → 241 cm) or a per-record unit; neither exists, and the
data implications need deciding before it is built.

⚠ **The current help text is wrong.** It reads *"Switching converts length measurements from cm
to the nearest whole inch, or from inches to the nearest whole cm"* — nothing is converted in
storage.

⚠ **Terminology.** UK = `dd-mm-yyyy` + **centimetres**; US = `mm-dd-yyyy` + **inches**. Do not
describe these as "imperial" and "metric" profiles — that inversion is the source of the
confusion this project has already hit. See
[FEATURE_SPECIFICATION.md §G2](./FEATURE_SPECIFICATION.md).

---

## 15. Managing / exporting / importing data

**Current**
- **Export:** ❌ does not exist. Settings row is disabled.
- **Import:** ❌ the Settings row is disabled, so the (fully built) Import screen is
  **unreachable**. Were it reachable, it accepts a file, ignores it, previews five hardcoded
  rows, and toasts "Import complete" without importing anything — while offering a destructive
  "replace" mode.
- **Delete:** individual irises, locations, crosses, notes and evaluations can be deleted, each
  behind a two-step confirm. All are **hard deletes with no undo**.
- **Backup:** none in-app.

**Intended** — CSV export is an **MVP** feature in the founding brief and is what makes users
trust the product with irreplaceable records. CSV/XLSX import with **column mapping and preview**
was planned early because the primary user already has years of spreadsheet data.
`seed/pod_and_pollen_seed_data.xlsx` and `seed/gen_seed.py` define the expected shape and are the
obvious fixture.

---

## 16. Using the app offline

**Current** — ❌ **nothing works.** No service worker, no manifest (`/manifest.json` 404s
because there is no `public/` directory), no cached data, no write queue. Every read and write
requires a connection. Opening the app offline yields the load-error screen.

⚠ **And the app says otherwise.** A connectivity banner appears when the browser reports
`offline`, reading **"Offline · Changes will sync later."**, then on reconnect shows a spinner
with **"Syncing changes…"** and finally **"All changes synced"**. All three are cosmetic — the
"sync" is a `setTimeout`. A grower who records a morning's observations in a signal blackspot
will lose every one, having been told twice that they were saved.

**Intended** — the founding brief §10.2/§10.4 is deliberately measured: make the app an
installable PWA, *"let users save simple drafts if signal is poor"*, but **do not attempt full
offline sync until the core online workflows are stable**.

A sensible order, given the data model (analysis only — not implemented as part of this task):
1. Tell the truth in the banner. *(Trivial, and stops active data loss today.)*
2. Ship a real manifest and icon set so the app is installable.
3. Cache the app shell with a service worker.
4. Local drafts for the quick actions (note, flowering, photo) in IndexedDB.
5. Only then a full write queue — which needs `updated_at` on every table, tombstones for
   deletes, field-level merge for `flowering_records` (whose `UNIQUE (iris_id, year)` will
   collide between devices), and a decision about how the rename cascade replays.

Full analysis in [FEATURE_SPECIFICATION.md §F](./FEATURE_SPECIFICATION.md).
