# Pod & Pollen — Technical Architecture

> Verified against the repository at commit `3aa0c54` (branch `dev`), with `npm ci`,
> `tsc --noEmit` and `next build` executed. Installed versions are the resolved versions from
> `package-lock.json`.

---

## 1. Stack summary

| Concern | Choice | Version (declared → resolved) |
|---|---|---|
| Framework | Next.js (App Router) | `^15.3.0` → **15.5.18** |
| Language | TypeScript, `strict: true` | `^5.7.0` → **5.9.3** |
| UI runtime | React | `^19.1.0` → **19.2.6** |
| | React DOM | `^19.1.0` → **19.2.6** |
| Backend / DB / Auth | Supabase (Postgres + GoTrue) | `@supabase/supabase-js ^2.49.4` → **2.106.2** |
| SSR auth cookie bridge | `@supabase/ssr` | `^0.5.2` → **0.5.2** |
| Build tooling | Next.js built-in (Webpack) | — |
| Package manager | npm (`package-lock.json`, lockfile v3) | npm 10.x |
| Linting | ESLint + `eslint-config-next` **(installed but unconfigured — see §11)** | `9.39.4` / `15.5.18` |
| Types | `@types/node` 22.19.19, `@types/react` 19.2.15, `@types/react-dom` 19.2.3 | |

**There are no other runtime dependencies.** No component library, no CSS framework, no state
library, no form library, no date library, no ORM, no test framework, no analytics, no error
monitoring. The dependency tree is deliberately tiny: 5 runtime deps, 6 dev deps.

---

## 2. Textual architecture diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          BROWSER (phone / tablet / desktop)              │
│                                                                          │
│   Next.js App Router — only TWO real routes                              │
│   ┌────────────────────────┐        ┌──────────────────────────────┐     │
│   │ /auth                  │        │ /  (route group "(app)")     │     │
│   │  src/app/auth/page.tsx │        │  src/app/(app)/page.tsx      │     │
│   │  ├ AuthWelcome         │        │   └ <DataProvider>           │     │
│   │  ├ SignUpFlow          │        │       └ <AppGate>            │     │
│   │  ├ SignInFlow          │        │           └ <AppShell>       │     │
│   │  └ ForgotPasswordFlow  │        │                              │     │
│   └────────────────────────┘        └──────────────────────────────┘     │
│                                                                          │
│   AppShell = the ENTIRE application. All "screens" are components        │
│   swapped by local React state, not by URL.                              │
│                                                                          │
│     tab: 'home' | 'collection' | 'crosses' | 'garden'                    │
│     stack: StackFrame[]   ← push/pop navigation, in memory only          │
│     sheet: SheetState|null ← the currently open modal/bottom sheet       │
│                                                                          │
│     ├── screens/   home · collection · iris-detail · garden(+detail)     │
│     │              crosses(+detail, compare) · search · settings         │
│     │              customize · import · calendar · in-flower · onboarding│
│     └── flows/     add-iris · add-location · add-photo · add-seedlings   │
│                    quick-note · record-flowering · record-pollination    │
│                    evaluation · eval-history · stage-sheet · photo-viewer│
│                                                                          │
│   ┌────────────────────────────────────────────────────────────────┐     │
│   │ DataProvider  (src/lib/data-context.tsx)                       │     │
│   │  • loads EVERY table for the user once, in parallel, on mount  │     │
│   │  • holds the entire dataset in React state                     │     │
│   │  • derives joined views with useMemo (irises + notes +         │     │
│   │    flowering + evaluations; locations + counts; recent feed)    │     │
│   │  • every mutation = await DB write, then patch local state     │     │
│   │  • region preference read from localStorage (NOT the DB)       │     │
│   └────────────────────────────────────────────────────────────────┘     │
│                              │                                           │
│   ┌──────────────────────────▼─────────────────────────────────────┐     │
│   │ src/lib/db/queries.ts — the ONLY module that talks to Postgres │     │
│   │  fetch* / insert* / update* / delete* + row→app-shape mappers  │     │
│   │  src/lib/db/row-types.ts — hand-written snake_case row types   │     │
│   └──────────────────────────┬─────────────────────────────────────┘     │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │  supabase-js (HTTPS / PostgREST)
                               │  anon key + user JWT in cookies
        ┌──────────────────────▼───────────────────────────────────┐
        │                      SUPABASE                            │
        │  ┌─────────────┐   ┌──────────────────────────────────┐  │
        │  │ Auth (GoTrue)│   │ Postgres                         │  │
        │  │ email + pw   │   │  profiles · user_settings*       │  │
        │  │ JWT → cookie │   │  locations · irises · crosses    │  │
        │  └─────────────┘   │  seed_batches · notes · photos*  │  │
        │                    │  flowering_records · evaluations │  │
        │                    │  ROW LEVEL SECURITY on all       │  │
        │                    └──────────────────────────────────┘  │
        │  ┌──────────────────────────────────────────────────┐    │
        │  │ Storage bucket 'iris-photos'  — NOT CREATED,      │    │
        │  │ commented out in migration 001, no code uses it   │    │
        │  └──────────────────────────────────────────────────┘    │
        └──────────────────────────────────────────────────────────┘
             * user_settings and photos tables exist but NO code reads or writes them

  Edge:  src/middleware.ts — refreshes the Supabase session cookie on every request
         and redirects unauthenticated users to /auth (and authenticated users away
         from /auth).
