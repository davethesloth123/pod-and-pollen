-- ─────────────────────────────────────────────────────────────
-- 003 — seed batch: number transplanted
-- Run in the Supabase SQL editor for each environment.
-- ─────────────────────────────────────────────────────────────
alter table public.seed_batches add column if not exists transplanted int;
