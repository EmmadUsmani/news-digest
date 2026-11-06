"""Bounded loopback Grafana health probe for the existing textfile collector."""
import json
import subprocess
import sys
import time


def healthy():
    try:
        result = subprocess.run(
            ['curl', '--fail', '--silent', '--max-time', '2', '--max-filesize', '4096',
             'http://127.0.0.1:3001/grafana/api/health'],
            check=True, capture_output=True, text=True, timeout=3,
        )
        body = json.loads(result.stdout)
        return isinstance(body, dict) and body.get('database') == 'ok'
    except (subprocess.SubprocessError, OSError, ValueError):
        return False


def wait_until_healthy(timeout=90):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if healthy():
            return True
        time.sleep(1)
    return False


if __name__ == '__main__':
    if sys.argv[1:] != ['--wait-ready']:
        raise SystemExit('Expected --wait-ready')
    raise SystemExit(0 if wait_until_healthy() else 1)
