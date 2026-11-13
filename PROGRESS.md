# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

[Iterations 1764–1769](docs/progress-archive/2026-11-11-through-1769.md).

[Iterations 1770–1775](docs/progress-archive/2026-11-11-iterations-1770-1775.md).

[Iterations 1776–1781](docs/progress-archive/2026-11-11-iterations-1776-1781.md).

[Iterations 1782–1787](docs/progress-archive/2026-11-11-iterations-1782-1787.md).

[Iterations 1788–1793](docs/progress-archive/2026-11-11-iterations-1788-1793.md).

[Iterations 1794–1804](docs/progress-archive/2026-11-11-iterations-1794-1804.md).

[Iterations 1805–1810](docs/progress-archive/2026-11-11-iterations-1805-1810.md).

[Iterations 1811–1814](docs/progress-archive/2026-11-11-iterations-1811-1814.md).

[Iterations 1815–1820](docs/progress-archive/2026-11-11-iterations-1815-1820.md).

[Iterations 1821–1827](docs/progress-archive/2026-11-11-iterations-1821-1827.md).

[Iterations 1828–1833](docs/progress-archive/2026-11-11-iterations-1828-1833.md).

[Iterations 1834–1839](docs/progress-archive/2026-11-11-iterations-1834-1839.md).

[Iterations 1840–1849](docs/progress-archive/2026-11-11-iterations-1840-1849.md).

[Iterations 1850–1857](docs/progress-archive/2026-11-12-iterations-1850-1857.md).

[Iterations 1858–1862](docs/progress-archive/2026-11-12-iterations-1858-1862.md).

[Iterations 1863–1869](docs/progress-archive/2026-11-12-iterations-1863-1869.md).

[Iterations 1870–1872](docs/progress-archive/2026-11-12-iterations-1870-1872.md).

[Iterations 1873–1875](docs/progress-archive/2026-11-12-iterations-1873-1875.md).

[Iteration 1876](docs/progress-archive/2026-11-12-iteration-1876.md).

[Iteration 1877](docs/progress-archive/2026-11-12-iteration-1877.md).

[Iterations 1878–1879](docs/progress-archive/2026-11-12-iterations-1878-1879.md).

[Iterations 1880–1881](docs/progress-archive/2026-11-12-iterations-1880-1881.md).

[Iterations 1882–1885](docs/progress-archive/2026-11-12-iterations-1882-1885.md).

[Iterations 1886–2011](docs/progress-archive/2026-11-12-iterations-1886-2011.md).

[Iterations 2012–2020](docs/progress-archive/2026-11-12-iterations-2012-2020.md).

[Iterations 2021–2027](docs/progress-archive/2026-11-12-iterations-2021-2027.md).

[Iterations 2028–2040](docs/progress-archive/2026-11-12-iterations-2028-2040.md).

[Iterations 2100–2104](docs/progress-archive/2026-11-13-iterations-2100-2104.md).

## 2026-11-13: iteration 2105 — restore U.S. Bluesky collection

- Clean main; no inherited work. Zero alerts, healthz healthy, sources healthy; digest queue staffed/zero failures, next edition Nov 13 15:00 UTC.
- Official authenticated API comparison, same 24-hour window: original `US Congress courts elections` zero; explicit OR alternative zero; `Congress`/`Senate` 50 each, `politics` 49 with non-U.S. material. Replaced the overconstrained seed with verified `Congress`.
- Migration 0024 preserves owner-edited/blank queries and other topics; existing one-query/two-page/50-post limits unchanged. Real-Postgres regressions cover normal migration chain, seed repair, reruns and owner edits.
- Initial `pnpm check`: 922 unit passed; integration caught omitted migration journal entry (289 passed/one failed/four skipped). Registered migration; full rerun passes 922 unit/290 integration, four expected skips.
- `python3 ops/backups/database.py backup`: fresh 39-table backup. Env-file `node --import tsx apps/api/src/libs/db/migrate.ts` applied 0024. Explicit U.S.-only production collector fetched/submitted 50; DB confirms 50 new observations/50 distinct posts. Temporary verification scripts removed.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `check-handbook.ts` (18 pages/22 diagrams, affected-page rerun) and `git diff --check` pass; existing bundle warning only. Updated source evidence, affected handbook and TASKS; no schema metadata change needed.
- No paid calls, provider/budget/flag/sharing changes; NEEDS_FROM_HUMAN unchanged. API/worker restart and post-push health readback follow commit.
- Next: confirm hourly U.S. continuation and scheduled selection; Nov 13 scheduled NBA/item 58 acceptance still gates public-mode activation. While waiting, proceed to X/Bluesky tuning per STEERING 59.

