# Content source inventory

Checked 2026-11-01, iteration 9. Counts below are actual stored observations
from the live worker and `/api/content/sources`, not fixture counts. Five sources
supplied 155 distinct URLs across all four topics. Last successful bounded
verification: 19:01 UTC; two queued passes preserved the same 155-item total.

| Source | Topic | Status | Stored items | Feed / API |
| --- | --- | --- | ---: | --- |
| The Verge | Tech & AI | live | 10 | https://www.theverge.com/rss/index.xml (Atom) |
| Hacker News official API | Tech & AI | live | 20 | https://hacker-news.firebaseio.com/v0/topstories.json plus `/v0/item/{id}.json` |
| CBS Sports NBA | NBA | live | 36 | https://www.cbssports.com/rss/headlines/nba/ |
| GamesIndustry.biz | Gaming | live | 60 | https://www.gamesindustry.biz/feed |
| BBC World | World news & politics | live | 29 | https://feeds.bbci.co.uk/news/world/rss.xml |
| ESPN NBA RSS | NBA | blocked | 0 | HTTP 202 with empty body; chose CBS without bypass attempts |
| Yahoo NBA RSS | NBA | not yet tried | 0 | Probe returned XML; no adapter run/storage yet |
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
