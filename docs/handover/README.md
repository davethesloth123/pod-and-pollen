# Pod & Pollen — Handover Documentation

This directory is the complete handover package for Pod & Pollen, prepared so that development
can pass from one agent/developer to another without loss of context.

**Start with [`/POD_AND_POLLEN_HANDOVER.md`](../../POD_AND_POLLEN_HANDOVER.md)** at the repository
root — it is the master summary and links back here for detail.

---

## The documents

| Document | Read it when you need… |
|---|---|
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | What Pod & Pollen *is*, who it is for, and why it exists. First principles, from the founding brief. |
| [FEATURE_SPECIFICATION.md](./FEATURE_SPECIFICATION.md) | The complete feature inventory: purpose, intended behaviour, business rules, current status, code locations. **The longest and most detailed document.** |
| [USER_FLOWS.md](./USER_FLOWS.md) | End-to-end journeys, each contrasting current behaviour with intended behaviour. |
| [CURRENT_IMPLEMENTATION.md](./CURRENT_IMPLEMENTATION.md) | A repository-wide audit of what actually exists, plus the **feature-status matrix**. |
| [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) | Stack, versions, routing, state, backend, and the architectural decisions that will surprise you. |
| [DATA_MODEL.md](./DATA_MODEL.md) | Every table, column, relationship, enumeration and constraint — and the weaknesses that will cause migration pain. |
| [ENVIRONMENT_AND_SERVICES.md](./ENVIRONMENT_AND_SERVICES.md) | How to run it: versions, commands, env-var **names**, database setup, external services. |
| [TESTING_AND_QA.md](./TESTING_AND_QA.md) | What is tested (nothing), what should be, the manual smoke path, and the verification run performed for this handover. |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | 34 catalogued defects with severity, reproduction steps and suggested directions. |
| [TECH_DEBT.md](./TECH_DEBT.md) | 26 structural concerns, prioritised, with an assessment of what gets harder as the product grows. |
| [ROADMAP.md](./ROADMAP.md) | Five proposed phases, with agreed items clearly separated from recommendations. |

Also created at the repository root:
- [`/AGENTS.md`](../../AGENTS.md) — a concise, navigational brief for a coding agent taking over.
- [`/POD_AND_POLLEN_HANDOVER.md`](../../POD_AND_POLLEN_HANDOVER.md) — the master summary.

---

## How this documentation was produced

**Repository state:** commit `3aa0c54` on branch `dev`, with the full 51-commit history fetched.

**What was inspected:** every file in `src/` (54 files, 11,930 lines), all seven SQL migrations,
every configuration file, `BACKLOG.md`, both planning documents in `docs/`, the five design-tool
transcripts in `chats/`, the seed fixture, and the original PDF project brief.

**What was executed:** `npm ci`, `npx tsc --noEmit`, `npx next build`, `npm run lint`,
`npm audit`. Results are recorded in [TESTING_AND_QA.md §1](./TESTING_AND_QA.md).

**What was *not* done:** no functional change, no refactor, no redesign. The only files added are
documentation.

### On the PDF brief
`project/uploads/My_Iris_Tracker_Project_Brief_V2_1.pdf` is the most authoritative statement of
product vision and is heavily quoted in [PRODUCT_VISION.md](./PRODUCT_VISION.md). Its text is
embedded with subset fonts and custom encodings, so ordinary copy-paste and naive extraction
produce gibberish. It was extracted by parsing the PDF object graph, resolving each page's
indirect `/Resources` → `/Font` dictionary, decoding each font's `/ToUnicode` CMap, and mapping
the single-byte glyph codes back to Unicode. If you need to re-read it, that is what it takes —
or open it in any PDF viewer, which handles this transparently.

---

## An important caveat on provenance

This documentation was written by a coding agent that had **no memory of the earlier development
sessions**. Everything here is reconstructed from primary sources committed to the repository —
the code, the migrations, the git history, the planning documents, the chat transcripts and the
PDF brief.

The practical consequence: **where a requirement was agreed verbally and never written down, it
is not in this documentation.** Sections marked ❓ **NEEDS VERIFICATION** are the places where
that gap is known. The most significant are:

- Whether Supabase email confirmation is enabled (it changes whether sign-up works at all).
- Which Vercel project and Supabase projects exist, for which environments, and whether backups
  are on.
- Whether the intended date separator is `dd-mm-yyyy` (as the code and the feedback brief use) or
  `dd/mm/yyyy`.
- Which photo storage backend was actually chosen — the founding brief and the feedback brief
  **disagree**, and the decision blocks the entire photo feature.

Please correct anything here that contradicts a decision made outside the repository.

---

## Keeping this current

These documents describe a moving target. When architecture or business rules change materially,
update the affected document in the same pull request as the code — see the note at the end of
[`/AGENTS.md`](../../AGENTS.md).

The most likely to go stale first:
- [CURRENT_IMPLEMENTATION.md](./CURRENT_IMPLEMENTATION.md) — the feature-status matrix
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) — as defects are fixed
- [DATA_MODEL.md](./DATA_MODEL.md) — with every migration
