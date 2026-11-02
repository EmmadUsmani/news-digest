# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

## 2026-11-02: iteration 61 — reserve a separate Sonnet allocation

- Started clean on main; no leftover work. Services/health, seventeen sources and digest runs healthy. Retained ingestion failure was historical invalid XML; all active sources subsequently succeeded.
- Sonnet now has a configurable 80% ceiling inside the shared daily cap (`LLM_EDITOR_DAILY_FRACTION`, 0–1); no extra funds or model/provider/billing changes. Existing Haiku then labeled signal fallback remains.
- Same cross-process reservation lock enforces both caps, including repairs and all old pending/uncertain model charges; settlement releases unused funds and free validated caches remain available.
- Status API/UI displays model allocation, used/reserved amount and effective availability; corrected obsolete signal-only status description. Updated TASKS/docs/LLM; no source changes or owner blockers.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 76 tests in disposable DBs; `pnpm build` passed (existing upstream Zod warnings). An intermediate concurrent edit caused an import-order check failure; final full rerun passed.
- New isolated Postgres checks cover concurrent model reservations, settlement, prior-month uncertainty, Haiku editor fallback/cache and usage reporting; no live inference in tests.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 717 real URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed screenshots and visually inspected mobile allocation display.
- Exact-window API regeneration preserved 4/5/5/5 AI stories, identical topic snapshots, unchanged historical edition and zero new calls. Schedule unchanged.
- Incremental inference $0; actual day/month $0.386695, zero reservations/errors. Shared daily cap $0.482758; Sonnet allocation $0.386206 with $0.039654 remaining.
- Next: broader independently reviewed editorial evaluation, scheduled Message Batches and cross-process cache-miss coordination; M3 remains open.

## 2026-11-02: iteration 62 — World and Tech editorial evaluation

- Started clean on main; no leftover work. Services, health, active sources and digest runs healthy; retained ingestion failure remains historical, with subsequent source successes.
- Generalized explicit paid recorder/offline replay to existing World/Tech windows; preserved NBA v1. New artifacts require valid evidence IDs; replay includes bounded evidence inputs and exact shortlist/SHA/complete-score checks.
- Withheld pre-existing agent labels: World 3/5 targets vs signals 1/5; Tech 3/5 vs 0/5; all eight omission labels absent. These are one-date provisional target-recall measurements, not precision or factual verification.
- Haiku edited both via existing budgeted fallback: Sonnet's remaining allocation could not cover its reservation. Ten new calls cost $0.007407; day/month actual $0.394102, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Models/provider/billing unchanged.
- Audited ten summaries against supplied evidence. Found unsupported Apple non-confirmation statement; documented concrete triage/shortlist/editor misses and prioritized factual-support follow-up. No production prompts or scores changed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed typecheck/lint/format/boundaries and 78 isolated tests; `pnpm build` passed with existing upstream Zod warnings only.
- `pnpm evaluate:editorial` passed all three offline replays; recorder refuses existing artifact before inference. No fixture content inserted or editions published by evaluation.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 718 real URLs, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; refreshed screenshots, visually inspected mobile digest. Schedule unchanged.
- Updated TASKS/docs/RANKING; archived iterations 23–37 to keep progress bounded. No owner blockers. Next: unsupported negative claims, reviewed labels/later dates/Gaming, scheduled batches and cross-process cache coordination.

## 2026-11-02: iteration 63 — mitigate unsupported absence claims

- Started clean on main; no leftover work. Services/health, seventeen sources and digest runs healthy; schedule unchanged.
- Editor v3 distinguishes omitted excerpt facts from real-world absence, permits shorter supported summaries and requests clause review; changed instruction hash invalidates only editor caches.
- Recorded one explicit Tech replay with unchanged triage/shortlist and withheld labels: same 3/5 provisional targets, zero labeled omissions. Apple summary now attributes findings without asserting company non-confirmation.
- This is prompt mitigation, not factual validation: Apple significance/rationale still imply no announcement/confirmation; benchmark summary describes unperformed verification. Documented all-five-summary audit and prioritized remaining support validation.
- Added immutable v3 artifact and offline case regression; recorder supports explicit v3 output and refuses overwrite before inference. No fixture content inserted or editions published.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 79 isolated tests; `pnpm build` passed (existing upstream Zod warnings). Initial check stopped after concurrent documentation edits; formatted/full rerun passed.
- `pnpm evaluate:editorial` passed historical replays; v3 regression verifies recorded Apple improvement with preserved recall. No general quality estimate claimed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live passes: 720 stored URLs, seventeen healthy sources; no source changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- One configured Haiku fallback call cost $0.001691; day/month $0.395793, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Models/provider/billing unchanged.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: stronger factual-support validation, broader reviewed evaluation, scheduled Message Batches and cross-process coordination.

## 2026-11-02: iteration 64 — validate lexical absence claims

- Started clean on main; no leftover work. API/worker/health, seventeen sources and digest runs healthy; retained ingestion failure historical with later successes. Schedule unchanged.
- Editor v4 rejects lexical absence sentences unless verbatim in cited bounded inputs; includes rationale and briefs. Existing reserved repair/model fallback applies; only editor cache identity changes.
- Regressions reject recorded v3 Apple/benchmark caveats, uncited/clipped/changed-subject support; supported quotes and repaired outputs pass. Conservative heuristic may reject good paraphrases; broader factual entailment remains open.
- Explicit Tech v4 evaluation returned no validated result after two Haiku calls; no artifact/edition published and no improved recall claimed. Sonnet reservation allocation unavailable. Next: diagnose false rejection/repair feedback before broader factual validation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 82 isolated tests pass; `pnpm build` passes (existing upstream Zod warnings). Initial check hit a formatting edit during verification; final full rerun green.
- `pnpm evaluate:editorial` passes historical replays; focused editor/evaluation tests 14/14 pass without external services.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two live queued passes: 720 real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Live evaluation cost $0.003047; day/month $0.398840, zero reservations/provider errors. Shared daily cap $0.482758/$14 monthly; models/provider/billing unchanged.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. M3 remains open: factual support, broader reviewed evaluation, scheduled batches and cross-process coordination.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest inspected. First UI attempt raced restart; rerun passed after health recovered.

