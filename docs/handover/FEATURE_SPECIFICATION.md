# Pod & Pollen — Feature Specification

> **Status keys used throughout**
>
> | Key | Meaning |
> |---|---|
> | ✅ **IMPLEMENTED** | Built, wired to the database, works end to end |
> | 🟡 **PARTIAL** | Some of it works; specific gaps named |
> | 📐 **SPECIFIED, NOT BUILT** | Designed/agreed in a source document; no working code |
> | 🔭 **FUTURE** | Long-term intent; not scheduled |
> | ❓ **NEEDS VERIFICATION** | Cannot be confirmed from the repository alone |
>
> **⚠ DISCREPANCY** marks a place where documentation, UI copy and code disagree.
>
> Sources: `project/uploads/My_Iris_Tracker_Project_Brief_V2_1.pdf` (brief),
> `docs/feedback-brief-2026-06-25.md` (QC feedback), `docs/build-plan-2026-06-25.md` (plan),
> `BACKLOG.md`, and the code as of commit `3aa0c54`.

---

# A. Plant / iris records

## A1. Iris records — core ✅ IMPLEMENTED

**Purpose.** The central everyday object; one row per plant, covering both established named
varieties and the grower's own seedlings.

**Intended behaviour.** Minimal required fields (name only), with advanced detail available but
not forced. A record accumulates notes, photos, flowering history and evaluations over years.

**User interactions.** Add via the `+` in the bottom nav / desktop sidebar, or from empty
states. Edit via the pencil on the detail screen. Delete from the detail screen with a
two-step confirm. Star as favourite. Change status from a dropdown.

**Business rules.**
- Name is required and must be **unique per user, case-insensitively** — enforced in the app
  only (`add-iris.tsx:150`), **not** in the database.
- Record type is `Variety` (labelled **"Named Variety"**) or `Seedling`.
- Variety-only fields — breeder, year of release, flower-colour description, height, flowering
  period, rebloom, fragrance, colour type — are hidden when the type is Seedling.

**Code.** `src/components/flows/add-iris.tsx` (add *and* edit, 492 lines) ·
`src/components/screens/iris-detail.tsx` (1046 lines) ·
`src/lib/db/queries.ts` `insertIris` / `updateIris` / `deleteIris` · table `irises`.

## A2. Naming and identification 🟡 PARTIAL

**Implemented:** free-text name, uniqueness guard, rename with **cascade** to children and
crosses (`data-context.tsx:280–318`) so breeding lines survive a rename.

**📐 SPECIFIED, NOT BUILT** — feedback brief §1.3, build plan Phase 4:
- A **permanent seedling number/code** distinct from the display name.
- An optional **registered/variety name** which, once set, becomes the dominant label **while
  the seedling number is retained and shown secondarily**.

Today a seedling has only `name`. Auto-generated defaults are `"<crossCode> A"`, `"<crossCode> B"`
… (`add-seedlings.tsx:17`). Renaming a seedling to its registered name **destroys the seedling
number**, which the brief explicitly forbids. No `seedling_number` or `registered_name` column
exists.

## A3. Classification ✅ IMPLEMENTED — **verified against the required list**

Required list vs. code (`src/components/flows/add-iris.tsx:26–30`):

| # | Required | In code |
|---|---|---|
| 1 | MDB | ✅ |
| 2 | SDB | ✅ |
| 3 | IB | ✅ |
| 4 | BB | ✅ |
| 5 | MTB | ✅ |
| 6 | TB | ✅ |
| 7 | AB | ✅ |
| 8 | Dutch Iris | ✅ |
| 9 | SPU | ✅ |
| 10 | SIB | ✅ |
| 11 | JA | ✅ |
| 12 | LA | ✅ |
| 13 | Iris reticulata | ✅ |
| 14 | Iris laevigata | ✅ |

**Exact match, all 14, same order.** Default `TB`. Stored in `irises.classification` as free
text — no database constraint.

**⚠ DISCREPANCY — the list is duplicated.** An identical array is declared again at
`src/components/flows/add-seedlings.tsx:15`. Two copies will drift. Also, `import.tsx` and
`search.tsx` still use the long form "Tall Bearded" in sample/suggestion data, which no longer
matches the stored codes.

## A4. Colour type ✅ IMPLEMENTED — **verified against the required list**

Required list vs. code (`src/components/flows/add-iris.tsx:35–47`):

| # | Required | In code |
|---|---|---|
| 1 | Self | ✅ |
| 2 | Bicolour | ✅ |
| 3 | Bitone | ✅ |
| 4 | Reverse Bitone | ✅ |
| 5 | Plicata | ✅ |
| 6 | Luminata | ✅ |
| 7 | Neglecta | ✅ |
| 8 | Blend | ✅ |
| 9 | Amoena | ✅ |
| 10 | Broken | ✅ |
| 11 | Line and Speckles | ✅ |
| 12 | Space Age | ✅ |

**Exact match, all 12, same order.** Default `Self`. **Shown for varieties only** — the field is
hidden when record type is Seedling.

**📐 Gap:** feedback brief §"Seedlings" asks that seedlings be allowed the *same descriptive
fields as named varieties*, including colour. Colour type, colour description, height,
fragrance, rebloom and breeder are all currently variety-only.

## A5. Location assignment ✅ IMPLEMENTED (single location) — see §C

A dropdown of the user's locations on the Add/Edit Iris form, writing `irises.location_id`.
Selecting "— Select location —" clears it. Deleting a location leaves plants unassigned rather
than deleting them.

**📐 NOT BUILT:** multiple concurrent locations per plant (feedback brief §1.4).

## A6. Grid reference 🟡 PARTIAL — free text only

**Implemented:** a free-text field on Add/Edit Iris (placeholder `"e.g. Row B · 3, or bed grid
B4"`), stored in `irises.grid_ref`, also settable per-row in the Add Seedlings flow.

**Not implemented:** any *structure*. There is no grid, no rows/columns, no validation, no
uniqueness, no occupancy, and no way to see which cell is free. See §C4.

