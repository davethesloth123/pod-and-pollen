-- Phase 2: annual flowering record measurements (branch count, bloom size)
alter table public.flowering_records add column if not exists branch_count    int;
alter table public.flowering_records add column if not exists bloom_height_cm int;
alter table public.flowering_records add column if not exists bloom_width_cm  int;
