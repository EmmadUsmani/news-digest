# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

## 2026-11-07: iteration 1075 — close reader rebuild with bounded desktop posts

- Clean main, no leftover work; health DB/Redis OK, alerts clear, sources 36/36 healthy. Nov 7 scheduled acceptance still awaits publication.
- Fully loaded baseline exceeded the earlier partial-load estimate: Tech/NBA/Gaming 5436/4863/5482 px. Bounded desktop posts to a keyboard-accessible 1400 px scroll area; every saved card and full-width official embed remains available. Mobile keeps continuous page flow.
- pnpm exec tsx scripts/smoke-reader-length.ts passed light/dark with all 16 X frames and 17 saved posts: Tech/NBA/Gaming/World 2849/2849/2877/2237 px (2.03–2.62 screens). End-key scrolling, later-card access, no horizontal overflow and unbounded mobile posts passed. Repeated after correcting screenshot positioning.
- pnpm exec tsx scripts/smoke-reader-layout.ts passed four device/theme views, saved content, navigation and coverage; width assertion accounts for the reserved scrollbar gutter. Discarded incidental detail-image refreshes; kept four reader overview captures.
- pnpm exec tsx scripts/capture-spec-routes.ts refreshed 56 route captures; no browser writes/errors/overflow. Added eight loaded-post screenshots and inspected NBA light/Gaming dark. Index links both sets.
- pnpm exec tsx scripts/smoke-reader-labels.ts and scripts/smoke-admin-gate.ts passed; saved edition unchanged (20 stories/17 posts). Public proxy identity proof remains required before public access.
- Updated affected handbook page; pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime passed (18 pages/28 tables, no metadata warnings). No diagram/source/schema changes or paid calls.
- Item 33 closed with linked screenshots and results; removed its completed Current order line. Item 37 B2 backups is next while X/Bluesky publication checks wait; reviewed its encryption, retention and 3 GB limits.
- pnpm build passed (existing chunk warning); API/worker restarted. pnpm format, pnpm lint:fix and git diff --check passed. First full check ended with signal 143 during integration without a diagnostic; sequential pnpm check rerun passed 536 unit/226 isolated integration tests, typecheck/lint/format/boundaries green.
- pnpm obs services --check reports 13/13 healthy; pnpm obs jobs --check passes, digest-generation available/one worker/zero failed. Health and alerts remain clear. No source changes, edition writes or new blocker.

## 2026-11-07: iteration 1076 — first encrypted off-VM B2 backups

