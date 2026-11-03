# Progress

Archived: [iterations 309–310](docs/progress-archive/2026-11-03-iterations-309-310.md), [iterations 307–308](docs/progress-archive/2026-11-03-iterations-307-308.md), [iterations 305–306](docs/progress-archive/2026-11-03-iterations-305-306.md), [iterations 303–304](docs/progress-archive/2026-11-03-iterations-303-304.md), [iteration 302](docs/progress-archive/2026-11-03-iteration-302.md), [iteration 301](docs/progress-archive/2026-11-03-iteration-301.md), [iteration 300](docs/progress-archive/2026-11-03-iteration-300.md), [iteration 299](docs/progress-archive/2026-11-03-iteration-299.md), [iteration 298](docs/progress-archive/2026-11-03-iteration-298.md), [iteration 297](docs/progress-archive/2026-11-03-iteration-297.md), [iteration 296](docs/progress-archive/2026-11-03-iteration-296.md), [iteration 295](docs/progress-archive/2026-11-03-iteration-295.md), [iteration 294](docs/progress-archive/2026-11-03-iteration-294.md), [iteration 293](docs/progress-archive/2026-11-03-iteration-293.md), [iteration 292](docs/progress-archive/2026-11-03-iteration-292.md), [iteration 291](docs/progress-archive/2026-11-03-iteration-291.md), [iteration 290](docs/progress-archive/2026-11-03-iteration-290.md), [iteration 288](docs/progress-archive/2026-11-03-iteration-288.md), [iteration 285](docs/progress-archive/2026-11-03-iteration-285.md), [286](docs/progress-archive/2026-11-03-iteration-286.md).

Earlier entries: [iterations 269–270](docs/progress-archive/2026-11-03-iterations-269-270.md), [271–272](docs/progress-archive/2026-11-03-iterations-271-272.md), [273–274](docs/progress-archive/2026-11-03-iterations-273-274.md), [275–276](docs/progress-archive/2026-11-03-iterations-275-276.md), [277–278](docs/progress-archive/2026-11-03-iterations-277-278.md), [279–280](docs/progress-archive/2026-11-03-iterations-279-280.md), [282](docs/progress-archive/2026-11-03-iteration-282.md), [283](docs/progress-archive/2026-11-03-iteration-283.md), [284](docs/progress-archive/2026-11-03-iteration-284.md).

## 2026-11-03: iteration 311 — scheduled evidence still pending

- Started clean on main; no leftover work. Four app services active; database/Redis healthy, all queues staffed, all 32 sources error-free.
- Read-only status at 02:37 UTC: rolling-day articles Tech/AI 332, NBA 109, Gaming 287, World 223; verified X posts 49/31/17/3.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-03`: zero calls/cost/holds. `pnpm exec tsx scripts/report-edition-timing.ts`: next edition 15:00 UTC, 482,788-micro reserve pending, other Anthropic allowance zero.
- Items 13/7/15 await actual scheduled evidence; item 16 activation remains gated by item 15 acknowledgement. No application/settings changes, paid calls or Reddit requests. Archived iteration 292 to bound progress size.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check`; passed (163 unit/168 integration tests); four services restarted; health/app/status/docs/db HTTP 200. No UI change.
- Next: measure scheduled per-topic X cost/yield and edition AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 312 — live ingestion healthy; scheduled evidence pending