## A7. Images / photos ❌ **NOT IMPLEMENTED — the UI is a façade**

This is the largest single gap between what the application appears to do and what it does.

| Layer | State |
|---|---|
| `photos` table | ✅ exists (migration 001) with RLS and an index |
| `iris-photos` storage bucket | ❌ **commented out** in migration 001, never created |
| Storage RLS policies | ❌ commented out, never created |
| Query functions | ❌ **none** — `queries.ts` has no photo functions at all |
| `Iris.photos` | ❌ hardcoded to `[]` in `dbToIris` (`queries.ts:117`) |
| Add Photo UI | 🟡 exists — but **has no `<input type="file">`** |
| Save behaviour | ❌ `handleSave()` calls `onSaved(category)` and closes. **Nothing is written anywhere.** |
| Confirmation shown | ⚠ `"<Category> photo added"` toast — **a false success message** |
| Photo viewer | 🟡 exists; falls back to a procedural SVG when `photo.url` is absent, which is always |
| Photo wall widget / photo strip | 🟡 render procedural `IrisBloom` SVG illustrations |

Every image the user sees today is drawn by `src/components/ui/iris-bloom.tsx` from a colour
palette. `irises.palette` is never written either, so `dbToIris` defaults every plant to
`deepPurple` — **all plants look identical**.

**Severity:** a user can photograph a bloom, tap Save Photo, be told it was added, and lose it.

**Blocking dependency (from the feedback brief, §5 "Parked"):** the photo storage backend has
not been chosen — candidates listed are Cloudflare R2, Cloudflare Images and Bunny. Note this
conflicts with the founding brief, which specifies **private Supabase Storage buckets**, and
with migration 001 which already contains the bucket definition. **This decision needs
re-confirming before any work starts.**

**Agreed requirements once unblocked** (feedback brief §"Photos"): max ~4 photos per plant;
client-side resize/compress on add; square display everywhere.

**Code:** `src/components/flows/add-photo.tsx` · `src/components/flows/photo-viewer.tsx` ·
`src/components/screens/iris-detail.tsx` `PhotoStrip` (line 136) ·
`src/components/screens/home.tsx` `PhotoWallWidget` (line 354).

## A8. Measurements 🟡 PARTIAL — split across two records

Two distinct places hold measurements, which is correct but under-explained in the UI:

**On the plant record (a nominal/reference value):** `height_cm` — entered on Add/Edit Iris,
variety-only, labelled with the active region's unit, range 0–250, stored as whole cm.

**On the annual flowering record (measured each year):** stems per plant, bud count per stem,
branch count, plant height, bloom height × width. All optional. See §D.

**⚠ DISCREPANCY — rounding drift on edit.** Lengths are stored as **whole centimetres** and
converted for display. Editing a record while the region is US round-trips through whole inches
and loses precision: 95 cm → displayed 37 in → saved 94 cm. Repeated edits drift further. The
build plan's Phase 1 test criterion says "no value drift on repeated toggling" — *toggling* is
indeed safe, but *editing* is not. Affects `add-iris.tsx:93,157` and
`record-flowering.tsx:61,77`.

## A9. Notes ✅ IMPLEMENTED

Dated notes per plant, with type, body and a user-settable date. Add, edit and delete are all
wired. Notes drive the Home "Recently updated" feed (latest 8 across all plants). Notes are
searchable via the global search.

**⚠ DISCREPANCY — three different note-type vocabularies coexist:**

| Source | Values |
|---|---|
| Migration 001 comment | Flowering, Health, Movement, General, Photo, Evaluation |
| Quick Note UI (`quick-note.tsx:16`) | **Observation, Weather, Pest, Disease, Task** |
| Icon map (`iris-detail.tsx:35–47`) | attempts to cover both sets, plus lowercase variants |

The Quick Note flow defensively prepends an unknown incoming type to its chip list
(`quick-note.tsx:59`), which is how notes created by other paths (e.g. the `General` note
written by `insertIris`) still display.

**Code:** `src/components/flows/quick-note.tsx` · `queries.ts` `insertNote`/`updateNote`/
`deleteNote` · table `notes`.

## A10. Parentage ✅ IMPLEMENTED

**Intended behaviour.** Pod parent and pollen parent as structured, traversable links — while
still tolerating real-world messiness (parent not in the collection, unknown, bee-pollinated).

**Implemented.** Both fields are type-ahead inputs searching the user's own plants. Picking a
match stores **both** the name and the id; typing a name freely stores the name with a null id
(intentional — the parent may not be in the collection). Ids are **self-healed** at load from a
name index (`data-context.tsx:135–140`), and renames cascade to children and crosses.

**Displayed.** `ParentChip` on the detail screen shows `POD: <name>` / `POLLEN: <name>` and is
tappable to jump to the parent when it resolves to a record. The chip prefers the parent's
*current* name over the stored one.

**Gaps:** `"Unknown"` is a magic string checked in `lifecycleFor` and `ParentChip` but is not an
offered option; there is no explicit bee-pod / open-pollinated flag; there is no free-text
"complex parentage" backup field (brief §7.6).

## A11. Children / offspring ✅ IMPLEMENTED

`SeedlingsStrip` (`iris-detail.tsx:413–433`) lists **every** plant — variety or seedling — that
names this plant as pod *or* pollen parent, matching on id or, where no id was stored, on name.
Header reads "N children from this plant". Each is a tappable card.

The commit history shows this was deliberately widened from seedlings-only (commit `18d44ce`,
"Show all offspring (not just seedlings) on a parent's record").

**Not built:** a multi-generation pedigree/genealogy view. The brief anticipates it in the data
structure but does not require it.

## A12. Hybridisation relationships ✅ IMPLEMENTED — see §E

## A13. Record history 🟡 PARTIAL

**What is preserved:** flowering records per year, evaluations per year, dated notes. These give
a real longitudinal history.

