#!/usr/bin/env python3
"""Small stdlib helpers for rendering, atomic state, and CLI error classification."""
import json
import os
from pathlib import Path
import re
import sys
import time


LIMIT = re.compile(
    r"\b(?:usage_limit_(?:reached|exceeded)|rate_limit_(?:reached|exceeded)|"
    r"quota_exceeded|insufficient_quota|workspace_member_credits_depleted|"
    r"workspace_(?:owner|member)_usage_limit_reached)\b|"
    r"you['’]ve hit your usage limit|usage limit reached|"
    r"you['’]ve reached your usage limit|your included usage is exhausted|"
    r"your workspace is out of credits|exceeded your current quota|"
    r"(?:rate limit|quota) (?:reached|exceeded)|"
    r"unexpected status(?: code)?[: ]+429\b|\b429 (?:too many requests|too_many_requests)",
    re.I,
)
AUTH = re.compile(
    r"\b(?:invalid_api_key|authentication_error|unauthorized|"
    r"refresh_token_(?:expired|reused|invalidated))\b|"
    r"unexpected status(?: code)?[: ]+(?:401|403)\b|\b401 (?:unauthorized|unauthorised)|\b403 forbidden|"
    r"(?:failed to refresh|could not refresh|unable to refresh) (?:your )?(?:auth |access )?token|"
    r"(?:gateway oauth )?authentication failed|incorrect api key|"
    r"(?:api key|authentication token) (?:is )?(?:invalid|expired|missing)",
    re.I,
)
# The provider refuses the configured model itself (e.g. a server-side minimum
# Codex version); the supervisor reruns the iteration on FALLBACK_MODEL.
MODEL_UNAVAILABLE = re.compile(
    r"model requires a newer version of codex|\bmodel_not_found\b|"
    r"the model [`'\"]?[\w.:/-]+[`'\"]? (?:does not exist|is not supported|is not available)",
    re.I,
)


def classify(event_path, stderr_path, exit_code):
    """Inspect CLI errors, never command output or agent prose about app-level 429s."""
    errors = []
    terminal = None
    for line in Path(event_path).read_text(errors="replace").splitlines():
        try:
            event = json.loads(line)
        except ValueError:
            continue
        if event.get("type") in {"turn.completed", "turn.failed"}:
            terminal = event["type"]
        if event.get("type") in {"error", "turn.failed"}:
            errors.append(json.dumps(event, ensure_ascii=False))
    # Transient retries that ended in a completed turn are not fatal errors.
    if exit_code == 0 and terminal == "turn.completed":
        return "ok"
    diagnostic = "\n".join(errors) + "\n" + Path(stderr_path).read_text(errors="replace")
    if AUTH.search(diagnostic):
        return "auth"
    if LIMIT.search(diagnostic):
        return "usage"
    if MODEL_UNAVAILABLE.search(diagnostic):
        return "model_unavailable"
    if exit_code in {124, 137}:
        return "timeout"
    return "ok" if exit_code == 0 and terminal != "turn.failed" else "crash"


def latest_rate_limits(sessions_dir, since_epoch):
    """Newest Codex rate-limit snapshot (5h primary / weekly secondary) in recent session logs."""
    best = None
    root = Path(sessions_dir)
    if not root.is_dir():
        return None
    for path in root.rglob("*.jsonl"):
        try:
            if path.stat().st_mtime < since_epoch:
                continue
            lines = path.read_text(errors="replace").splitlines()
        except OSError:
            continue
        for line in lines:
            if '"rate_limits"' not in line:
                continue
            try:
                event = json.loads(line)
            except ValueError:
                continue
            limits = (event.get("payload") or {}).get("rate_limits")
            if not isinstance(limits, dict):
                continue
            if not isinstance(limits.get("primary"), dict) and not isinstance(limits.get("secondary"), dict):
                continue
            stamp = str(event.get("timestamp") or "")
            if best is None or stamp >= best[0]:
                best = (stamp, limits)
    return best[1] if best else None


