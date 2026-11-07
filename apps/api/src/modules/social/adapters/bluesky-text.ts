import { z } from 'zod';

const facetSchema = z.object({
  index: z.object({
    byteStart: z.number().int().nonnegative(),
    byteEnd: z.number().int().positive(),
  }),
  features: z.array(z.unknown()).max(100),
});
const linkSchema = z.object({
  $type: z.literal('app.bsky.richtext.facet#link'),
  uri: z
    .string()
    .url()
    .max(4000)
    .regex(/^https?:\/\/[^\s<>]+$/i),
});

// Facet offsets count UTF-8 bytes, not JavaScript characters. Keep record.text
// intact; this separate display copy recovers official shortened link targets.
export function blueskyDisplayText(text: string, facets: unknown): string {
  if (!Array.isArray(facets) || facets.length > 100) return text;
  const bytes = Buffer.from(text, 'utf8');
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const links = facets.flatMap((facet) => {
    const parsed = facetSchema.safeParse(facet);
    if (!parsed.success) return [];
    const { byteStart, byteEnd } = parsed.data.index;
    if (byteStart >= byteEnd || byteEnd > bytes.length) return [];
    const targets = parsed.data.features.flatMap((feature) => {
      const link = linkSchema.safeParse(feature);
      return link.success ? [link.data.uri] : [];
    });
    if (targets.length !== 1) return [];
    try {
      decoder.decode(bytes.subarray(0, byteStart));
      const label = decoder.decode(bytes.subarray(byteStart, byteEnd));
      const uri = targets[0];
      const prefix = label.replace(/(?:…|\.{3})$/, '');
      const replacement =
        (/^https?:\/\//i.test(prefix) && uri.startsWith(prefix)) ||
        (prefix.includes('.') &&
          uri.replace(/^https?:\/\//i, '').startsWith(prefix))
          ? uri
          : `${label} (${uri})`;
      return [{ byteStart, byteEnd, replacement }];
    } catch {
      return [];
    }
  });
  links.sort((a, b) => a.byteStart - b.byteStart);
  let end = 0;
  let display = '';
  for (const link of links) {
    if (link.byteStart < end) continue;
    display +=
      bytes.subarray(end, link.byteStart).toString('utf8') + link.replacement;
    end = link.byteEnd;
  }
  display += bytes.subarray(end).toString('utf8');
  return display.length <= 20000 ? display : text;
}
