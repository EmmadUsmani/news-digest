# Nov 7 scheduled-edition latency

Iteration 1226 exports the actual scheduled worker timeline for edition
`0b73eb47-19cf-48e8-8190-f9500c140fa4`. This is read-only production evidence,
not a rerun. No provider calls, runtime changes or concurrency changes.

## Reproduce offline

```sh
pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts apps/api/test/fixtures/edition-timeline-2026-11-07.json
```

The fixture contains 71 allowlisted events from the user worker journal,
Nov 7 15:00–15:03:03 UTC: one edition start/finish, 18 stages and 51 Anthropic
HTTP completions. Filtering by the digest-generation queue excludes concurrent
source-ingestion HTTP calls. Only event/time, topic/stage and call
purpose/duration/outcome survive export. No prompts, responses, fingerprints,
headers or credentials are retained.

Offsets use edition start at 15:00:00.039 UTC, 28 ms after job start. The
edition span is 180,540 ms; job duration is 180,570 ms. Stage durations include
admission, database and validation work as well as provider time.

## The last topic changed

| Topic     | Article triage ms | Grouping/story editing ms | Posts ms | Ready offset ms |
| --------- | ----------------: | ------------------------: | -------: | --------------: |
| Tech & AI |            52,533 |                    36,506 |   48,971 |         138,018 |
| NBA       |            42,508 |                    90,426 |   47,583 |         180,525 |
| Gaming    |            35,404 |                    57,803 |   36,556 |         129,771 |
| World     |            65,458 |                    25,544 |   45,247 |         136,257 |

NBA finishes last, unlike Tech on Nov 6. Its story stage includes the already
[diagnosed four-attempt editor exhaustion](2026-11-07.md#nba-fallback-diagnosis).
The edition then still awaits NBA social work. Once Tech is ready at offset
138,018 ms, NBA is the only unfinished topic: a 42,522 ms tail, with one HTTP
call active for 41,986 ms and none for 536 ms.

| Call intersecting the tail | Start offset ms | End offset ms |
| -------------------------- | --------------: | ------------: |
| Social triage              |         133,076 |       153,568 |
| X editor initial           |         153,707 |       156,747 |
| X editor repair            |         156,861 |       160,676 |
| Social triage              |         160,813 |       176,484 |
| Bluesky editor             |         176,607 |       180,517 |

The first X reply is followed by an unsupported-absence rationale rejection
at offset 156,751 ms. The repair then succeeds. Every listed call finishes after all other topics
are ready; the first triage overlaps their final work. This establishes NBA
attribution for these awaited calls; earlier interleaved social calls cannot
be assigned from timing alone. The existing sequential X-then-Bluesky path
explains the two triage stages.

Across the edition, four calls overlap for 129,704 ms (71.84%). Maximum
observed occupancy is four; occupancy-weighted time and the sum of all 51
HTTP durations both equal 582,862 ms. Successful HTTP outcomes include
responses rejected by validation. They do not imply accepted editorial output.

## Next comparison

The queued story repair-feedback changes target an observed failure on the
critical topic. Compare NBA story-stage duration, validation attempts and saved
quality on Nov 8 only if those changes were deployed. Recovery of story editing
alone would still leave substantial social work; do not promise a measured
speedup from this timeline.

Keep concurrency, budgets and the sequential social admission order unchanged.
Earlier paid Bluesky scoring can displace X/repair reservations, as the existing
[admission proof](2026-11-05-social-latency.md#admission-proof--iteration-1022)
shows. Removing only the entire final tail would still leave 138,018 ms,
above both the 60-second target and two minutes. The next scheduled review
should identify its actual critical topic instead of carrying forward Nov 6's
Tech X-repair explanation.
