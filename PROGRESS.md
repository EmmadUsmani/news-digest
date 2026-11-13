# Progress

Earlier entries: [archive before iteration 2155](docs/progress-archive/2026-11-13-iterations-before-2155.md).

Archived entries: [iterations 2146–2154](docs/progress-archive/2026-11-13-iterations-2146-2154.md).

Archived entries: [earliest retained entries before iteration 2172](docs/progress-archive/2026-11-13-before-2172.md).

Archived entries: [iterations 2162–2163](docs/progress-archive/2026-11-13-iterations-2162-2163.md).

Archived entries: [iterations 2164–2165](docs/progress-archive/2026-11-13-iterations-2164-2165.md).

## 2026-11-13: iteration 2166 — restore five-topic reader text verification

- Clean main; no inherited work. Initial alerts zero, health database/Redis pass, no failed user services.
- Fixed stale four-topic precondition/output in `smoke-reader-story-text.ts`; rendered topic count still must equal the immutable saved edition, and strict nonempty story checks remain.
- Nov 13 live saved-edition browser run now reaches and correctly fails `Tech & AI: missing story text`: all five Tech summaries are empty, with repeated Claude/Microsoft outage headlines. Gaming repeats QSSR three times. Recorded reader impact in daily review/TASKS; deployed admission repair awaits natural recovery.
- Historical saved edition 3bf10f5b-4c00-48b2-85bd-8e6dac7e3238 passes all four topics, NBA 5/5 summaries, desktop/mobile light/dark, no writes/errors and immutable response comparison. Discarded generated historical screenshot refreshes; no UI change.
- No provider calls, generation, source/configuration changes or runtime changes; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Script/docs-only step needs no service restart/build.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 972 unit/291 integration tests, four expected skips. Initial combined verification process ended with SIGTERM during checks; standalone full rerun passed.
- Next: Nov 14 scheduled NBA/admission acceptance before item 58/public activation; keep strict reader text gate and do not accept today's degraded content.

## 2026-11-13: iteration 2167 — prevent headline-only fallback slots

- Clean main; no inherited work. Initial alerts zero, health database/Redis pass, no failed user services.
- Reader weakness: Nov 13 Tech has five empty cards because fallback admitted articles with no saved source text. Non-AI recency/complete-triage selection now excludes blank excerpts before budgets; shared World/U.S. fallback excludes blank leads. AI headline evidence and immutable saved editions unchanged.
- Read-only replay of the currently retained Nov 13 Tech window: 200 candidates/123 with text; old fallback picks five empty excerpts, new fallback five with 91–337 characters. Retained pool is not the original publication snapshot; no generation/provider calls.
- Targeted `pnpm exec tsx --test apps/api/test/quality.test.ts`: 8/8 pass, including blank/whitespace slots, refill, empty pools and AI admission. Pipeline handbook updated; `check-handbook.ts edition-pipeline` passes (18 pages/one existing diagram/39 tables).
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 973 unit/291 integration tests, four expected skips; existing bundle-size warning.
- Restarted API/worker; `/healthz` and `check-scheduled-reader.ts 2026-11-13T15:00:00Z` pass. Reader response SHA-256 unchanged; 38 enabled active sources have successes/no errors, latest 16:22:47 UTC; post-deploy alerts zero/no failed services.
- TASKS/daily review updated. SOURCES/NEEDS_FROM_HUMAN unchanged: no source, owner decision, budget, provider or public-mode change. Next: scheduled NBA/admission recovery before item 58/private public-mode activation; today's saved edition remains degraded.

