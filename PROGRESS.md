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

## 2026-11-06: iteration 1009 — consolidate proposal decisions

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green, API/worker active; all 36 sources healthy and zero failed digest runs.
- Read all four topics in the latest public saved edition, still Nov 5 at 14:47 UTC; Nov 6 remains scheduled for 15:00. World breadth remains the biggest weakness; deployed fix awaits publication.
- Owner value: a single linked index makes nine existing proposals, estimates and decision gates reviewable without treating deferred ideas as open implementation work.
- Added the index to docs/ideas.md; three evidence-deferred proposals stay deferred. No new feature, investigation, paid call or runtime change.
- No restarts during the deployment freeze; running code unchanged. SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; nine proposal anchor checks; git diff --check all passed.
- Next: Nov 6 World/full-AI/cost/Bluesky review after publication; fresh X round after 21:00 UTC. Fixed search OFF.

## 2026-11-06: iteration 1010 — scope return to an interrupted edition

- Started clean on main; no leftover work. Alerts clear, health/DB/Redis green, API/worker active; sources check passed and zero failed digest runs.
- Read all four saved Nov 5 topics; World breadth remains the largest weakness, with the deployed fix awaiting Nov 6 publication at 15:00 UTC. No repeated editorial tuning.
- Owner value: a returning reader could find their place among 17 stories and 14 posts without searching the whole edition again.
- Scoped an explicit browser-local continue-reading link: immutable edition/section keys, ten-edition retention, clear control, explicit-link precedence, no automatic jump or inferred read status; 1–2 day estimate, owner review required.
- Existing Contents honors anchors but does not persist scroll-derived position; proposal distinguishes this from browser history restoration. No feature implemented.
- No runtime/source/schema/prompt/budget changes or paid calls; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged. No restarts during deployment freeze; running code unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration tests); pnpm build; targeted Prettier and git diff --check passed. Archived iteration 992 to keep this file small.
- Next: Nov 6 World/full-AI/cost/Bluesky review after publication; X round after 21:00 UTC; fixed search OFF.

## 2026-11-06: iteration 1011 — review the Nov 6 published edition

- Started clean on main; no leftover work. Health/DB/Redis and sources green, alerts clear; no failed digest runs. Scheduled edition published at 15:02:17 UTC.
- Read all four saved topics: 20 stories/16 X/1 Bluesky; World improved from two to five distinct stories after the larger grouping pool. Six multi-article groups had no clearly unrelated event in saved titles.
- Full-AI, zero unscored IDs/budget refusals, 37 settled calls/$0.286904; worker 137.059 s versus 152.320 s Nov 5. Four unsupported-absence replies repaired; no failed/unresolved calls.
- World Bluesky retained one distinct post and dropped one unsupported pick; Tech/NBA/Gaming had no slots. Both Bluesky alerts clear. Real desktop/mobile screenshots saved and visually inspected; no page errors.
- Slot gate fails: extra three topics at World’s $0.015867 each gives 1.5 × $0.334505 = $0.501758 rounded up, above $0.501698 cap. Kept OFF; ack and NEEDS_FROM_HUMAN record owner wait.
- Largest remaining reader weakness: Tech’s five posts repeat two launches. Recorded in docs/edition-reviews/2026-11-06.md; no speculative tuning, runtime change or paid review call.
- Updated TASKS, SOURCES and STEERING ack. No restarts/deploys during 13:00–16:00 freeze; running code unchanged.
- Verification: pnpm check passed (560 unit/224 isolated integration); pnpm format; pnpm lint:fix; pnpm build; git diff --check; read-only edition/timing/status endpoints and worker admission/settlement logs; Playwright real saved Bluesky card at 1440/390px.
- Post-check warning: ObservabilityMemoryBudget pending for obs-shipper; system unit active, 0 restarts, ~78.5/80 MiB. No restart during freeze. Archived iteration 993 to keep this file small.
- Next: X fresh-window round after 21:00 UTC; Bluesky slot awaits owner. Fixed search OFF.

