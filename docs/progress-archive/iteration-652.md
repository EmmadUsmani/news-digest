## 2026-11-04: iteration 652 — give Bluesky editing cross-platform context

- Started clean on main; no leftover work. Zero alerts, healthy database/Redis, 36 active sources without current errors and four available queues.
- Nov 4's duplicate X/Bluesky pick exposed isolated editing: Bluesky had no visibility of existing picks. Added existing text/platform/author context, capped at 20 posts with 1,200-character text/200-character authors; no extra provider calls.
- Explicit semantic guidance avoids repeated announcements/clips/moments across platforms while permitting distinct developments. Existing picks remain immutable; only candidate IDs pass validation. Prompt fingerprints include context, isolating cached choices.
- Fake tests cover edition-to-editor propagation, context bounds, changed-context cache misses, repeat-context hits and refusal of non-candidate IDs. No paid calls, source requests, new editions or UI changes; actual duplicate reduction remains unmeasured.
- Updated TASKS/SOURCES and affected social handbook; archived iteration 636; corrected stale preparation-only/synthetic-only descriptions using the saved Nov 4 review.
- Verification: targeted editor/edition tests 16/16; pnpm format, pnpm lint:fix, pnpm check (396 unit/207 isolated integration), pnpm build, social handbook check (17 pages/one unchanged diagram/25 tables), git diff --check.
- Restarted API/worker; both active, healthz database/Redis healthy, saved four-topic Nov 4 edition readable, fresh ingestion through 15:48 UTC, zero alerts/failed user services.
- Next: scheduled discovery yield and Nov 5 grouping/cost/latency/screenshots; NBA full-AI, World coverage and live cross-platform duplicate behavior remain open.
