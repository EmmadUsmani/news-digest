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
function mediaImage(entry: Node, articleUrl: string): string | null {
  const images = list(entry['media:content']);
  const first = images[0] ?? list(entry['media:thumbnail'])[0];
  const original = canonicalUrl(String(first?.['@_url'] ?? ''));
  if (!original || new URL(articleUrl).hostname !== 'www.theguardian.com')
    return original;
  const lead = new URL(original);
  if (lead.protocol !== 'https:' || lead.hostname !== 'i.guim.co.uk')
    return original;
  // Guardian supplies several sizes of the same photo. Keep the publisher's
  // signed URL intact and do not substitute a different photo or media host.
  let selected = original;
  let width = Number(first?.['@_width']) || 0;
  for (const image of images) {
    const url = canonicalUrl(String(image['@_url'] ?? ''));
    if (!url) continue;
    const candidate = new URL(url);
    const candidateWidth = Number(image['@_width']);
    if (
      candidate.protocol === 'https:' &&
      candidate.hostname === lead.hostname &&
      candidate.pathname === lead.pathname &&
      Number.isFinite(candidateWidth) &&
      candidateWidth > width &&
      Number(candidate.searchParams.get('width')) === candidateWidth
    ) {
      selected = url;
      width = candidateWidth;
    }
  }
  return selected;
}
function leadFigureImage(value: unknown): string | null {
  // Only the opening figure establishes a lead image. Later inline images may
  // be products, advertisements or tracking pixels.
  const figure = text(value).match(/^\s*<figure\b[^>]*>\s*(<img\b[^>]*>)/i);
  const src = figure?.[1].match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
  return canonicalUrl(src?.[2] ?? '');
}
function enclosureImage(value: unknown): string | null {
  for (const enclosure of list(value)) {
    if (
      !/^image\/(?:jpeg|png|gif|webp|avif)$/i.test(
        String(enclosure['@_type'] ?? ''),
      )
    )
      continue;
    const url = canonicalUrl(String(enclosure['@_url'] ?? ''));
    if (url && new URL(url).protocol === 'https:') return url;
  }
  return null;
}
function gematsuDescriptionImage(
  value: unknown,
  articleUrl: string,
): string | null {
  if (new URL(articleUrl).hostname !== 'www.gematsu.com') return null;
  const opening = text(value).match(/^\s*<img\b[^>]*>/i);
  const src = opening?.[0].match(/\ssrc\s*=\s*(["'])(.*?)\1/i);
  const image = canonicalUrl(src?.[2] ?? '');
  if (!image) return null;
  const parsed = new URL(image);
  return parsed.protocol === 'https:' &&
    parsed.hostname === 'www.gematsu.com' &&
    parsed.pathname.startsWith('/wp-content/uploads/')
    ? image
    : null;
}
function excerpt(value: unknown, articleUrl: string): string {
  // This feed ad arrives without script tags. Only remove the known empty
  // widget plus its terminal configuration; preserve reporting around code.
  let body = text(value)
    // GameSpot's feed includes its in-page table of contents before reporting.
    // Keep article headings/lists; only this named navigation is redundant.
    .replace(
      /<nav\b[^>]*\bclass\s*=\s*(["'])wp-block-gamespot-blocks-toc\1[^>]*>[\s\S]*?<\/nav\s*>/gi,
      ' ',
    )
    // Destructoid syndicates this Yoast contents block before its article.
    .replace(
      /<div\b[^>]*\bclass\s*=\s*(["'])wp-block-yoast-seo-table-of-contents yoast-table-of-contents\1[^>]*>\s*<h2\b[^>]*>Table of contents<\/h2>\s*<ul>[\s\S]*?<\/ul>\s*<\/div>/gi,
      ' ',
    )
    // These recorded image credits add no reporting, including mid-article.
    // Descriptive captions and ordinary article text remain evidence.
    .replace(
      /<figcaption\b[^>]*>\s*Screenshot(?: and remix)? by Destructoid\s*<\/figcaption\s*>/gi,
      ' ',
    )
    // An opening image caption describes the photo, not the article event.
    // Require the image/caption-only figure so other reporting stays intact.
    .replace(
      /^\s*<figure\b[^>]*>\s*<img\b[^>]*>\s*<figcaption\b[^>]*>[\s\S]*?<\/figcaption>\s*<\/figure>/i,
      '',
    )
    .replace(
      /<div\s+id=["']hype-desk-root["']\s*>\s*<\/div>\s*window\.HYPE_DESK_CONFIG\s*=\s*\{[^<>]*\};\s*$/,
      '',
    );
  // The Verge repeats prices in a purchase widget, where struck-out prices
  // lose their meaning in plain text. Keep prices and details in reporting.
  if (new URL(articleUrl).hostname === 'www.theverge.com') {
    body = body.replace(
      /<div\b[^>]*\bclass\s*=\s*(["'])product-block\1[^>]*>\s*<h3>[^<]*<\/h3>\s*<figure\b[^>]*>\s*<img\b[^>]*>\s*<\/figure>\s*<h3>Where to Buy:<\/h3>\s*<ul>(?:(?!<\/?div\b)[\s\S])*?<\/ul>\s*<\/div>/gi,
      ' ',
    );
  }
  // A publisher link back to this article is navigation, not reporting.
  let withoutSelfLink = body.replace(
    /<p\b[^>]*>\s*<a\b([^>]*)>\s*Source\s*<\/a>\s*<\/p>\s*$/i,
    (footer, attributes: string) => {
      const href = attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i);
      return canonicalUrl(href?.[2] ?? '') === articleUrl ? '' : footer;
    },
  );
  // These publishers syndicate teasers followed by self-links, not more reporting.
  // Keep an omission marker so source continuation remains available to readers.
  let teaserClipped = false;
  // Guardian teasers end with navigation back to the same article.
  if (new URL(articleUrl).hostname === 'www.theguardian.com') {
    withoutSelfLink = withoutSelfLink.replace(
      /<a\b([^>]*)>Continue reading\.\.\.<\/a>\s*$/i,
      (footer, attributes: string) => {
        const href = attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i);
        if (canonicalUrl(href?.[2] ?? '') !== articleUrl) return footer;
        teaserClipped = true;
        return '';
      },
    );
  }
  // Ars supplies a reporting fragment followed by article/comments navigation.
  // Both links must identify this article; ordinary reporting stays intact.
  if (new URL(articleUrl).hostname === 'arstechnica.com') {
    withoutSelfLink = withoutSelfLink.replace(
      /<p\b[^>]*>\s*<a\b([^>]*)>Read full article<\/a>\s*<\/p>\s*<p\b[^>]*>\s*<a\b([^>]*)>Comments<\/a>\s*<\/p>\s*$/i,
      (footer, articleAttributes: string, commentAttributes: string) => {
        const href = (attributes: string) =>
          attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2] ?? '';
        const article = href(articleAttributes);
        const comments = href(commentAttributes);
        if (
          canonicalUrl(article) !== articleUrl ||
          canonicalUrl(comments) !== articleUrl ||
          !comments.endsWith('#comments')
        )
          return footer;
        teaserClipped = true;
        return '';
      },
    );
  }
  const withoutTeaserFooter = withoutSelfLink.replace(
    /<p\b[^>]*>\s*Read the\s+<a\b([^>]*)>full article on (pushsquare\.com|nintendolife\.com)<\/a>\s*<\/p>\s*$/i,
    (footer, attributes: string, publisher: string) => {
      const href = attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i);
      if (
        new URL(articleUrl).hostname !== `www.${publisher}` ||
        canonicalUrl(href?.[2] ?? '') !== articleUrl
      )
        return footer;
      teaserClipped = true;
      return '';
    },
  );
  // WordPress syndication footers repeat the headline and publisher, not facts.
  const withoutPostFooter = withoutTeaserFooter.replace(
    /<p\b[^>]*>\s*The post\s+<a\b([^>]*)>[^<]*<\/a>\s+appeared first on\s+<a\b[^>]*>[^<]*<\/a>\.\s*<\/p>\s*$/i,
    (footer, attributes: string) => {
      const href = attributes.match(/\shref\s*=\s*(["'])(.*?)\1/i);
      return canonicalUrl(href?.[2] ?? '') === articleUrl ? '' : footer;
    },
  );
  // Inline formatting contributes no spacing; block tags still separate text.
  const reporting = withoutPostFooter.replace(
    /<\/?(?:a|abbr|b|bdi|bdo|cite|code|del|em|i|ins|kbd|mark|q|s|samp|small|span|strong|sub|sup|time|u|var|wbr)\b[^>]*>/gi,
    '',
  );
  let normalized = plainText(reporting, Number.MAX_SAFE_INTEGER);
  // PlayStation's podcast RSS opens with subscription navigation, not reporting.
  // Limit this exact leading promotion to the publisher that syndicates it.
  if (new URL(articleUrl).hostname === 'blog.playstation.com') {
    normalized = normalized.replace(
      /^Email us at PSPodcast@sony\.com! Subscribe via Apple Podcasts, Spotify, or download here\s+/,
      '',
    );
  }
  if (teaserClipped && normalized && !/(?:…|\.{3})$/.test(normalized))
    normalized += '…';
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
      // RSS source is publisher evidence; Atom source describes the origin feed.
      // Neither title suffixes nor destination hosts establish a publisher.
      const publisherName = doc.rss ? plainText(text(entry.source), 200) : '';
      const publisherUrl = canonicalUrl(
        String((entry.source as Node)?.['@_url'] ?? ''),
      );
      const parsedUrl = new URL(url);
      const headlineOnlyDescription =
        parsedUrl.hostname === 'news.google.com' &&
        parsedUrl.pathname.startsWith('/rss/articles/') &&
        publisherName &&
        title.endsWith(` - ${publisherName}`)
          ? `${title.slice(0, -` - ${publisherName}`.length)} ${publisherName}`
          : null;
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
              .map((value) => {
                const reporting = excerpt(value, url);
                // Google News descriptions can repeat only the linked headline
                // and publisher. They supply no reporting beyond the title.
                if (reporting === headlineOnlyDescription) return '';
                return reporting;
              })
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
          imageUrl:
            mediaImage(entry, url) ??
            leadFigureImage(entry['content:encoded']) ??
            leadFigureImage(entry.content) ??
            gematsuDescriptionImage(entry.description, url) ??
            enclosureImage(entry.enclosure),
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
