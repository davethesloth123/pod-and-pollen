# Web App Project Brief

_Started 2026-05-30 22:00 UTC_

---

## User

This is a Project brief of an online web-based app I want to build.

## Assistant

## User

This is a Project brief of an online web-based app I want to build.

## User

This is a Project brief of an online web-based app I want to build.

## Assistant

_[tool: invoke_skill]_

_[tool: list_files]_

I'll read your project brief. Let me start by learning how to read the PDF.I'll extract the text from your project brief.

_[tool: run_script]_

_[tool: questions_v2]_

I've read your brief end to end — it's a thorough, well-structured planning document for a mobile-first iris growing, hybridising, and seedling-evaluation platform. Before I design anything, I want to make sure I build the right thing. A few questions:

## User

Questions answered:
- deliverable: A clickable, mobile-first prototype of the core screens (recommended)
- scope: Phase 1 MVP: iris records, garden locations, notes, photos, search
- device: Phone (shown in a phone frame)
- visual_direction: Clean & utilitarian — high contrast, big buttons, very legible for older users
- accessibility: Balanced — clean but information-rich
- variations: Yes — variations on the core navigation / home screen
- photos: Use stock-style iris imagery placeholders so it looks finished
- naming: Bloomline
- priorities: The Lifecycle model - Variety or plant record -> parentage -> cross -> seed pod -> seed batch -> sowing and germination -> seedling -> first flower -> evaluation -> retain, discard, name, or register-support record

## Assistant

_[tool: invoke_skill]_

_[tool: invoke_skill]_

_[tool: set_project_title]_

Got it — clean, high-contrast, big-button mobile prototype for the Phase 1 MVP, in a phone frame, named **Bloomline**, with the breeding lifecycle made visible and home-screen navigation variations to compare. Let me load my design guidance and the scaffolding I'll need.I'll grab the phone frame and tweaks panel scaffolding.

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: read_file]_

Let me inspect the iOS frame so I use it correctly.

_[tool: update_todos]_

Now I have everything I need. Let me lay out my plan and design system.

**Bloomline** — a field-notebook-meets-modern-tool aesthetic. Warm paper background, near-black violet ink, a single iris-violet accent, generous spacing and big tap targets for legibility. Display type in **Spectral** (heritage/botanical character, restrained to titles + wordmark), all functional UI in **Lexend** (designed for reading proficiency — ideal for older users). The breeding **lifecycle** is the hero: a visible vertical rail on every record showing Variety → Parentage → Cross → Seed → Sowing → Seedling → First flower → Evaluation → Outcome.

_[tool: write_file]_

Got it — phone in a phone frame, confirmed. That's exactly the plan. Let me build.

Starting with the data layer — sample irises (real cultivar names for authenticity), garden locations, notes, the procedural iris imagery, and the icon set.

_[tool: write_file]_

Good call — phone-first, tablet-responsive. I'll build the screens to reflow at wider widths and add a **Phone / Tablet** toggle in the Tweaks so you can see both in their respective frames from the same prototype. Noted and folded into the plan.

Now the shared components — including the lifecycle rail, which is the centerpiece.

_[tool: write_file]_

Now the screens — including the three home/navigation variations and the iris detail with the lifecycle rail front and center.

_[tool: write_file]_

Now the add/note/photo flows and lifecycle-stage detail sheet.

_[tool: str_replace_edit]_

Now the app shell — router, device frames (phone + tablet), Tweaks, and toast.

_[tool: write_file]_

_[tool: write_file]_

Finally, the HTML shell — fonts, palette, animations, and script wiring.Let me check it loads cleanly.

_[tool: show_html]_

I'll inspect first since this is a complex multi-file build before handing off.

_[tool: show_html]_

_[tool: get_webview_logs]_

Clean. Let me screenshot the default state.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

Excellent — the home screen looks finished and the procedural iris imagery reads convincingly as soft-focus macro photos with accurate cultivar colours. Now let me verify the priority screen: the seedling detail with the lifecycle rail.

_[tool: view_image]_

_[tool: eval_js]_

The lifecycle rail looks great. But the hero title looks clipped ("GI-23-0…"). Let me inspect the actual DOM to confirm.

_[tool: str_replace_edit]_

The DOM confirms the title is full-width (361px) — not clipped; it was just low contrast over the bloom's lighter center in that capture. Let me strengthen the hero gradient so titles always read cleanly, then hand off.

