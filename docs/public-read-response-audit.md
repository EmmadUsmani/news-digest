# Public administrative response audit

Phase 4 preparation, iterations 1484–1488 (2026-11-09). The route classifier is
unregistered. These decisions change no live access. HEAD inherits GET's class.
The owner intends public read-only admin pages; restricted rows below require
work before that rollout, rather than a permanent change to that intent.

| GET under `/api/admin/`                                            | Current response                                                | Prepared decision                                                             |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `status/alerts`                                                    | Timestamp and firing/pending counts only                        | Public-read; audited below                                                    |
| `profile`                                                          | Legacy owner profile ID/name plus system schedule               | Admin; disconnected system-only schedule reader prepared                      |
| `topics`                                                           | Entire topic rows, source connections, X discovery settings     | Admin; disconnected explicit public field projection prepared                 |
| `topics/sources`                                                   | Source ID, name, configured feed URL                            | Admin; disconnected origin-only catalog projection prepared                   |
| `content`, `content/window`                                        | Topic IDs and article ID/title/URL/date/source                  | Admin pending stored URL/text and failure-response audit                      |
| `content/sources`                                                  | Configured URLs, source timings, counts, persisted errors       | Admin pending public projection and stored-error review                       |
| `status`                                                           | Coverage, sources, queues, provider usage and development spend | Admin pending projection of errors, job return strings and accounting details |
| `digest-previews`, `digest-previews/latest`, `digest-previews/:id` | Unfiltered history or complete stored snapshots                 | Admin; unpublished/test editions must stay private                            |
| `digest-previews/:id/cost`                                         | Edition accounting                                              | Admin pending accounting response audit                                       |
| `digest-previews/jobs/:id`                                         | On-demand progress and generic generation errors                | Admin pending unpublished-edition/progress review                             |

## Audited count-only alerts

`MonitoringAlerts.read` validates the local monitoring response and constructs
only `checkedAt`, `firing` and `pending`. It does not forward alert labels,
annotations, values, response bodies or arbitrary upstream fields. All fetch,
HTTP and validation failures become a fixed 503 `Monitoring alerts unavailable`.
An unavailable monitor never becomes a misleading zero count.

The controller returns this object directly. Offline tests inject private marker
fields at every upstream level and check exact output keys. They also verify the
exact serialized Nest exception body for HTTP, malformed-state and transport
failures. The prepared classifier permits GET/HEAD only; writes stay denied.
This narrow classification grants no access to detailed status or telemetry.

## Prepared settings projections

`public-read/settings.ts` prepares disconnected schedule and topic readers.
The schedule result contains only cadence, timezone, coverage window and story/post
budgets; its future caller must read system settings directly. It does not accept
an owner-profile wrapper. Topics retain configured display/editorial/source-selection
fields through an explicit schema pick, omitting `profileId` and unknown row fields.
Nested strict schemas reject unexpected properties instead of forwarding them.
Repository failures and invalid results return exact generic 503 responses, with no
stored values or exception details. Offline adversarial tests cover private extra
fields, nested additions, malformed results and thrown private errors.

`PublicScheduleReader` now reads the singleton `edition_settings` row directly,
selecting only the five schedule fields and applying the public projection. It
never reads profiles or legacy schedules and ignores the ownership flag; missing
system settings fail closed without a fallback. The caller owns its connection
pool. Isolated database tests temporarily rename both legacy tables, exercise
unset/off/on flags, and verify missing-row and closed-connection generic errors.

An unregistered `PublicScheduleController` prepares GET/HEAD
`/api/settings/schedule` with `Cache-Control: no-store`. It reapplies the schedule
allowlist at the HTTP boundary and maps adapter errors to the generic 503. Real
loopback HTTP checks cover GET, empty HEAD, refused writes, invalid state and
private adapter exceptions. It is absent from live modules and the route classifier;
future composition must inject the system-only reader. Existing profile/topic
routes remain admin-classified. Runtime wiring, configured text review and the
broader route gate still need verification before promotion.

## Prepared source catalog projection

`readPublicSourceCatalog` returns source IDs, configured names and publisher
origins. It omits configured feed paths, queries and fragments because these can
contain subscription tokens. It uses the existing public HTTPS URL policy to
reject credentials, custom ports and literal private/local hosts, then derives
only the origin. It performs no network request or DNS lookup. Invalid rows and
repository failures return a fixed 503 without stored values. Unknown row fields
are discarded. Offline tests include secret-bearing paths/queries/fragments and
credential/private-origin failures. This new shape needs frontend integration
before promotion; existing GET/HEAD routes remain admin and unchanged.

## Remaining response boundaries

- `PostgresProfileRepository.getDefault` still reads the legacy profile ID/name
  even with system ownership enabled. The prepared standalone reader avoids this
  dependency; transport must use it instead of promoting the legacy profile GET.
- `PostgresTopicRepository.listDefault` spreads `getTableColumns(topics)`.
  A public allowlist must prevent future columns becoming public automatically.
- Current ingestion failures are sanitized by `ingest` before persistence;
  `status` readers return stored `lastError` verbatim. Review historical values
  and every writer before making that field public. No leak is inferred merely
  from the field's presence.
- Preview GETs deliberately call repository methods without `publishedOnly`.
  Reuse the published reader boundary for public content, not preview routes.
  The existing reader controller applies its own schema projection and deployed
  `READER_PUBLISHED_ONLY` flag; public-mode installation must require that flag.
- Check failure responses as well as successful objects. A successful fixture
  or a clean live snapshot alone cannot establish a route's public safety.
- Internal tools, SPA/admin assets, identity discovery and telemetry still need
  separate route and response reviews. `/logs` and `/metrics` remain admin-only.

## Source locations

- `apps/api/src/modules/operations/adapters/monitoring-alerts.ts`
- `apps/api/src/modules/operations/adapters/operations.status.ts`
- `apps/api/src/modules/operations/database/source-status.ts`
- `apps/api/src/modules/profiles/database/profile.repository.ts`
- `apps/api/src/modules/topics/database/topic.repository.ts`
- `apps/api/src/modules/ingestion/database/content.repository.ts`
- `apps/api/src/modules/ingestion/ingest.ts`
- `apps/api/src/modules/digests/digests.module.ts`
- `apps/api/src/modules/digests/database/preview.repository.ts`
- `apps/api/src/modules/digests/reader-edition.controller.ts`
- `apps/api/src/public-route-policy.ts`
- `apps/api/test/monitoring-alerts.test.ts`
