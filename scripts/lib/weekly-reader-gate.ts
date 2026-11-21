import assert from 'node:assert/strict';

import type { ReaderWeeklyEdition } from '@digest/contracts';

type DailyCoverage = {
  id: string;
  windowEnd: string;
  topics: {
    id: string;
    stories: { id: string }[];
    posts: { externalId: string }[];
  }[];
};

/** Check public saved coverage without running editors or generating editions. */
export async function verifyWeeklyCoverage(
  weekly: ReaderWeeklyEdition,
  readDaily: (id: string) => Promise<DailyCoverage>,
) {
  const start = Date.parse(weekly.windowStart);
  const end = Date.parse(weekly.windowEnd);
  assert.equal(
    end - start,
    7 * 86_400_000,
    'weekly coverage must span seven days',
  );
  const sunday = new Date(end);
  assert.equal(sunday.getUTCDay(), 0, 'weekly cutoff must be Sunday');
  assert.equal(sunday.toISOString().slice(11), '17:00:00.000Z');
  assert.ok(weekly.topics.length, 'weekly edition has no topics');
  const daily = new Map<string, DailyCoverage>();
  let stories = 0;
  let links = 0;
  for (const topic of weekly.topics) {
    assert.ok(topic.stories.length <= 5, 'weekly topic exceeds five stories');
    const used = new Set<string>();
    for (const story of topic.stories) {
      stories++;
      assert.ok(
        story.title.trim() && story.summary.trim(),
        'empty weekly summary',
      );
      assert.ok(
        story.coverage.some((item) => item.kind === 'story'),
        'weekly summary needs daily story coverage',
      );
      for (const coverage of story.coverage) {
        const key = `${coverage.editionId}:${coverage.kind}:${coverage.itemId}`;
        assert.ok(!used.has(key), 'daily coverage reused within weekly topic');
        used.add(key);
        let edition = daily.get(coverage.editionId);
        if (!edition) {
          edition = await readDaily(coverage.editionId);
          assert.equal(
            edition.id,
            coverage.editionId,
            'daily edition ID differs',
          );
          daily.set(edition.id, edition);
        }
        assert.ok(
          Date.parse(edition.windowEnd) > start &&
            Date.parse(edition.windowEnd) <= end,
          'daily coverage outside weekly window',
        );
        assert.ok(
          Date.parse(coverage.publishedAt) <= end,
          'coverage published after weekly cutoff',
        );
        const savedTopic = edition.topics.find((item) => item.id === topic.id);
        assert.ok(savedTopic, 'daily coverage topic missing');
        assert.ok(
          coverage.kind === 'story'
            ? savedTopic.stories.some((item) => item.id === coverage.itemId)
            : savedTopic.posts.some(
                (item) => item.externalId === coverage.itemId,
              ),
          'daily coverage item missing',
        );
        links++;
      }
    }
  }
  return {
    topics: weekly.topics.length,
    stories,
    coverageLinks: links,
    dailyEditions: daily.size,
  };
}
