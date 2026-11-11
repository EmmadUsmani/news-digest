> Superseded for activation by STEERING 57, received during iteration 1858.
> The 1.5× fit test and further savings search are dropped. Historical
> measurements below remain evidence only; activate under the revised plan.

# Fifth-topic saved-cost estimate — iteration 1840

Read-only ledger evaluation; no provider requests or cap changes.
Run `pnpm exec tsx scripts/evaluate-fifth-topic-budget.ts --read-only`.

| Saved edition | Actual Anthropic cost | Fifth-topic equal-share proxy |
| ------------- | --------------------: | ----------------------------: |
| Nov 4         |             $0.291162 |                     $0.072791 |
| Nov 5         |             $0.315445 |                     $0.078862 |
| Nov 6         |             $0.286904 |                     $0.071726 |
| Nov 7         |             $0.380173 |                     $0.095044 |
| Nov 8         |             $0.320864 |                     $0.080216 |
| Nov 9         |             $0.388257 |                     $0.097065 |
| Nov 10        |             $0.422356 |                     $0.105589 |

Costs are joined by saved edition UUID/run ID, including repairs, with no
unresolved calls. The ledger does not store topic IDs, so these are measured
whole-edition costs, not measured World costs. The incremental column divides
by the four saved topics; it is an estimate rather than an attribution.

The largest saved run plus one equal-share topic is **$0.527945**. Its 1.5×
reserve is **$0.791918**, above item 56's **$0.65** ceiling. Even the largest
recent fully AI-complete run ($0.388257) gives a five-topic proxy of $0.485322
and reserve of $0.727983. Nov 11's latest complete run costs $0.330915;
its five-topic proxy is $0.413644 and reserve $0.620466. Choosing only the
latest cheaper run would discard the reserve policy's peak-cost protection.

The configured daily maximum currently defaults to $1.00; actual admission
also applies the remaining-month daily allowance and model caps. This step
changes neither configuration nor admission. The configured reserve is enabled,
measured, with 1.5× headroom and no explicit override.

Before activation, joint curation needs a costed request estimate and an
admission calculation against the remaining-month allowance. The current
proxy does not establish that five topics fit the approved ceiling. Reduce
incremental work within the approved models and existing editorial quality
requirements; do not raise the ceiling or relax reserve protection. X caps and
production topics stay unchanged until the coordinated deployment.

## Joint request reservation probe — iteration 1842

Run `pnpm exec tsx scripts/evaluate-joint-ownership-budget.ts`. This uses the
actual `EventGrouping.assignTopics` prompt and `BudgetedLlm` reservation path
with a refusing in-memory ledger and a provider that throws if called. There
are no database accesses, ledger writes or provider requests. Prices come from
the configured Anthropic model; secrets are never printed.

| Input proxy                                      |  Input byte bound |                Reservation |
| ------------------------------------------------ | ----------------: | -------------------------: |
| Nov 4–10 saved summaries, one to five stories    |       3,958–5,921 |        $0.002543–$0.002789 |
| 40 articles with maximum-length ASCII fields     |            64,864 |                  $0.010156 |
| 40 articles with maximum-length multibyte fields | Above input limit | Refused before reservation |

Reservations include the full 4,096-token output allowance and the production
byte-based input bound, priced at the largest input/cache rate. Each accepted
input attempts exactly one reservation; refusal returns unavailable without
repair or provider work. Multibyte input shows that 40 articles alone does not
guarantee a request fits; publication must handle unavailable ownership.

The ASCII stress case is not a universal maximum: scopes, shared references,
JSON escaping and multibyte characters also consume input space. Saved summaries
are an explicitly offline size proxy, not the raw shortlist or a semantic test.

Adding the ASCII request reservation to the existing five-topic cost proxy
gives $0.538101 and a 1.5× reserve of **$0.807152**. This deliberately credits
no savings from replacing existing grouping requests: topic-level attribution
is absent. It still fails the $0.65 ceiling. The joint request is inexpensive,
but it does not resolve the fifth editorial pass's cost. Next: cost the actual
publication request plan and identify measured savings before activation;
do not admit an edition from these proxy figures alone. Caps remain unchanged.

