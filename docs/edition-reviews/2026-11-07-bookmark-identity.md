# Bookmark identity check — iteration 1242

Read-only archive check on November 7, 2026, at 21:07 UTC. No preference,
publication, provider, generation or sharing changes.

Reproduce: `pnpm exec tsx scripts/audit-bookmark-identity.ts > /tmp/bookmark-identity.json`.
One repeatable-read, read-only transaction; 15-second statement timeout.
Output contains aggregate identity counts only, never text, authors or URLs.

## Results

| Cohort                            | Editions | Story occurrences / identities | Post occurrences / identities |
| --------------------------------- | -------: | -----------------------------: | ----------------------------: |
| All stored                        |      546 |                    9,793 / 223 |                      101 / 90 |
| Explicit integration keys         |       65 |                     1,214 / 46 |                         0 / 0 |
| Other stored                      |      481 |                    8,579 / 223 |                      101 / 90 |
| Keyed November 3–7 daily editions |        5 |                        90 / 90 |                       75 / 75 |

- All stored stories have nonempty IDs/URLs; all posts have nonempty platforms,
  external IDs and URLs. Saved platforms are X and Bluesky; no saved Reddit
  selections exist in this archive.
- Across all stored editions, 118 story IDs and eight post identities occur in
  multiple editions. Excluding explicit integration keys leaves 117 and eight.
- Every story ID maps to exactly one URL, and every story URL to exactly one
  ID. Every `(platform, externalId)` maps to exactly one URL and vice versa.
- The five regular daily editions contain no repeated identities. Their lack
  of conflicts does not itself test reuse. Earlier stored editions supply the
  reuse evidence; excluding explicit integration keys does not establish that
  every remaining early edition is production content.

## Identity choice for the bookmark implementation

Use a namespaced story ID for stories and a tuple of platform plus external ID
for posts. Do not key by topic, title, edition or position. Encode tuples with
JSON (or an equally unambiguous encoding), so separator characters cannot
collide. Retain each saved item's original URL as its destination.

This matches the underlying model: ingestion upserts on the unique canonical
URL and returns the existing content-item ID; ranking copies that ID and URL
into the story snapshot. Social storage has a composite primary key on platform
and external ID, copied into selections. Bluesky uses the stable AT URI rather
than its mutable author handle. Reddit has the same storage contract but no
saved-edition reuse evidence yet.

No canonical-URL fallback is needed for the current archive. If future legacy
items lack an ID, use their validated canonical URL in a distinct fallback
namespace; never merge unrelated items by headline or rewrite archive IDs.
Grouping may choose a different lead article for an evolving event: those are
separate stories under this model, not a persistent event bookmark.

## Verification and next step

Four offline tests cover same-edition duplicates versus cross-edition reuse,
changed IDs, reused IDs with different URLs, post-platform separation, URL
aliases, absent historical arrays, missing fields and aggregate-only output.
No test calls a database or provider. The live read-only script is separate.

Next: add bounded display copies, bookmark/removal timestamps and tombstones
to the existing single browser-store key; add story/post controls and `/saved`.
Keep topic preferences when extending the store. Phase 2 still requires the
browser/device/theme checks and a normal scheduled edition with its flag on.
