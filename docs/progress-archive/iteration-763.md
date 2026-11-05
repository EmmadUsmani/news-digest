## 2026-11-05: iteration 763 — restore reader X-widget replay

- Started clean on main; no leftover work. Alerts zero and /healthz database/Redis green; Nov 5 scheduled edition remains due at 15:00 UTC.
- X-widget verifier now replays recorded selected posts through the reader contract/API rather than the legacy operational preview. Removed obsolete editorial/context expectations; verifies saved story titles/text, sanitized posts, blocked writes and unchanged saved edition.
- `pnpm exec tsx scripts/smoke-posts.ts /tmp/135-screen.jsonl` passed success, blocked-script retry, timeout retry and late-promise cleanup on desktop/mobile. Four screenshots refreshed; desktop/mobile blocked cards visually inspected. Posts are recorded replay; widgets are stubs, no live inference or publication.
- TASKS/Operations updated; archived iteration 747. SOURCES/NEEDS_FROM_HUMAN unchanged. No runtime/config/schema or model/provider changes; healthy services remain running under STEERING 22.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check` (497 unit/214 isolated integration, zero failures), `pnpm build`, `check-handbook.ts 08-operations` and `git diff --check` passed. Final /healthz green.
- Next FIRST: Nov 5 NBA/grouping/cost/latency review at 15:00 UTC; investigate repeated fallback before scorer. X rounds after 21:00 UTC Nov 5/6; coordinated admin migration while waiting.
