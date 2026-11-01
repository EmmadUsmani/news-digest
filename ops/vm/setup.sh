#!/usr/bin/env bash
# Idempotent setup for the news-digest exe.dev VM. Run ON the VM from the repo:
#   GIT_NAME="..." GIT_EMAIL="..." bash ops/vm/setup.sh
# Options: START=1 starts the build agent at the end; SKIP_SMOKE=1 skips the
# real Codex smoke test (which uses one tiny model request).
set -Eeuo pipefail
REPO=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=/dev/null
source "$REPO/ops/agent-control/harness.conf"
step() { printf '\n==> %s\n' "$*"; }
have() { command -v "$1" >/dev/null 2>&1; }
export DEBIAN_FRONTEND=noninteractive

step "Base packages"
sudo apt-get update -qq
sudo apt-get install -y -qq build-essential ca-certificates curl git jq tmux python3 >/dev/null

step "Node.js 22 LTS and pnpm"
if ! have node || (( $(node -p 'process.versions.node.split(".")[0]') < 22 )); then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
    sudo apt-get install -y -qq nodejs >/dev/null
fi
if ! have pnpm; then
    sudo npm install -g pnpm@latest >/dev/null 2>&1 || sudo corepack enable pnpm
fi
echo "node $(node --version), pnpm $(pnpm --version)"

step "Docker for local Postgres/Redis"
if ! have docker; then
    sudo apt-get install -y -qq docker.io docker-compose-v2 >/dev/null || true
fi
if have docker; then
    sudo systemctl enable --now docker >/dev/null 2>&1 || true
    sudo usermod -aG docker "$USER" || true
    if sudo docker info >/dev/null 2>&1; then echo 'docker: usable'; else echo 'docker: installed but daemon unavailable (agent may use native packages)'; fi
else
    echo 'docker: unavailable (agent will use native Postgres/Redis packages)'
fi

step "Git identity and defaults"
if [[ -n ${GIT_NAME:-} ]]; then git config --global user.name "$GIT_NAME"; fi
if [[ -n ${GIT_EMAIL:-} ]]; then git config --global user.email "$GIT_EMAIL"; fi
git config --global pull.ff only
git config --global init.defaultBranch main
git -C "$REPO" config user.name >/dev/null || { echo 'ERROR: set GIT_NAME/GIT_EMAIL' >&2; exit 1; }
timeout 60s git -C "$REPO" push --dry-run origin HEAD:main >/dev/null 2>&1 \
    && echo 'git push: ok' || { echo 'ERROR: git push --dry-run failed (check the exe.dev GitHub integration)' >&2; exit 1; }

step "Private secrets file"
mkdir -p "$HOME/.config/$PROJECT_NAME"
chmod 700 "$HOME/.config/$PROJECT_NAME"
touch "$HOME/.config/$PROJECT_NAME/env"
chmod 600 "$HOME/.config/$PROJECT_NAME/env"
echo "~/.config/$PROJECT_NAME/env ready (mode 600)"

step "Codex CLI using the exe.dev LLM integration"
have codex || { echo 'ERROR: codex not installed on this image' >&2; exit 1; }
if ! grep -q 'llm.int.exe.xyz' "$HOME/.codex/config.toml" 2>/dev/null; then
    exeuntu configure codex
fi
codex --version

step "User services survive logout and reboot"
sudo loginctl enable-linger "$USER"
# Non-interactive SSH sessions lack the user-bus environment; point at it.
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/run/user/$(id -u)}
for _ in $(seq 1 30); do [[ -S $XDG_RUNTIME_DIR/bus ]] && break; sleep 1; done
[[ -S $XDG_RUNTIME_DIR/bus ]] || { echo 'ERROR: user systemd bus not available' >&2; exit 1; }
echo "user systemd: $(systemctl --user is-system-running 2>/dev/null || true)"

step "Install the build harness"
bash "$REPO/ops/agent-control/install.sh"
python3 "$HOME/agent-control/verify.py" 2>&1 | tail -3

if [[ ${SKIP_SMOKE:-0} != 1 ]]; then
    step "Real Codex smoke test (one tiny request, does not touch the repo)"
    rm -f "$HOME/agent-control/smoke.txt"
    # Short deadline: a usage-limited account must not hold setup for 15 minutes.
    SMOKE=1 RUN_HOURS=0.05 bash "$HOME/agent-control/run.sh" >/dev/null 2>&1 || true
    if grep -q 'smoke ok' "$HOME/agent-control/smoke.txt" 2>/dev/null; then
        echo 'smoke: PASS (non-interactive Codex works with the configured model)'
        rm -f "$HOME/agent-control/smoke.txt"
    elif tail -n 20 "$HOME/agent-control/logs/supervisor.log" | grep -q 'result=usage'; then
        echo 'smoke: Codex reached the model but the plan usage limit is exhausted.'
        echo '       Auth works; the agent will poll every 15 minutes and start when it resets.'
    else
        echo 'smoke: FAIL. See ~/agent-control/logs/ (last iter-*.err / .jsonl)' >&2
        exit 1
    fi
fi

if [[ ${START:-0} == 1 ]]; then
    step "Start the build agent"
    rm -f "$HOME/agent-control/STOP"
    systemctl --user start "$PROJECT_NAME-agent.service"
    systemctl --user --no-pager status "$PROJECT_NAME-agent.service" | head -5
fi

step "Done"
cat <<EOF
Start:   systemctl --user start $PROJECT_NAME-agent.service
Watch:   journalctl --user -u $PROJECT_NAME-agent.service -f
Status:  cat ~/agent-control/status/heartbeat.json
Stop:    touch ~/agent-control/STOP   (graceful)   |   bash ~/agent-control/stop-now.sh   (immediate)
EOF
