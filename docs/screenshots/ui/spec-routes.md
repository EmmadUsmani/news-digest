# Spec route screenshots — November 7, 2026

Captured with `pnpm exec tsx scripts/capture-spec-routes.ts` against saved production data.
Desktop: 1440 × 1100; mobile: 390 × 844. Each image is the full page.
Browser writes and third-party requests are blocked. Admin reads use the existing
local bridge; no credential enters the browser. These images show fallback post
cards and do not measure loaded external embeds. No generation or paid calls.

| Page | Route | Desktop light | Desktop dark | Mobile light | Mobile dark |
| --- | --- | --- | --- | --- | --- |
| Latest edition | `/` | [View](spec-reader-desktop-light.png) | [View](spec-reader-desktop-dark.png) | [View](spec-reader-mobile-light.png) | [View](spec-reader-mobile-dark.png) |
| Edition archive | `/editions` | [View](spec-archive-desktop-light.png) | [View](spec-archive-desktop-dark.png) | [View](spec-archive-mobile-light.png) | [View](spec-archive-mobile-dark.png) |
| Past edition | `/editions/:id` | [View](spec-past-edition-desktop-light.png) | [View](spec-past-edition-desktop-dark.png) | [View](spec-past-edition-mobile-light.png) | [View](spec-past-edition-mobile-dark.png) |
| Not found | `/missing-spec-route` | [View](spec-not-found-desktop-light.png) | [View](spec-not-found-desktop-dark.png) | [View](spec-not-found-mobile-light.png) | [View](spec-not-found-mobile-dark.png) |
| Overview | `/admin` | [View](spec-admin-overview-desktop-light.png) | [View](spec-admin-overview-desktop-dark.png) | [View](spec-admin-overview-mobile-light.png) | [View](spec-admin-overview-mobile-dark.png) |
| Editions | `/admin/editions` | [View](spec-admin-editions-desktop-light.png) | [View](spec-admin-editions-desktop-dark.png) | [View](spec-admin-editions-mobile-light.png) | [View](spec-admin-editions-mobile-dark.png) |
| Edition inspector | `/admin/editions/:id` | [View](spec-admin-inspector-desktop-light.png) | [View](spec-admin-inspector-desktop-dark.png) | [View](spec-admin-inspector-mobile-light.png) | [View](spec-admin-inspector-mobile-dark.png) |
| New edition | `/admin/editions/new` | [View](spec-admin-new-edition-desktop-light.png) | [View](spec-admin-new-edition-desktop-dark.png) | [View](spec-admin-new-edition-mobile-light.png) | [View](spec-admin-new-edition-mobile-dark.png) |
| Sources | `/admin/sources` | [View](spec-admin-sources-desktop-light.png) | [View](spec-admin-sources-desktop-dark.png) | [View](spec-admin-sources-mobile-light.png) | [View](spec-admin-sources-mobile-dark.png) |
| Topics | `/admin/topics` | [View](spec-admin-topics-desktop-light.png) | [View](spec-admin-topics-desktop-dark.png) | [View](spec-admin-topics-mobile-light.png) | [View](spec-admin-topics-mobile-dark.png) |
| Topic editor | `/admin/topics/:id` | [View](spec-admin-topic-editor-desktop-light.png) | [View](spec-admin-topic-editor-desktop-dark.png) | [View](spec-admin-topic-editor-mobile-light.png) | [View](spec-admin-topic-editor-mobile-dark.png) |
| Schedule | `/admin/schedule` | [View](spec-admin-schedule-desktop-light.png) | [View](spec-admin-schedule-desktop-dark.png) | [View](spec-admin-schedule-mobile-light.png) | [View](spec-admin-schedule-mobile-dark.png) |
| Spend | `/admin/spend` | [View](spec-admin-spend-desktop-light.png) | [View](spec-admin-spend-desktop-dark.png) | [View](spec-admin-spend-mobile-light.png) | [View](spec-admin-spend-mobile-dark.png) |
| Tools | `/admin/tools` | [View](spec-admin-tools-desktop-light.png) | [View](spec-admin-tools-desktop-dark.png) | [View](spec-admin-tools-mobile-light.png) | [View](spec-admin-tools-mobile-dark.png) |

## Loaded desktop posts

`pnpm exec tsx scripts/smoke-reader-length.ts` enables third-party embeds and
scrolls through every saved post. Desktop posts use a keyboard-accessible scroll
area; mobile stays in the normal page flow. All 17 posts remain available.

| Topic | Height at 1440 × 1100 | Light | Dark |
| --- | --- | --- | --- |
| Tech & AI | 2849 px / 2.59 screens | [View](loaded-tech-desktop-light.png) | [View](loaded-tech-desktop-dark.png) |
| NBA | 2849 px / 2.59 screens | [View](loaded-nba-desktop-light.png) | [View](loaded-nba-desktop-dark.png) |
| Gaming | 2877 px / 2.62 screens | [View](loaded-gaming-desktop-light.png) | [View](loaded-gaming-desktop-dark.png) |
| World | 2237 px / 2.03 screens | [View](loaded-world-desktop-light.png) | [View](loaded-world-desktop-dark.png) |

Both themes loaded all 16 X frames. These are viewport captures at each posts
section; the route images above retain full-page coverage.
