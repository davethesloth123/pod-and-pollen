# Pod & Pollen — Proposed Roadmap

> **Everything in this document is a recommendation.** It is derived from the current state of the
> code, the agreed items in `docs/feedback-brief-2026-06-25.md`, the unfinished phases of
> `docs/build-plan-2026-06-25.md`, and the founding brief.
>
> Items are tagged:
> - **[AGREED]** — explicitly confirmed by the project owner in a source document
> - **[SPECIFIED]** — described in the founding brief but not re-confirmed
> - **[RECOMMENDED]** — proposed here, based on the audit; **not agreed with anyone**
>
> **No commercial feature has been agreed.** Phase 4 is written entirely as recommendations, and
> nothing in it should be taken as a decision.

---

## Where the previous plan got to

`docs/build-plan-2026-06-25.md` defined phases 0–8. Verified against the code:

| Plan phase | Status |
|---|---|
| 0 — Quick wins | ✅ Complete |
| 1 — Region & units foundation | ✅ Complete (defects K-05, K-11 remain) |
| 2 — Annual records & averaged panel | ✅ Complete |
| 3 — BIS evaluation scorecard | ✅ Complete (defects K-06, K-15 remain) |
| **4 — Seedling identity, naming & status** | ❌ **Not started** |
| **5 — Crosses: manage, lots & summaries** | 🟡 Only *delete a cross* was done |
| **6 — Collection, Add-Iris & Home polish** | 🟡 Rebloom + sorts done; filters and the date rule not |
| **7 — Locations & Garden builder** | ❌ Not started |
| 8 — Photos | ⛔ Blocked on the storage-backend decision |

The roadmap below carries phases 4–8 forward and puts a stabilisation phase in front of them.

---

## Phase 1 — Stabilise the current application

**Goal:** stop the application from telling users things that are not true, and put a safety net
under the code before a new developer starts changing it.

**Rationale:** three features currently show success messages for work they did not do (photos,
import, offline sync). For an application whose entire value is trustworthy record-keeping, that
is the most urgent problem in the repository — ahead of any new feature.

### 1a. Stop the false assurances *(days, not weeks)*
- **[RECOMMENDED]** Fix the connectivity banner to state the truth, and disable saving while
  offline (**K-01**). *Highest priority item in this document.*
- **[RECOMMENDED]** Make Add Photo unavailable rather than showing "photo added" for a save that
  did not happen (**K-02**).
- **[RECOMMENDED]** Leave the Import screen unreachable, and add a comment saying why (**K-03**).
- **[RECOMMENDED]** Correct the Region help text, the "full planting plan" claim, and the
  onboarding promises about photos and export (**K-11, K-12, K-13**).
- **[RECOMMENDED]** Wire the Settings → Garden rows to the flows that already exist, or remove
  them (**K-10**).

### 1b. Fix outright defects
- **[RECOMMENDED]** `go('irisDetail')` → `'detail'` (**K-04**), and introduce a `View` union type
  so it cannot recur (**D-02**).
- **[RECOMMENDED]** Stop the unit round-trip drift (**K-05**) — the highest-value data-integrity
  fix.
- **[RECOMMENDED]** Show BIS totals on the cross detail instead of the dead legacy fields
  (**K-06**).
- **[RECOMMENDED]** Move onboarding, region and widget preferences into `user_settings`
  (**K-07, D-09**) — this also stops duplicate locations.
- **[RECOMMENDED]** Derive first-ever-flower from `MIN(first_date)` and delete the dead
  `Iris.firstFlower` (**K-09**).
- **[RECOMMENDED]** Group plants by `locationId`, never by location name (**K-16**).

### 1c. Data integrity
- **[RECOMMENDED]** `UNIQUE (iris_id, eval_year)` on evaluations (**K-15**), after de-duplicating
  any existing rows.
- **[RECOMMENDED]** `UNIQUE (user_id, lower(name))` on irises, matching the app-level rule.
- **[RECOMMENDED]** Make the rename cascade transactional — a Postgres function, so it cannot
  half-apply (**K-20**).
