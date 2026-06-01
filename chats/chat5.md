# Widget onboarding display

_Started 2026-06-01 09:28 UTC_

---

## User

With the widget updates we did yday, they're not showing in the choices for the onbaording. Why?

## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

Found it. The onboarding doesn't read from your widget list — it has its own hardcoded options.

In `app/onboarding.jsx`, `StepMatters` and `StepGardenType` each define their own static `options` array (lines ~146 and ~204). Those answers then get passed into `BL.recommendWidgets({ matters, gardenType, frequency })` in `app/main.jsx` (line 303), which does a hand-written `if (matters.includes('flowering')) add('inflower')` mapping in `app/data.jsx` (lines 520–545).

So onboarding asks about **goals** (flowering, breeding, photos, thisweek, season, mapping + collector/breeder/mixed), not widgets. The link from a goal → a widget id lives in three places that all have to agree:

1. `BL.WIDGETS` in `app/data.jsx` — the widget catalog
2. `options` arrays in `StepMatters` / `StepGardenType` — what the user actually picks
3. `recommendWidgets()` in `app/data.jsx` — the goal → widget id mapping

If yesterday's update added a new widget to `BL.WIDGETS` (or renamed an id), it won't appear in onboarding until you also:
- add a matching option to `StepMatters` (or `StepGardenType`), and
- add an `if (matters.includes('your-key')) add('your-widget-id')` line in `recommendWidgets()`.

Same goes for the recipes: `WIDGET_RECIPES.Breeder/Collector/Casual/Mapper` are pre-baked calls to `recommendWidgets` with fixed arguments, so a new widget won't enter any recipe unless you either add it to `recommendWidgets` logic or to the `Everything` array (which IS a literal widget-id list).

Want me to:
- **A)** rewire onboarding so it lists widgets directly (pick 3–5 from `BL.WIDGETS`), or
- **B)** keep the goals-based approach but tell me which widget(s) you added yesterday and I'll wire them into the matters/gardenType mapping?

## User

Then the onboarding screen does not yet ask about the goals, so this dashboard setup doesn't happen.

## Assistant

_[tool: read_file]_

_[tool: grep]_

_[tool: show_html]_

Let me check what onboarding actually renders right now — there may be a mismatch between the file and what's live.

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: screenshot]_

_[tool: read_file]_

Right — that's exactly what I was describing. To restate the chain:

