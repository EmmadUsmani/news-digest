#!/usr/bin/env python3
"""Feed existing ServiceDown rule without changing root-owned collectors or rules."""
import os
from pathlib import Path
import subprocess
import time


def properties(unit):
    result = subprocess.run(
        ['systemctl', '--user', 'show', unit,
         '--property=ActiveState,Result,ExecMainExitTimestampMonotonic,ExecMainStartTimestampMonotonic'],
        check=True, capture_output=True, text=True, timeout=5,
    )
    return dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)


def collect():
    timer = properties('news-digest-alert-dispatch.timer')
    service = properties('news-digest-alert-dispatch.service')
    exited = int(service.get('ExecMainExitTimestampMonotonic', '0')) / 1_000_000
    started = int(service.get('ExecMainStartTimestampMonotonic', '0')) / 1_000_000
    now = time.monotonic()
    running = service.get('ActiveState') == 'activating' and 0 <= now - started < 60
    return (timer.get('ActiveState') == 'active'
            and service.get('Result') == 'success'
            and (running or 0 < now - exited < 180))


if __name__ == '__main__':
    try:
        active = int(collect())
    except (OSError, ValueError, subprocess.SubprocessError):
        active = 0
    path = Path('/var/lib/news-digest-node-textfile/alert-dispatch.prom')
    temporary = path.with_suffix('.tmp')
    temporary.write_text(
        'news_digest_unit_active{unit="news-digest-alert-dispatch.timer",scope="user"} '
        + str(active) + '\n'
    )
    os.replace(temporary, path)
