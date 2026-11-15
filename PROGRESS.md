# Progress

Older entries: [through iteration 2288](docs/progress-archive/2026-11-14-through-2288.md), [2289–2294](docs/progress-archive/2026-11-14-2289-through-2294.md), [2295–2298](docs/progress-archive/2026-11-14-2295-through-2298.md).

Archived continuation: [2299–2304](docs/progress-archive/2026-11-14-2299-through-2304.md).

Archived continuation: [2305–2314](docs/progress-archive/2026-11-14-2305-through-2314.md).

Archived continuation: [2315–2324](docs/progress-archive/2026-11-15-2315-through-2324.md).

## 2026-11-15: iteration 2325 — saved X fallback evidence

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Reader concern: selected X posts must stay readable when third-party media is unavailable. The owner would notice missing text or broken recovery beside already-thin topic sections.
- `pnpm exec tsx scripts/smoke-reader-x-media.ts` passes desktop/mobile/320px light/dark: saved text, all selected failure states, original links, retry/keyboard recovery and theme persistence. Recovery uses a local widget stub, not live X.
- Recorded evidence in Tech social review and refreshed four desktop/mobile fallback screenshots; inspected mobile light. Discarded all other incidental screenshot refreshes. No observed app defect or code change.
- `pnpm exec tsx scripts/smoke-reader-coverage-count.ts` also passes all four views; discarded its screenshot refreshes. No external requests, provider calls, production writes or configuration changes; handbook/SOURCES unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Private receipts `/tmp/2325-*.log`.

## 2026-11-15: iteration 2326 — restore saved edition selection verification

- Clean main; no inherited work. Initial alerts zero, health passes, all 38 sources healthy. Scheduled acceptance and metrics probe not due; public mode off/VM private.
- Actual failure: `pnpm exec tsx scripts/smoke-edition-selection.ts` expects a desktop date without the visible weekday, then compares Bluesky rendered text against raw text despite saved display text. Updated assertions to match the current reader contract, preserving exact date/accessibility and content/destination checks; added post URL to mismatch diagnostics.
- Selection and `pnpm exec tsx scripts/smoke-edition-history.ts` pass 16 combined desktop/mobile light/dark delayed-success/error scenarios: late responses preserve the chosen saved edition, without writes or browser errors. External browser traffic blocked. Refreshed eight screenshots; inspected both mobile light views.
- No app behavior, source, schema, runtime settings or editorial changes; handbook/SOURCES unchanged. No provider calls or production writes. Receipts `/tmp/2326-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: due passive metrics sample, then scheduled Nov 15 review.

## 2026-11-15: iteration 2327 — due passive metrics recovery sample

- Clean main; no inherited work. Alerts zero, health passes, all 38 sources and 14 monitored services healthy; recent collection jobs completed. Historical failed transient check units are not monitored app services.
- Due read-only sample at 01:31:24–01:31:55 UTC: 24 fresh healthy rules; uncached queries ≤0.456 s; no new evaluator errors, missed iterations, admission hits, timeouts or slow queries. Neither tier merged; process starts unchanged.
- Warning-level system metrics/alerts journal since 00:25:32 UTC has no entries. Comparable natural merge still required; retain CPU-only 2% trial, no retuning/forced merge/restart. Next probe no earlier than 02:32 UTC. Raw receipt `/tmp/2327-metrics.jsonl`.
- Updated recovery evidence and open task. Public mode remains off/VM private; scheduled Nov 15 acceptance still pending. No provider/source requests, production writes, UI/schema/system-flow changes; handbook/SOURCES/screenshots unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit.

## 2026-11-15: iteration 2328 — saved-reader reporting provenance

- Clean main; no inherited work. Alerts zero, health passes and all 38 sources healthy. Scheduled acceptance and metrics sample not due; public mode remains off/VM private.
- Reader weakness under review: thin Tech reporting makes discovery-site versus publisher attribution material, including after bookmarking. No new editorial change is justified before the next natural edition.
- `pnpm exec tsx scripts/smoke-reader-saved-source.ts` passes desktop/mobile light/dark: real Nov 14 discovery and grouped primary-report provenance survives saved-item reload, with exact destinations; explicit synthetic publisher override and legacy fallback also pass. All external browser requests blocked. Refreshed four screenshots; inspected mobile light. No observed app defect.
- `pnpm exec tsx scripts/smoke-reader-story-text.ts` passes all four views for the older saved regression edition: exact story text, five NBA summaries, no writes/errors or saved-data changes. Discarded its incidental screenshot refreshes; this is not Nov 15 acceptance.
- No provider calls, production writes, configuration/schema/source changes; handbook/SOURCES unchanged. Receipts `/tmp/2328-reader.log` and `/tmp/2328-story.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. API/worker restart and health verification follow commit. Next: metrics no earlier than 02:32 UTC, then Nov 15 scheduled recovery acceptance.
- Initial push rejected after concurrent lead commit `50c0295b` (owner notes only); merged without editing owner files or rewriting history. API/worker restarted; `/healthz` confirms database/Redis healthy. Retrying push.

## 2026-11-15: iteration 2329 — protected editorial handoff design

