# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 25 KB, keep about 20 entries and move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

Earlier iterations 61–72: [archive](docs/progress-archive/2026-11-02-iterations-61-72.md).

Earlier iterations 87–100: [archive](docs/progress-archive/2026-11-02-iterations-87-100.md).
Earlier iterations 101–123: [archive](docs/progress-archive/2026-11-02-iterations-101-123.md).
Earlier iterations 124–132: [archive](docs/progress-archive/2026-11-02-iterations-124-132.md).

Earlier iterations 133–134: [archive](docs/progress-archive/2026-11-02-iterations-133-134.md).

Earlier iterations 135–136: [archive](docs/progress-archive/2026-11-02-iterations-135-136.md).

Earlier iterations 137–138: [archive](docs/progress-archive/2026-11-02-iterations-137-138.md).

Earlier iterations 139–140: [archive](docs/progress-archive/2026-11-02-iterations-139-140.md).

Earlier iterations 141–142: [archive](docs/progress-archive/2026-11-02-iterations-141-142.md).

Earlier iteration 143: [archive](docs/progress-archive/2026-11-02-iteration-143.md).

Earlier iteration 157: [archive](docs/progress-archive/2026-11-02-iteration-157.md).

Earlier iterations 161–162: [archive](docs/progress-archive/2026-11-02-iterations-161-162.md).

Earlier iterations 163–164: [archive](docs/progress-archive/2026-11-02-iterations-163-164.md).

Earlier iteration 165: [archive](docs/progress-archive/2026-11-02-iteration-165.md).

Iteration 166: [archive](docs/progress-archive/2026-11-02-iteration-166.md).

Earlier iterations 169–170: [archive](docs/progress-archive/2026-11-02-iterations-169-170.md).

Earlier iterations 171–172: [archive](docs/progress-archive/2026-11-02-iterations-171-172.md).

Earlier iterations 173–174: [archive](docs/progress-archive/2026-11-02-iterations-173-174.md).

Earlier iterations 175–176: [archive](docs/progress-archive/2026-11-02-iterations-175-176.md).

Iteration 177: [archive](docs/progress-archive/2026-11-02-iteration-177.md).

Iteration 178: [archive](docs/progress-archive/2026-11-02-iteration-178.md).

Iteration 179: [archive](docs/progress-archive/2026-11-02-iteration-179.md).

Iteration 180: [archive](docs/progress-archive/2026-11-02-iteration-180.md).

Earlier iteration 181: [archive](docs/progress-archive/2026-11-02-iteration-181.md).

Earlier iteration 182: [archive](docs/progress-archive/2026-11-02-iteration-182.md).

Iteration 183: [archive](docs/progress-archive/2026-11-02-iteration-183.md).

Iteration 184: [archive](docs/progress-archive/2026-11-02-iteration-184.md).

Iteration 186: [archive](docs/progress-archive/2026-11-02-iteration-186.md).

Iteration 187: [archive](docs/progress-archive/2026-11-02-iteration-187.md).

Iteration 188: [archive](docs/progress-archive/2026-11-02-iteration-188.md).

Iteration 189: [archive](docs/progress-archive/2026-11-02-iteration-189.md).

Iteration 192: [archive](docs/progress-archive/2026-11-02-iteration-192.md).

Earlier iteration 195: [archive](docs/progress-archive/2026-11-02-iteration-195.md).

Earlier iterations 198–199: [archive](docs/progress-archive/2026-11-02-iterations-198-199.md).

Earlier iterations 200–201: [archive](docs/progress-archive/2026-11-02-iterations-200-201.md).

Earlier iterations 202–203: [archive](docs/progress-archive/2026-11-02-iterations-202-203.md).

Iterations 204–205: [archive](docs/progress-archive/2026-11-02-iterations-204-205.md).

Earlier iteration 206: [archive](docs/progress-archive/2026-11-02-iteration-206.md).

Iteration 207: [archive](docs/progress-archive/iteration-207.md).

Iteration 208: [archive](docs/progress-archive/iteration-208.md).

Earlier iteration 210: [archive](docs/progress-archive/2026-11-02-iteration-210.md).

Iteration 212: [archive](docs/progress-archive/2026-11-02-iteration-212.md).

Earlier iteration 213: [archive](docs/progress-archive/2026-11-02-iteration-213.md).

