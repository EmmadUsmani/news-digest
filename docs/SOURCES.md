# Content source inventory

Checked 2026-11-01, iteration 29. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Eleven sources
supplied 411 distinct URLs across all four topics. Last successful bounded
verification: 20:08 UTC; two queued passes preserved the same 411-item total.

| Source | Topic | Status | Stored items | Feed / API |
| --- | --- | --- | ---: | --- |
| The Verge | Tech & AI | live | 11 | https://www.theverge.com/rss/index.xml (Atom) |
| Hacker News official API | Tech & AI | live | 25 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json` |
| CBS Sports NBA | NBA | live | 36 | https://www.cbssports.com/rss/headlines/nba/ |
| GamesIndustry.biz | Gaming | live | 60 | https://www.gamesindustry.biz/feed |
| BBC World | World news & politics | live | 31 | https://feeds.bbci.co.uk/news/world/rss.xml |
| NPR World | World news & politics | live | 10 | https://feeds.npr.org/1004/rss.xml |
| The Guardian World | World news & politics | live | 45 | https://www.theguardian.com/world/rss |
| Ars Technica | Tech & AI | live | 20 | https://arstechnica.com/feed/ |
| ESPN NBA RSS | NBA | blocked | 0 | HTTP 202 with empty body; chose CBS without bypass attempts |
| Yahoo Sports NBA | NBA | live | 52 | https://sports.yahoo.com/nba/rss/ |
| Eurogamer | Gaming | live | 60 | https://www.eurogamer.net/feed |
| NBA.com news RSS | NBA | blocked | 0 | HTTP 403 at `/news/rss.xml`; no bypass attempted |
| GameSpot mashup RSS | Gaming | blocked | 0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted |
| IGN articles XML | Gaming | rejected | 0 | `/articles?format=xml` returned malformed XML; not scheduled |
| Google News RSS: artificial intelligence | Tech & AI | live | 61 | https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US%3Aen |
| xAI x_search via configured gateway | all | not yet tried | 0 | Review documented gateway routing before use |
| X official oEmbed | all | not yet tried | 0 | Render discovered post URLs |
| X official API | all | needs key | 0 | Owner token and hard read cap required |
| Reddit RSS/JSON | all | not yet tried | 0 | Check public endpoints and limits |
| Bluesky public API | all | not yet tried | 0 | Check topical relevance |

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
