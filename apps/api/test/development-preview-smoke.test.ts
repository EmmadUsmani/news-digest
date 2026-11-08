import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTestEditionPost } from '../scripts/smoke-previews';

void test('preview smoke targets private tests with free defaults and explicit development AI only', async () => {
  for (const aiEditing of [undefined, false, true]) {
    let calls = 0;
    const post = createTestEditionPost(async (url, init) => {
      calls++;
      assert.equal(
        url,
        'http://127.0.0.1:8000/api/admin/digest-previews/tests',
      );
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(init?.body as string), {
        windowStart: '2026-11-07T00:00:00.000Z',
        windowEnd: '2026-11-08T00:00:00.000Z',
        aiEditing: aiEditing === true,
        paidXSearch: false,
      });
      return new Response(null, { status: 503 });
    }, aiEditing);
    const response = await post({
      windowStart: '2026-11-07T00:00:00.000Z',
      windowEnd: '2026-11-08T00:00:00.000Z',
      aiEditing: true,
      paidXSearch: true,
    });
    assert.equal(response.status, 503);
    assert.equal(
      calls,
      1,
      'Refusals must not retry or use the production endpoint',
    );
  }
});
