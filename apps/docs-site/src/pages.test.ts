import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { listTree, titleOf } from './pages.ts';

void test('titles come from the first H1, else the file name', () => {
  assert.equal(titleOf('intro\n# Data model\n## x', 'f'), 'Data model');
  assert.equal(titleOf('no heading', 'Fallback'), 'Fallback');
});

void test('lists home, ordered sections and pages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'handbook-'));
  await writeFile(join(root, 'README.md'), '# Home\n');
  await writeFile(join(root, 'zz-notes.md'), 'loose page\n');
  await mkdir(join(root, '10-agent'));
  await mkdir(join(root, '02-app'));
  await mkdir(join(root, '_drafts'));
  await writeFile(join(root, '02-app/README.md'), '# The app\n');
  await writeFile(join(root, '02-app/10-data.md'), '# Data\n');
  await writeFile(join(root, '02-app/02-stack.md'), '# Stack\n');
  await writeFile(join(root, '10-agent/01-loop.md'), '# Loop\n');
  const tree = await listTree(root);
  assert.deepEqual(tree.home, { path: 'README.md', title: 'Home' });
  assert.deepEqual(
    tree.sections.map((s) => [
      s.dir,
      s.title,
      s.index?.path ?? null,
      s.pages.map((p) => p.title),
    ]),
    [
      ['02-app', 'The app', '02-app/README.md', ['Stack', 'Data']],
      ['10-agent', 'Agent', null, ['Loop']],
      ['', 'More', null, ['Zz notes']],
    ],
  );
});