**What is not:** there is **no change log or audit trail** on the plant record itself. Edits
overwrite in place. `irises.updated_at` is maintained only by `updateIris`, and no other table
has an `updated_at` at all. Location changes are not historised (a deliberate decision — the
feedback brief §1.4 explicitly supersedes the earlier "location history timeline" idea with
"current locations only"). Deletions are permanent with no soft-delete or recovery.

---

# B. Iris classifications and colour types

Both lists are **verified above** (§A3, §A4) as exact matches to the required sets.

Two structural notes for the incoming developer:
1. **Neither is enforced by the database.** Both columns are free `text`. Any string is accepted
   by Postgres.
2. **Classification is duplicated in two files** and should be extracted to
   `src/lib/data/index.ts` alongside the other shared constants.

---

# C. Garden / location management

## C1. The intended garden model

Stated plainly for a developer new to the project:

- A user has **one garden** (implicit — there is no `gardens` table; the founding brief
  anticipates one).
- A garden contains **locations**: named growing areas of a given *kind* — Bed, Border, Trial
  area, Greenhouse, Holding, Pots — each with optional sun aspect and soil description.
- A location has a **position and size on a visual garden plan**, expressed as percentages of a
  square canvas, so the user can lay out their garden roughly to scale.
- **Intended but not built:** each bed additionally has a **grid** — the user chooses a number
  of rows and a maximum number of plants per row, and the system generates a named table of
  cells. A plant occupies a cell. Cells are therefore *empty* or *occupied*, and a plant can be
  *moved* from one cell to another.
- **Intended but not built:** a plant may be split from a clump and grown in **more than one
  current location at once**. Only current locations matter — no history.

## C2. Garden setup / onboarding 🟡 PARTIAL

Onboarding step 5 ("Where do you grow?") asks for one location name and creates it as
`kind: 'Bed'` with no other attributes (`onboarding.tsx:23–33`). That is the whole of setup.

**✅ Confirmed done:** the placeholder/example location chips were removed from this step
(commit `79ef609`, "Remove location example chips from onboarding 'Where do you grow?' step")
and the copy was changed from "garden location" to "growing location" (commit `074a462`). The
only remaining example text is the input's `placeholder="e.g. Top Bed"` attribute, which is
conventional and does not create data.

**📐 NOT BUILT — setup guidance.** There is no explanation anywhere of what a location is for,
what a grid reference is, or how to plan a bed. The user supplied exact wording for the
bed-setup help text (feedback brief §"Garden / bed setup"):

> "For each of your defined growing areas and the space available in each case; select the
> number of rows and the maximum number of plants per row that you wish to record. A table will
> be created accordingly and should be given an appropriate name."

This text is not in the codebase.

## C3. Locations (beds) ✅ IMPLEMENTED

Create (`AddLocationFlow`: name, kind, sun, soil), edit (Garden detail → Edit: name, short name,
kind, sun, soil) and delete (two-step confirm; plants become unassigned).

**⚠ DISCREPANCY — Settings lies about this.** `settings.tsx:236–237` shows a Garden section
with "Add location" → `toast('Add location coming soon')` and "Manage locations" →
`toast('Coming soon')`. **Both features exist and work** from the Garden tab. The Settings rows
are stale.

## C4. Garden builder / visual planning 🟡 PARTIAL — **and `BACKLOG.md` is out of date**

**Implemented** (`garden.tsx` `GardenMap`, lines 55–260):
- A square canvas with a north arrow and a paper-coloured ground.
- Every location drawn as a coloured rectangle, tinted by kind, labelled with its short name,
  with a rose dot when something in it is flowering.
- An **"Edit layout" mode** with pointer-based **drag to move** and a corner handle to
  **resize**, clamped to the canvas with a minimum size, persisting rounded percentages to
  `locations.x/y/w/h` on pointer-up ("Changes save automatically").
- Locations without stored coordinates are given **staggered default positions** so they are
  visible and editable rather than invisible.
- A Map/List toggle; the List view shows plant counts, kind, sun, soil and flowering counts.

> **⚠ DISCREPANCY — `BACKLOG.md` claims this is not built.** Its first entry reads:
> *"Map editor: let users position/resize/reshape locations on the garden plan (drag to move,
> handles to resize, choose shape). Today locations added via the form have no map coordinates,
> so they only appear in the List view, not placed on the Map."*
> The drag/resize editor **was subsequently built** (commit `438bdcd`). The backlog entry should
> be reduced to what is genuinely still missing: **choosing a shape** (`locations.shape` is
> written as `'rect'` and never changed), and `insertLocation` still not writing coordinates —
> though the staggered-default fallback means unplaced beds *do* now appear on the map.

**Not built:** the per-bed grid (rows × columns), cell occupancy, and placing individual plants
on the plan. The map places *beds*, not plants.

## C5. Grid references 🟡 PARTIAL — free text, no model

See §A6. The Garden screen carries an information card (`garden.tsx:431–447`):

> "Each plant can be assigned a grid reference (e.g. Row B · 3) to help locate it in a bed. Tap
> any location to see the full planting plan."

**⚠ DISCREPANCY:** there is no "full planting plan". Tapping a location opens
`GardenDetailScreen`, which shows a hero strip, an edit form and a **flat list of plant cards**.
No plan, no grid, no spatial arrangement.

## C6. Relationship between beds and grid coordinates 📐 SPECIFIED, NOT BUILT

Intended: `location` (which bed) + `grid cell` (where in the bed) = a plant's position, with the
grid generated from the bed's declared rows × plants-per-row.

Actual: `location_id` (a real foreign key) + `grid_ref` (an unvalidated string). There is no
relationship between them — a plant in "Top Bed" can carry grid ref `"Z99"` for a bed that has
no rows defined.

## C7. Assigning a plant to a location ✅ IMPLEMENTED
Via Add Iris or Edit Iris, or per-row in the Add Seedlings flow.

## C8. Moving / reassigning a plant 🟡 PARTIAL
Possible by editing the plant and changing its location dropdown and grid-ref text. There is
**no dedicated "move plant" action**, no drag-and-drop on the plan, no move-history note written
automatically (the `Movement` note type exists in the schema comment but nothing writes it), and
no way to move several plants at once.

