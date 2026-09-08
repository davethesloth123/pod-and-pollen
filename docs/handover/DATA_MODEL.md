# Pod & Pollen — Data Model

> Derived from `supabase/migrations/001`–`007`, cross-checked against
> `src/lib/db/row-types.ts`, `src/lib/db/queries.ts` and `src/types/index.ts`.
> Every table below is stated as it exists in the migrations; discrepancies between the SQL,
> the TypeScript and the UI are flagged inline as **⚠ DISCREPANCY**.

---

## 1. Overview

Ten tables, all in `public`, all with Row Level Security enabled.

```
auth.users (Supabase)
   │
   ├─1:1─ profiles                    (id = auth.users.id)
   ├─1:1─ user_settings               ⚠ NEVER READ OR WRITTEN BY ANY CODE
   │
   ├─1:N─ locations ──────────┐
   │                          │ location_id (SET NULL)
   ├─1:N─ irises ◄────────────┘
   │        │  ├─ pod_parent_id     ──┐ self-reference (SET NULL)
   │        │  ├─ pollen_parent_id  ──┤
   │        │  ├─ cross_id ─────────────► crosses     (SET NULL)
   │        │  └─ seed_batch_id ────────► seed_batches (SET NULL)
   │        │
   │        ├─1:N─ notes              (CASCADE on iris delete)
   │        ├─1:N─ photos             (CASCADE)  ⚠ NEVER READ OR WRITTEN
   │        ├─1:N─ flowering_records  (CASCADE)  UNIQUE (iris_id, year)
   │        └─1:N─ evaluations        (CASCADE)
   │
   ├─1:N─ crosses
   │        ├─ pod_parent_id     ──► irises (SET NULL)
   │        ├─ pollen_parent_id  ──► irises (SET NULL)
   │        └─1:N─ seed_batches      (CASCADE on cross delete)
   │
   └─1:N─ seed_batches ──► crosses
```

Every user-owned table has `user_id uuid references auth.users(id) on delete cascade not null`
and a single policy `using (auth.uid() = user_id) with check (auth.uid() = user_id)`, which
Postgres applies as `FOR ALL`. Deleting a user therefore removes all their data.

Primary keys are `uuid default gen_random_uuid()` (pgcrypto), except `profiles.id` which *is*
the `auth.users.id`.

---

## 2. `profiles`

**Purpose:** app-specific extension of `auth.users`.
**Migration:** `001_initial_schema.sql`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | FK → `auth.users(id)` ON DELETE CASCADE |
| `name` | `text` | yes | |
| `garden_name` | `text` | yes | |
| `created_at` | `timestamptz` | yes | default `now()` |

**Policies:** separate SELECT / UPDATE / INSERT policies, all `auth.uid() = id`. No DELETE policy.
**Trigger:** `on_auth_user_created` → `handle_new_user()` inserts a bare row on sign-up
(`security definer`, `on conflict do nothing`).

> **⚠ DISCREPANCY — write-only table.** The only code that touches `profiles` is
> `src/components/auth/sign-up-flow.tsx:48`, which upserts `name` and `garden_name`. **Nothing
> ever reads it.** The user's display name everywhere in the app comes from
> `user.user_metadata.name` (set via `signUp` options), and `garden_name` is never surfaced at
> all. There is no `UserProfile` fetch, despite `src/types/index.ts:186` declaring the type.

---

## 3. `user_settings`

**Purpose:** intended per-user preferences.
**Migration:** `001_initial_schema.sql`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | FK → `auth.users`, **UNIQUE** |
| `widget_ids` | `text[]` | yes | default `'{}'` — ordered active dashboard widgets |
| `accent_color` | `text` | yes | default `'#5F7A52'` |
| `text_size` | `text` | yes | default `'Standard'` — Standard \| Large \| Larger |
| `created_at` / `updated_at` | `timestamptz` | yes | default `now()` |

