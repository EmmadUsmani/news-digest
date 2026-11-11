-- Run before catalog credential preflight when pg_stat_statements is installed.
-- Its extension views otherwise grant SELECT through PUBLIC. Preserve existing
-- named roles' effective SELECT access before removing that inherited grant.
-- Future roles must receive an explicit grant if they need these views.
BEGIN;
DO $$
DECLARE
  view_row record;
  role_row record;
BEGIN
  FOR view_row IN
    SELECT n.nspname, c.relname, c.oid
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_depend d ON d.classid = 'pg_class'::regclass AND d.objid = c.oid
      AND d.deptype = 'e'
    JOIN pg_extension e ON e.oid = d.refobjid
    WHERE e.extname = 'pg_stat_statements' AND c.relkind = 'v'
  LOOP
    FOR role_row IN
      SELECT rolname FROM pg_roles
      WHERE rolname NOT LIKE 'pg_%' AND rolname <> 'schema_catalog_reader'
        AND NOT rolsuper AND has_table_privilege(oid, view_row.oid, 'SELECT')
    LOOP
      EXECUTE format('GRANT SELECT ON %I.%I TO %I',
        view_row.nspname, view_row.relname, role_row.rolname);
    END LOOP;
    EXECUTE format('REVOKE SELECT ON %I.%I FROM PUBLIC',
      view_row.nspname, view_row.relname);
  END LOOP;
END $$;
COMMIT;
