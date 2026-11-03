#!/usr/bin/env bash
# Installs only the local alert evaluator; no app, Postgres or Redis restarts.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || exit 1
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://github.com/VictoriaMetrics/VictoriaMetrics/releases/download/v1.155.0/vmutils-linux-amd64-v1.155.0.tar.gz -o "$obs_tmp/vmutils.tgz"
printf '%s  %s\n' b6181fc16cf19835706ea5d67215eea56c1fe87350fdfd82a5ff803ea2c1a907 "$obs_tmp/vmutils.tgz" | sha256sum -c -
tar -xzf "$obs_tmp/vmutils.tgz" -C "$obs_tmp" vmalert-prod vmalert-tool-prod
"$obs_tmp/vmalert-prod" -rule=ops/observability/alerts.yml -dryRun
sudo install -m 755 "$obs_tmp/vmalert-prod" "$obs_tmp/vmalert-tool-prod" /opt/news-digest-observability/
sudo install -m 644 ops/observability/alerts.yml /etc/news-digest-observability/
sudo install -m 644 ops/observability/obs-alerts.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable obs-alerts.service
sudo systemctl restart obs-alerts.service
