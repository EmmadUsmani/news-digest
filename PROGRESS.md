# Progress

Older entries: [archived through the first half of Nov 15](docs/progress-archive/2026-11-15-before-2346.md).

## 2026-11-15: iteration 2339 — reclaim stale installer scratch

- Clean main at accf2897; no inherited work. Orientation output was overbroad; subsequent reads narrowed. Alerts zero; health/database/Redis healthy, sources collecting and scheduled digest due 15:00 UTC. No duplicate acceptance or metrics probe.
- Owner value: reclaim disk headroom before the scheduled edition and test-container peaks, applying STEERING 61 once today at 76% use.
- Deleted only four top-level regular files, each exedev-owned, older than seven days and unused according to privileged `fuser -v` (exit 1, empty output). Installer archive listings confirmed tools rather than backups.
- Deleted `/tmp/vmalert-tool-prod` (36,474,880 allocated bytes), `/tmp/vmalert-prod` (28,065,792), `/tmp/news-digest-age-v1.3.2.tar.gz` (19,406,848) and `/tmp/nd-postgres-exporter.tgz` (10,559,488). Total 94,507,008 bytes (90.1 MiB); absence asserted after deletion.
- `df -B1 --output=size,used,avail,pcent /`: available 6,008,619,008→6,102,863,872 bytes; rounded disk use 76%→76%. Retained all logs, metrics/data, backups, browser profiles/sessions and installed executables.
- Verification: ownership/age/regular-file assertions, archive inspection, privileged open-reference checks and post-delete absence checks pass. `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips). Logs `/tmp/2339-{format,lint,check}.log`.
- No app code/config, source, schema, budget, inference or sharing changes; no restart under STEERING 22. Next: scheduled recovery and public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2340 — restore archive verification in public mode

- Clean main at 03926499; no inherited work. Alerts zero, API/database/Redis healthy; all 38 sources healthy and collecting. Scheduled acceptance still due 15:00 UTC.
- Owner value: past editions and older/newer navigation must remain usable before sharing. Reproduced the archive check failing before browser launch: its visitor-less loopback fetch returned an empty public-mode refusal response.
- Repaired `smoke-reader-archive.ts` with an explicit documentation-range local visitor for fixed-origin history reads and loopback GET/HEAD browser requests. No account identity; external requests blocked and admin/writes asserted absent.
- Real published history and saved-edition date navigation pass desktop/mobile light/dark. Controlled pagination/empty/error/retry cases replay saved history and are not live pagination evidence. Zero page errors or horizontal overflow.
- Refreshed eight archive/date screenshots and inspected mobile light archive and saved edition. App, admission policy, collection, generation, budgets and VM sharing unchanged.
- Verification: `pnpm exec tsx scripts/smoke-reader-archive.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected skips). Initial non-TTY full check exited 143 during unit tests; persistent-terminal retry completed. Logs `/tmp/2340-{archive,sources,format,lint,check-retry}.log`.
- Initial push rejected because remote advanced; fetched and merged owner-only `docs/lead/` updates without editing them or rewriting history. No runtime impact or additional checks needed.
- No restart under STEERING 22: services run unchanged code/config. Next: Nov 15 scheduled recovery/public-reader gate; retain private VM sharing.

## 2026-11-15: iteration 2341 — verify archive keyboard and loading recovery

- Clean main at dfcf719e; no inherited work. Alerts zero, health/database/Redis healthy; source check passes. Scheduled recovery/public-reader acceptance remains due 15:00 UTC.
- Reproduced archive keyboard check failing on visitor-less public-mode history fetch. Added documentation-range visitor admission to fixed loopback history/browser reads in focus and loading checks, with status/timeout assertions, no identity and external requests blocked.
- The keyboard check also sampled the heading during scroll settlement (y=-73); it now waits for the existing viewport condition before measuring, without relaxing focus or visibility requirements.
- Desktop/mobile light/dark pass delayed older/newer pagination, heading focus/page description, visible focus outline and next-date Tab order. Loading skeletons, saved links and failed-request retry pass all four combinations.
- Controlled pagination/delay/failure responses replay real saved history, not live pagination evidence. Refreshed twenty screenshots; inspected mobile light pagination. No app/admission, source, schema, inference, budget or sharing change.
- Verification: both Playwright scripts pass all four viewport/theme combinations; `pnpm format`, `pnpm lint:fix`, full `pnpm check` pass (1,040 unit/329 integration passes, four expected skips). Initial check stopped at formatting after the progress archive was created; formatted and reran successfully. Logs `/tmp/2341-{focus,loading,sources,format-retry,lint-retry,check-retry}.log`.
- Archived iterations 2325–2330 to keep PROGRESS.md below 25 KB. No restart under STEERING 22: runtime code/config unchanged. Next: Nov 15 scheduled recovery/public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2342 — restore keyboard skip verification

