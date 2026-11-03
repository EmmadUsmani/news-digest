#!/usr/bin/env bash
# Redis metrics only: never restart Redis, Postgres or application services.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || exit 1
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://github.com/oliver006/redis_exporter/releases/download/v1.96.0/redis_exporter-v1.96.0.linux-amd64.tar.gz -o "$obs_tmp/redis.tgz"
printf '%s  %s\n' 7e828c0edd05e0984c3be380aacb389c230463db1c1f72141ec67267fc2b7510 "$obs_tmp/redis.tgz" | sha256sum -c -
tar -xzf "$obs_tmp/redis.tgz" -C "$obs_tmp"
sudo install -d /opt/news-digest-observability /etc/news-digest-observability
sudo install -m 755 "$obs_tmp/redis_exporter-v1.96.0.linux-amd64/redis_exporter" /opt/news-digest-observability/
sudo install -m 644 ops/observability/obs-redis.service /etc/systemd/system/
sudo install -m 644 ops/observability/scrape.yml /etc/news-digest-observability/
sudo systemctl daemon-reload
sudo systemctl enable obs-redis.service
sudo systemctl restart obs-redis.service
# VictoriaMetrics supports a config reload without interrupting ingestion.
sudo systemctl kill --kill-whom=main --signal=HUP obs-metrics.service
