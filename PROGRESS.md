## 2026-11-05: iteration 841 — preserve keyboard focus after topic reordering

- Started clean on main; no leftover work. Health/database/Redis green and alerts clear; scheduled Nov 5 review remains due at 15:00 UTC.
- Reordering restores the initiating move button, or its opposite when the topic reaches a boundary; failed saves restore the available initiating control.
- Desktop/mobile smoke-topic-order.ts passed: failed-save focus, Enter to first position and back, persistence and timeout recovery. Two new focus screenshots inspected; unrelated regenerated timeout image discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check passed typecheck/lint then stopped at replay-script formatting; corrected with pnpm format/lint:fix, then format:check, boundaries and pnpm test passed (497 unit/214 isolated integration); smoke-admin-gate.ts passed; git diff --check.
- Rebuilt API restarted; health green. Browser snapshots prove live topics/profile/full edition unchanged; no paid calls or live data writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard focus fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 842 — preserve keyboard focus after topic availability changes

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green; scheduled Nov 5 review remains due at 15:00 UTC.
- Enable/Disable restores the initiating button's focus after success, rejected saves and timeouts; the updated button supports keyboard continuation.
- Desktop/mobile smoke-topic-availability.ts passed: focused failure recovery, Enter retry, successful disable focus, persistence, timeout/lost-response recovery and editor protection. Two focus screenshots inspected; unrelated regenerated screenshots discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit/214 isolated integration passed); smoke-admin-gate.ts passed; git diff --check.
- Rebuilt API restarted before 14:30 UTC; health green. Worker/schedule unchanged; browser snapshots prove live topics/profile/full edition unchanged. No paid calls or live data writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard focus fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 843 — preserve source-save keyboard focus

