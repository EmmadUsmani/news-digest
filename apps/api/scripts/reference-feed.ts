import { decodeHTML } from 'entities';
import { XMLParser } from 'fast-xml-parser';

import { parseFeed } from '../src/modules/ingestion/adapters/feed.adapter';
import { canonicalUrl } from '../src/modules/ingestion/domain/normalize';

// Publisher identity from the aggregator's headline link, never its image,
// publisher home page, related coverage or an inferred title match.
export function parseReferenceFeed(xml: string, feedUrl: string) {
  const items = parseFeed(xml); // Validates XML before the supplemental parse.
  if (feedUrl !== 'https://www.techmeme.com/feed.xml') return items;
  const doc = new XMLParser({ ignoreAttributes: false }).parse(xml);
  const entries = doc.rss?.channel?.item ?? [];
  const publisherLinks = new Map<string, string>();
  for (const entry of Array.isArray(entries) ? entries : [entries]) {
    const wrapper = canonicalUrl(String(entry.link ?? ''));
    const headline = String(entry.description ?? '').match(
      /<b\b[^>]*>\s*<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/i,
    );
    const publisher = headline ? canonicalUrl(decodeHTML(headline[1])) : null;
    if (
      wrapper &&
      new URL(wrapper).hostname === 'www.techmeme.com' &&
      publisher &&
      !/(^|\.)techmeme\.com$/i.test(new URL(publisher).hostname)
    )
      publisherLinks.set(wrapper, publisher);
  }
  return items.map((item) => {
    const publisherUrl = publisherLinks.get(item.url);
    return publisherUrl ? { ...item, publisherUrl } : item;
  });
}