> **⚠ DISCREPANCY — entirely unused.** `grep -rn "user_settings" src/` returns nothing. All
> three concerns are handled elsewhere: widget order in `localStorage` (`bl_widgets_<userId>`),
> accent colour not implemented at all, text size shown as "Coming soon" in Settings. Region
> preference — which arguably belongs here — is also in `localStorage`
> (`bl_region_<userId>`). **All user preferences are therefore device-local and do not follow
> the user.**

---

## 4. `locations`

**Purpose:** garden beds, borders, greenhouses, trial areas, holding areas, pots.
**Migration:** `001`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | FK → `auth.users` CASCADE |
| `name` | `text` | **no** | |
| `short_name` | `text` | yes | label shown on the small garden map |
| `kind` | `text` | yes | Bed \| Border \| Trial area \| Greenhouse \| Holding \| Pots |
| `sun` | `text` | yes | |
| `soil` | `text` | yes | |
| `x`, `y`, `w`, `h` | `numeric(5,1)` | yes | **percentages** of the map canvas, 0–100 |
| `shape` | `text` | yes | default `'rect'` |
| `sort_order` | `int` | yes | default `0` |
| `created_at` | `timestamptz` | yes | default `now()` |

**Enumerations are not enforced in the database.** `kind` and `sun` are free `text`; the option
lists live in the UI and **are duplicated and inconsistent**:

| List | `src/components/flows/add-location.tsx` | `src/components/screens/garden.tsx` |
|---|---|---|
| Kinds | 6 values (`KINDS`, line 13) | same 6 (`LOC_KINDS`, line 477) |
| Sun | 3 values (`SUN_OPTIONS`, line 14) | **5** values (`LOC_SUN`, line 478) — adds `Glass`, `Mixed` |

> **⚠ DISCREPANCY — `insertLocation` cannot set map coordinates.** `src/lib/db/queries.ts:57`
> writes only `name`, `short_name`, `kind`, `sun`, `soil`. `x/y/w/h`, `shape` and `sort_order`
> are writable *only* through `updateLocation`, which the garden map's drag-to-place editor
> uses. A newly created location therefore has null coordinates and is drawn at a staggered
> default position until someone drags it. `short_name` is also never set by
> `AddLocationFlow`, only by the Garden detail edit form.

