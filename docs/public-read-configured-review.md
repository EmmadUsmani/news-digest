# Configured public-read response review

## Nov 9 snapshot — iteration 1506

Reviewed the actual prepared system readers at approximately 09:30 UTC, without
installing HTTP routes, changing flags or making provider requests. All three
readers returned successfully: four topics, 36 sources (35 distinct origins),
four article groups and 20 articles. The temporary inspection script and snapshot
were deleted after review; no stored URLs or private database exports were committed.

## Text reviewed

- Topics: all names, descriptions, inclusion/exclusion guidance, relevance terms,
  query/account/community lists, Bluesky queries and X discovery exclusions.
  Values describe the four news domains and public accounts; no email addresses,
  private instructions, subscription tokens or credentials appeared.
- Sources: all 36 configured names; they name public publishers or feed services.
- Articles: all 20 returned titles and source labels (five per enabled topic).
  They describe news stories; no private notes, credentials or user data appeared.
  No excerpt, canonical path, query string or fragment was returned.

## Source catalog origins

These are normalized source-service origins, including aggregators and feed hosts.
The review concerns displayed hostnames, not publisher identity or DNS resolution.

| Origin                              | Configured source names              |
| ----------------------------------- | ------------------------------------ |
| https://aftermath.site              | Aftermath                            |
| https://arstechnica.com             | Ars Technica                         |
| https://basketball.realgm.com       | RealGM Basketball                    |
| https://blog.playstation.com        | PlayStation Blog                     |
| https://deepmind.google             | Google DeepMind                      |
| https://feeds.bbci.co.uk            | BBC World                            |
| https://feeds.npr.org               | NPR World                            |
| https://gamingbolt.com              | GamingBolt                           |
| https://hacker-news.firebaseio.com  | Hacker News                          |
| https://insider-gaming.com          | Insider Gaming                       |
| https://kotaku.com                  | Kotaku                               |
| https://news.google.com             | Google News: artificial intelligence |
| https://news.xbox.com               | Xbox Wire                            |
| https://openai.com                  | OpenAI News                          |
| https://sports.yahoo.com            | Yahoo Sports NBA                     |
| https://www.aljazeera.com           | Al Jazeera                           |
| https://www.basketballinsiders.com  | Basketball Insiders                  |
| https://www.cbssports.com           | CBS Sports NBA                       |
| https://www.destructoid.com         | Destructoid                          |
| https://www.eurogamer.net           | Eurogamer                            |
| https://www.gamedeveloper.com       | Game Developer                       |
| https://www.gamesindustry.biz       | GamesIndustry.biz                    |
| https://www.gamespot.com            | GameSpot                             |
| https://www.gamesradar.com          | GamesRadar+                          |
| https://www.gematsu.com             | Gematsu                              |
| https://www.hoopsrumors.com         | Hoops Rumors                         |
| https://www.nintendolife.com        | Nintendo Life                        |
| https://www.pcgamer.com             | PC Gamer                             |
| https://www.pushsquare.com          | Push Square                          |
| https://www.rockpapershotgun.com    | Rock Paper Shotgun                   |
| https://www.sbnation.com            | SB Nation NBA                        |
| https://www.theguardian.com         | The Guardian US, The Guardian World  |
| https://www.theverge.com            | The Verge                            |
| https://www.videogameschronicle.com | Video Games Chronicle                |
| https://www.yardbarker.com          | Yardbarker NBA                       |

## Article origins and rollout gates

All nine returned article origins were recognizable public source services:
`https://basketball.realgm.com`, `https://news.google.com`, `https://sports.yahoo.com`, `https://www.aljazeera.com`, `https://www.basketballinsiders.com`, `https://www.bbc.co.uk`, `https://www.destructoid.com`, `https://www.gematsu.com`, `https://www.pcgamer.com`.

Five Tech rows use `news.google.com`: that is the aggregator, not the publisher
named in the headline. Public UI must describe these as source origins and must
not imply that an origin opens the article. Canonical article links remain omitted.

This closes inspection of the current configured catalog and current preview text.
It does not approve every historical or future title/hostname. Recheck changed
configuration and the preview snapshot before promotion; historical article URLs
remain restricted. No hostname allowlist or DNS verification was added.

Still required: replace overlapping legacy controllers, install the authorization
gate, verify proxy forwarding with an authenticated browser and finish phase 1
scheduled acceptance before activating accounts. Public mode/accounts remain off.

Snapshot SHA-256 (sorted-key compact JSON of topics/sources/articles):
`8240937f559b6bb91a64ed0a7eb5a7407f837dc90c35cea483b9b1f9db698e06`.
