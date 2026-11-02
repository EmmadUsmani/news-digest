# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

Earlier bootstrap and iterations 7–16: [archive](docs/progress-archive/2026-11-01-iterations-7-16.md).

Earlier iterations 17–22: [archive](docs/progress-archive/2026-11-01-iterations-17-22.md).

Earlier iterations 23–37: [archive](docs/progress-archive/2026-11-01-iterations-23-37.md).

Earlier iterations 51–60: [archive](docs/progress-archive/2026-11-01-iterations-51-60.md).

Earlier iterations 61–72: [archive](docs/progress-archive/2026-11-02-iterations-61-72.md).

Earlier iterations 87–100: [archive](docs/progress-archive/2026-11-02-iterations-87-100.md).

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

## 2026-11-02: iteration 127 — conservative post duplicate correction

- Started clean on main; no leftover work. API/worker/health, 25 feeds and retained digest runs healthy; next semantic slot remains Nov 2 20:40 UTC.
- Corrected post duplicate keys: preserve signed numbers, punctuation and paragraph link targets, avoiding collisions between distinct claims or clips. Matching long captions with an explicit RT prefix share one slot; general same-event/media matching remains unfinished.
- Both lexical and semantic paths apply the correction before budgeting/triage. New method versions v2 distinguish behavior; contracts still accept historical v1 snapshots. Immutable publication/retry regression passes.
- Added synthetic checks for copied reposts, changed numbers/negation/time, different links and HTML entity decoding. Read-only diagnostic: 46 Tech, 70 NBA, 17 Gaming, 3 World verified posts; old/new distinct counts match, no current-content improvement claimed. Temporary script removed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 138 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,084 real URLs/four topics/25 healthy sources; idempotent second pass.
- `screen-social-posts.ts` read-only check; `scripts/smoke-ui.ts`, `scripts/smoke-status.ts`, `scripts/smoke-posts.ts /tmp/iteration127-posts.jsonl` pass desktop/mobile. Screenshots refreshed; mobile fallback inspected. Post replay uses saved real candidates/stubbed widgets, no publication.
- TASKS/docs/SOURCES updated. No inference/discovery spend, publication, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382; paid scheduling stays off.
- Next: inspect 20:40 UTC semantic social edition, especially Gaming; Reddit blocked and fresh Gaming coverage incomplete.

## 2026-11-02: iteration 128 — persist publisher-host discovery cooldown

- Started clean on main; no leftover work. API/worker/health, 25 feeds and retained digest runs healthy; semantic edition still due Nov 2 20:40 UTC.
- Publisher-page candidate queries now pause an exact host for one day after any saved page failure, across jobs/restarts. Previously a later hourly job could try another page on the failed host. Other publishers and RSS remain eligible; no migration required.
- Extended isolated DB regression checks cross-page suppression, unaffected publisher eligibility, expiry and success recovery. No external test requests.
- Public Push Square article probe returned 403; page harvesting stays off. GamingBolt article returned 200 with already-known Phantom Blade Zero citation only; page harvesting remains off pending broader checks. Temporary probe removed after correcting CJS top-level-await and stopping further blocked-host reads.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 138 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,086 real URLs/four topics/25 healthy sources, idempotent repeat.
- `pnpm exec tsx apps/api/scripts/harvest-article-x-links.ts`: eight pages checked, one citation observation, zero errors; no new-post claim. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed and mobile status inspected.
- TASKS/docs/SOURCES updated. No inference/discovery spend, publication, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382. Paid X scheduling stays off.
- Next: inspect 20:40 UTC semantic social edition, especially Gaming; Reddit blocked and fresh Gaming coverage incomplete. GamingBolt public pages merit additional bounded access probes.

## 2026-11-02: iteration 129 — GamingBolt public-page social discovery

- Started clean on main; no leftover work. API/worker/health, 25 feeds and retained digest runs healthy; next semantic edition remains Nov 2 20:40 UTC.
- Six explicit GamingBolt public-page probes succeeded via shared HTTPS client (47–51 KB). One exposed already-known Phantom Blade Zero X citation; five had none. Temporary probe removed; no new-post or virality claim.
- Migration 029 enables exact-host GamingBolt in existing hourly bounded collector, retaining rotation/eight-page cap/page cooldown and persistent failed-host cooldown. `pnpm migrate` applied; read-only DB confirms host and one collected page.
- `pnpm exec tsx apps/api/scripts/harvest-article-x-links.ts`: eight mixed-publisher pages, four citation observations, zero errors. No new-post claim.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and 138 isolated tests pass. Initial check caught documentation edited during verification; formatted and reran successfully. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,087 URLs/four topics/25 healthy sources; idempotent repeat.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile source status.
- TASKS/docs/SOURCES updated. No publication, inference/discovery spend, provider/model/billing change or new owner blocker. Anthropic $0.408415; X $0.023382; paid scheduling remains off.
- Next: inspect 20:40 UTC semantic social edition, especially Gaming; Reddit blocked and fresh Gaming social coverage incomplete. Observe prospective GamingBolt page yield.