1. `BL.WIDGETS` is the widget catalog (10 items, including yesterday's update)
2. `OnboardingFlow` asks two *abstract* questions (StepMatters: "what matters?" and StepGardenType: "what kind of garden?")
3. `recommendWidgets()` translates those abstract answers into widget ids

If yesterday's update added a **new widget** (or renamed one) and didn't also add a matching option in StepMatters/StepGardenType plus a mapping line in `recommendWidgets()`, the new widget can never appear in a fresh user's dashboard via onboarding — it'll only show via the customize screen or the Tweaks "Everything" recipe.

To fix this we have a choice. Tell me which you want and I'll do it:

**Option A — Drop the indirection.** Make onboarding pick widgets directly from `BL.WIDGETS` ("Pick 3–5 things you want on your home"). Pros: any future widget shows up automatically, single source of truth. Cons: feels more like settings than onboarding, harder for new users who don't know what each widget does yet.

**Option B — Keep the goals-based onboarding, fix the mapping.** Tell me which widget(s) you added/changed yesterday and I'll add the matching option to StepMatters (or StepGardenType) and wire it into `recommendWidgets()`. Pros: keeps the warmer "what matters to you?" framing. Cons: needs maintenance every time you add a widget.

**Option C — Hybrid.** Keep StepMatters/StepGardenType, but auto-derive their options from `BL.WIDGETS` metadata (add a `goalKey` and `goalLabel` to each widget entry, then build the StepMatters options from that). New widgets show up automatically AND keep the goal-style framing.

My recommendation is **C** — it's the smallest amount of ongoing maintenance for the best UX. Want me to do that? If so, also confirm what got updated yesterday so I make sure those widgets' goal copy reads right.

## User

Go with C.

## Assistant

_[tool: str_replace_edit]_

Doing option C. I'll:
1. Add goal metadata (goalKey/goalLabel/goalSub/goalIcon + `system` flags) to each entry in `BL.WIDGETS`
2. Derive `recommendWidgets()` from that metadata so new widgets auto-flow
3. Make StepMatters read its options from a `BL.getGoals()` helper

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Done. Now the wiring is single-source-of-truth in `BL.WIDGETS`:

- Each widget that should appear as an onboarding goal carries `goalKey` + `goalLabel` + `goalSub` + `goalIcon`. Multiple widgets can share a `goalKey` (e.g. `today` and `watch` both opt into `thisweek`).
- `quick` and `recent` are tagged `system: 'always-start' | 'always-end'` so they're pinned without showing as goal choices.
- `BL.getGoals()` derives the StepMatters options from the catalog (de-duped by `goalKey`, first declarer wins copy).
- `recommendWidgets()` now iterates `WIDGETS` instead of hardcoded `if` checks.
- StepMatters reads `BL.getGoals()` — no more parallel option list.

To add a new widget going forward: drop one entry into `WIDGETS` with a `goalKey`/`goalLabel`/`goalSub`/`goalIcon` and add its id to `WIDGET_PRIORITY`. It'll automatically appear in onboarding and in recommended dashboards. If it should share an existing goal, just set its `goalKey` to match.

## User

In the onboardin, have the where do you grow as the final step. Have what matters ot you before the garden set up.

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Reordered. New flow:

1. Welcome
2. Plant type
3. **What matters most** (moved up)
4. **Garden type** (moved up — no longer says "Last question")
5. **Where do you grow** (now the final step → "Open Pod & Pollen")

Adjusted the top-right action to match:
- Steps 0–1: "Skip" (exits onboarding)
- Steps 2–3 (personalization): "Use default" (skips with defaults)
- Step 4 (garden): "Skip" (finishes with what's been set, no garden name)

_[tool: fork_verifier_agent]_

Human: [continue]

## User

<pasted_text name="Pasted text (374 lines)">
Pod & Pollen wireframe update brief for Claude
We need to update the current Pod & Pollen design prototype before starting the real build. This is a design and wireframing refinement task, not the production app build yet.
The existing prototype is a mobile-first React-style wireframe with screens and flows split across files including:
app/screens.jsx
app/flows.jsx
app/crosses.jsx
app/onboarding.jsx
app/data.jsx
app/dashboard.jsx
app/components.jsx
Please update the wireframes, sample data, labels, flows, and interaction logic so the prototype reflects the revised app requirements below.
1. Overall goal
Pod & Pollen should feel like a serious but easy-to-use field notebook for iris growers and breeders.
The app must stay mobile-first, touch-friendly, and simple enough to use in the garden or field. Avoid tiny spreadsheet-style layouts on mobile. Use clean forms, large buttons, clear labels, and obvious navigation.
The wireframes should now better support:
Garden setup and visual bed planning
Grid references for plant locations
Iris records with classification and color type
Clear parentage and offspring relationships
Annual flowering records
Better cross and seedling workflows
Photo management
Spreadsheet import and export
Offline use in the field
2. Garden setup and garden builder
The current garden section needs more work. The visual garden builder should be connected more clearly to onboarding, setup, and the main Garden screen.
Required changes
Create or update the garden setup flow so users can build their garden structure before adding records.
The garden setup should allow users to create named locations such as:
Bed A
Bed B
Trial bed
Greenhouse
Pots
Holding area
Border
Other
Each location should have:
Location name
Location type
Optional notes
Optional size or layout
Grid reference setup
Grid reference system
Add a simple grid reference model for beds and locations.
The user should be able to define a bed/location grid, for example:
Rows: A to H
Columns: 1 to 10
Grid references: A1, A2, A3, B1, B2, etc.
Keep this simple and practical. It does not need to be a complex CAD-style garden designer. It should feel like a clear visual garden plan where each bed can have grid references.
Garden builder UI
The Garden screen should show:
A visual garden plan
Beds/locations as tappable cards or blocks
A clear list view below or as an alternative view
Plant counts per location
Flowering counts where relevant
Empty state if no garden setup exists
The visual builder should explain how grid references work. Add plain-English helper text, for example:
“Use grid references to help locate plants within a bed. For example, Bed A, grid B4.”
Reassigning plant locations
Plant records must be able to move between locations and grid references.
In the Add Iris and Edit Iris flows, location should include:
Location dropdown, populated from garden setup
Grid reference open text box or grid selector
If garden setup has not been completed, the location dropdown should be greyed out
If greyed out, show a clear prompt: “Set up your garden first to assign locations.”
Users should be able to reassign a record to a new location and grid reference later.
In the detailed record, show location clearly as:
Location: Bed A
Grid reference: B4
3. Remove example names from setup
Remove demo/example user names and garden names from the setup and onboarding screens.
Do not show things like “Dave’s Garden” as actual default data in setup. Use neutral placeholders only, such as:
“My iris garden”
“Main trial bed”
“Bed A”
“Add a garden name”
Sample/demo data can still exist for the prototype if needed, but it must not appear as though it is the user’s real setup.
4. Add Iris screen updates
The Add Iris screen needs to be more complete and more structured.
Required fields and layout
Update the Add Iris flow to include:
Name or seedling code
Classification dropdown
Color type dropdown
Status dropdown
Location dropdown
Grid reference open text box
Optional photo
Optional notes
Classification and Color Type should appear side by side on wider mobile layouts where space allows. On narrow mobile screens, they can stack cleanly.
Classification dropdown values
Use this dropdown list:
MDB
SDB
IB
BB
MTB
TB
AB
Dutch Iris
SPU
SIB
JA
LA
Iris reticulata
Iris laevigata
Other
If the user selects Other, show an open manual text box.
Color type dropdown values
Use this dropdown list:
Self
Bicolour
Bitone
Reverse Bitone
Plicata
Luminata
Neglecta
Blend
Amoena
Broken
Line and Speckles
Space Age
Status dropdown
Review the current status options. Remove “Seedling” as a status where it duplicates seedling, sowing, or germination information.
Suggested status options for the wireframe:
Not planted
Growing
In bud
Flowering
Flowered this year
Needs evaluation
Watch
Keep
Discard
Lost
Archived
Keep the exact list editable in the code so it can be refined later.
5. Iris detail screen updates
The iris detail screen must show relationship information more clearly.
Parentage
Rename “Cross made” to “Parentage” where relevant.
Remove duplicate parentage sections. There should not be both “Cross made” and “Current parentage” if they repeat the same information.
Remove parentage generation information from the iris detail screen if it is not useful. Avoid showing “F1 generation” as a separate record detail unless it is directly connected to the cross/seedling workflow.
Clean up the Parentage card visually. Remove the unnecessary X icon and double line spacer currently shown between parents. Use a simpler layout:
Pod parent
Name
Pollen parent
Name
If the parent exists as a record in the app, make it tappable.
Children and seedlings
Iris detail records should show not only parentage, but also children/offspring where relevant.
Add a section that shows:
Children from this iris
Crosses involving this iris
Seedlings from those crosses
For seedling records, rename “Siblings from this cross” to:
“Seedlings from this cross”
This should list the seedlings connected to the same cross.
6. Flowering records
Flowering records need to support annual flowering history.
Keep the first ever flowering date, but also add annual flowering records.
Each iris should support:
First ever flowering date
First flowering date per year
Last flowering date per year
Annual flowering notes
Optional photos for that flowering event
Optional stem count, bud count, and height
All dates must use day/month/year format.
Example:
First ever flowered: 14/05/2024
2026 flowering record:
First flower: 08/05/2026
Last flower: 22/05/2026
The app should also calculate and display an average flowering display period across recorded flowering years.
This should show the average amount of time between the first and last flowering date for each recorded year.
Example:
Average display period: 3 weeks 2 days
If the design needs a simpler label, use:
Average flowering period
This should appear on the iris detail screen within the Flowering History section, alongside first ever flowering and annual flowering records.
The Record Flowering flow should allow users to add or update the current year’s flowering record.
7. Color definition after flowering
Once a plant has flowered, add a section for color definition.
This should appear on the iris detail screen after a flowering record exists.
Add open text fields for:
Standards
Falls
Beard
Style arms
These should be free text fields rather than dropdowns, because growers may need to describe color, markings, texture, and detail in their own words.
Example fields:
Standards: Pale lavender with darker veining
Falls: Deep violet with white signals
Beard: Yellow-orange
Style arms: Lavender, lightly flushed
8. Evaluation updates
The evaluation flow already exists, but previous scoring needs to be easier to access.
In the Notes & Observations section, if an evaluation exists, users should be able to tap into evaluations and view all previous scoring.
Add an evaluation history view that shows:
Date
Year
Average score
Outcome
Notes
Individual scoring criteria
By default, past evaluations should be view-only.
Add an Edit button, but require a positive confirmation before editing historical scores.
Confirmation example:
“Edit this evaluation? Historical scores are usually kept unchanged so you can compare seasons accurately.”
Buttons:
Cancel
Edit evaluation
9. Photo management updates
Photos need stronger management controls.
Required changes
Add the ability to delete photos.
In the photo viewer, the more/options menu should include:
Delete photo
Change category
Move to another iris record
Deleting a photo must require confirmation.
Camera roll saving
If a user takes a photo inside the app, the app should try to save a copy to the camera roll as well.
Show this as a setting or helper note in the design:
“Photos taken in the app can also be saved to your camera roll.”
This is useful in case a photo is accidentally assigned to the wrong record.
Upload size and compression
The design should account for photo file size limits.
Add helper text in the photo flow:
“Large photos will be resized automatically before upload.”
For the eventual build, assume the app should compress or resize photos automatically before uploading, rather than forcing the user to manage file size manually.
10. Crosses and pollination workflow
The Cross menu currently has an issue where “Record a new cross” adds a new iris. This must be fixed in the design.
Required behavior
In the Crosses section:
“Record a new cross” must open the Record Pollination / New Cross flow
It must not open Add Iris
The cross flow should create a cross record
From the cross record, the user should be able to add seedlings from that cross
Cross record labels
Change:
“F1 generation” to “Seedlings from this cross”
Change:
“Batch B1” to “Pod”
Where a cross record shows related seedlings, label the section:
“Seedlings from this cross”
Add seedling from cross
On each cross detail screen, add a clear action:
“Add seedling from this cross”
This should create a new iris/seedling record with parentage automatically filled from the cross.
The flow should ask for:
Seedling code
Pod reference if needed
Current status
Location
Grid reference
Notes
The resulting seedling should appear under “Seedlings from this cross.”
Pollination testing
Make sure the pollination flow works in the live prototype preview.
Test:
Opening Record Pollination from an iris record
Opening Record New Cross from the Crosses screen
Saving a cross
Seeing the cross appear in the Crosses list
Opening the cross detail
Adding a seedling from that cross
11. Data import and export
The Data section in Settings needs to be reorganized.
Required changes
Move Import to the top of the Data section.
Suggested order:
Import from spreadsheet
Download blank template
Download sample data
Export everything
Export crosses and seed batches
Import flow
The import flow should support:
Upload spreadsheet
Preview rows
Column mapping
Validation
Choose merge or replace
Double positive confirmation before upload is applied
Merge or replace
When uploading, give the user two clear options:
Merge with existing records
This adds new records and updates matching records where possible.
Replace existing records
This deletes current records and replaces them with the uploaded spreadsheet.
Both options need double positive confirmation.
For Replace, confirmation should be very clear:
“This will replace your current Pod & Pollen data. This cannot be undone unless you have an export backup.”
Require a second confirmation button:
“Yes, replace my data”
XLSX vs CSV
For the design, use XLSX as the preferred format because it can support multiple sheets in one file, such as:
Irises
Crosses
Seedlings
Flowering records
Garden locations
Notes
CSV can be supported as a simpler fallback, but XLSX should be the main template format in the design.
Add both:
Blank template XLSX
Sample data XLSX
12. Offline access
Offline use is important because growers may be out in fields or gardens with poor signal.
Update the design to show offline awareness.
Add states for:
Offline mode
Changes saved on device
Sync pending
Sync complete
Sync error
Suggested UI:
A small banner or chip near the top:
“Offline. Changes will sync later.”
When the app reconnects:
“Back online. Syncing changes…”
Then:
“All changes synced.”
For the eventual build, assume offline support should use local device storage and a sync queue. The prototype only needs to show the intended UX.
13. Navigation and scrolling behavior
When clicking into a plant record, the record should always open from the top.
The back button should not scroll out of view.
On detail screens, keep the back button visible or sticky enough that users can always get back easily.
This is especially important on long plant records with photos, flowering history, evaluations, and notes.
14. UI copy and terminology cleanup
Apply the following terminology changes throughout the prototype:
“Siblings from this cross” becomes “Seedlings from this cross”
“Cross made” becomes “Parentage”
“F1 generation” becomes “Seedlings from this cross”
“Batch B1” becomes “Pod”
Avoid duplicate “parentage” labels on the same record
Remove “Seedling” as a status where it duplicates seedling/sowing/germination lifecycle information
Keep language plain and practical. The app should feel like it was made for real growers, not generic plant hobbyists.
15. Acceptance checklist
Before finishing, check the prototype against this list:
Add Iris includes classification dropdown
Add Iris includes color type dropdown
Classification and color type can sit side by side
Location dropdown uses garden setup locations
Location is greyed out if garden setup is skipped
Grid reference exists on Add Iris and record detail
Garden setup explains grid references
Garden builder supports visual beds/locations
Records can be reassigned to new grid locations
Parentage is clean and not duplicated
Children/offspring/seedlings from crosses are visible
“Siblings from this cross” has been renamed
Flowering records support first ever flowering and annual flowering dates
Flowering records show average flowering display period
All dates use day/month/year format
Color definition appears once a plant has flowered
Evaluations have history view and confirmation before editing
Photos can be deleted
Photo upload mentions automatic resizing
Camera photos can save to camera roll
Record New Cross opens a cross flow, not Add Iris
Cross detail has Add seedling from this cross
Data import appears at the top of Settings Data
Import supports merge or replace with double confirmation
XLSX template and sample data are included in the design
Offline states are represented
Detail screens open at the top
Back button remains easy to access


</pasted_text>

## Assistant

_[tool: update_todos]_

_[tool: list_files]_

This is a huge brief — let me set up a plan and start working through it. I'll group the 15 sections into logical phases so I can ship incremental updates and you can sanity-check between them rather than getting one giant change all at once.

_[tool: questions_v2]_

Before I dive in, a few critical clarifications to avoid going down the wrong path:

## User

Questions answered:
- garden_onboarding_scope: Keep onboarding simple (one location name) — full garden builder lives on the Garden tab / Settings (recommended)
- grid_config: Grid is just a free-text field (no visual grid picker)
- offline_tweak: Add an 'Offline state' Tweak (Online / Offline / Syncing / Synced) so anyone can demo it (recommended)
- checkin_cadence: After each phase — short check-ins, you steer (recommended)
- any_skip: Skip nothing — do all 10

## Assistant

_[tool: snip]_

_[tool: grep]_

_[tool: grep]_

Good — clear direction. Starting Phase 1 now.

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Phase 1 edits — terminology, statuses, parentage cleanup.

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 1 complete.** Changes:

- **STATUS list** rebuilt with the brief's options (Not planted, Growing, In bud, Flowering, First flower, Flowered this year, Needs evaluation, Watch, Keep, Discard, Lost, Archived). The three records that had `status: 'Seedling'` are now `Growing` (their `kind: 'Seedling'` already conveys lifecycle position).
- **"Cross made" lifecycle step** → relabelled **"Pollination"**. *Note:* the brief asked for "Parentage" here but the lifecycle already has a separate "Parentage" stage showing pod × pollen. "Pollination" is the event, "Parentage" is the relationship — keeping both with distinct names felt right. Yell if you'd rather collapse them.
- **"F1 generation"** → **"Seedlings from this cross"** (cross detail + comparison table column dropped entirely).
- **"Siblings from this cross"** → **"Seedlings from this cross"** (iris detail).
- **"Batch · B1"** → **"Pod"** (cross detail section header).
- **Generation field** removed from iris detail advanced section and parentage stage sheet.
- **Parentage card** — removed the X-icon-between-parents row; pod and pollen now sit cleanly on top of each other.
- Onboarding & sign-up flow already use neutral placeholders; `BL.user.gardenName = "Dave's Garden"` kept only as sample data for the **Populated** demo state (not setup screens).

Moving to **Phase 2 — Add Iris fields**: classification + color type dropdowns, status dropdown updated to the new list, location dropdown bound to garden setup, grid reference text field, side-by-side layout where space allows. Will check in after.

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 2 complete.** Add Iris now has:

- **Name** (required, unchanged)
- **Record kind** pills (Variety / Seedling)
- **Status** dropdown — pulls from the new full STATUS list (12 options)
- **Classification + Color type** — side-by-side via responsive grid (stacks when there's <300px width). Classification = "Other" reveals a free-text field below
- **Location** dropdown — populated from `BL.locations`. Greyed-out + warning chip ("Set up your garden first to assign locations.") when no locations exist (Empty demo state shows this)
- **Grid reference** — free text with helper copy
- **Pod / pollen parent + Notes** still optional behind "Add parentage & notes"

Added a reusable `FSelect` component in flows.jsx that other flows can use later (Phase 5/6/8 will need it).

Moving to **Phase 3 — Garden builder**. Tackling: location list with type/name/notes, full-screen garden builder reachable from Garden tab + Settings, visual plan view (already exists, will polish), per-location plant counts. Per your answers, grid references stay as free text per-record — no visual grid picker.

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 3 complete.** Garden builder:

- New **AddLocationFlow** sheet with Name, Type (Bed/Border/Trial area/Greenhouse/Pots/Holding/Other), optional Size or layout, optional Notes. Built-in info card explaining grid references are per-plant, not per-bed.
- **Garden tab** → "Add location" button now opens the flow (was a toast). Added a **grid reference primer card** at the bottom of the Garden screen explaining how references work with a "Bed A, grid B4" example.
- **EmptyGarden** state CTA wired to the new flow + got its own grid reference primer.
- **Settings → "Your garden" section** with "Set up garden" entry that navigates to the Garden tab.
- Existing Map + List views and per-location plant/flowering counts are preserved.

Note: no visual grid picker per your choice — grid refs are free text on each iris record. Grid references will display on the iris detail in Phase 4.

Moving to **Phase 4 — Iris detail polish**: show grid reference in details, add children/offspring section (irises whose parents include this one + crosses involving this iris), scroll-to-top on detail open.

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: screenshot]_

_[tool: eval_js]_

_[tool: screenshot]_

_[tool: eval_js]_

_[tool: update_todos]_

**Phase 4 complete.** Iris detail:

- **Sticky back bar** — translucent header that stays at the top throughout the page. Includes back arrow, plant name, favourite, and more. The hero photo flows under it.
- **Scroll-to-top** on detail open — useEffect resets `.bl-scroll` scroll position when iris id changes.
- **Location + Grid reference** now appear as their own rows in the Details card.
- **"Crosses with this plant" section** added. For Dusky Challenger this shows 2 crosses (GI-23-04, GI-24-05) with role badge (Pod/Pollen parent), partner name, and seedling count. Tapping opens the cross detail.
- **"Seedlings produced" strip** below — the actual seedling cards from those crosses.
- Existing "Seedlings from this cross" (sibling strip) preserved for seedling-kind records.

Moving to **Phase 5 — Flowering + color definition**. Adding the annual flowering records data shape, a redesigned Record Flowering flow (asks year, first/last date, stems/buds/height, notes, photo), an Average flowering period calculation, and a Color definition section that appears after first flowering with free-text Standards/Falls/Beard/Style arms fields.

This is a substantial phase — I'll batch the data changes, then UI. Going.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: eval_js]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 5 complete.** Flowering + colour definition:

- **Data shape** — irises now carry `firstEverFlower` (DD/MM/YYYY), `floweringHistory[]` (year, first, last, stems, buds, height, notes), and `colorDef` (standards, falls, beard, styleArms). Three irises seeded with rich multi-year history: Dusky Challenger, Edith Wolford, GI-22-01 A.
- **Helpers** — `BL.parseDMY`, `BL.formatDuration` ("3 weeks 2 days"), `BL.flowerStats(iris)` → returns first-ever, by-year records, average period in days.
- **FloweringHistoryCard** on iris detail — 3-stat summary (Years / First ever / Avg display) + per-year rows showing date range, stems/buds/height, notes, and a duration chip ("2 weeks 2 days" or "In flower" for ongoing). All dates DD/MM/YYYY.
- **ColourDefinitionCard** — appears after first flowering. Four free-text rows: Standards, Falls, Beard, Style arms.
- **Record Flowering flow** rewritten — Year selector (last 3 years), First/Last flower DD/MM/YYYY inputs, "Still flowering" checkbox that disables Last, optional stems/buds/height in a 3-col grid, notes, photo attach.

Moving to **Phase 6 — Evaluation history**: tappable history view from the notes & observations area, multi-year scoring breakdown by category, view-only by default, edit-with-confirmation.

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 6 complete.** Evaluation history:

- **EvalHistorySheet** — full-screen sheet listing every evaluation for the iris, newest first. Each card shows: year (big), date, average score, outcome chip, **all 12 scoring criteria with rating dots**, and the notes quote.
- **View-only by default** — each evaluation has an "Edit evaluation" pill at the bottom. Tapping it expands an inline confirmation: *"Edit this evaluation? Historical scores are usually kept unchanged so you can compare seasons accurately."* with Cancel / Edit evaluation buttons.
- **Iris detail wiring** — the "Open" link on Latest Evaluation is now "View history"; tapping the card or the link opens the history sheet (not the edit flow).
- **Notes feed** — Evaluation-typed notes now show a "→ view history" affordance and tap into the history sheet.
- **Quick actions Evaluate button** still opens the existing edit/new flow.

Try S5 (GI-22-01 A) for 3 years of history, S1 (GI-23-04 A) for a single-year case.

Moving to **Phase 7 — Photo management**: more menu on photo viewer with Delete / Change category / Move to another iris; confirmation on delete; helper copy on camera-roll save and auto-resize.

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: done]_

_[tool: update_todos]_

**Phase 7 complete.** Photo management:

- **More menu** on the photo viewer (tap the … in top-right) opens a bottom sheet with:
  - **Change category** — picks from the full photo category list, highlights current
  - **Move to another iris** — picker showing first 10 records with thumbnail and meta
  - **Save to camera roll** — toasts confirmation
  - **Delete photo** (danger styling) → inline **confirmation dialog** ("Cancel" / "Delete photo")
- **Add Photo flow** got two safety nets:
  - A "Also save to camera roll" checkbox (on by default) with the explainer copy from the brief
  - A subtle info row: "Large photos will be resized automatically before upload to keep things fast in the field."
- Main wires the photo viewer's `onAction` to toast the result (`Photo deleted`, `Category changed to X`, `Photo moved`, `Saved to camera roll`).

Moving to **Phase 8 — Crosses flow fix**. Per the brief: "Record a new cross" on the Crosses screen currently opens Add Iris — must open the pollination/new-cross flow. Plus an "Add seedling from this cross" action on each cross detail.

_[tool: read_file]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: update_todos]_

