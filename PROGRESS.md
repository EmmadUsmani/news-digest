## 2026-11-06: iteration 965 — resize X media with its reader card

- Started clean on main; alerts clear, health/database/Redis green, all 36 sources healthy and no failed digest runs. No leftover work.
- Read all four saved topics; World breadth/Tech grouping and Bluesky gates await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: X media retained its creation width after rotation/window resizing; reproduced stale 550px media at a 320px viewport with a local widget stub.
- Observe successful media's card width and rebuild only after its capped width settles, preserving saved-text state. Failed media keeps explicit retry; observer/timer cleaned up on rebuild/unmount.
- Extended saved-edition browser replay across 320px, landscape and original widths in four device/theme views; all passed with saved text open. No external calls or writes.
- Updated TASKS, STEERING ack and affected handbook; archived iteration 949. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend, selection or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final check results below.
- Inspected mobile light resize screenshot; retained four new resize screenshots only. API/worker/docs/schema restarted; health green, scheduled edition still due at 15:00 UTC.
- Initial jobs command used unsupported --check with filters; reran supported read-only jobs query: zero failed digest jobs. Historical ingestion/social failures remain retained, sources healthy and alerts clear.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: first full check ended 143 during unit tests without a reported failure; retry passed 543 unit/224 isolated integration tests. Build, handbook and four-view browser replay passed; services active, health green, alerts clear.

## 2026-11-06: iteration 966 — preserve keyboard focus in saved X text

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Read latest saved topics: World breadth/Tech grouping and Bluesky review await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: X media rebuilding replaced the saved-text link, dropping keyboard focus during rotation/theme changes; reproduced against HEAD with browser focus assertion.
- Keep one saved-text disclosure/link mounted through pending, failed and successful media; preserve focused text when media first succeeds.
- Owner value: keyboard readers can continue from the same original post after rotation or a system theme change.
- Extended saved-edition replay with focus assertions across 320px, landscape, original width and system themes in desktop/mobile light/dark; local widget stub, no writes/external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 950–951. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- First full check terminated with exit 143 after 543 unit passes and during integration tests, without a reported test failure; rerunning the full check.
- Inspected mobile light focus/resize screenshot; retained eight resize/theme screenshots. Rebuilt and restarted API/worker/docs/schema; health green, 36 sources healthy, no failed digest jobs and alerts clear.
- Final retry passed: 543 unit/224 isolated integration tests; build, handbook and four-view browser replay passed. No spend/flag changes; services healthy.

## 2026-11-06: iteration 967 — keep keyboard position when retrying X media

- Started clean on main; health/database/Redis green, alerts clear, all 36 sources healthy and no failed digest runs. No leftover work.
- Read saved topics: World breadth/Tech grouping and Bluesky review await 15:00 publication; X round waits until 21:00 UTC.
- Reader weakness: retrying failed X media removes the focused Retry button and drops focus to the page body; reproduced against HEAD with saved-edition browser assertion.
- Move focus to the saved post link before retry removes the control; existing media-success behavior keeps that link visible and focused.
- Extended four-view recovery replay to require focus without manually setting it. Local widget stub; no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 952–953. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Results below.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view recovery passed. Inspected mobile light screenshot; retained two changed resize screenshots.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear. Initial jobs query used an unknown queue name; supported unfiltered query confirmed zero failed digest-generation jobs.

## 2026-11-06: iteration 968 — preserve saved-text disclosure focus

- Started clean on main; health/database/Redis green, alerts clear, 36 sources healthy and no failed digest jobs. No leftover work.
- Read latest saved topics; World breadth/Tech grouping and Bluesky await Nov 6 publication; X round waits until 21:00 UTC.
- Reader weakness: a system theme change hides the focused saved-text disclosure while rebuilding X media, dropping keyboard focus to the body; reproduced against HEAD.
- Keep the disclosure visible after its first successful embed; only focused original-text links force the panel open on media success, preserving a focused disclosure's collapsed choice.
- Extended saved Gaming replay with system-theme focus/collapsed-state assertions in desktop/mobile light/dark; local widget stub, no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; retained/inspected mobile light screenshot. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check passed (543 unit/224 isolated integration tests); build, handbook and four-view browser replay passed. API/worker/docs/schema restarted; health/database/Redis green and alerts clear.

## 2026-11-06: iteration 969 — preserve media space during reloads

