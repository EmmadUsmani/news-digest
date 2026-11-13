# World Bluesky discovery pilot

Prepared November 13, iteration 2150. **Not enabled.** NBA/item 58 scheduled
acceptance and private public-mode activation retain priority. The optional
collector policy and default-off scheduler wiring are implemented offline.
Deployment and activation remain pending outside the protected window, after
that work permits it.

## Candidate schedule

Replace some existing World searches rather than adding searches. Start with a
bounded pilot retaining half the current discovery as a baseline:

| UTC hour modulo four | One World query                             |
| -------------------- | ------------------------------------------- |
| 0                    | `World news & politics` (existing fallback) |
| 1                    | `Ukraine`                                   |
| 2                    | `World news & politics` (existing fallback) |
| 3                    | `Gaza`                                      |

These two event terms have [free search evidence](../edition-reviews/2026-11-12-bluesky-pool.md#bounded-free-discovery-comparison--iteration-2149).
They are pilot terms, not a permanent definition of World coverage. Retaining
the weak baseline keeps other discoveries possible and supplies a comparison.
The current evidence does not justify adding untested terms or dropping the
baseline entirely. Revisit the event list using actual relevant developments.

## Implementation contract

- Add an opt-in collector policy keyed by the configured World topic ID, with
  this bounded query list. Default off; no topic name matching in production.
- Select one slot using `floor(collectionEndEpochMs / 3600000) % 4`. Capture the
  collection end once. A retry in the same hourly slot uses the same query;
  restart does not reset rotation. No new scheduler, timer or persisted cursor.
- An explicit nonempty topic `blueskyQuery` takes precedence over rotation.
  Rotation replaces the fallback only. Disabled/zero-budget topics stay skipped.
- Pass exactly one selected string into the existing sequential collector.
  Do not join queries, interpret separators in existing strings or launch
  parallel searches. Keep first-five-topic admission and stop-on-error behavior.
- Keep two pages of 25 posts per query, the 24-hour window, session/backoff,
  deduplication and observation storage unchanged. No new inference or replay.
- Leave relevance policy, semantic safety/scope checks, post budgets, editor
  prompts and edition generation unchanged. A phrase shortlist of zero under
  World's empty positive policy is not a semantic rejection.
- Report the actual hourly query in existing collection results. Update the
  coverage report's fallback explanation: its static query is insufficient to
  explain an enabled hourly rotation. Preserve historical-query uncertainty.

## Acceptance and rollback

| Check                | Required result                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Offline policy tests | UTC rollover/retry, explicit override, disabled/zero-budget World, unchanged other topics, propagated search/storage failure                 |
| Aggregate allowance  | Five active topics: 120 daily searches, at most 240 search pages and 6,000 submitted observations; World uses 24 searches, not 72            |
| Pilot allocation     | World baseline 12 searches; Ukraine six; Gaza six per complete UTC day                                                                       |
| Natural collection   | Compare first full day with pre-pilot coverage: distinct safe engaged posts/authors, read bounded texts, label relevance and event diversity |
| Natural edition      | Review actual World editorial picks and concrete context; engagement alone does not establish relevance or truth                             |
| Rollback             | Disable policy; next hourly pass uses unchanged topic override/fallback. No data deletion or scheduled generation needed                     |

Do not count login/refresh requests as search pages. The aggregate figures are
upper bounds for hourly passes, not promises of new unique posts. Compare
baseline/event results with their collection hours; different hourly samples
are not a controlled estimate of query quality. Record measurements in the
edition review, not the owner handbook. No paid verification is authorized.

## Reproducible offline rehearsal

`pnpm exec tsx scripts/rehearse-world-bluesky-rotation.ts` reads current topic
metadata through the local admin endpoint, then uses fake search/storage ports
with the real collector. It submits no observations and contacts no provider.
It passes the optional World topic-ID policy directly to the collector; the
scheduler supplies no policy unless explicitly enabled and retains its existing
queries by default. An
existing explicit World override refuses the rehearsal.

November 13 result: 24 simulated hours, 120 searches, baseline/event allocation
12/6/6; each search has the existing 24-hour window; all other topic results
match the unchanged collector; input metadata remains unchanged. Search-page
and submission maxima are derived from existing adapter/collector bounds, not
live measurements. Natural collection and editorial quality remain open.

Iteration 2151 additionally rehearses the existing collector contract: explicit
query trimming/precedence, disabled and zero-budget topic exclusion, five-topic
admission, and immediate pass termination on search or storage failure. Both
failure cases preserve the original error and prevent searches for later topics.
Iteration 2152 runs those checks with the actual optional rotation policy,
including explicit override at an event slot. Eight additional checks cross UTC
midnight and retry with a moving observation clock: each invocation retains its
captured collection window and deterministic query. The 24-hour allocation now
exercises the policy directly, with no topic metadata overlay. Scheduler wiring and
activation remain pending; no production caller opts in. Iteration 2153 labels
the coverage report query as current and unrotated, and explains that stored
observations cannot attribute posts to baseline or event queries. Natural pilot
comparison must retain the actual hourly collection results separately.

## Scheduler opt-in — iteration 2154

The worker reads `BLUESKY_WORLD_ROTATION_ENABLED` once at startup. Only `1`
enables the policy; `BLUESKY_WORLD_TOPIC_ID` must then contain the configured
World topic UUID. A missing or malformed UUID refuses startup before social
schedulers start. Disabled configuration ignores the ID. Names never select
the topic, and an unmatched UUID changes no topic queries.

No environment setting or deployed worker changed. Activate only after the
NBA/item 58 and private public-mode gates, outside the deployment hold. Before
activation, verify the UUID against current default topics and retain hourly
BullMQ collection results (48 completed jobs are retained) before they expire.
Those results include actual queries and counts; they cannot attribute each
individual stored observation to a query. Disable the flag and restart the worker
to roll back. Nine configuration checks and the full fake-port day now use
the same configuration parser as the scheduler.
