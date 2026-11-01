#!/usr/bin/env python3
"""Exercise real user-systemd restart policy with a disposable fake supervisor."""
from pathlib import Path
import subprocess
import tempfile
import time
import uuid


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True, timeout=15)


def wait_for(predicate, seconds=20):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if predicate():
            return
        time.sleep(0.1)
    raise AssertionError("Timed out waiting for mock systemd run")


with tempfile.TemporaryDirectory(prefix="harness-service-test-") as directory:
    root = Path(directory)
    script = root / "fake.py"
    script.write_text('''import pathlib, sys
root = pathlib.Path(sys.argv[1])
# Match run.sh: every new supervisor honors persisted stop intent.
if (root / 'STOP').exists(): raise SystemExit(0)
count = root / 'count'
n = int(count.read_text()) + 1 if count.exists() else 1
count.write_text(str(n))
if n <= 4: raise SystemExit(1)
(root / 'recovered').touch()
''')
    # Use the checked-in unit properties; only shorten the retry for this mock.
    source = (Path(__file__).parent / "agent.service").read_text()
    assert "Restart=on-failure" in source and "StartLimitIntervalSec=0" in source
    assert "ConditionPathExists=!%h/agent-control/STOP" in source
    for mode in ("recovery", "stop"):
        unit = f"harness-test-{uuid.uuid4().hex}.service"
        count = root / "count"
        count.unlink(missing_ok=True)
        stop = root / "STOP"
        stop.unlink(missing_ok=True)
        try:
            run("systemd-run", "--user", "--collect", f"--unit={unit}",
                "--property=Restart=on-failure", "--property=RestartSec=1",
                "--property=StartLimitIntervalSec=0",
                f"--property=ConditionPathExists=!{stop}",
                "/usr/bin/python3", str(script), str(root))
            if mode == "recovery":
                wait_for(lambda: (root / "recovered").exists())
                assert count.read_text() == "5"
                print("PASS: real systemd restarted four supervisor crashes, then recovered")
            else:
                wait_for(lambda: count.exists() and int(count.read_text()) >= 2)
                stop.touch()
                before = count.read_text()
                time.sleep(2)
                assert count.read_text() == before
                print("PASS: persistent STOP prevented systemd from restarting work")
        finally:
            # Collected successful/skipped units may already be gone.
            subprocess.run(["systemctl", "--user", "stop", unit], capture_output=True, timeout=15)
