import { decodeHTML } from 'entities';

import { officialPostText } from './embed-text';

// This is textual duplicate detection, not same-event or media matching.
// Preserve symbols, numbers and link targets: equal captions can hide different
// clips, and punctuation can change a factual claim (+5% versus -5%).
export function postDuplicateKey(html: string): string {
  const text = officialPostText(html).normalize('NFKC').toLowerCase();
  const withoutRepost = text.replace(/^rt\s+@[a-z0-9_]{1,15}:\s*/i, '');
  // Only strip explicit repost attribution from substantial text. Short captions
  // are too ambiguous to treat as copied announcements.
  const caption =
    withoutRepost.split(/\s+/u).length >= 12 ? withoutRepost : text;
  const paragraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/i)?.[1] ?? '';
  const links = [...paragraph.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)]
    .map((match) => decodeHTML(match[2]))
    .sort();
  // Do not resolve shortened links or infer that two targets share media.
  return JSON.stringify([caption, [...new Set(links)]]);
}
