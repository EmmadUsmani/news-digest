# Nov 14 Tech summary depth — iteration 2284

Scheduled edition `b9d55088-892a-4e34-b77c-a398d64c6a9f` has four
AI-edited Tech stories. Three summaries repeat headline-level information.
Their immutable evidence contains no reporting excerpt; asking the editor for
more sentences would require unsupported detail.

| Published story                   | Saved evidence                                | Summary depth                             |
| --------------------------------- | --------------------------------------------- | ----------------------------------------- |
| Meta Italian fine                 | One HN observation, empty excerpt             | One headline-level sentence               |
| Nvidia departure / director sales | Empty HN lead plus 600-character Verge report | Two sentences with attributed allegations |
| Claude Code parallel workers      | One HN observation, empty excerpt             | One headline-level sentence               |
| Ggml 1.0                          | One HN observation, empty excerpt             | One headline-level sentence               |

HN collection reads Firebase story metadata and its optional `text` field.
It does not fetch linked Reuters, AlphaSignal or GitHub article/release bodies.
Those three empty excerpts are therefore absent supplied reporting, rather
than prose lost in the reader projection. The saved editor reasons select
these items for regulatory importance, a coding-tool update and a library
milestone respectively.

## Where available reporting drops out

A read-only reconstruction loads the current 200 candidates for the saved
window and uses the edition’s 200 saved scores and relevance policy. Forty
qualify for the semantic shortlist. Only two currently contain prose:

| Report                 | Saved relevance / importance | Current excerpt |
| ---------------------- | ---------------------------- | --------------- |
| Verge Nvidia departure | 7 / 8                        | 648 characters  |
| Verge ChatGPT Wallet   | 9 / 6                        | 648 characters  |

Reusing the saved five-group Tech response produces a ten-cluster editor
pool with nine entirely empty evidence sets. The Nvidia cluster retains its
600-character Verge evidence, as in the published edition. All four published
story IDs remain in this reconstructed pool.

ChatGPT Wallet is not among the first twenty ranked clusters. Its isolated
rank score is 2.40: recency 2.4, HN engagement zero. Semantic scores admit it
into the forty-item pool, but the subsequent rank uses recency and HN points,
not those scores or reporting depth. A separate member of the same saved
Wallet group is also excerpt-free. This identifies a concrete selection loss
alongside the broader lack of reporting in the admitted pool.

This is a current-input counterfactual, not an exact scheduled-request replay.
The reconstructed grouping fingerprint is `3a69191d1747788b2a6fc8be57a1e0ec30793b634d37ad0d68a100e2d1b4a0d4`;
the saved grouping cache key is `3a3be26018982efabcd361838b48ead2c192cfdaed7ee863d14cda176c066c11`.
They differ. Later collection and excerpt fixes can change inputs; no exact
historical candidate text/engagement or editor-choice replay is claimed.
The immutable three-empty-evidence finding does not depend on reconstruction.

## Bounded next step

Before the next permitted generation-change window, evaluate retaining this
already-qualified readable Wallet cluster in the ten editor slots, using the
saved grouping and a fixed candidate recording. Compare selected event IDs,
semantic scores and reporting text; retain important headline-only news as a
control. Do not simply demand longer summaries, raise the 200-candidate cap,
crawl linked articles or add sources. Existing feed-depth parsing cannot
supply text that HN never collected. No ranking or generation change ships
from this study.

## Evidence collection

Local authenticated GET of the saved admin preview; read-only SELECT of the
scheduled-window cache; `loadArticleCandidates` inside `BEGIN READ ONLY` /
`ROLLBACK`; production `editorialShortlist`, `groupShortlist`, `rank` and
`editorEvidence` with a cache-only substitute. No provider dispatch, cache
write, source request or publication. Temporary outputs:
`/tmp/2284-preview.json`, `/tmp/2284-tech-replay.json`, `/tmp/2284-replay.log`.

## Recorded cutoff experiment — iteration 2285

`pnpm exec tsx scripts/evaluate-tech-evidence-cutoff.ts` evaluates a fixed
40-candidate recording, the saved five grouping sets and production ranking /
evidence projection. It imports no database or provider adapter. This remains
a current-input counterfactual, not a replay of the historical request.

| Ten-slot editor input        | Baseline | One reporting slot reserved |
| ---------------------------- | -------- | --------------------------- |
| Clusters with reporting      | 1        | 2                           |
| Published story IDs retained | 4        | 4                           |
| Wallet reporting supplied    | None     | 596 characters              |

