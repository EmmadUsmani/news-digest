import type { ReaderEdition } from '@digest/contracts';

export function primaryStoryAttribution(
  story: ReaderEdition['topics'][number]['stories'][number],
) {
  const report =
    story.coverage?.find((article) => article.url === story.url) ?? story;
  return report.publisher?.name ?? report.sources.join(', ');
}
