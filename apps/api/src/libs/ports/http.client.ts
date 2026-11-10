import { lookup } from 'node:dns';
import { request } from 'node:https';
import { brotliDecompressSync, gunzipSync, inflateSync } from 'node:zlib';

import type { HttpPort } from '../../modules/ingestion/domain/ports';
import { recordExternalAttempt } from '../observability/external-metrics';
import { logger } from '../observability/logging';
import { publicAddress, publicFeedUrl } from './public-url';
const maxResponseBytes = 3_000_000;

// One worker uses this shared client. Domains are serialized with a one-second floor.
export class SharedHttpClient implements HttpPort {
  constructor(private readonly log = logger) {}
  private readonly next = new Map<string, number>();
  private readonly cache = new Map<string, { until: number; body: string }>();
  private readonly locks = new Map<string, Promise<unknown>>();
  async get(url: string, redirects = 0): Promise<string> {
    url = publicFeedUrl(url);
    const host = new URL(url).host;
    const previous = this.locks.get(host) ?? Promise.resolve();
    const request = previous.catch(() => {}).then(() => this.fetch(url, host));
    this.locks.set(host, request);
    const result = await request;
    if (typeof result === 'string') return result;
    if (redirects >= 4) throw new Error('Invalid feed redirect');
    return this.get(result.redirect, redirects + 1);
  }
  private async fetch(
    url: string,
    host: string,
  ): Promise<string | { redirect: string }> {
    const cached = this.cache.get(url);
    if (cached && cached.until > Date.now()) return cached.body;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.max(0, (this.next.get(host) ?? 0) - Date.now())),
    );
    this.next.set(host, Date.now() + 1000);
    const target =
      host === 'hacker-news.firebaseio.com'
        ? 'hacker-news'
        : host === 'publish.twitter.com' && new URL(url).pathname === '/oembed'
          ? 'x-oembed'
          : 'feed';
    const started = performance.now();
    let status: number | undefined;
    try {
      const result = await this.fetchNetwork(url, host, (value) => {
        status = value;
      });
      recordExternalAttempt(
        target,
        status,
        typeof result === 'string' ? 'success' : 'redirect',
        (performance.now() - started) / 1000,
      );
      this.log.info(
        {
          event: 'external.call',
          target,
          status,
          outcome: typeof result === 'string' ? 'success' : 'redirect',
          durationMs: Math.round(performance.now() - started),
        },
        'External HTTP call',
      );
      return result;
    } catch (error) {
      recordExternalAttempt(
        target,
        status,
        'failure',
        (performance.now() - started) / 1000,
      );
      // Provider URLs and errors may include arbitrary credentials or response text.
      this.log.warn(
        {
          event: 'external.call',
          target,
          status,
          outcome: 'failure',
          durationMs: Math.round(performance.now() - started),
          errorType: error instanceof Error ? error.name : 'UnknownError',
        },
        'External HTTP call',
      );
      throw error;
    }
  }
  private async fetchNetwork(
    url: string,
    host: string,
    received: (status: number) => void,
  ): Promise<string | { redirect: string }> {
    const response = await new Promise<import('node:http').IncomingMessage>(
      (resolve, reject) => {
        const req = request(
          url,
          {
            signal: AbortSignal.timeout(20000),
            headers: { 'User-Agent': 'NewsDigest/1.0 (personal feed reader)' },
            // Validate and pin the resolved address in the actual socket lookup (including redirects).
            lookup(hostname, options, callback) {
              lookup(hostname, { all: true }, (error, addresses) => {
                if (error) {
                  callback(error, '', 4);
                  return;
                }
                if (
                  !addresses.length ||
                  addresses.some((a) => !publicAddress(a.address))
                ) {
                  callback(new Error('Feed address is not public'), '', 4);
                  return;
                }
                if (options.all) callback(null, addresses);
                else callback(null, addresses[0].address, addresses[0].family);
              });
            },
          },
          resolve,
        );
        req.on('error', reject);
        req.end();
      },
    );
    const status = response.statusCode ?? 0;
    received(status);
    if ([301, 302, 303, 307, 308].includes(status)) {
      response.destroy();
      if (!response.headers.location) throw new Error('Invalid feed redirect');
      const next = publicFeedUrl(
        new URL(response.headers.location, url).toString(),
      );
      return { redirect: next };
    }
    if (status < 200 || status >= 300) {
      response.destroy();
      const retry = response.headers['retry-after'];
      const seconds =
        retry && /^\d+$/.test(retry)
          ? Number(retry) * 1000
          : Date.parse(retry ?? '') - Date.now();
      this.next.set(
        host,
        Date.now() + Math.max(60000, Number.isFinite(seconds) ? seconds : 0),
      );
      throw new Error(`HTTP ${status}`);
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of response) {
      size += chunk.length;
      if (size > maxResponseBytes) {
        response.destroy();
        throw new Error('Response exceeds 3 MB');
      }
      chunks.push(chunk);
    }
    const payload = Buffer.concat(chunks);
    const encoding = String(response.headers['content-encoding'] ?? 'identity')
      .trim()
      .toLowerCase();
    const decode = {
      gzip: gunzipSync,
      deflate: inflateSync,
      br: brotliDecompressSync,
    }[encoding];
    if (!decode && encoding !== 'identity')
      throw new Error('Unsupported response encoding');
    const body = (
      decode ? decode(payload, { maxOutputLength: maxResponseBytes }) : payload
    ).toString('utf8');
    if (!body.trim()) throw new Error('Empty response');
    if (this.cache.size > 250) this.cache.clear();
    this.cache.set(url, { until: Date.now() + 300000, body });
    return body;
  }
}
