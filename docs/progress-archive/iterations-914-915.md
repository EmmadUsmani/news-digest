## 2026-11-06: iteration 914 — historical Bluesky attribution

- Started clean on main; no leftover work. Alerts clear, /healthz green and 36/36 sources healthy. X round waits until 21:00 UTC; Nov 6 edition not yet due.
- Completed STEERING 40's one-pass Nov 4–5 worker journal/ledger/snapshot reconciliation; saved review and owner ack. No paid calls, collection or edition writes.
- NBA/Gaming had no slots both days. Nov 4 World exhausted four attempts; Tech recovered with Haiku repair and one pick. Nov 5 Tech Sonnet returned no picks; World Sonnet was refused before dispatch, then Haiku initial/repair failed.
- Refusal was not insufficient scheduled reserve; exact model-allocation/blocked-ledger decision inputs were not logged. Historical candidate counts/rejected text remain unavailable; investigation closed as instructed.
- Assertions passed for both snapshots' X counts, all 11 settled editor calls and $0.045524 total. Private extracts retained 700/600 under ~/.local/state/news-digest/bluesky-history-914/.
- Updated TASKS, SOURCES and STEERING ack; production behavior unchanged, no handbook or owner-input change needed.
- Verification: pnpm format; pnpm lint:fix; pnpm check; pnpm build; git diff --check. All passed: 528 unit/223 isolated integration tests, typecheck/lint/format/boundaries and build.
- Rebuilt/restarted API, worker, docs and schema; health and reader checks recorded at deployment.
- Next: persist per-topic Bluesky outcomes and admin inspector line before 13:00 UTC if ready; Nov 6 edition review after publication, X comparison after 21:00 UTC. Fixed X stays off.

## 2026-11-06: iteration 915 — save Bluesky selection evidence

- Started clean on main; no leftover work. Alerts clear, health green and 36/36 sources healthy; X testing and edition review await their windows.
- New edition snapshots retain per-topic open slots, observations read, shortlisted candidates, picks and selection result. Full slots now save no-slot rather than looking like a successful empty edit.
- Results distinguish switched-off, no candidates, nothing passed triage, deliberate editor omission, picks, invalid/incomplete AI and unavailable AI. Existing selections and reader behavior are unchanged.
- Unavailable AI still combines budget refusal and other editor failures: exact budget result and inspector remain open. No guessed attribution, paid calls, collection/query/cap changes or edition writes.
- Added fixture checks for counts, empty paths, unavailable AI and schema round-trip/older missing fields. Initial integration run found three golden diffs; added diagnostic expectations and fixed no-service/full-slot attribution. Updated source table/handbook; archived 901–902.
- Verification: pnpm format; pnpm lint:fix; pnpm check (529 unit/223 isolated integration tests); pnpm build; handbook social-posts check; git diff --check. All passed on final run.
- Restarted API/worker/docs/schema, all active; /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy, alerts clear and zero failed digest jobs.
- Next: propagate precise budget refusal through editor/triage outcomes, then inspector; item 40 per-post validation follows. Reserved slot stays unbuilt/off; Nov 6 review after publication and X round after 21:00 UTC.
