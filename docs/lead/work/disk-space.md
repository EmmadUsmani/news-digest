# Disk space

**Status (20:10 UTC Nov 16, disk 60%, 9.4 GB free):** item 65 done apart from
the first timed run. Agent part (`b2be7a38`, `7a790a58`) verified: 80% → 61%,
alert quiet since 18:34, `news-digest-retention.timer` daily 04:40 UTC. The
owner chose supervisor self-pruning for `~/agent-control/logs`: lead change
`7d6b5a05` (7 days, keeps the newest iteration so numbering continues),
deployed 20:06 UTC, 568 → 249 MB, iteration 2542 started normally.

**Item 65 in short:** a daily timer deletes Codex sessions and per-iteration
agent logs older than 7 days, plus a `systemd-tmpfiles` rule clears `/tmp`
entries untouched for 3 days. Replaces item 61. The journal cap lives in
`ops/observability/install.sh` (was 500M).

**Measured Nov 16 (lead, read-only):** `~/.codex/sessions` 1.7 GB (about
100 MB a day), `~/agent-control/logs` 566 MB, `/tmp` 2.4 GB, journal 475 MB,
`.cursor-server` + `.warp` about 1.3 GB, Codex thread history 601 MB (left
alone: Codex reads it). Database small (Postgres 181 MB on Nov 15).

**Expected (inference):** about 3–4 GB freed, disk near 65%, then roughly flat.

**Next:**

1. Nov 17 after 04:40 UTC: check the first timed run, the agent's item 65 ack,
   and that disk stayed flat (about 60%).
2. Later, only if the database starts growing: retention for old collected items.