def iteration_tokens(event_path):
    """Sum token usage reported by `codex exec --json` turn.completed events."""
    totals = {"input": 0, "cached": 0, "output": 0, "reasoning": 0}
    try:
        lines = Path(event_path).read_text(errors="replace").splitlines()
    except OSError:
        return totals
    for line in lines:
        try:
            event = json.loads(line)
        except ValueError:
            continue
        usage = event.get("usage") if event.get("type") == "turn.completed" else None
        if isinstance(usage, dict):
            totals["input"] += int(usage.get("input_tokens") or 0)
            totals["cached"] += int(usage.get("cached_input_tokens") or 0)
            totals["output"] += int(usage.get("output_tokens") or 0)
            totals["reasoning"] += int(usage.get("reasoning_output_tokens") or 0)
    return totals


def read_usage(status_path):
    try:
        return json.loads(Path(status_path).read_text())
    except (OSError, ValueError):
        return {}


def window(usage, name):
    item = usage.get(name)
    if not isinstance(item, dict):
        return None
    try:
        used = float(item["used_percent"])
        minutes = float(item["window_minutes"])
        resets = float(item["resets_at"])
    except (KeyError, TypeError, ValueError):
        return None
    return used, minutes * 60, resets


def windows(usage):
    """(short, weekly) windows by length: plans differ in which slot holds which.

    Plus reports 5h as primary and weekly as secondary; Pro reports only a
    weekly window, as primary. Windows of a day or longer count as weekly.
    """
    found = [w for w in (window(usage, "primary"), window(usage, "secondary")) if w]
    short = [w for w in found if w[1] < 86400]
    weekly = [w for w in found if w[1] >= 86400]
    return (min(short, key=lambda w: w[1]) if short else None,
            max(weekly, key=lambda w: w[1]) if weekly else None)


def pace_seconds(usage, slack_pct, max_wait_min, now):
    """Seconds to wait so weekly usage tracks elapsed time in the week (plus slack)."""
    weekly = windows(usage)[1]
    if weekly is None:
        return 0, "no weekly usage data yet"
    used, length, resets = weekly
    if length <= 0 or resets <= now:
        return 0, "weekly window already reset"
    elapsed = max(0.0, length - (resets - now))
    allowed = 100.0 * elapsed / length + slack_pct
    if used <= allowed:
        return 0, f"weekly {used:.0f}% used, pace allows {min(allowed, 100):.0f}%"
    on_pace_at = (used - slack_pct) / 100.0 * length  # elapsed seconds when back on pace
    wait = min(on_pace_at - elapsed, resets - now + 60, max_wait_min * 60)
    return max(60, int(wait)), f"weekly {used:.0f}% used but pace allows {allowed:.0f}%"


TRY_AGAIN = re.compile(r"try again at (\d{1,2}):(\d{2})\s*([AP]M)", re.I)


def usage_wait_seconds(event_path, stderr_path, usage, fallback_min, max_wait_min, now):
    """Wait until the reported reset instead of polling, bounded; fall back to polling."""
    text = ""
    for path in (event_path, stderr_path):
        try:
            text += Path(path).read_text(errors="replace")
        except OSError:
            pass
    match = TRY_AGAIN.search(text)
    target = None
    if match:
        hour, minute, half = int(match[1]) % 12, int(match[2]), match[3].upper()
        hour += 12 if half == "PM" else 0
        local = time.localtime(now)
        candidate = time.mktime((local.tm_year, local.tm_mon, local.tm_mday, hour, minute, 0, 0, 0, -1))
        if candidate <= now:
            candidate += 86400
        target = candidate
    else:
        exhausted = [w for w in windows(usage) if w and w[0] >= 90 and w[2] > now]
        if exhausted:
            target = max(w[2] for w in exhausted)
    if target is None:
        return int(fallback_min * 60)
    wait = target - now + 60
    return int(max(60, min(wait, max_wait_min * 60)))


