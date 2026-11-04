## 2026-11-04: iteration 620 — optional observability capacity decision

- Started clean on main; no leftover work. Healthz healthy and zero alerts; Nov 4 15:00 UTC edition evidence not yet available.
- Assessed O11 against 24-hour local metrics: eight units at 422.10 MiB currently, aggregate sampled peak 548.72 MiB; mean CPU 1.435% of one core, maximum five-minute rate 2.550%.
- Decision 0004 defers tracing and a second proxy, retaining correlation logs/SSH access. Documents reproducible queries, missing samples, restarts/configuration changes, excluded overhead and isolated benchmark criteria; no candidate overhead claim.
- Updated plan/TASKS and corrected the handbook's stale planned-dashboard/browser-error note. Archived iteration 602 to keep PROGRESS below 25 KB.
- Verification: pnpm format, pnpm lint:fix, pnpm check (364 unit/205 isolated integration), pnpm build, pnpm exec tsx scripts/check-handbook.ts observability and git diff --check passed.
- Runtime observability check validated 476 structured records; latest immutable Nov 3 edition serves four topics; 36 sources without current errors, no retained failed digest jobs, zero alerts or dangling Docker volumes.
- Documentation only; no service restart per STEERING 22, no paid calls or source/edition/configuration changes. Handbook reads files per request.
- Next: Nov 4 scheduled edition review takes priority; grouping and incremental triage stay off pending that review. O11 remains optional/deferred, not installed.
