# Disk space

**Status (04:40 UTC Nov 15):** owner flagged this as the next priority to work
on together. Not started, not steered. Disk 76% of 25 GB (5.7 GB free); the
warning is at 80%, and test runs already cross it briefly.

**What fills it (lead read-only check, Nov 15):**

- The database is small: Postgres volume 181 MB, Redis 27 MB. Not the cause yet.
- Build agent transcripts are the main grower: `~/.codex/sessions` 1.5 GB at
  about 95 MB a day (Nov 8–14), plus `~/.codex/thread_history_1.sqlite`
  553 MB and `~/agent-control/logs` 514 MB.
- Mostly fixed: `/usr` 5.1 GB, Playwright browsers 681 MB, pnpm stores
  740 MB, `.cursor-server` 899 MB, `.warp` 442 MB, journal 496 MB, local
  backups 421 MB, `/tmp` about 2 GB (some unreadable without root).

**Estimate (inference):** at about 100–120 MB a day the steady level reaches
80% in roughly 8–10 days, and the disk is full in about 6–7 weeks.

**Options to discuss:**

1. Compress or ship old agent transcripts and logs to B2 (keep about 7 days on
   the VM). Biggest lever; needs a check of what Codex reads back.
2. Cap the journal (for example 200 MB) and clear stale editor servers
   (`.cursor-server`, `.warp`) if the owner no longer uses them.
3. Grow the VM disk: new spend, owner's call.
4. Later: retention for old collected items once the database matters.

**Next:**

1. Raise with the owner by about Nov 18, or sooner if the disk passes 80%
   outside test runs. Measure the database's daily growth first (not yet
   measured).
2. Nothing goes on Current order until the owner says so.
