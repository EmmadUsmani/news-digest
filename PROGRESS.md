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

[Iterations 2105–2110](docs/progress-archive/2026-11-13-iterations-2105-2110.md).

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

## 2026-11-13: iteration 2117 — retain X count age in final selection

- Clean main; no inherited work. Initial alerts zero; healthz, 38 sources and all queues healthy. NBA/item 58 acceptance awaits the 15:00 UTC scheduled edition; public mode remains off.
- Found final X selection received reported likes without their observation time. It now receives the validated report timestamp and explicit single-snapshot/unknown-growth evidence; missing timestamps remain unknown.
- Focused `pnpm exec tsx --test --test-reporter=dot apps/api/test/social-editorial-selection.test.ts`: 12 pass; covers dated/missing evidence, zero/unknown likes, 1,200-character bound and original-post preservation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; `git diff --check` passes.
- Handbook initially exceeded 100 lines; shortened affected paragraph. `pnpm exec tsx scripts/check-handbook.ts social-posts` now passes (18 pages/one unchanged diagram/39 tables).
- API/worker restarted active; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). Updated TASKS, SOURCES and affected handbook; NEEDS_FROM_HUMAN unchanged.
- No paid/external verification, collection, provider, budget, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private.

## 2026-11-13: iteration 2118 — reconcile public activation handoff

- Clean main; no inherited work. Initial alerts zero; healthz, source readiness and queue readiness pass. Next natural edition is Nov 13 15:00 UTC; NBA/item 58 acceptance remains pending.
- Corrected the public-access plan's current handoff, which still said to stop for lead review and treated Grafana capacity as a launch gate. It now follows STEERING 59 and the readiness runbook: private-sharing activation after scheduled acceptance, parallel lead review, no public Grafana, public Spend, then scheduled public-mode acceptance before the owner's sharing decision.
- Updated TASKS; SOURCES and NEEDS_FROM_HUMAN unchanged. No runtime, collection, budget, provider, flag or sharing changes; no paid verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- `pnpm exec tsx scripts/check-handbook.ts` passes: 18 pages/22 unchanged diagrams/39 tables. Saved-reader check passes: five topics/25 stories/22 posts. `git diff --check` passes.
- API/worker restart and post-restart health verified before commit. Next: scheduled NBA/item 58 acceptance, then private-sharing public activation; while waiting, continue X/Bluesky tuning under STEERING 59.

## 2026-11-13: iteration 2119 — retain all X reported counts in selection

- Clean main; no inherited work. Initial alerts zero; health, 38 sources and queues healthy. NBA/item 58 acceptance awaits the 15:00 UTC edition; public mode stays off.
- X triage previously received only likes from validated reports. It and final selection now retain reported reposts, replies and views, including explicit zero/unknown distinctions. Counts remain unverified hints; official metrics and ranking weights unchanged.
- Focused X selection, social-editorial selection and production triage tests pass (42 tests): invalid reports withheld, offset normalization, unknown/zero counts, cache invalidation for every added count and bounded final-editor transport.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings; social-posts handbook check passes (18 pages/one unchanged diagram/39 tables); `git diff --check` passes.
- API/worker restarted active; healthz and `check-scheduled-reader.ts 2026-11-12T15:00:00Z` pass (five topics/25 stories/22 posts). Initial health probe raced startup; bounded retry passed.
- Updated TASKS, SOURCES and affected handbook; archived progress 2105–2110 to keep the live log small. NEEDS_FROM_HUMAN unchanged. No paid calls, collection, budget, provider, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized X/Bluesky tuning while waiting.

