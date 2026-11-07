# Progress

Earlier entries: [iterations 1062–1069](docs/progress-archive/2026-11-07-iterations-1062-1069.md).

Earlier entries: [iterations 1070–1074](docs/progress-archive/2026-11-07-iterations-1070-1074.md).

Earlier entries: [iterations 1075–1084](docs/progress-archive/2026-11-07-iterations-1075-1084.md).

## 2026-11-07: iteration 1089 — close the owner-approved reader length trial

- Clean main at owner steering commit 0ad78f68 No leftovers; followed new item 47 step 1 before rehearsals. No generation/editor changes.
- pnpm obs alerts clear; /healthz DB/Redis OK, services --check 13 healthy and sources --check 36 healthy. Read-only scheduled report: zero failed jobs; latest Nov 6 completed, next Nov 7 15:00 UTC.
- Updated length smoke to 5.2 screens at 1440×1100 and UI spec; removed resolved owner blocker, closed item 46 and its Current order line, queued item 47 rehearsals in TASKS.
- pnpm exec tsx scripts/smoke-reader-length.ts passes both themes with all 17 posts/16 X embeds: Tech/NBA/Gaming/World 4.94/4.42/4.98/2.03 screens; every post page-reachable without an inner scrollbar. Refreshed eight loaded screenshots and reviewed Gaming light visually.
- pnpm exec tsx scripts/smoke-reader-layout.ts initially found stale outlet-only assertion from 1081; corrected it to include article count. Rerun passes all four device/theme views; refreshed layout screenshots. No content shortened/hidden/capped.
- pnpm format, pnpm lint:fix and pnpm build pass (existing bundle warning only); full pnpm check passes: 538 unit/226 isolated integration tests, typecheck/lint/format/boundaries green. No schema/source/system-flow changes, provider spend or edition writes; handbook/SOURCES unchanged.
- systemctl --user restart news-digest-api.service news-digest-worker.service completed outside protected window; curl /healthz passes DB/Redis, pnpm obs alerts clear and services --check all 13 healthy. Disk 66%; no rehearsal files/containers created.
- Initial push rejected (owner added ff9f224f/221524f5); merged origin/main without rewriting history, preserving both the item-47 ack and new owner item 48. Only append conflict in STEERING; no runtime changes from upstream. TASKS queues alert logging after rehearsal/scope work, before publisher branch.
- Next: item 47 exactly four isolated failure rehearsals, then scratch backup rebuild and M6/M7 scope settlement. Nov 7 production review takes priority once published; no paid experiments or editor changes before it.

## 2026-11-07: iteration 1090 — rehearse a worker missing the morning slot

- Clean main/no leftovers. Alerts clear; /healthz DB/Redis OK, 13 services and 36 sources healthy. Read-only scheduled report: no retained failures, Nov 6 completed; next Nov 7 15:00 UTC.
- Item 47 step 2 case 1 added to scheduled-digests integration tests: disposable Redis cron slot matures with no worker, then a replacement processes it through real publication and scheduled-budget orchestration. No production processes, queues or data used for rehearsal.
- Assertions: exactly one completed job/publication/saved edition; original scheduled coverage window; reserve succeeded; reader controller/schema returns synthetic story with source text; zero ledger calls. Non-AI adapter selected explicitly, provider keys empty. This does not rehearse a paid request or mid-run crash.
- Initial pnpm check: typecheck/lint/format/boundaries, 538 unit and 226 existing integration tests passed; new rehearsal failed on fixture cleanup. Targeted isolated retries corrected observation cleanup, interval-vs-cron slot metadata and immutable-edition deletion. Disposable database teardown now owns fixture rows.
- Final targeted disposable run (temporary copy of scripts/test-isolated.ts selecting scheduled-digests.test.ts): 3/3 pass including case 1; temporary runner removed, containers cleaned. Passed case not rerun, per item 47. No runtime change required.
- pnpm build passes (existing bundle warning). Final format/lint/typecheck verification and service checks recorded below. No UI/schema/source/system-flow changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged. Disk 66%; no provider spend.
- Remaining: exactly three named cases (worker dies mid-run, Anthropic unavailable, all X searches fail), then scratch rebuild and M6/M7 settlement. Nov 7 production acceptance takes priority at publication.
- Final pnpm format, pnpm lint:fix, pnpm typecheck and git diff --check pass. API/worker restarted outside protected window; /healthz passes after startup retry, 13 services healthy and alerts clear. Only production Postgres/Redis containers remain.

## 2026-11-07: iteration 1091 — rehearse worker death during publication