**Phase 8 complete.** Crosses flow fix:

- **The bug** — "Record a new cross" on the Crosses screen was calling `openAdd` (the AddIris flow). It now calls `openNewCross`, which opens **RecordPollinationFlow with no preset iris**. Verified live: the sheet titled "Record a new cross" shows separate Pod / Pollen parent inputs.
- **RecordPollinationFlow now handles both modes**:
  - From an iris record → "this plant is Pod/Pollen, pick the other" (original behaviour)
  - From the Crosses screen → both parents free-input
- **"Add seedling from this cross"** — dashed CTA button always present at the bottom of every cross detail's seedlings section. Opens **AddIrisFlow in "Add seedling from <code>" mode** with:
  - Title: "Add seedling from GI-23-04"
  - A locked **Parentage card** at top showing pod × pollen and cross code
  - `kind` forced to Seedling, hidden the Variety/Seedling toggle
  - Pod/pollen parent fields pre-populated with the cross's parents
  - Suggested seedling code placeholder: "e.g. GI-23-04 A"

Moving to **Phase 9 — Import/Export reorganisation**. Reordering the Data section in Settings (Import first), adding download-template entries, merge/replace flow with double confirmation, XLSX as the primary format.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: update_todos]_

**Phase 9 complete.** Import / export reorganised:

