# Progress

## 2026-11-06: iteration 1062 — fill single-image Bluesky cards

- Advanced item 33/43 while Nov 7 X/Bluesky acceptance waits. Clean main; no leftovers; initial health/alerts clear and 36/36 sources healthy.
- Reader weakness: one Bluesky image occupied half a wide card because its grid always had two columns. Single-image posts now use the full row; multiple images retain two wide-screen columns and one mobile column.
- Saved World post currently has no media. Explicit synthetic one/two-image variants over saved data passed eight desktop/mobile light/dark cases; external requests blocked, GET-only, no paid calls or edition writes.
- Passed pnpm exec tsx scripts/smoke-reader-bluesky-grid.ts; four screenshots saved, desktop light inspected. Browser fixture initially used HTTP media rejected by contracts; corrected to intercepted HTTPS URLs and validated fixtures before navigation.
- First pnpm check stopped on formatting of the newly moved progress archive; formatted it and reran. Archived iterations 1044–1052 to keep this log small.
- No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Passed pnpm format, pnpm lint:fix, pnpm build, final pnpm check (536 unit/226 isolated integration, zero failures), scripts/smoke-bluesky-cards.ts and git diff --check; desktop light/mobile dark screenshots inspected.
- API/worker restarted; health DB/Redis OK, alerts clear, 36/36 sources healthy, digest queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- Next: continue final reader work; Nov 7 fixed-keyword X and reserved-slot Bluesky acceptance await the scheduled edition. Observability RAM target remains unmet.

## 2026-11-06: iteration 1063 — identify Bluesky videos in the reader

- Advanced STEERING 33/43 while X/Bluesky scheduled acceptance waits for Nov 7. Clean main; no leftovers; initial health and alerts clear.
- Reader benefit: video thumbnails looked like still images. Added a contrasting play cue over previews and a compact underlined original-post action; videos without thumbnails retain their text action.
- Passed pnpm exec tsx scripts/smoke-reader-bluesky-video.ts: synthetic video over saved edition, desktop/mobile light/dark, original URL/target, play cue and no overflow; four screenshots saved, mobile light/desktop dark inspected.
- Synthetic media was intercepted locally, external requests blocked and GET-only; no paid calls or edition writes. No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear; saved edition remains four topics/20 stories/17 posts.
- Next: continue final reader work; Nov 7 keyword X and reserved-slot Bluesky acceptance await publication. Observability RAM target remains unmet.

## 2026-11-06: iteration 1064 — keep failed video previews readable

- Advanced STEERING 33/43 while Nov 7 X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced against the previous build: failed Bluesky video thumbnails left an absolute play badge over the short fallback. The badge now belongs to the preview; unavailable previews keep a clear original-post action on its own line.
- Expanded scripts/smoke-reader-bluesky-video.ts to 12 loaded/failed/missing-preview cases, desktop/mobile light/dark; checks link targets, badge state, fallback spacing and overflow. Synthetic fixtures only; no paid calls or edition writes.
- Browser fixture initially used undefined for a nullable thumbnail; corrected to null. Screenshot inspection caught touching fallback/action text; made fallback block-level and added a spacing assertion. Final browser replay and existing image-grid replay passed; four failure screenshots saved, mobile light/desktop dark inspected.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, 36/36 sources healthy, digest queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: continue final reader work; Nov 7 keyword X and reserved-slot Bluesky acceptance await publication. Observability RAM target remains unmet.

## 2026-11-06: iteration 1065 — repair quoted source URLs in post text

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness: closing straight/curly quotation marks became part of cited URLs, sending readers to a different destination. Link parsing now leaves closing quotes in prose while preserving internal apostrophes, balanced parentheses and saved text.
- Expanded scripts/smoke-bluesky-cards.ts with quoted URL and internal-apostrophe cases; desktop/mobile light/dark passed, screenshots refreshed and mobile light inspected. Synthetic fixtures only; no paid calls or edition writes.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted after verification; /healthz DB/Redis OK and alerts clear. Sources 36/36 healthy; saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: continue final reader work; inspect first scheduled keyword X and reserved-slot Bluesky picks Nov 7. Observability RAM target remains unmet.

## 2026-11-07: iteration 1066 — fill small Bluesky image previews