- **[RECOMMENDED]** Soft delete (`deleted_at`) for irises and crosses at minimum. These records
  are irreplaceable and one mis-tap destroys them (**D-08**).
- **[RECOMMENDED]** Stable cross codes that are not reused after deletion (**K-21**).

### 1d. Tooling and reliability
- **[RECOMMENDED]** Add `eslint.config.mjs`; fix what it finds (**K-08**).
- **[RECOMMENDED]** Add a `typecheck` script and a GitHub Actions workflow running install,
  typecheck, lint and build on pull requests (**D-04**).
- **[RECOMMENDED]** Add a test runner and **Tier 1** unit tests for `format.ts`, `rubric.ts` and
  `data/index.ts` — see [TESTING_AND_QA.md §6](./TESTING_AND_QA.md). The unit round-trip test is
  the regression guard for K-05.
- **[RECOMMENDED]** Add a React error boundary around the shell (**K-23**).
- **[RECOMMENDED]** `npm audit fix` for the `sharp`/`libvips` advisories (**K-33**).
- **[RECOMMENDED]** Generate Supabase types instead of hand-maintaining them (**D-05**).
- **[RECOMMENDED]** Correct `BACKLOG.md` and the stale comments (**K-34, D-24**).

**Exit criterion:** no screen claims to have done something it did not; CI is green on every PR;
the highest-risk pure logic is covered by tests.

---

## Phase 2 — Complete the iris MVP

**Goal:** finish what was already agreed with the primary user, so Pod & Pollen works as a
polished specialist iris application.

Everything here is **[AGREED]** — it comes from the feedback brief and the existing build plan.
Ordered by dependency.

### 2a. Seedling identity and outcome *(build-plan Phase 4 — the largest gap)*
- Permanent **seedling number/code**, separate from the display name.
- Optional **registered name** which becomes the dominant label **while the number is retained
  and shown secondarily**.
- **Outcome status**: Discarded · Growing on · Retained · Registered; new seedlings default to
  "Growing on".
- **Discarded section** in the Collection; discarded seedlings appear *only* there, but are
  **still counted** in cross summaries.
- Status box reads "Named variety" for varieties, outcome status for seedlings.
- Seedlings gain the same descriptive fields as varieties (colour type, colour description,
  height, fragrance, rebloom).

*Migration: `seedling_number`, `registered_name`, `outcome_status` on `irises`.*
*This blocks 2b's cross summaries and 2c's Discarded filter — do it first.*

### 2b. Crosses *(build-plan Phase 5)*
- **Edit** a cross.
- **Search** on the Crosses screen.
- **Multiple seed lots per cross** — each with treatment, sowing date, germination date, seed
  count, germinated count and percentage, so treatments can be compared. *(Confirmed as
  germination-tracking only: seedlings link to the **cross**, not to a lot.)*
- Carry harvest / sowing / germination dates from the cross onto seedling records.
- **Cross summary**, ignoring unevaluated seedlings: average total evaluation score, average
  flowering period, counts by outcome.

*Migration: a `seed_lots` table.*

### 2c. Collection and the flowering rule *(build-plan Phase 6)*
- **Filter** by classification, colour type, breeder and rebloom (they exist as sorts today).
- **Sort** by individual scoring element (e.g. Branching) and by flowering period.
- Apply the **"now flowering" date rule everywhere** — first-flower date this year **and** no
  last-flower date — replacing the status check in all seven read paths (**K-14**).

### 2d. Locations and the garden builder *(build-plan Phase 7)*
- **Multiple current locations** per plant, each with an optional grid reference; reassign =
  add / remove / overwrite; no history. *(This is the highest-cost migration in the product —
  do it before more data accumulates.)*
- **Bed setup**: choose rows × maximum plants per row → generate a named grid, using the owner's
  exact help text (recorded in [FEATURE_SPECIFICATION.md §C2](./FEATURE_SPECIFICATION.md)).