## 2026-11-13: iteration 2106 — give Bluesky triage its stored evidence

- Clean main; no inherited work. Zero alerts/healthy healthz; staffed queues, no failed digest runs; Nov 13 15:00 scheduled acceptance still pending.
- Read saved Nov 12 Bluesky picks: World had zero likes/reposts but one reply. Positive-engagement admission is correct; triage received only text, unlike X's author/count/media hints.
- Supplied bounded author, latest valid cutoff-bound official counts, observation timestamp and attachment presence to semantic triage. Explicit snapshot/unknown growth, reach and media-content limitations; original text unchanged. No threshold, slot, collection, budget or provider changes.
- Focused offline shortlist/editor/ranking tests: 12 passed. Regression covers competing snapshots, zero counts, bounded author, attachment uncertainty, unchanged text and existing semantic bar.
- `pnpm check` passes: 923 unit/290 integration, four expected skips. Build passes (existing bundle warning). Handbook initially exceeded 100 lines; removed a stale pre-activation X note and rerun passes (18 pages/one unchanged diagram/39 tables). Updated affected handbook, source evidence and TASKS; NEEDS_FROM_HUMAN unchanged.
- Read-only coverage confirms natural 04:54:53.990 hourly U.S. continuation: 100 observations/53 distinct posts, 50 safe engaged candidates. Initial root script invocation lacked workspace resolution; reran with API NODE_PATH successfully.
- `pnpm format`, `pnpm lint:fix` and `git diff --check` pass; API/worker restart and post-push health readback follow commit.
- No inference, source requests, flag/sharing changes or saved-edition writes. Next: review scheduled NBA/item 58 acceptance before private-sharing public activation, and assess natural social selection quality.

## 2026-11-13: iteration 2107 — preserve Bluesky evidence through selection

- Clean main; no inherited work. Zero alerts and healthy healthz. All queues staffed; digest has zero failed jobs and next scheduled edition Nov 13 15:00 UTC. Latest hourly social collection completed normally.
- Triage had observation time without publication time; final editor lacked attachment presence. Added publication time to triage and explicit attached/absent media evidence to editing, keeping contents, growth and account-relative reach unknown.
- Focused offline shortlist/editor tests: ten pass. Regression covers media/text-only distinction, publication time, omission of unverified alt-text claims and unchanged selected observation. No source requests or inference calls.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 924 unit/290 integration, four expected skips. `pnpm build` passes (existing bundle warning); `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` passes (18 pages/one unchanged diagram/39 tables).
- Initial read-only `obs jobs --queue digest` rejected unknown queue; unfiltered `pnpm obs jobs --check --limit 1` passes all four queues. No operational mutation from either query.
- Updated TASKS, source evidence and affected handbook; NEEDS_FROM_HUMAN unchanged. No budgets, providers, flags, sharing, collection caps or selection thresholds changed.
- Commit/push and API/worker restart follow; next review scheduled NBA/item 58 acceptance before private-sharing public activation, then natural social selection quality.

## 2026-11-13: iteration 2108 — supply attributed Bluesky media descriptions