- Started clean on main; alerts clear, health/database/Redis green, 36 sources healthy and no failed digest jobs. No leftover work.
- Read saved Nov 5 topics; Nov 6 edition/Bluesky review waits for publication and X round for 21:00 UTC.
- Reader weakness: saved Gaming X media loses its height during theme replacement, shifting following content; new pending-state browser assertion failed against HEAD.
- Reserve the previous media height during replacement and release on success, rejection or timeout. Reader sees a stable media area while loading.
- Extended saved-edition local-widget replay across desktop/mobile light/dark, with replacement screenshots; no writes or external calls.
- Updated TASKS, STEERING ack and affected handbook; archived iterations 954–955. SOURCES/NEEDS_FROM_HUMAN unchanged; no spend or flag changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-x-media.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- First post-edit browser attempt served old code before build finished; completed-build replay passed. First pnpm check exited 143 after 543 unit and 224 integration passes; full detached rerun started to capture final exit status.
- Next: edition/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final rerun passed with exit 0: 543 unit/224 isolated integration tests; build, handbook and four-view browser replay passed. Inspected mobile replacement screenshot; four new screenshots retained.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear.

## 2026-11-06: iteration 970 — measure the serialized social tail

- Started clean on main; health/database/Redis green, all 36 sources healthy, alerts clear and no failed digest jobs. No leftover work.
- Read latest saved topic headlines/posts; World breadth and Tech grouping await Nov 6 publication. Edition at 15:00 UTC; X round after 21:00 UTC.
- Owner value: identify why editions still take 152 seconds before changing scheduling or risking morning budgets; moved beyond repeated X-card polish.
- Exported 66 allowlisted Nov 5 journal events, added offline topic-stage/HTTP-occupancy replay and three tests for conservation, interval boundaries and invalid stage evidence.
- Weakness/cause: Tech posts take 55.895 s; final 8.804 s has at most one HTTP call, social triage then Bluesky editing. Code serializes Bluesky after X/Reddit slot selection.
- Recorded next cause-level candidate: split scoring from final slot selection after Nov 6 gate; preserve no-slot spending and admission protection. No runtime change or paid calls.
- Updated TASKS and dated speed evidence; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged because system/source behavior is unchanged.
- Verification: targeted timeline tests 3/3; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Initial sources command used unsupported --limit; corrected command confirmed all 36 healthy. UI unchanged, so no browser screenshots needed.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check exit 0 (546 unit/224 isolated integration tests); build and diff checks passed. API/worker/docs/schema restart and post-push health confirmation follow.

## 2026-11-06: iteration 971 — restore saved-edition selection verification

- Started clean on main; alerts clear, health/database/Redis green, 36 sources healthy and no failed digest runs. No leftover work.
- Read saved topics: World breadth and Tech composition fixes await Nov 6 publication; X round waits until 21:00 UTC. No new content cause warrants speculative changes.
- Existing selection replay failed on mobile compact-date whitespace before completing delayed-response scenarios; repaired visible-date, stored timestamp and accessible-year assertions.
- Extended the same existing race replay to check every selected saved post's text and original destination alongside stories, before and after late latest-edition success/error.
- Reader value: verify an older edition retains its own stories and posts when the latest request finishes later. Runtime/content behavior unchanged; no writes, external widget calls or spend.
- Initial extension assumed X markup for all posts; corrected it to cover the older edition's actual Bluesky card too.
- Updated TASKS and item 33 ack; archived completed reader markers and iterations 956–957. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: no system/source changes.
- Verification: pnpm exec tsx scripts/smoke-edition-selection.ts; pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. Final results below.
- Next: Nov 6 edition/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search and reserved slot stay off.
- Final: pnpm check exit 0 (546 unit/224 isolated integration tests); build, lint/format, eight browser scenarios and diff checks passed. Inspected mobile screenshot; four screenshots refreshed. First attached check exited 143; separate-session rerun passed.

## 2026-11-06: iteration 972 — keep thin-source summaries about the news

- Started clean on main; alerts clear, health/database/Redis green and sources returning data. No leftover work.
- Read saved topics; World breadth/Tech composition await 15:00 UTC, X round waits until 21:00 UTC.
- Reader weakness: Tech exploit summary says “The supplied excerpt contains only the headline”; this is editing-process commentary rather than news.
- Cause: editor asks for 2–3 sentences even for headline-only inputs, with no explicit instruction to omit input commentary.
- Editor v6 requests a concise attributed sentence for thin evidence and omits editing-process commentary. Same-story, attribution and absence guards remain intact.
- Added offline thin-source regression through Sonnet and capped Haiku fallback; updated golden purpose expectations and authored synthetic replay fingerprint; historical inference fixtures unchanged.
- Initial direct golden invocation correctly refused missing isolated-test environment; rerun through pnpm check. Initial new test needed the existing two-bullet minimum; corrected fixture.
- No paid inference, source edits, budget/flag/model/provider changes or immutable-edition rewrites. Actual wording remains to verify in Nov 6 edition.
- Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: editorial bug fix, no system or source changes. UI unchanged, so no new browser screenshots.
- Verification: editor tests 14/14; pnpm format; pnpm lint:fix; pnpm check passed 547 unit/224 isolated integration tests; pnpm build and git diff --check passed.
- Full check caught the synthetic replay fingerprint change; verified the old hash before updating only the authored fixture fingerprint. Response/golden output unchanged; full rerun passed. API/worker/docs/schema restarted; health green, alerts clear, saved edition unchanged.
- Next: review Nov 6 stories/cost/Bluesky after 15:00 UTC; fresh X round after 21:00 UTC. Fixed search and reserved slot stay off.