**Deletion:** `deleteLocation` hard-deletes. `irises.location_id` is `ON DELETE SET NULL`, so
plants survive and become unassigned — correctly surfaced in the UI ("Deleting a location won't
delete its plants — they simply become unassigned").

---

## 5. `irises`

**Purpose:** the central record. Holds **both** named varieties and seedlings.
**Migrations:** `001`, extended by `002` (breeder, year_released), `004` (parent ids),
`006` (rebloom).

### Identity
| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | FK → `auth.users` CASCADE |
| `name` | `text` | **no** | |
| `kind` | `text` | **no** | default `'Variety'` — `Variety` \| `Seedling` |
| `classification` | `text` | yes | MDB, SDB, IB, BB, MTB, TB, AB, Dutch Iris, SPU, SIB, JA, LA, Iris reticulata, Iris laevigata |
| `color_type` | `text` | yes | Self, Bicolour, Bitone, Reverse Bitone, Plicata, Luminata, Neglecta, Blend, Amoena, Broken, Line and Speckles, Space Age |
| `status` | `text` | yes | default `'Growing'` — Growing \| Flowering \| Watch \| First flower \| Archived \| Named |
| `fav` | `boolean` | yes | default `false` |

### Appearance
| Column | Type | Null | Notes |
|---|---|---|---|
| `colour` | `text` | yes | **Never written by any UI.** Legacy free-text colour. |
| `height_cm` | `int` | yes | **Canonical whole centimetres**, always, regardless of region |
| `season` | `text` | yes | Early \| Mid \| Late (labelled "Flowering period" in the UI) |
| `fragrance` | `text` | yes | Stored as `"<level> · <type>"`, e.g. `"Pronounced · Sweet"` |
| `palette` | `text` | yes | Key into `PAL` in `src/lib/data/index.ts` for the procedural illustration. **Never written by any UI** — `dbToIris` defaults it to `'deepPurple'`, so every plant renders the same. |
| `rebloom` | `boolean` | **no** | default `false` (migration 006) |

### Colour definition (BIS-style)
`color_standards`, `color_falls`, `color_beard`, `color_style_arms` — all `text`, all nullable.
Free-text descriptions, variety-only in the UI.

### Provenance
| Column | Type | Null | Notes |
|---|---|---|---|
| `source` | `text` | yes | **Never written by any UI.** |
| `breeder` | `text` | yes | migration 002; autocompletes from previously entered values |
| `year_released` | `int` | yes | migration 002 |
| `planted_date` | `text` | yes | ⚠ see below |
| `first_ever_flower` | `text` | yes | ⚠ see below |

> **⚠ DISCREPANCY — `planted_date` holds a year, not a date.** The migration comments it as
> `DD/MM/YYYY or "Oct 2019" etc.`, but the only writer (`add-iris.tsx`, field labelled
> "YEAR ACQUIRED / PLANTED") is `<input type="number" min="1990">`, so the stored value is a
> four-digit year string such as `"2024"`.

> **⚠ DISCREPANCY — `first_ever_flower` is read but never written.** `dbToIris` maps it to
> `Iris.firstEverFlower` and `IrisPatch` supports it, but **no flow writes it** — the Record
> Flowering sheet only writes `flowering_records`. The column is permanently empty. Separately,
> `Iris.firstFlower` (a *different* field in `src/types/index.ts:94`) is **never populated by
> the mapper at all**, yet is read in three places (`src/lib/data/index.ts:50,64`,
> `src/components/screens/crosses.tsx:524`), so those branches are permanently dead.

### Location
| Column | Type | Null | Notes |
|---|---|---|---|
| `location_id` | `uuid` | yes | FK → `locations(id)` **ON DELETE SET NULL** |
| `grid_ref` | `text` | yes | **Free text.** e.g. `"Row B · 3"`, `"B4"`. No structure, no validation, no uniqueness, no occupancy model. |

> **⚠ DISCREPANCY vs. intent.** The feedback brief specifies (a) **multiple current locations**
> per plant and (b) a generated **rows × plants-per-row grid** per bed. The schema supports
> exactly **one** location per plant and no grid at all. See
> [FEATURE_SPECIFICATION.md § Garden](./FEATURE_SPECIFICATION.md).

### Parentage
| Column | Type | Null | Notes |
|---|---|---|---|
| `pod_parent` | `text` | yes | denormalised **name** |
| `pollen_parent` | `text` | yes | denormalised **name** |
| `pod_parent_id` | `uuid` | yes | FK → `irises(id)` SET NULL (migration 004) |
| `pollen_parent_id` | `uuid` | yes | FK → `irises(id)` SET NULL (migration 004) |

**Dual representation is intentional.** A parent may be a plant the user does not own (a variety
in someone else's garden), in which case only the name exists. Migration 004 backfilled ids by
matching name + `user_id`. At runtime `DataProvider` re-heals missing ids from a name index, and
`updateIris` cascades renames to children and crosses.

> **Integrity risk:** two sources of truth. Nothing enforces that `pod_parent` equals
> `irises[pod_parent_id].name`. They can and do diverge — the healing logic exists precisely
> because they have. There is also **no cycle prevention**: a plant can be recorded as its own
> ancestor.

### Cross linkage (seedlings)
| Column | Type | Null | Notes |
|---|---|---|---|
| `cross_id` | `uuid` | yes | FK → `crosses(id)` SET NULL |
| `seed_batch_id` | `uuid` | yes | FK → `seed_batches(id)` SET NULL. **Never written by any code.** |
| `generation` | `text` | yes | F1, F2 … |

> **⚠ NOTE — `Iris.cross` is overloaded.** `dbToIris` sets both `crossId` and `cross` to the
> same `cross_id` **uuid**, while `src/types/index.ts:107` documents `cross` as "cross code
> (e.g. X1)". Consumers such as `crossStats` defensively check both
> (`i.crossId === crossId || i.cross === crossId`).

### Timestamps
`created_at`, `updated_at` — `timestamptz default now()`. `updated_at` is set explicitly by
`updateIris`; there is **no database trigger**, so any write that bypasses that helper leaves it
stale.

**Indexes:** `irises_user_id_idx`, `irises_location_id_idx`.
**Deletion:** `deleteIris` hard-deletes. Notes, photos, flowering records and evaluations cascade
away. Children's `pod_parent_id` / `pollen_parent_id` become NULL — **but their `pod_parent`
name text remains**, so lineage survives as an unlinked name. This is arguably desirable and is
certainly undocumented.

**Validation:** name uniqueness is enforced **in the application only**
(`add-iris.tsx:150`, case-insensitive, excludes the record being edited). There is **no unique
constraint in the database**, so concurrent or non-UI writes can create duplicates.

---

## 6. `crosses`

**Purpose:** a pollination event.
**Migration:** `001`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `code` | `text` | **no** | e.g. `GI-23-04`; auto-generated as `<yy>-<nn>` if left blank |
| `season` | `text` | yes | year of pollination, as text |
| `pod_parent` / `pollen_parent` | `text` | yes | denormalised names |
| `pod_parent_id` / `pollen_parent_id` | `uuid` | yes | FK → `irises(id)` SET NULL |
| `pollination_date` | `text` | yes | ISO `yyyy-mm-dd` in practice |
| `pod_number` | `text` | yes | **Never written by any UI.** |
| `goal` | `text` | yes | |
| `notes` | `text` | yes | |
| `status` | `text` | yes | default `'Sown'` |
| `created_at` | `timestamptz` | yes | |

> **⚠ DISCREPANCY — status values disagree.** The migration comments the domain as
> `Sown | Germinated | Growing on | Evaluating | Archived` and defaults to `'Sown'`, but
> `insertCross` (`src/lib/db/queries.ts:451`) defaults new rows to **`'Pollinated'`**, a value
> outside the documented set. `src/types/index.ts:143` repeats the migration's list.

**Uniqueness:** `code` is checked in the application only, per season, case-insensitively
(`data-context.tsx:246`). No database constraint.

**Code generation:** `record-pollination.tsx:94` computes the sequence as
`crosses.filter(c => c.season === year).length + 1`. Deleting a cross frees its number for
reuse, so codes are not stable identifiers.

**Deletion:** `deleteCross` hard-deletes. `seed_batches` cascade. Seedlings' `cross_id` becomes
NULL — the local state update in `data-context.tsx:258` mirrors this and the UI warns
("Its N seedlings will remain but be unlinked").

---

## 7. `seed_batches`

**Purpose:** seed harvest → sowing → germination → planting out, for one cross.
**Migrations:** `001`, `003` (transplanted)

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `cross_id` | `uuid` | **no** | FK → `crosses(id)` **ON DELETE CASCADE** |
| `harvest_date`, `sown_date`, `germ_date`, `repot_date`, `planted_out_date` | `text` | yes | |
| `seeds_count`, `germinated`, `germ_pct`, `transplanted`, `retained`, `named` | `int` | yes | `retained`/`named` default 0 |
| `treatment` | `text` | yes | |
| `created_at` | `timestamptz` | yes | |

> **⚠ DISCREPANCY — one batch per cross, not many lots.** The feedback brief §1.5 specifies
> **multiple seed lots per cross**, each with its own treatment, so germination rates between
> treatments can be compared — described as the point of the feature. The schema permits many
> rows per `cross_id`, but `saveSeedBatch` (`queries.ts:498`) explicitly finds-or-creates
> **one** row per cross, and `seedBatchFor()` returns a single batch. `repot_date`, `retained`
> and `named` are in `SeedBatch` but absent from `SeedBatchPatch`, so they are never written.

---

## 8. `notes`

**Purpose:** dated observations attached to a plant.
**Migration:** `001`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `iris_id` | `uuid` | **no** | FK → `irises(id)` **ON DELETE CASCADE** |
| `note_type` | `text` | yes | Flowering \| Health \| Movement \| General \| Photo \| Evaluation |
| `body` | `text` | **no** | |
| `noted_at` | `timestamptz` | yes | default `now()`; user-settable |
| `created_at` | `timestamptz` | yes | |

**Index:** `notes_iris_id_idx`.
Notes are the source of the Home "Recently updated" feed (latest 8 across all plants).

---

## 9. `photos`

**Purpose:** metadata for images held in Supabase Storage.
**Migration:** `001`

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `iris_id` | `uuid` | **no** | FK → `irises(id)` CASCADE |
| `storage_path` | `text` | **no** | path within the bucket |
| `category` | `text` | yes | migration says `Flower \| Whole plant \| Foliage \| General` |
| `caption` | `text` | yes | |
| `taken_at` | `timestamptz` | yes | |
| `created_at` | `timestamptz` | yes | |

**Index:** `photos_iris_id_idx`.

> **⚠ DISCREPANCY — table exists, feature does not.** No code reads or writes `photos`.
> `dbToIris` hardcodes `photos: []`. The `iris-photos` storage bucket and its RLS policies are
> **commented out** at the bottom of migration 001 and have not been created. The
> `AddPhotoFlow` UI has no file input and saves nothing.
> Additionally the UI's category list (`add-photo.tsx:15`:
> Standards, Falls, Habit, Setting, Detail, Other) does not match the migration's list, and
> neither matches the founding brief's seven photo types.

---

## 10. `flowering_records`

**Purpose:** **one record per plant per year.** The backbone of the product's "never overwrite
history" principle.
**Migrations:** `001`, `005` (branch count, bloom size)

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `iris_id` | `uuid` | **no** | FK → `irises(id)` **ON DELETE CASCADE** |
| `year` | `int` | **no** | |
| `first_date` | `text` | yes | ISO `yyyy-mm-dd` |
| `last_date` | `text` | yes | ISO `yyyy-mm-dd` |
| `stems` | `int` | yes | stems per plant |
| `buds` | `int` | yes | bud count per stem |
| `branch_count` | `int` | yes | migration 005 |
| `height_cm` | `int` | yes | plant height, whole cm |
| `bloom_height_cm` | `int` | yes | migration 005 |
| `bloom_width_cm` | `int` | yes | migration 005 |
| `notes` | `text` | yes | |
| `created_at` | `timestamptz` | yes | |

**`UNIQUE (iris_id, year)`** — the constraint that guarantees the one-record-per-year rule.
`upsertFlowering` uses `onConflict: 'iris_id,year'`, so re-recording a year updates rather than
duplicating.

**All measurement fields are optional by design** — an explicit, confirmed requirement from the
user's feedback ("All cells are optional and may be left blank").

Derived values are computed in the UI, not stored: flowering period in days
(`daysBetweenIso`), and the averaged "primary panel" across years (`FloweringSummary` in
`iris-detail.tsx`).

> **Naming note:** `docs/build-plan-2026-06-25.md` Phase 2 proposed a *new* `annual_records`
> table in migration 006. The implementation instead extended `flowering_records` in migration
> 005. Functionally equivalent; the plan document is simply out of date.

---

## 11. `evaluations`

**Purpose:** annual scored assessment of a plant.
**Migrations:** `001`, `007` (BIS rubric)

| Column | Type | Null | Notes |
|---|---|---|---|
| `id` | `uuid` PK | no | |
| `user_id` | `uuid` | no | CASCADE |
| `iris_id` | `uuid` | **no** | FK → `irises(id)` CASCADE |
| `eval_year` | `int` | yes | defaults to current year on insert |
| **`scores`** | `jsonb` | yes | **current** — `{ categoryKey: number }` (migration 007) |
| **`total`** | `numeric(5,1)` | yes | **current** — summed total (migration 007) |
| **`rubric`** | `text` | yes | **current** — rubric id, e.g. `'bis-uk'` (migration 007) |
| `comments` | `text` | yes | |
| `evaluated_at` | `timestamptz` | yes | default `now()` |
| `created_at` | `timestamptz` | yes | |
| `form`, `colour`, `substance`, `branching`, `vigour` | `numeric(3,1)` | yes | **LEGACY 1–5 scores** |
| `average` | `numeric(3,2)` | yes | **LEGACY** |
| `verdict` | `text` | yes | **LEGACY** — Retain \| Discard \| Watch \| Name |

**Index:** `evaluations_iris_id_idx`.

Migration 007 states the intent plainly: *"Legacy columns remain for reading older records but
are no longer written."* `insertEvaluation` and `updateEvaluation` write only
`scores`/`total`/`rubric`/`comments`/`eval_year`.

> **⚠ DISCREPANCY — one UI still renders only the legacy fields.**
> `src/components/screens/crosses.tsx:534–560` (the seedling list on a cross detail) displays
> `form`, `colour`, `substance`, `branching`, `vigour`, `avg` and `verdict` as five-dot ratings.
> Because those columns are never written any more, this panel is **permanently blank for every
> evaluation created since migration 007**. See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md).

