import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adminEditionDetailQuery,
  adminEditionQuery,
  adminHistoryQuery,
  HttpError,
  publicPreviewDetailQuery,
  publicPreviewHistoryQuery,
  publicPreviewLatestQuery,
} from '../../web/src/queries';

const id = '00000000-0000-4000-8000-000000000001';
const edition = {
  id,
  createdAt: '2026-11-10T15:00:00Z',
  windowStart: '2026-11-09T15:00:00Z',
  windowEnd: '2026-11-10T15:00:00Z',
  topics: [],
};

void test('prepared public preview queries parse sanitized responses and isolate private caches', async () => {
  const requests: string[] = [];
  let response: unknown = { ...edition, method: 'private diagnostic' };
  let status = 200;
  const previous = globalThis.fetch;
  globalThis.fetch = async (url) => {
    requests.push(
      typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
    );
    return Response.json(response, { status });
  };
  const run = async (query: unknown) => {
    const options = query as {
      queryKey: readonly unknown[];
      retry: boolean;
      queryFn: (context: unknown) => Promise<unknown>;
    };
    assert.equal(options.retry, false);
    return options.queryFn({
      queryKey: options.queryKey,
      signal: new AbortController().signal,
    });
  };
  try {
    const latest = publicPreviewLatestQuery;
    const history = publicPreviewHistoryQuery(20);
    const detail = publicPreviewDetailQuery(id);
    for (const [prepared, privateQuery] of [
      [latest, adminEditionQuery],
      [history, adminHistoryQuery(20)],
      [detail, adminEditionDetailQuery(id)],
    ]) {
      assert.equal(prepared.queryKey[0], 'public');
      assert.notDeepEqual(prepared.queryKey, privateQuery.queryKey);
    }
    assert.deepEqual(await run(latest), edition);
    assert.deepEqual(await run(detail), edition);
    response = {
      entries: [{ ...edition, method: 'private diagnostic' }],
      hasMore: true,
    };
    const { topics: _topics, ...entry } = edition;
    assert.deepEqual(await run(history), {
      entries: [{ ...entry, topics: [] }],
      hasMore: true,
    });
    assert.deepEqual(requests, [
      '/api/admin/digest-previews/latest',
      `/api/admin/digest-previews/${id}`,
      '/api/admin/digest-previews?offset=20',
    ]);
    response = null;
    assert.equal(await run(latest), null);
    await assert.rejects(run(detail));
    response = { entries: [{ id }], hasMore: false };
    await assert.rejects(run(history));
    for (status of [401, 403, 404, 503]) {
      const before = requests.length;
      await assert.rejects(
        run(latest),
        (error) => error instanceof HttpError && error.status === status,
      );
      assert.equal(requests.length, before + 1);
    }
    status = 200;
    response = edition;
    await run(publicPreviewDetailQuery('../cost?private=1'));
    assert.equal(
      requests.at(-1),
      '/api/admin/digest-previews/..%2Fcost%3Fprivate%3D1',
    );
  } finally {
    globalThis.fetch = previous;
  }
});
