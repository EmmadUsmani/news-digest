# Needs from human

Nothing is required to start. Optional keys go only in
`~/.config/news-digest/env` (mode 600) on the VM.

Possible later:

- `X_BEARER_TOKEN`: the official X API (pay-per-use) is optional. It is only
  needed if direct capped xAI `x_search` plus official embeds
  turns out to be insufficient. The agent will document exact steps and a cost
  cap if it gets there.

Editorial provider/model question resolved by STEERING item 3: use Anthropic
with configured Haiku triage and Sonnet editing. The owner installed and verified
the key; implementation and budget enforcement are agent work, with no further
owner input required.

## X discovery quality evidence (2026-11-04, iteration 645)

No immediate owner action requested. First scheduled open searches cost
$0.149447 for 19 newly verified posts, but six predate the edition window,
all five NBA results promote betting, and available reported engagement
never exceeds 12 likes. See [source measurements](docs/SOURCES.md#first-scheduled-open-x-discovery--iteration-645-2026-11-04).
This is weak discovery yield, not evidence of viral picks. Keep existing
caps. The [scheduled edition review](docs/edition-reviews/2026-11-04.md)
found none of those discoveries selected and World still empty. Improve
search quality within the existing authorization before considering new access. No unofficial data provider, scraping workaround or new
paid verification is authorized or needed for that review.

## Admin access rollout (updated under STEERING 36)

No owner action is needed for the private-VM rollout. STEERING 36 confirms
`ADMIN_EMAILS` is configured and `/api/me` recognizes the owner. The local script
token is installed. Finish migrating operational routes and tools together.
Verify proxy identity-header replacement before any future public access;
the VM stays private. See the [access decision](docs/decisions/2026-11-05-admin-access.md).

## Cloudflare R2 for off-VM backups (2026-11-05, STEERING 37)

Low priority. The agent waits for these. In the Cloudflare dashboard:

1. Create a private R2 bucket named `news-digest-backups`.
2. Create an R2 API token with **Object Read & Write**, limited to that bucket.
3. On your Mac, make the backup encryption key:
   `brew install age && age-keygen -o ~/news-digest-backup.key`.
   Save that file in your password manager. Without it, backups can't be
   decrypted. It never goes on the VM.
4. Add these lines to `~/.config/news-digest/env` on the VM. The last value is
   the public key printed by `age-keygen`, starting `age1`.

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=news-digest-backups
BACKUP_AGE_RECIPIENT=
```
