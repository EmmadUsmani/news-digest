# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

Earlier iterations 61–72: [archive](docs/progress-archive/2026-11-02-iterations-61-72.md).

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

## 2026-11-02: iteration 105 — bounded social final-pick editor

- Started clean on main; no leftover work. API/worker/health, seventeen sources and retained digest runs healthy; no triage repair needed.
- Added standalone social editor: at most ten scored verified-post inputs, supplied-ID selections, context/rationale, quiet windows, original text preserved. Separate social purpose/cache; shared Sonnet reservations and capped Haiku fallback, repair/provider blocks unchanged.
- Shared editorial composition exposes social triage/editor. Publication is deliberately still lexical until shortlist orchestration and immutable post-editorial metadata are connected; no claim of live semantic picks.
- Fake-response regressions cover cache reuse, identity, refusal/fallback, unknown/duplicate IDs, forbidden rewrites, field bounds, unsupported absence and invalid inputs; no tests call live inference.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 126 isolated tests pass; `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 817 real URLs, four topics, seventeen healthy sources.
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile status inspected.
- Initial status URL used `/api/operations/status` (404); corrected to `/api/status`. Retained scheduled runs complete; next slot unchanged. No edition published or inference spend.
- Anthropic day/month $0.408415; X $0.023382, no reservations/provider errors. Provider/models/billing unchanged; updated TASKS/docs/SOURCES; no new owner blocker.
- Next: connect social semantic shortlist/final picks to immutable publication, then measure Gaming discovery. Keep paid scheduling off; Gaming weak, Reddit blocked.

## 2026-11-02: iteration 106 — publish semantic social picks in immutable editions

- Started clean on main; no leftover work. API/worker/health and seventeen feeds healthy; retained scheduled digests completed, next slot unchanged. One historical ingestion failure remains retained; all current sources succeed.
- Connected verified source-scoped post candidates, safety exclusions/window/text dedupe, bounded Haiku triage and ten-item semantic shortlist to budgeted final editing in manual/scheduled publication. Incomplete triage/editor refusal retains lexical fallback; quiet AI selections stay empty.
- Snapshots freeze original text, context/rationale, scores, model and selection method; UI labels AI/non-AI posts and displays context. Historical snapshots and scheduled retries remain unchanged.
- Fake-response orchestration and isolated Postgres regressions cover shortlist bounds, fallback, quiet windows, empty-positive-rule recovery and immutable scores/context. No tests call live inference; no real semantic edition or quality claim yet.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 129 isolated tests pass. Initial article fixture lacked post_budget (four failures); corrected. Prettier required a second pass on a changed chain; final checks green.
- `pnpm build` passes (existing upstream Zod warnings). Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 818 real URLs/four topics/seventeen healthy sources.
- `screen-social-posts.ts 2026-10-26T00:00:00Z 2026-11-02T06:30:00Z` plus `POST_EDITORIAL_REPLAY=1 pnpm exec tsx scripts/smoke-posts.ts /tmp/iteration106-posts.jsonl`: desktop/mobile widget-stub/blocked checks pass; saved real posts with explicitly synthetic context, no edition published. Inspected mobile screenshot.
- `pnpm exec tsx scripts/smoke-status.ts` and `scripts/smoke-ui.ts` pass desktop/mobile. Screenshots refreshed; TASKS/README/docs/SOURCES updated, older progress archived.
- No inference/discovery spend or provider/model/billing change: Anthropic day/month $0.408415; X $0.023382, zero reservations/errors. No new owner blocker; Gaming weak, Reddit blocked.
- Next: inspect the first scheduled semantic social edition, then measure relevant Gaming discovery and connect related-story links. Paid X scheduling stays off/full-day reservation retained.

## 2026-11-02: iteration 107 — link posts to selected coverage that cites them

- Started clean on main; no leftover work. API/worker/health and seventeen feeds healthy; retained digest runs complete. First semantic scheduled edition is not due until Nov 2 20:40 UTC; no schedule change or manual edition.
- New immutable snapshots copy selected-story IDs/titles onto posts when stored article citations match the lead, coverage or editor evidence. UI links jump within the edition and say “Coverage citing this post”; this is citation provenance, not semantic same-event matching. Historical snapshots unchanged.
- Isolated Postgres regression verifies lead/coverage/evidence matching, deduplication, missing/unselected relationships, input preservation and copied titles after citation deletion. No external test calls.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 130 isolated tests pass. Initial check caught browser-script formatting edited during verification; formatted and reran successfully. `pnpm build` passes (existing upstream Zod warnings).
- Rebuilt/restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two queued live runs: 819 real URLs/four topics/seventeen healthy sources.
- `screen-social-posts.ts 2026-10-26T00:00:00Z 2026-11-02T06:30:00Z` plus `POST_COVERAGE_REPLAY=1 pnpm exec tsx scripts/smoke-posts.ts /tmp/iteration107-posts.jsonl`: desktop/mobile navigation, widget stub and blocked fallback pass; saved real posts with explicitly synthetic coverage links, not a published edition. Inspected desktop/mobile screenshots.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed. TASKS/docs/SOURCES updated; no new owner blocker.
- No inference/discovery spending or provider/model/billing changes: Anthropic day/month $0.408415; X $0.023382, zero reservations/errors. Paid scheduling remains off. Gaming weak; Reddit blocked.
- Next: inspect first scheduled semantic edition when due, improve Gaming discovery, and add semantic same-event links only with reliable evidence.

## 2026-11-02: iteration 108 — enable free Eurogamer post discovery

- Started clean on main; no leftover work. API/worker/health and seventeen feeds healthy; retained digest runs complete, first semantic slot still Nov 2 20:40 UTC. Historical ingestion failure retained; current sources succeed.
- Migration 023 opts exact-host Eurogamer pages into existing bounded hourly publisher harvesting. Three public-page probes succeeded; bounded explicit harvest stored a named DSDigitalDev game-reveal citation with article provenance. Already verified post dates May 7: no current-window relevance/virality claim.
- `pnpm migrate` applied 023. `pnpm exec tsx apps/api/scripts/smoke-social.ts` job 36: seven pages, zero citations, one unavailable page, ten verified embeds/no verification errors. Separate three-recent-page check found no links; explicit three newest stored-page harvest found one citation. Temporary scripts removed.
- Initial temporary probe required an async wrapper; report query used nonexistent author_name, corrected to author. First workspace check caught the temporary script; removed it and reran all checks successfully.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 130 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 820 real URLs/four topics/seventeen healthy sources. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest inspected.
- Rebuilt/restarted API/worker; `/healthz` healthy. TASKS/docs/SOURCES updated. No edition published or inference/discovery spending; Anthropic $0.408415, X $0.023382, no provider/model/billing changes.
- No new owner blocker. Paid scheduling stays off; remaining daily X allowance cannot cover conservative $0.40 reservation. Reddit blocked; fresh Gaming posts remain weak. Next: inspect scheduled semantic edition when due and widen free relevant Gaming discovery.

## 2026-11-02: iteration 121 — Nintendo Life Gaming coverage

- Started clean on main; no leftover work. API/worker/health, seventeen existing feeds and retained digest runs healthy. First semantic slot remains Nov 2 20:40 UTC; no manual edition.
- Probed IGN RSS (redirect then 403), Nintendo Life RSS (25 real entries), and three Nintendo Life article pages (403). No bypass. No feed X links; page harvesting remains disabled, fresh Gaming social gap remains.
- Migration 024 connects Nintendo Life RSS to the original Gaming topic; recorded two entries and offline assertions for decoded titles, dates, publisher URLs/plain excerpts. Fixtures never counted as live.
- `pnpm migrate` applied 024; `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and all 131 isolated tests. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` passes two queued live runs: 899 real URLs/four topics/eighteen healthy sources, including 25 Nintendo Life articles.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile digest inspected. Historical editions remain intact.
- Updated TASKS/docs/SOURCES. No inference/discovery spend, edition publication, provider/model/billing change or new owner blocker. Anthropic $0.408415; X $0.023382, paid scheduling stays off.
- Next: observe 20:40 UTC semantic social edition; widen legitimate free Gaming post discovery. Reddit remains blocked.

## 2026-11-02: iteration 122 — Game Developer and VGC Gaming coverage

- Started clean on main; no leftover work. API/worker/health, eighteen feeds and retained digest runs healthy; semantic social slot remains Nov 2 20:40 UTC.
- Public Game Developer/VGC RSS probes succeeded (50/10 entries). Six article-page probes returned 403; no bypass or page-harvesting opt-in. Neither feed contains X status links; fresh Gaming social gap remains.
- Migration 025 connects both feeds to original Gaming topic. Recorded two entries each; extended offline normalization regression. Fixtures never count as live.
- `pnpm migrate` applied 025; `pnpm format`, `pnpm lint:fix`, `pnpm check` pass types/lint/format/boundaries and all 131 isolated tests. `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 960 real stored URLs/four topics/twenty healthy sources, 60 articles from new sources, idempotent second pass.
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile status.
- Updated TASKS/docs/SOURCES. No edition published, inference/discovery spending, provider/model/billing change or new owner blocker. Anthropic $0.408415; X $0.023382; paid scheduling stays off.
- Next: inspect scheduled semantic social edition when due; widen legitimate free Gaming post discovery. Reddit and these publisher pages remain blocked.

