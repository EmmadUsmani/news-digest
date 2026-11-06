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

## 2026-11-06: iteration 979 — retain the summary's central development

- Started clean on main; health/database/Redis green, alerts clear; no leftover work.
- Read all four saved topics; Nov 6 edition/X review remains time-gated. Reader weakness: Porziņģis summary only says he is absent, omitting the reported salary withholding in the headline.
- Owner value: summaries explain the news independently instead of offering only secondary background.
- Editor v9 requires the central supported headline development, using title evidence when the excerpt omits it and preserving attribution/uncertainty. Existing factual guards remain intact.
- Offline contract covers title/excerpt transport, accepted synthetic output and guidance on Sonnet/capped Haiku; it does not establish actual model compliance. Compare Nov 6 output.
- Updated purpose/cache version, synthetic golden expectations and publication fingerprint from exact unchanged fixture input; response/golden payloads unchanged. No live recordings or paid calls.
- First targeted check caught a one-bullet synthetic fixture violating the existing two-bullet minimum; corrected fixture. Fingerprint regeneration verified old input match before replacing the key.
- TASKS/item 42 ack updated; archived oldest progress entry. Handbook/SOURCES/NEEDS_FROM_HUMAN unchanged: editorial guidance only.
- Verification: targeted editor tests 17/17; pnpm format; pnpm lint:fix; pnpm check (552 unit/224 isolated integration tests); pnpm build; git diff --check. No UI change, so no browser replay.
- Next: Nov 6 World/cost/Bluesky and editorial review after 15:00 UTC; X round after 21:00 UTC.
- API/worker/docs/schema restarted; health/database/Redis green, alerts clear, all 36 monitored sources healthy and zero failed digest jobs.

## 2026-11-06: iteration 980 — one publisher per coverage report

- Started clean on main; health/database/Redis green and alerts clear; no leftover work.
- Read all four saved topics. Nov 6 edition and X work remain time-gated.
- Reader weakness: expanded World reports repeat Guardian US/World source labels for one article, making coverage harder to scan.
- Display one publisher label per report; all report titles, URLs and timestamps remain intact. No saved data, selection, source or spend changes.
- Extended saved-edition browser replay to verify each report's source label and unchanged full report links on desktop/mobile light/dark; refreshed coverage screenshots.
- Updated TASKS, item 42 ack and affected operations handbook; archived oldest progress entry. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Final results below.
- Next: Nov 6 editorial/World/cost/Bluesky review after 15:00 UTC; X round after 21:00 UTC. Fixed search remains off.
- Final results: 552 unit/224 isolated integration tests passed; build, handbook and four-view browser replay passed. Inspected mobile coverage screenshot. API/worker/docs/schema restarted; health green, alerts clear, 36 sources healthy.

## 2026-11-06: iteration 981 — original headlines for single-report stories

- Started clean on main; health/database/Redis green, alerts clear; no leftover work.
- Read all four saved topics; Nov 6 edition/Bluesky review and X round remain time-gated.
- Reader weakness: single-report stories hide the original article title because only multi-report stories have a coverage disclosure.
- Owner value: inspect the original headline, date and link alongside every rewritten story, including thin-source Tech summaries.
- Enabled the same disclosure for one report with singular article text; unchanged saved content and links.
- Extended four-view saved-edition replay to inspect single-report titles, URLs, times and publisher labels; added screenshots.
- Updated TASKS, item 42 ack and affected handbook. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls or selection changes.
- Archived iteration 967 to keep PROGRESS small. Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check.
- Browser replay passed desktop/mobile light/dark with external embeds blocked; inspected desktop light/mobile dark single-report screenshots. Build and handbook passed.
- API/worker/docs/schema restarted; health green, alerts clear, all 36 sources healthy and zero failed digest-generation jobs. Full check hit exit 143 during integration after static checks and 552 unit tests passed; rerunning isolated integration separately.
- Next: Nov 6 World/cost/Bluesky and editorial review after 15:00 UTC; X round after 21:00 UTC.
- Final verification: separate isolated integration rerun passed 224/224; all required checks completed. Build, handbook and four-view browser replay passed; no paid calls.

## 2026-11-06: iteration 982 — expose saved supporting reports

- Started clean on main; health/database/Redis green, alerts clear, all 36 monitored sources healthy; no leftover work.
- Read all four saved topics; higher-priority edition/Bluesky and X reviews remain time-gated.
- Reader weakness: Sony’s summary uses a PS6 report retained in editorial evidence but missing from the reader’s article disclosure.
- Reader projection now combines grouped coverage and saved editorial citations, deduplicating IDs and preserving original report metadata; saved snapshots stay unchanged.
- Readers can open the reports supporting a combined summary; multi-feed citation labels use the linked hostname to avoid miscrediting a discovery feed. No new calls, selection changes, source changes or spend.
- Added regression coverage for missing supporting citations, duplicate primary IDs, private excerpt stripping, historical snapshots and immutability.
- Browser replay compares all reader report IDs with saved coverage/evidence and captures Sony’s expanded reports in four views.
- Updated TASKS, item 42 ack and affected operations handbook; archived older done markers to shorten TASKS. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: targeted reader tests; pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check. Results below.
- Next: Nov 6 World/cost/Bluesky/editorial review after 15:00 UTC; X round after 21:00 UTC. Fixed search remains off.
- Final: pnpm check passed (553 unit/224 isolated integration tests); build, handbook, four-view saved-edition replay and diff checks passed. Inspected mobile supporting-report screenshot; services restarted, health green, alerts clear, all 36 sources healthy, no failed digest jobs. Initial archive-format failure fixed before full rerun.

