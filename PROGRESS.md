# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

## 2026-11-10: iteration 1753 — complete scheduled export-alert rehearsal

- Recovered and finished three uncommitted files from the interrupted 1744 iteration. Initial alerts zero; health, 14 services and 36 sources pass. Recent Gamingbolt timeout alert resolved, with source success at 22:46 UTC; digest queue has zero failures.
- Disposable Grafana and isolated Postgres with synthetic credentials pass exact provisioned SQL/threshold cases. Unchanged one-minute evaluation/five-minute pending settings: missing capture and revoked reader SELECT each reach pending then firing; fresh capture and restored grant each clear the alert. SMTP disabled; no live provisioning or public flag change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration/four expected skips), `pnpm build`, `pnpm exec tsx scripts/check-handbook.ts 09-observability`, and `git diff --check` pass.
- Live account boundary 32 checks pass; scheduled reader four topics/19 stories/15 posts. Item 54 Sonnet trials still await UTC shared-cap reset; no paid call. Next: finish bounded Sonnet trials before Nov 11 noon, natural link expiry after 00:33 UTC, then scheduled NBA acceptance. Export alert capacity, live installation and public query-route checks remain.
- First push rejected because the lead advanced origin/main with a reliability note; fetched, merged cleanly and pushed `c8d408e6` without rewriting history. API/worker/docs/schema restarted; post-restart health, 14 services, zero alerts and published reader pass. Working tree clean.

## 2026-11-10: iteration 1754 — prepare bounded NBA Sonnet continuation

- Clean main; no inherited work. Initial API scrape alert was pending immediately after an API restart, then cleared; direct metrics and `/healthz` returned 200. Health/database/Redis, all 14 services and 36 sources pass. Digest queue has zero failed runs.
- Added one-time post-UTC-reset continuation for owner item 54. It requires the saved original trial, exact seven settled ledger calls/$0.044978, original NBA input, fresh exclusive claim, Nov 11 pre-noon window and $0.25 cumulative reservation ceiling. It saves raw responses and per-run diagnostics privately; no cache or edition writes.
- Verification: standalone strict TypeScript check, `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit pass; 281 integration pass/four expected skips), `pnpm build`, `git diff --check` pass. Live reader: four topics/19 stories/15 posts; account boundary: 32 pass.
- No provider call, guard, prompt or publication change. Original claim remains untouched. Next: run the continuation after UTC reset, decide whether supported paraphrase needs a computable guard fix, and verify the natural link expiry after 00:33 UTC.

## 2026-11-11: iteration 1755 — run post-reset NBA Sonnet continuation

- Clean main; zero active alerts, `/healthz` and database/Redis healthy, 36 sources healthy, digest queue zero failures. Previous 1754 work was committed and pushed; no leftovers.
- One-time owner-authorized continuation made four Anthropic calls. Run 2 Sonnet initial rejected a supported Charlotte/Brandon Miller paraphrase (`unsupported-absence`); Sonnet repair validated. Run 3 Sonnet was refused by the local reservation ceiling; Haiku initial fenced JSON failed, repair validated. The original run 1 validated on Haiku.
- New settled spend $0.064449; item 54 total $0.109427/$0.25 across eleven settled calls. Private claim/responses kept. No guard, prompt, cache or publication change.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit pass; 281 integration pass/four expected skips), `pnpm build`, `git diff --check` pass. Live Nov 10 scheduled reader: four topics/19 stories/15 posts; `/healthz` passes.
- Next: implement a computable supported-paraphrase guard correction, preserve the “no return timeline” failure, confirm with one bounded replay and deploy before Nov 11 noon. Natural sign-in-link expiry check is due after 00:33:01 UTC; Nov 11 scheduled NBA acceptance follows.
- First push rejected because the lead advanced origin/main; fetched and merged without rewriting history. Merged alert check passed. Lead's observability page reached 101 lines; shortened one sentence, then reran the handbook check before push.

## 2026-11-11: iteration 1756 — accept sourced NBA injury rewrites

- Clean main at start; no leftovers. Zero active alerts, health/database/Redis good, 14 services and 36 sources healthy, and zero failed digest jobs.
- NBA summaries accept the saved Brandon Miller rewrite only when one evidence sentence matches the attributed coach, player, injury and qualified expectation. The real invented “no return timeline” still fails; headlines and other fields retain their checks.
- Offline saved Sonnet initial now reaches a separate Porzingis headline rejection (the rewrite drops the draft-pick qualification). Saved Sonnet repair validates five stories/four bullets. No provider or edition writes; item 54 remains $0.109427/$0.25.
- Verification: editor tests 26/26; `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration, four expected skips), `pnpm build` and `git diff --check` pass. `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics/19 stories/15 posts.
- Fast-forwarded two upstream lead-doc commits; push and restart API/worker, then recheck health, reader, services, sources and queue.
- Next: natural sign-in-link expiry after 00:33:01 UTC and Nov 11 scheduled NBA acceptance after the 15:00 UTC generation run.

## 2026-11-11: iteration 1757 — verify natural sign-in link expiry

- Clean main at start; no leftovers. `pnpm obs alerts`, service/source checks and `/healthz` pass: no active alerts, 14 healthy services, 36 healthy sources, database/Redis up, and zero failed digest-generation jobs.
- After the stored deadline, `pnpm exec tsx scripts/check-live-link-expiry.ts --live verify` passed against the deployed API. The naturally expired disposable link returned HTTP 401 with no cookie or reader identity and remained unconsumed. The private receipt was retained; no expiry settings changed.
- Updated the Phase 4 entry checklist and accepted Phase 3 notes. `check-live-account-boundary.ts` passed all 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts. No model calls or public activation.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit, 281 integration, four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` passed.
- Next: continue Phase 4 with Grafana export listener and capacity gates; review scheduled NBA editing after the Nov 11 15:00 UTC run.

