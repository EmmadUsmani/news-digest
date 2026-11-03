# Progress

Archived: [iteration 336](docs/progress-archive/2026-11-03-iteration-336.md), [iteration 335](docs/progress-archive/2026-11-03-iteration-335.md), [iteration 334](docs/progress-archive/2026-11-03-iteration-334.md), [iteration 332](docs/progress-archive/2026-11-03-iteration-332.md), [iteration 331](docs/progress-archive/2026-11-03-iteration-331.md), [iteration 330](docs/progress-archive/2026-11-03-iteration-330.md), [iteration 329](docs/progress-archive/2026-11-03-iteration-329.md), [iteration 328](docs/progress-archive/2026-11-03-iteration-328.md), [iteration 327](docs/progress-archive/2026-11-03-iteration-327.md), [iteration 326](docs/progress-archive/2026-11-03-iteration-326.md), [iteration 325](docs/progress-archive/2026-11-03-iteration-325.md), [iteration 324](docs/progress-archive/2026-11-03-iteration-324.md), [iteration 321](docs/progress-archive/2026-11-03-iteration-321.md), [iteration 320](docs/progress-archive/2026-11-03-iteration-320.md), [iteration 319](docs/progress-archive/2026-11-03-iteration-319.md), [iterations 317–318](docs/progress-archive/2026-11-03-iterations-317-318.md), [iterations 315–316](docs/progress-archive/2026-11-03-iterations-315-316.md), [iterations 313–314](docs/progress-archive/2026-11-03-iterations-313-314.md), [iterations 311–312](docs/progress-archive/2026-11-03-iterations-311-312.md), [iterations 309–310](docs/progress-archive/2026-11-03-iterations-309-310.md), [iterations 307–308](docs/progress-archive/2026-11-03-iterations-307-308.md), [iterations 305–306](docs/progress-archive/2026-11-03-iterations-305-306.md), [iterations 303–304](docs/progress-archive/2026-11-03-iterations-303-304.md), [iteration 302](docs/progress-archive/2026-11-03-iteration-302.md), [iteration 301](docs/progress-archive/2026-11-03-iteration-301.md), [iteration 300](docs/progress-archive/2026-11-03-iteration-300.md), [iteration 299](docs/progress-archive/2026-11-03-iteration-299.md), [iteration 298](docs/progress-archive/2026-11-03-iteration-298.md), [iteration 297](docs/progress-archive/2026-11-03-iteration-297.md), [iteration 296](docs/progress-archive/2026-11-03-iteration-296.md), [iteration 295](docs/progress-archive/2026-11-03-iteration-295.md), [iteration 294](docs/progress-archive/2026-11-03-iteration-294.md), [iteration 293](docs/progress-archive/2026-11-03-iteration-293.md), [iteration 292](docs/progress-archive/2026-11-03-iteration-292.md), [iteration 291](docs/progress-archive/2026-11-03-iteration-291.md), [iteration 290](docs/progress-archive/2026-11-03-iteration-290.md), [iteration 288](docs/progress-archive/2026-11-03-iteration-288.md), [iteration 285](docs/progress-archive/2026-11-03-iteration-285.md), [286](docs/progress-archive/2026-11-03-iteration-286.md).

Earlier entries: [iterations 269–270](docs/progress-archive/2026-11-03-iterations-269-270.md), [271–272](docs/progress-archive/2026-11-03-iterations-271-272.md), [273–274](docs/progress-archive/2026-11-03-iterations-273-274.md), [275–276](docs/progress-archive/2026-11-03-iterations-275-276.md), [277–278](docs/progress-archive/2026-11-03-iterations-277-278.md), [279–280](docs/progress-archive/2026-11-03-iterations-279-280.md), [282](docs/progress-archive/2026-11-03-iteration-282.md), [283](docs/progress-archive/2026-11-03-iteration-283.md), [284](docs/progress-archive/2026-11-03-iteration-284.md).

## 2026-11-03: iteration 337 — guard opt-in NBA lexical fallthrough