## 2026-11-06: iteration 983 — distinguish discovery feeds from reporting outlets

- Started clean on main; health/database/Redis green, alerts clear; no leftover work.
- Read all four saved topics; Nov 6 edition/Bluesky and X reviews remain time-gated.
- Reader weakness: OpenSSH links to its author's Mastodon post but appears under the unqualified Hacker News label; Tech also shows Google News topic feeds as sources.
- Mark these discovery links “via” in story source rows and expanded reports, distinguishing discovery feeds from reporting outlets without guessing authorship.
- Saved content, destinations, collection, selection and spend unchanged; no paid calls.
- Updated TASKS, item 42 ack and affected handbook. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; smoke-reader-layout.ts; check-handbook.ts 08-operations; git diff --check.
- Build and handbook passed; API/worker/docs/schema restarted, health green, all 36 sources healthy, zero failed digest jobs. Full checks/browser results recorded below.
- Next: Nov 6 World/cost/Bluesky/editorial review after 15:00 UTC; X round after 21:00 UTC. Fixed search remains off.
- Final: pnpm check passed (553 unit/224 isolated integration tests); build, handbook, four-view saved-edition replay and diff checks passed. Inspected mobile discovery attribution screenshot; four new screenshots retained. Archived iteration 969 to keep this file small.

## 2026-11-06: iteration 984 — retain practical release qualifications

- Started clean on main; alerts clear and health/database/Redis green; no leftover work.
- Read all four saved topics; edition/Bluesky and X reviews remain time-gated.
- Reader weakness: Gaming's GTA 6 early-store summary omits the original headline's warning that it is not playable right away. The owner would notice the misleading practical release implication.
- Editor v10 asks both headline and summary to retain supported practical qualifications, without inventing unlock dates; absence claims still require a complete verbatim source sentence.
- Updated purpose version and golden expectations; offline contracts cover both primary and fallback editors. Saved editions unchanged; no paid calls, sources or selection settings changed.
- Initial direct golden invocation correctly refused without its isolated-DB flag; full suite runs it through the isolation harness. Targeted editor tests passed 18/18.
- Verification: pnpm format; pnpm lint:fix; pnpm check (554 unit/224 isolated integration passed); pnpm build; git diff --check. No UI or system-flow change requiring screenshots or handbook updates.
- Full-suite replay caught the old synthetic prompt fingerprint; refreshed that fingerprint only, retained authored response, targeted replay and full rerun passed. Archived iteration 970 to keep PROGRESS small.
- API/worker/docs/schema restarted; post-restart health green, alerts clear, all 36 sources healthy. No failed digest jobs; next run 15:00 UTC.
- Next: compare Nov 6 actual output and World/cost/Bluesky after 15:00 UTC; X round after 21:00 UTC.

## 2026-11-06: iteration 985 — keep personal details supported

- Started clean on main; alerts clear, health/database/Redis green; no leftover work.
- Read all four saved topics while Nov 6 edition/Bluesky and X reviews remain time-gated.
- Reader weakness: Sony summary uses “He” for CFO Lin Tao, but neither saved source excerpt establishes pronouns. Readers would care about an unsupported personal detail in an attributed report.
- Editor v11 uses names or roles when source text does not establish pronouns, without inferring gender from names, roles or outside knowledge. Historical edition unchanged.
- Added primary/fallback offline contract; updated purpose/golden expectations and synthetic replay fingerprint only, retaining authored response. No paid calls, source or budget changes.
- Direct publication test initially refused missing isolated DB configuration; rerun used isolated-test flag and unreachable dummy DB (harness stubs queries). Replay fingerprint corrected using actual request.
- Verification/results below; no UI or system-flow change requiring screenshots or handbook updates. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 actual World/cost/Bluesky/editorial review after 15:00 UTC; X round after 21:00 UTC.
- Final: pnpm format; pnpm lint:fix; pnpm check (555 unit/224 isolated integration passed); pnpm build; git diff --check. Initial full check caught archive formatting, fixed before successful rerun.
- API/worker/docs/schema restarted; health green, alerts clear, 36 sources without current errors, zero failed digest jobs and next run 15:00 UTC. Archived iteration 971 to keep PROGRESS small.

## 2026-11-06: iteration 986 — explain incomplete X post recovery

