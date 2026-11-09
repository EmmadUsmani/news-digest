# Public administrative response audit

Phase 4 preparation, iterations 1484–1485 (2026-11-09). The route classifier is
unregistered. These decisions change no live access. HEAD inherits GET's class.
The owner intends public read-only admin pages; restricted rows below require
work before that rollout, rather than a permanent change to that intent.

| GET under `/api/admin/`                                            | Current response                                                | Prepared decision                                                             |
| ------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `status/alerts`                                                    | Timestamp and firing/pending counts only                        | Public-read; audited below                                                    |
| `profile`                                                          | Legacy owner profile ID/name plus system schedule               | Admin; disconnected system-schedule projection prepared                       |
| `topics`                                                           | Entire topic rows, source connections, X discovery settings     | Admin; disconnected explicit public field projection prepared                 |
| `topics/sources`                                                   | Source ID, name, configured feed URL                            | Admin until stored URLs are checked and public URL output bounded             |
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

No controller imports these readers. Existing profile/topic GET and HEAD routes
remain admin-classified. Transport wiring, system-only schedule reads, configured
text review and the broader route gate still need verification before promotion.

## Remaining response boundaries

- `PostgresProfileRepository.getDefault` still reads the legacy profile ID/name
  even with system ownership enabled. Public schedule settings need an explicit
  system response; do not expose a legacy owner name by promoting this GET.
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
