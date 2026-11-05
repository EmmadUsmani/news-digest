# X search plan

Owner-approved design (2026-11-04, revised the same day) for STEERING items 30
and 34. This version replaces the earlier story-reaction and trending design.

## Goal

**Find viral posts the news hasn't picked up:** things the press hasn't reached
yet, or will never write about. Highlights, leaks, demos, fan moments.

The app already has a free path that works: X links mined from articles and
news rivers. It finds posts the press has linked, and the owner is happy with
it. Paid search has one job: **find what that path can't.** Paying to find
reactions to stories we already cover would duplicate it.

## What round 1 showed

Round 1 ran on Nov 4 and cost $0.53. Details are in
[the review](edition-reviews/2026-11-04-x-experiment-review.md).

- **Likes minimums, Top sort and `OR` work.** Trending posts had a median of
  1,714 likes, against 8 for the old search.
- **A search matches words, not subjects.** There is no topic feed. Posts that
  say "NBA" are often betting; good posts often don't say "NBA".
- **The topic name is a poor query.** "Tech & AI" gave 0 of 8 on topic. A
  missing space also broke every trending query (fixed in iteration 704).
- **Grok improvised time filters:** none, `_UTC` form or ISO form. Both
  out-of-window reaction posts came from the missing and ISO cases.
- **The AI scorer sees only post text.** X posts arrive labelled "Verified X
  post", with no author, likes or media, so clips look like vague sentences.
- **Meaning-based search** (`x_semantic_search`) got 4 of 5 on topic for Tech,
  but with very few likes. The saved calls show no likes filter.

## Design

**One paid search per topic per day,** 5–30 minutes before the edition.

1. **Grok writes the keywords, fresh on each search, from the topic's saved
   description.** It writes 8–10 terms people use when posting about the topic:
   - **a mix of general topic words and well-known names.** General words
     catch new things nobody has named yet; names catch the familiar;
   - joined with `OR`, unquoted, except multi-word terms;
   - **not from headlines or story titles.** That pulls towards the news.

   Tech & AI might give:
   `AI OR LLM OR "AI agent" OR "open source" OR OpenAI OR Anthropic OR DeepMind OR Nvidia`

2. **Code builds everything else,** and Grok copies it unchanged:
   `(<keywords>) -filter:replies -filter:retweets lang:en <exclusions> min_faves:<N> since:<start> until:<end>`
   - Top sort, `x_keyword_search`, 16 results.
   - `since`/`until` use the exact edition window, in the form
     `2026-11-03_21:00:00_UTC`. Code still drops out-of-window posts.
3. **Store no keyword list.** Nothing about names or products is saved or
   maintained. Keep storing the query Grok actually ran.
4. **X ranks and filters. Our AI judges.** No quality judgement in the Grok
   prompt, and no "avoid…" lists.

### Per-topic settings (database)

| Topic     | `min_faves` | Exclusions                            |
| --------- | ----------: | ------------------------------------- |
| NBA       |       1,000 | `-odds -parlay -picks -bet -giveaway` |
| World     |       2,000 | `-giveaway`                           |
| Tech & AI |         500 | `-giveaway`                           |
| Gaming    |         500 | `-giveaway`                           |

- **Zero results is a valid answer** ("nothing viral today"). Never lower a
  minimum during a run.
- **Adjust minimums at most weekly,** from stored results, and note why.

### AI scorer

Give social triage each X post's **author, reported likes (when known) and
whether it has media,** instead of the "Verified X post" label. Likes stay
labelled as unverified hints. Bluesky is unchanged.

### Budget

- **Production stays $0.40/day and $12/month.** A call costs about $0.013 plus
  $0.005 per post, so 16 posts are about $0.09 and four topics about $0.37.
- **Check the plumbing fits:** all four calls must pass admission under the cap
  given the per-call reservation, and output-token and link limits must not cut
  off 16 results. The production adapter still keeps only five links.
- **If spend doesn't fit,** drop the quietest topic's search.

## Steps

1. **Fix the query.** Build the design above in the experiment path and the
   switched-off schedule. No paid calls.
2. **Fix the scorer,** only after the Nov 5 edition. New inputs change cache
   keys, so don't risk the budget before that run.
3. **Run two test rounds:** after 21:00 UTC on Nov 5 and on Nov 6, each on a
   fresh, non-overlapping 24-hour window.
   - **Per topic, per round:**
     - the keyword search above;
     - one `x_semantic_search`, 8 results, asking for new and popular posts in
       the topic. It is a test only, to show what keywords miss.
   - **Don't pay to rerun the old search.** Production runs it daily, so use
     that as the baseline.
   - **Cost:** about $0.58 a round, bringing the total to about $1.69 of the
     $2.50, within $1.00 per UTC day. Item 31's rules apply.
   - **Optional, only if the budget allows:** one lower and one higher
     `min_faves` where results were too thin or too noisy.
4. **Decide, using the rule below, and ack the numbers.**
5. **Ship.** Earliest is the Nov 7 edition.
   - Switch on the new search, never between 13:00 and 16:00 UTC.
   - Delete the old open search, follow-ups, optional slots and story-reaction
     code, including `reaction_min_faves`.
   - Curated account lists no longer feed anything. Keep the saved lists, and
     say so in the handbook.
   - Keep oEmbed verification, the ledger, daily admission and the caps.
   - Update the Social posts handbook page.
6. **Evaluate over 3 consecutive editions.**

## Decision rule

**A usable post** meets all of these:

- inside the window;
- relevance ≥ 6 from the AI scorer;
- not a promotion after scoring (raw results don't count against a search);
- at or above the topic's `min_faves`;
- **not already found by the free links.**

**Then:**

- **Keyword search ships** unless it gives fewer usable posts than the old
  search over the same days.
- **Meaning-based search:** report how many usable posts it found that keywords
  missed. If that is 4 or more across both rounds, keyword search still ships,
  and the owner decides whether to split the $0.40.
- **Model:** stay on Grok 4.3. The cheaper model would save under 8%, and its
  X Search support is unverified. Drop the model round.

## Done when

Over 3 consecutive editions:

- on at least 2 of 3, NBA, Tech & AI and Gaming each have at least 2 usable
  posts;
- those posts reach the edition. If the editor doesn't pick them, report it;
  don't add slots;
- no promotions are shown, and spend is within the caps;
- screenshots are in the edition reviews.

**World is reported separately.** It may do worst, because its posts are mostly
opinion. If it falls short, report the numbers and don't add World-only logic.

## Guardrails

- **No saved keyword or name lists,** and no keywords from headlines.
- **No new prompt wording rules** ("avoid crypto…").
- **No repeated snapshots** for velocity, and no new follow-up or optional-slot
  machinery.
- **No daily hand-tuning** of minimums or queries.
- **No more analysis of round 1.** Its query problems are understood.
- **If stuck, report it** rather than improvise.
