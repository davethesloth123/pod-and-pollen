# Pod & Pollen — Handover

**For a developer who knows nothing about this project.** Read this first; it links to everything
else.

Prepared against commit `3aa0c54` (branch `dev`), after a full inspection of the repository —
all 54 source files, 7 migrations, 51 commits of history, both planning documents, the design
transcripts, and the original PDF project brief.

---

## 1. Product summary

Pod & Pollen is a **specialist record-keeping platform for iris growers and hybridisers**. It is
not a generic gardening app — there are no watering reminders, no care tips and no plant
encyclopedia.

It replaces the fragmented spreadsheets, paper notebooks and loose photo folders that serious
iris breeders use to run a breeding programme that spans years. Its value is not in any single
record but in the **links between records**: that this seedling came from that cross, which used
those two parents, and which has now flowered for three consecutive seasons with these
measurements.

Everything — the database and the interface — is organised around the real iris breeding
lifecycle:

```
plant → parentage → cross → seed pod → seed batch → germination
      → seedling → first flower → evaluation → retain / discard / name / register
```

Full detail: [`docs/handover/PRODUCT_VISION.md`](./docs/handover/PRODUCT_VISION.md)

## 2. Core user

The primary user is **an experienced iris grower and hybridiser** — the project owner's father —
who reviews each release against real-world garden use. His written feedback (
`docs/feedback-brief-2026-06-25.md`) is the most reliable requirements document in the
repository.

Beyond him, four audiences are named in the founding brief: serious hybridisers, collectors who
do not breed heavily, **older or less technical growers** (explicitly a key usability group), and
— later — societies/clubs and US growers.

The usage pattern that should drive every design decision: **most data entry happens outdoors,
on a phone, standing in front of a plant, often with poor or no mobile signal**, concentrated
into a few intense weeks of bloom season.

## 3. Product philosophy

1. **Nothing is ever overwritten.** One flowering record per plant per year, forever. Multi-year
   performance is what a hybridiser actually judges on.
2. **Records are connected, not columns.** Parentage, crosses, seed batches and seedlings are
   linked objects that can be traversed in both directions.
3. **Specialist depth, hidden until needed.** BIS-registration-grade detail must be available,
   but the app must not feel like a database. The governing rule from the brief: *"If a user
   wants to add one photo and one quick note while standing in the garden, they should be able to
   do it in a few taps without seeing the advanced database structure."*
4. **Private by default.** Breeding work is protected; there is no sharing model.
5. **Never lock the user in.** Import and export are trust features, not conveniences.
6. **Iris-specific now**, with a lifecycle model that could later support other hybridised
   plants — but **not at the cost of weakening the iris product**.

## 4. Major features

| Area | State |
|---|---|
| Iris records — varieties and seedlings, 14 classifications, 12 colour patterns, BIS-style colour description, breeder, rebloom, fragrance | ✅ Works |
| Parentage — pod/pollen parents, traversable to parents **and** children, surviving renames | ✅ Works (the strongest feature) |
| **Annual flowering records** — per plant per year, with measurements, duration, and an averaged summary panel | ✅ Works (the best-built feature) |
| BIS 100-point evaluation scorecard — capped, all-or-nothing, per year, editable | ✅ Works |
| Crosses and seed batches — pollination records, germination tracking, bulk seedling creation | 🟡 Partial |
| Garden — locations, a drag-and-resize visual bed plan, plant assignment | 🟡 Partial |
| Home dashboard — 10 personalisable widgets, bloom calendar, search with facets | ✅ Works |
| Region & units — UK (`dd-mm-yyyy`, cm) / US (`mm-dd-yyyy`, inches) | ✅ Display works |
| **Photos** | ❌ **Not implemented — the UI pretends otherwise** |
| **Import / Export** | ❌ **Not implemented** (an import wizard exists but is a façade, and unreachable) |
| **Offline / PWA** | ❌ **Not implemented — the UI claims changes sync** |
| Help / glossary / onboarding guidance | ❌ Not implemented |
| Seedling identity, naming and outcome status | ❌ Not implemented (largest agreed gap) |