## Grouping replacement savings bound — iteration 1843

The same read-only evaluator now reconciles each saved run against the
repository's model/purpose ledger breakdown, including charged repairs.
It rejects unresolved calls and reports grouping separately. No provider work.

| Edition | All four topics' grouping cost | Five-topic proxy reserve if all grouping were free |
| ------- | -----------------------------: | -------------------------------------------------: |
| Nov 4   |                      $0.000000 |                                          $0.545930 |
| Nov 5   |                      $0.002103 |                                          $0.588306 |
| Nov 6   |                      $0.005699 |                                          $0.529397 |
| Nov 7   |                      $0.006594 |                                          $0.702935 |
| Nov 8   |                      $0.004778 |                                          $0.594453 |
| Nov 9   |                      $0.007059 |                                          $0.717395 |
| Nov 10  |                      $0.007571 |                                          $0.780561 |

Even this deliberately excessive savings credit leaves the peak reserve
**$0.130561 over $0.65**, before adding any joint ownership request. It removes
all four topics' grouping, although the change may replace only World/U.S.
grouping; it also assumes the replacement is free. It is a counterfactual
bound within the equal-share proxy, not an achievable publication plan.
Nov 4 has no charged grouping; zero does not imply a missing ledger run.

Nov 10's $0.422356 total is dominated by Sonnet story editing ($0.211287)
and social editing ($0.123422, including Bluesky); grouping is $0.007571.
The ledger alone has no topic attribution. At this stage their costs could not
be credited as World savings; iteration 1857 below reconciles topic-bearing
settlement logs. The other three topics' editing stays fixed under item 56.

Conclusion: replacing grouping alone cannot rescue the current conservative
five-topic proxy. Next prepare the actual combined shortlist/publication plan
and measure its marginal request sizes without paid calls. Preserve the reserve
policy, editorial repair guarantees and $0.65 ceiling; topic activation remains
gated. No cap or runtime changes are justified by these measurements.

## Exclusive story editor reservation probe — iteration 1844

The joint-budget script now also invokes the production `ShortlistEditor`
through the same refusing ledger. It compares one unsplit World shortlist
with two exclusive shortlists using the fixture's manual scope labels. Each
nonempty list attempts Sonnet, then budgeted Haiku after refusal; empty lists
are skipped. Assertions enforce both attempts and zero provider calls.

| Saved input | Unsplit Sonnet reservation | Split Sonnet reservations | Marginal reservation |
| ----------- | -------------------------: | ------------------------: | -------------------: |
| Nov 4       |                  $0.064220 |                 $0.064210 |           −$0.000010 |
| Nov 5       |                  $0.065303 |                 $0.127933 |            $0.062630 |
| Nov 6       |                  $0.068173 |                 $0.068173 |                   $0 |
| Nov 7       |                  $0.068708 |                 $0.131338 |            $0.062630 |
| Nov 8       |                  $0.067233 |                 $0.129863 |            $0.062630 |
| Nov 9       |                  $0.067533 |                 $0.067533 |                   $0 |
| Nov 10      |                  $0.068203 |                 $0.130833 |            $0.062630 |

For the four windows with both scopes represented, splitting the same saved
inputs adds $0.062630 of initial Sonnet reservation. Input content is conserved;
the extra prompt and full 4,000-token output allowance dominate. Nov 4's tiny
reduction comes from the shorter U.S. scope metadata. No saving is claimed for
empty scopes: the requested full U.S. source pool is absent from this fixture.
Haiku fallback reservations range from $0.003178 to $0.003409 per nonempty
split list; these are sequential refusal alternatives, not charged calls.

This is a real request-construction measurement on saved-summary proxies,
not actual editorial charges, raw article shortlists, or combined publication
admission. Repairs, triage, social editing and additional domestic candidates
remain unmeasured here. A split retains separate topic briefs and story
budgets; combining them into one current editor request would impose one shared
five-story budget and cannot establish comparable depth for both topics.
The fifth-topic activation gate remains open; caps and production are unchanged.

## Story repair admission — iteration 1845

