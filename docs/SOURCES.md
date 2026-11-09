# Content source inventory

### Nov 8 daily and first-week production X report — iteration 1381

Iteration 1385 selected-citation review: all eight picks have recorded new-candidate
baselines and no earlier search or retained free-link/feed/Reddit citations;
six are outside current account lists. All 40 candidates have unverified
provider-reported likes; all 12 selected X posts have empty official metrics.
[Novelty, engagement and saved IDs](edition-reviews/2026-11-08.md#selected-keyword-novelty-and-engagement--iteration-1385).
Third scheduled-edition acceptance still awaits Nov 9.

Read-only post-publication ledger snapshot, Nov 8 15:05 UTC, using
`report-x-discovery.ts 2026-11-08` and `report-x-week.ts 2026-11-08`.
The seven-day report covers Nov 2–8; Nov 8 remains an incomplete UTC day.

| Topic                             | Nov 8 cost | New verified / outside-list | Nov 2–8 cost | New verified / outside-list |
| --------------------------------- | ---------: | --------------------------: | -----------: | --------------------------: |
| Tech & AI                         |  $0.066438 |                     10 / 10 |    $0.271168 |                     37 / 34 |
| NBA                               |  $0.064175 |                      10 / 5 |    $0.291355 |                     39 / 32 |
| Gaming                            |  $0.064925 |                     10 / 10 |    $0.234287 |                     30 / 28 |
| World                             |  $0.064569 |                     10 / 10 |    $0.216593 |                     25 / 21 |
| Unattributed historical call      |          — |                           — |    $0.023382 |                     unknown |
| Total attributed yield / all cost |  $0.260107 |                     40 / 35 |    $1.036785 |                   131 / 115 |

First week: 28 production calls, 137 fetched posts, zero remaining holds.
Nov 2's two fetched posts lack topic attribution; historical search types vary.
Counts use saved discovery baselines and current verification, not unique
people or causal paid yield. No additional provider requests were made.

Today all four keyword tools report completed execution, with no retries.
Eight citations appear in the scheduled selection (Tech/NBA/Gaming/World
2/2/1/3), six outside curated lists. Novelty versus free links and engagement
quality still need review. World now has ten newly verified outside-list
candidates and three selected citations, after Nov 7's unconfirmed searches.
See the [scheduled review](edition-reviews/2026-11-08.md). Keep the three-edition
keyword acceptance open through Nov 9; budgets, models and settings unchanged.

### Nov 7 pre-publication keyword production — iteration 1198

Read-only snapshot at 14:38 UTC, before the 15:00 edition. This is partial
production evidence, not the Nov 7 edition review or publisher merge approval.

| Topic     | Attempts | Confirmed tool completion |      Cost | Fetched | New verified outside-list |
| --------- | -------: | ------------------------: | --------: | ------: | ------------------------: |
| Gaming    |        2 |                         0 | $0.017667 |       0 |                         0 |
| World     |        2 |                         0 | $0.018293 |       0 |                         0 |
| NBA       |        1 |                         1 | $0.064192 |      10 |                         9 |
| Tech & AI |        1 |                         1 | $0.065975 |      10 |                        10 |
| Total     |        6 |                         2 | $0.166127 |      20 |                        19 |

All six ledger calls say `succeeded`, but Gaming/World each exhausted the
initial attempt and retry with `execution=unconfirmed`, zero fetched posts and
no citations. Their recorded `x_keyword_search` inputs do not establish tool
completion or a genuinely empty search. NBA/Tech have `execution=completed`;
all 20 cited posts are currently verified and outside the curated author lists,
including one existing NBA candidate. Current holds and profile fetches are zero.
Calls began 14:30:04–14:32:15 UTC. No extra searches or provider requests were made.

Source: `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-07`, plus a read-only
Drizzle selection of that day's stored `execution`/`toolCalls` from
`x_discovery_calls`. Saved selection, engagement quality, free-link overlap and
Bluesky outcomes still require the published edition. Keep caps/query/runtime
unchanged; the first three scheduled editions remain the acceptance window.

### Nov 7 daily and first-week production X report — iteration 1206

Read-only ledger snapshot at 15:42 UTC, using `report-x-discovery.ts 2026-11-07`
and `report-x-week.ts 2026-11-07`. No provider requests. The rolling seven-day
report covers Nov 1–7; recorded production calls start Nov 2. Nov 7 is incomplete.

| Topic                             | Nov 7 cost | New verified / outside-list | Nov 2–7 cost | New verified / outside-list |
| --------------------------------- | ---------: | --------------------------: | -----------: | --------------------------: |
| Tech & AI                         |  $0.065975 |                     10 / 10 |    $0.204730 |                     27 / 24 |
| NBA                               |  $0.064192 |                       9 / 9 |    $0.227180 |                     29 / 27 |
| Gaming                            |  $0.017667 |                       0 / 0 |    $0.169362 |                     20 / 18 |
| World                             |  $0.018293 |                       0 / 0 |    $0.152024 |                     15 / 11 |
| Unattributed historical call      |          — |                           — |    $0.023382 |                     unknown |
| Total attributed yield / all cost |  $0.166127 |                     19 / 19 |    $0.776678 |                     91 / 80 |

Nov 2–7 records 24 calls, 97 fetched posts and zero remaining holds. The Nov 2
call fetched two posts but lacks requested-topic attribution; its cost remains
in the total, without inventing incremental topic yield. New/verified counts
use stored citation baselines and current verification, not causal attribution
or unique people reached. Historical search types differ from Nov 7 keywords.

Nov 7 selected three novel Tech citations and one previously verified NBA
citation. Gaming/World exhausted retries with four unconfirmed attempts out of
six overall; paid receipt is not search completion. See the [actual edition
review](edition-reviews/2026-11-07.md) for selection and engagement evidence.
Keep the three-edition keyword acceptance open, report World separately, and
continue first-week daily reporting through Nov 8. Caps and sources are unchanged.

### Nov 6 daily production X report — iteration 1077

| Topic     | Open-topic cost / fetched | Reaction cost / fetched | New verified outside-list | Cited posts selected that day |
| --------- | ------------------------: | ----------------------: | ------------------------: | ----------------------------: |
| World     |             $0.031195 / 4 |                       — |                         3 |                             0 |
| Gaming    |             $0.037663 / 5 |                       — |                         5 |                             2 |
| NBA       |             $0.012014 / 0 |           $0.039260 / 5 |                         5 |                             1 |
| Tech & AI |             $0.037343 / 5 |                       — |                         4 |                             0 |
| Total     |            $0.118215 / 14 |           $0.039260 / 5 |                        17 |                             3 |

Five successful production calls settled **$0.157475**, with zero holds or
profile fetches. NBA's open search returned no posts; its later story-reaction
search supplied five. The 19 fetched/cited posts include 17 new candidates
currently officially verified; all 17 posts have authors outside the current lists.
Three cited posts appear in the Nov 6 edition (Gaming two, NBA one); this does
not establish causal selection, relevance or virality. This is the retired
open-search runtime, separate from the Nov 6 keyword/semantic experiment.

First-week production reporting now covers Nov 2–6: $0.023382 / $0.137056 /
$0.149447 / $0.143191 / $0.157475, totaling **$0.610551**, zero current holds.
The seven-day report ending Nov 6 includes two earlier empty days; it does not
mean a full week of scheduled coverage. Nov 7 keyword acceptance still waits
for the scheduled run. Read-only commands: `pnpm exec tsx scripts/report-x-discovery.ts 2026-11-06`
and `pnpm exec tsx scripts/report-x-week.ts 2026-11-06`; no provider requests.

### Keyword rollout preparation — iteration 1052

The disabled keyword adapter now requests and retains ten results, matching
both saved test rounds. Engagement parsing uses the same limit: ten-item
arrays retain reported counts instead of being discarded by the old five-item
limit. Offline protocol fixtures verify all ten observations and unchanged
fetched-post billing. Fixed keyword search was enabled in iteration 1057 for Nov 7; no paid
calls or ingestion during preparation.

### Nov 6 scheduled edition — iteration 1011

Saved reader has X counts 5/5/5/1 and one World Bluesky pick, distinct from
World’s X event. World read 563 Bluesky candidates, shortlisted six, retained
one and dropped one unsupported claim; other topics had no slots. No Bluesky
alerts. The owner accepted the $0.000060 cost-gate miss; the reserved slot
was enabled in iteration 1061 for the next scheduled edition. Daily cap unchanged.
Saved X engagement remains unknown; this is not viral-quality acceptance.
[Edition review](edition-reviews/2026-11-06.md). No review provider calls.

### Nov 5 revised X experiment — iteration 885

Five settled keyword/semantic calls cost $0.278606 for 41 fetched/cited posts;
all returned official embeds. NBA/Gaming/World keyword outcomes retain $0.45
in holds; daily charged experiment total $0.728606, overall $1.260937.
Tech keyword used Top/exact bounds/threshold but requested 10 rather than 16.
Semantic results have no reported likes; 16/31 IDs fall inside the window.
Usable yield still needs scoring, promotion and free-link review. Production
fixed search remains off; no experiment posts were ingested. [Round review](edition-reviews/2026-11-05-x-experiment-review.md).

### Nov 5 scheduled open X discovery — iteration 847

Four successful old open-topic searches cost $0.143191: 19 fetched, 18 new
officially verified outside-list posts (World 3, Gaming/NBA/Tech 5 each),
zero holds. One Tech discovery was selected; no other paid pick was selected.
The scheduled edition has X counts 3/5/5/1 and no Bluesky picks; saved X
engagement is unknown. Full [Nov 5 review](edition-reviews/2026-11-05.md).
Redesigned fixed search remains off; no verification calls were made.

### Curated X account review — 2026-11-03 (iteration 315)

These are editable search inputs, selected for first-hand posts, reporting and
product demonstrations. They are not an endorsement of every post, a measured
virality ranking, or a claim that these accounts were freshly verified. No X
profile fetch or paid search was made for this review. Each discovered post
still needs the official oEmbed check. Open search is the primary path (activated in iteration 430); these lists
are optional secondary inputs.

| Topic                 | Retained accounts and purpose                                                                                                                        | Added accounts and purpose                                                                                                                               | Removed from the previous defaults                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Tech & AI             | OpenAI, AnthropicAI, GoogleDeepMind, huggingface: first-party releases and demos; sama, karpathy, simonw: builders' observations and experiments     | swyx: AI engineering developments; soumith: ML tooling/research; fchollet: research and evaluation; bcherny: coding-agent development                    | GoogleAI: overlaps the retained GoogleDeepMind primary source                                    |
| NBA                   | NBA: official highlights; ShamsCharania, ChrisBHaynes, TheSteinLine, TimBontemps: reporting and insider news                                         | espn_macmahon, WindhorstESPN: beat/league reporting; KingJames, StephenCurry30, Giannis_An34: players' first-hand reactions                              | NBAOfficial and NBAPR: officiating/PR focus; BleacherReport: broad aggregator                    |
| Gaming                | PlayStation, Xbox, NintendoAmerica, Steam: platform announcements; geoffkeighley: reveals; Wario64: discovery leads; jasonschreier: studio reporting | stephentotilo: games reporting; tomwarren: Xbox/platform reporting; LarAtLarian, ConcernedApe, NoMansSky: developers' first-hand announcements and clips | IGN: publisher overlap; gameawards: overlaps geoffkeighley's event coverage                      |
| World news & politics | Reuters, AP, BBCWorld, AFP: broad reporting; UNHumanRights: primary human-rights statements; ZelenskyyUa: Ukrainian government statements            | clarissaward, NickPatonWalsh, RichardEngel: field reporting; ragipsoylu: Turkey/regional reporting; NikaMelkozerova: Ukrainian reporting                 | BBCBreaking: overlaps BBCWorld; NPR: article-feed overlap; UN: broad institutional announcements |

Reviewed lists, activated after the Nov 3 scheduled run (iteration 431) (case-insensitive unique handles; all below the 20-account cap):

- **Tech & AI (11):** [OpenAI](https://x.com/OpenAI), [AnthropicAI](https://x.com/AnthropicAI), [GoogleDeepMind](https://x.com/GoogleDeepMind), [sama](https://x.com/sama), [karpathy](https://x.com/karpathy), [simonw](https://x.com/simonw), [huggingface](https://x.com/huggingface), [swyx](https://x.com/swyx), [soumith](https://x.com/soumith), [fchollet](https://x.com/fchollet), [bcherny](https://x.com/bcherny).
- **NBA (10):** [NBA](https://x.com/NBA), [ShamsCharania](https://x.com/ShamsCharania), [ChrisBHaynes](https://x.com/ChrisBHaynes), [TheSteinLine](https://x.com/TheSteinLine), [TimBontemps](https://x.com/TimBontemps), [espn_macmahon](https://x.com/espn_macmahon), [WindhorstESPN](https://x.com/WindhorstESPN), [KingJames](https://x.com/KingJames), [StephenCurry30](https://x.com/StephenCurry30), [Giannis_An34](https://x.com/Giannis_An34).
- **Gaming (12):** [PlayStation](https://x.com/PlayStation), [Xbox](https://x.com/Xbox), [NintendoAmerica](https://x.com/NintendoAmerica), [Steam](https://x.com/Steam), [geoffkeighley](https://x.com/geoffkeighley), [Wario64](https://x.com/Wario64), [jasonschreier](https://x.com/jasonschreier), [stephentotilo](https://x.com/stephentotilo), [tomwarren](https://x.com/tomwarren), [LarAtLarian](https://x.com/LarAtLarian), [ConcernedApe](https://x.com/ConcernedApe), [NoMansSky](https://x.com/NoMansSky).
- **World news & politics (11):** [Reuters](https://x.com/Reuters), [AP](https://x.com/AP), [BBCWorld](https://x.com/BBCWorld), [AFP](https://x.com/AFP), [UNHumanRights](https://x.com/UNHumanRights), [ZelenskyyUa](https://x.com/ZelenskyyUa), [clarissaward](https://x.com/clarissaward), [NickPatonWalsh](https://x.com/NickPatonWalsh), [ragipsoylu](https://x.com/ragipsoylu), [RichardEngel](https://x.com/RichardEngel), [NikaMelkozerova](https://x.com/NikaMelkozerova).

Owner item 23 initially held these lists until the scheduled run was measured.
Iteration 431 activated them after the Nov 3 results were recorded and acknowledged.
API readback and read-only desktop/mobile checks confirm all four active lists
(11/10/12/11); other topic fields and the existing edition stayed unchanged.
Screenshots: `docs/screenshots/reviewed-x-accounts-{1..4}-{desktop,mobile}.png`.
No discovery call was made; account-list effectiveness remains unmeasured.

The live topic settings are the source of truth. Change them under **Manage
topics → Edit → X accounts** (one handle per line). This review does not install
an automatic reset: later owner edits persist. Account-list search uses topic
guidance, so off-topic player posts, Wario64 sales/promotions and institutional
PR should not qualify just because their author is on a list. Reporting and
political statements remain subject to source support and topic relevance.
Outside-list discovery counts use the current lists and may change after this
edit; they do not preserve historical account membership. Search cost/yield
must be evaluated from the scheduled runs before calling these lists effective.

Iteration 213: `pnpm exec tsx scripts/report-x-discovery.ts YYYY-MM-DD` reads
UTC-day X ledger cost/holds and each call's topic citations with current official
verification counts. It performs no network requests or paid discovery. Counts
are not incremental additions or relevance measurements; zero-citation historical
calls have no stored topic attribution. New reservations snapshot the requested
topic before HTTP, including failures and empty results, and retain it through
topic rename/deletion. New calls also snapshot `open-topic` or `account-list`
before HTTP, allowing cost, fetched-post counts and verified yield to be read per
topic and search type even for failures or empty results. Historical search types
stay null; no type is inferred from run IDs. Scheduled account-list discovery
remains enabled pending the first scheduled-run acknowledgement before switching.

Iteration 298: `pnpm exec tsx scripts/report-x-week.ts YYYY-MM-DD` reports
seven UTC days ending on the supplied date (today by default), including empty
days, daily topic/type summaries and whole-week totals with unknown counters.
It only reads stored evidence; it makes no provider or verification requests.
The current day can be incomplete and an empty day does not prove coverage.

Iteration 296: `byTopicAndSearchType` summarizes reservation-time topic IDs
and recorded search types, including empty and failed calls. It counts each
call's settled cost and hold once, and sums same-topic incremental verified
posts and outside-list incremental verified posts. Unknown costs/fetched counts
have explicit call counters; summed known values are not complete totals while
those counters are nonzero. Historical calls without a requested-topic snapshot
stay in an unattributed group; inspect their per-call citation evidence instead.
Topic renames group by stable ID; the displayed name is the first call's snapshot.
Current verification/list caveats below apply to these summaries too.

Iteration 277: the daily report adds `outsideListVerifiedNow` and
`outsideListNewVerifiedNow` per topic/call, counting posts whose official author
URL is absent from **all current** curated topic lists, including disabled topics.
Comparison ignores handle case and leading `@`; duplicate list entries do not
multiply yield. `unknownAuthorVerifiedNow` keeps unrecognized author URLs out of
outside-list counts. Citation-only authors never qualify. These are post counts,
not unique accounts or historical membership snapshots; edits to lists and current
verification state can change them. Existing search-type and requested-topic
snapshots allow the counts to be compared per topic and search type.

Iteration 278: `selectedInDay` counts each cited post once per call/topic if it
appears in a same-topic edition published after that call and before the UTC day
ends. Repeated editions do not multiply counts; earlier or later-day editions,
other topics and non-X posts do not qualify. `outsideListSelectedInDay` applies
the current verified-author/list comparison above. These counts show publication,
not incremental discovery or causal attribution; the same post can count for
multiple calls. No inference, publication or verification is triggered.

Checked 2026-11-01, iteration 38. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Seventeen sources
supplied 669 distinct URLs across all four topics. Last successful bounded
verification: 20:38 UTC; two queued passes preserved the same 669-item total.

| Source                                   | Topic                 | Status                                   |                  Stored items | Feed / API                                                                                                                                                  |
| ---------------------------------------- | --------------------- | ---------------------------------------- | ----------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Verge                                | Tech & AI             | live                                     |                            11 | https://www.theverge.com/rss/index.xml (Atom)                                                                                                               |
| Hacker News official API                 | Tech & AI             | live                                     |                            26 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json`                                                                             |
| CBS Sports NBA                           | NBA                   | live                                     |                            36 | https://www.cbssports.com/rss/headlines/nba/                                                                                                                |
| GamesIndustry.biz                        | Gaming                | live                                     |                            60 | https://www.gamesindustry.biz/feed                                                                                                                          |
| BBC World                                | World news & politics | live                                     |                            31 | https://feeds.bbci.co.uk/news/world/rss.xml                                                                                                                 |
| NPR World                                | World news & politics | live                                     |                            10 | https://feeds.npr.org/1004/rss.xml                                                                                                                          |
| The Guardian World                       | World news & politics | live                                     |                            45 | https://www.theguardian.com/world/rss                                                                                                                       |
| Ars Technica                             | Tech & AI             | live                                     |                            20 | https://arstechnica.com/feed/                                                                                                                               |
| ESPN NBA RSS                             | NBA                   | replaced (empty responses)               |                             0 | HTTP 202 with empty body; chose CBS without bypass attempts                                                                                                 |
| Yahoo Sports NBA                         | NBA                   | live                                     |                            52 | https://sports.yahoo.com/nba/rss/                                                                                                                           |
| Eurogamer                                | Gaming                | live                                     |                            60 | https://www.eurogamer.net/feed                                                                                                                              |
| PC Gamer                                 | Gaming                | live                                     |                            50 | https://www.pcgamer.com/rss/                                                                                                                                |
| Rock Paper Shotgun                       | Gaming                | live                                     |                            60 | https://www.rockpapershotgun.com/feed                                                                                                                       |
| PlayStation Blog                         | Gaming                | live                                     |                            10 | https://blog.playstation.com/feed/ (first-party announcements/promotions)                                                                                   |
| Xbox Wire                                | Gaming                | live                                     |                            10 | https://news.xbox.com/en-us/feed/ (first-party announcements/promotions)                                                                                    |
| NBA.com news RSS                         | NBA                   | blocked                                  |                             0 | HTTP 403 at `/news/rss.xml`; no bypass attempted                                                                                                            |
| GameSpot mashup RSS                      | Gaming                | blocked                                  |                             0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted                                                                                                           |
| IGN articles XML                         | Gaming                | rejected                                 |                             0 | `/articles?format=xml` returned malformed XML; not scheduled                                                                                                |
| Google News RSS: artificial intelligence | Tech & AI             | live                                     |                            68 | https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US%3Aen                                                                    |
| OpenAI News                              | Tech & AI             | live                                     |                            60 | https://openai.com/news/rss.xml (first-party announcements)                                                                                                 |
| Google DeepMind                          | Tech & AI             | live                                     |                            60 | https://deepmind.google/blog/rss.xml (first-party research/announcements)                                                                                   |
| xAI direct x_search (gateway prohibited) | all                   | live                                     | 2 citations, 0 verified posts | One measured World search; $0.023382; generic citations fail official verification                                                                          |
| X official oEmbed                        | all                   | live                                     |                            10 | Named status URLs verified; /i/web/status URLs return 404                                                                                                   |
| X official API                           | all                   | needs key                                |                             0 | Owner token and hard read cap required                                                                                                                      |
| Reddit NBA RSS                           | NBA                   | blocked                                  |                             0 | https://www.reddit.com/r/nba/.rss returned HTTP 403 (iteration 31); no bypass attempted; NBA top JSON also 403 in iteration 89; other communities untested  |
| Bluesky public API                       | all                   | hourly collection; reserved edition slot |              189 observations | Authenticated collection; AI triage/editor fills open slots after X; one reserved replacement slot enabled after owner approval; outcomes/drop counts saved |

Ingestion runs immediately on first scheduling and every 30 minutes thereafter.
Each run fetches at most 60 entries/feed and the first 20 HN stories; deleted,
dead, undated and unsafe-URL items are skipped. HN points/comments are stored.
The shared client has a one-second domain floor, five-minute cache, 20-second
timeout, 2 MB cap, Retry-After/error backoff; BullMQ retries three times with
exponential delays. Failed/empty runs retain the previous successful timestamp
and expose an error. Feed ingestion does not crawl article pages; the separate
explicit bounded X-link pass is described under iteration 96 below.

Incoming articles are **not curated digests**. Publisher dates are preserved;
quiet weekend feeds may be several days old. CBS includes betting promotions:
these remain broad-ingestion candidates, but `/betting/` links are omitted from
the incoming view. HN includes general technical stories; topical relevance,
spam penalties and final editorial selection are still M3/M5. Gaming coverage
needs more independent outlets; world coverage now includes BBC, NPR and The
Guardian. Source labels still do not verify independence.

Offline fixtures record two entries each from CBS RSS, Verge Atom and the HN
API on 2026-11-01. They are never seeded into production content. A first live
pass exposed incorrect XML entity handling; decoding was fixed, 29 malformed
BBC URL records were removed, and the queued live check re-ingested clean URLs.

Iteration 10: ranked editions use the stored live items above without making
additional publisher/LLM calls. Half-open time windows can legitimately leave
NBA/Gaming empty even while older incoming headlines are present. Latest source
checks still require nonzero fetched items and successful persistence. HN text
now decodes HTML entities before storing excerpts; older immutable editions
retain the text captured when they were generated.

Iteration 11: the five sources still return nonempty data with no recorded
errors. Ranked editions now apply topic phrase rules to the stored headline and
first 600 excerpt characters; incoming source coverage is unchanged. This is a
lexical screen, not an LLM editorial pass. In the checked 24-hour window it
rejected 16/24 Tech candidates; NBA had one betting candidate excluded by the
existing low-value filter, Gaming none. No new external source or LLM calls
were added by edition generation.

Iteration 12: migration 006 adds Yahoo NBA and Eurogamer to persisted topic
source configuration and the existing 30-minute worker scheduler. Live queued
collection stored 50/60 articles respectively; repeat collection added no
duplicates. Two-item recorded fixtures cover each feed offline (never seeded).
The checked last-24-hour edition has NBA 51 candidates / 5 selected and Gaming
5 candidates / 3 selected, versus previously quiet sections. Yahoo includes
syndicated coverage, fantasy and previews; phrase rules rejected five NBA
candidates but do not establish newsworthiness. Editorial review and grouping
syndicated outlets remain necessary. No article-page scraping or LLM calls.

Iteration 14: two queued live collection passes still retain 266 unique items
across seven healthy sources and all four topics. Headline grouping reads only
stored candidates; new snapshots retain each grouped article's original link
and source labels. Labels do not establish independent reporting or remove
syndication. No new source adapters or external/LLM requests were added.

Iteration 19: two explicit queued live passes stored 267 unique articles from
all seven healthy sources across four topics; the repeated pass added no
duplicates. No source configuration or provider/model/billing changes.

Iteration 20: two explicit queued collection passes stored 268 real articles
from seven healthy sources across the four seeded topics. New topics created
through the UI/API have no source connections and collect nothing until source
configuration is implemented. No automatic feed discovery, fixture ingestion
or provider/model/billing changes.

Iteration 21: the seven-source catalog can now be connected to any topic through
Manage topics → Sources. Stored observations are shared immediately; scheduled
collection remains once per source and runs when any connected topic is enabled.
Disconnecting leaves collected articles and saved editions intact. No new sources
or external adapters were introduced. Two explicit queued live collection passes
again stored 268 real articles across seven healthy sources and four seed topics.
Desktop/mobile verification temporarily connected The Verge to new topics,
verified real incoming stories/new snapshots, then removed the test topics.
Custom feeds, query discovery and social accounts are still unfinished. No
provider/model/billing changes.

Iteration 24: Source & run status now displays the seven sources' real stored
counts, latest response counts, attempt/success timestamps and collection errors.
Enabled connections determine active versus paused; active sources without a
success in one hour are flagged overdue. Two explicit live collection passes
still stored 268 unique articles across four topics, with all seven sources
successful. No source, provider, model or billing configuration changed.

Topic lifecycle (iteration 25): removing a topic deletes its connections, not the
shared catalog entry or stored articles/observations. Other connected topics keep
their coverage. Collection pauses when no enabled topic connects a source, after
the worker refreshes schedules; previously fetched content remains real content.

Iteration 26: two explicit live collection passes stored 270 unique real articles
across the four seeded topics; all seven sources succeeded without errors.
Missed-run probes used synthetic slot timestamps and real stored candidates,
not fabricated content or a real outage. No source/provider/model/billing change.

Iteration 27: Manage topics → Sources now accepts custom public HTTPS RSS/Atom
feed URLs. Registration connects immediately but marks nothing live until the
worker stores real articles; first collection is scheduled within one minute.
Identical normalized URLs share the catalog entry, name and collection. Existing
connections can disconnect custom feeds; collected items and editions survive.
There is no feed auto-discovery or search query/account support yet. Public DNS
addresses are validated and pinned at socket lookup, including redirects; private
addresses, credentials, non-HTTPS URLs and custom ports are rejected. Existing
rate limits, cache, size/time caps and retries apply to custom feeds too.

Desktop/mobile checks registered Ars Technica through the UI and observed the
actual scheduled worker store 20 articles, then reused/disconnected the same URL.
Ars remains connected to Tech & AI; its broad science/technology coverage still
passes the topic's existing phrase rules for preliminary selection. Two live
queued passes retained 293 URLs from eight healthy sources. No LLM/provider,
model or billing configuration changed; no fixture content entered production.

Iteration 28: Manage topics → Sources → Discover news by query connects a named
Google News RSS search feed (English/US edition). Query text supports Google
operators, is bounded to 100 characters and is safely encoded; matching query
URLs reuse collection. Replace by connecting a new query and disconnecting the
old source. Existing articles and immutable editions survive disconnection.
Google links are preserved as supplied; we do not crawl Google article redirects
or claim publisher URL deduplication or independent-source counts. Phrase rules
and preliminary ranking still apply; these are broad candidates, not edited news.

Desktop/mobile live checks observed actual scheduled collection of 60 articles
for `artificial intelligence`; that query remains connected to Tech & AI. Two
explicit queued passes stored 354 real URLs from nine healthy sources across
four topics. A two-item recorded Google RSS fixture is only for offline parser
tests and is never seeded. Social account discovery remains unfinished. No
provider/model/billing configuration changed.

Iteration 29: migration 011 connects NPR World and The Guardian World to the
original world topic (if it still exists), using the existing shared feed adapter,
collection limits, public-network checks and disconnect controls. The real worker
stored 10 NPR and 45 Guardian articles. Two live queued passes retained 411 URLs
from eleven healthy sources; new preliminary editions include Guardian coverage.
No article pages are fetched. Guardian RSS contains longer descriptions, but
normalization stores only the existing bounded plain-text excerpt; this remains
preliminary selection, without editorial summaries or verified independence.
Two-item recorded fixtures verify each publisher offline and are never seeded.
No social/LLM/provider/model/billing configuration changed.

Iteration 31: two queued live passes retained 416 real URLs across eleven healthy
sources and four topics. One bounded public Reddit NBA RSS probe returned 403;
no source was registered and no bypass was attempted. The new historical NBA
ranking fixture copies existing stored candidates for offline evaluation only;
it does not ingest fixture data or independently verify publisher claims.
No provider/model/billing configuration changed.

Iteration 32: migration 012 connects PlayStation Blog and Xbox Wire to the
original Gaming topic, if present. The existing worker stored ten real articles
from each; two queued passes retained 436 URLs across thirteen healthy sources.
These are first-party platform posts, not independent reviews or corroboration.
Promotional content, podcasts, community showcases and third-party guest posts
can appear; current phrase/quality rules do not guarantee editorial importance.
The newest posts in both feeds are October 30: today's 24-hour edition remains
five candidates / three selections for Gaming. A seven-day edition examines
114 Gaming candidates; its five selected items still come from Eurogamer.
No source-breadth bonus, time-window widening or article-page crawling was added.
Two-item recorded fixtures omit full content:encoded bodies and remain offline
only. Existing safe HTTP, rate limits, retries and disconnect controls apply.
No provider/model/billing changes; social discovery remains unfinished.

Iteration 33: two queued live passes retained 437 real URLs across thirteen
healthy sources and four topics; preliminary editions still select 5/5/3/5.
The World ranking fixture freezes 47 previously stored candidates from an exact
24-hour window for offline evaluation; it is never ingested into production.
No new source, article-page request or provider/model/billing change.

Iteration 34: migration 013 connects OpenAI News and Google DeepMind to the
original Tech & AI topic if present. The real worker stored 60 articles each;
two queued passes retained 557 URLs across fifteen healthy sources. These are
first-party announcements, including promotional and policy posts, not independent
corroboration. Latest supplied dates are October 30 and October 28 respectively:
24h selections stay 5/5/3/5. A seven-day edition examines 141 Tech candidates,
but its five selections still come from HN; no ranking improvement is claimed.
No article-page crawling or model/provider/billing changes were made.

Repeat DeepMind collection exposed gzip bytes being decoded as UTF-8. The shared
client now decodes gzip, deflate and Brotli before parsing/caching, with the
existing 2 MB wire cap plus a 2 MB expanded cap; corrupt/unknown encodings fail.
Recorded two-item publisher fixtures remain offline only. Tests cover decoding,
cache reuse, corrupt bodies and expansion limits without external calls.

Iteration 35: new saved editions retain the selected lead article's existing
feed-supplied HTTPS image URL. The browser displays publisher-hosted media
lazily without a referrer; failed loads disappear while the headline, excerpt
and source links remain. No image is borrowed from related coverage, generated,
re-hosted or fetched by the backend. Missing media stays absent; old immutable
editions are not backfilled. Images are illustrative publisher media, without
verified captions, and use empty alt text beside the article headline.
Two explicit live collection passes retained 558 real URLs from fifteen healthy
sources; no new source, provider/model/billing change or article crawling.

Iteration 36: migration 014 connects PC Gamer and Rock Paper Shotgun to the
original Gaming topic if present. The existing worker stored 50 and 60 real
articles respectively; two queued passes retained 668 URLs across seventeen
healthy sources and all four topics. Today's Gaming window now has 22 candidates
and five selections (previously five candidates and three selections), including
both new outlets. This demonstrates coverage, not improved editorial precision.
PC Gamer includes hardware, deals and opinion; Rock Paper Shotgun includes guides
and shares the IGN Entertainment publisher group with Eurogamer. Neither source
labels nor different domains establish independent reporting. Existing phrase
and quality rules still apply; ranking, budgets and provider/model/billing stay
unchanged. No article pages were crawled. Recorded two-item fixtures omit long
full-content fields, remain offline and never enter production ingestion.

Iteration 37: two explicit queued passes again retained 668 real URLs from
seventeen healthy sources. Original HN `Ask HN:` question threads remain stored
and visible as incoming content, but new signals-v6 news editions omit them with
an auditable reason. This changes selection only; HN collection and engagement
storage are unchanged. Show HN launches and publisher reporting remain eligible.
No new external source, article crawling or provider/model/billing change.

Iteration 38: two queued live passes retained 669 real URLs across seventeen
healthy sources and all four topics. The Tech ranking fixture freezes the 54
candidates present before these passes for a fixed 24h window ending 20:35 UTC;
it retains publisher/Google/HN observations for offline evaluation only. It is
never ingested, and its provisional agent event labels do not verify article
claims. No new source, article-page requests or provider/model/billing change.

### Iteration 51 verification (2026-11-01)

`pnpm exec tsx apps/api/scripts/smoke-ingestion.ts` completed two queued live
collection passes with 706 stored URLs, four topics and seventeen healthy
sources (all last errors null). No adapters, source configuration or ranking
signals changed in this formatting/lint iteration. Recorded ranking fixtures
remain offline evaluation data.

Iteration 52 (2026-11-02): live ingestion checks passed with 708 stored URLs and
seventeen healthy sources. An explicit Anthropic Haiku transport check scored
three real stored headlines, validated IDs/importance bounds and cached the result
for $0.000147. Anthropic is an editorial dependency, not another content source;
these verification scores are not published selections or evidence of ranking
quality. Automatic editions still use signal ranking.

### Iteration 87: free X citation harvesting

Feed descriptions, summaries, Atom content and RSS content:encoded are inspected
before HTML removal/truncation; HN destination URLs and text are inspected too.
Only exact X/Twitter hosts and numeric status paths are accepted, normalized by
post ID, and persisted in x_link_citations with source/item provenance and the
citing item's engagement snapshot. This is discovery evidence, not verified post
content, post engagement, independent outlet counts, or a publishable SocialPost.
No X request or inference is made. Repeated ingestion updates citation snapshots
without duplicating observations. Missing links on a later fetch do not delete
historical evidence. Feed bodies can omit embedded tweets; article retrieval,
Reddit/Techmeme/Memeorandum harvesting and official embed verification remain next.

YouTube: **deferred** by owner instruction; no research or implementation planned.

Live verification: two queued passes on 2026-11-02 stored 779 article URLs across
four topics, all seventeen sources healthy. Harvesting persisted 72 citations to
68 distinct post IDs from seven sources (Ars Technica, Eurogamer,
GamesIndustry.biz, PC Gamer, PlayStation Blog, Rock Paper Shotgun and Yahoo NBA).
These are real fetched publisher references; post existence/content/publication
time remain unverified, and World coverage has no harvested citations yet.

### Iteration 88: official X verification

Added `pnpm exec tsx apps/api/scripts/verify-x-embeds.ts`: at most ten IDs
selected from stored citations by source diversity and recent observation. Uses
the shared rate-limited HTTP client and official `publish.twitter.com/oembed`
(follows the official redirect to `publish.x.com`). Stops on HTTP errors; failed
IDs cool down for one day. No direct x.com fetch, scraping workaround or inference.

Live checks returned HTTP 404; no verified posts were stored. Separate
`social_posts` stores successful official responses and author metadata, while
`x_embed_checks` tracks failed attempts. Post timestamp and engagement remain
unknown: citation dates/engagement must never masquerade as post metadata.
Synthetic protocol fixtures test successful verification and database upserts;
they are not live content. Rendering/ranking and discovery expansion remain next.
Stored HTML is provenance only: future UI must render by ID with the official
widget and must never inject the stored HTML.

### Iteration 89: public rivers and named X verification URLs

`pnpm exec tsx apps/api/scripts/harvest-social-rivers.ts` performs one bounded
shared-client request per enabled configured river. Migration 018 stores
Techmeme (Tech & AI) and Memeorandum (World) as topic data, with separate page
citation provenance, last success/error/count and first/last observation times.
These are public aggregator pages, not article content. Since iteration 94 the worker also runs this harvesting hourly. Successful empty pages are recorded honestly; historical
citations survive later absence. Deleted/disabled topics stop collection.

Live Techmeme homepage: 50 distinct X references stored (the extraction cap).
Live Memeorandum homepage: zero status links; RSS feeds for both returned 200
but no X links. Neither extra page nor feed is counted as a publisher outlet or
as independent reporting. Techmeme includes crypto/promotion, so relevance and
quality filtering are required before any digest selection. Reddit NBA public
`top.json?t=day&limit=5` returned 403 with our reader User-Agent; no workaround.

Investigating the earlier 404 exposed a verification defect: oEmbed returns
404 for `/i/web/status/ID` while the discovered `/handle/status/ID` succeeds
for the same ID. Harvesting now retains the named URL alongside the dedupe URL,
including refreshed publisher observations. Verification also accepts the
endpoint's current `provider_name: X` as well as `Twitter`, retaining exact
host/ID, author and active-HTML validation. No direct X scraping is used.
Ten real posts verified and stored after these fixes; post timestamps and
engagement remain unknown. They are not yet selected or displayed in digests.
The earlier claim of endpoint-wide blocking is superseded by this live result.
Recorded river markup excerpts remain offline fixtures, never production input.

### Iteration 90: verified X post time

Official oEmbed still supplies no structured publication time or engagement.
After official verification, modern X Snowflake IDs yield millisecond creation
time from their high bits and the X epoch (1288834974657). BigInt preserves ID
precision. Legacy/transition-era decoded dates before 2011, malformed IDs,
IDs beyond signed 64-bit range and future timestamps remain unknown. Citation
observation times are never used as post times; metrics remain empty.

The explicit embed verifier now also backfills missing times on already verified
stored posts without HTTP requests, preserving evidence and verification times.
Repeated backfills do nothing; later embed refreshes fill missing publication
time and never erase a known time with null. No database migration is needed.
Live backfill dated all ten existing verified posts: 2026-11-01 03:04:31.487Z
through 06:46:05.919Z. This establishes window metadata, not topical relevance,
virality or selection eligibility by itself. Posts are still absent from digests.

### Iteration 91: conservative verified-post eligibility

Read-only `screen-social-posts.ts START_ISO END_ISO` inspects verified posts
associated with a topic's publisher connections or discovery rivers. Only the
single post paragraph from stored official oEmbed is text evidence: author,
footer, HTML attributes and URL targets do not imply relevance. Missing or
ambiguous paragraphs fail closed. Saved include/exclude phrases use normalized
whole phrases; no positive rules means no eligibility. Crypto/promo and explicit
engagement-bait phrases are excluded before positive matching. This lexical
screen is conservative and can miss relevant posts; it is not Haiku triage,
semantic understanding, independent-source verification or a virality score.

Ten further official oEmbed requests succeeded, bringing stored real verified
posts to twenty (ten Tech river, ten NBA publisher discoveries). For
[2026-11-01, 2026-11-02) UTC none qualify: Tech has two Bitcoin exclusions,
seven phrase misses and one missing unambiguous paragraph; all NBA posts predate
the window. For [2026-10-26, 2026-11-02), three NBA posts pass saved phrase rules.
Gaming/World have no verified candidates. No paid inference or new source
configuration; Reddit remains blocked by the previously observed 403. No posts
are selected or displayed in digests yet.

### Iteration 92: immutable preliminary post selections

New editions copy verified, topic-scoped posts inside the publication transaction,
including author, post time, paragraph text, metrics and eligibility reason. Saved
post budgets (including zero) apply, repeated normalized text uses one slot, and
selection is newest-first from at most 500 in-window verified candidates. The
method `verified-lexical-recency-v1` is preliminary: no semantic interestingness,
independent-source count or virality is inferred. Unknown engagement stays empty.
Raw embed HTML is not included in the public snapshot. Historical editions are
unchanged; official widget rendering is still pending.

The read-only `screen-social-posts.ts` command now also returns exact selections.
Live Oct 26–Nov 2 UTC replay selects three NBA posts and zero for other topics;
this is stored real content, not a newly published edition or broader coverage.
No HTTP or inference is used by selection. Reddit remains blocked (403).

### Iteration 93: lazy official X widgets and readable fallback

Digest topics with saved post selections now show a separate Top posts section.
The browser loads one official `platform.twitter.com/widgets.js` script only
when a selected post approaches the viewport, then asks `createTweet` to render
that exact saved ID with media. No stored oEmbed HTML is injected. Saved text,
author, timestamp and original link remain readable when widgets are blocked or
unavailable; unknown engagement remains absent. Picks are visibly preliminary
(topic matching and recency), without claims of AI selection or virality.
Historical editions without post fields remain unchanged; quiet windows stay empty.

Read-only desktop/mobile replays use the three real NBA selections from the
Oct 26–Nov 2 window, without publishing or changing the latest live edition.
`posts-blocked-*.png` captures the blocked-widget fallback, explicitly labeled as
a replay. The deterministic smoke uses a widget protocol stub, not live media.
Broader relevant discovery and Reddit remain open.

Separate explicit `POST_EMBED_LIVE=1` checks rendered official video thumbnails
on desktop and mobile (`posts-live-*.png`); mobile appearance was inspected.
Multi-post live checks intermittently raised an exception inside X's widget
script, although another full replay passed. Explicit live checks are bounded
to one real post per topic; deterministic checks still exercise all selections.
Provider availability is external; saved text remains accessible in a disclosure
even after widget creation succeeds, and original links remain available. No X scraping or inference was used.

### Iteration 94: scheduled free collection

The worker runs `social-collection` hourly (one concurrent job, no automatic
retries): one shared-client fetch per enabled river, then at most ten official
oEmbed checks. Verification uses persisted one-day cooldown and stops at its
first unavailable/invalid response. Failed rivers retain sanitized errors and
do not block other rivers. Database failures fail the job visibly. Completed
jobs retain bounded aggregate counts; queue health appears in Status. No xAI,
Anthropic, direct X scraping or inference calls are part of this job.
The first scheduled live pass completed with two successful pages, 50 observed
citations and ten successful official verifications, with no errors. These counts
are observations/checks, not ten newly discovered or newly selected posts. The
existing daily digest was not regenerated for this verification.

### Iteration 95: spread bounded verification across topics

Embed candidates now come only from enabled topics and connected publisher
sources or configured rivers. Within the ten-request cap, topic ranks interleave
before taking further posts from a busy topic; shared post IDs consume one slot.
Unverified discoveries precede refreshes of stored posts, with the existing
one-day check cooldown preserved. Within each topic citation-source breadth,
recent observation and descending numeric-ID order break ties. Source breadth
is discovery priority only, not independent reporting or post virality.

One explicit live pass verified four posts and stopped at the first official
HTTP 404 (five requests total). Stored coverage now has 21 Tech, 12 NBA and one
Gaming post; World has none. The first Gaming post predates the checked window.
Read-only Oct 26–Nov 2 06:00 UTC screening selects five NBA posts and zero for
other topics. No new edition was published, and no inference was requested.
Broader current discovery, particularly World and Gaming, remains unfinished.

### Iteration 96: bounded publisher-page X citations

`pnpm exec tsx apps/api/scripts/harvest-article-x-links.ts` checks at most eight
recent stored articles from explicitly opted-in exact publisher hosts, interleaved
across enabled topics. Migration 019 opts in Ars Technica, Yahoo Sports, Guardian,
PC Gamer and Eurogamer. Only three-day-old or newer, nonfuture HTTPS article URLs
qualify. The shared safe client enforces rate limits, response limits and error
backoff. A host failure skips its remaining candidates in that pass. Page checks
persist for seven days on success and one day on error; there is no recursive
crawl, scheduling, direct X fetch, inference or protection workaround.

The explicit live pass read six pages, observing one ESPNNBA status citation in
Yahoo's Yaxel Lendeborg article (ID 2117105625003921444). That citation was already
stored from the feed: this pass establishes page discovery, not new post coverage.
Two Guardian and two Ars pages had no status links; another Yahoo page was empty.
One PC Gamer page failed; its remaining page was skipped. Eurogamer pages were
not reached in this cap. These article outcomes do not change healthy feed status.

Only validated status links are retained in existing item/source citation storage,
with named verification URL and citing-item engagement; no full article text is
stored. Existing post verification/screening applies before selection. Citation
counts do not establish post engagement, independent reporting or relevance.
The recorded Yahoo anchor excerpt is offline-only, never seeded into production.
Broader current World/Gaming discovery and direct capped xAI remain unfinished.

### Iteration 97: hourly publisher harvesting

The existing hourly `social-collection` worker now runs the bounded article pass
between river harvesting and official embed verification. The same shared HTTP
client, eight-page cap, opted-in hosts, enabled-topic interleaving, persisted
seven-day success/one-day error cooldown and failed-host stop apply. Page errors
are recorded and verification continues; persistence failures fail the job. No
automatic job retries, inference, new hosts or recursive crawling were added.
Completed BullMQ results retain separate `articleDiscovery` checked/citations/errors
counters. `pnpm exec tsx apps/api/scripts/smoke-social.ts` explicitly queues one
live pass; it is excluded from tests and never publishes an edition.

The actual queued pass (job 8) collected two rivers/50 references, read six pages
with five citations, recorded one page error and verified ten official embeds
without errors. Citations may already exist; these counts are not new-post counts.
The Oct 26–Nov 2 06:00 UTC read-only screen selects five NBA posts and one Gaming
post (jobolts_ costume screenshot, ID 2115558495626117351, Oct 28). The Gaming
post passes the saved phrase `game`; this is not a demonstrated viral or editorial
pick. Tech and World select zero. No edition was published or inference requested.
World discovery, stronger Gaming relevance and direct capped xAI remain open.

### Iteration 98: wider publisher opt-ins and publisher rotation

Migration 020 opts in exact hosts for BBC (`www.bbc.co.uk`), NPR (`www.npr.org`),
GamesIndustry (`www.gamesindustry.biz`), Rock Paper Shotgun
(`www.rockpapershotgun.com`), PlayStation Blog (`blog.playstation.com`) and Xbox
Wire (`news.xbox.com`). An explicit shared-client probe read three recent stored
article URLs per publisher: all eighteen returned pages; only PlayStation's
Oct 30 “Share of the Week: Costumes” page contained status links (five). Probe
results were diagnostic only, not inserted as verified posts. Empty pages do not
establish that a publisher never embeds X.

Within each enabled topic, page candidates now take one recent article per
publisher before a second from a busy publisher. Topics still interleave; shared
articles dedupe, the total cap remains eight, and existing exact-host checks,
three-day article age, persisted cooldowns and failure handling remain. An isolated
DB regression proves an older quiet publisher gets a slot ahead of nine newer
articles from a busy publisher. Fixtures never enter production.

Explicit queued live `smoke-social.ts` job 11 read seven publisher pages, stored
three citation observations, recorded one unavailable PC Gamer page and verified
ten official embeds; two rivers supplied fifty references without errors.
The BBC and Rock Paper Shotgun pages returned no status links. Citation counts
may include existing posts. Read-only Oct 26–Nov 2 06:30 UTC selection now yields
two Tech, five NBA, one Gaming and zero World posts. Gaming remains the previously
documented costume screenshot; these are preliminary lexical picks, not an AI
editorial or virality assessment. No edition was published or inference used.
The direct capped xAI adapter is the next discovery step; World coverage remains
unresolved by free harvesting alone.

### Iteration 99: separate X-discovery budget ledger (no paid searches)

Migration 021 adds `x_discovery_calls` and a durable prepaid-credit block, separate
from Anthropic editorial spend. Reservations serialize across processes and obey
$0.40/day and $12/month UTC caps. Pending/uncertain requests retain their funds
across day/month boundaries; only a definitive unbilled rejection releases them.
Settlement stores model, `purpose=x-discovery`, run, input/output tokens and all
posts/profiles fetched, including repeats. Costs round up to microdollars;
actual overruns are retained in full and flagged, never clamped to an estimate.
Depleted prepaid credits block new reservations until explicit operator review,
without automatic midnight/monthly clearing. Status displays these separate caps
and reservations; the read-only command is `x-discovery-status.ts`.

Reviewed https://docs.x.ai/developers/tools/x-search and
https://docs.x.ai/developers/tools/tool-usage-details on 2026-11-02. Usage lives in
`usage.server_side_tool_usage_details.x_posts_fetched` / `x_users_fetched`.
The documented `max_turns` bounds rounds, **not individual calls or fetched items**;
a reservation is an estimate, not a provider-enforced request cost ceiling.
The transport must address this exposure before scheduled paid searches, using
narrow handles/dates, minimal turns, conservative reservation and measured usage.
Pricing is supplied explicitly to settlement (owner reference: Grok 4.3 $1.25/$2.50
per million input/output tokens; $0.005/post and $0.01/profile). Model selection,
account data, direct HTTP discovery and automatic publication remain unfinished.
No xAI inference call was made, and xAI remains `not yet tried` as a content source.
Isolated tests clear both Anthropic and xAI credentials; ledger fixtures are not
live content. No change to provider/model routing or billing configuration.

### Iteration 100: explicit direct X search adapter (no paid searches)

Reviewed the official model table, X search guide and OpenAPI on 2026-11-02:
https://docs.x.ai/developers/models.md,
https://docs.x.ai/developers/tools/x-search.md and https://docs.x.ai/openapi.json.
The owner-selected Grok 4.3 is listed at $1.25 input/$2.50
output per million tokens below 200k, tied with the 4.20 variants. The adapter
retains that selection; it does not adopt a newer, more expensive model. The adapter pins Grok 4.3, one round, no parallel calls,
1000 visible output tokens, no provider response storage, and image/video off.
It uses one enabled topic's stored curated handles (1–20) and UTC date-only bounds
(up to seven days). Migration 022 seeds the four topics only if accounts are empty.
The prompt requests one keyword search/five results and avoids profiles/threads;
these prompt requests do not guarantee a maximum fetched-item cost.

The obsolete manual curated-account command was removed in iteration 1056.
Production accepts only fixed keyword requests; historical request builders
remain available for replay tests.

Settlement requires actual `x_posts_fetched` and `x_users_fetched` counters;
missing/invalid usage, transport failures, 429 and 5xx retain charged uncertainty.
Explicit depleted-credit errors persist the durable block. Only valid X URLs in
completed assistant citation annotations are retained, deduped and capped at five.
Generated prose URLs/engagement are ignored. Separate call/topic provenance joins
existing topic-interleaved official verification and post selection; citations
alone never become verified SocialPosts. Spend settles before citation persistence.
Synthetic schema examples and isolated DB tests are offline only. No paid call,
new live X content or publication is claimed; source remains `not yet tried`.

### Iteration 101: first measured direct World search

One explicitly enabled Grok 4.3 search on 2026-11-02 06:17 UTC covered
2026-11-01 through 2026-11-02 with the nine saved World accounts. Ledger call
`06b8e88f-11f1-427f-850b-11e0b31a44d2` settled 5,771 input tokens, 2,467
output tokens, two fetched posts and zero profiles at **$0.023382**. The output
usage exceeds the 1,000 visible-token limit, consistent with reasoning usage;
never use that limit as a billing ceiling. No retry or second paid call occurred.

Two real citations were stored: `2116774062907138317` and
`2117118592390951258`. Neither supplied an author-qualified URL. The official
verification pass verified two unrelated discoveries then stopped at HTTP 404;
a bounded call-specific check also stopped on an unavailable generic URL. Both
cited IDs now have unavailable checks and neither has a stored SocialPost.
World selection for the requested half-open day remains empty. Source `live`
here means fetched citation records, **not verified post content**. No quality
or virality judgment is possible from those IDs; no edition was published.

`pnpm exec tsx apps/api/scripts/report-x-discovery.ts` reports the last twenty
ledger calls with cost, fetched-item counts, citation/named-URL counts and current
verification yield. It performs no HTTP or inference and prints no model prose,
keys or headers. Verification state is current rather than historical attribution;
it does not establish editorial quality or window eligibility. This single
measurement cannot justify a daily forecast, scheduling or a smaller reservation.
Next investigate author-qualified citation recovery without guessed handles or
paid retry searches; keep paid scheduling disabled and the $0.40 reservation.

### ID-only official verification repair (iteration 102)

The official oEmbed endpoint resolves `https://twitter.com/i/status/ID`
without a guessed author. The previous `/i/web/status/ID` fallback returned
404 for the two measured World citations. The adapter now uses `/i/status/ID`
when no named discovery URL exists; named URLs and all response validation stay
unchanged. Canonical stored links remain `/i/web/status/ID`.

An explicit free, two-ID recheck on 2026-11-02 verified both
`2116774062907138317` (Nov 1 06:07 UTC) and `2117118592390951258`
(Nov 2 04:56 UTC) as BBCWorld posts and stored their official embeds.
The recheck intentionally bypassed the old failed-check cooldown once after the
URL repair; routine hourly cooldowns remain unchanged. No xAI request was made.
The original discovery citations remain unnamed; the cost/yield report now
shows two verified posts, zero unavailable checks, and unchanged $0.023382 cost.
A recorded official BBCWorld oEmbed response is replayed in offline tests.

Neither World post passes preliminary screening: World has no positive phrase
rules, so the conservative lexical gate rejects both. No edition was published,
and verification does not establish relevance, virality or editorial quality.
Semantic social editing with topic descriptions/guidance is the next gap;
paid discovery remains unscheduled.

### Semantic social candidate diagnostic (iteration 103)

`triage-social-posts.ts START_ISO END_ISO` reads stored verified posts only,
including direct-search citations. It retains half-open time, verified text,
spam/promotion and explicit topic exclusions, while allowing empty positive
phrase rules into semantic triage. It checks social-specific caches without
HTTP/inference/publication. Nov 1 00:00–Nov 2 06:30 UTC: 25 Tech, 14 NBA,
zero Gaming and two World candidates, all unscored. These are candidate counts,
not relevance or virality claims. Existing lexical publication remains unchanged.
The shared bounded triage service now has social interestingness instructions,
separate `social-triage-v1` purpose and per-item caches; Sonnet picks and
publication integration remain unfinished. No inference spend in this step.

### Direct-search publication scope repair (iteration 104)

Edition post selection now includes verified posts cited by `x_search_citations`
for the exact topic, alongside feed and river citations. Previously only the
read-only candidate diagnostic included direct search. Citation-only IDs still
cannot enter an edition: the query starts from verified `social_posts`, applies
the coverage window, and retains lexical screening, text dedupe and budgets.
Multiple discovery routes do not add slots or imply independent coverage.
Existing editions and scheduled retries retain their frozen snapshots.
The two real World citations remain verified, but empty positive phrase rules
still prevent lexical publication; semantic triage and final picks remain next.
No new discovery call, inference spend or edition publication in this step.

### Social final-pick service (iteration 105)

A standalone social editor now accepts at most ten scored verified-post inputs,
selects supplied IDs and returns context/rationale without replacing original
text. It uses the shared Anthropic reservations/cache and Sonnet-to-Haiku
fallback under a separate social purpose. Offline fake responses cover identity,
quiet selections, malformed outputs, unsupported absence and budget refusals.
This is not live editorial evidence: publication still uses lexical selection,
and no discovery or inference call was made. Next connect semantic triage,
shortlist construction and immutable per-topic post editorial metadata.

### Semantic post publication (iteration 106)

Manual and scheduled editions now use safety-screened verified posts from the
existing exact-topic feed, river and direct-search scope. Up to 200 deduplicated
posts receive Haiku triage using topic description/guidance; complete scores
supply a maximum ten-item shortlist (relevance ≥6, interestingness ≥4) to the
budgeted final editor. Positive phrases remain the non-AI fallback. Explicit
exclusions and half-open windows apply before either path. Quiet AI selections
stay empty; incomplete triage or unavailable editing retains lexical picks.
Immutable snapshots store triage, model, method, original post text and editor
context/rationale. The UI labels AI and fallback picks separately. This step
uses fake responses in isolated DB tests and synthetic context over saved real
posts in browser replay, not a real semantic edition or virality evaluation.
No new discovery route, paid search or live inference was used. Next inspect
the first scheduled semantic edition and improve weak Gaming discovery.

### Citing-story links (iteration 107)

New editions copy links from selected posts to selected stories whose lead,
coverage or editor evidence articles explicitly cite that post in
`x_link_citations`. The UI says “Coverage citing this post” and jumps to the
story within the edition. This records a citation relationship, not a semantic
same-event judgment. Missing citations produce no links. Historical editions
remain unchanged. Browser replay uses saved real posts with explicitly
synthetic coverage relationships; it is not a published edition. No new source,
inference or discovery spend. The next scheduled slot is 20:40 UTC Nov 2.

### Iteration 108: Eurogamer free publisher discovery

Enabled exact-host `www.eurogamer.net` article discovery through migration 023,
using the existing publisher/topic rotation, eight-page cap, shared HTTP client
and persistent cooldowns. Three explicit public-page probes all succeeded; the
“At Dead of Night 2” announcement page exposed a named DSDigitalDev X link.
A bounded three-page harvest stored that real citation with Eurogamer article
provenance (post `2052420737714040869`, already officially verified as Brian
Clarke). Its timestamp is May 7, 2026, so it is not a current-window Gaming pick.
The ordinary queued pass checked seven pages, recorded zero citations and one
unavailable page; a separate three-recent-page pass found no links. These small
checks establish access and a citation route, not current quality or virality.
No paid discovery, inference, publication or X scraping was performed. Paid
scheduling remains off; today's remaining allowance is below the conservative
$0.40 reservation required for another explicit search.

## 2026-11-02 iteration 121 — Nintendo Life RSS

- **live:** `https://www.nintendolife.com/feeds/latest`, connected to the original
  Gaming topic by migration 024. Two queued ingestion passes stored 25 real
  articles (release/platform news with excerpts and lead images); eighteen healthy
  sources now supply 899 distinct URLs across four topics.
- Recorded the first two fetched entries in `nintendo-life.xml`; offline adapter
  checks preserve decoded headlines, exact UTC dates, publisher links and plain
  excerpts. Fixtures are not the live ingestion evidence.
- Free social discovery probes: all 25 feed entries contain zero X status links.
  The three newest article pages returned HTTP 403; publisher-page harvesting
  stays disabled. This improves article coverage, not fresh social coverage.
- **blocked:** IGN's `https://feeds.ign.com/ign/all` redirects to
  `https://www.ign.com/rss/articles/feed`, which returns HTTP 403. Not configured;
  no bypass attempted. No paid discovery or inference calls.

## 2026-11-02 iteration 122 — Game Developer and VGC

- **live:** `https://www.gamedeveloper.com/rss.xml` (50 real stored articles)
  and `https://www.videogameschronicle.com/feed/` (10 real stored articles).
  Migration 025 connects both to the original Gaming topic, without changing
  other topics or enabling publisher-page harvesting.
- Game Developer adds industry/development coverage; its newest fetched item is
  dated October 30. VGC includes November 2 studio closure and release reports.
  Availability does not establish editorial importance or independent reporting.
- **blocked:** each publisher's three newest article pages returned HTTP 403
  during explicit public probes. No bypass attempted; no discovery host enabled.
  Neither fetched feed contains X status links, so this adds news coverage,
  not fresh social posts. Gaming social discovery remains incomplete.
- Recorded two entries per feed in `gamedeveloper.xml` and `vgc.xml`; existing
  offline normalization checks validate titles, HTTPS URLs and publication dates.
  Fixtures are replay data. Two queued live ingestion passes stored 960 total
  URLs across twenty healthy feeds, with no duplicates on the second pass.

## 2026-11-02 iteration 123 — Gaming feeds with X citations

- **live:** `https://gamingbolt.com/feed` (10 stored articles) and
  `https://www.pushsquare.com/feeds/latest` (25 stored articles), connected only
  to the original Gaming topic by migration 026. No article-discovery host enabled.
  Two queued ingestion passes confirm 997 distinct stored URLs across 22 healthy sources.
- Their public RSS includes three X citations: Phantom Blade Zero
  `2117074929594298758`, FromSoftware player support `2116088984703209689`,
  and Shiina `2116822592556580874`. Existing ingestion extracts encoded-content
  and description links and stores publisher/article provenance automatically.
- Official embed verification explicitly checked two new candidates successfully;
  all three citations now join stored verified posts. Post timestamps are Nov 2
  02:02 UTC, Oct 30 08:45 UTC, and Nov 1 09:20 UTC respectively. A newly published
  article does not make an older cited post fresh.
- Read-only last-24-hour screening at Nov 2 10:20 UTC rejects Phantom Blade Zero
  on lexical phrase rules; the other two are outside that window. Semantic
  scheduled selection remains unverified until the 20:40 UTC edition. This is
  discovery availability, not a virality or selection-quality measurement.
- Recorded two entries per feed in `gamingbolt.xml` and `pushsquare.xml`; offline
  checks assert exact citation IDs, dates, source hosts and excerpt bounds.
  Browser checks replay existing saved candidates with stubbed widgets and blocked
  fallbacks; no edition published or live inference used.
- **not yet tried** for configured ingestion: Gematsu, Destructoid and Siliconera
  public feeds returned 200 but no X links; left unconfigured in this iteration.
  Gematsu homepage returned 403; no bypass. No paid search or provider changes.

## 2026-11-02 iteration 124 — GamesRadar+ and GameSpot RSS citations

- **live:** `https://www.gamesradar.com/feeds.xml` (50 stored articles) and
  `https://www.gamespot.com/feeds/mashup/` (15 stored articles), connected to
  the original Gaming topic by migration 027. Two queued ingestion passes
  confirm 1,063 stored URLs across 24 healthy sources and an idempotent second pass.
- GamesRadar's `/feeds/all/` redirects through HTTP. Initial worker collection
  correctly rejected that redirect; direct final HTTPS `/feeds.xml` succeeds.
  Corrected the unpublished migration and the already-applied local source URL;
  no relaxation of the shared client's HTTPS policy.
- Five distinct stored X IDs: `2115337924376141927`, `2116073492521394429`,
  `2116088984703209689`, `2116173308005638609` (GamesRadar), and
  `2116827467977527751` (GameSpot). Four newly verified official embeds, zero
  failures; the FromSoftware support post was already verified. Original post
  dates range October 28 to November 1 09:39 UTC, all outside the checked
  November 1 10:20–November 2 10:20 UTC window. No freshness/virality claim.
- Recorded two original XML entries per feed; offline checks assert exact X IDs,
  publisher hosts, dates and excerpt bounds. Fixtures are replay data. Feed scope
  includes entertainment/deals; collection does not establish Gaming relevance.
- **not yet tried** for configured ingestion: Shacknews and DualShockers feeds
  returned 200 but no X links in explicit probes; left unconfigured. No article
  crawling, paid discovery, inference or edition publication in this iteration.

## Iteration 125: configurable X search accounts

Manage topics → Edit now exposes each topic’s saved X account list, also
available on topic creation. Use one handle per line (an initial @ is accepted
in the UI), up to 20 unique handles of 1–15 letters, digits or underscores.
The API accepts bare handles and rejects case-insensitive duplicates. Older
updates omitting accounts preserve the saved list; an explicit empty list
clears it. Direct discovery reads these saved lists. Saving settings makes no
external requests and paid discovery scheduling remains off. Free publisher
and river citations still follow connected sources rather than account lists.
No new social source, paid call or published edition in this iteration.

## Iteration 126 — Hoops Rumors NBA RSS and free X citations

- `https://www.hoopsrumors.com/feed` is **live**, connected to the original NBA
  topic by migration 028. Two queued ingestion passes stored 15 real articles
  and 21 distinct X citations with publisher provenance; no article crawling.
  The complete collection now contains 1,081 distinct URLs across 25 healthy sources.
- The bounded official verifier added ten posts without failures after collection
  (an earlier overlapping pass verified one other candidate). Thirteen of the
  21 cited IDs now have official embeds, including NBA Communications, Hornets
  PR and NBA reporters. Twelve of those thirteen posts fall in the checked
  Nov 1 10:30–Nov 2 10:30 UTC window; the older citation retains its real date.
- Read-only lexical screening accepts NBA Communications and Hornets PR posts;
  some reporter posts lack a configured phrase. Existing newer NBA candidates
  fill the five fallback slots. No semantic selection, engagement/virality or
  published-edition improvement is claimed; next scheduled semantic run is 20:40 UTC.
- Recorded two original RSS entries, preserving XML namespaces and embedded X
  links. Offline assertions cover all six exact cited IDs, article dates, title,
  attribution, publisher host and plain bounded excerpts. Fixtures are not live data.
- BasketNews `/feed` returned HTML and NBC Sports `/nba.rss` returned a small
  non-feed response; neither was configured. No bypass attempts or paid calls.

### Conservative post duplicate correction (iteration 127)

New lexical/semantic selections use method versions `verified-lexical-recency-v2`
and `verified-semantic-editor-v2`; historical v1 snapshots remain readable.
Duplicate keys preserve symbols and numbers, so `+5%` and `-5%` or `5.5` and
`55` cannot collapse. They also retain decoded paragraph link targets: identical
captions with different clip/shortened URLs remain separate. No link resolution
or media-identity inference is performed. Long captions (at least twelve words)
with an explicit leading `RT @handle:` share a slot with matching original text
and links; short repost captions stay separate. The newest matching eligible post
wins before either lexical budgeting or semantic triage. This is conservative
text/link matching, not general same-event or near-duplicate detection.
Recorded/synthetic checks cover distinct claims, negation, links, copied reposts,
new-edition behavior and immutable retries. No new source or paid call is needed.

### Iteration 128: publisher-host failure cooldown

The bounded article discovery pass now excludes an exact host for one day after
any saved page failure, across subsequent jobs and process restarts. Previously
only the failed article waited a day, allowing later hourly jobs to try other
pages on the same unavailable host. Other publishers remain eligible; successful
pages still wait seven days. This does not affect RSS collection or official X
verification. Isolated database checks cover cross-page suppression, unaffected
publishers, expiry and recovery.

Explicit public probes: Push Square's current Phantom Blade Zero article returned
HTTP 403; article harvesting stays disabled. GamingBolt's current Phantom Blade
Zero article returned HTTP 200 and contains the already-known
`2117074929594298758` citation. No new citation, stored post or fresh-coverage gain
is claimed; GamingBolt page harvesting also remains disabled pending broader
access checks. No protection bypass, inference call or paid discovery.

## GamingBolt public-page discovery — iteration 129 (2026-11-02)

Six recent stored article URLs returned public HTML through the shared HTTPS
client (47–51 KB each). The Phantom Blade Zero sales article exposed the named
`pbzero_official/status/2117074929594298758` citation already collected from RSS;
five other articles exposed no X links. These are live access observations, not
new posts or evidence of virality. No blocked-host workaround was used.

Migration 029 opts only `gamingbolt.com` into existing hourly article discovery:
exact host, recent stored articles, publisher rotation, eight pages per pass,
seven-day successful-page cooldown and one-day host cooldown after failure.
No recursive crawling, paid search or model call. The first explicit mixed-host
pass checked eight pages, recorded four citation observations and had zero errors;
those observations do not imply four new posts. RSS remains independently live.

## Scheduled social availability — iteration 130 (2026-11-02)

Read-only checks during this iteration for the upcoming Nov 1 20:40–Nov 2
20:40 UTC edition window found semantic candidate pools of 9 Tech & AI, 26 NBA,
1 Gaming and 2 World posts. Lexical fallback selects 3, 5, 0 and 0 respectively.
Gaming has 17 scoped verified posts, but 16 are outside this window; the one
remaining post still requires semantic relevance/interestingness selection.
World's two safety-eligible posts also lack lexical fallback matches. All 38
candidate triage scores are currently uncached. No inference, publication,
external requests or new discovery was performed for this report. Counts reflect
stored content so far, not the final future window or evidence of virality.

`screen-social-posts.ts` now reports separate safety/lexical counts and the exact
bounded semantic pool. `triage-social-posts.ts` now uses publication's selector
instead of its former independent filter, fixing diagnostic drift for duplicate
posts, disabled post budgets and the initial SQL cap. Source statuses unchanged.

## Destructoid RSS — iteration 131 (2026-11-02)

- **live:** `https://www.destructoid.com/feed/` returned 30 articles (233 KB),
  including guides, opinion and news. Migration 030 connects the feed to the
  original Gaming topic without changing ranking or topic guidance. Collection
  does not establish importance or relevance.
- Full encoded RSS content exposes one distinct X citation,
  `S14deane/status/2116086082341306812`, in an October 31 Destiny/Bungie article.
  It is outside the upcoming Nov 1 20:40–Nov 2 20:40 UTC daily window; no
  current-window improvement or virality claim.
- Three newest public article pages returned 200 but no X links. Page harvesting
  stays disabled: current pages are guides and the feed already exposes citations.
- Gematsu RSS returned 20 entries/no X links; its newest article returned 403,
  so probing stopped and no source/page harvesting was configured. VideoGamer
  RSS returned 30 entries/one older citation; Siliconera RSS returned 15/no
  citations. Neither was configured. No access workarounds or paid calls.
- Two original Destructoid entries, with XML namespaces and encoded content,
  are recorded for offline citation/date/author/host/excerpt regression.
  Fixtures are not live content.
- `pnpm migrate` and two queued `smoke-ingestion.ts` passes stored all 30
  source articles; repeat collection was idempotent. Total: 1,118 stored URLs
  across 26 healthy sources. Bounded `verify-x-embeds.ts` verified the one
  new citation with no failures; Gaming now has 18 scoped verified posts,
  17 outside the upcoming window. Readiness remains 9/26/1/2 by topic.

## Al Jazeera World coverage — iteration 132 (2026-11-02)

- **live:** `https://www.aljazeera.com/xml/rss/all.xml` returned 25 real
  articles, including Sudan, Yemen and US election coverage. Migration 031
  connects it to the original World topic. This is a general feed with some
  sports/opinion content; collection does not imply editorial selection.
- No X links in the feed or three sampled public articles (all HTTP 200).
  Publisher-page harvesting stays disabled; no social coverage gain claimed.
- France 24's general English RSS returned 24 entries/no X links; three
  sampled video pages returned 200/no links. The attempted international RSS
  path returned 404. Not configured. No bypass, paid discovery or inference.
- Two original Al Jazeera RSS entries are recorded for offline headline,
  timestamp, host, excerpt and absent-metadata/citation checks. Fixtures are
  not live evidence.
- `pnpm migrate` and two queued `smoke-ingestion.ts` passes stored 25 new
  Al Jazeera articles; repeated collection was idempotent. Total: 1,144 stored
  URLs across four topics and 27 healthy sources. No new edition published.

## Free collection visibility — iteration 134 (2026-11-02)

Status now shows up to 20 retained social collection jobs, with separate river,
publisher-page and official embed counters. The latest retained hourly pass
finished at 10:39:10 UTC: two rivers, 50 citation observations, eight publisher
pages, one page citation, ten successful embed checks and no reported errors.
These can include previously known citations and embed refreshes; they are not
new-post counts or a relevance/virality measurement. Earlier completed passes
include partial errors, now visible without reading Redis. Historical results
without the current counter shape explicitly show counts unavailable.
Source configuration and paid-discovery scheduling are unchanged. No external
social request, paid discovery, inference or publication was needed for this UI.

## Iteration 135 — Aftermath Gaming RSS (2026-11-02)

- **Live:** `https://aftermath.site/feed` supplies 15 stored articles, connected
  to the original Gaming topic by migration 032. Includes industry reporting,
  interviews and opinion about adjacent technology/culture; ingestion does not
  imply editorial relevance. No publisher-page harvesting configured.
- Two queued collection passes are idempotent: 1,161 total stored URLs across
  four topics and 28 healthy sources. The increase includes two new URLs from
  existing sources as well as Aftermath's 15.
- Feed content exposes three distinct X citations; all three passed official
  oEmbed verification. Their decoded timestamps precede Nov 1 20:40 UTC, so
  none adds a candidate to the upcoming Nov 2 20:40 daily edition. Gaming now
  has 21 scoped verified posts, but only one semantic candidate for that window.
  No engagement/virality or new-selection claim.
- Recorded first two original feed entries in `fixtures/aftermath.xml` for
  offline dates, bounded plain excerpts, exact citation identities and the
  uncited first article. Fixtures are never live evidence or production seeds.
- Also probed public `https://automaton-media.com/en/feed/`: 30 parseable
  articles, latest Oct 31, no feed X citations. Not connected; no page probe,
  bot-protection bypass, paid discovery or inference.

## Iteration 137 — World citation refresh and bounded feed probes (2026-11-02)

- Existing **live** Guardian World feed supplied the named X citation
  `CPhilpOfficial/status/2117178880029085938`; official oEmbed verification
  succeeded. Its decoded timestamp is Nov 2 08:55:54 UTC, inside the upcoming
  daily window. Verification establishes availability, not relevance or virality.
- Read-only daily screening after collection: Tech 9/NBA 26/Gaming 1/World 2
  semantic candidates; lexical fallback selections 3/5/0/0. No AI calls or
  publication. World still needs semantic selection, and the window is incomplete.
- **Rejected for this social expansion:** The Kyiv Independent's advertised
  `https://kyivindependent.com/news-archive/rss/` returned 15 items/no X links;
  its first three public article pages returned 200/no X citations. The guessed
  `/rss/` path returned 404 before homepage discovery found the advertised URL.
- **Rejected for this social expansion:** Independent World RSS at
  `https://www.independent.co.uk/news/world/rss` returned 44 items/no X links
  (gzip decoded). Guardian US politics RSS returned 17 items/no X links;
  Guardian politics RSS returned 21 items and the same citation already in World.
  These feeds were not configured; no new page harvesting, bypass or paid calls.
- Two queued ingestion passes stored 1,172 URLs across four topics/28 healthy
  sources; repeat collection was idempotent. One bounded official embed check
  succeeded with zero failures. Source configuration remains unchanged.

## Iteration 139 — Gematsu Gaming RSS (2026-11-02)

- **Live:** `https://www.gematsu.com/feed` supplies 20 real articles, connected
  to the original Gaming topic by migration 033. It broadens studio, release,
  platform and sales reporting; rumors and weekly lists remain candidates,
  subject to selection rather than guaranteed digest slots.
- The fetched feed contains no X status URLs. Four sampled public pages
  (Nagoshi Studio, Phantom Blade Zero sales, weekly Japanese releases and Petit
  Planet) returned HTTP 403. Page harvesting remains disabled; no bypass,
  inferred posts, paid search or improvement in social coverage is claimed.
- First two original feed entries recorded in `fixtures/gematsu.xml` pin
  headlines, publication times, article hosts, bounded excerpts and absent X
  citations. Fixtures are offline evidence, not live content.

## Iteration 140 — Kotaku free Gaming citations (2026-11-02)

- Nov 9 iteration 1566: scheduled retry exhausted with upstream HTTP 522 at
  19:00 UTC; an explicit feed GET also returned 522. Iteration 1568 at 19:24 UTC
  still reports Kotaku in error, the only unhealthy source among 36. Iteration
  1569 confirms three more scheduled HTTP 522 attempts, exhausted at 19:30 UTC;
  these explain the RecentJobFailures alert. Last successful collection
  was 18:26 UTC (20 items). Keep the existing schedule; no bypass or adapter
  change for an origin timeout. Iteration 1570 at 19:40 UTC confirms the same
  last-attempt/last-success state; iteration 1571 at 19:52 UTC confirms it
  again, with 35 other sources healthy. Recheck natural recovery next iteration.

- **Live:** `https://kotaku.com/rss` supplies 20 stored articles, connected to
  the original Gaming topic by migration 034. Includes reporting, commentary,
  guides and lists; collection does not imply selection. Feed has no X links.
- Three explicit public article probes returned 200: Skyblivion lawsuit,
  Super Mario Bros. speedrun and leaked Portal prequel. The first two expose
  three distinct named X citations; the third contains none. Shared-client
  re-fetch persisted citations with article/source provenance. Exact-host
  `kotaku.com` discovery now uses existing publisher rotation, eight-page cap,
  three-day article window and persistent one-day failed-host cooldown.
- Official oEmbed verified Skyblivion `2116315667078996211`, orange
  `2116763103912161559` and SummoningSalt `2116778943940628612`.
  Their decoded timestamps precede Nov 1 20:40 UTC: no new candidate for the
  upcoming daily edition, engagement measurement or virality claim.
- First two original feed entries and one original speedrun embed block are
  recorded for offline date/host/excerpt and named-citation regressions.
  Fixtures are not live evidence or production seeds.
- Public Wccftech RSS also returned 20 items/no X links; three sampled pages
  returned 200 and one exposed an already-known Phantom Blade Zero citation.
  **Rejected for this expansion**, left unconfigured. Existing VGC feed was
  re-probed (10 items/no feed X links); its configuration is unchanged.
- Two queued ingestion passes: 1,220 URLs/four topics/30 healthy sources,
  repeated collection idempotent. Bounded embed pass: eight successes/zero
  failures, including refreshes and the three Kotaku citations.
- Read-only upcoming-window screening: semantic pools 9/26/3/2 and lexical
  selections 3/5/0/0. Gaming's two additional candidates are unrelated existing
  source citations, not these older Kotaku posts; semantic eligibility does not
  establish relevance. No paid discovery, inference or publication.

## Iteration 141 — Guardian US politics citations (2026-11-02)

- Public `https://www.theguardian.com/us-news/rss` returned 33 articles.
  Three sampled article pages returned 200 and exposed eight distinct named
  X citations, including political reactions and a political-show clip.
  Migration 035 connects the feed to the original World news & politics topic
  and enables existing exact-host bounded page discovery. Guardian US and
  Guardian World are the same outlet; this adds no independent-outlet claim.
- The live-blog citations include BernieSanders `2117003682382229741` and
  2waytvapp `2117033676525412562`, whose Snowflake timestamps fall inside the
  upcoming Nov 1–2 20:40 UTC daily window. Other sampled citations predate it.
  Discovery alone establishes neither official availability nor relevance,
  engagement or virality. Scheduled semantic selection is still pending.
- Two original RSS entries and the live blog's four original X anchor elements
  are recorded for offline dates/excerpts/named-citation regressions. These
  fixtures are not live content or production seeds.
- **Rejected for this social expansion:** France 24 English RSS (24 items),
  PBS NewsHour World RSS (20) and HuffPost World RSS (four) returned 200, but
  no feed X links or citations on three sampled pages each. Left unconfigured.
  BBC's alternate World feed was accessible but duplicates the existing BBC
  source; left unconfigured. No bypass, paid discovery or inference calls.
- **Live verification:** two queued ingestion passes stored 1,252 distinct URLs
  across four topics/31 healthy sources; repeated collection was idempotent.
  Shared-client discovery persisted all eight distinct citations from the
  sampled reporting pages (plus checked one newer opinion page with none).
  Two bounded official oEmbed passes verified all eight with zero failures.
- Read-only upcoming-window screening: semantic pools 9/26/3/4 versus
  9/26/3/2 before expansion; lexical selections remain 3/5/0/0. The two new
  World candidates are Bernie Sanders and 2WAY. Safety eligibility is not an
  editorial relevance judgment; no new edition was published.

## Iteration 143 — Insider Gaming reporting and free X citations (2026-11-02)

- **live:** `https://insider-gaming.com/feed/`, migration 036 connected to the
  original Gaming topic; 10 real articles stored. Coverage includes platform,
  studio, sales and esports reporting, but also puzzle guides. Existing topical
  and quality filters still apply; connection does not endorse every item.
- Four explicit reporting pages returned 200 through the shared HTTP client.
  PS5 firmware, Phantom Blade Zero sales and an ALGS interview expose 11 distinct
  named X citations altogether; the ARC Raiders page has none. Persisted with
  article/source provenance. Existing eight-page rotation and persistent exact-host
  failure cooldown apply; no recursive crawling or bot-protection workaround.
- Explicit official oEmbed pass: 10 successes, zero failures. Upcoming-window
  screening now has 14 Gaming semantic candidates versus 3 previously, while
  lexical selection remains empty. Candidate counts do not establish relevance,
  virality or final semantic selections; scheduled edition still due 20:40 UTC.
- First three original RSS entries and original firmware citation anchor recorded
  as offline fixtures; they are not live content evidence. No paid calls.
- Siliconera public feed probe returned 15 items, no X citations and substantial
  anime/merchandise coverage; left unconfigured. No page probes performed.

## Reddit listing preparation — iteration 168 (2026-11-02)

A single public `https://www.reddit.com/r/LocalLLaMA/top.json?t=day&limit=5`
request with descriptive `NewsDigest/1.0` User-Agent returned HTTP 403.
No alternate host, proxy, login or scraping workaround was attempted.
LocalLLaMA is **blocked**, with zero stored Reddit posts. NBA remains blocked
by the earlier JSON/RSS checks; other communities remain **not yet tried**.

`RedditListing` now accepts a community name through `RedditListingPort` and
uses the existing shared HTTP port for the public top/day listing (100 max).
It retains title/text, author, UTC time, subreddit, score/comments/upvote ratio,
HTTPS thumbnail and external URL, including X links for future citation ingestion.
It rejects invalid listing envelopes; skips malformed, removed, adult and pinned
posts; checks subreddit/permalink identity and deduplicates IDs. Access errors
propagate without endpoint fallback. Production use must inject SharedHttpClient
for its existing User-Agent, domain rate limit, cache and Retry-After handling.

The JSON fixture is explicitly synthetic, not a recorded live Reddit response.
This is adapter preparation only: storage, editable per-topic communities,
scheduling, relative engagement ranking and faithful cards remain unfinished.
No source was enabled and no live Reddit content is claimed.

## Reddit community configuration — iteration 169 (2026-11-02)

The owner-curated community lists from STEERING 8 are now stored per topic and
editable under Manage topics → Edit → Reddit communities. Tech/AI defaults to
LocalLLaMA, MachineLearning, singularity, technology, programming, OpenAI and
ClaudeAI; NBA to nba; Gaming to Games, gaming, pcgaming and GamingLeaks; World
to worldnews, politics and geopolitics. These are candidate communities chosen
for their domain focus, not validated live-source coverage. LocalLLaMA and NBA
remain **blocked** following public endpoint 403s; the other communities are
**not yet tried**. No access workaround or new live probe was used this iteration.

Configuration is limited to 20 unique names per topic, case-insensitively;
blank disables future Reddit discovery. Older API clients that omit the field
preserve existing choices. Saving settings does not fetch posts. Ingestion,
SocialPost persistence, citation extraction, ranking and cards remain unfinished;
there are still no stored live Reddit posts. Desktop/mobile screenshots
`reddit-communities-{desktop,mobile}.png` use intercepted topic settings for
browser verification, not live Reddit data.

## Reddit storage preparation — iteration 170 (2026-11-02)

Public access status remains **blocked**, with no new requests, stored live Reddit
posts or access workarounds. Migration 038 allows Reddit IDs alongside X IDs and
stores title/text, subreddit, thumbnail/external URL, UTC publication time and
score/comments/upvote ratio in `social_posts`. Topic associations are transactional
and recheck enabled topics and configured communities before writing. Repeated
collection updates metadata/metrics without duplicating posts.

The explicit `collectReddit` application path fetches at most 20 distinct enabled
communities per pass and stops on the first listing error. It is deliberately
not connected to the hourly worker while denied public access remains unresolved.
Isolated synthetic tests cover updates, rollback and topic scope; they do not
constitute live ingestion. X citations, ranking and Reddit cards remain next.

## Reddit X citations — iteration 171 (2026-11-02)

Access remains **blocked**; no HTTP probe, inference call or live Reddit content
was used. Migration 039 stores deduplicated X links from Reddit destinations and
selftext with the citing post score. Evidence is replaced transactionally on edits
and cascades on deletion. Existing topic associations scope X discovery and post
selection; discovery breadth counts distinct communities, not repeated posts as
independent sources. Retained scores are evidence, not a measured virality rank.
The bounded X verifier uses the extracted author URL for official oEmbed; only a
verified X post can enter selection. This follows the existing official X rendering
path rather than rendering a Reddit wrapper for the tweet. Isolated synthetic tests
cover repeated links, score refresh, edits, rollback, topic isolation and X selection.
Collection remains unscheduled; Reddit ranking and faithful cards remain open.

## Reddit ranking preparation — iteration 172 (2026-11-02)

Public access remains blocked and collection unscheduled. A bounded, topic-scoped
repository read and separate domain ranker now prepare Reddit shortlists using
prior-week per-community score and lifetime score/hour medians, requiring five
historical observations and conservative strength thresholds. Sparse evidence
returns no picks. Posts citing X stay in the verified-X path. This is unpublished
preparation, verified with synthetic/isolated tests; no real Reddit content or
measured engagement growth is claimed. See docs/RANKING.md for limits. Faithful
cards and platform-aware publication remain next.

Iteration 173 adds platform-aware editorial preparation with isolated Reddit IDs
and enforced X preference. Only historically qualified Reddit candidates may be
submitted. Iteration 174 adds a separate validated Reddit snapshot contract and
shortlist conversion preserving title/body, thumbnail, destination, community,
metrics and observation time. Schema parsing detaches nested evidence from later
refreshes. Published editions remain X-only until faithful cards and publication
are connected. No collector activation or live requests; public access remains blocked.

Iteration 175 allows platform-discriminated Reddit snapshots in edition readback
and renders faithful title/body cards with community, author, timestamp, saved
score/comments/upvote ratio, observation time, optional thumbnail and original/
destination links. Synthetic desktop/mobile replay covers media and no-media
cards without requesting X widgets. Screenshots `reddit-card-desktop.png` and
`reddit-card-mobile.png` are synthetic UI evidence, not live Reddit content.
Publication selection remains X-only pending pipeline wiring; fetching remains
blocked and unscheduled. No live source or inference requests were made.

Iteration 176 connects historical-strength Reddit selection to edition publication
through the publisher's repeatable-read transaction. Both semantic candidates
and non-AI fallback retain platform snapshots and enforce X preference. X citation
story links apply only to X posts, preventing cross-platform ID collisions.
Synthetic publication verification covers stored Reddit metadata and conservative
fallback. Collection remains blocked/unscheduled; no live Reddit content or live
inference calls were used.

Iteration 177: Status now reports rolling 24-hour per-topic distinct articles and
verified X/Reddit posts by publication time, excluding undated posts and
unverified citations. Discovery associations define topic scope, not relevance.
Connected feed counts and sources successful in the last hour without an error
are shown separately. Paused topics retain their stored counts. No feeds added.

Read-only baseline at 2026-11-02 15:38 UTC (articles / verified X / Reddit):
Tech & AI 198/34/0, NBA 74/35/0, Gaming 188/22/0, World 174/9/0.
Healthy/connected feeds: 6/6, 3/3, 18/18, 5/5 respectively. NBA has the
fewest collected articles; World has the fewest verified X posts. Relevance
still requires editorial selection. Browser checks and screenshots:
`pnpm exec tsx scripts/smoke-topic-coverage.ts`,
`docs/screenshots/topic-coverage-{desktop,mobile}.png`.

## Reddit parked by owner — iteration 211 (2026-11-02)

STEERING 14 supersedes earlier Reddit follow-ups: collection is disabled and
unscheduled after public access denials. No further Reddit requests, including
probes, are permitted unless the owner re-enables it. Existing adapters, saved
communities and synthetic tests remain for future use. The production worker
only schedules free X harvesting (rivers/publisher links), never `collectReddit`;
there is no Reddit worker, scheduler or HTTP collection endpoint. Status and
topic settings now explain this intentional pause rather than a source error.
YouTube remains deferred. Social milestone completion requires real X posts only.

## X search yield evidence — iteration 214 (2026-11-02)

New X citations retain a save-time first-search/absent-from-verified-storage
baseline. The read-only daily report exposes new candidates and their current
verified yield per search/topic, without double-counting repeated searches.
Historical baselines stay unknown. Later free harvesting may verify these posts;
attribution does not prove causation, relevance or selection. No paid call was
made for this change; automatic paid scheduling remains unfinished.

## Scheduled X admission — iteration 215 (2026-11-02)

Migration 043 adds a nullable unique UTC scheduled day to the X ledger.
The shared budget lock admits one scheduled attempt across all topics for the
current UTC day, before HTTP. Rejected/uncertain calls still consume that day;
budget denial does not. Stale/future jobs cannot spend. Manual calls and historical
rows remain unchanged. The full-day reservation is retained; timer wiring and
coverage-based topic choice remain unfinished. Verified using isolated/fake
requests only; no new paid call or Reddit request.

## Scheduled X planner — iteration 216 (2026-11-02)

The planner chooses the enabled topic with a positive post budget and the fewest
verified, dated free-harvested X posts in the preceding 24 hours; ties preserve
owner topic order. Publisher and river citations deduplicate by post ID. Paid
search citations and parked Reddit are excluded from this scarcity measure.
Counts measure coverage, not strength or relevance. Topics need valid curated
accounts (1–20). Plans are accepted only 5–30 minutes before the edition; late
windows skip. Search dates cover yesterday through today in UTC. The planner
performs no I/O; production timer/search/official verification wiring is next.
No new paid call or Reddit request was made.

## Pre-edition verification preparation — iteration 217 (2026-11-02)

Search completion now returns its durable call ID. A call-scoped repository
query selects at most ten unverified citations, excluding disabled/zero-budget
topics and posts checked within one day. Existing verified posts need no new
request. This prevents unrelated hourly backlog from taking the pre-edition
verification allowance. Hourly collection uses the extracted shared verifier:
deduplicate IDs, cap at ten, persist successful embeds before acknowledging,
and stop on the first unavailable official response without a retry burst.
Fake and isolated Postgres checks only; no new paid or Reddit requests.
Production timer/search/verification composition remains the next step.

## Automatic pre-edition X discovery — iteration 218 (2026-11-02)

The social worker now checks the saved daily schedule every minute and runs
bounded direct `grok-4.3` discovery 5–30 minutes before the edition. It chooses
the eligible topic with the fewest verified free-harvested posts, preserving
owner order on ties. The existing shared-ledger full-day reservation and
once-per-UTC-day admission remain unchanged ($0.40/day, $12/month); this
intentionally permits at most one automatic search across all topics per day.
Completed calls immediately feed at most ten candidates to official oEmbed
verification, honoring stored cooldowns. Missing keys, replaced settings,
zero global post budget, missed windows and invalid accounts skip safely.
Only an edition within the current UTC day is considered: an edition shortly
after midnight waits until midnight; editions before 00:05 UTC skip discovery.
No catch-up spending or provider retries are added. Ledger/report scripts retain
cost and per-topic incremental verified yield; the first automatic run remains
to be observed. Verification used fakes and isolated services, with no inference
or Reddit requests.

## Daily X coverage for every topic — iteration 236 (2026-11-02)

STEERING 15 supersedes iteration 218's single-topic/day limit. Every eligible
(enabled, positive-budget, valid curated accounts) topic is now searched in
ascending free verified-post count, with stable owner-order ties. The worker
rechecks settings and the 5–30 minute window before each sequential call.
Migration 044 preserves historical calls and replaces the global daily unique
index with topic/day uniqueness. Admission remains under the shared budget lock;
rejected and uncertain attempts consume that topic's day across restarts.
Scheduled calls reserve a $0.10 projection (about five times observed ~$0.02),
settle actual charges before the next search, and honor $0.40/day and $12/month
caps. Manual calls retain the $0.40 hold. These are admission estimates, not
provider-side charge ceilings; xAI prepaid credit remains the hard backstop.
Optional second searches are disabled, so no low-yield retry can consume budget
before other topics' first searches. Existing official verification and daily
cost/incremental-yield reporting remain unchanged. Tests use fakes/disposable
services only; no paid or Reddit requests. Await Nov 3's full scheduled run for
per-topic cost/yield evidence and the STEERING acknowledgement.

## Open X search preparation — iteration 271 (2026-11-02)

The direct adapter accepts omitted handles for unrestricted topic discovery.
Its open prompt uses topic name/guidance, keyword and semantic relevance, and
asks for engaged, rising original posts including small accounts. Supplied
account lists still require 1–20 valid unique handles; an empty list is invalid.
One turn, five requested results, media understanding off, citation-only URL
acceptance and official oEmbed verification remain in force. Synthetic tests
cover outside-list citations; no live search or yield claim was made. Scheduled
search stays on account lists until the first STEERING 15 run is acknowledged.
Reported engagement, ranking, search-type reporting and budget-prioritized
reaction/account searches remain unfinished under STEERING 16.

## Reported X engagement preparation — iteration 272 (2026-11-02)

Search now requests a compact JSON array with cited URLs, post times and known
like/repost/reply/view counts. The adapter returns citation-bound observations
marked `reported_by: xai_search` with a local observed-at timestamp. These are
model reports, never verified engagement; unknown fields stay absent, while
explicit zero is preserved. Invalid counts/times, future timestamps, uncited
IDs, conflicting duplicate reports and malformed output do not become usable
observations. Billed usage survives malformed output. Synthetic offline tests
only; no live quality/virality claim. Persistence, age-relative ranking and
search-type reporting remain next; the scheduled account-list path stays in
place pending the first STEERING 15 run acknowledgement.

## Reported X engagement persistence — iteration 273 (2026-11-02)

Search citations now retain each search's reported engagement JSON, including
`reported_by: xai_search` and observed-at time. Missing observations remain SQL
NULL; retries preserve the original report, and uncited reports are not saved.
These observations are separate from official oEmbed verification and from
`social_posts.metrics`; they do not yet affect ranking or displayed engagement.
Isolated synthetic tests cover provenance, zero counts and retry preservation.
No paid discovery or Reddit requests were made. Age-relative ranking and
search-type reporting remain open; the scheduled account-list path is unchanged.

### Iteration 279: scheduled X discovery visibility

Status and topic settings now describe the active capped, weakest-first daily
account-list searches 5–30 minutes before publication. Topics need enabled status,
post slots and curated accounts. Open search remains pending item 15 acknowledgement;
saving accounts does not initiate discovery. No provider or Reddit requests.

Scheduled open-search preparation (iteration 281): the planner/tick can explicitly
use open-topic requests, including topics with empty or invalid curated lists.
Requests omit handles and preserve weakest-first order, daily admission identity
and the pre-edition window. Production still defaults to account-list search
until the first scheduled item 15 run is reported and acknowledged. Fixture-only
verification made no provider requests.

Top-story reaction preparation (iteration 283): a pure planner selects at most two
distinct high-importance stories from caller-supplied topic/window candidates.
The direct adapter accepts bounded story context as data, searches without handle
restrictions and keeps one turn, five requested results, no profile/thread fetches
and no image/video understanding. Migration 047 allows `story-reactions` in the
existing capped ledger and daily report. No reaction searches are scheduled yet:
execution still needs open discovery for every topic first, remaining-budget
admission and article-pipeline wiring. Tests are synthetic; no live calls.

Optional-search preparation (iteration 286): the runner requires a valid incremental
verified-addition count from each topic's completed open search. Only 0–2 additions
qualify for one optional attempt per topic. The highest-priority story reaction
wins; account search fills only topics without a valid reaction. Failed attempts
also consume that allowance. Every topic's open search must finish first; ledger
admission and schedule guards still apply. This is synthetic-tested preparation;
production optional searches remain disabled pending durable admission/wiring.

### Bluesky authenticated discovery (iteration 316)

Official `com.atproto.server.createSession` on bsky.social and account-PDS
`app.bsky.feed.searchPosts` work with the owner-provided app password. The
standalone `pnpm exec tsx scripts/probe-bluesky.ts` reuses one in-memory session,
refreshes once on access expiry, serializes requests with a one-second floor,
honors Retry-After and limits each query to two 25-post pages. It prints aggregate
counts only; it does not write to the database or create editions.

Live probe on 2026-11-03 at 03:21 UTC, preceding 24 hours, `sort=top`:

| Topic   | Probe query             | Distinct in-window candidates | With engagement |
| ------- | ----------------------- | ----------------------------: | --------------: |
| Tech/AI | artificial intelligence |                            47 |              47 |
| NBA     | NBA                     |                            50 |              50 |
| Gaming  | game                    |                            49 |              49 |
| World   | world news              |                            47 |              47 |

These are raw search yields, not reviewed relevance or virality measurements.
No posts are stored yet, so this source does **not** qualify as live ingestion.
Search terms need topic-guidance refinement before collection. Authentication
currently accepts official hosted PDS endpoints only; custom PDS accounts are
unsupported. Missing credentials fail closed; no anonymous endpoint is probed.
Production has no wiring to this adapter: edition inclusion remains off under
STEERING 23. The isolated shortlist now requires a configured positive topic
phrase and passes the existing spam/exclusion and time gates before ranking by
log-scaled weighted engagement (likes + 2×reposts + replies) and lifetime
engagement/hour. It selects the latest valid observation before the cutoff,
deduplicates post IDs and never pads with zero-engagement posts. This is phrase
screening and an age proxy, not semantic review, measured growth or
account-relative reach. Observation storage is implemented separately; collection, semantic selection
and cards remain unfinished.

Iteration 317 live shortlist probe, 2026-11-03 03:28 UTC, same preceding-day
queries: raw yields Tech/AI 47, NBA 50, Gaming 49, World 48; phrase-eligible
shortlists capped at five yielded 5/5/5/0. World has no positive phrase rules,
so conservative screening correctly excludes all candidates pending semantic
selection. These counts are not relevance judgments or live stored content.
The probe reads current topic policies from the local API; observation cutoffs
follow each search response, while publication times remain search-window bounded.

Iteration 318 media probe, 2026-11-03 03:32 UTC: raw candidates Tech/AI
47, NBA 50, Gaming 49, World 48; candidates with images 10/5/20/5 and
video 1/15/2/2 respectively. The adapter now preserves official image
thumbnail/full-size URLs, video playlist/thumbnail URLs and alt text,
including the author's media attached to a quote. Quote-only and external-link
embeds are excluded; invalid media is omitted without dropping the post.
No media files are downloaded. These are unreviewed discovery observations,
not stored or published posts; faithful cards and persistence remain unfinished.

Iteration 319 adds isolated PostgreSQL storage for platform `bluesky`, plus
immutable per-topic text/media/metrics snapshots keyed by observation time.
Older responses cannot overwrite newer current metadata. Reads accept a
publication window and an independent observation cutoff; topic disable/delete
is respected. Disposable-database tests cover replay, out-of-order snapshots,
window bounds, rollback and topic isolation. No live collection has written to
this storage; the probe remains read-only and production edition inclusion is
off. This is storage preparation, not a live ingestion claim.

Iteration 320 adds an explicit bounded collection path. Running
`pnpm exec tsx scripts/probe-bluesky.ts --store` opts into snapshot writes;
without that option the probe remains read-only. One pass shares the authenticated
client across four queries, each capped at two 25-post pages and a 24-hour
window, and stops on search/storage failure. No scheduler or edition caller.
Fetched/submitted counts are separate from read-back window observations;
replays need not insert rows. Fake tests cover bounds, duplicate snapshots,
invalid observations, invalid requests and failure propagation.

Live free-API collection at 2026-11-03 03:44 UTC stored and read back
Tech/AI/NBA/Gaming/World observations **48/48/47/46**. Each had nonzero
engagement; image-bearing counts were 10/5/19/3, video-bearing 1/16/2/2.
Phrase shortlists capped at five were **5/5/5/0**. World has no positive phrase
rules; semantic review is unfinished. These are discovery observations, not
editorial picks or verified virality. Production edition inclusion remains off.
No paid calls, Reddit requests or media downloads.

Iteration 321 adds an isolated semantic shortlist over up to 50 safe Bluesky
observations. Fake-only verification recovers a relevant post without a topic
phrase, excludes high-engagement irrelevant posts and fails closed on incomplete
or malformed triage. Existing budgeted social triage is injected; no live LLM
calls, new API collection or production edition caller. Final editing, cards and
real editorial yield remain pending; the 189 stored observations are unreviewed.

Iteration 322 adds isolated final Bluesky editing after semantic shortlisting.
Fake-only checks cover bounded candidates, fewer-than-budget picks, preserved
observations, invalid/refused selections and zero-budget no-I/O behavior.
No new live yield claim, collection or paid calls; production inclusion stays off.

Iteration 323 prepares faithful Bluesky cards and a discriminated edition snapshot
contract for saved text/media/counts. Synthetic desktop/mobile browser replay
checks images, video links, empty media, original links and saved metrics; these
are not real editorial selections. Production inclusion remains off pending the
Nov 3 scheduled evidence and acknowledgments; no new collection or paid calls.

Iteration 324 prepares an explicit, default-off edition assembly seam over stored
Bluesky observations. It reads at the window cutoff, validates snapshot URLs/media
before triage, preserves existing picks and fills only unused slots after complete
editing. Disabled/full selections do no storage or AI work; failures add no picks.
Five fake-only tests cover the gate, bounded slots, snapshot independence and
incomplete/refused responses. No production caller, new collection or paid calls;
real editorial yield remains unmeasured and production inclusion remains off.

Iteration 325 wires the stored-observation preparation into publication after
X/Reddit selection, through the publisher's database snapshot. Only
`BLUESKY_EDITIONS_ENABLED=1` enables reads and editing; production remains unset
under item 23. Existing X picks and total topic budgets are preserved. Fake
caller checks cover the default-off path and explicit transaction-scoped selection;
this adds no collection, live model calls or evidence of real editorial yield.

## First full scheduled X run — iteration 425 (2026-11-03)

Read-only ledger report confirms four successful account-list searches before
the 15:00 UTC edition: World $0.036680/5 newly verified posts, Gaming
$0.036815/5, NBA $0.037582/5, Tech/AI $0.025979/3. Total $0.137056 for
18 fetched posts and 18 incremental official-oEmbed-verified additions; no
unresolved holds or outside-list additions. These are discovery yields, not
virality or editorial-quality measurements. No extra paid verification ran.

Scheduled edition `777fdd95-0bcd-4ca7-9ea6-36c654effcca` published with
4/4/3/0 X posts for Tech/AI, NBA, Gaming and World respectively. World
discovery succeeded but produced no selected posts. The saved World social
triage contains one candidate (relevance 3, importance 2; insufficient context),
so discovery yield must not be read as eligible in-window editorial coverage.
Read-only investigation (iteration 428) found all five new World posts outside
the edition interval: published Nov 2 03:00–13:10 UTC, before its 15:00 start.
The scheduled search used Nov 2–3 date-only bounds, omitting Nov 3's partial day.
The corrected request includes that day and supplies exact UTC times from the
configured edition start through search time (at most the latest 24 hours).
Publication still rejects out-of-window posts; no new paid search or improved
World yield is claimed. The one saved triage candidate came from other discovery.
Desktop/mobile screenshots: `docs/screenshots/scheduled-nov3-*.png`.
Open search, Bluesky inclusion and grouping remain switched off.

## Open scheduled X discovery activated — iteration 430 (2026-11-03)

Following the recorded/acknowledged Nov 3 account-list run (STEERING 15),
production now selects open-topic discovery without handle restrictions.
Topics with post slots remain eligible with empty curated lists. All primary
searches must finish verification before a low-yield topic (0–2 new verified
posts) can receive one parented followup: story reactions first, otherwise
curated accounts. Durable admission, official oEmbed verification, exact-time
window guidance and $0.40/day/$12/month caps are unchanged. Current curated
lists remain unchanged. No immediate search or paid verification was run;
open-search yield, outside-list picks and relevance await scheduled evidence.

## Hourly Bluesky collection — iteration 432 (2026-11-03)

The social worker now schedules authenticated official API collection hourly on
the existing social queue. One open query per enabled topic with a positive
post budget (maximum four topics / 200 submissions): first nonempty configured
query, otherwise first relevance term, otherwise topic name. Shared session,
24-hour window, no automatic retries; search/storage failure stops the pass.
Missing credentials skip collection. Queue results retain per-topic fetched and
submitted counts; submissions are not necessarily new inserts. Edition inclusion
remains off; no paid editorial calls or new editions are triggered.

First automatic pass completed at 15:54 UTC: Tech/AI `AI` 50 fetched/submitted,
NBA `NBA` 49, Gaming `game` 48, World `World news & politics` 45.
Readback found 81/82/82/74 window observations including earlier probes; these
are stored API observations, not new-row counts or editorial/virality evidence.

## Bluesky edition activation — iteration 433 (2026-11-03)

Following the acknowledged Nov 3 protected run, stored Bluesky inclusion is
enabled by default. `BLUESKY_EDITIONS_ENABLED=0` disables it (`1` or unset
enables it). Selection retains X/other picks and fills only unused topic slots
through the existing budgeted Haiku/Sonnet services; incomplete editing adds no
posts. Hourly collection is unchanged. Fake publisher verification covers default
activation and the off switch. No paid verification or new edition was triggered;
real per-topic editorial yield and screenshots await the next scheduled edition.
This supersedes the historical default-off notes above.

## Stored Bluesky coverage — iteration 444 (2026-11-03)

`pnpm exec tsx scripts/report-bluesky-coverage.ts` reads stored observations only;
no API search, collection, LLM call or edition creation. At 17:05 UTC, the rolling
24-hour publication window contained Tech/AI 124 observations / 77 distinct
posts, NBA 121/51, Gaming 118/48, World 114/73. Latest observations were from
16:54 UTC for every topic; no 5,000-observation read cap was reached.
Safe engaged candidates, capped at 50: 50/49/48/50. Phrase shortlist, capped at
the topic's five slots: 5/5/5/0. World's zero phrase matches does not establish
zero semantic relevance: semantic triage/editorial selection has not been run
by this report. These are stored official API observations, not new inserts,
measured growth, platform-wide counts or published selections. Scheduled
Bluesky editorial yield and screenshots remain pending.

## Saved-edition media evidence — iteration 448 (2026-11-03)

Read-only Playwright verification of the Nov 3 scheduled edition
`777fdd95-0bcd-4ca7-9ea6-36c654effcca` loaded all 11 official X embeds
on both desktop (1440 px) and mobile (390 px). Nine posts had loaded
`/media/` images (14 images per viewport, including quoted-post media).
Screenshots also show official video previews; playback was not exercised.
World still has zero posts. This is rendering evidence for the existing
account-list edition, not acceptance of open discovery, Bluesky selections,
virality, or all-four-topic coverage.

Run explicitly with `pnpm exec tsx scripts/verify-saved-posts.ts <edition-uuid>`.
The script reads an existing immutable edition through the reader API, blocks
app writes and Reddit, checks card counts, original links, timestamps, saved
X/Bluesky text and horizontal overflow, and reports X iframe and Bluesky image
outcomes. It uses the reader URL directly and needs no admin credentials.
It makes real official-widget requests; it is not part of offline tests.
An initial run observed a TypeError inside X's embed bundle; the final run had
zero app or widget errors. Third-party errors are reported separately and do
not establish an app failure. Media availability can change after capture.
Viewport screenshots (first visible posts, not full sections) are stored as
`docs/screenshots/saved-777fdd95-*-desktop.png` and `*-mobile.png`.

## NBA coverage expansion — iteration 465 (2026-11-03)

The pre-change rolling 24-hour status snapshot had Tech/AI 329 articles from
6 sources, NBA 140/3, Gaming 273/18 and World 226/5. NBA was the weakest
article topic, so added **RealGM Basketball** at
`https://basketball.realgm.com/rss/wiretap/0/0.xml`. Its public RSS returned
HTTP 200 and 31 dated items at verification, including NBA contracts, injuries,
results and transactions. No article-page crawling is enabled. The site RSS
directory returned 403; no bypass attempted.

This is a mixed basketball feed, including WNBA/college reports: NBA topic
ranking must still reject irrelevant items. RealGM often summarizes other
reporters; a second publisher is not evidence of independent reporting.
Recorded fixture `realgm.xml` contains two original NBA entries and checks
EST-to-UTC dates, plain excerpts and absence of invented authors/X citations.
Tests use that recording, never the live endpoint. **Status: live.** Migration
050 applied and the normal worker stored all 31 items at 19:24:45 UTC, with no
source error. Post-collection NBA coverage was 150 rolling articles and four
connected/healthy sources; these are stored observations, not fixture counts.
No AI calls or edition generation were needed to collect the feed.

## NBA coverage and highlight harvesting — iteration 477 (2026-11-03)

Pre-change rolling-day coverage: Tech/AI 329 articles / 6 healthy sources,
NBA 151/4, Gaming 282/18 and World 224/5. NBA remains the weakest article
topic. **SB Nation NBA** (`https://www.sbnation.com/rss/nba/index.xml`)
returned HTTP 200 with ten dated Atom entries, two from the last 24 hours.
These include authored NBA analysis and highlight reporting, with 18 distinct
embedded X post IDs across the ten entries. Those are discovery links, not
verified posts or proof of virality. Existing official embed verification
controls eligibility; no article-page crawling is added. Multiple publishers
may repeat the same original event or report.

Migration 051 connects this feed to the original NBA topic. A two-entry
recorded fixture pins original publication times, authors, plain excerpts and
the ESPN/NBA highlight citations. Tests never fetch the live feed.
**Status: live.** Migration 051 applied; the normal worker stored ten items
at 20:36:15 UTC, with no source error. The stored snapshot contains 21 distinct
X citations (the earlier bounded feed probe contained 18). These are harvested
links, not 21 new verified posts. NBA then had 152 rolling-day articles and
five connected/healthy sources; all 34 app sources were healthy. No edition
or paid inference call was triggered by this change.

Other bounded public-feed checks: HoopsHype `/feed/` and NBC
`/nba/probasketballtalk.rss` returned 404; SLAM `/feed/` returned 403.
No bypass or repeated probes. Basketball Insiders `/feed/` returned 200 with
25 dated items (two recent); not connected in this step, prioritizing SB
Nation's highlight links and authored coverage.

## NBA reporting depth — iteration 478 (2026-11-03)

Pre-change rolling-day coverage: Tech/AI 328 articles / 6 healthy sources,
NBA 152/5, Gaming 280/18 and World 227/5. NBA remains weakest for articles;
World has zero currently verified rolling-day X posts, with scheduled open
search evidence pending. No extra paid search was run.

**Basketball Insiders** (`https://www.basketballinsiders.com/feed/`) returned
HTTP 200 with 25 dated RSS entries, two within the past day. The recent items
are authored game reports with useful plain-text excerpts. The feed also carries
opinion and broader basketball coverage; topic relevance still needs ranking,
and a separate outlet is not proof of independent reporting or factual accuracy.
Migration 052 connects it to the original NBA topic without recreating a deleted
topic. A recorded two-entry fixture pins authors, UTC dates, canonical links,
plain excerpts and the absence of invented X citations. Tests use no live HTTP.
**Status: live.** Migration 052 applied; the normal worker stored 25 articles
at 20:41:07 UTC, with no source error. No paid call or edition was triggered.
All 35 sources are healthy.

## Iteration 479 — Yardbarker NBA and rejected feed candidates

Pre-change rolling-day articles/healthy sources: Tech/AI 327/6, NBA 156/6,
Gaming 280/18, World 224/5. NBA remains weakest for articles; World has no
rolling-day verified X posts. No extra paid discovery or edition was requested.

`https://www.yardbarker.com/rss/sport/3` returned HTTP 200 with 20 dated NBA
entries, including recent reports. Migration 053 connects **Yardbarker NBA**
to the original NBA topic if it still exists. This feed includes syndication,
commentary and speculation; its publisher count does not establish independent
reporting. Recorded fixtures preserve bylines, offset dates, images and links;
tests make no HTTP requests. **Status: live.** Normal worker collection stored
20 articles at 20:46:53 UTC with no error. NBA rolling-day coverage rose to
166 articles/seven healthy sources; all 36 sources are healthy.

Bounded rejected candidates: NBA `/news/feed` and Sports Illustrated `/feed/nba`
returned 404; TalkBasket `/feed` returned 403 (no bypass). Sporting News
`/us/rss/nba` returned 20 entries but article URLs had a trailing `>`; do not
connect malformed links. Yardbarker `/rss/sport/nba` returned stale, off-topic
other-sport entries; only the numeric NBA feed above is used. Hoops Rumors was
already connected; its successful probe adds no new source.

## Iteration 480 — free X links from Yardbarker NBA pages

Migration 054 opts the existing Yardbarker NBA feed into exact-host article
discovery at `www.yardbarker.com`. A public Westbrook jersey-retirement article
returned HTTP 200 and two named X embeds: `okcthunder/2117331372586979462`
and `swishcultures_/2117355643342631418`. The recorded embed fragments pin
canonical post IDs and named verification URLs without fetching X in tests.
These are citations, not verified posts, independent reporting or measured
virality. The existing eight-page hourly rotation, host checks and one-day
publisher failure cooldown apply; no recursive crawling or paid search added.
A Basketball Insiders game-report page returned 200 but no X status links;
its article discovery remains off. No Reddit requests or bypasses.

**Status: prepared, disabled under STEERING 27.** Migration 054 was applied before
the concurrent owner update was fetched; migration 055 disables the new host
configuration until the Nov 4 run is checked. The existing feed stays active.
The normal capped candidate pass checked
eight pages (two Yardbarker), finding no links or errors. An explicit one-page
check of the stored Westbrook article then persisted both citations at
20:54:25 UTC without error. Neither check published an edition or called an LLM;
post verification and selection remain separate. Retained citations are real
observations; this does not establish scheduled discovery or selected-post yield.

## Bluesky session-expiry recovery — iteration 513 (2026-11-04)

The adapter now recognizes AT Protocol's HTTP 400 `ExpiredToken` as well as
HTTP 401, refreshes the session once per search and retries the same page.
It reads at most 4 KiB of error JSON and retains only the expiry flag; provider
messages and tokens are never logged. Other 400s and repeated expiry stop.
The Nov 3 23:54 hourly failure followed a successful page; its HTTP-only logs
cannot prove the error code. The official PDS implementation confirms that
expired JWTs use HTTP 400 `ExpiredToken`. Pagination/repeated-expiry coverage
uses synthetic transport responses, not live expiry evidence.

Post-deploy verification: the restarted worker completed one explicit free
collection through the normal queue, storing 50 Tech/AI, 48 NBA, 49 Gaming and
46 World observations. A separate read-only probe returned 193 posts. These
are live collection results, not evidence of live token-expiry recovery or
edition selection. No paid calls or edition generation were triggered.

## Iteration 570 — rejected Bluesky refresh recovery (2026-11-04)

The 04:54 UTC hourly collection failed after search HTTP 400 followed by refresh
HTTP 400. A failed refresh now clears the cached session, allowing the next
collection to sign in again rather than reusing rejected tokens indefinitely.
The failed attempt still fails without an immediate login retry. Fake-response
coverage proves next-call recovery; sustained live recovery remains unverified.

## Iteration 572 — first scheduled Bluesky recovery (2026-11-04)

The normal hourly job started at 05:54:43.900 UTC and completed at
05:54:52.104 UTC (8.204 s), after the 04:54 rejected-refresh failure.
Read-only stored-observation reporting confirms fresh observations for all four
topics, newest timestamps 05:54:46–05:54:52 UTC.
This verifies one scheduled recovery after the session reset fix; sustained
hourly collection and selection in the Nov 4 edition remain to verify.
No manual collection or paid provider calls were made for this observation.

## Iteration 619 — sustained scheduled Bluesky collection (2026-11-04)

Read-only worker journal review confirms seven consecutive hourly jobs completed
from 05:54 through 11:54 UTC, each in 8.154–8.360 seconds. All 56 search
attempts and seven logins returned HTTP 200; no Bluesky attempt failed in that
interval. Frequent deployment restarts caused fresh logins, so this verifies
continued scheduled collection after recovery, not long-lived token refresh.

The stored-observation report at 12:01 UTC covers the preceding 24-hour publication
window; no topic reached the 5,000-observation read cap:

| Topic                 | Observations | Distinct posts | Safe engaged candidates (cap 50) | Phrase shortlist (cap 5) |
| --------------------- | -----------: | -------------: | -------------------------------: | -----------------------: |
| Tech & AI             |          517 |             52 |                               50 |                        5 |
| NBA                   |          529 |             55 |                               47 |                        5 |
| Gaming                |          559 |             71 |                               50 |                        5 |
| World news & politics |          685 |             77 |                               46 |                        0 |

Newest observations span 11:54:46–11:54:52 UTC. Counts describe stored real
API results, not semantic acceptance or editorial picks. World's empty lexical
shortlist does not establish that its engaged candidates are irrelevant: the
edition uses semantic selection. Nov 4 edition inclusion and screenshots remain
pending. Verification used `scripts/report-bluesky-coverage.ts` and the existing
worker journal only; no collection, inference or edition was triggered.

## First scheduled open X discovery — iteration 645 (2026-11-04)

Read-only review at 14:50 UTC of the four completed scheduled searches
(14:30–14:33 UTC), before the edition. Direct Grok discovery spent $0.149447
for 19 fetched and newly official-oEmbed-verified posts, zero profiles and no
outstanding holds. All 19 posts are outside the **current** curated lists;
this counts posts, not distinct accounts or historical list membership.

| Topic   |      Cost | New verified | In Nov 3 15:00–Nov 4 15:00 UTC window | Reported engagement available | Highest reported likes |
| ------- | --------: | -----------: | ------------------------------------: | ----------------------------: | ---------------------: |
| World   | $0.033193 |            4 |                                     4 |                             4 |                      4 |
| NBA     | $0.039028 |            5 |                                     5 |                             5 |                     12 |
| Gaming  | $0.038493 |            5 |                                     1 |                             1 |                      5 |
| Tech/AI | $0.038733 |            5 |                                     3 |                             3 |                      1 |

Window membership uses stored post timestamps; counts are discovery inventory,
not immutable edition picks. Six verified posts predate the window despite
the prompt's exact UTC interval: four Gaming and two Tech. World now has
four in-window discoveries, unlike Nov 3, but selection is still unproven.

Stored official embed text exposes weak quality: **all five NBA posts promote
betting**, rather than highlights or insider reporting. Examples:
[Dirty Bubble Bets](https://x.com/i/web/status/2117987961715220573) promotes
a moneyline bet; [Brandon Brown](https://x.com/i/web/status/2117987853615747225)
promotes a six-pick play, paid membership discount and like/repost requests.
World examples are generic roundups or news-account promotion:
[WorldOrderWatcher](https://x.com/i/web/status/2117972019497119773)
is a source list with hashtags and zero reported likes.
Tech includes two low-engagement promotional posts from the same author,
[Francis CGL](https://x.com/i/web/status/2117946862854447231), plus
[a networking reply](https://x.com/i/web/status/2117671469748785153).
These observations do not independently verify the posts' factual claims.

There is no demonstrated viral yield: available single xAI-reported snapshots
have at most 12 likes, and six posts lack parsed engagement. Official oEmbed
confirms rendering, not popularity, relevance or media quality. No velocity,
account-relative reach or independent engagement measurement is available.
The app's stored verified-post metrics remain empty; reported observations
are retained separately in discovery citations.

Reproduce costs/yield with env loaded privately:
`pnpm exec tsx scripts/report-x-discovery.ts 2026-11-04` and
`pnpm exec tsx scripts/report-x-week.ts 2026-11-04`.
A read-only join of today's discovery calls/citations to verified X posts
supplied timestamps, reported engagement and stored official embed text;
no extra provider calls, re-verification or X scraping ran.
The seven-day ledger totals $0.309885 across nine calls, including one
unattributed Nov 2 call ($0.023382); empty earlier days are not successful
coverage. Nov 4 is incomplete. Current-list comparisons can change over time.

Next: inspect the scheduled edition's immutable picks and social triage before
changing discovery. In-window quantity alone misses this quality failure;
keep the existing budget caps and require post-selection quality evidence.

## Nov 4 edition selections — iteration 646

The [immutable edition review](edition-reviews/2026-11-04.md) checks the
scheduled discovery against actual picks: **none of the 19 paid discoveries
were selected**. Tech/NBA/Gaming/World have 4/5/5/0 X posts; 11 selected posts
are outside all current curated lists, but none has a usable saved engagement
report. World remains empty despite four in-window discoveries. NBA's five
betting promotions were all scored below the social relevance/importance gate.
The first selected Bluesky post appears in Tech with observed 767 likes,
329 replies and 342 reposts, but duplicates a selected X post. Desktop/mobile
screenshots and the current 11/10/12/11 account-list readback are recorded in
the review. Discovery counts do not establish viral yield or paid-search value.
No source, search prompt, configuration or budget changed.

## Open-X quality correction — iteration 651 (2026-11-04)

After the immutable review found 0/19 paid discoveries selected, tightened the
shared direct-search prompt to exclude betting/tipster promotions, memberships,
affiliate offers, engagement requests and generic hashtag roundups. It asks for
concrete original topic content and distinct moments, and explicitly permits
fewer results or an empty array rather than filler or out-of-window posts.
This changes discovery instructions, not a keyword filter or editorial acceptance.

The model, one-search/one-turn limit, five-result ceiling, date bounds, official
oEmbed verification and spending caps are unchanged. Synthetic transport checks
confirm empty results still report fetched-post usage without adapter retries.
No paid evaluation or new collection ran; the next scheduled search and immutable
edition must establish whether useful yield improves. This is not evidence of
viral yield or resolved World coverage.

### Iteration 652: cross-platform editorial context

The Nov 4 Tech Bluesky pick repeated a selected X post. Edition preparation now
supplies existing selections' bounded text, platform and author to the Bluesky
editor, which is instructed to avoid the same announcement, clip or moment
across platforms while allowing distinct developments. Existing picks remain
unchanged and only candidate IDs can be returned. Fake tests verify context
propagation, bounds and cache isolation; no live calls or new source requests.
Actual duplicate reduction awaits the next scheduled edition.

## Bluesky session refresh correction — iteration 698 (2026-11-04)

The 20:54 UTC hourly collection failed because the hosted PDS rejects a JSON
body on `com.atproto.server.refreshSession`. The adapter now sends a bodyless
POST with the refresh bearer token. Login, search limits, backoff and the
one-refresh-per-search limit are unchanged. A free official API probe reproduced
HTTP 400 with `{}` and HTTP 200 without a body. An adapter probe with simulated
access expiry then completed a real refresh and fetched 49 real posts without
storing them; it made no paid calls. Scheduled collection recovery is recorded
in PROGRESS.md.

## X comparison round 1 — iteration 703 (2026-11-04)

Twelve experimental cells dispatched outside protected hours; eleven settled
for $0.382331 and 47 fetched/cited posts. Gaming current has an unknown outcome
and retains $0.15; it was not retried. Trending reported materially larger like
counts but all four queries joined the topic to the reply filter. Reaction
operator inputs matched; only two posts were returned. Relevance/promotion
reviews and full comparison coverage remain incomplete, so no winner or source
activation. These posts are not verified or stored production content.
See [experiment results](x-search-experiment.md#round-1--nov-4-iteration-703).

## Sustained Bluesky session recovery — iteration 788 (2026-11-05)

The production worker started at 00:10 UTC and remained the same process
(PID 2544816) through this read-only check at 07:53 UTC. Seven consecutive
hourly collections completed, from 00:54 through 06:54 UTC, in 7.2–9.3 seconds.
The adapter logged one successful login, 56 successful searches, and three
HTTP 400 searches followed by successful refresh and retry. All three refreshes
returned HTTP 200; no second login occurred. This verifies the bodyless-refresh
fix across repeated natural access-token expiration in the long-lived worker.

| Refresh completed (UTC) | Hourly job finished (UTC) | Run duration |
| ----------------------- | ------------------------- | ------------ |
| 02:54:46.055            | 02:54:53.145              | 9.202 s      |
| 04:54:48.218            | 04:54:53.055              | 9.159 s      |
| 06:54:50.043            | 06:54:53.177              | 9.234 s      |

Stored rolling-24-hour coverage at 07:53:24 UTC, using the existing read-only
`report-bluesky-coverage.ts` report:

| Topic                 | Observations | Distinct posts | Safe engaged candidates (max 50) | Phrase shortlist |
| --------------------- | -----------: | -------------: | -------------------------------: | ---------------: |
| Tech & AI             |          476 |             48 |                               47 |                5 |
| NBA                   |          362 |             46 |                               39 |                5 |
| Gaming                |          455 |             48 |                               45 |                5 |
| World news & politics |          522 |             44 |                               37 |                0 |

All four topics have observations from the 06:54 run. Counts are stored official
API observations, not new requests or editorial selections; World relevance and
cross-platform duplicate reduction remain open for the scheduled edition.

Reproduction: `systemctl --user show news-digest-worker.service -p ExecMainStartTimestamp`;
inspect structured `journalctl --user -u news-digest-worker.service --since '2026-11-05 00:10:00' -o cat`
for `collect-bluesky` job starts/finishes and `target=bluesky` calls (operation,
status, job ID and timestamps only). Journal JSON `_PID` confirms one process.
With the private environment loaded, run
`pnpm exec tsx scripts/report-bluesky-coverage.ts`; it opens a read-only database
transaction and reads protected topics. This check made no provider requests,
paid calls, collection triggers or saved-edition writes, and did not restart
the worker. Production requests in the table were ordinary scheduled traffic.

### Nov 5 experiment overlap review — iteration 886

The saved snapshot has 1,000 free-link citation rows for 863 unique X posts.
None of the 41 revised experiment candidates matched those IDs; two semantic
candidates matched the old paid baseline. Saved embeds include two explicit
Tech keyword giveaway solicitations despite `-giveaway`. AI eligibility is
still unscored; no source, threshold or production change. See the
[dated review](edition-reviews/2026-11-05-x-experiment-review.md#free-link-overlap-and-visible-text-review--iteration-886).

### Nov 5 experiment social scoring — iteration 887

All 41 saved candidates received production Haiku social scores; four
verification calls cost $0.003782. Tech keyword has two in-window posts meeting
relevance/interestingness gates; both explicit giveaways scored 1/0. Promotion
labels and semantic likes remain unknown. No source/runtime change; see the
[scoring review](edition-reviews/2026-11-05-x-experiment-review.md#saved-candidate-social-triage--iteration-887).

## Dedicated Bluesky topic query — iteration 898 (2026-11-05)

The topic editor now saves a separate Bluesky search query (up to 500
characters). Hourly discovery uses it before news queries; blank retains the
existing first-news-query, first-include-phrase, then topic-name fallback.
Existing topics retain blank values. No live search phrases or collection
volumes changed, and saving never starts a search.

## X discovery topic controls — iteration 899 (2026-11-05)

The topic editor exposes the stored minimum likes and excluded words for the
replacement X search. Exclusions use one `-word` per line; `-giveaway` is always
added by query construction. Saving keeps discovery off pending the experiment
decision. Existing live thresholds and exclusions were not changed.

## X accounting preparation — iteration 901 (2026-11-05)

Experiment and production adapters now share a 120-second timeout and validated
usage parser. Token-only responses settle their token cost with absent fetched
post/profile counters treated as zero; invalid counters remain rejected.
Offline synthetic coverage only: no paid calls or production activation. Saved
NBA/World hold settlement, required tool execution and admitted retry remain next.

### Required X tool execution — iteration 902 (2026-11-05)

Shared experiment and app requests now set `tool_choice: "required"` with
`x_search` as the only tool. The [xAI Responses schema](https://docs.x.ai/openapi.json)
documents this value in `ModelRequest` / `ModelToolChoice`. All three styles
and curated follow-ups retain their existing windows, limits and caps.
Offline request checks only; failure-rate evidence awaits the authorized reruns
after retry handling and saved-hold settlement. Production fixed search stays off.

### Saved X experiment usage — iteration 903 (2026-11-05)

NBA/World failed keyword responses settled offline at $0.010383/$0.006329;
zero fetched posts, original evidence preserved with hash-linked journal additions.
Nov 5 charged $0.445318; lifetime $0.977649; $1.522351 remains under $2.50.
Gaming no-response holds retained. No provider calls or production activation.
[Settlement details](edition-reviews/2026-11-05-x-experiment-review.md#saved-usage-settlement--iteration-903).

### Experiment timeout retry — iteration 904 (2026-11-05)

The revised experiment runner admits one timeout retry separately at $0.15;
the original unknown-cost hold stays charged. Two timeouts stop the run, and
continuation cannot grant a third attempt. No live calls were made in this step;
tool-failure/no-execution and switched-off schedule retries remain pending.

### Experiment execution retry — iteration 905 (2026-11-06)

The experiment retries failed or unconfirmed X search execution with zero fetched
posts once, after settling returned token usage and admitting a fresh reservation.
Completed empty searches do not retry; timeouts keep their holds. No live calls
or production activation in this step; switched-off scheduler retry remains open.

### Scheduled X execution signal — iteration 906 (2026-11-06)

- The production adapter/application now preserves completed keyword/semantic search execution separately from citations. Failed or absent tool execution stays unconfirmed; completed empty searches remain distinguishable.
- Token-only responses settle before citation persistence. Scheduler retry admission remains unfinished; fixed search stays off. Offline protocol fixtures only; no paid calls.

### Durable scheduled execution evidence — iteration 907 (2026-11-06)

- Search settlement now saves confirmed/unconfirmed execution alongside actual usage and cost. Completed empty searches remain distinguishable after restart; historical calls retain unknown execution.
- Additive generated migration 0006; offline protocol and isolated database restart coverage. No paid calls or activation; durable scheduler retry admission remains next.

### Durable fixed retry admission — iteration 908 (2026-11-06)

- The switched-off fixed scheduler ledger admits one linked retry for an uncertain call or settled unconfirmed zero-post search with no citations. Same topic/day/style/model/run, enabled topic, shared caps and durable uniqueness are required; timeout holds remain counted.
- Completed empty searches, historical unknown execution, pending/rejected calls and retry chains cannot qualify. Migration 0007 changes admission constraints/indexes without deleting calls. Scheduler dispatch remains next; no paid calls or activation.

### Fixed scheduler retry dispatch — iteration 909 (2026-11-06)

- Switched-off fixed search now dispatches one linked retry after an uncertain failure or settled unconfirmed zero-post/no-citation result. It repeats live balance, topic configuration, enabled state, profile schedule and time-window checks before retry admission.
- Completed empty searches, fetched/cited results and rejected/budget-blocked calls never retry. Shared ledger admission preserves timeout holds and prevents repeat spending on subsequent scheduler ticks. No paid calls or activation in this step; authorized Nov 5 reruns follow.

### Authorized Nov 5 keyword reruns — iteration 910 (2026-11-06)

- Direct xAI/Grok 4.3, original Nov 4–5 21:00 UTC window, required tool choice and 120-second deadline. NBA/World tool calls failed again with zero fetched; Gaming completed, fetching/citing three in-window posts with likes 552/1,058/1,063 and three official oEmbed HTTP 200 responses. Post-fix failure rate: 2/3 (66.7%).
- Actual rerun cost $0.048153; lifetime experiment charge $1.025802/$2.50, historical timeout holds preserved. All three reruns settled, no new holds or ingestion. Fixed search stays off; scorer review and fair semantic Nov 6 round remain. [Evidence](edition-reviews/2026-11-05-x-experiment-review.md#authorized-keyword-reruns--iteration-910-nov-6).

### Fair semantic preparation — iteration 911 (2026-11-06)

- Experiment-only semantic requests now ask what is new and getting attention in the saved topic, without description exclusions or keyword operators. Exact UTC bounds and saved likes minimum remain; returned likes/reposts/replies/views are requested even below the minimum, with unknown counts omitted.
- Nov 6 dispatch remains due after 21:00 UTC, keyword cells first under shared experiment caps. No paid calls, ingestion or production changes; fixed search stays off. Gaming rerun scoring remains open.

### Gaming keyword scorer review — iteration 912 (2026-11-06)

- Three saved verified rerun posts scored with production Haiku: two giveaways 4/1; Tiny Legends launch 7/4, 552 reported likes, in-window. STEERING 39 makes the launch non-promotion: Gaming usable yield 1/3; Tech remains 2/10. NBA/World failed.
- No matches against the retained 863-post free-link baseline. One verification call $0.000337, zero unscored; no X calls or ingestion. Production fixed search stays off pending Nov 6 comparison. [Review](edition-reviews/2026-11-05-x-experiment-review.md#gaming-rerun-scorer-review--iteration-912-nov-6).

### Historical Bluesky edition outcomes — iteration 914

[Nov 4–5 reconstruction](edition-reviews/2026-11-04-05-bluesky-outcomes.md)
separates full X slots, accepted empty selection and failed Bluesky editing.
World’s Nov 5 Sonnet attempt was budget-refused before dispatch; the exact
constraint was not logged. No collection, query, cap or selection changes.

## Shared article excerpt retention — iteration 1017 (2026-11-06)

Title-only rediscovery of a canonical URL now preserves a previously saved
publisher excerpt. Nonblank excerpts still replace older text, and engagement
continues to merge. Read-only inspection found six URLs observed by both HN and
publisher feeds, three currently without text; this does not recover erased text
or establish how each became empty. Collection endpoints and cadence unchanged.
Deployment waits until after the 13:00–16:00 UTC freeze.

## Feed excerpt fallback — iteration 1019 (2026-11-06)

RSS/Atom ingestion keeps publisher descriptions/summaries first. When these
are missing or blank after HTML removal, it uses the feed's `content:encoded`
or Atom `content`, still capped at 1,500 plain-text characters. This adds no
article-page fetches, source changes or full-article storage. Offline synthetic
RSS/Atom cases verify precedence, blank HTML, decoding and the bound; existing
recorded feed fixtures remain unchanged. Saved editions are not rewritten.

## Nov 6 fresh-window X round — iteration 1050

Ten Grok 4.3 attempts settled $0.442837; 61 unique candidates all passed official oEmbed. Keyword usable Tech/NBA/Gaming/World: 0 (tool failed twice)/3/3/0; semantic zero. Three of ten attempts failed; one of four keyword cells still failed after its retry. Scoring cost $0.005013 through verification admission. Lifetime experiment charged $1.468639/$2.50; no new unresolved holds. Fixed production search stays off pending saved-baseline comparison and the plan decision. No ingestion, edition writes, query changes or new sources. [Review](edition-reviews/2026-11-06-x-experiment-review.md).

## X experiment decision — iteration 1051

Saved Nov 5/6 old-search baselines yield zero usable posts (38 daily citations, 31 unknown likes, seven below minimum). Keywords yield nine: Tech/NBA/Gaming 2/3/4; World zero. The approved rule passes: ship keywords and drop semantic (zero usable additions). Post-fix keyword failures remain 5/9 attempts; no additional paid calls. Fixed search stays OFF until verified production cleanup and admission rollout; caps/model/minimums unchanged. [Decision and evidence](edition-reviews/2026-11-06-x-experiment-review.md#baseline-comparison-and-decision--iteration-1051).

## Keyword rollout admission proof — iteration 1053

The production scheduler is now covered against the real isolated PostgreSQL ledger with fake provider responses: four topics, a retained timeout hold, one linked retry, settlement, and duplicate prevention after restart with funds available. The scenario charges $0.200016 and retains a $0.10 hold under the unchanged $0.40 daily cap. The proof exposed and fixed keyword verification calling the legacy open-search completion gate. Official citation verification still runs. No live calls or source changes; fixed search remains OFF pending legacy-path cleanup and activation.

### Keyword-only production runtime — iteration 1054 (2026-11-06)

- Removed the worker runtime fallback to legacy open-topic searches and optional story/account follow-ups. Missing or disabled fixed-search configuration exits before loading the profile or touching admission, provider or verification.
- Removed unused completed-open and headline-loading dependencies from the production runtime. Keyword retry, settlement and official verification remain covered, including the isolated real-ledger admission proof.
- Fixed search remains OFF; no paid calls or edition writes. Legacy standalone helpers/adapter branches still need cleanup before activation.

### Remove obsolete discovery orchestration — iteration 1055 (2026-11-06)

- Deleted the unused pre-keyword scheduler, optional follow-up orchestration and story-reaction request planner, with their obsolete tests. The production keyword runtime and saved account lists are unchanged.
- Historical experiment story inputs and replay tests remain; ledger history is retained. Adapter branch cleanup remains before activation. Fixed search stays OFF; no paid calls or edition writes.

### Restrict production adapter — iteration 1056 (2026-11-06)

Production now rejects legacy open-topic, account and reaction requests before HTTP. Historical dispatch is isolated in a replay adapter; the obsolete manual curated-account paid command is removed. Keyword results still retain ten citations and engagement observations, and logs identify keyword discovery. Fixed search remains OFF; no paid calls or edition writes.

### Activate keyword discovery — iteration 1057 (2026-11-06)

Enabled `X_FIXED_SEARCH_ENABLED=1` after the approved decision, keyword-only cleanup and isolated four-topic admission proof. First eligible production window is Nov 7 14:30–14:55 UTC, before the 15:00 UTC edition. All four topics retain approved likes thresholds (500/1000/500/2000), NBA exclusions and mandatory `-giveaway`. Grok 4.3 and $0.40/day/$12/month caps are unchanged. Activation outside the search window made no paid calls or edition writes. Three consecutive editions still need usable-post/editor-selection/cost checks and screenshots; World is reported separately.

## Nov 7 scheduled keyword and Bluesky outcome — iteration 1201

- [Actual edition review](edition-reviews/2026-11-07.md): six keyword calls, $0.166127, 20 fetched/verified, 19 new outside-list candidates, zero holds/profile fetches. Tech/NBA completed; Gaming/World each exhausted retry with unconfirmed execution (four of six attempts), not proven empty search.
- Four cited picks: Tech three new IDs with reported likes 839/875/974; NBA one already-verified ID with 2,026 likes. Thus three selected novel candidates, not four incremental paid discoveries. Provider reports are unverified; remaining 11 selected X posts have unknown likes.
- First reserved-slot edition: NBA/Gaming/World each saved one distinct Bluesky post; Tech chose none after two unsupported-claim drops. No X replacement; attributed Bluesky scoring/editing $0.061842. Two more scheduled acceptance reviews remain.
- Edition mixed because NBA story validation exhausted all four attempts; source-text fallback readable. No source/query/model/cap changes or paid verification.

## Nov 7 Tech evidence depth — iteration 1220

The [saved-edition diagnosis](edition-reviews/2026-11-07.md#tech-evidence-depth-diagnosis--iteration-1220)
finds four selected Hacker News stories with empty excerpts and one Google News
story whose excerpt repeats its headline. All five Tech stories have one saved
evidence article each, with no additional reporting detail for fuller summaries.
HN collection uses official item text; it does not fetch destination articles.
This is a selected-edition measurement, not an inventory-wide source rating.
Existing source status, collection and budgets are unchanged. Source balancing
remains paused; full-article work remains deferred. Next scheduled review should
compare evidence depth before treating brief summaries as an editor defect.

## Official Bluesky link facets — iteration 1221 (2026-11-07)

A read-only official `app.bsky.feed.getPosts` request for the two already-saved
Nov 7 Gaming/World IDs confirmed shortened text labels have full link targets
in `record.facets`, indexed by UTF-8 bytes. The prepared collector preserves
original text and expands those official HTTP(S) destinations into a separate
display copy; malformed facets leave text unchanged. No extra hourly queries,
media fetches, paid calls or source additions. New observation snapshots and
selected editions carry the display copy; historical editions stay immutable.
[Diagnosis and verification](edition-reviews/2026-11-07.md#prepared-bluesky-link-recovery--iteration-1221).

### Nov 8 Bluesky acceptance — iteration 1384

Scheduled edition: 2,376 read, 15 shortlisted, five selected across Tech/NBA/World;
Gaming had no shortlist. No X replacement or selection drop. Scoring/editing
cost $0.036338, versus Nov 7 $0.061842. Saved engagement varies from 213 likes
(Tech) to one (World); strong viral quality remains unestablished. Newly saved
Global News shortened-link expansion passes served-reader desktop/mobile checks;
Stuff supplies a homepage only. [Selection, cost and screenshots](edition-reviews/2026-11-08.md#bluesky-selection-cost-and-links--iteration-1384).
Nov 9 third-edition acceptance remains due; no source or runtime setting changed.

## Nov 9 scheduled discovery observation — iteration 1542

Four completed keyword searches cost $0.260092, zero holds, forty fetched/new
verified/outside-list candidates. NBA supplied two cited selections (both
outside-list); other topics supplied zero. Selected X metrics remain empty.
Bluesky picked Tech/NBA/Gaming/World 1/1/0/2; Tech records one X replacement,
World has no X picks. Iteration 1543: nineteen of twenty World triage scores
fail relevance/importance gates; the remaining unsourced missile-range claim
is not selected by the final editor. Tech replaces the fifth-ranked X pick
(Emil Kowalski’s useful skills documentation) with WIRED’s AI safety report,
matching the reserved-slot rule. Quality/virality acceptance remains open;
selected paid novelty and Bluesky destination checks remain. [Daily evidence](edition-reviews/2026-11-09.md).

### Nov 9 selected keyword novelty — iteration 1546

Read-only matching finds two selected new NBA candidates, both outside current
account lists, with no earlier search or retained free-link/feed/Reddit citations.
Other topics select none of today's paid citations. Reported likes 3,235/1,664
are unverified; all ten selected X posts have empty official metrics. Novel
selected candidates fell from eight yesterday to two today; quality acceptance
stays open. [Evidence](edition-reviews/2026-11-09.md#selected-keyword-novelty-and-engagement--iteration-1546).

### Nov 9 saved Bluesky destinations — iteration 1547

Four selected posts pass saved-reader desktop/mobile light/dark destination
checks. Independent retains its article URL; Alberta expands to the Global News
surgical-fees article, with a separate publisher homepage link. WIRED/Warriors
have no inline article URL. External requests blocked; World quality remains
open. [Evidence](edition-reviews/2026-11-09.md#saved-bluesky-destinations--iteration-1547).

## Nov 9 third-edition diversity decision — iteration 1549

Read-only comparison of Nov 7–9 published selections finds 49 posts (37 X,
12 Bluesky), with no repeated platform/external-ID pair. Nov 9's four Bluesky
picks cover different events from the same-topic X picks. Tech's X picks remain
concentrated on one author/Apple; Gaming has only GTA VI. World has no selected
X and Bluesky likes/reposts of 0/1 and 6/3. Text diversity review is complete;
overall viral-quality acceptance is not met. No collection, search, ranking,
threshold, slot or budget change; new tuning waits for item 50.
[Evidence and decision](edition-reviews/2026-11-09.md#third-edition-diversity-decision--iteration-1549).
