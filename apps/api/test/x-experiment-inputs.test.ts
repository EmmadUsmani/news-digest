import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  experimentWindow,
  prepareXExperimentTopic,
} from '../../../scripts/lib/x-experiment-inputs';

const topic = {
  id: 'fixture',
  name: 'NBA',
  includeGuidance: '',
  excludeGuidance: '',
};
const settings = {
  reactionMinFaves: 100,
  trendingMinFaves: 1000,
  exclusions: ['-bet'],
};
const window = { start: '2026-11-03T15:30:00Z', end: '2026-11-04T15:30:00Z' };
const stories = [
  { id: 'a', title: 'Fixture result', importance: 1 },
  { id: 'b', title: 'Fixture trade', importance: 10 },
  { id: 'c', title: ' FIXTURE   TRADE ', importance: 5 },
];
void test('preparation uses distinct ranked stories and the identical precise window in all styles', () => {
  const result = prepareXExperimentTopic(topic, settings, stories, window);
  assert.equal(result.ready, true);
  assert.deepEqual(
    result.rankedStories.map((story) => story.id),
    ['b', 'a'],
  );
  assert.deepEqual(
    stories.map((story) => story.id),
    ['a', 'b', 'c'],
  );
  for (const body of Object.values(result.requests)) {
    assert.ok(body);
    assert.match(body.input[0].content, /2026-11-03T15:30:00.000Z/);
    assert.match(body.input[0].content, /2026-11-04T15:30:00.000Z/);
    assert.equal(body.tools[0].from_date, '2026-11-03');
    assert.equal(body.tools[0].to_date, '2026-11-05');
  }
  assert.match(result.requests.reactions!.input[0].content, /Fixture trade/);
  assert.doesNotMatch(
    result.requests.trending.input[0].content,
    /Fixture trade/,
  );
});
void test('missing distinct stories blocks reactions without fabricating inputs', () => {
  const result = prepareXExperimentTopic(
    topic,
    settings,
    stories.slice(1),
    window,
  );
  assert.equal(result.ready, false);
  assert.equal(result.requests.reactions, null);
  assert.match(result.blockedReason!, /Fewer than two/);
});
void test('window validation requires explicit zones and keeps midnight exclusive', () => {
  for (const start of [
    '2026-11-03',
    '2026-11-03T15:00:00',
    'invalidZ',
    window.end,
  ])
    assert.throws(() => experimentWindow(start, window.end));
  assert.deepEqual(
    experimentWindow('2026-11-03T17:30:00+02:00', window.end),
    experimentWindow(window.start, window.end),
  );
  const result = prepareXExperimentTopic(topic, settings, stories, {
    ...window,
    end: '2026-11-05T00:00:00Z',
  });
  assert.equal(result.requests.trending.tools[0].to_date, '2026-11-05');
});
