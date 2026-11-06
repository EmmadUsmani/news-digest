## 2026-11-06: iteration 992 — correct owner database guidance

- Started clean on main; health green, alerts clear, 36 sources healthy; no failed digest jobs or leftover work.
- World breadth remains the largest saved reader weakness; its deployed fix awaits publication. No further editorial tuning.
- Checked the authorized ORM follow-up: conversion was already accepted in iteration 618. Found the runtime handbook still describing it as in progress, with a long obsolete adapter inventory.
- Replaced that inventory with the current PostgreSQL/Drizzle architecture and linked boundary/migration policy; retained owner-console and historical-migration details.
- Owner value: the runtime handbook now gives a short, accurate answer about database access instead of suggesting unfinished migration work.
- No runtime, schema, source, prompt, budget, flag or paid-call changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Handbook check passed: 18 pages, one diagram, 28 tables; inspected unchanged runtime diagram. Verification/deployment results follow.
- Next: Nov 6 World/full-AI/cost/Bluesky review after publication; no deploys 13:00–16:00 UTC; X round after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (555 unit/224 isolated integration passed); pnpm build; pnpm exec tsx scripts/check-handbook.ts stack-and-runtime; git diff --check. Archived iteration 977 to keep progress small.
- Handbook served from repository; restarted docs service before 13:00 UTC. App runtime unchanged; final health and alerts checked.

## 2026-11-06: iteration 993 — explain both migration directories

- Started clean on main; health/DB/Redis green, alerts clear, API/worker active, all 36 sources healthy; no failed digest runs.
- World breadth remains the largest saved-edition weakness; its deployed fix awaits publication. X round waits until 21:00 UTC.
- Found the owner repository map omitted generated migrations and described only numbered historical SQL. Added drizzle/ and explained runner order, the shared ledger and skipped applied files, with policy links.
- Owner value: the code map now shows where current schema changes live and how to apply them. No further speculative editorial tuning.
- Documentation only; no runtime, source, schema, prompt, budget or paid-call changes. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Deployment freeze began at 13:00 UTC: no services restarted; handbook reads committed files per request.
- Verification results follow. Next: Nov 6 edition/World/cost/Bluesky review after publication; deploys resume after 16:00 UTC; X test after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (555 unit/224 isolated integration tests passed); pnpm build; pnpm exec tsx scripts/check-handbook.ts code-structure (18 pages, one unchanged diagram, 28 tables); git diff --check. Final health green.

## 2026-11-06: iteration 994 — scope earlier on-demand reading

- Started clean on main; health/DB/Redis green, alerts clear, API/worker active. No leftover work.
- Highest content weakness remains World breadth; deployed fix awaits the 15:00 edition. X test waits until 21:00; no repeated content audit.
- Owner value: scoped a way to start reading finished stories during the measured 152-second on-demand wait, instead of another internal documentation polish.
- Added an owner-review idea: private work-in-progress stories, separate from the immutable archive, with access/failure rules and 2–4 day effort estimate.
- Checked generation boundaries: stories precede social selection, but the repeatable-read transaction prevents draft writes through that transaction from becoming visible early.
- Reproduced saved timeline: first post-selection stage 87.337 s, all four by 110.730 s, publication span 152.273 s. No speedup claimed or live calls made.
- Proposal only; no runtime, source, schema, prompt, budget or provider changes. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Deployment freeze honored: no service restarts. Archived iteration 978 to retain progress size limit.
- Verification results follow. Next: Nov 6 edition/World/full-AI/cost/Bluesky review after publication; deployments after 16:00; X round after 21:00.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (555 unit/224 isolated integration tests); pnpm build; targeted Prettier and git diff --check passed. Health green, 36 sources healthy, no failed digest jobs; alerts clear.

## 2026-11-06: iteration 995 — bound the discovery-evidence proposal

- Started clean on main; health/DB/Redis green and alerts clear. No leftover work.
- Largest reader weakness remains World breadth; its deployed fix awaits publication. Thin Tech evidence is the next unresolved content gap; no repeat audit or prompt tuning.
- Owner value: the richer-evidence proposal now has a bounded first version and a 3–5 day estimate, so the owner can assess a concrete route to more informative summaries.
- Verified HN retains destination URLs but reads only item text; ingestion upserts overwrite excerpts; editor input truncates excerpts to 600 characters.
- Scoped five-link HN metadata pilot, separate provenance/cache, background collection and pre-scoring evidence choice. Google News resolution/full-body extraction excluded.
- HTTP review found process-local cache and per-request timeout; proposal explicitly requires a whole-job bound and durable results.
- Proposal only: no external destination requests, paid calls, runtime/schema/source changes or service restarts during 13:00–16:00 freeze. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification results follow. Next: Nov 6 quality/cost/Bluesky review after publication; X round after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (555 unit/224 isolated integration tests); pnpm build; targeted Prettier and git diff --check passed. Health green, 36 sources healthy, no failed digest jobs, alerts clear. Archived iterations 979–980 and completed task markers.