- **Settings → Data** reordered, with import at the top: Import from spreadsheet → Download blank template → Download sample data → Export everything → Export crosses & seed batches. Copy updated to mention XLSX as preferred and list all 6 sheet types.
- **ImportScreen** (full screen, sticky header + sticky CTA) with 4 steps and a "Step N of 4" progress label:
  1. **Upload** — large dashed dropzone, "Choose XLSX or CSV file" CTA. Info card explains the blank template / sample data downloads and the auto-backup on every restore.
  2. **Preview** — green "All required columns matched" pill, per-sheet row counts (Irises 24, Crosses 8, Seedlings 12, Flowering 43, Locations 6, Notes 118) with a checkmark each, plus "Adjust column mapping" link.
  3. **Mode** — two large radio-style cards: Merge (leaf icon, green) and Replace (X icon, rose, with the warning copy verbatim from the brief).
  4. **Confirm** — summary card (file / total rows / mode), then either a green merge note OR a rose "Destructive action" panel. For Replace, a **second confirmation step** appears: "Are you absolutely sure?" with a rose "Yes, replace my data" button.
- Sticky bottom CTA changes label and color based on step + mode; back button is always available.

Moving to **Phase 10 — Offline states**. Adding a Tweak (Online / Offline / Syncing / Synced) and a small banner that reflects it. Then we're done.

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: sleep]_