```

---

## 3. Routing

**The application has exactly two URLs.** This is the single most consequential architectural
decision in the codebase.

| Route | File | Rendering |
|---|---|---|
| `/` | `src/app/(app)/page.tsx` | Dynamic (server-rendered on demand, `ƒ`) |
| `/auth` | `src/app/auth/page.tsx` | Static (`○`) |
| `/icon.svg` | `src/app/icon.svg` | Static asset |
| `/_not-found` | Next.js default | Static |

Everything a user perceives as a "page" — the collection, an individual iris, the garden map,
a cross, settings — is a component rendered by `AppShell` based on in-memory state.

**Consequences, all of which the incoming developer must understand:**
- **No deep links.** You cannot link to an individual iris, share a URL to a cross, or bookmark
  the garden. There is no way to reference a record from outside the app.
- **The browser Back button exits the app** rather than popping the internal navigation stack.
  The internal stack is only navigable via in-app back buttons.
- **A page refresh always returns to the Home tab**, losing the user's place.
- **No server-side data fetching or streaming.** Everything is client-side after auth.
- Search-engine indexing and link previews are irrelevant now but impossible later without
  restructuring.

Navigation is implemented in `src/components/app/app-shell.tsx`:
```
tab      : Tab                       // one of the four bottom-nav tabs
stack    : StackFrame[]              // { view: string, params: Record<string, any> }
go(view, params)                     // push; go(-1) pops
```
`renderScreen()` is a `switch` on the current view string. **View names are untyped strings**,
which has already caused a live navigation bug — see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md) (`go('irisDetail')` has no matching case).

---

## 4. State management

There is no state library. Three layers:

**1. Server data — `DataProvider` (`src/lib/data-context.tsx`, 405 lines)**
A single React context holding the user's *entire* dataset. On mount it issues seven parallel
queries (locations, irises, notes, flowering, evaluations, crosses, seed batches) and stores
each result in `useState`.

Derived data is computed with `useMemo`:
- `irises` — raw irises joined to their notes, flowering history and evaluations via `Map`
  grouping (O(n)), plus **self-healing parent links**: where a parent was stored only by name,
  the id is resolved at load time from a name→id index.
- `crosses` — same self-healing for pod/pollen parent ids.
- `locations` — with live plant counts.
- `recent` — the 8 most recent notes across all plants, for the Home activity feed.

Mutations follow a consistent pattern: `await` the database write, then patch local state with
the returned row. There is **no optimistic UI and no cache invalidation**; the returned row is
the source of truth.

One notable piece of business logic lives here: `updateIris` performs a **rename cascade** —
when a plant is renamed, every child iris and every cross that referenced it (by id, or by the
old name where no id was stored) is updated so breeding lines survive renames.

**2. UI state — `AppShell` local `useState`**
Tab, navigation stack, open sheet, toast message, widget list, user object.

**3. Per-device preferences — `localStorage`**
Three keys, all prefixed `bl_` (a legacy of the project's original name, *Bloomline*):

| Key | Purpose | Written by |
|---|---|---|
| `bl_region_<userId>` | UK/US region preference | `data-context.tsx` |
| `bl_units_<userId>` | Legacy cm/in key, migrated to region on read | (read only) |
| `bl_widgets_<userId>` | Ordered dashboard widget ids | `app-shell.tsx` |
| `bl_onboarded_<userId>` | Onboarding-complete flag | `app-shell.tsx` |

> **Architectural discrepancy:** a `user_settings` table exists in migration 001 with
> `widget_ids`, `accent_color` and `text_size` columns and full RLS. **No code reads or writes
> it.** All preferences are device-local, so they do not follow the user between devices or
> browsers, and onboarding re-runs on each new device. See
> [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) and [TECH_DEBT.md](./TECH_DEBT.md).

---

## 5. Backend, database and authentication

**Supabase** provides Postgres, authentication and (nominally) storage.

Three client constructions, correct for their contexts:
- `src/lib/supabase/client.ts` — `createBrowserClient`, used by all client components.
- `src/lib/supabase/server.ts` — `createServerClient` with Next's `cookies()`, used only by
  `src/app/(app)/layout.tsx`.
- `src/middleware.ts` — its own `createServerClient` wired to request/response cookies, so the
  session is refreshed on every request.

**Auth** is Supabase email + password. Sign-up (`src/components/auth/sign-up-flow.tsx`) is a
three-step flow (email → password ≥ 8 chars → name + optional garden name) that calls
`supabase.auth.signUp` with `options.data` metadata, then upserts a `profiles` row. Password
reset uses `resetPasswordForEmail`.

Two independent auth guards, deliberately layered:
1. `src/middleware.ts` — redirects unauthenticated requests for non-`/`, non-`/auth` paths to
   `/auth`, and authenticated requests for `/auth` to `/`.
2. `src/app/(app)/layout.tsx` — a server component that calls `getUser()` and `redirect('/auth')`.
   This is what actually protects `/`, since the middleware explicitly exempts it.

**Authorisation** is entirely Postgres Row Level Security. Every user-owned table carries
`user_id uuid references auth.users(id) on delete cascade not null` and a policy of the form
`using (auth.uid() = user_id) with check (auth.uid() = user_id)` — which in Postgres defaults to
`FOR ALL`. Application queries additionally filter `.eq('user_id', userId)` as defence in depth.

A trigger `on_auth_user_created` auto-creates a `profiles` row on sign-up.

---

## 6. Styling

**Inline React style objects plus one global stylesheet.** No CSS modules, no Tailwind, no
styled-components, no CSS-in-JS library.

`src/app/globals.css` (140 lines) defines the design system as CSS custom properties on
`:root` — a warm paper-and-olive palette (`--bg: #F5F2EA`, `--accent: #5F7A52`), semantic
status colours (green / amber / rose / clay), three shadow levels and four radius steps.
Components reference these as `var(--accent)` inside inline styles.

