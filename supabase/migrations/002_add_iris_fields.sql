-- ─────────────────────────────────────────────────────────────
-- 002 — add breeder + year_released to irises
-- Run in the Supabase SQL editor for each environment.
-- ─────────────────────────────────────────────────────────────
alter table public.irises add column if not exists breeder       text;
alter table public.irises add column if not exists year_released  int;