`pnpm exec tsx scripts/evaluate-editor-repair-budget.ts` invokes the production
editor and budget wrapper with an in-memory ledger and synthetic `{}` responses.
There is no network client or database. Each response fails schema validation;
assertions cover initial Sonnet, separately reserved Sonnet repair, initial
Haiku and separately reserved Haiku repair. A second scenario refuses both
repairs: only the two initial requests reach the synthetic provider, and the
editor returns unavailable. Invalid output never reaches the cache.

| Saved input | Unsplit sequential envelope | Split sequential envelope | Difference |
| ----------- | --------------------------: | ------------------------: | ---------: |
| Nov 4       |                   $0.134850 |                 $0.134829 | −$0.000021 |
| Nov 5       |                   $0.137029 |                 $0.268634 |  $0.131605 |
| Nov 6       |                   $0.142772 |                 $0.142772 |         $0 |
| Nov 7       |                   $0.143896 |                 $0.275501 |  $0.131605 |
| Nov 8       |                   $0.140798 |                 $0.272404 |  $0.131606 |
| Nov 9       |                   $0.141428 |                 $0.141428 |         $0 |
| Nov 10      |                   $0.142836 |                 $0.274441 |  $0.131605 |

The envelope sums all four sequential reservations. It is neither a charged
cost nor simultaneous held capacity: each admitted request settles before the
next reservation. Synthetic usage is zero and is never entered in production.
Repair requests are larger than initial requests because of schema feedback.
The probe uses shortened topic metadata and saved-summary proxies; it isolates
repair mechanics rather than reproducing the previous probe's exact requests.
It does not bound every factual-support repair hint or new raw candidate pool.
No repair may bypass admission, and exhaustion still returns unavailable.
Raw triage/social work and whole-edition admission remain open; no activation,
model, cap or production behavior changes are justified by this envelope.

## Raw article triage — iteration 1846

`pnpm exec tsx scripts/evaluate-raw-triage-budget.ts --read-only` loads each
saved edition's window through the production article repository and eligibility
filter, then invokes `CandidateTriage` through `BudgetedLlm`. An empty in-memory
cache and refusing ledger capture initial Haiku reservations; the prohibited
provider receives zero calls. Assertions cover model/purpose, batch size,
complete candidate accounting, and unavailable scores. The database transaction
is read-only. No production cache is read or written.

Both proposed scopes receive the same eligible World pool: this measures a
shared-source cold-cache scenario without inventing semantic assignments.

| Window | Raw / eligible | Batches per scope | Current World | Proposed World + U.S. |  Marginal |
| ------ | -------------: | ----------------: | ------------: | --------------------: | --------: |
| Nov 4  |      200 / 200 |                 4 |     $0.031647 |             $0.063247 | $0.031600 |
| Nov 5  |      200 / 200 |                 4 |     $0.032744 |             $0.065446 | $0.032702 |
| Nov 6  |      200 / 200 |                 4 |     $0.032738 |             $0.065435 | $0.032697 |
| Nov 7  |      183 / 181 |                 4 |     $0.027897 |             $0.055753 | $0.027856 |
| Nov 8  |      149 / 149 |                 3 |     $0.022962 |             $0.045892 | $0.022930 |
| Nov 9  |      185 / 185 |                 4 |     $0.028955 |             $0.057865 | $0.028910 |
| Nov 10 |      200 / 200 |                 4 |     $0.031162 |             $0.062278 | $0.031116 |

These are sums of sequential initial reservation estimates, not charges or
simultaneous holds. Four windows reach the repository's 200-candidate limit;
this is not the entire source corpus. Current stored text, source connections
and eligibility settings do not reconstruct historical requests. Proposed scope
metadata is provisional; production fingerprints include topic identity and
scope, so existing broad-World cache hits cannot be assumed for either scope.
New domestic feeds, incremental cache warming, triage repairs, social requests
and whole-edition admission remain unmeasured. Do not add these cold-cache
reservations to saved charges as if both were actual costs. Activation remains
gated; caps, topic data and production behavior are unchanged.

## Saved social request sizes — iteration 1847

