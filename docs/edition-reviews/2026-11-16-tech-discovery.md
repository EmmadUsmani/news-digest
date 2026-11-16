# Tech discovery: technical-term comparison

Iteration 2449, November 16. The saved November 15 edition's empty Tech
Bluesky section traces to intake relevance. Earlier Claude/Gemini/AI-demo
probes did not justify a replacement. This comparison tests different technical
terms using the existing four-query free probe, with no additional search volume.

All four live official API searches share the 24-hour window ending
**2026-11-16T01:25:51.043Z**. The first search resolves current topic metadata
and confirms `AI` remains the configured baseline. [Bounded results and public
examples](2026-11-16-tech-discovery.json) retain the actual probe output;
transport logs and credentials are excluded.

| Query            | Fetched | Safety/engagement eligible | Eligible attached videos |
| ---------------- | ------: | -------------------------: | -----------------------: |
| AI               |      48 |                         48 |                        3 |
| machine learning |      43 |                         31 |                        0 |
| LLM              |      48 |                         48 |                        1 |
| OpenAI           |      45 |                         43 |                        1 |

Read all three exported safe examples and all exported video captions for each
query. AI still leads with political commentary and generated-image criticism;
its video captions deny AI use or discuss Trump. Machine learning supplies
criticism, plant-diversity research and an unrelated voice-chat joke. Its low
engagement does not itself establish poor relevance, but these examples do not
show the wanted launch/demo supply.

LLM supplies a human-translated game patch announcement and criticism. Its one
video caption describes a requested PBS-style explanation of research topics;
without viewing the media, this does not establish a useful working demo.
OpenAI supplies lobbying speculation, a watermark observation and a German
report about a mathematics association opposing AI. Its video caption is a list
of hostile hashtags. These are saved post claims, not verified reporting.

Retain production queries, gates, cadence, pages and budgets. The bounded
examples do not establish a better broad discovery query, and candidate counts
are not semantic pass counts. Do not stack further generic term probes before
the next natural edition provides new intake/selection evidence. If Tech again
has no picks, inspect the actual saved scores first; do not infer an editor
failure from absence alone. No inference, media fetch, observation write,
publication, paid request or production configuration change occurred.

Verification: `pnpm exec tsx scripts/probe-bluesky.ts --tech` succeeds. Assertions
verify four expected queries, one shared window, baseline labels, ≤50 fetched
per query, zero submissions/stored observations, and false semantic/publication
flags. Private raw receipt: `/tmp/2449-tech-probe.jsonl` (mode 600).