## C9. Empty / occupied locations ❌ NOT IMPLEMENTED
Requires the grid model. Today the only occupancy signal is a plant **count** per location.

## C10. How locations relate to plant records ✅ IMPLEMENTED, with a fragility

`irises.location_id` → `locations.id`, `ON DELETE SET NULL`. Counts are derived per location in
`DataProvider` by `location_id` (correct).

**⚠ Fragility:** three UI paths filter plants by **location *name*** rather than id —
`garden.tsx:68` (map grouping), `garden.tsx:271` (list) and `garden.tsx:503` (detail) all use
`irises.filter(i => i.loc === loc.name)`. Two locations sharing a name, or a name containing
stray whitespace, will mis-group plants. Nothing prevents duplicate location names.

---

# D. Flowering records

## D1. The core requirement ✅ IMPLEMENTED — **and this is the best-built part of the product**

**Requirement:** preserve flowering history year by year rather than overwriting a single date.

**Implemented:** `flowering_records` with `UNIQUE (iris_id, year)` and an upsert on that
constraint. Recording 2026 does not disturb 2025.

| Sub-feature | Status | Detail |
|---|---|---|
| Annual first flowering date | ✅ | `first_date`, ISO, `<input type="date">` |
| Annual last flowering date | ✅ | `last_date`, optional |
| Flowering history by year | ✅ | `FloweringHistory` panel, newest first, each year editable |
| Flowering duration | ✅ | `daysBetweenIso(first, last)` shown per year as "N days"; blank while ongoing |
| Averages across years | ✅ | `FloweringSummary` — the "primary panel" |
| Average first-flower date | ✅ | `avgDayMonth()` averages day-of-year and renders day+month without a year |
| Average flowering period | ✅ | mean of per-year durations |
| Other annual measurements | ✅ | stems, buds, branch count, plant height, bloom height × width — averaged too |
| All fields optional | ✅ | Explicit: "Every box below is optional — fill in only what you've measured" |
| Record-level presentation | ✅ | Averages panel above the per-year history on the detail screen |
| Dashboard presentation | 🟡 | Home "In flower" and Bloom calendar widgets exist, but are **status**-driven, not date-driven (see D3) |

**Code:** `src/components/flows/record-flowering.tsx` ·
`src/components/screens/iris-detail.tsx` `FloweringSummary` (line 568) and `FloweringHistory`
(line 621) · `src/lib/format.ts` `avgDayMonth` / `daysBetweenIso` · `queries.ts`
`upsertFlowering` · table `flowering_records`.

## D2. First flowering ever ❌ **NOT IMPLEMENTED (column exists, nothing writes it)**

`irises.first_ever_flower` exists, is mapped to `Iris.firstEverFlower`, and is supported by
`IrisPatch` — but **no flow ever writes it**, and no screen displays it. It is permanently
empty.

Separately, `Iris.firstFlower` (a different property) is **never set by `dbToIris`**, yet is
read in three places, all of which are therefore dead:
- `src/lib/data/index.ts:50` — variety lifecycle "First flower" detail is always `''`
- `src/lib/data/index.ts:64` — seedling lifecycle detail always falls back to "Flowered"
- `src/components/screens/crosses.tsx:524` — "First flower: …" never renders

**Suggested direction (not implemented):** derive it as `MIN(first_date)` across the plant's
flowering records rather than storing it, which removes a synchronisation problem entirely.

## D3. Flowering status and the "now flowering" rule 🟡 PARTIAL — **knowingly deferred**

**Agreed rule** (feedback brief §"Home page"): a plant is *now flowering* when its first-flower
date has a value **for the current year** and there is **no last-flower date**. To apply
everywhere "now/in flower" is shown.

**Implemented:** saving a flowering record for the **current year** sets the plant's status —
`Flowering` if a first date is present with no last date, back to `Growing` once a last date is
entered (`record-flowering.tsx:82–91`, commit `485d3bf`). Editing a *past* year deliberately
does not disturb the live status.

**Not implemented:** every *read* path still filters on `status`, not on dates:
`home.tsx:93,180,396`, `in-flower.tsx:11`, `collection.tsx:148`, `garden.tsx:68,271,503`.
`in-flower.tsx:7–8` carries an honest comment saying so and names Phase 6 as the fix.

**Consequence:** status and dates can desynchronise, because status is also settable by hand
from a dropdown on the detail screen.

---

# E. Crosses, seed development and seedlings

## E1. Cross records ✅ IMPLEMENTED
Create a cross from a plant ("Record pollination") or from the Crosses tab. Captures season,
pod parent, pollen parent (both type-ahead over the collection, both storing name **and** id),
pollination date, goal and notes. Code is auto-generated as `<yy>-<nn>` if left blank.

**Business rules:** cross code must be unique within a season, case-insensitively — **app-level
only** (`data-context.tsx:246`).

**⚠ Weakness:** the auto-generated sequence is `crosses.filter(same season).length + 1`, so
deleting a cross frees its number for reuse. Codes are not stable identifiers.

**⚠ DISCREPANCY:** `insertCross` defaults `status` to `'Pollinated'`, which is not in the
documented status set (`Sown | Germinated | Growing on | Evaluating | Archived`).

## E2. Cross management 🟡 PARTIAL
| Feature | Status |
|---|---|
| Create a cross | ✅ |
| **Delete** a cross | ✅ (commit `2586a4b`; seedlings survive, unlinked; batches cascade) |
| **Edit** a cross | ❌ 📐 specified (feedback brief §"Crosses", plan Phase 5) |
| **Search** on the Crosses screen | ❌ 📐 specified |
| **Cross summary** (avg eval score, avg flowering period, counts by outcome, ignoring unevaluated) | ❌ 📐 specified |
| Alphabetical sort of crosses | ✅ (commit `c85f2f7`) |
| Compare seedlings side by side | ✅ `CompareScreen` |

