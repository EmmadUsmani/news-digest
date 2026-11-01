#!/usr/bin/env python3
"""Offline supervisor checks. All executions use smoke mode and fake Codex."""
import importlib.util
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("control", ROOT / "control.py")
control = importlib.util.module_from_spec(spec)
spec.loader.exec_module(control)

FAKE_CODEX = r'''#!/usr/bin/env python3
import json, os, pathlib, sys, time
args = sys.argv[1:]
assert args[:2] == ['exec', '--dangerously-bypass-approvals-and-sandbox']
assert '--skip-git-repo-check' in args and args[-1] == '-'
assert '--json' in args
prompt = sys.stdin.read()
assert 'Do not touch' in prompt
root = pathlib.Path.cwd()
count = root / 'fake-count'
n = int(count.read_text()) + 1 if count.exists() else 1
count.write_text(str(n))
mode = os.environ['FAKE_MODE']
print(json.dumps({'type': 'thread.started', 'thread_id': 'offline-test'}), flush=True)
if mode == 'timeout' and n <= 4: time.sleep(120)
if mode == 'auth' and n <= 4:
    print(json.dumps({'type':'turn.failed', 'error':{'message':'unexpected status 401 Unauthorized'}}))
    sys.exit(1)
if mode in ('usage', 'usage_stop') and n <= 4:
    if mode == 'usage_stop': (root / 'STOP').touch()
    print(json.dumps({'type':'turn.failed', 'error':{'message':"You’ve hit your usage limit. Try again at 5:32 AM."}}))
    sys.exit(1)
if mode in ('crash', 'unknown_stop') and n <= 4:
    if mode == 'unknown_stop': (root / 'STOP').touch()
    print(json.dumps({'type':'turn.failed', 'error':{'message':'internal agent died'}}))
    sys.exit(2)
with (root / 'smoke.txt').open('a') as f: f.write('smoke ok offline\n')
pathlib.Path(args[args.index('-o') + 1]).write_text('DONE\n')
print(json.dumps({'type':'turn.completed', 'usage':{}}))
'''

FAKE_GIT = r'''#!/usr/bin/env python3
import json, pathlib, sys
root = pathlib.Path.cwd()
args = sys.argv[1:]
with (root / 'git-calls').open('a') as f: f.write(json.dumps(args) + '\n')
assert args[0] == '-C'
args = args[2:]
if args[:2] == ['-c', 'core.hooksPath=/dev/null']: args = args[2:]
path = root / 'git-state'
state = json.loads(path.read_text()) if path.exists() else {'head':'base', 'dirty':False, 'owner':False}
code = 0
if args[:2] == ['branch', '--show-current']: print('main')
elif args[:2] == ['rev-parse', 'HEAD']: print(state['head'])
elif args[0] in ('fetch', 'merge'): pass
elif args[0] == 'diff':
    code = int(state['dirty'] if args[2] == 'HEAD' else state['owner'])
elif args[0] == 'checkout': state['dirty'] = False
elif args[0] == 'log':
    if state['owner']: print('agent-owner-change')
elif args[0] == 'restore': state['restored'] = True
elif args[0] == 'commit':
    assert '--only' in args and args[-3:] == ['--', 'MISSION.md', 'BOOTSTRAP.md']
    assert state['restored']
    state.update(head='guard', owner=False)
elif args[0] == 'rev-list':
    print(int(state['head'] != 'base' and not state.get('pushed', False)))
elif args[0] == 'push': state['pushed'] = True
else: raise AssertionError(args)
path.write_text(json.dumps(state))
sys.exit(code)
'''

FAKE_REAL_CODEX = r'''#!/usr/bin/env python3
import json, os, pathlib, sys
root = pathlib.Path.cwd()
args = sys.argv[1:]
assert '--skip-git-repo-check' not in args
prompt = sys.stdin.read()
report = prompt.startswith('The unattended build has ended.')
with (root / 'codex-calls').open('a') as f: f.write(('report' if report else 'iteration') + '\n')
mode = os.environ['FAKE_MODE']
count = root / 'fake-count'
n = int(count.read_text()) + 1 if count.exists() else 1
count.write_text(str(n))
if not report and n == 4: (root / 'STOP').touch()
if mode == 'auth' and not report:
    print(json.dumps({'type':'turn.failed', 'error':{'message':'unexpected status 401 Unauthorized'}}))
    sys.exit(1)
if mode == 'owner' and not report:
    (root / 'git-state').write_text(json.dumps({'head':'agent', 'dirty':True, 'owner':True}))
    # A graceful STOP still runs the final report after guard and push.
    (root / 'STOP').touch()
pathlib.Path(args[args.index('-o')+1]).write_text('offline fake final\n')
print(json.dumps({'type':'turn.completed'}))
'''


