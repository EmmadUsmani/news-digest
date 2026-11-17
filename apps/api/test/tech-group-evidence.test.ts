import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { editorEvidence } from '../src/modules/digests/application/editor-evidence';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

// Recorded inputs test transport, not the correctness of cached event boundaries.
const fixture = JSON.parse(
  readFileSync(
    new URL('./fixtures/tech-group-evidence-2026-11-17.json', import.meta.url),
    'utf8',
  ),
) as {
  candidates: Candidate[];
  groups: string[][];
  windowStart: string;
  windowEnd: string;
};

void test('saved California prose reaches bounded attributed editing while empty China stays empty', async () => {
  const membership = new Map(
    fixture.groups.flatMap((group, index) =>
      group.map((id) => [id, index] as const),
    ),
  );
  const ranked = rank(
    fixture.candidates,
    new Date(fixture.windowStart),
    new Date(fixture.windowEnd),
    10,
    (a, b) => membership.get(a.id) === membership.get(b.id),
  );
  assert.equal(ranked.length, 2);
  const california = ranked.find((item) => /California/.test(item.title))!;
  const china = ranked.find((item) => /China/.test(item.title))!;
  assert.ok(california);
  assert.ok(china);
  assert.equal(california.excerpt, '');
  assert.equal(china.excerpt, '');
  const report = fixture.candidates.find((item) => item.excerpt.length > 0)!;
  assert.equal(report.excerpt.length, 649);
  assert.ok(california.coverage.some((item) => item.id === report.id));
  const input = editorEvidence(ranked, fixture.candidates);
  assert.deepEqual(
    input.candidates.map((item) => item.id),
    ranked.map((item) => item.id),
  );
  let calls = 0;
  const price = {
    id: 'offline',
    input: 0,
    output: 0,
    cacheWrite: 0,
    cacheRead: 0,
  };
  const editor = new ShortlistEditor(
    {
      async json(request) {
        calls++;
        const prompt = JSON.parse(request.prompt);
        const lawsuit = prompt.candidates.find(
          (item: { id: string }) => item.id === california.id,
        );
        const restriction = prompt.candidates.find(
          (item: { id: string }) => item.id === china.id,
        );
        assert.equal(lawsuit.excerpt, '');
        assert.equal(lawsuit.clusterEvidence.length, 1);
        const member = lawsuit.clusterEvidence[0];
        assert.equal(member.id, report.id);
        assert.equal(member.title, report.title.slice(0, 300));
        assert.equal(member.publisher, report.publisher?.name ?? null);
        assert.deepEqual(member.sources, report.sources);
        assert.equal(member.excerpt, report.excerpt.slice(0, 600));
        assert.equal(restriction.excerpt, '');
        assert.deepEqual(restriction.clusterEvidence, []);
        assert.ok(
          prompt.candidates.every(
            (item: { clusterEvidence: unknown[] }) =>
              item.clusterEvidence.length <= 2,
          ),
        );
        assert.ok(
          Buffer.byteLength(request.instructions + request.prompt, 'utf8') +
            2048 <
            100000,
        );
        return null; // Capture only: no provider or fabricated editorial output.
      },
    },
    price,
    price,
  );
  assert.equal(
    await editor.edit(
      { id: 'tech', name: 'Tech & AI', description: '', guidance: '' },
      input.candidates,
      2,
      'offline-recorded-input',
    ),
    null,
  );
  assert.equal(calls, 2); // Both model attempts remain local captures.
  const saved = JSON.parse(
    JSON.stringify(input.cited([california.id, report.id])),
  );
  assert.equal(saved[0].excerpt, '');
  assert.equal(saved[1].publisher, undefined);
  assert.deepEqual(saved[1].sources, ['The Verge']);
  assert.equal(saved[1].url, report.url);
  assert.equal(saved[1].excerpt, report.excerpt.slice(0, 600));
  assert.ok(input.cited([china.id]).every((item) => item.excerpt === ''));
});