## 2026-11-02: iteration 123 — free Gaming X discovery from publisher RSS

- Started clean on main; no leftover work. API/worker/health, twenty feeds and retained digest runs healthy; next semantic slot Nov 2 20:40 UTC.
- Migration 026 connects GamingBolt + Push Square RSS to original Gaming topic. Existing ingestion stores 35 real articles and three X citations with publisher provenance; no page crawling or paid calls.
- `pnpm migrate`; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 997 URLs/four topics/22 healthy sources. `verify-x-embeds.ts`: two newly verified/no failures; all three cited posts have stored official embeds.
- Current Phantom Blade Zero post is dated Nov 2 02:02 UTC. FromSoftware support and Shiina citations date Oct 30/Nov 1; article recency does not refresh posts. Last-24h `screen-social-posts.ts` rejects Phantom Blade Zero on lexical phrase rules; scheduled semantic selection remains unverified.
- Recorded two entries each; regression asserts exact X IDs from encoded content/descriptions. Initial suite caught XML recorder namespace renaming; preserved original XML instead. Initial diagnostic queried nonexistent last_error; corrected read-only query.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 132 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, and `scripts/smoke-posts.ts /tmp/iteration123-posts.jsonl` pass desktop/mobile; refreshed screenshots and inspected mobile status. Post replay uses saved candidates with stubbed widgets/blocked fallback, not a new edition.
- Updated TASKS/docs/SOURCES. Gematsu/Destructoid/Siliconera feed probes succeeded but exposed no X links; left unconfigured. Gematsu homepage 403; no bypass.
- No inference/discovery spend, publication, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382. Reddit blocked; paid X scheduling stays off.
- Next: observe 20:40 UTC semantic social edition, especially new Gaming candidate; continue free social discovery and distinguish current posts from old citations.