> **⚠ No uniqueness constraint.** The brief specifies **one scorecard per plant per year**. The
> application enforces neither: `insertEvaluation` always inserts, and there is no
> `UNIQUE (iris_id, eval_year)`. Two 2026 scorecards for the same plant are possible today.
> Contrast `flowering_records`, which *does* have the constraint.

**The rubric itself is code, not data in the database** — `src/lib/rubric.ts` defines `BIS_UK`
with 10 categories in 4 groups totalling exactly 100 points:

| Group | Key | Label | Max |
|---|---|---|---|
| Plant | `foliage` | Foliage | 10 |
| Plant | `disease` | Disease resistance | 10 |
| Plant | `growth` | Growth / increase | 10 |
| Stem | `stem` | Proportion / strength, branching | 15 |
| Stem | `budstem` | Bud count, stem count & bloom sequence | 15 |
| Flower | `colour` | Colour / pattern | 5 |
| Flower | `form` | Form | 10 |
| Flower | `substance` | Substance | 10 |
| Flower | `distinct` | Distinctiveness | 5 |
| Presentation | `presentation` | Presentation / garden appeal | 10 |

This matches the BIS marking form in `docs/feedback-brief-2026-06-25.md` §1.2 exactly.
`rubricFor(region)` and `rubricById(id)` both currently return `BIS_UK` unconditionally — the
region hook exists but has only one rubric to choose from (the non-UK rubric is a documented
**parked** dependency).

