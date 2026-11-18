import { parse } from 'parse5';

import { plainText } from '../domain/normalize';

/** A page's own summary is evidence when its body has no supported prose. */
export function publisherDescription(html: string): string {
  const document = parse(html);
  const root = document.childNodes.find((node) => node.nodeName === 'html');
  if (!root || !('childNodes' in root)) return '';
  const head = root.childNodes.find((node) => node.nodeName === 'head');
  if (!head || !('childNodes' in head)) return '';
  // Read only document metadata, never descriptions inside widgets or scripts.
  const descriptions = new Map<string, string>();
  for (const node of head.childNodes) {
    if (node.nodeName !== 'meta' || !('attrs' in node)) continue;
    const attr = (name: string) =>
      node.attrs.find((entry) => entry.name === name)?.value;
    const key = (attr('name') ?? attr('property') ?? '').toLowerCase();
    const text = plainText(attr('content') ?? '');
    if (text.length >= 60 && !/^https?:\/\/\S+$/i.test(text)) {
      if (!descriptions.has(key)) descriptions.set(key, text);
    }
  }
  for (const key of ['description', 'og:description', 'twitter:description']) {
    const text = descriptions.get(key);
    if (text) return text;
  }
  return '';
}
