# World/U.S. offline scope assessment — iteration 1839

Reviewed all 28 saved World story titles and summaries from the published
Nov 4–10 scheduled editions. No inference, generation or paid request.

| Edition | World | U.S. | Assigned to both |
| ------- | ----: | ---: | ---------------: |
| Nov 4   |     0 |    1 |                0 |
| Nov 5   |     1 |    1 |                0 |
| Nov 6   |     5 |    0 |                0 |
| Nov 7   |     4 |    1 |                0 |
| Nov 8   |     4 |    1 |                0 |
| Nov 9   |     5 |    0 |                0 |
| Nov 10  |     4 |    1 |                0 |

The U.S. assignments are the Nov 4 congressional result, Nov 5 acceptance of
the result, Nov 7 White House chief-of-staff change, Nov 8 congressional
agenda and Nov 10 Hegseth impeachment dispute. The last concerns congressional
accountability, despite involving the defense secretary. The Nov 5 election
reaction stays domestic despite mentioning the Iran war as an electoral factor.

US strikes in Iran, the Gulf of Oman ship attack, Iran diplomacy, the oil-price
response to the US war announcement and US-mediated Ukraine talks all stay
World. An American actor or a White House venue does not make a story domestic.
These are editorial judgments of the supplied summaries, not keyword rules.

## Proposed topic data

- Preserve World ID `00000000-0000-4000-8000-000000000014` and its reader choices.
  Description/include guidance: global news and international affairs, including
  US foreign policy, war, diplomacy and international trade. Exclude guidance:
  principally domestic US politics, policy, elections and events.
- Add U.S. immediately after World, enabled with five story/five post slots,
  visible by default under existing hidden-topic semantics. Description/include
  guidance: US domestic government, Congress, courts, elections, federal/state
  policy and major domestic events. Exclude guidance: principally international
  affairs, including US foreign policy. Keep relevance word lists empty.
- Move Guardian US to U.S.; retain BBC World, NPR World, Guardian World and
  Al Jazeera with World. Add NPR Politics and PBS Politics to U.S. Source scope
  guides collection; AI still decides story scope because feeds overlap.
- Proposed U.S. X accounts: AP, Reuters, NPR, PBS, AP_Politics, JakeSherman,
  PunchbowlNews, congressional reporter AndrewDesiderio and court reporter
  SCOTUSblog. Verify handles through the existing official verification path
  before activation. Give U.S. its own settings and domestic query; retain
  World settings. Bluesky uses its existing topic-data configuration path.

## Result and next implementation gate

The saved selection alone cannot supply two full topics: U.S. has zero or one
story each day. New domestic sources and evaluation of the larger candidate
pool are needed; do not fill slots by reusing international stories.

Labels, original saved summaries, story IDs and edition IDs are recorded in
`apps/api/test/fixtures/world-us-scope-2026-11-04-10.json`. Run
`pnpm exec tsx scripts/evaluate-world-us-scope.ts` to check complete dates,
exclusive per-edition membership and counts. This validates the manual labels;
it does not exercise production AI routing or cross-topic event deduplication.
No runtime classifier or routing word list was added.

Next: implement topic data and joint World/U.S. AI curation with one owner per
event (including different report IDs about one event); estimate fifth-topic
reserve from saved ledger costs before changing caps. Other topics must retain
their current behavior. No cap or production topic change in this step.

## Prepared joint ownership — iteration 1841

`EventGrouping.assignTopics` accepts two data-defined scopes and up to 40
combined candidates. One budgeted Haiku grouping request returns event groups
and one owner per group, including singleton events. It supplies both topics'
descriptions and guidance; source association does not decide ownership.
The existing per-topic grouping path and its prompt remain unchanged.

Validation requires every candidate ID exactly once and only supplied topic
IDs. Missing, repeated or invented IDs, unknown owners, malformed output and
budget refusal return unavailable, never an empty successful ownership result.
There is no repair request. Cache identity includes both scopes and candidates.
Eight provider-free tests cover the partition contract, cross-topic assignment,
cache reuse/invalidation, invalid output/input and budget refusal. Responses
are test doubles; they do not establish semantic assignment quality.

This method has no production caller. Before activation, cost and admit the
joint request as a replacement for the two grouping requests, connect its
ownership result to selection/publication, and define the unavailable path so
it cannot publish competing World/U.S. ownership. Topic/source setup and
scheduled semantic acceptance remain open; caps and runtime topics are unchanged.