- Started clean on main; no leftover work. Four app services active, database/Redis healthy and all queues staffed.
- Read-only status at 02:41 UTC: all 32 connected sources healthy; rolling-day articles Tech/AI 332, NBA 115, Gaming 288, World 223; verified X posts 53/33/17/3.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-03`: zero calls/cost/holds. `pnpm exec tsx scripts/report-edition-timing.ts`: next edition 15:00 UTC, 482,788-micro reserve pending, other Anthropic allowance zero.
- Items 13/7/15 await scheduled evidence; item 16 activation stays gated by item 15 acknowledgement. No application/settings changes, paid calls or Reddit requests.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `git diff --check`; restarted four services, active; health/app/status/docs/db HTTP 200. No UI change.
- Next: record scheduled X per-topic cost/yield and edition AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 313 — scheduled evidence gate unchanged

- Started clean on main; no leftover work. API/worker/docs/schema active; database/Redis healthy; all queues staffed and no failed digest jobs.
- Read-only status at 02:45 UTC: all 32 sources healthy; rolling-day articles Tech/AI 332, NBA 115, Gaming 288, World 223; verified X posts 53/33/17/3. Two retained historical ingestion failures have healthy current sources.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-03`: zero calls/cost/holds; `pnpm exec tsx scripts/report-edition-timing.ts`: next edition 15:00 UTC, 482,788-micro reserve pending, other Anthropic allowance zero.
- Items 13/7/15 still require scheduled evidence; owner item 16 explicitly requires item 15 acknowledgement before activation. No application/settings changes, paid calls or Reddit requests. Archived iteration 293 to keep progress bounded.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `git diff --check`; four services restarted, active; health/app/status/docs/db HTTP 200. No UI change.
- Next: observe scheduled X per-topic cost/yield and edition AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 314 — healthy operation; scheduled evidence pending

- Started clean on main; no leftover work. API/worker/docs/schema active; database/Redis healthy and all queues staffed.
- Read-only status at 02:50 UTC: all 32 sources healthy; rolling-day articles Tech/AI 332, NBA 115, Gaming 288, World 223; verified X posts 53/33/17/3. No retained failed digest runs.
- `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-03`: zero calls/cost/holds. `pnpm exec tsx scripts/report-edition-timing.ts`: next edition 15:00 UTC, 482,788-micro reserve pending; other Anthropic allowance zero.
- Items 13/7/15 await actual scheduled evidence; item 16 activation remains gated by item 15 acknowledgement. No application/settings changes, paid calls or Reddit requests. Archived iteration 294 to bound progress.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (163 unit/168 integration), `pnpm build`, `git diff --check`; restarted all four services, active; health/app/status/docs/db HTTP 200. No UI change.
- Next: observe scheduled X per-topic cost/yield and edition AI cost/duration, acknowledge results, then activate open search.

## 2026-11-03: iteration 315 — curated X account review under new owner steering

- Started clean on main. Initial status-only commit push was rejected because origin gained owner item 22; fetched and merged `58d8dd3` without rewriting history, then moved to item 17 as instructed.
- Prepared item 17 lists: 11 Tech/AI, 10 NBA, 12 Gaming and 11 World handles; primary sources plus builders, reporters, players/developers. Saved and verified, then restored originals after newer owner item 23 arrived.
- Documented retained/added/removed account choices and limitations in docs/SOURCES.md; handbook explains editing and current-list report effects. No automatic reset of owner edits; accounts remain editable.
- API contract validation and save/readback passed for all four topics; comparison confirmed no other topic fields changed. Playwright verified all four saved lists at desktop/mobile, no page errors/overflow; screenshots saved as curated-x-accounts-{desktop,mobile}.png.
- `pnpm exec tsx scripts/check-handbook.ts 05-social-posts`: 16 pages, 1 diagram, 24 tables, no errors. Diagram unchanged.
- Before the owner update: `pnpm check` passed 163 unit/168 integration, typecheck/lint/boundaries; `pnpm build` passed; all four services restarted healthy, health/app/status/docs/db HTTP 200. Formatting rerun fixed the archived entry before checks passed.
- After settings/docs: `pnpm format`, `pnpm lint:fix`, `git diff --check`; no further restart needed. All 32 sources healthy; no paid calls or Reddit requests. Archived iterations 295–296.
- Scheduled evidence still pending at 02:54 UTC: zero Nov 3 X calls/cost/holds; 15:00 edition reserve 482,788 micros, other Anthropic allowance zero. Items 13/7/15 acknowledgement and item 16 activation stay gated.
- Second push rejected on newer owner commits; merged `221fc1e` (items 23/18 auth). Restored/read back original live accounts 8/8/9/9; reviewed lists/screenshots are staged evidence, not final active settings. No scheduled calls occurred during the interim edit.
- Next: build/test item 18 with configured Bluesky login, keep edition inclusion off; activate reviewed lists/open search only after scheduled evidence/acks. Account choices are editorial, not measured virality claims.

## 2026-11-03: iteration 316 — authenticated Bluesky discovery, isolated from editions