## 2026-11-02: iteration 124 — GamesRadar+ and GameSpot free X citations

- Started clean on main; no leftover work. API/worker/health, 22 existing sources and retained digest runs healthy; next semantic slot remains Nov 2 20:40 UTC.
- Migration 027 connects public GamesRadar+ and GameSpot RSS to original Gaming topic. Stored 65 real articles and five distinct X citations; four newly verified official embeds/no failures, one already verified.
- Initial GamesRadar `/feeds/all/` collection failed because it redirects through HTTP. Used working final HTTPS `/feeds.xml`; corrected unpublished migration and applied local URL. HTTPS safeguards unchanged; subsequent collection healthy.
- Cited post dates Oct 28–Nov 1 09:39 UTC all miss checked Nov 1 10:20–Nov 2 10:20 UTC window. Free discovery route improved; no fresh-pick/virality claim. Shacknews/DualShockers feed probes 200/no X links; unconfigured.
- Recorded two original entries/feed; offline regression asserts exact citation IDs, dates, hosts and bounded excerpts. Fixtures are not live evidence.
- `pnpm migrate`; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,063 stored URLs/four topics/24 healthy sources, idempotent second pass. `verify-x-embeds.ts` and read-only `screen-social-posts.ts` complete without inference.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 133 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Rebuilt/restarted API/worker; `/healthz` healthy after startup retry. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile status inspected.
- TASKS/docs/SOURCES updated. No edition published, inference/discovery spend, provider/model/billing change or new owner blocker. Anthropic $0.408415; X $0.023382; zero reservations/errors.
- Next: inspect 20:40 UTC semantic edition, especially Phantom Blade Zero; fresh Gaming gap and Reddit block remain. Keep paid X scheduling off.