## Domestic feed volume — iteration 1850

Recorded one free public-feed snapshot at 20:18 UTC using SharedHttpClient and
production parseFeed. All three feeds returned HTTP 200; no production writes,
provider calls, source activation or cap changes. The recording is
`apps/api/test/fixtures/us-feed-volume-2026-11-11.json`; replay with
`pnpm exec tsx scripts/evaluate-us-feed-volume.ts` (offline).

| Proposed feed | Retained reports | Dated Nov 10 15:00–Nov 11 15:00 UTC | Excerpts ≥200 characters in window |
| ------------- | ---------------: | ----------------------------------: | ---------------------------------: |
| Guardian US   |               33 |                                  13 |                                 12 |
| NPR Politics  |               10 |                                   8 |                                  0 |
| PBS Politics  |               20 |                                  13 |                                  6 |

The 34 window reports have distinct canonical URLs. Manual headline review
identifies at least five different domestic events: Hegseth impeachment vote,
House Republican leadership election, Kennedy family arch lawsuit, abortion
and trans ballot measures, and California wealth-tax vote. The first two each
have three reports across the publishers, demonstrating why URL uniqueness
cannot replace joint event ownership. The snapshot records the nine report
URLs used for those five examples, not a full event partition.

International UK/Iran coverage, sports and commentary also appear in these
feeds. Feed membership cannot assign U.S. ownership. NPR's short excerpts
limit supplied evidence; length alone does not measure reporting quality.
This after-cutoff snapshot cannot reconstruct feed availability at generation
or Nov 4–10 domestic volume. It supports the proposed NPR/PBS additions but
is not evidence of five AI-selected publication-ready stories or semantic
routing correctness. Whole-edition cost reduction and publication integration
remain required before activation.

## Ownership to ranked shortlists — iteration 1851

Prepared `jointStoryShortlists` connects the joint ownership port to existing
ranking without a production caller. It sends at most 40 already-shortlisted
articles across exactly two scopes in one request, validates complete exclusive
ID membership, then ranks each owner's events. Cross-source reports move with
their event; publisher metadata and coverage links survive, with no grouping
score bonus. No title rules select the destination.

Unavailable, malformed, incomplete or duplicate membership returns null for the
whole split; callers must abort rather than independently publish both pools.
Conflicting duplicate input IDs refuse before inference; identical shared
reports are now consolidated as described below. Coordinating triage/editor
inputs remains orchestration work. An empty
scope is valid and is never padded. Ranking retains its existing window,
quality filters and ten-event editor shortlist limit.

Recorded port decisions and a real EventGrouping parser with a recorded response
exercise movement, provenance, score preservation, empty scopes and refusal.
These verify mechanics, not semantic ownership accuracy. No paid calls, runtime
flags, source activation or budget changes. Whole-edition headroom remains the
activation gate; this bridge alone does not establish it.

## Shared article admission — iteration 1852

The prepared bridge now consolidates repeated article IDs across the two input
pools before applying the 40-report ownership limit. Matching snapshots retain
one report and the union of source labels, without changing the supplied pools.
The first scope is only an input hint; AI can assign the report to either scope.
Different article IDs remain separate reports for AI event grouping, even if
URLs or titles match. Source labels still add no ranking bonus.

Conflicting title, URL, excerpt, timestamp, engagement, publisher or image data
for the same ID refuses the whole split before inference. This avoids choosing
an arbitrary evidence snapshot. Offline tests exercise shared-report movement,
source preservation, the unique-report bound and conflicting snapshots.
No production caller, paid requests, source activation or budget changes.
Joint triage/editor orchestration and whole-edition headroom remain required.

## Paired editor handoff — iteration 1853

Prepared jointStoryEdits passes exclusive ownership-ranked shortlists to the
existing editor interface, sequentially, with each topic's scope and story budget.
It returns both edited results together or null; a first refusal stops the
second edit. Throws, duplicate selected IDs, foreign selected/evidence IDs and
budget overflow refuse the pair. Original ranked coverage accompanies each edit.
Nothing is persisted and no independent topic fallback is returned.

Recorded-port tests exercise moved report coverage, both-topic success, first
and second refusal, exceptions and invalid editor membership/budgets. This has
no production caller or paid requests. Complete triage orchestration and measured
whole-edition budget headroom remain required before activation.