- Clean main; no inherited work. Alerts zero, health passes, 38 sources healthy. Metrics sample not due until 02:32 UTC; scheduled recovery pending, public mode off/VM private.
- Owner benefit: earlier U.S. editing must not steal NBA repair capacity; five-topic latency remains over target. Chose the explicitly deferred handoff design after NBA scheduled acceptance instead of repeating accepted reader checks.
- Added proposed decision 0005: owned topic/model/attempt envelopes, atomic transfer into real ledger holds, bounded initial/repair estimates, fallback separation, cache/uncertainty accounting, fenced recovery and drain-before-rollback. No production implementation or speedup claimed.
- Read existing production ledger/admission and topic scheduling; static subtraction and a story/social barrier alone cannot solve editor-versus-editor contention. Next: owned-balance simulator counterexample and saved-request bound feasibility before any migration/runtime change.
- No provider/source requests, production writes, runtime/schema/UI changes; handbook/SOURCES/screenshots unchanged. Existing seven staged scheduler tests pass; receipts `/tmp/2329-*.log`.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), `pnpm build` and `git diff --check` pass; existing bundle warning only. Seven staged tests, saved-timeline reproduction and local decision links pass. API/worker restart and health verification follow commit.
- Initial push rejected by concurrent owner/lead commits; merged without conflicts or owner-file edits. New STEERING 60 authorizes the two inventoried artifacts: privileged `fuser` checks across 50 paths found no open references. Removed `/tmp/obs355` (254,668,800 allocated bytes) and `/tmp/news-digest-vmutils.tgz` (144,220,160); disk 78%→77%. Marked owner request resolved and acked item 60; no other cleanup.
- API/worker restart and `/healthz` passed. Incoming commits only change steering/lead notes; no application rebuild needed after merge. Final doc formatting and diff checks pass; retrying push.

## 2026-11-15: iteration 2330 — item 58 acceptance

- Clean main at 576fd167; no inherited work. Alerts zero, database/Redis healthy, 38 sources healthy; next scheduled digest Nov 15 15:00 UTC with no failed digest jobs.
- New owner STEERING 62 supersedes the all-topic AI gate. Acked item 58 against Nov 14 edition b9d55088-892a-4e34-b77c-a398d64c6a9f and owner proxy/TLS result; security fix commits and evidence retained in handoff. No lead/security rehearsal rerun.
- Next: fresh private backup/baseline, activate server/web public mode while sharing stays private, verify deployed admission, then wait for next scheduled publication. No new spend or sharing changes.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (1,025 unit/329 integration passes, four expected skips), public `VITE_PUBLIC_MODE=1 pnpm build` and `git diff --check` pass; existing bundle warning only. Activation follows this separate item 58 acknowledgement commit.

## 2026-11-15: iteration 2330 — public mode enabled, VM private

- Enabled server/web public mode under STEERING 62 after separate item 58 ack 69699604. No sharing, budget or provider changes; next scheduled acceptance remains Nov 15 15:00 UTC. Updated readiness/plan/handbook to publishing/reader/refusal gate; AI quality stays breakage work.
- Fresh private backup: 39 tables/19,637,477 bytes; mode-600 env rollback copy and reader baseline retained outside repo. Full paths and deployment evidence in docs/public-activation-record.md. API/worker restarted with shared env; database/Redis healthy.
- Deployed boundary: 32 checks pass; explicit activation probe: 26 checks pass for signed-out reader/assets, private-route and legacy-header refusals, fresh-admin read and disposable reader isolation. Reader deleted/admin logged out; no owner settings changed.
- Desktop/mobile Playwright show saved real Nov 14 edition without page errors (external embeds blocked); screenshots refreshed and mobile inspected. Latest/direct/history agree: five topics/14 stories/19 posts. This is activation baseline, not next scheduled acceptance.
- Public DNS/TLS curl returns 307 to exe.dev login with HSTS, confirming private sharing. In-VM DNS points hostname locally; public address supplied only for TLS probe. Application checks use explicit loopback visitor headers.
- Fixed local scheduled-reader and operations probes for configured public admission. Public source error flags and queue counts/next runs preserve health exit codes; state filtering refuses unavailable private detail. Regression tests cover credential isolation and malformed private snapshots.
- Temporary probe's unsupported GET sync corrected to POST; cleanup succeeded. Initial ack push rejected by concurrent owner notes; merged cb50449b without owner-file edits or history rewrite. Public reader remained healthy; no rollback required.
- Sources: all 38 healthy, no source errors. Digest queue: one worker/no failures, next run 15:00 UTC; alerts zero. No source/schema/editorial changes or new live generation. Next: scheduled publishing gate, then item 50 ack and stop before sharing.
- Verification: targeted 22 CLI/credential tests and final `pnpm check` pass (1,027 unit/329 integration passes, four expected skips); `VITE_PUBLIC_MODE=1 pnpm build`, `pnpm format`, `pnpm lint:fix` and diff checks pass. Initial new-test lint/handbook length findings corrected. Handbook check with `NODE_OPTIONS=--import=/tmp/2330-owner-handbook.mjs` validates owner pages, diagrams and all 39 schema tables. Archived 2315–2324 and trimmed done markers; no diagram changes. Final service restart/health/reader checks follow commit.
