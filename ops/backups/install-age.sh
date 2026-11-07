#!/usr/bin/env bash
# Official release; digest from the GitHub release asset metadata.
set -euo pipefail
[[ $(uname -m) == x86_64 ]] || exit 1
backup_tmp=$(mktemp -d)
trap 'rm -rf "$backup_tmp"' EXIT
curl -fsSL https://github.com/FiloSottile/age/releases/download/v1.3.2/age-v1.3.2-linux-amd64.tar.gz -o "$backup_tmp/age.tgz"
printf '%s  %s\n' cbe24006683f8eb669266162894b9a522a1af52f2665fbc63a4bb032ed26ac10 "$backup_tmp/age.tgz" | sha256sum -c -
tar -xzf "$backup_tmp/age.tgz" -C "$backup_tmp" age/age
install -d "$HOME/.local/bin"
install -m 755 "$backup_tmp/age/age" "$HOME/.local/bin/age"
