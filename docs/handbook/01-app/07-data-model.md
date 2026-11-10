# Data model

Postgres holds settings, content, accounting and private reader tables. Most of the app's state is
simple: settings, collected content, ledgers, and editions as immutable
snapshots.

> [!NOTE]
> Public mode exposes the shared topic settings through an explicit field allowlist;
> topic changes still require an admin. The public source catalog shows publisher
> origins; configured feed paths stay private. Private mode retains its existing reader.
>
> `SYSTEM_OWNERSHIP=1` uses the system schedule, shared topics and system-scoped
> editions and job records. Writes preserve default-profile ownership and update
> both settings tables atomically, so turning the flag off restores profile reads.
> The additive migrations retain all existing ownership and foreign keys.
> See the [rollout plan](../../public-access-plan.md).

> [!NOTE]
> Prepared admin-write admission storage records actor, method, path and time.
> Its prepared public policy awaits storage before running an admin write.
> A prepared database boundary commits admission and mutation together.
> A prepared source toggle uses this boundary and returns changed, unchanged
> or not-found. Missing sources leave no admission record. Its prepared HTTP
> boundary checks a bounded request and fresh admin before calling the writer.
> The default-off public runtime routes source toggles, topic toggles and complete
> topic ordering through this boundary. Changes and changed/unchanged outcomes
> commit together; stale topic catalogs leave no admission or ordering change.
> Null outcomes describe admission only (unapplied migration 0019).
> Deleting a reader removes admissions tied to that identity.
>
> Reader accounts use independent identities, hashed sessions and single-use
> login challenges. Invite-only sign-in uses a private stand-in mailbox; no
> email is sent. `/account/login` exchanges a code for a secure session cookie.
> The account panel shows sync status, sign-out and confirmed account deletion.
> Admins can issue one-time friend links and revoke a reader’s sessions;
> issuance and revocation write private audit records. Saved topics and bookmarks
> sync between signed-in devices. Deleting a reader removes their private rows.
> The VM stays private and public mode remains disabled. See the
> [account rollout](../../account-activation.md).

Reader source rows use saved publisher names when available, alongside discovery
provenance; each link still opens its saved report URL. Unknown publishers retain
the discovery label.

Articles can retain a publisher name and URL supplied by structured RSS metadata,
separately from the feed that discovered them. Missing metadata stays unknown;
a later observation without metadata preserves previously collected evidence.
New edition snapshots retain this evidence for each report, including extra
editor citations. Historical snapshots keep their original unknown attribution.

> [!TIP]
> For every table, column, key and index, open the live
> **[DB schema explorer](https://news-digest.exe.xyz/db/)**. It reads the
> database directly, so it is always current. This page is the map, and the
> explorer is the territory.

## The areas and how they connect

```mermaid
flowchart LR
  subgraph settings["Profile & topics"]
    profiles --> topics --> tsc["topic_source_connections"]
    profiles --> schedules["digest_schedules"]
  end
  subgraph articles["Article ingestion"]
    sources["content_sources"] --> obs["content_observations"] --> items["content_items"]
  end
  subgraph social["Social posts"]
    cites["citations<br/>(x_link · river · x_search)"] -. "post id" .-> posts["social_posts"]
  end
  subgraph editions["Editions"]
    previews["digest_previews<br/>(JSON snapshot)"]
  end
  subgraph ai["AI usage & budget"]
    calls["llm_calls"]
    cache["llm_cache"]
    reserve["scheduled_ai_budget_days"]
    xcalls["x_discovery_calls"]
  end
  tsc --> sources
  items -- "links to X posts" --> cites
  xcalls --> cites
  items -. "copied into" .-> previews
  posts -. "copied into" .-> previews
  calls -. "run id" .-> previews
```

Solid arrows are foreign keys or ownership. Dotted arrows are references
without a foreign key: values copied into a snapshot, or ids shared by
convention.

## Core entities

```mermaid
erDiagram
  profiles ||--|| digest_schedules : "has schedule"
  profiles ||--o{ topics : "has"
  topics ||--o{ topic_source_connections : "reads from"
  content_sources ||--o{ topic_source_connections : "feeds"
  content_sources ||--o{ content_observations : "saw"
  content_items ||--o{ content_observations : "seen by"
  profiles ||--o{ digest_previews : "publishes"

  topics {
    uuid id PK
    text name
    text include_guidance
    int story_budget
    int post_budget
    jsonb accounts "curated X handles"
  }
  content_sources {
    text id PK
    text kind "feed or hn"
    text url
    timestamptz last_success
  }
  content_items {
    uuid id PK
    text canonical_url UK
    text title
    timestamptz published_at
  }
  digest_previews {
    uuid id PK
    timestamptz window_start
    timestamptz window_end
    jsonb snapshot "everything shown"
    text scheduled_key UK "one per slot"
  }
```

## Social posts

```mermaid
erDiagram
  content_items ||--o{ x_link_citations : "links to X post"
  social_discovery_sources ||--o{ social_discovery_citations : "river saw"
  x_discovery_calls ||--o{ x_search_citations : "search found"
  x_link_citations }o..o| social_posts : "post id (no FK)"
  social_discovery_citations }o..o| social_posts : "post id (no FK)"
  x_search_citations }o..o| social_posts : "post id (no FK)"
  social_posts {
    text platform PK "x (reddit parked)"
    text external_id PK
    text author
    timestamptz published_at
    text embed_html "official embed"
    timestamptz verified_at
  }
  x_link_citations {
    text external_id "X post id"
    uuid item_id FK
  }
  x_search_citations {
    uuid call_id FK
    text external_id "X post id"
    jsonb reported_engagement
  }
  x_discovery_calls {
    uuid id PK
    text status
    bigint cost_micros
    date scheduled_day
  }
```

Dotted lines: the citation tables point at `social_posts` by X post id, with no
foreign key, because a citation is stored before the post is verified.

## Patterns to know

- **Snapshots, not joins, for editions.** `digest_previews.snapshot` holds a
  copy of every story, summary and post shown. Old editions stay readable even
  if articles or settings change. A trigger forbids UPDATE and DELETE.
- **Private reader storage.** Account tables hold identities, login challenges,
  sessions, friend links, saved choices and admin audit records. Operational
  reader roles and PUBLIC have no access. Invite-only accounts use these tables;
  the [account rollout](../../account-activation.md) describes operation and rollback.
- **Ledgers for money.** `llm_calls` and `x_discovery_calls` record a
  reservation before each paid call and the actual cost after it. Budgets are
  computed from these tables.
- **Dedup by URL.** An article is stored once (`canonical_url` is unique) even
  when several sources publish it. `content_observations` records who saw it.
  Feed excerpts use the first nonblank summary or feed body, capped at 1,500 characters.
  A blank incoming excerpt keeps the saved text; a nonblank excerpt updates it.
- **Money is integer micro-dollars** (`*_micros`, 1,000,000 = $1) to avoid
  rounding errors.
- **Migrations** start with the historical SQL in `migrations/`, then the
  generated Drizzle SQL in `drizzle/`. Both use `schema_migrations`.
