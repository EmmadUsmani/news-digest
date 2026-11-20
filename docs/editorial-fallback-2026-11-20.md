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
support checks. Keep budgets and models unchanged; no paid replay. The Gaming initial Haiku response ends mid-object at its rationale field. Empty
Tech responses and the malformed Gaming response need output-limit/transport inspection
before assigning their cause. Do not deploy during 13:00–16:00 UTC.
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
