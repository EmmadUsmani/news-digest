# Social posts

Each topic shows a few social posts next to its stories. Today these are X
posts only. X is the owner's #1 social source, Reddit is parked, and Bluesky is
planned.

## How X posts are found

There are two ways in. Both feed one pool of **candidate posts**, and a post
is only shown after X's official embed service confirms it exists.

```mermaid
flowchart LR
  subgraph free["Free discovery (hourly)"]
    riv["News rivers<br/>Techmeme, Memeorandum"]
    art["Article pages<br/>from our feeds"]
  end
  subgraph paid["Paid discovery (daily, capped)"]
    xs["xAI x_search<br/>one search per topic,<br/>weakest topic first"]
  end
  riv -- "X links on page" --> cit[("Citations<br/>post id + where seen")]
  art -- "X links in article" --> cit
  xs -- "post URLs +<br/>reported engagement" --> cit
  cit --> ver{"X oEmbed<br/>verify"}
  ver -- "exists" --> posts[("social_posts<br/>author, time, embed")]
  ver -- "gone / invalid" --> drop["discarded"]
  posts --> sel["Per-topic selection<br/>(AI triage + editor, or rules)"] --> ed(["Edition"])
```

| Path                    | Cost                    | Strength                                | Weakness                                       |
| ----------------------- | ----------------------- | --------------------------------------- | ---------------------------------------------- |
| Free (rivers, articles) | $0                      | Not tied to any account list            | Lags: a post appears only once media embeds it |
| Paid (xAI search)       | ~$0.02 per search today | Searches X directly, before the edition | Currently limited to curated accounts          |

> [!IMPORTANT]
> **In progress (STEERING item 16):** open X search with no account
> restriction, per topic plus reactions to the day's top stories, ranked by
> engagement and velocity. Account-list search becomes a secondary input.
> The worker dependencies are connected, but production keeps account-list
> searches until the first scheduled run is measured and acknowledged.

Curated accounts are editable in **Manage topics → Edit → X accounts**, up to
20 unique handles per topic. They mix first-party announcements with builders,
reporters, players and developers; the [source inventory](../../SOURCES.md)
records the review and choices. They are search inputs, not an allowlist for free
harvesting or a guarantee of relevance. Changes persist and also change the
report's comparison against current account lists.

## Verification and safety

- **Official only:** posts are confirmed with X's public **oEmbed** endpoint,
  and the page renders X's official embed. The app never scrapes x.com.
- **Engagement numbers** from xAI are stored as "reported by xAI", not as
  verified facts.
- **Budget:** paid search has its own ledger and caps: $0.40/day and
  $12/month. The xAI account is prepaid ($15), so it can't overspend even if
  the app is wrong.

The daily discovery report groups spend, fetched posts and new verified yield
by topic and search type, including searches with no results. Unknown charges
and fetched counts remain explicit. Outside-list yield compares current verified
authors with all current account lists; it counts posts and can change when
lists or verification change. It does not measure relevance or historical list
membership. The seven-day report adds daily and whole-week summaries, including
days with no recorded calls. Today can be incomplete; an empty day does not
prove the scheduler covered every topic.

## Other platforms

| Platform | Status                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reddit   | **Parked.** Built, but Reddit blocks public access and ends RSS on Nov 13. The only way back is the official API with owner credentials.                                                                                                                      |
| Bluesky  | **Preparation only:** authenticated discovery, phrase-filtered and semantic engagement/age shortlists, plus storage for timestamped text/media/count snapshots. Explicit free collection is available; scheduled collection and edition inclusion remain off. |
| YouTube  | **Deferred** by the owner.                                                                                                                                                                                                                                    |

Bluesky storage retains each topic's observations separately, so a later count
cannot overwrite the evidence available at an earlier cutoff. Current post
metadata follows the newest observation, even if older responses arrive late.
Disabled topics are excluded from reads and writes; deleting a topic removes
its observations. No production collector or edition selector uses this storage
yet. An explicit collection pass can search the four configured topics over a
24-hour window and store up to 50 observations per topic. It shares one login
and rate-limit backoff across topics and stops on search or storage failure.
The report distinguishes fetched/submitted posts from stored window observations;
replays and disabled topics may produce no new rows. Running the probe without
its `--store` option remains read-only. Stored API counts are observations, not independent verification of reach.

An isolated semantic shortlist can screen at most 50 safe observations with the
budgeted social triage service. It can recover relevant posts without a configured
keyword, requires complete scores, and orders qualifying posts by interestingness,
relevance and observed engagement/age. Missing or malformed scores produce no
semantic picks. This preparation does not call the final editor or publish posts;
API counts still do not establish measured growth or account-relative reach.
