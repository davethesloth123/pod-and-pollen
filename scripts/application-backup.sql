-- Read-only dashboard fallback. Export results privately outside Git.
-- Does not include passwords, password hashes, tokens or sessions.
select jsonb_build_object(
  'format', 'pod-pollen-application-backup-v1',
  'captured_at', now(),
  'project_ref', 'ejdvmlpuwldgetchpsdl',
  'data', jsonb_build_object(
    'profiles', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.profiles t),
    'user_settings', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.user_settings t),
    'locations', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.locations t),
    'irises', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.irises t),
    'crosses', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.crosses t),
    'seed_batches', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.seed_batches t),
    'notes', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.notes t),
    'photos', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.photos t),
    'flowering_records', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.flowering_records t),
    'evaluations', (select coalesce(jsonb_agg(to_jsonb(t) order by id), '[]') from public.evaluations t)
  ),
  'auth_account_map', (select jsonb_agg(jsonb_build_object('id', id, 'email', email,
    'created_at', created_at, 'raw_user_meta_data', raw_user_meta_data) order by id) from auth.users),
  'catalog', jsonb_build_object(
    'columns', (select jsonb_agg(to_jsonb(c)) from information_schema.columns c where table_schema = 'public'),
    'constraints', (select jsonb_agg(jsonb_build_object('table', conrelid::regclass::text,
      'name', conname, 'definition', pg_get_constraintdef(oid), 'validated', convalidated))
      from pg_constraint where connamespace = 'public'::regnamespace),
    'indexes', (select jsonb_agg(to_jsonb(i)) from pg_indexes i where schemaname = 'public'),
    'policies', (select jsonb_agg(to_jsonb(p)) from pg_policies p where schemaname = 'public'),
    'tables', (select jsonb_agg(jsonb_build_object('table', relname, 'rls', relrowsecurity,
      'force_rls', relforcerowsecurity, 'owner', pg_get_userbyid(relowner))) from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'),
    'triggers', (select jsonb_agg(to_jsonb(t)) from information_schema.triggers t where event_object_schema in ('public', 'auth')),
    'functions', (select jsonb_agg(pg_get_functiondef(oid)) from pg_proc where pronamespace = 'public'::regnamespace and prokind = 'f'),
    'grants', (select jsonb_agg(to_jsonb(g)) from information_schema.table_privileges g where table_schema = 'public'),
    'roles', (select jsonb_agg(jsonb_build_object('name', rolname, 'login', rolcanlogin,
      'inherit', rolinherit, 'bypassrls', rolbypassrls, 'superuser', rolsuper)) from pg_roles),
    'role_memberships', (select jsonb_agg(jsonb_build_object('role', pg_get_userbyid(roleid),
      'member', pg_get_userbyid(member), 'admin', admin_option)) from pg_auth_members)
  )
) as backup;
