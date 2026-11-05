#!/usr/bin/env bash
# Bounded statement timing; retains container identity and log paths on first deploy.
set -euo pipefail
cd "$(dirname "$0")/../.."
node --input-type=module <<'JS'
const { readFileSync } = await import('node:fs');
const { homedir } = await import('node:os');
const { parseEnv } = await import('node:util');
const token = parseEnv(readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')).ADMIN_LOCAL_TOKEN;
if (!token) throw new Error('Local admin token is missing');
const response = await fetch('http://127.0.0.1:8000/api/admin/status', { headers: { ADMIN_LOCAL_TOKEN: token }, redirect: 'error' });
if (!response.ok) throw new Error('Cannot verify publication schedule');
const status = await response.json();
const queue = status.queues.find(q => q.name === 'digest-generation');
const next = Date.parse(queue?.nextRun);
if (!queue?.available || !Number.isFinite(next) || next - Date.now() < 7200000 || queue.counts.active > 0)
  throw new Error('Refusing Postgres restart: active, unknown or due within two hours');
console.log('Publication idle and more than two hours away');
JS
obs_loaded=$(docker compose exec -T postgres psql -U postgres -d news_digest -Atc "SHOW shared_preload_libraries")
if [[ "$obs_loaded" != pg_stat_statements ]]; then
  [[ -z "$obs_loaded" ]] || { echo 'Unexpected preload configuration; refusing overwrite'; exit 1; }
  docker compose exec -T postgres psql -U postgres -d news_digest -v ON_ERROR_STOP=1 <<'SQL'
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.max = '1000';
ALTER SYSTEM SET pg_stat_statements.track = 'top';
ALTER SYSTEM SET pg_stat_statements.track_utility = 'off';
SQL
  docker compose restart postgres
fi
for obs_attempt in {1..30}; do
  if docker compose exec -T postgres pg_isready -U postgres >/dev/null; then break; fi
  sleep 1
done
docker compose exec -T postgres psql -U postgres -d news_digest -v ON_ERROR_STOP=1 < ops/observability/query-stats.sql
