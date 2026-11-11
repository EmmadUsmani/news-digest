// Offline editorial labels, never a runtime classifier. No providers or storage.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const fixture = JSON.parse(
  readFileSync(
    'apps/api/test/fixtures/world-us-scope-2026-11-04-10.json',
    'utf8',
  ),
) as {
  windows: {
    date: string;
    editionId: string;
    stories: { id: string; title: string; summary: string; scope: string }[];
  }[];
};
assert.equal(fixture.windows.length, 7);
let world = 0;
let us = 0;
for (const [index, window] of fixture.windows.entries()) {
  assert.equal(window.date, `2026-11-${String(index + 4).padStart(2, '0')}`);
  assert.ok(window.editionId);
  const ids = new Set<string>();
  for (const story of window.stories) {
    assert.ok(!ids.has(story.id), 'Story assigned twice in a saved edition');
    ids.add(story.id);
    assert.ok(story.title && story.summary);
    assert.ok(story.scope === 'world' || story.scope === 'us');
  }
  const domestic = window.stories.filter((s) => s.scope === 'us').length;
  const international = window.stories.length - domestic;
  world += international;
  us += domestic;
  console.log(
    `${window.date}: World ${international}, U.S. ${domestic}, overlap 0`,
  );
}
assert.equal(world, 23);
assert.equal(us, 5);
console.log(
  '28 saved stories assessed; manual labels only; production routing remains unimplemented.',
);
