# M6 and M7 scope settlement

Settled in iteration 1095 (2026-11-07), following STEERING 47 step 4.
The scope is the original milestone checklist in
[the archived tasks](progress-archive/2026-11-02-tasks-through-143.md),
with the explicit M6/M7 definition in STEERING 47. Both milestones are closed.
This records existing implementation and evidence; no new checks were added.

| Original scope          | Shipped behavior                                                                                                          | Existing evidence                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| M6 topic management     | Create/edit/delete, enable/disable, reorder, source connections, custom feeds, query/account settings and item budgets    | `apps/api/test/settings.test.ts`, `api-http.test.ts`; browser write checks in iterations 692 and 700–702 |
| M6 schedule and budgets | Daily local time, IANA timezone, elapsed coverage window and default item budgets; separate spend controls                | `settings.test.ts`, `api-http.test.ts`; schedule/spend admin routes                                      |
| M6 on-demand editions   | Preset and custom windows, asynchronous job status and saved edition links                                                | `api-http.test.ts`; recovery iterations 851–864                                                          |
| M6 edition history      | Paginated immutable editions with direct URLs, separate reader and admin views                                            | `api-http.test.ts`; edition/history race fixes 694/697                                                   |
| M7 scheduler            | Saved daily timezone schedule, exact slot windows, bounded retries, idempotent publication and visible missed-slot policy | `scheduled-digests.test.ts`; failure rehearsals 1090–1093                                                |
| M7 status page          | Sources, queues, runs, next schedule, provider spend/reservations/caps and errors                                         | `operations.test.ts`; admin overview/sources/editions/spend routes                                       |
| M7 publication event    | DigestPublished after commit through a notification port to the log adapter; notification failure cannot fail publication | `digest-notifications.test.ts`; publication implementation in iteration 852                              |

The reader/admin separation and desktop/mobile light/dark views are captured in
[the existing route screenshots](screenshots/ui/spec-routes.md).
The four named failure rehearsals each saved one readable edition without duplicate
charges. The scratch backup rebuild and its untested host recovery steps are
recorded in PROGRESS.md, iteration 1094.

No original-scope feature gap remains. Scheduled editorial quality, paid X
acceptance, Bluesky slot outcomes and latency remain separate open tasks.
The scheduler supports daily local-time cadence; arbitrary cron was not an
original requirement. Log delivery satisfies M7; external notifications and the
new standalone alert dispatcher are separate work. Predeployment lost jobs cannot
be reconstructed, and notification delivery is best effort rather than an outbox.
