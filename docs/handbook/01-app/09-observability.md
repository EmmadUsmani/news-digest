# Observability

The API and worker write structured JSON to the systemd journal. Each line
has a service name, numeric severity and timestamp. No additional log store
or monitoring service is installed.

| Activity      | What the journal records                                                                                                          |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| HTTP requests | Generated request ID, method, route template, status, elapsed milliseconds and completion or disconnect                           |
| Queue jobs    | Queue and job IDs, attempt number, start, finish or failure, elapsed milliseconds                                                 |
| Feed/HN calls | Target category, HTTP status when received, success/redirect/failure and elapsed milliseconds; cached reads produce no call entry |
| Errors        | Error message, stack and cause; fatal exceptions and unhandled rejections exit unsuccessfully so systemd can recover the service  |

The API returns `X-Request-Id` so a browser request can be matched to its
journal entry. Request context and job context remain separate when work
runs concurrently. Static files and unmatched requests use a generic route
label; request URLs, queries, bodies and headers are omitted.

External HTTP logs inherit the current job or request context. URLs, bodies and
provider error messages are omitted. Each redirect hop is recorded separately;
rate-limit waiting and cached reads do not count as network time.

Credential fields and configured secret values are redacted before log
serialization, including error stacks. API and worker logs can be read with
`journalctl --user -u news-digest-api -u news-digest-worker -n 40 --no-pager`.
The journal also contains older plain-text entries from earlier versions.

> [!NOTE]
> External-call instrumentation and the remaining monitoring tools are unfinished.
> See the [approved observability plan](../../observability-plan.md).
