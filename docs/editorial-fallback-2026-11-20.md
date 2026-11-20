# Nov 20 Tech and Gaming editorial fallback — iteration 3079

Scheduled edition `9c810e64-1004-4669-86b5-57bb91ff3654` published at
15:03:54.277 UTC. Public delivery passes: five topics, 25 stories, 20 posts.
Tech and Gaming fail AI editorial acceptance; NBA, World and U.S. pass with
Sonnet. This incident takes priority over the consolidated daily review.
The immutable published edition has not been replaced.

## Retained attempt diagnosis

All eight private request/response artifacts were read locally. No provider
calls, cache writes, ledger changes or publication writes were made.

| Topic  | Model  | Attempt | Recorded failure             | Offline reproduction                      |
| ------ | ------ | ------- | ---------------------------- | ----------------------------------------- |
| Tech   | Sonnet | initial | unsupported absence, summary | OpenSSL input-size sentence paraphrased   |
| Tech   | Sonnet | repair  | unsupported absence, summary | PostgreSQL REPACK sentence paraphrased    |
| Tech   | Haiku  | initial | invalid JSON                 | Empty response                            |
| Tech   | Haiku  | repair  | invalid JSON                 | Empty response                            |
| Gaming | Sonnet | initial | unsupported absence, summary | Ubisoft reassignment sentence paraphrased |
| Gaming | Sonnet | repair  | unsupported absence, summary | Ubisoft reassignment sentence paraphrased |
| Gaming | Haiku  | initial | invalid JSON                 | Response ends mid-object at rationale     |
| Gaming | Haiku  | repair  | unsupported absence, summary | Ubisoft reassignment sentence paraphrased |

For each parseable response, replaying the production absence guard reproduces
the recorded first failure's field and category. Examining every story field
finds eight rejected fields across those five responses. Gaming's initial
Sonnet response also rejects Steam Machine headline/summary and Digital
Fairness Act summary wording.

The evidence does contain the underlying negative statements. The guard
requires complete source sentences; the generated fields change their wording,
attribution or scope. This diagnosis establishes the validation failure, not
that every paraphrase is factually false. In particular, Ubisoft's source says
“Sources have since told IGN …”; the attempted rewrites change that attribution
and/or the surrounding sentence. OpenSSL includes the literal negative condition
“does not fit”, and PostgreSQL/Steam Machine describe features “without” limits.

## Verification and next action

The sanitized fixture retains only the eight rejected fields and the exact
bounded evidence used by the validator, plus topic/model/attempt labels.
`apps/api/test/absence-support.test.ts` checks every original field rejects,
complete supplied evidence passes verbatim, and an invented absence still fails.
These are offline regression cases, not a successful model repair.

Actual commands:

- `pnpm exec tsx /tmp/3079-editor-diagnosis.ts`: eight artifacts accounted for;
  five first-failure assertions pass, three JSON parse failures reproduced.
- `pnpm exec tsx --test apps/api/test/absence-support.test.ts`: six tests pass.
- `pnpm exec tsx scripts/check-scheduled-reader.ts 2026-11-20T15:00:00Z`:
  reader passes; adding all five `--require-ai-topic` flags refuses Tech/Gaming.

Next: repair prompt/repair behavior against these saved inputs while retaining
support checks. Keep budgets and models unchanged; no paid replay. The Gaming initial Haiku response ends mid-object at its rationale field. Completion inspection below confirms all three invalid JSON responses reached
the existing output limit; the retained metadata cannot explain the empty text. Do not deploy during 13:00–16:00 UTC.
Then complete the single Nov 20 daily review, including per-topic important-event
recall and each miss's saved-data cause. References captured after the window
ended remain in `/tmp/3078-reference-stories.json`; no review census is claimed here.

## Bounded repair controls — iteration 3080

Eight manually written field replacements now accompany the retained failures.
These are offline controls, not model responses or a replacement edition.
All eight pass the unchanged absence guard and their field length limits;
removing the evidence rejects all seven summary repairs. The positive Steam
Machine headline passes without needing an absence exception.

| Development              | Repair decision and retained support                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenSSL                  | Positive CVE lead; preserve the complete input-validation sentence, including the encoded-size condition and original spacing.                                                                    |
| PostgreSQL               | Retain Lakebase availability and the two complete REPACK source sentences, including all three limits. The supplied REPACK prose is promotional; this control is not a publication-ready rewrite. |
| Ubisoft (three attempts) | Retain the complete layoff sentence and complete IGN-sources reassignment sentence, including “have since” and “no space”.                                                                        |
| Steam Machine headline   | Use positive direct-order wording for the 512GB model.                                                                                                                                            |
| Steam Machine summary    | Retain complete availability and 2TB qualification sentences; preserve the uncertainty about price increases.                                                                                     |
| Digital Fairness Act     | Retain both complete supplied sentences, including the economic/popularity contrast and its tentative causal wording.                                                                             |

