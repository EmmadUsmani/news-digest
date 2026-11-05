# World story-pool evidence (iteration 868)

Recommend a **40-article scored pool before grouping**, then at most ten
stories for editing. This is the existing model adapter's supported maximum;
no prompt change or topic-specific selection rule is needed. Publication still selects ten articles; the prepared selection and grouping
helpers accept forty. Activation awaits the gates below.

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

## Prepared bounded path (iteration 869)

`editorialShortlist` now accepts an explicit forty-article pool, while its
publication default remains ten. The grouping wrapper accepts up to forty;
the final ranking still caps editor inputs at ten stories. The offline replay
now exercises both production helpers using the reviewed memberships and
confirms seven Nov 4 and ten Nov 5 editor candidates. A separate synthetic
case combines thirty reports and retains other events beyond article ten.
These are reviewed-label and fake-port results, not actual model results.

Activation remains pending actual grouping/cache replay and the all-topic
configured-price cap/reserve check. No prompt, publication call site, budget,
provider or model changed in this preparation step.

## Actual cache probe (iteration 870)

With the VM's configured Haiku model and database, run:
`pnpm exec tsx scripts/replay-world-grouping-cache.ts --read-only-cache`.
The script opens a read-only repeatable-read transaction, reconstructs the
production grouping requests for ten and forty saved articles, and looks up
their exact production fingerprints. Hits pass the production membership
validator before ranking; misses report null story counts, never singleton
counts presented as model results. It cannot dispatch inference or write cache,
ledger, settings or editions. Output contains only IDs, counts and cache status.

Nov 5 and Nov 4 both missed at ten and forty articles (four misses). Thus these
retained post-publication fixtures cannot supply a cached model replay. This
does not imply the historical Nov 5 grouping call was uncached or absent:
request identity includes article text, order and model, and the saved fixture
is not an exact historical request capture. Reviewed counts above remain label
results. No paid calls were made and publication still uses ten articles.

Next: check all-topic configured-price cap/reserve headroom, then use the
explicit, ledgered verification opt-in allowed by STEERING 4 (few Haiku calls,
maximum $0.05 per iteration) if an actual model replay is still necessary.
Do not repeat this cache probe expecting forty-item responses to appear before
those requests have ever run. Activation remains gated by the budget check and
actual grouping evidence before Nov 6 13:00 UTC.

## All-topic configured-price gate (iteration 871)

Run `pnpm exec tsx scripts/evaluate-story-pool-budget.ts --read-only`.
At Nov 5 18:30 UTC, all four saved-score pools contain forty eligible articles.
The command uses a read-only transaction and the VM's configured prices and
reserve policy. It intercepts production grouping/editor requests without
inference, cache access, ledger writes or edition changes. Article text and topic
settings are current observations, not reconstructed historical prompt bytes.

For editing, it bounds any ten selected leads using the ten largest serialized
inputs and the three largest encoded source labels in each pool (grouped leads
inherit merged sources). These synthetic inputs are cost bounds, not stories or
model grouping results. Both output ceilings remain unchanged.

| Topic   | Ten-article grouping bound | Forty-article grouping bound | Forty-pool editor bound |
| ------- | -------------------------: | ---------------------------: | ----------------------: |
| Tech/AI |                  $0.002804 |                    $0.004029 |               $0.067353 |
| NBA     |                  $0.002916 |                    $0.004418 |               $0.071485 |
| Gaming  |                  $0.003101 |                    $0.004827 |               $0.074438 |
| World   |                  $0.003289 |                    $0.005130 |               $0.075993 |

The scenario replaces Nov 5's $0.158747 grouping/story-editor spend with these
first-attempt reservation bounds; unchanged stages retain their measured cost
($0.156698). Total: **$0.464371**, versus $0.437038 for the same ten-article
scenario: **+$0.027333**. These are conservative reservation scenarios, not
predictions of token consumption or an absolute full-edition cost bound.

With no further spending, Nov 6's projected cap is $0.502083; spending today's
entire remaining allowance lowers it to $0.494904. The unchanged protected
reserve is $0.473168, leaving **$0.008797** above this scenario. Retained Sonnet
spend plus story-editor reservations totals $0.379420, below even the lower
cap's configured 80% allocation ($0.395923).

This conditional first-attempt gate passes. Repairs/fallback, new candidates,
other-stage cost changes and concurrent calls still require ordinary ledger
admission; the small reserve headroom is not a guarantee of tomorrow's outcome.
No caps/reserve/settings changed. Next: bounded, ledgered Haiku verification
of the saved World requests under STEERING 4, then decide activation before
Nov 6 13:00 UTC. Do not repeat the known cache misses.

## Actual Haiku verification and activation (iteration 872)

Ran `LLM_LIVE=1 pnpm exec tsx scripts/verify-world-story-pool.ts --verify-once`
with the configured secrets environment outside the protected hours. The fixed
private state directory has an exclusive, fsynced claim: rerunning cannot renew
spend. The existing evaluation guard limits total reservations to $0.05,
Haiku only; shared ledger admission and verification's daily ceiling also apply.
No repairs. Four calls succeeded, ledger purpose `verification`, **$0.005837**
actual cost, $0.016753 combined reservation. Nov 4 ten/forty calls cost
$0.000633/$0.002004; Nov 5 $0.000758/$0.002442. Run:
`item-36-world-96df04f3-0f33-467f-9d5f-59f7c39a26ab`.

| Window | Articles | Model stories including singletons | Editor inputs | Reviewed labels represented |
| ------ | -------: | ---------------------------------: | ------------: | --------------------------: |
| Nov 4  |       10 |                                  1 |             1 |                           1 |
| Nov 4  |       40 |                                 16 |            10 |                           5 |
| Nov 5  |       10 |                                  3 |             3 |                           2 |
| Nov 5  |       40 |                                 20 |            10 |                           7 |

Every returned group stays within its reviewed label. Haiku splits election
coverage into several groups; these model story counts are not independent
story counts. Nov 5's ten-item replay leaves the two Hormuz articles separate,
so its three model stories differ from the two reviewed labels. The wider pool
still improves actual editor diversity: Nov 4 adds Spain, Israel, Ukraine and
South Africa; Nov 5 includes Brand, Israel-government, hush-money, Brazil,
Wong and France alongside election coverage. Exact editor IDs and validated
responses/fingerprints/model are saved in
`apps/api/test/fixtures/llm/world-story-pool-2026-11-05.json`.
The offline regression test replays all four through production selection,
grouping request validation, coverage and ranking without external access.

Publication now explicitly selects forty scored articles before grouping and
keeps the existing ten-story editor cap. No prompt, topic rules, model, prices,
reserve, budgets or historical edition changed. Activation uses the all-topic
$0.464371 first-attempt scenario above; the verification spend remains inside
the already evaluated full-remaining-allowance case. Ordinary live admission
still controls repairs and future volume. Review actual output, cost and
same-story composition in the Nov 6 scheduled edition; do not pay for another
replay merely to improve these measurements.
