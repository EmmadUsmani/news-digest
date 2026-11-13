# Nov 12 five-topic edition latency — iteration 2140

The scheduled edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07` took
232,339 ms in the worker, versus 162,339 ms on Nov 8 with four topics.
The fifth topic exposes a topic-worker scheduling delay in addition to the
already diagnosed NBA validation repairs. No runtime change or paid replay.

## Reproduce from retained evidence

```sh
pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts apps/api/test/fixtures/edition-timeline-2026-11-12.json
```

The fixture contains 94 allowlisted digest-generation journal events from
Nov 12 15:00–15:04 UTC: start/finish, 22 stages and 70 Anthropic HTTP completions.
Only timestamps, topic/stage, purpose, duration and outcome are retained.
The saved ledger independently reports 70 settled calls/$0.517657, zero holds.
HTTP intervals total 852,391 ms; the edition interval is 232,297 ms.

| Topic     | Initial stage to editing ms | Editing ms | Posts ms | Ready offset ms |
| --------- | --------------------------: | ---------: | -------: | --------------: |
| Tech & AI |                      33,876 |     65,625 |   74,713 |         174,223 |
| NBA       |                      35,916 |    127,047 |   64,813 |         227,785 |
| Gaming    |                      88,548 |     28,174 |   56,774 |         173,505 |
| World     |                     120,267 |     57,552 |   47,402 |         225,230 |
| U.S.      |                     173,524 |     33,204 |   25,530 |         232,267 |

The initial stage includes waiting: all five topics are marked `triage` before
`parallelTopics` starts at most four complete topic pipelines. U.S. enters its
pipeline only when Gaming finishes at 173,505 ms. It reaches editing 19 ms later.
World already passed the shared politics preparation at 120,267 ms, so the
53,257 ms difference is not another U.S. triage provider call. Both scopes reuse
the same `pairedPromise`; U.S. does not repeat that work.

## Cause and bounded next step

Whole-topic concurrency keeps the fifth topic queued while earlier topics do
social selection. Shared politics preparation has finished, but U.S. cannot
start its own editor yet. Raising the Anthropic HTTP limit is not the remedy:
four calls overlap for 170,983 ms, and prior social concurrency work already
established that earlier reservations can refuse later editorial work.

Evaluate a staged topic scheduler offline: let both politics editors become
eligible after shared preparation, while retaining the existing four-call
provider limit, protected story/repair admission, topic order and drain-before-
rollback behavior. Compare reservation order and refusal outcomes against this
five-topic case before enabling anything. The observed 53,257 ms wait is an
opportunity, not a predicted speedup; earlier work would compete for slots and
budget. NBA fixes must first receive their scheduled acceptance.

Only 4,512 ms remains after the penultimate topic is ready; 4,468 ms overlaps
the final U.S. social-editor HTTP call. Removing that tail alone leaves
227,785 ms, so optimizing the final Bluesky tail cannot meet either latency
target. This differs from the longer World-only tail on Nov 8.

The timeline regression verifies five topics, interval conservation, the delayed
U.S. stage and final call. No topic attribution is inferred from overlapping
HTTP timestamps. No budgets, concurrency, flags or published content changed.

## Offline admission experiment — iteration 2141

`apps/api/scripts/experiments/staged-scheduling.ts` is an isolated deterministic
DAG simulator with four active slots, integer-unit reservations, settlement,
protected capacity and refusal propagation. It has no production imports,
provider calls, timers or database writes. Run its scenarios with:

```sh
pnpm exec tsx --test apps/api/test/staged-scheduling.test.ts
```

A synthetic shared-preparation scenario releases World and U.S. editing together,
before World posts finish. A second scenario demonstrates why that cannot simply
replace whole-topic workers: with 11 budget units, NBA holds four and shared
preparation settles one; an earlier U.S. editor reserves six. NBA settles at one
unit but its six-unit repair is now refused (two spent plus six held plus six
requested). Four-call concurrency alone provides no admission guarantee.

Keeping two units protected refuses that earlier U.S. reservation and permits
NBA repair. This deliberately static control is not the rollout design: real
holds need explicit ownership, transfer, expiry and fallback handling. It also
shows a tradeoff, not a free improvement: this scenario loses U.S. AI editing.
Tests cover shared dependency reuse, settlement credit, four-slot bounds,
refused descendants and invalid/cyclic scenarios.

All durations and integer costs here are synthetic; they are not reconstructed
Nov 12 calls or a latency forecast. The saved HTTP trace lacks topic-linked
reservation/settlement order, so it cannot establish an actual counterfactual
budget outcome. The experiment rejects an unprotected stage scheduler as the
next runtime change. Next design a protected admission handoff and drain on
failure against existing budget controls, after NBA scheduled acceptance; keep
the production scheduler unchanged meanwhile.