## 2026-11-11: iteration 1758 — measure the Grafana export listener footprint

- Clean main; no inherited work. Alerts clear; API and Grafana health pass, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Ran the exact prepared Compose file at 127.0.0.1:5543 in a disposable project. SCRAM login passed, wrong password returned 28P01, four non-loopback IPv4 probes failed to connect, and restricted roles wrote/read 30 synthetic daily rollups.
- `sample-observability-capacity.ts 12 5`, 120-second paired cgroup sample and 24-hour VictoriaMetrics history: 763.57 MiB/2.64% CPU together in the quiet trial; prior stack peak 771.25 MiB plus export lifetime peak 72.57 MiB projects 843.82 MiB against ~800 MiB. No OOM kills; volume used 47 MiB.
- Compose container, volume and bridge removed; port free. No production listener, datasource, model call, data write or public activation.
- Verification: `pnpm format`, `pnpm lint:fix`, `pnpm check`, `pnpm build`, changed-document Prettier and `git diff --check` pass. Live account boundary passes all 32 checks; the Nov 10 reader serves four topics, 19 stories and 15 posts.
- Next: verify loaded and cold-start memory headroom before installation, and review scheduled NBA editing after the Nov 11 15:00 UTC generation run.

## 2026-11-11: iteration 1759 — measure export startup alongside dashboard-style reads

