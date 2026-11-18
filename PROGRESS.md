[Earlier iterations](docs/progress-archive/2026-11-18-progress-through-2716.md).

[Iterations 2717–2720](docs/progress-archive/2026-11-18-iterations-2717-2720.md).

[Iterations 2721–2725](docs/progress-archive/2026-11-18-iterations-2721-2725.md).

[Iterations 2726–2730](docs/progress-archive/2026-11-18-iterations-2726-2730.md).

## 2026-11-18: iteration 2731 — recover Coway and GPU-forensics context

- Clean main at d2a35ca4; no inherited work. Alerts/health clear, sources healthy; digest-generation queue zero failures, next 15:00 UTC. Historical ingestion/social failures unchanged.
- Public Chromium reader shows five topics/25 stories; Tech remains thin pending scheduled acceptance.
- Ordinary shared-client HTTP 200 recovered blank saved HN excerpts for Coway reverse engineering and AI-model checkpoint forensics (3,000 characters).
- Complete passages reviewed before blank-only writes; exact stored-ID/full-text rereads pass 2/2 (`/tmp/2731-saved.json`). GPU initialization/training limitation preserved in source context.
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,119 unit/330 integration tests, four expected skips. Logs `/tmp/2731-*.log`.
- API/worker restarted; health database/Redis pass; post-restart public Chromium reader five topics/25 stories and alerts clear.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2732 — recover paths and database-storage context

- Clean main at 51d9c13e; no inherited work. Alerts/health clear, sources healthy; scheduled digest queue zero failures, next 15:00 UTC. Historical ingestion/social failures unchanged.
- Public Chromium reader shows five topics/25 stories; Tech remains thin pending scheduled acceptance.
- Ordinary shared-client HTTP 200 recovered blank saved HN excerpts for compiler-split binary paths and row/column database storage (3,000 characters).
- Complete passages reviewed before blank-only writes; exact stored-ID/full-text rereads pass 2/2 (`/tmp/2732-saved.json`).
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,119 unit/330 integration tests, four expected skips. Logs `/tmp/2732-*.log`.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2733 — recover PCIe mapping and C3 library context

- Clean main at e1fbb6ef; no inherited work. Alerts/health clear, 38 monitored sources healthy; scheduled digest queue zero failures, next 15:00 UTC. Historical ingestion/social failures unchanged.
- Read latest public Tech section: thin summaries persist pending scheduled acceptance; Chromium reader shows five topics/25 stories.
- Ordinary shared-client HTTP 200 recovered blank saved HN excerpts for Linux GPU BAR allocation and C3 0.8.6 library fetching (3,000 characters).
- Complete passages reviewed before blank-only writes; exact stored-ID/full-text rereads pass 2/2 (`pnpm exec tsx /tmp/2733-verify.ts`; receipt `/tmp/2733-saved.json`).
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,119 unit/330 integration tests, four expected skips. Logs `/tmp/2733-*.log`.
- API/worker restarted; `/healthz` database/Redis pass; post-restart public Chromium reader five topics/25 stories and `pnpm obs alerts` clear.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2734 — recover interview-change context

- Clean main at 80c05517; no inherited work. Alerts/health clear; 38 monitored sources healthy. Digest queue zero failures, next 15:00 UTC; historical ingestion/social failures unchanged.
- Public Chromium reader shows five topics/25 stories; latest Tech remains thin pending scheduled acceptance.
- Ordinary shared-client HTTP 200 recovered Jane Street's blank saved interview-change excerpt: 0 → 1,500 characters. Complete passage reviewed before blank-only write.
- `pnpm exec tsx /tmp/2734-verify.ts` passes exact stored-ID/full-text reread 1/1; receipt `/tmp/2734-saved.json`. Faraday-cage and CPython/Yk HTTP 200 pages yield no prose and remain unchanged.
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,119 unit/330 integration tests, four expected skips. Logs `/tmp/2734-*.log`.
- API/worker restarted; immediate health request preceded readiness, retry passes database/Redis. Post-restart Chromium reader five topics/25 stories; alerts clear.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window. Consider safe prose scoping for the two unextracted pages outside that window.

## 2026-11-18: iteration 2735 — collect identified blog article bodies