`pnpm exec tsx scripts/evaluate-social-split-budget.ts --read-only` exercises
production social CandidateTriage and SocialPostEditor through BudgetedLlm.
The read-only transaction loads selected World posts from Nov 4–10. Empty
in-memory cache and a refusing ledger capture initial Haiku triage, Sonnet
editor and Haiku refusal fallback reservations; the prohibited provider gets
zero calls. Assertions cover nonempty overall evidence, topic presence, model
order, purposes, unavailable results and attempt counts.

| Window     | Saved posts | Current World | Proposed World + U.S. |  Marginal |
| ---------- | ----------: | ------------: | --------------------: | --------: |
| 2026-11-04 |           0 |     $0.000000 |             $0.000000 | $0.000000 |
| 2026-11-05 |           1 |     $0.064188 |             $0.127708 | $0.063520 |
| 2026-11-06 |           2 |     $0.130140 |             $0.258943 | $0.128803 |
| 2026-11-07 |           4 |     $0.133548 |             $0.265759 | $0.132211 |
| 2026-11-08 |           5 |     $0.135022 |             $0.268705 | $0.133683 |
| 2026-11-09 |           2 |     $0.064672 |             $0.128676 | $0.064004 |
| 2026-11-10 |           4 |     $0.132457 |             $0.263576 | $0.131119 |

Each scope receives the same selected posts; this is a request-size proxy,
not semantic routing or an estimate of future candidate volume. Editor scores
are synthetic eights to isolate request construction. Engagement evidence is
omitted; Bluesky editor context includes the saved non-Bluesky picks. Current
World settings are used, not reconstructed historical settings. Nov 4 has no
saved posts and contributes no requests. Platforms are probed separately;
production combines X/Reddit (these saved windows contain no Reddit picks).

These sums include mutually exclusive refusal fallback attempts, not charges
or simultaneous holds. Successful triage would be required before production
editing; refusal here is deliberately bypassed only for the size probe. Full
social pools, repairs, new domestic candidates and whole-edition admission
remain open. Do not add this proxy to saved charges. Activation stays gated;
no cap, model, topic or runtime behavior changes.

## Stored social candidate pools — iteration 1848

`pnpm exec tsx scripts/evaluate-social-pool-budget.ts --read-only` loads each
saved window through production X semantic-candidate selection, Reddit ranking
and Bluesky observation/shortlist readers. Production X/Reddit editing and
Bluesky shortlisting invoke CandidateTriage through BudgetedLlm with an empty
cache and refusing in-memory ledger. Zero provider calls or database writes;
editor invocation throws, proving refusal cannot proceed to editing. Assertions
check complete unscored accounting, model/purpose, equal pool sizes across
scopes and Bluesky's 50-candidate ceiling. Baseline guidance now matches social
publication exactly, rather than the article guidance used by the prior probe.

| Window |   X | Reddit | Bluesky read / eligible | Current World | Proposed World + U.S. |  Marginal |
| ------ | --: | -----: | ----------------------: | ------------: | --------------------: | --------: |
| Nov 4  |  30 |      0 |                682 / 50 |     $0.011326 |             $0.022632 | $0.011306 |
| Nov 5  |  19 |      0 |                543 / 37 |     $0.008478 |             $0.016936 | $0.008458 |
| Nov 6  |   7 |      0 |                563 / 26 |     $0.005445 |             $0.010871 | $0.005426 |
| Nov 7  |  19 |      0 |                576 / 22 |     $0.006566 |             $0.013112 | $0.006546 |
| Nov 8  |  11 |      0 |                581 / 18 |     $0.004747 |             $0.009476 | $0.004729 |
| Nov 9  |  21 |      0 |                548 / 23 |     $0.006830 |             $0.013640 | $0.006810 |
| Nov 10 |  14 |      0 |                744 / 28 |     $0.006549 |             $0.013079 | $0.006530 |

Every scope makes two initial triage reservation attempts, one X/Reddit and
one Bluesky. These are sequential cold-cache reservation estimates, not charges.
Bluesky is probed with an available slot regardless of saved picks, so the
measurement includes its eligible pool even when publication might skip it.
The same current stored World pool and exclusion policy serve both provisional
scopes; this does not establish semantic ownership, historical requests, future
U.S. source/search volume or repair/editor costs. Existing reader/ranking caps
still apply; “pool” means production-admitted candidates, not every observation.
Whole-edition admission remains open. No cap, topic or runtime changes.

