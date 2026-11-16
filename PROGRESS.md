# Progress

Older entries: [earlier Nov 15](docs/progress-archive/2026-11-15-before-2346.md), [iterations 2339–2347](docs/progress-archive/2026-11-15-2339-2347.md).

Archived: [iterations 2348–2354](docs/progress-archive/2026-11-15-2348-2354.md).

Archived: [iterations 2355–2360](docs/progress-archive/2026-11-15-2355-2360.md).

Archived: [iterations 2361–2367](docs/progress-archive/2026-11-15-2361-2367.md).

Archived: [iterations 2368–2377](docs/progress-archive/2026-11-15-2368-2377.md).

Archived: [iterations 2378–2386](docs/progress-archive/2026-11-15-2378-2386.md).

Archived: [iterations 2387–2397](docs/progress-archive/2026-11-15-2387-2397.md).

Archived: [iterations 2398–2402](docs/progress-archive/2026-11-15-2398-2402.md).

Archived: [iterations 2403–2410](docs/progress-archive/2026-11-15-2403-2410.md).

Archived: [iterations 2411–2420](docs/progress-archive/2026-11-15-2411-2420.md).

Archived: [iterations 2421–2429](docs/progress-archive/2026-11-15-2421-2429.md).

Archived: [iterations 2430–2435](docs/progress-archive/2026-11-15-2430-2435.md).

## 2026-11-15: iteration 2436 — identify archive coverage timezones