- Started clean on main; no leftover work. Four services/health healthy, 32 sources without current errors. Two retained ingestion failures have recovered sources; no failed digest jobs. Scheduled evidence remains pending.
- Found rejected game previews could fall back to lexical grouping. Opt-in matcher now refuses two-team preview, historical, conditional and negative titles before fallback; production lexical behavior stays unchanged.
- Seven synthetic pairs verify symmetry and separate slots despite identical titles; unrelated developer preview still uses lexical matching. Existing recorded benchmark remains green; no new independent labels or general quality claim.
- Updated TASKS/RANKING. No source/schema/UI changes, paid calls or Reddit requests; handbook behavior unchanged.
- Verification: targeted game suite 4/4; `pnpm format`, `pnpm lint:fix`, `pnpm check` (207 unit/172 integration), `pnpm build`, `git diff --check` passed.
- Restarted API/worker for runtime changes; all four services active, health database/Redis OK. Retained edition before restart: 20 stories/10 posts; app/docs/db HTTP 200. Grouping remains off.
- Next: Nov 3 scheduled evidence/acks take priority, then eligible social activation; broader grouping evidence remains open.

## 2026-11-03: iteration 338 — refuse ambiguous NBA score fallback

- Started clean on main; no leftover work. Four services/health healthy, sources without current errors, no failed digest jobs. Nov 3 15:00 UTC evidence remains pending.
- Opt-in game matching now rejects multiple, tied or implausible scores and unassignable winners before lexical fallback. Previously identical ambiguous recaps could merge; seven synthetic cases pin separate slots and symmetry, while scoreless lexical matching remains available.
- Updated TASKS/RANKING and archived iteration 324 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off and independent evidence remains open.
- Verification: targeted suite 5/5; `pnpm format`, `pnpm lint:fix`, `pnpm check` (208 unit/172 integration), `pnpm build`, `git diff --check`. First full check caught archive formatting added during the run; corrected with Prettier and full rerun passed.
- Restarted API/worker for runtime changes. All four services active, health database/Redis OK; app/docs/db HTTP 200. Retained real edition: 20 stories/10 X posts.
- Next: scheduled evidence/acks take priority when available, then eligible social activation; broader independently reviewed grouping evidence remains open.

## 2026-11-03: iteration 339 — preserve multiword studio identities

- Started clean on main; no leftover work. Services/health healthy, 32 sources without current errors, no failed digest jobs; Nov 3 scheduled evidence still pending.
- Default-off grouping now matches full multiword proper studio names, preserving suffix/prefix distinctions instead of rejecting all multiword names. Synthetic regressions cover matching title/excerpt identities, collisions, multiple closures and uncertainty/history.
- Initial targeted run caught a recorded title-case `As` connective regression; preserved the existing connective handling. Targeted suite then passed 4/4; recorded benchmark remains 13/32 positives and zero labeled false merges. No independent-label or real-world recall claim.
- Updated TASKS/RANKING; archived iteration 325 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (209 unit/172 integration), `pnpm build`, `git diff --check` passed.
- API/worker restarted; all four services active, health database/Redis OK, app/docs/db HTTP 200. Retained real edition has four topics, 20 stories and 10 X posts.
- Next: scheduled evidence/acks take priority, then eligible social activation; independent grouping evidence remains open.

## 2026-11-03: iteration 340 — explicit studio closure paraphrases

- Started clean on main; no leftover work. Four app services/health healthy, 32 sources without current errors; no failed digest runs. Two retained ingestion failures have recovered sources. Nov 3 15:00 UTC evidence remains pending.
- Default-off grouping recognizes named studios that cease operations or close/shut their doors. Temporary closures and closed beta/playtest/application/submission announcements refuse lexical fallback, including identical headlines.
- Synthetic tests cover title/excerpt paraphrases, symmetry, identity distinctions, history and uncertainty. Recorded benchmark remains 13/32 positives with zero labeled false merges; no independent-label or real-world recall claim.
- Updated TASKS/RANKING; archived iteration 326 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off.
- Verification: targeted studio suite 5/5; `pnpm format`, `pnpm lint:fix`, `pnpm check` (210 unit/172 integration), `pnpm build`, `git diff --check` passed.
- API/worker restarted; all four services active, health database/Redis OK, app/docs/db HTTP 200. Retained real edition: four topics, 20 stories and 10 X posts.
- Next: scheduled evidence/acks take priority, then eligible social activation; independently reviewed grouping evidence remains open.

## 2026-11-03: iteration 341 — ongoing studio shutdown assertions