## 2026-11-13: iteration 2168 — passive metrics recovery evidence

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed user services.
- Highest scheduled NBA/item 58 acceptance remains pending Nov 14. Took the permitted short passive probe for the open metrics breakage; no limits/configuration/provider changes.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30` passes: 24 healthy rules, four uncached queries ≤0.572 s, unchanged process starts and zero new evaluator errors/missed iterations, admission limits, queue timeouts or slow queries.
- Two natural small merges processed 16,476 rows; no large-tier merge, comparable recovery still unaccepted. `journalctl -u obs-metrics.service --since '2026-11-13 14:43:13 UTC' --no-pager -p warning` has no entries.
- Updated TASKS/capacity evidence; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Documentation-only step leaves running services matching main; no restart/build needed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 973 unit/291 integration tests, four expected skips; `git diff --check` passes.
- Next: Nov 14 scheduled NBA/admission acceptance, then item 58/private public-mode activation. Next passive capacity probe no earlier than 17:26 UTC.

## 2026-11-13: iteration 2169 — gate scheduled NBA acceptance on saved AI editing

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed user services.
- Owner impact: prevent accepting another readable but non-AI NBA fallback as recovery before private public-mode activation.
- Added optional `--require-ai-topic NBA` to the existing GET-only scheduled reader check. Joins protected immutable editorial evidence by edition/window/topic identity; requires AI mode, model, published stories and nonempty summaries. Default publication check remains available.
- Offline controls cover AI/non-AI provenance, blank/empty stories, mismatched editions/windows, missing/duplicate topics and absent model. No inference, generation, budget or stored content changes.
- Live Nov 13 gate correctly exits 1: `NBA: scheduled stories are not AI-edited`; targeted tests pass 2/2. This is the known degraded edition, not a new failure.
- TASKS/public readiness updated; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Script-only change requires no build/service restart.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 975 unit/291 integration tests, four expected skips. Default Nov 13 publication check passes; Nov 14 reports pending.
- Next: run this gate plus normal scheduled-job/editorial review after Nov 14 publication; only then close item 58 and activate public mode privately.

## 2026-11-13: iteration 2170 — trace repeated fallback events

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass and no failed user services.
- Owner impact: next-edition recovery must restore event diversity as well as readable text and NBA AI provenance.
- GET-only review of saved edition `f901ba6c-cba3-4116-8539-fd0e92b98ec4`: seven Tech/Gaming cards cover three events (Claude outage, Microsoft outage, PS5 QSSR expansion), consuming four repeated slots.
- Traced publication: incomplete triage retains ungrouped `rankFallback`; only complete triage reaches explicit AI membership, which scored fallback can retain. Canonical-URL dedupe cannot merge different publishers. Blank-excerpt repair alone cannot restore grouping.
- Updated daily review/TASKS with concrete labels and next-run decision: verify complete triage, then inspect grouping/editor evidence if repeats persist. No heuristic, prompt, paid replay, source, provider, budget or saved-edition changes.
- Targeted quality/group-shortlist/clustering tests: 16/16 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 975 unit/291 integration tests, four expected skips.
- Documentation-only; running services remain on unchanged runtime code, no rebuild/restart needed. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Next: Nov 14 scheduled NBA/admission acceptance plus Tech/Gaming diversity review; then item 58/private public-mode activation.

## 2026-11-13: iteration 2171 — trace weak NBA Bluesky supply

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass and no failed user services.
- Reader weakness: NBA's fifth post is a low-engagement attributed scoring-list claim; viral quality remains unaccepted.
- Historical read-only pool has 593 observations/54 distinct posts. Reconstructed production shortlist from 50 saved semantic scores: complete, ten picks, six repeat X-covered events.
- Final cached editor chooses the distinct Vucevic milestone (18 likes/zero reposts/one reply); no X displacement. One unsupported-claim rejection is counted but its candidate is not identified.
- Cause and next eligible action recorded: limited distinct high-interest supply from generic NBA discovery; compare discovery later, preserve semantic/media gates. No forced slot, prompt, source/query, budget or provider change.
- Verification: historical coverage report, protected saved-preview GET, read-only cache queries and temporary cached-score production-shortlist invocation pass; temporary script removed. No inference, collection or generation.
- Updated TASKS/SOURCES and saved review; NEEDS_FROM_HUMAN/handbook unchanged. Documentation only; runtime unchanged, no rebuild/restart needed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 975 unit/291 integration tests, four expected skips.
- Next: Nov 14 scheduled NBA/admission acceptance and event-diversity review, then item 58/private public-mode activation.

## 2026-11-13: iteration 2172 — measure NBA attached-media supply

- Clean main; no inherited work. Alerts zero; health database/Redis pass, no failed user services.
- Extended GET-only stored Bluesky coverage report with safe image/video/description counts, bounded video examples and distinct stored video count; no media fetches or generation changes.
- NBA saved window: 54 distinct posts, one stored video, zero safe videos; 50 safe candidates contain nine image posts/41 without attachments, two author descriptions.
- Sole stored video is an NFT-tagged game chart (one like); existing safety rejects it. No evidence that selection overlooked a highlight. Tech/Gaming/U.S. safe video counts are 6/8/10.
- Historical report and all-five-topic count-bound assertions pass; temporary read-only observation inspection removed. No paid calls or configuration changes.
- Updated TASKS/SOURCES and saved review; NEEDS_FROM_HUMAN/handbook unchanged. Report-only change, runtime unchanged; no rebuild/restart needed.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 975 unit/291 integration tests, four expected skips. Archived three oldest retained entries to keep this file small.
- Next: Nov 14 scheduled NBA/admission/event-diversity acceptance, then item 58/private public mode; later discovery tuning should address absent highlight supply.

## 2026-11-13: iteration 2173 — compare NBA discovery queries

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass, no failed user services.
- Owner impact: improve the path to real NBA clips instead of filling the final post slot with weak scoring-list claims (STEERING 34/42).
- Added explicit free `probe-bluesky.ts --nba`: four queries/200 maximum observations, mutually exclusive with storage, existing safe engagement gates and bounded public examples.
- One common 24-hour window: NBA/#NBA/NBA highlights/basketball return 48/48/15/50 posts and 0/1/0/3 safe attached-video candidates. No media fetched or semantic/editor calls.
- Broader query candidates include Cade (45 likes), Celtics (11) and Dejounte Murray (eight); attachment metadata does not verify highlight content, and Cade repeats X's event.
- Comparison complete: retain production query; later gated discovery trial may compare hashtag/basketball supply with semantic filtering. No repeat probe while waiting.
- Verification: live four-query probe, bounds/no-storage assertions and conflicting-mode refusal pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 975 unit/291 integration tests, four expected skips.
- Updated TASKS/SOURCES and saved comparison; NEEDS_FROM_HUMAN/handbook unchanged. Probe-only change; runtime unchanged, no rebuild/restart needed. No paid calls or stored observations.
- Next: Nov 14 scheduled NBA/admission/event-diversity acceptance, then item 58/private public mode.

## 2026-11-13: iteration 2174 — trace restored U.S. selection quality

- Clean main; no inherited work. Alerts zero; health database/Redis pass, no failed user services.
- Reader weakness examined: repaired U.S. supply may still yield repetitive or shallow social reporting; traced actual scheduled selection rather than collecting again.
- Saved pool: 511 observations/56 distinct posts; 50 safe candidates/38 authors. Production shortlist reconstructed offline using exactly one saved score per candidate; ten results, complete.
- Three RFK-investigation candidates become one detailed selected post; election report adds a distinct event. X-covered Van Hollen development is not repeated; no X displacement.
- Cached editor explicitly prefers named senators/reporting context. One unsupported-claim drop is unattributed; original reporting and normal story/post overlap remain unaccepted.
- Retain Congress query and semantic gates; no absent-supply defect or reason to force the third open slot. Updated TASKS/SOURCES and linked review; NEEDS_FROM_HUMAN/handbook unchanged.
- Verification: historical coverage report, protected/public saved GETs, read-only cache/production-shortlist assertions pass. Temporary script removed; exports mode 600. No provider calls or writes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass: 975 unit/291 integration tests, four expected skips. Archived oldest retained entry to keep progress small.
- Documentation only; runtime unchanged, no rebuild/restart needed.
- Next: Nov 14 scheduled NBA/admission/event-diversity acceptance, then item 58/private public mode; later World discovery remains gated.

## 2026-11-13: iteration 2175 — finish historical X experiment reconciliation

- Clean main; no inherited work. Initial alerts zero; local health database/Redis pass, no failed user services.
- NBA/item 58/private public-mode activation await the next scheduled edition; no paid replay or generation changes.
- Closed stale STEERING 30/31 local accounting task: all 33 calls reconciled, $1.168639 settled plus $0.300000 unknown holds = $1.468639 charged.
- Both unknown Gaming requests lack saved responses; Nov 5 records a timeout. Retain both $0.15 holds indefinitely; reopen only for request-specific usage evidence.
- Read-only Python assertions matched 29 original settlement receipts and both append-only response hashes, absence of both unknown responses, totals and historical daily caps. No journal writes/provider calls.
- Updated experiment evidence/TASKS; corrected NEEDS_FROM_HUMAN's stale activation gate to STEERING 59: owner approval gates sharing, not private public-mode activation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass (975 unit/291 integration tests, four expected skips).
- Documentation only; SOURCES/handbook and runtime unchanged, no rebuild/restart needed.
- Initial push rejected: concurrent lead-only documentation commits on origin/main. Fetched/merged without rewriting history; runtime/test scope unchanged.
- Next: Nov 14 scheduled NBA/admission/event-diversity acceptance, then item 58 and private public mode; no repeat historical accounting audit without new evidence.

## 2026-11-13: iteration 2176 — require all five sections for recovery

- Clean main; no inherited work. Alerts zero; health database/Redis pass; no failed user services.
- Extended GET-only scheduled reader gate with repeatable named AI requirements; one admin snapshot serves all requirements. Existing single-topic result retained.
- Explicit names catch missing sections as well as non-AI provenance, missing models and blank story text; publication alone cannot pass recovery.
- Updated next natural-review command to Nov 14 and all five exact topic names. NBA/item 58 and public activation remain pending; event diversity still needs reader review.
- Four targeted gate tests pass, including partial recovery, missing sections and malformed options. Saved Nov 13 Tech is refused with non-AI provenance, as expected; no provider calls or writes.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips. Archived oldest two retained entries to keep this file small.
- Local verification tooling only; runtime unchanged, no rebuild/restart needed. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged.
- Next: normal Nov 14 edition review, then item 58/private public-mode activation; retain all spending and deployment gates.

## 2026-11-13: iteration 2177 — compare Tech Bluesky discovery supply

- Clean main; no inherited work. Initial alerts zero; health database/Redis pass; no failed user services.
- Owner-visible aim: find concrete Tech demos/launches missing from today's empty Bluesky section, without forcing weak picks.
- NBA/item 58/public activation still await Nov 14 scheduled acceptance; fallback repetition already has an upstream fix, so no new generation changes.
- Added non-storing `probe-bluesky.ts --tech`; four free searches compare baseline, Claude, Gemini and AI demo with the same 24-hour window.
- Fetched 41/50/50/47 posts; safety/engagement pools 41/47/48/28, attached videos 0/0/1/5. Bounded examples expose commentary, ambiguous names and game promotions.
- Retain production query and semantic/editorial gates: higher yield is not evidence of relevant demos. No paid calls, media fetches, stored observations or configuration changes.
- Four-result assertions pass for common window, bounded counts, zero writes and false semantic/publication flags; `--tech --store` refuses before credentials/network.
- Saved review and updated TASKS/SOURCES; handbook/NEEDS_FROM_HUMAN unchanged. Private export mode 600.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only. Archived oldest retained entry to keep progress small.
- Local probe only; runtime unchanged, no service restart needed.
- Next: normal Nov 14 edition recovery/AI/event-diversity review, then item 58/private public mode; do not repeat this comparison without a concrete new discovery hypothesis.

## 2026-11-13: iteration 2178 — compare Gaming Bluesky discovery supply

- Clean main; no inherited work. Alerts zero; health database/Redis pass; no failed user services.
- Owner-visible aim: improve relevant Gaming post supply without adding old clips or repeating the already-selected event.
- NBA/item 58/private public-mode activation await Nov 14 scheduled recovery; no generation changes.
- Added non-storing `probe-bluesky.ts --gaming`; four free searches compare game/gaming/video games/Slay the Spire in one 24-hour window.
- Fetched 50/48/50/48 posts; safety/engagement pools 48/48/50/48, attached videos 5/5/1/1. Bounded texts show commentary, old clips and repeated beta-update coverage.
- Retain production `game` query and semantic/editorial gates; no writes, paid calls, media fetches or configuration changes.
- Four-result assertions pass after selecting query records from adapter event output; combined `--gaming --store` refuses before credentials/network. Export mode 600.
- Updated TASKS/SOURCES and saved comparison; handbook/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Local probe only; runtime unchanged, no restart needed. Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public mode.

## 2026-11-13: iteration 2179 — repair admission event log searches

- Clean main; no inherited work. Initial alerts zero; database/Redis health pass; no failed user services.
- Reader recovery remains pending Nov 14; found the review CLI silently missed structured admission events by searching only message text.
- `obs logs --grep` now searches message or event within the same service/time/result bounds; query-escaping regression updated.
- Read-only live verification: event and message searches return identical 14 saved Nov 13 admission records, all admitted; no settlement-wait/recovery acceptance inferred.
- Targeted CLI tests: 18/18 pass. `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, handbook check and `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Updated TASKS, scheduled review and observability handbook; archived iterations 2162–2163 to keep progress small. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Local CLI only; no generation changes, paid calls, publication writes or service restart required.
- Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public activation.

## 2026-11-13: iteration 2180 — passive metrics recovery observation

- Clean main; no inherited work. Initial alerts zero; database/Redis health pass; no failed user services.
- Owner value: establish whether the existing low-CPU metrics limit keeps alert evaluation healthy during natural compaction; public launch still excludes Grafana.
- Scheduled NBA/item 58/private public-mode gates remain pending Nov 14; no replay or generation change.
- `pnpm exec tsx scripts/sample-metrics-recovery.ts 1 30`: 24 healthy rules, four uncached queries ≤1.195 s; no new evaluator failures, missed evaluations, admission-limit hits, queue timeouts or slow queries.
- One natural small merge/15,189 rows; no large merge. Below comparable threshold, so recovery stays open and capacity remains unchanged.
- `journalctl -u obs-metrics.service -u obs-alerts.service --since '2026-11-13 16:24:44 UTC' -p warning --no-pager -n 10`: no entries.
- Updated TASKS and capacity evidence; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Documentation-only; no runtime restart required.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Next: Nov 14 scheduled all-topic AI/event-diversity review, item 58, then private public activation; no next passive sample before 19:35 UTC.

## 2026-11-13: iteration 2181 — compare U.S. Bluesky reporting supply

- Clean main; no inherited work. Initial alerts zero, database/Redis healthy, no failed user services.
- Owner value: test whether alternate U.S. searches supply concrete reporting beyond the repaired Congress pool, without risking tomorrow’s edition.
- Added non-storing `probe-bluesky.ts --us`; four free searches return 49/49/50/48 observations for Congress/Senate/House of Representatives/US politics.
- Senate exposes first-person leadership text but repeats selected X coverage; House repeats election coverage/adds foreign-policy scope; broad politics adds commentary. Retain Congress and semantic/editorial gates.
- Four-result window/count/non-storage/publication assertions pass; combined `--us --store` refuses before credentials/network. Export mode 600; no media or paid calls.
- Updated TASKS/SOURCES and U.S. selection evidence; archived iterations 2164–2165 to keep progress small. Handbook/NEEDS_FROM_HUMAN unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Local probe only; runtime unchanged, no restart required. Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public activation.

## 2026-11-13: iteration 2182 — accurate empty-story reader message

- Clean main; no inherited work. Alerts zero, health/database/Redis pass, all 38 sources healthy, all queues available; next digest Nov 14 15:00 UTC.
- Owner value: World/U.S. withheld stories after failed triage must not be described as a quiet news day.
- Reader now says “No stories in this edition”; published posts remain visible. Immutable snapshots and generation unchanged; NBA/item 58 acceptance still awaits Nov 14.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass: 977 unit/291 integration tests, four expected skips; existing build warnings only.
- Restarted `news-digest-api.service`; retrying `curl -fsS http://localhost:8000/healthz` passes; post-restart alerts zero.
- `node /tmp/iteration-2182-reader.cjs`: GET-only Playwright on real saved edition, third parties blocked; both empty sections and retained posts pass at 390/1440px light/dark; no overflow/browser errors.
- Saved four screenshots under `docs/screenshots/ui/reader-empty-stories-*`; inspected mobile light and desktop dark images.
- Updated TASKS; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (reader wording fix only); no paid calls.
- Next: Nov 14 scheduled recovery/AI/event-diversity review, then item 58/private public activation.

## 2026-11-13: iteration 2183 — disclose missing story summaries

- Clean main; no inherited work. Initial alerts zero, health/database/Redis pass, no failed user services.
- Owner value: five saved Tech headlines have no summary; readers now see an explicit unavailable message and an accessible source link instead of an unexplained gap.
- Whitespace-only summaries use the same fallback; existing summaries render unchanged. Saved editions, generation, budgets and activation gates unchanged.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, `git diff --check` pass; 977 unit/291 integration tests, four expected skips.
- Restarted API; `/healthz` passes. GET-only `node /tmp/iteration-2183-reader.cjs` checks the real saved edition at 390/1440px, light/dark: five fallbacks, correct source URLs, retained summaries, no overflow/browser errors.
- Corrected the temporary browser check’s exact-text matcher (message includes its link); rerun passes. Four screenshots saved under `docs/screenshots/ui/reader-missing-summaries-*`; inspected mobile light and desktop dark.
- Updated TASKS; SOURCES/NEEDS_FROM_HUMAN/handbook unchanged (reader presentation only); no paid calls.
- Next: Nov 14 scheduled all-topic AI/event-diversity acceptance, then item 58/private public activation.
