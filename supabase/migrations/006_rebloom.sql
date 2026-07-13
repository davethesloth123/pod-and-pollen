-- Rebloomer (remontant) flag on plants
alter table public.irises add column if not exists rebloom boolean not null default false;
