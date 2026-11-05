import { z } from 'zod';

import { measuredFetch } from '../../../libs/observability/external-metrics';
import { logger } from '../../../libs/observability/logging';
import { extractXLinks } from '../../ingestion/public/discovery';
import {
  XSearchError,
  type XSearchPort,
  type XSearchRequest,
} from '../domain/x-search.port';
import { baseXSearchBody } from './x-search-body';
import { xSearchComparisonBody } from './x-search-comparison';
import { readReportedEngagement } from './x-search-engagement';
import { viralXSearchBody } from './x-viral-search-body';

const count = z.number().int().nonnegative().safe();
const usageSchema = z.object({
  input_tokens: count,
  output_tokens: count,
  server_side_tool_usage_details: z.object({
    x_posts_fetched: count,
    x_users_fetched: count,
  }),
});
const citationsSchema = z.object({
  status: z.literal('completed'),
  output: z.array(
    z.object({
      type: z.string(),
      role: z.string().optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
            annotations: z
              .array(z.object({ type: z.string(), url: z.string() }))
              .optional(),
          }),
        )
        .optional(),
    }),
  ),
});
export function xSearchBody(request: XSearchRequest) {
  if (request.fixedSearch) {
    const { style, settings, rankedStoryTitles } = request.fixedSearch;
    if (!['reactions', 'trending'].includes(style))
      throw new Error('Invalid fixed X search style');
    return style === 'trending'
      ? viralXSearchBody(request, settings)
      : xSearchComparisonBody(request, style, settings, rankedStoryTitles);
  }
  return baseXSearchBody(request);
}

// Direct authenticated inference is separate from the public GET-only ingestion client.
// No redirects, retries, fallback providers or arbitrary endpoint/model overrides.
export class DirectXSearch implements XSearchPort {
  constructor(
    private readonly key: string,
    private readonly send: typeof fetch = fetch,
    private readonly log = logger,
  ) {
    this.send = measuredFetch('xai', send);
    if (!key.trim()) throw new Error('X search key unavailable');
  }
  async search(request: XSearchRequest) {
    const body = xSearchBody(request);
    const started = performance.now();
    let status: number | undefined;
    const fields = {
      event: 'external.call',
      target: 'xai',
      model: body.model,
      searchType: request.reactionStory
        ? 'story-reactions'
        : request.handles === undefined
          ? 'open'
          : 'account-list',
    };
    try {
      const result = await this.perform(
        body,
        (value) => {
          status = value;
        },
        request.fixedSearch?.style === 'trending' ? 16 : 5,
      );
      this.log.info(
        {
          ...fields,
          status,
          outcome: 'success',
          durationMs: Math.round(performance.now() - started),
          usage: {
            input: result.usage.inputTokens,
            output: result.usage.outputTokens,
          },
          postsFetched: result.usage.postsFetched,
          profilesFetched: result.usage.profilesFetched,
          citedLinks: result.links.length,
        },
        'External xAI call',
      );
      return result;
    } catch (error) {
      this.log.warn(
        {
          ...fields,
          status,
          outcome: 'failure',
          durationMs: Math.round(performance.now() - started),
          reason: error instanceof XSearchError ? error.reason : 'uncertain',
        },
        'External xAI call',
      );
      throw error;
    }
  }
  private async perform(
    body: ReturnType<typeof xSearchBody>,
    received: (status: number) => void,
    linkLimit: number,
  ) {
    let response: Response;
    let raw: string;
    try {
      response = await this.send('https://api.x.ai/v1/responses', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(60000),
        headers: {
          Authorization: `Bearer ${this.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      received(response.status);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Empty response');
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 2 * 1024 * 1024) {
          await reader.cancel();
          throw new Error('Oversized response');
        }
        chunks.push(value);
      }
      raw = Buffer.concat(chunks).toString('utf8');
    } catch {
      throw new XSearchError('uncertain');
    }
    if (!response.ok) {
      // A depleted balance is durable; ambiguous failures keep the reservation charged.
      if (
        [400, 402, 403, 429].includes(response.status) &&
        /credits? (?:are )?(?:depleted|exhausted)|insufficient (?:credits|funds)|out of credits|(?:doesn.t have|has no|no remaining) (?:any )?credits|credit balance.*(?:exhausted|insufficient)/i.test(
          raw,
        )
      )
        throw new XSearchError('credits-depleted');
      throw new XSearchError(
        [400, 401, 403, 404, 422].includes(response.status)
          ? 'rejected'
          : 'uncertain',
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new XSearchError('uncertain');
    }
    const root = z.object({ usage: usageSchema }).safeParse(parsed);
    if (!root.success) throw new XSearchError('uncertain');
    const usage = root.data.usage;
    // Bill fetched items, never just the number of URLs cited or output tokens alone.
    const content = citationsSchema.safeParse(parsed);
    const urls = content.success
      ? content.data.output
          .filter(
            (item) => item.type === 'message' && item.role === 'assistant',
          )
          .flatMap((item) => item.content ?? [])
          .filter((part) => part.type === 'output_text')
          .flatMap((part) => part.annotations ?? [])
          .filter((annotation) => annotation.type === 'url_citation')
          .map((annotation) => annotation.url)
      : [];
    const links = extractXLinks(urls.join('\n')).slice(0, linkLimit);
    const texts = content.success
      ? content.data.output
          .filter(
            (item) => item.type === 'message' && item.role === 'assistant',
          )
          .flatMap((item) => item.content ?? [])
          .filter((part) => part.type === 'output_text')
          .map((part) => part.text ?? '')
      : [];
    // Prose cannot add candidates; reported counts are explicitly unverified.
    return {
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        postsFetched: usage.server_side_tool_usage_details.x_posts_fetched,
        profilesFetched: usage.server_side_tool_usage_details.x_users_fetched,
      },
      links,
      // Read independently of citation validation: paid calls with no usable
      // citations still need their actual queries for diagnosis. Never infer
      // execution from the requested prompt or assistant prose.
      toolCalls: z.object({ output: z.array(z.unknown()) }).safeParse(parsed)
        .success
        ? (parsed as { output: unknown[] }).output.flatMap((item) => {
            const call = z
              .object({
                type: z.literal('custom_tool_call'),
                name: z.string(),
                input: z.string(),
              })
              .safeParse(item);
            return call.success
              ? [{ name: call.data.name, input: call.data.input }]
              : [];
          })
        : [],
      reportedEngagement: readReportedEngagement(texts, links, new Date()),
    };
  }
}
