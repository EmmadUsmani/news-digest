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
