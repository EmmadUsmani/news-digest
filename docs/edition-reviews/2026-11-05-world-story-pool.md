# World story-pool evidence (iteration 868)

Recommend a **40-article scored pool before grouping**, then at most ten
stories for editing. This is the existing model adapter's supported maximum;
no prompt change or topic-specific selection rule is needed. The publication
shortlist and grouping wrapper still limit inputs to ten: this evidence step
has not changed production.

## Saved-window replay

`pnpm exec tsx scripts/evaluate-world-story-pool.ts` runs without environment
keys, network, database, cache writes or provider calls. The fixture retains
original saved-edition scores, the top forty scored articles and explicit
agent-reviewed memberships. Article text/source labels were read after
publication, so this is not an exact reconstruction of historical prompt bytes.
The scores and membership of the forty-item pool come from the saved editions,
not current-window ingestion. Excerpts are retained to the grouping limit of
600 characters.

The labels conservatively combine all US midterm outcomes/reactions, and the
Hormuz developments. They are evidence labels, **not model outputs**, runtime
wording rules or a general grouping-quality estimate. The replay runs production
ranking against those memberships. Its request interceptor captures the existing
grouping adapter's request and returns null without dispatching it.

| Scored article pool | Nov 4 reviewed stories | Nov 5 reviewed stories | Nov 5 editor inputs after ten-story cap |
| ------------------- | ---------------------: | ---------------------: | --------------------------------------: |
| 10                  |                      1 |                      2 |                                       2 |
| 20                  |                      5 |                      6 |                                       6 |
| 30                  |                      5 |                     10 |                                      10 |
| 40                  |                      7 |                     13 |                                      10 |

Forty improves Nov 4 beyond thirty and gives Nov 5 headroom above ten stories.
Nov 4's top ten are all midterm reports. Grouping was disabled for that edition:
the editor received ten articles and produced one story. Thus the same article
limit restricted its subject coverage even without the grouping pass. Nov 5's
ten contain eight midterm reports and two Hormuz reports; the saved edition
published two stories. Other retained stories include Ukraine, Ebola trials,
French strikes and Israeli government formation.

## Cost bounds and deployment gate

These are conservative byte-based reservation bounds using checked-in default
Haiku prices ($0.125/M input bound, $0.50/M output), not measured provider cost.
The script includes the production 2,048 framing allowance and unchanged
4,096-output limit. Actual configured prices must be checked before deployment.

| Window | Grouping reservation: ten articles | Forty articles |  Increase |
| ------ | ---------------------------------: | -------------: | --------: |
| Nov 4  |                          $0.003251 |      $0.005082 | $0.001831 |
| Nov 5  |                          $0.003289 |      $0.005131 | $0.001842 |

Nov 5 editor candidate JSON grows from 1,111 to 5,531 bytes with the reviewed
groups: 4,420 additional bytes, or $0.011050 additional conservative input
reservation at default Sonnet cache-write pricing ($2.50/M). The 4,000-output
limit and ten-candidate ceiling stay fixed. More selected stories can consume
more output than the old two-story result; unchanged output ceilings do not
mean unchanged actual editing cost. Repair/fallback calls remain separately
reserved by the existing ledger.

The World grouping-plus-editor input-reservation delta is about $0.012892
for Nov 5 under these labels. This is not a four-topic edition projection or
proof of admission under tomorrow's cap. The next step must implement the
bounded pool, replay through the actual grouping cache where available, and
check all-topic configured-price reservations against the daily allowance and
scheduled reserve before deploying. Preserve the current caps and reserve;
deploy before Nov 6 13:00 UTC or defer a day. Review the scheduled result.