_[tool: update_todos]_

_[tool: done]_

_[tool: fork_verifier_agent]_

**Bloomline** — a clickable, mobile-first prototype of the Phase 1 MVP is ready.

**The lifecycle is the centrepiece.** Open any seedling (e.g. *GI-23-04 A* on the home feed) — the detail screen shows the full breeding lifecycle as a connected vertical rail: Variety → Parentage → Cross → Seed pod → Seed batch → Sowing & germination → Seedling → First flower → Evaluation → Outcome, with completed stages checked, the current stage marked "NOW", and tappable nodes that open the underlying records (harvest dates, germination %, cross details). Named varieties show a simpler rail where breeding stages are marked not-applicable.

**What's in it:**
- **Home, Collection, Garden, Search** + add/note/photo flows, all wired with real navigation and transitions
- Iris records with parentage chips (tap to jump to a parent), expandable advanced details, and a notes timeline
- Procedural, colour-accurate iris imagery so it looks finished without real photos yet
- Big touch targets, Lexend (built for legibility) + Spectral for headings

**Try the Tweaks panel** (toolbar) to compare the things you asked about:
- **Home layout** — Dashboard / Big tiles / Activity feed (three navigation directions)
- **Device** — Phone / Tablet (shows the responsive reflow you flagged)
- **Accent** colour and **Text size** (Standard/Large/Larger for older users)

