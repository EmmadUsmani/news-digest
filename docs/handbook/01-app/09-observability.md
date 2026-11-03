# Observability

The API and worker write structured JSON to the systemd journal. Each line
has a service name, numeric severity and timestamp. No additional log store
or monitoring service is installed.

| Activity              | What the journal records                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP requests         | Generated request ID, method, route template, status, elapsed milliseconds and completion or disconnect                                 |
| Queue jobs            | Queue and job IDs, attempt number, start, finish or failure, elapsed milliseconds                                                       |
| Feed/HN/X embed calls | Target category, HTTP status when received, success/redirect/failure and elapsed milliseconds; cached reads produce no call entry       |
| Anthropic calls       | Model, purpose, run ID, attempt, duration, success or failure, failure HTTP status and successful token usage/computed microdollar cost |
| xAI calls             | Model, search type, HTTP status, duration, outcome, safe failure reason and successful token/fetched-item/citation counts               |
| Bluesky calls         | Login, refresh or search, HTTP status when received, duration and outcome; no account, token, query, URL or response content            |
| X discovery budgets   | Admission/refusal and estimate by run/topic/search type; settled cost, released/uncertain holds and provider credit block               |
| Anthropic budgets     | Admission/refusal and estimate per attempt; settled cost or released/uncertain failure hold, with run and inherited job context         |
| Errors                | Error message, stack and cause; fatal exceptions and unhandled rejections exit unsuccessfully so systemd can recover the service        |

The API returns `X-Request-Id` so a browser request can be matched to its
journal entry. Request context and job context remain separate when work
runs concurrently. Static files and unmatched requests use a generic route
label; request URLs, queries, bodies and headers are omitted.

Official X oEmbed requests use the `x-oembed` target category; feed and Hacker
News requests keep their own categories. A successful HTTP response does not
mean the embed passed the subsequent content validation.

External HTTP logs inherit the current job or request context. URLs, bodies and
provider error messages are omitted. Each redirect hop is recorded separately;
rate-limit waiting and cached reads do not count as network time. Anthropic retries
produce separate entries; failed calls have no inferred usage or cost. The ledger
remains the authority for settled spend. Prompts and generated text are omitted.

Credential fields and configured secret values are redacted before log
serialization, including error stacks. API and worker logs can be read with
`journalctl --user -u news-digest-api -u news-digest-worker -n 40 --no-pager`.
The journal also contains older plain-text entries from earlier versions.

> [!NOTE]
> Structured API/worker logging is complete. The log store, dashboards, metrics
> and browser error reporting remain planned.
> See the [approved observability plan](../../observability-plan.md).

xAI outcomes include response parsing and usage validation. Failed attempts have no
inferred usage; configured prices and settled costs stay in the discovery ledger.
Search topics, account lists, guidance, citations and provider text are omitted.

Bluesky outcomes cover HTTP and JSON reading; session and post validation follow
a successful attempt. Session reuse adds no login entry. Refreshes and pagination
produce separate attempts, with rate-limit waiting excluded from duration.

Budget entries follow successful ledger operations. Refusals do not identify the
limiting cap; the ledger remains authoritative. Cache reuse adds no admission.
Repairs reserve separately, and transport failures retain uncertain holds. No
prompt, response, purpose or provider error text is included in budget entries.

X discovery budget entries omit topic names, guidance, handles and provider text.
A refusal may also mean durable scheduled admission was already consumed; no
cap or refusal cause is inferred. Settlement logs precede citation persistence,
so a storage failure does not hide a charge. Credit exhaustion releases that
call’s hold while blocking further discovery in the ledger.

Anthropic reserve admission logs include the UTC budget day, lifecycle state,
scheduled eligibility, protected reserve, other-spend limit and effective
available funds. They distinguish a reserve shortfall from the final admission
result: another cap or provider block may also refuse the call. These entries
follow the ledger transaction commit and omit request content and purpose.
Verification calls rejected by their separate early cap do not reach this log.

Reserve lifecycle entries follow committed registration, reconciliation, claim
and completion transactions. They record the operation, budget day or run ID,
attempt and requested state. `applied` means a fenced transition changed a row;
`unchanged` means no eligible row matched. Registration reports `observed` and
the stored state because the first registration wins. Reads are silent, and
edition content and outcome explanations are omitted.

Edition attempts log their run ID, overall stages and per-topic stage transitions
using topic IDs. Repeated progress snapshots do not repeat unchanged stages.
A finish identifies the returned edition and distinguishes publication from reuse;
its duration includes database locking and cleanup, but excludes queue wait.
Failures identify the last observed overall stage without exception text or
content. A publishing-stage entry means publication is starting, not that its
transaction committed. Existing job progress reporting still runs normally.

The read-only runtime check is `pnpm exec tsx scripts/check-observability.ts`.
It matches a health request to the journal, checks completed worker jobs and
validates the fields in sampled structured records. Add `--verify-o1` to also
run offline coverage for all provider categories, budgets and edition stages,
including secret redaction and forced fatal errors in disposable child processes.
It never enqueues a job, publishes an edition or calls a paid provider. An empty
provider or edition count means no event was observed in the journal sample;
it does not claim that path ran live. Migration command output remains plain text.
