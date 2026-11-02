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

## 2026-11-02: iteration 248 — concurrent schedule replacement

- Started clean on main; API/worker and health green; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added concurrent schedule replacements through separate repository instances; returned/persisted configurations remain whole.
- Invalid-budget replacement racing a valid update preserves valid settings; subsequent updates recover normally.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 146 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes. Disposable fixtures only; no live schedule changes, provider or Reddit requests.
- Live checks: health DB/Redis true, four-topic latest edition, 32 error-free sources and four available queues.
- Restarted API/worker healthy; SPA 200. Next: observe Nov 3 X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 249 — scheduled publication failure recovery

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3 scheduled runs; advanced isolated STEERING 2a.
- Added pre-publication failure coverage: original error propagates, history stays unchanged and no scheduled row persists.
- Independent-pool concurrent retries release/reacquire the session lock and publish exactly one immutable, retrievable snapshot.
- Initial checks caught documentation formatting and a cleanup delete blocked by edition immutability; corrected both.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 147 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 231 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; health DB/Redis true, SPA 200, four-topic latest edition, 32 error-free sources and four available queues.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI reserve/cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 250 — publisher admission time boundaries

- Started clean on main; API/worker, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned inclusive publication window, future exclusion and success/error retry cutoffs to one millisecond in a non-UTC transaction.
- Pinned exact-day host recovery independently of the failed article's stricter retry cutoff.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 148 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes; archived iteration 232 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker healthy; DB/Redis health true, SPA 200, 32 error-free sources, four available queues and four-topic latest edition.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 251 — source diagnostic persistence

- Started clean on main; API/worker, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned 299/300/301-character diagnostic handling, multibyte text and retention of successful poll state.
- Rejected zero-byte diagnostic leaves status unchanged; valid retry and empty successful poll recover normally.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 148 integration), `pnpm build`, `git diff --check` passed.
- Initial check caught archive formatting; formatted and reran verification. Updated TASKS/database notes and archived iteration 233.
- No provider or Reddit requests. API/worker restarted healthy; SPA 200, 32 error-free sources, four available queues and four-topic latest edition.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 252 — embed-check retry boundaries

- Started clean on main; API/worker, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned the strict daily embed-check cooldown at one millisecond in a non-UTC transaction.
- Rejected diagnostic preserves the prior check; successful retry clears errors and repeat checks retain one row.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 149 integration), `pnpm build`, `git diff --check` passed.
- Initial check caught transaction fixture setup using a nested connection; corrected it and reran checks.
- Updated TASKS/database notes; archived iteration 234 to keep PROGRESS bounded. No provider or Reddit requests.
- API/worker restarted healthy; SPA 200, 32 error-free sources, four available queues; all topics have recent articles and verified X posts.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 253 — missing post-time recovery

- Started clean on main; services, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned missing verified-X publication-time recovery, millisecond future admission, invalid/legacy IDs and overflow rejection.
- Existing timestamps, Reddit fixtures and all other evidence remain intact; repeated backfill is idempotent.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 150 integration), `pnpm build`, `git diff --check` passed.
- Fixed two fixture constraints found by initial checks (numeric X IDs and required Reddit metadata); rerun passed.
- API/worker restarted healthy; SPA 200, 32 error-free sources, four available queues and four-topic latest edition.
- Updated TASKS/database notes; archived iteration 235 to keep PROGRESS bounded. No provider or Reddit requests.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 254 — concurrent publisher recovery

- Started clean on main; services, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Raced publisher collectors with a final-write constraint failure against a successful concurrent transaction.
- Rejected citation inserts/author updates roll back; winner retains first-seen/engagement evidence and all three citations.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 150 integration), `pnpm build`, `git diff --check` passed.
- Updated TASKS/database notes and archived iteration 236 to keep PROGRESS bounded. No provider or Reddit requests.
- Restarted API/worker; health, SPA, source/queue status and four-topic latest edition verified after restart.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 255 — source selection rollback recovery

- Started clean on main; services, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pinned failed source replacement after deletion: prior selection and topic fields survive rollback.
- Concurrent rejected/valid saves preserve exactly the valid selection; subsequent disconnect succeeds.
- Catalog and other topics stay unchanged; all fixtures run in disposable PostgreSQL.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 151 integration), `pnpm build`, `git diff --check` passed.
- API/worker restarted healthy; SPA 200, 32 error-free sources, four available queues and recent content across all topics.
- Updated TASKS/database notes. No provider or Reddit requests.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 256 — rejected topic reorder recovery

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 awaits Nov 3 evidence; advanced isolated STEERING 2a.
- Pinned rejected position writes after reorder validation/locking; all topic settings survive.
- A competing valid reorder succeeds; removing the rejection permits retry and original-order restoration.
- Catalog and schedule remain unchanged; fixtures use disposable PostgreSQL only.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 152 integration), `pnpm build`, `git diff --check` passed.
- Initial check stopped on newly added documentation formatting; formatted and full rerun passed.
- Restarted API/worker; `/healthz` healthy, SPA 200, 32 error-free sources, four available queues and four-topic edition.
- Recent articles/verified X posts present in every topic; no provider or Reddit requests.
- Updated TASKS/database notes; archived iteration 237 to keep PROGRESS bounded.
- Next: observe Nov 3 all-topic X cost/yield and scheduled AI cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 257 — custom-feed registration rollback

