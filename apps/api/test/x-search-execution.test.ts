import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DirectXSearch } from '../src/modules/social/adapters/x-search';
import { searchX } from '../src/modules/social/application/search-x';

const request = {
  topic: 'Fixture',
  guidance: '',
  fromDate: '2026-11-04',
  toDate: '2026-11-05',
};

void test('only completed X search functions establish execution, independently of citations', async () => {
  for (const [name, status, expected] of [
    ['x_keyword_search', 'completed', 'completed'],
    ['x_semantic_search', 'completed', 'completed'],
    ['x_keyword_search', 'failed', 'unconfirmed'],
    ['x_keyword_search', undefined, 'unconfirmed'],
    ['unrelated_tool', 'completed', 'unconfirmed'],
    [undefined, undefined, 'unconfirmed'],
  ] as const) {
    const search = new DirectXSearch(
      'fixture',
      async () =>
        new Response(
          JSON.stringify({
            status: 'completed',
            usage: { input_tokens: 10, output_tokens: 2 },
            output: name ? [{ type: 'custom_tool_call', name, status }] : [],
          }),
        ),
    );
    const events: string[] = [];
    const result = await searchX(
      'topic',
      'run',
      request,
      search,
      {
        reserve: async () => 'call',
        settle: async (_id, usage) => {
          assert.equal(usage.postsFetched, 0);
          assert.equal(usage.inputTokens, 10);
          events.push('settle');
        },
        fail: async () => {
          throw new Error('Unexpected failure');
        },
      },
      {
        save: async () => {
          events.push('save');
        },
      },
      {
        inputPerMillion: 1.25,
        outputPerMillion: 2.5,
        perPost: 0.005,
        perProfile: 0.01,
      },
    );
    assert.equal(result.state, 'completed');
    assert.ok('execution' in result);
    assert.equal(result.execution, expected);
    assert.equal(result.citations, 0);
    assert.deepEqual(events, ['settle', 'save']);
  }
});
