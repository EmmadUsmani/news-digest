import assert from 'node:assert/strict';
import { test } from 'node:test';

import { protectedStoryObligations } from '../../../scripts/lib/protected-story-obligations';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

const sonnet = {
  id: 'sonnet',
  input: 3,
  output: 15,
  cacheRead: 0.3,
  cacheWrite: 3.75,
};
const haiku = {
  id: 'haiku',
  input: 1,
  output: 5,
  cacheRead: 0.1,
  cacheWrite: 1.25,
};

void test('story obligations bound repairs and accumulated fallback validation hints offline', async () => {
  for (const name of ['NBA', 'Gaming', 'Tech & AI', 'World', 'U.S.']) {
    const topic = { id: name, name, description: '', guidance: '' };
    const candidate = {
      id: 'story',
      title: 'Studio launches game 日',
      excerpt: 'The studio launched a game.',
      sources: ['Publisher'],
      earlierCoverage: {
        headline: 'Studio announces game',
        summary: 'Previously announced.',
      },
      clusterEvidence: [
        {
          id: 'story',
          title: 'Studio launches game 日',
          excerpt: 'The studio launched a game.',
          sources: ['Publisher'],
        },
      ],
    };
    let callback = 0;
    const args: Parameters<ShortlistEditor['edit']> = [
      topic,
      [candidate],
      5,
      'edition',
      () => {
        callback++;
      },
    ];
    const before = structuredClone(args.slice(0, 4));
    const bound = await protectedStoryObligations({ sonnet, haiku, args });
    assert.equal(callback, 0);
    assert.equal(bound.requests.length, 4);
    assert.deepEqual(
      bound.requests.map((r) => r.model.id),
      ['sonnet', 'sonnet', 'haiku', 'haiku'],
    );
    const unsupported = JSON.stringify({
      brief: ['Studio launched a game.', 'Studio launched a game.'],
      stories: [
        {
          id: 'story',
          evidenceIds: ['story'],
          headline: 'Studio launches game',
          summary: 'No launch date was announced.',
          whyItMatters: 'A new game.',
          rationale: 'New launch.',
        },
      ],
    });
    for (const responses of [
      ['invalid JSON', '{}'],
      [unsupported, unsupported],
    ]) {
      const actual: LlmRequest[] = [];
      let holds = 0;
      const llm = new BudgetedLlm(
        {
          complete: async (request) => {
            actual.push(structuredClone(request));
            return {
              text: responses[(actual.length - 1) % 2],
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            };
          },
        },
        {
          reserve: async () => String(++holds),
          cached: async () => undefined,
          settle: async () => {},
          fail: async () => {},
          cache: async () => {},
        },
      );
      assert.equal(
        await new ShortlistEditor(llm, sonnet, haiku).edit(
          topic,
          [candidate],
          5,
          'edition',
        ),
        null,
      );
      assert.equal(actual.length, 4);
      for (let i = 0; i < actual.length; i++) {
        const supplied = bound.requests[i];
        assert.deepEqual(
          {
            ...actual[i],
            instructions: supplied.instructions,
            prompt: supplied.prompt,
          },
          supplied,
        );
        assert.ok(
          Buffer.byteLength(actual[i].instructions) <=
            Buffer.byteLength(supplied.instructions),
        );
        assert.ok(
          Buffer.byteLength(actual[i].prompt) <=
            Buffer.byteLength(supplied.prompt),
        );
      }
      if (responses[0] === unsupported)
        assert.ok(
          actual[2].instructions.includes('The rejected field was summary'),
        );
    }
    assert.deepEqual(args.slice(0, 4), before);
    assert.deepEqual(
      (
        await protectedStoryObligations({
          sonnet,
          haiku,
          args: [topic, [], 5, 'edition'],
        })
      ).requests,
      [],
    );
    await assert.rejects(
      protectedStoryObligations({
        sonnet,
        haiku,
        args: [topic, [candidate, candidate], 5, 'edition'],
      }),
      /unique shortlist/,
    );
  }
});
