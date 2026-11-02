import { z } from 'zod';

import { extractXLinks, type HttpPort } from '../../ingestion/public/discovery';
import type { PostVerificationPort, SocialPost } from '../domain/posts';

const responseSchema = z.object({
  type: z.literal('rich'),
  provider_name: z.enum(['Twitter', 'X']),
  provider_url: z.string().url(),
  author_name: z.string().min(1).max(500),
  author_url: z.string().url(),
  url: z.string().url(),
  html: z.string().min(1).max(100000),
});
export class XOfficialEmbed implements PostVerificationPort {
  constructor(private readonly http: HttpPort) {}
  async verify(
    externalId: string,
    discoveredUrl?: string,
  ): Promise<SocialPost> {
    if (!/^[1-9][0-9]{0,19}$/.test(externalId))
      throw new Error('Invalid X post ID');
    const url =
      discoveredUrl ?? `https://twitter.com/i/web/status/${externalId}`;
    if (extractXLinks(url)[0]?.externalId !== externalId)
      throw new Error('Invalid X verification URL');
    const query = new URLSearchParams({
      url,
      omit_script: 'true',
      dnt: 'true',
    });
    const response = responseSchema.parse(
      JSON.parse(
        await this.http.get(`https://publish.twitter.com/oembed?${query}`),
      ),
    );
    const author = new URL(response.author_url);
    if (
      !['twitter.com', 'x.com'].includes(author.hostname) ||
      author.protocol !== 'https:' ||
      author.username ||
      author.password ||
      author.port ||
      !/^\/[a-zA-Z0-9_]{1,15}\/?$/.test(author.pathname) ||
      !['https://twitter.com', 'https://x.com'].includes(
        response.provider_url.replace(/\/$/, ''),
      ) ||
      extractXLinks(response.url)[0]?.externalId !== externalId ||
      !extractXLinks(response.html).some(
        (link) => link.externalId === externalId,
      ) ||
      !response.html.includes('class="twitter-tweet"') ||
      /<\s*(script|iframe|object|embed)\b|\son\w+\s*=|javascript:/i.test(
        response.html,
      )
    )
      throw new Error('Invalid official X embed');
    // Store for provenance; UI must use widgets.createTweet(ID), never inject raw HTML.
    return {
      platform: 'x',
      externalId,
      url: `https://x.com/i/web/status/${externalId}`,
      author: response.author_name,
      authorUrl: response.author_url,
      publishedAt: null,
      metrics: {},
      embedHtml: response.html,
    };
  }
}
