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
- Manual editions already exist (`POST /api/admin/digest-previews` and `/jobs`).
  They still spend the production budget until development wiring ships. Separate
  lifetime development pool tables and a reservation-first call guard are installed;
  an explicit development LLM bridge now estimates and settles Anthropic calls through
  the guard. An explicit `LLM_LIVE=1` runtime composes the isolated ledger and
  Anthropic adapter with fixed model/rate pairs and retries disabled. Test-edition
  routes and scheduled/manual callers remain unwired. Edition
  publication metadata and future-save policy are deployed; the reader now
  filters latest, history and direct links to published editions only. Five
  Nov 3–7 scheduled editions are published; 541 manual/test editions stay in admin.
- Internal tools: the DB explorer reads only the catalog
  (`apps/schema-explorer/src/introspect.ts`). Grafana already allows anonymous
  Viewer access, and its Postgres role has column-level grants only
  (`ops/observability/grafana/sql/product-reader.sql`). The jobs browser is
  read-only. `/logs` and `/metrics` proxy the raw VictoriaLogs and
  VictoriaMetrics HTTP APIs.

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
