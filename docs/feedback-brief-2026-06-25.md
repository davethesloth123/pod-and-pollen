# Pod & Pollen — Feedback Brief

**Source:** Dad's feedback (25 Jun 2026) + answers + BIS Judges Marking Form
**Status:** For review & confirmation — *no code changes made yet*

How to read this: each item has **What he asked** and **What we'll build** (acceptance criteria),
plus a type tag — 🐛 bug · ✨ feature · 🧱 data-model change · 🎨 UI polish · ⛔ blocked.
All design decisions are now **✅ resolved** (§4). Two items are **parked for now** — they don't
block the main work and are listed at the end so everyone can see why they're waiting.

---

## 1. Foundational data-model changes (do these first — everything else builds on them)

### 1.1 Annual flowering record = the new "primary" record  🧱
**Asked:** Record actual measurements each year/season; these sit on the annual flowering
record. Also create an averaged/combined record shown as the *primary* information for each plant.
**Build:** One **annual record per plant per year** holding the measurements below. A derived
**"primary" panel** at the top of each plant's record shows the **averages across all years**.
- First bloom date, Last bloom date
- **Flowering period (days)** = last − first (per year + overall average)
- Stems per plant
- Bud count per stem
- Branch count
- Plant height
- Bloom size — height × width
✅ **Confirmed:** this field set is complete. **All cells are optional** and may be left blank.
**UK length measurements are whole cm only** (no decimals).

### 1.2 Evaluation = BIS 100-point scorecard  🧱✨
**Asked:** Replace evaluation categories with the BIS judges record items & scores.
**Build:** One **BIS scorecard per plant per year**, scored out of 100:
- **Plant:** Foliage /10 · Disease Resistance /10 · Growth/Increase /10
- **Stem:** Proportion/Strength & Branching /15 · Bud/Stem Count & Bloom Sequence /15
- **Flower:** Colour /5 · Form /10 · Substance /10 · Distinctiveness /5
- **Presentation/Garden Appeal:** /10
- **Total /100** (auto-summed) + free-text **Notes**
- Show **total score per year** and **overall average** on the plant record.

✅ **Confirmed rules:**
- **One scorecard per plant per year.**
- Each category shows its **maximum** and entry is **restricted to ≤ that max**.
- A scorecard is **all-or-nothing**: every category must have a value, **or** the year is left with
  no evaluation data. (No partially-filled cards.)
- 🌍 **Region-dependent rubric:** UK uses the BIS categories/maxes above; **other regions have
  slightly different categories and maximum scores.** The scorecard structure must therefore be
  driven by the active region.
  **⛔ Dependency:** we only have the **UK (BIS)** rubric today — the non-UK rubric(s) are needed
  before that region's evaluation can be built. UK can proceed now.

### 1.3 Seedling identity, naming & status  🧱✨
**Asked:** A seedling has a number/code (e.g. cross-number + .1, .2…). Option to add a
**registered name** later; once named, the **name becomes the dominant identifier** but the
**seedling number is retained** in the data. Status set: **Discarded · Growing on · Retained ·
Registered** (new seedlings start "Growing on"; "Keep" = "Retained").
**Build:**
- Every seedling keeps a permanent **seedling number/code**.
- Optional **registered/variety name** field; when set, it's shown as the primary label, with the
  seedling number kept and shown secondarily.
- **Outcome status** field with the four values; editable for all except that **Discarded** moves
  the plant into a **"Discarded" section** of the Collection and shows it **only** there.
- A **named variety** has no lifecycle status — its status simply reads **"Named variety"**.

### 1.4 Multiple current locations  🧱
**Asked:** A plant (variety or seedling) may be split from a clump and grown in more than one
location. Only need to hold **where current plants are growing** (no history over time).
**Build:** A plant can have **one or more current locations** (each with optional grid ref).
Reassigning = **overwrite/add/remove** current locations. *(This supersedes the earlier "location
history timeline" idea — he only wants current locations.)*

### 1.5 Seed lots per cross  🧱✨
**Asked:** Split a cross's seeds into multiple **lots** to compare seed treatments (objective:
see which treatment germinates faster/better). After germination the lot doesn't matter — only
that seedlings are from the cross.
**Build:** A cross can have **multiple seed lots**, each with its own **treatment + sowing date +
germination date + seed count + germinated count + germination %**. Lots are primarily a
**germination-tracking** unit.
✅ **Confirmed (Option A):** lots are for germination tracking only — seedlings link to the
**cross**, not a specific lot. Optional seedling→lot linkage can come later if wanted.

---

## 2. Screen-by-screen changes

### Add Iris
- ✨ **Rebloom** yes/no toggle (in the *Other* section).
- ✨ **Breeder** field: autocomplete from breeders already entered.
- ✨ **Unique name guard** (case-insensitive): block a new plant whose name/number already exists →
  inline text *"Iris name already exists"*. Applies to **both** named varieties and seedlings.
- 🎨 Rename record type **"Variety" → "Named Variety"** throughout.

### Record Flowering  (folds into 1.1)
- ✨ Record **first & last flower date** each year (already partly present — surface both clearly),
  plus the annual measurements in 1.1.

### Crosses
- ✨ **Edit** a cross.
- ✨ **Delete** a cross.
- ✨ **Search** on the Crosses screen.
- ✨ **Cross summary** (ignore unevaluated seedlings): average total evaluation score · average
  flowering period · counts by outcome (Retained / Discarded / Registered / Growing on).