- Owner value: losing this VM no longer loses the database, secrets or recovery state. Clean main/no leftover work; /healthz DB/Redis OK, alerts clear, sources healthy and digest queue available. Nov 7 X/Bluesky acceptance still awaits publication.
- Read documented exe.dev VM backup support: AWS-federated disk export does not fit the approved B2 setup; implemented the approved recovery bundle. Installed official age v1.3.2 under ~/.local/bin after verifying its published GitHub asset SHA256; no private key on VM.
- Added SDK-free S3 SigV4/curl adapter (signed headers over stdin), encrypted database/VM uploads, download-SHA256 proof, permanent-version pruning, tiered retention, all-version bucket accounting and single 3,000,000,000-byte cap. Budget refusals preserve newest copies and local backups. Last-30-day upload sizes feed a conservative 60-day growth projection.
- Live database 6,734,672 bytes and VM 345,943 bytes uploaded/download-verified. Encrypted deletion proofs passed through curl; admission also permanently pruned the superseded same-day database version and preserved the newest copies. Fresh listings confirmed disappearance. Ran bash ops/backups/install.sh and systemctl --user start news-digest-backup.service: fresh 28-table local dump plus 8,020,058-byte encrypted upload succeeded. Existing timer now uploads nightly and bundles weekly; no new service.
- Bucket 8,366,001/3,000,000,000 bytes (0.279%); $0.000058/month before shared free allowance, expected $0 within it. VM bundle excludes local dump history, logs, metrics, caches and symlinks. Added Mac download/decrypt/pg_restore-list commands and rebuild guide; Operations records size/budget/cost.
- python3 ops/backups/test_database.py (4) and test_offsite.py (9) passed: under/over/still-over budgets, retention tiers, newest/foreign protection, deletion confirmation, checksum rejection, bundle contents, 30-day projection and signed-header isolation. Added offsite suite to pnpm check. systemd-analyze --user verify passed.
- Prepared stale-database/VM, failed-upload and storage/projection alerts; /opt/news-digest-observability/vmalert-tool-prod unittest -files=ops/observability/alerts.test.yml passed including threshold crossings. Metrics are live; active rules file is root-owned. STEERING 37 explicitly requires stopping at root: no root action attempted; exact owner deployment commands in NEEDS_FROM_HUMAN.md. Item 37 remains open for active-rule verification; partial ack only.
- pnpm build passed (existing chunk warning); pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. Nine offsite checks and real curl listing/download/PUT/DELETE proofs passed after transport verification. Handbook checks passed (18 pages/28 tables, no metadata warnings); no diagrams changed. Archived progress 1062–1069 and shortened task history.
- API/worker restarted after build; /healthz DB/Redis OK after readiness, 13/13 services healthy, alerts clear and saved edition API returns real topics. No app LLM/X spend, source/schema changes or edition writes. Next: owner activates B2 rules, then verify/close 37; while waiting follow item 42 and scheduled Nov 7 acceptance.

## 2026-11-07: iteration 1077 — complete Nov 6 production X daily reporting

- Owner value: the daily report now shows what paid production discovery contributed to the saved edition, separately from experiment success. Clean main/no leftovers; no breakage to fix.
- /healthz DB/Redis OK, 13/13 services healthy, 36/36 sources healthy, alerts clear; digest queue available/one worker/zero failed. Nov 7 scheduled run remains due at 15:00 UTC.
- Read all four saved topics: Tech post repetition and thin summaries remain the largest weaknesses, with deployed social/story editor fixes already awaiting publication. No new prompt, reader edge-case fix or speculative feature added.
- STEERING 39/34 three-edition acceptance and 40/41 reserved-slot checks await Nov 7 publication; 33 is closed. Checked the actual root-owned alert file: B2 rules remain absent, so 37 still awaits the recorded owner root action. No root operation attempted.
- Advanced open STEERING 9/15 reporting: Nov 6 World $0.031195/3 new verified outside-list posts, Gaming $0.037663/5, NBA $0.051274/5, Tech $0.037343/4. Total $0.157475/19 fetched/17 new verified outside-list, zero holds/profiles. NBA open search returned zero before its reaction search supplied five.
- Three cited posts appear in the saved edition (Gaming two/NBA one); no causal or viral-quality claim. Nov 2–6 production cost totals $0.610551. Current verification/list membership caveats retained; no experiment costs mixed in.
- Read-only pnpm exec tsx scripts/report-x-discovery.ts 2026-11-06 and scripts/report-x-week.ts 2026-11-06 passed; independent Python assertions verified daily/weekly costs, fetches, new/outside-list yields, picks and zero holds. Updated SOURCES, TASKS and steering ack; removed stale next-step instruction to rebuild the already-closed reader.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 537 unit/226 isolated integration tests; typecheck/lint/format/boundaries green. pnpm build passed with existing bundle/annotation warnings. No UI, schema, source collection or system-flow changes; no screenshots or handbook changes needed.
- API/worker restarted; readiness retry then /healthz DB/Redis OK, 13/13 services healthy, alerts clear. Latest real edition unchanged: four topics/20 stories/17 posts. No provider spend or edition writes. Next: Nov 7 15:00 scheduled keyword/Bluesky acceptance; owner activates B2 alert rules, then verify/close 37.
- Initial push rejected (remote advanced to owner lead-doc commit 0fb1319a). Fetched and merged without rewriting history; remote changes touch only owner lead notes, which were preserved without agent edits. No code conflict or new runtime change.

