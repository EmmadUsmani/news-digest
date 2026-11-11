# Progress

[Through iteration 1743](docs/progress-archive/2026-11-10-through-1743.md).

[Iterations 1753–1759](docs/progress-archive/2026-11-11-through-1759.md).

[Iterations 1760–1763](docs/progress-archive/2026-11-11-iterations-1760-1763.md).

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

## 2026-11-11: iteration 1774 — install live explorer catalog credentials

- Clean main; no inherited work. Zero active alerts, all 14 services and 36 sources healthy; no failed digest run. Saved Nov 10 edition still serves four topics/19 stories/15 posts.
- Privately backed up database, roles, environment, authentication and extension ACLs; installed scoped IPv4/IPv6 SCRAM rules and catalog-only login. Preflight initially caught inherited PUBLIC SELECT on query-statistics views; removed it while preserving existing named roles' SELECT. Added extension-backed regression and idempotence coverage.
- Redacted live credential preflight passes real login/wrong-password rejection, session defaults and unsafe-grant checks. Explorer now uses two catalog-role sessions; parsed authentication rules have zero errors. Restricted/private rollback responses preserve all 39 tables and full response except capture time, with no warnings; restart closed restricted pools before reactivation.
- Updated credential deployment/rollback instructions, affected handbook and TASKS. Public and structural flags remain off; no provider calls. Private backups: `~/.local/state/news-digest/catalog-1774/`.
- Targeted SCRAM test, handbook check (39 tables/no warnings), deployed account boundary (32 checks), saved-reader check and build pass. `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit, 283 integration passes/four expected skips) and `git diff --check` pass.
- Next: exact structural proxy/browser/private rollback; full credential/authentication rollback; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1775 — compose explorer proxy/browser rollback

- Clean main; no inherited work. Zero active alerts; 14 services/36 sources healthy. `pnpm obs jobs --check` passes; saved Nov 10 reader still serves four topics/19 stories/15 posts.
- Added `pnpm exec tsx scripts/check-schema-proxy.ts`: captures the live restricted-role catalog, then exercises real explorer HTTP and API proxy handlers on ephemeral loopback listeners. Private/structural/private responses retain 39 tables/36 relationships and restore the exact captured private response; query flags cannot widen the projection.
- Desktop/mobile real-response browsers pass search, account details, viewport and error checks; saved and visually inspected both proxy screenshots. No-store, redirect, POST/unknown-row refusal and anonymous/forged-header denial pass before introspection. Public policy remains closed even to fresh admins.
- Updated TASKS, readiness and response-review evidence. No live flags, credentials, grants or provider traffic changed. Initial lint caught unnecessary async declarations; corrected and reran verification.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit/283 integration passes, four expected skips), `pnpm build`, account boundary (32 checks), saved-reader check, handbook/schema check and `git diff --check` pass. Explorer restarted after push; `/healthz` passes and anonymous `/db/` remains 404.
- Next: full credential/authentication rollback and explicit explorer reader admission; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1776 — compose explorer credential lifecycle rollback

- Clean main; no inherited work. No active alerts or failed services; source/job checks and `/healthz` pass. Saved Nov 10 reader serves four topics/19 stories/15 posts.
- Extended the disposable SCRAM rehearsal through NOLOGIN, pool closure, authentication restoration, exact extension-ACL restoration and restricted-role reactivation. NOLOGIN preserves an existing pooled session; closing the pool removes its backend; fresh rollback logins fail. Reactivation restores the same structural table catalog and still denies application-row reads.
- This is isolated synthetic-credential evidence, not live credential rollback. No live credentials, grants, flags or provider spending changed. Updated readiness and response-review evidence; live credential/environment rollback and reader admission remain open.
- Targeted credential test, `pnpm build`, deployed account boundary (32 checks), `check-scheduled-reader.ts 2026-11-10T15:00:00Z`, handbook/schema check and `git diff --check` pass. `pnpm format`, `pnpm lint:fix` and `pnpm check` pass (829 unit, 283 integration passes/four expected skips).
- Next: live credential/environment/authentication rollback; explicit reader admission; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1777 — live explorer credential rollback

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; scheduled digest queue healthy and recent free/social collection succeeds.
- `python /tmp/catalog-1777.py` passed live rollback/reactivation. Fresh private snapshots and the rehearsal script are in `~/.local/state/news-digest/catalog-1777/`. Removed explorer URL/drop-in, restarted, verified exact private response and zero restricted-role sessions; applied NOLOGIN, original parsed authentication and preserved extension ACL restoration. App health remained green.
- Finally restored scoped authentication, hardened grants, LOGIN, exact environment/drop-in and restarted. Exact response/extension ACL comparisons, restricted-role sessions and password/privilege preflight pass. Public/structural flags remain off; no provider spending.
- Build, deployed account boundary (32 checks), saved-reader check (four topics/19 stories/15 posts), handbook/schema check (39 tables/no warnings) and anonymous `/db/` 404 pass. Corrected an initial boundary-command filename typo; actual deployed check passes.
- Updated readiness/evidence/TASKS and archived iterations 1760–1763 to keep this file small. `pnpm format`, `pnpm lint:fix`, `pnpm check` (829 unit/283 integration passes; four expected skips) and `git diff --check` pass.
- Next: explicit explorer reader admission; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1778 — enforce structural explorer upstream

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` and scheduled queue checks pass.
- Prepared public proxy selection requires the explorer's structural-only marker and exact GET routes; private upstream responses fail closed. Incoming credentials and upstream cookies are removed. Public route admission remains closed and live flags stay off.
- Targeted HTTP/proxy tests pass (4); structural/private rollback verifies marker state alongside field filtering. No UI changes or provider calls.
- Build, deployed account boundary (32 checks), saved Nov 10 reader (four topics/19 stories/15 posts), handbook/schema check (39 tables/no warnings) pass. Updated TASKS and response/readiness evidence.
- `pnpm format`, `pnpm lint:fix`, `pnpm check` (830 unit/283 integration passes, four expected skips), `pnpm build` and `git diff --check` pass.
- Next: compose explicit explorer reader admission behind the public flag; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1779 — compose explorer reader admission

