# Database and VM backups

| Copy               | Where / when                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Local database     | `~/backups/news-digest/`, private compressed Postgres 17 dumps, retained 7 days               |
| Nightly            | `news-digest-backup.timer`, 02:20 UTC; local dump first, then encrypted B2 upload             |
| VM recovery bundle | Uploaded with the nightly job when the last bundle is at least 7 days old                     |
| Restore proof      | `news-digest-restore-check.timer`, Sunday 03:20 UTC; isolated Postgres, table counts compared |
| B2 retention       | Database: 7 daily, 4 weekly, 6 monthly; VM: 4 weekly, 3 monthly; newest in each UTC period    |
| Storage cap        | 3,000,000,000 bytes, including every object version in the bucket                             |

Run `systemctl --user start news-digest-backup.service` for both local and
remote copies, or `systemctl --user start news-digest-restore-check.service`
for local restore verification. Both skip 13:00–16:00 UTC.
Before the system-ownership rollout, `python3 ops/backups/rehearse_system.py`
takes a fresh private backup and runs the application migration runner twice
in a networkless restore through a private Unix socket. Its receipt is `~/backups/news-digest/system-ownership-proof.json`.
An offsite failure leaves the local backup successful; it retries on the next
nightly run. Encrypted uploads are downloaded and checked before success is recorded.

## Encryption and storage

- B2 bucket: `news-digest-backups`, endpoint `https://s3.us-east-005.backblazeb2.com`.
- Every upload is encrypted with age to the owner's public recipient. The private key stays with the owner.
- The VM bundle contains the env file, user units, system observability units/configuration and app state. It excludes dump history, logs, metrics, caches and symlinks.
- exe.dev's disk export requires AWS federation; this installation uses the recovery bundle with B2.
- Credentials and the recipient live in `~/.config/news-digest/env`.
- Retention permanently deletes expired object versions. Before upload, the job counts the entire bucket and prunes expired copies. Under pressure it removes database copies beyond the newest seven, then old VM bundles, preserving the newest of each type. If space still cannot fit, it refuses the upload.
- Upload history, checksums and last-success times: `~/backups/news-digest/offsite.json`.
- [Operations](08-operations.md) records the latest bucket size and storage estimate.

## Alerts

| Signal                | Threshold                                                                    |
| --------------------- | ---------------------------------------------------------------------------- |
| Local database backup | No completed dump in 26 hours                                                |
| B2 database / VM      | No verified upload in 26 hours / 8 days                                      |
| B2 attempt            | Latest attempt failed, including a storage refusal                           |
| B2 storage            | Above 2 GB, or last-30-day upload sizes project crossing 3 GB within 60 days |

Local and B2 alerts are active. The Operations page shows backup status;
the observability stack evaluates the exported metrics every 30 seconds.

## Download and decrypt on a Mac

Install `age`, `awscli` and PostgreSQL 17 client tools first. Use the owner's
age identity file and B2 application credentials. Enter credentials when prompted:

```bash
umask 077
read -r -p 'B2 key ID: ' AWS_ACCESS_KEY_ID
read -r -s -p 'B2 application key: ' AWS_SECRET_ACCESS_KEY; echo
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION=us-east-005
endpoint=https://s3.us-east-005.backblazeb2.com
bucket=news-digest-backups
key=$(aws --endpoint-url "$endpoint" s3api list-objects-v2 --bucket "$bucket" --prefix database/ --query 'reverse(sort_by(Contents,&LastModified))[0].Key' --output text)
aws --endpoint-url "$endpoint" s3 cp "s3://$bucket/$key" database.dump.age
age --decrypt -i "$HOME/.config/age/news-digest.key" -o database.dump database.dump.age
pg_restore --list database.dump
key=$(aws --endpoint-url "$endpoint" s3api list-objects-v2 --bucket "$bucket" --prefix vm/ --query 'reverse(sort_by(Contents,&LastModified))[0].Key' --output text)
aws --endpoint-url "$endpoint" s3 cp "s3://$bucket/$key" vm.tar.gz.age
age --decrypt -i "$HOME/.config/age/news-digest.key" -o vm.tar.gz vm.tar.gz.age
tar -tzf vm.tar.gz
```

Run these commands in Bash; replace the identity path with the owner's file.
`pg_restore` must be version 17. Keep decrypted files private.

## Rebuild from nothing

1. Create an Ubuntu VM and clone this repo to `~/news-digest` on `main`. Install Docker with Compose, Node 22 and pnpm 10.28.2; see the [stack guide](01-stack-and-runtime.md).
2. Download and decrypt both backups with the commands above. Extract the bundle into a private staging directory: `mkdir -m 700 recovery; tar -xzf vm.tar.gz -C recovery`.
3. Restore `.config/news-digest/env` with mode 600 and its directory with mode 700. Restore `.local/state/news-digest/` and the user units to their original paths. Keep restored timers stopped until configuration is ready. Keep the age private key off the VM.
4. Start Postgres and Redis with `docker compose up -d postgres redis`. Restore into an empty `news_digest` database: `docker compose exec -T postgres pg_restore --exit-on-error --no-owner --no-privileges -U postgres -d news_digest < database.dump`. Recreate database logins and grants for the owner and observability using the restored credentials; a database dump does not include cluster roles.
5. Run `pnpm install --frozen-lockfile` and `pnpm build`, then start the app services below. Check `/healthz`, `/api/editions/latest` and the saved reader before starting the worker.
6. Reinstall observability from `ops/observability/` and restore its saved configuration from the bundle's `system/etc/` directory. Root-owned units and configuration need the owner's intervention.
7. Run `bash ops/backups/install-age.sh` and `bash ops/backups/install.sh`; confirm timers, take a new backup and run the restore check. Check B2 upload receipts and alerts.

From `~/news-digest`, install the current app units and start the reader first:

```bash
install -d -m 700 ~/.config/systemd/user
install -m 644 ops/services/*.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now news-digest-api news-digest-docs news-digest-schema
curl --fail http://localhost:8000/healthz
curl --fail --silent http://localhost:8000/api/editions/latest -o /dev/null
# After checking the saved reader and provider/budget configuration:
systemctl --user enable --now news-digest-worker
```

Redis starts empty: saved editions and application settings return from Postgres;
the worker recreates recurring schedules. Historical Redis job payloads are not
in the database backup. Enable user lingering for services to survive logout
(`sudo loginctl enable-linger "$USER"`, owner/root step).