- Started clean on main; alerts clear and health/database/Redis green; no leftover work.
- Read saved summaries and posts across all four topics; Nov 6 edition and X rounds remain time-gated.
- Weakness: OpenAI and Porzingis saved X text ends mid-sentence, while embed failure claimed only media was missing. Readers need the original post to recover omitted text.
- Loading/retry now names the whole X post; failure points to the linked original. Updated existing browser checks and affected handbook wording; saved editions unchanged, no paid calls.
- Initial browser launch raced the service restart (connection refused); reran after health returned green.
- Verification results recorded below. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: Nov 6 World/cost/Bluesky/editorial review after 15:00 UTC; fresh X round after 21:00 UTC.
- Final: pnpm format; pnpm lint:fix; pnpm check (555 unit/224 isolated integration passed); pnpm build; check-handbook.ts 08-operations; smoke-reader-x-media.ts desktop/mobile light/dark; git diff --check. Inspected mobile failure screenshot; refreshed four-view screenshots.
- API/worker/docs/schema restarted; health green, alerts clear, all 36 sources healthy, no failed digest jobs. Archived iteration 972 to keep PROGRESS small.

## 2026-11-06: iteration 987 — consolidate the pending reader comparison

- Started clean on main; no leftover work. Alerts clear; /healthz database/Redis green; API/worker/docs/schema active.
- Reread latest saved edition via /api/editions/latest: Nov 5, 17 summaries, 14 posts and 14 brief bullets across all four topics.
- Owner value: judge actual Nov 6 content against the observed weaknesses rather than stack more unmeasured fixes on the same saved edition.
- Biggest weakness remains World breadth (2 stories/1 post). Its forty-article pool fix is deployed; observed summary/brief/post weaknesses also have deployed fixes awaiting publication.
- Updated the reader review with exact before/after questions and outstanding evidence; no new independently actionable cause found. No runtime change or claim of improved production quality.
- Initial documentation patch used context from the wrong review file and applied nothing; corrected before editing. SOURCES/NEEDS_FROM_HUMAN unchanged; no paid calls.
- Verification: pnpm format; pnpm lint:fix; pnpm check (555 unit/224 isolated integration passed); pnpm build; git diff --check. No UI or system-flow change requiring screenshots/handbook edits.
- Next: after 15:00 UTC read Nov 6, measure full-AI/cost and Bluesky outcomes; no deploys 13:00–16:00. X fresh-window round after 21:00 UTC.
- Live checks: pnpm obs sources --check reports 36 healthy; digest queue has zero failed jobs and next run 15:00 UTC. Initial jobs --check with filters was rejected; reran supported filtered command successfully.

## 2026-11-06: iteration 988 — quiet reader post commentary

- Started clean on main; health green, alerts clear, all 36 sources healthy. No leftover work.
- World breadth remains largest content weakness; its deployed fix awaits Nov 6 publication, as do the other saved comparison findings.
- Owner value: removed 14 repeated “Digest context” headings from the latest edition; useful translations and explanations remain below original posts in muted text.
- No saved content, prompts, selection, sources, budgets or paid calls changed. Updated affected handbook wording and existing reader browser check.
- Archived oldest progress entry to retain the file size limit. SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification and live checks recorded below. Next: Nov 6 edition/cost/Bluesky review after 15:00 UTC; no deploys 13:00–16:00; X after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; full pnpm check passed static checks/555 unit tests, then was terminated (143) during integration; standalone isolated integration rerun below. pnpm build and handbook 08-operations passed.
- smoke-reader-layout passed desktop/mobile light/dark against real saved content; refreshed four post screenshots and inspected mobile light. External embeds blocked by the browser check; no claim of live embed success.
- Services restarted before browser checks; health/database/Redis green, alerts clear, zero failed digest jobs. Initial jobs help/queue aliases rejected; supported unfiltered queue snapshot succeeded.
- Final standalone pnpm test:integration passed all 224 tests (exit 0); all required check components green. Build/browser checks and final git diff --check passed; pushed commit below.

## 2026-11-06: iteration 989 — scope the thin-evidence gap

- Started clean on main; no leftover work. Alerts clear, health green, all 36 sources healthy; no failed digest jobs, next edition 15:00 UTC.
- Reader weakness: saved OpenSSH and Linux-exploit summaries repeat headlines; existing concise-summary changes await today's output.
- Checked source adapters and recorded feed excerpts: HN link posts have no supplied body; Google News's exploit item is from The Hacker News, a separate publisher. No dropped excerpt found in this investigation.
- Owner value: richer source evidence could make Tech summaries informative; documented a bounded destination-excerpt proposal in docs/ideas.md for owner review.
- Full-article collection stays deferred. No runtime, collection, source, prompt, budget or paid-call changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- Verification results recorded below; no UI change requiring screenshots or handbook edits.
- Next: Nov 6 edition/World/cost/Bluesky comparison after 15:00 UTC; no deploys 13:00–16:00; X round after 21:00 UTC.
- Verification: pnpm format; pnpm lint:fix; pnpm check (555 unit/224 isolated integration tests passed); pnpm build; git diff --check.