- ✨ Seed-lots (1.5).

### Seedlings
- ✨ Allow **descriptive data entry** (colour, etc.) — same fields as named varieties.
- ✨ **Carry harvest / sowing / germination dates** from the cross (lot) onto the seedling record.
- ✨ Naming/number/status per 1.3.

### Collection
- 🎨 **Sort alphabetically** within each heading.
- ✨ **Filter/show by:** All · Classification · Colour type · Breeder · Rebloom.
  *(Height filtering dropped for now per his answer.)*
- ✨ **Sort by:** Total evaluation score · each scoring element (e.g. Branching) · flowering period.
- ✨ **Discarded section** (from 1.3) — discarded seedlings appear here only.

### Individual iris record
- ✨ Primary averaged panel (1.1) + total eval score per year & overall average (1.2).
- ✨ Flowering period (days) per year + average.
- 🎨 The box under the photo becomes **Status**: "Named variety" for varieties; current outcome
  status for seedlings.

### Home page
- 🐛 Crosses widget shows **"No crosses yet"** even when crosses exist (they appear under *See all*).
- 🐛 **"In flower → View all"** does nothing.
- ✨ **"Now flowering" rule:** show plants whose **first-flower date has a value for the current
  year AND no last-flower date**. Apply everywhere "now/in flower" is shown.

### Photos  ⛔ (blocked on storage-backend choice — R2 / Images / Bunny)
- ✨ Max **~4 photos per plant**.
- ✨ **Resize/compress on add** (yes, doable client-side).
- 🎨 Display **square** images everywhere.

### Notes
- 🎨 Quick-Note **type dropdown** is too narrow — widen to fit the note types.

### Settings — Region & units  🧱✨
**Asked:** A single **Region** switch in the Settings region section:
- **UK** → dates `dd-mm-yyyy`, length in **cm**
- **US** → dates `mm-dd-yyyy`, length in **inches**

When switching region, show a note:
*"Length measurements will be converted from cm to the nearest whole inches, or from inches to the
nearest whole cm."*

**Build / implementation note:** internally we store **one canonical form** — dates as ISO
(`yyyy-mm-dd`) and lengths in cm (**whole cm**) — and only the **display** changes per region.
Length is shown rounded to the **nearest whole unit** of the display unit (whole cm / whole inches).
Storing canonically means switching region back and forth **won't drift or degrade** the underlying
data, while still showing the user the rounded values the note describes. The active region also
selects the **evaluation rubric** (see 1.2). This folds in the code-review "date standardisation"
item.

### Garden / bed setup  (the old "Batch 2")
- ✨ Bed setup = define **rows × max plants per row → generates a named table/grid**.
- 🎨 Help text (his wording): *"For each of your defined growing areas and the space available in
  each case; select the number of rows and the maximum number of plants per row that you wish to
  record. A table will be created accordingly and should be given an appropriate name."*
- ✨ Reassign a plant to a grid cell / location (now multi-location per 1.4).

---

## 3. Proposed sequencing (for confirmation)

Because evaluation, annual records, seedling status and cross summaries all interlock, I'd group
the work like this rather than the original Batch 2–5 split:

1. **Records core** — annual flowering record + averaged primary panel + flowering-period days (1.1).
2. **Evaluation (BIS)** — 100-pt scorecard, per-year + average, outcome status, collection sort by
   score/element (1.2 + parts of Collection).
3. **Seedlings & Crosses** — seedling naming/number/status + Discarded section, seedling descriptive
   fields, carry dates, edit/delete cross, cross search, cross summary, seed lots (1.3, 1.5, Crosses).
4. **Collection, Home & UI** — alpha sort, filters, record-type rename, status-box semantics, home
   bugs, now-flowering rule, note dropdown, rebloom, breeder typeahead, duplicate-name guard.
5. **Locations & Garden** — multiple current locations + reassign + bed-setup grid (1.4 + Garden).
6. **Photos** — when the storage backend is chosen.

---

## 4. Decisions — now resolved

- ✅ Annual-record field set confirmed (1.1); all cells optional; UK lengths in whole cm.
- ✅ One evaluation scorecard per plant per year; max-restricted, all-or-nothing entry;
  **region-dependent rubric** (1.2).
- ✅ Seed lots = germination-tracking only, Option A (1.5).
- ✅ Discarded seedlings hidden from normal Collection views but **still counted** in cross summaries.
- ✅ Region switch (UK/US) defined — see *Settings — Region & units*; rounds length to nearest
  **whole** unit. Replaces the cm/in toggle and the code-review "date standardisation" item.

## 5. Parked for now (left deliberately — not blocking anything)

These two aren't decisions to make today; they're **inputs we're waiting on**. Everything else can
proceed without them. We'll pick each up when the time/info is ready.

- **⛔ Non-UK evaluation rubric(s)** — the categories & maximum scores used outside the UK (1.2).
  The UK (BIS) scorecard is built first; a US/other-region card is just added as data later, once we
  have that region's official marking form. **No action needed now unless non-UK evaluation is wanted soon.**
- **⛔ Photo storage backend** — where uploaded photos are hosted (e.g. Cloudflare R2 / Images,
  Bunny). The whole Photos batch (max 4 per plant, resize/compress, square display) waits on this
  one choice. **Parked until we decide the hosting; everything else continues in the meantime.**