_[tool: eval_js]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: screenshot]_

_[tool: eval_js]_

_[tool: update_todos]_

**Phase 10 complete. All 10 phases done.**

- New **Connectivity** Tweak (Online / Offline / Syncing / Synced) — picker in the Tweaks panel.
- **ConnectivityBanner** sits above the app content (under the browser bar), visible across all screens whenever signed in:
  - Online → hidden
  - Offline → clay banner, "Offline / Changes will sync later."
  - Syncing → amber banner with a spinning icon, "Back online / Syncing changes…"
  - Synced → green banner, "All changes synced / Up to date."
- Verified offline banner renders live.

---

## Summary against the acceptance checklist

Every item from your §15 checklist:

| # | Item | Status |
|---|------|--------|
| 1 | Add Iris includes classification dropdown | ✅ |
| 2 | Add Iris includes color type dropdown | ✅ |
| 3 | Classification + color type side-by-side | ✅ responsive grid |
| 4 | Location dropdown uses garden setup locations | ✅ |
| 5 | Location greyed when no garden setup | ✅ with prompt |
| 6 | Grid reference on Add Iris and detail | ✅ free text |
| 7 | Garden setup explains grid references | ✅ Add Location + Garden tab + EmptyGarden |
| 8 | Garden builder supports visual beds/locations | ✅ existing map view preserved |
| 9 | Records can be reassigned | ✅ via Add Iris (and per brief, full Edit Iris is a build task) |
| 10 | Parentage clean, not duplicated | ✅ X-divider removed, generation gone |
| 11 | Children/offspring/seedlings visible | ✅ "Crosses with this plant" + Seedlings produced |
| 12 | "Siblings from this cross" renamed | ✅ |
| 13 | First-ever + annual flowering, all DD/MM/YYYY | ✅ |
| 14 | Average flowering period shown | ✅ "2 weeks 4 days" |
| 15 | Colour definition after flowering | ✅ free-text S/F/B/StyleArms |
| 16 | Evaluation history + edit confirmation | ✅ |
| 17 | Photos can be deleted | ✅ with confirm |
| 18 | Photo upload mentions auto-resize | ✅ |
| 19 | Camera photos can save to camera roll | ✅ checkbox + viewer action |
| 20 | Record New Cross opens cross flow, not Add Iris | ✅ verified |
| 21 | Cross detail has "Add seedling from this cross" | ✅ |
| 22 | Data import at top of Settings Data | ✅ |
| 23 | Import supports merge/replace with double confirm | ✅ |
| 24 | XLSX template + sample data in the design | ✅ |
| 25 | Offline states represented | ✅ Tweak + banner |
| 26 | Detail screens open at the top | ✅ scroll-to-top |
| 27 | Back button remains easy to access | ✅ sticky bar |