- Started clean on main; services, health and 32 sources healthy; no leftover work.
- Priority 15/13/7/9 awaits Nov 3 evidence; advanced isolated STEERING 2a.
- Rejected feed connections now pin rollback of the preceding catalog insert and unchanged topic settings.
- Removing rejection permits retry; repeated registration retains one source and connection.
- Fixtures use disposable PostgreSQL only; no feed, provider or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 153 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker; `/healthz` healthy, SPA 200, 32 error-free sources and four available queues.
- Live rolling article coverage: Tech/AI 306, NBA 108, Gaming 276, World 212; latest source success 21:46 UTC.
- Updated TASKS/database notes; archived iteration 238 to keep PROGRESS bounded.
- Next: observe Nov 3 scheduled X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 259 — recover topic deletion rollback coverage

- Recovered and finished iteration 258’s uncommitted test, database notes and iteration 239 archive; discarded nothing.
- Services/health and all 32 sources healthy; priority 15/13/7/9 evidence still awaits Nov 3.
- Pins rollback of cascaded source connections and topic positions when deletion fails; retry and missing-delete behavior verified.
- Disposable PostgreSQL only; no provider or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 154 integration), `pnpm build`, `git diff --check` passed.
- Live latest edition has four topics; rolling article/X coverage present across all four topics.
- Restarted API/worker; health, SPA, source and queue checks passed.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 260 — final ingestion-write rollback

- Started clean on main; API/worker, health and all 32 sources healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Rejected the final source-status write after article upserts, observations and X citations; complete snapshots remain unchanged.
- Removing rejection permits retry with retained article ID/citation first-seen time; repeat batches dedupe correctly.
- Disposable PostgreSQL only; no provider or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 155 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker; `/healthz` healthy, SPA 200, 32 error-free sources and four available queues.
- Four-topic latest edition and rolling article/verified-X coverage present across all topics.
- Updated TASKS/database notes; archived iteration 240 to keep PROGRESS bounded.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 261 — concurrent ingestion merge

- Started clean on main; health, API/worker, 32 sources and four queues healthy; no leftover work.
- Priority 15/13/7/9 live evidence still awaits Nov 3; advanced isolated STEERING 2a.
- Separate repositories concurrently ingest one article; both metrics and independent source observations/citations survive.
- Pins stable article identity/metadata, paired title/excerpt and duplicate-free concurrent retries with retained citation first-seen times.
- Disposable PostgreSQL only; no source, provider or Reddit requests.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 156 integration), `pnpm build`, `git diff --check` passed.
- Initial check caught documentation formatting during edits; formatted and reran the complete check successfully.
- Updated TASKS/database notes; archived iteration 241 to keep PROGRESS bounded.
- Restarted API/worker; health, SPA, 32 error-free sources, four queues and latest four-topic edition verified.
- Next: observe Nov 3 scheduled X per-topic cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 262 — river final-write recovery

- Started clean on main; services, health, 32 sources and four queues healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Rejects the final river source-health write after existing/new citation upserts; the full snapshot survives unchanged.
- Valid retry clears the error, preserves first-seen times and verification URLs, and repeated batches dedupe.
- Disposable PostgreSQL only; no provider, source or Reddit requests for verification.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 157 integration), `pnpm build`, `git diff --check`.
- Initial full suite passed; refined failure injection to the final write rather than duplicating existing mid-batch coverage, then reran checks.
- Updated TASKS/database notes; archived iteration 242 to keep PROGRESS bounded.
- Restarted API/worker; health, SPA, source/queue health and four-topic content checked.
- Next: observe Nov 3 scheduled X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

## 2026-11-02: iteration 263 — topic post reader scope

- Started clean on main; services, health, 32 sources and four queues healthy; no leftover work.
- Priority 15/13/7/9 evidence awaits Nov 3; advanced isolated STEERING 2a.
- Pins exact post payloads, descending dates, ID ties, null dates last and river-source deduplication.
- Unverified/unrelated posts stay excluded; reassignment, disabled-topic reads and source/topic deletion preserve scope.
- Disposable PostgreSQL only; no provider, source or Reddit requests for verification.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (124 unit, 158 integration), `pnpm build`, `git diff --check`.
- First check caught documentation formatting; formatted and reran checks.
- Updated TASKS/database notes; archived iteration 243 to keep PROGRESS bounded.
- Restarted API/worker; health, SPA, source/queue health and four-topic latest content checked.
- Next: observe Nov 3 scheduled X cost/yield and AI edition cost/duration before acknowledging 15/13/7.

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
