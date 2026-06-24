-- ─────────────────────────────────────────────────────────────
-- 004 — lineage by id: parent references on irises
-- Run in the Supabase SQL editor for each environment.
-- ─────────────────────────────────────────────────────────────
alter table public.irises add column if not exists pod_parent_id    uuid references public.irises(id) on delete set null;
alter table public.irises add column if not exists pollen_parent_id uuid references public.irises(id) on delete set null;

-- Backfill: link existing parent NAMES to an iris record of the same user
update public.irises c
set pod_parent_id = p.id
from public.irises p
where c.pod_parent_id is null
  and c.pod_parent is not null and c.pod_parent <> '' and c.pod_parent <> 'Unknown'
  and p.user_id = c.user_id and p.name = c.pod_parent and p.id <> c.id;

update public.irises c
set pollen_parent_id = p.id
from public.irises p
where c.pollen_parent_id is null
  and c.pollen_parent is not null and c.pollen_parent <> '' and c.pollen_parent <> 'Unknown'
  and p.user_id = c.user_id and p.name = c.pollen_parent and p.id <> c.id;