## 2026-11-06: iteration 1012 — recover shipper memory headroom

- Started clean on main; no leftover work. Prior iteration's pending shipper warning was firing, so triage took priority over Tech post repetition.
- Owner value: preserve collection of operational logs without an OOM restart while the published edition remains available.
- Diagnosed cgroup usage: 78.5 MiB total, 66.9 MiB file cache, 7.4 MiB anonymous memory; unit active with zero restarts.
- Reclaimed 32 MiB through the shipper cgroup memory.reclaim; usage fell to 45.8 MiB under unchanged 80 MiB hard ceiling. No deployment, service restart or configuration change during 13:00–16:00 freeze.
- Cause/fix identified: charged filesystem cache lacks an early reclaim threshold. TASKS records MemoryHigh=64M after 16:00, matching existing logs/metrics approach; no further investigation needed.
- pnpm exec tsx scripts/check-observability.ts --verify-o2 passed: seven real log sources, fresh request delivered in 2.626 s, isolated dummy redaction passed; shipper 45 MiB. No paid calls.
- Health/DB/Redis green; pnpm obs sources --check and services --check passed (36 sources/13 units); latest scheduled digest completed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; git diff --check passed.
- Reader weakness remains Tech's repeated launch posts; no editorial change or new evidence this iteration. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged.
- Alert cleared at 15:08:50 UTC after metric refresh; zero firing/pending. Persistent shipper threshold after 16:00, then Tech repetition; fresh X round after 21:00.

## 2026-11-06: iteration 1013 — distinguish launch details from separate post news

- Started clean on main; no leftover work. Alerts clear; /healthz, 13 services and 36 sources healthy.
- Owner value: stop spending all five Tech post slots on different details of two launches.
- Read all five saved Tech originals: Inkling training/specs/weights; GPT-6 Cyber announcement/Firefox findings/infrastructure access.
- Cause: v5 says one post per announcement but permits distinct developments without defining launch details. v6 explicitly treats specifications, training, benchmarks, access and rollout details as one announcement; separate events remain eligible.
- No wording-based grouping, selection schema, caps, sources, collection or paid calls changed. Prompt fingerprint changes through existing cache handling.
- Prepared correction only: no deployment/restart during 13:00–16:00 freeze. Next iteration must deploy after 16:00; actual quality remains unmeasured until a future edition.
- Initial targeted run found the expected stale v5 assertion; updated to v6. Full verification recorded below.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; targeted social editor/selection tests 25/25; git diff --check. Health/DB/Redis and alerts remain green. Archived iterations 994–995 to keep this file small.
- Next: deploy this correction and MemoryHigh=64M after 16:00; X round after 21:00. Bluesky reserved slot and fixed search remain OFF. SOURCES/handbook unchanged (no source or system-flow change).

## 2026-11-06: iteration 1014 — prepare shipper cache reclaim threshold

- Started clean on main; no leftover work. Alerts clear, 13 services and 36 sources healthy; /healthz reports DB/Redis OK.
- Owner value: prevent the observed shipper cache warning recurring and preserve operational log delivery under the existing memory ceiling.
- Prepared MemoryHigh=64M below unchanged MemoryMax=80M, matching the logs/metrics reclaim approach. Live O2 verifier now requires the shipper threshold; updated affected handbook page.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; systemd-analyze verify ops/observability/obs-shipper.service; handbook check 09-observability; git diff --check passed.
- Deployment deliberately deferred: still within 13:00–16:00 UTC freeze. Running shipper active, zero restarts, ~45 MiB, MemoryHigh=infinity; the new runtime assertion must wait for installation. No paid calls.
- Next after 16:00: install unit/restart shipper, run --verify-o2 for threshold and seven-source delivery, deploy social editor v6 and verify app. X round after 21:00; Bluesky slot remains OFF awaiting owner.
- SOURCES and NEEDS_FROM_HUMAN unchanged; no source or owner dependency changed.

