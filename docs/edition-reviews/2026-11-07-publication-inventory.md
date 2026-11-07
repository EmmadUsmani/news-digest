# Phase 0 publication inventory — iteration 1240

Read-only inventory at 20:52 UTC on November 7, 2026. No migration, publication
flag, edition generation, provider call or sharing change was made.

Reproduce: `pnpm exec tsx scripts/inventory-editions.ts > /tmp/edition-inventory.json`.
The script uses one repeatable-read, read-only transaction with a 15-second
statement timeout. Output contains IDs, timestamps, field names and counts;
article text and provider diagnostics are not exported.

## Counts and publication decision

| Creation date (UTC) | With scheduled key | Without scheduled key |
| ------------------- | -----------------: | --------------------: |
| November 1          |                 65 |                   390 |
| November 2          |                 18 |                    68 |
| November 3          |                  1 |                     0 |
| November 4          |                  1 |                     0 |
| November 5          |                  1 |                     0 |
| November 6          |                  1 |                     0 |
| November 7          |                  1 |                     0 |
| Total               |                 88 |                   458 |

- No manual edition was created on a UTC day without a keyed edition. The
  requested list of manual editions on otherwise-uncovered days is empty.
- All 458 manual editions are from November 1–2. The owner confirmed they remain unpublished on Nov 7.
- **65 keyed editions have an explicit `integration:` prefix.** These are test
  evidence, not real scheduled publications. The owner-approved backfill classifies them as unpublished tests.
- The other 23 keys use the profile/timestamp format; the format alone does not
  establish that early development runs belong in the public archive.
- The JSON includes every edition's ID, window and counts, all integration-key
  IDs, and the complete manual-day candidate list. No records were deleted.

## Snapshot evolution

All 546 root objects have the same six fields: `createdAt`, `id`, `method`,
`topics`, `windowEnd`, `windowStart`. Six combinations of topic field shapes
exist across the archive:

- November 1: basic stories, then relevance policy/count and rejection details.
- November 2: article editorial metadata; later posts, post-selection method
  and post-editorial metadata appear.
- November 3–5: that article-and-post shape persists.
- November 6–7: `blueskySelection` is also present.

Missing historical posts remain absent rather than being rewritten. The script
counts absent arrays as zero but separately retains each topic's field shape.

| Date       | Topics | Stories | Posts |
| ---------- | -----: | ------: | ----: |
| November 3 |      4 |      19 |    11 |
| November 4 |      4 |      14 |    15 |
| November 5 |      4 |      17 |    14 |
| November 6 |      4 |      20 |    17 |
| November 7 |      4 |      20 |    18 |

These are stored snapshot counts, not a rendering comparison. Phase 0 still
needs additive metadata, spend pools/test editions and the every-published-
edition render comparison. Keep reader visibility unchanged until those checks pass.

## Owner-approved backfill preview — iteration 1249

The read-only inventory now includes `proposedPublication` per edition and a
`publicationPreview` summary. The tested policy uses UTC creation time and the
November 3 cutoff; integration keys always remain tests, including future ones.
Unkeyed editions and pre-cutoff non-integration editions become unpublished
manual editions. A published edition uses its creation time as `published_at`.

Live read-only preview: 546 editions → 5 scheduled/published, 476 manual and
65 tests. The five published candidates are exactly November 3–7 above, with
unchanged topic/story/post counts. No metadata has been written and the reader
is unchanged. The subsequent migration must reproduce this preview before the
published-only switch is enabled.

## Private restore/backfill rehearsal — iteration 1250

- Reproduce: `python3 ops/backups/rehearse_publication.py` outside 13:00–16:00 UTC.
- Fresh private backup `news-digest-20261107T221313Z`: 28 tables, 48,475 rows,
  9,110,018 bytes; SHA-256 checked before restore. Networkless PostgreSQL 17,
  tmpfs storage, no published port; scratch container/volume removed on exit.
- All restored table counts match the snapshot manifest. Metadata backfill gives
  five scheduled/published, 476 manual/unpublished and 65 test/unpublished.
  Independent Python UTC classification checks every row against owner policy.
- Hash comparison over every pre-existing field of all 546 editions matches,
  including IDs, windows and complete saved snapshots.
- First attempt exposed `immutable_digest_preview`: it blocks backfill UPDATE.
  Successful scratch transaction disables only that trigger around the UPDATE,
  restores it before commit, then verifies snapshot UPDATE and DELETE are rejected again.
- Private receipt: `~/backups/news-digest/publication-rehearsal-proof.json`.
  No production migration or reader flag change. This rehearses candidate DDL;
  the registered migration, future-write behavior and browser comparison remain.
