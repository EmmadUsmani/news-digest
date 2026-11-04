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

## X comparison dispatch blocker (2026-11-04, iteration 679)

The approved comparison is prepared but has made no paid calls. The documented
xAI controls do not provide a hard per-request spend bound: `max_turns` does
not bound fetched items, `max_output_tokens` excludes reasoning/function calls,
and the billing API's postpaid limit does not cap prepaid usage. Reserving an
estimate cannot guarantee the separate $1/day/$2.50 experiment caps or preserve
half the top-up if one request overruns. See [provider findings](docs/x-search-experiment.md#provider-bound-investigation-nov-4).

Dispatch needs a supported prepaid/request cap or an owner decision on this
exposure. No billing settings were changed, no unsupported parameters used,
and production discovery keeps its existing caps. Offline work and Nov 5
scheduled acceptance checks continue; no additional key is requested.
