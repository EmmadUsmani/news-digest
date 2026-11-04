# X search quality plan

Owner-approved design (2026-11-04) for STEERING item 30. It replaces the
current open-topic search, follow-up searches and optional slots.

## Why the current search fails

Nov 4: 19 verified posts cost $0.149, but **none were picked**. The NBA posts
were all betting promotions, World got hashtag roundups, and the best post
had 12 likes. The causes:

| Cause                                                                       | Effect                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `max_turns: 1` and "use one search, at most five results"                   | Every call fetched exactly 5 posts. "Most-engaged of five" ranks nothing |
| One broad query on the topic name, no sort mode, no operators               | X returns whatever posts most often: spam, betting touts                 |
| Grok is asked to judge quality through a long list of "avoid…" instructions | That doesn't filter anything and costs ~2,000 reasoning tokens per call  |
| Story-reaction search only runs as a fallback                               | The search most likely to find newsworthy, relevant posts rarely runs    |
| The query Grok actually ran isn't stored                                    | Bad results can't be traced to a bad query                               |

**Cost structure** ([xAI X Search docs](https://docs.x.ai/developers/tools/x-search)):

- **Posts:** $5 per 1,000 posts fetched, so 5 posts are about $0.025 of
  each $0.039 call.
- **Filtering is free:** X filters on its side with its own advanced search
  operators, and `x_keyword_search` sorts by Top or Latest.
- **So filtering fixes cost as well as quality:** fetching junk is the
  expensive part.

## Design

**Principle:** X does the ranking and filtering; our existing AI triage and
editor judge quality. Grok only runs well-formed searches. It is not the judge.

### Two searches per topic per day

| Search                            | Query                                                                                            | Purpose                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| **A. Story reactions** (primary)  | Keywords for the topic's top 2–3 ranked stories, joined with `OR`, plus suffix + `min_faves:<A>` | Newsworthy and relevant by construction                        |
| **B. Topic trending** (secondary) | Topic keywords, plus suffix + `min_faves:<B>`                                                    | Viral things the news hasn't covered: highlights, leaks, demos |

- **Suffix (built by code):** Top sort, `-filter:replies -filter:retweets
lang:en`, plus per-topic exclusions (NBA: `-odds -parlay -picks -bet`).
- **Top stories for A:** the topic's highest-ranked articles in the edition
  window at search time, using the non-AI ranking or cached triage scores.
  No new AI calls.
- **Curated account lists:** the lowest priority, used only if the budget
  allows.

### Who writes what

- **Code** builds the operator suffix and engagement threshold from per-topic
  settings, and passes the story titles to search.
- **Grok** writes short keyword phrases only. The prompt says: run
  `x_keyword_search` in Top mode with exactly this suffix, and return post
  URLs and counts. No quality judgement and no "avoid…" lists.
- **Store, for every call,** the query, sort mode and function Grok actually
  ran (the response's `custom_tool_call` items), next to the ledger row.

### Per-topic settings (in the database, not code)

| Topic     | `min_faves` A | `min_faves` B | Exclusions                  |
| --------- | ------------: | ------------: | --------------------------- |
| NBA       |           100 |         1,000 | `-odds -parlay -picks -bet` |
| World     |           200 |         2,000 |                             |
| Tech & AI |            50 |           500 |                             |
| Gaming    |            50 |           500 |                             |

- **Zero results is a valid answer** ("nothing viral today"). Never lower a
  threshold during a run.
- **Adjust thresholds at most weekly,** from stored results, and note why.

### Budget

- **Production stays $0.40/day and $12/month.** That's about 8 calls a day
  (A and B per topic). Each fetches roughly 8 already-filtered posts, for
  about $0.05.
- **If the projected spend doesn't fit,** search B is dropped first, starting
  with the quietest topics.
- **Velocity:** likes per hour since posting, from the single reported count.
  No repeated snapshots.

## Steps

1. **Instrument.**
   - Store Grok's actual tool calls per discovery call.
   - Add the per-topic settings (thresholds, exclusions).
   - Update `schema-meta.json`.
2. **Experiment, capped at $1.00 of xAI credit in total.**
   - **Spend limits:** no more than $0.50 per UTC day, recorded apart from
     production spend. Not between 13:00 and 16:00 UTC.
   - **Round 1 (Grok 4.3):** three styles across all four topics against the
     same window, within one hour:
     1. the current search;
     2. B;
     3. A.
   - **Round 2 (model):** the winning style on the cheapest current xAI
     model that supports `x_search`. Check the official model table for it.
   - **Measured for each style and model:**
     - posts fetched;
     - median and maximum likes;
     - share inside the window;
     - share passing social triage (relevance ≥ 6);
     - promotions or spam;
     - cost;
     - the actual queries run.
   - **Decision rule (fixed in advance):**
     - **Style:** the most in-window, triage-passing posts per dollar, with
       zero promotions.
     - **Model:** the cheaper one, if it passes at least 90% as many posts.
   - **Also confirm** that `min_faves`, Top sort and `OR` work through the
     tool. If `min_faves` doesn't work, use Top sort with the other filters.
     If Top sort doesn't work either, stop and write `NEEDS_FROM_HUMAN.md`.
   - **Record the results** in a short `docs/decisions/` note.
3. **Ship the winner.**
   - Replace open-topic search, follow-ups and optional slots with the fixed
     A/B schedule, and delete the replaced machinery.
   - Keep oEmbed verification, the ledger, the daily admission check and the
     caps.
   - Update the Social posts handbook page.
4. **Evaluate over 3 consecutive editions.** Done when:
   - every topic, World included, has at least 2 X posts from search;
   - those posts meet their topic's threshold;
   - there are no promotions;
   - spend is within the caps;
   - screenshots are in the edition reviews.

## Guardrails

- **No new prompt wording rules** ("avoid crypto…"). Filtering is X's
  operators plus our triage.
- **No repeated snapshots** for velocity, and **no new follow-up or
  optional-slot machinery**.
- **No daily hand-tuning** of thresholds or queries.
- **Time limits:** steps 1–2 take a few iterations, step 3 about a day. If
  stuck, report it rather than improvise.
