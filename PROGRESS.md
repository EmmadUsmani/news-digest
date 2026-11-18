# Progress

[Iterations 2768–2777](docs/progress-archive/2026-11-18-iterations-2768-2777.md).

## 2026-11-18: iteration 2778 — compare U.S. posts against selected stories

- Clean main at 355bc2f1; no inherited work. Alerts/health/14 monitored services/38 monitored sources healthy; Destructoid remains paused.
- Reader value: the saved Peltola Bluesky post repeats the selected election story, spending a slot on news the reader just saw.
- Cause: selected-story comparison was restricted to Tech/NBA. U.S. now receives the same bounded titles/summaries in initial X and later Bluesky selection, using existing originality guidance.
- Saved Peltola overlap and distinct congressional stock-trading post retained. Both platform purposes/model routes pass offline context transport and validated cache reuse; hand-authored selection is not model compliance.
- Provider/models/caps/call count unchanged; no paid calls or published-edition mutation. Updated TASKS, ranking evidence and affected handbook page. No UI change.
- Verification: targeted social/context tests 26/26; pnpm format, pnpm lint:fix, pnpm check (1,129 unit/330 integration passes, four expected skips), pnpm build and scoped handbook check pass. Logs /tmp/2778-*.log.
- Rebuilt API/worker/docs restarted active. First immediate health probe raced startup; retry health/alerts and /healthz pass. Saved reader unchanged: cd357e84, five topics/25 stories/19 posts/five content groups.
- Next scheduled daily review checks U.S. story/post repetition alongside NBA/Tech/World acceptance; no extra daily review commit or recovery backfill.

## 2026-11-18: iteration 2779 — distinguish NBA injury announcements

- Clean main at 253fef93; no inherited work. Alerts/health/38 monitored sources healthy; Destructoid remains paused.
- Owner value: coverage counts should collect the same announcement without merging unrelated player injuries or using extra links as proof of independent reporting.
- Reviewed ten saved Nov 18 reports: Brown/Philadelphia hamstring (four) and McCollum/Atlanta calf (six). All 45 pairs labeled: 21 same-event, 24 separate-event; exact candidates retained in an offline fixture.
- Published membership passes 34 sampled orders; merge-all fails 24 labels, all-separate misses 21. Agent annotations only; independent labels/semantic evaluation remain open. No grouping rule, prompt, budget, provider or published-edition change.
- Updated TASKS/RANKING and scoped evidence note; no UI changes, publisher requests, paid calls or production writes.
- Verification: targeted grouping evaluation tests 20/20; pnpm exec tsx /tmp/2779-live.ts matches both live groups and all ten IDs/URLs/titles to the fixture.
- pnpm format, pnpm lint:fix, pnpm check and pnpm build pass: 1,130 unit/330 integration tests, four expected skips. Logs /tmp/2779-{format,lint,check,build}.log.
- Rebuilt API/worker/docs restarted active; post-restart health, alerts and /healthz pass; saved reader unchanged. Next: scheduled NBA editing and U.S./Tech/World acceptance; independent grouping labels/semantic evaluation still open. No paid calls.

## 2026-11-18: iteration 2780 — compare every topic’s social picks with selected stories

- Clean main at 8e670ae2; no inherited work. Initial alerts/health/38 monitored sources healthy; Destructoid remains paused.
- Reader weakness: Gaming repeats WoW’s 15-year weekly-player milestone in both a selected story and Holly Longdale’s X post, consuming another slot with the same news.
- Removed the topic whitelist from bounded selected-story context. Gaming, World and future topics now receive the existing comparison in both initial X and later Bluesky selection; guidance and story-evidence boundaries unchanged.
- Exact saved Gaming milestone story/post and distinct CONTROL Resonant nomination retained. Both offline model/platform routes verify context transport and cache reuse; hand-authored outputs do not establish semantic compliance. Scheduled acceptance remains open.
- No prompt, model/provider, cap or published-edition change; no UI change, publisher requests or paid calls. Updated TASKS/RANKING and affected handbook page.
- Verification: targeted tests 27/27; pnpm format, pnpm lint:fix, pnpm check (1,131 unit/330 integration passes, four expected skips), pnpm build and scoped handbook check pass. Logs /tmp/2780-{format,lint,check,build,handbook}.log.
- Rebuilt API/worker/docs restarted active. Immediate health probe raced startup; retry health/alerts and /healthz pass. Exact live fixture reread passes; saved edition remains cd357e84, five topics/25 stories/19 posts.
- Next: one scheduled daily review checks NBA editing and Tech/World/U.S./Gaming selection acceptance; independent grouping evaluation remains open. No further prompt stacking or per-publisher recovery.

## 2026-11-18: iteration 2781 — expose X account identities

