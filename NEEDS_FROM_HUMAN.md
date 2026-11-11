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

Nov 6 round (1050): keyword usable Tech/NBA/Gaming/World 0 (failed)/3/3/0; semantic zero. Failure rate 3/10 attempts, one of four keyword cells after retries. All $0.442837 settled, no new holds. No owner action requested; saved old-baseline comparison and the plan decision are next. [Evidence](docs/edition-reviews/2026-11-06-x-experiment-review.md).

## Admin access rollout (updated under STEERING 36)

No owner action is needed for the private-VM rollout. STEERING 36 confirms
`ADMIN_EMAILS` is configured and `/api/me` recognizes the owner. The local script
token is installed. Finish migrating operational routes and tools together.
Verify proxy identity-header replacement before any future public access;
the VM stays private. See the [access decision](docs/decisions/2026-11-05-admin-access.md).

Nov 9 item 53 proxy question resolved by the owner's result in STEERING.md:
both appended entries match the visitor, and the immediate peer is loopback.
Keep the existing last-entry selector. No further proxy rerun is requested;
observed-shape tests and explicit loopback trust are complete (1589). Phase 3
migrations and invite-only server/web deployment are complete (1591). Public
mode remains off; sharing is unchanged.

## Owner two-device acceptance — passed (Nov 10)

Owner reported two-browser sign-in and saved-item sync passed at about 03:50 UTC
Nov 10 (STEERING 50). This completes the owner and proxy/TLS cookie checks.
Nov 10 edition published with accounts on (1707); NBA story validation exhausted
to source excerpts. Phase 3 accepted by the owner in the Nov 10 evening steering update;
NBA editorial acceptance remains under item 54. Migration 0019 is live (1730);
no further owner action is requested. [Daily review](docs/edition-reviews/2026-11-10.md).
The mailbox helper was repaired and its exact VM command verified against a
newly requested real code (1616); credentials were withheld and the session signed out.

Reference steps: use a phone and laptop, with the same allowlisted owner email. Complete one
sign-in before requesting the next code; each request replaces the prior code.

1. On the laptop open https://news-digest.exe.xyz/account/login. Enter your
   owner email and choose **Request code**. In your terminal run the command
   below, replacing `YOUR_OWNER_EMAIL` with that same email. Enter the printed
   six-digit code on the page and choose **Sign in** within ten minutes.

   ```sh
   ssh news-digest.exe.xyz 'cd /home/exedev/news-digest && pnpm exec tsx scripts/read-login-mailbox.ts /home/exedev/.local/share/news-digest/login-mailbox YOUR_OWNER_EMAIL'
   ```

2. On the phone open the same HTTPS login address. A second browser first
   shows exe.dev's sign-in page: sign in with your exe.dev email, then use the
   app's sign-in. Request a code for the same
   email, rerun the command, and enter this new code on the phone. On both
   devices open the digest and **Account**; wait for “Your topics and saved
   items are synced.” Reload both and confirm they stay signed in.
3. On the laptop choose **Save** on an unsaved story. Wait for Account to show
   synced, then reload the phone and open **Saved items**. Confirm that exact
   story appears. Note its title for your report.
4. On the phone remove that story from **Saved items**. Wait for synced, reload
   the laptop, and confirm the story is absent from **Saved items** and its
   digest button reads **Save** again.
5. On the laptop open **Account → Sign out all devices**. Reload the phone and
   laptop; both should offer **Sign in** in Account.

Report phone/laptop browser names, pass/fail for sign-in after reload, save
sync, removal sync and sign-out, plus the story title. If a step fails, report
its number and the visible error. Never send codes, cookies or mailbox output.
This test supplies the proxy/TLS cookie check the VM cannot perform itself.
Phase 3 was accepted after this test and the Nov 10 scheduled publication.
The separate natural sign-in link expiry check passed on Nov 11 (1757).

Phase 4 script-policy blocker resolved in iteration 1567: the earlier reports
came from app theme startup and Zod code generation. The corrected reader passes
40 real X widget views with the self/platform script allowlist enforced and no
inline/eval exceptions. [Review and evidence](docs/public-script-policy-review.md).
Full Phase 4 readiness/security review remains pending.

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
STEERING 40; enabled in iteration 1061 for the next scheduled edition,
with the daily cap unchanged. Three-edition acceptance remains agent work.
World already has a distinct Bluesky pick through an open slot.
[Review and estimate](docs/edition-reviews/2026-11-06.md).

Nov 6 update (1051): saved-baseline comparison completes the authorized decision: keywords nine usable vs old search zero; semantic zero additions, dropped. No owner action needed. Production rollout and three-edition acceptance remain agent work; fixed search OFF until verified rollout. Post-fix keyword failures 5/9 attempts are recorded in the [decision](docs/edition-reviews/2026-11-06-x-experiment-review.md#baseline-comparison-and-decision--iteration-1051).

## Public archive publication decision (2026-11-07, iteration 1240)

Resolved by STEERING 50 owner decision on Nov 7: publish non-`integration:`
scheduled editions created on or after Nov 3 UTC, plus future scheduled editions.
All Nov 1–2 editions remain unpublished and visible in admin; `integration:`
editions are tests. No further publication decision is needed. Phase-0 backfill,
comparison and reader filter remain implementation work; visibility is unchanged.
[Inventory](docs/edition-reviews/2026-11-07-publication-inventory.md).

- Nov 10 (1625): newest item-50 waiting order followed; World social tuning and richer Tech sources remain held by existing instructions, so no new content change is authorized before scheduled evidence. No owner response requested. [Comparison](docs/edition-reviews/2026-11-10.md).

## World/U.S. full-headroom constraint (Nov 11, iteration 1856)

No decision requested yet; activation remains gated under item 56. The
conditional Nov 12 effective cap ($0.542011) supports $0.361340 of edition
cost at 1.5× headroom. Three saved four-topic baselines already exceed that,
without adding U.S. work; the peak needs $0.061016 net savings before any
addition. Even free grouping across all topics leaves $0.053445 to save.
The next allowed approach is attributable World-only savings with unchanged
quality and other topics. If that cannot close the gap, the owner must resolve
the scope/budget conflict; agents must not raise caps or relax the reserve.
[Calculation and assumptions](docs/edition-reviews/2026-11-11-fifth-topic-budget.md#cost-frontier-without-a-fifth-topic-proxy--iteration-1856).

Iteration 1857: reconciled journal/ledger attribution measures Nov 10 World at
$0.106435; keeping the other topics fixed leaves $0.045419 for World/U.S.
combined. Free World triage/grouping still leaves $0.041829 to save before U.S.
additions. No policy change requested; evaluate concrete paired editorial
savings next. Nov 4–5 attribution fails reconciliation and receives no credit.

Iteration 1858: prepared paired editing establishes no savings; both-scope
initial Sonnet reservations grow $0.062630 on saved-summary proxies. Keeping
World social editing fixed leaves $0.010337 actual cost for all remaining
World/U.S. work. Reservation estimates are not charges or proof of refusal.
No cap/model/output-limit changes; semantic routing evidence remains next.