Full inventory: [`docs/handover/FEATURE_SPECIFICATION.md`](./docs/handover/FEATURE_SPECIFICATION.md)
· Status matrix: [`docs/handover/CURRENT_IMPLEMENTATION.md`](./docs/handover/CURRENT_IMPLEMENTATION.md)

## 5. Current implementation state

A **working, genuinely useful application** for its core purpose — recording plants, parentage,
crosses, annual flowering data and evaluations. Roughly 11,900 lines of TypeScript across 54
files, with a small, clean dependency tree.

Build and type checking pass. **There are no tests, no CI, and the lint script does not run.**

The build plan from June got through phases 0–3 (quick wins, region & units, annual records, BIS
evaluation) and stopped. Phases 4–7 — seedling identity, cross management, collection filters,
the garden grid — are outstanding, and photos are blocked on a decision.

The most important thing to understand about the current state: **three features display success
messages for work they did not do.** Photos, import and offline sync all confirm saves that never
happened. For a product whose entire value is trustworthy record-keeping, that is the defining
problem in the repository today.

## 6. Technology stack

- **Next.js 15.5.18** (App Router), **React 19.2.6**, **TypeScript 5.9.3** (`strict`)
- **Supabase** — Postgres, Auth (email/password), and Storage (declared but never set up)
- **No** CSS framework, state library, ORM, form library, test runner or component library.
  Styling is inline React style objects over CSS custom properties.
- Hosted on **Vercel** (by inference — no config is committed)
- 5 runtime dependencies, 6 dev dependencies. Deliberately minimal.

**The single most important architectural fact:** the application has **only two routes** — `/`
and `/auth`. Everything a user perceives as a page is a component swapped by React state inside
`AppShell`. So there are no deep links, the browser Back button exits the app, and a refresh
returns you to Home.

Detail: [`docs/handover/TECHNICAL_ARCHITECTURE.md`](./docs/handover/TECHNICAL_ARCHITECTURE.md)

## 7. Data architecture

Ten Postgres tables, all with Row Level Security, all owned by `auth.users`:

`profiles` · `user_settings`* · `locations` · `irises` · `crosses` · `seed_batches` · `notes` ·
`photos`* · `flowering_records` · `evaluations`
*\* exist in the schema but are never read or written by any code.*

`irises` is the centre — it holds both named varieties and seedlings, self-references for pod and
pollen parents, and links out to locations, crosses and seed batches.

Two design choices worth knowing immediately:
- **Canonical storage is region-independent**: ISO dates and **whole centimetres**, always.
  Region changes display only.
- **Parentage is stored twice on purpose** — as a name *and* as a foreign key — because a parent
  may be a plant the user does not own. Ids are healed from names at load, and renames cascade.

Detail, including migration and integrity risks:
[`docs/handover/DATA_MODEL.md`](./docs/handover/DATA_MODEL.md)

## 8. Major known problems

The five that matter most (34 are catalogued in full):

| # | Problem | Severity |
|---|---|---|
| **K-01** | The offline banner says *"Changes will sync later"* and *"All changes synced"*. **There is no sync.** A grower recording observations without signal loses everything, having been told twice it was saved. | 🔴 Critical |
| **K-02** | "Save Photo" shows *"photo added"* and saves nothing. There is no file input, no upload, no database write. | 🔴 Critical |
| **K-03** | The import wizard never parses the file, always previews five hardcoded rows, and offers a destructive "replace" mode. Harmless only because it is unreachable. | 🔴 Critical (latent) |
| **K-04** | Tapping a plant from a garden location opens a **blank screen** — `go('irisDetail')` has no matching case. | 🟠 High |
| **K-05** | Editing any record while in US region silently loses precision: 95 cm → 94 cm, and further on each edit. | 🟠 High |