`crossStats()` (`data-context.tsx:372`) computes counts of total / flowering / first-flower /
growing / watch seedlings — but `seeds` is hardcoded `0`, and the summary the user asked for
(average evaluation total, average flowering period, counts by *outcome status*) cannot be built
until outcome statuses exist (§A2).

## E3. Seed batches 🟡 PARTIAL — **one batch, not multiple lots**
Implemented: a single editable batch card per cross covering harvest date, seed count,
treatment, sowing date, germination date, germinations, germination %, planted-out date and
number transplanted.

**📐 NOT BUILT:** the feedback brief §1.5 (confirmed decision, Option A) requires **multiple
seed lots per cross**, each with its own treatment, so germination outcomes across treatments of
the same cross can be compared — described as the objective of the feature. `saveSeedBatch`
enforces exactly one row per cross. `repot_date`, `retained` and `named` columns exist but are
not in `SeedBatchPatch`, so they can never be written.

**Code:** `src/components/screens/seed-batch-card.tsx` · `queries.ts:498`.

## E4. Seedlings 🟡 PARTIAL
Implemented: bulk creation from a cross (`AddSeedlingsFlow`) — choose a count and a
classification, auto-name as `"<code> A/B/C…"`, assign a default location, set per-row grid
refs; parentage and `cross_id` are inherited from the cross.

**📐 NOT BUILT (build plan Phase 4, the single largest unbuilt feature):**
- permanent seedling number + optional registered name (§A2)
- **outcome status**: Discarded / Growing on / Retained / Registered, new seedlings starting at
  "Growing on"
- a **Discarded section** in the Collection where discarded seedlings appear *only there*
- the status box under the photo reading "Named variety" for varieties and the outcome status
  for seedlings
- descriptive fields (colour etc.) for seedlings, as varieties have
- carrying harvest / sowing / germination dates from the cross onto the seedling record

The current status vocabulary (`Growing | Flowering | Watch | First flower | Archived | Named`)
is a lifecycle state, not the agreed outcome vocabulary.

## E5. Evaluation ✅ IMPLEMENTED — BIS 100-point scorecard
Rubric-driven, region-selected, data-defined (`src/lib/rubric.ts`). Ten categories in four
groups summing to exactly 100, matching the BIS judges' marking form in the feedback brief §1.2.

| Rule | Status |
|---|---|
| Each category capped at its maximum | ✅ `setScore` clamps to `[0, max]` and floors to integers |
| **All-or-nothing** — a complete card or no data | ✅ `canSave = allFilled` |
| Auto-summed total /100 | ✅ `scoreTotal()` |
| Free-text notes | ✅ |
| Edit an existing scorecard | ✅ (commit `d005b8a`) |
| Delete a scorecard | ✅ |
| Per-year history | ✅ `EvalHistorySheet` |
| Region-dependent rubric | 🟡 the hook exists (`rubricFor(region)`) but only `bis-uk` is defined — the non-UK rubric is a **⛔ parked dependency**: the official marking form for that region is needed |
| **One scorecard per plant per year** | ❌ **not enforced** — no unique constraint, no app-level guard |

**⚠ DISCREPANCY:** the seedling cards on a cross detail
(`crosses.tsx:534–560`) still render only the **legacy 1–5** fields (`form`, `colour`,
`substance`, `branching`, `vigour`, `avg`, `verdict`). Those columns have not been written since
migration 007, so this panel is blank for every modern evaluation.

## E6. Lifecycle rail ✅ IMPLEMENTED
`lifecycleFor()` (`src/lib/data/index.ts:41`) derives a ten-stage rail (variety → parentage →
pollination → seed pod → seed batch → germination → seedling → first flower → evaluation →
outcome), filtered to the stages relevant to a variety or a seedling, rendered by
`LifecycleRail` and expandable via `StageSheet`. This is the brief's lifecycle model made
visible, and it works — though its "First flower" stage detail is always empty (see §D2).

---

# F. Offline functionality

**❌ NOT IMPLEMENTED — and the UI actively claims otherwise.**

## F1. Why it matters
Growers record data outdoors, in gardens, fields and allotments, frequently without reliable
mobile signal. Bloom season — when almost all data entry happens — is precisely when the user is
furthest from wi-fi. This is a genuine product requirement, not a nice-to-have.

## F2. What currently works offline
**Nothing.** Specifically:

| Capability | State |
|---|---|
| Service worker | ❌ none — no `sw.js`, no `next-pwa`/`serwist`/`workbox` dependency |
| Web app manifest | ❌ **`layout.tsx` declares `manifest: '/manifest.json'` but there is no `public/` directory at all** — the URL 404s |
| Installable to home screen | ❌ (no manifest, no icons) |
| Offline page cache | ❌ |
| Offline data cache | ❌ — `DataProvider` fetches from Supabase on every mount |
| Offline write queue | ❌ |
| Local draft storage | ❌ — `localStorage` holds only region, widget order and the onboarding flag |
| Conflict resolution | ❌ |

Opening the app without a connection yields a failed `getUser()`, an empty dataset and
`loadError`.

## F3. ⚠ The most serious discrepancy in the application
`src/components/app/app-shell.tsx:54–130` implements a **`ConnectivityBanner`** that listens to
the browser `online`/`offline` events and displays:

- offline: **"Offline · Changes will sync later."**
- on reconnect: a spinner and **"Syncing changes…"** for 1.8 s
- then: **"All changes synced"** for 3 s

**All three messages are theatre.** There is no queue, no sync, and nothing to synchronise. The
"syncing" state is a `setTimeout`. A user who trusts this banner, records a morning's bloom
observations in a signal blackspot and walks home will find that **every write failed and the
data is gone** — while having been told twice that it was saved.

This is a data-loss-shaped user experience and should be treated as the highest-priority
correctness issue in the codebase.

## F4. Which operations require a connection
**All of them.** Every read and every write goes to Supabase PostgREST. The only things that
work offline are the region preference, the widget layout and the onboarding flag.

## F5. What robust offline support would require
Recorded as analysis for the incoming developer — **not to be implemented as part of this
documentation task**:

