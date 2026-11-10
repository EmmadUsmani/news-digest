# Progress

[Through iteration 1719](docs/progress-archive/2026-11-10-through-1719.md).

## 2026-11-10: iteration 1720 — restore PC Gamer feed collection

- Clean main; health/database/Redis pass and initial alert snapshot has zero active alerts. GamingBolt recovered through scheduled retries at 17:17:58 UTC (10 items, 169 stored).
- Source triage caught PC Gamer exhausting three attempts: valid HTTP 200 RSS is 2,013,022 bytes, exceeding the old 2 MB cap. Raised shared HTTP wire/expanded bounds to 3 MB; preserved all other collection limits and sanitized size errors.
- Added offline identity/compressed acceptance above the former limit and refusal above the new wire/expanded bounds. Updated source/architecture docs. No provider calls, migration or public flag changes.
- Deliberately discarded this iteration's unfinished Grafana catalog/function test additions when the source failure took priority. Prior committed Grafana preparation remains intact; review remains open.
- Targeted `pnpm exec tsx --test apps/api/test/custom-feeds.test.ts` passes (3 tests). Explicit live SharedHttpClient/parseFeed check passes: 2,013,022 bytes, 50 items. Full checks and deployment follow.
- `pnpm format`, `pnpm lint:fix`, full `pnpm check` (819 unit, 279 integration/four expected skips), `pnpm build`, scheduled-reader check (four topics/19 stories/15 posts) and `git diff --check` pass. A later format check caught the newly archived progress file; targeted Prettier correction and `pnpm format:check` pass. No application checks failed. Commit/push and post-16:00 UTC restart follow.

## 2026-11-10: iteration 1721 — review inherited Grafana database access

