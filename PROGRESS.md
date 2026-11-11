# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

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

## 2026-11-11: iteration 1770 — compose restricted catalog HTTP rollback

- Clean main; no inherited work. `pnpm obs alerts/services/sources/jobs` and `/healthz`: zero active alerts, 14 healthy services, 36 healthy sources and no scheduled digest failure.
- Extended the disposable migrated-database explorer rehearsal to serve actual restricted-session introspection through private/structural/private HTTP listeners. Checks cover topology, catalog-marker/activity removal, no-store, health, POST/unknown-route refusal and full private rollback; row/file/role denials remain in the same session.
- The shared container uses trust authentication: this proves session authorization, not password enforcement. Live credentials, grants, flags and public admission unchanged; no provider calls. Updated TASKS and the response review.
- `pnpm build`, `check-live-account-boundary.ts` (32 passes), `check-scheduled-reader.ts 2026-11-10T15:00:00Z` (four topics, 19 stories, 15 posts) pass. Corrected import sorting found by the first full lint.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 282 integration passes/four expected skips), `pnpm build` and `git diff --check` pass. Restricted-role HTTP composition passes; archived iterations 1753–1759 to keep this file small. Restarted schema service active; `/healthz` passes and anonymous `/db/` returns 404. Public mode remains off.
- Next: install reviewed explorer credentials and compose exact proxy/browser rollback; Grafana paired scheduled-load/compaction capacity; Nov 11 15:00 NBA acceptance review.

## 2026-11-11: iteration 1771 — rehearse explorer SCRAM credentials

- Clean main; no inherited work. Local alerts zero, all 14 services active, all 36 sources healthy; no failed scheduled digest.
- Added a separate disposable PostgreSQL 17 SCRAM instance to the explorer integration test; all migrations applied from zero. Synthetic login verifies password enforcement, real session identity/defaults, structural HTTP and row/catalog/file/identity denials. NOLOGIN rejects fresh connections; rollback must also close existing service pools.
- Live credentials, grants and public flags unchanged; no provider calls. Updated TASKS and the response review; no product/handbook behavior changed.
- Targeted SCRAM test passes; deployed account-boundary check passes 32 checks; scheduled reader check verifies Nov 10 four topics/19 stories/15 posts.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 283 integration passes/four expected skips), `pnpm build` and `git diff --check` passed. Targeted SCRAM rehearsal also passed.
- Next: live explorer credential installation and exact proxy/browser/private rollback; Grafana capacity under scheduled load/compaction; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1772 — gate explorer credential deployment

- Clean main; no inherited work. Zero active alerts, all 14 services and 36 sources healthy, no failed scheduled digest; `/healthz` passes.
- Added a read-only credential deployment preflight and redacted CLI: loopback catalog-reader URL only, successful real login, independent wrong-password rejection, session defaults and unsafe privilege inventory. No live credentials, grants, authentication rules or public flags changed; no provider calls.
- Extended disposable SCRAM rehearsal: valid candidate passes, accidental users-table grant fails, then host trust fails despite the stored SCRAM verifier. Targeted test passes. Current compose host trust requires a scoped password-authentication rule before live installation; existing app/observability roles must retain access.
- `pnpm build`, deployed account boundary (32 checks), saved Nov 10 reader (four topics/19 stories/15 posts) and `git diff --check` pass. `pnpm format`, `pnpm lint:fix` and `pnpm check` pass (829 unit, 283 integration passes/four expected skips).
- Next: scoped explorer password-authentication rule, credential installation and exact proxy/browser/private rollback; Grafana paired scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1773 — rehearse scoped explorer authentication rollback

- Clean main; no inherited work. Zero active alerts, all 14 services active, sources healthy and no failed scheduled digest; `/healthz` passes.
- Prepared IPv4/IPv6 catalog-role-only SCRAM fragment ahead of existing trust rules. Disposable database verifies trust rejection, scoped password enforcement, parsed rules, unrelated-role access and restored trust rejection. No live authentication, credentials, grants or public flags changed; no provider calls.
- First integration run caught rollback copy changing file ownership: PostgreSQL refused to reload it. Fixed with ownership/mode-preserving copies and parsed-rule validation; bounded fresh-login checks observe asynchronous reload completion. Corrected focused rehearsal passes.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 283 integration passes/four expected skips), `pnpm build` and `git diff --check` pass. Account boundary passes 32 checks; saved Nov 10 reader returns four topics/19 stories/15 posts.
- Schema service restarted active; `/healthz` passes and anonymous `/db/` returns 404.
- Next: install scoped live authentication and explorer credentials, then exact proxy/browser/private rollback; Grafana scheduled-load/compaction capacity and Nov 11 15:00 NBA acceptance remain open.
