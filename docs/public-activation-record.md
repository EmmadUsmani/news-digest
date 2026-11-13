# Private-sharing public-mode activation record

Prepared November 13, iteration 2110. Activation has not started.
Refresh this record after scheduled NBA/item 58 acceptance and before activation.
Use the [runbook](public-readiness.md#activation-and-rollback-runbook) in order.

## Preparation baseline (05:32 UTC; refresh before activation)

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

## Rollback preparation verified (12:47 UTC; iteration 2148)

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

## Activation receipt to complete

- Scheduled gate: edition ID, NBA AI editor and item 58 acknowledgement.
- Fresh UTC timestamp, deployed commit, health, source and queue results.
- Confirm private sharing; retain the owner’s proxy result separately from an anonymous check.
- Run `python3 ops/backups/database.py backup`; record the private backup receipt path.
- Keep a mode-600 copy of the environment file outside the repository; record its path only.
- Record migration head and preserve additive migrations; activation needs no schema rollback.
- Record `PUBLIC_MODE=1`, `VITE_PUBLIC_MODE=1`, build result and API restart time.
- Record deployed admission/browser checks from runbook step 3.
- Record the next normal public-mode scheduled edition ID and NBA editing result.

## Exact private-mode recovery

If sharing is still private, confirm that state before restoring private mode.
If sharing changed, the owner must unshare and confirm proxy authentication first.
Keep public mode enabled until private sharing is confirmed.

1. Set only `PUBLIC_MODE=0` in `~/.config/news-digest/env`; preserve current
   account flags, credentials and other settings. Do not blindly restore an old env file.
2. From `~/news-digest`, run `VITE_PUBLIC_MODE=0 pnpm build`.
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

No sharing command, budget change or activation is authorized by this record alone;
the scheduled gate and STEERING 59 remain controlling.
