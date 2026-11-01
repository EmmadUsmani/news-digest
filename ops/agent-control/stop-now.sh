#!/usr/bin/env bash
# Immediate stop: suppress the EXIT report and kill this supervisor's children.
set -euo pipefail
CONTROL=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
python3 - "$CONTROL" <<'PY'
import os
from datetime import datetime, timezone
import json
from pathlib import Path
import signal
import sys

control = Path(sys.argv[1])
# Persist the owner's stop intent before SIGKILL so systemd cannot resume work.
(control / 'STOP').touch()
pidfile = control / 'status/supervisor.pid'
if not pidfile.exists():
    print('No supervisor PID file; nothing to kill.')
    raise SystemExit(0)
pid = int(pidfile.read_text())
try:
    command = Path(f'/proc/{pid}/cmdline').read_bytes().replace(b'\0', b' ')
except FileNotFoundError:
    print('Supervisor already exited.')
    raise SystemExit(0)
if str(control / 'run.sh').encode() not in command:
    raise SystemExit('PID file is stale; refusing to signal an unrelated process.')
# Freeze before reading the child group so a final report cannot start mid-stop.
os.kill(pid, signal.SIGSTOP)
children = {}
for entry in Path('/proc').iterdir():
    if not entry.name.isdecimal():
        continue
    try:
        stat = (entry / 'stat').read_text().rsplit(')', 1)[1].split()
        children.setdefault(int(stat[1]), []).append(int(entry.name))
    except (FileNotFoundError, ProcessLookupError, PermissionError):
        continue
descendants = []
pending = list(children.get(pid, []))
while pending:
    child = pending.pop()
    descendants.append(child)
    pending.extend(children.get(child, []))
# The active timeout process is a session/group leader. Kill the whole group
# as well as the descendant snapshot, which includes any child Codex/tool process.
groupfile = control / 'status/active.pgid'
if groupfile.exists():
    group = int(groupfile.read_text())
    if group in descendants:
        try:
            os.killpg(group, signal.SIGKILL)
        except ProcessLookupError:
            pass
for target in [pid, *reversed(descendants)]:
    try:
        os.kill(target, signal.SIGKILL)
    except ProcessLookupError:
        pass
heartbeat = control / 'status/heartbeat.json'
if heartbeat.exists():
    data = json.loads(heartbeat.read_text())
    data.update(state='stopped', stop_reason='immediate_kill', active_pgid='',
                updated_at=datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))
    temporary = heartbeat.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, indent=2) + '\n')
    os.replace(temporary, heartbeat)
pidfile.unlink(missing_ok=True)
groupfile.unlink(missing_ok=True)
print(f'Killed supervisor {pid} and {len(descendants)} descendant process(es); no morning report.')
PY
tmux kill-session -t builder 2>/dev/null || true
