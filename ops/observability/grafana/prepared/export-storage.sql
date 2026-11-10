-- PREPARED ONLY. Dedicated PostgreSQL INSTANCE, never the application cluster.
-- No application credentials, migrations, extensions, comments or raw rows here.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'grafana_export_reader') THEN
    CREATE ROLE grafana_export_reader LOGIN;
  END IF;
END $$;
ALTER ROLE grafana_export_reader WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 3;
ALTER ROLE grafana_export_reader SET default_transaction_read_only = on;
ALTER ROLE grafana_export_reader SET statement_timeout = '5s';
ALTER ROLE grafana_export_reader SET lock_timeout = '500ms';
ALTER ROLE grafana_export_reader SET idle_in_transaction_session_timeout = '10s';
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
CREATE SCHEMA IF NOT EXISTS grafana_public;
REVOKE ALL ON SCHEMA grafana_public FROM PUBLIC;
CREATE TABLE IF NOT EXISTS grafana_public.published_editions (
  day_utc timestamp PRIMARY KEY, editions bigint NOT NULL CHECK (editions >= 0)
);
CREATE TABLE IF NOT EXISTS grafana_public.published_content (
  day_utc timestamp PRIMARY KEY, topics bigint NOT NULL CHECK (topics >= 0),
  stories bigint NOT NULL CHECK (stories >= 0), posts bigint NOT NULL CHECK (posts >= 0)
);
CREATE TABLE IF NOT EXISTS grafana_public.source_summary (
  singleton boolean PRIMARY KEY CHECK (singleton),
  sources integer NOT NULL CHECK (sources >= 0),
  enabled integer NOT NULL CHECK (enabled BETWEEN 0 AND sources),
  errors integer NOT NULL CHECK (errors BETWEEN 0 AND enabled)
);
CREATE TABLE IF NOT EXISTS grafana_public.export_status (
  singleton boolean PRIMARY KEY CHECK (singleton),
  captured_at timestamptz NOT NULL
);
REVOKE ALL ON ALL TABLES IN SCHEMA grafana_public FROM PUBLIC;
GRANT USAGE ON SCHEMA grafana_public TO grafana_export_reader;
GRANT SELECT ON grafana_public.published_editions, grafana_public.published_content,
  grafana_public.source_summary, grafana_public.export_status TO grafana_export_reader;
-- The exporter can replace counts but cannot read them or alter storage.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'grafana_export_writer') THEN
    CREATE ROLE grafana_export_writer LOGIN;
  END IF;
END $$;
ALTER ROLE grafana_export_writer WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 1;
ALTER ROLE grafana_export_writer SET statement_timeout = '5s';
ALTER ROLE grafana_export_writer SET lock_timeout = '500ms';
ALTER ROLE grafana_export_writer SET idle_in_transaction_session_timeout = '10s';
GRANT USAGE ON SCHEMA grafana_public TO grafana_export_writer;
GRANT INSERT, DELETE ON grafana_public.published_editions,
  grafana_public.published_content, grafana_public.source_summary,
  grafana_public.export_status TO grafana_export_writer;
GRANT SELECT ON grafana_public.export_status TO grafana_export_writer;
-- Credentials, transport and provisioning remain uninstalled.