- Clean main; no inherited work. Zero alerts, healthy healthz and staffed queues; next scheduled NBA/item 58 acceptance remains Nov 13 15:00 UTC.
- Selection previously knew only attachment presence although official collection preserves author alt text. Both triage and final editing now receive up to four descriptions, each capped at 125 characters, labeled untrusted author claims rather than verified contents or instructions.
- Original text/observations preserved; no URLs supplied as description evidence, no media fetching, inference or source requests. No provider, budget, collection, threshold, flag or sharing changes.
- Focused offline media-evidence/shortlist/editor tests: 11 pass, covering description bounds, image/video types, blank descriptions, attribution and selected observation preservation.
- Build passes (existing bundle warning); affected handbook check passes (18 pages/one unchanged diagram/39 tables). Updated TASKS, source evidence and affected handbook; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 925 unit/290 integration, four expected skips. `git diff --check` passes. Commit/push and API/worker restart follow; next scheduled NBA/item 58 acceptance gates private-sharing public activation.

## 2026-11-13: iteration 2109 — supply measured Bluesky count changes

- Clean main; no inherited work. Zero alerts, healthy healthz and staffed queues; scheduled NBA/item 58 acceptance remains Nov 13 15:00 UTC.
- Weakness: selection called growth unknown despite retained repeated observations. Read-only last-24-hour aggregate found 231/252 topic/post entries with multiple observation times. Initial query omitted the app's default connection URL and failed; corrected read succeeded.
- Triage and final editor now receive earliest-to-latest valid same-post/author/publication count changes through cutoff. Signed decreases preserved; one comparable timestamp leaves growth unknown. Net differences are not gross activity or account-relative reach.
- Ranking weights, thresholds, collection, budgets, providers, flags and sharing unchanged. No paid calls, external requests or saved-edition writes.
- Focused ranking/shortlist/editor tests pass (14), covering cutoff/invalid counts, competing snapshots, input order, signed declines and both selection stages. Build passes (existing bundle warning); affected handbook check passes (18 pages/one unchanged diagram/39 tables).
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 926 unit/290 integration, four expected skips. `git diff --check` passes. Updated TASKS, source evidence and affected handbook; NEEDS_FROM_HUMAN unchanged.
- Commit/push and API/worker restart follow; reader HTTP 200 before deployment.
- Next: scheduled NBA/item 58 acceptance, private-sharing public activation, and natural social selection review.

## 2026-11-13: iteration 2110 — concrete activation recovery record

- Clean main; no inherited work. Read Current order/item 59; scheduled NBA/item 58 acceptance still awaits Nov 13 15:00 UTC. Public mode remains off.
- Prepared docs/public-activation-record.md and linked it from readiness: exact flag/build/service recovery, preserved account flags/additive migrations, private-sharing prerequisite and activation receipt fields.
- Preparation baseline records deployed 8ac58ec7, API/worker active without drop-ins, PUBLIC_MODE absent/effective zero, and saved edition b1be5a12-2972-4eeb-9bff-82cbb10c1b07. Refresh after scheduled acceptance; this is not an activation receipt.
- `pnpm obs alerts`: zero alerts; healthz healthy; `pnpm obs sources --check`: 38 healthy/zero unhealthy; `pnpm obs jobs --check --limit 1`: staffed queues and next scheduled edition 15:00 UTC. Retained historical failures unchanged.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: latest/direct/history agree, five topics/25 stories/22 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 926 unit/290 integration, four expected skips. `pnpm build` passes (existing bundle warning); `pnpm exec tsx scripts/check-handbook.ts public` passes; `git diff --check` passes.
- TASKS/readiness updated; SOURCES and NEEDS_FROM_HUMAN unchanged (no source or owner-action change). No paid calls, budgets, providers, flags or sharing changes.
- Commit/push and API/worker restart follow. Next: scheduled NBA/item 58 acceptance, refresh activation baseline/backup, then authorized private-sharing public activation.

## 2026-11-13: iteration 2111 — preserve complete serialized media evidence

