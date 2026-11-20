# Developing stories after editorial selection

Decision recorded in iteration 2894; proposed orchestration, not deployed behavior.

## Decision

Keep the existing editor as the sole selector. Match its selected stories against
all seven previous published editions, then rewrite only matched selections with
validated earlier context. Do not reduce the ten-candidate editorial shortlist to
five to make history fit. Do not change ranking, ownership or matching rules.

The existing `editDevelopingStories` helper matches before selection; leave it
inactive. It is not the production entry point for this design.

## Why this order

| Option                                                   | Result                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Match the ten-candidate shortlist                        | Rejected: only 12/35 saved windows fit the 40-occurrence limit.                              |
| Reduce the editor shortlist to five                      | Rejected: removes editorial alternatives before selection.                                   |
| Split historical editions                                | Rejected: loses the single validated partition and complicates predecessor ambiguity checks. |
| Split current candidates into multiple matching requests | Deferred: adds matching calls and separates competing current occurrences.                   |
| Select, match, rewrite matched selections                | Chosen for admission work: preserves selection and bounds matching by published story count. |

The Nov 12–18 receipt covers five selected stories per topic and up to 35
historical occurrences. All 35 windows fit; 30 have both current and historical
stories. Configurable budgets allow ten selections: this design does not claim
those windows fit. Check actual selected plus historical occurrence count before
making any enrichment calls. Over 40 means ordinary editorial output, no links,
and an explicit capacity outcome for operations. Never silently truncate history.

## Required flow

1. Run existing triage, ownership, admission and editorial selection unchanged.
   Keep the accepted result and original evidence as the fallback. Skip enrichment
   for non-AI output, zero selections or missing history.
2. Read the prior seven published same-profile/topic editions at the generation
   cutoff through the prepared history repository. Exclude the current edition.
3. Match the selected IDs, using their original current evidence rather than
   rewritten headlines as the current matching input. Keep the full history and
   existing grouping validation. Unavailable or invalid matching publishes the
   original accepted result without developing relationships.
4. With no validated links, stop. Otherwise send only matched selected stories
   and their original cluster evidence to a dedicated rewrite operation, with
   earlier headline/summary supplied as comparison context only.
5. The rewrite operation must preserve the exact matched ID set and order. It
   cannot add, drop, rank or replace stories, alter rationale, or introduce new
   evidence IDs. Validate current factual support with the existing editorial
   guards; historical context cannot support current claims or factual absence.
6. On refusal, invalid output or exhausted budget, retain the original accepted
   edition without developing enrichment. Do not attach a label to prose that
   missed the required update rewrite. Treat enrichment as one atomic result.
7. On success, replace only matched headline/summary/why-it-matters fields;
   preserve all other selected stories and source links. Rebuild the brief from
   final selected headlines, as generation already does. Attach only validated
   links with snapshot assembly, then persist once through normal publication.

Do not reuse the existing selecting editor unchanged for step 4: its contract
permits fewer stories and supplies selection reasons. A successful subset is not
a successful rewrite. Do not start another selection or repair loop after an
enrichment failure. Social selection must consume final accepted story context.

## Admission before wiring

- Capture exact rewrite requests offline from the saved manually reviewed
  controls, including original cluster evidence. Record model, maximum output,
  reservation bound, fingerprint and any repair/fallback paths.
- Add those rewrite reservations to the matching receipt ($0.118047 across the
  saved week, largest day $0.020139), not to a new budget. These matching-only
  bounds do not admit this design or establish daily headroom.
- Reserve through the existing ledger and measure against the scheduled edition,
  including social calls and other existing work, within unchanged caps. No
  routine paid replay. If the feature cannot fit, record the blocker and follow
  the owner instruction to move on; do not increase caps.
- Replay fixed-selection, changed-ID, missing-ID, reordered-ID, unsupported-fact,
  matcher refusal, rewrite refusal and over-capacity cases without providers.
  Preserve original evidence and accepted output objects on every failure.
- Review actual semantic matches and rewritten prose before activation. Manual
  memberships establish transport only. Then require one real published edition
  and reader screenshots before starting the next reader feature.

## Remaining-work boundary (iteration 3016)

Enrichment cannot move after social editing merely to claim zero remaining work:
`preview.repository.ts` builds `socialStoryContext(stories)` before both social
routes, and those routes must compare posts with the final accepted story text.
The current generator also completes each topic inside its topic loop, so a
per-topic insertion must protect later topics' triage, grouping and story editing
as well as social work. An eventual edition-wide insertion needs a phase boundary
before social selection, after all topic story selections have finished.

`protectedSocialObligations` now uses the real `SocialPostEditor` request builder
to bound one supplied platform/topic/context: Sonnet initial + possible repair,
then Haiku initial + possible repair. Repair size includes the longest fixed
application validation feedback, including schema combinations and field hints;
the production repair formatter is shared to prevent suffix drift. Quiet/empty
inputs follow the real editor's no-call path.

These are conservative **offline size bounds**, not executable captures or exact
ledger-hold identities: the longest feedback may differ from the actual failure.
They can populate the request-derived budget checker, but must not populate an
exact reserved execution scope. The caller still must enumerate both platform
routes, all topics and any social triage, and bound changing already-selected
posts/final story context. No whole-morning fit or feature activation is claimed.
