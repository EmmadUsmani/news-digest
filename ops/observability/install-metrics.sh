#!/usr/bin/env bash
# Standalone O4 reconciliation; never restarts app, DB, Redis or log services.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || exit 1
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://github.com/VictoriaMetrics/VictoriaMetrics/releases/download/v1.155.0/victoria-metrics-linux-amd64-v1.155.0.tar.gz -o "$obs_tmp/vm.tgz"
curl -fsSL https://github.com/prometheus/node_exporter/releases/download/v1.12.1/node_exporter-1.12.1.linux-amd64.tar.gz -o "$obs_tmp/node.tgz"
printf '%s  %s\n' \
  7180e65913d55ab99c0be8f4a3ad17a0fafe5598a21ff6327fecba3190d7b176 "$obs_tmp/vm.tgz" \
  b51d8a76aa2a9156a55d501aca6276fae09e262259a5e4e831d2c2222f084e63 "$obs_tmp/node.tgz" | sha256sum -c -
tar -xzf "$obs_tmp/vm.tgz" -C "$obs_tmp"
tar -xzf "$obs_tmp/node.tgz" -C "$obs_tmp"
sudo install -d /opt/news-digest-observability /etc/news-digest-observability /var/lib/news-digest-observability /var/lib/news-digest-metrics
sudo install -m 755 "$obs_tmp/victoria-metrics-prod" /opt/news-digest-observability/
sudo install -m 755 "$obs_tmp/node_exporter-1.12.1.linux-amd64/node_exporter" /opt/news-digest-observability/
sudo install -m 644 ops/observability/grafana_health.py /opt/news-digest-observability/
sudo install -m 755 ops/observability/harness-metrics.py ops/observability/unit-metrics.py /opt/news-digest-observability/
sudo install -d -o exedev -g exedev /var/lib/news-digest-node-textfile
if [[ ! -e /var/lib/news-digest-observability/metrics.ext4 ]]; then
  sudo truncate -s 700000000 /var/lib/news-digest-observability/metrics.ext4
  sudo mkfs.ext4 -q -m 0 /var/lib/news-digest-observability/metrics.ext4
fi
sudo install -m 644 ops/observability/obs-metric*.service ops/observability/obs-node.service ops/observability/obs-unit-metrics.* /etc/systemd/system/
sudo install -m 644 ops/observability/scrape.yml /etc/news-digest-observability/
sudo systemctl daemon-reload
sudo systemctl start obs-metric-volume.service
sudo systemctl enable obs-metric-volume.service obs-metrics.service obs-node.service obs-unit-metrics.timer
sudo systemctl restart obs-metrics.service obs-node.service obs-unit-metrics.timer
sudo systemctl start obs-unit-metrics.service
