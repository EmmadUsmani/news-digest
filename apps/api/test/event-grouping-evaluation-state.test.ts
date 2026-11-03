import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkEvaluationStateDirectory } from '../scripts/event-grouping-evaluation-state';

void test('state preflight rejects missing, shared and redirected directories', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'grouping-state-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = join(root, 'state');
  await assert.rejects(checkEvaluationStateDirectory(directory));
  await mkdir(directory, { mode: 0o700 });
  await checkEvaluationStateDirectory(directory);
  await chmod(directory, 0o755);
  await assert.rejects(checkEvaluationStateDirectory(directory));
  await chmod(directory, 0o700);
  const alias = join(root, 'alias');
  await symlink(directory, alias);
  await assert.rejects(checkEvaluationStateDirectory(alias));
  await assert.rejects(checkEvaluationStateDirectory(join(alias, '.')));
});
