#!/usr/bin/env bash
# Run from your LAPTOP. Idempotently creates the exe.dev VM, connects it to this
# GitHub repo through the exe.dev GitHub integration, clones the repo on the VM
# and runs ops/vm/setup.sh there.
#   bash ops/vm/provision.sh            # set up, don't start the agent
#   START=1 bash ops/vm/provision.sh    # set up and start the agent
set -Eeuo pipefail
VM=${VM:-news-digest}
GH_REPO=${GH_REPO:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}
INTEGRATION=${INTEGRATION:-${GH_REPO#*/}-gh}
GIT_NAME=${GIT_NAME:-$(git config user.name)}
GIT_EMAIL=${GIT_EMAIL:-$(git config user.email)}
HOST="$VM.exe.xyz"
exe() { ssh -o BatchMode=yes exe.dev "$@"; }
vm() { ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$HOST" "$@"; }
step() { printf '\n==> %s\n' "$*"; }

step "VM $VM"
if exe ls 2>/dev/null | grep -q "$HOST"; then
    echo "exists"
    exe ls | grep "$HOST" | grep -q paused && exe resume "$VM" || true
else
    exe new --name="$VM" --no-email --comment=news-digest-autonomous-build
fi

step "GitHub integration for $GH_REPO"
if exe integrations list 2>/dev/null | grep -Eq "repos=$GH_REPO( |$)"; then
    echo "exists"
else
    exe integrations add github --name="$INTEGRATION" --repository="$GH_REPO" --attach="vm:$VM"
fi

step "Wait for SSH"
for _ in $(seq 1 30); do vm true 2>/dev/null && break; sleep 5; done
vm true

step "Clone repo on VM"
vm "test -d ~/${GH_REPO#*/}/.git || git clone https://github.int.exe.xyz/$GH_REPO.git ~/${GH_REPO#*/}"
vm "cd ~/${GH_REPO#*/} && git pull --ff-only"

step "Run VM setup"
vm "cd ~/${GH_REPO#*/} && GIT_NAME='$GIT_NAME' GIT_EMAIL='$GIT_EMAIL' START='${START:-0}' bash ops/vm/setup.sh"

step "App URL (private to you by default): https://$HOST/"
