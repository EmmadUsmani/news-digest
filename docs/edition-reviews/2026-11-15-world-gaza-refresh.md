# World Gaza discovery: second saved cohort

Iteration 2450, November 16. The second scheduled Gaza pass adds post
identities, but its reporting overlaps developments already in the World pool.
Retain the pilot until natural editorial selection can be assessed.

## Exact collection

[Retained job](2026-11-15-world-bluesky-jobs.json)
`repeat:bluesky-hourly:1794786883867` ran November 15 23:54:43.872–23:54:53.116 UTC.
It fetched/submitted 49 World observations. A repeatable-read, read-only database
transaction returns exactly 49 distinct identities within that job interval.
Eleven had no earlier World observation; 38 had appeared in the first Gaza
pass at 19:54 UTC. No identity in this pass was previously seen only in another
World query. These are collection identities, not editorial acceptances.

[Saved examples](2026-11-15-world-gaza-refresh-examples.json) preserve every new
identity plus repeated posts needed to compare reporting. No live search,
media fetch, inference, collection or edition write was made.

## Reader contribution

| Saved contribution                                                                           | Assessment                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aljazeera.com`: countries accuse Israel of blocking tents and supplies; 153 likes           | Attributed outlet reporting, but the earlier `cecallihelper.bsky.social` post already quotes an international shelter-material appeal. Treat these as potentially overlapping until sources establish a distinct development. |
| `middleeasteye-rss.bsky.social`: live-blog link about half the promised aid trucks; 17 likes | New identity repeats the aid-truck development already linked by two mirror posts and `rimaanabtawi.bsky.social`. It should not earn another slot solely for its different URL.                                               |
| `safehrm.bsky.social`: solidarity cycle ride supporting Gaza Sunbirds; 15 likes              | Concrete local activity with two image descriptions, but saved text does not establish a new on-the-ground Gaza development.                                                                                                  |
| Remaining eight new identities                                                               | Political commentary, advocacy, a short slogan, a help request and a historical reference. No additional reported development is established by their saved text.                                                             |

The highest-liked new identity is commentary (276 likes), above the outlet
reporting. New identities therefore overstate distinct useful reporting.
The repeated cohort retains previously reviewed outlet reporting alongside
commentary and advocacy; this refresh does not establish a quality improvement.
All post claims remain attributed claims, not independently verified facts.

## Decision

Keep World baseline/Ukraine/baseline/Gaza, cadence, gates, budgets and X
preference unchanged. The next natural edition should test whether relevant
reporting reaches the actual intake and whether selected posts add distinct
contributions. Review the first full UTC rotation day after November 17 00:00;
do not repeat generic probes or infer editorial rejection from absence alone.

Private receipt: `/tmp/2450-gaza-posts.json`; exporter `/tmp/2450-export.ts`.
