#!/usr/bin/env python3
"""Small stdlib helpers for rendering, atomic state, and CLI error classification."""
import json
import os
from pathlib import Path
import re
import sys


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
    if exit_code in {124, 137}:
        return "timeout"
    return "ok" if exit_code == 0 and terminal != "turn.failed" else "crash"


def main():
    action, *args = sys.argv[1:]
    if action == "classify":
        print(classify(args[0], args[1], int(args[2])))
    elif action == "render":
        template, target, n, start, deadline, summary_file = args
        summary = ("Previous iteration ended without a final summary; inspect git and PROGRESS.md."
                   if summary_file else "No previous iteration; begin from repository state.")
        if summary_file and Path(summary_file).is_file():
            summary = "\n".join(Path(summary_file).read_text(errors="replace").splitlines()[-10:])[-12000:]
            if not summary.strip():
                summary = "Previous iteration had no final summary; inspect git and PROGRESS.md."
        values = {"N": n, "START": start, "DEADLINE": deadline, "LAST_SUMMARY": summary}
        rendered = re.sub(r"\{\{(N|START|DEADLINE|LAST_SUMMARY)\}\}",
                          lambda match: values[match[1]], Path(template).read_text())
        Path(target).write_text(rendered)
    elif action == "heartbeat":
        target, *pairs = args
        data = dict(pair.split("=", 1) for pair in pairs)
        for key in ("iteration", "last_exit_code", "consecutive_no_progress", "supervisor_pid"):
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