- Clean main; no inherited work. Alerts clear, no failed user services, `/healthz` healthy; all 36 sources and four job queues healthy. Nov 10 saved reader has four topics/19 stories/15 posts.
- Prepared public policy admits only exact structural explorer GET routes; query variants, HEAD and writes stay denied before proxying. Anonymous admission composes with the credential-stripping structural-marker proxy; private upstream still fails closed.
- `pnpm exec tsx scripts/check-schema-proxy.ts` passes captured-live-catalog private/structural/private HTTP and desktop/mobile checks. Inspected both new anonymous screenshots. No live flags, credentials, grants or provider spend changed.
- Targeted route/proxy tests pass (9); `check-live-account-boundary.ts` passes 32 checks; `check-scheduled-reader.ts 2026-11-10T15:00:00Z` and `check-handbook.ts` pass (39 tables/no warnings). Updated readiness, response review and TASKS.
- Initial full check caught the old readiness matrix denying reviewed explorer routes; updated it to verify all principals’ exact GET admission and HEAD/write refusal. Full rerun passes: 831 unit/283 integration tests, four expected skips; `pnpm format`, `pnpm lint:fix`, `pnpm check` and `git diff --check` pass.
- `pnpm build` passes. Restarted `news-digest-api.service`; retrying `/healthz` passes after startup and anonymous `/db/` stays 404. Post-restart account boundary and saved-reader checks pass.
- Next: live structural-mode activation and broader Phase 4 gates; Grafana scheduled-load/compaction capacity; Nov 11 15:00 UTC NBA acceptance review.

## 2026-11-11: iteration 1780 — activate live structural explorer

- Clean main; no inherited work. Alerts clear, services/healthz healthy, all 36 sources and scheduled job queues pass local checks. No provider spending.
- Installed tracked structural-only explorer drop-in; `pnpm exec tsx scripts/check-live-schema-structural.ts --live` passes private/structural/private/structural restarts. Exact 39-table structural response and authenticated proxy parity pass; rollback preserves all private catalog fields except changing timestamp/row estimates/sizes. Public mode stays off; anonymous `/db/` is 404.
- Live desktop/mobile checks pass without interception; inspected both screenshots in `docs/screenshots/schema/live-structural-{1440,390}.png`. Existing `check-schema-proxy.ts` and `check-schema-structural-ui.ts` rehearsals pass using the restricted catalog role directly for private inputs.
- Handbook check initially expected removed warning fields; changed it to read private catalog diagnostics through the restricted role and verify served structural parity. Updated owner data-model page, rollout/readiness docs and TASKS.
- `pnpm build`, deployed account boundary (32 checks), and saved Nov 10 reader (four topics/19 stories/15 posts) pass. Initial full check caught an unused import; `pnpm lint:fix` removed it.
- `pnpm format`, `pnpm lint:fix`, final `pnpm check` (831 unit/283 integration passes; four expected skips), handbook/schema (18 pages/22 diagrams/39 tables) and `git diff --check` pass. Handbook rerun after a rollout-restart 502 passes. Restarted API/explorer; startup-boundary retry and saved-reader check pass with healthy services.
- Next: remaining Phase 4 tool installations/full public rehearsal; Grafana capacity under scheduled load or compaction; Nov 11 15:00 UTC NBA review.
