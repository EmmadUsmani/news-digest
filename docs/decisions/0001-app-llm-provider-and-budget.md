# 0001: App LLM provider, models and spend caps

- **Status:** accepted
- **Date:** 2026-11-01
- **Decided by:** the owner
- **Build instructions:** STEERING.md item 3
- **Budget amendment (2026-11-11):** STEERING item 57 sets the app cap to
  $20/month and at most $0.65/day for five topics. The provider and models
  remain unchanged; the original decision below records the earlier caps.

## Context

M3 needs an LLM for two jobs:

- triage: scoring the relevance and importance of every candidate item
- editorial: picking the final stories and writing summaries

Requirements:

- easy to set up on the exe.dev VM
- a hard spend cap enforced by the provider, not only by the app
- a budget of about $1/day, with a hard ceiling of $15/month

## Bake-off (2026-11-01)

Setup:

- the same 174 real items from the previous 24 hours
- the same prompt: up to 3 stories per topic, with 2-sentence summaries, as
  JSON
- run through the exe.dev gateway; total cost about $0.18
- one sample only, so a directional signal, not a benchmark

| Model                           | $/1M in / out | Run cost | Time | Pick quality                                                                                  |
| ------------------------------- | ------------- | -------- | ---- | --------------------------------------------------------------------------------------------- |
| claude-sonnet-5-5               | 2 / 10        | $0.091   | 20s  | Best: caught the record $6.3bn Binance hack, the midterm early voting and the AI-bubble story |
| claude-haiku-5-5                | 0.10 / 0.50   | $0.005   | 15s  | Good on NBA and World; weaker on Tech (missed the Binance hack)                               |
| deepseek-v4p1-flash (Fireworks) | 0.30 / 1.20   | $0.022   | 74s  | Strong judgment; slow, with about 13k thinking tokens                                         |
| glm-5p3-flash (Fireworks)       | 0.15 / 0.50   | $0.010   | 88s  | Decent; slow, with thinking tokens                                                            |
| gpt-oss-120b (Fireworks)        | 0.15 / 0.60   | $0.004   | 18s  | Weakest; filler tech picks                                                                    |

The summaries were accurate across models. The models differed mostly in which
stories they judged important.

Options not tested:

- **OpenAI:** `gpt-6-luna` and `gpt-6.1-sol` are priced the same as Haiku 5.5
  and Sonnet 5.5. On this VM the gateway's OpenAI route is the owner's ChatGPT
  subscription, which Codex shares, so it was off-limits.
- **Gemini:** not on the gateway. It would need separate Google billing and a
  key, and Flash-Lite is pricier than Haiku 5.5.

## Decision

- **Models (hybrid):**
  - Haiku 5.5 triages everything. Keep each prompt under 100k input tokens;
    above that Haiku costs 5x as much.
  - Sonnet 5.5 does the final edit and summaries on the shortlist.
  - Projected cost is about $0.25/day at about 1,500 items/day.
- **Provider:** the Anthropic API directly, with a key from a dedicated
  workspace that has a hard monthly spend limit of $15.
  - Anthropic enforces workspace limits. Requests fail with HTTP 400
    `invalid_request_error` ("...workspace API usage limits") until the month
    resets.
  - The exe.dev gateway documents no spend caps, so it was rejected for this
    use.
- **App caps on top:**
  - $14/month
  - a daily cap of the remaining monthly budget divided by the days left, at
    most $1.00
  - reserve the cost before each call
  - fallbacks: Sonnet, then Haiku, then non-AI ranking

## Alternatives kept on file

- **OpenRouter:** a per-key credit limit with a daily reset is the only true
  provider-level daily cap. It adds a third party and prepaid credits.
- **OpenAI project hard spend limit:** reportedly added in July 2026; verify
  before use.
