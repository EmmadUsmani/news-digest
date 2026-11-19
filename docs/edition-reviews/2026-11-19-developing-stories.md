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

## Editor-to-snapshot orchestration — iteration 2887

- Opt-in application flow matches the current candidate pool once, supplies the
  nearest earlier headline/summary to the editor, then attaches links only to
  the editor's selected current stories. Other editor result fields are retained.
- Saved manual memberships exercise all three controls with the reviewed story
  both retained and dropped. Current edited prose stays unchanged; historical
  stories never become selectable candidates. Inputs remain unchanged.
- Matching failure continues ordinary editing without links; editor refusal stays
  null. Unknown or duplicate selections reject before snapshot assembly.
- Four offline tests pass without provider calls or database writes. These test
  orchestration using manual memberships, not semantic matching or writing quality.
  Production generation does not call this flow yet; activation and real-edition
  acceptance remain open pending semantic review and existing budget admission.

## Actual request feasibility — iteration 2888

- `prepare-developing-story-requests.ts` captures the existing EventGrouping
  adapter's exact request through an in-process recorder, with input fingerprint,
  dates, occurrence IDs, excerpt limits and the configured Haiku prices. It has
  no provider or database adapter and writes a private, exclusive-create artifact.
- All 35 Nov 12–18 topic windows checked: 30 requests ready; five correctly
  unavailable (World Nov 13–14 has no current stories; U.S. Nov 12–14 has no
  historical stories). No window exceeds the 40-occurrence limit.
- Production-style conservative reservation bounds: Nov 12 $0.016621,
  Nov 13 $0.011890, Nov 14 $0.011736, Nov 15 $0.018729,
  Nov 16 $0.019267, Nov 17 $0.019665, Nov 18 $0.020139;
  all 30 together $0.118047. These are bounds, not actual spend or budget
  admission. Maximum input bound 18,868, below the 100,000 input limit.
- Receipt: `/tmp/2888-developing-requests-final.json`; input
  `/tmp/2877-developing-story-inputs.json`. No calls, semantic outputs or edition
  writes. The selected-story replay fits request size; larger production
  candidate pools still need checking. Semantic review and production admission
  remain required; this is not activation or semantic acceptance.

## IPO progression and policy ambiguity — iteration 2889

- Added two manually reviewed saved controls (five total), retaining each full
  current pool and seven-edition history. No provider output is asserted.
- Nov 15 Tech IPO landing (`b509c8e8`) follows Nov 10's proposed Anthropic
  IPO valuation (`0226a49f`, edition `dbbf2d66`): the same company's IPO
  progresses from proposed pricing to its reported arrival. Expected predecessor
  is Nov 10, two editions represented. Other saved Anthropic items concern
  outages, code-worker features or exposed credentials, not the IPO.
- Nov 17 indirect China AI-access restriction (`9035014e`) remains unlinked.
  Nov 16's remote-access rule (`9dec3f4b`) might describe the same policy,
  but the short saved summaries establish neither a shared instrument nor
  an explicit follow-up. Nov 15's Lutnick claim (`1a5c3722`) is a different
  allegation. Shared chip-policy context is insufficient for a safe link.
- The ambiguous policy control deliberately prefers a missed link to an
  unsupported one; it is not a claim that the underlying real policies differ.
  No wording rules, threshold changes, paid replay or production activation.
- All five controls exercise matcher, immutable snapshot, recorded-membership
  evaluator and retained/dropped editor orchestration. These verify manually
  specified decisions, not semantic-model precision. Full semantic output
  review and production candidate/budget admission remain open.

## Candidate identity safety — iteration 2890

- The prepared editor flow now rejects duplicate, empty or whitespace-only
  current candidate IDs before semantic matching or editing. Occurrence IDs in
  matching are unique, but editor context and saved links are keyed by story ID;
  duplicate story IDs could otherwise share an unrelated predecessor.
- Offline tests verify rejection before either adapter is invoked; the five
  saved controls still pass. IDs reused across historical editions remain valid.
- No provider calls, production activation or semantic acceptance. Production
  pool/budget admission and full semantic review remain open.

## Snapshot relationship provenance — iteration 2891

- Snapshot assembly discards any editor-returned `developing` field before
  attaching the current run’s validated match. With no match, no relationship
  survives; a valid match replaces any editor-supplied relationship.
- All five saved controls now return deliberately incorrect relationship
  metadata from the offline editor. Retained matches use validated predecessors;
  unmatched stories remain unlinked. An unavailable-matcher control verifies
  ordinary prose survives and the editor result is not mutated.
- No provider calls, production activation, saved-edition changes or semantic
  acceptance. Full semantic review and production pool/budget admission remain.

## Editor context provenance — iteration 2892

- Candidate input may contain earlier-coverage context from a previous attempt.
  Prepared orchestration now removes it before attaching this run’s validated
  predecessor, preventing unsupported context from influencing rewritten prose.
- All five saved controls inject incorrect inherited context: validated links
  replace it and unmatched candidates receive none. Unavailable and empty
  matching controls preserve other candidate fields and leave inputs unchanged.
- No provider calls, activation or saved-edition changes. Semantic review,
  production pool/budget admission and generation wiring remain open.

## Full-shortlist capacity decision — iteration 2893

- Request preparation now reports historical occurrence count, remaining current
  capacity and 5/10/20/40-current-story scenarios. These are capacity scenarios,
  not reconstructed candidate pools, request-cost estimates or semantic results.
