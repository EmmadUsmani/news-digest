import assert from 'node:assert/strict';

import { readerEditionSchema, topicSchema } from '@digest/contracts';

import { localAdminFetch } from './lib/local-admin-fetch';

// Read-only deployment check. Credentials remain in Node and never follow redirects.
const origin = 'http://127.0.0.1:8000';
const paths = [
  '/docs',
  '/db/',
  '/grafana/',
  '/logs/',
  '/metrics/',
  '/queues/',
  '/admin',
  '/admin/editions',
  '/admin/editions/new',
  '/admin/editions/00000000-0000-4000-8000-000000000001',
  '/admin/sources',
  '/admin/topics',
  '/admin/topics/00000000-0000-4000-8000-000000000001',
  '/admin/schedule',
  '/admin/spend',
  '/admin/tools',
  '/api/admin',
  '/api/admin/topics',
  '/api/admin/profile',
  '/api/admin/status',
  '/api/admin/content',
  '/api/admin/digest-previews',
  '/API/ADMIN/topics?probe=read-only',
  '/api/admin%2Ftopics',
];

async function read(
  path: string,
  init: RequestInit = {},
  credentialed = false,
) {
  return (credentialed ? localAdminFetch : fetch)(origin + path, {
    ...init,
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
}

function privateResponse(response: Response) {
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const vary = response.headers.get('vary')?.toLowerCase().split(/,\s*/);
  assert.ok(vary?.includes('x-exedev-email'));
  assert.ok(vary?.includes('admin_local_token'));
}

async function savedEdition() {
  const response = await read('/api/editions/latest');
  assert.equal(response.status, 200);
  return readerEditionSchema.parse(await response.json());
}

async function smoke() {
  const edition = await savedEdition();
  for (const path of paths) {
    for (const method of ['GET', 'HEAD']) {
      const response = await read(path, { method });
      assert.equal(response.status, 404, `${method} ${path}`);
      privateResponse(response);
      assert.equal(await response.text(), '', `${method} ${path}`);
    }
  }
  for (const headers of [
    {},
    { 'X-ExeDev-Email': 'non-admin-probe@example.invalid' },
    { ADMIN_LOCAL_TOKEN: 'deliberately-invalid-probe-token' },
  ]) {
    const identity = await read('/api/me', { headers });
    assert.equal(identity.status, 200);
    privateResponse(identity);
    assert.deepEqual(await identity.json(), { isAdmin: false });
    for (const path of ['/api/me', '/api/me/']) {
      const head = await read(path, { headers, method: 'HEAD' });
      assert.equal(head.status, 200);
      privateResponse(head);
      assert.equal(head.headers.get('content-type'), 'application/json');
      assert.equal(
        head.headers.get('content-length'),
        String(Buffer.byteLength('{"isAdmin":false}')),
      );
      assert.equal(await head.text(), '');
    }
    const denied = await read('/api/admin/topics', { headers });
    assert.equal(denied.status, 404);
    privateResponse(denied);
    assert.equal(await denied.text(), '');
  }

  for (const path of [
    '/api/topics',
    '/api/profile',
    '/api/status',
    '/api/content',
    '/api/digest-previews',
  ]) {
    for (const credentialed of [false, true]) {
      assert.equal(
        (await read(path, {}, credentialed)).status,
        404,
        `Removed legacy route ${path}`,
      );
    }
  }

  const authorized = await read('/api/admin/topics', {}, true);
  assert.equal(authorized.status, 200, 'Direct local scripts retain access');
  privateResponse(authorized);
  assert.ok(topicSchema.array().parse(await authorized.json()).length);
  for (const name of [
    'Forwarded',
    'X-Forwarded-For',
    'X-Forwarded-Host',
    'X-Forwarded-Proto',
  ]) {
    for (const value of ['', 'read-only-probe']) {
      const denied = await read(
        '/api/admin/topics',
        { headers: { [name]: value } },
        true,
      );
      assert.equal(denied.status, 404, `${name} must reject the local token`);
      privateResponse(denied);
      assert.equal(await denied.text(), '');
    }
  }
  assert.deepEqual(await savedEdition(), edition);
  console.log(
    `Admin gate: ${paths.length} paths deny GET/HEAD; identity and cache policy pass; direct local access works; eight forwarded-token requests denied; saved edition unchanged. Tool denial verified; proxy identity replacement remains a pre-public-access check.`,
  );
}

void smoke();
