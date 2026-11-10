import assert from 'node:assert/strict';
import {
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { FileRejectedEditorStore } from '../src/modules/curation/adapters/rejected-editor-store';

void test('private editor artifacts retain replay input and reason with bounded count, age and size', async () => {
  const root = await mkdtemp(join(tmpdir(), 'rejected-editors-'));
  const directory = join(root, 'private');
  const store = new FileRejectedEditorStore(directory);
  const record = {
    request: {
      model: llmConfig({}).haiku,
      purpose: 'shortlist-editor-v13',
      runId: 'fixture',
      prompt: 'input',
      instructions: 'instructions',
      maxOutputTokens: 4000,
    },
    responseText: 'not valid JSON',
    diagnostic: { attempt: 'initial', category: 'invalid-json' },
  };
  try {
    await store.save(record);
    const first = (await readdir(directory))[0];
    assert.equal((await stat(directory)).mode & 0o777, 0o700);
    assert.equal((await stat(join(directory, first))).mode & 0o777, 0o600);
    const saved = JSON.parse(await readFile(join(directory, first), 'utf8'));
    assert.deepEqual(saved.request, record.request);
    assert.equal(saved.responseText, record.responseText);
    await utimes(join(directory, first), new Date(0), new Date(0));
    await writeFile(join(directory, 'unrelated'), 'keep');
    await Promise.all(Array.from({ length: 102 }, () => store.save(record)));
    const names = await readdir(directory);
    assert.equal(names.filter((name) => name.endsWith('.json')).length, 100);
    assert.ok(!names.includes(first));
    assert.ok(names.includes('unrelated'));
    await assert.rejects(
      store.save({ ...record, responseText: 'x'.repeat(256 * 1024) }),
      /exceeds bound/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
