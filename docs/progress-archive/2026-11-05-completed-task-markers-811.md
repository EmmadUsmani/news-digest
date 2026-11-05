# Completed task markers — iterations 807–810

- [x] Custom-feed pending connection (810): desktop/mobile replay verifies one held request locks feed fields, source checkboxes/save/close and query controls; failure unlocks retained entries, retry/reload/disconnect pass; protected live data unchanged.

- [x] News-query connection outcomes (809): desktop/mobile replay verifies interrupted request retains input, confirmed save survives catalog-refresh failure with selection retained, then reload/disconnect; protected live data unchanged.

- [x] Feed connection outcome messages (808): distinguish an unconfirmed network outcome from a confirmed save whose catalog refresh failed; desktop/mobile recovery replay checks retained entries, saved selections and unchanged live data.

- [x] News-query pending-save recovery (807): desktop/mobile query, source-save/close and custom-feed controls lock during one held request; failure retains input, retry/reload/disconnect pass; protected live snapshots unchanged.