## 2026-11-07: iteration 1078 — close B2 alerts; locate Nov 6 edition tail

- Owner value: off-VM backups now have active failure/staleness/storage alerts; the last backup blocker is closed. Clean main/no leftovers. /healthz DB/Redis OK, 13/13 services healthy, 36/36 sources healthy, alerts clear and digest queue available/zero failed digest jobs.
- Owner activated obs-alerts at 01:45:44 UTC during this iteration. Read-only GET http://127.0.0.1:8880/api/v1/rules verifies all four Offsite rules healthy/inactive with successful evaluations; cmp confirms exact active/repository rules match. No agent root operation.
- /opt/news-digest-observability/vmalert-tool-prod unittest -files=ops/observability/alerts.test.yml passes threshold cases. pnpm obs metric news_digest_offsite_bucket_bytes returns 8,366,001/3,000,000,000 bytes (0.279%). Closed STEERING 37, removed its completed Current order line, cleared owner-action request and updated backup handbook. Handbook check: 18 pages/28 tables, no warnings; no diagrams changed.
- STEERING 39/34/40/41 await Nov 7 15:00 publication; 33 is closed. Biggest saved reader weakness remains Tech launch repetition, with social editor v6 already deployed. No additional prompt/selection changes stacked before that evidence.
- Advanced open speed task: exported 57 allowlisted Nov 6 timeline events and 37 usage records; pnpm exec tsx apps/api/scripts/evaluate-edition-timeline.ts and evaluate-call-tokens.ts with the new dated fixtures pass. Independent Python assertions verify identity, field allowlists, usage, HTTP sum and elapsed interval. No prompts/responses/fingerprints/headers/secrets retained.
- New cause: final 14.141 s belongs to Tech X initial editing and unsupported-absence rationale repair, not Bluesky. Validation event explicitly supplies Tech identity/category; repair HTTP time 9.725 s. Total HTTP work 490.055 s, four-slot lower bound 122.514 s; speed target still unmet. Early cached Bluesky scoring cannot remove this observed tail, so no speculative scheduler change. Comparison documented in existing social-latency review.
- pnpm build passes with existing bundle/annotation warnings. API/worker restarted; /healthz DB/Redis OK, 13/13 services healthy and saved-edition list returns real entries. No UI/schema/source changes, provider spend or edition writes.
- Concurrent owner commit bb152fab introduces item 46: remove desktop inner scrolling, permit up to 3.6 screens, refresh checks/screenshots. Read the new instructions; B2 step 4 is complete. Added remaining UI work to TASKS as the next available step.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. No source/schema/reader rendering changes in this step; next is item 46 continuous desktop page flow, then scheduled acceptance.

## 2026-11-07: iteration 1079 — remove desktop posts scroll box

