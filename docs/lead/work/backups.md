# Backups

**Status:** off-VM copies are live in Backblaze B2 (agent's report, Nov 7): about
8.4 MB of the 3 GB budget, with the nightly job uploading. The four offsite alerts
are active: a lead installed them at 01:45 UTC on Nov 7 with the owner's approval,
and all four are loaded and healthy. The agent closes item 37 under item 46.

**Budget (Nov 6, owner-approved):** the owner's B2 free tier is 10 GB and shared
with other projects, so item 37 now caps this bucket at 3 GB (alert at 2 GB) with
tiered retention. The owner already set the lifecycle to "Keep only the last
version".

**Next:** check tonight's nightly upload, then do a Mac-side decrypt test. No
backup has been decrypted with the private key yet.
