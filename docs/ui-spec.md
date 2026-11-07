# UI spec: reader edition + admin

Status: **owner-approved** (2026-11-04). The agent builds exactly this
(STEERING item 33).

## Goals

- **The reader page is the edition, nothing else.** Clean, modern and
  minimal, in the style of a high-quality tech product.
- **Admin data moves to `/admin`.** That covers status, sources, budgets,
  scores, settings and on-demand editions. It is only reachable by admin
  emails, and not linked from the reader UI.
- **Today the home page is about 23,000 px tall** (around 25 desktop
  screens). About two thirds of it is admin data and system caveats.

## Stack

| Concern       | Choice                                                                                                                                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering     | **Client-side SPA only** (Vite + React 19). No SSR                                                                                                                                |
| Routing       | **TanStack Router**, **code-based route tree** (no file-based codegen). Typed params; search params validated with zod. Route loaders prefetch with `queryClient.ensureQueryData` |
| Data fetching | **TanStack Query v5**. Every response is parsed with the shared `@digest/contracts` zod schemas inside `queryFn`                                                                  |
| Styling       | **Tailwind CSS v4 + shadcn/ui** (Radix primitives), neutral base color. No hand-written component CSS                                                                             |
| Icons, font   | `lucide-react`; **Inter** self-hosted via `@fontsource-variable/inter` (no font CDN)                                                                                              |
| Theme         | Light and dark, following the system setting by default, with a header toggle saved in `localStorage`                                                                             |

**Server work:**

- **History fallback:** any GET that isn't an API or tool path returns
  `index.html`. That excludes `/api`, `/healthz`, `/docs`, `/db`,
  `/grafana`, `/logs`, `/metrics`, `/queues` and `/__exe.dev`, so deep
  links like `/admin/sources` work on reload.
- **Old edition links:** `/?edition=<id>` redirects to `/editions/<id>`.

## Routes

| Route                 | Who    | Page                                                           |
| --------------------- | ------ | -------------------------------------------------------------- |
| `/`                   | Reader | Latest edition                                                 |
| `/editions`           | Reader | Archive: list of past editions by date                         |
| `/editions/:id`       | Reader | A past edition (same layout as `/`)                            |
| `/admin`              | Admin  | Overview                                                       |
| `/admin/editions`     | Admin  | Editions table                                                 |
| `/admin/editions/new` | Admin  | Create an on-demand edition                                    |
| `/admin/editions/:id` | Admin  | Edition inspector                                              |
| `/admin/sources`      | Admin  | Sources and platforms                                          |
| `/admin/topics`       | Admin  | Topics list (order, enable)                                    |
| `/admin/topics/:id`   | Admin  | Topic editor                                                   |
| `/admin/schedule`     | Admin  | Daily schedule                                                 |
| `/admin/spend`        | Admin  | AI and X spend against caps                                    |
| `/admin/tools`        | Admin  | Links to Grafana, logs, metrics, queues, DB explorer, handbook |
| `*`                   | Anyone | Not found                                                      |

## Admin access

- **Identity:** exe.dev adds `X-ExeDev-Email` and `X-ExeDev-UserID` to
  authenticated requests through its proxy. Admins are listed in
  `ADMIN_EMAILS` in `~/.config/news-digest/env`.
- **Enforced server-side:**
  - Move every admin endpoint under `/api/admin/*`: status, settings, writes,
    on-demand creation, and edition evidence (scores, candidates, incoming
    articles). A guard returns 404 for non-admins.
  - The same guard covers the internal tools (`/grafana/`, `/logs/`,
    `/metrics/`, `/queues/`, `/db/`, `/docs/`).
  - The UI hides `/admin` for non-admins, but **the server is the real gate.**
- **Reader endpoints** return only what the reader page shows:
  `/api/editions/latest`, `/api/editions/:id` and `/api/editions?cursor=`.
  No scores, reasons or candidate counts.