## 2026-11-06: iteration 1015 — open cited sources from Bluesky cards

- Started clean on main; no leftover work. Alerts clear, 13 services/36 sources healthy; /healthz DB/Redis OK.
- Reader weakness: World’s saved Bluesky pick cites an Independent article, but its URL was inert text. Readers can now open cited web sources directly from the card.
- HTTP/HTTPS links preserve exact saved text, query strings and trailing punctuation; markup and non-web schemes remain text. No edition rewrite or paid calls.
- Browser replay uses an optional isolated Vite URL, keeping the running app untouched during the 13:00–16:00 freeze. Synthetic fixtures are labelled; four screenshots updated and mobile visually inspected.
- Scoring-order change deferred: reserved slot remains OFF, so speculative early Bluesky scoring could spend on topics with no slot. Admission/order unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed (560 unit/224 isolated integration); pnpm build passed; READER_BASE_URL=http://127.0.0.1:5175 pnpm exec tsx scripts/smoke-bluesky-cards.ts (desktop/mobile, light/dark); git diff --check.
- Deployment/restarts deferred under explicit freeze; after 16:00 deploy this card fix, social editor v6 and shipper MemoryHigh=64M, then verify live. X round after 21:00; Bluesky slot OFF awaiting owner.
- SOURCES/handbook/NEEDS_FROM_HUMAN unchanged: rendering bug only; no source or system-flow change. Archived iterations 996–997 to keep this file under 25 KB.

## 2026-11-06: iteration 1016 — open Bluesky author profiles

- Started clean on main; no leftover work. Alerts clear; /healthz DB/Redis OK, 13 services and 36 sources healthy.
- Reader weakness: World’s saved Bluesky author was plain text while X author names opened their profiles. Link the author to the saved post’s profile so readers can inspect the source account.
- Preserve encoded DID paths from saved post URLs; no lookup, collection, selection, prompt or budget changes. No paid calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; READER_BASE_URL=http://127.0.0.1:5175 pnpm exec tsx scripts/smoke-bluesky-cards.ts (desktop/mobile light/dark, handle and encoded DID profiles); git diff --check. Mobile screenshot visually inspected.
- Initial check stopped on formatting of the newly archived progress entry; formatted and reran. Archived iterations 998–999 to keep PROGRESS under 25 KB.
- Deployment/restarts deferred under the explicit 13:00–16:00 UTC freeze. After 16:00 deploy pending reader fixes, social editor v6 and shipper MemoryHigh=64M, then verify live.
- Next: X round after 21:00 UTC; Bluesky reserved slot remains OFF awaiting owner. SOURCES/handbook/NEEDS_FROM_HUMAN unchanged: rendering only, no source/system-flow/dependency changes.

## 2026-11-06: iteration 1017 — keep article text on title-only rediscovery

- Started clean on main; no leftover work. Alerts clear, /healthz DB/Redis OK, 13 services and 36 sources healthy.
- Owner value: preserve publisher text for future summaries when another source rediscovers the same URL with no excerpt. Latest Tech summaries are thin; HN already captures available body text.
- Found unconditional excerpt overwrite at canonical-URL upsert. Read-only live inspection: six URLs shared by HN/publisher feeds, three empty; this does not establish their prior text or recover it.
- Blank incoming excerpts now keep saved text; nonblank corrections still replace it, with title/engagement updates unchanged. Existing editions untouched; no paid calls.
- Isolated repository regression covers blank and space-only updates from a second source and a later nonblank correction. Updated source notes and affected handbook page; no diagram/schema changes.
- Passed: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; handbook check 07-data-model; git diff --check.
- Deployment/restarts deferred under the explicit 13:00–16:00 UTC freeze. After 16:00 deploy this fix, pending reader fixes, social editor v6 and shipper MemoryHigh=64M, then verify live.
- Next: X round after 21:00 UTC; reserved Bluesky slot remains OFF awaiting owner. NEEDS_FROM_HUMAN unchanged; no new owner dependency.
