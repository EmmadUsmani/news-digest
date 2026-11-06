# Backups

**Status:** local backups work. Off-VM copies go to Backblaze B2 (owner switched
from Cloudflare R2 on Nov 6). Waiting on the owner's B2 settings.

**Latest:** nightly backups run at 02:20 UTC on the VM, with weekly restore tests.
STEERING item 37 covers Backblaze B2 for the database and the VM.

**Next:** the owner creates the B2 bucket and key per `NEEDS_FROM_HUMAN.md`; then
the agent builds item 37. After the first uploads, check the ack, the 26-hour
alert and a Mac-side decrypt test.