## 2026-11-06: iteration 973 — distinguish archive coverage periods

- Started clean on main; alerts clear and health/database/Redis green. No leftover work.
- Nov 6 edition review waits until 15:00 UTC; X round until 21:00 UTC. Re-read saved topic content; identified content causes already await scheduled verification.
- Owner value: the archive has two Nov 2 editions with the same date/topic labels but different saved coverage windows; readers can now distinguish them.
- Show each saved start/end date and local time on archive links, using semantic timestamps; no new data, source calls, spend or generation changes.
- Corrected stale TASKS note: history recovery scripts already use rebuilt archive routes. Updated affected handbook sentence; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Browser assertions compare both semantic timestamps and visible coverage text against saved archive data across desktop/mobile light/dark.
- Initial browser run preceded the pending build and correctly failed against the old bundle; rebuilt before rerunning.
- Verification: pnpm format; pnpm lint:fix; pnpm check (547 unit/224 isolated integration tests); pnpm build; smoke-reader-archive; check-handbook 08-operations; git diff --check all passed. Four archive screenshots refreshed and mobile light inspected; existing date screenshots refreshed.
- Archived iterations 958–959 to keep PROGRESS below 25 KB. API/worker/docs/schema restart and post-push health/alerts confirmation follow.
- Next: Nov 6 saved edition/cost/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC; flags unchanged.

## 2026-11-06: iteration 974 — favor posts that convey the news

- Started clean on main; alerts clear, health/database/Redis green. No leftover work.
- Read all four latest saved topics; World breadth/Tech composition await 15:00 UTC, X round waits until 21:00 UTC.
- Owner value: Gaming’s release-date update gives no date or change in supplied text; readers get a teaser rather than a development when media is unavailable.
- Cause: social editor excludes invented media descriptions but does not prefer informative text over media-dependent teasers.
- Social editor v3 favors concrete supplied developments, allows fewer picks instead of filler, and explicitly retains highlights with concrete results/stat lines.
- Existing factual/absence guards, X preference, budgets, sources and flags unchanged. No wording-based filtering or immutable-edition edits.
- Offline prompt contract checks passed 12/12, including cache reuse and capped fallback. This verifies instructions/transport, not actual model selection quality; compare Nov 6 Gaming picks.
- No paid calls. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: selection-guidance bug fix with no system/source changes. UI unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed 547 unit/224 isolated integration tests; pnpm build; git diff --check. No UI changes; browser replay unnecessary.
- Archived iteration 960 to keep PROGRESS small. API/worker/docs/schema restarted; final health/alerts checked before commit.
- Next: compare Nov 6 Gaming picks and World/cost/Bluesky after 15:00 UTC; fresh X round after 21:00 UTC. Flags unchanged.

## 2026-11-06: iteration 975 — stop requiring repetitive post notes

- Started clean on main; health/alerts green, all 36 monitored sources healthy; no leftover work.
- Read all four saved topics. Owner value: OpenAI and NBA cards repeat their original text in a second paragraph, contrary to the approved post-card spec.
- Cause: the social editor requires a nonempty reader note for every selected post, even when the post explains itself.
- Social editor v4 permits an empty note, requests useful nonrepeating context only, and retains concise English translations; rationale remains required and factual guards stay intact.
- Selection/cache and orchestration tests retain self-explanatory posts without a note, alongside posts with context. Existing reader rendering already hides empty notes; no UI code changed.
- X truncation is in supplied embed text, not local clipping; no new retrieval or source changes. No paid calls, budget/flag changes or saved-edition edits.
- Verification: targeted social tests 24/24; pnpm format; pnpm lint:fix; pnpm check passed static checks/548 unit tests, then was terminated (143) during integration; standalone isolated integration rerun passed 224/224; pnpm build and final API rebuild passed; check-handbook 08-operations and git diff --check passed.
- Node/Playwright replay: cleared one note in an intercepted saved response only; original text/link stayed visible and Japanese post context remained. Four desktop/mobile light/dark screenshots saved as post-optional-context-*; mobile light inspected.
- Replay is synthetic note omission, not observed live editorial behavior; original saved API response unchanged. Handbook updated; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Archived iteration 961 to keep PROGRESS small. API/worker/docs/schema restarted; health/alerts green, sources healthy; final post-push confirmation follows.
- Next: compare Nov 6 note repetition, Gaming picks and World/cost/Bluesky after 15:00 UTC; fresh X round after 21:00 UTC.