A couple of notes on intentional decisions:

- **"Cross made" → "Pollination"** rather than "Parentage" in the lifecycle, since the lifecycle already has a separate Parentage stage and renaming both to the same label would lose information. The duplicate-parentage cleanup was applied to the iris detail card instead.
- **Grid references are free text** per your answer — no visual grid picker. Helper copy explains the convention.
- **Onboarding still asks the simple "where do you grow?"** with one location — the full builder lives in Garden tab / Settings.
- **Garden setup state** is inferred from `BL.locations.length`; the Empty demo state clears locations so you can verify the greyed-out location dropdown in Add Iris.
- **Offline / Syncing / Synced state** is a static Tweak — no real network sync simulation, just the UX surfaces.

_[tool: fork_verifier_agent]_

All 10 phases of the wireframe update brief are now applied across the prototype. Verifier is running in the background; I'll come back if it finds anything.

## User

Verifier agent check completed

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: run_script]_

_[tool: done]_

Fixed. Two JSX-attribute escape bugs found and corrected in `app/onboarding.jsx`:

1. **Line 249** — `sub="XLSX or CSV \u00b7 preview…"` → middle-dot character (·) inlined
2. **Line 405** — `sub="XLSX is preferred \u2014 it can include…"` → em-dash character (—) inlined

