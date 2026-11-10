-- PREPARED ONLY: not installed by observability setup or app migrations.
-- Run as the database owner only after public-tool rollout approval.
-- Separate from the private operational datasource; never grant its role here.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'grafana_public_product') THEN
    CREATE ROLE grafana_public_product LOGIN;
  END IF;
END $$;
ALTER ROLE grafana_public_product WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 3;
ALTER ROLE grafana_public_product SET default_transaction_read_only = on;
ALTER ROLE grafana_public_product SET statement_timeout = '5s';
ALTER ROLE grafana_public_product SET lock_timeout = '500ms';
ALTER ROLE grafana_public_product SET idle_in_transaction_session_timeout = '10s';
ALTER ROLE grafana_public_product SET search_path = grafana_public;
CREATE SCHEMA IF NOT EXISTS grafana_public;
REVOKE ALL ON SCHEMA grafana_public FROM PUBLIC;
GRANT USAGE ON SCHEMA grafana_public TO grafana_public_product;
-- Owner-executed security-barrier views deliberately withhold underlying grants.
-- Counts never inspect snapshots, ownership, run IDs or unpublished rows.
CREATE OR REPLACE VIEW grafana_public.published_editions
WITH (security_barrier = true) AS
  SELECT date_trunc('day', published_at AT TIME ZONE 'UTC') AS day_utc,
    count(*) AS editions
  FROM public.digest_previews WHERE published_at IS NOT NULL
  GROUP BY 1;
-- Aggregate only published content; never project topic names, IDs or text.
CREATE OR REPLACE VIEW grafana_public.published_content
WITH (security_barrier = true) AS
  SELECT date_trunc('day', d.published_at AT TIME ZONE 'UTC') AS day_utc,
    count(t.topic) AS topics,
    coalesce(sum(CASE WHEN jsonb_typeof(t.topic->'stories') = 'array'
      THEN jsonb_array_length(t.topic->'stories') ELSE 0 END), 0)::bigint AS stories,
    coalesce(sum(CASE WHEN jsonb_typeof(t.topic->'posts') = 'array'
      THEN jsonb_array_length(t.topic->'posts') ELSE 0 END), 0)::bigint AS posts
  FROM public.digest_previews d
  LEFT JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(d.snapshot->'topics') = 'array'
      THEN d.snapshot->'topics' ELSE '[]'::jsonb END
  ) AS t(topic) ON true
  WHERE d.published_at IS NOT NULL
  GROUP BY 1;
CREATE OR REPLACE VIEW grafana_public.source_health
WITH (security_barrier = true) AS
  SELECT id, enabled, last_success, last_attempt, last_item_count,
    (last_error IS NOT NULL) AS has_error
  FROM public.content_sources;
REVOKE ALL ON ALL TABLES IN SCHEMA grafana_public FROM PUBLIC;
GRANT SELECT ON grafana_public.published_editions, grafana_public.published_content, grafana_public.source_health
  TO grafana_public_product;
-- No blanket/future-table grants, SECURITY DEFINER functions or raw error text.
-- Database CONNECT uses the deployment database's existing CONNECT policy.
