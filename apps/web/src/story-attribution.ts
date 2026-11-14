import type { ReaderEdition } from '@digest/contracts';

export function primaryStoryAttribution(
  story: ReaderEdition['topics'][number]['stories'][number],
) {
  const report =
    story.coverage?.find((article) => article.url === story.url) ?? story;
  if (report.publisher) return report.publisher.name;
  return report.sources
    .map((name) =>
      name === 'Hacker News' || name.startsWith('Google News:')
        ? `${new URL(report.url).hostname.replace(/^www\./, '')} · via ${name}`
        : name,
    )
    .join(', ');
}

export function savedStoryAttribution(attribution: string, url: string) {
  if (attribution !== 'Hacker News' && !attribution.startsWith('Google News:'))
    return attribution;
  // Older bookmarks contain only the discovery feed. Keep their snapshots intact.
  if (attribution.includes(' · via ') || attribution.includes(', '))
    return attribution;
  return `${new URL(url).hostname.replace(/^www\./, '')} · via ${attribution}`;
}
