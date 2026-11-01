# Content source inventory

Checked 2026-11-01, iteration 38. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Seventeen sources
supplied 669 distinct URLs across all four topics. Last successful bounded
verification: 20:38 UTC; two queued passes preserved the same 669-item total.

| Source                                   | Topic                 | Status        | Stored items | Feed / API                                                                                                               |
| ---------------------------------------- | --------------------- | ------------- | -----------: | ------------------------------------------------------------------------------------------------------------------------ |
| The Verge                                | Tech & AI             | live          |           11 | https://www.theverge.com/rss/index.xml (Atom)                                                                            |
| Hacker News official API                 | Tech & AI             | live          |           26 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json`                                          |
| CBS Sports NBA                           | NBA                   | live          |           36 | https://www.cbssports.com/rss/headlines/nba/                                                                             |
| GamesIndustry.biz                        | Gaming                | live          |           60 | https://www.gamesindustry.biz/feed                                                                                       |
| BBC World                                | World news & politics | live          |           31 | https://feeds.bbci.co.uk/news/world/rss.xml                                                                              |
| NPR World                                | World news & politics | live          |           10 | https://feeds.npr.org/1004/rss.xml                                                                                       |
| The Guardian World                       | World news & politics | live          |           45 | https://www.theguardian.com/world/rss                                                                                    |
| Ars Technica                             | Tech & AI             | live          |           20 | https://arstechnica.com/feed/                                                                                            |
| ESPN NBA RSS                             | NBA                   | blocked       |            0 | HTTP 202 with empty body; chose CBS without bypass attempts                                                              |
| Yahoo Sports NBA                         | NBA                   | live          |           52 | https://sports.yahoo.com/nba/rss/                                                                                        |
| Eurogamer                                | Gaming                | live          |           60 | https://www.eurogamer.net/feed                                                                                           |
| PC Gamer                                 | Gaming                | live          |           50 | https://www.pcgamer.com/rss/                                                                                             |
| Rock Paper Shotgun                       | Gaming                | live          |           60 | https://www.rockpapershotgun.com/feed                                                                                    |
| PlayStation Blog                         | Gaming                | live          |           10 | https://blog.playstation.com/feed/ (first-party announcements/promotions)                                                |
| Xbox Wire                                | Gaming                | live          |           10 | https://news.xbox.com/en-us/feed/ (first-party announcements/promotions)                                                 |
| NBA.com news RSS                         | NBA                   | blocked       |            0 | HTTP 403 at `/news/rss.xml`; no bypass attempted                                                                         |
| GameSpot mashup RSS                      | Gaming                | blocked       |            0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted                                                                        |
| IGN articles XML                         | Gaming                | rejected      |            0 | `/articles?format=xml` returned malformed XML; not scheduled                                                             |
| Google News RSS: artificial intelligence | Tech & AI             | live          |           68 | https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US%3Aen                                 |
| OpenAI News                              | Tech & AI             | live          |           60 | https://openai.com/news/rss.xml (first-party announcements)                                                              |
| Google DeepMind                          | Tech & AI             | live          |           60 | https://deepmind.google/blog/rss.xml (first-party research/announcements)                                                |
| xAI x_search via configured gateway      | all                   | not yet tried |            0 | Review documented gateway routing before use                                                                             |
| X official oEmbed                        | all                   | not yet tried |            0 | Render discovered post URLs                                                                                              |
| X official API                           | all                   | needs key     |            0 | Owner token and hard read cap required                                                                                   |
| Reddit NBA RSS                           | NBA                   | blocked       |            0 | https://www.reddit.com/r/nba/.rss returned HTTP 403 (iteration 31); no bypass attempted; JSON/other communities untested |
| Bluesky public API                       | all                   | not yet tried |            0 | Check topical relevance                                                                                                  |

Ingestion runs immediately on first scheduling and every 30 minutes thereafter.
Each run fetches at most 60 entries/feed and the first 20 HN stories; deleted,
dead, undated and unsafe-URL items are skipped. HN points/comments are stored.
The shared client has a one-second domain floor, five-minute cache, 20-second
timeout, 2 MB cap, Retry-After/error backoff; BullMQ retries three times with
exponential delays. Failed/empty runs retain the previous successful timestamp
and expose an error. No article pages are crawled.

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
