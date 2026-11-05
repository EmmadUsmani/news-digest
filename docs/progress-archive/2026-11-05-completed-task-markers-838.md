# Completed task markers through iteration 837

- [x] Source keyboard navigation (837): opening sources focuses the panel heading; closing restores the topic button; desktop/mobile replay verifies Enter reopens it.

- [x] Pending source operations (836): accessible status names source-selection saves, feed connections and news-query connections; desktop/mobile replay verifies pending feed/query feedback.

- [x] Source loading feedback (835): initial catalog loading and retry show an accessible status while source forms are disabled; desktop/mobile replay and screenshots cover the loading state.

- [x] Independent source drafts (834): connecting a feed preserves an unfinished news query; connecting a query preserves feed name/URL, including confirmed-save catalog failures. Desktop/mobile replay passes.

- [x] Query connection feedback (833): news-query success, rejection, refresh failure and timeout name the query; desktop/mobile replay verifies retained/cleared input and no repeated POST on catalog retry.

- [x] News-query recovery verification (832): desktop/mobile replay covers a completed query POST timing out, retained input, unlocked controls and reload recovery without a second POST.

- [x] Feed connection deadline (831): custom feed/query POST releases controls after 15 seconds; desktop/mobile replay recovers a saved feed on reload without another POST.

- [x] Source selection deadline (830): stalled connection saves release controls after 15 seconds; desktop/mobile replay recovers completed saves on reload without another PUT.
