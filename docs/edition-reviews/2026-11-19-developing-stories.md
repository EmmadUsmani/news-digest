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
  production editor wiring and reader presentation remain unfinished.
- Keep the distinct NBA game reports unlabelled for now: Curry's injury recurring
  in their context does not alone establish the same game or direct follow-up.

## Editor context — iteration 2881

- The editor accepts optional earlier headline/summary comparison context, capped
  at 300/1,400 characters. Both Sonnet and Haiku receive the same instructions
  to lead with a supported change and avoid inventing updates from repetition.
- Historical context is excluded from selectable IDs and factual absence support.
  Offline transport/validation controls pass both routes; these do not establish
  model writing quality. Existing callers supply no context yet.
- No provider calls, production matching, snapshot changes or reader changes.

## Snapshot preparation — iteration 2882

- Selected stories can retain an optional developing link: previous edition/story
  UUIDs, copied headline/summary and an edition count of 2–8. Old snapshots remain
  valid without the field; the existing JSON snapshot needs no table migration.
- An opt-in assembly helper validates all links before returning copied stories;
  unknown selections, duplicates and invalid identifiers/counts reject the assembly.
- The three saved manual-membership controls retain their exact link through JSON
  serialization and the story contract. Later link mutation leaves the copy intact.
- Production generation does not call the helper yet. No stored edition changes,
  semantic provider calls or public reader changes; matching acceptance stays open.

## Database history preparation — iteration 2883

- The repository can read the previous seven published same-profile/topic editions
  directly. Publication, profile, topic and strict cutoff filters precede the SQL
  limit; creation time does not determine order. Test editions are excluded.
- An isolated PostgreSQL test covers more than seven valid editions plus newer,
  equal-time, unpublished, test, other-topic, other-profile and self rows. It
  verifies exact saved prose, ordering, empty history and invalid cutoff rejection.
- Generation does not call this loader yet. Semantic matching acceptance and
  production integration remain open; no live provider or published-edition writes.

## Recorded-membership replay — iteration 2884

- `pnpm exec tsx apps/api/scripts/evaluate-developing-stories.ts inputs.json recorded-groups.json`
  replays saved memberships through the actual application matcher and prints
  every resolved predecessor, including copied earlier prose and edition count.
- Inputs use the replay export's `cases` array. Each recorded result has
  `editionId`, `topicId`, `inputSha256` (from exported `replayFingerprint(case)`)
  and `groups` of occurrence references. Fingerprints bind memberships to exact
  current/history prose, order and publication times; review labels are excluded.
- Missing, stale, invalid, oversized and unreviewed cases cannot pass the control
  gate. Duplicate/orphan results reject. Valid empty groups remain distinct from
  unavailable results, so a failed matcher cannot pass a negative control.
- The three manual saved controls pass; deliberately wrong, missing, stale and
  malformed results fail. These verify the evaluator, not semantic precision.
  The report always marks semantic acceptance unestablished; recorded provenance
  and all unlabelled stories still need review before production activation.
- No provider calls, new semantic outputs, production wiring or edition writes.

## Stored-link integration — iteration 2885

- Disposable PostgreSQL coverage saves contract-validated synthetic snapshots
  with and without a developing link, then retrieves them through the production
  repository. Exact predecessor IDs, copied prose and edition count survive JSONB.
- Mutating caller or assembly memory leaves the saved link unchanged. History
  reads retain the expected edition order; adding a later edition preserves the
  earlier snapshot. Database triggers reject updates and deletes of both linked
  and older unlinked snapshots.
- Inserts are explicit test setup, not generation/publication orchestration.
  Production generation still does not assemble links. No live data, provider
  calls or reader changes; semantic matching and activation remain open.

## Conditional reader presentation — iteration 2886

- Reader allowlist retains validated saved developing links; extra nested fields
  are stripped. Editions without a link render as before. Projection tests verify
  saved destinations, earlier prose, edition count and snapshot immutability.
- Linked cards show “Developing · N editions” and “Earlier coverage” opening
  `/editions/<previousEditionId>#story-<previousStoryId>` in the same tab.
- Browser interception adds one explicitly synthetic link to a real saved edition
  and serves a synthetic earlier destination. No database writes or model calls.
  All six 320/390/1440px light/dark checks pass: keyboard activation, exact route,
  earlier-card scroll position, unchanged current prose/source and legacy absence.
- Screenshots: `docs/screenshots/ui/developing-synthetic-*.png`; narrow light
  layout inspected. These show synthetic presentation, not live semantic matches.
- Production matching/editor/persistence wiring and real-edition acceptance remain
  open; the feature is not complete and no item 70 completion ack is claimed.
