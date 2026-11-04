import { z } from 'zod';

import { measuredFetch } from '../../../libs/observability/external-metrics';
import { logger } from '../../../libs/observability/logging';
import type { BlueskyPost, BlueskySearchPort } from '../domain/bluesky';
import { blueskyMedia } from './bluesky-media';

const sessionSchema = z.object({
  accessJwt: z.string().min(1),
  refreshJwt: z.string().min(1),
  did: z.string().startsWith('did:'),
  didDoc: z.object({
    service: z.array(z.object({ id: z.string(), serviceEndpoint: z.string() })),
  }),
});
const postSchema = z.object({
  uri: z
    .string()
    .regex(
      /^at:\/\/did:[a-z]+:[a-zA-Z0-9:._%-]+\/app\.bsky\.feed\.post\/[a-zA-Z0-9]+$/,
    ),
  author: z.object({ did: z.string(), handle: z.string().min(1) }),
  record: z.object({
    text: z.string().max(30000),
    createdAt: z.string().datetime(),
  }),
  embed: z.unknown().optional(),
  likeCount: z.number().int().nonnegative().default(0),
  repostCount: z.number().int().nonnegative().default(0),
  replyCount: z.number().int().nonnegative().default(0),
});

// An instance serializes all requests, including authentication, and honors
// Retry-After. Tokens remain in memory and are never included in errors.
export class BlueskySearch implements BlueskySearchPort {
  private session?: { accessJwt: string; refreshJwt: string; pds: string };
  private pending: Promise<unknown> = Promise.resolve();
  private next = 0;
  constructor(
    private readonly credentials: { handle: string; password: string },
    private readonly transport: typeof fetch = fetch,
    private readonly now: () => number = Date.now,
    private readonly wait: (ms: number) => Promise<void> = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms)),
    private readonly log = logger,
  ) {
    this.transport = measuredFetch('bluesky', transport);
  }

  search(query: string, since: Date, until: Date): Promise<BlueskyPost[]> {
    if (
      !query.trim() ||
      query.length > 500 ||
      !Number.isFinite(since.getTime()) ||
      !Number.isFinite(until.getTime()) ||
      since >= until
    )
      return Promise.reject(
        new Error('Invalid Bluesky search window or query'),
      );
    const result = this.pending
      .catch(() => {})
      .then(() => this.collect(query, since, until));
    this.pending = result;
    return result;
  }

  private async request(
    url: string,
    token?: string,
    body?: unknown,
    method: 'GET' | 'POST' = body ? 'POST' : 'GET',
  ) {
    await this.wait(Math.max(0, this.next - this.now()));
    this.next = this.now() + 1000;
    const started = performance.now();
    let status: number | undefined;
    let outcome = 'failure';
    const operation = url.endsWith('/com.atproto.server.createSession')
      ? 'login'
      : url.endsWith('/com.atproto.server.refreshSession')
        ? 'refresh'
        : 'search';
    try {
      const response = await this.transport(url, {
        method,
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
        headers: {
          'User-Agent': 'NewsDigest/1.0 (personal feed reader)',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      status = response.status;
      if (!response.ok) {
        const retry = response.headers.get('retry-after') ?? '';
        const delay = /^\d+$/.test(retry)
          ? Number(retry) * 1000
          : Date.parse(retry) - this.now();
        if (response.status === 429 || response.status >= 500)
          this.next =
            this.now() + Math.max(60000, Number.isFinite(delay) ? delay : 0);
        // AT Protocol reports expired access JWTs as HTTP 400, not only 401.
        // Read a bounded error code; never retain or log provider messages.
        let expiredToken = false;
        const reader = response.body?.getReader();
        if (reader) {
          const chunks: Uint8Array[] = [];
          let size = 0;
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) {
                try {
                  const data: unknown = JSON.parse(
                    Buffer.concat(chunks).toString('utf8'),
                  );
                  expiredToken = z
                    .object({ error: z.literal('ExpiredToken') })
                    .safeParse(data).success;
                } catch {
                  // Non-JSON errors remain ordinary HTTP failures.
                }
                break;
              }
              size += value.length;
              if (size > 4096) break;
              chunks.push(value);
            }
          } finally {
            await reader.cancel();
          }
        }
        return { status: response.status, data: null, expiredToken };
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Empty Bluesky response');
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 2_000_000)
            throw new Error('Bluesky response exceeds 2 MB');
          chunks.push(value);
        }
      } finally {
        await reader.cancel();
      }
      const data = JSON.parse(
        Buffer.concat(chunks).toString('utf8'),
      ) as unknown;
      outcome = 'success';
      return { status: response.status, data };
    } finally {
      this.log.info(
        {
          event: 'external.call',
          target: 'bluesky',
          operation,
          status,
          outcome,
          durationMs: Math.round(performance.now() - started),
        },
        'Bluesky attempt',
      );
    }
  }

  private async authenticate(refresh = false) {
    // refreshSession is a bodyless POST; hosted PDS rejects even JSON {}.
    const response =
      refresh && this.session
        ? await this.request(
            `${this.session.pds}/xrpc/com.atproto.server.refreshSession`,
            this.session.refreshJwt,
            undefined,
            'POST',
          )
        : await this.request(
            'https://bsky.social/xrpc/com.atproto.server.createSession',
            undefined,
            {
              identifier: this.credentials.handle,
              password: this.credentials.password,
            },
          );
    if (response.status !== 200) {
      // A rejected refresh must not poison every later hourly collection.
      // Let this attempt fail; the next collection authenticates from scratch.
      if (refresh) this.session = undefined;
      throw new Error(`Bluesky authentication HTTP ${response.status}`);
    }
    const parsed = sessionSchema.safeParse(response.data);
    if (!parsed.success) throw new Error('Invalid Bluesky session');
    const endpoint = parsed.data.didDoc.service.find(
      (service) =>
        service.id === '#atproto_pds' ||
        service.id === `${parsed.data.did}#atproto_pds`,
    )?.serviceEndpoint;
    // Credentials are sent only to the official hosted PDS family, never to
    // arbitrary service URLs supplied in a session document.
    if (!endpoint) throw new Error('Missing Bluesky PDS');
    const pds = new URL(endpoint);
    if (
      pds.protocol !== 'https:' ||
      pds.username ||
      pds.password ||
      pds.port ||
      pds.pathname !== '/' ||
      pds.search ||
      pds.hash ||
      !(
        pds.hostname === 'bsky.social' ||
        pds.hostname.endsWith('.host.bsky.network')
      )
    )
      throw new Error('Unsupported Bluesky PDS');
    this.session = {
      accessJwt: parsed.data.accessJwt,
      refreshJwt: parsed.data.refreshJwt,
      pds: pds.origin,
    };
  }

  private async collect(query: string, since: Date, until: Date) {
    if (!this.session) await this.authenticate();
    const posts = new Map<string, BlueskyPost>();
    let cursor: string | undefined;
    let refreshed = false;
    for (let page = 0; page < 2; page++) {
      const url = new URL(
        `${this.session!.pds}/xrpc/app.bsky.feed.searchPosts`,
      );
      url.search = new URLSearchParams({
        q: query,
        sort: 'top',
        since: since.toISOString(),
        until: until.toISOString(),
        limit: '25',
        ...(cursor ? { cursor } : {}),
      }).toString();
      let response = await this.request(
        url.toString(),
        this.session!.accessJwt,
      );
      if (
        !refreshed &&
        (response.status === 401 ||
          (response.status === 400 && response.expiredToken))
      ) {
        await this.authenticate(true);
        refreshed = true;
        url.host = new URL(this.session!.pds).host;
        response = await this.request(url.toString(), this.session!.accessJwt);
      }
      if (response.status !== 200)
        throw new Error(`Bluesky search HTTP ${response.status}`);
      const parsed = z
        .object({
          posts: z.array(z.unknown()).max(25),
          cursor: z.string().max(4000).optional(),
        })
        .safeParse(response.data);
      if (!parsed.success) throw new Error('Invalid Bluesky search response');
      for (const item of parsed.data.posts) {
        const result = postSchema.safeParse(item);
        if (!result.success) continue;
        const p = result.data;
        const time = new Date(p.record.createdAt);
        if (
          time < since ||
          time >= until ||
          !p.uri.startsWith(`at://${p.author.did}/`)
        )
          continue;
        const key = p.uri.split('/').at(-1)!;
        posts.set(p.uri, {
          platform: 'bluesky',
          externalId: p.uri,
          url: `https://bsky.app/profile/${encodeURIComponent(p.author.did)}/post/${key}`,
          author: p.author.handle,
          text: p.record.text,
          publishedAt: time.toISOString(),
          observedAt: new Date(this.now()).toISOString(),
          media: blueskyMedia(p.embed),
          metrics: {
            likes: p.likeCount,
            reposts: p.repostCount,
            replies: p.replyCount,
          },
        });
      }
      if (!parsed.data.cursor || parsed.data.cursor === cursor) break;
      cursor = parsed.data.cursor;
    }
    return [...posts.values()];
  }
}
