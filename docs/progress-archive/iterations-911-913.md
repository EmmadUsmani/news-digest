# Iterations 911–913

## 2026-11-06: iteration 911 — fair semantic experiment preparation

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, /healthz database/Redis green, no failed digest-generation jobs; next edition Nov 6 15:00 UTC.
- Experiment-only semantic requests now ask what is new and getting attention in the saved topic name. Description exclusions and keyword operators no longer enter the semantic request; exact start-inclusive/end-exclusive UTC window and saved likes minimum remain.
- Requests explicitly retain returned likes/reposts/replies/views even below threshold, omit unknown counts and preserve nonempty tool results. Eight results requested or supported tool limit; Grok 4.3, required tool choice, budget and production fixed-search OFF unchanged.
- Regression coverage includes operator-bearing guidance, excluded text, missing-count instructions, exact bounds and unchanged tool configuration. Six focused input tests pass.
- Read-only prepare-x-experiment.ts for Nov 5–6 21:00 UTC returned four saved topics and clean natural-language queries; private inputs saved under ~/.local/state/news-digest/x-experiment/preparation-911/ (700/600). Refresh at dispatch to capture current settings. No paid calls, ingestion or edition writes.
- Verification: pnpm format; pnpm lint:fix; pnpm check (528 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; git diff --check all passed. Rebuilt/restarted API, worker, docs and schema active; initial startup health probe raced readiness, repeated health green, reader HTTP 200, latest real edition four topics/17 stories/14 posts, alerts clear.
- Archived iteration 898 to keep orientation small. Updated TASKS, SOURCES and experiment guide; no owner input needed. No handbook change: production behavior unchanged.
- Next: score three Gaming rerun candidates; Nov 6 edition review after publication and fresh X round after 21:00 UTC, keywords first. Bluesky outcomes remain next in Current order; NBA/World tool failures remain unresolved.

## 2026-11-06: iteration 912 — Gaming keyword scorer review

- Started clean on main; no leftover work. Alerts clear, 36 sources healthy, /healthz database/Redis green; no failed digest jobs, next edition Nov 6 15:00 UTC.
- Scored all three saved verified Gaming rerun posts with production Haiku social triage, saved author/reported likes/media hints and current topic guidance. Shared reserve/verification admission applied, repair disabled; one successful verification call/$0.000337, zero unscored. No X calls, ingestion or edition writes.
- Scores: RIG Gaming giveaway 4/1; MSI Gaming giveaway 4/1; Tiny Legends launch 7/4 with 552 reported likes. Under STEERING 39 one usable/non-promotion candidate out of three. All in-window, above saved 500 likes; zero exact-ID matches against retained 863-post free-link baseline. Tech's prior keyword yield is 2/10; NBA/World still failed.
- Private scorer inputs/results, ledger settlement and hashed baseline join saved mode 600. Runner's initial console count used the wrong property (interestingness instead of production importance); corrected offline, asserted one gate-passer without another paid call. Original rerun evidence unchanged.
- Updated experiment review, SOURCES, TASKS and NEEDS_FROM_HUMAN; archived iteration 899 to keep PROGRESS small. No owner action needed; no production behavior/handbook change.
- Verification: pnpm format; pnpm lint:fix; pnpm check (528 unit/223 isolated integration tests, typecheck/lint/format/boundaries); pnpm build; git diff --check. All passed.
- Rebuilt/restarted API, worker, docs and schema; /healthz green and reader HTTP 200. First source probe raced readiness; repeat shows 36/36 healthy, alerts clear and no failed digest-generation jobs.
- Next: Nov 6 edition review after publication; fresh X comparison after 21:00 UTC, keywords first. Bluesky outcomes next in Current order. Fixed X remains off, no further Nov 5 reruns; NBA/World failures remain unresolved.

## 2026-11-06: iteration 913 — attribute AI diagnostics to step and topic

- Started clean on main; no leftover work. Alerts clear, 36/36 sources healthy, no failed digest jobs; next scheduled edition Nov 6 15:00 UTC. X round waits until 21:00 UTC.
- Implemented STEERING 40 diagnostic prerequisite: LLM validation and budget decision/failure/settlement logs now include purpose and topic ID. Article/social triage, story grouping and article/social editors supply topic IDs, including Bluesky editing.
- Metadata stays outside prompt/cache fingerprints; no model/provider, budget, collection, query, selection or reader behavior changes. No paid calls or edition writes. Older requests without topic IDs still work; rejected text remains excluded.
- One initial historical journal read confirmed missing attribution; historical Bluesky log/ledger reconciliation and saved outcomes remain open, including Nov 5 Sonnet skip. This step does not resolve those causes.
- Verification: focused LLM tests 24/24; pnpm format; pnpm lint:fix; pnpm check; pnpm build; handbook observability check (18 pages/28 tables); git diff --check. All passed (528 unit/223 isolated integration tests).
- Updated TASKS and observability handbook; archived iteration 900. SOURCES/NEEDS_FROM_HUMAN unchanged because source behavior and owner requirements did not change.
- Rebuilt/restarted API, worker, docs and schema active; /healthz database/Redis green, reader HTTP 200, 36/36 sources healthy and alerts clear.
- Next: finish STEERING 40 historical attribution once, then persist per-topic Bluesky outcomes/inspector before 13:00 UTC if ready; Nov 6 edition review after publication and fresh X comparison after 21:00 UTC. Fixed X stays off.
