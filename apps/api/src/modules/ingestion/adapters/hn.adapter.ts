import { decodeHTML } from 'entities';
import type { ContentItem, HttpPort, Source, SourcePort } from '../domain/ports';
import { canonicalUrl, plainText } from '../domain/normalize';
export class HackerNewsAdapter implements SourcePort {
 constructor(private readonly http: HttpPort) {}
 async collect(source: Source): Promise<ContentItem[]> {
 const ids: unknown = JSON.parse(await this.http.get(source.url));
 if (!Array.isArray(ids)) throw new Error('Invalid Hacker News list');
 const items: ContentItem[] = [];
 for (const id of ids.slice(0, 20)) {
 if (!Number.isSafeInteger(id)) continue;
 const item = JSON.parse(await this.http.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));
 if (!item || item.deleted || item.dead || item.type !== 'story') continue;
 const url = canonicalUrl(item.url ?? `https://news.ycombinator.com/item?id=${id}`);
 if (!url || !item.title || !Number.isFinite(item.time)) continue;
 items.push({ url, title: plainText(decodeHTML(String(item.title)), 500), excerpt: plainText(decodeHTML(String(item.text ?? ''))), author: item.by ?? null, publishedAt: new Date(item.time * 1000).toISOString(), imageUrl: null, engagement: { points: Number(item.score) || 0, comments: Number(item.descendants) || 0 } });
 }
 return items;
 }
}