- Clean main at 70bb3506; no inherited work. Initial alerts/health clear; 14 monitored services and 38 monitored sources healthy; Destructoid remains paused.
- Reader weakness: the saved Gaming announcement displays “PlayStation Support US” while concealing its embed-author handle @PS_Support_US. Readers cannot distinguish an account from its chosen display name without leaving the edition.
- X bylines now show the saved embed’s handle beside its display name, linking both to the same profile; identical names/handles appear once. Wrapping preserves narrow layouts. No account-authenticity claim or new exclusion.
- Saved DB identity and direct official oEmbed author fields agree. Initial generic i/status oEmbed returned an empty body; author-specific URL returned valid JSON. No paid calls, source changes, generation changes or edition mutation.
- Playwright /tmp/2781-browser.cjs: all 11 saved X bylines/profile destinations, keyboard focus, zero page errors/overflow at 320/390/1440px in light/dark pass. X widget requests deliberately blocked to exercise saved-card fallback; this is not a live widget outage.
- Inspected and saved mobile-light/desktop-dark screenshots under docs/screenshots/x-account-identity-*.png. Updated affected social handbook page and TASKS; no diagram change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,131 unit/330 integration passes, four expected skips), pnpm build and scoped handbook check pass. Logs /tmp/2781-*.log.
- Rebuilt API/worker/docs restarted active; post-restart health, alerts and /healthz pass. Exact saved Gaming fixture reread passes; edition unchanged, five topics/25 stories/19 posts.
- Next: scheduled NBA editing and Tech/World/U.S./Gaming selection acceptance. Account @PS_Support_US authenticity remains unestablished; do not label it official or spoofed from its name alone.

## 2026-11-18: iteration 2782 — complete fallback excerpt endings

- Clean main at 4d9d2b50; no inherited work. Initial alerts/health clear; monitored sources healthy, Destructoid paused; disk 70%.
- Owner value: NBA fallback ended in dangling “AP…” and “during Sunday’s…”; readers now get complete trailing sentences where substantial reporting remains.
- Reader-only projection uses sentence boundaries for ellipsis-marked source excerpts, retaining at least half the saved text and the omission marker. Long single sentences remain unchanged; AI summaries and stored evidence untouched.
- Exact saved Warriors/Hawks excerpts retained in an offline fixture. Warriors photo-caption prose remains; this does not fix NBA AI editing or claim caption cleanup. Scheduled NBA acceptance remains pending.
- Updated affected handbook page, TASKS and item 42 ack; no provider, prompt, budget, source or edition mutation; no paid calls.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,132 unit/330 integration passes, four expected skips), pnpm build and scoped check-handbook.ts pass. Handbook initially exceeded 100 lines by one; shortened affected prose and rechecked. Logs /tmp/2782-*.log.
- node /tmp/2782-browser.cjs: both exact NBA endings, source continuation destinations/focus, no page errors/overflow at 320/390/1440px in light/dark pass. Inspected two saved docs/screenshots/fallback-sentences-*.png cards; widget requests intentionally blocked.
- API/worker/docs rebuilt and restarted; health, /healthz and alerts clear. Exact stored excerpts reread unchanged. Next: scheduled NBA and Tech/World/U.S./Gaming acceptance; Destructoid access and @PS_Support_US authenticity remain unresolved.

## 2026-11-18: iteration 2783 — keep inline photo captions out of feed reporting

- Clean main at d2a7a53d; no inherited work. Initial alerts/health clear; Destructoid remains paused.
- Owner value: saved NBA fallback mixes photo captions into reporting, displacing useful prose. Live Yahoo NBA markup confirms image-and-caption-only figures can occur mid-article; opening-only cleanup misses them.
- Feed collection now omits those figures anywhere before excerpt truncation; mixed figures containing reporting remain. Lead image/destination selection unchanged. No publisher-specific recovery, backfill, stored-edition mutation, paid call or prompt change.
- Recorded Nov 18 Yahoo feed fixture: actual old/new parser comparison removes Getty Images caption, retains 1,496-character excerpt length, lead image and URL, and fits later reporting. Generic controls preserve mixed figures and ordinary credit mentions. New collection behavior, not a claim that today's immutable NBA text was repaired.
- Verification: pnpm format/lint:fix, typecheck, boundaries, 1,134 unit tests, build and scoped handbook check pass. Initial integration run has one stale inline-caption expectation (329 pass/four skips); updated expectation and targeted rerun pass. Fresh full isolated integration rerun passes 330 tests/four expected skips; final spacing target, API rebuild and changed-file lint pass. Logs /tmp/2783-*.log.
- API/worker/docs rebuilt and restarted. Startup retry /healthz, obs health and alerts pass; exact saved Warriors/Hawks excerpts reread unchanged. No UI change or new screenshot.
- Updated TASKS, affected data-model handbook, SOURCES and item 42 ack. Next: scheduled NBA AI editing and Tech/World/U.S./Gaming acceptance; Destructoid access and @PS_Support_US authenticity remain unresolved.

## 2026-11-18: iteration 2784 — make clipped social evidence explicit