1. **Make the app a real PWA first** — create `public/manifest.json` and an icon set (the
   founding brief §10.4 requires this and lists it as Phase 3), then add a service worker to
   cache the shell.
2. **Local persistence** — IndexedDB (via `idb` or Dexie) holding the user's dataset, with
   `DataProvider` reading local-first and reconciling with the server.
3. **A durable write queue** — mutations recorded as intents with client-generated UUIDs
   (Supabase `uuid` PKs make client-side id generation straightforward), replayed on reconnect
   with idempotency.
4. **Change metadata the schema does not yet have** — an `updated_at` on *every* table (only
   `irises` has one), plus a `deleted_at` if deletes are to sync safely.
5. **Conflict resolution.** Specific hazards in this data model:
   - `flowering_records` has `UNIQUE (iris_id, year)`. Two devices recording the same plant-year
     offline will collide on reconnect. Last-write-wins would silently discard a season's
     measurements; a **field-level merge** (each measurement is independently optional) is a
     better fit for this data.
   - The **rename cascade** in `updateIris` performs many dependent writes. Replayed offline
     against a changed server state it could corrupt lineage. Renames may need to be
     server-reconciled rather than queued.
   - Deletes are hard deletes with no tombstones — an offline delete and an offline edit of the
     same record cannot currently be reconciled.
6. **Honest UI.** Until a queue exists, the connectivity banner must say what is actually true —
   for example "Offline · you cannot save changes right now."

The founding brief's own guidance (§10.2, §10.4) is to *"let users save simple drafts if signal
is poor, but do not overbuild full offline mode in the early version"* and *"plan offline drafts
carefully, but do not attempt full offline sync until the core online workflows are stable."*
A pragmatic first step is therefore **drafts + an honest banner**, not full bidirectional sync.

---

# G. Settings

## G1. Original design vs. current implementation

| Section | Row | Designed | Current |
|---|---|---|---|
| **Profile card** | Name, email, avatar initial | show + edit | ✅ shows · ❌ Edit → `toast('Profile editing coming soon')` |
| **Data** | Customize home | ✅ | ✅ works |
| | Import | CSV/XLSX/JSON with mapping + preview | ❌ **"Coming soon"** — *though an Import screen exists and is unreachable*, see §H2 |
| | Export data | CSV export (brief: an **MVP** feature) | ❌ **"Coming soon"** |
| **Garden** | Add location | ✅ | ⚠ `toast('Add location coming soon')` — **but it works from the Garden tab** |
| | Manage locations | edit + reorder | ⚠ `toast('Coming soon')` — **editing works from Garden detail**; reordering (`sort_order`) is genuinely absent |
| **Region & display** | Region & units | UK/US switch | ✅ works — see §G2 |
| | Text size | Standard / Large / Larger (`user_settings.text_size`) | ❌ **"Coming soon"** |
| | Accent colour | `user_settings.accent_color` exists | ❌ no UI at all |
| **Help & feedback** | Send feedback | routed feedback | ❌ `toast('Thanks!')` — discards input |
| | About | version | ✅ shows `v0.1.0` as a toast |
| | Help section / glossary | brief §11 | ❌ absent entirely |
| **Account** | Sign out | ✅ | ✅ with confirm step |
| | Change password | — | ❌ absent (reset-by-email exists at sign-in) |
| | Delete account | brief §12 "Export and deletion" | ❌ absent |

**Code:** `src/components/screens/settings.tsx` (303 lines).

## G2. Region and units ✅ IMPLEMENTED (display) — 📐 conversion prompt NOT BUILT

### The intended behaviour, stated carefully

**⚠ Terminology warning — read this before touching anything unit-related.** The word
"imperial" is misleading in this project, and earlier notes have used it inconsistently. The
authoritative statement is `docs/feedback-brief-2026-06-25.md` §"Settings — Region & units":

| Region | Date format | Length unit shown |
|---|---|---|
| **UK** | `dd-mm-yyyy` | **centimetres** (metric) |
| **US** | `mm-dd-yyyy` | **inches** (imperial) |

So the **UK profile displays metric units and the US profile displays imperial units** — the
opposite of what "UK = imperial regional profile" would suggest. The UI never uses the words
"metric" or "imperial"; it labels the control **"Region & units"** and describes the effect as
"dd-mm-yyyy · cm" or "mm-dd-yyyy · inches". **Keep it that way.** Describing these profiles as
metric/imperial is what caused the confusion.

**Canonical storage is region-independent:** dates as ISO `yyyy-mm-dd`, lengths as **whole
centimetres**, always. Region affects **display only**. This is implemented exactly as designed
in `src/lib/format.ts`.

Region also selects the **evaluation rubric** (`rubricFor(region)`), though only the UK rubric
exists.

### What is implemented
- A UK/US segmented control in Settings → Region & display.
- Persisted per user in `localStorage` as `bl_region_<userId>`, with a migration from the older
  `bl_units_<userId>` cm/in key.
- `fmtDate()` formats ISO dates per region and reinterprets legacy `DD/MM/YYYY` strings.
- `fmtHeight()`, `cmFromDisplay()`, `displayFromCm()` convert lengths at the boundary.
- Input labels change unit (`HEIGHT (CM)` ↔ `HEIGHT (IN)`) and placeholders change with them.

### What is not implemented

**📐 The conversion prompt.** The current product requirement is that changing measurement
system asks the user whether existing measurements should:
1. be **converted** to the nearest appropriate whole number, or
2. remain **numerically unchanged**.

**No prompt exists.** Switching region takes effect instantly and silently, and the app always
behaves as option 1 — at the *display* layer only.

Expected effects once built:
- **Option 1 (convert):** stored values are unchanged (they are already canonical cm); the
  displayed number changes. A plant recorded at 95 cm displays as 37″ in US. Future records
  entered in inches are converted to cm on save. *This is today's behaviour.*
