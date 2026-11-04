import { z } from 'zod';

import type { XExperimentEvidence } from '../../../../scripts/lib/x-experiment-report';
import { extractXLinks } from '../../src/modules/ingestion/public/discovery';

const count = z.number().int().nonnegative().safe();
const responseSchema = z.object({
  usage: z.object({
    server_side_tool_usage_details: z.object({ x_posts_fetched: count }),
  }),
  output: z.array(z.unknown()),
});
const messageSchema = z.object({
  type: z.literal('message'),
  role: z.literal('assistant'),
  content: z.array(
    z.object({
      type: z.string(),
      text: z.string().optional(),
      annotations: z
        .array(z.object({ type: z.string(), url: z.string().optional() }))
        .optional(),
    }),
  ),
});
const toolSchema = z.object({
  type: z.literal('custom_tool_call'),
  name: z.string(),
  input: z.string(),
});
const observationSchema = z.object({
  url: z.string(),
  published_at: z.string().datetime({ offset: true }).optional(),
  likes: count.optional(),
});

// Saved citations establish candidate IDs only. Prose cannot invent candidates,
// and this extractor never supplies relevance, promotion or embed verification.
export function extractXExperimentResponse(
  metadata: Omit<
    XExperimentEvidence,
    'postsFetched' | 'actualToolCalls' | 'posts'
  >,
  raw: string,
): XExperimentEvidence {
  const response = responseSchema.parse(JSON.parse(raw));
  const texts: string[] = [];
  const urls: string[] = [];
  const actualToolCalls: { name: string; input: string }[] = [];
  for (const item of response.output) {
    const tool = toolSchema.safeParse(item);
    if (tool.success)
      actualToolCalls.push({ name: tool.data.name, input: tool.data.input });
    const message = messageSchema.safeParse(item);
    if (!message.success) continue;
    for (const part of message.data.content) {
      if (part.type !== 'output_text') continue;
      if (part.text) texts.push(part.text);
      for (const annotation of part.annotations ?? [])
        if (annotation.type === 'url_citation' && annotation.url)
          urls.push(annotation.url);
    }
  }
  const links = extractXLinks(urls.join('\n'));
  const observations = new Map<string, z.infer<typeof observationSchema>>();
  const duplicates = new Set<string>();
  for (const text of texts) {
    let entries: unknown;
    try {
      entries = JSON.parse(text);
    } catch {
      continue;
    }
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const parsed = observationSchema.safeParse(entry);
      if (!parsed.success) continue;
      const matches = extractXLinks(parsed.data.url);
      if (matches.length !== 1) continue;
      const id = matches[0].externalId;
      if (observations.has(id)) duplicates.add(id);
      observations.set(id, parsed.data);
    }
  }
  return {
    ...metadata,
    postsFetched: response.usage.server_side_tool_usage_details.x_posts_fetched,
    actualToolCalls,
    posts: links.map(({ externalId: id }) => {
      const observation = duplicates.has(id) ? undefined : observations.get(id);
      return {
        id,
        publishedAt: observation?.published_at ?? null,
        likes: observation?.likes ?? null,
        relevance: null,
        promotion: null,
      };
    }),
  };
}