Full catalogue: [`docs/handover/KNOWN_ISSUES.md`](./docs/handover/KNOWN_ISSUES.md)

## 9. Highest-risk areas

1. **The rename cascade** (`src/lib/data-context.tsx:280–318`). Renaming a plant issues a
   sequential, non-transactional update to every child and every cross. A part-way failure leaves
   lineage inconsistent and the user is still told "updated". The most dangerous code in the
   repository.
2. **Hard deletes with no recovery.** Every delete is permanent, behind one extra click, on
   irreplaceable multi-year breeding records. No soft delete, no trash, no audit log.
3. **The single-location assumption.** The agreed requirement is *multiple current locations per
   plant*. It is baked into the schema and every read path, and gets more expensive to change
   with every record added.
4. **Free-text grid references.** The specified bed grid cannot be built on an unvalidated
   string; existing values will need parsing or discarding.
5. **RLS has never been verified.** The entire authorisation model is Postgres policies, and no
   test has ever confirmed that user A cannot read user B's data.
6. **Hand-written DB row types** that nothing checks against the migrations — a column rename
   compiles cleanly and fails in production.
7. **Hand-applied migrations** with no record of what ran where.

Full assessment: [`docs/handover/TECH_DEBT.md`](./docs/handover/TECH_DEBT.md)

## 10. Current development priorities

**Phase 1 — Stabilise.** Stop the application claiming things that are not true (K-01, K-02,
K-03 and the misleading copy in Settings, Garden and onboarding); fix the outright defects
(K-04, K-05, K-06, K-07); add database constraints and soft deletes; get lint, CI and a first
tier of unit tests working.

**Phase 2 — Complete the iris MVP.** The agreed, unbuilt work: seedling identity and outcome
status; cross editing, search, seed lots and summaries; collection filters and the date-based
flowering rule; multiple locations and the bed grid. Photos when the storage decision is
confirmed.

**Phase 3 — Testing and early external users.** Help section and glossary, export and import,
PWA readiness, offline drafts, accessibility.

Phases 4 (commercialisation) and 5 (multi-plant) are long-term and gated on business decisions.

Full roadmap, with agreed items separated from recommendations:
[`docs/handover/ROADMAP.md`](./docs/handover/ROADMAP.md)

## 11. How to run it

```bash
git clone https://github.com/davethesloth123/pod-and-pollen
cd pod-and-pollen
npm ci

cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from your Supabase project → Settings → API

# In the Supabase SQL editor, run supabase/migrations/001…007 in order.
# Enable the email/password auth provider.

npm run dev            # http://localhost:3000
npx tsc --noEmit       # type check — the only working automated check
npm run build          # production build
```

`npm run lint` will **not** work until an ESLint config is added. There is no test command.

Detail: [`docs/handover/ENVIRONMENT_AND_SERVICES.md`](./docs/handover/ENVIRONMENT_AND_SERVICES.md)

## 12. Where to find deeper documentation

All in [`docs/handover/`](./docs/handover/) — see its
[README](./docs/handover/README.md) for a guide. In brief: `PRODUCT_VISION`,
`FEATURE_SPECIFICATION`, `USER_FLOWS`, `CURRENT_IMPLEMENTATION`, `TECHNICAL_ARCHITECTURE`,
`DATA_MODEL`, `ENVIRONMENT_AND_SERVICES`, `TESTING_AND_QA`, `KNOWN_ISSUES`, `TECH_DEBT`,
`ROADMAP`.

[`AGENTS.md`](./AGENTS.md) is the short, navigational version for a coding agent.

Original sources, still authoritative and worth reading directly:
- `docs/feedback-brief-2026-06-25.md` — the primary user's QC feedback, with decisions resolved
- `docs/build-plan-2026-06-25.md` — the phased plan that produced the current state
- `project/uploads/My_Iris_Tracker_Project_Brief_V2_1.pdf` — the founding product brief
- `chats/chat1.md`–`chat5.md` — the design conversations behind the UI