- Clean main; no inherited work. Zero alerts and healthy healthz; scheduled NBA/item 58 acceptance remains Nov 13 15:00 UTC. Public mode stays off.
- Found Bluesky author descriptions could expand under JSON escaping and be cut mid-JSON by the final editor’s 1,200-character evidence limit, losing supplied context.
- Descriptions now share a 500-character serialized allowance within the existing four/125-character limits; longest descriptions shorten first while all four retain attribution. Stored observations/media and ranking weights unchanged.
- Offline regression combines escaped control characters, quotes, emoji, four media attachments, maximal safe counts and repeated snapshots: complete attributed JSON and net-count evidence fit the final field; original observation unchanged. Targeted media/editor/shortlist suite: 12 pass.
- No external requests, paid calls, budgets, provider, flag or sharing changes. Updated TASKS, source evidence and affected handbook; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 927 unit/290 integration, four expected skips. First check caught formatting in the newly archived progress file; corrected and reran successfully.
- `pnpm build` passes (existing bundle warning); `pnpm exec tsx scripts/check-handbook.ts social-posts` passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes. Archived older progress entries to keep this file small.
- Pushed `1ecd9092`; API/worker restarted active. Immediate startup probe raced the listener; five seconds later healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). `pnpm obs sources --check` and `pnpm obs jobs --check --limit 1` pass. Next: scheduled NBA/item 58 acceptance, fresh activation baseline and private-sharing public activation.

## 2026-11-13: iteration 2112 — preserve evidence through production triage

- Clean main; no inherited work. `pnpm obs alerts`: zero alerts. NBA/item 58 scheduled acceptance still waits for 15:00 UTC; public mode remains off.
- Reader weakness: Bluesky scoring silently lost count-growth/media context because metadata occupied a JSON title truncated to 500 characters by production triage.
- Moved metadata into a separate social-only 3,000-character evidence field; ordinary title/excerpt bounds stay intact. Evidence enters cache identity and existing byte-aware batching/admission. Article scoring unchanged.
- Offline production composition verifies complete JSON with escaped author/media, net growth and four attributed descriptions; text preserved, repeat calls cached, changed descriptions invalidate scores. Focused triage/shortlist tests: 29 pass.
- Updated TASKS, SOURCES and affected handbook. No external calls, paid replay, budget/provider/flag/sharing changes; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 928 unit/290 integration tests, four expected skips. `pnpm build` passes (existing bundle warning); social-posts handbook check passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes.
- Pushed `a08213e5`; API/worker restarted active. Healthz passes; `check-scheduled-reader.ts 2026-11-12T15:00:00Z` verifies five topics/25 stories/22 posts; `pnpm obs sources --check` verifies 38 healthy sources and `pnpm obs jobs --check --limit 1` verifies staffed queues and next edition at 15:00 UTC. Next: scheduled NBA/item 58 acceptance, private-sharing activation and natural Bluesky selection review.

## 2026-11-13: iteration 2113 — retain X triage engagement evidence

- Clean main; no inherited work. Zero alerts; healthz healthy, 38 healthy sources and staffed queues. NBA/item 58 scheduled acceptance still awaits 15:00 UTC; public mode stays off.
- Reader value: X scoring now retains reported engagement/media hints when escaped author text would truncate its metadata, helping compare posts on supplied evidence.
- Moved X metadata from the 500-character title to the existing bounded social evidence field. Unknown/zero counts and unverified attribution preserved; official metrics, post text and ranking weights unchanged.
- Production triage regression verifies complete escaped JSON, untouched text/official metrics, cache reuse and invalidation on changed reported likes. Targeted triage/social selection: 37 pass.
- Updated TASKS, SOURCES and affected handbook; NEEDS_FROM_HUMAN unchanged. No external calls, paid replay, provider/budget/flag/sharing changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 929 unit/290 integration tests, four expected skips. `pnpm build` passes (existing bundle warning); `pnpm exec tsx scripts/check-handbook.ts social-posts` passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes.
- Pushed `14cd9eea`; API/worker restarted active. Healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). `pnpm obs sources --check`: 38 healthy; `pnpm obs jobs --check --limit 1`: all queues staffed, edition scheduled 15:00 UTC. Next: NBA/item 58 scheduled acceptance, then authorized private-sharing public activation.

