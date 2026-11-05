# Completed task markers: iterations 815–829

- [x] Source catalog deadline (829): initial load and post-connection refresh time out after 15 seconds; desktop/mobile replay verifies retry preserves entries and saved connections without another write.

- [x] Topic reorder deadline (828): stalled order saves release controls after 15 seconds; desktop/mobile timeout replay recovers saved order on reload without another PUT.

- [x] Topic availability deadline (827): stalled Enable/Disable requests release controls after 15 seconds; desktop/mobile timeout replay recovers saved availability on reload without another PUT.

- [x] Topic deletion deadline (826): stalled deletion releases controls after 15 seconds; desktop/mobile timeout replay recovers a completed deletion on reload without another DELETE.

- [x] Topic save deadline (825): creation/editing release stalled controls after 15 seconds; desktop/mobile timeout replays preserve entries and recover a completed creation on reload without duplicates.

- [x] Edition submission deadline (824): stalled queue requests unlock controls after 15 seconds; desktop/mobile real-timeout and reload replay verifies no automatic resubmission.

- [x] Schedule save deadline (823): stalled requests release controls after 15 seconds, preserve entered values and retain reload guidance; desktop/mobile real-timeout replay passes.

- [x] Edition request recovery (822): interrupted generation warns about a possibly queued run; desktop/mobile replay verifies reload does not resubmit.

- [x] Topic creation recovery (821): interrupted creation warns about duplicates; desktop/mobile replay recovers one saved topic on reload without another POST.

- [x] Topic settings recovery (820): interrupted saves explain possible completion; desktop/mobile lost-response replay recovers saved X accounts on reload without another write.

- [x] Metrics memory recovery (819): reclaim filesystem cache at 88 MiB below the unchanged 112 MiB ceiling; runtime O4 verifies both limits.

- [x] Source catalog recovery (818): retry failed initial or post-connection loads in place; desktop/mobile replay preserves unsent feed fields and saved selections without another write.

- [x] Custom-feed recovery (817): unconfirmed connections advise reloading saved sources; desktop/mobile replay verifies a completed POST with a lost response recovers without another write.

- [x] Source selection recovery (816): interrupted saves advise checking saved sources; desktop/mobile replay verifies reload recovers the saved connection without another PUT.

- [x] Topic availability recovery (815): interrupted enable/disable responses advise checking saved topics; desktop/mobile replay verifies reload recovers a completed change without another write.
