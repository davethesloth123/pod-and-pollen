# Pod & Pollen — Backlog (deferred / future updates)

Items intentionally deferred. Not bugs — planned future work.

## Garden
- **Map editor**: let users position/resize/reshape locations on the garden
  plan (drag to move, handles to resize, choose shape). Today locations added
  via the form have no map coordinates, so they only appear in the List view,
  not placed on the Map. Needs an interactive plan editor + persisting x/y/w/h.

## Phase 2 (planned)
- **Photo upload** to Supabase Storage (`iris-photos` bucket + storage RLS),
  replacing the procedural IrisBloom placeholders with real images.
- **Import** (CSV/XLSX/JSON) — parse the seed-spreadsheet format and bulk-insert.

## Desktop polish (later)
- Review each screen at desktop width for multi-column layouts beyond grids.

## Roadmap (internal only — not user-facing)
- Additional plant genera (roses, dahlias, etc.). The plant-type concept is
  built in but only irises are exposed.
