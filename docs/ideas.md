# Product ideas awaiting owner review

## Decision index — Nov 6

These are proposals, not authorized work. STEERING's Current order remains
the execution priority; the Nov 6 edition gates and X round come first.
Estimates below are engineering effort, not API charges.

| Proposal                                                                            | Current decision or next gate                                                        | Estimate if approved         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| [Richer Tech evidence](#richer-evidence-for-discovery-only-tech-stories)            | Compare Nov 6 summaries first; destination collection needs approval                 | 3–5 days                     |
| [Read stories sooner](#read-finished-stories-while-posts-are-still-being-selected)  | After edition review and approved UI work; draft access needs approval               | 2–4 days                     |
| [Publisher attribution](#publisher-attribution-for-discovery-feed-coverage)         | Owner review; inspect structured RSS metadata before implementation                  | 1–2 days                     |
| [Story-to-post links](#connect-reporting-to-the-original-posts-in-the-same-edition) | Deferred: zero exact citation matches in Nov 5                                       | 1–2 days                     |
| [Continuing-story links](#follow-a-continuing-story-across-editions)                | Deferred: zero same-topic URL matches across Nov 4/5                                 | 1–2 days                     |
| [Media descriptions](#author-provided-descriptions-for-media-dependent-posts)       | Deferred: recorded X evidence lacks descriptions; Bluesky already preserves alt text | 1–2 days after evidence gate |
| [Saved-story search](#find-a-story-remembered-from-a-past-edition)                  | Owner review; settle literal matching behavior                                       | 2–3 days                     |
| [Correction notes](#correct-a-known-error-in-an-older-edition)                      | Owner review; settle publishing authority and revision history                       | 2–3 days                     |
| [Offline edition](#take-a-saved-edition-offline)                                    | Owner review; text-only download scope                                               | 1–2 days                     |

[Continue reading](#continue-reading-an-interrupted-edition) is also awaiting
owner review: a browser-local return link, estimated at 1–2 days.

Deferred entries retain their evidence below. Reopen them only with new
evidence and owner approval; do not repeat the completed availability checks.

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
- Status: authorized by STEERING 47 and merged into main after the Nov 7
  review/time gates. Structured RSS evidence survives repeat observations and
  future immutable snapshots; reader rows show publisher labels with discovery
  provenance. Unknown attribution and historical editions stay intact.
  Live migration/deployment awaits metrics recovery.

## Connect reporting to the original posts in the same edition

- Reader problem: Nov 5 Tech story 2 reports 948 Linux privilege-escalation
  exploits; post 2 quotes Greg Brockman's account of almost 1,000 exploits.
  Both are useful, but the reader must recognize the connection while moving
  between sections. The saved reader contract has no story-to-post relation.
- Proposal: link a story to a related selected post within the same topic,
  preserving both the reporting and the original voice. A short “Related post”
  link could jump to the existing card; the post could link back to the story.
  Do not remove either item merely because they discuss the same event.
- Start with explicit evidence: a selected story's stored coverage cites the
  exact selected post URL or ID. Normalize only already-supported X URL forms.
  Shared names, keywords or similar numbers are insufficient. The Nov 5
  example motivates the feature but does not establish that exact-link
  evidence exists; leave it unlinked unless that evidence is saved.
- Scope/cost estimate: 1–2 implementation days for a deterministic relation
  builder, optional snapshot/reader fields, accessible in-page navigation and
  old-snapshot compatibility. No HTTP requests, model calls or new vendors.
  A semantic relation pass would require a separate proposal and cost gate.
- Acceptance if approved: exact cited-post fixtures link correctly, unrelated
  posts and uncited lookalikes remain separate, old editions render unchanged,
  and links work across mobile topic navigation without losing reading place.
  Measure actual exact-link coverage on saved editions before implementation;
  defer if it is too sparse to help the reader.
- Status: proposal only under item 38. World breadth and the Nov 6 edition,
  Bluesky and X decisions remain ahead of this work. No runtime change.

### Saved-citation availability assessment — Nov 6

- Checked the latest public saved edition, `7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7`,
  via `/api/editions/latest` at 14:12 UTC. Read its offline reader export;
  no external article pages or embeds were fetched.
- Compared each story's original and coverage URLs with selected X post IDs
  within its topic, accepting X/Twitter status URL forms. Per-story unique
  coverage URLs: Tech 6, NBA 10, Gaming 6, World 10; 32 total across 17 stories.
  None identifies any of the 14 selected posts. All selected posts are on X.
- The motivating Linux-exploit story saves a Google News article URL, while
  Brockman's selected post has ID `2118129547443056763`. Similar subject matter
  does not meet the proposed exact-citation rule. NBA's Wembanyama and
  Porziņģis pairs likewise have no matching saved citation URL.
- Decision: defer implementation. Exact saved coverage citations would produce
  no links in this edition. This measures reader-visible citation fields only;
  it does not establish whether article bodies cite these posts. Fetching bodies
  or introducing semantic matching would need a separate approved scope.

## Follow a continuing story across editions

- Reader problem: Nov 5 World's election and Iran-war coverage includes live
  pages. A reader returning tomorrow must search the archive to compare the
  prior account with today's developments; opening the publisher's mutable
  live page cannot recover what the digest previously said.
- Proposal: offer a “Previously in this topic” link when consecutive saved
  editions cite the exact same coverage URL. Open the earlier immutable story
  with its edition date. Do not describe the new story as an update or infer
  what changed: a shared live-page URL establishes continuity of coverage,
  not continuity of every event or a verified factual change.
- Scope/cost: roughly 1–2 days for saved-coverage lookup, an optional reader
  relation and accessible navigation. No publisher fetches, model calls, new
  vendor or historical snapshot rewrite. Keep matching within one topic and
  existing URL normalization; do not match stories by headline similarity.
- Before implementation, measure exact-URL recurrence across saved editions
  and check whether links actually help readers. Leave unmatched stories alone;
  defer if useful matches are scarce. Broader semantic tracking needs its own
  proposal and budget estimate.
- Status: idea awaiting owner review under item 38; no implementation or spend.
  Nov 6 breadth/context review and Bluesky/X decisions retain priority.

### Consecutive-edition citation assessment — Nov 6

- Compared the saved Nov 5 edition `7d99b279` with its immediate predecessor,
  Nov 4 `3bf10f5b`, through the local reader API. These contain 17 and 14
  stories respectively. Only original and coverage URLs within the same topic
  were compared; no publisher pages or external services were requested.
- Per-story unique citation counts (Nov 5 / Nov 4): Tech 6/5, NBA 10/5,
  Gaming 6/9, World 10/10; totals 32/29. Matching story pairs: zero in every
  topic, both with literal URL equality and the ingestion `canonicalUrl`
  function (fragment/tracking removal and query sorting).
- Decision: defer the proposed exact-URL links. They would offer no navigation
  in this consecutive pair, including World's live coverage. This does not
  establish that the events differ: reporting can continue under new URLs.
  Broader event matching remains outside the proposal; do not expand matching
  or fetch pages merely to produce links. Revisit only with new saved evidence
  and owner approval, rather than repeat this comparison.

## Author-provided descriptions for media-dependent posts

- Reader problem: Nov 5 NBA's Klay game-winner and Gaming's God of War
  release-date announcement link to media. Saved text and editorial context
  cannot recover a play or an announcement written inside an image when the
  official embed is unavailable. Existing retry/original links already work.
- Proposal: preserve author-provided media descriptions when an existing,
  permitted source response actually supplies them, and expose them beside
  saved text as attributed descriptions. Never infer an image's contents from
  a caption, or present editorial context as a transcription.
- First gate: inspect recorded response fixtures for description availability;
  if none exist, defer rather than add requests, scraping, OCR or model calls.
  The saved reader response alone does not establish availability.
- Cost: roughly half a day for the availability assessment; if useful evidence
  exists, another 1–2 days for optional snapshot fields, accessible display,
  compatibility and recorded tests. No new vendor or paid calls proposed.
- Awaiting owner review under item 38; no implementation, media fetches or
  runtime changes. Nov 6 edition and Bluesky/X decisions retain priority.

### Recorded-data availability assessment — Nov 6

- X: the recorded `social/bbc-world-oembed.json` has post HTML and author
  metadata, but no image/video description. `XOfficialEmbed` stores that HTML
  for provenance; it does not supply author media descriptions. This recording
  does not cover the NBA/Gaming examples or establish what other APIs return.
- Bluesky already preserves image/video `alt` through collection and saved
  selections. The current post renderer uses it as thumbnail alternative text.
  `bluesky-search.test.ts` and `bluesky-media.test.ts` exercise this with
  synthetic responses; they are not recorded evidence of live availability.
- Decision: defer this proposal. There is no recorded description evidence
  here that resolves the two X examples, and Bluesky preservation already
  exists. No new schema or collection work is justified by this assessment.
  A future owner-approved visible-description feature would need separate
  reader evidence; do not duplicate the existing accessibility support.

## Find a story remembered from a past edition

- Reader problem: after reading Nov 5's Porziņģis salary-dispute story, a
  reader may remember the player but not the edition date. The current archive
  lists dates, coverage windows and topic names; finding the story requires
  opening editions individually. Browser find cannot search unopened editions.
- Proposal: a simple archive text search over published, saved story headlines
  and summaries, with an optional topic filter. Return the saved headline,
  topic and edition date, linking directly to that immutable story. Use literal
  words, with no generated answer or claim that the reporting remains current.
- Bound the first version to stories; post text, semantic search, publisher
  pages and unpublished/admin data stay outside this proposal. Search the
  stored snapshots on the server with paginated results rather than downloading
  every edition into the browser. Define case/diacritic behavior before building.
- Cost: approximately 2–3 days for a published-only repository query/index if
  needed, reader contract/endpoint and accessible archive controls. No model
  calls, external requests, new vendor or added API spend. Measure the query on
  the actual snapshot count before choosing an index; preserve edition IDs and
  existing story anchors. Any schema change needs metadata and handbook updates.
- Acceptance example: searching “Porziņģis” finds the Nov 5 saved story and
  opens it in its edition; a no-match query shows a clear empty result. Verify
  pagination and that unpublished snapshots never appear.
- Status: proposal awaiting owner review under item 38. No implementation,
  runtime change or spend; the Nov 6 edition and X/Bluesky decisions come first.

## Correct a known error in an older edition

- Reader problem: Nov 5 Gaming's saved Sony summary contains an unsupported
  pronoun, and its GTA 6 summary omits the original headline's warning that
  early store copies are not playable right away. The existing
  reader review records both issues. Prompt fixes may improve Nov 6, but a
  reader opening Nov 5 still sees the original text without a correction.
- Proposal: an owner-approved correction note attached to a specific saved
  story, displayed beside that story in its edition. Preserve the original
  snapshot and show the note's date, corrected point and supporting saved
  citation. Distinguish an error in the digest from later developments in
  the news; a later event alone is not a correction.
- First version: manual corrections only, with protected admin entry and an
  append-only revision history. No automatic fact checking, publisher fetches,
  model calls, notifications or changes to historical generation costs.
  Show notes consistently on direct story links and normal edition reading;
  retain original text in review exports with separately labelled corrections.
- Acceptance example: the Nov 5 Sony story retains its original snapshot,
  while an approved note explains that the supplied evidence names CFO Lin
  Tao without supporting the generated pronoun. Use the supported name/role;
  do not infer a different pronoun. Uncorrected stories gain no extra labels.
- Cost: approximately 2–3 days for correction storage and metadata, protected
  writes, published-reader projection, accessible display and history checks.
  No new vendor or API spend. Approval must settle who can publish a note and
  how a mistaken correction is superseded without silently removing history.
- Status: proposal awaiting owner review under item 38. No stored editions
  changed and no correction workflow built. Nov 6 breadth, cost and Bluesky
  review and the scheduled X experiment retain priority. This uses the
  [existing reader findings](edition-reviews/2026-11-05-reader.md#nov-6-pre-publication-handoff--iteration-987),
  without reopening the closed editorial audit.

## Take a saved edition offline

- Reader problem: the Nov 5 edition mixes saved reporting with 14 X posts,
  including media-dependent NBA highlights and a Gaming release-date image.
  A reader preparing for a journey needs a readable copy without assuming
  that live widgets, linked reporting or video will remain available.
- Proposal: an explicit download of one published edition as a self-contained
  HTML document, generated from the existing public reader projection. Include
  the coverage window, topic briefs, saved stories, source links, post text and
  saved editorial context. Clearly state that linked articles and media need
  a connection; do not claim the download contains the complete reporting.
- First version: text only, with original links and source attribution. No
  external scripts, fonts, images, cached embeds, background synchronization
  or service worker. Keep the saved publication date prominent so an old file
  cannot be mistaken for today's edition. Escape all saved text and validate
  link schemes before producing downloadable HTML.
- Acceptance example: download Nov 5, disconnect, and open the file locally;
  all four topics, 17 stories and 14 saved posts remain readable. The Gaming
  release-date image remains an original link, with no invented transcription.
  Verify keyboard navigation, small screens, Unicode and hostile text fixtures.
- Cost: approximately 1–2 days for a bounded public-data export, accessible
  document template and browser checks. No new model calls, vendor or media
  requests. A downloaded copy cannot receive subsequent correction notes;
  retain the online edition link and export time so readers can check it.
- Status: proposal awaiting owner review under item 38; no offline feature
  built or private/admin fields exported. World's thin coverage remains the
  largest observed content weakness, with its deployed fix awaiting Nov 6.

## Continue reading an interrupted edition

- Reader problem: the saved Nov 5 edition spans 17 stories and 14 posts. A
  reader returning in a new tab must find their place again. Contents tracks
  the visible section and honors explicit anchors, but does not persist it.
  Browser history restoration may help within one tab; this proposal targets
  a fresh visit to the same saved edition.
- Proposal for owner review: a small “Continue reading” link naming the last
  story or topic, stored only in this browser and keyed by immutable edition
  ID. Offer the jump explicitly; do not move the reader automatically. An
  explicit URL anchor takes precedence. Provide a way to clear the position.
- Keep only edition ID, section anchor and save time for at most ten editions;
  no text, analytics, server writes, accounts or cross-device synchronization.
  Storage failures leave ordinary reading usable. An unavailable anchor offers
  the topic or edition start, without labelling anything read or unread.
- Estimate: 1–2 days, no API or model cost. If approved, verify fresh-tab return,
  explicit links, cleared/disabled storage, edition isolation, keyboard focus
  and mobile layout against saved content. No progress percentages or inferred
  completion. Proposal only; no implementation or runtime change.

## Separate launch substance from sales pitches in social picks

- Reader problem: the Nov 11 Tech edition selects [this FishAudio launch
  post](https://x.com/i/web/status/2120214987633467626). Its full-duplex model
  announcement is relevant, but it also asks readers to book an enterprise demo
  and reply for a free custom agent. The saved card has no engagement metrics.
  A launch can be useful while its sales pitch consumes a scarce post slot.
- Proposal for review after item 50: compare this saved candidate with the
  unselected Tech pool, using cached scoring evidence first. Decide whether
  the technical announcement earns the slot independently of its offer; keep
  original post text intact. Do not reject launches merely for being commercial
  or add phrase-based filters for “free” or “demo.”
- Acceptance: a comparison must identify a stronger eligible replacement, or
  explain why retaining the launch serves readers better. Inspect official
  launches alongside giveaway-led posts before proposing any scoring change.
- Estimate: half a day for the saved-pool comparison; no vendor, collection or
  paid model calls. Runtime tuning remains paused under Current order. This
  records a concrete selection question, not a rejection or authorization to
  alter scoring, budgets or publication.
