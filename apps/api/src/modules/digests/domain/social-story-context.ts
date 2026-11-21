/** Bounded selected-story comparison for every topic's social selection. */
export function socialStoryContext(
  stories: readonly { title: string; summary?: string | null }[],
): { title: string; summary: string; textTruncated?: boolean }[] {
  return stories.slice(0, 10).map(({ title, summary }) => ({
    title: title.slice(0, 300),
    summary: (summary ?? '').slice(0, 400),
    ...(stories.length > 10 ||
    title.length > 300 ||
    (summary ?? '').length > 400
      ? { textTruncated: true }
      : {}),
  }));
}