## 2026-11-02: iteration 130 — social window readiness and diagnostic parity

- Started clean on main; no leftover work. API/worker/health, 25 sources and retained digest runs healthy; first scheduled semantic edition remains due 20:40 UTC.
- Screening now reports separate verified/safety/lexical counts, safety exclusion reasons and exact bounded semantic candidates while preserving `selected` for existing UI replays.
- Fixed cache-only triage diagnostic drift: reuse publication selector for text/link deduplication, zero post budgets and SQL/candidate caps instead of independent filtering. No production ranking or prompt changes.
- `screen-social-posts.ts` and `triage-social-posts.ts` for Nov 1 20:40–Nov 2 20:40 UTC: semantic pools Tech 9/NBA 26/Gaming 1/World 2; fallback 3/5/0/0. Exact candidate/cache-ID parity passed all four topics; all 38 scores uncached. Future window remains incomplete.
- Gaming has 17 scoped verified posts, 16 outside window; remaining post needs semantic selection. Availability is not relevance or virality. Invalid-window CLI check exits 1 as expected.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 138 isolated tests pass. `pnpm build` and final `pnpm format:check` pass (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued live passes, 1,088 URLs/four topics/25 healthy sources; repeat idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile. No UI changes; smoke screenshots refreshed. Updated README/TASKS/docs/SOURCES; archived iterations 87–100.
- No inference/discovery spend, publication, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382; no reservations/errors. Reddit blocked; paid X scheduling stays off.
- Next: inspect scheduled 20:40 UTC semantic edition; rerun readiness after later collection. Gaming/World fallback gaps remain and GamingBolt yield needs observation.

## 2026-11-02: iteration 131 — Destructoid free Gaming citation feed

- Started clean on main; no leftover work. API/worker/health, all feeds and retained digest runs healthy; first semantic social edition still due 20:40 UTC. Two historical ingestion failures remain, current collection succeeds.
- Migration 030 connects public Destructoid RSS to original Gaming topic. `pnpm migrate`; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 30 new articles, 1,118 total URLs/four topics/26 healthy sources; repeat idempotent.
- Feed exposes one Destiny/Bungie X citation; `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: one verified, zero failures. Its post is outside upcoming daily window; no fresh-window or virality claim.
- Three Destructoid public pages returned 200/no citations, mostly guides; page harvesting stays off. Gematsu article 403 stopped probes; Gematsu/VideoGamer/Siliconera feed checks did not justify configuration. No bypass or paid calls.
- Recorded two original RSS entries with namespaces/encoded content; offline regression asserts exact X identity/URL, dates, authors, hosts and bounded plain excerpts. Fixtures are not live evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 139 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed, mobile status inspected.
- `screen-social-posts.ts 2026-11-01T20:40:00Z 2026-11-02T20:40:00Z`: semantic pools still Tech 9/NBA 26/Gaming 1/World 2. Gaming has 18 scoped verified posts, 17 outside window.
- Updated TASKS/docs/SOURCES. No publication/inference/discovery spend/provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382; no reservations/errors.
- Next: inspect scheduled 20:40 UTC semantic edition; Gaming/World daily fallback gaps and Reddit block remain. Keep paid X scheduling off.

## 2026-11-02: iteration 132 — broader World reporting via Al Jazeera RSS

- Started clean on main; no leftover work. API/worker/health, feeds and retained digest runs healthy; first scheduled semantic social edition still due 20:40 UTC. Historical ingestion failures retained; current collection succeeds.
- Public Al Jazeera RSS returned 25 articles/no X links; three sampled article pages returned 200/no citations. France 24 general RSS returned 24 entries/no citations, three video pages 200/no citations; attempted international feed path 404. No page harvesting configured, bypass or social improvement claimed. Temporary probe removed.
- Migration 031 connects Al Jazeera public general RSS to original World topic; includes some sports/opinion, so collection is not selection. Two original entries recorded for offline headline/date/host/excerpt/absent-metadata checks; fixtures are not live evidence.
- `pnpm migrate`; `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 25 new-source articles, 1,144 URLs/four topics/27 healthy sources; repeat idempotent.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 140 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile Al Jazeera source card.
- Updated TASKS/docs/SOURCES. No publication, inference/discovery spend, provider/model/billing change or new owner blocker: Anthropic $0.408415; X $0.023382; no reservations/errors.
- Next: inspect scheduled 20:40 UTC semantic social edition. Gaming/World social fallback gaps and Reddit block remain; keep paid X scheduling off.

## 2026-11-02: iteration 133 — recover interrupted schedule verification

- Started clean on main; no leftover work. API/worker/health, 27 feeds and digest runs healthy; scheduled semantic edition remains due 20:40 UTC, not yet inspectable.
- Both schedule-changing smoke scripts now save an exclusive mode-600 recovery record before mutation, restore/verify on normal completion and SIGINT/SIGTERM, and refuse to overwrite unresolved recovery state.
- Added `scripts/recover-schedule.ts` for retained records after SIGKILL/VM interruption; failed restoration keeps the record. README documents recovery and concurrent-edit limitations. No live schedule probe or schedule edit performed.
- Isolated fake-HTTP/child-process regression verifies SIGTERM exit 143, exact original restoration, record removal and refusal of a second probe. No live DB or external inference used by test.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 141 isolated tests pass. Initial lint caught unawaited test registration; corrected and full check rerun. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: 1,144 stored URLs/four topics/27 healthy sources, repeated collection idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed status screenshots. No product UI changes.
- No publication, inference/discovery spend, provider/model/billing change or new owner blocker. Gaming/World social gaps and Reddit access remain; paid X scheduling stays off.
- Next: inspect 20:40 UTC scheduled semantic edition when due; continue free social coverage work in the meantime.

## 2026-11-02: iteration 134 — visible free social collection results

- Started clean on main; no leftover work. API/worker/health, 27 feeds and retained digest runs healthy; semantic edition remains due 20:40 UTC.
- Status now exposes up to 20 retained free social runs with validated river/page citation, embed-check and partial-error counters; historical incompatible results show counts unavailable. Separate digest run list and correct next-social-collection label.
- Counts explicitly include refreshes/repeated citations and do not imply new posts, editorial relevance or virality. Latest hourly pass: two rivers, eight pages, one page citation, ten successful embed checks, zero errors.
- Fixed operations telemetry's hardcoded Redis connection to honor the shared configured/test-isolated connection; isolated worker regression verifies valid counters, malformed-result rejection and payload stripping without touching live Redis.
- `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 142 isolated tests pass. `pnpm build` passes (existing upstream Zod warnings).
- Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,144 URLs/four topics/27 healthy sources; repeat idempotent.
- `pnpm exec tsx scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; screenshots refreshed, new mobile social panel inspected. README/TASKS/docs/SOURCES updated.
- No publication, schedule mutation, inference/discovery spend, provider/model/billing change or new owner blocker. Paid X scheduling stays off; Gaming/World social gaps and Reddit block remain.
- Next: inspect scheduled 20:40 UTC semantic edition when due; continue relevant free social coverage.

## 2026-11-02: iteration 135 — Aftermath free Gaming citation feed

- Started clean on main; no leftover work. API/worker/health, current collection and digest runs healthy; two historical ingestion failures retained. First semantic edition remains due 20:40 UTC.
- Migration 032 connects Aftermath public RSS: 15 real articles, three distinct X citations, all three verified via official oEmbed. Reporting/interviews/opinion remain candidates; no page harvesting configured.
- All three cited posts precede upcoming daily window. Read-only `screen-social-posts.ts 2026-11-01T20:40:00Z 2026-11-02T20:40:00Z`: semantic pools 9/26/1/2, lexical selections 3/5/0/0; Gaming 21 scoped verified posts. No fresh-window or virality gain claimed.
- Public AUTOMATON English RSS probe: 30 articles, latest Oct 31, zero feed X links; not connected. Temporary probe removed; no bypass or paid calls.
- Two original Aftermath entries recorded for offline dates/excerpts/exact citations. Initial check caught citation assertion assigned to wrong entry; corrected. `pnpm format`, `pnpm lint:fix`, `pnpm check`: types/lint/format/boundaries and all 143 isolated tests pass.
- `pnpm migrate`, `pnpm build` pass (existing upstream Zod warnings). Restarted API/worker; `/healthz` healthy. `pnpm exec tsx apps/api/scripts/smoke-ingestion.ts`: two queued passes, 1,161 URLs/four topics/28 healthy sources; repeat idempotent.
- `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: three successes/zero failures. `scripts/smoke-ui.ts` and `scripts/smoke-status.ts` pass desktop/mobile; refreshed screenshots and inspected mobile Aftermath card.
- TASKS/docs/SOURCES updated. No publication, schedule mutation, inference/discovery spend or provider/model/billing change. Anthropic $0.408415; X $0.023382; no new owner blocker.
- Next: inspect 20:40 UTC scheduled semantic edition when due. Gaming/World daily social gaps and Reddit block persist; keep paid X scheduling off.