---

## 12. Enumerations — where they actually live

**No enumeration is enforced by the database.** Every one is a `text` column with the allowed
values held in TypeScript. This is a deliberate-looking trade for flexibility, but it means the
database will accept any string, and lists drift between files.

| Domain | Values | Defined in |
|---|---|---|
| Iris kind | Variety, Seedling | `types/index.ts:6`; UI labels them "Named Variety" / "Seedling" |
| Iris status | Growing, Flowering, Watch, First flower, Archived, Named | `types/index.ts:7`, `data/index.ts:STATUS`, `iris-detail.tsx:32` |
| Classification | 14 values (MDB…Iris laevigata) | **duplicated**: `add-iris.tsx:26` and `add-seedlings.tsx:15` |
| Colour type | 12 values (Self…Space Age) | `add-iris.tsx:35` only |
| Location kind | 6 values | **duplicated**: `add-location.tsx:13`, `garden.tsx:477` |
| Sun | 3 vs **5** values | **inconsistent**: `add-location.tsx:14` vs `garden.tsx:478` |
| Note type | Flowering, Health, Movement, General, Photo, Evaluation | migration 001 comment; icon map in `iris-detail.tsx:35` |
| Cross status | Sown, Germinated, Growing on, Evaluating, Archived (+ **Pollinated** on insert) | migration 001, `types/index.ts:143`, `queries.ts:451` |
| Fragrance | Level: Pronounced/Slight/Absent · Type: Sweet/Spicy/Musky | `add-iris.tsx:30–31` |
| Flowering period | Early, Mid, Late | `add-iris.tsx:335` (inline) |
| Photo category | Standards, Falls, Habit, Setting, Detail, Other | `add-photo.tsx:15` (conflicts with migration 001) |

