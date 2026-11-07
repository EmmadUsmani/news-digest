# Backups

**Status:** off-VM copies are live in Backblaze B2 (agent's report, Nov 7): about
8.4 MB of the 3 GB budget, with the nightly job uploading. Item 37 stays open
until the four new alerts are active. They need root on the VM, and the owner
hasn't approved that yet. Lead diff on Nov 7: the change only adds those four.

**Budget (Nov 6, owner-approved):** the owner's B2 free tier is 10 GB and shared
with other projects, so item 37 now caps this bucket at 3 GB (alert at 2 GB) with
tiered retention. The owner already set the lifecycle to "Keep only the last
version".

**Next:** after the owner approves, install the alert rules outside 13:00–16:00
UTC (commands in `NEEDS_FROM_HUMAN.md`). Then check tonight's nightly upload and
do a Mac-side decrypt test. No backup has been decrypted with the private key yet.