- Clean main; no inherited work. Health/database/Redis pass, no failed user units, zero active alerts and all 36 sources healthy.
- Extended disposable Grafana SQL coverage: elevated attributes, other role membership and executable application SECURITY DEFINER functions absent; server files/programs and password catalogs checked.
- Added a rolled-back synthetic comment marker proving catalog comments remain readable; view definitions reveal underlying tables. No claim of live private-row or comment leakage. Same-database arbitrary public SQL remains unapproved.
- Updated tool review/readiness and next task: rehearse sanitized export storage or server-enforced fixed queries before installing datasource. Prepared SQL/dashboard remain uninstalled; no live role/migration/flag/provider changes. Phase 3 awaits a normal scheduled edition.
- First full check: 819 unit tests pass; Grafana test exposed that superuser-backed SET LOCAL ROLE cannot prove SET ROLE denial. Removed that invalid assertion and documented the real-login rehearsal requirement; corrected full rerun follows.
- Corrected full `pnpm check` passes: 819 unit tests, 279 integration tests/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build`, scheduled-reader check (four topics/19 stories/15 posts) and `git diff --check` pass. Commit/push and API/worker restart follow.
- Initial push rejected (owner lead-status commit advanced main); fetched and merged it without editing owner files. Post-restart health/database/Redis, scheduled reader and all 36 sources pass; zero active alerts or failed user units. Retrying push with the merged history.

## 2026-11-10: iteration 1722 — rehearse isolated Grafana aggregate storage

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass and no failed user services.
- Prepared dedicated-instance PostgreSQL aggregate tables, separate from application catalogs; no live service, datasource, credentials, migration or public flag change.
- Added disposable-instance real reader login rehearsal: exact daily dashboard queries, aggregate source counts, idempotence and denied escalation/password catalogs/program execution/writes/schema creation. Grants still deny writes after resetting the read-only default.
- Export transport/atomic refresh/retention, capacity assessment, aggregate source-panel adaptation and Grafana browser/query-route review remain before installation. Synthetic test counts are not live exports. Later owner Phase 3 acceptance noted below.
- `pnpm format`, `pnpm lint:fix`, `pnpm build` and `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-10T15:00:00Z` pass (four topics/19 stories/15 posts). Full `pnpm check` passes (819 unit tests, 280 integration tests/four expected skips); `git diff --check` clean. Commit/push and API/worker restart follow.

- Push initially rejected because owner advanced main; merged upstream unchanged. Owner now accepts Phase 3 and prioritizes NBA editor diagnosis (54) before Phase 4/migration 0019; updated TASKS accordingly. Post-restart health/reader pass, zero alerts/failed units. Retrying push with merged history.

## 2026-11-10: iteration 1723 — retain rejected story-editor attempts for replay

- Clean main; no inherited work. Initial alerts zero; health/database/Redis pass and no failed user units. STEERING 54 takes priority over Phase 4.
- Confirmed absence guard requires whole source sentences; Nov 10 rejected bodies were discarded, so exact unsupported/supported claims remain unknown. No guard or prompt change and no paid calls ($0 of the $0.10 replay cap used here).
- Added private filesystem port/adapter capturing story-editor request, raw response and fixed validation reason for initial/repair rejection. Production composition enabled; successful cache, reader payloads and logs retain no rejected text.
- Store uses directory/file permissions 0700/0600; 256 KiB/file and 100-file bounds; files older than 30 days pruned on next write. Store failure cannot block repair/fallback. No migration, public flag or provider changes.
- Added offline tests for replay inputs/reasons, parse/semantic failures, no success-cache writes, disk failure isolation, permissions/count/age/size bounds. Targeted LLM/store suite passes 32 tests. Handbook updated.
- Initial full check/lint exposed import sorting and a missed await on cached rejection diagnostics; corrected and rerunning. Build, handbook and scheduled-reader checks pass (four topics/19 stories/15 posts).
- Next: reconstruct Nov 10 NBA shortlist and bounded replay, identify rejected sentences/rules, fix only the demonstrated cause, deploy by Nov 11 noon; Nov 11 scheduled AI-edit acceptance remains required.
- Corrected full `pnpm check` passes (821 unit; 280 integration, four expected skips); `pnpm format`, `pnpm lint:fix`, final `pnpm build`, handbook check and `git diff --check` pass. Commit/push and API/worker restart follow.
- Pushed `c78756f7`; API/worker restarted active, health/database/Redis and scheduled reader pass, no failed user units. RecentJobFailures reflects GamingBolt timeout/502 attempts; scheduled third attempt recovered HTTP 200 at 18:19:45 UTC. No source change needed; alert lookback still active at 18:24.

## 2026-11-10: iteration 1724 — verify historical NBA editor reconstruction inputs

- Clean main; no inherited work. Health/database/Redis pass, no failed user units. GamingBolt recovered; recent-failure alert resolved at 18:28 UTC, zero alerts at 18:30.
- Added read-only reconstruction script: historical edition/scores, snapshot coverage restoration, exact per-item triage cache fingerprints, bounded source-subset recovery, then exact cached grouping before editor request capture. Provider/cache writes are forbidden.
- Actual replay probe matches 129/130 saved triage scores; Tatum/Brown preview `5fab414d-9086-49b1-b2a6-b29c0d9aece6` has no matching current-input fingerprint. Original excerpt/difference unknown; title/outlet restoration and outlet subsets did not resolve it.
- Script stops with `historical-input-gap` before grouping/editor construction; private mode-0600 evidence at `/tmp/nba-reconstruction/verified-input.json`. Verified 129 matching scores/one gap/no request payload. No claim of exact replay or identified rejected sentence.
- No paid calls ($0/$0.10), prompt/guard/provider/flag/migration changes. Guard/fallback retained; item 54 remains open. Next: recover historical preview input, reconstruct shortlist/grouping and diagnose rejected output before Nov 11 noon UTC.
- `pnpm build` and scheduled-reader check pass (four topics/19 stories/15 posts). Initial full check found three require-await lint errors in script stubs; corrected to explicit promises, rerunning full check and lint fix.
- Corrected `pnpm check` passes: 821 unit tests, 280 integration tests/four expected skips. `pnpm format`, `pnpm lint:fix`, handbook check and `git diff --check` pass. Empty/null excerpt probes also miss; private evidence overwrite refusal verified. Commit/push and API/worker restart follow.

## 2026-11-10: iteration 1725 — recover verified historical NBA editor requests

- Clean main; no inherited work. Initial alerts zero. No production generation, guard, prompt or provider changes.
- Unmatched preview ranks 48th in saved scores; forty verified candidates outrank it (cutoff 4/9 versus 4/8). Historical text cannot change its pool exclusion.
- Reconstruction now proceeds only if every unresolved candidate is strictly below forty verified inputs; gaps within the pool still stop before grouping/editor capture.
- Exact historical grouping cache validates; forty grouped inputs yield ten editor candidates/two initial requests. Private 0600 artifact `/tmp/nba-reconstruction/editor-verified.json`; zero provider/cache/publication writes.
- Historical rejected output remains unavailable; no claim of diagnosed sentences or validated AI result. Item 54 replay spend remains $0/$0.10; next: bounded replay, real-sentence tests and demonstrated fix before Nov 11 noon.
- Verification: reconstruction succeeds with exact cache hit; format, lint fix, full check/build and live reader/health checks recorded below.
- Full `pnpm check` passes: 821 unit tests and 280 integration tests/four expected skips. `pnpm format`, `pnpm lint:fix`, `pnpm build`, handbook check and `git diff --check` pass; health/database/Redis and scheduled reader pass (four topics/19 stories/15 posts). Identical independent request captures, 0600 mode and overwrite refusal verified. Commit/push and service restart follow.

## 2026-11-10: iteration 1726 — prepare bounded NBA replay and preserve unspent claim

- Clean main, no inherited work; `pnpm obs alerts` zero, `/healthz` database/Redis healthy.
- Added `scripts/replay-nba-editor.ts`: fixed private once-only state, $0.10 cumulative conservative reservation ceiling, shared verification ledger/caps, raw request/response files 0600, production cache bypass, no publication.
- First invocation without required flag stopped before claiming. Correct flagged run claimed authorization but stopped before reserve/provider: cache bypass returned null, interpreted as a cached schema-invalid response. Fixed miss sentinel to undefined; guard/prompt unchanged.
- DB audit: zero llm_calls for `item-54-nba-8837dd87-743a-4def-b3d9-194f3a0795e6`; no response files. $0/$0.10 spent; private claim retained at `~/.local/state/news-digest/item-54-nba/item-27-evaluation.claim`. Do not blindly delete/retry it.
- `LLM_LIVE=1 pnpm exec tsx scripts/replay-nba-editor.ts --preflight` passes offline: both models reach admission, zero validation failures or provider/ledger/cache/claim writes. Conservative Sonnet/Haiku estimates 74805/3741 micros; shared daily verification cap may refuse Sonnet.
- Next: implement audited recovery of the proven-unspent claim, then replay and name real rejected sentences; item 54 remains open, deploy fix before Nov 11 noon and verify scheduled edition.
- Verification: normal-environment `pnpm check` passes 821 unit + 280 integration tests/four expected skips; format, lint fix, build, offline preflight and diff check pass. Duplicate check accidentally inherited production flags and failed golden/profile-isolation expectations; no code changes made for that contaminated run. `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verifies four topics/19 stories/15 posts.

