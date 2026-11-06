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

Nov 6 update (910): authorized keyword reruns still failed for NBA and World
(2/3 failed tool calls after reliability fixes); Gaming returned three posts.
Scorer review (912): Gaming one usable launch out of three (7/4, 552 reported likes), two giveaways rejected; zero retained free-link matches. All $0.048153 settled; no new holds. Fixed search stays off. No owner action
requested; finish the authorized Nov 6 round and report the remaining coverage
gaps. [Rerun evidence](docs/edition-reviews/2026-11-05-x-experiment-review.md#authorized-keyword-reruns--iteration-910-nov-6).

## Admin access rollout (updated under STEERING 36)

No owner action is needed for the private-VM rollout. STEERING 36 confirms
`ADMIN_EMAILS` is configured and `/api/me` recognizes the owner. The local script
token is installed. Finish migrating operational routes and tools together.
Verify proxy identity-header replacement before any future public access;
the VM stays private. See the [access decision](docs/decisions/2026-11-05-admin-access.md).

## Backblaze B2 for off-VM backups (2026-11-06, STEERING 37)

**Done Nov 6; kept for reference.** Settings are on the VM and smoke-checked
(STEERING 37). Replaces the earlier Cloudflare R2 plan. Steps, in the Backblaze
web console:

1. Create a Backblaze account and a **private** bucket named `news-digest-backups`
   (or a unique variant, as bucket names are global). Turn on default encryption
   if offered. Set the bucket lifecycle to **Keep only the last version**.
2. Create an **application key** (not the master key) limited to that bucket,
   with read and write access. Enable `listAllBucketNames` if the console
   offers it. Copy the `keyID` and `applicationKey` straight away: the key is
   shown once.
3. Copy the bucket's S3 endpoint (shown on the bucket page, like
   `s3.us-west-004.backblazeb2.com`).
4. On your Mac, make the backup encryption key:
   `brew install age && age-keygen -o ~/news-digest-backup.key`.
   Save that file in your password manager. Without it, backups can't be
   decrypted. It never goes on the VM.
5. Add these lines to `~/.config/news-digest/env` on the VM. The last value is
   the public key printed by `age-keygen`, starting `age1`.

```
B2_KEY_ID=
B2_APPLICATION_KEY=
B2_BUCKET=news-digest-backups
B2_ENDPOINT=https://s3.REGION.backblazeb2.com
BACKUP_AGE_RECIPIENT=
```

## Bluesky reserved-slot gate — Nov 6, iteration 1011

STEERING 40 requires waiting for the owner when either activation gate fails.
Full-AI/no-budget-refusal passes; measured-cost estimate fails narrowly:
1.5 × ($0.286904 edition + $0.047601 extra) = $0.501758 rounded up,
above the $0.501698 daily cap. Owner subsequently approved switch-on in
STEERING 40; this is no longer blocked. Enable under Current order without
changing the daily cap.
World already has a distinct Bluesky pick through an open slot.
[Review and estimate](docs/edition-reviews/2026-11-06.md).