- Advanced STEERING 33/43 while scheduled X/Bluesky acceptance awaits Nov 7 publication. Clean main, no leftovers; initial health and alerts clear.
- Reader weakness reproduced: media links filled the card but small thumbnails stayed at their intrinsic width. Images now fill the media column, retaining contain sizing and the 320 px height cap so portrait images stay fully visible.
- Expanded pnpm exec tsx scripts/smoke-reader-bluesky-grid.ts to 24 wide/small/portrait, single/multiple, desktop/mobile light/dark cases; all passed. Eight screenshots saved; small mobile light and portrait desktop dark inspected.
- pnpm exec tsx scripts/smoke-reader-bluesky-video.ts passed all 12 loaded/failed/missing-preview cases. Synthetic media over saved data, external requests blocked, GET-only; no paid calls or edition writes.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial pnpm check stopped on script formatting after lint:fix; corrected with Prettier. Final pnpm check: 536 unit/226 isolated integration passes; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, pnpm obs sources --check 36/36 healthy; digest-generation queue available, zero failed. Saved edition remains four topics/20 stories/17 posts.
- No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: continue final reader work; inspect first scheduled keyword X and reserved-slot Bluesky picks Nov 7. Observability RAM target remains unmet.

## 2026-11-07: iteration 1067 — recognize mixed-case source URL schemes

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced in synthetic replay: uppercase HTTPS source URLs became ordinary post-text links to the social original. Shared X/Bluesky text rendering now recognizes HTTP schemes case-insensitively, preserving case-sensitive paths/query values and saved prose.
- Expanded pnpm exec tsx scripts/smoke-bluesky-cards.ts with uppercase/mixed-case URLs; desktop/mobile light/dark passed, eight screenshots refreshed; mobile light inspected. Synthetic fixtures only, no paid calls or edition writes.
- pnpm exec tsx scripts/smoke-reader-x-media.ts passed loading/failure/retry, resize and theme recovery. Initial final API read overlapped service restart and failed; rerun passed. Unrelated X screenshot churn discarded.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial full check terminated with SIGTERM during integration, without assertion failure; reran via temporary systemd user unit to outlive command session.
- Final pnpm check passed: 536 unit/226 isolated integration tests; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, sources 36/36 healthy; pnpm obs jobs --check digest queue available/zero failed. Saved edition four topics/20 stories/17 posts.
- Corrected stale TASKS next-step note: keyword X and reserved Bluesky slot are enabled. No source/schema/system-flow changes; handbook, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Next: inspect first Nov 7 scheduled keyword X and reserved-slot Bluesky picks; continue approved reader work meanwhile. Observability RAM target remains unmet.

## 2026-11-07: iteration 1068 — recover Bluesky images after thumbnail failure

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness: a failed Bluesky thumbnail immediately hid the image despite a saved full-size URL. Image cards now try that original once before retaining the accessible unavailable-image link; identical URLs are not retried and video behavior stays intact.
- pnpm exec tsx scripts/smoke-reader-bluesky-image-recovery.ts passed 16 loaded/recovered/both-failed/same-URL cases across desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Synthetic media over saved edition, GET-only/external requests blocked; no paid calls or edition writes.
- pnpm exec tsx scripts/smoke-reader-bluesky-video.ts passed 12 loaded/failed/missing-preview cases. Discarded unrelated video screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Initial lint flagged a test DOM type assertion; corrected to a typed query selector before final verification.
- Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- Sources 36/36 healthy; digest queue available/zero failed. Saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: inspect first Nov 7 scheduled keyword X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1069 — keep Japanese punctuation out of post links