- **Option 2 (numerically unchanged):** a plant recorded as `95` continues to display as `95`,
  now meaning 95 inches. This requires **rewriting stored values** (95 cm → 241 cm) or storing a
  per-record unit. Neither exists. This option is the harder of the two and its data
  implications need deciding before implementation.

**⚠ DISCREPANCY — the UI copy is wrong today.** `settings.tsx:138–141` reads:

> "Switching converts length measurements from cm to the nearest whole inch, or from inches to
> the nearest whole cm."

Nothing is converted. Stored data never changes; only the rendering does. The sentence describes
option 1 as though it rewrote records, which is doubly misleading given a choice is meant to be
offered.

**⚠ Related defect — rounding drift on edit.** See §A8. Editing in US region round-trips
through whole inches and permanently loses precision.

**⚠ Related defect — date pickers ignore the region.** All date fields are
`<input type="date">`, which renders in the **browser/OS locale**, not the app's region. A UK
user on a US-configured device sees `mm/dd/yyyy` in the picker while the rest of the app shows
`dd-mm-yyyy`.

**❓ NEEDS VERIFICATION:** whether the intended date separator is a hyphen (`dd-mm-yyyy`, as both
the feedback brief and `format.ts` use) or a slash (`dd/mm/yyyy`, as the current task
description uses). The code produces hyphens.

---

# H. Data management

| Feature | Intended | Status | Detail |
|---|---|---|---|
| **Export** | CSV export, listed as an **MVP** feature in the founding brief; later full-garden, breeding-season, cross and seedling exports | ❌ **NOT BUILT** | Settings row disabled, "Coming soon". No export code anywhere. Onboarding tells users "Export anytime" — **a false promise**. |
| **Import** | CSV/XLSX/JSON with **column mapping and preview**, planned early because of existing spreadsheets | ❌ **NOT BUILT — façade exists** | See §H2 |
| **Backup** | CSV export sufficient for private MVP; automated DB + photo backups before real long-term data | ❌ NOT BUILT | Relies entirely on Supabase's own backups (plan-dependent) |
| **Restore** | — | ❌ NOT BUILT | |
| **Delete / reset** | Record deletion ✅; account deletion planned | 🟡 PARTIAL | Individual iris / location / cross / note / evaluation deletes work. **No account deletion, no bulk reset, no soft delete, no undo.** |
| **Account data** | Profile editing, password change, account deletion | ❌ NOT BUILT | Profile Edit → "coming soon" |
| **Local data** | `localStorage` only for temporary prefs (brief §10.3) | 🟡 | Used for region, widgets, onboarding flag — arguably beyond "temporary preferences", since these are the *only* copy |
| **Cloud data** | All records in Supabase, private by default | ✅ | RLS on every table |

## H2. ⚠ The Import screen is an unreachable façade

`src/components/screens/import.tsx` (449 lines) implements a polished four-step wizard —
choose file (with drag-and-drop), preview, import mode, confirm. It is routed in `AppShell`
(`case 'import'`) and `SettingsScreen` accepts an `onImport` prop.

But:
- The Settings row that would trigger it is marked `comingSoon` and **disabled**, so
  `onImport` is never called and **the screen is unreachable**.