- **Local scripts** (the agent's smoke and check scripts on the VM) need
  admin access without the proxy.
  - **First check** where proxied requests come from.
  - **Trust loopback** only if proxied traffic never arrives from
    `127.0.0.1`.
  - **Otherwise,** use an `ADMIN_LOCAL_TOKEN` header with the token kept in
    the env file.
- **Before the VM is ever made public,** verify that a client-supplied
  `X-ExeDev-Email` header is stripped by the proxy. Record that check in
  `docs/decisions/`.
- `GET /api/me` returns `{ isAdmin }` so the UI can decide what to show.

## Design tokens

| Token         | Value                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Font          | Inter; `tabular-nums` for numbers in admin tables                                                                                 |
| Type scale    | 12 / 14 / 16 (body) / 18 / 20 / 24 / 30 px. Reader headlines 18–20 semibold; page title 24–30                                     |
| Colors        | shadcn **neutral** palette. One accent (`blue-600`, `blue-400` in dark) for links and focus only                                  |
| Status colors | green, amber and red dots in admin only. Never in the reader view                                                                 |
| Spacing       | 4 px grid. Sections 48–64 px apart, cards 16–24 px padding                                                                        |
| Width         | Reader column `max-w-2xl` (672 px) with a 240 px contents sidebar at ≥ 1024 px. Admin content up to 1200 px with a 240 px sidebar |
| Radius, depth | shadcn default radius. Borders over shadows; at most one subtle shadow level                                                      |
| Motion        | Only 150 ms fades and hovers. No parallax or animated counters                                                                    |

## Reader: edition page (`/`)

Desktop (≥ 1024 px): one scrolling page, with a sticky **contents sidebar** on
the left.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  News Digest                                      ‹  Wed, Nov 4  ›    ◐      │  header: wordmark, date switcher, theme
├────────────────────┬─────────────────────────────────────────────────────────┤
│ CONTENTS           │  Tech & AI                                              │
│ ▾ Tech & AI        │  • OpenAI ships …                                       │  brief: 2–4 bullets
│   Sensor Tower: …  │  • Valve tightens …                                     │
│ ▸ Valve tightens … │                                                         │
│   Ubisoft among …  │  ┌──────────────────────────────────────────────┐       │
│   Posts            │  │ Sensor Tower: GTA 6 at 7.7M pre-purchases     │       │  story card
│ › NBA              │  │ Research firm Sensor Tower's tracker shows…   │       │  1–3 sentence summary
│ › Gaming           │  │ ⬤ GameSpot · ⬤ GamesRadar+ +2 · 3h ago        │       │  sources row (+N = grouped coverage)
│ › World            │  └──────────────────────────────────────────────┘       │
│                    │  … up to the topic's story budget                       │
│ Past editions →    │                                                         │
│                    │  Posts                                                  │
│                    │  ┌──────────────────────────────────────────────┐       │
│                    │  │  X embed / card                               │       │  one full-width post per row
│                    │  └──────────────────────────────────────────────┘       │
│                    │  ┌──────────────────────────────────────────────┐       │
│                    │  │  Bluesky card                                 │       │
│                    │  └──────────────────────────────────────────────┘       │
│                    │                                                         │
│                    │  NBA …                                                  │
└────────────────────┴─────────────────────────────────────────────────────────┘
```

Posts use one full-width row per card on desktop and mobile. X embeds use
the available card width, up to the official 550 px limit.

**Contents sidebar:**

- **Top level:** the topics.
- **Expanded:** the topic currently in view shows its story headlines
  (truncated to one line) and a "Posts" entry. Other topics stay collapsed.
- **Scroll tracking:** the current story is highlighted (`▸`), using an
  IntersectionObserver.
- **Clicking an entry** smooth-scrolls to it and updates the URL hash
  (`#tech-ai`, `#story-<id>`), so links to a story work.
- The sidebar scrolls independently when it's taller than the window.

Mobile (390 px): one column, with no sidebar. Topic chips stay sticky under
the header, and a **Contents** button opens the same contents in a sheet.
Posts go one per row.

```text
┌──────────────────────────┐
│ News Digest   ‹Nov 4›  ◐ │
│ [Tech][NBA][Gaming][Wor… │  sticky chips · ☰ Contents
│ Tech & AI                │
│ • …                      │
│ ┌──────────────────────┐ │
│ │ Headline             │ │
│ │ Summary …            │ │
│ │ GameSpot +2 · 3h     │ │
│ └──────────────────────┘ │
│ Posts                    │
│ ┌──────────────────────┐ │
│ │ X / Bluesky card     │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

**Content rules (enforced by a test):**

- **Shown:** briefs, stories (headline linked to the primary source,
  summary, source names and favicons, relative time, "+N" grouped outlets
  that expand inline) and posts. A story with no AI summary shows its saved
  article excerpt in the same place.
- **Never shown on reader pages** (these are labels and system details, not
  story text): scores, "why selected", candidate,
  filter or triage counts, model names, "AI edited", "non-AI",
  "auto-ranked", "fallback", "excerpts", "evidence", "independent",
  "parked", budgets, the coverage-period form, the incoming-articles feed,
  the marketing hero.
- **"Why it matters" is admin-only.** It's the editor's significance note, and
  the summary already covers the story. The admin inspector shows it.
- **Fallback editions:** when a topic wasn't AI-edited, show no label or
  notice about it, but keep the story text: the reader sees the excerpt as an
  ordinary summary. The mode is visible only in admin.
- **Posts:**
  - Official X embed when it loads, otherwise the existing app-drawn card.
  - Bluesky uses its app-drawn card.
  - The editor's note is at most one line under the card, and is never a
    repeat of the post text.
  - No "Open original post on X" text link: the card itself links out.
- **Empty states, one quiet line:** "No standout posts today." or "Quiet day
  for this topic."
- **Archive (`/editions`):** a simple list by date ("Wednesday, November 4"
  with the topic names), paginated. Each entry opens `/editions/:id`.

## Admin

Layout, the same for every admin page:

```text
┌──────────────┬───────────────────────────────────────────────────────────┐
│ News Digest  │ Overview                          PRODUCTION · you@…      │
│ ADMIN        ├───────────────────────────────────────────────────────────┤
│              │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ Overview     │ │ Health ● │ │ Alerts 0 │ │ AI today │ │ X today  │       │  stat cards
│ Editions     │ │ API DB R │ │          │ │ $0.29/.48│ │ $0.15/.40│       │
│ New edition  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│ Sources      │ Today's edition  07:02 · 152 s · $0.29     [Inspect →]    │
│ Topics       │  Tech ● AI   NBA ● auto-ranked   Gaming ● AI   World ● AI │
│ Schedule     │ Sources  34 healthy · 2 failing                [View →]   │
│ Spend        │  ● Yahoo NBA  timeout 2h ago                              │
│ Tools ↗      │ Next runs  Edition Nov 5 07:00 PT · Social collection 13:00 │
│              │                                                           │
│ ← Reader     │                                                           │
└──────────────┴───────────────────────────────────────────────────────────┘
```

Mobile admin: the sidebar becomes a sheet behind a menu button, tables
scroll sideways, and stat cards stack two per row.

| Page              | Contents (shadcn components)                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview          | Stat cards (health, alerts, AI and X spend vs caps), today's edition with per-topic mode, source health summary, next scheduled runs                                                                                |
| Editions          | `Table`: date, window, scheduled or manual, per-topic mode, cost, duration. A row opens the inspector                                                                                                               |
| Edition inspector | Tabs per topic: stories with score, reasons, "why it matters", sources, grouping members; posts with why selected; candidate and filter counts; the incoming-articles list for that window; a "View as reader" link |
| New edition       | Window presets (6 h / 24 h / 7 d / custom), a note that it spends AI budget, a submit button, then a live progress list (topic stages) and a link to the result                                                     |
| Sources           | `Table`: status dot, name, topic(s), last success, last error, items 24 h / 7 d, enable switch; "Add feed" dialog; platform status rows (X, Bluesky, Reddit parked, YouTube deferred)                               |
| Topics            | Sortable list (drag) with enable switches and story/post budgets; "New topic" dialog                                                                                                                                |
| Topic editor      | Form sections: basics (name, guidance), budgets, sources, X accounts, X search thresholds and exclusions, Bluesky query. Save and Delete (with confirm dialog)                                                      |
| Schedule          | Time, timezone, coverage window, next run                                                                                                                                                                           |
| Spend             | AI and X: today and month against caps, the reserve, recent calls table. Links to the Grafana Product dashboard                                                                                                     |
| Tools             | Cards linking to Grafana, Logs, Metrics, Queues, DB explorer, Handbook                                                                                                                                              |

Admin pages may be dense, but they use plain words and consistent tables.
Long explanations go in a muted `?` tooltip, not in paragraphs.

## Visual references (direction, not copies)

- **Reader:** the reading comfort of a good docs site or long-form reader. Think
  Stripe Docs or Tailwind docs: a calm column with an "on this page"
  sidebar, generous line height and quiet chrome.
- **Admin:** the shadcn defaults, close to the Vercel and Linear dashboards:
  dense but tidy tables, stat cards and a left sidebar.

## Data fetching rules

- Route loaders call `queryClient.ensureQueryData` for the page's main
  query, so navigation doesn't flash empty states.
- One query hook per resource (`useLatestEdition`, `useEdition(id)`,
  `useSources()` and so on) in `src/api/`, with stable query keys.
- **Defaults:** `staleTime` 60 s; refetch on window focus for admin data.
- **Job progress** polls with `refetchInterval` while running, and stops when
  the job is done.
- **Writes** are `useMutation` calls that invalidate the related queries, and
  show success or error as a toast.
- **Per-route error boundaries** with a retry button. Skeleton loaders, not
  spinners, for cards and tables.

## Build order (each step shippable, the reader page never broken)

1. **Foundations:**
   - Tailwind v4, shadcn/ui, Inter, theme, TanStack Router, TanStack Query.
   - History fallback and the old-link redirect.
   - Move the current page to `/` unchanged inside the router.
2. **Admin gate:**
   - `ADMIN_EMAILS`, the guard, and `/api/admin/*` with the existing
     endpoints moved.
   - Reader endpoints and `/api/me`.
   - Gate the internal tools.
3. **Admin pages:** move every status, settings and creation feature into
   `/admin/*` using shadcn components, then remove them from the reader
   page.
4. **Reader:** rebuild `/` and `/editions` to this spec, and delete the
   hero, the method text and "Incoming from your sources".
5. **Verify and polish:**
   - Playwright screenshots of every route: desktop 1440, mobile 390, light
     and dark, saved to `docs/screenshots/ui/`.
   - A test that scans rendered reader pages for the forbidden terms above.
   - A test that non-admin requests to `/admin` and `/api/admin/*` get 404.
   - Keyboard focus visible; no layout shift when embeds load.
   - The edition page with real data is **no more than 5.2 desktop
     screens per topic** at 1440×1100 with every embed loaded (owner trial,
     STEERING 47). Posts flow with the page without an inner scrollbar.

**Guardrails:**

- No custom CSS components where a shadcn component exists, and no new UI
  library beyond this stack.
- No new reader features. Everything the reader page has comes from this
  spec; extra explanations go in admin tooltips.
- Keep handbook pages within their length limit: update Stack & runtime
  and Operations, and give admin its own short section.