Archived iteration 216: [entry](docs/progress-archive/2026-11-02-iteration-216.md).

Iteration 217: [archive](docs/progress-archive/2026-11-02-iteration-217.md).

Earlier iteration 218: [archive](docs/progress-archive/2026-11-02-iteration-218.md).

Earlier iteration 219: [archive](docs/progress-archive/2026-11-02-iteration-219.md).

Iteration 221: [archive](docs/progress-archive/2026-11-02-iteration-221.md).

Earlier iteration 229: [archive](docs/progress-archive/2026-11-02-iteration-229.md).

Iteration 232: [archive](docs/progress-archive/2026-11-02-iteration-232.md).

Earlier iteration 244: [archive](docs/progress-archive/2026-11-02-iteration-244.md).

Iteration 245: [archive](docs/progress-archive/2026-11-02-iteration-245.md).

Iteration 252: [archive](docs/progress-archive/2026-11-02-iteration-252.md).

## 2026-11-02: iteration 264 — verification URL precedence

- Started clean on main; API/worker, health, 32 sources and four queues healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pins newest non-null embed-verification URL across publisher, river, stored Reddit and search citations.
- Offset timestamps compare by instant; newer null URLs retain older usable evidence; missing evidence returns undefined.
- Disposable PostgreSQL only; no provider, source or Reddit verification requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 159 integration), `pnpm build`, `git diff --check`.
- Updated TASKS/database notes; archived iteration 244; equal-time URL precedence remains unspecified.
- Restarted API/worker; health, SPA, source/queue health and latest four-topic edition checked.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 265 — verification candidate priority and bounds

- Started clean on main; API/worker, health, 32 sources and four queues healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pins citation breadth before freshness, offset timestamp ordering, numeric-ID ties and exact result prefixes.
- Fifty-five discoveries verify the one-to-fifty request clamp, including negative/zero and oversized requests.
- Transactional disposable-PostgreSQL fixtures only; no provider, source or Reddit verification requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 160 integration), `pnpm build`, `git diff --check`.
- Updated TASKS/database notes; archived iteration 245 to keep PROGRESS bounded.
- Restarted API/worker; health recovered after startup; latest edition has four topics, 20 stories and 10 posts.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 266 — river source lifecycle

- Started clean on main; API/worker, health, 32 sources and four queues healthy; no leftover work.
- Scheduled priorities await Nov 3 evidence; advanced isolated STEERING 2a.
- Pins source ordering/payloads, enabled-topic filtering, re-enablement and source/topic deletion.
- Repeated and unknown-source failures retain successful timestamps, counts and sibling state; errors remain retryable.
- Transactional disposable-PostgreSQL fixtures only; no provider, source or Reddit verification requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 161 integration), `pnpm build`, `git diff --check`.
- First check caught archive formatting; formatted and reran successfully.
- Updated TASKS/database notes; archived iteration 246 to keep PROGRESS bounded.
- Restarted API/worker; health, SPA, latest four-topic edition and source/queue health verified.
- Next: observe Nov 3 scheduled X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 267 — concurrent verified-post refresh

- Started clean on main; API/worker, health, 32 sources and four queues healthy; no leftover work.
- Scheduled priorities await Nov 3 evidence; advanced isolated STEERING 2a.
- Races independent repositories refreshing one verified X post; complete author/embed payloads survive together.
- Pins one-row identity, canonical URL, original metrics and publication time across repeated concurrent writes.
- Disposable PostgreSQL only; no provider, source or Reddit verification requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 162 integration), `pnpm build`, `git diff --check`.
- Live latest edition: four topics, 20 stories and 10 posts; API/worker restarted and health/SPA checked.
- Updated TASKS/database notes; archived iteration 247 to keep PROGRESS bounded.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration.

## 2026-11-02: iteration 268 — concurrent search attribution

- Started clean on main; API/worker, health and 32 sources healthy; no leftover work.
- Two retained ingestion failures are historical; sources recovered and social collection is flowing.
- Scheduled priorities await Nov 3 evidence; advanced isolated STEERING 2a.
- Races two X search repositories with opposite post order, then repeats both saves.
- Daily report credits new candidates once while both calls retain citation/verification evidence.
- Disposable PostgreSQL only; no provider, source or Reddit verification requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 163 integration), `pnpm build`, `git diff --check`.
- Fixed missing required fixture guidance after first check; full rerun passed.
- API/worker restarted; health, SPA and latest edition checked after build.
- Updated TASKS/database notes; archived iteration 248 to keep PROGRESS bounded.
- Next: observe Nov 3 scheduled X cost/yield and AI edition cost/duration.

