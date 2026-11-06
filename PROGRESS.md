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

## 2026-11-06: iteration 1018 — deploy the pending reader and ingestion fixes

- Started clean on main; no leftover work. Alerts, health, 13 services and 36 sources healthy; no failed digest jobs.
- Reader weakness remains repeated Tech launch posts and thin source text; deploy prepared social editor v6 and blank-excerpt preservation rather than stacking more changes.
- After 16:00 UTC: built current main, installed shipper unit, reloaded systemd and restarted shipper/API/worker; no restart during freeze.
- Shipper now uses MemoryHigh=64M with unchanged MemoryMax=80M; verified fresh API request delivery in 3.056 s and all seven retained log sources.
- Reader cited links and author profiles are live; real World card verified on desktop/mobile and mobile screenshot visually checked. Saved editions unchanged; selection/summary improvement awaits future ingestion and scheduled editions. No paid calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/224 isolated integration); pnpm build; pnpm exec tsx scripts/check-observability.ts --verify-o2; reader layout and Bluesky card Playwright checks; health/services/sources/jobs/alerts; git diff --check.
- Initial check found archive formatting; corrected. Final lint received SIGTERM without diagnostics; retry passed. Layout smoke twice timed out at a mobile topic jump (heading 212px from top, focus/hash correct); replaced fixed 190px limit with whole heading in top third. Archived 1000–1001.
- Next: Nov 6 X fresh-window round after 21:00 UTC. Fixed search and Bluesky reserved slot remain OFF; reserved slot awaits owner after failed cost gate.
- SOURCES/handbook/NEEDS_FROM_HUMAN unchanged: deployment of already documented changes; no new source, flow or owner dependency.

## 2026-11-06: iteration 1019 — retain feed body excerpts when summaries are absent

- Started clean on main; no leftover work. Alerts clear, /healthz DB/Redis OK and all 36 sources healthy.
- Read all four latest saved topics: Tech repetition awaits deployed editor v6; thin Tech summaries remain. Owner value: retain useful evidence supplied by feeds instead of discarding it when summaries are blank.
- Parser previously used description/summary only. Now the first nonblank normalized description, summary, RSS encoded body or Atom content supplies the existing 1,500-character excerpt. Publisher summaries retain precedence.
- No article-page fetches, source additions, paid calls or saved-edition changes. This does not establish how many future selected stories will benefit; headline-only HN items still have no body.
- Verification: pnpm format; pnpm lint:fix; pnpm check (560 unit/225 isolated integration); pnpm build; handbook check 07-data-model; git diff --check. Synthetic RSS/Atom regression covers precedence, empty HTML, decoding and truncation; recorded feed fixtures unchanged.
- Direct ingestion-file test invocation passed the new case but hit the expected DB isolation guard; full check uses disposable databases instead.
- Archived iterations 1002–1003 to keep PROGRESS small. Updated source notes and data-model handbook; no schema/diagram changes or new owner dependency.
- Deployed after 16:00 UTC with API/worker restarts; health and alerts rechecked.
- Next: Nov 6 fresh X round after 21:00 UTC. Fixed search and Bluesky reserved slot stay OFF; selection and summary quality await future scheduled editions.

## 2026-11-06: iteration 1020 — separate Bluesky scoring from final editing

- Started clean on main; no leftover work. Alerts clear and /healthz DB/Redis OK; X round still waits until 21:00 UTC and reserved slot stays OFF.
- Read all four latest saved topics. Thin Tech summaries and repeated launches await already deployed excerpt/editor changes; avoided further unmeasured editorial changes.
- Owner value: reduce the path toward faster editions (137.059 s on Nov 6); isolated slot-independent scoring from final slot/context-dependent editing as the open speed task requests.
- Final editor now accepts a prepared shortlist; sequential production caller, paid admission and selection remain unchanged. No speculative paid work or measured latency improvement claimed.
- Fake regressions cover one scoring pass, equivalent wrapper output, zero editing with no slot, incomplete-score refusal and invalid budget rejection.
- Passed: pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration); pnpm build; git diff --check; read-only Playwright four-topic render. Health, 13 services, 36 sources and digest jobs healthy.
- No UI, source, schema or handbook flow changes. SOURCES and NEEDS_FROM_HUMAN unchanged; no paid calls. API/worker restarted after build and push.
- Next: integrate earlier scoring only with evidence of safe admission/slot protection; X fresh-window round after 21:00 UTC.

## 2026-11-06: iteration 1021 — reconcile the reader post-layout spec

