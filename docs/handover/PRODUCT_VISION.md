# Pod & Pollen — Product Vision

> **Status of this document:** Product intent, reconstructed from primary sources in this
> repository. It describes what Pod & Pollen is *meant to be*, not what is built.
> For what actually exists, see [CURRENT_IMPLEMENTATION.md](./CURRENT_IMPLEMENTATION.md).

**Primary sources for this document**
- `project/uploads/My_Iris_Tracker_Project_Brief_V2_1.pdf` — the original product brief
  (V2.1, 30 May 2026). The most authoritative statement of vision. *(Text is embedded with
  subset fonts; see [README.md](./README.md) for how it was extracted.)*
- `docs/feedback-brief-2026-06-25.md` — QC feedback from the primary user (an experienced
  iris grower and hybridiser), with resolved design decisions.
- `docs/build-plan-2026-06-25.md` — phased plan derived from that feedback.
- `chats/chat1.md`–`chat5.md` — the design-tool conversations that produced the UI.

---

## 1. What the application is

**Pod & Pollen is a specialist record-keeping platform for iris growers and hybridisers.**

It is emphatically **not** a generic gardening app, a plant-care reminder app, or a
plant-identification app. It has no watering schedules, no care tips, no plant encyclopedia.

What it *is* is a structured replacement for the fragmented spreadsheets, paper notebooks and
loose photo folders that serious iris breeders currently use to run a multi-year breeding
programme. The founding brief states the core problem directly:

> "The app should connect records that are currently separate: plant records, parent photos,
> crosses, seed batches, germination results, seedlings, first flowers, evaluation notes, wants
> lists, and future cross ideas. **This connected structure is where the app becomes more
> valuable than spreadsheets.**"

The unit of value is not the individual record. It is the **link between records** — that this
seedling came from that cross, which used those two parents, whose pollen was collected on that
date, and which has now flowered for three consecutive seasons with these measurements.

### The lifecycle model

The entire product — database and interface alike — is organised around the real iris breeding
lifecycle, not around a flat inventory list:

```
Variety or plant record
   └─> parentage (pod parent × pollen parent)
        └─> cross (pollination event)
             └─> seed pod
                  └─> seed batch (treatment, sowing)
                       └─> germination
                            └─> seedling (becomes its own plant record)
                                 └─> first flower
                                      └─> evaluation (scored, annually)
                                           └─> outcome: retain · discard · name · register
```

A casual user may only ever create plant records and add photos. A serious hybridiser opens the
advanced modules as they are needed. The lifecycle is always present in the data model even when
it is hidden in the interface.

---

## 2. Who it is for

The brief identifies six user types, in rough order of priority:

| User type | Who | Core need |
|---|---|---|
| **Primary early user** | The project owner's father, plus close private testers | A better replacement for spreadsheets and paper notes, usable on a phone or tablet **in the garden** |
| **Serious iris hybridiser** | Breeders, experienced growers | Cross records, parentage, seed development, seedling evaluation, photos, long-term history |
| **Collector / enthusiast** | Growers who do not breed heavily | Inventory, photos, locations, flowering records, wants list, easy search |
| **Older or less technical user** | *Explicitly called out as a key usability group* | Simple screens, clear labels, big buttons, minimal required fields, plain-English help |
| **Future society or club user** | Possible later market | Shared records, trial notes, public galleries, group administration |
| **Future US user** | Potential larger market | Region settings, US units and date formats, US terminology, links to AIS resources |

The first four are current. The last two shape architecture but are not being built.

---

## 3. The problems it solves

1. **Records are fragmented.** A grower's breeding programme lives across a hybridisation
   spreadsheet, a plant inventory, a phone camera roll and a paper notebook. Nothing joins up.
2. **Parentage is unstructured.** Pod and pollen parents are free text in a spreadsheet cell, so
   they cannot be traversed. You cannot ask "show me every seedling descended from this variety."
3. **History is destructively overwritten.** Spreadsheets tend to hold *one* "first flowered"
   date. Each new season overwrites the last, so multi-year performance — the thing a breeder
   actually judges on — is lost.
4. **Evaluation is ad hoc.** Assessment against the British Iris Society judges' marking form
   happens on paper, if at all, and is not comparable across years or seedlings.
5. **Seed development is invisible.** Which treatment germinated better? Which cross produced
   the most viable seedlings? The data exists but is not analysable.
6. **The garden itself is not mapped.** Which bed is this plant in? Where exactly? Growers use
   plant labels that fade and rot.

---

## 4. Why it exists

The founding brief is explicit that the first version is a private tool built for one
knowledgeable user — but that the architecture must be multi-user, owned, and secured from day
one so it can become a product:

> "Start with one excellent private workflow for Dad, but structure the system as a multi-user
> platform from day one."

That tension — build for one person, architect for many — is the defining constraint on almost
every technical decision in the repository. Row Level Security exists on every table from the
first migration even though there has only ever been a handful of users.

