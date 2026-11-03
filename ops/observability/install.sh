#!/usr/bin/env bash
# Run as the repo owner. Uses root only for local files, mounts and obs-* units.
set -euo pipefail
cd "$(dirname "$0")/../.."
[[ $(uname -m) == x86_64 ]] || { echo 'Only amd64 releases are pinned'; exit 1; }
obs_root=/opt/news-digest-observability
obs_config=/etc/news-digest-observability
obs_tmp=$(mktemp -d)
trap 'rm -rf "$obs_tmp"' EXIT
curl -fsSL https://github.com/VictoriaMetrics/VictoriaLogs/releases/download/v1.53.0/victoria-logs-linux-amd64-v1.53.0.tar.gz -o "$obs_tmp/vl.tar.gz"
curl -fsSL https://packages.fluentbit.io/ubuntu/noble/pool/main/f/fluent-bit/fluent-bit_5.1.5_amd64.deb -o "$obs_tmp/fluent.deb"
printf '%s  %s\n' \
  55feba89713cafa952673f91b8b38e7701bb0290989263da671b47a0de16edd3 "$obs_tmp/vl.tar.gz" \
  e6fc2fc006c96016776a29a67b3a060e169810703d881ff00715d1b3cbd4996d "$obs_tmp/fluent.deb" | sha256sum -c -
# Library only; never install/start a native Postgres server or restart containers.
sudo env NEEDRESTART_MODE=l apt-get install -y --no-install-recommends libpq5
sudo install -d "$obs_root" "$obs_config" /var/lib/news-digest-observability /var/lib/news-digest-logs /var/lib/news-digest-log-shipper
tar -xzf "$obs_tmp/vl.tar.gz" -C "$obs_tmp"
sudo install -m 755 "$obs_tmp/victoria-logs-prod" "$obs_root/victoria-logs-prod"
sudo dpkg-deb -x "$obs_tmp/fluent.deb" "$obs_root/fluent"
# A dedicated sparse filesystem enforces the disk ceiling, including same-day data.
# Never truncate or reformat an existing store.
if [[ ! -e /var/lib/news-digest-observability/logs.ext4 ]]; then
  sudo truncate -s 2000000000 /var/lib/news-digest-observability/logs.ext4
  sudo mkfs.ext4 -q -m 0 /var/lib/news-digest-observability/logs.ext4
fi
sudo install -m 644 ops/observability/*.service /etc/systemd/system/
sudo install -m 644 ops/observability/fluent-bit.conf ops/observability/parsers.conf ops/observability/normalize.lua "$obs_config/"
: > "$obs_tmp/containers.conf"
for obs_service in postgres redis; do
  obs_id=$(docker compose ps -q "$obs_service")
  [[ -n "$obs_id" ]] || { echo "Missing compose service: $obs_service"; exit 1; }
  obs_path=$(docker inspect --format '{{.LogPath}}' "$obs_id")
  [[ "$obs_path" == /var/lib/docker/containers/*/*-json.log ]] || { echo 'Expected Docker json-file logs'; exit 1; }
  cat >> "$obs_tmp/containers.conf" <<INPUT
[INPUT]
    Name tail
    Tag $obs_service
    Path $obs_path
    Parser docker
    DB /var/lib/news-digest-log-shipper/$obs_service.db
    Read_From_Head On
    Refresh_Interval 5
    Rotate_Wait 30
    Skip_Long_Lines On
    Buffer_Max_Size 128K
    Mem_Buf_Limit 2M
    storage.type filesystem
    storage.pause_on_chunks_overlimit On

INPUT
done
sudo install -m 644 "$obs_tmp/containers.conf" "$obs_config/containers.conf"
sudo install -d /etc/systemd/journald.conf.d
printf '[Journal]\nSystemMaxUse=500M\n' | sudo tee /etc/systemd/journald.conf.d/news-digest-observability.conf >/dev/null
sudo systemctl daemon-reload
sudo systemctl start obs-log-volume.service
sudo install -d -o exedev -g exedev /var/lib/news-digest-logs/data
sudo "$obs_root/fluent/opt/fluent-bit/bin/fluent-bit" --dry-run -c "$obs_config/fluent-bit.conf"
sudo systemctl enable obs-log-volume.service obs-logs.service obs-shipper.service
sudo systemctl restart systemd-journald.service
sudo systemctl restart obs-logs.service obs-shipper.service
