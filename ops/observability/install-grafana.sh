#!/usr/bin/env bash
# O6 reconciliation: app forwarding deploys separately; no DB/Redis restarts.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || exit 1
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://dl.grafana.com/oss/release/grafana-12.4.14.linux-amd64.tar.gz -o "$obs_tmp/grafana.tgz"
printf '%s  %s\n' c19ea4f993bba6e88c1269502c5bed8f8a717d82a6f43b8cc3ee9c960bb5c462 "$obs_tmp/grafana.tgz" | sha256sum -c -
mkdir "$obs_tmp/grafana"
tar -xzf "$obs_tmp/grafana.tgz" --strip-components=1 -C "$obs_tmp/grafana"
sudo install -d /opt/news-digest-observability/grafana /etc/news-digest-observability/grafana
sudo cp -a "$obs_tmp/grafana/." /opt/news-digest-observability/grafana/
# Apply the narrowly granted reader role before enabling its datasource.
docker compose exec -T postgres psql -U postgres -d news_digest -v ON_ERROR_STOP=1 < ops/observability/grafana/sql/product-reader.sql
sudo cp -a ops/observability/grafana/. /etc/news-digest-observability/grafana/
sudo find /etc/news-digest-observability/grafana/provisioning /etc/news-digest-observability/grafana/dashboards -type f -exec chmod 644 {} +
sudo install -d /etc/news-digest-observability/grafana/provisioning/plugins /etc/news-digest-observability/grafana/provisioning/alerting
sudo install -d -o exedev -g exedev /var/lib/news-digest-grafana /var/lib/news-digest-grafana/plugins
sudo install -m 644 ops/observability/obs-grafana.service /etc/systemd/system/
sudo install -m 644 ops/observability/grafana_health.py /opt/news-digest-observability/
sudo install -m 755 ops/observability/unit-metrics.py /opt/news-digest-observability/
sudo systemctl daemon-reload
sudo systemctl enable obs-grafana.service
sudo systemctl restart obs-grafana.service
sudo systemctl start obs-unit-metrics.service