class ClassifierTests(unittest.TestCase):
    def classify(self, events, rc=1, stderr=""):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            (base / "events").write_text("\n".join(json.dumps(e) for e in events))
            (base / "err").write_text(stderr)
            return control.classify(base / "events", base / "err", rc)

    def test_installed_cli_usage_identifiers(self):
        for text in ("usage_limit_exceeded", "rate_limit_exceeded", "usage_limit_reached",
                     "quota_exceeded", "You've hit your usage limit.", "You’ve hit your usage limit.", "You’ve reached your usage limit.",
                     "unexpected status 429 Too Many Requests"):
            with self.subTest(text=text):
                self.assertEqual(self.classify([{"type": "turn.failed", "error": {"message": text}}]), "usage")

    def test_auth_stops(self):
        for text in ("Unauthorized", "unexpected status 401 Unauthorized",
                     "Failed to refresh token", "invalid_api_key"):
            with self.subTest(text=text):
                self.assertEqual(self.classify([{"type": "error", "message": text}]), "auth")

    def test_app_errors_and_agent_prose_are_not_provider_errors(self):
        events = [{"type": "item.completed", "item": {"type": "command_execution",
                   "aggregated_output": "Source API 429 Too Many Requests; Unauthorized"}},
                  {"type": "item.completed", "item": {"type": "agent_message",
                   "text": "Test usage_limit_exceeded and invalid_api_key handlers"}},
                  {"type": "turn.completed"}]
        self.assertEqual(self.classify(events, 0), "ok")
        self.assertEqual(self.classify(events, 124), "timeout")

    def test_recovered_transient_error(self):
        events = [{"type": "error", "message": "rate_limit_exceeded"}, {"type": "turn.completed"}]
        self.assertEqual(self.classify(events, 0), "ok")

    def test_timeout_and_crash(self):
        self.assertEqual(self.classify([], 124), "timeout")
        self.assertEqual(self.classify([], 137), "timeout")
        self.assertEqual(self.classify([], 2), "crash")
        self.assertEqual(self.classify([{"type": "turn.failed"}], 0), "crash")


