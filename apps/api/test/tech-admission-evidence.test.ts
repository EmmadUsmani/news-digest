import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { recordedTechEvidence } from '../../../scripts/lib/tech-admission-evidence';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { prepareStoryGrouping } from '../src/modules/digests/application/prepare-story-grouping';
import type { Candidate } from '../src/modules/digests/domain/rank';

const recorded = JSON.parse(
  readFileSync(
    new URL('./fixtures/tech-admission-2026-11-17.json', import.meta.url),
    'utf8',
  ),
) as {
  ranked: { id: string; title: string; coverage: { id: string }[] }[];
  scores: { id: string; importance: number; relevance: number }[];
  publishedEditorIds: string[];
};
const sources = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/tech-admission-evidence-2026-11-17.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  candidates: Candidate[];
  windowStart: string;
  windowEnd: string;
};
const input = { ...recorded, ...sources, enabled: true };

void test('recorded reservations reach the real editor with attributed California text and unchanged empty China evidence', async () => {
  const baseline = recordedTechEvidence({ ...input, enabled: false });
  const result = recordedTechEvidence(input);
  assert.deepEqual(
    result.ranked.map((e) => ({
      id: e.id,
      title: e.title,
      coverage: e.coverage.map((c) => ({ id: c.id })),
    })),
    recorded.ranked,
  );
  assert.deepEqual(
    baseline.decision.admitted.map((e) => e.id),
    recorded.publishedEditorIds,
  );
  assert.equal(result.decision.admitted.length, 10);
  const withText = (value: typeof result) =>
    value.evidence.candidates.filter((event) =>
      event.clusterEvidence.some((member) => member.excerpt.trim()),
    ).length;
  assert.equal(withText(baseline), 1);
  assert.equal(withText(result), 2);
  const google = result.evidence.candidates.find(
    (event) => event.id === result.decision.reserved[1],
  )!;
  assert.ok(google.clusterEvidence.every((member) => member.excerpt === ''));
  const californiaId = result.decision.reserved[0];
  const california = result.evidence.candidates.find(
    (e) => e.id === californiaId,
  )!;
  const report = sources.candidates.find(
    (c) => c.id === 'b84b6da6-15b6-4961-be06-3313d13cc0d1',
  )!;
  assert.equal(california.excerpt, '');
  assert.ok(!baseline.evidence.candidates.some((e) => e.id === californiaId));
  const china = result.evidence.candidates.find(
    (e) => e.id === '9035014e-9153-4f61-98f7-392dfbcec7d9',
  );
  assert.ok(china, 'recorded China chip event remains admitted');
  assert.ok(china.clusterEvidence.every((member) => member.excerpt === ''));
  assert.match(result.decision.admitted[0].title, /Windows/);
  let captures = 0;
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
        captures++;
        const prompt = JSON.parse(request.prompt) as {
          candidates: {
            id: string;
            excerpt: string;
            clusterEvidence: {
              id: string;
              excerpt: string;
              publisher: string | null;
              sources: string[];
            }[];
          }[];
        };
        assert.deepEqual(
          prompt.candidates.map((c) => c.id),
          result.decision.admitted.map((e) => e.id),
        );
        const lawsuit = prompt.candidates.find((c) => c.id === californiaId)!;
        assert.equal(lawsuit.excerpt, '');
        const member = lawsuit.clusterEvidence.find((c) => c.id === report.id)!;
        assert.equal(member.excerpt, report.excerpt.slice(0, 600));
        assert.deepEqual(member.sources, ['The Verge']);
        assert.equal(member.publisher, null);
        const restriction = prompt.candidates.find((c) => c.id === china.id)!;
        assert.equal(restriction.excerpt, '');
        assert.deepEqual(restriction.clusterEvidence, []);
        assert.ok(
          prompt.candidates.every((c) => c.clusterEvidence.length <= 2),
        );
        assert.ok(
          Buffer.byteLength(request.instructions + request.prompt, 'utf8') +
            2048 <
            100000,
        );
        return null; // Capture both local attempts; never fabricate an edited result.
      },
    },
    price,
    price,
  );
  assert.equal(
    await editor.edit(
      { id: 'tech', name: 'Tech & AI', description: '', guidance: '' },
      result.evidence.candidates,
      5,
      'offline-admission-evidence',
    ),
    null,
  );
  assert.equal(captures, 2);
  const cited = result.evidence.cited([california.id, report.id]);
  assert.equal(cited[0].excerpt, '');
  assert.equal(cited[1].url, report.url);
  assert.equal(cited[1].excerpt, report.excerpt.slice(0, 600));
  assert.deepEqual(cited[1].sources, ['The Verge']);
  // The editor cannot cite members of displaced events through this projection.
  for (const id of result.decision.displaced)
    assert.throws(
      () => result.evidence.cited([id]),
      /Unknown editorial evidence/,
    );
});

void test('prepared recorded membership reaches reservations without changing representative or evidence transport', async () => {
  let calls = 0;
  const prepared = await prepareStoryGrouping(
    {
      async groupWithResult() {
        calls++;
        return {
          status: 'validated',
          groups: recorded.ranked
            .filter((event) => event.coverage.length > 1)
            .map((event) => event.coverage.map((member) => member.id)),
        };
      },
    },
    'tech',
    sources.candidates,
    'offline-prepared',
  );
  assert.equal(calls, 1);
  assert.equal(prepared.status, 'validated');
  const result = recordedTechEvidence({ ...input, prepared });
  const baseline = recordedTechEvidence(input);
  assert.deepEqual(result.ranked, baseline.ranked);
  assert.deepEqual(result.decision, baseline.decision);
  assert.equal(
    JSON.stringify(result.evidence),
    JSON.stringify(baseline.evidence),
  );
});

void test('unavailable prepared grouping refuses reservations and retains ungrouped baseline evidence', async () => {
  const prepared = await prepareStoryGrouping(
    {
      async groupWithResult() {
        return { status: 'unavailable', reason: 'no-result' };
      },
    },
    'tech',
    sources.candidates,
    'offline-unavailable',
  );
  const result = recordedTechEvidence({ ...input, prepared });
  const disabled = recordedTechEvidence({ ...input, prepared, enabled: false });
  assert.equal(result.decision.status, 'baseline');
  assert.equal(result.decision.reason, 'grouping-unavailable');
  assert.deepEqual(result.decision.reserved, []);
  assert.deepEqual(result.decision.admitted, disabled.decision.admitted);
  assert.equal(
    JSON.stringify(result.evidence),
    JSON.stringify(disabled.evidence),
  );
  assert.ok(result.ranked.every((event) => event.coverage.length === 1));
});