def budget_text(usage, slack_pct, now):
    primary, weekly = windows(usage)
    if primary is None and weekly is None:
        return "Codex usage: not measured yet. Work efficiently (see AGENTS.md, Token efficiency)."
    parts = []
    stamp = lambda epoch: time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime(epoch))
    if primary:
        parts.append(f"5-hour window {primary[0]:.0f}% used (resets {stamp(primary[2])})")
    status = "on pace"
    if weekly:
        used, length, resets = weekly
        elapsed = max(0.0, length - (resets - now))
        pace = 100.0 * elapsed / length
        status = "AHEAD of pace" if used > pace + slack_pct else "on pace"
        parts.append(f"weekly {used:.0f}% used vs {pace:.0f}% of the week elapsed (resets {stamp(resets)})")
    advice = ("Prefer the smallest complete, verified step; skip optional exploration and extra audits."
              if status != "on pace" else "Normal pace; still follow AGENTS.md, Token efficiency.")
    return "Codex usage: " + "; ".join(parts) + f". Status: {status}. {advice}"


def main():
    action, *args = sys.argv[1:]
    if action == "classify":
        print(classify(args[0], args[1], int(args[2])))
    elif action == "render":
        template, target, n, start, deadline, summary_file, *rest = args
        summary = ("Previous iteration ended without a final summary; inspect git and PROGRESS.md."
                   if summary_file else "No previous iteration; begin from repository state.")
        if summary_file and Path(summary_file).is_file():
            summary = "\n".join(Path(summary_file).read_text(errors="replace").splitlines()[-10:])[-12000:]
            if not summary.strip():
                summary = "Previous iteration had no final summary; inspect git and PROGRESS.md."
        budget = rest[0] if rest else "Codex usage: not measured."
        values = {"N": n, "START": start, "DEADLINE": deadline, "LAST_SUMMARY": summary, "BUDGET": budget}
        rendered = re.sub(r"\{\{(N|START|DEADLINE|LAST_SUMMARY|BUDGET)\}\}",
                          lambda match: values[match[1]], Path(template).read_text())
        Path(target).write_text(rendered)
    elif action == "usage-update":
        sessions, since, events, status_path, ledger, n = args
        limits = latest_rate_limits(sessions, float(since))
        usage = read_usage(status_path)
        if limits:
            usage = {"primary": limits.get("primary"), "secondary": limits.get("secondary"),
                     "observed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
            tmp = Path(status_path).with_suffix(".tmp")
            tmp.write_text(json.dumps(usage, indent=2) + "\n")
            os.replace(tmp, status_path)
        tokens = iteration_tokens(events)
        with open(ledger, "a") as handle:
            primary, weekly = windows(usage)
            handle.write("\t".join(map(str, [
                time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), n, tokens["input"], tokens["cached"],
                tokens["output"], tokens["reasoning"],
                f"{primary[0]:.0f}" if primary else "", f"{weekly[0]:.0f}" if weekly else ""])) + "\n")
        print(f"tokens in={tokens['input']} cached={tokens['cached']} out={tokens['output']}; "
              f"5h={'%.0f%%' % primary[0] if primary else '?'} weekly={'%.0f%%' % weekly[0] if weekly else '?'}")
    elif action == "pace":
        status_path, slack, max_wait = args
        seconds, reason = pace_seconds(read_usage(status_path), float(slack), float(max_wait), time.time())
        print(seconds, reason)
    elif action == "usage-wait":
        events, stderr, status_path, fallback, max_wait = args
        seconds = usage_wait_seconds(events, stderr, read_usage(status_path), float(fallback),
                                     float(max_wait), time.time())
        print(f"{seconds / 60:.2f}")
    elif action == "budget":
        status_path, slack = args
        print(budget_text(read_usage(status_path), float(slack), time.time()))
    elif action == "heartbeat":
        target, *pairs = args
        data = dict(pair.split("=", 1) for pair in pairs)
        for key in ("iteration", "last_exit_code", "consecutive_no_progress", "consecutive_failures", "supervisor_pid"):
            data[key] = int(data[key])
        path = Path(target)
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2) + "\n")
        os.replace(tmp, path)
    elif action == "next":
        numbers = [int(p.stem.split("-")[1]) for p in Path(args[0]).glob("iter-*.jsonl")]
        print(max(numbers, default=0) + 1)
    else:
        raise SystemExit(f"Unknown action: {action}")


if __name__ == "__main__":
    main()
