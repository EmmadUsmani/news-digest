# Public-mode activation record

Public mode was activated November 15, iteration 2330. The owner enabled public
VM sharing at about 22:30 UTC November 15 (STEERING 63). Keep public mode enabled
while sharing is public; only the owner may change sharing.
Nov 15 scheduled edition `a0fa3916` passed the STEERING 62 publishing/reader gate
([acceptance](edition-reviews/2026-11-15.md#scheduled-acceptance--iteration-2398)).
Nov 16 scheduled publication over public HTTPS remains pending.
Use the current [runbook](public-readiness.md#activation-and-rollback-runbook) and
[deployment procedure](handbook/01-app/08-operations.md). The preparation and
activation receipts below describe their historical state, not current settings.

## Historical preparation baseline (November 13, 05:32 UTC)

| Setting              | Observed value                                                    |
| -------------------- | ----------------------------------------------------------------- |
| Deployed commit      | `8ac58ec7`                                                        |
| Server public mode   | `PUBLIC_MODE` absent; effective `0`                               |
| Account flags        | `SYSTEM_OWNERSHIP=1`, `ACCOUNTS_ENABLED=1`                        |
| API / worker         | Both active, no systemd drop-ins                                  |
| Environment file     | `~/.config/news-digest/env`                                       |
| Working directory    | `~/news-digest`                                                   |
| API command          | `/usr/bin/node apps/api/dist/main.js`                             |
| Worker command       | `/usr/bin/node apps/api/dist/worker.js`                           |
| Proxy                | Owner confirmed port 8000; sharing remains private by instruction |
| Health / alerts      | Database and Redis healthy; zero firing or pending alerts         |
| Sources              | 38 healthy; zero unhealthy                                        |
| Scheduled edition    | November 13 at 15:00 UTC; not yet accepted                        |
| Latest saved edition | `b1be5a12-2972-4eeb-9bff-82cbb10c1b07`                            |
| Saved reader         | Latest/direct/history agree: five topics, 25 stories, 22 posts    |

## Historical rollback preparation (November 13, 12:47 UTC; iteration 2148)

- Deployed commit at backup: `d349176b`; activation has not started.
- Snapshot: `~/backups/news-digest/news-digest-20261113T124650Z.dump`;
  manifest at the same path with `.json` instead of `.dump`.
- `python3 ops/backups/database.py backup` completed: 17,053,163 bytes.
- `python3 ops/backups/database.py restore` verified the checksum and all
  39 table counts (98,127 rows) in a network-isolated temporary container,
  then removed that container. The live database was not restored.
- Restore receipt: `~/backups/news-digest/restore-proof.json`; its backup field
  matches this snapshot. Dump and manifest have no group/other permissions.
- Environment rollback copy:
  `~/.local/state/news-digest/activation/env-before-public-20261113T124659Z`.
  Bytes match the current environment; file mode is 600, parent mode 700.
- Live migration head: `drizzle/0024_us_bluesky_query.sql`.
- Health database/Redis pass; 38 sources healthy; zero active alerts. Digest
  queue has one worker and the Nov 13 15:00 UTC run is delayed as expected.
- These are preparation receipts, not scheduled acceptance. Refresh the backup,
  environment copy and baseline after NBA/item 58 acceptance before activation;
  the scheduled edition and continued collection will change the database.

## Activation receipt — November 15, iteration 2330

- Item 58 ack commit `69699604`; deployment `7db9cf6b` includes the concurrent
  owner notes merge. Activation began before noon, at 02:15 UTC.
- Fresh snapshot `~/backups/news-digest/news-digest-20261115T020603Z.dump`:
  39 tables, 19,637,477 bytes; private manifest alongside it. No migration applied.
- Mode-600 environment copy in mode-700 directory:
  `~/.local/state/news-digest/activation/env-before-public-20261115T020630Z`.
- Private baseline `~/.local/state/news-digest/activation/2330-reader-baseline.json`;
  Nov 14 edition `b9d55088-892a-4e34-b77c-a398d64c6a9f`, five topics,
  14 stories and 19 posts. Latest/direct/history agree after activation.
- `PUBLIC_MODE=1`; `VITE_PUBLIC_MODE=1 pnpm build` passed. API and worker
  restarted because the shared environment changed; database/Redis healthy.
- Deployed account boundary: all 32 checks pass. Explicit deployed probe:
  26 checks pass, including anonymous reader/assets, private cost/tool refusals,
  legacy-header refusal, fresh-admin cost read and disposable reader isolation.
  Disposable reader deleted and admin logged out; no owner preference or schedule writes.
- Desktop/mobile Chromium show the saved real edition with no page errors;
  external embeds blocked. Screenshots: `docs/screenshots/public-activation-{desktop,mobile}.png`.
- HTTPS through public DNS address returns 307 to exe.dev login with HSTS;
  sharing remains private. Application admission checks use loopback and the
  configured trusted visitor field; this does not claim signed-out proxy passage.
- All 38 sources have no error; digest queue has one worker, no failures and
  next run Nov 15 15:00 UTC. Alerts zero. Private CLI probes adapted to public
  source/queue projections without legacy-token admission or private run claims.
- Next: accept Nov 15 scheduled publication with signed-out latest/history/direct
  agreement and continued private/admin refusals, then ack item 50. AI quality is
  reviewed separately. No sharing change, paid call or full rehearsal rerun.
- Private receipts: `/tmp/2330-{deployed,https-headers,public-status,public-queues}.*`.

## Exact private-mode recovery

If sharing is still private, confirm that state before restoring private mode.
If sharing changed, the owner must unshare and confirm proxy authentication first.
Keep public mode enabled until private sharing is confirmed.

1. Set only `PUBLIC_MODE=0` in `~/.config/news-digest/env`; preserve current
   account flags, credentials and other settings. Do not blindly restore an old env file.
2. Outside 13:00–16:00 UTC, from `~/news-digest`, publish the web build atomically:
   `VITE_PUBLIC_MODE=0 pnpm --filter @digest/web build`. This retains retired hashed
   assets for at least 24 hours. Build API or worker only if their code changed.
3. After the build succeeds, run
   `systemctl --user restart news-digest-api.service`.
   Restart `news-digest-worker.service` only if worker code/configuration changed.
4. Run `curl -fsS http://localhost:8000/healthz`, `pnpm obs alerts`,
   `pnpm obs sources --check`, and `pnpm obs jobs --check --limit 1`.
5. Verify private HTTPS/account admission and the saved reader with
   `pnpm exec tsx scripts/check-scheduled-reader.ts YYYY-MM-DDTHH:mm:ssZ`,
   substituting the latest accepted scheduled window end.
6. Record UTC time, commit, flag values, build/restart results, reader edition ID
   and rollback reason. Preserve published data and additive migrations.

Only the owner may change sharing. STEERING 63 controls current deployment and
public access; never restore private mode before the owner confirms unsharing.