## 2026-11-06: iteration 976 — make the brief an overview

- Started clean on main; health/database/Redis green, alerts clear, all 36 monitored sources healthy; no leftover work.
- Read all four latest saved topics: all 14 brief bullets exactly copy their following story headlines. Owner value: scan a compact overview without rereading the same headlines.
- Editor v7 explicitly requests concise factual overview bullets, retaining developments, attribution and uncertainty; unrelated events remain distinct and invented context stays prohibited.
- Prompt/cache purpose version, synthetic golden expectation and synthetic publication fingerprint updated together; response/golden payloads unchanged. No recorded live responses changed. Existing factual validation and budgets unchanged.
- Offline editor tests pass 15/15, including overview instructions through Sonnet and capped Haiku and unchanged saved factual bullets. These are contract checks, not observed model-quality evidence.
- No paid calls, sources, flags, schema or UI changes. Existing saved editions are immutable; inspect actual Nov 6 output after publication.
- Archived iteration 962 to keep PROGRESS small; TASKS and item 42 ack updated. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: editorial guidance fix with no system/source changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check passed 549 unit/224 isolated integration tests; pnpm build; git diff --check. No UI changes, so no browser replay.
- Earlier checks caught archive formatting and a stale synthetic replay fingerprint (223/224 integration); corrected both. A direct publication test attempt was rejected by the isolation guard; final verification used disposable containers.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear, all 36 sources healthy, zero failed digest jobs; post-push confirmation follows.
- Next: Nov 6 brief/summary/post context, World/cost/Bluesky review after 15:00 UTC; fresh X round after 21:00 UTC.

## 2026-11-06: iteration 977 — preserve reporting publisher names

- Started clean on main; health/database/Redis green, alerts clear, all 36 monitored sources healthy, zero failed digest jobs; no leftover work.
- Read all four saved topics; Nov 6 edition and X evidence remain time-gated. Owner value: readers can distinguish the security publication The Hacker News from the Hacker News discussion site.
- Actual saved exploit summary shortened the explicitly supplied publisher suffix “The Hacker News” to “Hacker News”; Google News collection labels obscure the distinction.
- Editor v8 asks for the explicitly named reporting publisher, full publisher names and no guesses from similar names or aggregator labels. Existing factual guards and selection limits remain intact.
- Offline contracts cover unchanged supplied title/feed labels, full-name output, and instructions on Sonnet and capped Haiku; these do not establish actual model compliance.
- Prompt/cache purpose and synthetic golden expectations updated; synthetic publication fingerprint regenerated from the same fixture input. Response/golden payloads unchanged; no live recordings changed.
- No paid calls, sources, flags, schema or UI changes; saved editions remain unchanged. Review actual Nov 6 attribution after publication.
- Archived iteration 963; TASKS and item 42 ack updated. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: narrow editorial guidance fix with no system/source change.
- Verification: targeted editor tests 16/16; pnpm format; pnpm lint:fix; pnpm check (550 unit/224 isolated integration tests); pnpm build; git diff --check. No UI change, so no browser replay.
- Regeneration first omitted synthetic topic guidance; corrected against the fixture's exact input before integration. No live provider or database used by tests.
- API/worker/docs/schema restarted; health/database/Redis green and alerts clear. Next: Nov 6 summary/brief/attribution, World/cost/Bluesky review after 15:00 UTC; X round after 21:00 UTC.

## 2026-11-06: iteration 978 — prefer original social developments

- Started clean on main; health/database/Redis green and alerts clear; no leftover work.
- Read all four latest saved topics. Nov 6 edition and fresh X round remain time-gated.
- Reader weakness: Tech selected a truncated Eggb4by newsletter excerpt about Oumi alongside original announcements; it adds another news recap rather than an original social moment.
- Owner value: scarce post slots favor original announcements, demos and reporting instead of generic newsletter excerpts.
- Social editor v5 explicitly prefers firsthand developments; recaps must add concrete news. Substantive secondhand scoops remain eligible, and provenance must never be guessed from account names.
- Offline contracts check guidance on Sonnet and capped Haiku; they do not establish actual model selection quality. Saved editions remain unchanged; compare Nov 6 output.
- No paid calls, sources, flags, schema or UI changes. TASKS/item 42 ack updated; archived iteration 964. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: editorial guidance only.
- Verification: targeted social editor tests 14/14; pnpm format; pnpm lint:fix; pnpm check passed 551 unit/224 isolated integration tests; pnpm build; git diff --check. No UI change, so no browser replay.
- Next: Nov 6 World/cost/Bluesky and editorial review after 15:00 UTC; X round after 21:00 UTC.
- API/worker/docs/schema restarted; health/database/Redis green and alerts clear. All 36 monitored sources healthy and zero failed digest jobs; post-push confirmation follows.
