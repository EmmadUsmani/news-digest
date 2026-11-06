## 2026-11-06: iteration 918 — call-scoped AI failure outcomes

- Started clean on main; no leftover work. Alerts clear, health green, 36/36 sources healthy and no failed digest jobs. X round and edition review await their windows.
- Added typed JSON outcomes for budget refusal, provider spend limit, transport failure, exhausted validation and repair input limit; successful outcomes retain validated values.
- Coalesced requests share the outcome, including across run IDs; nullable callers keep existing behavior. Refusals do not poison later funded calls, and cached success remains usable without funds.
- This is the shared evidence path for item 40, not saved Bluesky attribution yet. No paid calls, selection, prompt, collection, cap or schema changes.
- Added offline coverage for coalesced causes, mixed old/new callers, later funding, cached success and a refused repair. Targeted llm.test.ts: 27 passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check (533 unit/223 isolated integration tests); pnpm build; git diff --check. All passed.
- Restarted API/worker/docs/schema; all active, /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear.
- TASKS condensed; handbook/SOURCES/NEEDS_FROM_HUMAN unchanged because this is internal result plumbing.
- Next: carry jsonOutcome through social triage/editor and persist Bluesky budget-refused results; then item 41 alerts. Nov 6 review after publication, X round after 21:00 UTC; reserved slot and fixed search stay off.

## 2026-11-06: iteration 919 — save Bluesky budget-refusal outcomes

- Started clean on main; no leftover work. Alerts clear, health green, 36/36 sources healthy and zero failed digest jobs. Edition review/X round await their windows.
- Carried call-scoped AI outcomes through social triage and editor fallback into saved Bluesky selection evidence; inspector now labels budget refusal explicitly.
- Mixed validation/refusal reports editing failure, successful Haiku recovery stays complete, and legacy nullable adapters retain unknown causes. No inference from shared diagnostics.
- Added offline coverage for exact refusals, mixed failures, fallback recovery, cached triage preservation and saved-schema round trips. No paid calls, prompts, selection, collection or budget changes.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 05-social-posts; smoke-bluesky-outcomes.ts; git diff --check. All passed: 535 unit/223 isolated integration tests.
- Browser passed saved compatibility and nine synthetic states at desktop/mobile widths; inspected updated screenshots. Handbook limit initially caught 101 lines; shortened and passed.
- Updated TASKS/affected handbook; archived iterations 905–906. SOURCES/NEEDS_FROM_HUMAN unchanged because collection and owner requirements are unchanged.
- Rebuilt/restarted API/worker/docs/schema; all active, /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy, no failed digest jobs and alerts clear.
- Next: item 41 durable saved-edition alerts, then per-post validation. Nov 6 review after publication; X round after 21:00 UTC. Reserved slot and fixed X stay off.