## Whole-edition allowance gate — iteration 1849

The read-only fifth-topic script now applies production `readUsage`,
`budgetAllowance` and `scheduledReserveAllowance` to the equal-share proxy,
with the proposed daily maximum fixed at the approved $0.65 ceiling.
No configuration, ledger, topic or provider is changed.

At Nov 11 20:08 UTC, monthly spend is $3.701783 with zero unresolved holds.
The remaining-month rule limits today's cap to **$0.534679**, despite a
$0.65 maximum. After today's $0.395364 usage, $0.139315 remains; Sonnet's
remaining allocation is $0.119065.

| Scenario                                    | Effective daily cap | Available | Full proxy reserve | Shortfall |
| ------------------------------------------- | ------------------: | --------: | -----------------: | --------: |
| Current-day snapshot                        |           $0.534679 | $0.139315 |          $0.791918 | $0.257239 |
| Nov 12, no further spend or hold settlement |           $0.542011 | $0.542011 |          $0.791918 | $0.249907 |

The next-day available amount can cover the $0.527945 cost proxy but cannot
cover its required 1.5× reserve. Production protection clamps its reserve to
the effective daily cap; that clamped number must not be treated as proof
that headroom fits. Assertions check this distinction and scheduled callers'
unchanged ordinary allowance. The next-day calculation is conditional, not a
prediction of tomorrow's ledger or a per-request/model admission proof.

Activation remains gated. Request-size reservations from the other probes
are not added to this realized-cost proxy: doing so would mix conservative
holds with charges and may double-count work. New domestic volume and an
achievable cost reduction still need evidence before publication integration.

## Cost frontier without a fifth-topic proxy — iteration 1856

The read-only evaluator now solves `ceil(cost × headroom) <= effective cap`
in integer microdollars and checks both sides of the boundary. Unlike the
equal-share estimate, this calculation assumes no fifth-topic cost at all.
At the unchanged Nov 11 snapshot, the full-headroom cost ceiling is $0.356452;
the conditional Nov 12 ceiling is **$0.361340** ($0.542011 / 1.5, rounded down).

| Saved baseline |      Cost | Net addition allowed on conditional Nov 12 | Reduction still needed if all grouping were free |
| -------------- | --------: | -----------------------------------------: | -----------------------------------------------: |
| Nov 4          | $0.291162 |                                  $0.070178 |                                        $0.000000 |
| Nov 5          | $0.315445 |                                  $0.045895 |                                        $0.000000 |
| Nov 6          | $0.286904 |                                  $0.074436 |                                        $0.000000 |
| Nov 7          | $0.380173 |                                 -$0.018833 |                                        $0.012239 |
| Nov 8          | $0.320864 |                                  $0.040476 |                                        $0.000000 |
| Nov 9          | $0.388257 |                                 -$0.026917 |                                        $0.019858 |
| Nov 10         | $0.422356 |                                 -$0.061016 |                                        $0.053445 |

Three saved baselines exceed the conditional ceiling before any fifth-topic
addition. Matching the peak requires **$0.061016 of net savings**, plus the
entire incremental U.S. workload; even removing every topic's grouping leaves
$0.053445 to save. These figures concern preserving historical cost headroom,
not a claim that the existing scheduler refused these editions. The frontier
uses the effective daily cap, not today's smaller remaining balance, so it is
already optimistic about other daily spending. It does not prove future costs.

Activation cannot be justified by a cheaper ownership request or by calling
U.S. editing free. Next identify attributable World-only savings of at least
this size, without changing the other three topics or editorial quality; if
none exist, record the policy conflict for the owner rather than raising caps
or weakening reserve protection. Semantic routing evaluation remains separate.
No provider calls, database writes, source/cap/flag or runtime changes.

## Reconciled World cost attribution — iteration 1857