- Started clean on main; no leftover work. Four services and health healthy, 32 active sources without errors, all queues available, no failed digest jobs; latest published edition retains four topics.
- Added Bluesky discovery port/adapter: official login, account-PDS top search, reused in-memory session/one refresh, serialized requests, Retry-After backoff, two 25-post pages, bounded response size and strict time/author validation. Official hosted PDS only; missing credentials fail closed.
- Added explicit free live probe (aggregate output only, no DB writes). Nov 3 03:21 UTC preceding-day yields: Tech/AI 47, NBA 50, Gaming 49, World 47; all had engagement. These are raw candidates, not relevance/virality evidence or live stored content.
- Six fake-only tests cover session reuse, pagination/dedupe/window bounds, refresh, rate limits, endpoint safety, oversized payloads and safe auth errors. No Anthropic/xAI calls or Reddit requests.
- Production has no collector/edition wiring to the adapter, preserving item 23. Documented probe evidence/limitations in SOURCES and updated social handbook; no UI or diagram changes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 diagram, 24 tables, no errors), `git diff --check`. Full check passed 169 unit/168 integration tests plus typecheck, lint, formatting and boundaries.
- No services restarted: their runtime wiring/config is unchanged (item 22). Archived iterations 297–298 to keep PROGRESS under 25 KB.
- Next: persist Bluesky observations behind an off-by-default inclusion flag, add topic relevance/engagement velocity ranking and cards; measure/ack Nov 3 scheduled evidence first when available.

## 2026-11-03: iteration 317 — isolated Bluesky engagement shortlist

- Started clean on main; no leftover work. Four services and health green; 32 sources without current errors, queues staffed, no failed digest runs. Two retained ingestion failures have successful current source observations.
- Added pure Bluesky shortlist: positive topic phrase/safety/window gates, latest valid pre-cutoff snapshot per post, engagement and lifetime/hour ranking, deterministic order and bounded slots. No edition caller; X preference/publication wiring remains future work.
- Three fake-only tests cover relevance/spam gates, engagement/age order, malformed metrics/times, window boundaries, duplicate snapshots and future-observation rejection. Single snapshots never claim measured growth or account-relative reach.
- Enhanced explicit free probe to read current local topic policies. At 03:28 UTC raw Tech/AI/NBA/Gaming/World yields were 47/50/49/48; phrase shortlists capped at five were 5/5/5/0. World has no positive rules; semantic review is unfinished. No DB writes or edition inclusion.
- Initial probe stopped before World because its configured display name differed; corrected the probe name and reran successfully. No credentials or post bodies logged. No paid calls or Reddit requests.
- Verification: targeted `pnpm exec tsx --test apps/api/test/bluesky-ranking.test.ts` (3 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (172 unit/168 integration), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (no errors), `git diff --check`.
- Read-only timing/X reports: Nov 3 15:00 UTC run pending, reserve 482,788 micros, other Anthropic allowance zero; X cost/holds zero. Item 13/7/15 acks and item 16 activation remain gated.
- Updated source evidence/handbook; archived iteration 299 to keep progress bounded. App/health/docs/db HTTP 200. No restart: no running service code/config path changed; handbook reads disk per request (item 22).
- Next: Bluesky persistence, semantic selection and cards behind disabled edition inclusion; scheduled evidence takes priority when available.

## 2026-11-03: iteration 318 — Bluesky media observations for future cards

- Started clean on main; no leftover work. Four services/health healthy, 32 sources without current errors, no failed digest jobs; two retained ingestion failures remain recovered. Nov 3 15:00 UTC run still pending.
- Added isolated official embed-view parsing for images and videos: thumbnail/full-size/playlist URLs and alt text, including author media attached to quotes. Ignore quote-only/external embeds, reject unsafe URL schemes/credentials, and omit malformed media without discarding valid posts. No media downloads.
- Free authenticated live probe at 03:32 UTC: Tech/AI/NBA/Gaming/World candidates 47/50/49/48, with images 10/5/20/5 and videos 1/15/2/2. Unreviewed discovery only; no storage or edition inclusion. No paid calls or Reddit requests.
- Verification: targeted media/search tests (8 passed); `pnpm format`, `pnpm lint:fix`, `pnpm check` (174 unit/168 integration), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 diagram, 24 tables, no errors), `git diff --check`.
- Initial full check caught archive formatting; corrected it and full rerun passed. Updated source evidence/handbook and TASKS; archived iteration 300 to bound progress. No UI or diagram change. App/health/status/docs/db HTTP 200; no restart because running service paths/config are unchanged (STEERING 22).
- Next: Bluesky persistence, semantic selection and faithful cards, keeping inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 319 — isolated Bluesky observation persistence