## 2026-11-10: iteration 1727 — capture real NBA replay failures and pin sentence regressions

- Clean main; no inherited work. Zero initial alerts; health/database/Redis pass.
- Added fixed single-use recovery: retain original claim, require no old ledger rows/outputs, then exclusive recovery directory/claim. Duplicate recovery refuses before provider/ledger access; no production cache or edition writes.
- Historical NBA replay: Sonnet refused by shared verification cap; two Haiku calls settled **3,913 micros ($0.003913)**, zero holds. Private 0600 raw responses and diagnostics retained; cumulative item 54 spend $0.003913/$0.10.
- Named actual first rejection: invented “no return timeline given” (source only says “out indefinitely”); keep rejection. Supported Hornets headline paraphrase also fails verbatim guard; exact Hornets and attributed Lee source sentences pass.
- Repair is valid JSON but has five brief bullets (maximum four), `invalid-schema/too_big`. Lost original Nov 10 invalid-JSON output remains unexplained. No runtime prompt/guard change or claim of validated replay.
- Four regression tests pin real unsupported/supported sentences, altered quotation and brief bound. Diagnosis in Nov 10 edition review. Archived progress through 1719 to keep orientation small.
- Next: NBA generation/repair correction, offline saved-output verification, bounded validated replay and deploy before Nov 11 noon. Guard/fallback retained; item 54 still open.
- Verification: `pnpm format`, `pnpm lint:fix`, full `pnpm check` (825 unit; 280 integration/four expected skips), `pnpm build`, handbook check, targeted editor tests (25), duplicate-recovery refusal and `git diff --check` pass. Scheduled reader verifies four topics/19 stories/15 posts. Commit/push and API/worker restart follow.

## 2026-11-10: iteration 1728 — target NBA generation at captured replay failures

- Clean main; no inherited work. Initial alerts zero; health/database/Redis healthy.
- NBA-only v14 instructions warn against inferring missing return timelines from “out indefinitely”, guide supported positive headlines and retain exact attributed absence sentences in summaries.
- Brief guidance explicitly separates five selected stories from the maximum four bullets; omit lower-priority brief coverage rather than combining unrelated stories.
- Other topic instructions/cache namespace unchanged; absence guard, schema limits, budgets and fallback retained.
- Recorded-sentence regression rejects five factual bullets, repairs to four and retains all five stories; checks guidance reaches initial/repair requests. Targeted editor suite passes 26 tests.
- No paid calls or replay claim changes; cumulative item 54 spend stays $0.003913/$0.10. A fake-provider repair is not a validated live replay; item 54 remains open.
- Next: separate audited single-use replay of changed NBA prompt within remaining cumulative/shared caps; preserve existing consumed claims. Demonstrate validated output before closing correction, then review Nov 11 scheduled NBA.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (826 unit, 280 integration/four expected skips), targeted editor suite (26), handbook check, offline replay preflight and `git diff --check` pass. Scheduled reader retains four topics/19 stories/15 posts. `pnpm build` passes; push and service restart follow.
