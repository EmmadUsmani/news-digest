-- PREPARED ONLY: not installed by app migrations or service setup.
-- This role backs fixed catalog queries, never caller-supplied SQL.
-- Login credentials and service wiring require a separate reviewed deployment.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'schema_catalog_reader') THEN
    CREATE ROLE schema_catalog_reader;
  END IF;
END $$;
ALTER ROLE schema_catalog_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS;
ALTER ROLE schema_catalog_reader SET default_transaction_read_only = on;
ALTER ROLE schema_catalog_reader SET statement_timeout = '10s';
REVOKE ALL ON SCHEMA public FROM schema_catalog_reader;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM schema_catalog_reader;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM schema_catalog_reader;
-- No explicit schema USAGE or application-row grants are needed for introspection.
-- PostgreSQL PUBLIC catalog/function privileges remain: the response projection
-- and exact HTTP routing are required; this is not an arbitrary-SQL sandbox.