Worker `budget.settlement` journal entries contain topic IDs. The evaluator
matches the saved edition run ID, then requires exact cost and successful-call
count agreement for every purpose against `readEditionCost`. Concurrent manual
runs are excluded. Nov 4–5 fail reconciliation: their attribution is null and
receives no savings credit. No timestamp-based ledger joins or provider calls.

| Edition | Reconciled World cost | Maximum combined World/U.S. cost at conditional Nov 12 ceiling |
| ------- | --------------------: | -------------------------------------------------------------: |
| Nov 6   |             $0.059157 |                                                      $0.133593 |
| Nov 7   |             $0.102337 |                                                      $0.083504 |
| Nov 8   |             $0.095249 |                                                      $0.135725 |
| Nov 9   |             $0.092178 |                                                      $0.065261 |
| Nov 10  |             $0.106435 |                                                      $0.045419 |

These combined ceilings hold the other three topics' saved costs fixed and use
$0.361340 whole-edition cost headroom. They are necessary conditions, not
achievable savings or request-admission guarantees. Journal retention is needed
to reproduce attribution; absent or mismatched evidence receives null results.

Nov 10 World costs: article triage $0.013626, grouping $0.002093, social triage
$0.003468, story editing $0.052166, X/social editing $0.020702, Bluesky editing
$0.014380. All $0.106435 is attributed; no unknown-topic cost remains.
Eliminating World triage and grouping entirely saves only **$0.019187**,
leaving **$0.041829** to save before any U.S. addition. Even eliminating all
World story editing alone leaves $0.008850 to save. Neither elimination is a
permitted quality-preserving implementation; these are optimistic bounds.

Next measure a concrete paired editorial design against the $0.045419 combined
ceiling, preserving reporting quality, social coverage and the other topics.
Grouping/triage savings alone cannot close the peak gate. Semantic routing
still needs separate evaluation; split, caps, sources and runtime stay unchanged.

## Paired editor reservation decomposition — iteration 1858

The prepared paired design calls the existing story editor once for each
nonempty owned scope. The offline request probe now separates input and output
reservation and captures the refused Haiku alternative. No provider is built;
the ledger refuses every attempt. Manual saved-summary labels size requests,
without establishing semantic routing or raw-shortlist bounds.

| Both-scope saved window | Sonnet input reserve | Sonnet output reserve | Initial Sonnet total | Refused Haiku alternatives |
| ----------------------- | -------------------: | --------------------: | -------------------: | -------------------------: |
| Nov 5                   |            $0.047933 |             $0.080000 |            $0.127933 |                  $0.006397 |
| Nov 7                   |            $0.051338 |             $0.080000 |            $0.131338 |                  $0.006568 |
| Nov 8                   |            $0.049863 |             $0.080000 |            $0.129863 |                  $0.006494 |
| Nov 10                  |            $0.050833 |             $0.080000 |            $0.130833 |                  $0.006543 |

Each call retains the production 4,000-output-token allowance. Two scopes
therefore reserve $0.080000 for Sonnet output alone. The smaller Haiku numbers
are refused fallback alternatives, not an authorized model switch. Attempt
sums are sequential envelopes, never simultaneous holds or actual charges.

The paired wrapper supplies exclusivity and failure handling, but offers no
measured editorial savings: its initial reservations increase by $0.062630
on every both-scope proxy. Comparing these reservation bounds directly with
$0.045419 of historical actual-cost headroom would mix different quantities.
No assertion that the scheduler must refuse follows from that comparison.

Holding Nov 10 World X/social and Bluesky editing costs fixed ($0.035082)
leaves only **$0.010337 actual cost** for both scopes' story editing, article
and social triage, grouping/ownership, and any additional U.S. social editing.
Even free triage/grouping would require World story editing to fall from
$0.052166 to at most $0.010337: an **80.184% reduction**, before U.S. additions.
The prepared paired editor has no evidence supporting that reduction. Keep it
unwired; smaller prompts alone cannot establish quality-preserving savings.
Next evaluate semantic routing offline using available cached responses; do
not activate the split or lower output limits without quality evidence.

Reproduce: `pnpm exec tsx scripts/evaluate-joint-ownership-budget.ts`.
