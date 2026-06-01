-- ─────────────────────────────────────────────────────────────
-- Pod & Pollen — initial database schema
-- Run this in your Supabase SQL editor, or via supabase db push
-- ─────────────────────────────────────────────────────────────

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- PROFILES — extends auth.users with app-specific user data
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text,
  garden_name text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile"  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- USER SETTINGS — widget config, preferences, per user
-- ─────────────────────────────────────────────────────────────
create table public.user_settings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  widget_ids    text[] default '{}',         -- ordered list of active widget ids
  accent_color  text default '#5F7A52',
  text_size     text default 'Standard',     -- Standard | Large | Larger
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.user_settings enable row level security;
create policy "Users manage own settings" on public.user_settings
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- LOCATIONS — garden beds, borders, greenhouses, pots etc.
-- ─────────────────────────────────────────────────────────────
create table public.locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  short_name  text,
  kind        text,            -- Bed | Border | Trial area | Greenhouse | Holding | Pots
  sun         text,
  soil        text,
  -- Garden plan position (percentage of canvas)
  x           numeric(5,1),
  y           numeric(5,1),
  w           numeric(5,1),
  h           numeric(5,1),
  shape       text default 'rect',
  sort_order  int default 0,
  created_at  timestamptz default now()
);
alter table public.locations enable row level security;
create policy "Users manage own locations" on public.locations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- IRISES — varieties and seedlings
-- ─────────────────────────────────────────────────────────────
create table public.irises (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,

  -- Identity
  name              text not null,
  kind              text not null default 'Variety',  -- Variety | Seedling
  classification    text,                              -- Tall Bearded, Intermediate, etc.
  color_type        text,                              -- Self, Bicolor, Plicata, etc.
  status            text default 'Growing',            -- Growing | Flowering | Watch | First flower | Archived | Named
  fav               boolean default false,

  -- Appearance
  colour            text,
  height_cm         int,
  season            text,
  fragrance         text,
  palette           text,                              -- color recipe key (blackViolet, deepPurple, etc.)

  -- Color definition (filled in after first flower)
  color_standards   text,
  color_falls       text,
  color_beard       text,
  color_style_arms  text,

  -- Provenance
  source            text,
  planted_date      text,                              -- DD/MM/YYYY or "Oct 2019" etc.
  first_ever_flower text,                              -- DD/MM/YYYY

  -- Location
  location_id       uuid references public.locations(id) on delete set null,
  grid_ref          text,                              -- e.g. "B3" or "Row A · 1"

  -- Parentage (for varieties that have known parents)
  pod_parent        text,
  pollen_parent     text,

  -- Cross linkage (for seedlings)
  cross_id          uuid,                              -- references crosses.id (set below)
  seed_batch_id     uuid,                              -- references seed_batches.id
  generation        text,                              -- F1, F2, etc.

  -- Timestamps
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.irises enable row level security;
create policy "Users manage own irises" on public.irises
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index irises_user_id_idx on public.irises(user_id);
create index irises_location_id_idx on public.irises(location_id);

-- ─────────────────────────────────────────────────────────────
-- CROSSES — pollination records
-- ─────────────────────────────────────────────────────────────
create table public.crosses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  code            text not null,                       -- e.g. GI-23-04
  season          text,                                -- year of pollination
  pod_parent      text,                                -- name of pod parent
  pod_parent_id   uuid references public.irises(id) on delete set null,
  pollen_parent   text,
  pollen_parent_id uuid references public.irises(id) on delete set null,
  pollination_date text,                               -- DD/MM/YYYY
  pod_number      text,                                -- e.g. "04"
  goal            text,
  notes           text,
  status          text default 'Sown',                 -- Sown | Germinated | Growing on | Evaluating | Archived
  created_at      timestamptz default now()
);
alter table public.crosses enable row level security;
create policy "Users manage own crosses" on public.crosses
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Back-reference from irises to crosses
alter table public.irises
  add constraint irises_cross_id_fkey
  foreign key (cross_id) references public.crosses(id) on delete set null;