## 2026-11-06: iteration 996 — define evidence-pilot decision criteria

- Started clean on main; health/DB/Redis green, alerts clear, API/worker active. No leftover work.
- Reader weakness: thin HN evidence limits useful Tech summaries; World breadth remains first and awaits the deployed fix's Nov 6 edition.
- Owner value: the evidence proposal now gives a concrete way to decide whether five destination requests help enough to pursue.
- Added fixed sample/skip accounting, paired original/enriched inputs, a proposed three-of-five supported-fact threshold and stop rules.
- Nov 6 comparison precedes collection; paid editorial replay requires separate capped approval. All criteria are proposals, not new owner decisions.
- No destination requests, paid calls, runtime/source/schema changes or service restarts during the 13:00–16:00 deployment freeze.
- SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Next: Nov 6 edition/World/cost/Bluesky review after publication; X test after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check exit 0 (555 unit/224 isolated integration tests); pnpm build; git diff --check. Final health green and alerts clear.

## 2026-11-06: iteration 997 — prepare the Bluesky activation calculation

- Started clean on main; alerts clear, health/DB/Redis green, 36 sources healthy, no failed digest jobs. No leftover work.
- Reader weakness: editions have no Bluesky picks; the reserved-slot implementation awaits the Nov 6 cost/AI gate. World breadth still awaits publication.
- Owner value: a reproducible offline calculation will prevent a mistaken activation decision while enabling broader post selection when affordable.
- Added saved-usage worksheet calculator: sums all topic estimates, rounds 1.5× cost upward, rejects unknown estimates/unsettled usage/non-AI editing/budget refusal.
- Documented complete-topic evidence requirements and incremental-cost accounting; synthetic tests are labelled and are not live edition measurements.
- No activation, paid calls, collection changes or service restarts during the deployment freeze. Runtime/services remain unchanged.
- SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Next: fill Nov 6 evidence after publication; X round after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (558 unit/224 isolated integration); pnpm build passed; git diff --check. Final health green, alerts clear; API/worker active. Archived iterations 981–982 to keep this file small.

## 2026-11-06: iteration 998 — export saved reader content for the publication review

- Started clean on main; alerts clear, health/DB/Redis green. No leftover work. Latest edition remains Nov 5.
- Reader weakness remains World's two-story breadth and thin Tech summaries; deployed fixes await Nov 6, so no further prompt tuning.
- Owner value: the upcoming comparison can read complete saved topic text without repeatedly extracting nested API payloads or generating another edition.
- Added an offline reader-contract export: snapshot identity/window, briefs, stories/coverage, original posts, display text, context and saved engagement.
- Reports explicitly leave media/link inspection to the reviewer and make no quality judgment; operational fields are excluded by the reader contract.
- Exported the actual Nov 5 reader response to /tmp: all four topics, 17 stories and 14 posts; synthetic tests separately verify preservation, privacy and empty topics.
- No paid calls, source/schema/runtime changes, activation or service restarts during the deployment freeze. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Next: Nov 6 reader/World/cost/Bluesky review after publication; X fresh-window test after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (560 unit/224 isolated integration); pnpm build passed; git diff --check. Final health green, alerts clear; API/worker active.

## 2026-11-06: iteration 999 — scope publisher attribution for discovery links

- Started clean on main; alerts clear, health/DB/Redis green, API/worker active. No leftover work.
- Latest reader remains Nov 5; reviewed saved topic text. World breadth remains the largest weakness and awaits the deployed pool fix's Nov 6 output.
- Additional reader weakness: five Tech coverage links use Google News; CNBC/Reuters reports share one hostname and collapse into one discovery label in source rows.
- Owner value: publisher attribution would help readers see whose reporting they are opening and distinguish the outlets behind discovery feeds.
- Added a bounded proposal in docs/ideas.md: separate publisher/discovery identity, prefer structured RSS metadata, preserve unknowns and immutable history; estimated 1–2 days.
- Proposal only under item 38; no collection, paid calls, source/schema/runtime changes or service restarts during the deployment freeze.
- SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Next: Nov 6 reader/World/cost/Bluesky review after publication; fresh X round after 21:00 UTC.
- Verification: saved reader API/export and source-row implementation confirm the example; pnpm format, pnpm lint:fix and pnpm build passed. pnpm check passed (560 unit/224 isolated integration); git diff --check passed.