---

## 5. How a user is expected to use it across a growing season

Pod & Pollen is a **seasonal** application. Its usage pattern is not uniform through the year:

**Late winter / early spring — preparation**
- Review last season's evaluations and decide what to retain or discard.
- Sow seed batches from last year's crosses; record treatment and sowing dates.
- Plan future crosses (*designed, not built*).

**Spring — bloom season, the peak of activity**
- Walk the garden daily. Record **first flower dates** as plants come into bloom.
- Take photos of standards, falls, whole plant, stems.
- Record annual measurements: stems per plant, bud count per stem, branch count, plant height,
  bloom height × width.
- Make crosses: record pod parent, pollen parent, date, pod number, goal.
- Score seedlings against the BIS judges' scorecard.
- Record **last flower dates** as blooms finish, closing out each annual record.

**Summer — seed development**
- Harvest seed pods; record harvest date and seed counts.
- Apply and record seed treatments.

**Autumn / winter — consolidation**
- Record germination results.
- Move and divide plants; reassign garden locations.
- Review the season's data: average flowering periods, evaluation totals, which crosses worked.

The critical implication: **most data entry happens outdoors, on a phone, standing in front of a
plant, often with poor or no mobile signal.** This is why offline capability is a genuine product
requirement rather than a nice-to-have (see
[FEATURE_SPECIFICATION.md § Offline functionality](./FEATURE_SPECIFICATION.md#offline-functionality)).

---

## 6. The record types and their roles

### Plant records (irises)
The central everyday object. Two kinds:
- **Named Variety** — an established, registered cultivar. Has a breeder, a year of release, a
  classification, a colour type, a full colour description.
- **Seedling** — an individual plant grown from a cross the user made. Identified by a seedling
  code, linked to its cross and seed batch, and carried through evaluation to an outcome.

The intent is that a seedling which earns a registered name becomes, in effect, a named variety
**while retaining its seedling number** — the number is permanent provenance and must never be
lost.

### Garden records (locations and grid references)
Where things physically grow. Beds, borders, trial areas, greenhouses, holding areas, pots. The
intent is a *visual garden plan* the user builds themselves, plus a **grid** within each bed
(rows × plants per row) so an individual plant occupies a nameable cell. A plant may be split
from a clump and grown in more than one place at once, so a plant can have **multiple current
locations**.

### Flowering records
**The single most important design principle in the product: nothing is ever overwritten.**
There is one flowering record **per plant per year**, holding first bloom date, last bloom date
and that season's measurements. A derived "primary" panel on the plant record shows **averages
across all years**. This is what turns a plant record into evidence of performance — which is
what a hybridiser actually judges on.

### Breeding and hybridisation records (crosses, seed batches)
A cross records a pollination event: season, pod parent, pollen parent, date, pod number, goal
and notes. Real-world messiness must be supported: unknown pollen parent, bee-pollinated pods,
open pollination, complex parentage as free text, labels possibly switched.

Seed batches (intended: multiple **seed lots** per cross) track treatment, sowing, germination
and planting out, so that different treatments of the same cross can be compared.

### Lineage
Parentage links must be **structural, not textual** — traversable in both directions:
- Looking at a plant, see **both parents** and jump to their records.
- Looking at a plant, see **all children** — every seedling or variety that lists it as pod or
  pollen parent — and jump to theirs.

Renaming a plant must never break a breeding line. A future pedigree/genealogy view is
anticipated by the data structure but not required.

---

## 7. Current positioning: iris specialist

Pod & Pollen is deliberately, and for now exclusively, **an iris application**. The brief is
firm about why:

> "That focus is important because iris-specific language, parentage, classification, bloom
> descriptions, and registration-support fields create the value."

Concretely, the specialism shows up as:
- **Iris classifications** — MDB, SDB, IB, BB, MTB, TB, AB, Dutch Iris, SPU, SIB, JA, LA,
  *Iris reticulata*, *Iris laevigata*.
- **Iris colour patterns** — Self, Bicolour, Bitone, Reverse Bitone, Plicata, Luminata, Neglecta,
  Blend, Amoena, Broken, Line and Speckles, Space Age.
- **Iris flower anatomy** — standards, falls, beard, style arms are first-class fields.
- **The BIS judges' marking form** as the evaluation rubric.
- **AIS / BIS terminology** used correctly throughout (pod parent, pollen parent, remontant,
  introduced vs registered).

The product should link *out* to the American Iris Society Iris Wiki as the public reference
encyclopedia rather than trying to replicate it.

---

## 8. Long-term ambition: commercialisation

Commercial features are explicitly **not** part of the MVP, but the architecture is expected to
support them without a rebuild. From the brief:

- Tiered plans separating casual growers from serious breeders — a possible structure of free /
  hobby / breeder / club-society plans.
- An **early, untested price hypothesis** of around **$49/year** for ordinary growers and
  **$79–$99/year** for serious breeders — explicitly stated as needing validation with real
  users.
- Before charging anyone: privacy policy, terms, cookie policy, refund policy, billing terms,
  public content terms, and clear cancellation and data-export handling.
- A support/contact structure covering general questions, bug reports, feature suggestions,
  import help, billing, privacy requests and club enquiries.

> **These are recorded product intentions, not agreed commitments.** No pricing, plan structure
> or payment provider has been decided. Nothing in the codebase implements or anticipates
> billing. See [ROADMAP.md § Phase 4](./ROADMAP.md) — everything there is marked as a
> recommendation.

Prerequisites the brief attaches to commercialisation: separate staging and production
databases, automated backups, a photo backup strategy, account deletion, data export, audit
logging of destructive/sharing actions, and paid Vercel/Supabase plans.

---

## 9. Longer-term ambition: beyond irises

The lifecycle is genus-agnostic. The brief anticipates later support for other hybridised
plants — **roses** are named explicitly, and `src/lib/data/index.ts` already carries a
`PLANT_TYPES` list with Roses, Dahlias and "Other" marked unavailable.

The stated architectural principle:

> "Build the core as plant → parentage → cross → seed batch → germination → seedling →
> evaluation → selection. Then keep iris-specific fields modular, so other plant-specific
> versions could be explored later **without weakening the iris product now**."

The last clause is the governing constraint. Generalising the schema at the cost of the iris
experience would defeat the point of the product. See [ROADMAP.md § Phase 5](./ROADMAP.md).

---

## 10. The central design tension: specialist depth vs. accessibility

This is the hardest ongoing product problem, and it is called out repeatedly in both the brief
and the user's feedback.

The application must simultaneously:
- hold **BIS-registration-grade descriptive detail** (branch count, bud count, substance,
  distinctiveness, style-arm colour), and
- be usable by growers who are **older, less confident with software, and outdoors in the rain**.

The brief's resolution is progressive disclosure, expressed as a hard UX rule:

> "If a user wants to add one photo and one quick note while standing in the garden, they should
> be able to do it in a few taps **without seeing the advanced database structure**."

Supporting requirements: mobile-first design; large buttons and clear labels; **minimal required
fields**; advanced fields hidden until needed; guided multi-step workflows instead of long
intimidating forms; plain language rather than database language; error messages that say what
to do next; tablet-friendly layouts for users who prefer a larger display.

The user's later feedback reinforced this — for example, insisting that *every* cell on an
annual flowering record be optional, so a grower can record just the one date they actually
measured.

> **Note:** the current implementation sets `userScalable: false` and `maximumScale: 1` in
> `src/app/layout.tsx`, which prevents pinch-zoom. This directly conflicts with the older-user
> accessibility goal. See [TECH_DEBT.md](./TECH_DEBT.md).

---

## 11. Help and instruction: a first-class future requirement

The brief treats Help as a **product feature**, planned for the point where the app expands
beyond private testing. It is not required for the private MVP but must not be an afterthought:

- An in-app Help section that functions as a **practical instruction manual**.
- A getting-started guide for first-time users.
- Step-by-step articles: adding an iris, adding a photo, creating a cross, tracking seed
  batches, creating seedlings, using the wants list, planning future crosses.
- A **glossary** of iris and hybridising terms — pod parent, pollen parent, bee pod, seedling,
  standards, falls, beard, signal, style arms, classification, registered, introduced.
- **Contextual help icons on advanced fields.**
- A "still stuck" contact option beneath articles, a feature-request link, and a
  "Was this helpful?" prompt.

The user's feedback added a specific, concrete example of the kind of guidance needed — the
garden bed-setup help text, in their own words:

> "For each of your defined growing areas and the space available in each case; select the
> number of rows and the maximum number of plants per row that you wish to record. A table will
> be created accordingly and should be given an appropriate name."

**Nothing of the Help system is implemented.** There is no Help section, no glossary, no
contextual help, no feature-request route. The Settings screen has a "Send feedback" row that
raises a toast reading "Thanks!" and does nothing else.

---

## 12. Principles that should govern future development

Drawn from the brief's stated core principles, and worth treating as standing constraints:

1. Structure the system as a multi-user platform even while it serves one user.
2. Make everyday use simple, fast and mobile-friendly.
3. Keep advanced detail available, but do not force it into every screen.
4. Treat parentage, crosses, seed batches and seedlings as **connected records**, not
   spreadsheet columns.
5. Make photos part of the record structure, not an afterthought.
6. Protect private breeding work by default — private unless actively shared.
7. Support import and export so users never feel locked in.
8. Use AIS and BIS terminology where relevant, while keeping language clear for non-technical
   users.
9. Build Help and guidance before broader testing.
10. Keep the first public version iris-specific, even though the architecture could later
    support other plants.