Shared style constants live in `src/components/ui/shared.tsx` and are spread into components:
`btnReset`, `iconBtn`, `inputStyle`, `selectStyle`, `labelStyle`.

Two fonts — **Bricolage Grotesque** (display) and **Lexend** (body) — are loaded by a
`@import url(https://fonts.googleapis.com/...)` at the top of `globals.css`.

> **Two consequences worth noting:** the fonts are a render-time third-party network
> dependency (they silently fall back to `system-ui` offline), and serving Google Fonts from
> Google's servers is a GDPR consideration for a UK/EU product heading towards commercial
> release. `next/font` would resolve both.

**Responsive strategy:** a single `useIsDesktop()` hook (`src/lib/use-is-desktop.ts`) matching
`(min-width: 1024px)`. It is SSR-safe — it starts `false` (mobile-first) and upgrades after
mount, which means desktop users see a brief mobile layout on first paint. `AppShell` branches
on it to render either a sidebar layout (`DesktopSidebar`, max-width 1020px content column) or a
mobile layout (`BottomNav`, sticky header). Individual screens receive `wide` as a prop.

---

## 7. Image and file storage

**Not implemented.** `next.config.ts` whitelists `*.supabase.co/storage/v1/object/**` as a
remote image pattern, and migration 001 contains the `iris-photos` bucket creation and storage
RLS policies — **commented out**, to be run manually. Neither has been done, and no application
code references Supabase Storage. See
[FEATURE_SPECIFICATION.md § Photos](./FEATURE_SPECIFICATION.md).

---

## 8. APIs

**There are none.** No route handlers, no `app/api/**`, no server actions, no edge functions,
no RPC. The browser talks directly to Supabase PostgREST using the anon key, with RLS providing
all access control. The only server-side code is the middleware and the `(app)` layout guard.

---

## 9. Hosting and deployment

**Vercel**, by inference rather than by committed configuration:
- `.gitignore` ignores `.vercel`.
- `.env.example` gives per-environment instructions for Vercel Preview and Production.
- Commit `3aa0c54` is "chore: no-op commit to refresh the deployment".

There is **no `vercel.json`, no `.github/` directory and no CI pipeline of any kind.** Nothing
runs typecheck, lint, build or tests on push. Deployment is presumed to be Vercel's automatic
Git integration.

