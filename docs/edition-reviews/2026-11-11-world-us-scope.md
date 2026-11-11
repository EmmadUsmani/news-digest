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