- Clean main at d4e8e38b; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy and source check passes. Scheduled acceptance remains due 15:00 UTC.
- Reproduced keyboard skip check failing before browser launch on visitor-less public-mode latest-edition fetch. Added documentation-range visitor admission to fixed loopback reads, status/timeout assertions and published-topic assertion; no identity, writes or external requests.
- Real saved edition and archive pass desktop/mobile light/dark: first Tab reveals the skip link, Enter focuses the visible content heading, next Tab reaches content and no overflow/page errors occur.
- Refreshed eight screenshots and inspected mobile light edition. No app/admission, content, source, schema, budget or sharing changes.
- Verification: `pnpm exec tsx scripts/smoke-reader-skip-link.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass. Logs `/tmp/2342-{skip,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. Next: scheduled recovery/public-reader gate; keep VM private.

## 2026-11-15: iteration 2343 — restore timeout recovery verification

- Clean main at f851b6b2; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy; all 38 sources pass the source check. Scheduled acceptance remains due 15:00 UTC.
- Reproduced timeout smoke failure before browser launch: visitor-less public-mode latest-edition read returned 429. Added documentation-range visitor admission to fixed loopback reads, redirect refusal and a published-topic assertion.
- Browser reads now carry the local visitor; external requests are blocked and admin reads/writes remain asserted absent. No app or admission-policy change.
- Controlled stalled edition/archive requests reach bounded timeout without automatic retries; manual retry restores real saved content on desktop/mobile light/dark. Saved reader and admin-preview data remain unchanged; zero browser errors or writes.
- Refreshed eight timeout screenshots and inspected mobile light archive. Stalls are simulated; recovered content is the real published edition.
- Verification: `pnpm exec tsx scripts/smoke-reader-timeout.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected skips). Logs `/tmp/2343-{timeout,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No collection, generation, budget or sharing changes. Next: scheduled recovery/public-reader acceptance; keep VM private.

## 2026-11-15: iteration 2344 — restore edition loading verification

- Clean main at 4c60b771; no inherited work. Initial orientation output was overbroad; narrowed later reads. Alerts zero, health/database/Redis healthy and all 38 sources pass. Scheduled acceptance remains due 15:00 UTC.
- Reproduced loading smoke failure before browser launch: visitor-less latest-edition fetch returned an empty non-JSON response. Added documentation-range visitor admission, explicit HTTP status/timeout/redirect checks and a published-topic assertion to fixed loopback reads.
- Browser traffic now asserts no admin reads, identity headers or writes; external requests and service workers are blocked. No application admission-policy change.
- Desktop/mobile light/dark pass loading skeletons, real saved-topic rendering and controlled 404 recovery. Refreshed four screenshots; inspected mobile light. Delay/error responses are simulated; rendered edition content is real saved content.
- Verification: `pnpm exec tsx scripts/smoke-reader-loading.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass (1,040 unit/329 integration passes, four expected integration skips). Logs `/tmp/2344-{loading,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No generation, source, budget or sharing changes. Next: scheduled recovery/public-reader acceptance; VM stays private.

## 2026-11-15: iteration 2345 — restore date-navigation recovery verification

- Clean main at 208e24d5; no inherited work. Initial orientation output was overbroad; narrowed subsequent reads. Alerts zero, health/database/Redis healthy and all 38 sources pass. Scheduled acceptance remains due 15:00 UTC.
- Reproduced date-navigation smoke failure before browser launch: visitor-less latest-edition fetch returned empty non-JSON. Added documentation-range visitor admission to fixed loopback reads, status/timeout checks and redirect refusal.
- Browser requests assert no identity headers, admin reads or writes; external traffic and service workers blocked. No application admission-policy change.
- Desktop/mobile light/dark pass invalid history, repeated failure, manual retry, older-date destination and keyboard-focus recovery using real saved edition/history. Failures are simulated; refreshed four screenshots and inspected mobile light.
- Verification: `pnpm exec tsx scripts/smoke-reader-date-recovery.ts`, `pnpm obs sources --check`, `pnpm format`, `pnpm lint:fix`, full `pnpm check` and diff checks pass. Logs `/tmp/2345-{date,sources,format,lint,check}.log`.
- No restart under STEERING 22: runtime code/config unchanged. No source, generation, budget or sharing changes. Next: scheduled publication/public-reader acceptance; VM stays private.

## 2026-11-15: iteration 2346 — correct scheduled-review activation chronology

- Clean main at e6cde7d5; no inherited work. Owner-visible correction: the Nov 15 review incorrectly described public mode as still off, which could mislead scheduled launch acceptance. Preserved the historical capture state and documented subsequent activation.
- Alerts zero, health/database/Redis healthy; all 38 sources pass. Scheduled-reader gate returns expected pending (exit 2) before Nov 15 15:00 UTC; latest remains Nov 14. All 32 deployed-loopback account-boundary checks pass.
- Due passive metrics sample at 05:22:36–05:23:06: 24 healthy rules, four uncached queries ≤0.949 s, no merges or new evaluator errors/misses/admission hits/timeouts/slow queries. Both process starts unchanged; warning journal empty since 03:53:55. Next sample ≥06:24 UTC; comparable merge acceptance remains open.
- Examined Tech excerpt collection against the existing depth decision: empty HN evidence is already explained by metadata-only collection. No new admission variant, linked-page crawl, source or paid replay is justified before natural scheduled evidence.
- Verification: `pnpm obs alerts`, `pnpm obs sources --check`, `/healthz`, `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-15T15:00:00Z`, `pnpm exec tsx scripts/check-live-account-boundary.ts`, metrics sampler and warning journal; `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,040 unit/329 integration passes, four expected skips), diff checks. Logs `/tmp/2346-*`.
- Archived older progress and completed task markers to keep orientation files bounded; history retained with links.
- Runtime/config unchanged; no restart under STEERING 22. Public mode ON, VM private. Next: scheduled publication/reader gate and natural editorial recovery review; avoid more browser-smoke restoration or repeated Tech admission studies.
