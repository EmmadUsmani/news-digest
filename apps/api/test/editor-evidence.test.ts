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

void test('saved NVIDIA cluster transports direct reporting before aggregator headline lists', async () => {
  const { readFile } = await import('node:fs/promises');
  const fixture = JSON.parse(
    await readFile('apps/api/test/fixtures/tech-cluster-evidence.json', 'utf8'),
  );
  const story = fixture.story as ReturnType<typeof rank>[number];
  const pool = fixture.pool as Candidate[];
  const before = JSON.stringify(fixture);
  const memberId = 'cde99a3e-4762-42d4-90d4-7e7dd4829c7b';
  assert.equal(story.coverage.length, 23);
  assert.equal(story.excerpt, '');
  assert.deepEqual(
    (fixture.story.evidence as { id: string }[]).map((x) => x.id),
    [story.id],
  );
  const input = editorEvidence([story], pool);
  const evidence = input.candidates[0].clusterEvidence;
  assert.equal(evidence.length, 3);
  assert.equal(evidence[1].id, memberId);
  assert.match(evidence[1].excerpt, /board announced that Jensen Huang/);
  assert.match(evidence[1].excerpt, /alleged Chinese spy/);
  assert.equal(evidence[1].publisher, undefined);
  assert.deepEqual(input.candidates[0].coverage, story.coverage);
  assert.equal(input.candidates[0].score, story.score);
  let calls = 0;
  const price = {
    id: 'offline',
    input: 0,
    cacheWrite: 0,
    cacheRead: 0,
    output: 0,
  };
  const editor = new ShortlistEditor(
    {
      async json(request, validate) {
        calls++;
        const prompt = JSON.parse(request.prompt);
        assert.equal(prompt.candidates[0].clusterEvidence[0].id, memberId);
        assert.match(request.prompt, /alleged Chinese spy/);
        return validate({
          brief: [
            'Nvidia announced a leadership change.',
            'The Verge reports Jensen Huang resigned.',
          ],
          stories: [
            {
              id: story.id,
              evidenceIds: [story.id, memberId],
              headline: 'Nvidia CEO Jensen Huang resigns',
              summary:
                "The Verge reports that Nvidia's board announced Jensen Huang's resignation as CEO and president after reports of two extramarital affairs, including one with an alleged Chinese spy.",
              whyItMatters: 'The resignation changes leadership at Nvidia.',
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
    { id: 'tech', name: 'Tech & AI', description: '', guidance: '' },
    input.candidates,
    1,
    'offline',
  );
  assert.ok(result);
  assert.equal(calls, 1);
  const saved = input.cited(result.stories[0].evidenceIds);
  assert.equal(saved[0].excerpt, '');
  assert.equal(saved[1].id, memberId);
  assert.equal(saved[1].url, pool.find((x) => x.id === memberId)!.url);
  assert.equal(saved[1].excerpt, evidence[1].excerpt);
  assert.deepEqual(JSON.parse(JSON.stringify(saved)), saved);
  assert.equal(JSON.stringify(fixture), before);
  // With no direct reporting, preserve the existing ranked aggregator fallback.
  const aggregators = pool.filter(
    (x) => x.id === story.id || new URL(x.url).hostname === 'news.google.com',
  );
  const fallback = editorEvidence([story], aggregators).candidates[0]
    .clusterEvidence;
  assert.equal(fallback.length, 3);
  assert.equal(fallback[1].id, '5c2b0f3f-7bb6-44bb-9d41-54bb2dc4aec4');
});