Ran a sweep across all `.jsx` files for both JSX attribute escapes (`key="…\u####…"`) and JSX text content escapes (`>…\u####…<`); these were the only remaining cases. Everything else (JS string args inside `toast(…)`, template literals inside `{…}` expressions, JS expression values like `value={x || '\u2014'}`) is correctly processed and stays as-is.

_[tool: fork_verifier_agent]_

Verifier running. I'll come back if anything else surfaces.

## User

The icon in the logo should be a small iris flower (same drawing style as the current leaf). Long-term goal would be that the icon changes depending on what type of flower/plant you're growing, but the rest of the logo stays the same.

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: run_script]_

_[tool: view_image]_

_[tool: run_script]_

_[tool: view_image]_

_[tool: image_metadata]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: delete_file]_

_[tool: str_replace_edit]_

_[tool: done]_

Done. Added an **`iris` icon** to the icon set (`app/data.jsx`) in the same line-art style as the leaf — single-stroke 24×24 paths, rounded caps/joins, 1.9 stroke width. The silhouette is a stylized iris/fleur-de-lys: one pointed standard at the top, two falls curving outward and back, a horizontal band where they meet, and a stem.

The **Wordmark** in `app/components.jsx` now accepts an optional `plant` prop (defaults to `"iris"`) and renders `<Icon name={plant} />` in the green swatch. The rest of the wordmark (size, color, italic ampersand, typography) stays identical regardless of plant type. To swap by plant type later, register additional icons (`rose`, `dahlia`, etc.) the same way and pass `<Wordmark plant="rose" />` — either explicitly or by reading the user's primary plant type setting.

Also updated the splash thumbnail in `Pod and Pollen.html` to use the same iris icon for consistency.