- Started clean on main; no leftover work. API/worker/docs/schema services healthy, 32 sources without current errors, no failed digest jobs; two retained ingestion failures remain recovered. Nov 3 15:00 UTC scheduled evidence pending.
- Added Bluesky storage port and PostgreSQL adapter, additive migration 049: platform-specific SocialPost identity/metadata and immutable per-topic text/media/metrics snapshots. Out-of-order arrivals cannot replace newer current metadata; replay cannot rewrite snapshots.
- Reads enforce publication window, observation cutoff, topic isolation and enabled status. Topic deletion cascades observations; complete write batches roll back on invalid identity or metrics. No worker/scheduler/edition caller, keeping production inclusion off under item 23.
- Two disposable-Postgres tests cover media round-trip, replay, out-of-order snapshots, cutoff/window boundaries, topic isolation, rollback and disable/delete. No live collection, paid calls or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (174 unit/170 integration tests, typecheck/lint/format/boundaries), `pnpm build`, `pnpm migrate` (049 applied), `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 assigned tables, no errors), `git diff --check`.
- Updated source evidence, social handbook and schema metadata; archived iterations 301–302 to bound progress. Health OK and app/docs/db HTTP 200. No restart: no running service path/config changed (item 22); schema change is additive and storage has no production caller.
- Initial push rejected because owner added item 24/observability plan remotely; fetched and merged without rewriting history. Recorded its low priority in TASKS; no observability implementation.
- Next: explicit bounded Bluesky collection, semantic selection and faithful cards, keeping edition inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 320 — explicit bounded Bluesky collection

- Started clean on main; no leftover work. Four services and health healthy; 32 sources without current errors, staffed queues and no retained failed digest runs. Nov 3 15:00 UTC evidence remains pending; reserve 482,788 micros, other Anthropic allowance zero.
- Added single-query collection through search/storage ports: 24-hour maximum window, 50-observation cap, latest duplicate snapshot, publication/observation/metrics validation and propagated search/storage failures. No retries, scheduler or edition caller.
- Probe remains read-only by default; explicit `--store` shares session/backoff across four topic queries, persists observations and reads them back. Reports fetched/submitted separately from stored window observations; replay/disabled writes need not insert rows. Closes DB connections on failure.
- Live free-API `pnpm exec tsx scripts/probe-bluesky.ts --store` at 03:44 UTC: Tech/AI/NBA/Gaming/World stored observations 48/48/47/46; phrase shortlists 5/5/5/0. Unreviewed discovery only, not editorial picks or verified virality. No paid calls or Reddit requests; production inclusion stays off.
- Three fake-only collector tests pass for bounded writes, duplicate/invalid snapshots, invalid requests without I/O and propagated search/rollback failures. Updated source evidence, handbook and TASKS; archived iterations 303–304 to bound progress.
- Verification: targeted `pnpm exec tsx --test apps/api/test/bluesky-collection.test.ts` (3 passed), `pnpm format`, `pnpm lint:fix`, full `pnpm check` (177 unit/170 integration passed), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 tables, no errors), `git diff --check`. Initial full check caught archive/source formatting; corrected before rerun.
- App/docs/db HTTP 200; health database/Redis OK. No restart: changed application helper has no running caller; script is explicit and handbook reads disk (item 22). No UI changes.
- Next: Bluesky semantic selection and faithful cards, keeping production inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 321 — isolated Bluesky semantic shortlist

- Started clean on main; no leftover work. Four services/health healthy, all 32 sources without current errors and no retained failed digest runs; two retained ingestion failures remain recovered. Scheduled Nov 3 15:00 UTC evidence still pending.
- Added bounded semantic preparation using the existing injected budgeted social triage: up to 50 safe observations, relevance/interestingness thresholds, then semantic scores and observed engagement/age ordering. Positive keywords are not required; original post snapshots remain intact.
- Shares snapshot/window/count/safety gates with phrase ranking. Incomplete, duplicate, unknown or invalid scores yield no semantic picks. Zero budgets/empty eligible inputs skip triage. No scheduler, final editor, publication caller or production behavior change.
- Three fake-only tests cover keyword recovery, popular irrelevant rejection, safety filtering, incomplete/malformed responses, candidate bounds and no-I/O cases; existing ranking tests still pass. No paid calls, new live collection or Reddit requests.
- Updated TASKS, source evidence and handbook; archived iterations 305–306 to bound progress. Final editor/cards and real editorial yield remain next; stored observations remain unreviewed.
- Verification: targeted shortlist/ranking tests (6 passed); `pnpm format`, `pnpm lint:fix`, `pnpm check` (180 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 assigned tables), `git diff --check`.
- App/docs/db HTTP 200; health database/Redis OK. No restart: changed helpers have no production caller and handbook reads disk (item 22). No UI changes or screenshots required. Next: final Bluesky editor/cards; scheduled evidence/acks take priority when available.

## 2026-11-03: iteration 322 — isolated Bluesky final editing

- Started clean on main; no leftover work. Four services/health healthy; 32 sources without current errors and no failed digest runs. Scheduled Nov 3 15:00 UTC evidence remains pending; reserve 482,788 micros, other Anthropic allowance zero.
- Added explicit Bluesky final selection after semantic triage: at most ten candidates, budget 0–20, fewer picks allowed, exact original text/media/count snapshots retained alongside context/rationale. Refused, unknown, duplicate or over-budget selections return no picks.
- Bluesky uses isolated observation instructions and `bluesky-social-editor-v1` ledger purpose. Existing X/Reddit prompt and purpose remain unchanged. No scheduler/publication caller; production inclusion remains off under item 23.
- Fake-only tests cover candidate limits, snapshot preservation, invalid/refused responses, zero-budget no-I/O and prompt/purpose isolation. No paid calls, live collection or Reddit requests. No UI change.
- Verification: targeted editor tests (8 passed), `pnpm format`, `pnpm lint:fix`, `pnpm check` (184 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 05-social-posts` (16 pages, 1 unchanged diagram, 25 tables), `git diff --check`.
- Updated source evidence, handbook and TASKS; archived iterations 307–308 to bound progress. Restarted API/worker for shared editor code; four services active, health OK and app/docs/db HTTP 200.
- Next: faithful Bluesky cards, keeping production inclusion off until scheduled evidence/acks. Scheduled results take priority when available.

