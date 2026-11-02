# Content source inventory

Checked 2026-11-01, iteration 38. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Seventeen sources
supplied 669 distinct URLs across all four topics. Last successful bounded
verification: 20:38 UTC; two queued passes preserved the same 669-item total.

| Source                                   | Topic                 | Status        | Stored items | Feed / API                                                                                                                                                 |
| ---------------------------------------- | --------------------- | ------------- | -----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Verge                                | Tech & AI             | live          |           11 | https://www.theverge.com/rss/index.xml (Atom)                                                                                                              |
| Hacker News official API                 | Tech & AI             | live          |           26 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json`                                                                            |
| CBS Sports NBA                           | NBA                   | live          |           36 | https://www.cbssports.com/rss/headlines/nba/                                                                                                               |
| GamesIndustry.biz                        | Gaming                | live          |           60 | https://www.gamesindustry.biz/feed                                                                                                                         |
| BBC World                                | World news & politics | live          |           31 | https://feeds.bbci.co.uk/news/world/rss.xml                                                                                                                |
| NPR World                                | World news & politics | live          |           10 | https://feeds.npr.org/1004/rss.xml                                                                                                                         |
| The Guardian World                       | World news & politics | live          |           45 | https://www.theguardian.com/world/rss                                                                                                                      |
| Ars Technica                             | Tech & AI             | live          |           20 | https://arstechnica.com/feed/                                                                                                                              |
| ESPN NBA RSS                             | NBA                   | blocked       |            0 | HTTP 202 with empty body; chose CBS without bypass attempts                                                                                                |
| Yahoo Sports NBA                         | NBA                   | live          |           52 | https://sports.yahoo.com/nba/rss/                                                                                                                          |
| Eurogamer                                | Gaming                | live          |           60 | https://www.eurogamer.net/feed                                                                                                                             |
| PC Gamer                                 | Gaming                | live          |           50 | https://www.pcgamer.com/rss/                                                                                                                               |
| Rock Paper Shotgun                       | Gaming                | live          |           60 | https://www.rockpapershotgun.com/feed                                                                                                                      |
| PlayStation Blog                         | Gaming                | live          |           10 | https://blog.playstation.com/feed/ (first-party announcements/promotions)                                                                                  |
| Xbox Wire                                | Gaming                | live          |           10 | https://news.xbox.com/en-us/feed/ (first-party announcements/promotions)                                                                                   |
| NBA.com news RSS                         | NBA                   | blocked       |            0 | HTTP 403 at `/news/rss.xml`; no bypass attempted                                                                                                           |
| GameSpot mashup RSS                      | Gaming                | blocked       |            0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted                                                                                                          |
| IGN articles XML                         | Gaming                | rejected      |            0 | `/articles?format=xml` returned malformed XML; not scheduled                                                                                               |
| Google News RSS: artificial intelligence | Tech & AI             | live          |           68 | https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US%3Aen                                                                   |
| OpenAI News                              | Tech & AI             | live          |           60 | https://openai.com/news/rss.xml (first-party announcements)                                                                                                |
| Google DeepMind                          | Tech & AI             | live          |           60 | https://deepmind.google/blog/rss.xml (first-party research/announcements)                                                                                  |
| xAI direct x_search (gateway prohibited) | all                   | not yet tried |            0 | Direct explicit adapter implemented; dry run verified, paid discovery unmeasured                                                                           |
| X official oEmbed                        | all                   | live          |           10 | Named status URLs verified; /i/web/status URLs return 404                                                                                                  |
| X official API                           | all                   | needs key     |            0 | Owner token and hard read cap required                                                                                                                     |
| Reddit NBA RSS                           | NBA                   | blocked       |            0 | https://www.reddit.com/r/nba/.rss returned HTTP 403 (iteration 31); no bypass attempted; NBA top JSON also 403 in iteration 89; other communities untested |
| Bluesky public API                       | all                   | not yet tried |            0 | Check topical relevance                                                                                                                                    |

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

`discover-x.ts TOPIC_ID FROM_DATE TO_DATE` is dry run by default. Explicit
`X_DISCOVERY_LIVE=1` enables one direct authenticated POST to api.x.ai, without
retries, redirects or alternate routes. It reserves $0.40 before HTTP; no paid
scheduler is connected. Current docs say output token limits exclude reasoning,
so neither that limit nor max_turns provides a dollar ceiling. Measure before
scheduling or shrinking the reservation. Ordinary input rates include cached
input conservatively; cumulative input at least 200k doubles input/output rates,
a conservative proxy for the per-context long-input tier.

Settlement requires actual `x_posts_fetched` and `x_users_fetched` counters;
missing/invalid usage, transport failures, 429 and 5xx retain charged uncertainty.
Explicit depleted-credit errors persist the durable block. Only valid X URLs in
completed assistant citation annotations are retained, deduped and capped at five.
Generated prose URLs/engagement are ignored. Separate call/topic provenance joins
existing topic-interleaved official verification and post selection; citations
alone never become verified SocialPosts. Spend settles before citation persistence.
Synthetic schema examples and isolated DB tests are offline only. No paid call,
new live X content or publication is claimed; source remains `not yet tried`.
