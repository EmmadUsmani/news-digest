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

## Where things stand (verified 2026-11-08)

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
  Phase 1 foundation is prepared in migration `0011`: a single-row
  `edition_settings` table copies the configured owner schedule and refuses a
  missing schedule. It is not applied live; profile reads/writes remain
  authoritative. Migration `0012` prepares nullable ownership for topics,
  editions and durable job records, retaining foreign keys and all existing
  ownership values. Both migrations remain unapplied. Prepared schedule reads
  use `edition_settings` with `SYSTEM_OWNERSHIP=1`; schedule updates write both
  settings tables in one transaction, including with the flag off. Missing system
  settings abort the write. Prepared topic reads and mutations use the shared
  catalog with the flag on; new topics retain the default profile for rollback,
  and flag-off queries retain profile isolation. Prepared durable-job reads include all
  ownership with the flag on; new request/failure records retain default-profile
  ownership for rollback. Prepared edition reads and generation topic selection use
  system scope with the flag on, preserving publication filters and saved snapshots;
  new editions keep default-profile ownership for rollback;
  do not enable the flag or deploy this code before the migrations.
  The private restored-copy SQL rehearsal passes for both pending migrations:
  original-table fingerprints and foreign keys remain intact, schedule parity
  holds, and an injected failure rolls back DDL, data and ledger entries.
  Run `python3 ops/backups/rehearse_system.py` to repeat it; the private receipt
  identifies the backup and migration checksums. The actual TypeScript migration
  runner also passes twice on the restored copy, with unchanged rows and ledger on repeat.
  Restored-copy adapter comparisons also pass for all 550 saved editions (complete latest,
  direct and paginated history with both publication filters), topics and settings across
  flag off/on/off. Read-only sessions and unchanged fingerprints protect the restored copy.
  Restored-copy reader HTTP comparisons also cover complete latest, every direct response
  (including private 404s) and all history pages across the same flags and publication filters.
  Isolated system-owned AI-off and synthetic fixture-AI test editions match the
  existing golden snapshots, stay unpublished and remain readable after flag rollback.
  Live flag-on test runs and scheduled acceptance remain required before phase closure.
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

Phase 3 preparation has begun while phase 1 awaits its pre-noon rollout and
scheduled acceptance. Unapplied migration `0013` adds independent `users` and
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
renewal, identity mapping, revocation isolation and account deletion. Account routes
and sync remain unimplemented; the adapter is unregistered and accounts stay disabled.
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
the authenticated identity. Registration and verified proxy client wiring remain
pending. An uninstalled HTTP adapter now prepares code request/redemption, session lookup
and single/all-device logout routes. It requires an explicit enable flag and an
injected verified client key, bounds streamed JSON bodies to 2 KiB, marks responses
no-store and returns generic dependency failures. Loopback HTTP tests exercise the
disabled gate, origin rejection, oversized/malformed bodies, cookie-only redemption
and private failure responses. Main does not install it; no account HTTP routes are exposed. Operational reader roles and PUBLIC
receive no access to the three account tables.
Prepared runtime composition now joins the account services through injected repository
and Redis ports. Disabled configuration creates no dependencies; enabled configuration
requires an exact HTTPS `ACCOUNT_ORIGIN`, a 64-hex-character `ACCOUNT_SECRET_KEY`,
an absolute `ACCOUNT_MAILBOX_PATH`, valid `ADMIN_EMAILS` and a closed/invite
`SIGNUP_MODE`. Code hashing and admission keys are derived separately from the
secret. Main does not call this factory; registration and verified client wiring
remain pending. Offline composition checks use a temporary stand-in mailbox.
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
and replay rejection. Main registration, confirmation UI and fragment-based URLs
remain pending; accounts stay disabled.

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
