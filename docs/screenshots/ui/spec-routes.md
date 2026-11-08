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
scrolls through every saved post. Desktop and mobile posts flow in the page,
with no inner posts scrollbar. All 17 posts remain available.

| Topic | Height at 1440 × 1100 | Light | Dark |
| --- | --- | --- | --- |
| Tech & AI | 5436 px / 4.94 screens | [View](loaded-tech-desktop-light.png) | [View](loaded-tech-desktop-dark.png) |
| NBA | 4863 px / 4.42 screens | [View](loaded-nba-desktop-light.png) | [View](loaded-nba-desktop-dark.png) |
| Gaming | 5482 px / 4.98 screens | [View](loaded-gaming-desktop-light.png) | [View](loaded-gaming-desktop-dark.png) |
| World | 2237 px / 2.03 screens | [View](loaded-world-desktop-light.png) | [View](loaded-world-desktop-dark.png) |

Both themes loaded all 16 X frames. These are viewport captures at each posts
section; the route images above retain full-page coverage.

Iteration 1089: all four topics fit the owner-approved trial limit of 5.2
desktop screens at 1440 × 1100, with every embed loaded (STEERING 47).
The earlier 3.52/3.35-screen figures used partially loaded embeds.

Iteration 1081: saved Gaming multi-outlet coverage shows article and extra-outlet counts before expansion: [desktop light](reader-coverage-count-desktop-light.png), [desktop dark](reader-coverage-count-desktop-dark.png), [mobile light](reader-coverage-count-mobile-light.png), [mobile dark](reader-coverage-count-mobile-dark.png).

Iteration 1299: `smoke-reader-bookmarks.ts` verifies Saved items removal feedback in desktop/mobile light/dark. A polite, atomic status announces the removed title and remaining count, including the empty list; keyboard focus stays on the neighboring removal control or the heading. This screen-reader feedback does not change the saved-page appearance.

Iteration 1300: story and post Save buttons have touch targets of at least 44 × 44 pixels, checked by `smoke-reader-bookmarks.ts` in all four viewport/theme combinations: [desktop light](reader-save-target-desktop-light.png), [desktop dark](reader-save-target-desktop-dark.png), [mobile light](reader-save-target-mobile-light.png), [mobile dark](reader-save-target-mobile-dark.png).

Iteration 1301: Saved items Remove and View edition actions have at least 44 × 44 pixel touch targets for stories, X and Bluesky copies, verified in desktop/mobile light/dark. Refreshed the four saved-page screenshots above.

Iteration 1302: the empty Saved items page links directly to the latest edition. Keyboard activation and the destination story are checked in desktop/mobile light/dark: [desktop light](saved-empty-desktop-light.png), [desktop dark](saved-empty-desktop-dark.png), [mobile light](saved-empty-mobile-light.png), [mobile dark](saved-empty-mobile-dark.png).

Iteration 1303: edition Saved items navigation sits below the fixed mobile topic bar and has at least a 44 × 44 pixel touch target and visible keyboard focus. Keyboard activation opens the saved list in desktop/mobile light/dark: [desktop light](reader-saved-navigation-desktop-light.png), [desktop dark](reader-saved-navigation-desktop-dark.png), [mobile light](reader-saved-navigation-mobile-light.png), [mobile dark](reader-saved-navigation-mobile-dark.png).
