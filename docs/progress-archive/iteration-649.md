## 2026-11-04: iteration 649 — wire bounded opt-in story grouping

- Started clean on main; no leftover work. Healthz healthy, zero alerts, 36 active sources without current errors and fresh ingestion.
- Replayed the saved same-story evaluation without calls: frozen-label precision 141/141, recall 141/157, zero clearly unrelated/one borderline merged pair; supplemental reviewed gate remains 155 pairs.
- Added default-off publication composition (`LLM_STORY_GROUPING_ENABLED=1` to opt in): group only the existing ten-item semantic shortlist after complete triage, then edit ranked explicit memberships through the shared ledger/cache and edition run identity.
- Invalid/overlapping membership, provider failure or refused budget preserves separate articles. No title rules, transitive joins, extra candidates, repairs or coverage score bonuses; immutable coverage links survive editing/storage.
- Fake tests cover configuration, inputs, failure and coverage; isolated publication regression checks persisted grouped coverage. Updated TASKS/RANKING and handbook pipeline; archived iterations 632–633. No schema/UI/source changes or paid calls.
- Verification: targeted grouping tests 16/16; pnpm format, pnpm lint:fix, pnpm check (395 unit/206 isolated integration), pnpm build, edition-pipeline handbook check (17 pages/one unchanged diagram/25 tables) and git diff --check passed.
- Restarted API/worker; both active, healthz database/Redis healthy, latest four-topic edition readable and zero alerts. Confirmed production grouping switch absent/default off; incremental triage remains off.
- Next: activate evaluated grouping for Nov 5 under item 27 after checking admission/headroom, then capture real grouped edition/screenshots; continue World/open-X quality and reserve-safe incremental assessment. NBA live full-AI acceptance awaits the next scheduled run.
