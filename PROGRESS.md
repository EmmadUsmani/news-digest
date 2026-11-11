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

## 2026-11-11: iteration 1834 — prepared public Queues page

- Clean main; no inherited work. Initial alerts zero, healthz healthy, all 36 sources healthy; no provider calls.
- Prepared exact GET/HEAD `/admin/queues`, read-only sanitized counts/next runs, Tools link, bounded response validation and refresh stale-data warning. Private Bull Board retained; public flags unchanged.
- `pnpm exec tsx scripts/check-public-status-view.ts` passes desktop/mobile light/dark, read-only requests and refresh failure/recovery. Four new queue screenshots and updated Tools screenshots; inspected queue layouts. Discarded unrelated regenerated images.
- Browser retries resolved schedule timeout during concurrent build and an in-progress refresh; final serial browser check passes. Fixed Queues header found during screenshot review.
- `pnpm exec tsx --test apps/api/test/public-route-policy.test.ts` passes six tests. Handbook check passes (18 pages/one diagram/39 tables); no diagrams changed.
- `pnpm exec tsx scripts/smoke-admin-tools.ts` passes four private viewport/theme combinations. Account boundaries pass 32 checks; scheduled reader retains four topics/19 stories/19 posts. Initial source diagnostic used absent healthy field; corrected error/lastSuccess read confirms all 36 healthy.
- `pnpm format` and `pnpm lint:fix` pass; build passes. First full check saw the browser's temporary HTML harness during format check; rerun after harness cleanup.
- Full `pnpm check` retry passes: 836 unit/283 integration passes and four expected skips; private jobs browser verifies four real queues/40 schedules.
- Pushed `09dc7257`; API restarted outside the hold. Post-restart healthz, 32 account boundaries, private Tools browser, 36 healthy sources and saved four-topic/19-story/19-post edition pass; alerts zero. Public mode stays off.
- Next: remaining Phase 4 tool/rehearsal gates, Grafana scheduled-load/compaction capacity evidence and Nov 12 edition review.

## 2026-11-11: iteration 1835 — compiled public page document rehearsal

- Clean main; no inherited work. Initial alerts zero and healthz healthy; no provider calls or flag changes.
- Extended the disposable full-application rehearsal for Tools, Spend and Queues: anonymous GET returns the actual SPA shell, HEAD is empty, and writes/nested routes refuse with empty 404s despite forged owner headers. Existing sanitized API and stored-session checks run alongside it; public rendering remains covered separately.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Full `pnpm check` passes: 836 unit/283 integration passes, four expected skips; expanded compiled-app rehearsal passes.
- `pnpm exec tsx scripts/smoke-admin-tools.ts` passes four private viewport/theme combinations; discarded regenerated unchanged screenshots. Filtered handbook check passes, no handbook behavior/diagram change.
- `pnpm exec tsx scripts/check-live-account-boundary.ts` passes 32 checks; live status confirms 36 healthy sources, saved edition four topics/19 stories/19 posts.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 healthy rules, zero new evaluator errors/misses, four queries ≤0.258 s; no merges, so compaction capacity gate remains open. Next passive probe ≥18:28 UTC.
- Pushed `34e26acf`; restarted API. Post-restart healthz, 32 account-boundary checks and zero alerts pass; working tree clean. Public mode remains off. Next: remaining Phase 4 rehearsal/tool gates, Grafana capacity evidence and Nov 12 edition review.

## 2026-11-11: iteration 1836 — compiled privacy and request-log rehearsal

- Clean main; no inherited work. Initial pending API scrape alert cleared on repeat; healthz healthy and all 36 sources healthy. No provider calls or production flag changes.
- Expanded disposable compiled-app rehearsal: anonymous privacy GET/HEAD match the SPA shell without visitor headers, POST refuses, and both success/refusal retain HSTS/nosniff/no-referrer/framing/CSP.
- Mounted compiled production request logging before admission. Real mailbox-code issuance/redemption and authenticated query/header probe retain matching request IDs/statuses and omit email/code/cookie/token/client IP; environment-value redaction disabled in capture. Request middleware only, other application logs remain separate.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and filtered handbook check pass; no UI or handbook behavior changes.
- Live `check-live-account-boundary.ts` passes 32 checks; status confirms 36 healthy sources; saved edition remains four topics/19 stories/19 posts.
- Full `pnpm check` passes: 836 unit/283 integration passes, four expected skips; expanded compiled-app rehearsal passes.
- Pushed `81b6acda`; `systemctl --user restart news-digest-api.service` completed. Post-restart healthz, 32 account-boundary checks, 36 healthy sources, saved four-topic/19-story/19-post edition and zero alerts pass. Public mode remains off.
- Next: remaining Phase 4 tool/rehearsal gates, Grafana scheduled-load/compaction capacity evidence and Nov 12 edition review. Next passive metrics probe remains ≥18:28 UTC.

## 2026-11-11: iteration 1837 — compiled reader settings documents

