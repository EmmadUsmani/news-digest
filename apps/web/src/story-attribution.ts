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
