import { usesTechEditorialContext } from './tech-editorial-context';

/** Bounded comparison context for topics with observed story/post repetition. */
export function socialStoryContext(
  topicName: string,
  stories: readonly { title: string; summary?: string | null }[],
): { title: string; summary: string }[] | undefined {
  if (
    !usesTechEditorialContext(topicName) &&
    topicName.trim().toLowerCase() !== 'nba' &&
    topicName.trim().toLowerCase() !== 'u.s. news & politics'
  ) {
    return undefined;
  }
  return stories.slice(0, 10).map(({ title, summary }) => ({
    title: title.slice(0, 300),
    summary: (summary ?? '').slice(0, 400),
  }));
}
