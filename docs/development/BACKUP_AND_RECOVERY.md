# Backup and recovery — shared hosted development

The single project `pod-pollen-dev` contains protected existing data. Never reset it, create a replacement project/local stack, or perform a destructive restore merely to test recovery. See [environment policy](DATA_ENVIRONMENT.md).

## Current platform situation (9 September 2026)

The authenticated dashboard identifies the Free plan and explicitly states that it does not include project backups. No downloadable scheduled backup is available. No plan, PITR or other service setting was changed. Supabase recommends regular independent exports for Free projects; database backups do not include Storage object contents. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups).

## Preferred supported logical dump

When secure existing database credentials and supported tooling are available, follow the current [Supabase CLI backup workflow](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore): separate role information, schema and data exports, with connection credentials supplied privately. Never paste passwords into Git, logs or shell history; never reset/change the database password just to obtain a dump. The documentation's password-reset step is NOT authorized here. CLI/Docker/pg_dump and a database credential were not configured for this setup; no local Supabase stack was created.

## Safe dashboard fallback

The authorized fallback in `scripts/application-backup.sql` uses a single read-only SELECT in the existing dashboard to capture all rows/all columns from the ten public application tables, plus columns, constraints, indexes, RLS policies, triggers, function definitions, non-password role attributes/memberships and grants. An account-ID/email/metadata map preserves identity associations; passwords, hashes, sessions and tokens are excluded. A single statement gives a consistent application snapshot. Export the result locally; do not paste its contents into documentation.

Private destination for this setup: `~/PodAndPollenBackups/2026-09-09T101154Z-pre-codex-development/` (directory mode 0700, files 0600). The directory is outside Git. Save parsed `application-backup.json`, the raw export, migration-source copies, checksums and a verification report there. `node scripts/verify-backup.mjs <absolute-private-json-path>` performs offline format/owner/table/constraint/RLS validation and writes a private verification report. It never restores or calls Supabase. Keep a separate encrypted/off-site copy only through an explicitly approved private destination; none is uploaded by this task.

Status: backup export is pending explicit approval after automatic review rejected the private-data download. No hosted writes may start until the export is present and verified. This status must be updated with the observed result before claiming a backup exists.

## Coverage and limits

This fallback can recover application rows and their historical values/links while their Auth owner IDs remain available, and supports manual schema reconstruction with catalog metadata and migration sources. It is **not a supported full logical pg_dump, a tested full-project restore, or a replacement for Auth/service backup**. It excludes passwords/hashes/sessions/tokens, provider secrets, managed schemas' full internals, service configuration and Storage objects. There are currently no photo rows or buckets, but future photo backups must explicitly include objects. Catalog JSON is recovery evidence, not an automatically executable restore script.

Backups are private user data. Do not commit, publish, attach to issues, or include record contents in reports. A checksum establishes local file integrity, not recoverability of every platform feature.

## Frequency and mandatory checkpoints

Take a fresh private snapshot before starting a consequential development write session, and at least daily while active users are accumulating data during development. A pre-migration backup is mandatory before transformative/destructive changes, backfills, bulk imports, delete-policy changes or any migration with material data impact. Additive migrations still require impact review and an appropriate recent verified backup. Keep timestamped snapshots; do not overwrite the only known-good copy. Agree retention and encrypted off-site storage with Dave.

## Recovery procedure (never automatic)

1. Stop the offending application writes and identify scope/time; do not reset or erase the current project.
2. Preserve a fresh incident-state export and the original known-good backup; validate checksums and compare affected owner/record IDs.
3. Review the schema/version, Auth ownership and dependency order. Prefer the smallest owner-scoped restoration/repair that preserves newer unaffected records. Cyclic iris/cross links require a reviewed staged insert/link procedure; do not disable RLS/FKs casually.
4. Obtain explicit authorization for the exact restore/data migration and any necessary Auth recovery. This setup does not authorize a full restore, replacement database or account recreation.
5. Apply deliberately with affected-record logging kept private, verify counts/relationships and existing-user operation, then reopen the affected functionality.

No destructive restoration rehearsal was performed. Full catastrophe recovery remains limited until a supported logical/platform backup and an approved recovery validation approach are available.
