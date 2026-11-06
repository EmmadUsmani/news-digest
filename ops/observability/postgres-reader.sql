-- Database statistics plus column-only schedule/spend aggregates; no content or query-text grants.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres_metrics') THEN
    CREATE ROLE postgres_metrics LOGIN;
  END IF;
END $$;
ALTER ROLE postgres_metrics WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 2;
ALTER ROLE postgres_metrics SET default_transaction_read_only = on;
ALTER ROLE postgres_metrics SET statement_timeout = '3s';
ALTER ROLE postgres_metrics SET lock_timeout = '500ms';
ALTER ROLE postgres_metrics SET idle_in_transaction_session_timeout = '5s';
GRANT CONNECT ON DATABASE news_digest TO postgres_metrics;

-- Bounded schedule lifecycle aggregates only; no content or provider response grants.
GRANT USAGE ON SCHEMA public TO postgres_metrics;
GRANT SELECT (scheduled_at, state) ON scheduled_ai_budget_days TO postgres_metrics;
GRANT SELECT (created_at, status, cost_micros, reserved_micros) ON llm_calls, x_discovery_calls TO postgres_metrics;

-- Expose only saved-edition aggregates, never the underlying snapshot to metrics.
CREATE OR REPLACE VIEW bluesky_edition_alert_metrics AS
WITH editions AS (
  SELECT id, created_at,
    bool_or(topic->'blueskySelection'->>'result' IN
      ('ai-editing-failed', 'budget-refused')
      OR NOT (topic ? 'blueskySelection')) AS editing_failed,
    bool_or(coalesce(topic->'blueskySelection'->>'result', '') <> 'switched-off') AS enabled,
    bool_or(coalesce((topic->'blueskySelection'->>'openSlots')::int, 0) > 0
      AND topic->'blueskySelection'->>'result' <> 'switched-off') AS chance,
    bool_or(EXISTS (SELECT FROM jsonb_array_elements(coalesce(topic->'posts', '[]')) post
      WHERE post->>'platform' = 'bluesky')) AS picked
  FROM digest_previews CROSS JOIN LATERAL jsonb_array_elements(snapshot->'topics') topic
  -- Step 1 deployed before this boundary. Historical editions have no evidence.
  WHERE scheduled_key IS NOT NULL AND created_at >= '2026-11-06T01:36:00Z'
  GROUP BY id, created_at
), latest AS (
  SELECT * FROM editions ORDER BY created_at DESC, id DESC LIMIT 1
)
SELECT coalesce((SELECT (enabled AND editing_failed)::int FROM latest), 0) AS editing_failed,
  (SELECT count(*) FROM editions WHERE enabled AND chance AND NOT picked
    AND created_at > coalesce((SELECT max(created_at) FROM editions WHERE picked), '-infinity'))::int
    AS no_pick_chances;
REVOKE ALL ON bluesky_edition_alert_metrics FROM PUBLIC;
GRANT SELECT ON bluesky_edition_alert_metrics TO postgres_metrics;
