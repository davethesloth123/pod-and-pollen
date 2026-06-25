# Pod & Pollen — Build Plan (from the 25 Jun feedback brief)

Phases are ordered by dependency. Each is shippable & testable on `dev` on its own, and lists the
**migration** it needs (you'll run the SQL as with 004), its **dependencies**, a **test checklist**,
and a rough **size** (S/M/L).

Legend: 🧱 schema/migration · ✨ feature · 🐛 bug · 🎨 UI · ⛔ parked

---

## Phase 0 — Quick wins (optional, can go first) — size S
Tester-facing fixes that don't depend on the big refactors. Pull forward if we want immediate polish.
- 🐛 Home "No crosses yet" shows even when crosses exist.
- 🐛 Home "In flower → View all" does nothing.
- 🎨 Quick-Note type dropdown widened.
- 🎨 Record type label "Variety" → "Named Variety".
- ✨ Add-Iris: Breeder autocomplete; unique-name guard ("Iris name already exists", case-insensitive).
- **Migration:** none (rebloom field comes in Phase 6; unique-name is app-level + a DB index optional).
- **Depends on:** nothing.
- **Test:** create crosses → home reflects them; click In-flower View all → lands on a list;
  add duplicate name → blocked; long note types fit.

---

## Phase 1 — Region & units foundation 🧱 — size M
Do early so every new date/length field built afterwards uses one standard (avoids rework).
- ✨ Settings → Region switch: **UK** (dd-mm-yyyy, cm) / **US** (mm-dd-yyyy, inches).
- Canonical storage: **ISO dates** + **whole cm** internally; display layer formats per region.
- Length shown rounded to **nearest whole unit**; switch shows the conversion note.
- Region also selects the evaluation rubric (consumed in Phase 3).
- Replaces the existing cm/in toggle and clears the code-review "date standardisation" debt.
- **Migration (005):** normalise existing stored dates to ISO; ensure heights stored as whole cm.
- **Depends on:** nothing.
- **Test:** toggle UK/US → dates & lengths reformat everywhere; note appears; existing records
  still read correctly; no value drift on repeated toggling.

---

## Phase 2 — Annual records & the "primary" panel 🧱 — size L
The new backbone: per-year measurements + a derived averaged summary.
- 🧱 Annual record per plant per year: first/last bloom date, stems per plant, bud count per stem,
  branch count, plant height, bloom height × width. **All optional.**
- ✨ Record Flowering reworked to capture these per year.
- ✨ Iris record: **primary averaged panel** (averages across years) shown at top.
- ✨ Flowering period (days) per year + overall average.
- **Migration (006):** new `annual_records` table (extends/migrates current `flowering_records`).
- **Depends on:** Phase 1 (dates/lengths).
- **Test:** add two years of data → each year stored; primary panel shows correct averages;
  flowering-period days compute correctly; blank cells allowed.

---

## Phase 3 — Evaluation (BIS scorecard) 🧱 — size L
- 🧱 Rubric-driven scorecard. UK/BIS rubric (100 pts, the 9 categories) shipped as data.
- ✨ One scorecard per plant per year; each category capped at its max; entry restricted to ≤ max;
  **all-or-nothing** (complete card or no data); auto-summed Total /100 + Notes.
- ✨ Iris record: total score per year + overall average.
- 🌍 Engine is region-aware so a non-UK rubric is later "just data" (see Parked).
- **Migration (007):** new evaluation schema (categories/scores by rubric). Decide handling of any
  existing old-format evaluations (likely cleared on dev; staging is empty).
- **Depends on:** Phase 1 (region → rubric).
- **Test:** score a plant → total sums correctly; over-max blocked; partial card rejected;
  per-year + average display correct.

---

## Phase 4 — Seedlings: identity, naming & status 🧱 — size M/L
- 🧱 Permanent seedling number/code; optional registered name (becomes dominant label, number
  retained & shown secondarily).
- ✨ Outcome status: Discarded / Growing on / Retained / Registered (new seedlings = "Growing on").
- ✨ Discarded → shown only in a Collection "Discarded" section.
- ✨ Status box under photo: "Named variety" for varieties; outcome status for seedlings.
- ✨ Seedlings can enter descriptive fields (colour etc.) like named varieties.
- **Migration (008):** add `seedling_number`, `registered_name`, `outcome_status` to irises.
- **Depends on:** nothing hard, but best after Phase 3 (so cross summaries in Phase 5 have both
  scores and statuses).
- **Test:** name a seedling → name leads, number retained; set Discarded → moves to Discarded
  section, hidden elsewhere; seedling colour entry works.

---

## Phase 5 — Crosses: manage, lots & summaries 🧱 — size L
- ✨ Edit a cross; ✨ delete a cross; ✨ search on Crosses screen.
- 🧱 Seed lots per cross: treatment + sowing date + germination date + seed/germinated counts + %.
- ✨ Carry harvest/sowing/germination dates from the cross (lot) onto seedling records.
- ✨ Cross summary (excluding unevaluated): avg total eval score · avg flowering period ·
  counts by outcome (Retained/Discarded/Registered/Growing on — **discarded still counted**).
- **Migration (009):** new `seed_lots` table under crosses.
- **Depends on:** Phase 2 (flowering period), Phase 3 (eval scores), Phase 4 (statuses).
- **Test:** edit/delete a cross; add 2 lots with different treatments → germination % per lot;
  summary maths correct and includes discarded in counts.

---

## Phase 6 — Collection, Add-Iris & Home polish 🧱 — size M
- 🧱 Rebloom yes/no field on plants.
- ✨ Add-Iris: Rebloom toggle (and, if not done in Phase 0, breeder autocomplete + unique-name + rename).
- ✨ Collection: alphabetical sort within each heading; filter by All / Classification / Colour type
  / Breeder / Rebloom; sort by total eval score / each element / flowering period.
- ✨ "Now flowering" rule everywhere: first-flower date this year AND no last-flower date.
- **Migration (010):** add `rebloom` to irises.
- **Depends on:** Phase 2 (flowering period sort), Phase 3 (eval sort), Phase 4 (status filters).
- **Test:** filters/sorts behave; rebloom filter works; now-flowering list matches the rule.

---

## Phase 7 — Locations & Garden builder 🧱 — size L
(The old "Batch 2", now shaped by multi-location + bed-grid.)
- 🧱 A plant can have **multiple current locations** (each optional grid ref); reassign =
  add/remove/overwrite. No history.
- ✨ Bed setup: choose rows × max plants per row → generates a named grid/table (with his help text).
- ✨ Reassign a plant to a grid cell / location.
- **Migration (011):** `plant_locations` join table; bed grid (rows/cols) on locations.
- **Depends on:** nothing hard (can slot anywhere after Phase 1); placed late as it's self-contained.
- **Test:** put one plant in two locations; move it; bed grid generates and names correctly.

---

## Phase 8 — Photos ⛔ — size M (blocked)
- Max ~4 per plant; resize/compress on add; square display everywhere.
- **Blocked on:** photo storage backend choice (R2 / Images / Bunny).

---

## Parked
- **Non-UK evaluation rubric** — extends Phase 3 when we have that region's marking form.
- **Photos (Phase 8)** — until storage backend chosen.

---

## Suggested order
**0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**, with **8** whenever storage is picked.
(0 is optional/parallel; 1 is the foundation; 2–5 are the interlocking core; 6–7 finish the surface.)