- Clean main at b2d52476; no inherited work. Alerts zero, health passes, all 38 sources without errors. Scheduled acceptance and metrics follow-up remain time-gated.
- Owner value: archive readers can identify the timezone of each coverage boundary when comparing editions.
- Coverage windows previously showed unlabelled local times; added short timezone names while preserving exact machine-readable instants and local dates/times.
- Extended existing read-only archive browser check to New York/Tokyo and 320px; saved production history/navigation plus explicit saved-response empty/error cases, no provider calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`; archive browser checks, scheduled reader and health. Results below; receipts `/tmp/2436-*`.
- API/worker restarted; initial immediate browser probe preceded startup, then retried after health passed. No sharing or content-generation change; no handbook change needed for display fix.
- Next: metrics ≥23:06 UTC; World retained-job export by Nov 16 06:56 UTC; natural content acceptance Nov 16. Public mode ON; VM private.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build and 12 archive browser cases pass. Tokyo narrow/light screenshot inspected; no overflow. Scheduled reader: five topics/23 stories/16 posts. `git diff --check` clean; older progress archived.

## 2026-11-15: iteration 2437 — measure second Ukraine pass discovery value

- Clean main at bc6524a6; no inherited work. Alerts zero; health passes, all 38 sources healthy, digest queue has no failures. Old failed transient check units are historical, not crashed app roles. Daily scratch cleanup already applied; no deletion.
- Owner value: distinguish genuinely new World reporting from refreshed popular posts before accepting the discovery pilot.
- Read all 48 exact saved 21:54 Ukraine texts in a read-only repeatable-read transaction: 13 new World identities, 35 repeated from first Ukraine pass; new outlet reporting coexists with same-event duplicates and commentary.
- Preserved all 13 new snapshots plus three repeated commentary/satire examples and sixth actual rotation job. Review names specific new developments and duplicate-event risks; retain queries, budgets and gates pending natural selection/full day.
- Assertions pass: exact cohort/identity counts, prior-post overlap, publication windows, unmodified examples, six completed jobs/rotation/unchanged companion queries/50-observation bounds. Private receipts `/tmp/2437-*`.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, public build, scheduled reader, health and `git diff --check`; results recorded below. No app or handbook behavior change; no provider calls, collection or publication writes.
- `pnpm obs jobs --check --state failed` unavailable in public mode; queue-count fallback passes with zero digest failures. Existing ingestion failures do not coincide with any unhealthy source.
- Next: metrics ≥23:06 UTC; retained-job export by Nov 16 06:56 UTC; next natural World/NBA/Tech acceptance Nov 16 15:00 UTC. Public mode ON; VM private.
- Full check passes: 1,050 unit/329 integration tests, four expected skips; public build passes. API/worker restarted; startup-aware health and scheduled-reader probes pass (five topics/23 stories/16 posts). `git diff --check` clean; no push blocker.
- Initial push rejected: owner lead-note commit 8896a47c arrived during verification. Integrated it with a merge (no rewritten history or edits to owner files); retrying push. App code unchanged by the remote commit.

## 2026-11-15: iteration 2438 — identify published-preview coverage timezones

- Clean main at d3aee674; no inherited work. Alerts zero, health passes and all 38 sources healthy; scheduled/content acceptance and metrics follow-up remain time-gated.
- Reader weakness: published-edition history/detail previews showed ambiguous local coverage times, unlike the reader archive. Both now show the local timezone; detail boundaries also retain machine-readable instants.
- Expanded existing offline public-preview browser checks to New York/Tokyo and desktop/mobile/320px in both themes, checking exact localized boundaries and overflow alongside restricted reads/error recovery. Synthetic preview responses are explicitly offline, not live content.
- Verification commands: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `VITE_PUBLIC_MODE=1 pnpm build`, both preview scripts in both timezones, scheduled-reader check and health. Receipts `/tmp/2438-*`; final results below.
- No provider calls, sharing, selection or handbook behavior changes. Next: metrics ≥23:06 UTC, retained-job export by Nov 16 06:56 UTC, natural edition acceptance Nov 16 15:00 UTC.
- Browser history check also contained stale denials for now-public `/admin/spend` and `/admin/tools`; restricted generation remains checked. Two shell-attached checks ended on SIGTERM (143), one during units and one after the final integration case; detached systemd check completed successfully.
- Concurrent owner commits change sharing status to public and report `/db/` CSP/ELK failure plus deployment interruptions; preserved owner files unchanged and queued explicit breakage triage. No sharing change by this iteration.
- Final verification: detached `pnpm check` exits 0 (1,050 unit/329 integration pass, four expected skips); public build, preview browser checks in both zones, targeted lint and `git diff --check` pass. Tokyo full-page narrow screenshots inspected. API/worker restarted; startup-aware health and scheduled-reader probes pass (five topics/23 stories/16 posts).
- Initial push rejected by newer owner commits. Merged items 63/64 and owner notes without changing them; TASKS now starts with atomic deployment, local ELK, full handbook and admin direct-load work. No further build/restart after reading the new steer; current web fix is already live.

## 2026-11-15: iteration 2439 — deploy web releases atomically

- Clean main at a5991641; no inherited work. Alerts zero and DB/Redis health green. Followed item 63 step 1 before other breakages; no provider calls or sharing changes.
- Web build now stages a separate release and atomically swaps `dist`, including first conversion from a directory using Linux rename exchange. Serialized deploys retain each retired release's own hashed assets for ≥24 hours; expired inherited assets do not accumulate forever. Failed builds preserve the live release.
- Public static admission refreshes exact allowed paths after a release switch; unknown paths, maps, symlinks and writes remain denied. Added release-switch regression and isolated fake-builder checks for conversion, retention, failed build and expiry; integrated deployment checks into unit suite.
- Updated README and operations runbook: web-only build never restarts API/worker; restart only changed roles, no deploys 13:00–16:00 UTC. API rebuilt/restarted for admission changes and its cache fix; worker unchanged. Initial startup probes retried until healthy.
- Two real public HTTPS deployments (directory conversion and later symlink swap): 54 one-second samples, zero failed page/previous/current asset requests; API/worker PID/start times unchanged during deployment. VM hosts file resolves its name internally, so probes used public DNS IP with TLS hostname preserved; no hosts/sharing edits.
- Signed-out public Chromium desktop/mobile: saved edition renders, 216 source links each, zero failed same-origin responses; narrow screenshot inspected. Scheduled reader verifies Nov 15 edition: five topics/23 stories/16 posts. Receipts `/tmp/2439-*`.
- Verification: `python3 scripts/test-deploy-web.py`, targeted static tests, `pnpm format`, `pnpm lint:fix`, `pnpm check`, API build, atomic public web build, operations handbook check, health and `git diff --check`; final full-check results below.
- Full checks caught generated-release linting and a millisecond-mtime cache collision; excluded build output and keyed admission on nanosecond timestamps plus theme inode/type. Handbook initially exceeded 100-line limit; shortened affected page and rechecked successfully. No changed diagrams remain; removed obsolete deployment diagram in favor of the executable runbook.
- Next: item 63 local pinned ELK for `/db/`, then full public handbook/privacy/browser acceptance, item 64 direct admin loads. Nov 16 public scheduled-edition acceptance remains open; metrics follow-up ≥23:06 UTC and Bluesky export by 06:56 UTC.
- Final `pnpm check` exits 0: 1,052 unit/329 integration tests pass, four expected skips. API build and both atomic web deployments pass; final public browsers, scheduled reader, health, affected handbook checks and `git diff --check` pass. No service restart needed for remaining docs/tooling-only changes.

## 2026-11-15: iteration 2440 — restore the public DB schema diagram

- Clean main at a7c4c1d4; no inherited work. Alerts zero; DB/Redis health green. Followed item 63 step 2; no provider calls or sharing changes.
- Pinned elkjs 0.9.3 as an explorer dependency and serve its bundled browser engine at `/db/elk.bundled.js`; removed the CDN script. Exact GET path admitted by public policy/proxy; CSP and write restrictions unchanged.
- Expanded existing route/proxy acceptance cases and added a read-only signed-out public browser check (public DNS resolution preserves TLS host). Desktop/mobile render 39 tables, search/select users, and report zero console/page/HTTP errors or external scripts. Diagram/detail screenshots saved and inspected.
- Updated affected handbook engine description. `pnpm exec tsx scripts/check-handbook.ts about-these-docs --owner-services` passes (18 pages, one diagram, 39 tables); unchanged diagram inspected. Initial default invocation correctly refused the private handbook in current public mode.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, API build, public schema browser script, scheduled-reader probe, `/healthz` and `git diff --check`; receipts `/tmp/2440-*`, final full-check result below.
- Restarted changed API and schema roles only; worker/web unchanged. Reader verifies Nov 15 scheduled edition: five topics/23 stories/16 posts; health green after restart.
- Shell-attached full check ended on SIGTERM (143) after integration case 333 without a final summary; detached systemd full check started for a reliable completion receipt.
- Next: item 63 full handbook privacy review/public browser acceptance, then item 64 admin direct loads. Nov 16 15:00 scheduled publication acceptance remains open; retained Bluesky job export due 06:56 UTC. Metrics follow-up remains pending.
- Final detached `pnpm check` exits 0: 1,052 unit/329 integration tests pass, four expected skips. API build, handbook check, signed-out public browser checks, scheduled-reader provenance, targeted script lint and `git diff --check` pass. No deployment/push blocker.

## 2026-11-15: iteration 2441 — recover disk headroom after interrupted checks

- Clean main at 337464e4; no inherited work. `pnpm obs alerts` found DiskSpaceLow firing; `/healthz` and API/worker/docs/schema roles healthy. Prioritized active alert under STEERING 51 before handbook publication.
- Two interrupted shell-attached checks from 2438/2440 left integration coverage roots. Privileged existing process-reference scanner found no same-user environment, command, cwd or descriptor references; both recorded runner PIDs had exited. Removed only these unused integration folders under item 51's explicit leftover-folder authorization; startup's one-hour retention and daily item 61 cleanup remain unchanged.
- Deleted `/tmp/news-digest-integration-2qwYji` (285,204,480 allocated bytes) and `/tmp/news-digest-integration-cWWxkt` (285,151,232 bytes): 570,355,712 bytes / 544 MiB recovered, disk 80%→78%. No backups, logs, browser state, volumes or unrelated scratch touched.
- `pnpm exec tsx --test apps/api/test/integration-temp.test.ts`: one pass, covering killed-run recovery and retention of active/recent/unrelated/symlink paths. Full verification and alert-resolution results follow.
- No runtime/configuration change, provider calls or service restart needed. Next: item 63 full handbook privacy review/publication and desktop/mobile browser acceptance, then item 64 admin direct loads; Nov 16 scheduled acceptance and retained Bluesky export remain pending.
- Final verification: `pnpm format`, `pnpm lint:fix`, detached `pnpm check` exit 0 (1,052 unit/329 integration pass, four expected skips), `git diff --check`; receipt `/tmp/2441-check.log`. Cleanup of the completed detached run left no integration roots.
- `pnpm obs alerts` reports zero firing/pending after metric refresh; disk remains 78% after full check. `pnpm obs sources --check`: 38/38 healthy; `pnpm obs jobs --check`: scheduled queue zero failures, next Nov 16 15:00 UTC (historical ingestion/social failures retained). `check-scheduled-reader.ts 2026-11-15T15:00:00Z` verifies five topics/23 stories/16 posts.

## 2026-11-16: iteration 2442 — publish the full public handbook

- Clean main at 62ee6333; no inherited work. Alerts zero, health green. Completed STEERING 63 step 3; no spend, sharing changes or worker restart.
- Reviewed the 18 Markdown pages and served inventory; scan against installed credential values and key/private-key patterns found none. Removed concrete backup bucket configuration and corrected stale private-sharing/reader-guide descriptions. No private operational data is exposed by the handbook APIs.
- Public `/docs/` now uses the full handbook service on 8100. Exact GET/HEAD viewer/tree/corpus/page routes share public admission; page reads stay inventory-bound, writes/unknown paths denied. Proxy strips credentials/cookies, checks the handbook upstream marker and applies restrictive local-only script CSP.
- Pinned DOMPurify/marked/Mermaid/ELK and esbuild; browser bundle builds to an atomic file swap. No CDN imports or CSP widening. Corrected root-relative app links and public tool shortcuts; fixed narrow footer overflow and wrapping while retaining table scrolling.
- Targeted route/proxy/access-stack tests: 17 pass. Staged real viewer under restrictive proxy CSP renders successfully. Initial browser harness corrected section “Overview” label assumption; initial mobile check caught and fixed footer overflow. Initial handbook check caught 102/101 prose lines; page shortened to 100 and rechecked.
- Public signed-out HTTPS Playwright: desktop 1440/mobile 390 each verify all 18 pages/21 diagrams, sidebar navigation, search, direct refresh, no page overflow, cookies, external requests or console/page/HTTP errors. Four screenshots saved and inspected; rendered diagram contact sheet inspected.
- Verification: `pnpm format`, `pnpm lint:fix`, detached `pnpm check`, docs/API builds, `check-handbook.ts --owner-services`, corrected operations handbook check, `check-live-reader-handbook.ts`, scheduled reader, sources/jobs, health and `git diff --check`; final CI result follows. Receipts `/tmp/2442-*`.
- Restarted changed docs/API roles only; worker/web unchanged. Sources 38/38 healthy; Nov 15 published reader retains five topics/23 stories/16 posts. No restart for subsequent viewer/Markdown edits.
- Full CI initially found a stale readiness matrix expecting the now-authorized handbook API to be closed; updated anonymous/reader/admin GET/HEAD coverage and retained traversal/write refusals. Targeted matrix passes; docs-site tests 10/10 pass. Final detached rerun exits 0: 1,052 unit/329 integration tests pass, four expected skips; final detached `pnpm lint:fix` exits 0.
- Archived progress 2430–2435 after crossing 25 KB; updated TASKS with the owner’s public sharing decision. Final reader/browser/health/alerts and formatting checks pass; no deployment/push blocker.
- Next: STEERING 64 fresh-admin direct New edition loads, then Nov 16 scheduled public-edition acceptance. Retained Bluesky export remains due 06:56 UTC; metrics follow-up still open.

## 2026-11-16: iteration 2443 — restore admin direct New edition loads

- Clean main at 3b28b100; no inherited work. Alerts zero; followed STEERING 64 after item 63 steps 1–3.
- Exact GET/HEAD `/admin/editions/new` now classified admin; other routes/methods unchanged. Policy/HTTP tests cover anonymous/reader refusal and fresh-admin admission (10 tests pass).
- Real browser acceptance exposed a second blocker: client guard called closed `/api/me`. Public-mode protected-page guard now reads `/api/account/session`; private identity path unchanged.
- Built/restarted changed API only; initial immediate health probe preceded readiness, subsequent `/healthz` green. Built web with atomic release procedure; no worker/web restart.
- HTTPS browser harness initially hit Node request DNS failure, then shared loopback rate limit; corrected to Chromium-resolved requests and dedicated existing forwarded-IP pattern. First real form check found the client guard failure above.
- Final public HTTPS acceptance: signed-out GET/HEAD 404; fresh stored admin session GET/HEAD 200; typed URL and reload show Create an edition at 1440/390px, no overflow/browser errors. Screenshots saved; mobile inspected. Local file-mailbox authentication only; session logged out; no real email, edition creation or paid calls.
- Updated operations handbook; `check-handbook.ts 08-operations` passes (18 pages, 39 tables, no changed diagrams). Sources 38/38 healthy; scheduled-reader verifies Nov 15 five topics/23 stories/16 posts; scheduled queue remains healthy.
- Verification: `pnpm format`, `pnpm lint:fix`, detached `pnpm check`, API/web builds, policy/access tests, live browser, scheduled reader, sources/jobs and `git diff --check`; final completion receipt follows. Receipts `/tmp/2443-*`.
- Next: Nov 16 15:00 UTC scheduled public-publication/editorial acceptance; protect 13:00–16:00 UTC. Retained Bluesky export due 06:56 UTC and metrics follow-up remain pending.
- Final detached `pnpm check` exits 0: 1,053 unit/329 integration tests pass, four expected skips. Detached `pnpm format`/`pnpm lint:fix` exit 0; targeted final client/browser-script lint and handbook verification pass. Shell-attached style rerun was terminated (143), so used the detached receipt. Both screenshots inspected.
- Atomic web deployment poll: 21 public reader/old/current asset samples, zero failures. Final alerts zero and `/healthz` green; no deployment/push blocker.