- Clean main; no inherited work. Initial `pnpm obs alerts`, services/sources checks, digest queue and health probes: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Compared two 75-second, 250 ms cgroup samples: eight observability units alone, then plus the prepared Compose database starting from an empty volume. Five read batches per window passed (Grafana health, live reader and uncached VictoriaMetrics ranges); candidate also passed 12 restricted-reader SQL checks against synthetic rollups.
- Baseline 704.59 MiB/2.19% mean CPU; candidate 772.36 MiB at startup and 769.04 MiB during reads, 4.85% mean CPU and zero OOM kills. Removed disposable container, volume and bridge; port 5543 free. No provider calls, public activation or production data changes.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (827 unit and 281 integration passes; four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` pass. Push and restart API/worker, then recheck health, reader, sources and digest queue.
- Next: keep export installation gated on sustained CPU and paired memory during scheduled load or natural compaction. Review NBA editing after the Nov 11 15:00 UTC run.

## 2026-11-11: iteration 1760 — prepare a public queue status projection

- Clean main; no inherited work. `pnpm obs alerts`, health/services/sources and jobs checks: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Prepared an unmounted GET/HEAD queue status handler for four fixed queues, five counts and one scheduler timestamp per queue. No raw Bull Board route fallback, private records, logs, Redis details, or upstream errors in the response.
- Targeted HTTP test passed with synthetic queue results, including private-data exclusion, legacy route refusals, 405 for mutation, HEAD, and generic 503. Private jobs browser unchanged; no provider calls or activation.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (828 unit and 281 integration passes, four expected skips), `pnpm build`, changed-document Prettier and `git diff --check` passed. Push and restart API/worker, then verify live health, reader and private queues.
- Next: rehearse exclusive public queue routing and request admission. Grafana installation still needs scheduled-load or natural-compaction capacity evidence; review NBA after Nov 11 15:00 UTC.

## 2026-11-11: iteration 1761 — route public queue status through API admission

- Clean main; no inherited work. `pnpm obs alerts` clear; `/healthz` passed, `pnpm obs services/sources/jobs` showed 14 healthy services, 36 healthy sources and zero failed digest jobs.
- Public mode selects only `GET/HEAD /api/queues` behind API admission; private mode retains the read-only Bull Board. No live flag, sharing, generation or provider changes.
- Compiled Nest and disposable Redis rehearsal: anonymous GET/HEAD expose only queue counts and next runs; legacy routes denied for anonymous and signed-in admins. Queue and account requests share the reader quota, with 429 for missing identity or exhaustion.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (828 unit and 281 integration passes, four expected skips), `pnpm build`, handbook check for `09-observability` and `git diff --check` passed. Push and restart only the API; verify private jobs, account boundary and scheduled reader.
- Next: rehearse remaining public tool surfaces. Grafana installation still needs capacity evidence under scheduled load or natural compaction; review NBA editing after the Nov 11 15:00 UTC edition.

## 2026-11-11: iteration 1762 — bound handbook responses to the navigation inventory

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Removed the unused broad docs image route, named the three static assets, and made direct page reads match the tree and search inventory. The operational handbook stays private; public corpus and proxy review remain.
- Isolated Node HTTP checks compared all 18 page bodies and refused screenshot paths, page aliases, and unsupported methods. Playwright opened the Observability result from search and rendered its diagram; screenshot under `docs/screenshots/`.
- `pnpm exec tsx scripts/check-handbook.ts` passed (18 pages, 22 diagrams, 39 schema tables). `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- Full check exposed a Grafana export startup race: the socket probe could accept the temporary init server. The prepared Compose probe now checks TCP on loopback, matching the listener used by the isolated test. No live Grafana change.
- Verification: `pnpm format`, `pnpm lint:fix`, changed-file Prettier and `git diff --check` passed. `pnpm check` passed typecheck/lint/format/boundaries and 828 unit tests; after the TCP fix, `pnpm test:integration` passed 281 with four expected skips. `pnpm --filter @digest/docs-site test` passed 10; `pnpm build` passed. Push and restart only the handbook service, then verify private proxy routes and anonymous refusal.
- Next: continue individual public tool rehearsals; Grafana still needs capacity evidence under scheduled load or natural compaction. Review NBA editing after the 15:00 UTC edition.

## 2026-11-11: iteration 1763 — prepare the reader handbook

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Prepared a separate one-page reader handbook covering editions, preferences and AI summaries. The loopback candidate serves only its HTML and CSS; no private corpus, third-party assets, proxy install, flag change or provider calls.
- Standalone HTTP rehearsal verified GET/HEAD and denials for private Markdown/search/image paths and POST. Playwright checked desktop light/mobile dark, no overflow or external requests, and saved `docs/screenshots/reader-handbook-mobile.png`.
- `pnpm --filter @digest/docs-site test` passed 10. `check-live-account-boundary.ts` passed 32; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (828 unit and 281 integration passes, four expected skips), `pnpm build` and `git diff --check` passed. Push and restart only the private handbook service; recheck live admission and health.
- Next: rehearse exact public handbook proxy admission and rollback. Grafana installation still needs scheduled-load or natural-compaction capacity evidence; review NBA after the 15:00 UTC edition.

## 2026-11-11: iteration 1764 — rehearse public handbook routing and rollback

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs.
- Public mode selects the reader-only loopback upstream, admits exact GET/HEAD routes and strips caller credentials. Unavailable or mismatched upstreams fail closed. Private mode still protects the owner handbook. Public mode remains off; reader unit prepared but uninstalled.
- Targeted `pnpm exec tsx --test` for internal tools and public route policy passed seven tests, including unauthorized legacy paths, headers, upstream failure and rollback. Playwright desktop light/mobile dark passed through the real reader upstream; refreshed mobile screenshot is byte-identical.
- `pnpm --filter @digest/docs-site test` passed 10; `pnpm exec tsx scripts/check-handbook.ts README` and `systemd-analyze --user verify ops/services/news-digest-reader-docs.service` passed.
- Live checks: `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 281 integration, four expected skips), `pnpm build` and `git diff --check` passed. Push and restart only the API; recheck private handbook admission, reader and health.
- Next: rehearse the explorer boundary, capture Grafana capacity under scheduled load or natural compaction, and review NBA editing after the 15:00 UTC edition.

## 2026-11-11: iteration 1765 — prepare the public explorer response boundary

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources, zero failed digest jobs; retained ingestion failures have current successful sources.
- Prepared an uninstalled structural-only explorer projection. Explicit fields preserve account tables/key relationships while excluding activity estimates, sizes, defaults, comments, definitions, metadata prose, warnings and future private fields. Private explorer and public flag unchanged; no provider calls or grants changed.
- `pnpm --filter @digest/schema-explorer test` passed four tests, including hostile catalog markers, preserved relationships and detached output arrays. Updated public response review and TASKS; no live schema/handbook behavior changed.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts. `pnpm build` passed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit and 281 integration passes, four expected skips), `pnpm build` and `git diff --check` passed. Pushed `b7da0f20`; restarted schema service active. Live catalog: 39 tables/36 relations/zero warnings; anonymous `/db/` returns 404 and `/healthz` passes.
- Next: explorer catalog-only role, structural UI and exact HTTP/browser/private rollback rehearsal; Grafana capacity under scheduled load or natural compaction; Nov 11 15:00 NBA acceptance review.

## 2026-11-11: iteration 1766 — rehearse the explorer catalog-only role

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services and 36 healthy sources; no digest breakage found.
- Prepared an idempotent non-login catalog role without application-table grants, memberships or elevated privileges. No live grants, credentials, flags or service wiring changed; no provider calls.
- Added disposable migrated-database coverage running actual explorer introspection and structural projection under the role. Verified table/relationship visibility, denied application rows/password catalogs/role switching, and catalog-comment removal at the response boundary. PUBLIC catalog visibility remains documented; arbitrary SQL is unapproved.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts. Explorer unit tests passed four; `pnpm build` passed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit and 282 integration passes, four expected skips) and `git diff --check` passed. Pushed `895a47b4`; restarted schema service active: 39 tables/36 relations/zero warnings. `/healthz` passes; anonymous `/db/` returns 404.
- Next: explorer credential/function review, structural UI and exact HTTP/browser/private rollback rehearsal; Grafana capacity under scheduled load or natural compaction; Nov 11 15:00 NBA acceptance review.

## 2026-11-11: iteration 1767 — review explorer inherited function privileges

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz` found no active alerts, service/source outage or failed digest run; retained failed collection attempts have current successful runs.
- Extended the disposable catalog-role rehearsal to inventory executable non-system SECURITY DEFINER functions and writable persistent schemas, and deny server file/directory reads, server programs and table/function creation. Uses session authorization, preserves fixed-query/projection requirements and rolls back all changes. No live credentials, grants, flags or provider calls changed.
- Updated the public tool response review and TASKS. Credential installation and structural UI/HTTP/private rollback remain open; NBA acceptance awaits the Nov 11 15:00 UTC edition.
- `check-live-account-boundary.ts` passed 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` verified four topics, 19 stories and 15 posts. `pnpm build` passed; live schema service active and anonymous `/db/` returns 404.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit and 282 integration passes, four expected skips), `pnpm build` and `git diff --check` passed. Explorer inherited-function assertions pass. Pushed `c9f5b975`; schema service restarted active, `/healthz` passes and anonymous `/db/` returns 404. Public mode remains off.
- Next: credential installation and structural explorer UI/HTTP/private rollback rehearsal; Grafana paired capacity evidence under scheduled load or natural compaction; Nov 11 scheduled NBA review.

## 2026-11-11: iteration 1768 — rehearse structural explorer UI

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources, no failed digest runs.
- Shared explorer UI now accepts structural responses without activity/definition fields, retaining private counts and details. Fixed narrow-screen toolbar/panel clipping found during browser inspection. Server response, public flag, credentials and grants unchanged; no provider calls.
- `pnpm exec tsx scripts/check-schema-structural-ui.ts`: private/structural desktop/mobile pass using 39 live catalog tables/36 relations; structural DTO intercepted locally in browser only. Search, modes, account relationships, absent private fields, errors and viewport bounds checked. Viewed both saved structural screenshots.
- `check-live-account-boundary.ts`: 32 passes; `check-scheduled-reader.ts 2026-11-10T15:00:00Z`: four topics, 19 stories, 15 posts. `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 282 integration passes/four expected skips), `pnpm build` and `git diff --check` passed.
- Next: explorer credential installation, exact HTTP/admission/private rollback; Grafana paired load/compaction capacity evidence; Nov 11 15:00 NBA acceptance review.