## 2026-11-06: iteration 1000 — scope story-to-post connections

- Started clean on main; alerts clear, health/DB/Redis green, API/worker active. No leftover work.
- Latest saved reader remains Nov 5 (edition 7d99b279); World breadth is still the largest weakness and awaits the deployed fix's scheduled output.
- Reader friction: Tech's Linux exploit story and Greg Brockman's selected post discuss the same development without a navigable connection.
- Owner value: connecting reporting to a cited original post could reduce searching between sections while preserving both perspectives.
- Added a bounded proposal to docs/ideas.md: exact saved citation evidence only, optional snapshot relation, old-edition compatibility, 1–2 days, no extra calls.
- Similar text alone cannot establish a relation; the motivating example is not claimed to satisfy the citation gate. Measure coverage before implementation.
- Proposal only; no paid calls, collection/schema/runtime changes or service restarts during the 13:00–16:00 deployment freeze.
- SOURCES/NEEDS_FROM_HUMAN/handbook unchanged. Next: Nov 6 reader/World/cost/Bluesky review after publication; X round after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (560 unit/224 isolated integration); pnpm build passed; git diff --check. Final health green and alerts clear.

## 2026-11-06: iteration 1001 — propose continuing-story navigation

- Started clean on main; alerts clear, health/DB/Redis green, API/worker active; no leftover work.
- Latest saved reader is still Nov 5 (7d99b279); World breadth awaits the deployed fix's Nov 6 edition. Scheduled digest remains due at 15:00 UTC.
- Reader friction: World coverage includes mutable election/Iran live pages; those pages cannot recover the prior digest's account for comparison.
- Owner value: a link to an earlier immutable story could make continuing coverage easier to follow across daily editions.
- Added a concise proposal in docs/ideas.md: exact shared coverage URL within a topic, no inferred factual-change claims; estimate 1–2 days with no extra calls.
- Proposal only under item 38; no runtime, collection, schema, spend or service changes during the deployment freeze. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Archived iterations 983–985 to keep PROGRESS below 25 KB. Source checks healthy; failed digest jobs zero.
- Verification: pnpm format, pnpm lint:fix, pnpm check (560 unit/224 isolated integration), pnpm build and git diff --check passed. Final health green; alerts clear.
- Next: Nov 6 reader/World/cost/Bluesky review after publication; X round after 21:00 UTC. Fixed search remains off.

## 2026-11-06: iteration 1002 — scope author-provided media descriptions

- Started clean on main; alerts clear, health/DB/Redis green, API/worker active; no leftover work.
- Latest edition remains Nov 5 (7d99b279); World's breadth still awaits Nov 6 output.
- Reader weakness: NBA's game-winner and Gaming's release-date announcement depend on linked media; saved text cannot recover unseen content.
- Owner value: available author descriptions could make posts more useful when official media cannot load.
- Added a bounded proposal in docs/ideas.md, gated on recorded-source availability; no inference, OCR, extra requests or paid calls. Existing fallback/retry links already work.
- Consolidated three completed proposal markers in TASKS. No runtime/source/schema changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Sources healthy; failed digest jobs zero; next scheduled run 15:00 UTC. No restarts during 13:00–16:00 deployment freeze.
- Verification: pnpm format, pnpm lint:fix, pnpm check (560 unit/224 isolated integration), pnpm build and git diff --check passed; final health green and alerts clear.
- Next: Nov 6 reader/World/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search remains off.

## 2026-11-06: iteration 1003 — close media-description evidence gate