A couple of notes: this is a visual/interaction prototype — data doesn't persist and there's no real auth/Supabase (that's the build phase). Want me to push further on any one home variation, or mock up Phase 2 (the cross & seed-batch creation flows) next?

## User

Analyze the design and think, does this look and feel like the right kind of tool that a professional breeder might find useful? Does it cover the start of the MVP product we need to build? Does it potentially allow for easily upgrading with new features and UX additions?

Before we make any changes, let me know your thoughts and findings

## Assistant

Honest analysis — three lenses.

## 1. Would a professional breeder find it useful?

**Yes, in spirit — but not yet in depth.** The right ideas are present:

- The **lifecycle rail is the strongest design decision.** A serious hybridiser thinks in lifecycle stages and the rail makes those stages explicit, visible, and connected. That's exactly the structural advantage the brief calls out over spreadsheets.
- **Parentage as a tappable chip that navigates to the parent record** matches a real breeder workflow (you constantly cross-reference parents).
- Real cultivar names + a realistic seedling code (`GI-23-04 A`) give it the smell of authenticity. A breeder would recognise the world.
- Distinct **"First flower"** status (vs. ongoing "Flowering" of established cultivars) is a subtle thing that breeders care about, and it's there.

**But it would feel thin to a serious breeder in a few specific places:**

- **No real evaluation surface.** The BIS judges marking form has structured criteria (form, substance, distinctiveness, branching, bud count, garden appeal). I represent "Evaluation" as a *note type*, not as a scored, structured screen. For a hybridiser, evaluation is *the* high-value workflow — it deserves its own UI.
- **"Record flowering" is a toast.** In reality recording first flower wants: date, stems open, bud count, height measurement, photo. Same for **"Record pollination"** — that's the moment a cross is born and it should capture pod parent / pollen parent / date in 4 taps.
- **Photos are under-represented.** Each record has one hero image. The brief lists 7 photo categories (parent, seedling, whole-plant, stem, foliage/disease, registration-style). A breeder photographs *a lot* and wants a categorised gallery per record. Right now there's no gallery view, only the add flow.
- **No "all seedlings from this cross" view.** Filtering seedlings by parent/cross is the breeder's killer query — it lets them compare F1 siblings side-by-side. The search teases filters but doesn't have *parent* yet.
- **No multi-year context.** "Best clump this year" begs the question "vs. last year?". No bloom-history timeline yet.
- **No seasonal framing.** Iris work is intensely seasonal (May = bloom/cross, August = harvest, October = sow, Feb = germinate). A "this season" lens would resonate.

## 2. Does it cover the start of the MVP?

Against the brief's **Phase 1 MVP** list, mostly yes — with named gaps:

| Phase 1 item | Status |
|---|---|
| Iris records (list, detail, add) | ✅ |
| Garden locations | ✅ |
| Notes & observations | ✅ |
| Photo upload flow | ✅ (flow only — no gallery) |
| Search + basic filters | ✅ (filter-by-parent missing) |
| Mobile-first, touch-friendly | ✅ |
| **CSV export / import** | ❌ — not represented anywhere |
| **Settings / profile screen** | ❌ — no home for export, sign-out, units, region |
| **Photo gallery on a record** | ❌ — you can add but not browse |
| **Movement history** | ❌ — brief explicitly says don't overwrite location |
| **Empty / onboarding states** | ❌ — first-run experience missing |
| Login / auth | N/A for a prototype |

The big missing surfaces are **Settings (with CSV export)** and **the photo gallery view** — both Phase 1 essentials.

## 3. Does it allow easy upgrading?

**Architecturally, yes — quite well.**

- The **lifecycle rail is the natural seam for Phase 2.** Stage detail sheets already exist as read-only — they become the spot where you *create* a cross / seed batch / evaluation. The UI shape is in place; only the form contents and persistence change.
- **Sheet + router patterns** mean adding Cross flow, Seed Batch flow, Evaluation flow, Future Cross Planner, Wants List = drop in new sheets and new views. No restructuring.
- **Parentage chips already navigate** — once parents are real linked records (not name-matched), the UI is unchanged.
- **Tweaks panel** is a real product asset, not just for design review — you can keep exploring nav/density variations with users post-launch.
- **CSS variables for accent + colour tokens** are centralised. Typography sizes are inline px which is fine for a prototype but would benefit from rem-based scaling in production (the current "Large text" zoom toggle is a workaround).

**Where the data layer will need real work** (expected, but worth saying): the lifecycle currently looks up crosses/seed batches by hardcoded IDs from sample data. In production this is joined records — the UI pattern survives, the data layer is replaced.

---

## My recommendation

The prototype is a **strong Phase 1 visual + interaction spec with one architectural bet (the lifecycle rail) that I'd defend**. Before you take it to your dad or another breeder for feedback, I'd suggest filling three gaps that would make it land as a *breeder's* tool, not just a *gardener's* tool:

1. **Structured Evaluation screen** (BIS-style scored fields + free notes) — replaces toast, becomes the lifecycle stage's create action
2. **Photo gallery per record** with the 7 categories, swipeable — plus structured "Record flowering" and "Record pollination" mini-flows that actually capture data
3. **Settings screen** with CSV export/import placeholders (so the data-portability promise is visible) — and a **"Siblings from this cross"** filter in search/collection (the breeder's killer view)

Then optionally: empty/onboarding state for first-run, and a small movement-history strip on the detail.

Want me to tackle any/all of those? My instinct is the Evaluation screen + Sibling filter would do the most to upgrade the "feels like a breeder's tool" perception — they're also the cheapest to bolt onto what's there.

## User

Let's tackle all three recommendations, but also the empty/onboarding state too.

I think it is important that during the sign-up phase, the user has to select the type of flower/plant they're growing. That builds in nicely the easy branch off for future other plants.

## Assistant

_[tool: update_todos]_

Great — all four additions in one pass. Let me lay out a quick plan then build:

_[tool: str_replace_edit]_

Noted — and that distinction is reflected in the design already: the phone frame is just a presentation device, but the UI inside it is custom web-app chrome (not iOS native components), uses standard web patterns, and the Tweaks "Phone / Tablet" toggle exists precisely *because* the same responsive web layout has to work across viewports. The PWA install/manifest pieces are the actual product's concern; the design here proves the responsive UX. I'll keep building with that lens.

Let me extend the data layer first — siblings, multi-photo, evaluation criteria.Now the new shared components.

_[tool: str_replace_edit]_

Now the new flows (Evaluation, Record Flowering, Record Pollination, Photo Viewer).

_[tool: str_replace_edit]_

Now the new Onboarding + Settings + empty-state screens.

_[tool: write_file]_

Now update the Iris detail screen — add Photos, Siblings, and Evaluation summary, and per-kind quick actions.

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Now Collection (cross filter + empty state) and Home (avatar → settings).

_[tool: str_replace_edit]_

Now wire it all together in main.jsx — onboarding, settings, new flows, demoState tweak, avatar tap, and an "empty data" path.

_[tool: write_file]_

Add the onboarding script to the HTML:

_[tool: str_replace_edit]_

Verify it loads cleanly.

_[tool: show_html]_

_[tool: get_webview_logs]_

Clean. Let me capture all the new surfaces to verify in one pass.

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

The scroll didn't take. Let me try again with a longer delay and force scrollTop via the correct target.

_[tool: save_screenshot]_

