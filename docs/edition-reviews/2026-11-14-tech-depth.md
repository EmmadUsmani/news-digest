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
