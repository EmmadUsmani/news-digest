import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { editorEvidence } from '../src/modules/digests/application/editor-evidence';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

void test('grouped reporting reaches editing and immutable evidence with separate attribution', async () => {
  const pool: Candidate[] = ['lead', 'member', 'unrelated'].map((id, i) => ({
    id,
    title: `${id} report`,
    excerpt: id === 'lead' ? '' : 'The company announced a leadership change.',
    publisher: { name: `${id} outlet`, url: `https://example.com/${id}` },
    sources: [id],
    url: `https://example.com/${id}`,
    points: 100 - i,
    publishedAt: '2026-11-12T12:00:00Z',
  }));
  const ranked = rank(
    pool,
    new Date('2026-11-12'),
    new Date('2026-11-13'),
    10,
    (a, b) => a.id !== 'unrelated' && b.id !== 'unrelated',
  );
  const input = editorEvidence(ranked, pool);
  const price = {
    id: 'offline',
    input: 0,
    cacheWrite: 0,
    cacheRead: 0,
    output: 0,
  };
  let calls = 0;
  const editor = new ShortlistEditor(
    {
      async json(request, validate) {
        calls++;
        const prompt = JSON.parse(request.prompt);
        assert.equal(prompt.candidates[0].excerpt, '');
        assert.equal(
          prompt.candidates[0].clusterEvidence[0].publisher,
          'member outlet',
        );
        assert.equal(prompt.candidates[0].clusterEvidence[0].id, 'member');
        assert.ok(
          Buffer.byteLength(request.instructions + request.prompt) + 2048 <
            100000,
        );
        return validate({
          brief: ['Leadership changed.', 'The company announced the change.'],
          stories: [
            {
              id: 'lead',
              evidenceIds: ['lead', 'member'],
              headline: 'Company announces leadership change',
              summary: 'The company announced a leadership change.',
              whyItMatters: 'Leadership changed.',
              rationale: 'A leadership development.',
            },
          ],
        });
      },
    },
    price,
    price,
  );
  const result = await editor.edit(
    { id: 'tech', name: 'Tech', description: '', guidance: '' },
    input.candidates,
    1,
    'offline',
  );
  assert.equal(calls, 1);
  assert.ok(result);
  const saved = input.cited(result.stories[0].evidenceIds);
  assert.deepEqual(
    saved.map((item) => item.id),
    ['lead', 'member'],
  );
  assert.deepEqual(saved[1].publisher, pool[1].publisher);
  assert.equal(saved[1].excerpt, pool[1].excerpt);
  assert.equal(saved[0].excerpt, '');
  assert.equal(ranked[0].id, 'lead');
  assert.throws(() => input.cited(['unknown']), /Unknown editorial evidence/);
  assert.deepEqual(JSON.parse(JSON.stringify(saved)), saved);
});

void test('other topics preserve their original editor input and evidence', () => {
  const pool: Candidate[] = [
    {
      id: 'lead',
      title: 'Report',
      url: 'https://example.com',
      excerpt: 'x'.repeat(1000),
      sources: ['Outlet'],
      points: 1,
      publishedAt: '2026-11-12T12:00:00Z',
    },
  ];
  const ranked = rank(pool, new Date('2026-11-12'), new Date('2026-11-13'), 10);
  const input = editorEvidence(ranked, pool, false);
  assert.equal(input.candidates, ranked);
  assert.equal(input.cited(['lead'])[0].excerpt, ranked[0].excerpt);
  assert.equal('clusterEvidence' in input.candidates[0], false);
});

void test('representative word-boundary excerpt stays identical through projection', () => {
  const pool: Candidate[] = [
    {
      id: 'lead',
      title: 'Report',
      url: 'https://example.com',
      excerpt: 'long word '.repeat(100),
      sources: ['Outlet'],
      points: 1,
      publishedAt: '2026-11-12T12:00:00Z',
    },
  ];
  const ranked = rank(pool, new Date('2026-11-12'), new Date('2026-11-13'), 10);
  const input = editorEvidence(ranked, pool);
  assert.equal(input.cited(['lead'])[0].excerpt, ranked[0].excerpt);
  assert.equal(
    input.candidates[0].clusterEvidence![0].excerpt,
    ranked[0].excerpt,
  );
});

for (const character of ['a', '\u0000', '\u0800']) {
  void test(`ten fully populated Tech clusters enforce byte admission (${JSON.stringify(character)})`, async () => {
    const pool: Candidate[] = Array.from({ length: 30 }, (_, index) => ({
      id: `${index}-`.padEnd(200, character),
      title: character.repeat(300),
      excerpt: character.repeat(600),
      publisher: { name: character.repeat(200), url: 'https://example.com' },
      sources: Array.from({ length: 3 }, () => character.repeat(80)),
      url: `https://example.com/${index}`,
      points: 100 - index,
      publishedAt: '2026-11-12T12:00:00Z',
    }));
    const ranked = rank(
      pool,
      new Date('2026-11-12'),
      new Date('2026-11-13'),
      10,
      (a, b) =>
        Math.floor(Number.parseInt(a.id) / 3) ===
        Math.floor(Number.parseInt(b.id) / 3),
    );
    assert.equal(ranked.length, 10);
    const input = editorEvidence(ranked, pool);
    assert.ok(
      input.candidates.every(
        (candidate) => candidate.clusterEvidence!.length === 3,
      ),
    );
    let reservations = 0;
    let calls = 0;
    const ledger: LlmLedger = {
      async cached() {
        return undefined;
      },
      async cache() {},
      async reserve(request, estimate) {
        reservations++;
        assert.equal(request.maxOutputTokens, 4000);
        assert.ok(estimate > 0);
        assert.ok(
          Buffer.byteLength(request.instructions + request.prompt) + 2048 <
            100000,
        );
        return 'offline';
      },
      async settle() {},
      async fail() {},
    };
    const llm = new BudgetedLlm(
      {
        async complete() {
          calls++;
          return {
            text: JSON.stringify({ brief: [], stories: [] }),
            usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
          };
        },
      },
      ledger,
    );
    const config = llmConfig({});
    const editor = new ShortlistEditor(llm, config.sonnet, config.haiku);
    const run = () =>
      editor.edit(
        {
          id: 'tech',
          name: 'Tech',
          description: character.repeat(1000),
          guidance: character.repeat(1000),
        },
        input.candidates,
        5,
        'offline',
      );
    if (character === 'a') {
      assert.deepEqual(await run(), {
        brief: [],
        stories: [],
        model: config.sonnet.id,
      });
      assert.equal(reservations, 1);
      assert.equal(calls, 1);
    } else {
      assert.equal(await run(), null);
      assert.equal(reservations, 0);
      assert.equal(calls, 0);
    }
  });
}
