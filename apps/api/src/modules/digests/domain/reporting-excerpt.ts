// Older observations can retain headline-only Google News descriptions even
// after ingestion learns to omit them. Do not use those as edition evidence.
export function reportingExcerpt(item: {
  url: string;
  title: string;
  excerpt: string;
  publisher?: { name: string } | null;
}): string {
  const name = item.publisher?.name;
  if (!name || !item.title.endsWith(` - ${name}`)) return item.excerpt;
  try {
    const url = new URL(item.url);
    if (
      url.hostname === 'news.google.com' &&
      url.pathname.startsWith('/rss/articles/') &&
      item.excerpt === `${item.title.slice(0, -` - ${name}`.length)} ${name}`
    )
      return '';
  } catch {
    // URL eligibility remains the selection policy's responsibility.
  }
  return item.excerpt;
}