The trial keeps the first nine ranked clusters and admits the highest
semantic-priority readable cluster outside the ten-slot cutoff. Wallet's
cluster has relevance 9 / importance 6; it displaces excerpt-free Perplexity
Decider (7 / 4, recency/engagement score 8.90 versus Wallet's 2.40).
All four published representatives, including the three headline-only
controls, survive. Evidence objects and text are unchanged; no new grouping,
text fetching or editorial call occurs. The recording produces 26 clusters.

This supports a bounded admission option for the next permitted generation
window. It does not establish what the editor would select or write, or that
one reserved slot is the best general policy. Production selection is
unchanged. Compare more saved windows before shipping a generic reservation;
keep semantic admission, the ten-slot limit and important headline-only news.
The fixture is `apps/api/test/fixtures/tech-evidence-cutoff-2026-11-14.json`.

## Second-window control — iteration 2286

The same offline command now includes the Nov 12 window, with forty qualified
candidates captured through the current loader in a read-only transaction.
No compatible scheduled grouping response was found in the publication-hour
cache, so this control explicitly leaves candidates ungrouped. It cannot
reproduce historical grouping or explain the five historical selections.
Only one published representative appears in this reconstructed baseline;
the trial retains that one. The Nov 14 four-of-four control still passes.

The Nov 12 ten-slot baseline contains zero reviewed reporting excerpts. A
reserved slot admits the Verge Nvidia resignation report (352 characters,
importance 9 / relevance 8), replacing an excerpt-free Nvidia dismissal report
(importance 8 / relevance 7). Reporting clusters increase from zero to one.
This adds detail about an already represented event, rather than event breadth.

Crucially, a nonempty-text heuristic instead admits a Google News headline
list before the Verge report. The evaluator now uses explicit, manually
reviewed reporting IDs in both recordings and asserts that this headline list
never counts as reporting. These labels describe usable prose, not factual
verification or a production classifier. No runtime evidence or selection
changes. Before any generic reservation ships, resolve reporting eligibility
and verify grouped inputs; a nonempty excerpt alone is insufficient.

## Grouping sensitivity control — iteration 2289

The same offline evaluator now also applies four manually reviewed same-event
sets to the Nov 12 recording: six CEO-resignation reports, four prospective
CEO-dismissal reports, two reports of an executive relationship, and two United
Airlines booking restrictions. Board deliberations, export policy, analysis
and other developments remain separate. This is a title-reviewed sensitivity
control, not a historical or model grouping replay or factual verification.

| Nov 12 reconstructed editor input  | Ungrouped | Reviewed groups |
| ---------------------------------- | --------- | --------------- |
| Ranked clusters                    | 40        | 30              |
| Baseline clusters with reporting   | 0         | 3               |
| Reporting after reservation        | 1         | 3               |
| Published representatives retained | 1         | 2               |

With reviewed grouping, all three labelled reporting candidates already reach
the ten-slot editor input; there is no reporting challenger below the cutoff,
so the trial makes no replacement. A headline-list member shares a cluster
with genuine reporting and remains excluded from reporting labels itself.
The evaluator permits this distinction and pins both grouped and ungrouped
results, complete membership uniqueness, ten slots and unchanged evidence.

This weakens the case for a generic reserved reporting slot: grouping alone
can remove the reconstructed deficit. Keep production unchanged; natural
scheduled grouped evidence remains necessary before changing admission.
`pnpm exec tsx scripts/evaluate-tech-evidence-cutoff.ts` checks all three
controls with no database, source, cache or provider access. New recording:
`apps/api/test/fixtures/tech-evidence-grouping-2026-11-12.json`.

## Reporting minimum sensitivity — iteration 2297

The recorded evaluator now compares minimums of zero through three reporting
clusters in the same ten slots. It reserves the highest semantic-priority
labelled reporting clusters, then fills remaining slots in ranking order.
Unlike the earlier trial, this counts reporting already inside the cutoff
against the minimum. Evidence text, groups and scores stay fixed.

| Recorded control                           | Minimum 0 | Minimum 1 | Minimum 2 | Minimum 3 |
| ------------------------------------------ | --------- | --------- | --------- | --------- |
| Nov 12 ungrouped: reporting clusters       | 0         | 1         | 2         | 3         |
| Nov 12 reviewed groups: reporting clusters | 3         | 3         | 3         | 3         |
| Nov 14 recorded groups: reporting clusters | 1         | 1         | 2         | 2         |

All four settings retain the same published controls: one Nov 12 ungrouped,
two Nov 12 reviewed-grouped and four Nov 14. These counts only cover published
representatives present in each reconstructed baseline, not the full edition.
The extra Nov 12 ungrouped admissions repeat CEO-resignation reporting before
adding prospective dismissal reporting; added prose does not imply new events.
Nov 14's Wallet report requires a minimum of two; a minimum of one changes
nothing because another reporting cluster already qualifies. Only two labelled
reporting clusters exist there, so a minimum of three cannot supply a third.

This distinguishes a minimum from an unconditional extra reporting slot and
shows why simply reserving one slot would not address the observed Nov 14 gap.
The small labelled recordings still do not justify a generic production rule;
reviewed grouping alone removes Nov 12's deficit. Production remains unchanged.
The offline command pins every row, ten unique slots, retained controls and
unchanged evidence; it performs no source, database, cache or provider access.

## Semantic ordering control — iteration 2312

The offline evaluator now tests the identified ranking cause directly: order
existing clusters by their best saved importance/relevance pair, or by their
best relevance/importance pair, then use recency/engagement and ID as ties.
Each pair comes from one member, rather than combining scores from different
members. Neither order uses the manually reviewed reporting labels to select
candidates; those labels only measure the resulting ten-slot pools.

| Recorded control       | Baseline reporting | Importance first | Relevance first |
| ---------------------- | ------------------ | ---------------- | --------------- |
| Nov 12 ungrouped       | 0                  | 2                | 2               |
| Nov 12 reviewed groups | 3                  | 2                | 2               |
| Nov 14 recorded groups | 1                  | 2                | 1               |

Importance-first admits Wallet and retains all four Nov 14 published
representatives. However, it loses the published Google smartglasses story in
the Nov 12 reviewed-group control and reduces reporting from three clusters
to two. Relevance-first admits Wallet but displaces both Nov 14's Meta fine
and Nvidia cluster, leaving the reporting count unchanged. In the Nov 12
reviewed groups it retains all five published representatives, versus two in
the baseline, while still reducing reporting. Ungrouped gains include repeated
CEO-departure reports; more prose is not necessarily more events.

The controls reject a blanket semantic reorder as an established depth fix:
either ordering has a concrete regression in these recordings. Keep production
unchanged and inspect the next natural grouped editor input before choosing
an admission policy. This study predicts admission only, not model selection
or summary quality. The existing offline command pins both orderings' reporting,
retained-publication, added-cluster and displaced-publication counts, ten unique
slots and unchanged evidence across all three controls. No external calls.
