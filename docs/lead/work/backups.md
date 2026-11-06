# Backups

**Status:** local backups work. Off-VM copies go to Backblaze B2 (owner switched
from Cloudflare R2 on Nov 6). Owner's B2 settings are on the VM.

**Latest:** nightly backups run at 02:20 UTC on the VM, with weekly restore tests.
STEERING item 37 covers Backblaze B2 for the database and the VM.

**Next:** the agent builds item 37 last in Current order (smoke check passed
Nov 6: key valid and bucket-limited; `age`/`aws` missing on the VM). After the first uploads, check the ack, the 26-hour
alert and a Mac-side decrypt test.