- Started clean on main; no leftover work. Health/database/Redis green and alerts clear; Nov 5 scheduled review remains due at 15:00 UTC.
- Save sources restores focus after success, rejected saves and timeout so keyboard users can continue or retry.
- Updated source-selection replay for current checkbox accessible names; desktop/mobile verifies Enter retry, saved focus, timeout recovery and unchanged live topics/profile/edition. Two focused-button screenshots inspected; unrelated regenerated images discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit/214 isolated integration passed); smoke-topic-sources.ts and smoke-admin-gate.ts exit 0; git diff --check. Initial browser attempt preceded the rebuilt bundle; rerun against completed build passed.
- Static web build served directly by healthy API; no service runtime code changed, so no restart under STEERING 22. Worker and scheduled edition untouched; no paid calls or live writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 844 — preserve schedule-save keyboard focus

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green; scheduled Nov 5 review remains due at 15:00 UTC.
- Save schedule restores focus after success, rejection and timeout, including when saved settings replace the form.
- Desktop/mobile smoke-schedule.ts passed: focus assertions, Enter retry, real timeout, pending locks, rejection/lost-response recovery, saved fields and live topics/profile/full edition immutability. Two focus screenshots inspected; unrelated regenerated screenshots discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit/214 isolated integration passed); smoke-admin-gate.ts passed; git diff --check.
- Static UI served by healthy API; no service runtime changes, so no restart under STEERING 22. No paid calls or live writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 845 — guide uncertain generation to saved editions

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green; Nov 5 scheduled review remains due at 15:00 UTC.
- An uncertain manual-generation response now opens and focuses Browse saved editions, giving keyboard users access to saved results before retrying a possibly queued request.
- Desktop/mobile smoke-edition-jobs.ts passed real queue deadline, interrupted response, focus/open state and Tab access to Open latest edition, no automatic resubmission, polling recovery, completion and failure; protected snapshots prove live topics/profile/full edition unchanged.
- New desktop/mobile focus screenshots inspected; unrelated regenerated images discarded.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit passed; first integration process ended 143 after 214 successful cases; pnpm test:integration rerun exited 0, 214 passed); smoke-admin-gate.ts passed; git diff --check.
- Static UI served by healthy API; no service runtime changes, so no restart under STEERING 22. No paid calls or live writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (recovery accessibility fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 846 — preserve history-retry keyboard focus

- Started clean on main; no leftover work. Alerts clear and health/database/Redis green.
- Successful history retries focus Browse saved editions after the Retry button disappears; failed retries retain Retry focus.
- smoke-history-refresh.ts passed desktop/mobile light/dark, including Enter retry failure, recovery focus, cached links and saved-edition immutability; new focus screenshots inspected desktop/mobile. No browser writes or errors.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check (497 unit/214 isolated integration passed); smoke-admin-gate.ts passed; git diff --check. Initial check caught replay formatting, corrected before the successful full run.
- Static UI served by healthy API; no runtime service changes, so no restart under STEERING 22. No paid calls or live writes.
- TASKS updated; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged (keyboard fix, no new blocker).
- Next FIRST: 15:00 UTC NBA/grouping/cost/latency review, fallback before scorer; X rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 847 — verify first scheduled full-AI edition

- Started clean on main; no leftover work. Health/database/Redis green, alerts clear; scheduled edition took priority as it started at 15:00 UTC.
- Reviewed immutable 7d99b279-cb6a-4cf0-b0a2-d94c5645f0b7: 152.320 s, 756 candidates, 17 stories/14 X posts, $0.315445/46 settled calls, zero holds. All story/social sections AI, zero unscored; NBA five AI stories. Reserve full-ai/released; speed target unmet.
- Four grouping calls $0.002103; four saved multi-article groups reviewed without clearly unrelated events. Raw grouping/recall unknown; separate Tech chip-report/Gaming Sony editorial evidence concerns recorded for follow-up.
- Old scheduled X search $0.143191/19 fetched/18 new verified outside-list posts; one Tech pick selected. X picks 3/5/5/1, no Bluesky picks; saved X engagement unknown. No extra paid verification or live writes.
- Generalized smoke-reader-story-text.ts with edition UUID/safe screenshot prefix, retaining default Nov 4 regression; Nov 5 desktop/mobile light/dark passed all topic text, NBA 5/5, labels/layout, no writes/errors and unchanged edition. Sixteen screenshots saved; NBA/World/Tech/Gaming captures inspected.
- Verification: pnpm format; pnpm lint:fix; pnpm check (497 unit/214 isolated integration passed); pnpm build; smoke-admin-gate.ts passed; pnpm obs health/alerts; git diff --check.
- Updated review/SOURCES/TASKS and STEERING 13/27/35 acks. Archived oversized task detail and progress 828–832; handbook/NEEDS_FROM_HUMAN unchanged (evidence/scripts only, no new blocker).
- No runtime code/config change; no restart under STEERING 22. Rebuilt static UI served by healthy API.
- Next: STEERING 34 scorer now scheduled review is complete; X fresh-window rounds after 21:00 UTC Nov 5/6. Inspect noted editorial evidence; admin identity/proxy verification remains pending.

## 2026-11-05: iteration 848 — give X triage author and engagement context

- Started clean on main; no leftover work. Alerts/health green, all 36 sources healthy and digest queue has zero failures; scheduled Nov 5 edition remains readable with four topics.
- After Nov 5 scheduled acceptance, implemented STEERING 34 scorer inputs: bounded author, cutoff-safe reported likes explicitly labelled unverified, and verified-text pic.twitter media-link hint with contents unknown. Missing counts/media remain unknown; official metrics unchanged.
- Optional snapshot evidence preserves historical editions; production and cache-only batching/triage scripts share one candidate mapper, naturally changing X cache fingerprints. Bluesky inputs unchanged.
- Tests verify known/unknown/zero likes, author/media hints and selected report cutoff/tie ordering; 498 unit and 214 isolated integration tests passed in pnpm check. pnpm build and filtered check-handbook.ts passed; unchanged diagrams need no redraw.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; pnpm exec tsx scripts/check-handbook.ts 05-social-posts; git diff --check; health/source/queue checks and saved-edition GET. Initial combined jobs-check filters were unsupported; corrected jobs query confirmed no digest failures.
- Updated TASKS, X plan and Social posts handbook; SOURCES/NEEDS_FROM_HUMAN unchanged (no source change/new blocker). No paid calls, edition writes or production-search activation.
- Rebuild deployed with API/worker restart; post-restart health and saved edition checked. Next: fresh-window keyword/semantic rounds after 21:00 UTC Nov 5/6, editorial evidence concerns, then pending UI/admin work.

## 2026-11-05: iteration 849 — resolve saved editorial evidence concerns

- Started clean on main; no leftover work. Alerts clear, health/database/Redis green, all 36 sources healthy and digest queue zero failures.
- Completed the Nov 5 Tech/Sony follow-up using a fresh protected edition GET and exact saved evidence IDs/excerpts; response equals iteration-847 capture, SHA-256 recorded in the review.
- Sony profit figures and PS6 quotations are supported; PS6 source explicitly places comments alongside the same quarterly results. Resolved that concern under the owner's same-story definition.
- Tech Moonshot/Blackwell and Hong Kong import reports both have saved support, but combine separate developments sharing a theme. Isolated an editorial composition issue; singleton coverage alone does not establish missing evidence or a grouping-model merge.
- Updated edition review and TASKS with evidence, reproduction and the narrower follow-up. No new audit variant, inference, source fetch or data write; saved edition unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check (498 unit/214 isolated integration passed); pnpm build; git diff --check; pnpm obs alerts/health/sources and filtered jobs. Jobs --check cannot combine filters; corrected query confirmed zero failures.
- No UI/runtime/config change; no restart under STEERING 22. SOURCES, handbook and NEEDS_FROM_HUMAN unchanged (no source/system change or new owner blocker).
- Next: correct Tech editorial composition using saved evidence; X fresh-window rounds after 21:00 UTC Nov 5/6. Admin identity/proxy verification remains pending.

## 2026-11-05: iteration 850 — keep separate developments out of one edited story

- Started clean on main; no leftover work. Alerts/health green, all 36 sources healthy, digest-generation queue zero failures.
- Corrected the actual Nov 5 Tech composition issue in editor v5 instructions: one news story per summary/evidence set; direct follow-ups/reactions/consequences allowed, shared people/company/theme insufficient. Separate developments need separate slots or omission within budget. No wording-based grouping code.
- New prompt/purpose changes cache identity. Golden purpose assertions updated; authored synthetic publication replay fingerprint refreshed for the changed prompt, response and golden snapshot unchanged. No provider recording or paid call.
- Initial pnpm check passed 498 unit but failed one of 214 integration tests on the stale replay fingerprint; reconstructed its old request fingerprint exactly before updating. A standalone diagnostic was refused by the isolation guard; no DB access. Final pnpm check passes 498 unit/214 isolated integration.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; filtered check-handbook.ts 04-edition-pipeline; smoke-admin-gate.ts; git diff --check; obs alerts/health/sources/jobs and /healthz. Corrected unsupported jobs help/queue options to digest-generation.
- Updated TASKS, edition review, RANKING current state and affected handbook prose; no diagram/UI/source/schema change. SOURCES and NEEDS_FROM_HUMAN unchanged.
- API/worker restarted healthy; Nov 5 edition GET byte-identical before/after deployment. No snapshot writes, generation or search activation. Prompt quality awaits the next scheduled edition.
- Next: X fresh-window keyword/semantic rounds after 21:00 UTC Nov 5/6; scheduled composition verification Nov 6. Pending admin identity/proxy work remains open.

## 2026-11-05: iteration 851 — recover completed job links after Redis pruning

- Started clean on main; no leftover work. Alerts clear, health/database/Redis green, all 36 sources healthy and digest queue zero failures. X rounds wait until 21:00 UTC; UI migration remains blocked on owner identity/proxy evidence.
- Completed one M7 recovery slice: missing on-demand Redis jobs resolve their exact publication key through the repository port to the current profile's saved Postgres edition. Existing retained jobs keep their status; unknown jobs remain 404. No generation or paid calls.
- Recovered status returns completed/edition ID with null unavailable progress/duration. Failed/unfinished durable history and Redis-reset/job-ID reuse remain outside this pruning-only change.
- Isolated HTTP test removes a completed job and recovers the identical edition; repository tests cover exact keys, unknown keys and profile isolation. Initial suite had one fixture failure because UPDATE hit edition immutability; corrected INSERT-time keys. Final pnpm check: 498 unit/214 isolated integration passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; filtered check-handbook.ts 03-jobs-and-schedules; git diff --check; smoke-admin-gate.ts; protected missing-job GET 404; obs alerts/health/sources/jobs and /healthz.
- API/worker rebuilt and restarted healthy. Initial smoke/curl raced startup and failed to connect; rerun passed. Saved Nov 5 edition byte-identical before/after deployment, four topics; all 36 sources healthy, no failed digest jobs, alerts clear.
- Updated TASKS and Jobs handbook; corrected stale local-token status in NEEDS_FROM_HUMAN. Archived progress 833–840 to keep orientation small. SOURCES/schema metadata unchanged; no source/schema/UI changes or screenshot need.
- Next: X fresh-window keyword/semantic rounds after 21:00 UTC Nov 5/6; next scheduled editor-v5 composition evidence Nov 6. Admin identity/proxy verification remains open.
