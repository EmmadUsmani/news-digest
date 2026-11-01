# Content source inventory

Checked 2026-11-01, iteration 12. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Seven sources
supplied 266 distinct URLs across all four topics. Last successful bounded
verification: 19:11 UTC; two queued passes preserved the same 266-item total.

| Source | Topic | Status | Stored items | Feed / API |
| --- | --- | --- | ---: | --- |
| The Verge | Tech & AI | live | 10 | https://www.theverge.com/rss/index.xml (Atom) |
| Hacker News official API | Tech & AI | live | 20 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json` |
| CBS Sports NBA | NBA | live | 36 | https://www.cbssports.com/rss/headlines/nba/ |
| GamesIndustry.biz | Gaming | live | 60 | https://www.gamesindustry.biz/feed |
| BBC World | World news & politics | live | 30 | https://feeds.bbci.co.uk/news/world/rss.xml |
| ESPN NBA RSS | NBA | blocked | 0 | HTTP 202 with empty body; chose CBS without bypass attempts |
| Yahoo Sports NBA | NBA | live | 50 | https://sports.yahoo.com/nba/rss/ |
| Eurogamer | Gaming | live | 60 | https://www.eurogamer.net/feed |
| NBA.com news RSS | NBA | blocked | 0 | HTTP 403 at `/news/rss.xml`; no bypass attempted |
| GameSpot mashup RSS | Gaming | blocked | 0 | HTTP 403 at `/feeds/mashup/`; no bypass attempted |
| IGN articles XML | Gaming | rejected | 0 | `/articles?format=xml` returned malformed XML; not scheduled |
| Google News RSS | all | not yet tried | 0 | Widen after first digest |
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
spam penalties and final editorial selection are still M3/M5. Gaming and world
coverage need more independent outlets before robust clustering is possible.

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