-- ─────────────────────────────────────────────────────────────
-- SEED BATCHES — per cross
-- ─────────────────────────────────────────────────────────────
create table public.seed_batches (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  cross_id        uuid references public.crosses(id) on delete cascade not null,
  harvest_date    text,
  seeds_count     int,
  treatment       text,
  sown_date       text,
  germ_date       text,
  germinated      int,
  germ_pct        int,
  repot_date      text,
  planted_out_date text,
  retained        int default 0,
  named           int default 0,
  created_at      timestamptz default now()
);
alter table public.seed_batches enable row level security;
create policy "Users manage own seed batches" on public.seed_batches
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.irises
  add constraint irises_seed_batch_id_fkey
  foreign key (seed_batch_id) references public.seed_batches(id) on delete set null;

-- ─────────────────────────────────────────────────────────────
-- NOTES — attached to an iris
-- ─────────────────────────────────────────────────────────────
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  iris_id     uuid references public.irises(id) on delete cascade not null,
  note_type   text,                                    -- Flowering | Health | Movement | General | Photo | Evaluation
  body        text not null,
  noted_at    timestamptz default now(),
  created_at  timestamptz default now()
);
alter table public.notes enable row level security;
create policy "Users manage own notes" on public.notes
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index notes_iris_id_idx on public.notes(iris_id);

-- ─────────────────────────────────────────────────────────────
-- PHOTOS — metadata (file stored in Supabase Storage)
-- ─────────────────────────────────────────────────────────────
create table public.photos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  iris_id     uuid references public.irises(id) on delete cascade not null,
  storage_path text not null,                          -- path in Supabase Storage
  category    text,                                    -- Flower | Whole plant | Foliage | General
  caption     text,
  taken_at    timestamptz,
  created_at  timestamptz default now()
);
alter table public.photos enable row level security;
create policy "Users manage own photos" on public.photos
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index photos_iris_id_idx on public.photos(iris_id);

-- ─────────────────────────────────────────────────────────────
-- FLOWERING RECORDS — annual records per iris
-- ─────────────────────────────────────────────────────────────
create table public.flowering_records (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  iris_id         uuid references public.irises(id) on delete cascade not null,
  year            int not null,
  first_date      text,                                -- DD/MM/YYYY
  last_date       text,
  stems           int,
  buds            int,
  height_cm       int,
  notes           text,
  created_at      timestamptz default now(),
  unique (iris_id, year)
);
alter table public.flowering_records enable row level security;
create policy "Users manage own flowering records" on public.flowering_records
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- EVALUATIONS — assessment records per iris
-- ─────────────────────────────────────────────────────────────
create table public.evaluations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  iris_id         uuid references public.irises(id) on delete cascade not null,
  eval_year       int,
  -- Scores 1–5
  form            numeric(3,1),
  colour          numeric(3,1),
  substance       numeric(3,1),
  branching       numeric(3,1),
  vigour          numeric(3,1),
  average         numeric(3,2),
  verdict         text,                               -- Retain | Discard | Watch | Name
  comments        text,
  evaluated_at    timestamptz default now(),
  created_at      timestamptz default now()
);
alter table public.evaluations enable row level security;
create policy "Users manage own evaluations" on public.evaluations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index evaluations_iris_id_idx on public.evaluations(iris_id);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKET for photos
-- (run manually in Supabase dashboard or via supabase CLI)
-- ─────────────────────────────────────────────────────────────
-- insert into storage.buckets (id, name, public)
-- values ('iris-photos', 'iris-photos', false);
--
-- create policy "Users upload own photos" on storage.objects
--   for insert with check (auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users read own photos" on storage.objects
--   for select using (auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Users delete own photos" on storage.objects
--   for delete using (auth.uid()::text = (storage.foldername(name))[1]);
