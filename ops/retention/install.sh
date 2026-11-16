#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
sudo install -m 644 ops/retention/news-digest-retention.{service,timer} /etc/systemd/system/
sudo install -m 644 ops/retention/tmpfiles.conf /etc/tmpfiles.d/news-digest-retention.conf
sudo systemctl daemon-reload
sudo systemctl enable --now news-digest-retention.timer
