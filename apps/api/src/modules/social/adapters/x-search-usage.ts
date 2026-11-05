import { z } from 'zod';

export const xSearchTimeoutMs = 120_000;
const count = z.number().int().nonnegative().safe();

// Token usage settles the call even when no search tool fetched anything.
// Only absent counters default to zero; malformed reported counts are rejected.
export const xSearchUsageSchema = z.object({
  input_tokens: count,
  output_tokens: count,
  server_side_tool_usage_details: z
    .object({
      x_posts_fetched: count.default(0),
      x_users_fetched: count.default(0),
    })
    .default({ x_posts_fetched: 0, x_users_fetched: 0 }),
});