- Clean main; no inherited work. Initial alerts zero, healthz healthy; no provider calls or production flag changes.
- Extended compiled full-application HTTP rehearsal to schedule, sources, topic catalog and UUID topic detail: actual SPA GET, empty HEAD, cookie-free CSP response, forged-owner write/nested-route refusals. Malformed/uppercase topic IDs, new-topic and editor routes refuse GET/HEAD.
- Covers HTTP composition with disposable storage; public rendering retains prior separate browser checks. Public mode remains off.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `git diff --check` and filtered handbook check pass; no UI changes.
- Live account-boundary script passes 32 checks; authenticated status confirms 36 healthy sources and saved edition four topics/19 stories/19 posts. Initial localhost status probe lacked loopback credentials; corrected with the existing local-admin helper.
- Full `pnpm check` passes: 836 unit tests, 283 integration passes, four expected skips; expanded compiled-app rehearsal passes. Archived iterations 1821–1827 to keep progress small.
- Initial push rejected (upstream owner steering); merged origin/main without rewriting history. New item 55 stops repeated rehearsal; added Phase 4 security-review handoff/ack and stopped item 50. `bef43855` predates receipt; no verification-only commit after receipt.
- API restart healthy; 32 account checks and zero alerts passed before receiving item 55. No new verification runs after receipt. Next: lead security review/owner decision; Nov 6 review if unfinished, then item 38.

## 2026-11-11: iteration 1838 — accurate mixed-publisher outlet counts

- Clean main; no inherited work. Initial alerts zero and healthz healthy. Removed completed Nov 6 review (1011) from Current order as permitted; item 50 remains stopped for lead review under 55.
- Owner value (item 38/42): NBA coverage no longer counts Yahoo feed provenance as an extra publisher alongside named syndicated outlets. Advances reader accuracy after item 33; no X tuning or item 50 work.
- Fixed StorySources to use the primary coverage record and other individual reports, excluding the aggregate story feed list when primary evidence exists. Saved Celtics coverage now shows three articles/three outlets (two labels plus one), rather than four outlets.
- Strengthened smoke-reader-coverage-count.ts against actual saved mixed feed/publisher coverage: exact outlet count, every article destination, no overflow/page errors; passes desktop/mobile light/dark. Updated four screenshots and visually inspected mobile light. External traffic blocked; no synthetic content or provider calls.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. `pnpm check` passed typecheck/lint/format/boundaries and 836 unit tests; process then terminated with SIGTERM (143) during integration, without a test failure. Isolated integration completed separately below.
- Separate `pnpm test:integration` passes: 283 passed, four expected skips, zero failures. Saved latest edition remains four topics/19 stories/19 posts; `pnpm obs sources --check` confirms 36 healthy sources. No handbook/system-flow change.
- API restarted outside the protected window; active, healthz/database/Redis healthy after startup retries, zero firing/pending alerts. Next: lead security review/owner decision, Nov 12 review, then item 38 reader work; next passive metrics probe ≥18:28 UTC.
- Committed `747ed643`; push rejected because owner item 56 landed upstream. Merged without history rewrite; retained its priority and removed only the completed Nov 6 line. New World/U.S. plan read; next iteration starts its offline scope/source assessment while item 50 waits. No cap/topic changes yet.

## 2026-11-11: iteration 1839 — offline World/U.S. scope and sources

- Clean main; no inherited work. Alerts zero, healthz healthy; item 50 remains stopped for lead/owner review under 55. No provider calls or production flag/topic/cap changes.
- Assessed every saved Nov 4–10 World story: 28 total, 23 international/five U.S.-domestic, exclusive manual assignment. Saved IDs/titles/summaries/labels and added a provider-free evaluator; no runtime routing rules.
- Recorded proposed topic guidance, default visibility, source moves, candidate X accounts and boundary judgments in docs/edition-reviews/2026-11-11-world-us-scope.md. U.S. has zero/one saved story daily; new domestic depth is necessary.
- Four free RSS probes returned 200 and parsed: Guardian US 33, NPR Politics 10, PBS Politics 20, NPR general news 10; select first three, leave general news out. Updated docs/SOURCES.md; no production collection changes.
- `pnpm exec tsx scripts/evaluate-world-us-scope.ts` passes all seven dates/counts/exclusive memberships; labels are manual evaluation evidence, not a production classifier test.
- `pnpm format`, `pnpm lint:fix`, `pnpm build`, `pnpm check`, `git diff --check` and filtered handbook check pass. Full check: 836 unit/283 integration passes, four expected skips. No UI change.
- Live source check: 36 healthy/zero unhealthy; latest published edition remains four topics/19 stories. API restart/health check follows push; runtime build is unchanged by this offline step.
- Next: topic/source setup and joint AI event ownership; measure fifth-topic reserve from saved costs before cap changes. Then scheduled acceptance; no paid test runs.