- Advanced STEERING 33/43 while scheduled Nov 7 X/Bluesky acceptance waits. Clean main, no leftovers; initial health/alerts clear.
- Reader weakness reproduced: Japanese closing quotes/full stops became part of saved-post source URLs. Shared X/Bluesky rendering now excludes sentence punctuation and unmatched full-width closers, retaining original text, Japanese paths and balanced URL brackets.
- pnpm exec tsx scripts/smoke-bluesky-cards.ts reproduced the missing clean Japanese link before the fix; final desktop/mobile light/dark replay passed six new Unicode cases plus existing links/media. Eight screenshots updated; mobile light inspected.
- Initial post-fix browser run overlapped the asset rebuild and could not load a card; rerun after build passed. pnpm exec tsx scripts/smoke-reader-x-media.ts passed loading/failure/retry/theme/resize checks; unrelated X screenshot churn discarded.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; /healthz DB/Redis OK, pnpm obs alerts clear, sources 36/36 healthy; digest-generation queue available/zero failed. Saved edition remains four topics/20 stories/17 posts.
- Synthetic browser data only; no paid calls or edition writes. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1070 — keep publisher links on the primary report

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; alerts clear, health DB/Redis OK, sources 36/36 healthy; digest queue zero failed.
- Reader weakness reproduced in browser: with two reports from one publisher, its source-row link opened secondary coverage instead of the headline article. Prefer the primary report for matching source labels; expanded coverage retains every article and its own destination.
- pnpm exec tsx scripts/smoke-reader-primary-source.ts failed against the old build with secondary/primary URL mismatch, then passed desktop/mobile light/dark after rebuilding. Four destination screenshots saved; mobile light inspected. Synthetic coverage over saved edition, GET-only/external requests blocked.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed saved-content/navigation/coverage checks in all four layouts after updating its stale whole-post X link selector for the linked-text cards. Discarded unrelated layout screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build and git diff --check. Full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- systemctl --user restart news-digest-api news-digest-worker completed; curl --retry /healthz DB/Redis OK after startup; pnpm exec tsx scripts/obs.ts alerts clear and sources 36/36 healthy.
- No paid calls or edition writes. Saved edition four topics/20 stories/17 posts. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- Next: review first Nov 7 scheduled keyword-X and reserved-slot Bluesky picks, costs and Tech repetition. Observability RAM target remains unmet.

## 2026-11-07: iteration 1071 — read full post context on mobile

- Advanced STEERING 33/43 while Nov 7 scheduled X/Bluesky acceptance waits. Clean main, no leftovers; health/alerts clear and sources 36/36 healthy.
- Reader weakness: compact post context exposed its full text only on hover, leaving touch readers unable to read truncated notes. Native disclosures now expand/collapse by touch, Enter or Space while retaining one-line collapsed notes and duplicate-text suppression.
- pnpm exec tsx scripts/smoke-reader-post-context.ts passed touch/keyboard/collapse/wrapping checks in desktop/mobile light/dark. Four screenshots saved; mobile light inspected. Synthetic context over a saved edition, GET-only/external traffic blocked.
- Initial targeted smoke caught missing truncation; corrected the layout. Screenshot inspection caught bottom-aligned disclosure marker; replaced it with a top-aligned chevron. Final targeted replay passed.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed all four layouts, contents/deep links/coverage/overflow. Initial run overlapped rebuilding and timed out on navigation; rerun after the final build passed. Discarded unrelated screenshot churn.
- Passed pnpm format, pnpm lint:fix, pnpm build, git diff --check and full pnpm check: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- API/worker restarted; curl --retry /healthz DB/Redis OK after startup; pnpm obs alerts clear, sources 36/36 healthy, digest queue zero failed. Saved edition four topics/20 stories/17 posts.
- No paid calls or edition writes. No source/schema/system-flow changes; SOURCES unchanged.
- Initial push rejected: concurrent lead status-doc commit 7cb32a12 on origin/main. Merged without rewriting history; no application overlap.
- Second push rejected by concurrent owner steering 69445946; preserved item 45 and completed its step 1: ~800 MiB RAM target documented in decision/handbook, resolved human request removed, limits unchanged; check-handbook passed.
- Next: item 45 real-edition/spec gap checklist, close item 33, then B2 backups; scheduled X/Bluesky acceptance still awaits publication.

## 2026-11-07: iteration 1072 — freeze the real-reader acceptance list

