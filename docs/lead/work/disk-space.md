# Disk space

**Status (18:15 UTC Nov 16, disk 80%, 4.9 GB free):** owner flagged this as the next
priority to work on together. Not started, not steered. Disk is now sitting at
the 80% warning line, so `DiskSpaceLow` flaps firing/resolved every few minutes.
Free space fell 5.7 → 4.9 GB in about a day, faster than the estimate below.

**Growth since Nov 15 (lead read-only check, Nov 16):** `~/.codex/sessions`
1.5 → 1.7 GB, thread history 553 → 601 MB, agent logs 514 → 566 MB, `/tmp`
about 2.0 → 2.4 GB (the agent saves review receipts there).

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

1. Trigger met (80% outside test runs): raised with the owner Nov 16. Waiting
   for their choice of options. Database daily growth still not measured.
2. Nothing goes on Current order until the owner says so.
