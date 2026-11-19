import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rewriteDevelopingStories } from '../src/modules/digests/application/rewrite-developing-stories';

const selected = ['a', 'b', 'c'].map((id) => ({
  id,
  title: `Accepted ${id}`,
  summary: `Accepted summary ${id}`,
  rationale: 'Keep the selector rationale',
  url: 'https://example.com/original',
}));
const evidence = selected.map(({ id }) => ({
  id,
  title: `Original reporting ${id}`,
  excerpt: 'Current factual support',
}));
const links = ['a', 'c'].map((storyId) => ({
  storyId,
  previousEditionId: '00000000-0000-4000-8000-000000000001',
  previousStoryId: '00000000-0000-4000-8000-000000000002',
  previousHeadline: 'Earlier reporting',
  previousSummary: 'Historical comparison only',
  editionCount: 2,
}));
const prose = ['a', 'c'].map((id) => ({
  id,
  title: `Updated ${id}`,
  summary: 'Supported current development',
  whyItMatters: 'Supported significance',
}));
const base = { selected, evidence, links, validate: () => true };

void test('fixed-selection rewrite changes only matched prose and validated links', async () => {
  const before = structuredClone({ selected, evidence, links });
  let guards = 0;
  const result = await rewriteDevelopingStories({
    ...base,
    async rewrite(request) {
      assert.deepEqual(
        request.map((x) => x.selected.id),
        ['a', 'c'],
      );
      assert.deepEqual(request[0].evidence, evidence[0]);
      assert.equal(
        request[0].earlierCoverage.previousSummary,
        links[0].previousSummary,
      );
      request[0].selected.rationale = 'Adapter mutation';
      request[0].evidence.excerpt = 'Adapter mutation';
      return prose;
    },
    validate(rewritten, current) {
      guards++;
      assert.equal(rewritten.id, current.id);
      assert.equal(current.excerpt, 'Current factual support');
      assert.equal('earlierCoverage' in current, false);
      return true;
    },
  });
  assert.equal(result.status, 'rewritten');
  assert.equal(guards, 2);
  assert.deepEqual(
    result.stories.map((x) => x.id),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(result.stories[1], selected[1]);
  assert.equal(result.stories[0].title, prose[0].title);
  assert.equal(result.stories[0].rationale, selected[0].rationale);
  assert.equal(result.stories[0].url, selected[0].url);
  assert.deepEqual(
    { selected, evidence, links },
    {
      selected: before.selected,
      evidence: before.evidence,
      links: before.links,
    },
  );
});

void test('invalid, refused and unsupported rewrites retain the exact accepted selection atomically', async () => {
  for (const reply of [
    null,
    [],
    [prose[0]],
    [...prose, prose[0]],
    [...prose].reverse(),
    [prose[0], { ...prose[1], id: 'new' }],
    [prose[0], { ...prose[1], summary: '' }],
    [prose[0], { ...prose[1], rationale: 'Replacement reason' }],
    [prose[0], { ...prose[1], evidence: ['invented'] }],
  ]) {
    const result = await rewriteDevelopingStories({
      ...base,
      async rewrite() {
        return reply;
      },
    });
    assert.equal(result.status, 'unchanged');
    assert.equal(result.stories, selected);
  }
  for (const failure of ['refusal', 'unsupported', 'guard-error']) {
    const result = await rewriteDevelopingStories({
      ...base,
      async rewrite() {
        if (failure === 'refusal') throw new Error('refused');
        return prose;
      },
      validate(value) {
        if (failure === 'guard-error') throw new Error('guard failed');
        return value.id === 'a'; // First result passes; second must roll it back.
      },
    });
    assert.equal(result.status, 'unchanged');
    assert.equal(result.stories, selected);
  }
});

void test('empty or invalid matches and ambiguous evidence never invoke rewrite', async () => {
  for (const override of [
    { links: [] },
    { links: [...links, links[0]] },
    { links: [{ ...links[0], storyId: 'unknown' }] },
    { selected: [...selected, selected[0]] },
    { evidence: [evidence[0], evidence[0]] },
    { evidence: [] },
  ]) {
    let calls = 0;
    const result = await rewriteDevelopingStories({
      ...base,
      ...override,
      async rewrite(): Promise<never> {
        calls++;
        assert.fail('Must not call rewrite');
      },
    });
    assert.equal(result.status, 'unchanged');
    assert.equal(result.stories, override.selected ?? selected);
    assert.equal(calls, 0);
  }
});