- Clean main/no leftovers. Initial alerts clear, /healthz DB/Redis OK, 13 services/36 sources healthy; scheduled queue has zero retained failures and next slot Nov 7 15:00 UTC.
- Item 47 step 2 case 2: disposable worker subprocess reaches publishing while holding the database lock; parent sends SIGKILL. Real BullMQ stalled-job recovery redelivers to a replacement worker using real scheduled-budget/publication orchestration, with non-AI fallback explicitly selected and provider keys empty.
- Pass: one completed job, exactly two attempts started, one saved edition/publication, original window and synthetic source text readable through reader controller; reserve attempt 2 succeeds, zero provider calls/charges. No runtime fix required; this case does not interrupt an in-flight paid provider request.
- Both named rehearsals now opt in with MORNING_REHEARSAL_CASE=absent or dies, so routine integration runs do not repeat passed cases. Exactly Anthropic-unavailable and all-X-fail cases remain; no additional cases added.
- pnpm format and pnpm lint:fix pass. MORNING_REHEARSAL_CASE=dies pnpm check passes typecheck/lint/format/boundaries, 538 unit tests and 227 integration tests; worker-absent case skipped as instructed. pnpm build passes with existing bundle warning. git diff --check clean.
- API/worker restarted outside protected window; curl /healthz DB/Redis OK, pnpm obs alerts clear, services --check 13 healthy. Disposable containers cleaned; only production Postgres/Redis remain, disk 66%. No production queue/data disruption, provider spend or UI/schema/source/system-flow changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- Next: remaining two isolated rehearsals, scratch backup rebuild, then M6/M7 settlement and alert dispatcher. Nov 7 15:00 production acceptance takes priority once published; no editor changes or experiment reruns.

## 2026-11-07: iteration 1092 — rehearse Anthropic unavailability

- Clean main/no leftovers. Alerts clear; /healthz DB/Redis OK, 13 services and 36 sources healthy. Scheduled queue has zero failed jobs; next Nov 7 15:00 UTC.
- Item 47 step 2 case 3: disposable Redis cron job invokes real scheduled-budget, BudgetedLlm, CandidateTriage and publication with a fake throwing provider and empty API keys. Exactly one edition/event/completed job; synthetic source summary readable through reader controller, original window and succeeded reserve.
- Duplicate delivery returns the immutable edition without additional provider attempts or ledger rows. Every failed call remains uncertain with null charged cost and a positive reservation, deliberately protecting against transport failures after provider completion. No real requests or charges; no runtime fix required.
- pnpm format, pnpm lint:fix and pnpm build pass (existing bundle warning). MORNING_REHEARSAL_CASE=anthropic pnpm check passes static checks and 538 unit tests; integration 226 pass/one new failure/two prior rehearsals skipped. Failure was checking editorial metadata through reader schema, which omits it; changed assertion to saved snapshot.
- Final targeted disposable run: MORNING_REHEARSAL_CASE=anthropic pnpm exec tsx scripts/test-rehearsal-1092.ts passes 3/3, two previous cases skipped. Temporary runner selected scheduled-digests.test.ts from scripts/test-isolated.ts; removed afterward. Passed cases not rerun. No UI/schema/source/system-flow changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged.
- Final pnpm format, pnpm lint:fix, pnpm typecheck and git diff --check pass. API/worker restarted outside protected window; /healthz DB/Redis OK, 13 services/36 sources healthy and alerts clear. Only production containers remain; disk 66%. Remaining: all-X-fail rehearsal, scratch backup rebuild, M6/M7 scope settlement, alert dispatcher. Nov 7 production acceptance takes priority at publication; no editor changes or paid experiments.

## 2026-11-07: iteration 1093 — rehearse every X search failing

- Clean main/no leftovers. Initial alerts clear; /healthz DB/Redis OK, 13 services/36 sources healthy, no failed scheduled digest jobs; next slot Nov 7 15:00 UTC.
- Item 47 step 2 case 4 extends the existing isolated publication rehearsal: real scheduled-X runtime/repository/ledger reject all four topics through a fake provider, then real BullMQ/budget/publication orchestration saves one readable non-AI edition. Empty provider keys; synthetic source text, no fabricated posts.
- Four failed calls have zero charged cost and no held budget. Duplicate scheduler delivery adds no provider attempts/ledger rows; duplicate publication returns the immutable edition, exactly one publication/completed job and succeeded edition reserve. Explicit provider rejections rehearsed; no real external requests or runtime fix required.
- Shared rehearsal setup selects only MORNING_REHEARSAL_CASE=x; three previously passed named cases skipped, not rerun. All four owner-requested failure cases now pass.
- pnpm build passes (existing bundle warning). MORNING_REHEARSAL_CASE=x pnpm check: static checks/538 unit tests/new rehearsal pass; four later ledger tests failed because rehearsal rows survived in the shared disposable DB. Added explicit X-ledger teardown. Final pnpm test:integration: 226 pass, zero failures, all four passed rehearsals skipped; no case rerun.
- No UI/schema/source/system-flow changes; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged. Next: scratch backup rebuild, M6/M7 scope settlement, alert dispatcher; Nov 7 production acceptance takes priority once published.
- Final pnpm format/pnpm lint:fix and git diff --check pass; API/worker restarted outside protected window, /healthz DB/Redis OK, 13 services healthy and alerts clear. Rehearsal containers cleaned; disk 66%. Final pnpm typecheck passes. Archived iterations 1075–1084 to keep PROGRESS.md below 25 KB.