## 2026-11-02: iteration 269 — X verification eligibility

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Two retained ingestion failures are historical; current sources have recovered.
- Scheduled priorities await Nov 3 evidence; advanced isolated STEERING 2a.
- Pins ten-post search verification bounds, numeric-ID priority and exact daily retry expiry.
- Pins verified-post exclusion, recent null/error checks, topic disable/re-enable, zero budget and deletion.
- Non-UTC transaction in disposable PostgreSQL only; no source, Reddit or paid calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 164 integration), `pnpm build`, `git diff --check`.
- API/worker restarted; health, SPA and latest edition checked after build.
- Updated TASKS/database notes; archived iteration 249 to keep PROGRESS bounded.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration.

## 2026-11-02: iteration 270 — scheduled free-post coverage

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Two retained ingestion failures are historical; sources currently report no errors.
- Scheduled priorities await Nov 3 evidence; advanced isolated STEERING 2a.
- Pins scheduled topic payload/order and exact 24-hour boundaries in a non-UTC session.
- Free coverage follows river reassignment; paid/Reddit evidence cannot inflate it.
- Unverified/undated posts and disabled, zero-budget or deleted topics stay excluded.
- Disposable PostgreSQL only; no source, Reddit or paid provider verification calls.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 164 integration), `pnpm build`, `git diff --check`.
- API/worker restarted; health, SPA and latest four-topic/20-story/10-post edition checked.
- Initial push rejected: owner added STEERING 16–20; fetched and merged without rewriting history.
- Recorded new priorities, corrected ESPN label; no more DB characterization. Archived iteration 250.
- Next: open X discovery (16), plus Nov 3 scheduled X cost/yield and AI cost/duration.

## 2026-11-02: iteration 271 — open X adapter preparation

- Started clean on main; health/API/worker healthy, 32 sources without current errors.
- Historical ingestion failures retained; no current digest/source regression found.
- STEERING 16: omitted handles enable open topic search; supplied lists stay validated.
- Open prompt seeks engaged/rising originals using topic guidance and keyword/semantic relevance.
- Synthetic outside-list citations retain usage billing and official verification routing.
- Account-list schedule stays until item 15's first scheduled run is acknowledged.
- No paid provider or Reddit requests; no new live discovery/engagement claim.
- Verified: 4 targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit/165 integration), `pnpm build`.
- API/worker restarted; health, SPA and latest four-topic edition checked; `git diff --check` clean.
- Archived oldest progress entry to keep orientation bounded.
- Next: engagement provenance/storage/ranking, then scheduled switch after Nov 3 evidence.

## 2026-11-02: iteration 272 — reported X engagement contract

- Started clean on main; API/worker and health healthy; 32 sources without current errors.
- STEERING 16: compact search output requests known counts and post timestamps.
- Adapter returns citation-bound observations with `reported_by: xai_search` and local observed-at time.
- Missing counts remain absent; explicit zero survives; invalid/uncited/duplicate reports are rejected.
- Malformed/incomplete output retains billable usage and cannot create engagement observations.
- No paid or Reddit requests; reports remain unverified and are not yet persisted or ranked.
- Verified: three targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (127 unit/165 integration), `pnpm build`, `git diff --check`.
- API/worker restarted; health, SPA HTTP 200 and four-topic latest edition checked.
- Archived iteration 252; started clean. Push rejected by owner STEERING update; merged it (Reddit stays parked, official OAuth API only).
- Next: persist reported observations and rank by engagement/age plus relevance; Nov 3 scheduled evidence still pending.

## 2026-11-02: iteration 273 — persist reported X engagement

