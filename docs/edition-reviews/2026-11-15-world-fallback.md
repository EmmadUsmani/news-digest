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

## Next action

Use these exact saved prompts/responses for an offline, narrowly scoped repair
study: preserve attribution and the scope of reported warnings while retaining
rejection of invented negative claims. Do not loosen the guard generally or
raise caps. No runtime change was made during the 13:00–16:00 freeze.
NBA repetition, all-topic social quality and Tech evidence depth still need
their separate daily review; social presence alone accepts none of them.