- Clean main, no leftover work. Followed item 45 step 2 while Nov 7 scheduled X/Bluesky checks wait until publication; no paid calls or edition writes.
- Compared real saved Nov 6 edition `1c83e78b-47f9-4a6f-bfb4-93820a691aea` (four topics/20 stories/17 posts) with ui-spec and item 33 Done when; TASKS now has one remaining list, not open-ended reader polishing.
- One-off read-only Playwright measurement at 1440×1100 with external requests blocked: topic heights Tech/NBA/Gaming/World 2832/2719/2517/1974 px (2.57/2.47/2.29/1.79 screens). External embeds enabled and topics scrolled: 2832/3873/3690/2237 px (2.57/3.52/3.35/2.03), eight frames present. Partial lazy loading is sufficient to demonstrate NBA/Gaming exceed the target; don't use blocked-embed measurements for acceptance.
- Remaining list: reduce real loaded-embed length, refresh every route's four screenshots, complete forbidden-label scan coverage. Existing reader/archive scans cover subsets; a raw scan matched “independent” only inside saved content, which the spec exempts. No new product feature or synthetic-only gap.
- pnpm exec tsx scripts/smoke-reader-layout.ts and scripts/smoke-reader-archive.ts passed desktop/mobile light/dark, saved-content/navigation/coverage/overflow and archive recovery. Refreshed eight reader/archive route screenshots; inspected desktop/mobile reader. Discarded 26 incidental detail screenshot refreshes.
- pnpm exec tsx scripts/smoke-admin-gate.ts passed 24 protected GET/HEAD paths, identity/cache/forwarded-token checks; saved edition unchanged. Pre-public proxy header replacement proof still required, private rollout unchanged.
- pnpm build passed (existing chunk-size warning). API/worker restarted; curl --retry /healthz DB/Redis OK, pnpm obs alerts clear, sources --check 36/36 healthy, digest-generation queue available/zero failed/next run 15:00 UTC.
- Archived older PROGRESS entries above 25 KB. No source/schema/system-flow changes; SOURCES, NEEDS_FROM_HUMAN and handbook unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green.
- Next: finish only the three acceptance items, close item 33, then begin approved B2 backups. Scheduled keyword-X/reserved-Bluesky acceptance still waits for Nov 7 publication.

## 2026-11-07: iteration 1073 — complete reader forbidden-label coverage

- Clean main, no leftover work; alerts clear, /healthz DB/Redis OK and sources 36/36 healthy. Scheduled Nov 7 acceptance still awaits publication.
- Added scripts/smoke-reader-labels.ts for the actual saved latest edition, archive and a distinct past edition, desktop/mobile light/dark, plus mobile contents sheets. Scans text and accessible labels while exempting editorial text, including coverage headlines; surrounding controls remain scanned.
- pnpm exec tsx scripts/smoke-reader-labels.ts passed all routes/layouts; injected AI-edited label rejection control passed. First attempt exposed a CJS top-level-await incompatibility; corrected. Initial scan caught saved Claude coverage headline, correctly exempted under the spec.
- pnpm exec tsx scripts/smoke-admin-gate.ts passed 24 protected GET/HEAD paths, identity/cache and forwarded-token checks; saved edition unchanged. Proxy header replacement proof remains required before public access.
- pnpm build passed with existing chunk warning. No UI/source/schema/system-flow changes, paid calls or edition writes; screenshots, SOURCES and handbook unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green. API/worker restarted; health DB/Redis OK and alerts clear; final reader scan passed against rebuilt app.
- Remaining item 33 work: loaded-embed NBA/Gaming page length and all-route screenshot refresh, then close and begin B2.

## 2026-11-07: iteration 1074 — refresh every spec route screenshot

- Clean main, no leftover work; alerts clear, /healthz DB/Redis OK, sources 36/36 healthy. Nov 7 keyword/Bluesky acceptance still awaits publication.
- Added read-only scripts/capture-spec-routes.ts: 14 routes × desktop/mobile × light/dark = 56 saved-production-data screenshots; indexed in docs/screenshots/ui/spec-routes.md. Includes latest/archive/past edition, not-found and all ten admin routes.
- Capture passed all four layouts: zero writes, browser errors or horizontal overflow; admin token stays in the existing server-side local bridge. External requests blocked; these fallback-card screenshots are not loaded-embed length evidence.
- Inspected overview desktop light, topic editor desktop dark, not-found mobile light and new-edition mobile dark. No product/source/schema/system-flow changes; SOURCES and handbook unchanged.
- Initial capture needed the admin header selector corrected; next attempt overlapped rebuild and hit an admin 404. Restarted services, reran against stable build; all 56 captures passed.
- pnpm build passed with existing chunk warning; pnpm exec tsx scripts/smoke-reader-labels.ts and scripts/smoke-admin-gate.ts passed; saved edition unchanged. Proxy header replacement proof remains required before public access.
- Initial concurrent lint:fix/check processes ended with signal 143 during lint, no diagnostic; sequential pnpm lint:fix and full pnpm check passed: 536 unit/226 isolated integration tests, zero failures; typecheck/lint/format/boundaries green. pnpm format and git diff --check passed.
- Next: reduce real loaded-embed NBA/Gaming desktop length, measure all topics, close item 33, then start B2. No paid calls or edition writes.