- All 35 Nov 12–18 saved windows fit five current stories. Ten fit only 12/35;
  twenty fit 7/35; forty fit 1/35. Empty history still means no matching request.
- At ten current stories: Tech 0/7, NBA 0/7, Gaming 0/7, World 5/7,
  U.S. 7/7. Historical occurrences respectively span 31–33, 33–34, 35,
  25–35 and 0–20. The U.S. empty-history case is included in capacity only.
- Production ranking normally admits up to ten editor candidates
  (`editorialShortlist` and Tech admission); scored joint shortlists also cap
  at ten. The existing 30-request/$0.118047 saved-selection receipt therefore
  does not establish full-shortlist admission. Do not wire that approach into
  production: mature topics would silently lose developing context.
- Keep all seven editions and the 40-occurrence safety limit. Next design step:
  establish a bounded selected-story matching/editor flow or another existing
  semantic approach before production admission; no extra provider calls,
  higher caps, history truncation or changed matching rules authorized here.
- Receipt `/tmp/2893-capacity.json`; three offline request tests pass, including
  seven five-story editions that fit five current stories and reject ten.

## Selected-story design decision — iteration 2894

- [Decision](../decisions/2026-11-19-developing-selection.md): keep ordinary
  editorial selection, then match selected original evidence and rewrite only
  validated matches through a fixed-selection contract. Preserve the ten-item
  shortlist, seven-edition history, current guards and immutable publication.
- Matching capacity is checked against actual selections; budgets above five
  are not covered by the saved five-story receipt. Enrichment failure retains
  the accepted edition without links. No second selection or history splitting.
- Existing selecting-editor and pre-selection helper contracts cannot directly
  implement this flow. Next: offline exact rewrite request capture and contract
  controls, then combined matching/rewrite whole-edition budget admission.
- No provider calls, implementation activation or saved-edition changes.

## Fixed-selection rewrite contract — iteration 2895

- Prepared `rewriteDevelopingStories` accepts the existing selection, original
  evidence and validated matches; only matched selections reach its adapter.
- The response must contain exactly the matched IDs in selection order and only
  title, summary and why-it-matters prose. Rationale, source URLs and unmatched
  stories stay intact. Relationships come only from validated snapshot links.
- Current-evidence validation is mandatory and receives no historical context.
  Input clones isolate adapter mutation. Refusal, malformed output, failed guards
  or invalid relationships retain the exact original selection atomically.
- Three offline contract tests cover success, missing/extra/reordered/changed IDs,
  rationale/evidence injection, refusal, partial validation failure, guard errors,
  input mutation and preflight rejection without calls. Synthetic prose tests
  transport only, not semantic quality or integration with factual guards.
- No provider implementation, generation activation or paid calls. Next: exact
  request capture with original cluster evidence, factual-guard integration,
  semantic review and combined whole-edition budget admission.

## Iteration 2896 — prepared rewrite request

- Added a pure request builder for the fixed-selection rewrite contract, with configured model, run/topic attribution, distinct `developing-rewrite` purpose and 800 output tokens per matched story (maximum 8,000). No dispatch or retry path.
- Explicitly projects selected prose, original current cluster evidence and validated earlier headline/summary. Inherited evidence history and snapshot link IDs are excluded; original evidence is retained without truncation.
- Instructions require exact ordered IDs, current-evidence factual support and atomic refusal when an update cannot be supported. Tests cover evidence isolation, model mutation, ten-story order/output bounds and invalid selection preflight. These are synthetic transport controls, not semantic acceptance.
- Saved exact request capture/reservation receipts, existing factual guards, semantic review and combined edition-budget admission remain required before activation. No provider calls or production wiring.

## Iteration 2897 — current-evidence rewrite guard

- Prepared validator applies the selection editor’s existing absence-support guard and 240/1,400/400-character headline/summary/significance limits to rewritten prose. It uses only bounded current representative/cluster title and excerpt evidence, retaining the NBA summary exception.
- Offline integration with the atomic rewrite contract rejects a historical-only absence claim, preserves the exact accepted selection on failure, and accepts the same attributed claim when current evidence supports it. Controls cover attribution removal in all prose fields, supplemental cluster support, evidence truncation, mismatched IDs and length limits.
- This is the existing lexical guard, not general factual entailment or semantic acceptance. No provider calls or production activation. Exact saved request/cost capture, semantic review and combined whole-edition admission remain open.

## Iteration 2898 — rewrite input admission safety

- Request preparation now applies BudgetedLlm's UTF-8 instruction/prompt byte bound plus 2,048 framing allowance, rejecting bounds at or above 100,000. The prior output cap alone did not bound original cluster evidence or historical comparison text.
- Exact boundary controls accept 99,999 and reject 100,000; Unicode, oversized supplemental evidence and historical comparison are covered. Accepted evidence is retained exactly, without truncation or partial requests.
- Integration with the fixed-selection contract confirms preparation refusal occurs before dispatch and preserves the exact accepted selection, including unmatched stories, without links or validation calls.
- No provider calls or activation. Saved exact request/cost capture remains open: the matching-only replay inputs contain published prose, not the original complete editorial evidence required for exact rewrite reconstruction. Do not substitute published summaries as source evidence. Semantic review and whole-edition budget admission remain required.
