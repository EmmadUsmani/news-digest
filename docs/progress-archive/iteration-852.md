## 2026-11-05: iteration 852 — publish a domain event through a log notification port

- Started clean on main; no leftover work. Alerts/health green, 36 sources healthy and digest queue zero failures. X rounds await 21:00 UTC; admin rollout awaits identity/proxy evidence.
- Completed M7 publication event slice: DigestPublished carries edition/profile/window metadata through a notification port to the application log, after transaction commit. No email/external delivery, content text or paid calls.
- Reused editions emit no new event; failed transactions emit none. Notification errors log only the edition ID and preserve successful publication. Best-effort logging has no durable outbox/replay guarantee.
- Extended existing isolated scheduled tests: independent-connection read proves commit visibility, concurrent/later retries emit once, manual regeneration emits separately, rollback emits nothing. Added failure containment/redaction unit check.
- Initial lint caught async-without-await in the log adapter; corrected to return a resolved promise. Final pnpm check passed 499 unit/214 isolated integration tests; pnpm build passed.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; check-handbook.ts 03-jobs-and-schedules (18 pages/2 diagrams, schema metadata green); git diff --check; smoke-admin-gate.ts; /healthz; obs alerts/health/sources/jobs. Unsupported sources --limit removed on rerun.
- API/worker restarted active and healthy; saved Nov 5 reader edition byte-identical before/after, alerts clear, all 36 sources healthy, zero failed digest jobs. No UI/schema/source changes; screenshots, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Updated TASKS and Jobs handbook. Next: fresh-window X rounds after 21:00 UTC Nov 5/6, scheduled editor-v5 evidence Nov 6; unfinished/failed-job durable history remains open.