## 2026-11-13: iteration 2114 — carry X hints into final selection

- Clean main; no inherited work. Alerts zero; healthz healthy, 38 sources healthy and all queues staffed. NBA/item 58 acceptance still awaits the 15:00 UTC scheduled edition; public mode remains off.
- Found final X selection received only its ranking explanation, dropping the reported likes/media hints now provided to triage. Final editor now receives both, with a 600-character ranking explanation so all hints fit its 1,200-character field.
- Reported likes stay unverified; zero differs from unknown, media contents remain unknown. Original post text, official metrics, ranking weights and selection gates unchanged. Reddit is parked and untouched.
- Focused `pnpm exec tsx --test --test-reporter=dot apps/api/test/social-editorial-selection.test.ts`: 12 pass; covers long explanation, 1,700/zero/missing likes, media uncertainty and original-post preservation.
- Updated TASKS, SOURCES and affected handbook; archived older progress entries. No paid/external calls, provider/budget/flag/sharing changes; NEEDS_FROM_HUMAN unchanged.
- `pnpm exec tsx scripts/check-handbook.ts social-posts`: pass (18 pages/one unchanged diagram/39 tables). `pnpm check` passes: 930 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes (existing bundle warning); `git diff --check` passes.
- API/worker restarted; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). `pnpm obs sources --check` and `pnpm obs jobs --check --limit 1` pass; next edition 15:00 UTC. Next: scheduled NBA/item 58 acceptance, then private-sharing public activation.

## 2026-11-13: iteration 2115 — give X triage publication time

- Clean main; no inherited work. Initial alerts zero, healthz healthy, 38 sources healthy and all queues staffed. Scheduled NBA/item 58 acceptance awaits 15:00 UTC; public mode remains off.
- X triage lacked publication time alongside engagement hints. Added the stored post timestamp to its existing bounded evidence field; counts remain unverified, with no claim of measured growth.
- Offline production regression verifies timestamp transport, changed-time cache invalidation, unchanged text and empty official metrics. Focused triage/social selection tests: 38 pass.
- Updated TASKS, SOURCES and affected handbook. No paid/external calls, collection, ranking-weight, budget, provider, flag or sharing changes; NEEDS_FROM_HUMAN unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 930 unit/290 integration tests, four expected skips. Handbook social-posts check passes (18 pages/one unchanged diagram/39 tables); `pnpm build` passes with existing bundle warning.
- API/worker restarted active. Initial endpoint probe raced startup; retry passes healthz and saved reader (five topics/25 stories/22 posts). Next: NBA/item 58 scheduled acceptance, then private-sharing public activation.

## 2026-11-13: iteration 2116 — date X reported-count evidence

- Clean main; no inherited work. Initial alerts zero; healthz, 38 sources and all queues healthy. NBA/item 58 scheduled acceptance still awaits 15:00 UTC; public mode remains off.
- Found X triage received reported likes without their observation time. It now receives normalized UTC time from the same validated report used by ranking, with an explicit single-snapshot/unknown-growth label.
- Invalid, mismatched, pre-publication and post-cutoff reports supply no timestamp. Missing counts remain unknown; original text, official metrics, ranking weights and final-editor behavior unchanged.
- Offline targeted X/triage/social selection tests: 42 pass. Production triage verifies transport and cache invalidation on timestamp changes; repository integration verifies offset normalization and invalid-report omission.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips. `pnpm build` passes (existing bundle warning); social-posts handbook check passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes.
- API/worker restarted active; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). `pnpm obs sources --check` and `pnpm obs jobs --check --limit 1` pass; edition remains scheduled 15:00 UTC.
- Updated TASKS, SOURCES and affected handbook; NEEDS_FROM_HUMAN unchanged. No paid/external verification, collection, provider, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then authorized public activation with sharing private.
