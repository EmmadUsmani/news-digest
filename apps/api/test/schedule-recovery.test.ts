import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

// Child processes exercise real signal handling without touching live settings.
void test('schedule probe restores after SIGTERM and preserves an exclusive recovery record', async () => {
  const home = await mkdtemp(join(tmpdir(), 'schedule-recovery-'));
  const profile = {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Default',
    schedule: {
      cadence: '40 20 * * *',
      timezone: 'UTC',
      coverageWindow: 'P1D',
      storyBudget: 5,
      postBudget: 5,
    },
  };
  const original = structuredClone(profile.schedule);
  const requests: string[] = [];
  const server = createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);
    if (
      req.url !== '/api/admin/profile' &&
      req.url !== '/api/admin/profile/schedule'
    ) {
      res.writeHead(404).end();
      return;
    }
    if (req.method === 'PUT' && req.url === '/api/admin/profile/schedule') {
      let body = '';
      req.on('data', (data) => {
        body += String(data);
      });
      req.on('end', () => {
        profile.schedule = JSON.parse(body);
        res.end('{}');
      });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(profile));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  // Signal the node child directly: pnpm does not reliably forward termination.
  const processChild = spawn(
    process.execPath,
    [
      '--import',
      'tsx',
      '-e',
      `import('./scripts/lib/schedule-recovery.ts').then(async (m) => { await (m.protectSchedule ?? m.default.protectSchedule)('${base}'); console.log('ready'); setInterval(() => {}, 1000); });`,
    ],
    { env: { ...process.env, HOME: home }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  processChild.stderr.on('data', (data) => {
    stderr += String(data);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      processChild.stdout.on('data', () => resolve());
      processChild.once('exit', () => reject(new Error(stderr)));
    });
    const path = join(home, '.local/state/news-digest/schedule-recovery.json');
    assert.deepEqual(
      JSON.parse(await readFile(path, 'utf8')).profile.schedule,
      original,
    );
    const duplicate = spawn(
      process.execPath,
      [
        '--import',
        'tsx',
        '-e',
        `import('./scripts/lib/schedule-recovery.ts').then(async (m) => { await (m.protectSchedule ?? m.default.protectSchedule)('${base}'); });`,
      ],
      { env: { ...process.env, HOME: home }, stdio: 'ignore' },
    );
    assert.equal(
      await new Promise<number | null>((resolve) =>
        duplicate.once('exit', resolve),
      ),
      1,
    );
    assert.deepEqual(
      JSON.parse(await readFile(path, 'utf8')).profile.schedule,
      original,
    );
    profile.schedule = { ...original, timezone: 'Asia/Tokyo' };
    const exit = new Promise<number | null>((resolve) =>
      processChild.once('exit', resolve),
    );
    processChild.kill('SIGTERM');
    assert.equal(await exit, 143);
    assert.deepEqual(profile.schedule, original);
    assert.ok(requests.includes('PUT /api/admin/profile/schedule'));
    assert.ok(
      requests.filter((request) => request === 'GET /api/admin/profile')
        .length >= 2,
    );
    await assert.rejects(readFile(path), { code: 'ENOENT' });
  } finally {
    processChild.kill('SIGKILL');
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(home, { recursive: true, force: true });
  }
});
