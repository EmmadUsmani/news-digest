-- No table or query-text grants; pg_stat_database aggregates are public.
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
