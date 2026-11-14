import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  assessScheduledAiTopics,
  parseRequiredAiTopics,
  requireScheduledAiTopic,
} from '../../../scripts/lib/scheduled-editorial-gate';

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
          editorial: {
            mode: 'ai' as 'ai' | 'non-ai',
            model: 'saved-model',
            unscoredIds: [] as string[],
          },
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

void test('multi-topic acceptance refuses partial recovery and absent sections', () => {
  const { reader, preview } = evidence();
  reader.topics.push({
    id: 'tech',
    name: 'Tech',
    stories: [{ summary: 'Saved Tech text.' }],
  });
  preview.topics.push({
    id: 'tech',
    editorial: {
      mode: 'non-ai',
      model: 'fallback',
      unscoredIds: [] as string[],
    },
  });
  const names = parseRequiredAiTopics([
    '--require-ai-topic',
    'NBA',
    '--require-ai-topic',
    'Tech',
  ]);
  const check = () =>
    names.map((name) => requireScheduledAiTopic(reader, preview, name));
  assert.throws(check, /Tech: scheduled stories are not AI-edited/);
  preview.topics[1].editorial.mode = 'ai';
  assert.equal(check().length, 2);
  reader.topics.pop();
  assert.throws(check, /Tech: expected exactly one reader topic/);
});

void test('reader gate rejects malformed options before making requests', () => {
  assert.deepEqual(parseRequiredAiTopics([]), []);
  for (const args of [
    ['--require-ai-topic'],
    ['--other', 'NBA'],
    ['--require-ai-topic', ' '],
    ['--require-ai-topic', '--other'],
    ['--require-ai-topic', 'NBA', '--require-ai-topic', 'NBA'],
  ]) {
    assert.throws(() => parseRequiredAiTopics(args));
  }
});

void test('AI editing alone cannot accept recovery after partial candidate triage', () => {
  const { reader, preview } = evidence();
  preview.topics[0].editorial.unscoredIds = ['missed-candidate'];
  assert.throws(
    () => requireScheduledAiTopic(reader, preview, 'NBA'),
    /NBA: scheduled story triage is incomplete/,
  );
  // Cached scores are valid evidence too: admission recovery requires complete
  // saved coverage, without requiring fresh provider calls for every candidate.
  preview.topics[0].editorial.unscoredIds = [];
  assert.equal(requireScheduledAiTopic(reader, preview, 'NBA').stories, 1);
});

void test('all-topic assessment reports failures after a failure and retains accepted sections', () => {
  const { reader, preview } = evidence();
  const result = assessScheduledAiTopics(reader, preview, [
    'Tech',
    'NBA',
    'World',
  ]);
  assert.deepEqual(
    result.map(({ name, status }) => ({ name, status })),
    [
      { name: 'Tech', status: 'refused' },
      { name: 'NBA', status: 'accepted' },
      { name: 'World', status: 'refused' },
    ],
  );
  assert.match(result[0].reason!, /Tech: expected exactly one reader topic/);
  assert.match(result[2].reason!, /World: expected exactly one reader topic/);
  preview.topics[0].editorial.unscoredIds = ['unfinished'];
  assert.equal(
    assessScheduledAiTopics(reader, preview, ['NBA'])[0].status,
    'refused',
  );
  preview.topics[0].editorial.unscoredIds = [];
  assert.equal(
    assessScheduledAiTopics(reader, preview, ['NBA'])[0].status,
    'accepted',
  );
});
