/** Bounded selected-story comparison for every topic's social selection. */
export function socialStoryContext(
  stories: readonly { title: string; summary?: string | null }[],
  options: { completeSummaries?: boolean } = {},
): { title: string; summary: string; textTruncated?: boolean }[] {
  const summaryLimit = options.completeSummaries ? 1200 : 400;
  return stories.slice(0, 10).map(({ title, summary }) => ({
    title: title.slice(0, 300),
    summary: (summary ?? '').slice(0, summaryLimit),
    ...(stories.length > 10 ||
    title.length > 300 ||
    (summary ?? '').length > summaryLimit
      ? { textTruncated: true }
      : {}),
  }));
}
