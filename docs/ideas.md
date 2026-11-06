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
