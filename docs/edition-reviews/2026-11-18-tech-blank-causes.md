# Three-day Tech blank-excerpt cause review — item 67

Iteration 2770, Nov 18, after the deployment hold and NBA offline repair.
One measurement, one general fix, one bounded blank-only backfill. No paid calls.

## Saved cohort

261 distinct saved Tech candidates, joined through source observations to the
Tech topic, published in `[2026-11-15 16:21:45, 2026-11-18 16:21:45)` UTC.
The three-day interval ends at this iteration's initial alert snapshot.
Sources: HN and The Verge. 74/261 excerpts were blank (28.35%); all 74 were HN.
This measures the saved candidate pool, not the latest 200-candidate shortlist.

## Cause table

Every blank was probed once through the ordinary shared HTTP client. Causes
below describe the current response and production extractor at measurement;
there is no retained per-item original publisher-fetch trace. In particular,
a currently extractable page cannot prove whether its original failure was
transient or whether later extractor improvements made it readable.

| Cause                                                                 | Blank candidates | Share of blanks | Filled in bounded run |
| --------------------------------------------------------------------- | ---------------: | --------------: | --------------------: |
| HTTP error/block: 15 × 403, 3 × 401, 1 × 429, 1 × 404                 |               20 |          27.03% |                     0 |
| HTTP 200, unsupported body layout / no extractable prose              |               25 |          33.78% |                    15 |
| HTTP 200, body now extractable; original cause unknown                |               18 |          24.32% |                    18 |
| Access-policy exclusion: two HTTP URLs, two X, one mirror, one Reddit |                6 |           8.11% |                     0 |
| Unsupported PDF or response-size limit                                |                2 |           2.70% |                     0 |
| JS application shell                                                  |                2 |           2.70% |                     1 |
| Paywall/login marker with no extracted body                           |                1 |           1.35% |                     0 |
| Adapter never fetched publisher                                       |      0 confirmed |               — |                     0 |
| **Total**                                                             |           **74** |        **100%** |                **34** |

No feed blanks were found. HN only returns its first 20 IDs and attempts
publisher enrichment for every returned external story without submission
text. IDs beyond 20 are not saved by that collection, so the first-20 limit
cannot by itself explain a blank saved HN excerpt. Historic attempts remain
unknown rather than being counted as confirmed fetches.

The initial audit inadvertently requested the X/mirror/Reddit URLs inherited
from HN. Those responses are excluded from recovery. HN now rejects those
publisher fetches as well as non-HTTPS URLs; X remains on official discovery
ports and Reddit remains disabled. No repeat requests or workaround used.

## General fix and bounded result

The largest non-block cause is unsupported body layouts: 25/74 (33.78%), above
the owner's 10% stop threshold. When existing body extraction returns no prose,
use the document head's own description, then Open Graph description, then
Twitter description. Require at least 60 characters; cap at the existing 1,500
characters. Parse attribute order and entities with the HTML parser. Body prose
wins; widget metadata, scripts, short labels and bare URLs supply no fallback.
There is no publisher list or new fetching path.

One run applied the same `publisherExcerpt` path to all eligible successfully
fetched pages from the 74-blank snapshot. HTTP failures, policy exclusions,
PDFs and the observed paywall stayed untouched. Reused the already fetched
responses rather than requesting pages again. Compare-and-set required exact
ID, canonical URL and an empty current excerpt; each write was reread exactly.

- 34 blanks filled: 18 with existing body extraction, 16 with descriptions
  (15 unsupported layouts and one shell).
- No-excerpt share: **74/261 (28.35%) → 40/261 (15.33%)**.
- All 261 saved excerpts reread and compared: 187 nonblank controls unchanged,
  34 exact expected updates, 40 blank controls unchanged.
- Public description text is source context, sometimes brief or product-wide;
  it is not evidence of facts absent from that text.
- Saved edition snapshots were not regenerated or modified.

[Receipt](2026-11-18-tech-blank-causes.json) records every cohort ID, before/after
length, blank cause and URL. Verification used `pnpm exec tsx /tmp/2770-measure.ts`,
`pnpm exec tsx /tmp/2770-probe.ts`, `pnpm exec tsx /tmp/2770-backfill.ts --apply`
(one write run), and `pnpm exec tsx /tmp/2770-verify.ts`.
The targeted test command is `pnpm exec tsx --test apps/api/test/publisher-excerpt.test.ts`;
normal format/lint/full-check/build/handbook checks follow.
Temporary HTML stays outside git.

The general fix is in the same commit as this review. Stop recovery work here;
check the next scheduled Tech section once in its daily edition review.
