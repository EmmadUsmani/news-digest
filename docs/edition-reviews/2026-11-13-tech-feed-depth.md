# Tech feed evidence loss — iteration 2185

The reader's thin Tech coverage has another upstream cause besides empty HN
link submissions and the repaired cluster-evidence transport. Ars Technica
already supplies substantive reporting in its existing RSS response, but the
feed parser selects its short description before its `content:encoded` field.

## Bounded live evidence

One explicit GET of `https://arstechnica.com/feed/` on Nov 13 around 19:32 UTC
returned 20 articles. No article destinations, media or inference were fetched;
no data was stored. These are live feed observations, not a generated edition.

A temporary offline probe passed the downloaded response through production
`parseFeed`, matched every article by canonical URL, and asserted:

- All 20 stored-form excerpts equal their RSS descriptions (52–101 characters).
- All 20 corresponding encoded bodies contain more text after the existing
  plain-text normalization and 1,500-character cap (593–1,500 characters).
- The Microsoft outage article's description has 68 characters; its normalized
  body has 593. The body supplies affected email/cloud/AI services, the Thursday
  onset, ongoing recovery and preservation of delayed email. The description
  says only that governments, hospitals and courts were affected.
- “Recovery actions are ongoing” appears in that supplied body and not its
  description. This is publisher reporting; no linked claim was independently
  checked.

Downloaded response SHA-256:
`21a132613bd0fca81fafaa42117185531a6ac9f2de999f5a0a3b06919ed984e0`.
Private temporary response: `/tmp/2185-ars.xml`. The probe was removed.

## Next permitted implementation

Prefer the feed's explicit article-content fields (`content:encoded` for RSS,
`content` for Atom) over its summary/description, retaining the existing plain
text cap and falling back when content is blank. Do not choose by string length:
a longer field alone does not establish better reporting. Preserve original
URLs, dates, publisher attribution, X-link extraction and the no-article-crawl
rule. Existing fields are already fetched and parsed; no new source or full
article collection is needed.

Use a minimal recorded feed fragment to verify precedence, blank-content fallback,
Atom content and the existing truncation bound. Run ingestion tests and full
checks before deployment. Changing evidence supplied to future editions touches
generation; implement/deploy before noon UTC under STEERING 59. Production
remains unchanged tonight. This source finding does not accept tomorrow's
scheduled triage recovery, AI editing, grouping or summary quality.

## Offline safety preparation — iteration 2186

Committed `apps/api/test/fixtures/ars-outage-2026-11-13.xml` contains one
minimal article fragment from the response above, retaining original title,
URL, date, author, description, encoded content and media. XML serialization
changed escaping and namespace declarations; it is not the original response
bytes. No new live request was made.

Tests remove only the description in memory to exercise the existing body
fallback: all 593 normalized characters retain the recovery quote and 48-hour
email preservation detail, with identical metadata. Synthetic RSS/Atom cases
verify the 1,500-character cap, blank-content fallback and discovery of an X
citation beyond the excerpt cap, including when a description is present.
These are offline fixture checks, not live ingestion or scheduled acceptance.

Before noon, change precedence and add direct assertions that the unchanged
recorded fragment selects its body and Atom content beats its summary. Update
the existing test named “feed excerpts fall back to bounded body text only
when summaries are blank,” whose first two assertions deliberately pin the
current summary-first behavior. Production parser remains unchanged tonight.

## Stored candidate evidence — iteration 2187

The isolated database regression follows the recorded teaser through storage,
then replaces it with the supplied body using the same canonical URL. Candidate
loading retains the original ID and all 593 body characters, including recovery
and delayed-email details. Repeat ingestion and later empty/whitespace-only
observations retain that reporting; one observation and one candidate remain.
Title, image, publication date and source attribution survive the path.

This exercises the real repository and candidate loader on fresh Testcontainers
Postgres, with no live database or inference. The body is obtained by removing
only the fixture description in memory; production precedence is unchanged.
This closes persistence verification for the planned fix, not natural edition
quality acceptance. Implement the precedence change before noon; avoid further
preparation iterations on this same area while that cutoff is pending.

## Content precedence implementation — iteration 2205

Explicit RSS encoded content and Atom content now precede descriptions and
summaries, with normalized blank fallback. The 1,500-character cap, metadata
and extraction of X links from all fields remain unchanged. The unchanged
recorded Ars fragment now supplies all 593 reporting characters directly.
The isolated enrichment regression starts with a teaser-only observation, then
ingests the unchanged fragment and retains its reporting across repeats and
blank observations. No article-page request or paid call is involved.

Deployment is on Nov 14 UTC, inside the pre-noon generation window.
Scheduled AI-editing recovery and natural summary quality remain unaccepted.