- Clean main/no leftovers. Alerts clear, /healthz DB/Redis OK, 13/13 services and 36/36 sources healthy; queue check passes. Scheduled Nov 7 keyword/Bluesky acceptance still awaits 15:00 UTC.
- Removed desktop max-height, overflow/overscroll/gutter, focus styling, tabIndex and scroll-area region/label. All posts now flow in the page; no post text/count/media changes.
- Updated both smoke scripts for no inner scrolling and every post reachable through page scrolling. Layout check covers desktop/mobile light/dark; existing row geometry now permits negative viewport coordinates after page scrolling.
- pnpm exec tsx scripts/smoke-reader-layout.ts passes all four views, saved coverage/navigation/no-overflow/no-writes checks. Restored incidental timestamp-only reader screenshots; refreshed the eight requested loaded views and visually inspected light Tech/dark Gaming.
- pnpm exec tsx scripts/smoke-reader-length.ts verifies all 17 posts/16 official X frames and continuous flow in both themes, then FAILS the required 3.6-screen assertion. Heights identical in light/dark: Tech 5435.94 px/4.94 screens, NBA 4862.94/4.42, Gaming 5481.94/4.98, World 2236.56/2.03.
- Earlier 3.52/3.35 figures used partial lazy loading (1069 evidence). Prescribed removal alone cannot meet 3.6 with all embeds loaded. Kept the threshold enforced; no shortening/hiding/capping/bounding workaround. Partial ack and acceptance conflict in NEEDS_FROM_HUMAN; item 33 remains closed.
- Updated runtime handbook and screenshot index. pnpm exec tsx scripts/check-handbook.ts 01-stack-and-runtime passes: 18 pages/28 tables, no warnings; no diagram changes.
- pnpm format and pnpm lint:fix pass; git diff --check clean. Initial full check interrupted (exit 143 during integration); rerun pnpm check passed: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. pnpm build passed with existing bundle warnings.
- API/worker restarted after build; health/alerts/services/sources remain healthy and latest real edition retains four topics/20 stories/17 posts. No LLM/X spend, source/schema changes or edition writes. Next: owner length decision; item 42 while waiting, scheduled Nov 7 keyword/Bluesky acceptance at 15:00 UTC.

## 2026-11-07: iteration 1080 — separate saved X source links from prose

- Clean main/no leftovers. Alerts clear, /healthz DB/Redis OK, services/sources healthy; scheduled digest queued for 15:00 UTC, zero failed digest jobs. Hourly Bluesky/free-link collection completed; historical failed ingestion/social jobs have subsequent successful runs.
- Item 42 reader pass: Tech launch repetition remains the largest content weakness; deployed selection fix awaits scheduled evidence. Next actionable weakness: The SI Maximalist/Jason Wang Tech posts and PocketGamer.biz Gaming post join t.co URLs directly to preceding prose.
- Inline source links now receive visual spacing when the preceding text ends in a letter, number or sentence punctuation. Saved text, destinations, parentheses, screening/editor evidence and immutable editions remain unchanged. No provider calls or writes.
- Extended existing GET-only saved-edition Playwright replay to assert spacing, exact text/destinations, focus and no overflow on desktop/mobile light/dark. New assertion fails against the previous build (zero margin), then passes after rebuild. Refreshed four reader-x-links screenshots; inspected desktop/mobile output.
- pnpm format, pnpm lint:fix, git diff --check, full pnpm check and pnpm build passed; 537 unit/226 isolated integration tests. API/worker restarted; health, services, sources and alerts clear. No handbook/system-flow/schema/source changes.
- Corrected TASKS' stale completed marker claiming desktop inner scrolling. Item 46 full-embed length conflict still awaits owner decision; next production acceptance is Nov 7 15:00 UTC for keyword X/Bluesky. No new prompt changes stacked.

## 2026-11-07: iteration 1081 — show multi-outlet article counts

- Clean main/no leftovers. pnpm obs alerts, health/services/sources --check pass: DB/Redis OK, 13 services and 36 sources healthy. Digest queue available, zero failed jobs; Nov 7 scheduled run remains due at 15:00 UTC.
- Advanced item 42 while 39/34/40 await production evidence: read all four saved topics. Tech repetition and headline-only prose already have deployed fixes awaiting publication; no additional prompt changes stacked.
- Reader weakness: Gaming's ten-report Unity story showed only “+8 outlets” before expansion. Multi-outlet disclosures now include the article count, so coverage depth is visible without opening the report list.
- pnpm exec tsx scripts/smoke-reader-coverage-count.ts failed against the prior build (“+8 outlets”), then passed after pnpm build and after service restart: real saved coverage, all ten report destinations retained, desktop/mobile light/dark, no overflow/page errors/writes. Four screenshots saved; mobile light/desktop dark inspected.
- Archived iterations 1070–1074 to keep PROGRESS small. No source/schema/system-flow changes, provider calls or saved-edition writes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check pass: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. Initial check stopped on new archive formatting; corrected and full rerun passed. pnpm build passes with existing bundle warnings; API/worker restarted and health/services/alerts clear.
- Next: Nov 7 15:00 keyword-X/Bluesky acceptance; item 46 full-embed length remains blocked on owner constraints. No new feature or paid experiment work.

