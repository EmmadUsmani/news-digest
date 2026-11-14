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
function excerpt(value: unknown): string {
  // This feed ad arrives without script tags. Only remove the known empty
  // widget plus its terminal configuration; preserve reporting around code.
  const body = text(value).replace(
    /<div\s+id=["']hype-desk-root["']\s*>\s*<\/div>\s*window\.HYPE_DESK_CONFIG\s*=\s*\{[^<>]*\};\s*$/,
    '',
  );
  // Inline formatting contributes no spacing; block tags still separate text.
  const reporting = body.replace(
    /<\/?(?:a|abbr|b|bdi|bdo|cite|code|del|em|i|ins|kbd|mark|q|s|samp|small|span|strong|sub|sup|time|u|var|wbr)\b[^>]*>/gi,
    '',
  );
  const normalized = plainText(reporting, Number.MAX_SAFE_INTEGER);
  if (normalized.length <= 1500) return normalized;
  let prefix = normalized.slice(0, 1499).replace(/[\uD800-\uDBFF]$/, '');
  if (/\S$/.test(prefix) && /\S/.test(normalized[prefix.length])) {
    const boundary = prefix.search(/\s+\S*$/);
    if (boundary > 0) prefix = prefix.slice(0, boundary);
  }
  return prefix.trimEnd() + '…';
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
      // RSS source is publisher evidence; Atom source describes the origin feed.
      // Neither title suffixes nor destination hosts establish a publisher.
      const publisherName = doc.rss ? plainText(text(entry.source), 200) : '';
      const publisherUrl = canonicalUrl(
        String((entry.source as Node)?.['@_url'] ?? ''),
      );
      return [
        {
          url,
          title,
          excerpt:
            [
              entry['content:encoded'],
              entry.content,
              entry.description,
              entry.summary,
            ]
              .map(excerpt)
              .find(Boolean) ?? '',
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
          ...(publisherName
            ? { publisher: { name: publisherName, url: publisherUrl } }
            : {}),
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
