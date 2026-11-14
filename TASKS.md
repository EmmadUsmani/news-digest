# Tasks

Fix failures first. STEERING Current order wins. Detailed pre-compaction state and completed markers: [iteration 2144 archive](docs/progress-archive/2026-11-13-task-detail-2144.md).

## Open work

- [ ] BREAKAGE (2160): Nov 13 scheduled edition lost 11 candidate-triage calls to local ten-second inference-slot expiry; all stories non-AI, World/U.S. stories withheld. Four dispatched calls succeeded in 16–37 s. Shared four-request pre-reservation admission implemented (2161); five-topic/750-candidate composition and nine-editor/18-call repair ownership pass offline (2162). Saturated cache/deadline composition verified offline (2164): expired queued work creates no hold and slots remain reusable. Deployed API/worker at 16:00 UTC (2165); health/reader/access checks pass. Reader text check now accepts saved topic counts and exposes five empty Tech summaries in Nov 13 (2166). Headline-only fallback repair (2167) filters blank source text before story budgets; AI evidence and saved editions unchanged. Fallback repetition diagnosed (2170): seven Tech/Gaming cards cover three events; incomplete triage bypasses explicit AI grouping. Blank-text repair alone does not restore grouping. Read-only gate now accepts repeated `--require-ai-topic` names for all five sections (2176); Nov 13 Tech correctly fails. Acceptance gate also refuses saved unscored candidates even with AI editing (2219), missing saved AI summaries and reader/editorial story or text mismatches (2266). Next scheduled run must establish recovery, including Tech/Gaming event diversity; no paid replay/cap changes. [Review](docs/edition-reviews/2026-11-13.md).

- [ ] NBA recurrence (2004): saved Sonnet initial/repair and Haiku repair pass full offline validation (2101); malformed Haiku initial ID remains refused. Nov 13 acceptance failed before editing: local triage queue expiry; no story-editor call exercised the validator. Admission fix deployed after the hold (2165); accept the next scheduled NBA section. Read-only `check-scheduled-reader.ts <window-end> --require-ai-topic NBA` now refuses the saved Nov 13 non-AI edition (2169); publication alone is insufficient. No paid replay.