## 2026-11-03: iteration 323 — faithful Bluesky cards prepared

- Started clean on main; no leftover work. Four services/health healthy; 32 sources without current errors, staffed queues and no failed digest runs. Nov 3 15:00 UTC scheduled evidence remains pending.
- Added discriminated Bluesky snapshot contract and faithful cards: full original text, author/time, saved likes/reposts/replies and observation time, context/rationale, lazy images with alt text/full-size links and video links with optional previews. No streaming player or widget script.
- Production candidate collection and edition inclusion remain off under item 23; existing X/Reddit behavior unchanged. No paid calls, new collection or Reddit requests.
- Synthetic `pnpm exec tsx scripts/smoke-bluesky-cards.ts` passed desktop/mobile: image/text-only cards, video without preview, metrics/original links, literal markup, invalid media/timestamps, no widget calls, page errors or horizontal overflow. Saved and visually inspected both screenshots; these are not real editorial picks.
- Updated TASKS, source evidence and handbook; archived iterations 309–310 to bound progress. Next: prepare gated Bluesky edition wiring; scheduled evidence/acks take priority when available.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (184 unit/170 integration passed, typecheck/lint/format/boundaries), `pnpm build`, handbook check (16 pages, 1 unchanged diagram, 25 tables), `git diff --check`. Initial check caught a late contract formatting edit; corrected before the successful full rerun.
- Restarted API/worker for contract/editor types and rebuilt web; four services active, health database/Redis OK, app/docs/db HTTP 200. Live edition still has 20 stories and 10 X posts, zero Bluesky posts.