- Started clean on main; API/worker, health and all 32 sources healthy.
- Search orchestration passes citation-bound model reports into transactional citation storage.
- Migration 045 adds nullable JSONB per search citation; provenance/time/unknown counts survive.
- Reports remain separate from official oEmbed verification and social-post metrics; no ranking/display claim.
- Isolated test checks zero counts, missing fields, uncited report exclusion and immutable retries.
- No paid discovery, Anthropic or Reddit requests; scheduled account-list path unchanged.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (127 unit/165 integration), `pnpm build`.
- Applied `pnpm migrate`; API/worker restarted active, health OK, SPA 200, latest four-topic edition accessible.
- Archived iteration 253 to keep PROGRESS bounded; no leftover work to recover.
- Next: engagement/age ranking plus relevance, search-type reporting; Nov 3 scheduled evidence pending.

## 2026-11-02: iteration 274 — reported engagement shortlist

- Started clean on main; health/services and 32 sources healthy; latest edition has four topics.
- Verified X preliminary candidates/fallback now rank on reported engagement and lifetime age proxy, then recency.
- Existing topic/safety/time gates and dedupe remain; reports cannot populate verified metrics.
- Latest topic-bound observation must precede window end; frozen reasons preserve unknown/zero counts and unverified provenance.
- Added v3 fallback method; updated synthetic golden labels only; no LLM re-recording.
- No paid provider or Reddit requests; scheduled account-list path unchanged pending Nov 3 evidence.
- Verified: targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (129 unit/165 integration), `pnpm build`, `git diff --check`.
- API/worker restarted active; health OK, SPA 200, latest four-topic edition accessible; all 32 sources returning data without errors.
- Archived iteration 254; no leftover work to recover.
- Next: combine semantic ranking with engagement, add search-type reporting; observe Nov 3 scheduled runs.

## 2026-11-02: iteration 275 — semantic engagement shortlist

- Started clean on main; API/worker and health healthy, all 32 sources returning data without current errors.
- Semantic social shortlist now adds bounded reported engagement/age to interestingness after unchanged relevance/safety gates.
- X preference, editor limit and final editorial choice remain; no prompt/cache changes or provider requests.
- Optional snapshot ranking evidence preserves bonus and explicitly unverified explanation separately from official metrics.
- New AI method v3 retains historical v2 compatibility; fake test covers shortlist admission, exclusions and schema round-trip.
- No paid discovery, Anthropic or Reddit requests; scheduled account-list path unchanged pending Nov 3 evidence.
- Archived iteration 255; no leftover work to recover.
- Next: search-type cost/yield and outside-list reporting; observe Nov 3 scheduled searches/edition before switching.
- Verified: targeted tests; `pnpm format`, `pnpm lint:fix`, `pnpm check` (130 unit/165 integration), `pnpm build`, `git diff --check`.
- API/worker restarted active; health OK, SPA 200, latest four-topic edition accessible; all 32 sources returning data without current errors.

## 2026-11-02: iteration 276 — X search-type evidence

- Started clean on main; no leftover work; health/services and all 32 sources healthy.
- X reservations now snapshot open-topic/account-list before HTTP; historical types stay unknown.
- Daily and recent-call reports expose type beside topic, fetched posts, cost and current verified yield, including failures/empty calls.
- Isolated tests preserve both types through topic deletion and historical nulls; orchestration checks propagation.
- Updated SOURCES reporting notes; archived iteration 256 and compacted TASKS.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (130 unit/165 integration), `pnpm build`, `git diff --check`.
- Applied `pnpm migrate` (046); API/worker restarted active, health OK, SPA 200, latest edition four topics; 32 sources returning data without errors.
- Read-only live daily report includes searchType; no paid provider or Reddit requests.
- Next: outside-list account reporting; Nov 3 scheduled searches/edition evidence required before open-search switch.

## 2026-11-02: iteration 277 — outside-list X yield

- Started clean on main; no leftover work; API/worker and health healthy, latest edition four topics.
- Daily X cost/yield report counts verified and new verified posts outside every current curated account list per topic/call/search type.
- Official author URLs determine membership; case/@ normalization, disabled topics and duplicate handles covered; unknown authors counted separately.
- Explicitly current-list post counts, not distinct accounts or historical membership; unverified citations cannot qualify.
- Added isolated DB coverage for list edits and attribution; updated SOURCES/TASKS; archived iteration 257.
- No paid provider or Reddit requests; scheduled account-list path unchanged pending Nov 3 evidence.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (130 unit/166 integration), `pnpm build`; final typecheck/lint/format rechecked after JSON-column fix; `git diff --check`.
- API/worker restarted active; health OK, SPA 200, latest edition four topics, 32 sources returning data without errors.
- Read-only live report: one Nov 2 call, 23,382 cost micros, zero outside-list verified/new posts and unknown authors; no discovery triggered.
- Next: observe Nov 3 scheduled searches/edition, acknowledge item 15 with cost/yield, then switch to open search; real-edition/screenshots remain.

