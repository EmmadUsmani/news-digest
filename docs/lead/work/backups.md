# Backups

**Status:** off-VM copies are live in Backblaze B2, and item 37 is closed. Lead
check on Nov 7: the 02:20 UTC nightly job uploaded and its download checksum
matched, with the bucket at 16.4 MB of the 3 GB budget. The four offsite alerts
are active.

**Budget (Nov 6, owner-approved):** the owner's B2 free tier is 10 GB and shared
with other projects, so item 37 now caps this bucket at 3 GB (alert at 2 GB) with
tiered retention. The owner already set the lifecycle to "Keep only the last
version".

**Next:** the owner does a Mac-side decrypt test. No backup has been decrypted
with the private key yet.
