# Product ideas awaiting owner review

## Richer evidence for discovery-only Tech stories

- Reader problem: Nov 5's OpenSSH story repeats the HN headline; the Linux
  exploit story repeats a Google News headline from The Hacker News (a separate
  publisher). Both lack supporting reports in their saved coverage.
- Proposal: evaluate a small, bounded destination-excerpt collection path for
  selected discovery links, through the existing HTTP/source ports. Preserve
  publisher attribution and never bypass access controls. This needs owner
  approval: full-article collection is currently deferred.
- Cost: additional destination HTTP requests and stored excerpt text; no new
  vendor. Implementation effort and incremental LLM cost need a scoped estimate
  before approval. Keep the existing daily cap and edition reserve.
- First compare today's output with the already-deployed concise-summary fix.
  More fluent summaries alone cannot add facts absent from the supplied evidence.
- Status: proposal only; no collection, source, budget or runtime change.

### Bounded first version and effort estimate

- Start with direct HN destination links with empty excerpts. HN already saves
  the destination URL, but its adapter reads only the HN item's own `text`.
  Google News redirect resolution is separate work; exclude it from this pilot.
- Proposed first version: collect publisher-provided HTML description metadata,
  rather than full article bodies, for at most five eligible Tech links per
  edition window. Skip missing, blocked or unhelpful descriptions and retain
  the original evidence. Metadata can still repeat a headline; it cannot
  guarantee a useful summary. No browser automation or access workaround.
- Reuse the HTTP port's public-address checks, redirect validation, host pacing
  and response bounds. Add an explicit per-window request/time allowance and
  durable URL/result cache: the current HTTP cache is process-local, and its
  20-second timeout applies per request, so it alone cannot bound pilot latency.
  Run collection outside the publication transaction and finish before candidate
  scoring; do not extend the scheduled edition's critical path with page fetches.
- Preserve the feed excerpt, publisher URL, retrieved description and retrieval
  time separately. Ingestion upserts currently replace the main excerpt, so
  overwriting it would lose provenance and risk erasing enrichment on refresh.
  Any approved schema change needs migration, schema metadata and handbook updates.
- The story editor currently consumes at most 600 excerpt characters per
  candidate. Choose the evidence before scoring/cache fingerprinting and preserve
  that limit for the pilot. Extra input tokens still cost money even without an
  extra model call; estimate token deltas offline on the actual candidate payload
  before enabling collection, within the unchanged cap and edition reserve.
- Engineering estimate: 3–5 days for the port/metadata adapter, durable evidence
  storage, bounded background job, selection wiring and recorded HTTP/DB replay
  checks. Publisher body extraction and Google News resolution are outside this
  estimate. No new vendor fee; actual HTTP volume, useful-description rate and
  token cost remain unmeasured because no destination requests were made.
- Acceptance if approved: saved evidence adds a supported fact beyond the
  headline on the target sample, retains publisher attribution, survives a feed
  refresh, and leaves blocked/missing pages usable with the original evidence.
  Compare Nov 6 first; this pilot needs owner approval under items 38 and 42.

### Proposed comparison and stop rule

- First read the Nov 6 summaries against their saved inputs. If the deployed
  summary fix already resolves the reader problem, defer the pilot. Do not
  collect pages just to populate a benchmark.
- If approved, take the first five eligible empty-excerpt HN links in a fixed
  edition window, preserving candidate order and recording every skip. Keep
  blocked, empty and headline-only descriptions in the denominator; replacing
  them with better examples would hide the likely reader benefit.
- Save paired original/enriched candidate payloads with retrieval provenance.
  Review whether each description adds a concrete, attributable fact absent
  from the headline before considering an editorial replay. Report added facts,
  missing results, request count, elapsed time and exact payload-size deltas.
- Suggested continuation threshold for owner approval: at least three of five
  links gain a supported fact, with no attribution loss or access workaround.
  Below that threshold, stop this approach rather than widening collection.
  This is a small feasibility sample, not a measured general success rate.
