-- No query text, usernames, or general statistics-reader membership exposed.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;
CREATE OR REPLACE FUNCTION public.observability_query_stats()
RETURNS TABLE(query_id text, calls bigint, total_ms double precision,
  mean_ms double precision, rows bigint, shared_hits bigint, shared_reads bigint,
  stats_since timestamptz)
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = pg_catalog
AS $$
  SELECT s.queryid::text, sum(s.calls)::bigint, sum(s.total_exec_time),
    sum(s.total_exec_time) / nullif(sum(s.calls), 0), sum(s.rows)::bigint,
    sum(s.shared_blks_hit)::bigint, sum(s.shared_blks_read)::bigint,
    min(s.stats_since)
  FROM public.pg_stat_statements s
  WHERE s.dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
    AND s.userid <> (SELECT oid FROM pg_roles WHERE rolname = 'grafana_product')
    AND s.userid <> (SELECT oid FROM pg_roles WHERE rolname = 'postgres_metrics')
    AND s.queryid IS NOT NULL
  GROUP BY s.queryid
$$;
REVOKE ALL ON FUNCTION public.observability_query_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.observability_query_stats() TO grafana_product;
