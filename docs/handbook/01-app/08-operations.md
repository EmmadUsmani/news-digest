# Operations

## URLs

| What               | URL                                           |
| ------------------ | --------------------------------------------- |
| App + Status page  | https://news-digest.exe.xyz/                  |
| Health check       | https://news-digest.exe.xyz/healthz           |
| Handbook           | https://news-digest.exe.xyz/docs/             |
| DB schema explorer | https://news-digest.exe.xyz/db/               |
| Log browser        | https://news-digest.exe.xyz/logs/select/vmui/ |

## Services (systemd user units on the VM)

| Unit                 | Runs                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| `news-digest-api`    | API + web UI on :8000; forwards `/docs/`, `/db/` and `/logs/`          |
| `news-digest-worker` | All jobs and timers                                                    |
| `news-digest-docs`   | This handbook (loopback :8100)                                         |
| `news-digest-schema` | DB schema explorer (loopback :8200)                                    |
| `news-digest-agent`  | The build agent's supervisor (see [agent docs](../02-agent/README.md)) |

```bash
systemctl --user status 'news-digest-*'            # are they up?
systemctl --user restart news-digest-api news-digest-worker
journalctl --user -u news-digest-worker -n 100     # recent worker logs
docker compose ps                                  # Postgres + Redis
```

The log store and shipper are separate **system** units (`obs-logs` and
`obs-shipper`), outside the app health gate. Use `systemctl status obs-logs
obs-shipper` and see [Observability](09-observability.md) for limits and recovery.

## How to tell if things are healthy

The **Status page** in the app is the dashboard. It shows:

- each source's last success and errors;
- queue state and recent job runs (including whether the last edition used AI
  or the fallback);
- per-topic coverage for the last 24 hours;
- AI and X spend against their caps.

`/healthz` returns 200 only when both Postgres and Redis respond. The agent's
supervisor also checks it after every iteration.

The read-only edition timing report (`pnpm exec tsx scripts/report-edition-timing.ts`,
with the configured database environment loaded) joins retained completed jobs,
published editions and their provider charges. It preserves the latest retained
settled scheduled result even after newer manual completions or an upcoming job,
and shows pending or failed
scheduled jobs plus recent failures. Add `--scheduled-only --limit 20` to compare
retained scheduled history (newest intended schedule first). The default limit is
three; completed and failed lists are limited separately, up to twenty each.
The latest settled scheduled completion is preserved even if that adds one run
to a mixed manual/scheduled list. Selection happens before edition/charge reads;
queue retention still limits history. The report includes selection counts. Missing retained evidence does not prove
that a run never happened; failure details remain in logs. It separates final-attempt worker
duration from signed offsets between the intended schedule and start/completion.
Positive offsets mean later; manual runs have no schedule offset. These offsets
include scheduling delay and earlier retries, so they do not measure pure queue
wait or fresh AI latency. A failed edition or charge read preserves the other
runs and the unavailable job’s timing, marks evidence incomplete and exits
nonzero; it does not imply a failed digest. The report never starts a job or calls a provider.

The timing report also includes per-platform selected-post counts and original links, authors, publication times and saved engagement from each immutable edition. Missing historical selections are unknown; an explicit empty selection has zero counts. Missing metrics or observation times remain unknown. These snapshots do not establish current virality, discovery search attribution or outside-list yield.

## How code reaches production

There is no separate CI/CD. The build agent works directly on the VM:

```mermaid
flowchart LR
  a["Agent edits code"] --> b["pnpm check<br/>(typecheck, lint, format,<br/>boundaries, tests)"]
  b --> c["pnpm build<br/>+ migrate"] --> d["restart services"] --> e["verify /healthz,<br/>smoke scripts"] --> f["commit + push main"]
```

## Tests

| Suite                  | Command                 | Uses                                                    |
| ---------------------- | ----------------------- | ------------------------------------------------------- |
| Unit                   | `pnpm test:unit`        | Pure logic, fakes; database access blocked              |
| Integration            | `pnpm test:integration` | Throwaway Postgres + Redis via Testcontainers           |
| Everything             | `pnpm check`            | Both suites plus typecheck, lint, format and boundaries |
| Smoke (live, explicit) | `scripts/smoke-*.ts`    | Real browser/UI checks against the running app          |

Rules: tests never call live external services. AI responses come from fakes
or recorded fixtures. Live checks are opt-in and budgeted.

Integration-test database storage uses memory-backed tmpfs mounts. Test runs do
not create anonymous Docker data volumes, including when interrupted; the test
containers never use production data.
