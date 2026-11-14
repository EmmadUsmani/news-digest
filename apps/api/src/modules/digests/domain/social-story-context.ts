import { usesTechEditorialContext } from './tech-editorial-context';

/** NBA joins the bounded social-context rollout after scheduled AI acceptance. */
export function socialStoryContext(
  topicName: string,
  stories: readonly { title: string; summary?: string | null }[],
): { title: string; summary: string }[] | undefined {
  if (
    !usesTechEditorialContext(topicName) &&
    topicName.trim().toLowerCase() !== 'nba'
  ) {
    return undefined;
  }
  return stories.slice(0, 10).map(({ title, summary }) => ({
    title: title.slice(0, 300),
    summary: (summary ?? '').slice(0, 400),
  }));
}