## 2026-11-07: iteration 1082 — require substantial news from routine social updates

- Clean main/no leftovers. Alerts clear; health DB/Redis OK, 13 services/36 sources healthy. Digest queue zero failed jobs; Nov 7 keyword/Bluesky production acceptance still due at 15:00 UTC. Historical ingestion/social failures remain with healthy subsequent collection.
- Followed item 42 while 39/34/40 await scheduled evidence; item 33 stays closed. Read all four saved topics: Tech repetition/headline prose have deployed fixes pending publication. NBA weakness: routine Jazz OUT list and Davis questionable-status update occupy two of five post slots.
- Owner-visible goal: reserve limited NBA post slots for substantial developments. Social editor v7 requires routine availability/status/minor transactions to establish substantial news in supplied text; serious new injuries, consequential trades and exceptional performances remain eligible. No name-based significance or unseen-media inference.
- Extended existing primary/capped-fallback prompt contracts; pnpm exec tsx --test apps/api/test/social-editor.test.ts passes 14 tests. These verify transport/instructions, not model selection quality; compare next scheduled NBA picks. No paid replay, new source fetch, score/cap change or edition write.
- Updated saved-edition review, TASKS and item-42 ack. No UI/schema/system-flow/source changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged. Item 46 full-embed length remains blocked on owner constraints.
- pnpm format, pnpm lint:fix, git diff --check, full pnpm check and pnpm build pass: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. Existing bundle warnings only.
- API/worker restarted outside protected window. Initial immediate health probe raced startup; follow-up passes, both units active, alerts clear and 13 services/36 sources healthy. Same saved edition retains four topics/20 stories/17 posts. No provider spend.
- Next: Nov 7 15:00 keyword-X/Bluesky acceptance and NBA selection review; no paid experiment reruns or additional tuning before evidence.

## 2026-11-07: iteration 1083 — expose saved production social acceptance evidence

- Clean main/no leftovers. pnpm obs alerts clear; health DB/Redis OK, services/sources --check passed. Scheduled report confirms zero failed digest jobs and next run Nov 7 15:00 UTC.
- Advanced items 39/34/40: existing scheduled report omitted saved Bluesky slot outcomes and X reported engagement/ranking, preventing direct review of the upcoming keyword/reserved-slot acceptance. Added immutable fields and external IDs; missing historical evidence stays null, unknown counts stay distinct from zero. No collection, inference or writes.
- Read all four saved topics; Tech repetition/headline-only prose and NBA routine availability have deployed fixes awaiting publication. No additional editorial tuning. Item 46 length conflict still awaits owner decision; item 33 remains closed.
- pnpm exec tsx --test apps/api/test/scheduled-timing-report.test.ts: 8 pass, including conflicting reported/observed counts preserved separately. Live report --scheduled-only --limit 1 reproduces Nov 6 no-slot outcomes for Tech/NBA/Gaming, World one pick/one unsupported drop and $0.286904 total cost; historical data is not post-activation acceptance.
- Updated operations handbook command description; pnpm exec tsx scripts/check-handbook.ts 08-operations passes. No diagrams, schema or source changes; SOURCES/NEEDS_FROM_HUMAN unchanged.
- pnpm format, pnpm lint:fix, git diff --check and full pnpm check passed: 537 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. pnpm build passed with existing bundle warnings. API/worker restarted; health, all 13 services/36 sources and alerts clear. No provider spend or edition writes.
- Next: Nov 7 15:00 scheduled keyword-X/Bluesky acceptance using the expanded report; review first three reserved-slot editions, NBA selection and Tech diversity/prose.

