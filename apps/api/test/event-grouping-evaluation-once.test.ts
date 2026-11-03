import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runEventGroupingEvaluationOnce } from '../scripts/event-grouping-evaluation-once';

void test('concurrent executions and later invocations consume one authorization', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'grouping-once-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const execute = async () => ({ memberships: {}, calls: ++calls });
  const results = await Promise.allSettled([
    runEventGroupingEvaluationOnce(directory, execute),
    runEventGroupingEvaluationOnce(directory, execute),
  ]);
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1,
  );
  assert.equal(calls, 1);
  await assert.rejects(runEventGroupingEvaluationOnce(directory, execute), {
    code: 'EEXIST',
  });
  const path = join(directory, 'item-26-evaluation.json');
  assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), {
    memberships: {},
    calls: 1,
  });
  assert.equal((await stat(path)).mode & 0o777, 0o600);
});

void test('provider failure retains authorization and cannot be retried', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'grouping-once-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let calls = 0;
  const execute = async () => {
    calls++;
    throw new Error('uncertain provider outcome');
  };
  await assert.rejects(
    runEventGroupingEvaluationOnce(directory, execute),
    /uncertain provider/,
  );
  await assert.rejects(runEventGroupingEvaluationOnce(directory, execute), {
    code: 'EEXIST',
  });
  assert.equal(calls, 1);
});

void test('empty crash marker blocks calls; output persistence failure never permits another call', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'grouping-once-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const crashed = join(directory, 'crashed');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(crashed);
  await writeFile(join(crashed, 'item-26-evaluation.claim'), '');
  let calls = 0;
  const execute = async () => ++calls;
  await assert.rejects(runEventGroupingEvaluationOnce(crashed, execute), {
    code: 'EEXIST',
  });
  assert.equal(calls, 0);
  await writeFile(
    join(directory, 'item-26-evaluation.json'),
    'existing report',
  );
  await assert.rejects(runEventGroupingEvaluationOnce(directory, execute), {
    code: 'EEXIST',
  });
  await assert.rejects(runEventGroupingEvaluationOnce(directory, execute), {
    code: 'EEXIST',
  });
  assert.equal(calls, 1);
  assert.equal(
    await readFile(join(directory, 'item-26-evaluation.json'), 'utf8'),
    'existing report',
  );
});
