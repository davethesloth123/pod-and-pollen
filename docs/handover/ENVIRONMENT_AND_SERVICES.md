# Pod & Pollen — Environment and Services

> Everything needed to run the application locally.
> **No secret values appear in this document, and none should ever be added to it.**
> Only variable *names* and placeholder shapes are recorded.

---

## 1. Required runtime versions

| Tool | Required | Verified working |
|---|---|---|
| Node.js | **≥ 18.18** (Next.js 15 minimum); ≥ 20 LTS recommended | Node 22.x |
| npm | ≥ 9 (lockfile v3) | npm 10.9.7 |

`package.json` declares no `engines` field — **worth adding** so the runtime is pinned for
Vercel and for new contributors.

## 2. Commands

| Purpose | Command | Status |
|---|---|---|
| Install | `npm ci` *(preferred — respects the lockfile)* or `npm install` | ✅ works |
| Development server | `npm run dev` → `next dev` on `http://localhost:3000` | ✅ |
| Production build | `npm run build` → `next build` | ✅ passes |
| Start production build | `npm start` → `next start` | ✅ |
| Type check | `npx tsc --noEmit` | ✅ passes clean |
| Lint | `npm run lint` → `next lint` | ❌ **BROKEN — see §3** |
| Test | *(none defined)* | ❌ no test tooling at all |

There is **no `typecheck` script** in `package.json` despite `tsc --noEmit` being the most useful
check in the repository. Adding one is recommended.

## 3. ⚠ The lint script does not work

`eslint@9.39.4` and `eslint-config-next@15.5.18` are installed, but **no ESLint configuration
file exists** — there is no `.eslintrc*` and no `eslint.config.*` anywhere in the repository.

Running `npm run lint` therefore drops into Next's interactive first-run setup
(`? How would you like to configure ESLint?`) and exits **1**. It cannot run unattended, so it
would fail in CI if CI existed.

`next lint` is also deprecated and will be removed in Next.js 16.

**Fix (not applied — this is a documentation task):** add a flat config, e.g.
`eslint.config.mjs` extending `next/core-web-vitals`, and change the script to
`eslint .`. Note that the codebase already contains one
`// eslint-disable-next-line @next/next/no-img-element` (`iris-detail.tsx:178`), implying lint
did once run.

## 4. Environment variables

Copy `.env.example` → `.env.local` for local development. `.gitignore` correctly excludes
`.env*.local`, `.env.staging` and `.env.production`.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL. Used by the browser client, the server client and the middleware. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anonymous (publishable) key. Safe to expose — all access control is Row Level Security. |
| `NEXT_PUBLIC_APP_URL` | No | Declared in `.env.example`; **not referenced anywhere in `src/`**. |
| `NEXT_PUBLIC_ENV` | No | Declared as an environment label for the app header; **not referenced anywhere in `src/`**. |

**No service-role key is used anywhere**, which is correct — there is no server-side privileged
code path.

> `.env.example` already contains names and placeholders only (`https://your-project.supabase.co`,
> `your-anon-key`). **Verified: no real credentials are committed anywhere in the repository.**
> The two unused variables should either be wired up or removed from the example.

## 5. Database setup

**Provider:** Supabase (hosted Postgres + GoTrue auth + Storage).

**Migrations are applied by hand.** Each file in `supabase/migrations/` carries a header such as
*"Run this in your Supabase SQL editor, or via `supabase db push`"*. There is **no migration
runner, no `schema_migrations` table and no way to verify which migrations an environment has
received.**

Apply in order, once per environment:

| # | File | Adds |
|---|---|---|
| 001 | `001_initial_schema.sql` | pgcrypto; `profiles`, `user_settings`, `locations`, `irises`, `crosses`, `seed_batches`, `notes`, `photos`, `flowering_records`, `evaluations`; RLS policies; `handle_new_user` trigger; indexes |
| 002 | `002_add_iris_fields.sql` | `irises.breeder`, `irises.year_released` |
| 003 | `003_seed_batch_transplanted.sql` | `seed_batches.transplanted` |
| 004 | `004_lineage_by_id.sql` | `irises.pod_parent_id`, `irises.pollen_parent_id` + **backfill by name match** |
| 005 | `005_flowering_measurements.sql` | `flowering_records.branch_count`, `.bloom_height_cm`, `.bloom_width_cm` |
| 006 | `006_rebloom.sql` | `irises.rebloom` |
| 007 | `007_evaluation_rubric.sql` | `evaluations.scores` (jsonb), `.total`, `.rubric` |

