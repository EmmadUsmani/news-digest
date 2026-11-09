# Privacy page

Iteration 1551: `/privacy`, isolated Vite rendering of the real page.

| View | Light | Dark |
| --- | --- | --- |
| Desktop, 1440 px | [Light](1440-light.png) | [Dark](1440-dark.png) |
| Mobile, 390 px | [Light](390-light.png) | [Dark](390-dark.png) |

`pnpm exec tsx scripts/smoke-privacy.ts` checks both account-flag states,
reload, horizontal overflow and zero API/external requests. Screenshots show
accounts disabled, matching the deployed setting. All four screenshots were visually inspected. No fixture content or live account writes are used.
