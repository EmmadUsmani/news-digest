import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedGroupingObligations } from '../../../scripts/lib/protected-grouping-obligations';
import { protectedSocialObligations } from '../../../scripts/lib/protected-social-obligations';
import { protectedStoryObligations } from '../../../scripts/lib/protected-story-obligations';
import { protectedTriageObligations } from '../../../scripts/lib/protected-triage-obligations';

void test('every protected stage rejects missing attribution even for zero-call pools', async () => {
  const model = {
    id: 'offline',
    input: 1,
    output: 5,
    cacheRead: 0.1,
    cacheWrite: 1.25,
  };
  for (const [runId, topicId] of [
    ['', 'topic'],
    [' \n', 'topic'],
    ['edition', ''],
    ['edition', ' \t'],
    ['edition', 'topic'],
  ]) {
    const topic = { id: topicId, name: 'Topic', description: '', guidance: '' };
    const stages = [
      () =>
        protectedStoryObligations({
          sonnet: model,
          haiku: model,
          args: [topic, [], 5, runId],
        }),
      () =>
        protectedSocialObligations({
          sonnet: model,
          haiku: model,
          args: [topic, [], 5, runId],
        }),
      ...(['article', 'social'] as const).map(
        (kind) => () =>
          protectedTriageObligations({ model, kind, args: [topic, [], runId] }),
      ),
      () =>
        protectedGroupingObligations({
          model,
          kind: 'topic',
          args: [topicId, [], runId],
        }),
      () =>
        protectedGroupingObligations({
          model,
          kind: 'joint',
          args: [[topic, { ...topic, id: 'other' }], [], runId],
        }),
    ];
    for (const stage of stages) {
      if (runId === 'edition' && topicId === 'topic')
        assert.deepEqual((await stage()).requests, []);
      else
        await assert.rejects(stage(), /Invalid protected obligation identity/);
    }
  }
  await assert.rejects(
    protectedGroupingObligations({
      model,
      kind: 'joint',
      args: [
        [
          { id: 'topic', name: 'Topic', description: '', guidance: '' },
          { id: 'topic', name: 'Topic', description: '', guidance: '' },
        ],
        [],
        'edition',
      ],
    }),
    /Invalid protected obligation identity/,
  );
});