- Assign and move a plant between grid cells; show empty vs occupied.
- **[RECOMMENDED]** Finish the map editor: shape selection, and coordinates written on insert.

*Migration: a `plant_locations` join table; grid dimensions on `locations`.*

### 2e. Photos *(build-plan Phase 8)* ⛔ **BLOCKED**
- **Decision required first, and the sources disagree:** the founding brief specifies **private
  Supabase Storage buckets** (and migration 001 already contains the bucket definition,
  commented out); the feedback brief parks the feature on a choice between **Cloudflare R2 /
  Images / Bunny**. **Confirm which before any work starts.**
- Then: real upload from camera or library, client-side resize/compress, max ~4 per plant, square
  display everywhere, and the photo categories reconciled to one list.

**Exit criterion:** every agreed item in the 25 June feedback brief is either shipped or
explicitly deferred with the owner's agreement.

---

## Phase 3 — Testing and early external users

**Goal:** make the app safe and comprehensible for growers who are not the primary user and who
have no one to ask.

- **[SPECIFIED]** **Help section** — an in-app instruction manual: getting started; step-by-step
  articles for adding an iris, adding a photo, creating a cross, tracking seed batches, creating
  seedlings; a **glossary** of iris and hybridising terms (pod parent, pollen parent, bee pod,
  standards, falls, beard, signal, style arms, registered, introduced); **contextual help icons on
  advanced fields**; a "still stuck" contact; a feature-request link; "Was this helpful?".
- **[SPECIFIED]** **Export** — CSV, listed as an **MVP** feature in the founding brief and the
  thing that earns a user's trust with irreplaceable records. Arguably belongs in Phase 1.
- **[SPECIFIED]** **Import** — CSV/XLSX with column mapping and preview, built and tested against
  `seed/pod_and_pollen_seed_data.xlsx`. Essential for onboarding anyone with existing
  spreadsheets.
- **[RECOMMENDED]** **Onboarding improvements** — explain what a location is, what a grid
  reference is for, and what pod/pollen parent means; make claims match reality.
- **[SPECIFIED]** **PWA readiness** — a real `manifest.json`, a full icon set, installability
  (**K-28**). The founding brief has this as its Phase 3.
- **[SPECIFIED]** **Offline drafts** — the brief is deliberately cautious: *"let users save simple
  drafts if signal is poor, but do not overbuild full offline mode"*. Cache the shell, store
  drafts for the quick actions locally, and only then consider a full write queue. Sequenced
  analysis in [FEATURE_SPECIFICATION.md §F5](./FEATURE_SPECIFICATION.md).
- **[RECOMMENDED]** **Accessibility** — re-enable pinch-zoom, fix contrast, add focus styles, add
  ARIA to the custom controls, implement the "Text size" setting that already has a column
  (**D-18**). This directly serves the older-grower audience the brief names.
- **[RECOMMENDED]** **A real feedback route** — the "Send feedback" button currently discards
  input (**K-24**). Testers need to be able to report things.
- **[RECOMMENDED]** **Tier 2 and Tier 3 tests** before external users arrive.

**Exit criterion:** a grower who has never spoken to the developers can install the app, import
their spreadsheet, understand the vocabulary, and get their data back out.

---

## Phase 4 — Commercialisation readiness

> **Nothing in this phase has been agreed.** The founding brief §15 records early thinking, and
> everything below is a **[RECOMMENDED]** reading of what would need to be true first. No
> business decision should be inferred from it.

**Prerequisites the brief itself states:**
- **[SPECIFIED]** Separate local / staging / production databases before inviting wider testers.
- **[SPECIFIED]** Automated database backups and a photo backup strategy once real long-term data
  exists (CSV export is deemed sufficient only for the private MVP).
- **[SPECIFIED]** Account deletion, data export, and photo/record deletion.
- **[SPECIFIED]** Audit logging of sharing, deleting, importing, exporting and visibility
  changes.