- [ ] Morning edition admission (2026): bounded Sonnet settlement waiting deployed; caps unchanged. Log event-name filtering repaired (2179); message/event queries reconcile all 14 saved admission records. Nov 13: 14 immediate Sonnet admissions, no waits/refusals, $0.236599 settled; natural recovery unobserved. Review the next normal run using the [checklist](docs/plans/sonnet-settlement-admission.md#natural-scheduled-review). Offline gates pass.

- [ ] STEERING 58: security fixes/rehearsals deployed; owner proxy port/email replacement recorded and STEERING 59 closes the proxy block. After normal scheduled publication with NBA AI editing, ack item 58 with edition ID; lead review proceeds in parallel. [Handoff](docs/phase4-security-handoff.md).

- [ ] STEERING 56/57: World/U.S. split deployed; review three consecutive scheduled editions. Nov 12 scope passes, but NBA fallback/admission refusals prevent acceptance. Nov 13 World/U.S. stories withheld after triage queue expiry; no accepted story observation. Effective approved caps AI $20/month/$0.65/day; X $15/month/$0.50/day. [Review](docs/edition-reviews/2026-11-12.md).

- [ ] STEERING 50: public mode OFF, VM private; private accounts accepted. Full public rehearsal complete (2104), Grafana excluded, Spend allowed. After NBA/item 58 scheduled acceptance: refresh [baseline/rollback](docs/public-activation-record.md), enable server/web public mode with sharing private, accept its next scheduled edition, then ack/stop for owner sharing decision. Rollback preparation (2148): private DB snapshot restored in isolation, 39 tables/98,127 rows matched; mode-600 environment copy verified. Refresh these after scheduled acceptance. Follow [readiness](docs/public-readiness.md). No deploy 13:00–16:00 UTC; no generation changes after noon except breakages.

- [ ] Breakage / metrics-store: retain Nov 7 CPU-only 2% trial. Natural compaction confirmed Nov 8; second comparable natural-merge sample needed for recovery acceptance; Nov 14 09:20 passive probe has 24 healthy rules/no new failures; neither storage tier merged, so comparable recovery remains unobserved (2247). No capacity retuning or public Grafana launch work. [Evidence](docs/decisions/0004-observability-capacity.md).

- [ ] STEERING 34: fixed keyword X search ON; semantic dropped, Grok/caps unchanged. Continue daily quality review: [Nov 13 saved-text review](docs/edition-reviews/2026-11-13-x-quality.md) (2163) finds eight of 16 picks in daily-search citations (all outside-list), missing official metrics throughout, overlapping Tech launch coverage and weak teasers. Gaming translation/repetition and Tech overlap fixes await natural acceptance; viral quality unaccepted. World shortlist traced offline (2261): four qualifying X candidates reach the editor; exact cached request reproduces two Iran statements plus Macron, with clipped Ukraine commentary omitted. Review breadth separately from duplicate announcements; no ranking/cap change justified. Tech saved selection traced (2265): 58 scored/five qualifying/three Sonnet picks; recap/Search overlap survives successful social editing, independently of failed story triage. Review social quality separately on the natural run. Do not infer engagement from missing official metrics.

- [ ] STEERING 27 grouping: verify same-event quality on later editions; Nov 5 Tech combined separate developments. Same-story production pass enabled, four-call bound $0.058192. No wording rules. [Review](docs/edition-reviews/2026-11-05.md).

- [ ] STEERING 7 speed: Nov 12 fifth-topic delay diagnosed; isolated staged scheduler demonstrates NBA repair admission risk. Failure draining/cycle controls pass offline; production unchanged. Protected ownership/handoff design follows NBA scheduled acceptance. Targets <60 seconds/current volume and <2 minutes/1,500 unmet. [Evidence](docs/edition-reviews/2026-11-12-social-latency.md).

- [ ] STEERING 16 / M4 Social posts: all-topic presence achieved; viral/outside-list quality remains open. Retain original post/media and official embeds; missing X metrics are unknown.

- [ ] STEERING 9/15 first-week report: Nov 2–8 $1.036785/28 calls/zero holds, 131 new verified candidates/115 outside-list. Novelty/viral-quality acceptance remains open; do not equate outside-list with viral.

- [ ] STEERING 18 Bluesky: collection/session refresh healthy. Repaired U.S. Congress query (2105) now reaches natural selection: Nov 13 511 read/10 shortlisted/two concrete published posts; restored presence accepted, overall quality open. Scheduled U.S. trace (2174): all 50 cached scores reconcile; three RFK candidates become one detailed pick, election adds a distinct event, leadership overlap is omitted; retain Congress query. Free four-query comparison (2181): Senate exposes a first-person leadership announcement but repeats selected X coverage; House repeats the election report/adds foreign-policy scope, broad US politics adds commentary. Retain `Congress`; production unchanged. [Selection evidence](docs/edition-reviews/2026-11-13-us-bluesky.md). [Scheduled review](docs/edition-reviews/2026-11-13.md). [Saved-pool/selection evidence](docs/edition-reviews/2026-11-12-bluesky-pool.md) retains weak World supply, Tech/Gaming overlap and U.S. 55-post reporting baseline. NBA saved-pool trace (2171): 593 observations/54 distinct posts, six of ten shortlisted posts overlap X-covered events; milestone pick fills an empty slot, no X displacement. Media trace (2172): zero safe attached-video posts; sole stored video is an NFT-tagged game chart, correctly excluded. Free four-query comparison (2173): NBA/#NBA/highlights/basketball yield 0/1/0/3 safe videos; broader supply includes off-topic/repeated material. Comparison complete; retain production query until gated trial. [Evidence](docs/edition-reviews/2026-11-13-nba-bluesky.md). World prospective stored supply (2267): 525 observations/56 distinct/26 safe candidates, all within semantic intake; text includes Uganda/Canada/UK leads amid U.S./generic noise. No cap increase justified. [Baseline](docs/edition-reviews/2026-11-14-world-bluesky.md). World 12/6/6 baseline/Ukraine/Gaza discovery pilot is default-off and fully rehearsed offline (2149–2155): 120 daily searches, override/admission/failure/rollover contracts, scheduler configuration and read-only job export; retained 24 baseline passes have shared-retention limits. [Rollout contract and evidence](docs/plans/world-bluesky-discovery.md). Deployment/activation follows NBA/item 58/private public-mode gates; production query unchanged, no paid replay. Tech free four-query comparison (2177): baseline/product-name/demo queries expose commentary, ambiguous names and game promotions; none establishes a better standalone launch/demo query. Retain production query and semantic gates. [Evidence](docs/edition-reviews/2026-11-13-tech-bluesky.md). Gaming comparison (2178): gaming vocabulary adds commentary/old clips; title query repeats the already-selected beta update. Retain `game`. [Evidence](docs/edition-reviews/2026-11-13-gaming-bluesky.md).

- [ ] STEERING 28 incremental triage OFF: reserve-safe pools/cutoffs/draining verified; only 2/65 early fingerprints compatible. Waste/latency unmeasured. [Evidence](docs/edition-reviews/2026-11-05-incremental-admission.md).

- [ ] Tech excerpt evidence (2262): selected prospective HUD fallback retains an older, differently worded Google headline; current feed parses blank but ingestion preserves old nonempty text. Manual single-item control replaces it with ChatGPT Wallet reporting. Two HN URL-only excerpts also count as nonempty, outside top five. Fix provenance after protected edition; do not use blanket fuzzy matching or overwrite reporting with blanks. [Evidence](docs/edition-reviews/2026-11-14-tech-cap.md#residual-headline-evidence--iteration-2262-1230-utc).

- [ ] M5 grouping: Gaming/later-date fallback benchmark added (2192), 200 recorded candidates/one of five labeled events found, guide negatives omitted; ceremony counts once. Label-only grouping comparison (2193) merges up to seven reports but restores no target slots in these four windows; ranking/relevance remain separate gaps. Later Gaming same-story pair evaluation (2194) adds six positive/four negative boundaries, including ceremony versus franchise overlap; historical/paid benchmark unchanged. Later Tech benchmark corrected (2211): deployed fallback excludes 16 blank-text candidates; neither five-slot baseline nor label-grouped control finds a target. Original 2209 general-rank result incorrectly described fallback; Microsoft is slot 18 in the readable pool. Later Tech same-story pairs (2210) add eight positive/five negative boundaries: outage recovery versus separate providers, lawsuit claims, and subsequent executive allegations. Independent labels and semantic grouping evaluation still needed; agent-labelled windows are not general quality estimates. [Evidence](docs/RANKING.md#iteration-2192-later-gaming-window).

- [ ] STEERING 4: fake/replay LlmPort and verification ledger implemented; historical NBA raw-body transport/validation/cache regression (2202) now extends through isolated publication, immutable retrieval, reader projection and public-mode HTTP latest/history/detail reads (2204); Sonnet/Haiku saved repair outputs now pass the same publication/HTTP path (2212); malformed Haiku ID now verifies non-AI source fallback/no cache through the same path (2216), using explicitly synthetic request/serialization; synthetic triage/metadata/zero usage explicit. Automatic Haiku invalid-ID → saved repair now passes real budgeted retry, corrected-only caching, publication and reader HTTP (2232). Repair-admission exhaustion now verifies one dispatch/settlement, no cache and source-only publication/reader HTTP for Haiku and Sonnet (2236, 2248; synthetic mixed-model Sonnet sequence). Real full-edition raw-response golden open. No paid replay or re-recording unchanged prompts. [Database verification](docs/DATABASE-VERIFICATION.md).

- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests without owner re-enabling official API credentials. YouTube deferred; no bypass.

- [ ] STEERING 10 source balance paused under 27: Yardbarker prepared/disabled; no new source without coverage review.

- [ ] STEERING 24/25 background: O1–O10 done except O8 unknown; O11 benchmark deferred. Stop CLI/dashboard refinements. Retain existing limits; Grafana capacity excluded from public launch. [Capacity](docs/decisions/0004-observability-capacity.md).

- [ ] Tech feed evidence depth (2205): explicit RSS/Atom article content now precedes descriptions/summaries with blank fallback, retaining the 1,500-character cap and no-crawl rule. Unchanged recorded Ars fragment supplies 593 characters; metadata, Atom precedence, X citations and isolated repeat-ingestion/enrichment checks cover the change. Natural scheduled summary-depth acceptance remains open. [Evidence](docs/edition-reviews/2026-11-13-tech-feed-depth.md).

- [ ] Gaming same-ceremony repetition (2131): editor v9 guidance verified offline; review natural selection for repeated Resident Evil awards across platforms. [Evidence](docs/edition-reviews/2026-11-12-social-awards.md).

- [ ] World link-list social quality (2132): editor v10 refuses inference from URL slugs alone; offline transport/selection verified. Review next natural picks. [Evidence](docs/edition-reviews/2026-11-12-social-link-list.md).

- [ ] Tech story/post repetition (2134, 2138): bounded selected-story context supplied to both social routes; offline saved overlap/model controls pass. Natural acceptance pending. [Evidence](docs/edition-reviews/2026-11-12-social-story-overlap.md).

- [ ] Gaming English context (2135, 2139): editor v11 translation guidance and Gaming calendar-date guard refuse saved invented launch date offline. Review natural notes. [Evidence](docs/edition-reviews/2026-11-12-social-translation.md).

## Completed and deferred

- [x] Pool text evidence (2268): read-only capture separates empty, URL-only and other text; two recorded HN FAA excerpts no longer inflate implied reporting counts. Admission and stored text unchanged; scheduled acceptance remains open.

- [x] Clipped social URLs (2264): shortened saved URLs now open the original post for its full destination; complete external links and saved text remain intact. Real Nov 7 browser replay covers both clipped posts.

- [x] Bluesky continuation (2263): saved edition cards with terminal ellipses now offer an explicit original-post link, including the shortened game-worker survey/news source URLs; saved text and selection unchanged.

- [x] All-topic recovery report (2260): scheduled reader gate reports every requested section and exits nonzero for any refusal; Nov 13 confirms all five failures without stopping at Tech. No generation change.

- [x] Tech candidate-cap study (2259): full-window control adds five readable reports but leaves all five fallback selections unchanged; retain the 200 cap pending scheduled AI review. [Evidence](docs/edition-reviews/2026-11-14-tech-cap.md).

- [x] Nov 14 preflight (2258): all five topics have readable production candidates; Tech has 24 eligible reporting excerpts. Ars category move changes both link and GUID, so stable-GUID dedupe is unavailable. [Scheduled acceptance handoff](docs/edition-reviews/2026-11-14.md).

- [x] Legacy Google headline evidence (2257): candidate loading suppresses exact stored Google RSS headline/publisher repetitions; prospective Tech capture identifies 113 affected candidates. Stored data and editions unchanged; isolated persistence/fallback controls retain additional reporting.

- [x] Xbox headline-only fallback verification (2256): recorded self-link-only entry stays empty through both fallback selectors; a readable control fills the one-story budget. Reporting and foreign-link preservation controls pass; production unchanged.

- [x] Xbox store badges (2255): omit nested publisher store widgets before excerpt truncation; recorded release dates/descriptions and article prices remain, with publisher/class/incomplete-widget controls.

- [x] Yahoo NBA lead photos (2254): retain recorded opening bare publisher-CDN images; reject later/unsafe/unrelated images and retain reporting, metadata and preferred image precedence.

- [x] NPR lead photos (2253): retain the recorded opening publisher-CDN photo from bare content images; reject later images/tracking pixels and preserve reporting, metadata and existing image precedence.

- [x] Guardian newsletter signup (2252): omit the recorded Breaking News US signup list item with exact publisher/destination/copy checks; retain report links, flight facts, metadata and continuation. Offline recording and preservation controls pass.

- [x] Ars newsletter excerpt (2251): omit the recorded Rocket Report subscription/submission paragraph while retaining Starship/Electron reporting, metadata and continuation; publisher/link/copy controls pass offline.

- [x] PlayStation podcast footer (2250): omit the recorded terminal empty section headings and clipped music credit, retaining the episode description and continuation marker; exact wording, publisher and terminal-position controls pass offline.

- [x] Missing-photo enrichment (2249): repeat collection now fills a previously absent article image while retaining existing photos; recorded CBS ingestion/candidate regression covers repeated, sparse and competing observations. Saved editions remain immutable.

- [x] Push Square outage recovery (2246): unchanged feed returned HTTP 200; normal 09:16 UTC collection accepted 25 dated articles and cleared HTTP 522. All 38 active sources error-free; retained 192 stored articles. No URL, retry or schedule changes.

- [x] Gaming teaser navigation (2245): recorded Eurogamer/RPS excerpts omit terminal article-matching “Read more” links, retaining reporting, metadata and a continuation ellipsis; publisher/destination/wording/nonterminal controls pass offline.

- [x] Verge teaser navigation (2243): omit terminal article-matching full-story self-links in recorded Atom excerpts, retaining all reporting, metadata and continuation; publisher/destination/wording/nonterminal controls pass offline.

- [x] Guardian teaser navigation (2242): omit terminal article-matching “Continue reading...” links on Guardian feeds, retaining reporting, metadata and source-continuation ellipsis; recorded World/U.S. and boundary controls pass offline.

- [x] NBA Sonnet automatic repair publication (2241): saved corrected Sonnet output now passes the full automatic rejection/repair/cache/public-reader cycle offline; separate reservations/settlements and immutable published copies verified. Historical output with synthetic transport/triage; scheduled acceptance remains open.

- [x] Ars excerpt navigation (2240): remove terminal article/comments self-links from the recorded reporting fragment; preserve all reporting, metadata and source continuation, with publisher/destination/nonterminal controls.

- [x] Nintendo Life teaser navigation (2239): omit terminal publisher self-links while retaining reporting and a continuation marker; unchanged recorded feed plus publisher/destination/nonterminal controls pass offline.

- [x] Guardian lead-photo resolution (2238): use the largest supplied size of the same publisher-hosted photo instead of its first 140px thumbnail; unchanged recorded World reporting/metadata and host/path/width/order controls pass offline.

- [x] RSS enclosure photos (2237): recorded CBS JPEG/PNG enclosures now supply lead images as the last fallback; reporting/metadata unchanged, unsafe/non-image enclosure and existing-image precedence controls pass offline.

- [x] Gematsu lead images (2235): preserve opening publisher-hosted description images when media/content images are absent; recorded reporting unchanged, with host/path/position/HTTPS and media-precedence controls.

- [x] Push Square teaser navigation (2234): omit its terminal article self-link while preserving reporting, metadata and an omission marker for reader continuation; recorded feed and host/destination/nonterminal controls pass offline.

- [x] Verge purchase navigation (2233): omit its recorded “Where to Buy” widget to avoid ambiguous flattened old/current prices; article prices, discounts, product details and metadata retained, with publisher/structure controls.

- [x] PlayStation podcast opening (2231): omit the exact leading email/subscription promotion on the publisher blog; recorded episode reporting and metadata retained, with other-host/non-opening/changed-wording controls.

- [x] Destructoid screenshot credits (2230): omit exact credit-only figcaptions before the excerpt cap; unchanged recorded reporting, descriptive captions, article text and metadata verified offline.

- [x] Google News headline-only descriptions (2229): recorded linked headline/publisher repetitions remain blank, so new candidates cannot fill readable fallback slots with repeated titles; extra reporting, explicit article content and metadata retained. Saved excerpts/editions unchanged.

- [x] Telemetry transport hang (2228): repeated offline runs caught pooled fetch stuck during caller cancellation beyond its deadline. One-shot HTTP sockets settle cancellation directly; 50 synchronized cancellations per run and response-safety controls cover the replacement. Unit files now have a 60-second outer watchdog with local transport phase diagnostics.

- [x] Destructoid excerpt navigation (2227): omit the recorded Yoast contents block before the excerpt cap, retaining article headings/lists and more reporting; unchanged fixture and unrelated-block controls pass offline.

- [x] Bracketed publisher teasers (2226): edition cards and saved stories recognize terminal `[…]`/`[...]` as clipped reporting and offer source continuation. Recorded PlayStation/Xbox browser checks cover desktop/mobile, light/dark and reload.

- [x] GameSpot excerpt navigation (2225): omit its named table of contents before truncation, retaining reporting headings/lists and metadata; unchanged recorded feed and boundary controls pass offline. Source remains blocked.

- [x] Disk alert prevention (2223): removed two verified inactive integration-test roots from interrupted runs (about 542 MiB); disk 79%→77%. Existing one-hour automatic cleanup and active-process guards retained; telemetry-export test teardown now stops listeners before closing sockets to prevent shutdown races.

- [x] Saved social continuation (2222): clipped saved Bluesky/Reddit posts now offer platform-labelled original-post links alongside X; complete posts unchanged. Offline browser cases cover the shared 600-character cap, reload, focus and layout.

- [x] Gaming teaser continuation (2221): terminal standalone “Read more” prompts offer source links in edition cards and saved copies; recorded Eurogamer/RPS browser checks cover desktop/mobile and both themes.

- [x] Repeated publisher post footers (2220): omit terminal “The post … appeared first on …” navigation linking back to the article; recorded NBA/Gaming reporting and external/nonterminal controls pass.

- [x] Publisher self-link footers (2218): omit terminal standalone Source links to the same article, preserving the reporting ellipsis and reader continuation; four recorded VGC/Gematsu articles and boundary controls pass.

- [x] Opening photo captions (2217): exclude image-and-caption-only lead figures from excerpts while retaining lead images, reporting and publisher-summary fallback. Recorded Verge and boundary controls pass.

- [x] Feed lead images (2215): retain the opening article-content figure when media metadata is absent; recorded Verge image and reporting verified, with later/unsafe image controls.

- [x] Verge ad contamination (2214): remove the exact terminal Hype Desk widget/configuration from feed excerpts; recorded CMF reporting and metadata remain intact, with ordinary code mentions preserved.

- [x] Verge continuation (2213): explicit “Read the full story at The Verge” footers now offer a source continuation link; recorded reporting and saved-copy limits retained.

- [x] Ars continuation (2208): explicit “Read full article” footers, including trailing Comments, offer source continuation in editions and saved copies; recorded reporting retained.

- [x] Feed inline spacing (2207): inline emphasis/links preserve punctuation and joined words; paragraphs, breaks and list items retain separators. Saved editions unchanged.

- [x] Feed excerpt boundaries (2206): capped reporting marks omissions, preserves word boundaries where possible and avoids split Unicode; complete text, content precedence and X citation discovery retained.

- [x] Explorer rollback test (2201): compare stable catalog details while validating mutable size/row statistics separately; public statistics omission and restricted-role checks retained.

- [x] Publisher continuation (2200): explicit full-article prompts in story teasers now offer a source continuation link in editions and saved copies; original excerpts retained.

- [x] Engagement snapshots (2199): Bluesky and Reddit reader cards label saved counts “at collection”, matching X; displayed counts and saved editions unchanged.

- [x] X media references (2198): `pic.twitter.com` references now open HTTPS media destinations in edition text and saved post excerpts; original text preserved.

- [x] Saved post links (2197): saved excerpts retain clickable full URLs and original-post navigation; actual Gaming patch notes survive reload on desktop/mobile light/dark.

- [x] Visible publication dates (2196): edition stories/posts older than 24 hours show a calendar date, including year, without requiring a hover; recent items retain relative times.

- [x] Saved publication dates (2195): new story/post bookmarks show original publication time separately from save date; optional metadata survives reload and account sync, while legacy saves retain no invented date.

- [x] Saved editorial context (2191): newly bookmarked posts retain their editorial context separately from the original excerpt, including the U.S. constitutional-claim attribution; bounded optional copies support older bookmarks and account sync.

- [x] Saved-item reading continuity (2190): bookmarked truncated stories and X excerpts now offer explicit source continuation; headline-only saved stories explain the missing summary and label the source link. Actual-edition desktop/mobile light/dark checks preserve bookmark text and storage.

- [x] Truncated story continuation (2189): saved summaries ending in an ellipsis now offer an explicit source continuation link; text and generation unchanged. Nov 13 actual-edition desktop/mobile light/dark checks cover all truncated and complete stories.

- [x] Historical empty-post wording (2188): Nov 4 World section now says “No posts in this edition”; avoids an unsupported quality claim and calling saved history “today”. Actual saved-edition desktop/mobile light/dark checks pass; generation unchanged.

- [x] Saved X excerpt continuation (2184): three Nov 13 posts ending in ellipses now offer “Continue reading on X”; original saved text remains intact.

- [x] Missing reader summaries (2183): headline-only cards disclose “Summary unavailable” and offer a labelled source link; saved content and generation unchanged.

- [x] Reader empty-story wording (2182): saved World/U.S. sections now say “No stories in this edition” rather than claiming a quiet news day after failed triage. Actual saved-edition desktop/mobile light/dark checks pass; generation and snapshots unchanged.

- [x] STEERING 30/31 historical accounting reconciled (2175): 33 calls, $1.168639 settled + two $0.15 unknown Gaming holds = $1.468639 charged. Holds stay charged; reopen only with request-specific usage evidence. No further experiment authorized. [Evidence](docs/x-search-experiment.md#historical-accounting-reconciled--nov-13-iteration-2175).

- [x] NBA item 54 accepted Nov 11 (1824); Nov 12 recurrence remains open above.
- [x] Tech evidence depth: direct publisher cluster excerpts and bounded immutable snapshots verified offline through budgeted production editing (2130–2137); natural summary quality still needs scheduled review. [Evidence](docs/edition-reviews/2026-11-12-tech-depth.md).
- [x] Iteration 2144: compacted task handoff with all 23 open items preserved; scheduled review follows STEERING 59 proxy decision.
- Editorial audit closed under STEERING 5; reopen only for an actual unsupported saved summary. Message Batches, cross-process cache coordination, full articles and larger editor shortlists deferred.