The intended environment topology (from `.env.example` and the founding brief) is
local → preview → staging → production, with a **separate Supabase project per environment**.

---

## 10. PWA and service workers

**Declared but not delivered.** `src/app/layout.tsx` sets:
```ts
manifest: '/manifest.json',
appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Pod & Pollen' },
themeColor: '#F5F2EA',
```
**There is no `public/` directory in the repository at all**, therefore no `manifest.json` and
no icon set. The manifest link resolves to a 404. There is no service worker, no `next-pwa`,
`serwist` or `workbox` dependency, and no offline cache. The app is **not installable and has no
offline capability**. See
[FEATURE_SPECIFICATION.md § Offline functionality](./FEATURE_SPECIFICATION.md#offline-functionality).

---

## 11. Development tooling, analytics, monitoring, testing

| Concern | Status |
|---|---|
| Type checking | `tsc --noEmit` — **passes clean**; `strict: true`; path alias `@/*` → `./src/*` |
| Linting | **Broken.** `eslint` and `eslint-config-next` are installed but **no ESLint config file exists**. `npm run lint` (`next lint`) drops into an interactive setup prompt and exits 1. |
| Formatting | None. No Prettier, no EditorConfig. |
| Testing | **None.** No test runner, no test files, no `test` script. |
| CI | None. |
| Analytics | None. |
| Error monitoring | None. Errors go to `console.error`. |
| Pre-commit hooks | None. |

---

## 12. Architectural decisions and unusual patterns worth knowing

**1. Single-route SPA inside Next.js.** The app uses Next.js for auth, middleware and
deployment, but not for routing. This is unusual and is the largest structural constraint on
future work (see §3).

**2. Load-everything-once data strategy.** `DataProvider` fetches the user's complete dataset on
mount and never refetches unless `refresh()` is called explicitly. This makes every screen
instant and every filter/sort/aggregate a pure client-side computation, which suits an offline-
oriented garden tool. It will not scale — a grower with thousands of plants and years of notes
will feel the initial load, and there is no pagination anywhere.

**3. Hand-written row types instead of generated ones.** `src/lib/db/row-types.ts` mirrors the
SQL by hand. The file says so explicitly and suggests swapping to Supabase-CLI-generated
`Database['public']['Tables']` types later. **Nothing enforces that these stay in sync with the
migrations** — a schema change that is not mirrored here compiles cleanly and fails at runtime.

**4. Two-layer name/id parentage with self-healing.** Parentage is stored redundantly as *both*
a denormalised name (`pod_parent`) and a foreign key (`pod_parent_id`). Migration 004 added the
ids and backfilled them by name match. At load time, `DataProvider` heals any missing id from a
name index; on rename, `updateIris` cascades both. This is a pragmatic response to the real
requirement that parents may be plants the user does not own — but it means **two sources of
truth for every lineage link**.

**5. Canonical-storage / display-formatting split.** All dates are stored ISO (`yyyy-mm-dd`) and
all lengths as **whole centimetres**, regardless of region. `src/lib/format.ts` converts at
render time only. This is a sound design that prevents drift from merely *toggling* region —
though it does not prevent drift from *editing* in the non-canonical unit (see
[KNOWN_ISSUES.md](./KNOWN_ISSUES.md)).

**6. Data-driven evaluation rubric.** `src/lib/rubric.ts` models the BIS marking form as data
(`categories`, `max`, `group`), with `rubricFor(region)` as the selection point. A US or other
rubric can be added as data without touching the evaluation UI. Scores are stored as `jsonb`
keyed by category. This is the cleanest abstraction in the codebase.

**7. Legacy evaluation columns retained.** Migration 007 added `scores`/`total`/`rubric` and
left the old 1–5 columns (`form`, `colour`, `substance`, `branching`, `vigour`, `average`,
`verdict`) in place for reading old records. They are **never written**, but one UI still reads
them (see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)).

**8. Widget-driven dashboard.** The Home screen is composed from an ordered list of widget ids.
`src/lib/data/index.ts` holds the widget catalogue, and onboarding answers feed
`recommendWidgets()` to produce a personalised starting set. Goal options for onboarding are
*derived from* widget metadata, so adding a widget can add an onboarding option.

**9. Procedural iris illustrations.** `src/components/ui/iris-bloom.tsx` draws an SVG iris from a
named colour palette (`PAL` in `src/lib/data/index.ts`) as a stand-in for real photographs.
Every "photo" in the app today is one of these.