## 2026-11-02: iteration 125 — configurable topic X account lists

- Started clean on main; no leftover work. API/worker/health, 24 sources and retained digest runs healthy; next semantic slot remains Nov 2 20:40 UTC. Two old ingestion failures retained, current collections succeed.
- Topic create/edit UI and API now save up to 20 unique valid X handles. UI accepts an initial @; API rejects duplicate handles ignoring case. Omitted accounts preserve existing lists; explicit empty lists clear them. Direct discovery already reads this data; paid scheduling stays off.
- Corrected outdated topic-settings copy about AI selection and news queries. No migration or changes to original topic lists.
- Isolated Postgres regression covers validation, creation, update, clear, backward-compatible omission and direct-search repository parity. No external test calls.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 134 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two live queued passes, 1,064 URLs/four topics/24 healthy sources. Rebuilt/restarted API/worker; `/healthz` healthy.
- `pnpm exec tsx scripts/smoke-topic-accounts.ts`: desktop/mobile save/reload, @ normalization, duplicate UI/API rejection and unchanged latest edition pass; temporary disabled topic deleted. Initial exact-label selector timed out on prefilled textarea text; corrected to accessible textbox selector and reran successfully.
- `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile. Refreshed screenshots and inspected mobile account form. TASKS/docs/SOURCES updated.
- No publication, inference/discovery spend, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382; zero reservations/errors. Reddit blocked; fresh Gaming coverage incomplete.
- Next: inspect scheduled 20:40 UTC semantic social edition and continue legitimate free discovery; keep full-day X reservation and paid scheduling off.

## 2026-11-02: iteration 126 — Hoops Rumors free NBA X discovery

- Started clean on main; no leftover work. API/worker/health, 24 sources and retained digest runs healthy; next semantic edition remains Nov 2 20:40 UTC. Two historical ingestion failures retained, current collection succeeds.
- Migration 028 connects Hoops Rumors public RSS to original NBA topic. `pnpm migrate`; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,081 real URLs/four topics/25 healthy sources; 15 new-source articles and 21 distinct X citations.
- `verify-x-embeds.ts` overlapping pass verified one candidate, post-ingestion bounded pass verified ten/no failures. Thirteen Hoops Rumors citations have official embeds; twelve in checked day. `screen-social-posts.ts` accepts NBA Communications/Hornets PR; existing newer NBA candidates fill fallback slots. No semantic/virality claim.
- Recorded two original feed entries with six exact X IDs, preserved namespaces and date/host/byline/excerpt regressions. Fixture content never counted as live. BasketNews/NBC probes returned non-feed responses; unconfigured, no bypass.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 135 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, and `scripts/smoke-posts.ts /tmp/iteration126-posts.jsonl` pass desktop/mobile; refreshed screenshots and inspected mobile post fallback. Replay uses saved real candidates/stubbed widgets, no new edition.
- Probe initially parsed detached XML without namespaces; switched to whole-document parsing. Local psql unavailable; read-only diagnostics used existing DB module. Initial operations URL 404 corrected to `/api/status`.
- TASKS/docs/SOURCES updated. No inference/discovery spend, publication, provider/model/billing change or new owner blocker. Anthropic $0.408415; X $0.023382; paid scheduling remains off.
- Next: inspect 20:40 UTC semantic social edition, especially Gaming; Reddit blocked and fresh Gaming coverage incomplete.