## 2026-11-13: iteration 2120 — correct social selection provenance

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance still awaits 15:00 UTC; public mode remains off.
- Found Reddit AI selections recorded a misleading missing-X-search-evidence reason. Limited that diagnostic to X posts; Reddit retains its own provenance. No ranking, platform reservation, budgets or saved editions changed.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/social-editorial-selection.test.ts`: 12 pass, including mixed-platform provenance and original-post preservation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 931 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; healthz 200 and saved-reader check for Nov 12 pass (five topics/25 stories/22 posts). No handbook/source behavior changes; SOURCES and NEEDS_FROM_HUMAN unchanged.
- No paid calls, provider, collection, flag or sharing changes. Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2121 — reject invalid X ranking dates

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance awaits 15:00 UTC; public mode stays off.
- X engagement ranking could return a NaN bonus for an invalid publication date, or accept an invalid cutoff. Both now return unknown evidence with zero bonus; valid-date scoring and weights unchanged.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/x-engagement-ranking.test.ts apps/api/test/x-search-engagement.test.ts`: six pass, including invalid publication/cutoff combinations and valid-date control.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 932 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted; healthz database/Redis healthy after startup retry. Saved-reader check for Nov 12 passes: five topics/25 stories/22 posts.
- Updated TASKS; bug fix needs no handbook/source change. SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2122 — withhold ambiguous Bluesky growth

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. NBA/item 58 acceptance still awaits 15:00 UTC; public mode remains off.
- Conflicting counts at an earliest/latest observation timestamp previously supplied arbitrary net growth. Growth now stays unknown for either conflict, including equivalent timestamp formats; ranking and valid signed changes unchanged.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/bluesky-ranking.test.ts`: five pass, covering all three counts at either endpoint, input-order independence and identical duplicate controls.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 933 unit/290 integration tests, four expected skips. `pnpm build`: pass with existing bundle warnings; handbook social-posts check passes (18 pages/one unchanged diagram/39 tables).
- API/worker restarted active; healthz passes after bounded startup retry. Saved-reader Nov 12 check passes (five topics/25 stories/22 posts).
- TASKS, SOURCES and affected handbook updated; NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2123 — compare Bluesky publication instants

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts. Scheduled NBA/item 58 acceptance remains due at 15:00 UTC; public mode stays off.
- Equivalent publication timestamps previously prevented valid same-post growth comparisons. Compare parsed instants in history and conflict checks; mismatched authors/times remain excluded.
- `pnpm exec tsx --test --test-reporter=dot apps/api/test/bluesky-ranking.test.ts`: six pass, including offset/UTC equivalence, input-order independence, mismatched identity/time and equivalent-format count conflicts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 934 unit/290 integration tests, four expected skips; typecheck/lint/format/boundaries green. `pnpm build` passes with existing bundle warnings.
- API/worker restarted active; healthz passes after startup retry. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z` passes: five topics/25 stories/22 posts.
- TASKS updated; bug fix needs no handbook/source change. SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls, provider, collection, budget, flag or sharing changes.
- Next: scheduled NBA/item 58 acceptance, then public activation with sharing private; continue authorized social tuning while waiting.

## 2026-11-13: iteration 2124 — resolve Tech launch/promotion comparison

- Clean main; no inherited work. Initial `pnpm obs alerts`: zero alerts; NBA/item 58 awaits 15:00 UTC.
- Completed the saved Nov 11 FishAudio comparison from docs/ideas.md using a temporary read-only `pnpm exec tsx scripts/tmp-social-review.ts` probe (removed afterward). Read-only repeatable-read transaction; no provider instantiated or writes.
- Nine of 84 saved scores qualify; the only higher-interestingness unselected post duplicates the selected official Claude launch. Remaining distinct alternatives have equal/lower scores and less concrete topic substance. Retain the voice launch; no ranking/prompt/publication change justified.
- Both saved editorial stages recognized its promotion. Corrected the earlier metrics ambiguity: official metrics empty, saved reasons retain unverified xAI counts and bounded bonus. Evidence in docs/edition-reviews/2026-11-11-tech-social-launch.md.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: pass; 934 unit/290 integration tests, four expected skips. `pnpm build` passes with existing bundle warnings. Full handbook check passes: 18 pages/22 diagrams/39 tables.
- API/worker restarted active; `/healthz` database/Redis healthy. `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-12T15:00:00Z`: five topics/25 stories/22 posts, pass.
- TASKS and resolved idea updated; SOURCES/NEEDS_FROM_HUMAN unchanged. No paid calls, budgets, flags, provider or sharing changes.
- Next: 15:00 UTC scheduled NBA/item 58 acceptance, then private-sharing public activation; continue remaining authorized social tuning meanwhile.
