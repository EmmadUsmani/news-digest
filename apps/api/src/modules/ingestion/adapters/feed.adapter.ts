import { decodeHTML } from 'entities';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

import { canonicalUrl, plainText } from '../domain/normalize';
import type {
  ContentItem,
  HttpPort,
  Source,
  SourcePort,
} from '../domain/ports';
import { extractXLinks } from '../domain/x-links';
type Node = Record<string, unknown>;
const list = (v: unknown): Node[] =>
  (Array.isArray(v) ? v : v ? [v] : []) as Node[];
function text(v: unknown): string {
  return typeof v === 'object' && v
    ? decodeHTML(String((v as Node)['#text'] ?? ''))
    : decodeHTML(String(v ?? ''));
}
export function parseFeed(xml: string): ContentItem[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true)
    throw new Error('Invalid XML feed');
  const doc = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
  }).parse(xml);
  const entries = doc.rss?.channel?.item ?? doc.feed?.entry;
  if (!doc.rss && !doc.feed) throw new Error('Unsupported feed document');
  return list(entries)
    .slice(0, 60)
    .flatMap((entry) => {
      const links = list(entry.link);
      const link =
        typeof entry.link === 'string'
          ? entry.link
          : text(
              (links.find((l) => l['@_rel'] === 'alternate') ??
                links.find((l) => !l['@_rel']))?.['@_href'],
            );
      const url = canonicalUrl(link);
      const title = plainText(text(entry.title), 500);
      const date = new Date(
        text(entry.pubDate ?? entry.published ?? entry.updated),
      );
      if (!url || !title || !Number.isFinite(date.getTime())) return [];
      const media =
        list(entry['media:content'])[0] ?? list(entry['media:thumbnail'])[0];
      return [
        {
          url,
          title,
          excerpt: plainText(text(entry.description ?? entry.summary)),
          author:
            plainText(
              text(
                entry['dc:creator'] ??
                  (entry.author as Node)?.name ??
                  entry.author,
              ),
              200,
            ) || null,
          publishedAt: date.toISOString(),
          imageUrl: canonicalUrl(String(media?.['@_url'] ?? '')),
          engagement: {},
          xLinks: extractXLinks(
            [
              link,
              text(entry.description),
              text(entry.summary),
              text(entry['content:encoded']),
              text(entry.content),
            ].join(' '),
          ),
        },
      ];
    });
}
export class FeedAdapter implements SourcePort {
  constructor(private readonly http: HttpPort) {}
  async collect(source: Source) {
    return parseFeed(await this.http.get(source.url));
  }
}
