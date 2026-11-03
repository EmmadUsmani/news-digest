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
