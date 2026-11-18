import { decodeHTML } from 'entities';

import { plainText } from '../domain/normalize';

/** Use publisher article paragraphs only; never navigation, scripts or HN comments. */
export function publisherExcerpt(html: string): string {
  const clean = html.replace(
    /<(script|style|nav|aside|header|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    '',
  );
  const article = /<article\b[^>]*>([\s\S]*?)<\/article\s*>/i.exec(clean)?.[1];
  if (!article) return '';
  const paragraphs = [...article.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)]
    .map((match) => plainText(decodeHTML(match[1])))
    .filter((text) => text.length >= 60);
  return plainText(paragraphs.join(' '));
}
