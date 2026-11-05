## 2026-11-05: iteration 888 — dedicated Topics management

- Started clean on main; no leftover work. Owner would care: topic ordering, availability and budgets now have a dedicated admin page instead of requiring legacy controls.
- Added `/admin/topics` navigation, drag/arrow ordering, enable controls, editable story/post budgets and New topic dialog using shared shadcn-style form controls and Radix dialog. Existing APIs retain the same validation; full guidance/sources/deletion remain on Overview until the dedicated editor replaces them.
- Playwright reads real saved topics; all creation/toggle/budget/order writes are intercepted and checked against browser replay state. No live topic changes or external requests. Desktop/mobile light/dark screenshots include list and dialog; visual review fixed cramped mobile titles and unstyled inputs. Drag and arrow paths both verified.
- Reader/admin separation smoke passed: real saved edition, no reader admin reads, anonymous admin denied, reload/navigation intact. Updated its screenshots for Topics navigation.
- Archived iterations 878–879; updated TASKS and affected Operations handbook; no source/budget/schema changes, SOURCES and NEEDS_FROM_HUMAN unchanged.
- Verification: pnpm format; pnpm lint:fix; pnpm build; pnpm check reached 505 passing unit tests then integration process ended SIGTERM; reran pnpm test:integration (218 passing); pnpm exec tsx scripts/smoke-admin-topics.ts; scripts/smoke-admin-separation.ts; scripts/check-handbook.ts 08-operations; git diff --check.
- Initial check caught import ordering (autofixed); initial browser assertion used Tech instead of saved Tech & AI (corrected). Handbook length corrected; check overlapping API restart retried successfully.
- API restarted for built assets; health/database/Redis green and alerts clear. No paid calls, experiment changes or worker configuration changes.
- Next: dedicated `/admin/topics/:id` editor, replace legacy topic controls when complete; X promotion/baseline review and Nov 6 fresh-window round; scheduled editor-v5/grouping evidence first when due.

## 2026-11-05: iteration 889 — dedicated topic editor

- Started clean on main; no leftover work. Owner would care: opening a topic now gives guidance, sources and social settings their own admin page.
- Added `/admin/topics/:id`, linked from Topics: basics/guidance, enable and budgets, phrase filters, X handles/Reddit communities, source selection, feed/news-query connection and confirmed deletion. Uses existing validated APIs and shared form/dialog controls; saved editions remain preserved by existing deletion behavior.
- Discovery-specific X thresholds/exclusions and Bluesky query still need API-backed controls. Legacy topic controls remain until the editor replacement is complete; removal and migration of their historical browser scripts remain explicit work, not acceptance claimed here.
- Playwright reads real saved topics/catalog and intercepts every write; verifies settings payloads, saved reload, list/editor navigation, source toggle, feed/query forms, cancellation and deletion. No live topic edits, collection requests or paid calls. Eight editor/delete screenshots saved in desktop/mobile light/dark; visually reviewed desktop and mobile layouts.
- Initial build caught unsupported button variant; initial browser checks caught populated-textarea label matching and missing explicit submit types on shared Buttons. Fixed and reran successfully.
- Updated TASKS and affected Operations handbook; SOURCES/NEEDS_FROM_HUMAN unchanged (no source/runtime/budget/schema changes beyond serving the new UI).
- Verification: pnpm check passed typecheck/lint/format/boundaries, 505 unit and 218 isolated integration tests; pnpm build and final web rebuild passed. pnpm exec tsx scripts/smoke-admin-topic-editor.ts; scripts/smoke-admin-topics.ts; scripts/smoke-admin-separation.ts; scripts/check-handbook.ts 08-operations passed; pnpm format; pnpm lint:fix; git diff --check.
- API restarted for built assets; all four app units active, health/database/Redis green, alerts clear. Reader smoke used the real saved edition with no reader admin reads.
- Next: complete topic discovery settings and remove replaced legacy controls; X promotion/baseline review and Nov 6 fresh-window round after 21:00 UTC; scheduled editor-v5/grouping review when due.
