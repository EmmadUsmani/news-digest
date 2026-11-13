# Tech summary depth — iteration 2125

The Nov 12 NVIDIA summary loses reporting already recognized upstream. Repair
cluster evidence transport before considering new destination collection or a
more verbose editor prompt. No runtime or saved-publication change in this step.

## Reader comparison

Edition `b1be5a12-2972-4eeb-9bff-82cbb10c1b07`, Nov 12 15:00 UTC.
Read all five published Tech summaries against their immutable saved evidence.

| Story                      | Saved editor evidence                            | Reader result                                                                        |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| NVIDIA CEO transition      | Empty excerpt, generic announcement headline     | Only says a transition was announced; no person or concrete development.             |
| Gemini smartglasses        | Price/privacy headline and collaboration excerpt | Retains $395 starting price, privacy angle and all four collaborators.               |
| Google TPU systems         | Headline repeated as excerpt                     | Retains specialized systems, agents and security; no implementation detail supplied. |
| United booking restriction | Headline repeated as excerpt                     | Retains the restriction; no mechanism or policy terms supplied.                      |
| Linux kernel bugs          | Headline repeated as excerpt                     | Retains decades-undetected bugs; no counts, bug details or method supplied.          |

The four non-NVIDIA summaries do not establish useful omitted supplied facts.
The smartglasses summary demonstrates that the current editor can retain a
short substantive excerpt. Longer requested output cannot supply missing facts.

## NVIDIA: where detail is lost

- The saved story has 23 coverage links but just one evidence ID:
  `3020ff24-fcbc-489b-8fd1-3e10be2bec00`, the empty-excerpt HN announcement.
- The same saved edition's triage scored The Verge member
  `cde99a3e-4762-42d4-90d4-7e7dd4829c7b` relevance 8 / importance 9:
  “Board confirms resignation amid spy and affair scandals.” Its saved coverage
  title also names Jensen Huang and his resignation.
- Today's stored Verge RSS excerpt contains the board announcement, Huang's
  name and roles, and attributed allegations. Current content rows can change;
  this is not a byte-for-byte reconstruction of the historical input. The
  immutable saved triage independently establishes the concrete development
  was recognized before editing.
- `rank.ts` retains the score-leading representative's title/excerpt and emits
  other members only as coverage metadata. `preview.repository.ts` passes those
  ranked representatives to the editor. `ShortlistEditor` serializes only each
  representative's title and first 600 excerpt characters. It cannot cite a
  discarded member ID; publication evidence is then built from representatives.

This is a transport gap between grouping and editing, separate from discovery
links that have no reporting anywhere in their cluster.

## Next implementation

Pass bounded, separately attributed evidence from explicit cluster members to
the editor and its validator, and retain the cited members in saved evidence.
Preserve representative identity/score, story count, distinct event selection,
source links, topic ownership and fallback. Do not concatenate a different
publisher's reporting into the representative's excerpt or turn coverage labels
into independent corroboration. Bound the payload within the existing editorial
admission and token limits; keep existing paid-call counts and caps.

Offline verification should cover a high-score empty-excerpt representative
with a lower-score substantive member, unrelated clusters, source attribution,
unsupported-claim refusal, output evidence IDs and saved reader projection.
Use this saved case alongside fixtures; do not pay to replay it. Deploy only
within STEERING 59's edition-protection window.

## Verification

A temporary `pnpm exec tsx scripts/tmp-tech-depth.ts` probe used a repeatable-read,
read-only transaction with a 15-second statement timeout. Assertions passed for
the edition ID, 23 coverage members, empty representative excerpt, single saved
evidence ID, Verge triage scores/rationale and current substantive excerpt.
All five public-reader summaries matched the saved snapshot. Probe removed;
no jobs, provider calls, collection or database writes.

## Projection preparation — iteration 2126

`clusterEvidence` now projects the representative plus at most two substantive
explicit coverage members in rank order. Each retains its own ID, publisher,
URL, source labels and publication time; titles are capped at 300 characters
and excerpts at 600. Missing and duplicate members cannot consume the bound.
The helper does not change ranking, editing, saved evidence or publication yet.
Production transport and shared editor/validator/persistence verification remain
open; the final prompt must still fit existing admission and token limits.

Offline regression uses a synthetic NVIDIA-shaped empty-lead case, not saved
provider output. It verifies attribution, representative identity/score,
complete coverage, member bounds, order independence and unrelated-event
isolation. Historical saved-case acceptance remains part of the wiring step.

## Editor contract preparation — iteration 2127

The editor optionally accepts separately attributed cluster evidence, with the
representative first and at most two supplemental reports. Only representatives
are selectable; supplemental IDs can be cited as evidence. Invalid membership,
duplicate IDs, shared reports and changed representative facts fail before calls.
The absence validator uses cited reports with the same title/excerpt bounds sent
to the model. Uncited or truncated-away text cannot support an absence claim.

Offline fixtures cover member transport/attribution, supported and unsupported
absence claims, supplemental-story refusal and payload bounds. Existing callers
supply no cluster evidence, so production prompts and publication remain unchanged.
Production projection, persistence and historical saved-case acceptance remain
open; no provider replay or live calls were used.

## Production transport — iteration 2128

Tech production editor input and immutable cited evidence now share one bounded
projection. Representatives retain their identity, ranking and coverage; up to
two substantive explicit members supply separate publisher labels and citable
IDs. Saved evidence retains publisher objects, source links and exactly the
bounded title/excerpt supplied to editing. Unknown evidence fails closed.
The pool is the collected topic candidates so ownership-filtered paired rankings
can resolve their explicit members without changing ownership or ranking.

Offline composition verifies an empty representative with a substantive member,
separate attribution, member citation and JSON snapshot preservation. Existing
editor absence/membership controls pass. The existing 100 KB byte-based input
admission and conservative cost reservation still apply to the expanded prompt;
4000 output tokens, call count and caps are unchanged. Historical saved-case and
worst-case admission acceptance remain open; no live model calls or historical
edition mutations were performed.

The rollout is limited to Tech; NBA and other topics keep their existing editor
input and evidence snapshots while scheduled NBA acceptance remains pending.
