// Explicit deployed-loopback acceptance. No codes requested, identities created,
// credentials redeemed, or authenticated writes; this is not proxy/TLS proof.
import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:8000';
const origin = 'https://news-digest.exe.xyz';
const client = { 'X-Forwarded-For': '192.0.2.159' };
const routes: [string, unknown][] = [
  ['links', { email: 'boundary-acceptance@example.invalid' }],
  ['sessions/revoke', { userId: '00000000-0000-4000-8000-000000000159' }],
  ['delete', { confirmation: 'DELETE' }],
  ['sync', { version: 1, hiddenTopics: {}, bookmarks: {} }],
  ['logout', {}],
  ['logout-all', {}],
];

async function check(
  path: string,
  status: number,
  data?: unknown,
  headers: Record<string, string> = {},
) {
  const response = await fetch(`${base}/api/account/${path}`, {
    method: data === undefined ? 'GET' : 'POST',
    headers: {
      ...client,
      ...(data === undefined
        ? {}
        : { Origin: origin, 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(response.status, status, `${path}: unexpected HTTP status`);
  assert.equal(response.headers.get('cache-control'), 'no-store', path);
  assert.equal(response.headers.get('set-cookie'), null, path);
  return response;
}

async function main() {
  const session = await check('session', 200);
  assert.deepEqual(await session.json(), { signedIn: false, isAdmin: false });
  let checks = 1;
  for (const [path, body] of routes) {
    await check(path, 401, body);
    await check(path, 400, body, { Origin: 'https://other.example.invalid' });
    await check(path, 400, body, { Origin: 'null' });
    await check(path, 400, body, { 'Content-Type': 'text/plain' });
    checks += 4;
  }
  // Invalid payloads stop before code admission, mailbox delivery or redemption.
  for (const path of ['code', 'redeem', 'link-redeem']) {
    await check(path, 400, {});
    await check(path, 400, {}, { Origin: 'https://other.example.invalid' });
    checks += 2;
  }
  const malformed = await check('session', 200, undefined, {
    Cookie: '__Host-reader_session=malformed',
  });
  assert.deepEqual(await malformed.json(), { signedIn: false, isAdmin: false });
  checks++;
  console.log(
    `${checks} deployed-loopback account boundary checks pass: anonymous writes, cross-origin requests, wrong content types and malformed payloads refused; no cookies issued or account credentials requested.`,
  );
}

void main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Boundary check failed',
  );
  process.exitCode = 1;
});