This narrows the next prompt change: apply the existing NBA positive-headline
and complete-negative-sentence guidance across topics. Explicitly cover technical
conditions (such as “does not fit”) and product limits (such as “without”), not
only missing announcements. Preserve important qualifications; check every field
again after repair. Keep this guidance application-owned and generic rather than
injecting incident source prose into fixed repair feedback.

Verification: `pnpm exec tsx --test apps/api/test/absence-support.test.ts`
passes six tests. The controls demonstrate field-level validator compatibility;
whole-response selection, factual review, model obedience and output completion
remain open. No runtime prompt, cap, model, ledger or publication changed during
the deployment freeze. Next iteration should implement and verify the generic
prompt repair outside the freeze, then resume the consolidated daily review.

## Completion diagnosis — iteration 3081

Joined all eight retained artifacts to successful provider-call journal entries
for run `9c810e64-1004-4669-86b5-57bb91ff3654` by exact request fingerprint.
Repair artifacts store the original request, not the dispatched repair prompt.
For those four joins, reconstructed `llmRepairRequest` with application-owned
feedback from the initial failure (empty feedback for invalid JSON); each
reconstructed fingerprint matched exactly one journal entry. Joining the stored
request directly would incorrectly reuse the initial call's completion data.

All calls had the unchanged 4,000-token output limit. Times below are UTC.

| Topic  | Model      | Attempt | Completed at | Stop reason | Output tokens | Visible characters | JSON    |
| ------ | ---------- | ------- | ------------ | ----------- | ------------: | -----------------: | ------- |
| Tech   | sonnet-5-5 | initial | 15:01:31.023 | end_turn    |          2917 |               4808 | valid   |
| Tech   | sonnet-5-5 | repair  | 15:01:50.688 | end_turn    |          2951 |               5212 | valid   |
| Gaming | sonnet-5-5 | initial | 15:01:52.730 | end_turn    |          2393 |               3679 | valid   |
| Tech   | haiku-5-5  | initial | 15:02:08.324 | max_tokens  |          4000 |                  0 | invalid |
| Gaming | sonnet-5-5 | repair  | 15:02:08.591 | end_turn    |          2253 |               3702 | valid   |
| Gaming | haiku-5-5  | initial | 15:02:24.484 | max_tokens  |          4000 |               3131 | invalid |
| Tech   | haiku-5-5  | repair  | 15:02:25.668 | max_tokens  |          4000 |                  0 | invalid |
| Gaming | haiku-5-5  | repair  | 15:02:36.891 | end_turn    |          2946 |               3275 | valid   |

The three invalid JSON responses all exhausted the output limit. Every
parseable rejected response ended normally below the limit and failed the
unchanged absence guard. These are two separate failure paths: repairing the
source-sentence guidance addresses the normal completions; concise output
planning must also stay within the current cap. Gaming already has concise-output
guidance, so its presence alone is not evidence of model obedience.

The adapter received successful provider responses for all eight calls; no
transport exception is recorded for these responses. For the two empty Tech
responses, `max_tokens` and billed output establish limit termination, but the
adapter retains only text blocks and logs aggregate usage. Neither artifact nor
journal establishes which content consumed the tokens. Do not infer a timeout,
refusal, hidden reasoning, or a need for a larger cap from this evidence.

Verification: `pnpm exec tsx /tmp/3081-completion.ts` asserts eight unique exact
joins, three limit terminations, and agreement between JSON validity and normal
completion for this incident. Sanitized completion fields and fingerprints are
retained in `docs/edition-reviews/2026-11-20-editor-completion.json`; no request
text, provider content blocks or secrets are copied. No provider calls, runtime,
model, cap or publication changes. Next: generic all-topic support/repair and
concise-output guidance after the freeze, then consolidated daily recall review.

## General repair guidance — iteration 3082

Story editor v16 applies complete-source-sentence guidance to every topic:
technical conditions, product limits and contrasts retain all conditions,
attribution and uncertainty through final punctuation. Headlines prefer
supported positive facts; material negative qualifications stay in the summary.
Fixed absence repair feedback repeats that guidance and requires checking every
field after repair. No source or rejected model text enters repair feedback.
The existing Gaming concise-output guidance now applies across topics, within
the unchanged 4,000-token limit. All three story purpose labels advance to v16;
retained v14/v15 captures remain valid in the offline work manifest.

Scripted regression tests carry all eight manually written field repairs through
the unchanged editorial validator on Sonnet and Haiku routes. Five-topic tests
also exercise both model repairs with fixed feedback and unchanged output caps.
These tests establish transport and validator compatibility, not factual review
of an entire response, model obedience, or successful future publication. The
PostgreSQL manual control remains unsuitable as publication prose. No paid
replay, new model, budget increase, source change or edition rewrite is involved.

Deployed after 16:00 UTC with API/worker restart, passing health and reader checks.
Full check passes 1,319 unit and 336 integration tests (four expected skips). The
synthetic publication fingerprint and golden dispatch map now use v16; authored
response text and expected publication are unchanged. Next scheduled Tech/Gaming AI acceptance
remains open; the consolidated Nov 20 review and per-topic event recall/miss
causes are the next task once this breakage fix is deployed and healthy.
