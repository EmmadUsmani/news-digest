import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Registry } from 'prom-client';

import {
  measuredFetch,
  startExternalMetrics,
} from '../src/libs/observability/external-metrics';

void test('provider transport metrics preserve responses, errors and request identity with private labels', async () => {
  const registry = new Registry();
  startExternalMetrics(registry);
  const input = new Request(
    'https://private.example/secret?token=private-token',
  );
  const init = { headers: { Authorization: 'private-key' } };
  for (const target of ['anthropic', 'xai', 'bluesky'] as const) {
    for (const status of [200, 302, 429, 500]) {
      const response = new Response('private-body', { status });
      const send: typeof fetch = async (received, options) => {
        assert.equal(received, input);
        assert.equal(options, init);
        return response;
      };
      const result = await measuredFetch(target, send)(input, init);
      assert.equal(result, response);
      assert.equal(result.bodyUsed, false);
      assert.equal(await result.text(), 'private-body');
    }
    const failure = new Error('private-transport-error');
    await assert.rejects(
      measuredFetch(target, async () => {
        throw failure;
      })(input),
      (error) => error === failure,
    );
  }
  const metrics = await registry.metrics();
  for (const target of ['anthropic', 'xai', 'bluesky']) {
    for (const [status, outcome] of [
      ['200', 'success'],
      ['302', 'redirect'],
      ['429', 'failure'],
      ['500', 'failure'],
      ['unknown', 'failure'],
    ]) {
      assert.ok(
        metrics.includes(
          `news_digest_external_call_duration_seconds_count{target="${target}",status="${status}",outcome="${outcome}"} 1`,
        ),
      );
    }
  }
  assert.doesNotMatch(metrics, /private|Authorization|token|secret/);
});