- Started clean on main; alerts clear, health/DB/Redis green, API/worker active; no leftover work.
- Latest edition remains Nov 5 (7d99b279); Nov 6 breadth/cost/Bluesky review awaits publication.
- Reader weakness: NBA/Gaming X posts depend on unseen media. Owner value: determine whether existing descriptions can make them understandable without new requests.
- Checked the recorded X oEmbed fixture: no media description; it does not cover either motivating post. Bluesky already preserves alt text and renders it for thumbnails; its response tests are synthetic.
- Updated docs/ideas.md with the evidence and deferred the proposal: no demonstrated X description source, no duplicate Bluesky preservation work.
- No runtime/source/schema/spend changes; no restarts during the 13:00–16:00 freeze. SOURCES/NEEDS_FROM_HUMAN/handbook unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; 26 targeted Bluesky tests; git diff --check passed. Sources healthy; no failed digest jobs.
- Next: Nov 6 reader/World/cost/Bluesky review after publication; fresh X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1004 — defer unsupported story/post links

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green; API/worker active, all 36 sources healthy, no failed digest jobs.
- Read latest saved edition topic by topic through the offline export: still Nov 5; World breadth and Nov 6 cost/Bluesky decisions await publication.
- Reader weakness: related reporting and original posts require readers to recognize their connection. Owner value: determine whether saved citations support useful navigation before building it.
- Measured exact X/Twitter status IDs in story original/coverage URLs against selected posts within each topic: 32 per-story unique URLs, 17 stories, 14 posts, zero matches.
- Added the evidence to docs/ideas.md and deferred the exact-citation proposal; no article-body fetches, semantic matching, spend or runtime changes.
- Archived iterations 986–987 to keep PROGRESS small. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build passed. Initial pnpm check found formatting in the newly extracted archive; corrected it; full rerun passed (560 unit/224 isolated integration tests). git diff --check passed.
- No restarts during the 13:00–16:00 deployment freeze; running code unchanged.
- Next: Nov 6 edition/World/cost/Bluesky review after publication; X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1005 — scope finding remembered stories

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green, API/worker active, all 36 sources healthy; no failed digest jobs.
- Latest saved edition remains Nov 5 (7d99b279): Tech 5/3, NBA 5/5, Gaming 5/5, World 2/1 stories/posts. Existing breadth, summary and context fixes await Nov 6 publication; no repeated tuning.
- Reader weakness: remembering a player or event does not identify its edition date; the archive exposes dates/windows/topics only. Owner value: recover a previously read story without opening each edition.
- Added a bounded published-story archive search proposal, using Porziņģis as the acceptance example, with a 2–3 day estimate and no LLM/external spend. Owner review required before implementation under item 38.
- No runtime/source/schema changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged. No restarts during the 13:00–16:00 deployment freeze; running code unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; git diff --check all passed.
- Next: Nov 6 edition/World/cost/Bluesky review after publication; X round after 21:00 UTC. Fixed search stays OFF.

## 2026-11-06: iteration 1006 — defer unsupported continuing-coverage links

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green; API/worker active, sources check passed, no failed digest runs. Next scheduled edition 15:00 UTC.
- Read all four topics in the latest saved edition, still Nov 5. World's limited breadth remains the largest weakness; deployed fix awaits Nov 6 evidence.
- Reader weakness: following continuing World coverage requires finding the prior edition manually. Owner value: test whether saved citations can support useful direct navigation before building it.
- Compared Nov 5/4 original and coverage URLs within each topic: 17/14 stories, 32/29 per-story unique URLs, zero matching pairs with literal or existing ingestion canonicalization.
- Documented the result and deferred exact-URL links in docs/ideas.md; no semantic matching, publisher fetches, paid calls or runtime changes. Stop this investigation until new evidence/approval.
- Archived iterations 988–989 to keep PROGRESS small. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- No service restarts during the 13:00–16:00 freeze; running code unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; git diff --check all passed.
- Next: Nov 6 edition/World/cost/Bluesky review after publication; fresh X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1007 — scope corrections for saved editions

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green, API/worker active, all 36 sources healthy; no failed digest runs. Historical collection failures have subsequent healthy source checks.
- Read all four saved Nov 5 topics; World breadth remains the largest weakness and awaits the deployed fix's Nov 6 output. Next edition scheduled 15:00 UTC.
- Reader weakness: known Sony/GTA errors remain visible in the immutable Nov 5 edition even after prompt fixes. Owner value: returning readers could see an explicit correction without silently rewriting their saved edition.
- Added a bounded manual correction-note proposal with attribution, dated history, protected publishing, acceptance example and 2–3 day estimate; approval required before implementation under item 38. No new editorial audit.
- No runtime, source, schema, snapshot, prompt, budget or paid-call changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged. No restarts during the deployment freeze; running code unchanged.
- Archived iterations 990–991 and older completed task markers to keep handoff files small.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; git diff --check all passed.
- Next: Nov 6 World/full-AI/cost/Bluesky review after publication; X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1008 — scope a saved edition for offline reading

- Started clean on main; no leftover work. Alerts clear; health/DB/Redis green, API/worker active, all 36 sources healthy; no failed digest runs.
- Read all four topics through the saved reader export; latest remains Nov 5 (7d99b279), with 17 stories/14 posts. World breadth remains the biggest weakness; its fix awaits Nov 6 publication.
- Reader value: take the saved digest on a journey without depending on widgets or implying that media and linked articles are included.
- Added a bounded text-only HTML download proposal, with public-reader fields, attribution, export date, original links, escaping and offline acceptance; owner review required before implementation.
- No runtime/source/schema/prompt/budget changes or paid calls. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged; no restarts during 13:00–16:00 freeze, running code unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; git diff --check all passed.
- Next: Nov 6 World/full-AI/cost/Bluesky review after publication; X round after 21:00 UTC; fixed search OFF.