## 2026-11-02: iteration 278 — X discovery publication evidence

- Started clean on main; no leftover work; API/worker and health healthy, 32 sources without errors.
- Daily X report now counts cited posts selected in same-topic editions after each call within that UTC day, including outside-list posts.
- Repeated editions count once per call/topic; other topics/platforms and earlier/later-day editions excluded; current-list caveats retained.
- Extended isolated fixtures for publication timing and duplicate editions; updated SOURCES/TASKS; archived iterations 259–260.
- Verified: `pnpm format`, `pnpm lint:fix`, `pnpm check` (130 unit/166 integration), `pnpm build`, `git diff --check`. Initial check caught archive formatting; corrected before passing full check.
- API/worker restarted active; health OK, SPA 200, latest edition four topics; no paid provider or Reddit requests.
- Read-only Nov 2 report: one call, 23,382 cost micros, zero same-day selected/outside-list selected posts.
- Next: observe Nov 3 scheduled searches/edition, acknowledge item 15 with cost/yield, then switch to open search; real-edition/screenshots remain.

## 2026-11-02: iteration 279 — accurate scheduled X guidance

- Started clean on main; no leftover work; API/worker and health healthy.
- Fixed Status/settings claims that automatic paid X discovery was off; describe active timing, eligibility, curated accounts and shared caps.
- Open search remains gated on Nov 3 item 15 evidence; no provider or Reddit requests.
- Added read-only desktop/mobile Playwright guidance check and four screenshots; no topic or schedule writes.
- Broad `smoke-status.ts` hit its pre-existing stale "Recent automatic runs" heading; focused `pnpm exec tsx scripts/smoke-x-schedule-copy.ts` passed.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (130 unit/166 integration), `pnpm build`, `git diff --check`.
- API/worker restarted; health OK, SPA 200; 32 sources without errors, latest edition four topics.
- Archived iteration 261; next: Nov 3 scheduled search cost/yield and AI edition timing before open-search switch.

## 2026-11-03: iteration 280 — restore broad Status browser verification

- Started clean on main; no leftover work; all four services and health healthy, docs/db routes 200.
- Repaired stale heading, coverage-card count and scheduled-X copy assertions in the broad Status smoke.
- Removed the requirement for paid spend today; synthetic runs now include duration and select the digest queue by name.
- Validate synthetic responses before browser replay so schema drift fails immediately; no provider or Reddit requests.
- Desktop/mobile live telemetry, edition navigation, refresh errors and synthetic failure rendering passed; refreshed ten screenshots.
- Verified `pnpm format`, `pnpm lint:fix`, `pnpm check` (131 unit/166 integration), `pnpm build`, `git diff --check`.
- Restarted API/worker/docs/schema; health and real source/edition checks passed.
- Archived iterations 262–263; next: Nov 3 scheduled cost/yield and AI timing evidence before open-search switch.

## 2026-11-03: iteration 281 — prepare scheduled open-topic eligibility

- Started clean on main; no leftover work; all four services and health healthy.
- Planner/tick now accept explicit open-topic mode, without requiring or sending curated handles; production default remains account-list until item 15 acknowledgement.
- Open-mode fixtures cover empty/invalid lists, weakest-first order, invalid coverage exclusion and unchanged daily/run identity; existing timing/settings safeguards retained.
- Verified targeted scheduler tests (8), `pnpm format`, `pnpm lint:fix`, `pnpm check` (132 unit/166 integration), `pnpm build` and `git diff --check`.
- Read-only evidence: 32 sources without errors; Nov 3 edition queued for 15:00 UTC; no Anthropic spend today at inspection.
- Restarted API/worker/docs/schema; all active, health OK, SPA/docs/db 200; no source errors.
- No paid provider or Reddit requests; no live schedule/settings changes.
- Next: observe scheduled X calls and AI edition, acknowledge items 15/13/7 with actual cost/yield/timing, then enable open-topic mode in `scheduled-social.ts`.
