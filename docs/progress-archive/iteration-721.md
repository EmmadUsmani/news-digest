## 2026-11-05: iteration 721 — article-free viral experiment preparation

- Started clean on main; no leftover work. Zero alerts, health/database/Redis green, 36 healthy sources, zero failed digest jobs; latest stored edition has four topics. Nov 5 15:00 UTC acceptance remains future.
- Read-only experiment CLI now emits only viral keyword and test-only semantic requests from topic descriptions/settings, without article loading or article readiness. Semantic requests ask for eight results, exact window, saved likes minimum/exclusions and mandatory -giveaway; Grok 4.3 and media understanding off unchanged.
- Historical constructors remain for old evidence. Legacy runner rejects revised inputs before dispatch/reservation (fixture verified); runner/report/extractor migration remains next. Do not dispatch it for the new rounds.
- Read-only real preparation confirmed four ready topics and approved Tech/NBA/Gaming/World thresholds 500/1000/500/2000, including NBA exclusions. No paid calls, cache writes, scorer changes, model/provider changes or activation.
- Verification: targeted input/runner tests 10/10, pnpm build and full pnpm check passed (481 unit, 213 isolated integration, exit 0). pnpm format and pnpm lint:fix run before commit; git diff --check clean.
- Updated TASKS and experiment instructions; archived iterations 708–709 to keep PROGRESS small. SOURCES/NEEDS_FROM_HUMAN unchanged: no source or new owner blocker. No UI changes. Services remain healthy; no restart under STEERING 22 because only offline scripts/tests/docs changed.
- Next: migrate runner/report/extractor to viral + semantic; scorer only after Nov 5 edition, rounds after 21:00 UTC Nov 5/6. Scheduled acceptance/protections first when due.
