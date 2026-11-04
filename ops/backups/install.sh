#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
install -d -m 700 "$HOME/backups/news-digest"
install -d "$HOME/.config/systemd/user"
install -m 644 ops/backups/*.service ops/backups/*.timer "$HOME/.config/systemd/user/"
systemctl --user daemon-reload
systemctl --user enable --now news-digest-backup.timer news-digest-restore-check.timer
