-- Operational role only: no application migrations, tables or data changes.
-- Local compose Postgres uses trust auth on loopback, so no app secret is used.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'grafana_product') THEN
    CREATE ROLE grafana_product LOGIN;
  END IF;
END $$;
ALTER ROLE grafana_product WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
  NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 3;
ALTER ROLE grafana_product SET default_transaction_read_only = on;
ALTER ROLE grafana_product SET statement_timeout = '5s';
ALTER ROLE grafana_product SET lock_timeout = '500ms';
ALTER ROLE grafana_product SET idle_in_transaction_session_timeout = '10s';
ALTER ROLE grafana_product SET search_path = public;
GRANT CONNECT ON DATABASE news_digest TO grafana_product;
GRANT USAGE ON SCHEMA public TO grafana_product;
-- Explicit column allowlist, no blanket table SELECT or future-table grants.
GRANT SELECT (created_at, status, cost_micros, reserved_micros) ON llm_calls, x_discovery_calls TO grafana_product;
GRANT SELECT (run_id) ON llm_calls TO grafana_product;
GRANT SELECT (id, created_at, snapshot) ON digest_previews TO grafana_product;
GRANT SELECT (id, name) ON topics TO grafana_product;
GRANT SELECT (id, topic_id, name, last_success, last_attempt, last_item_count, last_error) ON content_sources TO grafana_product;
GRANT SELECT (source_id, item_id) ON content_observations TO grafana_product;
GRANT SELECT (id, published_at) ON content_items TO grafana_product;
GRANT SELECT (external_id, topic_id, discovered_at) ON x_search_citations TO grafana_product;
GRANT SELECT (platform, external_id) ON social_posts TO grafana_product;
GRANT SELECT (budget_day, scheduled_at, state, attempt, updated_at) ON scheduled_ai_budget_days TO grafana_product;
GRANT SELECT (id, requested_topic, search_type, posts_fetched, profiles_fetched) ON x_discovery_calls TO grafana_product;
GRANT SELECT (completed_at, error_code) ON x_discovery_calls TO grafana_product;
GRANT SELECT (id, model, purpose) ON llm_calls TO grafana_product;
GRANT SELECT (completed_at) ON llm_calls TO grafana_product;