---

## 13. Validation summary

| Rule | Where enforced | Database backstop? |
|---|---|---|
| Iris name required | UI (`canSave`) | ✅ `not null` |
| Iris name unique per user | UI only, case-insensitive | ❌ none |
| Cross code unique per season | UI only | ❌ none |
| One flowering record per plant per year | Upsert on conflict | ✅ `UNIQUE (iris_id, year)` |
| One evaluation per plant per year | ❌ nowhere | ❌ none |
| Evaluation score ≤ category max | UI (`setScore` clamps) | ❌ none |
| Evaluation all-or-nothing | UI (`canSave` requires all filled) | ❌ none |
| Height 0–250 | UI `min`/`max` attributes only (not re-checked on save) | ❌ none |
| Enumerated values | UI dropdowns | ❌ none — all free `text` |
| Ownership | UI filters `.eq('user_id', …)` | ✅ RLS on every table |

---

## 14. Weaknesses that will cause migration or integrity problems

Ordered by likely cost.

1. **Single location per plant.** The confirmed requirement is *multiple current locations*.
   Fixing this needs a `plant_locations` join table and a rewrite of every read path that
   currently uses `iris.locationId` / `iris.loc`. The longer records accumulate under the
   one-location assumption, the more data must be migrated. **Highest-cost latent change.**

