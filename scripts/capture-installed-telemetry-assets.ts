// Explicit local installed-asset capture; no operational endpoints or credentials.
// The isolated browser rehearsal consumes this file without calling live services.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

import inventory from '../docs/native-telemetry-asset-review.json';

async function main() {
  const destination = process.argv[2];
  assert.ok(destination?.startsWith('/tmp/'));
  const assets: Record<string, { body: string; contentType: string }> = {};
  for (const [name, port] of [
    ['metrics', 8428],
    ['logs', 9428],
  ] as const) {
    for (const [path, expected] of Object.entries(inventory.assets[name])) {
      const response = await fetch(`http://127.0.0.1:${port}` + path, {
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('set-cookie'), null);
      assert.equal(response.headers.get('content-type'), expected.contentType);
      const body = Buffer.from(await response.arrayBuffer());
      assert.equal(body.length, expected.bytes);
      assert.equal(
        createHash('sha256').update(body).digest('hex'),
        expected.sha256,
      );
      assets[path] = {
        body: body.toString('base64'),
        contentType: expected.contentType,
      };
    }
  }
  await writeFile(destination, JSON.stringify(assets), {
    flag: 'wx',
    mode: 0o600,
  });
  console.log(
    `${Object.keys(assets).length} reviewed installed telemetry assets captured; no operational reads.`,
  );
}
void main();
