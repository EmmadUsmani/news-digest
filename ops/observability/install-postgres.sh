#!/usr/bin/env bash
# Aggregate database metrics only; no Postgres, Redis or application restart.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || exit 1
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://github.com/prometheus-community/postgres_exporter/releases/download/v0.20.1/postgres_exporter-0.20.1.linux-amd64.tar.gz -o "$obs_tmp/postgres.tgz"
printf '%s  %s\n' 89d4f7e7920cad48fdc3133f789556ef5253c330a9f5fdace3bdb6344c0a8b5a "$obs_tmp/postgres.tgz" | sha256sum -c -
tar -xzf "$obs_tmp/postgres.tgz" -C "$obs_tmp"
docker compose exec -T postgres psql -U postgres -d news_digest -v ON_ERROR_STOP=1 < ops/observability/postgres-reader.sql
sudo install -d /opt/news-digest-observability /etc/news-digest-observability
sudo install -m 755 "$obs_tmp/postgres_exporter-0.20.1.linux-amd64/postgres_exporter" /opt/news-digest-observability/
sudo install -m 644 ops/observability/obs-postgres.service /etc/systemd/system/
sudo install -m 644 ops/observability/scrape.yml /etc/news-digest-observability/
sudo install -m 755 ops/observability/unit-metrics.py /opt/news-digest-observability/
sudo systemctl daemon-reload
sudo systemctl enable obs-postgres.service
sudo systemctl restart obs-postgres.service
sudo systemctl start obs-unit-metrics.service
sudo systemctl kill --kill-whom=main --signal=HUP obs-metrics.service
