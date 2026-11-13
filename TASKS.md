# Tasks

Fix failures first. STEERING Current order wins. Detailed pre-compaction state and completed markers: [iteration 2144 archive](docs/progress-archive/2026-11-13-task-detail-2144.md).

## Open work

- [ ] NBA recurrence (2004): saved Sonnet initial/repair and Haiku repair pass full offline validation (2101); malformed Haiku initial ID remains refused. Accept NBA AI editing in the Nov 13 15:00 UTC scheduled edition. No paid replay.

- [ ] Morning edition admission (2026): bounded Sonnet settlement waiting deployed; caps unchanged. Review natural Nov 13 wait diagnostics, fallback, publication and spend using the [checklist](docs/plans/sonnet-settlement-admission.md#natural-scheduled-review). Offline gates pass; natural recovery remains unobserved.

- [ ] STEERING 58: security fixes/rehearsals deployed; owner proxy port/email replacement recorded and STEERING 59 closes the proxy block. After normal scheduled publication with NBA AI editing, ack item 58 with edition ID; lead review proceeds in parallel. [Handoff](docs/phase4-security-handoff.md).

- [ ] STEERING 56/57: World/U.S. split deployed; review three consecutive scheduled editions. Nov 12 scope passes, but NBA fallback/admission refusals prevent acceptance. Effective approved caps AI $20/month/$0.65/day; X $15/month/$0.50/day. [Review](docs/edition-reviews/2026-11-12.md).

- [ ] STEERING 50: public mode OFF, VM private; private accounts accepted. Full public rehearsal complete (2104), Grafana excluded, Spend allowed. After NBA/item 58 scheduled acceptance: refresh [baseline/rollback](docs/public-activation-record.md), enable server/web public mode with sharing private, accept its next scheduled edition, then ack/stop for owner sharing decision. Rollback preparation (2148): private DB snapshot restored in isolation, 39 tables/98,127 rows matched; mode-600 environment copy verified. Refresh these after scheduled acceptance. Follow [readiness](docs/public-readiness.md). No deploy 13:00–16:00 UTC; no generation changes after noon except breakages.

- [ ] Breakage / metrics-store: retain Nov 7 CPU-only 2% trial. Natural compaction confirmed Nov 8; second comparable natural-merge sample needed for recovery acceptance; Nov 13 14:43 passive probe has 24 healthy rules/no new failures, but no merge. No capacity retuning or public Grafana launch work. [Evidence](docs/decisions/0004-observability-capacity.md).

- [ ] STEERING 34: fixed keyword X search ON; semantic dropped, Grok/caps unchanged. Continue daily quality review: Nov 12 World has four X picks, all daily-search citations; [18-pick saved-text review](docs/edition-reviews/2026-11-12-x-quality.md) (2156) confirms topical content but all official metrics remain empty. Gaming translation/repetition and Tech overlap fixes await natural acceptance; viral quality unaccepted. Do not infer engagement from missing official metrics.

- [ ] STEERING 30/31 historical accounting: $2.50 experiment/$1 UTC-day cap, outside 13:00–16:00; $0.15 per-call hold. Round 1 $0.532331 includes unresolved Gaming timeout. [Evidence](docs/x-search-experiment.md).

- [ ] STEERING 27 grouping: verify same-event quality on later editions; Nov 5 Tech combined separate developments. Same-story production pass enabled, four-call bound $0.058192. No wording rules. [Review](docs/edition-reviews/2026-11-05.md).

- [ ] STEERING 7 speed: Nov 12 fifth-topic delay diagnosed; isolated staged scheduler demonstrates NBA repair admission risk. Failure draining/cycle controls pass offline; production unchanged. Protected ownership/handoff design follows NBA scheduled acceptance. Targets <60 seconds/current volume and <2 minutes/1,500 unmet. [Evidence](docs/edition-reviews/2026-11-12-social-latency.md).

- [ ] STEERING 16 / M4 Social posts: all-topic presence achieved; viral/outside-list quality remains open. Retain original post/media and official embeds; missing X metrics are unknown.

- [ ] STEERING 9/15 first-week report: Nov 2–8 $1.036785/28 calls/zero holds, 131 new verified candidates/115 outside-list. Novelty/viral-quality acceptance remains open; do not equate outside-list with viral.

- [ ] STEERING 18 Bluesky: hourly collection/session refresh healthy; U.S. query repaired (2105), natural continuation confirmed (2106). Pre-edition U.S. review (2158): 55 distinct posts supply concrete election/investigation reporting, alongside repeated events and petitions; keep repaired query and inspect natural selection. Review next scheduled U.S. selection; stored-pool review (2145) finds World discovery weak before editing and high-engagement off-topic Tech/Gaming examples. [Pool evidence](docs/edition-reviews/2026-11-12-bluesky-pool.md). Effective-query trace (2146): World falls back to its display name, Tech/Gaming to `AI`/`game`; explicit World query tuning follows the scheduled gate. Author concentration (2147): historical World 29 candidates/25 authors/max two per author; one dominant author does not explain weak supply. Free bounded comparison (2149): event terms Ukraine/Gaza find engaged posts; `geopolitics` leads with generic commentary. Bounded 12/6/6 baseline/Ukraine/Gaza pilot planned and real-collector offline day rehearsed (2150): 120 total searches, unchanged other topics; collector override/admission/failure contract rehearsed (2151). [Rollout contract](docs/plans/world-bluesky-discovery.md); optional collector policy and eight rollover/retry checks pass (2152); coverage report now labels current unrotated metadata and historical query uncertainty (2153); default-off scheduler wiring/configuration rehearsal prepared (2154); read-only retained-job export prepared (2155), with 24 completed baseline passes captured and shared-retention limits documented; deployment and activation follow the gate, production unchanged. No manual paid replay. Saved-selection baseline (2157) records all four Bluesky texts/metrics: Tech/Gaming repeat selected events, World is a link list, NBA is attributed media/legal reporting; next natural selection must demonstrate useful distinct content. Overall viral quality remains open.

- [ ] STEERING 28 incremental triage OFF: reserve-safe pools/cutoffs/draining verified; only 2/65 early fingerprints compatible. Waste/latency unmeasured. [Evidence](docs/edition-reviews/2026-11-05-incremental-admission.md).

- [ ] M5 grouping: independent labels, different dates and Gaming coverage still needed; agent-labelled windows are not general quality estimates.

- [ ] STEERING 4: fake/replay LlmPort and verification ledger implemented; real raw-response golden open. No paid replay or re-recording unchanged prompts. [Database verification](docs/DATABASE-VERIFICATION.md).

- [ ] STEERING 8 PARKED under 14: Reddit disabled/access denied; no requests without owner re-enabling official API credentials. YouTube deferred; no bypass.

- [ ] STEERING 10 source balance paused under 27: Yardbarker prepared/disabled; no new source without coverage review.

- [ ] STEERING 24/25 background: O1–O10 done except O8 unknown; O11 benchmark deferred. Stop CLI/dashboard refinements. Retain existing limits; Grafana capacity excluded from public launch. [Capacity](docs/decisions/0004-observability-capacity.md).

- [ ] Gaming same-ceremony repetition (2131): editor v9 guidance verified offline; review natural selection for repeated Resident Evil awards across platforms. [Evidence](docs/edition-reviews/2026-11-12-social-awards.md).

- [ ] World link-list social quality (2132): editor v10 refuses inference from URL slugs alone; offline transport/selection verified. Review next natural picks. [Evidence](docs/edition-reviews/2026-11-12-social-link-list.md).

- [ ] Tech story/post repetition (2134, 2138): bounded selected-story context supplied to both social routes; offline saved overlap/model controls pass. Natural acceptance pending. [Evidence](docs/edition-reviews/2026-11-12-social-story-overlap.md).

- [ ] Gaming English context (2135, 2139): editor v11 translation guidance and Gaming calendar-date guard refuse saved invented launch date offline. Review natural notes. [Evidence](docs/edition-reviews/2026-11-12-social-translation.md).

## Completed and deferred

- [x] NBA item 54 accepted Nov 11 (1824); Nov 12 recurrence remains open above.
- [x] Tech evidence depth: direct publisher cluster excerpts and bounded immutable snapshots verified offline through budgeted production editing (2130–2137); natural summary quality still needs scheduled review. [Evidence](docs/edition-reviews/2026-11-12-tech-depth.md).
- [x] Iteration 2144: compacted task handoff with all 23 open items preserved; scheduled review follows STEERING 59 proxy decision.
- Editorial audit closed under STEERING 5; reopen only for an actual unsupported saved summary. Message Batches, cross-process cache coordination, full articles and larger editor shortlists deferred.
