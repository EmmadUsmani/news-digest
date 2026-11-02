# Content source inventory

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

Iteration 277: the daily report adds `outsideListVerifiedNow` and
`outsideListNewVerifiedNow` per topic/call, counting posts whose official author
URL is absent from **all current** curated topic lists, including disabled topics.
Comparison ignores handle case and leading `@`; duplicate list entries do not
multiply yield. `unknownAuthorVerifiedNow` keeps unrecognized author URLs out of
outside-list counts. Citation-only authors never qualify. These are post counts,
not unique accounts or historical membership snapshots; edits to lists and current
verification state can change them. Existing search-type and requested-topic
snapshots allow the counts to be compared per topic and search type.

Checked 2026-11-01, iteration 38. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Seventeen sources
supplied 669 distinct URLs across all four topics. Last successful bounded
verification: 20:38 UTC; two queued passes preserved the same 669-item total.

| Source                                   | Topic                 | Status                     |                  Stored items | Feed / API                                                                                                                                                 |
| ---------------------------------------- | --------------------- | -------------------------- | ----------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The Verge                                | Tech & AI             | live                       |                            11 | https://www.theverge.com/rss/index.xml (Atom)                                                                                                              |
| Hacker News official API                 | Tech & AI             | live                       |                            26 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json`                                                                            |
| CBS Sports NBA                           | NBA                   | live                       |                            36 | https://www.cbssports.com/rss/headlines/nba/                                                                                                               |
| GamesIndustry.biz                        | Gaming                | live                       |                            60 | https://www.gamesindustry.biz/feed                                                                                                                         |
| BBC World                                | World news & politics | live                       |                            31 | https://feeds.bbci.co.uk/news/world/rss.xml                                                                                                                |
| NPR World                                | World news & politics | live                       |                            10 | https://feeds.npr.org/1004/rss.xml                                                                                                                         |
| The Guardian World                       | World news & politics | live                       |                            45 | https://www.theguardian.com/world/rss                                                                                                                      |
| Ars Technica                             | Tech & AI             | live                       |                            20 | https://arstechnica.com/feed/                                                                                                                              |
| ESPN NBA RSS                             | NBA                   | replaced (empty responses) |                             0 | HTTP 202 with empty body; chose CBS without bypass attempts                                                                                                |
| Yahoo Sports NBA                         | NBA                   | live                       |                            52 | https://sports.yahoo.com/nba/rss/                                                                                                                          |
| Eurogamer                                | Gaming                | live                       |                            60 | https://www.eurogamer.net/feed                                                                                                                             |
| PC Gamer                                 | Gaming                | live                       |                            50 | https://www.pcgamer.com/rss/                                                                                                                               |
| Rock Paper Shotgun                       | Gaming                | live                       |                            60 | https://www.rockpapershotgun.com/feed                                                                                                                      |
| PlayStation Blog                         | Gaming                | live                       |                            10 | https://blog.playstation.com/feed/ (first-party announcements/promotions)                                                                                  |
| Xbox Wire                                | Gaming                | live                       |                            10 | https://news.xbox.com/en-us/feed/ (first-party announcements/promotions)                                                                                   |
| NBA.com news RSS                         | NBA                   | blocked                    |                             0 | HTTP 403 at `/news/rss.xml`; no bypass attempted                                                                                                           |
| GameSpot mashup RSS                      | Gaming                | blocked                    |                             0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted                                                                                                          |
| IGN articles XML                         | Gaming                | rejected                   |                             0 | `/articles?format=xml` returned malformed XML; not scheduled                                                                                               |
| Google News RSS: artificial intelligence | Tech & AI             | live                       |                            68 | https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US%3Aen                                                                   |
| OpenAI News                              | Tech & AI             | live                       |                            60 | https://openai.com/news/rss.xml (first-party announcements)                                                                                                |
| Google DeepMind                          | Tech & AI             | live                       |                            60 | https://deepmind.google/blog/rss.xml (first-party research/announcements)                                                                                  |
| xAI direct x_search (gateway prohibited) | all                   | live                       | 2 citations, 0 verified posts | One measured World search; $0.023382; generic citations fail official verification                                                                         |
| X official oEmbed                        | all                   | live                       |                            10 | Named status URLs verified; /i/web/status URLs return 404                                                                                                  |
| X official API                           | all                   | needs key                  |                             0 | Owner token and hard read cap required                                                                                                                     |
| Reddit NBA RSS                           | NBA                   | blocked                    |                             0 | https://www.reddit.com/r/nba/.rss returned HTTP 403 (iteration 31); no bypass attempted; NBA top JSON also 403 in iteration 89; other communities untested |
| Bluesky public API                       | all                   | not yet tried              |                             0 | Check topical relevance                                                                                                                                    |

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
