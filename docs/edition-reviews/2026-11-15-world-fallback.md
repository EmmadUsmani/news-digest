# Nov 15 World fallback diagnosis

Read-only saved-artifact review, iteration 2400. Edition
`a0fa3916-f1dc-4fbd-8d76-2884d5e01c06`; no inference or replay charges.

## Outcome

World publishes five source-excerpt stories after exhausting both editors.
This is an editorial validation failure, not missing supply, failed ownership
JSON or an unsettled provider call. Gaming recovers with Sonnet; U.S. publishes
with Haiku. World AI recovery remains open.

## Exact saved response failures

| Route          | Saved time UTC | Result                                                               |
| -------------- | -------------- | -------------------------------------------------------------------- |
| Sonnet initial | 15:01:44.974   | Two summaries fail absence support: summit warning and ICJ precedent |
| Sonnet repair  | 15:02:06.773   | Summit warning still fails                                           |
| Haiku initial  | 15:02:20.499   | JSON surrounded by Markdown fences; invalid JSON                     |
| Haiku repair   | 15:02:33.329   | Summit warning still fails                                           |

The summit candidate `b386bdc3` supplies a 600-character excerpt containing:
“even as European leaders warn that the US president must not make major
concessions over the war in Ukraine.” Both Sonnet attempts split that clause
into a new attributed sentence; Haiku's repair attaches it to the summit's
location. These preserve the substance of the supplied warning, but none
repeats its entire supplied sentence verbatim, as the current guard requires.

Sonnet's initial ICJ summary (`b77c2d4b`) similarly rewrites the supplied
“International court of justice has never before found a state guilty of
genocide” statement. Sonnet's repair removes that negative claim successfully.
The summit warning remains the common blocker across all parseable attempts.

A temporary offline probe called production `assertAbsenceSupport` on every
story field against the exact saved prompt candidates and cited evidence IDs.
It reproduces the two initial Sonnet summary failures and the one summary
failure in each repair. It never calls a provider or writes a cache/edition.
Private receipt: `/tmp/2400-absence.log`; original artifacts remain in
`~/.local/state/news-digest/rejected-editors/` at the times above.

## Ownership and settlement

- World and U.S. selected stories plus their saved coverage have zero shared
  IDs. World covers Iran/Bahrain, Vance's Iran-war position, Ukraine/NATO,
  Sudan's electricity attacks and the Gaza commander strike.
- U.S. covers Alaska's governor result, Johnson's leadership departure,
  vaccine-side-effect reimbursements, Trump lawsuits and state legislatures.
  These are distinct domestic/international sections; this review does not
  reconstruct every discarded grouping assignment.
- The edition ledger has 55 calls, all `succeeded`, total 518,206 microdollars
  ($0.518206). No pending, uncertain or failed call remains for this run.
  Provider success includes responses subsequently rejected by validation.
  Summed historical reservations are not concurrent spend or outstanding holds.
- Private read-only DB receipts: `/tmp/2400-{snapshot,ledger}.json`.

## Offline repair study (iteration 2401)

The full production `ShortlistEditor` validator, supplied by a local fake
`json` adapter, exposes failures hidden behind the first rejected field.
No provider, database, cache or ledger adapter is loaded by the probe.

| Saved output                          | Summit summary only: omit warning | Summit summary only: verbatim source sentence | Omit flagged negative clauses in summaries and brief |
| ------------------------------------- | --------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Sonnet initial                        | ICJ summary still refused         | ICJ summary still refused                     | Five stories validate                                |
| Sonnet repair                         | Five stories validate             | Five stories validate                         | Five stories validate                                |
| Haiku initial, fences removed offline | ICJ summary still refused         | ICJ summary still refused                     | Five stories validate                                |
| Haiku repair                          | Brief still refused               | Brief still refused                           | Five stories validate                                |

The Haiku repair's second brief bullet also says European leaders warned the
US “must not make major concessions over Ukraine.” That paraphrase remains
rejected after fixing the summary. Haiku initial has an additional ICJ summary
failure behind its invalid JSON wrapper. Removing fences alone does not recover
it. The earlier field-only diagnosis did not exercise these hidden failures.

The omission counterfactual retains the summit endorsement/location and the
ICJ judgment's subject and timing, removing optional negative clauses rather
than changing the guard. The brief counterfactual keeps the summit development.
These are manually constructed local edits, not a model-generated repair or a
published edition. Schema/selection/absence validation does not independently
establish factual support for every positive clause.

Copying the supplied summit sentence also works for Sonnet repair but carries
355 characters of combined standfirst/body prose. Prefer a concise supported
summary over that mechanical copy. No generic warning rewrite is justified by
this study; changing attribution, modality or scope remains unsafe. Three
negative controls (dropped attribution, warning changed to confirmation, and
“major concessions” changed to “any concessions”) are all refused by the
unchanged production guard.

Private reproducibility receipts: `/tmp/2401-study.ts` and
`/tmp/2401-study.log`; inputs are the four saved artifacts listed above.
The existing fixed repair hint already asks for review of every field and
permits shorter supported text. These saved responses therefore do not justify
merely adding that instruction again. A future bounded warning-equivalence
change needs attribution/scope mutation coverage in summaries and brief bullets;
the separate ICJ failure and JSON wrapper must remain visible in its replay. No production guard, prompt or generation behavior changed.

## Next action

Implement a narrowly scoped repair from the completed offline study: preserve
attribution and warning scope, or omit optional clauses; retain rejection of
invented negative claims in every field. Do not loosen the guard generally or
raise caps. No runtime change was made during the 13:00–16:00 freeze.
NBA repetition, all-topic social quality and Tech evidence depth still need
their separate daily review; social presence alone accepts none of them.