## 2026-11-11: iteration 1840 — fifth-topic saved-cost gate

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy and all 36 sources healthy. Item 50 remains stopped under 55; continued item 56.
- Added provider-free, read-only repeatable-read evaluator joining Nov 4–10 saved edition UUIDs to ledger run IDs; checks four topics, positive costs and zero unresolved calls, and reads recent fully AI-complete costs.
- Saved actual costs $0.286904–$0.422356. Equal-share fifth-topic proxy peaks at $0.527945; 1.5× reserve $0.791918 exceeds the approved $0.65 ceiling. Ledger has no topic attribution; estimate explicitly does not claim measured World cost or future admission.
- Recorded figures and next gate in docs/edition-reviews/2026-11-11-fifth-topic-budget.md and TASKS.md. No caps, production topics, provider/model choices or reserve rules changed; no paid calls.
- `pnpm exec tsx scripts/evaluate-fifth-topic-budget.ts --read-only`, `pnpm format`, `pnpm lint:fix`, `pnpm build` and `git diff --check` pass. Full `pnpm check` passes: 836 unit/283 integration passes, four expected skips; typecheck/lint/format/boundaries green.
- Next: topic data and joint AI event ownership with costed requests/admission below the approved ceiling before coordinated activation; scheduled acceptance still pending.

## 2026-11-11: iteration 1841 — prepared joint story ownership

- Clean main; no inherited work. Initial alerts zero; healthz/database/Redis healthy. Item 50 remains stopped under 55; continued item 56 without provider calls or runtime/cap changes.
- Added opt-in EventGrouping.assignTopics: one budgeted/cached Haiku request jointly groups up to 40 articles from two data-defined scopes and assigns each event one owner. Existing per-topic grouping remains unchanged; no production caller yet.
- Requires complete exclusive article-ID membership, valid owner IDs and strict output shape. Invalid/partial output or budget refusal returns unavailable, with no repair request; singleton events can move to the appropriate scope.
- Eight provider-free contract tests pass for cross-topic grouping, singleton reassignment, cache identity, invalid membership/input and refusal. Test responses do not establish semantic quality; scheduled acceptance remains pending.
- Updated scope assessment and TASKS. No handbook flow or schema change. Filtered handbook check passes (18 pages/39 tables, no drift).
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, targeted `tsx --test` and `git diff --check` pass: 844 unit/283 integration passes, four expected skips. Existing bundle-size warning only.
- `pnpm obs sources --check`: 36 healthy/zero unhealthy; latest saved edition eb6e962e remains available with four topics. `systemctl --user restart news-digest-api.service news-digest-worker.service` passes after push 9b0ad012; both active, healthz/database/Redis healthy, latest edition still serves and zero alerts.
- Next: costed joint-request admission below the approved ceiling, publication integration/unavailable policy and topic/source data; no fifth-topic activation before these gates.

## 2026-11-11: iteration 1842 — joint ownership reservation measurement

- Clean main; no inherited work. Alerts zero, healthz/database/Redis healthy; 36 sources healthy, latest saved edition eb6e962e serves four topics. Item 50 remains stopped under 55; continued 56.
- Added offline evaluator using actual EventGrouping/BudgetedLlm request construction and admission estimate, refusing in-memory ledger and prohibited provider. No DB, provider calls, runtime/cap/topic changes or ledger writes.
- Seven saved-summary proxies reserve $0.002543–$0.002789; 40 maximum-length ASCII articles reserve $0.010156. Multibyte stress refuses before reservation; exactly one reservation/no repair for valid inputs. These are size probes, not semantic or full-edition admission evidence.
- Conservative combined five-topic proxy reserve $0.807152 exceeds $0.65. Recorded request limits and activation gate in fifth-topic budget review/TASKS; archived progress 1828–1833 to keep orientation small.
- Initial check caught four require-await lint errors in new in-memory adapters; corrected to explicit promises and reran probes successfully. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, offline probes, filtered handbook check and `git diff --check` pass: 844 unit/283 integration passes, four expected skips.
- API/worker systemd restart passes; both active, healthz/database/Redis healthy; latest edition still serves four topics, zero alerts. Push and post-push restart follow; no runtime code changed.
- Next: cost actual publication plan and measured savings below the ceiling, then publication integration/unavailable policy and topic/source data. No activation from proxy figures alone.

## 2026-11-11: iteration 1843 — grouping savings ceiling

- Clean main; no inherited work. Alerts zero; healthz/database/Redis healthy. Item 50 remains stopped under 55; continued item 56 with no provider calls.
- Extended read-only saved-cost evaluator through the existing repository ledger reader; exact per-run totals reconcile, unresolved calls refuse, model/purpose costs and charged repairs remain visible.
- Nov 4–10 grouping costs $0–$0.007571. Even crediting all four topics' grouping as free (more savings than authorized), with no replacement charge, five-topic proxy reserve peaks at $0.780561: $0.130561 above $0.65. Grouping replacement alone cannot close this proxy gate.
- Peak day's Sonnet story/social editing costs $0.211287/$0.123422; absent topic attribution, no World savings claimed. Recorded evidence in fifth-topic review and TASKS. No caps, models, runtime topics or editorial policies changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, read-only evaluator, filtered handbook check and `git diff --check` pass: 844 unit/283 integration passes, four expected skips. Existing bundle-size warning only.
- Source check: 36 healthy/zero unhealthy; latest saved edition eb6e962e serves four topics. Commit/push and post-push API/worker restart follow; no runtime code changed.
- Next: cost actual combined shortlist/publication marginal requests without paid calls; publication integration/topic data remain gated on admission.