- Clean main at 8f8aa243; no inherited work. Alerts and health clear; scheduled digest queue zero failures, next 15:00 UTC. Historical queue failures unchanged.
- Latest public Tech remains thin; Chromium reader shows five topics/25 stories. Scheduled acceptance stays pending.
- Fixed the actual CPython/yk HTTP 200 extraction failure: title-matched identified blog headings can scope explicit article-body divs without sibling recent-post lists.
- Saved candidate f04942be-5434-4836-8507-4c2e3e20a72a: 0 → 1,500 characters. Reviewed full passage; blank-only write and exact stored-ID/full-text reread pass (`pnpm exec tsx /tmp/2735-verify.ts`).
- Targeted `pnpm exec tsx --test apps/api/test/publisher-excerpt.test.ts`: 32/32 pass, including mismatched-title, missing-identity and unrelated-container controls.
- Source receipt, handbook and tasks updated; no paid calls, cap changes or edition regeneration.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check` and `pnpm exec tsx scripts/check-handbook.ts 04-edition-pipeline` pass: 1,120 unit/330 integration passes, four expected skips. Logs `/tmp/2735-*.log`.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2736 — recover stellar discovery and correctness context

- Clean main at 6e5169a2; no inherited work. Alerts/health clear, 38 monitored sources healthy; scheduled digest queue zero failures, next 15:00 UTC. Historical ingestion/social failures unchanged.
- Latest public Tech remains thin pending scheduled acceptance; Chromium reader shows five topics/25 stories.
- Ordinary shared-client HTTP 200 fetches recovered Curtin's stellar radio-pulse discovery and the Correctness and Complexity essay: 0 → 1,500 characters each. Full passages reviewed before blank-only writes.
- `pnpm exec tsx /tmp/2736-verify.ts` passes exact stored-ID/full-text reread 2/2; receipt `/tmp/2736-saved.json`. Possible Futures extraction skips list context; unchanged.
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix`, `pnpm check`, and `pnpm exec tsx scripts/check-handbook.ts` pass: 1,120 unit/330 integration passes, four expected skips; 19 handbook pages/21 diagrams checked. Logs `/tmp/2736-*.log`.
- API/worker restarted before freeze; initial request preceded readiness, retry health passes database/Redis. Post-restart public Chromium reader five topics/25 stories; alerts clear. Older progress entries archived to keep handoff small.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2737 — recover Darling and software-team context

- Clean main at 43b1efa2; no inherited work. Alerts/health clear; all 38 monitored sources healthy. Digest queue zero failures, next 15:00 UTC; historical ingestion/social failures unchanged.
- Public Chromium reader shows five topics/25 stories; scheduled Tech depth acceptance stays pending.
- Ordinary shared-client HTTP 200 fetches recovered Darling's development update and the software-team experience essay: zero to 1,500 characters each. Full passages reviewed before blank-only writes.
- `pnpm exec tsx /tmp/2737-verify.ts` passes exact stored-ID/full-text reread 2/2; receipt `/tmp/2737-saved.json`. Lean Grimoire HTTP 200 yields no extracted prose and remains unchanged.
- No code/schema/UI changes, paid calls, cap changes or edition regeneration. Sources/receipt/tasks updated; handbook behavior unchanged.
- `pnpm build`, `pnpm format`, `pnpm lint:fix` pass. Full `pnpm check` passes: 1,120 unit/330 integration tests, four expected skips; logs `/tmp/2737-*.log`.
- Handbook check initially hit HTTP 429 through the app; documented `--owner-services` retry passes 19 pages/21 diagrams/39 tables.
- API/worker restarted at 12:57 UTC before freeze; readiness retry passes database/Redis. Post-restart Chromium reader five topics/25 stories; alerts clear.
- Next: scheduled Tech share/depth acceptance after 15:00 UTC; protect 13:00–16:00 deployment window.

## 2026-11-18: iteration 2760 — scheduled edition review, Tech recovery and NBA regression