class SupervisorTests(unittest.TestCase):
    def run_case(self, mode, stop=False, overrides=None):
        with tempfile.TemporaryDirectory(prefix="harness-supervisor-test-") as directory:
            base = Path(directory)
            for name in ("run.sh", "control.py", "ITERATION_PROMPT.md"):
                shutil.copy2(ROOT / name, base / name)
            (base / "bin").mkdir()
            executable = base / "bin" / "codex"
            executable.write_text(FAKE_CODEX)
            executable.chmod(0o700)
            # Smoke must never invoke git or probe application services.
            for name in ("git", "curl", "systemctl"):
                executable = base / "bin" / name
                executable.write_text('#!/bin/sh\necho forbidden >>"$FORBIDDEN_FILE"\nexit 97\n')
                executable.chmod(0o700)
            if stop:
                (base / "STOP").touch()
            env = dict(os.environ, PATH=f"{base / 'bin'}:{os.environ['PATH']}",
                       SMOKE="1", RUN_HOURS="0.02", ITER_TIMEOUT_MIN="0.0167",
                       USAGE_LIMIT_WAIT_MIN="0.001", RETRY_WAIT_MIN="0.001", MAX_NO_PROGRESS="1", FAKE_MODE=mode,
                       FORBIDDEN_FILE=str(base / "forbidden"))
            env.update(overrides or {})
            result = subprocess.run(["bash", str(base / "run.sh")], env=env,
                                    capture_output=True, text=True, timeout=40)
            heartbeat = json.loads((base / "status/heartbeat.json").read_text())
            self.assertFalse((base / "forbidden").exists(), result.stdout + result.stderr)
            self.assertFalse(list((base / "logs").glob("report-*")))
            self.assertFalse((base / "status/supervisor.pid").exists())
            self.assertFalse((base / "status/active.pgid").exists())
            return result, heartbeat, sorted(p.name for p in (base / "logs").iterdir()), (base / "fake-count").read_text() if (base / "fake-count").exists() else "0"

    def test_success_has_events_summary_and_heartbeat(self):
        result, state, logs, count = self.run_case("ok")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(state["stop_reason"], "smoke_complete")
        self.assertEqual(state["last_health_result"], "skipped_smoke")
        self.assertEqual(count, "1")
        for name in ("iter-001.jsonl", "iter-001.final.md", "iter-001.err"):
            self.assertIn(name, logs)

    def test_existing_STOP_dispatches_nothing(self):
        result, state, logs, count = self.run_case("ok", stop=True)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(state["stop_reason"], "STOP")
        self.assertEqual(count, "0")

    def test_auth_retries_past_old_failure_cutoff(self):
        result, state, logs, count = self.run_case("auth")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(state["stop_reason"], "smoke_complete")
        self.assertEqual(count, "5")

    def test_usage_retries_without_counting_failed_attempt(self):
        result, state, logs, count = self.run_case("usage")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(count, "5")
        self.assertEqual(state["consecutive_no_progress"], 1)  # Only final smoke, which creates no commits.

    def test_STOP_during_usage_wait_preserves_progress_count(self):
        result, state, logs, count = self.run_case("usage_stop")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(state["stop_reason"], "STOP")
        self.assertEqual(state["consecutive_no_progress"], 0)
        self.assertEqual(count, "1")

    def test_timeout_and_unknown_crash_retry_past_old_cutoff(self):
        for mode, code in (("timeout", 124), ("crash", 2)):
            with self.subTest(mode=mode):
                result, state, logs, count = self.run_case(mode)
                self.assertEqual(result.returncode, 0)
                self.assertEqual(state["last_exit_code"], 0)
                self.assertEqual(count, "5")
                self.assertEqual(state["consecutive_no_progress"], 5)

    def test_unknown_failure_STOP_during_wait(self):
        result, state, logs, count = self.run_case("unknown_stop")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(state["stop_reason"], "STOP")
        self.assertEqual(count, "1")
        self.assertEqual(state["next_retry_at"], "")

    def test_deadline_bounds_retry_wait(self):
        result, state, logs, count = self.run_case(
            "usage", overrides={"RUN_HOURS": "0.0006", "USAGE_LIMIT_WAIT_MIN": "30"})
        self.assertEqual(result.returncode, 0)
        self.assertEqual(state["stop_reason"], "deadline")
        self.assertEqual(count, "1")
        self.assertEqual(state["consecutive_no_progress"], 0)

    def test_continuous_mode_has_no_deadline(self):
        result, state, logs, count = self.run_case("usage", overrides={"RUN_HOURS": "0"})
        self.assertEqual(result.returncode, 0)
        self.assertEqual(count, "5")
        self.assertEqual(state["deadline"], "none (continuous until stopped)")

    def test_lock_and_immediate_stop_kill_child_group(self):
        with tempfile.TemporaryDirectory(prefix="harness-kill-test-") as directory:
            base = Path(directory)
            for name in ("run.sh", "stop-now.sh", "control.py", "ITERATION_PROMPT.md"):
                shutil.copy2(ROOT / name, base / name)
            (base / 'bin').mkdir()
            for name, content in [('codex', FAKE_CODEX), ('tmux', '#!/bin/sh\nexit 0\n')]:
                executable = base / 'bin' / name
                executable.write_text(content)
                executable.chmod(0o700)
            env = dict(os.environ, PATH=f"{base / 'bin'}:{os.environ['PATH']}",
                       SMOKE='1', FAKE_MODE='timeout', ITER_TIMEOUT_MIN='5')
            process = subprocess.Popen(['bash', str(base / 'run.sh')], env=env,
                                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                until = time.monotonic() + 10
                while not (base / 'fake-count').exists() and time.monotonic() < until:
                    time.sleep(0.05)
                self.assertTrue((base / 'fake-count').exists())
                group = int((base / 'status/active.pgid').read_text())
                # A competing run must not overwrite the active run's metadata.
                competing = subprocess.run(['bash', str(base / 'run.sh')], env=env,
                                           capture_output=True, text=True, timeout=10)
                self.assertEqual(competing.returncode, 1)
                self.assertIn('already running', competing.stderr)
                result = subprocess.run(['bash', str(base / 'stop-now.sh')], env=env,
                                        capture_output=True, text=True, timeout=10)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertEqual(process.wait(timeout=10), -signal.SIGKILL)
                state = json.loads((base / 'status/heartbeat.json').read_text())
                self.assertEqual(state['stop_reason'], 'immediate_kill')
                self.assertTrue((base / 'STOP').exists())
                self.assertFalse((base / 'status/supervisor.pid').exists())
                self.assertFalse(list((base / 'logs').glob('report-*')))
                # Reparented zombies may briefly remain, but none may run.
                for entry in Path('/proc').iterdir():
                    if not entry.name.isdecimal(): continue
                    try:
                        fields = (entry / 'stat').read_text().rsplit(')', 1)[1].split()
                        if int(fields[2]) == group:
                            self.assertEqual(fields[0], 'Z')
                    except (FileNotFoundError, ProcessLookupError):
                        pass
            finally:
                if process.poll() is None:
                    process.kill()
                    process.wait(timeout=10)


class RealLoopContractTests(unittest.TestCase):
    """Exercise real-loop branches with fake git, Codex and services: no repo IO."""
    def run_case(self, mode):
        with tempfile.TemporaryDirectory(prefix="harness-loop-contract-") as directory:
            base = Path(directory)
            for name in ("run.sh", "control.py", "ITERATION_PROMPT.md"):
                shutil.copy2(ROOT / name, base / name)
            (base / 'bin').mkdir()
            for name, content in [('git', FAKE_GIT), ('codex', FAKE_REAL_CODEX),
                                  ('curl', '#!/bin/sh\necho health-ok\n'),
                                  ('systemctl', '#!/bin/sh\necho active\n')]:
                executable = base / 'bin' / name
                executable.write_text(content)
                executable.chmod(0o700)
            if mode == 'initial_stop': (base / 'STOP').touch()
            env = dict(os.environ, PATH=f"{base / 'bin'}:{os.environ['PATH']}",
                       SMOKE='0', MAX_NO_PROGRESS='2', RUN_HOURS='0', RETRY_WAIT_MIN='0.001', USAGE_LIMIT_WAIT_MIN='0.001', FAKE_MODE=mode)
            result = subprocess.run(['bash', str(base / 'run.sh')], env=env,
                                    capture_output=True, text=True, timeout=40)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            state = json.loads((base / 'status/heartbeat.json').read_text())
            calls = (base / 'codex-calls').read_text().splitlines() if (base / 'codex-calls').exists() else []
            git_calls = [json.loads(line)[2:] for line in (base / 'git-calls').read_text().splitlines()]
            return state, calls, git_calls

    def test_persistent_STOP_skips_all_model_calls_on_restart(self):
        state, calls, git_calls = self.run_case('initial_stop')
        self.assertEqual(state['stop_reason'], 'STOP')
        self.assertEqual(calls, [])

    def test_no_progress_continues_until_explicit_STOP_and_reports(self):
        state, calls, git_calls = self.run_case('idle')
        self.assertEqual(state['consecutive_no_progress'], 4)
        self.assertEqual(state['stop_reason'], 'STOP')
        self.assertEqual(calls, ['iteration'] * 4 + ['report'])

    def test_auth_skips_final_report(self):
        state, calls, git_calls = self.run_case('auth')
        self.assertEqual(state['stop_reason'], 'STOP')
        self.assertEqual(calls, ['iteration'] * 4)

    def test_guard_restores_dirty_and_committed_owner_edits_before_push(self):
        state, calls, git_calls = self.run_case('owner')
        self.assertEqual(state['stop_reason'], 'STOP')
        self.assertEqual(calls, ['iteration', 'report'])
        commands = [args[2:] if args[:1] == ['-c'] else args for args in git_calls]
        checkout = next(i for i, args in enumerate(commands) if args[0] == 'checkout')
        restore = next(i for i, args in enumerate(commands) if args[0] == 'restore')
        commit = next(i for i, args in enumerate(commands) if args[0] == 'commit')
        push = next(i for i, args in enumerate(commands) if args[0] == 'push')
        self.assertLess(checkout, restore)
        self.assertLess(restore, commit)
        self.assertLess(commit, push)
        self.assertIn('--only', commands[commit])
        self.assertEqual(commands[commit][-3:], ['--', 'MISSION.md', 'BOOTSTRAP.md'])


if __name__ == "__main__":
    unittest.main(verbosity=2)