- The file is accepted but **never parsed**. `handleFile` only stores it and advances the step.
- The preview always shows the same **five hardcoded rows** (`SAMPLE_ROWS`, line 10 — Dusky
  Challenger, Edith Wolford, Beverly Sills, Superstition, Jesse's Song).
- `handleConfirmImport()` calls `toast('Import complete')` and navigates back. **Nothing is
  imported.**
- It offers an **"add" vs "replace"** mode — a destructive option with no implementation behind
  it.

It is currently harmless *because* it is unreachable. Wiring up the Settings row without
implementing the parser would immediately create a data-loss hazard.

**Available asset:** `seed/gen_seed.py` and `seed/pod_and_pollen_seed_data.xlsx` define the
expected spreadsheet shape and are the natural fixture for building and testing a real importer
(committed for exactly that purpose, commit `e3c2724`).

---

# I. Help and onboarding

## I1. Current onboarding 🟡 PARTIAL
A five-step full-screen overlay shown once per device (`app-shell.tsx:296`,
`bl_onboarded_<userId>`):

1. **Welcome** — logo and positioning copy.
2. **Plant type** — irises, presented as the only available option (roses/dahlias/other exist in
   `PLANT_TYPES` but are not shown here; the future-plant teaser was deliberately removed,
   commit `07dfbad`).
3. **What matters most** — pick up to 4 goals, derived from widget metadata.
4. **Garden type** — collector / breeder / mixed.
5. **Where do you grow** — creates the first location.

Answers feed `recommendWidgets()` to produce a personalised dashboard.

**⚠ Defects:**
- The completion flag is **per device**. A user signing in on a second device or a new browser
  **re-runs onboarding** and, if they enter a garden name again, **creates a duplicate
  location**.
- Step 5's reassurance panel states *"Your records are private by default. Photos stay yours.
  Export anytime."* — photos are not implemented and export is not implemented. Two of three
  claims are false.

## I2. Areas needing more explanation
Identified by inspection; none currently addressed:
- What a **location** is, and why it is worth defining.
- What a **grid reference** is and how to devise a scheme (the field offers only a placeholder).
- **Pod vs pollen parent** — the fundamental concept of the app, never explained.
- **Colour types** — Plicata, Luminata, Neglecta, Amoena are specialist terms with no
  definitions.
- **Classification codes** — the form offers bare abbreviations (MDB, SDB, IB…) with no
  expansions.
- **The evaluation rubric** — categories are labelled but not defined; what distinguishes
  "Substance" 6 from 8?
- **Record type** — when should something be a Seedling rather than a Named Variety?
- **The lifecycle rail** — visible on every record with no explanation of what the stages mean.

## I3. Garden / grid setup guidance 📐 SPECIFIED, NOT BUILT
The user's exact wording is recorded in the feedback brief and reproduced in §C2 above. It is
not in the codebase.

## I4. Future Help section 📐 SPECIFIED, NOT BUILT
Founding brief §11 (Phase 4 of the original plan): in-app manual, getting-started guide,
step-by-step articles, glossary of iris/hybridising terms, **contextual help icons on advanced
fields**, "still stuck" contact, feature-request link, "Was this helpful?" prompt. A
`help_articles` table is anticipated in the brief's data-model section. None of it exists.

## I5. Keeping advanced functionality understandable
Progressive disclosure is **partly** honoured: the Add Iris form groups fields under headings
(Breeder history, Flower colour, Other, Parentage, Location & Notes) and hides all
variety-specific groups for seedlings; only the name is required; every flowering measurement is
optional with explicit copy saying so.

**Working against it:** the Add Iris form is a single long scroll on mobile (flattened
deliberately in commit `87c091a`) rather than the guided steps the brief calls for; there are no
contextual help affordances anywhere; pinch-zoom is disabled (`userScalable: false`), which is
hostile to the older users the brief names as a key group.

---

# J. Everything else found by inspection

## J1. Screens and routes
See [CURRENT_IMPLEMENTATION.md § Screens](./CURRENT_IMPLEMENTATION.md) for the full inventory of
13 screens, 11 flows/sheets, 2 layout components and 3 UI primitives, all reachable from two
URLs.

## J2. Home dashboard widgets ✅ IMPLEMENTED
Ten widgets, user-orderable via Settings → Customize home, persisted per device:
`quick` (quick actions), `today` (focus), `inflower`, `watch`, `fav`, `crosses`, `photowall`,
`gardenmap`, `calendar`, `recent`. Two are system-pinned (`quick` first, `recent` last).
`WIDGET_RECIPES` provides named presets (Breeder, Collector, Casual, Mapper, Everything).

**Note:** widget order lives only in `localStorage`, despite `user_settings.widget_ids` existing
for exactly this purpose.

## J3. Search ✅ IMPLEMENTED
Full-text-ish search across name, classification, location, parents and notes, plus four
faceted filters (status, location, classification, year) whose options are derived from the
user's real data. Year matches either the planted year or any flowering-record year.

**Minor:** the static suggestion chips (`search.tsx:8`) offer "Tall Bearded" and "Reblooming",
neither of which matches stored values (classifications are stored as codes like `TB`; rebloom
is a boolean).

## J4. Bloom calendar ✅ IMPLEMENTED
Aggregates real flowering records by month of first bloom, with a bar-style month strip and a
per-month plant list. Parses both ISO and legacy `DD/MM/YYYY` correctly.

## J5. Collection 🟡 PARTIAL
Implemented: grid/list toggle; filters All / In flower / Named Varieties / Seedlings /
Favourites; sorting by name, recently added, classification, colour type, height, rebloomer,
breeder and **latest BIS evaluation total**; a cross-filter banner when arriving from a cross.

**📐 Gap vs. the feedback brief §"Collection":** the brief asks for **filter by** classification,
colour type, breeder and rebloom — these exist as **sorts**, not filters. Also missing: sort by
individual scoring element (e.g. Branching), sort by flowering period, and the **Discarded
section** (blocked on outcome statuses, §E4).

## J6. Compare ✅ IMPLEMENTED
`CompareScreen` places selected seedlings side by side.

## J7. Empty states ✅ IMPLEMENTED
`src/components/screens/empty.tsx` provides dedicated empty screens for home, collection and
garden, plus `EmptyState` used inline throughout.

## J8. Toasts, sheets, connectivity banner ✅ IMPLEMENTED (with the §F3 caveat)
`Sheet` is a shared bottom-sheet-on-mobile / centred-modal-on-desktop primitive. `Toast` is a
transient confirmation. Several toasts confirm actions that did not happen (photos, import,
feedback).

## J9. Feature flags
**None.** No flag system, no environment-gated features. "Coming soon" is hardcoded per row.

## J10. TODO / FIXME comments
**None in the codebase.** A `grep` for TODO/FIXME/HACK/XXX returns only HTML `placeholder`
attributes. Deferred work is instead recorded in `BACKLOG.md`, in the build plan, and in two
honest inline comments:
- `src/components/screens/in-flower.tsx:7` — the flowering predicate is status-based, Phase 6
  will switch it to the date rule.
- `src/components/flows/add-iris.tsx:328` — "Stored in cm; a future Settings option will let
  users switch to inches" (now stale — that option was built).

## J11. Hidden or unreachable functionality
1. **Import screen** — fully built, unreachable (§H2).
2. **`user_settings` table** — exists, entirely unused.
3. **`photos` table** — exists, entirely unused.
4. **`profiles` table** — written at sign-up, never read.
5. **`irises.colour`, `irises.source`, `irises.palette`, `irises.seed_batch_id`,
   `crosses.pod_number`** — columns no UI writes.
6. **`seed_batches.repot_date` / `retained` / `named`** — columns unreachable through
   `SeedBatchPatch`.
7. **Legacy evaluation columns** — read by one UI, never written (§E5).
8. **`Iris.firstFlower`** — read in three places, never populated (§D2).
9. **`locations.sort_order` / `shape`** — written only with defaults, no UI.
10. **`GardenDetailScreen`'s plant list** navigates to `go('irisDetail')`, a view name **no
    `case` handles** — a blank screen. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

## J12. Things the founding brief specifies that were never started 🔭
Recorded for completeness; none are in the current plan:
- **Wants list** (brief §7.11) — varieties the user wants to obtain, with priority/status and
  conversion into a real record.
- **Future cross planner** (brief §7.12) — planned crosses with goals, convertible into an
  actual cross.
- **Registration-support fields and export** (brief §7.10).
- **AIS Iris Wiki linking** (brief §3).
- **Sharing and visibility** (brief §7.2, Phase 5) — private/shared/public, selected-user
  sharing. Everything is private today, which is the correct default.
- **Multiple gardens per user** (brief §7.1) — there is no `gardens` table.
- **`help_articles`, `feedback_requests`, `drafts`, `sharing_permissions`, `wanted_items`,
  `planned_crosses`** — tables anticipated in the brief's data-model section, none created.