- Clean main at 2fca20b1; no inherited work. Initial alerts and /healthz clear; monitored sources healthy, Destructoid paused.
- Owner value: saved Curry/Thune X posts end mid-quotation or after a negation; an editor must judge the visible development without completing missing claims. Request text also silently cut at 1,200 characters.
- Social editor v13 explicitly preserves attribution/uncertainty and permits substantive complete openings, while refusing to infer missing endings. Request-shortened candidates now carry textTruncated; full stored/display text retained.
- Offline exact saved pair and long synthetic control pass transport checks through Sonnet and capped Haiku (27 targeted tests). Scripted outputs do not prove semantic improvement; next scheduled selection acceptance pending.
- Updated TASKS, RANKING, affected social handbook and item 42 ack. No paid calls, provider/budget changes, source changes or immutable-edition mutation; no UI change.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,135 unit/330 integration passes, four expected skips), pnpm build, scoped check-handbook.ts and git diff --check pass. Logs /tmp/2784-*.log; no diagram/UI changes.
- Rebuilt API/worker/docs restarted active; first immediate health probe hit startup, retry pnpm obs health --check and /healthz pass; alerts clear. Sources check healthy (38 monitored including inactive Destructoid); digest queue zero failures, next scheduled Nov 19 15:00 UTC.
- Next: scheduled NBA editing and Tech/World/U.S./Gaming/social selection acceptance. Destructoid access and @PS_Support_US authenticity remain unresolved.

## 2026-11-18: iteration 2785 — separate excerpt provenance from coverage labels

- Clean main at 223c1377; no inherited work. Initial alerts and health clear; all 38 monitored sources healthy, including inactive Destructoid. Digest queue has zero failures; next Nov 19 15:00 UTC.
- Owner value: published U.S. Peltola summary attributes a PBS excerpt to Al Jazeera/BBC/NPR, the first three cluster labels, without their reporting text.
- Cause: story-editor projection omits representative publisher and URL, leaving only clipped coverage labels. Now sends bounded publisher/URL and explicitly separates reporting attribution from coverage. Unknown publisher stays unknown (saved PBS item has null metadata, verified read-only).
- Exact immutable excerpt/summary retained as an offline fixture; null-publisher and known-publisher controls exercise Sonnet and capped Haiku. Scripted results verify transport and validation, not semantic attribution accuracy; next scheduled acceptance pending.
- Updated TASKS, affected pipeline handbook and item 42 ack. No paid call, provider/budget change, source or immutable-edition mutation; no UI change.
- Verification so far: 56 targeted tests, pnpm format/lint:fix, 1,137 full unit tests, typecheck/lint/format/boundaries, pnpm build and scoped handbook check pass. Initial build exposed a mixed publisher-type inference error; explicit evidence projection type fixes it. Handbook one-line overflow corrected. Logs /tmp/2785-*.log.
- API/worker/docs rebuilt and restarted active; startup health probe failed, retry pnpm obs health --check and /healthz pass. Alerts clear; digest queue zero failures. Archived older progress and completed-task detail to keep orientation shorter.
- Full check initially found three stale integration goldens: two private prompts lacked new URLs and raw synthetic replay fingerprint matched old instructions. Updated only private prompts/fingerprint; published golden stories unchanged. Fresh isolated integration rerun passes 330 tests/four expected skips. Logs /tmp/2785-{check,integration}.log. Next: scheduled attribution/NBA/Tech/World/U.S./Gaming acceptance; Destructoid access and @PS_Support_US authenticity unresolved.

## 2026-11-18: iteration 2786 — identify reader source excerpts

- Clean main at 364f2399; no inherited work. Initial alerts/health clear; 38 monitored sources healthy (Destructoid inactive). Digest queue zero failures; next Nov 19 15:00 UTC.
- Owner value: five saved NBA fallback cards present source text in the same style as edited summaries. Reader now labels those cards “Source excerpt”, using per-story projection provenance rather than topic mode.
- Optional reader-only summaryKind marks populated fallback excerpts; edited summaries and blank source text carry no marker. Historical modes remain supported, saved snapshots unchanged. No provider calls, prompt/budget changes or source recovery.
- Exact saved latest edition reread: all 25 summaries unchanged; only five NBA excerpts marked. Playwright at 320/390/1440px in both themes verifies labels, original destinations, unchanged prose, no overflow/page errors. Six PNGs saved; mobile light/desktop dark inspected.
- Verification: nine targeted reader projection tests, pnpm format/lint:fix, build, scoped handbook check and git diff --check pass. Full pnpm check passes: 1,137 unit and 330 integration tests, four expected skips; logs /tmp/2786-*.log.
- API/worker/docs rebuilt and restarted; /healthz, obs health and alerts clear. Updated TASKS, affected pipeline handbook and item 42 ack.
- Next: scheduled NBA/Tech/World/U.S./Gaming acceptance. Earlier E1 denial fix already awaits scheduled evidence; no duplicate prompt change. Destructoid access and @PS_Support_US authenticity unresolved.
