# Progress

Dated entries of 15 lines or fewer, newest last. Record what changed, how it
was verified (commands and results) and what's next. When this file passes
about 400 lines, move older entries to `docs/progress-archive/`.

## 2026-11-01: bootstrap (owner, from laptop)
- Repo created with MISSION, AGENTS, STEERING, TASKS and the `ops/` harness
  ported from the price-finder project (never-give-up retries, usage-limit
  polling, systemd supervisor restarts, owner-file guards).
- VM provisioned with `ops/vm/provision.sh`. No application code yet; start at
  TASKS M0.