- Started clean on main; no leftover work. Services/health healthy, 32 sources without current errors, no failed digest jobs; two retained ingestion failures have recovered sources. Nov 3 15:00 UTC evidence pending.
- Default-off grouping recognizes “is shutting down,” “is ceasing operations” and “is closing its doors.” Facility/product closures refuse lexical fallback, preserving separate slots for offices, divisions, servers and tests.
- Synthetic coverage checks symmetry, excerpt assertions, history, uncertainty and negation. Recorded benchmark remains 13/32 positives with zero labeled false merges; independent evidence remains open.
- Updated TASKS/RANKING; archived iteration 327 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests; production grouping remains off.
- Verification: targeted studio suite 6/6; `pnpm format`, `pnpm lint:fix`, `pnpm check` (211 unit/172 integration), `pnpm build`, recorded grouping evaluator and `git diff --check` passed.
- API/worker restarted for runtime code; all four services active, health database/Redis OK, app/docs/db HTTP 200. Retained real edition: four topics, 20 stories and 10 X posts.
- Next: scheduled evidence/acks take priority, then eligible social activation; independently reviewed grouping evidence remains open.

## 2026-11-03: iteration 342 — historical excerpt closure qualifiers

- Started clean on main; no leftover work. Services/health healthy, 32 sources without current errors and no failed digest jobs; Nov 3 15:00 UTC evidence pending.
- Default-off grouping rejects historical qualifiers before closure assertions in the same excerpt sentence. A separate founding sentence does not date the closure. Synthetic regressions check symmetry and identical historical excerpts.
- Recorded grouping remains 13/32 positives and zero labeled false merges; independent evidence remains open. Production grouping stays off.
- Updated TASKS/RANKING; archived iteration 328 to bound PROGRESS. No source/schema/UI changes, paid calls or Reddit requests.
- Verification: targeted studio suite 7/7; `pnpm format`, `pnpm lint:fix`, `pnpm check` (212 unit/172 integration), `pnpm build`, `pnpm exec tsx scripts/evaluate-event-grouping.ts --studio-closures` and `git diff --check` passed.
- API/worker restarted for runtime code; four services active, health database/Redis OK; app/docs/db HTTP 200. Retained real edition: four topics, 20 stories and 10 posts.
- Next: scheduled evidence/acks take priority, then eligible social activation; independently reviewed grouping evidence remains open.

## 2026-11-03: iteration 343 — structured request and job logging

- Started clean on main; health/services green, 32 sources without current errors and no failed digest jobs. Two retained ingestion failures have recovered sources. Scheduled Nov 3 evidence still pending; production gates remain off.
- Advanced approved background O1 while activation/independent grouping evidence is blocked: Pino JSON logs for API requests/Nest errors and all four worker queues, generated request IDs, isolated async job context, attempts, duration and failure stacks.
- Redaction removes credential fields and configured secret values, including messages/stacks/causes. Fatal exceptions/rejections log synchronously and exit unsuccessfully. Synthetic subprocess tests verify failure behavior; no production crash induced.
- Added read-only `scripts/check-observability.ts`, owner handbook page and O1 progress. External-call logging remains before O1 completion; no extra monitoring services/storage installed. Archived oldest progress entry.
- Verification: logging tests 4/4; `pnpm format`, `pnpm lint:fix`, `pnpm check` (216 unit/172 integration), `pnpm build`, handbook page check and `git diff --check` passed.
- API/worker restarted for runtime changes. Observability checker found request and heartbeat JSON; API/worker ~46/41 MiB and startup-average CPU ~1.7/1.5% each. App/docs/db HTTP 200; health DB/Redis OK; retained real edition four topics/20 stories/10 X posts.
- No paid calls or Reddit requests. Next: scheduled evidence/acks first; otherwise finish O1 external-call instrumentation while production activation remains gated.

## 2026-11-03: iteration 344 — feed and Hacker News call logs

