# Database backups

| What                 | Where / when                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Private dumps        | `~/backups/news-digest/` (directory 700, files 600), compressed custom format, retained 7 days                          |
| Nightly              | `news-digest-backup.timer`, 02:20 UTC                                                                                   |
| Weekly restore proof | `news-digest-restore-check.timer`, Sunday 03:20 UTC; isolated throwaway Postgres, all application table counts compared |
| Alert                | `DatabaseBackupStale` in local vmalert after 26 hours without a successful dump                                         |

Run either service with `systemctl --user start news-digest-backup.service`
or `systemctl --user start news-digest-restore-check.service`.
Both skip 13:00–16:00 UTC. Restore proof is saved as `restore-proof.json`.
These copies stay on this VM.

To restore into an **empty recovery database**, select a `.dump` and run
`pg_restore --exit-on-error --no-owner --no-privileges -U postgres -d RECOVERY_DB FILE.dump`.
Use Postgres 17. Owner login grants must be reapplied for production recovery.
The automated check restores with no published ports and removes its container.
