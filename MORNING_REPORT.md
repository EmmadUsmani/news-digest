# Morning report — 2026-11-16

Report checks: about 20:05 UTC. Run began Nov 11 00:16:40 UTC and stopped
with STOP after iteration 2541, exit 0; supplied supervisor health was OK.
Owner-file guard flag: **0**. Starting worktree was clean on `main` at
`10fbea77`. This session changed only this report; no fetches, builds, installs,
provider calls or service changes.

## What works and evidence

- App: **https://news-digest.exe.xyz/**. Owner made sharing public Nov 15;
  public mode remains enabled. Handbook `/docs/`, schema explorer `/db/`.
- **New checks:** `/healthz` and `pnpm obs health` report OK, PostgreSQL and
  Redis true. `pnpm obs alerts`: zero firing/pending alerts. Disk: 61% used,
  9.1 GiB available.
- API, worker, docs, reader-docs and schema user services are running.
  Several old transient `news-digest-check-*` units remain failed; these are
  historical test jobs, not evidence that the app services failed.
- Digest queue: one worker, unpaused, zero waiting/active/failed jobs,
  31 completed; next scheduled run **Nov 17 15:00 UTC**.
- **Recorded acceptance:** Nov 16 signed-out public HTTPS latest/direct/history
  readers and desktop/mobile rendering passed; admin/account restrictions
  passed. See [edition review](docs/edition-reviews/2026-11-16.md).
- **Fresh verification limits:** public HTTPS failed to connect from this VM
  (HTTP 000); the recorded review also needed a DNS workaround. A local
  `/api/editions/latest` request returned 429. Public rendering and the newest
  edition were therefore not independently reconfirmed in this session.

## Content sources

New stored-source snapshot: **38 sources with real stored content; 37 OK,
one error**. This supersedes the last iteration's recorded all-38-healthy result.
All OK sources below last succeeded between 19:35 and 20:02 UTC Nov 16.

| Status                         | Sources                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OK: Tech/general               | The Verge, Hacker News, OpenAI News, Google DeepMind                                                                                                                                                                            |
| OK: NBA                        | Basketball Insiders, CBS NBA, Hoops Rumors, RealGM, SB Nation NBA, Yahoo NBA, Yardbarker NBA                                                                                                                                    |
| OK: Gaming                     | Aftermath, Destructoid, Eurogamer, Game Developer, GamesIndustry, GameSpot, GamesRadar, GamingBolt, Gematsu, Insider Gaming, Kotaku, Nintendo Life, PC Gamer, PlayStation Blog, Push Square, Rock Paper Shotgun, VGC, Xbox Wire |
| OK: World/U.S.                 | Al Jazeera, BBC World, Guardian U.S./World, NPR politics/world, PBS politics                                                                                                                                                    |
| OK: additional configured feed | `feed-2812e9ef-9dd8-4c62-aed3-d88f4576645d`: 172 stored items; name unverified                                                                                                                                                  |
| Error: configured feed         | `feed-7c2f40dc-94b2-4060-98fd-3b025bd258c0`: 2,653 stored items; last success 19:34:09 UTC, failed attempt 20:04:09 UTC. Name/error cause not resolved here.                                                                    |

Social and unavailable routes, from recorded evidence:

- **X:** direct capped xAI keyword discovery and official embeds are live;
  semantic search is OFF. Nov 9–15: 32/32 keyword calls completed, $2.100622,
  312 newly verified candidates. Viral quality/incremental value remain open.
- **Bluesky:** hourly collection and edition selection are live. Nineteen
  consecutive hourly runs through Nov 16 18:54 were preserved; full-day quality
  review remains pending. These social results were not newly queried here.
- **Reddit:** disabled/access denied; no requests until owner re-enables the
  official credentialed route. X official API needs an optional owner token.
  NBA.com RSS is blocked; ESPN RSS was replaced; IGN XML rejected. Historical
  GameSpot mashup blockage differs from today's working configured source.
  YouTube deferred. See [source inventory](docs/SOURCES.md).

## Latest recorded digest and tests

Edition **`93aefc45-33d7-4639-ad53-78e316a40f14`**, published Nov 16
15:03:11.281 UTC, covers `[Nov 15 15:00, Nov 16 15:00)`.
It contains **25 stories and 18 posts**, across Tech, NBA, Gaming, World and
U.S.; all five story sections used Sonnet with zero unscored stories.
Story/post counts: Tech 5/3, NBA 5/5, Gaming 5/1, World 5/5, U.S. 5/4.
World AI recovered; World/U.S. selected and coverage IDs are disjoint;
selected NBA spoof source is absent. Recorded cost **$0.500315**, 56 successful
calls, zero unresolved holds; worker duration **191.260 s**, above speed targets.

**Latest recorded full checks:** iteration 2541 reports format, lint-fix,
`pnpm check`, and diff checks passing: **1,060 unit and 329 integration passes,
four expected skips**. Receipt `/tmp/2541-check.log` exists. No tests or full
checks were rerun during this reporting session; new checks are operational only.

**Screenshots:** actual Nov 16 acceptance captures exist at
`/tmp/2516-desktop.png` and `/tmp/2516-mobile.png` (temporary files).
Tracked earlier reader captures:
[desktop](docs/screenshots/public-scheduled-acceptance-desktop.png),
[mobile](docs/screenshots/public-scheduled-acceptance-mobile.png).
No new screenshots were taken; fixture-named captures are not live evidence.

## Operations, blockers and next steps

Run/stop app roles explicitly (not the agent supervisor or old check units):

```sh
systemctl --user start news-digest-{api,worker,docs,reader-docs,schema}.service
systemctl --user stop news-digest-{api,worker,docs,reader-docs,schema}.service
systemctl --user status news-digest-api news-digest-worker
journalctl --user -u news-digest-api -u news-digest-worker -f
```

Postgres/Redis are Docker Compose services: `docker compose up -d` / `docker
compose stop`. Stopping the build does not stop the app; the agent unit was
still active at inspection. No stop or restart was performed here.

Recommended next work, respecting STEERING order:

1. Inspect the newly errored feed and verify public DNS/reader reachability
   and the 429 before declaring all sources/readers healthy.
2. Finish retention only within authorization. Session/tmp daily retention and
   journal cap are installed; **agent-control log retention remains blocked**
   by the explicit prohibition on modifying `~/agent-control/`.
3. Continue next scheduled edition acceptance: three successful World/U.S.
   editions remain required. Protect the 13:00–16:00 UTC generation window.
4. Preserve Bluesky evidence before the recorded 20:36 UTC deadline; review
   the full day after Nov 17 00:00 UTC. Metrics-store checkpoint is due at/after
   20:00 UTC; resource-limit acceptance remains open. Neither was done here.
5. Address reader quality with saved evidence: Tech has three empty selected
   evidence sets; Gaming social is sparse and U.S. has no X picks. GTA forecast
   grouping is a confirmed overmerge; one Helix and five Nvidia member edges
   remain unresolved. Speed targets and broader social quality remain open.

**NEEDS_FROM_HUMAN highlights:** no key/account purchase or immediate owner
input is required. Public sharing, two-device account acceptance, B2 setup and
budget activation decisions are already resolved. The remaining explicit
instruction conflict is agent-control retention; leave that path untouched.
Keep current providers, caps and access controls. No paid replay is needed.
