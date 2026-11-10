// Local refusal checks only. Never supplies mutation credentials.
import assert from 'node:assert/strict';

async function main() {
  const base = 'http://127.0.0.1:8428/metrics';
  const flagsResponse = await fetch(`${base}/flags`, {
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(flagsResponse.status, 200);
  const flags = await flagsResponse.text();
  for (const name of ['deleteAuthKey', 'forceMergeAuthKey']) {
    assert.match(
      flags,
      new RegExp(`^-${name}="secret"$`, 'm'),
      `Missing redacted ${name}; refusing to probe mutation endpoints`,
    );
  }

  // Empty selectors cannot delete samples. The impossible partition prefix also
  // prevents a merge if a future server version accidentally bypasses auth.
  for (const path of [
    '/api/v1/admin/tsdb/delete_series',
    '/tags/delSeries',
    '/internal/force_merge?partition_prefix=mutation-guard-no-such-partition',
  ]) {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
    });
    assert.equal(
      response.status,
      401,
      `Expected unauthenticated refusal: ${path}`,
    );
    await response.body?.cancel();
  }
  console.log(
    'Metrics mutation guards: three unauthenticated requests refused (401).',
  );
}
void main();
