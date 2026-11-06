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
