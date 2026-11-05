# Completed task markers archived in iteration 803

## Done markers

- [x] Custom-feed recovery (802): desktop/mobile validation, failed connection, retained fields, retry, reload and disconnect verified with protected snapshots, browser write/credential guards and full edition/topics/profile immutability.

- [x] Status recovery (801): desktop/mobile failed refresh retains telemetry and retry restores it; protected snapshots, browser write/credential guards and full edition/topics/profile immutability verified.

- [x] News-query recovery (800): desktop/mobile validation, failed connection, retained query, retry, reload and disconnect verified with protected snapshots, browser guards and full edition/topics/profile immutability.

- [x] Topic availability recovery (799): desktop/mobile failure/retry, disable/enable reload and editor protection verified with protected snapshots, browser write/credential guards and full edition/topics/profile immutability.

- [x] Source connection recovery (798): desktop/mobile failed saves retain selections; retry, stored content, reload and disconnect verified with protected snapshots, browser guards and full edition/topics/profile immutability.

- [x] X-account save recovery (797): desktop/mobile retained handles, retry, normalization, duplicate prevention and reload verified with protected snapshots, browser guards and full edition/topics/profile immutability.

- [x] Topic reorder recovery (796): desktop/mobile failure, retry, positions and reload verified with protected operational snapshots, browser write/credential guards and full edition/topics/profile immutability.

- [x] Topic deletion recovery (795): desktop/mobile cancel, failed delete, retry and reload verified with protected snapshots, browser write/credential guards and full edition/topics/profile immutability.

- [x] Topic creation recovery (794): desktop/mobile failed creates retain all entered fields, retry/reload succeeds once; protected snapshots, blocked browser writes/credentials and full edition/topics/profile immutability.

- [x] Topic save recovery (793): desktop/mobile failed edits retain name, budget and cleared phrases, then retry/reload succeeds; protected snapshots, blocked browser writes/credentials and full edition/topics/profile immutability.

- [x] Schedule recovery verification (792): desktop/mobile failed saves retain all five inputs and retry successfully; protected snapshots, blocked browser writes and credentials, full edition/topics/profile immutability.

- [x] Job status validation (791): malformed progress, mismatched job IDs and invalid completion IDs reconnect to the original job; desktop/mobile replay proves no duplicate submission or saved-data changes.

- [x] On-demand progress recovery (790): stalled status reads time out after 15 seconds and reconnect to the same job; unmount cancels outstanding reads. Desktop/mobile replay verifies no duplicate submission and unchanged saved data.

- [x] X lazy widgets (789): desktop/mobile replay proves distant cards remain unrendered through theme changes, then load the current theme on scrolling with one shared script; saved edition unchanged.

- [x] X embed theme (787): official widgets follow system and saved reader light/dark themes, rebuilding on changes with the same loaded script; desktop/mobile replay and screenshots verified.

- [x] X script timeout cleanup (786): completed downloads clear callbacks and reject late state changes; stalled-download desktop/mobile recovery verified without edition writes.

- [x] Concurrent X retries (785): failed cards share one replacement widgets.js download while it is pending; loaded widgets remain reusable. Desktop/mobile recovery verified without edition writes.

- [x] X card retries (784): reuse the loaded official widget API; only failed script downloads fetch a replacement, verified desktop/mobile without edition writes.

- [x] X embed recovery (783): rejected/empty widgets remove partial markup; late mutations stay detached, saved text/original links remain, retry verified desktop/mobile with no edition writes.

- [x] STEERING 17: reviewed editable account lists active (431), read back 11/10/12/11 on Nov 4.
- [x] STEERING 29 console (566): isolated context, production prompt, external history, repository/SQL access; no worker/timer startup.
- [x] STEERING 2a (570): isolated DB/Redis migrations, repository/HTTP/worker characterization, golden and coverage.
- [x] STEERING 2b (618): Drizzle, zero-diff and unchanged characterization passed; future migration requires private backup/owner grants.
- [x] Grafana desktop/mobile sweep (561); social next-run mismatch (560); Bluesky recovery shipped (513/570).

## UI foundation verification detail through 802

- Foundations complete (717–728): TanStack routing/query resources, validated edition/history navigation, Tailwind v4/shadcn, self-hosted Inter and saved light/dark theme. Screenshots in `docs/screenshots/ui/`.
- Step 2 foundation: deny-by-default identity middleware, uncached `/api/me`, protected admin API aliases and sanitized reader edition/history endpoints. Legacy operational routes remain until owner identity configuration. Local operational scripts use protected Node snapshots; browser replays never receive credentials. Saved-reader navigation, text, theme and widget checks block writes and verify edition immutability. Scheduled-reserve and duration checks now also block writes and verify the saved edition (765). Archive selection/history races cover desktop/mobile light/dark with saved content and immutability checks (766). Invalid edition IDs, including legacy query links, stop before app/API loading; not-found/home recovery and valid legacy redirects preserve anchors in all four viewport/theme combinations (768–769). Missing saved editions distinguish 404 from outages, avoid 404 retries and offer latest-edition recovery; transient failures have an explicit retry (770). Archive paging retains Newer editions during loading/failure, with retry and empty-page recovery verified in all four viewport/theme combinations (772). Cached-edition refresh failures now retain saved content with accurate refresh messaging and retry recovery (773). Cached archive refresh failures retain saved links and retry recovery (775). Reader requests now time out after 15 seconds; edition/history timeouts offer manual retry without repeating the wait (776). Invalid reader data now offers immediate manual recovery without automatic retries (777–778), including malformed JSON. See [access decision](docs/decisions/2026-11-05-admin-access.md) and Operations for verification commands.
- Shared-query verification blocks browser writes, checks credential absence and confirms full saved-edition immutability (774). Handbook/schema verification now uses authenticated loopback tool reads outside the browser (771). Next: configure admin identity, switch UI/scripts and remove legacy routes while gating tools together. Live reserved-route denial, uncached identity and forwarded-token rejection verified by `smoke-admin-gate.ts` (767). Identity GET/HEAD parity and uncached method rejection verified (779). Async-edition job verification now replays protected operational snapshots with browser credentials absent and full edition/topics/profile immutability checks (780). Queue tool checks now use credentialed Node reads for APIs/pages/assets, block browser writes and verify saved-edition immutability (781). Coverage and X-schedule guidance checks now disable service workers, prove write blocking, check browser credential absence and confirm full saved-edition immutability (782). Proxy origin/spoof checks remain pending.