## 2026-11-07: iteration 1084 — reserve NBA story slots for substantial developments

- Clean main/no leftovers. Alerts clear, health DB/Redis OK, services/sources --check pass. Read-only scheduled report: zero failed digest jobs, next run Nov 7 15:00 UTC, Nov 6 cost $0.286904 with zero holds.
- Followed item 42 while 39/34/40 await scheduled evidence; read all four saved topics. NBA's routine Bronny G League assignment occupies one of five story slots without a substantial consequence in its saved summary. The 1082 social-editor change does not reach stories.
- Article editor v13 requires substantial supplied news for routine roster/availability updates; familiarity/freshness/outlet alone do not establish importance. Serious injuries, consequential trades and exceptional performances remain eligible; unused slots allowed. No grouping rules or player-name filters.
- pnpm exec tsx --test apps/api/test/editor.test.ts: 20 pass, including both-model guidance and empty-budget acceptance. Initial combined direct golden invocation hit its isolated-environment guard (four failures, no DB access); golden verification belongs to the full isolated suite. No paid replay, new source fetch or edition write; model selection quality awaits publication.
- Updated TASKS, item-42 ack and saved-edition review. No UI/schema/source/system-flow changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged. Item 46 length conflict remains owner-blocked; item 33 stays closed.
- First full pnpm check passed 538 unit tests but caught a stale synthetic publication fingerprint in integration. Verified the old request hash before updating only its editor fingerprint for v13; authored response/golden content unchanged, no re-recording or provider calls. pnpm test:integration rerun passes all 226 tests.
- pnpm format, pnpm lint:fix, typecheck/lint/format/boundaries and git diff --check pass; pnpm build passes with existing bundle warning. API/worker restarted; startup health retry passes DB/Redis, 13 services healthy and alerts clear. Same saved four topics/20 stories/17 posts retained.
- Next: Nov 7 15:00 keyword-X/Bluesky acceptance, NBA story/post significance and Tech diversity review. No experiment reruns.

## 2026-11-07: iteration 1089 — close the owner-approved reader length trial

- Clean main at owner steering commit 0ad78f68 No leftovers; followed new item 47 step 1 before rehearsals. No generation/editor changes.
- pnpm obs alerts clear; /healthz DB/Redis OK, services --check 13 healthy and sources --check 36 healthy. Read-only scheduled report: zero failed jobs; latest Nov 6 completed, next Nov 7 15:00 UTC.
- Updated length smoke to 5.2 screens at 1440×1100 and UI spec; removed resolved owner blocker, closed item 46 and its Current order line, queued item 47 rehearsals in TASKS.
- pnpm exec tsx scripts/smoke-reader-length.ts passes both themes with all 17 posts/16 X embeds: Tech/NBA/Gaming/World 4.94/4.42/4.98/2.03 screens; every post page-reachable without an inner scrollbar. Refreshed eight loaded screenshots and reviewed Gaming light visually.
- pnpm exec tsx scripts/smoke-reader-layout.ts initially found stale outlet-only assertion from 1081; corrected it to include article count. Rerun passes all four device/theme views; refreshed layout screenshots. No content shortened/hidden/capped.
- pnpm format, pnpm lint:fix and pnpm build pass (existing bundle warning only); full pnpm check passes: 538 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. No schema/source/system-flow changes, provider spend or edition writes; handbook/SOURCES unchanged.
- systemctl --user restart news-digest-api.service news-digest-worker.service completed outside protected window; curl /healthz passes DB/Redis, pnpm obs alerts clear and services --check all 13 healthy. Disk 66%; no rehearsal files/containers created.
- Next: item 47 exactly four isolated failure rehearsals, then scratch backup rebuild and M6/M7 scope settlement. Nov 7 production review takes priority once published; no paid experiments or editor changes before it.
