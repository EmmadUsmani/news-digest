#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
hour=$(date -u +%H)
if [ "$hour" -ge 13 ] && [ "$hour" -lt 16 ]; then
  echo 'Install outside protected 13:00–16:00 UTC window' >&2
  exit 1
fi
mkdir -p "$HOME/.config/systemd/user"
install -m 644 ops/alerting/news-digest-alert-*.service ops/alerting/news-digest-alert-*.timer "$HOME/.config/systemd/user/"
mkdir -p "$HOME/.local/state/news-digest/alerts"
chmod 700 "$HOME/.local/state/news-digest/alerts"
touch "$HOME/.local/state/news-digest/alerts/alerts.jsonl"
chmod 600 "$HOME/.local/state/news-digest/alerts/alerts.jsonl"
systemctl --user daemon-reload
systemctl --user enable --now news-digest-alert-dispatch.timer news-digest-alert-monitor.timer
systemctl --user start news-digest-alert-dispatch.service
systemctl --user start news-digest-alert-monitor.service