Migrations 002–007 are all `add column if not exists`, so they are idempotent. **Migration 001 is
not** — re-running it will error on existing objects.

**Storage bucket — not created.** The `iris-photos` bucket and its three RLS policies are
**commented out** at the end of migration 001 and have never been run. Do not run them until the
photo storage backend decision is confirmed (see
[FEATURE_SPECIFICATION.md §A7](./FEATURE_SPECIFICATION.md) — the feedback brief parks this on a
choice between Cloudflare R2 / Images / Bunny, which contradicts the founding brief's "private
Supabase Storage buckets").

**Auth configuration** — set in the Supabase dashboard, not in the repository:
- Email/password provider enabled.
- **Email confirmation on/off** — ❓ unknown, and it materially affects sign-up (see
  [CURRENT_IMPLEMENTATION.md §7](./CURRENT_IMPLEMENTATION.md)).
- Redirect URLs for password reset must include each environment's origin.

## 6. Seed data

`seed/` holds a fixture and its generator:

| File | Purpose |
|---|---|
| `seed/pod_and_pollen_seed_data.xlsx` | Realistic spreadsheet in the shape the primary user's real data takes |
| `seed/gen_seed.py` | Python generator that produces it |

Committed as a test fixture and **import template** (commit `e3c2724`). There is **no loader** —
nothing imports this into a database, because the import feature does not exist. When the
importer is built, this is the natural fixture to build and test against.

`src/components/screens/import.tsx` also contains five hardcoded sample rows used only for its
fake preview.

## 7. External services

| Service | Role | Status |
|---|---|---|
| **Supabase** | Postgres, Auth, (Storage) | ✅ in use; Storage unused |
| **Vercel** | Hosting | Inferred — `.vercel` in `.gitignore`, per-environment instructions in `.env.example`, a "refresh the deployment" commit. **No `vercel.json` is committed.** |
| **Google Fonts** | Bricolage Grotesque + Lexend, via `@import` in `globals.css` | ✅ in use — a render-time third-party dependency, and a GDPR consideration for a UK/EU product |
| Analytics | — | ❌ none |
| Error monitoring | — | ❌ none |
| Email | Supabase's built-in auth emails | Default provider; no custom transactional email |
| Payments | — | ❌ none |

## 8. Environments

The founding brief §13 specifies four tiers with a **separate Supabase project per tier**:

| Tier | Purpose |
|---|---|
| Local development | `.env.local` → a "testing" Supabase project |
| Preview | Vercel preview deployments per branch → staging Supabase project |
| Staging | Persistent test instance with test data for user review |
| Production | Real records |

**❓ NEEDS VERIFICATION** — none of this can be confirmed from the repository. Unknown: whether
the Vercel project exists and under which account; whether separate Supabase projects exist for
staging and production; which branch deploys where; whether a custom domain is configured;
whether database backups are enabled. **Ask the project owner for these before deploying
anything.**

## 9. Deployment

No CI/CD is defined in the repository — there is no `.github/` directory, no `vercel.json`, no
pipeline of any kind. Nothing runs typecheck, lint, build or tests on push. Deployment is
presumed to be Vercel's automatic Git integration on the `dev` branch.

`dev` is the repository's default branch (`origin/HEAD → origin/dev`). There is no `main`.

## 10. Local setup, end to end

```bash
git clone https://github.com/davethesloth123/pod-and-pollen
cd pod-and-pollen
npm ci

cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from your Supabase project: Settings → API

# In the Supabase SQL editor, run supabase/migrations/001…007 in order.
# Enable the email/password auth provider.

npm run dev            # http://localhost:3000
npx tsc --noEmit       # type check (the only working check)
npm run build          # production build
```

`npm run lint` will not work until an ESLint config is added (§3).

## 11. Known dependency issues

`npm audit --omit=dev` reports **4 high-severity vulnerabilities**, all in `sharp` via inherited
`libvips` advisories (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591 /
GHSA-f88m-g3jw-g9cj). `sharp` arrives transitively through Next.js image optimisation, which the
app does not currently use. `npm audit fix` is reported as available. Not applied here — this is
a documentation task — but it should be picked up in Phase 1.
