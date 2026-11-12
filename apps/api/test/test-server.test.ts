import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

for (const ending of ['exit', 'SIGINT', 'SIGTERM'] as const) {
  void test(`test servers and grandchildren release their listener on ${ending}`, async () => {
    const directory = mkdtempSync(join(tmpdir(), 'test-server-owner-'));
    const fixture = join(directory, 'owner.mts');
    const serverCode = `require('node:net').createServer().listen(0, '127.0.0.1', function () { console.log(this.address().port); });`;
    const wrapperCode = `require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(serverCode)}], {stdio: 'inherit'});`;
    writeFileSync(
      fixture,
      `import { spawnTestServer } from ${JSON.stringify(resolve('scripts/lib/test-server.ts'))};
const child = spawnTestServer(process.execPath, ['-e', ${JSON.stringify(wrapperCode)}], {stdio: ['ignore', 'pipe', 'inherit']});
child.stdout.on('data', data => { process.stdout.write(data); ${ending === 'exit' ? 'process.exit(0);' : ''} });`,
    );
    const owner = spawn(process.execPath, ['--import', 'tsx', fixture], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    try {
      const exited = once(owner, 'exit');
      const port = await new Promise<number>((accept, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('fixture startup timeout')),
          10_000,
        );
        owner.stdout.once('data', (data: Buffer) => {
          clearTimeout(timeout);
          accept(Number(data.toString().trim()));
        });
      });
      assert.ok(port > 0);
      if (ending !== 'exit') owner.kill(ending);
      await exited;
      // Rebinding proves the grandchild no longer owns its socket.
      const probe = createServer();
      await new Promise<void>((accept, reject) => {
        probe.once('error', reject);
        probe.listen(port, '127.0.0.1', accept);
      });
      await new Promise<void>((accept, reject) =>
        probe.close((error) => (error ? reject(error) : accept())),
      );
    } finally {
      owner.kill('SIGTERM');
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