## 2026-11-02: iteration 65 — explain absence failures to the repair

- Started clean on main; no leftover work. API/worker/health, seventeen active sources and retained digest runs healthy; schedule unchanged.
- Found semantic rejection received only generic JSON repair instructions. Added fixed application-owned absence-support feedback covering every output field; no raw model/source/error text echoed.
- Single separately reserved repair, original input bounds/cache identity, strict support guard and capped model fallback remain. Extended four-field regression to inspect actual repair requests.
- Explicit `record-editorial-evaluation.ts tech v4` still failed closed after two Haiku attempts; no artifact/edition published and no quality or false-rejection improvement claimed.
- Inference cost $0.003279; day/month $0.402119, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 82 isolated tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm evaluate:editorial` passed unchanged historical offline replays. No fixture content inserted or labeled live.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 722 stored real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: bounded validation failure categories/diagnostics before another paid replay, then false-rejection audit and broader factual support.

## 2026-11-02: iteration 66 — bounded editorial validation diagnostics

- Started clean on main; no leftover work. Services/health, seventeen active sources and retained digest runs healthy; historical ingestion failure has subsequent source successes. Schedule unchanged.
- Budgeted caller now retains only the last 32 validation failures as closed attempt/category pairs: JSON, schema, selection, absence support or unexpected validator error. Defensive copies; no raw model/source/error text, paths or IDs.
- Editorial facade exposes diagnostics; explicit paid recorder prints them before a refused-result assertion. Process-local/shared across triage and editor, no durable run attribution; no automatic logging or extra inference.
- Tests cover real selection/absence checks, parse/schema separation, unexpected errors, bounds/mutation safety, successful repair/cache reuse and invalid-cache classification; existing reservations/repair/fallback and prompt/cache identities preserved.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 86 isolated tests; `pnpm build` passes with existing upstream Zod warnings. `pnpm evaluate:editorial` passes historical offline replays.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two queued live passes: 722 real URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- No paid replay or new edition this iteration; no quality improvement claimed. Incremental inference $0; actual day/month $0.402119, zero reservations/provider errors. Provider/models/billing unchanged.
- Updated TASKS/docs/LLM; no owner blockers. Next: bounded diagnostic Tech replay and absence-guard false-rejection audit before changing guard, then broader factual support/evaluation, scheduled batches and cross-process coordination.

## 2026-11-02: iteration 67 — diagnose Tech rejection and state editor bounds

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; historical ingestion failure has subsequent source successes. Schedule unchanged.
- Bounded Tech replay diagnosed initial schema rejection then absence rejection on repair. Categories cannot identify rejected fields/sentences or establish false rejections; guard unchanged.
- Added missing enforced text/array limits and exact-key requirements to editor instructions, including repairs. Instruction hash refreshes editor caches only; no provider/model/billing changes.
- Second explicit Tech replay accepted five stories after one absence repair. New immutable offline v4 artifact retains 3/5 provisional targets and zero labeled omissions; no fixture content or evaluation editions published.
- Audited all five summaries against cited bounded inputs; prior Apple/benchmark absence caveats absent. Significance extrapolation (hospital access versus adoption, benchmark implications) remains; no general factuality/precision claim.
- Added all-field length boundary/repair regressions and offline v4 absence/recall regression; `pnpm evaluate:editorial` now includes v3/v4 snapshots alongside historical NBA/World/Tech replays.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 88 isolated tests; `pnpm build` passes with existing upstream Zod warnings. Initial check raced the new unformatted artifact; formatted final rerun passed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 723 real URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest inspected.
- Two evaluations/four Haiku calls cost $0.006296; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps.
- Updated TASKS/docs/LLM/docs/RANKING; no owner blockers. Next: broader factual support/absence false-rejection audit, independent labels/later dates/Gaming, scheduled batches and cross-process coordination.

## 2026-11-02: iteration 68 — reproducible support challenge audit

- Started clean on main; no leftover work. Services/health, seventeen sources and retained digest runs healthy; historical ingestion failure has later successes. Schedule unchanged.
- Added `pnpm evaluate:support`: ten explicitly synthetic challenges plus two actual Tech v4 significance fields linked to SHA-checked bounded cited inputs. Prints labels, reasons, evidence and guard decisions offline; no inference/publication.
- Four supported/eight unsupported cases: two supported paraphrases rejected; six unsupported claims accepted, including dropped attribution, absence synonym, causation, rumor certainty and both recorded significance extrapolations. These are hand-selected agent judgments, not production rates or independent review.
- Production guard/prompts/cache identities unchanged. Tests check accounting, unique labels and recorded-evidence linkage without pinning weaknesses as required behavior; prioritized attribution-preserving lexical matching next.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 89 isolated tests; `pnpm build` passed with existing upstream Zod warnings. `pnpm evaluate:editorial` and `pnpm evaluate:support` passed offline.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 724 stored real URLs, four topics, seventeen healthy sources; no source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- Incremental inference $0; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- Updated TASKS/docs/RANKING; no owner blockers. Next: repair attribution-dropping matches, broader reviewed clause-support evaluation, scheduled batches and cross-process coordination. M3 remains open.

## 2026-11-02: iteration 69 — retain complete absence evidence sentences

- Started clean on main; no leftover work. Services/health, seventeen sources and retained digest runs healthy; historical ingestion failure has subsequent successes. Schedule unchanged.
- Replaced absence substring matches with whole normalized source-sentence equality, retaining attribution prefixes and trailing scope/conditions; all four story fields and briefs share validation and reserved repair.
- Updated editor instruction hash to refresh editor caches only; triage caches, models/provider/billing and immutable editions unchanged. Conservative punctuation/newline splitting remains, not semantic entailment or cross-sentence attribution validation.
- Added regression coverage for attribution prefixes/suffixes, location/conditions, full sentences inside excerpts, separate evidence and all-field editor repair.
- Original twelve-case offline audit now accepts five unsupported claims (previously six), rejects the dropped ministry attribution, and still rejects two supported paraphrases. Hand-selected agent judgments, not production rates; synonym/causal/uncertainty/significance gaps remain.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and all 92 isolated tests; `pnpm build`, `pnpm evaluate:editorial` and `pnpm evaluate:support` pass.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 726 real URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed.
- No paid replay or evaluation edition published; incremental inference $0. Actual day/month $0.408415, zero reservations/provider errors; $0.482758 daily/$14 monthly caps.
- Updated TASKS/docs/RANKING; no owner blockers. Next: broader clause-support and independently reviewed false-rejection evaluation, later dates/Gaming, scheduled Message Batches and cross-process coordination. M3 remains open.

## 2026-11-02: iteration 70 — evaluate paired clause support

- Started clean on main; no leftover work. Services/health, seventeen active sources and retained digest runs healthy; historical ingestion failure has later successes. Schedule unchanged.
- Added eight synthetic fixed-evidence support/unsupported pairs across all four topics: attribution, certainty, causation, quantity, scope, time, cross-sentence attribution and added clauses; report exposes per-pair decisions.
- Expanded audit: 12 supported/16 unsupported; three supported rejections and thirteen unsupported acceptances. All eight new unsupported variants pass; cross-sentence attributed paraphrase fails while its unattributed exact sentence passes.
- These are hand-selected agent judgments, not independent review or production rates. No production guard/prompt/cache changes or published evaluation edition; broader recorded-output review remains needed.
- Tests verify fixed evidence, opposite labels, four-topic coverage and report accounting without pinning known guard weaknesses. Updated TASKS/docs/RANKING; no source changes or owner blockers.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 93 isolated tests; `pnpm build`, `pnpm evaluate:editorial`, `pnpm evaluate:support` passed.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 726 real URLs, four topics, seventeen healthy sources. API/worker rebuilt/restarted; `/healthz` healthy.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; status screenshots refreshed.
- No inference spending; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- Next: recorded clause-support evaluation with independent labels/later dates/Gaming; scheduled Message Batches and cross-process cache coordination remain open. M3 remains unfinished.

## 2026-11-02: iteration 71 — audit every recorded Tech v4 story field

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; historical ingestion failure has subsequent successes. Schedule unchanged.
- Added `pnpm evaluate:recorded-support`: all twenty headline/summary/significance/rationale fields in accepted Tech v4 output, with provisional labels/reasons and bounded cited inputs. Snapshot/claim SHA-256, citation replay and exact field coverage prevent silent drift.
- Review: eleven supported, six editorial interpretations, three unsupported. All three unsupported pass the lexical guard: prior benchmark/hospital significance gaps plus access-to-adoption in the hospital rationale. Interpretations excluded from support/rejection counts.
- Single accepted historical output, agent judgments only; no independent labels, clause-level truth claim or false-rejection-rate estimate. Briefs/triage/rejected attempts excluded; no production guard/prompt/cache/edition changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 94 isolated tests; `pnpm build`, `pnpm evaluate:editorial`, `pnpm evaluate:support`, `pnpm evaluate:recorded-support` pass (existing upstream Zod build warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 726 real stored URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; status screenshots refreshed.
- No inference spending; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- Updated TASKS/docs/RANKING; no owner blockers. Next: other recorded topics/briefs, independent labels and rejected negative claims; later dates/Gaming, scheduled batches and cross-process cache coordination remain open. M3 unfinished.

## 2026-11-02: iteration 72 — audit recorded World story fields

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; historical ingestion failure has subsequent successes. Schedule unchanged.
- Extended `pnpm evaluate:recorded-support` to report all twenty World fields alongside Tech, with exact coverage, claim/snapshot hashes and bounded citation replay, including three-source protest synthesis.
- World provisional judgments: ten supported, five interpretations, five unsupported. Current guard rejects two historical absence rationales but accepts three unsupported background/scope/attribution fields. Historical output predates current guard; no runtime regression or general quality estimate claimed.
- Agent judgments only, not independent labels or truth verification; unsupported means absent from bounded citations. Briefs/triage/rejected attempts remain outside this story-field audit; no production guard/prompt/cache/edition changes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 95 isolated tests; `pnpm build`, `pnpm evaluate:editorial`, `pnpm evaluate:support`, `pnpm evaluate:recorded-support` passed (existing upstream Zod build warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live passes: 726 real stored URLs, four topics, seventeen healthy sources. No source configuration changes.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile digest visually inspected.
- No inference spending; day/month actual $0.408415, zero reservations/provider errors, $0.482758 daily/$14 monthly caps. Provider/models/billing unchanged.
- Updated TASKS/docs/RANKING; no owner blockers. Next: retained briefs, independently reviewed support labels and rejected negative claims; later dates/Gaming, scheduled batches and cross-process cache coordination remain open. M3 unfinished.

## 2026-11-02: iteration 87 — start free X citation harvesting

- Started clean on main; no leftover work. API/worker/health and live source/run smoke healthy. New STEERING 5/6 closes audit work, prioritizes Social posts and defers YouTube; TASKS updated.
- Feed HTML/Atom content/RSS content:encoded and HN destination/text now yield bounded, exact-host X/Twitter links before excerpt truncation. Dedupe IDs without numeric precision loss; no X fetches or provider changes.
- Migration 016 persists citing article/source, canonical post URL, citing engagement and first/last seen atomically with ingestion; repeated observations update without duplicating. Citations remain unverified discovery evidence.
- Offline tests cover hostile hosts, malformed paths, ID dedupe/bounds and embedded links beyond excerpts; isolated Postgres checks citation persistence/idempotency and citing metrics.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 97 isolated tests; `pnpm build` passed. Earlier check caught docs edited during formatting; final rerun green.
- `pnpm migrate` applied additive 016; restarted API/worker. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live runs: 779 article URLs, four topics, seventeen healthy sources.
- Live SQL: 72 citations / 68 distinct X IDs / seven publisher sources. No claim of verified X content, post time, engagement or virality; no harvested World citations yet.
- `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` passed desktop/mobile; screenshots refreshed. `/healthz` healthy.
- Incremental inference $0; actual day/month $0.408415, no reservations/provider errors. No operational blockers; installed xAI key remains for direct capped layer 2 after free discovery.
- Next: official embed verification/rendering and SocialPost storage/window metadata; widen free discovery, then ranked immutable post sections and capped direct xAI. No further audit variants unless real summaries fail.

## 2026-11-02: iteration 88 — verify official X embeds before publication

- Started clean on main; no leftover work. API/worker/health and seventeen sources healthy; retained digest runs completed, historical ingestion failure has later successes.
- Added official oEmbed verification port with exact post-ID/provider/author validation and rejected active HTML; provenance HTML is never injected. Public ingestion facade preserves context boundaries.
- Additive migration 017 stores verified SocialPost records separately from citations and tracks failed checks with a one-day cooldown. Unknown post timestamps/engagement remain null/empty; no inferred virality/window eligibility.
- Explicit `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts` checks at most ten IDs, stops on HTTP errors and uses shared rate limiting/redirects. Live endpoint returned HTTP 404; zero verified posts, no workaround or inference. Initial run stopped after repeated failures; revised run stopped at first 404.
- Synthetic protocol fixtures cover successful verification, unsafe/mismatched/unavailable embeds and isolated Postgres idempotency; fixtures are not live posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass typecheck/lint/format/boundaries and 99 isolated tests; `pnpm build` passes. `pnpm migrate` applied 017.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live queued passes: 779 real article URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed.
- Incremental inference $0; actual day/month $0.408415, zero reservations/provider errors. Provider/models/billing unchanged. Updated TASKS/docs/SOURCES; no owner action needed.
- Next: expand free discovery and investigate official embed availability with valid discovered URLs; immutable post selections/lazy widget rendering, Reddit and capped direct xAI remain unfinished.

## 2026-11-02: iteration 89 — free river discovery and working official X verification

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained run smoke healthy; no triage regression.
- Added data-configured Techmeme/Memeorandum public river harvesting through shared HTTP, separate provenance/count/error storage and candidate union; explicit command only, not scheduled. Migration 018 applied.
- Live harvest stored 50 Techmeme X references (cap); Memeorandum returned zero. Both RSS feeds accessible but yielded no status URLs. Reddit NBA top JSON returned 403; no workaround.
- Found previous verification defect: official oEmbed returns 404 for /i/web/status/ID but 200 for the same named /handle/status/ID. Preserve named URLs through harvesting/persistence and accept official X branding alongside Twitter.
- Ten real posts now verified/stored; timestamps/metrics remain unknown, no digest selections published. River crypto/promo candidates require relevance filtering. No independent-source/virality claims.
- Added recorded river excerpt replay and isolated DB idempotency/cooldown/recovery checks, named URL preservation and provider-branding/invalid-URL regressions. Earlier checks exposed partial-HTML formatter rejection; raw excerpts now .txt, final checks green.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 101 isolated tests; `pnpm build` passed.
- `pnpm exec tsx apps/api/scripts/harvest-social-rivers.ts`, `verify-x-embeds.ts` and `smoke-ingestion.ts` passed final live checks: 783 real article URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; status screenshots refreshed.
- No inference spending; actual day/month $0.408415, no reservations/provider errors; provider/models/billing unchanged. Updated TASKS/README/docs/SOURCES; no owner blocker.
- Next: window metadata, relevance filtering, immutable post selection/lazy official widgets; scheduled harvesting, Reddit and capped direct xAI remain open.

## 2026-11-02: iteration 90 — date verified X posts for coverage windows

- Started clean on main; no leftover work. API/worker/health healthy; retained digest runs and source telemetry passed status smoke.
- Decode modern verified X Snowflake IDs with BigInt into millisecond publication time. Legacy/transition-era, malformed, oversized and future IDs remain undated; citation dates and engagement never become post metadata.
- Explicit embed verifier backfills missing timestamps on already verified posts without HTTP; repeated backfills are idempotent and embed refreshes cannot erase known times with null.
- Live repository backfill dated all ten verified posts, 2026-11-01 03:04:31.487Z–06:46:05.919Z; no inference or external requests for this backfill. No migration needed.
- Added offline precision/future/legacy regressions and isolated Postgres backfill/evidence-preservation/upsert checks; synthetic fixtures are not live content.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 103 isolated tests; `pnpm build` passed.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued passes: 786 real article URLs, four topics, seventeen healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed. Updated TASKS/docs/SOURCES.
- No inference spending or provider/model/billing changes; no new owner blockers. Reddit's previously observed 403 remains unresolved without workarounds.
- Next: topical/crypto filtering, window-aware immutable selections and lazy official widgets; posts remain absent from digests. Scheduled harvesting and capped direct xAI remain open.

## 2026-11-02: iteration 91 — screen verified social posts by evidence and window

- Started clean on main; no leftover work. API/worker/health, source telemetry and retained digest runs healthy; no triage repair needed.
- Added read-only topic-scoped verified-post reader and `screen-social-posts.ts START_ISO END_ISO` (default last 24h); no HTTP, inference, publication or schedule changes.
- Extract only one unambiguous official embed paragraph; ignore author/footer/HTML attributes/URL targets. Normalize whole phrases against saved topic rules, fail closed without positive rules, reject crypto/bait and apply exact half-open post-time windows.
- This is conservative lexical eligibility, not semantic relevance, interestingness or virality. No filler or posts published; immutable selection/official widgets remain next.
- Explicit `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: ten more official requests succeeded, twenty real verified posts stored. Daily Nov 1 UTC screen passes zero; Oct 26–Nov 2 screen passes three NBA posts. Tech exclusions/misses documented in docs/SOURCES.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 106 isolated tests, including paragraph/window/quality regressions and topic-reader persistence tests; `pnpm build` passed (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 786 real article URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` passed desktop/mobile; screenshots refreshed.
- No inference spending or provider/model/billing changes. Updated TASKS/README/docs/SOURCES; no owner blockers. Reddit remains 403; relevant discovery, immutable selections/widgets and scheduled free harvesting remain unfinished.

## 2026-11-02: iteration 92 — freeze preliminary post selections in editions

- Started clean on main; no leftover work. API/worker and `/healthz` healthy; no triage repair needed.
- New manual/scheduled editions copy verified, topic-scoped post metadata/text/metrics/reasons in the publication transaction; saved budgets, half-open windows, topic/quality screening and normalized-text dedupe apply.
- Selection method `verified-lexical-recency-v1` is newest-first and bounded to 500 candidates; no inferred virality, independent-source bonuses or AI claims. Raw HTML excluded; historical snapshots unchanged.
- Read-only `screen-social-posts.ts` now reports exact selections: live Oct 26–Nov 2 UTC selects three NBA posts, zero for other topics. No live edition generated for verification; UI post rendering remains pending.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and 107 isolated tests; `pnpm build` passed (existing upstream Zod warnings). First check caught a concurrently edited unformatted diagnostic; final full rerun green.
- Isolated publication regression covers budgets zero/one, scope, quality/window exclusions, repeated-text dedupe, refresh preservation, immutable scheduled retry and regeneration. No external calls in tests.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live queued passes: 788 real article URLs, four topics, seventeen healthy sources. Daily Nov 1 UTC post selection stays empty.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` passed desktop/mobile; screenshots refreshed.
- No inference spending or provider/model/billing changes. Updated TASKS/docs/SOURCES; no owner blocker. Next: lazy official widgets and broader relevant discovery; Reddit remains 403.

## 2026-11-02: iteration 93 — show selected posts with lazy official X widgets

- Started clean on main; no leftover work. API/worker/health and source/run telemetry healthy; no triage repair needed.
- Digest topics now show separate Top posts sections with preliminary-selection labels, author/time/original links, available saved metrics and selection evidence. Historical snapshots without posts remain unchanged.
- Load one official widgets.js only near the viewport; createTweet uses exact saved IDs with media/DNT. Never inject stored HTML; blocked/unavailable widgets retain saved text and links.
- Read-only Oct 26–Nov 2 replay uses three real NBA selections; no verification edition published and latest AI edition untouched. Current daily post selection remains empty.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 107 isolated tests pass; `pnpm build` passes (existing Zod annotation warnings).
- `pnpm exec tsx scripts/smoke-posts.ts /tmp/iteration93-posts.jsonl` passes desktop/mobile lazy loading, single script, exact IDs, blocked-script fallback and overflow/page-error checks with a protocol stub.
- Explicit `POST_EMBED_LIVE=1` checks render official video thumbnails on desktop/mobile; screenshots saved and mobile inspected. Multi-post checks expose intermittent X-script errors; saved text stays accessible even after embed success. Initial UI smoke raced restart; rerun passed.
- `smoke-ingestion.ts` passes two queued live runs: 788 real article URLs, four topics, seventeen healthy sources. `smoke-ui.ts`/`smoke-status.ts` pass desktop/mobile; API/worker restarted, `/healthz` healthy.
- No inference spending or provider/model/billing changes. Updated TASKS/README/docs/SOURCES; Reddit remains 403. Next: scheduled free harvesting and broader relevant discovery, then capped direct xAI and social editing.

## 2026-11-02: iteration 94 — schedule free social discovery and verification

- Started clean on main; no leftover work. API/worker/health healthy; retained scheduled digest runs completed and seventeen sources returned data.
- Added hourly `social-collection` BullMQ scheduler/worker using the existing shared HTTP client; enabled rivers only, single concurrency, one attempt and bounded retained jobs.
- Collection uses explicit domain ports; river failures persist sanitized source errors and allow other rivers, while database failures fail the job. At most ten official embed checks per pass, persisted one-day cooldown and stop on first embed failure.
- Status now reports social queue health/counts/next run. First actual scheduled pass completed: two rivers, 50 citations, ten verified posts, zero discovery/verification errors; next hourly job retained. No inference calls or new digest generated.
- Added offline orchestration regression for river failure isolation, verification limits, named URLs, persistence and stop-on-error; existing isolated DB tests cover cooldown/idempotence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass typecheck/lint/format/boundaries and all 108 isolated tests; final repeated check green. `pnpm build` passed (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two live queued passes: 788 real article URLs, four topics, seventeen healthy sources.
- `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` passed desktop/mobile; status screenshots refreshed and mobile inspected. Correct `/api/status` confirms one social worker/completed run and next run; exploratory `/api/operations/status` was 404.
- Updated TASKS/README/docs/SOURCES. No inference spending or provider/model/billing changes; no new owner blockers. Reddit remains blocked by 403; broaden relevant discovery across topics next, then direct capped xAI and social editing.

## 2026-11-02: iteration 95 — share bounded social verification across topics

- Started clean on main; no leftover work. API/worker/health, retained digest runs and seventeen article sources healthy; no triage repair needed.
- Embed candidates now require an enabled connected topic; interleave topic ranks, dedupe shared IDs and prioritize unverified discoveries before stored-post refreshes. Existing caps/cooldown remain; citation breadth is not independence or virality.
- Added isolated DB regression for busy/quiet topics, shared IDs, refresh priority, cooldown expiry and disabled/deleted topic exclusion; synthetic fixtures never enter production.
- Explicit `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: four verified, then stopped on official HTTP 404 (five requests). Stored topic coverage: 21 Tech, 12 NBA, one Gaming, zero World; Gaming post is outside checked window.
- Read-only `screen-social-posts.ts 2026-10-26T00:00:00Z 2026-11-02T06:00:00Z` selects five NBA posts, zero elsewhere. No edition published; current discovery breadth remains unfinished.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass typecheck/lint/format/boundaries and 109 isolated tests; `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `smoke-ingestion.ts` passes two queued live runs: 792 real URLs, four topics, seventeen healthy sources.
- `smoke-status.ts`, `smoke-ui.ts`, `smoke-posts.ts /tmp/iteration95-posts.jsonl` pass desktop/mobile; refreshed screenshots and inspected mobile fallback. Post checks replay real stored selections with stubbed/blocked widgets, not a published edition.
- No inference spending; provider/models/billing unchanged. Updated TASKS/docs/SOURCES; no owner blocker. Next: recent relevant World/Gaming discovery, then capped direct xAI/social editing. Reddit remains previously blocked by 403.

## 2026-11-02: iteration 96 — bounded publisher-page X discovery

- Started clean on main; no leftover work. API/worker/health healthy, retained digest runs completed and all seventeen feeds returned content.
- Added explicit `harvest-article-x-links.ts`: at most eight recent articles interleaved across enabled topics, exact opted-in publisher hosts, shared safe HTTP, stop failed hosts per pass; no recursive crawling or inference.
- Migration 019 adds host opt-ins and persisted page checks (seven-day success/one-day error cooldown). Validated citations reuse item/source provenance and named URLs; full pages are not stored, existing verification/selection unchanged.
- Live command read six pages, observed one already-stored ESPNNBA citation from Yahoo, and recorded one unavailable PC Gamer page (remaining same-host page skipped). Guardian/Ars pages yielded no links; no broader coverage or newly published edition claimed.
- Added recorded Yahoo anchor replay and isolated DB/application checks for caps, exact hosts, failure isolation, persistence errors, idempotence, provenance, topic state, age filtering and cooldown/recovery. Fixtures remain offline only.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` passed types/lint/format/boundaries and all 112 isolated tests; `pnpm build` passed (existing upstream Zod warnings). An earlier format check overlapped test edits; final full checks green.
- Restarted API/worker; `/healthz` healthy. `smoke-ingestion.ts` passed two live queued runs: 792 real URLs, four topics, seventeen healthy sources. Retained digest runs completed; next scheduled edition unchanged.
- `smoke-ui.ts` and `smoke-status.ts` passed desktop/mobile; screenshots refreshed and mobile status inspected. Updated TASKS/README/docs/SOURCES.
- No inference spending; actual day/month $0.408415, no reservations/provider errors. Provider/models/billing unchanged; no new owner blocker. Reddit remains previously blocked by 403.
- Next: broaden current World/Gaming discoveries, evaluate article-pass scheduling; direct capped xAI and social editing remain unfinished.

## 2026-11-02: iteration 97 — hourly publisher-page social harvesting

- Started clean on main; no leftover work. API/worker/health, seventeen feeds and retained digest runs healthy; no triage repair needed.
- Hourly social collection now harvests opted-in publisher pages after rivers and before official verification. Existing eight-page cap, host validation, topic interleaving, persisted cooldowns and failed-host stop retained; no retries/inference added.
- Completed jobs retain separate page counters. Added explicit `pnpm exec tsx apps/api/scripts/smoke-social.ts`; real queued job 8: two rivers/50 references, six pages/five citations/one page error, ten verified embeds/no verification errors. Citations are not necessarily new posts.
- Offline collection regression proves publisher failure isolation, harvest-before-verification ordering and retained embed limits/stop behavior; existing DB tests cover cooldown/provenance. Fixtures never enter live storage.
- `screen-social-posts.ts 2026-10-26T00:00:00Z 2026-11-02T06:00:00Z`: five NBA, one Gaming, zero Tech/World. Gaming is an Oct 28 costume screenshot matching `game`, not a demonstrated editorial/viral pick. No edition published.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and all 112 isolated tests; `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 792 real URLs, four topics, seventeen healthy sources. API/worker rebuilt/restarted; `/healthz` healthy.
- `pnpm exec tsx scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, `scripts/smoke-posts.ts /tmp/iteration97-posts.jsonl` pass desktop/mobile; refreshed status screenshots and inspected mobile. Posts replay uses stored candidates and stubbed/blocked widgets, not a published edition.
- Updated TASKS/README/docs/SOURCES. No inference spending; day/month remains $0.408415 with no reservations/provider errors. Provider/models/billing unchanged; no new owner blocker.
- Next: broaden World/relevant Gaming discovery, direct capped xAI, then social editorial selection. Reddit remains previously blocked by 403 without workarounds.

## 2026-11-02: iteration 98 — broaden and rotate publisher social discovery

- Started clean on main; no leftover work. API/worker/health, seventeen feeds and retained digest runs healthy; no triage repair needed.
- Migration 020 opts in BBC, NPR, GamesIndustry, Rock Paper Shotgun, PlayStation and Xbox exact hosts. Explicit shared-client probe read eighteen recent pages: five PlayStation costume citations, seventeen empty pages; probes did not insert posts.
- Page candidates rotate publishers within each enabled topic before topic interleaving and eight-page cap. Existing article age, dedupe, cooldowns, exact-host checks and failed-host stop retained.
- Extended isolated DB regression proves a quiet publisher gets a slot ahead of nine newer busy-publisher articles; fixtures stay offline.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and all 112 isolated tests; `pnpm build` passed (existing upstream Zod warnings). `pnpm migrate` applied 020; restarted API/worker and `/healthz` healthy.
- `pnpm exec tsx apps/api/scripts/smoke-social.ts`: live queued job 11, two rivers/50 references, seven pages/three citation observations/one unavailable PC Gamer page, ten verified embeds/no verification errors. Counts need not be new posts.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 794 real URLs, four topics, seventeen healthy sources.
- `screen-social-posts.ts 2026-10-26T00:00:00Z 2026-11-02T06:30:00Z`: two Tech, five NBA, one Gaming, zero World. Gaming remains earlier costume screenshot; no editorial/virality claim or edition published.
- `pnpm exec tsx scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, `scripts/smoke-posts.ts /tmp/iteration98-posts.jsonl` passed desktop/mobile; refreshed screenshots and inspected mobile status. Posts replay uses stored selections and stubbed/blocked widgets.
- Updated TASKS/docs/SOURCES. No inference spending; provider/models/billing unchanged. No new owner blockers; Reddit remains previously blocked by 403. Next: direct capped xAI discovery, then social editorial selection.

## 2026-11-02: iteration 99 — persistent X-discovery budget and visible caps

- Started clean on main; no leftover work. API/worker/health, seventeen feeds and retained digest runs healthy; no triage repair needed.
- Migration 021 adds separate `purpose=x-discovery` call ledger and durable prepaid-depletion block. Serialized reservations enforce $0.40/day/$12/month admission; pending/uncertain calls remain charged across periods, definitive unbilled rejections release funds.
- Settlement records tokens/all fetched posts/profiles and rounded microdollar cost. Actual estimate overruns are recorded in full/flagged; depleted credits block across restarts/months until explicit review. Price is supplied explicitly; paid transport/account data remain unfinished.
- Added Status/API X usage panel and read-only `pnpm exec tsx apps/api/scripts/x-discovery-status.ts`; live ledger is zero spend/reservations, $0.40 available. Isolated test runner also clears XAI_API_KEY.
- Reviewed official xAI search/tool docs: `max_turns` limits rounds, not individual calls/items. Reservations cannot impose a provider request-dollar ceiling; transport must address this exposure before scheduling. No paid call or model/provider/billing change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 114 isolated tests; `pnpm build` passes (existing upstream Zod annotation warnings). Regression covers concurrent reservations, separate caps, settlement/overruns, uncertainty, rollover and durable depletion.
- `pnpm migrate` applied 021; restarted API/worker, `/healthz` healthy. `smoke-status.ts` and `smoke-ui.ts` passed desktop/mobile, including synthetic credit-block rendering; screenshots refreshed and new mobile X budget screenshot inspected.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passed two queued live runs: 795 URLs, four topics, seventeen healthy sources. `smoke-social.ts` job 14: two rivers/50 references, seven pages/three citations/one page error, ten verified embeds/no verification errors.
- Read-only Oct 26–Nov 2 06:30 UTC social screen retained; no edition published. Updated TASKS/README/docs/SOURCES and removed obsolete gateway guidance from NEEDS_FROM_HUMAN.
- No inference spending; Anthropic day/month stays $0.408415, X ledger zero. No new owner blocker. Next: direct xAI transport with measured conservative reservations, then social editorial selection. World absent, Gaming weak; Reddit remains blocked.

## 2026-11-02: iteration 100 — explicit direct X search and saved account seeds

- Started clean on main; no leftover work. API/worker/health, seventeen feeds and retained digest runs healthy; no triage repair needed.
- Added direct Grok 4.3 adapter and dry-run-by-default `discover-x.ts TOPIC_ID FROM_DATE TO_DATE`; one round, saved handles, date-only UTC bounds, no parallel calls/media/retries/redirects/gateway. No paid scheduler or inference call.
- Migration 022 seeds curated accounts only for empty lists and stores separate call/topic citation provenance. Only completed API citation annotations enter existing official verification/selection; prose URLs/metrics are ignored. Citations alone never become verified posts.
- Reserve full $0.40 daily allowance before HTTP; settle fetched posts/profiles and tokens before citation writes. Missing usage/ambiguous errors retain uncertainty; explicit depleted credits block durably. Reservation/output limits cannot guarantee request-dollar cost; live measurement remains next.
- Offline synthetic protocol and isolated Postgres regressions cover request restrictions, sanitization, no retries, missing usage, billing-before-persistence, long-context rates, dedupe, topic deletion and verification eligibility. Synthetic examples are not live recordings.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 118 isolated tests; `pnpm build` passed (existing upstream Zod warnings). Initial lint caught unsafe test body stringification; corrected before final checks.
- `pnpm migrate` applied 022; World dry-run command passed with saved handles and zero spend/reservations. API/worker rebuilt/restarted; `/healthz` healthy. Anthropic day/month remains $0.408415; X ledger zero.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 800 URLs, four topics, seventeen healthy sources. `smoke-social.ts` job 18: two rivers/50 references, seven pages/two citation observations/one page error, one verified embed then stop on one unavailable embed.
- Corrected stale Status/topic/schedule wording. `smoke-status.ts`, `smoke-ui.ts` and read-only Playwright topic/schedule checks pass desktop/mobile; refreshed screenshots. No edition published; retained scheduled runs completed, next slot unchanged.
- Updated TASKS/README/docs/SOURCES. No new owner blocker or billing/model/provider configuration change. Next: measure direct X search cost/quality before scheduling, then social editorial selection; World coverage absent, Gaming weak, Reddit remains blocked.

## 2026-11-02: iteration 101 — measure direct X discovery cost and verification yield

- Started clean on main; no leftover work. API/worker/health, seventeen feeds and retained digest runs healthy; no triage repair needed.
- One explicit World Grok 4.3 search (Nov 1–2 UTC, nine saved accounts) settled $0.023382: 5,771 input/2,467 output tokens, two posts fetched, zero profiles. No retry, second paid call, scheduling or configuration change.
- Two real citation IDs persisted, neither with author-qualified URLs. Official verifier stored two unrelated posts then stopped on HTTP 404; bounded call-specific check also stopped unavailable. Both paid citations have failed checks, zero verified SocialPosts; World daily selection remains empty. No edition published or quality/virality claim.
- Added read-only `pnpm exec tsx apps/api/scripts/report-x-discovery.ts`: latest twenty calls, cost/fetched counts, named citations and current verification yield; live report confirms $0.023382, two citations, zero named/verified and no reservation. Initial query used wrong check column; corrected and rerun successfully.
- Corrected Status wording for measured manual paid search and refreshed/inspected mobile X budget screenshot. Updated TASKS/README/docs/SOURCES; keep full-day reservation and paid scheduling off pending author-qualified citation recovery.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass typecheck/lint/format/boundaries and all 118 isolated tests; `pnpm build` passes (existing upstream Zod warnings).
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two queued live runs: 805 real article URLs, four topics, seventeen healthy sources.
- `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` pass desktop/mobile with refreshed screenshots; read-only `screen-social-posts.ts 2026-11-01T00:00:00Z 2026-11-02T00:00:00Z` confirms no World picks.
- No Anthropic spend (day/month $0.408415); X day/month $0.023382, zero pending. No owner blocker. Next: recover usable named citations without guessed handles/paid retries, then social editorial selection. Gaming weak; Reddit remains blocked.

## 2026-11-02: iteration 102 — recover ID-only X citations through official embeds

- Started clean on main; no leftover work. API/worker/health and seventeen feeds healthy; no failed retained digest runs reported by status checks.
- Fixed official oEmbed fallback to `twitter.com/i/status/ID`; previous `i/web/status/ID` returned 404. Named discovery URLs, stored canonical URLs and response validation unchanged.
- Explicit free two-ID repair recheck (`pnpm exec tsx apps/api/scripts/iteration102-recover.ts`, temporary script removed) stored both measured World citations as verified BBCWorld posts, then cleared their failed-check state. No guessed handles or paid search; normal cooldown remains unchanged.
- `pnpm exec tsx apps/api/scripts/report-x-discovery.ts`: unchanged $0.023382, two citations/two currently verified posts/zero unavailable checks; original citations remain unnamed. Recorded official BBCWorld response now replays offline in regression tests.
- `screen-social-posts.ts 2026-11-01T00:00:00Z 2026-11-02T06:30:00Z`: World posts fail because no positive topic phrase rules are configured. No edition published or relevance/virality claim; next is semantic social selection with topic description/guidance.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass typecheck/lint/format/boundaries and all 119 isolated tests; `pnpm build` passes (existing upstream Zod warnings).
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two live queued runs: 807 real URLs, four topics, seventeen healthy sources.
- `pnpm exec tsx scripts/smoke-ui.ts`, `scripts/smoke-posts.ts /tmp/iteration102-posts.jsonl` pass desktop/mobile; refreshed foundation screenshots and inspected mobile. Post replay uses saved selections and stubbed/blocked widgets, not a published edition.
- `pnpm exec tsx scripts/smoke-status.ts` passes desktop/mobile; initial invocation incorrectly used apps/api/scripts and was corrected. Updated TASKS/docs/SOURCES; no inference spending or provider/model/billing change.
- No new owner blocker. Keep paid scheduling off/full-day reservation; Gaming remains weak, Reddit blocked. Next: social editorial selection, then another bounded discovery measurement if needed.

## 2026-11-02: iteration 103 — bounded semantic social triage

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; no triage repair needed.
- Added social mode to existing bounded Haiku triage: topic meaning/guidance and interestingness, unknown-virality constraints, separate purpose/per-item caches; article defaults/cache fingerprints preserved.
- Split pre-semantic time/text/quality/explicit-topic exclusion checks from positive phrase fallback. Existing lexical publication behavior unchanged.
- Added cache-only `pnpm exec tsx apps/api/scripts/triage-social-posts.ts 2026-11-01T00:00:00Z 2026-11-02T06:30:00Z`: 25 Tech, 14 NBA, zero Gaming, two World candidates; all unscored, no HTTP/inference/publication. Candidate scope is not editorial relevance.
- Offline tests cover empty-positive-rule World eligibility, retained exclusions/window boundaries, social purpose/instructions/cache invalidation, malformed IDs, repair and budget refusal. Synthetic scores never enter live storage.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and 121 isolated tests; `pnpm build` passes (existing upstream Zod warnings). Fixed initial async-stub lint and cache assertion failures before final checks.
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 808 real URLs, four topics, seventeen healthy sources. Rebuilt/restarted API/worker; `/healthz` healthy.
- `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` pass desktop/mobile; refreshed screenshots and inspected mobile status. Retained digest runs completed, next slot unchanged; no edition published.
- Updated TASKS/README/docs/SOURCES. No inference spend: Anthropic day/month $0.408415; X $0.023382, no reservations/provider errors. Provider/models/billing unchanged; no new owner blocker.
- Next: integrate social triage and Sonnet picks into immutable publication; include direct-search citations currently omitted by `selectTopicPosts` SQL. Keep paid scheduling off; Gaming weak, Reddit blocked.

## 2026-11-02: iteration 104 — repair direct-search publication scope

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; no triage repair needed.
- Fixed edition post selection to include exact-topic `x_search_citations`, matching existing diagnostics. Only verified stored posts can enter; lexical relevance, time/exclusions, budgets and text dedupe remain unchanged.
- Isolated Postgres regression covers direct-search-only publication, unverified IDs, another topic, end boundary, crypto/unrelated text, repeated text/routes, and immutable snapshots/scheduled retries after citation removal. Synthetic fixtures never touch live storage.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 122 isolated tests pass. Initial check caught a test edited during verification; formatted and reran successfully. `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 808 real URLs, four topics, seventeen healthy sources. Rebuilt/restarted API/worker; `/healthz` healthy.
- `report-x-discovery.ts` confirms unchanged $0.023382, two verified World citations/no unavailable checks; cache-only `triage-social-posts.ts 2026-11-01T00:00:00Z 2026-11-02T06:30:00Z` returns 25 Tech/14 NBA/zero Gaming/two World, all unscored. No new edition or inference.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile status. Retained scheduled digest runs completed, next slot unchanged.
- Updated TASKS/docs/SOURCES. No new owner blocker, provider/model/billing change or spending. World lexical publication still rejects empty positive rules; next integrate semantic triage/Sonnet post picks. Paid scheduling stays off; Gaming weak, Reddit blocked.