- No extra model calls are included in approval of HTTP collection. Any paired
  editorial replay needs its own explicit capped allowance, based on the saved
  payloads and current app pricing. Confirm the edition reserve still fits
  before enabling evidence in production; keep the feature off otherwise.
- Stop on exhausted request/time allowance or a security/access rejection;
  preserve original inputs and record the outcome. No fallback to full bodies,
  Google News resolution or a new vendor within this pilot.

## Read finished stories while posts are still being selected

- Reader problem: an on-demand edition shows progress until the complete
  snapshot is published. Nov 5 took 152.273 seconds; the first topic reached
  post selection at 87.337 seconds, and all four did by 110.730 seconds.
  The current reader cannot show those already-edited stories during the wait.
- Proposal: an explicitly labelled, private work-in-progress reading view for
  on-demand requests. Show completed story sections as they become available,
  with posts marked as still being prepared. Open the immutable edition when
  publication succeeds; keep the normal archive limited to published editions.
- Scope: generation currently assembles stories before social selection, inside
  one repeatable-read transaction. A draft written through that transaction
  would remain invisible until commit. This needs a separate draft-storage
  port/adapter, a protected request-scoped endpoint and reader state, rather
  than just polling the existing edition endpoint more often. Keep draft
  access tied to the existing admin-authorized on-demand request.
- Failure behavior: unfinished work must never look like a published edition.
  Expire drafts after completion or failure, and link successful requests to
  the existing durable edition job result. Do not change scheduled publication,
  candidate admission, call order, prompts, caps or the immutable snapshot.
- Cost: no additional model calls or vendors; bounded draft writes, polling and
  temporary storage. Estimate 2–4 implementation days across contracts,
  persistence/migration metadata, authorization, reader UI and isolated failure
  verification. A simpler first version could expose only complete topics.
- Decision: consider only after the pending Nov 6 quality/cost review and the
  approved UI work. This improves time to first reading, not generation speed;
  the measured <60-second target remains open. Measure first readable content
  and completion separately if approved. The observed stage times are an
  opportunity, not a promised UI latency.
- Evidence: [saved timing analysis](edition-reviews/2026-11-05-social-latency.md).
  Status: proposal only; no draft storage, endpoint or runtime change.

## Publisher attribution for discovery-feed coverage

- Reader problem: Nov 5 Tech has five Google News coverage links across four
  stories. The Moonshot/Hong Kong story contains CNBC and Reuters reports, but
  both URLs use `news.google.com`. The source-row component deduplicates by
  URL hostname, so these reports share one discovery-feed label rather than
  showing the two publishers. Expanded coverage retains both article links.
- Proposal: preserve structured publisher identity separately from discovery
  source identity at ingestion, carry it into future immutable snapshots, and
  use it for reader attribution and outlet deduplication. Keep “via Google
  News” as discovery provenance. A publisher label does not establish that
  reports are independent or describe the same event.
- Prefer publisher metadata supplied by the RSS entry. Do not infer a trusted
  publisher from a title suffix or treat the redirect hostname as an outlet.
  Unknown publishers keep the existing explicit discovery label. HN destination
  hosts can identify a website, not necessarily an author or news publisher.
- Scope/cost estimate: 1–2 days to inspect recorded RSS metadata, preserve it
  through ingestion and snapshot contracts, update reader rows and replay
  old/new snapshot rendering. Any new storage fields need migrations, schema
  metadata and handbook updates. No extra HTTP or model calls are proposed.
- Acceptance if approved: the saved CNBC/Reuters example displays two publisher
  labels when structured evidence is available; missing metadata remains
  honest, expanded links stay intact, and historical snapshots still render.
  Do not rewrite old editions or resolve Google redirects for this proposal.
- Status: proposal under item 38, pending owner review. World breadth and the
  Nov 6 quality/cost gates remain ahead of this work; no runtime change.