## 13. Important unresolved product decisions

These block or shape real work and **cannot be answered from the repository**. Ask the project
owner.

1. **Photo storage backend.** ⛔ Blocks the entire photo feature. **The two source documents
   disagree**: the founding brief specifies private Supabase Storage buckets (and migration 001
   already contains the bucket definition, commented out), while the June feedback brief parks
   the feature on a choice between Cloudflare R2 / Images / Bunny. This must be settled first.
2. **Non-UK evaluation rubric.** ⛔ Blocks US-region evaluation. Needs that region's official
   judges' marking form. The engine is already data-driven and ready for it.
3. **The unit-change prompt.** The current requirement is to *ask* whether existing measurements
   should be converted to the nearest whole number or left numerically unchanged. Option 2 means
   rewriting stored values (95 cm → 241 cm) or storing a per-record unit — a real data decision
   that needs making before it is built.
4. **Date separator** — `dd-mm-yyyy` (what the code and the feedback brief use) or `dd/mm/yyyy`?
5. **Environment topology.** Which Vercel project, which Supabase projects for staging and
   production, which branch deploys where, and whether backups are enabled. None of this is
   discoverable from the repository.
6. **Supabase email confirmation** — on or off? If on, sign-up fails silently today.
7. **Sharing** (private → selected-user → public) — a large specified feature area with no
   schema. Does it precede commercialisation?
8. **Commercialisation.** Nothing has been agreed: not whether to charge, not the plan structure,
   not pricing (the brief records an explicitly untested ~$49 / $79–99 per year hypothesis), and
   not a payment provider.

## 14. Recommended first steps for the incoming developer

**Day one — orient.**
1. Read this document, then `docs/feedback-brief-2026-06-25.md`. That brief is where the domain
   knowledge lives and it is short.
2. Get the app running locally against your own Supabase project (§11).
3. Walk the manual smoke path in
   [`TESTING_AND_QA.md §7`](./docs/handover/TESTING_AND_QA.md). Add a plant, record two years of
   flowering, evaluate it, create a cross, add seedlings. **You need to feel the lifecycle to
   understand the product.**
4. Deliberately reproduce K-01, K-02 and K-04 so you understand the trust problem first-hand.

**Week one — earn a safety net before changing anything substantial.**
5. Add an ESLint config and a `typecheck` script (K-08); add a CI workflow running install,
   typecheck, lint and build.
6. Add a test runner and Tier 1 unit tests for `lib/format.ts`, `lib/rubric.ts` and
   `lib/data/index.ts` — pure functions, no infrastructure, highest value per hour. Include the
   unit round-trip test that guards K-05.
7. Fix K-04 (one word) and introduce a `View` union type so it cannot recur.

**Then — Phase 1a, in this order.**
8. Make the connectivity banner tell the truth (K-01). Nothing else in the codebase costs users
   real data today.
9. Neutralise the photo and import façades (K-02, K-03).
10. Correct the misleading copy in Settings, Garden and onboarding (K-10 through K-13).
11. Fix the unit drift (K-05) and move preferences to `user_settings` (K-07).

**Before you touch the schema**, read
[`DATA_MODEL.md §14`](./docs/handover/DATA_MODEL.md) — the multi-location and grid changes get
more expensive with every record added, so if they are coming, they should come early.

**Ask the project owner the §13 questions early.** Two of them block whole features, and one of
them is a contradiction between the project's own source documents.

---

### A note on the provenance of this handover

This documentation was written by a coding agent with **no memory of the earlier development
sessions**. Everything here was reconstructed from primary sources committed to this repository:
the code, the migrations, the git history, the two planning documents, the design transcripts and
the PDF brief. Build, typecheck, lint and audit were executed and their real results recorded.

The practical consequence: **anything agreed verbally and never written down is not in this
documentation.** Points marked ❓ NEEDS VERIFICATION are where that gap is known — §13 lists the
important ones. Please correct anything here that contradicts a decision made outside the
repository.
