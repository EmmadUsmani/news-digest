// Offline content export only: read a saved reader API response, never regenerate.
import { readFileSync } from 'node:fs';

import { readerEditionSchema } from '@digest/contracts';

export function exportReaderReview(input: unknown): string {
  const edition = readerEditionSchema.parse(input);
  const lines = [
    `Saved reader edition: ${edition.id}`,
    `Published: ${edition.createdAt}`,
    `Window: ${edition.windowStart} to ${edition.windowEnd}`,
    'Text review only; linked pages, embeds and media have not been inspected.',
  ];
  for (const topic of edition.topics) {
    lines.push(
      '',
      `TOPIC: ${topic.name}`,
      `${topic.stories.length} stories; ${topic.posts.length} posts`,
      '',
      'BRIEF',
    );
    lines.push(...topic.brief.map((bullet) => `- ${bullet}`));
    if (!topic.brief.length) lines.push('(none saved)');
    for (const [index, story] of topic.stories.entries()) {
      lines.push(
        '',
        `STORY ${index + 1}: ${story.title}`,
        `ID: ${story.id}`,
        `Published: ${story.publishedAt}`,
        `Original: ${story.url}`,
        `Sources: ${story.sources.join(', ')}`,
        story.summary ?? '(no summary saved)',
      );
      for (const report of story.coverage ?? [])
        lines.push(`Coverage: ${JSON.stringify(report)}`);
    }
    if (!topic.stories.length) lines.push('', '(no stories saved)');
    for (const [index, post] of topic.posts.entries()) {
      lines.push(
        '',
        `POST ${index + 1}: ${post.platform} / ${post.author}`,
        `ID: ${post.externalId}`,
        `Published: ${post.publishedAt}`,
        `Original: ${post.url}`,
      );
      if (post.platform === 'reddit') lines.push(`Title: ${post.title}`);
      lines.push(`Saved original text:\n${post.text}`);
      if (post.displayText && post.displayText !== post.text)
        lines.push(`Saved display text:\n${post.displayText}`);
      lines.push(
        `Context: ${post.whyItMatters || '(none saved)'}`,
        `Saved engagement: ${JSON.stringify(post.metrics)}`,
      );
    }
    if (!topic.posts.length) lines.push('', '(no posts saved)');
  }
  return `${lines.join('\n')}\n`;
}

if (require.main === module) {
  const path = process.argv[2];
  if (!path)
    throw new Error(
      'Usage: pnpm exec tsx apps/api/scripts/export-reader-review.ts saved-reader.json',
    );
  process.stdout.write(
    exportReaderReview(JSON.parse(readFileSync(path, 'utf8'))),
  );
}
