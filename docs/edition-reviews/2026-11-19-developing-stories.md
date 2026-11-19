# Developing-story saved evidence — iteration 2880

Three reviewed current stories from the Nov 12–18 published editions establish
offline acceptance controls for item 70. These are agent judgements from saved
headlines and summaries, not independent labels or semantic-model outputs.
No provider was called, and no published snapshot changed.

## Reviewed links

| Current story                                                             | Earlier coverage                                                                                                          | Decision and evidence                                                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nov 16 Tech: Huang considering a return as Nvidia CEO (`ab16db28`)        | Nov 15 newsletter on the leadership crisis (`ef668c6e`); Nov 14 resignation (`3c54c5f4`)                                  | Link to Nov 15, three editions represented. The current summary explicitly describes a possible reinstatement following the resignation and the same leadership crisis.                          |
| Nov 18 NBA: LeBron passes Kidd for third in career assists (`73ac0388`)   | Nov 16 same milestone (`10ba338a`)                                                                                        | Link to Nov 16, two editions represented. Both name the same unique career milestone. The Nov 18 saved summary is absent: matching does not establish a new fact or justify inventing an update. |
| Nov 18 Tech: Nvidia stops licensed Hopper shipments to China (`eeecaefc`) | Earlier Nvidia leadership coverage; Nov 16 US remote-access rule (`9dec3f4b`); Nov 17 indirect-access policy (`9035014e`) | Keep separate. The supplied summaries do not establish that the shipment decision is a direct consequence of those specific developments. Shared company and policy context is insufficient.     |

IDs above are the unique eight-character prefixes of the full story IDs in the
committed fixture. Full earlier edition IDs and saved prose are retained there.
The Nov 12 generic CEO-transition headline lacks enough detail to establish its
relationship to the later resignation; it is not labelled a match.

## Replay and remaining acceptance

- Fixture: `apps/api/test/fixtures/developing-stories-saved-2026-11-12-18.json`.
  It preserves each selected case's full current pool and seven-edition history.
  Only `reviewedStoryId` is labelled; other current stories remain unreviewed.
- `pnpm exec tsx --test apps/api/test/developing-saved-evidence.test.ts` replays
  the manual memberships through the application matcher. Three cases pass;
  newest predecessor, exact saved context and edition counts survive reordered
  memberships. The negative control produces no link.
- These full saved pools contain 36, 37 and 39 occurrences, within the existing
  40-item cap. The original 35 exported topic cases range from 5 to 40; none
  requires truncation. This is input-size evidence only, not spend admission.
- Semantic matcher output over the full Nov 12–18 set still needs review.
  Injecting manual memberships verifies link transport, not match precision.
  No paid replay was used. Production wiring, immutable link persistence,
  earlier-summary editor context and reader presentation remain unfinished.
- Keep the distinct NBA game reports unlabelled for now: Curry's injury recurring
  in their context does not alone establish the same game or direct follow-up.
