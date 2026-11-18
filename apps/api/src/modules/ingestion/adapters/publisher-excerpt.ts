import { decodeHTML } from 'entities';

import { plainText } from '../domain/normalize';

/** Use publisher reporting sections; never navigation, scripts or HN comments. */
export function publisherExcerpt(html: string): string {
  const clean = html.replace(
    /<(script|style|nav|aside|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
  const article = /<article\b[^>]*>([\s\S]*?)<\/article\s*>/i.exec(clean)?.[1];
  const main = /<main\b[^>]*>([\s\S]*?)<\/main\s*>/i.exec(clean)?.[1];
  // Some publisher blogs use main instead of article. Require their page
  // heading and take only the reporting after it, excluding opening chrome.
  const reporting =
    article ??
    (main && /<h1\b[^>]*>[\s\S]*?<\/h1\s*>([\s\S]*)/i.exec(main)?.[1]);
  if (!reporting) return '';
  const paragraphs = [...reporting.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)]
    .map((match) => plainText(decodeHTML(match[1])))
    .filter((text) => text.length >= 60 && !/^https?:\/\/\S+$/i.test(text));
  return plainText(paragraphs.join(' '));
}
