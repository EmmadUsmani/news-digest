[Earlier iterations](docs/progress-archive/2026-11-18-progress-through-2716.md).

[Iterations 2717–2720](docs/progress-archive/2026-11-18-iterations-2717-2720.md).

[Iterations 2721–2725](docs/progress-archive/2026-11-18-iterations-2721-2725.md).

[Iterations 2726–2730](docs/progress-archive/2026-11-18-iterations-2726-2730.md).

[Iterations 2731–2767](docs/progress-archive/2026-11-18-iterations-2731-2767.md).

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

## 2026-11-18: iteration 2775 — retain Tech study counterfindings

- Clean main at ea9c5a98; no inherited work. Alerts/health/14 services/38 monitored sources healthy; Destructoid remains paused.
- Reader value: the coding-agent story should retain unchanged finished work and supplied publication status alongside more code and slower review.
- Read retained Tech rejection: Sonnet initial paraphrases both qualifications into negative sentences; repair drops them. Nvidia negative quotation/paraphrase independently rejects both attempts; no claim of Sonnet recovery.
- Tech-only guidance preserves central counterfindings/status with complete attributed source sentences. Shared absence guard, providers, models, budgets and published snapshot unchanged; no paid calls.
- Saved study regression reproduces rejected paraphrase; complete source-sentence control passes both offline editor routes. Hand-authored responses establish transport/validation, not semantic model acceptance.
- Updated ranking reference, affected owner handbook and TASKS. Initial handbook addition exceeded 100 lines; shortened and recheck passes. Initial test omitted required sources; corrected before checks.
- Verification: targeted regression passes; pnpm format, pnpm lint:fix, pnpm check and pnpm build; logs /tmp/2775-*.log. Full check passes: 1,126 unit/330 integration tests, four expected skips.
- Live read confirms unchanged cd357e84: five topics/25 stories/19 posts/five content groups. No UI change; next scheduled daily review checks Tech qualifications plus NBA acceptance. Destructoid access blocked.

## 2026-11-18: iteration 2776 — retain qualifications through summary repair

- Clean main at f1f41324; no inherited work. Alerts clear, health/14 services/38 monitored sources healthy; Destructoid remains paused.
- Owner value: repairing an unsupported summary should retain central source findings and quoted attribution, helping avoid another fallback or a misleadingly incomplete study summary.
- Saved Nov 18 Tech Sonnet initial shifts Nvidia quote attribution; repair paraphrases its negative claim and drops the study counterfinding/status. Summary feedback previously asked only for positive facts.
- Fixed summary-specific repair feedback now permits complete cited negative sentences with attribution/scope and complete quotation ordering. Validator, provider/model selection, budgets and published snapshot unchanged.
- Both saved Nvidia failures and study failure remain rejected. Six offline budgeted repair cases (three failures × two model routes) pass hand-authored complete-source controls, two settled reservations and validated-only cache reuse; transport evidence, not model compliance.
- Updated TASKS and ranking evidence; archived older PROGRESS entries to keep orientation small. No UI changes or paid calls.
- Verification: pnpm exec tsx --test apps/api/test/llm.test.ts passes 51/51; pnpm format, pnpm lint:fix, pnpm check and pnpm build pass. Full check: 1,127 unit/330 integration passes, four expected skips; logs /tmp/2776-*.log.
- Rebuilt API/worker and docs restarted active. Post-restart health/alerts clear; /tmp/2770-live.ts confirms unchanged cd357e84, five topics/25 stories/19 posts/five content groups. /healthz passes.
- Next: scheduled Tech qualification/quotation retention, NBA AI editing and same-game selection acceptance; Destructoid remains blocked. No paid replay or recovery backfill.

## 2026-11-18: iteration 2777 — retain denials of disputed causation

- Clean main at 63efcdc9; no inherited work. Alerts/health/14 monitored services/38 monitored sources healthy; Destructoid remains paused.
- Reader value: the World E1 significance implies sanctions influenced a delay despite the supplied diplomats’ denial; the summary omits that qualification.
- Shared editor guidance preserves material denials across summary, significance and brief; timing alone establishes neither cause nor influence. Complete negative source sentences retain attribution under the unchanged guard.
- Exact saved candidate/published fields retained in a fixture. Complete-denial hand-authored control passes both offline budgeted routes; transport/validation evidence, not model compliance.
- No UI change, publisher fetch, paid call, model/provider/budget change or mutation of the published edition. TASKS and ranking evidence updated; this corrects a real published weakness.
- Verification: editor tests 44/44, build and full-check static stages/1,128 unit tests pass. Integration initially 329 pass/one stale synthetic prompt fingerprint fails/four expected skips; fingerprint updated offline, targeted golden test and isolated retry pass (330/four skips). pnpm format/lint:fix pass. Logs /tmp/2777-*.log.
- Rebuilt API/worker/docs restarted active; health and alerts clear. Reader remains cd357e84: five topics/25 stories/19 posts/five content groups. Next daily review checks World denial retention alongside NBA/Tech acceptance.

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