- Clean main at a4d8547f; no inherited work. Read-only review during 13:00–16:00 deployment hold; no restart, inference, generation or budget changes.
- Scheduled cd357e84 published 15:04:15.539 UTC: 25 stories/19 posts. Public HTTPS latest/direct/history and signed-out desktop/mobile pass; screenshots inspected.
- Tech prospective saved text 56/200 (28%) vs 29/200 (14.5%); all 5/5 selected evidence sets nonempty vs 1/5. Reader summaries materially deeper; item 66 natural acceptance acked.
- Editorial gate correctly fails NBA non-AI fallback. Sonnet initial whyItMatters, then Sonnet repair/Haiku initial+repair headlines reject unsupported-absence/negative-word. Rejected wording absent from validation logs; offline diagnosis next after 16:00, no speculative guard relaxation.
- World Sonnet recovery, World/U.S. disjoint IDs, zero unscored candidates and NBA spoof absence checked; remaining content limitations in docs/edition-reviews/2026-11-18.md.
- Timing reporter: worker 255.561 s, $0.546124/59 successful provider calls, zero failed/unresolved calls/holds. Provider success includes validation-rejected responses.
- Health, 14 services and 38 monitored sources pass; Destructoid inactive, digest queue zero failures. Transient metrics scrape alert at 15:07 recovered unaided; all targets up and alerts clear at 15:07:43.
- Verification: pnpm format, pnpm lint:fix and full pnpm check pass: 1,120 unit/330 integration passes, four expected skips. Logs /tmp/2760-{format,lint,check}.log. No runtime changes require rebuild/restart; hold retained.
- Next: NBA validation-response recovery and offline reproduction after 16:00 UTC; no separate review commit for this edition.
- Initial push rejected (remote advanced to owner b5449b18). Merged without rewriting history; preserved owner item 67 and lead-owned file unchanged, resolving only appended steering text.
- New item 67 replaces Tech recovery: one three-day cause table/general fix/bounded backfill after 16:00 and NBA breakage; recorded in TASKS. Prior item 66 daily acceptance does not complete item 67.

## 2026-11-18: iteration 2768 — reproduce NBA validation exhaustion offline

