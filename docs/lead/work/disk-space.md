# Disk space

**Status (18:40 UTC Nov 16, disk 80%, 4.9 GB free):** steered as item 65
(`be4d8afd`), not yet acked. Owner decisions (Nov 16): no long-term keeping of
agent transcripts or logs, no B2 copies (B2's 10 GB stays for backups, and the
owner doesn't want to fill it), journal capped at 200 MB, Cursor and Warp data
deleted (unused), `/tmp` is not persistent storage.

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

1. Check the item 65 ack: disk % before and after, sizes freed, and that the
   timer exists in the VM setup code. Confirm `DiskSpaceLow` stopped flapping.
2. A day later, check the disk stayed flat and that the agent loop's quota
   pacing still works (it reads the newest Codex session file).
3. Later, only if the database starts growing: retention for old collected items.
