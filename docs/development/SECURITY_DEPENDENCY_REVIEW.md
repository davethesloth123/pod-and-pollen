# Narrow runtime dependency recommendation

Reviewed 9 September 2026. No package versions were upgraded during safe-foundation setup.

Installed: Next **15.5.18** → optional dependency **sharp 0.34.5**. Read-only npm audit still reports six affected entries (one critical, five high). Sharp inherits image-processing issues from native libraries; Next advisories also cover conditional Server Actions, rewrites, cache and Windows surfaces. The current application has no custom Server Actions/server/rewrites. No exploit or load test was run.

Smallest versions addressing the reported Next/sharp ranges: **Next 15.5.24 and sharp 0.35.4**, with matching eslint-config-next 15.5.24 for tooling consistency. Next 15.5.24 accepts sharp `^0.34.3 || ^0.35.3`, so merely updating Next may retain an old sharp lock entry. Deliberately verify/pin the resolved sharp subtree. Next 15.5.25 is the next patch alternative and declares `^0.34.3 || ^0.35.4`; the old 0.34 range still means the resulting lockfile must be checked. These are registry observations, not instructions to run an update now.

The Next maintainer lists 15.5.24 as patched for its AVIF optimizer RCE advisory. [Maintainer advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4). Current sharp advisories mark `<0.35.4` affected by libheif issues; validate the native resolution as well as the JavaScript version. [Sharp advisory](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c).

Recommended separate change: stay on Next 15.5, select the minimal supported patched combination, update only its necessary lockfile subtree/config parity, and inspect the diff. Do not batch-upgrade React, Supabase, TypeScript, ESLint major or Next 16; do not run npm audit fix.

Risks/checks: sharp 0.35.4 requires Node >=20.9; the foundation standardizes Node 24. Validate native installation on Mac and Linux CI, production build, lint/typecheck/unit checks, synthetic authenticated navigation, middleware/session behavior and harmless image handling. Review Vercel's runtime mitigation and optimizer exposure before release. A package advisory is not proof of deployed compromise. Other lint/build-tool advisories (brace-expansion/js-yaml/postcss/nanoid) need separately scoped triage after checking reachability, not automatic upgrades.