- Clean main at 23b577a4; no inherited work. Initial alert snapshot clear; previous metrics/backup alerts resolved without intervention. Health passes; 14 services/38 monitored sources healthy.
- After 16:00 UTC, recovered all four exact private NBA request/response artifacts from Nov 18. No provider, cache, ledger, database or publication writes.
- `pnpm exec tsx /tmp/2768-nba-diagnosis.ts` asserts retained-response count and reproduces recorded first field/category 4/4 using production absence guard; seven failed story fields found.
- Sonnet initial: supported Brown injury paraphrase in significance violates complete-negative-sentence rule. Remaining attempts: Curry negative headline paraphrases; three summaries also shorten/change the full source sentence.
- Edition review records exact wording, source sentence, and next bounded regression work. Guard/prompt unchanged; no paid replay, budget change, generation or deployment.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` pass: 1,120 unit/330 integration passes, four expected skips; logs `/tmp/2768-{format,lint,check}.log`. Documentation-only; no rebuild/restart needed, running app unchanged.
- Next: pin retained NBA failures and verify bounded correction before Tech item 67 cause table/general fix/backfill. Destructoid remains blocked; no access workarounds.

## 2026-11-18: iteration 2769 — bounded NBA injury wording guidance

- Clean main at 13a6ba6c; no inherited work. Alerts clear; health, 14 services and 38 monitored sources pass.
- Pinned seven exact rejected fields from all four retained Nov 18 attempts in offline fixtures; no private artifact paths, credentials or provider calls.
- NBA-only guidance asks for positive injury headlines/significance and complete negative source sentences, retaining trailing health concerns/attribution/uncertainty. Guard, fallback and budgets unchanged.
- Editor regression proves each original field rejects, a manually corrected response passes repair, and invented return-date absences still fail. This is offline verification, not natural model acceptance.
- Verification: targeted editor 43/43; pnpm format, pnpm lint:fix, pnpm check (1,121 unit/330 integration passes, four expected skips), pnpm build and handbook check (19 pages/21 diagrams/39 tables) pass; /tmp/2769-*.log.
- Rebuilt API/worker restarted healthy; /healthz database/Redis pass, alerts clear. No UI/schema/source changes; Nov 18 immutable edition retained.
- Next: natural scheduled NBA acceptance; resume item 67 three-day cause table/general excerpt fix/backfill while awaiting it. Destructoid remains blocked.

## 2026-11-18: iteration 2770 — one general Tech excerpt fix and bounded backfill

- Clean main at 441df87d; no inherited work. Alerts clear; health, 14 services and 38 monitored sources healthy; digest queue zero failures.
- Item 67 one-time three-day saved pool: 261 candidates/74 blanks. Largest non-block cause unsupported body layouts 25/74 (33.78%); full cause table and cohort receipt in docs/edition-reviews/2026-11-18-tech-blank-causes.*.
- General document-head description fallback follows existing body extraction; minimum 60/max 1,500 characters, entity decoding and body priority verified. No publisher list, grouping changes or paid calls.
- Initial audit inadvertently requested HN-linked X/mirror/Reddit pages, violating source-access rules. Those responses excluded; HN now rejects those publisher fetches, with adapter regression coverage. No repeat or bypass.
- One bounded blank-only backfill filled 34 (18 existing body/16 descriptions); saved blanks 74/261 (28.35%) → 40/261 (15.33%). Exact rereads pass for all 261, including 187 unchanged nonblank controls. Immutable edition untouched.
- Actual data commands: pnpm exec tsx /tmp/2770-measure.ts, /tmp/2770-probe.ts, /tmp/2770-backfill.ts --apply, /tmp/2770-verify.ts; no live LLM calls.
- Verification: targeted publisher tests 34/34, pnpm format, pnpm lint:fix, pnpm check (1,123 unit/330 integration passes, four expected skips), pnpm build and affected handbook check pass; logs /tmp/2770-*.log.
- Rebuilt API/worker restarted active; /healthz database/Redis pass. Supported local probe /tmp/2770-live.ts confirms latest cd357e84 remains 25 stories/19 posts/five topics and five content groups. Bare localhost API requests correctly reject missing visitor identity; direct VM HTTPS connection unavailable this run. No UI change.
- Metrics query API timed out with a slow-query backlog during checks. One sudo systemctl restart obs-metrics.service restored responsive queries/all eight scrape targets healthy at 16:41:41; limits unchanged. At 16:42:10, zero firing/five pending scrape alerts awaited evaluation.
- Next: stop recovery work; check next scheduled Tech section once alongside NBA natural acceptance. Publisher blocks recorded; Destructoid remains paused.

## 2026-11-18: iteration 2771 — preserve HN publisher access restrictions through redirects

- Clean main at 2915a059; no inherited work. Initial alerts clear; health, 14 services and 38 monitored sources healthy.
- Owner-visible value: ordinary HN publisher redirects cannot turn excerpt collection into prohibited X, Nitter or Reddit scraping. Found the initial-link guard was lost when SharedHttpClient followed redirects.
- HttpPort accepts an optional request access policy; shared HTTP checks every destination before transport or cache reuse. HN passes its existing publisher policy; other callers retain existing behavior.
- Offline regressions reject three social redirect targets without requesting them, reject policy-forbidden cache reuse, allow ordinary publisher redirects, and assert HN passes the policy. No external test traffic.
- Updated affected handbook/source inventory and stale NBA handoff. No excerpt recovery, saved-content writes, paid calls, budget changes or new source.
- Verification: pnpm format, pnpm lint:fix, targeted tests 37/37, pnpm check (1,124 unit/330 integration passes, four expected skips), pnpm build and affected handbook check pass; logs /tmp/2771-*.log.
- Rebuilt API/worker/docs restarted active; pnpm obs health passes database/Redis, alerts clear. pnpm exec tsx /tmp/2770-live.ts confirms unchanged latest cd357e84: five topics/25 stories/19 posts and five live content groups. No UI change.
- Next: next scheduled NBA and Tech acceptance together in the daily review; stop recovery work. Destructoid publisher access remains blocked.

## 2026-11-18: iteration 2772 — review published Bluesky text and event breadth

- Clean main at dcc7da5a; no inherited work. Alerts/health/services/sources clear; next NBA/Tech acceptance awaits scheduled publication.
- Owner-visible value: identify where today's social slots repeat one event instead of adding breadth, using actual saved publication text.
- Read all eight Bluesky picks with story titles and X texts; retained exact texts/counts/editor reasons in docs/edition-reviews/2026-11-18-bluesky-selection.*. Receipt comparison passes 8/8.
- NBA uses three slots for one Lakers game; editor explicitly rewards added stat detail. Next: offline event-level comparison before changing selection. Gaming different-work nominations do not prove same-winning-work-rule failure.
- All eight have standalone text; U.S. has two concrete picks. Complete Nov 18 UTC collection review remains pending. No queries, source gates, prompts, budgets, content writes or paid calls changed.
- Verification: pnpm format, pnpm lint:fix, pnpm check pass (1,124 unit/330 integration passes, four expected skips). First check stopped on new archive formatting; fixed and reran successfully. Logs /tmp/2772-*.log.
- pnpm obs health/services --check/sources --check pass; /tmp/2770-live.ts confirms unchanged latest edition: five topics/25 stories/19 posts. Docs-only change; no app rebuild or browser check needed.
- Archived iterations 2726–2730 to keep PROGRESS.md small. Docs service refreshed after commit; app runtime unchanged. Destructoid remains blocked.

## 2026-11-18: iteration 2773 — compare saved NBA social event breadth offline

- Clean main at 7846a292; no inherited work. Alerts/health/14 services/38 monitored sources healthy; Destructoid remains paused.
- Reader weakness: four NBA post slots include three contextual Lakers-game picks, one only an overtime teaser. Manual comparison retains two labeled developments in two standalone slots, without padding.
- Retained explicit editorial labels, attribution/uncertainty and exact text hashes; offline script checks four matches/all 16 subsets. Game identity is contextual, not independently verified from the short X texts.
- Cause: saved editor reason rewards extra game detail; X-first selection locks picks before Bluesky additions. Declining Bluesky alone cannot consolidate earlier X repeats. No author/team exclusion or production rule changed.
- Saved-text regression passes all three preceding X texts and the Bluesky candidate to both model routes; simulated empty selection is accepted. Transport evidence only, not semantic model acceptance.
- Verification: pnpm exec tsx scripts/evaluate-saved-nba-event-breadth.ts passes; targeted social-editor tests 24/24. pnpm format, pnpm lint:fix, pnpm check and pnpm build pass; detailed logs /tmp/2773-*.log.
- Full check: 1,125 unit/330 integration passes, four expected skips. No external test traffic, paid calls, content writes, budget changes or UI changes.
- Live probe /tmp/2770-live.ts: unchanged cd357e84, five topics/25 stories/19 posts/five content groups. Rebuilt API/worker and docs refreshed; health/alerts clear.
- Next: fix same-game comparison at X and cross-platform selection with distinct-development controls, then natural scheduled acceptance; NBA/Tech morning acceptance still pending.

## 2026-11-18: iteration 2774 — clarify NBA same-game social selection

- Clean main at efdb38e0; no inherited work. Alerts/health/14 services/38 monitored sources healthy; Destructoid remains paused.
- Fix published NBA repetition: shared social editor v12 treats same-game result/overtime/streak/stat lines as one development at initial X and later cross-platform selection; prefer a standalone representative and allow fewer posts.
- Do not infer game identity from shared player/team names; separate contract, consequential trade and serious injury developments remain eligible. No author exclusions, budget changes or paid calls.
- Saved exact X texts now exercise the first pass as well as Bluesky comparison on both routes; distinct trade-completion control retained. Hand-authored responses test transport, not semantic model compliance.
- Updated ranking reference, affected owner handbook and TASKS handoff. Natural scheduled NBA selection and NBA/Tech morning acceptance remain open.
- Targeted social-editor tests 24/24 pass. Initial edit accidentally touched a regex; corrected before checks. Handbook length check caught 104 lines; shortened page, recheck passes.
- Verification: pnpm format, pnpm lint:fix, pnpm check (1,125 unit/330 integration passes, four expected skips), pnpm build and affected handbook check pass; logs /tmp/2774-*.log. Offline comparison retains four exact texts/all 16 subsets.
- Rebuilt API/worker active; initial immediate health probe raced startup, subsequent health passes. Alerts clear; live probe confirms unchanged cd357e84: five topics/25 stories/19 posts/five content groups. No UI change.
- Next: scheduled NBA same-game selection plus NBA editing/Tech acceptance; no paid replay. Destructoid publisher access remains blocked.
