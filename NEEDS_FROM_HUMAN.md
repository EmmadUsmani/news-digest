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

## Admin access rollout — complete; site public (Nov 15)

Admin access and operational-route migrations are deployed. `ADMIN_EMAILS`
and the local script token are configured. The owner confirmed proxy identity
replacement; the last-entry visitor selector and loopback trust remain in use.
See the [access decision](docs/decisions/2026-11-05-admin-access.md).

Public mode was enabled in iteration 2330, and scheduled edition `a0fa3916`
passed the publishing/reader gate in iteration 2398. The owner made VM sharing
public on Nov 15, as recorded in STEERING Current order and item 63. No sharing
or activation decision remains. Keep public mode on; only the owner changes
sharing. Follow [public readiness](docs/public-readiness.md) for recovery.

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
The lead's Phase 4 security review and item 58 acceptance are complete.
The owner made the site public on Nov 15; no go-public decision remains.

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

## World/U.S. activation (Nov 11, iteration 1859)

No owner decision needed: item 57 supersedes the historical 1.5× fit gate and
savings work. Activation uses AI $20/month/$0.65 maximum daily and X
$15/month/$0.50 daily. Historical expected five-topic cost is $0.527945;
actual cost and scope acceptance await the next three scheduled editions.
The provider's separate configured workspace ceiling still applies.
Historical reservation measurements remain in
[the cost evidence](docs/edition-reviews/2026-11-11-fifth-topic-budget.md).

## Phase 4 proxy verification (Nov 12, iteration 1879)

Original Nov 12 request (answered in part below): confirm the shared
target is port 8000 and client-supplied identity headers are replaced. The VM
has no configured SSH credentials or known-host entry; the documented
`ssh exe.dev help all` attempt failed host-key verification. No sharing changes
or account setup attempted. Existing Nov 9 visitor-address proof remains valid.
Public activation stays gated on these checks and the owner's decision.

**Resolved Nov 13 (owner, from the Mac, read-only):** `ssh exe.dev share show`
reports proxy port 8000. A signed-in browser `fetch('/api/me')` sending a
spoofed non-admin `X-ExeDev-Email` returned `isAdmin: true`, so the proxy
replaced the client's header with the real identity. Not covered: the
`X-ExeDev-UserID` header, and anonymous visitors once the proxy is public.
STEERING 62 accepted Nov 14 publication for item 58; iteration 2330 enabled
public mode. Nov 15 scheduled edition `a0fa3916` passed the publishing/reader
gate (2398), and item 50 is acknowledged. The owner subsequently made sharing
public on Nov 15. STEERING 63 now requires public mode to remain on and the
Nov 16 scheduled edition to be accepted through public HTTPS. That review is
agent work, not a pending owner decision; no proxy rerun is requested.

## Resolved: disk headroom — Nov 15, iteration 2329

Owner authorization arrived in STEERING 60. Checked both artifacts and all
48 descendants with privileged `fuser`; no open references. Removed only
`/tmp/obs355` and `/tmp/news-digest-vmutils.tgz`, reclaiming 398,888,960
allocated bytes (380.4 MiB). Filesystem usage fell from 78% to 77%.
STEERING 61 now governs eligible future old scratch cleanup; no owner action
is needed for these paths.

## Resolved: item 65 agent-control log retention — Nov 16, lead

The owner chose to have the supervisor prune its own per-iteration logs
(`7d6b5a05`), so the agent-control prohibition stays intact. The lead deployed
it at 20:06 UTC; logs fell from 568 MB to 249 MB. No agent action needed.

## Destructoid feed access (2026-11-17, iteration 2601)

Collection is paused because the official RSS feed now returns Cloudflare
HTTP 403 (“Sorry, you have been blocked”). Existing articles remain available
and the other Gaming feeds continue. No immediate action is needed; restoring
this feed requires documented publisher access. No access workaround was tried.

## Tech publisher access failures (2026-11-18, iteration 2683)

The normal shared HTTP client returned HTTP 403 for
`https://openai.com/index/introducing-gpt-6-2-astra-sol/` and
`https://www.ft.com/content/dbde7a30-548c-4f9d-a4be-7898a0c24dcf`,
and HTTP 404 for `https://github.com/microsoft/onnxruntime`. These linked HN
candidates retain empty excerpts. No bypass attempted; no immediate owner action
is needed. Improving these candidates requires accessible publisher reporting.

Item 67 one-time three-day audit (2770): 20 HTTP failures remain blank:
15 HTTP 403, three 401, one 429, one 404. In addition to the hosts above,
affected origins are AP, Reuters, CNN, SCMP, NYTimes, The Hill, WREG,
Downdetector, Retrocomputing Stack Exchange, sas.upenn.edu and arkanumdata.com.
A Business Insider page exposes a login/paywall marker. No repeated recovery
or bypass planned; accessible publisher content is needed.
[Per-candidate causes](docs/edition-reviews/2026-11-18-tech-blank-causes.md).

## Event-budget acceptance inputs unavailable (2026-11-22, iteration 3369)

Item 69 remains undeployed: 22,369 live cache entries contain no event-review
annotations or previews, and the joint comparison has complete labels only for
Nov 17–18. Nov 12–16 before/after shares remain unmeasured. Existing no-paid-
replay limits prevent obtaining model acceptance output now. No immediate
action requested; proceed with scheduled reader acceptance and the miss-cause
fix. Resume this acceptance only with new saved responses or owner direction.
See [decision and evidence](docs/edition-reviews/2026-11-18-joint-event-comparison.md).
