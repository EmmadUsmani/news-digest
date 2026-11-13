import assert from 'node:assert/strict';
import { test } from 'node:test';

import { requireScheduledAiTopic } from '../../../scripts/lib/scheduled-editorial-gate';

function evidence() {
  const identity = {
    id: 'saved-edition',
    windowStart: '2026-11-12T15:00:00Z',
    windowEnd: '2026-11-13T15:00:00Z',
  };
  return {
    reader: {
      ...identity,
      topics: [
        {
          id: 'nba',
          name: 'NBA',
          stories: [{ summary: 'A saved supported summary.' }],
        },
      ],
    },
    preview: {
      ...identity,
      topics: [
        {
          id: 'nba',
          editorial: { mode: 'ai' as 'ai' | 'non-ai', model: 'saved-model' },
        },
      ],
    },
  };
}

void test('scheduled gate requires saved AI provenance as well as readable stories', () => {
  const { reader, preview } = evidence();
  assert.deepEqual(requireScheduledAiTopic(reader, preview, 'NBA'), {
    name: 'NBA',
    model: 'saved-model',
    stories: 1,
  });
  preview.topics[0].editorial.mode = 'non-ai';
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'NBA'),
    /not AI-edited/,
  );
  preview.topics[0].editorial.mode = 'ai';
  reader.topics[0].stories[0].summary = '  ';
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'NBA'),
    /missing published story text/,
  );
  reader.topics[0].stories = [];
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'NBA'),
    /no published stories/,
  );
});

void test('scheduled gate refuses unrelated, missing and ambiguous evidence', () => {
  const { reader, preview } = evidence();
  assert.throws(
    () => requireScheduledAiTopic(reader, { ...preview, id: 'other' }, 'NBA'),
    /edition differs/,
  );
  assert.throws(
    () =>
      requireScheduledAiTopic(
        reader,
        { ...preview, windowEnd: '2026-11-14T15:00:00Z' },
        'NBA',
      ),
    /windowEnd/,
  );
  assert.throws(
    () => requireScheduledAiTopic(reader, { ...preview, topics: [] }, 'NBA'),
    /editorial evidence/,
  );
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'World'),
    /reader topic/,
  );
  assert.throws(
    () =>
      requireScheduledAiTopic(
        reader,
        { ...preview, topics: [...preview.topics, ...preview.topics] },
        'NBA',
      ),
    /ambiguous/,
  );
  preview.topics[0].editorial.model = ' ';
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'NBA'),
    /missing editorial model/,
  );
});
