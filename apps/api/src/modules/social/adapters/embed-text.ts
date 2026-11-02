import { decodeHTML } from 'entities';

// Only the post paragraph is evidence. Author/footer/attributes and link targets
// must never make an unrelated post eligible. Raw HTML is never rendered.
export function officialPostText(html: string): string {
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p\s*>/gi)];
  if (paragraphs.length !== 1) return '';
  return decodeHTML(
    paragraphs[0][1].replace(/<br\s*\/?\s*>/gi, ' ').replace(/<[^>]*>/g, ' '),
  )
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20000);
}