## 2026-11-11: iteration 1769 — wire structural explorer HTTP responses

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services and 36 healthy sources; no scheduled digest breakage.
- Wired the structural DTO into the real explorer HTTP handler behind default-off `SCHEMA_EXPLORER_STRUCTURAL_ONLY=1`. Request parameters cannot select the private response. Existing private runtime configuration, credentials, grants and public mode unchanged; no provider calls.
- Extracted injectable HTTP construction and rehearsed private/structural/private startups on ephemeral loopback listeners with synthetic catalog data. Checked private-field removal, retained topology, no-store, POST refusal before loading, static assets, health and unknown routes. Five explorer tests pass.
- `check-live-account-boundary.ts`: 32 passes; `check-scheduled-reader.ts 2026-11-10T15:00:00Z`: four topics, 19 stories, 15 posts. `pnpm build` passed.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit and 282 integration passes, four expected skips), explorer typecheck/tests, `pnpm build` and `git diff --check` passed. Corrected a missing test-fixture argument caught by the first full typecheck. Restarted schema service active: 39 tables/36 relations/zero warnings, private fields retained; `/healthz` passes and anonymous `/db/` returns 404.
- Next: install reviewed explorer catalog credentials and compose exact proxy/browser/private rollback; Grafana paired scheduled-load/compaction capacity evidence; Nov 11 15:00 NBA acceptance review.
