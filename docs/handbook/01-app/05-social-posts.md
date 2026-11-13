# Social posts

Each topic shows a few social posts next to its stories: X posts, the #1
source, and Bluesky posts. Reddit is parked.

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
    xs["xAI x_search<br/>open search per topic,<br/>weakest topic first"]
  end
  riv -- "X links on page" --> cit[("Citations<br/>post id + where seen")]
  art -- "X links in article" --> cit
  xs -- "post URLs +<br/>reported engagement" --> cit
  cit --> ver{"X oEmbed<br/>verify"}
  ver -- "exists" --> posts[("social_posts<br/>author, time, embed")]
  ver -- "gone / invalid" --> drop["discarded"]
  posts --> sel["Per-topic selection<br/>(AI triage + editor, or rules)"] --> ed(["Edition"])
```

| Path                    | Cost                   | Strength                                | Weakness                                          |
| ----------------------- | ---------------------- | --------------------------------------- | ------------------------------------------------- |
| Free (rivers, articles) | $0                     | Not tied to any account list            | Lags: a post appears only once media embeds it    |
| Paid (xAI search)       | $0.026–$0.038 on Nov 3 | Searches X directly, before the edition | Reported engagement is not independently verified |

- **Paid keyword search is enabled** for the daily edition.
  The worker has no fallback to the old open search, story reactions or
  account-list follow-ups; the adapter rejects them. Old builders remain for replay.
- **Keyword search:** runs 5–30 minutes before the edition,
  weakest topic first. Grok writes fresh keywords from each topic's guidance;
  code supplies the engagement thresholds and exact edition window.
  One search per topic; at most one admitted retry for a failed call.
- **Curated accounts:** editable in **Manage topics → Edit → X accounts**;
  keyword discovery searches all accounts. See [Sources](../../SOURCES.md).
- **Reports:** daily `scripts/report-x-discovery.ts` and weekly `report-x-week.ts`
  show spend, new verified posts and outside-list authors by topic/search type.
  Daily evidence includes billing, execution, tool inputs and provider status.

X triage receives the author, reported likes when available (labelled as
unverified hints), and whether the verified text includes a media link. Missing
counts and media stay unknown; a link supplies no evidence of media contents.

## How Bluesky posts are found

- **Collected hourly** through the official API, using the owner's app
  password: one search per enabled topic, up to 50 posts each. The topic editor
  offers a dedicated query; blank uses the first news query, include phrase,
  or topic name. U.S. discovery uses `Congress`. Missing login skips collection.
- **Counts are snapshots:** each observation is stored with its likes,
  reposts, replies and time. An edition sees the counts as they were at its
  cutoff.
- **Selection evidence:** triage gets author, publication time and timestamped
  API counts; triage and the editor know whether media is attached;
  media contents, measured growth and usual account reach stay unknown.
- **At edition time:** AI triage screens up to 50 candidates, then the editor
  fills the topic's remaining post slots, with one qualifying Bluesky post
  allowed to replace the last-ranked X pick. It skips
  posts that repeat something already picked from X.
- **Saved selection evidence:** new editions retain each topic’s open slots,
  observations read, shortlisted candidates, picks and selection result.
  Results separate budget refusal, editing failure and unknown causes.
  Valid picks survive invalid siblings. Saved drops group by fields, IDs, claims and budget.
- **Inspect outcomes:** open **Admin → Editions → a saved edition** for each
  topic’s result and slot/candidate/pick counts.
- **Controls:** `BLUESKY_EDITIONS_ENABLED=0` turns inclusion off.
  `BLUESKY_RESERVED_SLOT_ENABLED=1` holds one slot, replacing the last-ranked X
  pick only when Bluesky qualifies. Enabled on this VM; unset defaults off. Saved evidence records
  held slots and replaced X IDs; open-slot counts include holds; totals stay within budget.

## Verification and safety

- **Official only:** X uses official oEmbed and embeds; Bluesky uses its API.
  Original Bluesky text is saved; display text expands official link targets.
  Neither site is scraped.
- **Engagement numbers are hints, not facts.** xAI's counts are stored as
  "reported by xAI", and Bluesky's as timestamped API counts. The editor
  sees them, but relevance and distinct content come first.
- **Experiment retries:** a timeout or failed/unconfirmed search with no fetched
  posts gets one separately admitted retry. Completed empty searches never retry.
  Timeouts retain their hold; returned usage settles before retrying.
- **Fixed scheduler:** its ledger can admit one linked retry for an
  uncertain timeout or unconfirmed zero-post search, preserving holds and caps.
  Completed empty searches and historical unknown execution cannot qualify.
  Dispatch repeats the budget, schedule, topic and time-window checks before
  retrying once; durable admission prevents another retry on later ticks.
- **Accounting:** calls allow 120 seconds. Returned token usage settles the actual
  cost; missing fetched-post/profile counters count as zero. No-response timeouts
  keep their reservation. Saved experiment responses can settle holds offline;
  hash-linked journal additions preserve the original request entries.
- **Search tracing:** each paid call stores the actual search functions and
  inputs returned by xAI alongside its cost. Settlement also saves whether
  search execution was confirmed, including completed empty searches. Older calls
  keep unknown execution.
- **Budget:** paid X search has its own ledger and caps: $0.50/day and
  $15/month. The xAI account is prepaid ($15), so it can't overspend even if
  the app is wrong. Bluesky is free; its AI triage and editing use the
  normal AI budget.

## Other platforms

| Platform | Status                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Reddit   | **Parked.** Built, but Reddit blocks public access and ends RSS on Nov 13. The only way back is the official API with owner credentials. |
| YouTube  | **Deferred** by the owner.                                                                                                               |