- Started clean on main; no leftover work. Alerts clear, health DB/Redis OK, all 36 sources healthy and no failed digest jobs.
- Read all four latest saved topics. Tech launch repetition and thin summaries await the deployed editor/excerpt fixes; X round waits until 21:00 UTC and reserved Bluesky slot remains OFF.
- Found a contradictory reader instruction: the spec diagram still requested two desktop post columns, while STEERING item 33's iteration 938 ack approves the deployed full-width rows.
- Owner value: prevent future iterations from narrowing saved text/media or repeatedly undoing the approved reader layout. Corrected the diagram and described current responsive X sizing.
- Briefly prepared two-column JSX, then deliberately discarded it after finding the later steering acknowledgment; no runtime code change remains. Regenerated replay screenshots discarded because the UI is unchanged.
- Browser verification: pnpm exec tsx scripts/smoke-post-sizing.ts passed desktop/mobile light/dark and resize containment; visually checked desktop light. Widget content was an explicit local stub, not live media.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration tests); pnpm build; git diff --check. API/worker restarted, health and alerts clear. Archived iterations 1004–1005 to keep this file small.
- SOURCES, handbook and NEEDS_FROM_HUMAN unchanged: no source, system flow or new owner dependency.
- Next: safe admission/slot proof before earlier Bluesky scoring; fresh X comparison after 21:00 UTC. No paid calls or latency improvement claimed.

## 2026-11-06: iteration 1022 — prove the early Bluesky admission hazard

- Started clean on main; no leftover work. Alerts clear, /healthz OK, all 36 sources healthy, no failed retained queue jobs.
- Read the latest saved stories/posts across all four topics. Tech repetition and headline-limited summaries still await deployed editor/excerpt fixes; World has five distinct stories and one distinct Bluesky post.
- Owner value: protect X editing quality while pursuing faster editions. Completed the requested admission proof before moving paid Bluesky scoring earlier.
- Extended the real-ledger isolated regression: with 80,000 microdollars available, a 20,001 social-triage hold refuses a 60,000 editor hold; reversing order admits the editor and refuses triage. Synthetic amounts; no provider calls.
- Cause: the scheduled reserve protects an edition from other runs, not one stage from another. Guaranteed slots alone cannot preserve admission; outstanding holds count before settlement.
- Kept production sequential. Future early work needs protected X/repair holds or exact cache-only scoring; documented the decision so later iterations do not repeat this investigation. No latency gain claimed.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration, including both admission orders); pnpm build; git diff --check. API/worker restarted; /healthz DB/Redis OK and alerts clear.
- No UI, source, schema or handbook flow changed; SOURCES and NEEDS_FROM_HUMAN unchanged. No paid calls.
- Next: fresh X round after 21:00 UTC; reserved Bluesky slot remains OFF awaiting owner. Review deployed summary/repetition fixes at the next scheduled edition.

## 2026-11-06: iteration 1023 — make headline-only summaries direct

- Started clean on main; no leftover work. Alerts clear, /healthz DB/Redis OK, 36 sources and 13 services healthy; no failed digest jobs. Two retained ingestion failures have recovered healthy sources.
- Read latest saved briefs/stories/posts across all four topics. Tech has two summaries that announce a Hacker News title and then repeat its claim; richer excerpts/repetition fixes already await the next edition.
- Owner value: readers should get the supported news once, with attribution, rather than two sentences describing a headline.
- Story editor v12 requests a direct attributed sentence for thin evidence, with a concrete allegation example. Attribution, absence checks, grouping, models and budgets remain intact; saved editions unchanged.
- Fake-only headline-summary test checks both Sonnet and Haiku paths; golden purpose expectations advance to v12. No generated-prose quality claim or paid calls.
- Passed pnpm format; pnpm lint:fix; pnpm check (562 unit/225 isolated integration); pnpm build; git diff --check. Targeted editor tests passed 19. First check caught stale synthetic replay hash; refreshed only its fingerprint, response unchanged.
- Archived iterations 1006–1007 to keep PROGRESS small; recorded actual saved weakness and next-edition evaluation in the Nov 6 review. No source/schema/handbook flow change; SOURCES and NEEDS_FROM_HUMAN unchanged.
- Initial push rejected: owner added item 43 and lead status updates. Merged owner changes without rewriting history; resolved only appended steering ack. New order raises item 33; next iteration must build final reader before item 42. This step advanced item 42, not 39/34/33.
- Next: final reader under item 33; fresh X round after 21:00 UTC. Reserved Bluesky slot stays OFF. API/worker restart and health/content checks follow push.