2. **No grid model.** `grid_ref` is free text. The specified bed grid (rows × plants per row,
   with occupancy) cannot be built on it; grid references will need parsing or discarding.

3. **One seed batch per cross.** The seed-lot comparison feature — the stated *reason* for the
   module — requires many lots per cross. The schema already allows it; the code does not. The
   longer single-batch rows accumulate, the more ambiguous the migration to lots becomes.

4. **Dual name/id parentage with no invariant.** Two sources of truth, reconciled by heuristics
   at load and on rename. No cycle prevention. A stricter model (id-only, plus a separate
   `external_parent_name` for parents not in the collection) would be safer but is a breaking
   change.

5. **Dates stored as `text`.** `pollination_date`, `first_date`, `last_date`, `planted_date`,
   `harvest_date` and the rest are `text`, not `date`. Postgres cannot sort, range-filter or
   validate them, and legacy `DD/MM/YYYY` values coexist with ISO ones (`format.ts` explicitly
   handles both). Any future reporting or calendar query will want real `date` columns.

6. **`planted_date` semantically holds a year.** Migrating to a real `date` column requires
   deciding what `"2024"` means.

7. **No `UNIQUE (iris_id, eval_year)`.** Duplicate scorecards can already exist; adding the
   constraint later may fail on live data.

8. **Preferences in `localStorage`, not `user_settings`.** Migrating later means either
   abandoning existing users' settings or writing a one-time client-side upload.

9. **Hand-written row types.** `src/lib/db/row-types.ts` is not generated and nothing checks it
   against the migrations. A column rename compiles cleanly and breaks at runtime.

10. **No `updated_at` trigger.** Only `updateIris` maintains it, and only on `irises`. No other
    table has an `updated_at` at all, so there is no reliable change timestamp — which any
    future offline sync or conflict resolution will need.

11. **No soft delete and no audit trail.** Every delete is permanent, with a single confirmation
    click. For irreplaceable multi-year breeding records this is the most alarming property of
    the model. The founding brief calls for audit logging of destructive actions before wider
    release.

12. **Migrations are apply-by-hand.** Each file's header says "Run in the Supabase SQL editor
    for each environment." There is no migration runner, no `schema_migrations` table and no way
    to verify which migrations a given environment has actually received.
