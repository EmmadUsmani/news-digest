# Needs from human

Nothing is required to start. Optional keys go only in
`~/.config/news-digest/env` (mode 600) on the VM.

Possible later:

- `X_BEARER_TOKEN`: the official X API (pay-per-use) is optional. It is only
  needed if xAI `x_search` through the exe.dev gateway plus official embeds
  turns out to be insufficient. The agent will document exact steps and a cost
  cap if it gets there.

Editorial review configuration: the app currently has no configured LLM model or
provider. To enable M3 without violating the instruction against model/provider
changes, specify an allowed gateway-billed provider/model in STEERING.md (never
the OpenAI ChatGPT-subscription provider). No key is needed for the gateway.
The agent can then implement the capped, cached adapter; other work continues.