- **[SPECIFIED]** Legal documents before charging anyone: privacy policy, terms, cookie policy,
  refund policy, billing terms, public content terms, data deletion policy.
- **[SPECIFIED]** A support/contact structure: general questions, bug reports, feature
  suggestions, import help, billing, privacy requests, club enquiries.
- **[SPECIFIED]** Paid Vercel and Supabase plans.

**Engineering work implied [RECOMMENDED]:**
- Error monitoring and uptime alerting — there is none today.
- Rate limiting and abuse protection on auth.
- An RLS isolation test suite — the security guarantee has **never been verified**.
- Self-host the fonts (GDPR, **D-20**).
- Performance work on the load-everything data strategy (**D-12**).
- Address the routing debt (**D-01**) — shareable links become a real requirement the moment
  there is more than one user.

**Product decisions that are open, not decided [RECOMMENDED to resolve, not to assume]:**
- Whether to charge at all, and when.
- Plan structure. The brief floats free / hobby / breeder / club-society.
- Pricing. The brief records an explicitly untested hypothesis of ~$49/year for growers and
  $79–$99/year for serious breeders, and says it must be validated with real users.
- Payment provider — none has been discussed.
- Whether **sharing** (brief Phase 5: private → selected-user → public, friend/follow
  connections, public pages) precedes commercialisation. It is a large feature area with no
  implementation and no schema.

**Exit criterion:** entirely a business decision, not an engineering one.

---

## Phase 5 — Multi-plant platform

> **[SPECIFIED]** as a long-term direction in the founding brief §16, with a hard constraint
> attached. Not scheduled, and should not begin before Phase 2 is complete.

**The governing constraint, in the brief's own words:**
> "Keep iris-specific fields modular, so other plant-specific versions could be explored later
> **without weakening the iris product now**."

**Target architecture:** a genus-agnostic core of
`plant → parentage → cross → seed batch → germination → seedling → evaluation → selection`,
with genus-specific attributes, vocabularies and rubrics layered on top.

**What is already anchored for it:**
- `PLANT_TYPES` in `src/lib/data/index.ts` lists Irises (available), Roses, Dahlias and Other
  (all "Planned").
- The onboarding "plant type" step exists, currently showing irises only (the future-plant teaser
  was deliberately removed, commit `07dfbad`).
- The rubric system is already data-driven and per-region, and generalises naturally to
  per-genus.
- The lifecycle model in `lifecycleFor()` is genus-agnostic in shape.

**What makes it genuinely hard [RECOMMENDED analysis]:**
- Iris-specific columns (`classification`, `color_type`, `color_standards`, `color_falls`,
  `color_beard`, `color_style_arms`, `rebloom`) sit **directly on the `irises` table**. Roses
  need different attributes entirely.
- Two plausible models, each with real costs: a `plant_type` discriminator with sparse
  genus-specific columns (simple, but the table sprawls), or an attribute/EAV model (flexible,
  but loses type safety, query simplicity and the specialist feel that *is* the product).
- Vocabularies — classification, colour pattern, evaluation rubric, judging body — are all
  per-genus. They are currently hardcoded in components (**D-06**), which must be fixed first
  regardless.
- The table is literally named `irises`, as are many types and components.

**Recommended sequencing:** do not start until Phase 2 is complete and the iris product is
genuinely finished. When it does start, begin with the vocabulary extraction (**D-06**) and the
rubric generalisation, both of which are useful on their own merits.

---

## Suggested order

**Phase 1 → Phase 2 → Phase 3**, with Phase 4 gated on a business decision and Phase 5 gated on
Phase 2 being genuinely finished.

Within Phase 2, dependency order matters: **2a (seedling identity) before 2b (cross summaries),
and 2d (locations) before more data accumulates.**

The single highest-value item in the whole document is **Phase 1a** — the application currently
confirms saves that did not happen, and no amount of new functionality outweighs that.
