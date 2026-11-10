# Public access and reader accounts: plan

> [!NOTE]
> Approved by the owner on 2026-11-07 and steered as STEERING item 50.

## Goal

Make the site publicly readable, with optional reader accounts, without
skipping an edition. End state:

- **Anyone** can read every published edition, with every topic shown.
- **Readers can hide topics and bookmark stories and posts**, signed in or not.
  Signed out, this lives in the browser. Signed in, it is also saved to the
  database and syncs across devices.
- **There is no owner profile.** Topics, the schedule, editions and edition jobs
  are system-level. Hiding a topic only filters what a reader sees; editions
  are never generated per reader.
- **Admin pages, the handbook, the DB explorer, Grafana and the jobs browser are
  publicly viewable.** Every write needs a designated admin.
- **Ad hoc test editions** run on a separate development budget and never appear
  in the public reader.
- Old profile tables, columns, flags and code are deleted only after the new
  model is proven, with the owner's approval. The old design is recorded in
  `docs/decisions/`.

This supersedes `MISSION.md` "Profiles now, accounts later": readers are not
mapped to profiles, and profiles go away.

## Where things stand (verified 2026-11-09)

Owner proxy rerun (iteration 1559) is blocked for review: the baseline contains
two forwarding entries, failing the probe's single-entry assumption. Forged
email is replaced, but final-client stability and hop meaning remain unproven.
`proxyClient` accepts a final IP from one header field and an explicitly trusted
peer; it does not require a single entry. No trust interpretation or activation
was changed. [Shape-only results and blocker](../NEEDS_FROM_HUMAN.md#admin-access-rollout-updated-under-steering-36).

- Privacy comes only from exe.dev's proxy, which makes visitors log in to
  exe.dev first. The reader routes have no authentication of their own.
- Admin access is `isAdmin` in `apps/api/src/admin-access.ts`: the exe.dev
  `X-ExeDev-Email` header checked against `ADMIN_EMAILS`, or `ADMIN_LOCAL_TOKEN`
  from loopback. exe.dev documents when it adds that header, but **not whether
  it removes a copy forged by a visitor** on a public site.
- "Profile" is one hard-coded row (`PostgresProfileRepository.getDefault`). Five
  tables reference it: `topics`, `digest_schedules` (primary key `profile_id`),
  `digest_previews` (editions), `edition_job_requests`, `edition_job_failures`.
  Sources and topic–source connections hang off topics.
- The admin edition form creates private tests through
  `POST /api/admin/digest-previews/tests`, using stored content for free by
  default. AI editing and paid X search are independent opt-ins, funded by
  separate lifetime development allowances. Legacy manual-generation routes
  still use production accounting; they are not the admin form's test path.
- Development AI requires `LLM_LIVE=1`; paid X requires `X_SEARCH_LIVE=1`
  and uses direct xAI. Both reserve funds before calling a provider and stop
  on refusal, uncertain errors or reporting thresholds. X reserves $0.40 per
  call and settles confirmed token/fetched-item charges in full, including
  charges above the estimate. Tests do not read or write production scores.
- Publication metadata is deployed. Reader latest, history and direct links
  return published editions only; private tests remain available in admin.
  The Nov 3–8 scheduled editions are published. Phases 0 and 2 passed the
  normal Nov 8 scheduled acceptance, including original-response comparisons
  and browser preferences/bookmarks. [Acceptance record](edition-reviews/2026-11-08.md#phase-0-and-phase-2-acceptance--iteration-1386).
  Phase 1 foundation is applied in migration `0011`: a single-row
  `edition_settings` table copies the configured owner schedule and refuses a
  missing schedule. Profile reads remain
  authoritative while the flag is off. Migration `0012` adds nullable ownership for topics,
  editions and durable job records, retaining foreign keys and all existing
  ownership values. Both migrations were applied live on Nov 9 (iteration 1441), each after a fresh
  private backup and a fresh restored-copy rehearsal. Account migrations remain pending.
  Schedule reads
  use `edition_settings` with `SYSTEM_OWNERSHIP=1`; schedule updates write both
  settings tables in one transaction, including with the flag off. Missing system
  settings abort the write. Prepared topic reads and mutations use the shared
  catalog with the flag on; new topics retain the default profile for rollback,
  and flag-off queries retain profile isolation. Prepared durable-job reads include all
  ownership with the flag on; new request/failure records retain default-profile
  ownership for rollback. Prepared edition reads and generation topic selection use
  system scope with the flag on, preserving publication filters and saved snapshots;
  new editions keep default-profile ownership for rollback.
  The live flag is on (Nov 9, iteration 1442). Before activation, an explicit
  read-only live comparison verified all 550 saved editions across off/on/off,
  topics, settings and complete reader HTTP responses. Restarted API/worker are
  healthy; served latest/history responses remain unchanged. Live AI-off generation
  passed Nov 9 (iteration 1443): 466 stored candidates, four topics and 20 stories;
  the private test remains excluded from the reader and keeps rollback ownership.
  Live AI-on generation passed Nov 9 (iteration 1444): 465 candidates and 20 stories;
  Gaming used Haiku editing, while three topics retained labelled fallback output.
  Development Anthropic charges are $0.211076 across 38 calls, with zero holds
  and no production calls. Live development editing was disabled again after the check.
  Normal scheduled acceptance passed Nov 9 (iteration 1544); see the
  [scheduled acceptance receipt](edition-reviews/2026-11-09.md#phase-1-scheduled-acceptance--iteration-1544).
  The private restored-copy SQL rehearsal passes for both Phase 1 migrations:
  original-table fingerprints and foreign keys remain intact, schedule parity
  holds, and an injected failure rolls back DDL, data and ledger entries.
  Run `python3 ops/backups/rehearse_system.py` to repeat it; the private receipt
  identifies the backup and migration checksums. The actual TypeScript migration
  runner also passes twice on the restored copy, with unchanged rows and ledger on repeat.
  Phase 1 uses `MIGRATE_THROUGH=0012_nullable_system_ownership pnpm migrate`
  so prepared account migrations remain pending; unknown stopping tags roll back.
  Restored-copy adapter comparisons also pass for all 550 saved editions (complete latest,
  direct and paginated history with both publication filters), topics and settings across
  flag off/on/off. Read-only sessions and unchanged fingerprints protect the restored copy.
  Restored-copy reader HTTP comparisons also cover complete latest, every direct response
  (including private 404s) and all history pages across the same flags and publication filters.
  Isolated system-owned AI-off and synthetic fixture-AI test editions match the
  existing golden snapshots, stay unpublished and remain readable after flag rollback.
  Live flag-on AI-off generation also passes; the complete read-only off/on/off
  comparison now covers 552 editions, including both new private tests. The AI-on
  test keeps default-profile rollback ownership and stays unpublished; existing
  reader responses are unchanged. Nov 9 scheduled acceptance closes Phase 1:
  all 553 saved editions retain
  off/on/off parity, all five original reader hashes match, and seven published
  editions pass desktop/mobile light/dark rendered counts and titles.
  Recheck a saved private edition without provider calls using
  `pnpm exec tsx apps/api/scripts/smoke-previews.ts --edition UUID`.
  Repeat the live read-only comparison with `/usr/bin/node --env-file=/home/exedev/.config/news-digest/env --import tsx apps/api/scripts/rehearse-system-reads.ts --live-read-only`. It forces
  read-only database connections and starts no queues or provider adapters.
  Isolated HTTP tests compare complete latest, every original-owner direct edition (including private
  404s) and all original history entries across every page across flag off/on/rollback, with publication
  filtering enabled and disabled; these pass without provider calls.
  Public access remains owner-gated.
- Internal tools: the DB explorer reads only the catalog
  (`apps/schema-explorer/src/introspect.ts`). Grafana already allows anonymous
  Viewer access, and its Postgres role has column-level grants only
  (`ops/observability/grafana/sql/product-reader.sql`). The jobs browser is
  read-only. `/logs` and `/metrics` proxy the raw VictoriaLogs and
  VictoriaMetrics HTTP APIs.

Prepared client admission follows [exe.dev’s documented append behavior](https://exe.dev/docs/proxy.md):
only the final `X-Forwarded-For` address is used, and only from an explicitly
trusted immediate socket peer. Duplicate headers, malformed addresses and unknown
peers fail closed; equivalent IPv4/IPv6 spellings share a bucket. The parser is
gated by the account enable flag. Verify the live peer and forged-prefix behavior
before configuring trust or activating accounts; no proxy address or network is assumed trusted.

Prepared HTTP bootstrap (iteration 1445) combines the account gate, runtime and
proxy admission before registration. Disabled accounts open no dependencies; enabled
accounts require explicit IP addresses in `ACCOUNT_TRUSTED_PROXY_PEERS` and valid
account configuration before storage opens. Isolated loopback HTTP checks exercise
mailbox login, secure session exchange and replay refusal against disposable
Postgres/Redis, including rejection of missing forwarded addresses. Main installs
this bootstrap only behind the account flag; no live peer is configured or trusted.

Prepared storage composition (iteration 1446) supplies the real account repositories
and Redis admission behind that gate, with explicit, repeatable shutdown of every
owned connection. Closed signup checks persisted verified identities, allowing
existing readers to request codes while refusing new identities with the same
public response. Disposable-storage HTTP checks cover both paths and shutdown;
main registration is installed behind the disabled flag; live proxy verification
remains pending.

An isolated composed-storage check now exercises stand-in mailbox login through
real Postgres and Redis, cross-runtime session authentication, concurrent single-use
friend redemption, non-admin issuance refusal and all-device logout isolation.
This does not register routes or enable accounts.

Phase 1 is accepted after the Nov 9 scheduled edition; Phase 3 preparation
continues with account activation gated by live proxy proof. Unapplied migration
`0013` adds independent `users` and
`sessions`: normalized unique emails, unique SHA-256 token hashes, cascading
account deletion, sign-in admin eligibility and cookie renewal timestamps.
No server expiry is stored. Prepared, unconnected session application code issues
32-byte random tokens, stores only SHA-256 hashes, and builds secure host-only
cookies capped at 400 days. Daily renewal is claimed atomically through a repository
port without changing sign-in time; admin access requires eligibility at sign-in,
current allowlisting and age below seven days. Single/all-device revocation is
prepared. Offline tests cover renewal races, old reader sessions and admin changes.
The prepared Drizzle session adapter joins identities, atomically claims renewal,
and supports single/all-device revocation. Isolated database tests cover concurrent
renewal, identity mapping, revocation isolation and account deletion. Account routes and sync are composed behind the disabled account flag.
Unconnected login-code application logic now normalizes emails, applies admission
ports to requests and redemption, and issues ten-minute six-digit challenges.
Keyed SHA-256 hashes bind codes to emails; comparison uses constant-time crypto.
The repository contract requires atomic five-attempt accounting and single use.
Offline tests cover expiry, replay, malformed guesses and admission denial.
A disconnected stand-in mailbox writes atomically to owner-only files in a
700-mode directory, uses hashed recipient filenames and refuses unsafe permissions
and symlink reads. Owner retrieval rejects expired messages. Once configured, read
a code with `ssh news-digest.exe.xyz 'cd ~/news-digest && pnpm exec tsx scripts/read-login-mailbox.ts /absolute/mailbox/path reader@example.com'`.
Prepared Redis admission shares atomic per-email (10) and per-client (50) limits
across code requests and redemption in a ten-minute window. Keys use keyed hashes,
blocked attempts count in both dimensions, and Redis failures deny admission.
The adapter remains unregistered; client addresses must come from the verified proxy boundary.
Unapplied migration `0014` and an unregistered Drizzle adapter prepare login
challenge persistence: row locks serialize guesses and redemption, five attempts
exhaust a challenge, and replacement resets it. Expired/future/consumed challenges
are rejected; comparison failure rolls back the attempt. Isolated tests cover
concurrent single use and exhaustion across two adapters. A prepared, disconnected exchange consumes a verified code before finding or
creating an independent reader identity and issuing a hashed session. Concurrent
first-login identity creation preserves the original identity and creation time;
failed identity/session storage requires a fresh code. Isolated checks exercise
replay rejection, admission denial, concurrent redemption, identity reuse, secure
cookies and hashed storage. A disconnected request boundary prepares exact HTTPS Origin and JSON checks, bounded
login bodies rejecting caller identity/permission fields, and strict session-cookie
parsing that rejects duplicate cookies. Offline tests cover cross-origin requests,
malformed bodies and ambiguous credentials. Prepared signup eligibility preserves existing-account login in `off` and `invite`
modes; `invite` permits configured admins to bootstrap through codes. Friends
will enter through separately verified admin-issued links. Unknown modes and
open signup with stand-in delivery are rejected during policy construction;
identity lookup failures deny eligibility. The policy is not registered and
no login endpoint is exposed. Disconnected account handlers now compose the request
boundary, code exchange and session lifecycle: invalid writes stop before side
effects, successful redemption returns only the secure cookie, and session JSON
excludes bearer tokens and internal identity/session IDs. All-device logout uses
the authenticated identity. Registration is gated; verified live proxy client wiring remains pending. An uninstalled HTTP adapter now prepares code request/redemption, session lookup
and single/all-device logout routes. It requires an explicit enable flag and an
injected verified client key, bounds streamed JSON bodies to 2 KiB, marks responses
no-store and returns generic dependency failures. Loopback HTTP tests exercise the
disabled gate, origin rejection, oversized/malformed bodies, cookie-only redemption
and private failure responses. Main registers it behind the disabled flag; no
account HTTP routes are exposed. Operational reader roles and PUBLIC receive no
access to the three account tables.
Prepared runtime composition now joins the account services through injected repository
and Redis ports. Disabled configuration creates no dependencies; enabled configuration
requires an exact HTTPS `ACCOUNT_ORIGIN`, a 64-hex-character `ACCOUNT_SECRET_KEY`,
an absolute `ACCOUNT_MAILBOX_PATH`, valid `ADMIN_EMAILS` and a closed/invite
`SIGNUP_MODE`. Code hashing and admission keys are derived separately from the
secret. Main registers this factory through a Nest lifecycle provider, before body
parsing; owned connections close with the application. Verified live client
wiring and activation remain pending. Offline composition checks use a temporary
stand-in mailbox.
Prepared sign-in-link lifecycle now requires an authenticated fresh admin, normalizes
the recipient, stores only a random 32-byte token hash and requires atomic issuance
audit. Links last 24 hours; only POST redemption can consume one. The repository
contract requires atomic single use, and identity/session failures leave links consumed.
Unapplied migration `0015` and an unregistered database adapter now prepare private
hash-only link storage and issuance audit in one transaction. Database redemption
uses a conditional update so concurrent requests have one winner. Both new tables
exclude PUBLIC and operational reader roles. Prepared, uninstalled HTTP routes now
issue links through fresh-admin sessions and redeem through guarded POSTs. Exact
Origin/JSON checks, bounded strict bodies, private responses and preview rejection
apply; successful redemption returns only a secure session cookie. The prepared runtime now injects the link repository and composes link issuance
and redemption with the same identity/session services as code login. Offline
composition verifies admin issuance, hash-only storage, non-admin friend sessions
and replay rejection. Prepared issuance now includes an origin-pinned URL carrying the
bearer only in its fragment. An uninstalled confirmation page clears that fragment
before interaction and redeems only after an explicit button POST. It uses no
remote resources or browser storage, forbids framing and referrers, and discards
tokens after any attempt. Isolated desktop/mobile browser checks cover preview,
success, replay and reload behavior. Main registration is gated; verified live proxy wiring and activation
remain pending; accounts stay disabled.

Prepared account deletion now derives ownership only from a session hash inside
one transaction. It locks/rechecks the session, removes pending email codes and
recipient links/audit rows, and deletes the identity with cascading sessions and
issuer audit rows. Isolated storage acceptance covers concurrent two-device
requests, revoked/unknown credentials, rollback and another account's isolation.
The prepared, uninstalled POST `/api/account/delete` transport requires exact
same-origin JSON, a body containing only `{"confirmation":"DELETE"}` and one
unambiguous session cookie. It accepts no caller identity, clears the secure cookie
only after successful deletion and hides dependency failures. The prepared runtime injects deletion through a required repository dependency
and supplies its configured mailbox cleanup to the dependency factory. Main installs account routes only when the account flag is enabled. The stand-in mailbox
now prepares idempotent recipient cleanup: it checks the private directory and
unlinks only the hashed recipient entry, without following symlinks or removing
directories. The prepared deletion repository now requires an idempotent cleanup port and removes
the mailbox entry before committing identity deletion. Cleanup failure preserves
the account; a later database failure leaves a usable account whose next login
request can issue a fresh code. Isolated tests cover both failures, retry and
recipient isolation. Production composition remains disabled. The repository requires the shared
recipient boundary before starting its deletion transaction, preventing in-flight
delivery from recreating a mailbox message after cleanup. Prepared migration 0016 adds cascading sync-data ownership; it remains unapplied.
Iteration 1423 prepares a shared recipient-coordination port and PostgreSQL
transaction-scoped advisory-lock adapter. Independent connections serialize the
same normalized recipient while other recipients progress; callback failures
release the lock, and contention fails closed after five seconds. The lock stores
no recipient text. Prepared login-code issuance now requires this boundary around
challenge replacement and awaited delivery, and checks eligibility after acquiring
it. Composition requires an explicit coordination dependency; main remains
disconnected. Prepared code exchange now holds that same boundary through proof
consumption, identity lookup and session creation, with eligibility checked after
waiting. Prepared sign-in-link issuance now uses the same boundary around its
audit/write, rechecking issuer session and admin eligibility after waiting.
Prepared link redemption reads the stored recipient to select the same lock,
then rechecks single-use consumption after waiting and holds coordination through
identity/session persistence. Deletion resolves the recipient from the stored
session, acquires that same boundary and rechecks ownership inside its transaction
after waiting; coordination failure removes nothing. Runtime deletion injection is prepared: isolated cross-runtime acceptance verifies
session revocation, mailbox cleanup, repeat rejection and another account remaining
usable. Prepared migration 0016 adds per-user hidden-topic changes and bookmark
display copies, with null-copy removal tombstones. Composite keys isolate readers;
keys and JSON size are bounded. Topic/item keys deliberately have no content foreign
key so historical preferences survive source removal. Both tables cascade with
identity deletion and deny PUBLIC and operational reader roles. Storage acceptance
covers cascade, rollback, surviving accounts, tombstones and inherited grants.
Prepared server merge policy matches browser timestamp/tie ordering, retains tombstones,
and rejects invalid changes or a union exceeding 1,000 bookmark keys or 1,000
topic keys (including removal records). Display copies use the browser field limits;
rejection preserves both inputs. Prepared sync persistence locks the identity row across read/merge/write, including
first sync, and serializes with account deletion. Isolated acceptance covers concurrent
devices, tombstones, reader isolation, capacity rejection and write rollback.
Prepared POST `/api/account/sync` authenticates the reader from the session cookie,
validates the versioned state and merges through the locking repository. It accepts
only same-origin JSON, bounds streamed requests to 16 MiB (the bounded state can
exceed login payload limits), and returns private, uncached state with cookie
renewal when needed. Invalid state rejects before persistence; storage failures
return no details. HTTP acceptance covers disabled routes, forged identity fields,
unauthenticated/cross-origin writes, stale updates, body limits and private failures.
Prepared runtime composition now requires the sync repository alongside sessions and
account deletion. Isolated cross-runtime acceptance verifies persisted changes, stale
update handling, reader isolation and rejection after deletion. Prepared browser sync
transport sends same-origin cookie-authenticated state, validates bounded responses,
merges edits made during requests and preserves local choices on failures. Stopping
the client aborts requests and rejects late responses before account data is cleared.
Offline tests cover concurrent requests, delayed logout responses and retry. Account
lifecycle subscribes to store changes, drains edits made during requests, suppresses
server-write loops and exposes safe retry status. Logout cancellation precedes
local clearing. Offline acceptance covers queued edits, outages and late responses.
Prepared browser account controller connects bounded, credential-free session discovery
to automatic sync, explicit retry and single/all-device sign-out. It stops uploads
and invalidates delayed discovery before logout, clears account choices only after
success or confirmed session loss, and retains choices with syncing paused after
failed logout. Initial anonymous discovery preserves browser-local choices. Offline
acceptance covers those transitions, malformed sessions and teardown. React
preferences now expose a stable account bridge: local and cross-tab changes notify
sync, merged server state updates the reader and browser storage, and confirmed
logout removes persisted choices. Blocked storage reports failure while updating
the active reader. Prepared React account hook owns the gated controller, discovers
sessions on mount, refreshes on visible tab returns and removes browser listeners
and cancels requests on teardown. Disabled binding makes no requests or preference
changes. Offline acceptance covers disabled, hidden/visible, coalesced events and
delayed discovery after unmount. Prepared `/account/login` now supplies email-code requests and redemption behind the
disabled account gate, using same-origin POSTs and a restrictive CSP. It keeps
credentials out of URLs and browser storage, clears submitted codes, preserves
request eligibility privacy and redirects after successful exchange. Isolated
desktop/mobile checks use fixture responses. Prepared gated reader account panel
shows sign-in, sync progress/failure, retry and single/all-device sign-out;
failed actions preserve the controller’s retained choices. Latest/historical reader
and saved-item headers mount it only with `VITE_READER_ACCOUNTS=1` (default off),
sharing each page’s preference bridge for sync. Confirmed account deletion requires
typing DELETE, pauses sync before sending the authenticated request and clears local
choices only after success; refusal preserves choices for retry. Activation remains pending.
Isolated stored HTTP acceptance now uses two independently redeemed device
sessions: saved-story copies and removals converge, stale writes preserve removals,
a friend reader stays isolated, single-device logout preserves the other session,
and all-device logout and deletion refuse subsequent sync. This is automated
preparation; the owner’s two-device check and scheduled acceptance remain open.
Mounted-reader browser acceptance also covers separate desktop/mobile contexts:
a desktop save appears on mobile, a mobile removal reaches desktop, and both
retain the removal after navigation/reload (fixture account transport, saved edition).
It does not make the adapters' separate transactions atomic.

Prepared admin invitation control (iteration 1453) appears only for an admin
session in the gated account panel. It POSTs the recipient email, displays the
returned same-origin fragment link without opening it, and supports dismissal
and retry after refusal. Link and recipient stay in component memory only;
unmounting the control aborts pending requests. No delivery is sent. Accounts
remain disabled, pending live proxy proof and the Phase 3 activation checks.

Prepared admin session revocation (iteration 1454) remains behind the account gate. It
requires an active originally eligible admin session, the current email allowlist
and a sign-in younger than seven days, rechecked under a database row lock.
All target device sessions are removed in the same transaction as a private audit
using the stored recipient email; an audit failure restores the sessions. Migration
0017 only expands the allowed audit actions and remains unapplied. Isolated
checks cover stale/revoked/non-admin issuers, target isolation, rollback and a
concurrent logout. Prepared transport (iteration 1455) adds POST-only
`/api/account/sessions/revoke` with exact Origin/JSON checks, a strict single-UUID
body, an unambiguous session cookie and the existing trusted-client/body limits.
Responses contain only the revoked count; authorization is rechecked by the atomic
service rather than renewing the issuer session first. Isolated HTTP checks cover
disabled/unconnected routes, malformed requests, refusal and private failures.
Runtime service injection (iteration 1456) now composes the audited repository with
the same current admin allowlist and owns its connection shutdown. Isolated
cross-runtime checks verify non-admin refusal, target-only revocation and repeat
zero-count success. The prepared admin panel (iteration 1457) accepts a reader
account ID and requires explicit all-device confirmation, reset when the target
changes. Refusal preserves the target for retry; success reports the removed
session count and refreshes the issuer session, including after self-revocation.
Targets stay in memory and unmount aborts pending requests. Accounts stay disabled;
no live operation or migration is enabled.

Stored HTTP acceptance (iteration 1459) also requires silent account flows: code
requests/redemption, sign-in links, replay refusals, sync, revocation, logout and
deletion emit no console logs. The HTTP boundary separately verifies that a
credential-bearing exception produces an empty failure response and no console
output. These are isolated checks; live proxy proof and activation remain open.

Account schema privacy acceptance (iteration 1460) recreates all seven account
tables after installing broad default SELECT grants. Both operational reader
roles and an unrelated role inheriting only PUBLIC permissions have no table
privileges; real SELECT attempts are refused, including login challenges. The
rehearsal runs only against disposable Postgres and rolls its changes back.

The [Phase 3 activation checklist](account-activation.md) separates configuration,
backup/restore rehearsal, bounded migrations, owner acceptance and rollback.
The account-specific fresh-restore command is
`python3 ops/backups/rehearse_accounts.py`: it takes a private backup, restores
without network access, checks rollback and the actual runner twice through
0018, preserves original table fingerprints and denies all eight account tables
to operational/PUBLIC readers despite broad default grants. Its private receipt
is `~/backups/news-digest/account-migration-proof.json`. Live proxy proof and
the remaining Phase 3 checks still gate activation.

## Phase 4 preparation

Prepared API-admission configuration (iteration 1601) reuses the verified
last-entry visitor selector and account secret with the limiter’s separate HMAC
namespace. It validates peers and the key before acquiring Redis, owns idempotent
shutdown, and opens no resources with public mode off. The configured adapter
is composed into the configured public runtime (iteration 1602). Startup failure
closes admission Redis; shutdown attempts both storage and admission cleanup
once and reports all failures. Private mode opens no admission resources.
Public mode remains off pending Phase 4 acceptance.

Isolated configured-runtime rehearsal (iteration 1603) uses disposable migrated
PostgreSQL and Redis with the production account/admission factories. A real
loopback HTTP burst shares the 120/minute allowance across the observed duplicate
visitor entries and zero/one/two forged prefixes. Account session transport, temporary-mailbox code delivery,
restart persistence, independent visitors, missing-client refusal, health/privacy
bypass and private rollback are covered. Downstream reader controllers remain a
204 sentinel in this focused rehearsal. Iteration 1604 adds a full compiled Nest
application rehearsal with the configured provider mounted before body parsers,
real reader controllers and the public error filter. It checks published fixture
latest/direct reads, private fixture refusal, anonymous session reads, restricted topic reads,
forged-header write refusal, empty controller errors and shared admission across
reader/account routes. Iteration 1605 extends this same compiled application rehearsal
through temporary-mailbox code redemption, secure admin session cookies, authorized
topic reads and an unchanged topic-enable write, reader sync, and logout revocation.
Iteration 1606 adds invited-reader two-session preference sync, bookmark removal
with stale-device replay, account isolation, forged-owner-header admin write refusal,
invitation refusal and all-device logout. Iteration 1607 adds account deletion across
both sessions, pending invitation revocation, empty preferences after re-invitation,
and preservation of the published reader edition. Iteration 1608 adds admin-targeted
two-device session revocation, reader refusal, repeat zero-count revocation, issuer
isolation and preference recovery after a fresh invitation. Iteration 1609 checks
operations-route refusal through the compiled application for anonymous visitors
and a real admin session: logs, metrics queries, Grafana, docs, database and queues
return empty no-store 404s for GET/HEAD/POST despite forged owner headers. The
admin session remains valid afterward. Owner and scheduled acceptance gates remain open. No live
flags or data are changed.

Prepared reader sync (iteration 1588) bounds preference clocks to year 9999,
the largest year its ISO timestamp storage accepts. Larger clocks return an
empty no-store 400 before storage; epoch and maximum accepted clocks round-trip
through isolated PostgreSQL tests. Accounts/public remain disabled.

Prepared reader sync (iteration 1587) rejects escaped lone Unicode surrogates in
bookmark display fields and preference keys before storage. Valid multilingual
text and supplementary characters remain accepted. Offline policy and HTTP
checks cover refusal without storage writes; accounts/public remain disabled.

Prepared account writes (iteration 1586) reject malformed UTF-8 before handler
dispatch rather than silently replacing bytes in reader data. Offline HTTP tests
cover invalid byte sequences and valid multilingual text split across chunks.
Accounts/public remain disabled pending proxy proof.

Prepared public authorization (iteration 1585) checks connection liveness after
session authentication and durable admin-write admission. Disconnected requests
cannot start downstream controllers; disconnects during authentication also skip
audit admission. An audit already started may finish. Offline HTTP tests cover
both waits and subsequent connected recovery. Accounts/public remain disabled.

Prepared account routes (iteration 1584) reject multiple wire-level Cookie fields
before authentication or account writes, including mixed-case header names.
Offline HTTP checks cover session reads, redemption and logout-all refusal with
no cookie or response body, then successful handling of one Cookie field and
cookie-free redemption. One Cookie field may still contain unrelated cookies.
Accounts/public remain disabled pending proxy proof.

Prepared account writes (iteration 1583) require exactly one wire-level Origin
and Content-Type header before body reading or handler dispatch. Offline HTTP
tests reject repeated identical and conflicting values, including mixed casing,
with empty no-store responses; a subsequent unambiguous request succeeds.
Accounts/public remain disabled pending proxy proof.

Prepared atomic source, topic-enable and topic-order transports (iteration 1582)
check connection liveness after authentication, before beginning a storage write.
Offline HTTP tests disconnect during delayed authentication and verify no mutation;
a subsequent connected request still succeeds. This does not cancel a transaction
that has already begun. Accounts/public remain disabled pending proxy proof.

Public-mode Nest error handling (iteration 1581) now returns empty, no-store
responses while preserving HTTP failure status. Controller exceptions, malformed
JSON, oversized parser bodies and unknown routes cannot echo submitted values or
internal exception messages. The filter installs only with `PUBLIC_MODE=1`;
account and prepared write transports retain their own empty error responses.
Offline Nest HTTP coverage checks 400/404/413/500, GET/HEAD and refusal before
controller execution for malformed or oversized JSON. Activation remains blocked.

Prepared general API admission (iteration 1572) uses one atomic Redis fixed-window
counter per HMAC-hashed client, shared across API instances. Its provisional
allowance is 120 requests/minute; denied attempts do not extend the window.
Missing client identity and Redis failure refuse admission. This adapter is
unregistered. Prepared HTTP enforcement (iteration 1573) gates API requests before
downstream work, returns empty no-store 429 responses on denial or dependency
failure, and leaves health/static traffic alone. Disabled mode opens no admission
dependency. Prepared access-stack/runtime composition (iteration 1576) can now
apply the caller-supplied gate before account transport and public authorization,
while retaining security headers on refusals. Composed HTTP tests verify denied
requests reach neither accounts nor authorization, dependency failure/recovery,
health bypass and private rollback without limiter construction. This optional
composition is now accepted by the stored runtime (iteration 1577), but environment
selection supplies no gate. Verified visitor extraction
(item 53) and production registration remain promotion work; preference-write
admission is prepared in the gated account runtime. Isolated Redis tests cover
concurrency, client separation, key privacy, expiry and failure. Composed HTTP
acceptance (iteration 1578) uses two instances and real isolated Redis connections:
a shared burst admits exactly the allowance before account/authorization work,
clients remain separate, expired allowance recovers, disconnected Redis refuses
without downstream calls, health bypasses the gate and reconnection restores it.
Injected test identities do not establish production visitor extraction.
The prepared HTTP gate also bounds admission waits to three seconds (iteration
1579), returning the same empty no-store 429 when the dependency stalls. Late
allowances or rejections cannot dispatch the timed-out request. Offline HTTP
coverage verifies deadline refusal, health bypass and subsequent recovery. The
deadline bounds the HTTP wait; it does not cancel an in-flight Redis command.
Pending admission also checks for an aborted request or closed response before
dispatch (iteration 1580). Real HTTP disconnect tests verify that both late
allowance and refusal finish without starting downstream work.

Sign-in request-log rehearsal (iteration 1571) composes the production request
logger with account HTTP transport and handler stand-ins. Login page, code
request, code/link redemption, session read, logout, reused-code refusal,
cross-origin refusal and dependency failure emit one correlated status/timing
record each, without email, code, token, cookie, session ID or client address.
`pnpm exec tsx --test apps/api/test/account-request-logging.test.ts` runs offline;
it uses no secret-value redaction to conceal accidental capture. Stored account
and proxy acceptance remain separate.

Prepared public mode now permits browser-private caching for one hour on successful
published-edition ID responses (GET/HEAD), only with `READER_PUBLISHED_ONLY=1`.
Latest and history stay `no-store`; private mode and unfiltered ID reads also use
`no-store`. Failed public requests retain the access layer's `no-store` policy.
No shared cache is allowed, so private proxy access and account cookies cannot
turn an edition response into shared content. Account and admin data remain uncached.

The default-off public access stack now sets HSTS (one year, host only),
`nosniff`, `no-referrer`, same-origin framing and a document CSP before account
transport or authorization. The CSP restricts base URLs, plugin objects, embedding ancestors and form
submissions (same-origin only). Frame sources are limited to the same origin,
`https://platform.twitter.com` and `https://syndication.twitter.com`. Document connections
are limited to the same origin and `https://syndication.twitter.com`. Script
elements use the app origin or `https://platform.twitter.com`; inline scripts and
eval are blocked. Theme startup is a blocking same-origin file, and browser Zod
validation disables code generation before schemas load. Inline HTML event handlers are blocked with
`script-src-attr 'none'`; JavaScript event listeners remain available.
`scripts/check-public-event-handler-policy.ts` verifies refusal, listener admission
and private rollback with synthetic buttons. Document images allow the app origin and HTTPS sources, supporting
source favicons and Bluesky previews without a fixed publisher list; HTTP and data
images are blocked. `scripts/check-public-image-policy.ts` verifies admission,
refusal and private rollback with intercepted synthetic images. Document fonts are restricted to the same origin; the app uses system fonts.
`scripts/check-public-font-policy.ts` verifies same-origin admission, external/
lookalike/HTTP refusal and private rollback with intercepted synthetic fonts.
Document audio/video is limited to the app origin; current social media plays
inside official X frames. `scripts/check-public-media-policy.ts` checks local
admission, external/lookalike/HTTP refusal and private rollback with synthetic media.
Document workers are forbidden (`worker-src 'none'`); the reader uses no workers.
`scripts/check-public-worker-policy.ts` verifies local/blob refusal and private rollback
with synthetic workers. Provider frames keep their own worker policies.
Bluesky cards need no frame. A complete resource allowlist still needs browser review before public
readiness is accepted. `pnpm exec tsx scripts/check-public-form-policy.ts`
uses synthetic local forms to verify external POST refusal, same-origin POST
success and unchanged private-mode behavior in Chromium. Account login/link
pages retain their stricter form prohibition.
`pnpm exec tsx scripts/check-public-frame-policy.ts` checks same-origin tools and
both X hosts, rejects unrelated/lookalike/HTTP frame origins, and verifies private
rollback using intercepted synthetic frames without provider traffic. Live X
embed compatibility passes for the Nov 9 saved edition (iteration 1556):
`pnpm exec tsx scripts/check-public-live-embeds.ts` injects the actual prepared
CSP into an isolated browser, loads all 10 real saved X widgets in desktop/mobile
light/dark, and checks for document CSP violations. It makes explicit live X
GET requests, blocks all writes, and leaves deployment flags unchanged.
[Forty card screenshots](screenshots/ui/public-x-policy.md) record the result.
Iteration 1558 verifies the connection allowlist with the same 40 live widget
views and `scripts/check-public-connect-policy.ts` (offline allow/deny and private
rollback checks). The [script-policy review](public-script-policy-review.md)
traced the earlier inline/eval reports to theme startup and Zod code generation,
then verified the corrected app with the enforced script allowlist (1567).
`pnpm exec tsx scripts/check-public-script-policy.ts` checks same-origin/official
script admission, inline/eval/lookalike refusal and private rollback offline.
Prepared anonymous static routing snapshots the deployed `/theme.js` and flat
JavaScript/CSS/WOFF2 files in the built assets directory at access-stack creation.
Unknown files, source maps, symlinks, directories, alternate spellings and writes
remain denied. Restart after replacing a build. The live widget checker
`--review-routing` option rehearses anonymous reader admission alongside CSP.
`pnpm exec tsx scripts/check-public-policies.ts` runs all nine offline browser
policy checks against the current prepared stack, including private rollback.
It stops on the first failure and limits each check to two minutes. Iteration
1569 passes all nine after moving the form probe's observer out of inline HTML,
which the script policy correctly blocks. These are synthetic browser checks;
live widget/routing checks, full Phase 4 rehearsal and proxy acceptance remain separate.
Iteration 1570 adds `pnpm exec tsx --test apps/api/test/public-readiness-http.test.ts`:
a configured Nest HTTP matrix with session/storage stand-ins checks anonymous,
reader, fresh-admin and subsequently revoked-admin access. Internal tools, queues,
unknown assets and ambiguous routes refuse before authentication or downstream
handlers, including requests carrying forged proxy identity and a local token.
Reader GET/HEAD stays anonymous; admin reads require current eligibility; invalid
write origins refuse before storage. Direct-local tokens cannot open tool routes.
This does not prove live proxy behavior or complete the Phase 4 acceptance gates.
Private mode adds none of these headers. Wire-level checks
cover account responses, reader GET/HEAD and denied routes, including a forged
forwarded protocol. Accounts/public activation remains gated as before.

The `/privacy` page is available from the reader footer. It describes browser-local
choices, limited technical error reports, embedded third-party connections and the
hosting proxy. Account data, sync, deletion and backup retention appear only when
the compiled account UI is enabled; otherwise it states that accounts are disabled.
It makes no account or external requests. The public classifier permits GET/HEAD
for this page; public activation and all other Phase 4 gates remain open.

An unregistered route classifier now enumerates the current edition and account
API operations and administrative controller routes by method and path. Unknown
routes and ambiguous encoded/dot/separator spellings are denied. It grants no
prefix-wide access. Account code/link exchanges and session discovery remain
anonymous-capable; their existing handlers still enforce private responses and
origin, body and client admission. Sync/deletion/logout require a user; invitation
and session revocation require a fresh admin. Administrative reads remain admin
classified until their response audit, except the audited count-only alerts API
(see [response audit](public-read-response-audit.md)). Tool, asset, SPA admin, telemetry and
identity-discovery routes still need explicit review before registration.
This classifier is not middleware, performs no authentication, and is not
installed in main. An unregistered schedule module now prepares default-off
`PUBLIC_MODE` composition of the system-only reader and GET/HEAD transport;
enablement requires system ownership and published-only readers. Disabled
composition opens no storage. This does not install public authorization or
change live access behavior.

Prepared authorization middleware (iteration 1507) now enforces that classifier
before downstream handlers: unknown routes are refused, user routes require a
resolved session and admin routes require freshly recomputed admin eligibility.
It ignores proxy identity headers, fails closed on authentication errors and marks
responses no-store. The disabled path performs no authentication. It remains
uninstalled. Prepared account-session composition (iteration 1508) now uses the
existing strict cookie boundary and session service, recomputes admin freshness
and allowlisting per request, and forwards daily secure-cookie renewal. Public
authorization refuses enablement without account handlers; its disabled path
constructs no account resources. Prepared direct-local script credentials
(iteration 1509) accept one exact configured token only from loopback sockets
without any Forwarded/X-Forwarded headers. They authorize classified administrative
API routes only and cannot impersonate readers or administer account sessions.
Prepared write provenance (iteration 1510) requires one exact HTTPS Origin and
one JSON Content-Type on every classified non-GET/HEAD request, including account
exchanges and DELETE. Only authenticated direct-local administrative scripts may
omit Origin; forwarded requests and explicitly foreign origins cannot use that
exception. Duplicate headers refuse before downstream handlers. This guard does
not grant authorization and remains uninstalled alongside the prepared policy;
live proxy proof, audit enforcement and controller replacement remain promotion gates.

Prepared admin-write admission (iteration 1513) now requires a trusted UUID actor
or explicit local-script actor and awaits a durable audit recorder before the
handler can run. Missing identity/recorder or storage failure refuses with an
empty 503; unauthorized requests never reach the recorder. Entries contain only
actor, method, classified path and time; query strings, bodies and credentials
are excluded. Admission records attempted execution, not successful mutation.
Trusted actor composition (iteration 1514) now derives UUIDs from persisted
sessions and marks validated direct local-script requests explicitly. Session
response bodies still exclude identity. A supplied recorder is awaited with the
same request clock; missing or failed storage still blocks writes. Durable recorder storage is prepared (iteration 1515) in unapplied migration
0018: private admission rows contain only user/local-script actor, method,
classified path and time. User deletion cascades these rows; operational and
PUBLIC readers receive no access. The unregistered adapter rejects unclassified
writes and query strings and propagates database failures. Prepared runtime injection (iteration 1517) owns a lazy durable recorder and
repeatable shutdown; disabled composition opens no account or storage resources.
Isolated HTTP checks verify persisted admission and refuse handler execution when
the database rejects the actor. A shared transaction boundary (iteration 1518) now
prepares admission insertion and database mutation on one connection: callback or
database failure rolls both back, and audit refusal prevents the callback. It
returns only after commit and leaves pool ownership with the caller. Existing
middleware still records attempts independently. A prepared source-enable writer (iteration 1519) binds the admission to the exact
source target and locks its row before reporting changed or unchanged. Missing
sources return not-found and roll back admission; storage failures propagate.
Concurrent identical toggles produce one changed and one unchanged result. Unapplied additive migration 0019 adds a nullable outcome: the prepared source
writer persists changed/unchanged in the same transaction as its mutation. Null
means admission only, including older rows; it never implies success. Failure
while saving an outcome rolls back both admission and mutation.
A prepared, uninstalled source-write HTTP boundary (iteration 1520) delegates to
that atomic writer after exact HTTPS Origin/JSON checks, a 2 KiB streamed body
limit and fresh-admin authentication after upload. Wire-level Origin and Content-Type
counts must each be exactly one, including when Node discards duplicate values.
It accepts only the exact PUT
route and a single boolean `enabled` field; malformed/unauthorized requests never
reach storage. Responses project changed/unchanged results, return empty 404 for
missing sources and hide authentication/storage errors behind empty 503s. Mount
before body parsers and outside the standalone admission middleware to avoid
independent duplicate admission records. Prepared default-off routing composition (iteration 1523) now places the atomic
source transport before standalone authorization and legacy controllers. Invalid
source methods/targets terminate there; unrelated routes still enter authorization.
The disabled composition constructs neither handler. Loopback checks pin single
writer execution without duplicate admission or legacy fallthrough. Prepared storage composition
(iteration 1524) connects this router to the transactional source writer using a
caller-owned pool; disabled composition opens neither storage nor authorization.
Isolated HTTP checks verify persisted outcomes, rollback on actor refusal and
missing sources, and zero standalone/legacy calls for source writes. Prepared owned
runtime (iteration 1525) closes its source pool after failed construction and exposes
repeatable shutdown for future Nest ownership; disabled mode acquires nothing.
Authorization resources remain caller-owned. Prepared account-backed composition
(iteration 1526) shares the existing session/local-script authenticator between
atomic source writes and ordinary authorization. Missing account handlers refuse
before storage opens; disabled composition constructs neither accounts nor storage.
Loopback and isolated database checks cover cookie renewal, session refusal/failure,
one transactional source admission and no duplicate standalone admission. Ordinary
routes now run the prepared Origin/JSON provenance boundary before session lookup
and standalone admission (iteration 1527); missing/foreign Origin or invalid media
types refuse without reaching authentication, storage or controllers. Source writes
retain their stricter streamed boundary and single transactional admission.
Atomic source routing now also carries the configured direct-local script token
(iteration 1528): only authenticated loopback requests without forwarding headers
may omit Origin; explicit foreign origins, duplicate credentials and invalid bodies
refuse before authentication or storage. A prepared access-stack selector (iteration 1529)
constructs exactly one public or legacy guard, keeps bounded account transport
first and refuses public composition without it. Offline HTTP checks verify that
proxy identity headers cannot reach legacy authorization in public mode and
unclassified tool routes terminate before downstream handlers. Combined runtime preparation
(iteration 1530) now joins account transport, transactional source routing and
exclusive authorization with one repeatable source-pool shutdown. Missing transport
refuses before storage acquisition; private mode constructs no public resources.
Accounts and the ordinary admission recorder remain caller-owned in that low-level composition. Stored runtime preparation (iteration 1531) now shares one account-handler instance between bounded login transport and public authorization, owns account/source/admission storage together and constructs the admission recorder only on the first ordinary write. Shutdown attempts every owner even if one fails, is repeatable and refuses subsequent requests; missing account transport cleans up before acquiring source storage. The existing private bootstrap keeps its middleware-only contract. An unregistered Nest provider (iteration 1532) now awaits the combined runtime before exposing middleware and gives Nest ownership of its shutdown; loopback acceptance verifies mounting before body parsers and startup refusal propagation. It must replace, rather than accompany, the separate account provider. Prepared environment selection (iteration 1533) defaults PUBLIC_MODE to 0, accepts only 0/1, and requires enabled accounts and an exact HTTPS ACCOUNT_ORIGIN before opening public storage. The provider forwards the existing private admin configuration. Application registration (iteration 1534) now replaces AccountsModule with one AccessModule and mounts its middleware before body parsers and tool proxies; the separate legacy guard is removed from main because private selection owns it. Loopback module acceptance verifies private admin refusal/identity, reader pass-through, disabled account pass-through and absence of the old account provider. PUBLIC_MODE and accounts remain off; this registration awaits deployment after the hold. Configured public Nest HTTP acceptance (iteration 1535, isolated storage/session stand-ins) verifies anonymous reader access, refusal of proxy identity headers and unknown tool routes, provenance refusal before authentication, anonymous write refusal before storage/controllers, session-outage refusal and owned shutdown. Public activation, controller replacement and atomic queue/external effects remain unimplemented.

## Target design

### System-level data

- `topics`, editions and edition-job tables lose their owner. The schedule
  becomes a single system row (for example `edition_settings`, enforced as one
  row).
- Editions gain `kind` (`scheduled`, `manual` or `test`) and `published_at`
  (null = not published). The public reader lists and opens only published
  editions; `latest` is the newest published one. Admin can publish a manual
  edition explicitly, for example to recover from a failed scheduled run. Test
  editions are never published.

### Reader preferences, local first

- **Hidden topics:** store the topics a reader _hid_, so new topics appear for
  everyone by default. The menu lists the topics in the edition being read, so
  topics later renamed or deleted can still be hidden on old editions.
- **Bookmarks:** for stories and X, Bluesky and other saved posts. Key: the
  story's stable ID, or `platform + externalId` for posts. The agent verifies
  ID stability across editions first, and falls back to the canonical URL if
  needed. Each bookmark stores a small display copy (title, link, source or
  author, short excerpt, platform, the edition it was saved from), so `/saved`
  works even when the item no longer appears in editions.
- **Browser store:** one versioned `localStorage` key. Each entry carries an
  updated time; removals keep a tombstone so they sync.
- **Signed in:** the browser store remains the fast path, and changes are sent to
  the API. On sign-in, local and server state merge: bookmarks are combined and
  the newest change wins per key. Signing out clears the account's local copy.
- **Limits:** for example, at most 1,000 bookmarks per reader and a bounded
  display copy. The agent picks the exact numbers.

### Accounts and sessions

- Tables: `users` (email unique and normalized), `login_codes`, `sign_in_links`,
  `sessions`, `user_hidden_topics`, `bookmarks`, `admin_audit_log`. Names are
  the agent's choice.
- **Login codes:** 6 digits, 10 minutes, single use, at most 5 attempts, stored
  hashed, compared in constant time. Rate limits per email and per client
  address. Responses never reveal whether an email has an account.
- **Admin-issued sign-in links** (how friends get in for now): an admin enters
  an email and gets a one-time link, valid 24 hours, for that email only. The
  link opens a page whose button signs in with a POST, so link previews in chat
  apps can't use it up. Each link issued is logged.
- **Mailer:** behind an interface. The first implementation is a **stand-in
  mailbox**: codes go to a file on the VM readable only by the owner, and
  **never to logs**. Ship a one-line `ssh` command that prints the latest code
  for an email. A real provider (likely Resend plus a domain) comes later.
- **Sessions:** 32 random bytes in an `HttpOnly`, `Secure`, `SameSite=Lax`
  cookie; only a hash is stored. Reader sessions never expire on the server. The
  cookie is renewed on visits, at most daily, within the browser's ~400-day cap.
  **Admin rights need a session younger than 7 days**, checked on every request.
  A session doesn't gain admin rights from an email later added to
  `ADMIN_EMAILS`. Users have "sign out of all devices", and admins can end any
  user's sessions.
- **Self-service account deletion** removes the user's rows immediately.
- **Switches:** `ACCOUNTS_ENABLED` (`0`/`1`) and `SIGNUP_MODE`
  (`off`/`invite`/`open`). `open` with the stand-in mailbox fails at startup.
  Launch uses `invite`.

### Admin and authorization

- **Admin = a signed-in user whose email is in `ADMIN_EMAILS`**, in the env file
  and not the database. Once `PUBLIC_MODE=1`, the app ignores `X-ExeDev-*`
  headers entirely. `ADMIN_LOCAL_TOKEN` stays for scripts on the VM.
- **Every route is classified as `public-read`, `user` or `admin`;** anything
  unlisted is refused. Admin pages and their GET APIs become `public-read` only
  after an audit confirms they return no user data, secrets or raw provider
  errors. User data (users, bookmarks, sessions, codes, the audit log) is never
  `public-read`.
- **Every write** (topics, schedule, sources, editions, budgets, publishing, sign-in
  links, user management) is admin-only and recorded in the audit log (admin
  user ID, action, target, time). The UI hides edit controls from non-admins.
  The server enforces the rule regardless.
- **Cross-site protection:** `SameSite=Lax` cookies, plus an `Origin` check and
  JSON-only bodies on every non-GET request.

### Internal tools

| Tool                     | After going public                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Handbook, DB explorer    | Public                                                                             |
| Grafana                  | Public, anonymous Viewer (as today)                                                |
| Jobs browser             | Public, read-only (as today)                                                       |
| Admin pages              | Public read-only after the audit; writes admin-only                                |
| `/logs`, `/metrics` APIs | **Admin-only.** Also set VictoriaMetrics `-deleteAuthKey` and `-forceMergeAuthKey` |

New user tables are **never** granted to `grafana_product`, `postgres_metrics`
or any other reader role. Add an integration test that fails if those roles
can read them.

### Security baseline before going public

- Rate limits in Redis: on login codes, link redemption, preference writes, and
  a general per-client limit on the API. Verify which `X-Forwarded-For` entry
  exe.dev's proxy sets before trusting it.
- General API admission preparation (iteration 1577): stored access runtime
  accepts the optional verified-client gate and forwards it before account
  transport. Composed HTTP tests cover refusal, recovery, private rollback
  without limiter construction, closed-runtime refusal and startup cleanup
  when limiter construction fails. Environment selection still supplies no
  gate; visitor proof and production registration remain required.
- Preference-write preparation (iterations 1574–1575): a gated Redis limiter
  allows a provisional 30 sync writes/minute per authenticated reader, shared
  across devices and processes. Keys use a separate HMAC namespace; refusal
  does not extend expiry. The optional handler boundary runs after provenance,
  session and payload validation, before any sync mutation; denial or limiter
  failure returns an empty 429. Isolated Redis and handler tests cover shared
  admission, API-limit independence, expiry, refusal and identity injection.
  Account runtime constructs it with a dedicated derived privacy key only when
  accounts are enabled. Composed flow tests verify admission, refusal, Redis
  failure and recovery before storage writes; accounts/public stay off.
- Security headers: CSP compatible with the X and Bluesky embeds, HSTS,
  `X-Content-Type-Options`, `Referrer-Policy` and frame-ancestors.
- Body size limits. Generic error bodies with no stack traces. Published
  editions are immutable, so give them cache headers to keep load low.
- **Logs:** no emails, codes, tokens or cookies. Log user IDs instead, and drop
  or hash client addresses. Add a test that sign-in flows log none of these.
- A short `/privacy` page: what's stored (email, hidden topics, bookmarks), no
  tracking, how to delete your account.
- **Rehearse public mode while still private:** run with `PUBLIC_MODE=1` and no
  exe.dev headers, then check every route class, forged-header attempts,
  cross-site writes, rate limits and log hygiene. The lead session also runs a
  security review before the owner decides to go public.

### Development budget and test editions

- Add a `spend_pools` table (`production`, `development`; per provider; cap and
  period) and a `pool` column on `llm_calls` and `x_discovery_calls`, defaulting
  to `production`.
- Production caps keep their current env values and code ceilings: Anthropic
  $14 a month and $1 a day, X $0.40 a day and $12 a month. **Development pools
  for this project: Anthropic $5 and xAI $2, total and not renewing**, with code
  ceilings so a database edit can't exceed them. Raising one needs the owner.
- The free admin endpoint `/api/admin/digest-previews/tests` now reuses stored
  content with no AI, provider calls, production alerts or notifications, and
  persists private test editions. Explicit `aiEditing: true` uses the isolated
  development runtime when `LLM_LIVE=1`; disabled runtime returns 503.
  Explicit `paidXSearch: true` uses the isolated X development runtime and
  saved topic keyword settings. Both options are available independently in the
  admin form and default off; disabled runtimes refuse before saving.
  Per-edition search serializes topic calls and stops on accounting refusal,
  replay, uncertain execution, provider errors or the reporting threshold.
  Discovery pins exact UTC windows and shares repeated topic requests;
  conflicting inputs reject. Official embeds verify at most 20 distinct posts
  per topic, skipping unavailable or undated posts. Independent fallback and
  editorial candidate pools use the shared selector without storing discoveries.
  Discovery failures roll back the private snapshot.
  The isolated editor composition shares one
  development stop latch across article/social triage and editing, with a
  per-edition memory cache that never reads or writes production scores. The
  snapshot builder accepts an explicit per-edition development factory; omitted
  factories stay free, and stopped development editing rolls back the snapshot.
  The HTTP AI option is connected; stopped development editing saves no edition.
  The Anthropic live smoke command now uses the development runtime, one Haiku
  call and durable replay protection. The preview smoke command now creates one
  private test edition, free by default, with development AI only under `LLM_LIVE=1`;
  the admin edition form now creates private tests, free by default, with independent development AI and paid-X opt-ins.
- Test editions are admin-triggered, `kind = test`, charged to `development`.
  Options: AI editing off (costs $0, exercises the data paths) or on (about $0.38
  each), and paid X search off (reuse stored posts) or on. Default: everything
  off. Stop and report at 75% of a pool.
- Test editions never affect the scheduled reserve, the reader, edition alerts
  or production cap accounting.

### Backfilling existing editions

1. Read-only inventory: count editions by `scheduled_key` and date, and record
   how snapshot shapes changed over time.
2. Set `kind` and `published_at` (**owner decision, Nov 7**, after the
   [inventory](edition-reviews/2026-11-07-publication-inventory.md) found 65
   `integration:` test editions):
   - **Published:** editions with a `scheduled_key` that doesn't start with
     `integration:`, created on or after 2026-11-03 (UTC). Today that's the five
     Nov 3–7 daily editions. Every future scheduled edition is published when
     it's saved.
   - **Not published:** everything else, including all of Nov 1–2. Their `kind`
     is `test` for `integration:` keys and `manual` for the rest. They stay
     visible in admin.
3. Turn on the published-only reader filter once the backfill and the
   comparison below pass.
4. IDs and `/editions/:id` links don't change.
5. **Proof:** render every published edition with the new model off and on, and
   compare topic, story and post counts. Load a sample on desktop and mobile.
   Any difference blocks the switch.

## Switches

| Flag                              | Turns on                                        | Off means            |
| --------------------------------- | ----------------------------------------------- | -------------------- |
| `READER_PUBLISHED_ONLY`           | Reader shows published editions only            | Today's reader       |
| `SYSTEM_OWNERSHIP`                | Code reads and writes the system-level model    | Profile-based reads  |
| `READER_PREFERENCES`              | Hide topics and bookmarks, in the browser       | No preference UI     |
| `ACCOUNTS_ENABLED`, `SIGNUP_MODE` | Sign-in, sync, sign-in links                    | Signed-out only      |
| `PUBLIC_MODE`                     | Route classes enforced; exe.dev headers ignored | Today's access rules |

While a flag exists, writes keep the old shape too (for example `profile_id`
stays filled with the default profile), so turning it off is always safe.

## Phases

Each phase is done when its checks pass **and a scheduled edition has published
normally with its flag on.**

0. **Edition types, spend pools, backfill.** `kind`/`published_at`, the inventory
   and owner confirmation, `READER_PUBLISHED_ONLY`, spend pools and test
   editions. _Check:_ a test edition charges `development` and is absent from
   the reader. The every-edition comparison passes.
1. **Detach the profile.** Make `profile_id` columns nullable and add the
   single-row settings table. `SYSTEM_OWNERSHIP` switches reads, with dual
   writes. _Check:_ the comparison passes, and one AI-off and one AI-on test
   edition run with the flag on.
2. **Reader preferences in the browser.** No backend. _Check:_ hidden topics and
   bookmarks survive reloads and work on old editions. Desktop and mobile,
   light and dark.
3. **Accounts.** Tables, codes, sign-in links, the stand-in mailbox, sessions,
   sync, admin via `ADMIN_EMAILS`, the audit log and account deletion. _Check:_
   the owner signs in from two devices and bookmarks sync. Expired and reused
   codes and links are refused.
4. **Public readiness.** Route classification, `PUBLIC_MODE`, rate limits,
   headers, log hygiene, `/logs` and `/metrics` locked, VictoriaMetrics keys,
   reader-role grant test, `/privacy`, and the public-mode rehearsal. Then the
   lead's security review.
5. **Go public (owner).** Outside 13:00–16:00 UTC, the owner runs
   `ssh exe.dev share set-public news-digest` after approving the review. The
   agent smoke-tests signed out. Undo: `share set-private`.
6. **Real email (later, owner choice).** Swap in the mailer. `SIGNUP_MODE=open`
   only if the owner wants it.
7. **Clean-up (owner approval).** After 7 consecutive normal scheduled editions
   on the new model: drop `profiles`, the `profile_id` columns and
   `digest_schedules`, remove the flags and dual writes, and record the old
   design in `docs/decisions/`.

## Protecting editions

- Migrations stay additive until phase 7: nullable or defaulted columns, new
  tables, indexes `CONCURRENTLY`. No table rewrites.
- Take a private backup before each migration, and rehearse it on a scratch
  copy restored from backup first.
- No deploys, restarts or migrations between 13:00 and 16:00 UTC. Nothing that
  touches edition generation after 12:00 UTC unless it fixes a breakage.
- If a scheduled edition fails or looks wrong, turn the newest flag off first,
  then diagnose.

## What the agent may decide

Table and column names, endpoint shapes, sync mechanics within the rules above,
whether to rename tables, exact limits, and the order of work within a phase.
Record each choice in the phase's ack.

## Stop and report instead

- Anything that would make user data, secrets or raw provider errors publicly
  readable.
- Any change to production caps or development pools.
- Any drop or destructive migration before phase 7 approval.
- A failed or abnormal scheduled edition.
- Story or post IDs that turn out unstable in a way the fallback doesn't cover.
- Anything that needs a new paid service or vendor.

## Owner gates

- Confirm which manual editions count as published (phase 0).
- Approve going public after the security review, including changing the lead
  guide's "The VM stays private" rule and the "private to the owner" lines in
  `MISSION.md` and `AGENTS.md` (phase 5).
- Choose the email provider and domain (phase 6, optional).
- Approve the clean-up (phase 7).

Prepared topic-enable persistence (iteration 1536) binds the exact PUT topic
route to one row-locked system-catalog toggle and its admission outcome.
Concurrent identical requests record one changed and one unchanged result;
missing topics and audit failures roll back admission and mutation together.
This writer remains disconnected: it requires caller authorization and must
replace standalone admission for this route before public activation.

Prepared topic-enable HTTP transport (iteration 1537) validates an exact UUID
PUT target, one boolean field, bounded JSON and unambiguous Origin/content-type
headers before authenticating a fresh admin. It delegates admission and mutation
together to the writer, projects only the public result and hides dependency
errors. Direct authenticated local scripts retain their Origin exemption. This
transport now participates in the default-off public write runtime (iteration
1538), sharing the source writer pool and bypassing standalone admission and
legacy controllers. Topic-order writes use the same atomic routing boundary;
malformed topic-enable targets terminate before controllers. The default-off API
runtime was deployed at 16:06 UTC Nov 9 (iteration 1548).
Public activation still awaits acceptance and verified proxy forwarding.

Prepared topic-order persistence validates the complete system catalog and shares
its catalog lock with legacy topic creation, deletion and reordering. Ordering
and changed/unchanged admission outcomes commit together; stale catalogs roll
back. Prepared HTTP transport (iteration 1541) accepts only the exact PUT
order route, a bounded unique UUID list and fresh admin authorization. Stale
catalogs return an empty 409; dependency failures return an empty 503. Origin,
wire-header multiplicity and local-script provenance checks match topic-enable
writes. The transport now participates in the default-off public write runtime
(iteration 1545), sharing the existing writer pool and account authentication.
Order requests, including malformed variants, terminate before standalone
admission and legacy controllers. Isolated composed HTTP/storage checks cover
changed/unchanged outcomes, stale catalogs and audit-failure rollback. Accounts
and public mode remain disabled. Iteration 1548 deployed the prepared API runtime
from `5fc1fac0` without migrations or flag changes; latest/history response hashes
and the Nov 9 scheduled reader are unchanged. Proxy proof was accepted by the owner under STEERING 53.

Item 53 diagnostic (1560): receipts include category and baseline equality for
both appended positions, independently of the legacy one-entry validity check.
The Nov 9 19:47 receipt confirms stable public appended entries and loopback
peers; the owner confirmed both entries are the visitor. Iteration 1589 retains
the last-entry rule, tests the observed shapes and configures explicit loopback
trust. Phase 3 began with a successful fresh private backup/restore migration rehearsal;
accounts and public mode remain off until the deployment checks pass.

Phase 3 migration deployment (iteration 1590): additive migrations 0013–0018
are now applied live after a fresh private backup and isolated restore rehearsal.
The earlier preparation notes describing these migrations as unapplied are historical.
The eight private account tables are empty and deny PUBLIC and operational readers;
bounded rerun is unchanged. Migration 0019 remains pending. Accounts and public
mode remained off at that step. Iteration 1591 enables invite-only server/web
accounts with a stable private key and owner-only mailbox; anonymous live entry
checks pass desktop/mobile light/dark without account writes. Public mode stays
off. Dedicated live lifecycle acceptance, owner two-device acceptance and a
normal scheduled edition remain before Phase 3 can be acknowledged.
