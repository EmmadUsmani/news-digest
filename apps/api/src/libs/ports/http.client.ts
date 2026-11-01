import type { HttpPort } from '../../modules/ingestion/domain/ports';
// One worker uses this shared client. Domains are serialized with a one-second floor.
export class SharedHttpClient implements HttpPort {
 private readonly next = new Map<string, number>();
 private readonly cache = new Map<string, { until: number; body: string }>();
 private readonly locks = new Map<string, Promise<unknown>>();
 async get(url: string): Promise<string> {
 const host = new URL(url).host;
 const previous = this.locks.get(host) ?? Promise.resolve();
 const request = previous.catch(() => {}).then(() => this.fetch(url, host));
 this.locks.set(host, request);
 return request;
 }
 private async fetch(url: string, host: string): Promise<string> {
 const cached = this.cache.get(url);
 if (cached && cached.until > Date.now()) return cached.body;
 await new Promise(resolve => setTimeout(resolve, Math.max(0, (this.next.get(host) ?? 0) - Date.now())));
 this.next.set(host, Date.now() + 1000);
 const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'NewsDigest/1.0 (personal feed reader)' } });
 if (!response.ok) {
 const retry = response.headers.get('retry-after');
 const seconds = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry ?? '') - Date.now();
 this.next.set(host, Date.now() + Math.max(60000, Number.isFinite(seconds) ? seconds : 0));
 throw new Error(`HTTP ${response.status}`);
 }
 const reader = response.body?.getReader();
 if (!reader) throw new Error('Empty response');
 const chunks: Uint8Array[] = []; let size = 0;
 while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 2_000_000) { await reader.cancel(); throw new Error('Response exceeds 2 MB'); } chunks.push(value); }
 const body = Buffer.concat(chunks).toString('utf8');
 if (!body.trim()) throw new Error('Empty response');
 if (this.cache.size > 250) this.cache.clear();
 this.cache.set(url, { until: Date.now() + 300000, body });
 return body;
 }
}