- Started clean on main; no leftover work. Services/health healthy, 32 sources without current errors and no failed digest jobs. Nov 3 scheduled evidence remains pending; production selection gates stay off.
- Advanced approved background O1: shared feed/HN HTTP attempts log target category, status, duration and success/redirect/failure with inherited job/request context. Cache hits produce no call entry; every redirect hop is recorded. URLs, bodies and provider error messages are omitted.
- Mocked HTTPS tests verify success, cache reuse, 429, redirects, HTTP/transport failures, context and omission of private URL/body values. No live test calls, paid calls or Reddit requests.
- Updated handbook, observability plan/checker and TASKS; archived iteration 330. O1 remains open for other providers, budget decisions and edition steps.
- Verification: targeted tests 4/4; `pnpm format`, `pnpm lint:fix`, `pnpm check` (217 unit/172 integration), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 09-observability` and `git diff --check` passed.
- Restarted worker only (runtime code changed). Four services active; health DB/Redis OK; app/docs/db HTTP 200. Retained real edition: four topics, 20 stories, 10 posts.
- `pnpm exec tsx scripts/check-observability.ts` passes request/job checks; journal sample has zero new external-call entries (mock coverage is not live evidence). API/worker ~48/40 MiB, startup-average CPU ~0.3/1.8%; no added services/storage.
- Next: scheduled evidence/acks first; otherwise remaining O1 providers while production activation remains gated.

## 2026-11-03: iteration 345 — Anthropic attempt telemetry

- Started clean on main; no leftover work. Health/services green, 32 sources without current errors and no failed digest jobs; two retained ingestion failures have recovered sources. Scheduled evidence remains pending.
- Advanced approved background O1: Anthropic attempts log model/purpose/run, attempt, duration/outcome, failure HTTP status and successful token usage/computed microdollar cost. Each retry is separate; ledger remains authoritative. No prompts, generated text, SDK errors or provider bodies logged.
- Fake retry test verifies context, usage/cost matching settlement and omission of private content/key. Existing fake suites cover spend limits, transport failures and bounded retries. No paid calls or Reddit requests; production selection flags unchanged.
- Updated handbook/plan/TASKS; archived iteration 331. O1 remains open for remaining providers, budget decisions and edition steps.
- Verification: targeted LLM tests 20/20; `pnpm format`, `pnpm lint:fix`, `pnpm check` (217 unit/172 integration), `pnpm build`, handbook 09 check and `git diff --check` passed. First check caught archive formatting introduced during checks; formatted and reran successfully.
- API/worker restarted for changed runtime adapter; health DB/Redis OK and app/docs/db HTTP 200. Real retained edition: four topics/20 stories/10 posts. `scripts/check-observability.ts` passes; six external entries in journal sample are not live Anthropic verification. No added services/storage.
- Next: scheduled evidence/acks first; otherwise continue remaining O1 provider instrumentation while activation remains gated.

## 2026-11-03: iteration 346 — distinguish official X embed calls

- Started clean on main; health/services green, 32 sources without current errors and no failed digest runs reported. Scheduled evidence remains pending; production selection flags unchanged.
- Fixed O1 categorization: official X oEmbed network attempts use `x-oembed` instead of `feed`, preserving status, duration, failures and job context. Cache reuse adds no call; URLs and response bodies remain omitted.
- Mocked tests cover success/404/cache/context, HN classification and lookalike host/path rejection. HTTP success does not imply subsequent embed validation success. No paid calls or Reddit requests.
- Updated owner handbook, plan/TASKS and observability checker with per-target counts. No extra services or storage.
- Verification: targeted HTTP tests 2/2; `pnpm format`, `pnpm lint:fix`, `pnpm check` (218 unit/172 integration), `pnpm build`, handbook 09 check, checker and `git diff --check` passed. Initial targeted command caught a mock Buffer error (fixed) and isolation guard rejection (integration test rerun through full check).
- Restarted worker for runtime change; health DB/Redis OK, app/docs/db HTTP 200; retained real edition four topics/20 stories/10 posts. Checker sample: 10 feed calls, zero X embeds (mock verification only); API/worker ~47/41 MiB, startup-average CPU ~0.5/1.9%.
- Next: scheduled evidence/acks first; otherwise remaining O1 providers, budget decisions and edition steps while activation remains gated.

## 2026-11-03: iteration 347 — redacted xAI attempt logs

- Started clean on main; no leftover work. Four app services/health green, 32 sources without current errors and no failed digest jobs; scheduled Nov 3 evidence remains pending.
- Advanced approved background O1: direct xAI attempts log model/search type, HTTP status, elapsed time, outcome and safe failure reason; successful validated responses include token/fetched-item/citation counts. Discovery ledger remains authoritative for cost.
- Synthetic tests cover success, credit exhaustion, rejection, server error, malformed JSON/usage, transport and stream failures, inherited job context and omission of key/prompt/provider text. Local request rejection logs no external attempt. No paid calls or Reddit requests; production gates unchanged.
- Updated handbook, observability plan/checker and TASKS; O1 remains open for Bluesky, budget decisions and edition steps.
- Verification: targeted test 1/1; `pnpm format`, `pnpm lint:fix`, `pnpm check` (219 unit/172 integration), `pnpm build`, handbook 09 check and `git diff --check` passed. Initial test found nonexistent context helper and token-field redaction; fixed by using real job wrapper and numeric usage fields.
- Restarted worker for runtime change; health/docs/db HTTP 200, retained real edition four topics/20 stories/10 posts. Observability request/job checks pass; sampled 14 feed calls, zero xAI calls (synthetic verification only). No added services/storage.
- Next: scheduled evidence/acks first; otherwise remaining O1 instrumentation while activation remains gated.

## 2026-11-03: iteration 348 — redacted Bluesky attempt logs

- Started clean on main; no leftover work. Four app services/health green, 32 sources without current errors and no failed digest jobs. Scheduled evidence remains pending; retained ingestion failures have recovered sources.
- Advanced approved background O1: Bluesky login/refresh/search attempts log HTTP status, duration and outcome with inherited context. Waiting/session reuse adds no attempt. No credentials, queries, URLs, response content or provider exception text logged.
- Synthetic tests cover refresh, successful search, HTTP rejection, malformed JSON, transport/stream failure, local rejection and redaction/context. No live provider calls, paid calls or Reddit requests; production gates unchanged.
- Updated handbook, observability plan/checker and TASKS; archived iteration 333. O1 budget decisions and edition steps remain open.
- Verification: targeted Bluesky tests 7/7; `pnpm format`, `pnpm lint:fix`, `pnpm check` (220 unit/172 integration), `pnpm build`, handbook 09 check and `git diff --check`. Initial full check caught archive formatting after file rename; formatted and reran.
- Restarted worker for runtime change; health/docs/db HTTP 200, 32 sources without errors, zero failed digest jobs. Retained real edition four topics/20 stories/10 posts. Observability request/job checks pass; sampled 19 feed attempts and zero Bluesky attempts (synthetic verification only). No added services/storage.
- Next: scheduled evidence/acks first; otherwise continue remaining O1 instrumentation while activation remains gated.

## 2026-11-03: iteration 349 — Anthropic budget outcome logs

- Started clean on main; no leftover work. Four app services/health green, 32 sources without current errors and zero failed digest jobs; scheduled evidence still pending.
- Advanced approved background O1: Anthropic budget admissions/refusals include estimate/attempt; settlements include cost; provider failures distinguish released and uncertain holds. Entries follow successful ledger operations and inherit job/run context.
- Offline tests cover refusal, repair admission, settlement, cache omission, provider limit, uncertain failure, ledger error and content omission. Refusal causes are deliberately not inferred; ledger remains authoritative. No paid calls or Reddit requests; production gates unchanged.
- Updated handbook/plan/TASKS and journal checker; archived iterations 334–335. Discovery/reserve decisions and edition steps remain before O1 completion; no new services/storage.
- Verification: targeted LLM tests 21/21; `pnpm format`, `pnpm lint:fix`, `pnpm check` (221 unit/172 integration), `pnpm build`, handbook 09 check and `git diff --check` passed.
- Restarted worker for runtime change; health DB/Redis OK, docs/db HTTP 200. Retained real edition has four topics/20 stories/10 posts. Journal request/job checks pass; zero budget events in live sample (offline verification only). API/worker sampled 52/44 MiB, startup-average CPU 0.1/1.5%; no added services/storage.
- Next: scheduled evidence/acks first; otherwise remaining O1 discovery/reserve budget and edition instrumentation while activation remains gated.

## 2026-11-03: iteration 350 — X discovery budget outcome logs

- Started clean on main; no leftover work. Four app services/health green, 32 sources without current errors and no failed digest jobs; retained ingestion failures have recovered sources. Scheduled evidence remains pending.
- Advanced background O1: X discovery admissions/refusals log estimates and run/topic IDs/search type; settlements log billed cost; failures distinguish released/uncertain holds and provider credit blocks. Entries follow successful ledger operations; refusal causes are not inferred.
- Offline test covers ten cases including credit exhaustion, uncertain errors, failed ledger operations, citation persistence failure and higher input pricing; request content and provider error text omitted. No paid calls or Reddit requests; production gates unchanged.
- Updated handbook, observability plan/checker and TASKS. Reserve decisions and edition steps remain before O1 completion; no new services/storage.
- Verification: targeted test 1/1 (ten cases); `pnpm format`, `pnpm lint:fix`, `pnpm check` (222 unit/172 integration), `pnpm build`, handbook 09 check and `git diff --check` passed. Archived iteration 336 to keep this file below 25 KB.
- Restarted worker for runtime change; health DB/Redis OK, docs/db HTTP 200. Real retained edition has four topics/20 stories/10 posts. `pnpm exec tsx scripts/check-observability.ts` passed request/job checks; zero live X budget events (offline verification only), no extra services/storage.
- Next: scheduled evidence/acks first; otherwise O1 reserve-budget decisions and edition steps while production activation remains gated.
