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
