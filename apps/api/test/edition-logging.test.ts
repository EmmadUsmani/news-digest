import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLogger } from '../src/libs/observability/logging';
import { observeEdition } from '../src/modules/digests/adapters/edition-logging';
import type { EditionProgress } from '../src/modules/digests/domain/preview.repository';

void test('edition logs deduplicate parallel topic snapshots, preserve progress and distinguish reuse/failure', async () => {
  const lines: Record<string, unknown>[] = [];
  const log = createLogger(
    'test',
    {
      write: (line) => {
        lines.push(JSON.parse(line));
      },
    },
    [],
  );
  const progress: EditionProgress = {
    stage: 'topics',
    topics: [
      { id: 'topic-a', name: 'private topic name', stage: 'triage' },
      { id: 'topic-b', name: 'private topic name', stage: 'triage' },
    ],
  };
  let reports = 0;
  const result = await observeEdition(
    'new',
    async (report) => {
      await report(structuredClone(progress));
      await report(structuredClone(progress));
      progress.topics[1].stage = 'editing';
      await report(structuredClone(progress));
      progress.stage = 'publishing';
      await report(structuredClone(progress));
      return { id: 'new' };
    },
    async () => {
      reports++;
    },
    log,
  );
  assert.equal(result.id, 'new');
  assert.equal(reports, 4);
  assert.equal(lines.filter((line) => line.event === 'edition.step').length, 5);
  assert.equal(lines.at(-1)?.outcome, 'published');
  await observeEdition('retry', async () => ({ id: 'old' }), undefined, log);
  assert.equal(lines.at(-1)?.outcome, 'reused');
  for (const callbackFails of [false, true]) {
    const error = new Error('private provider/database detail');
    await assert.rejects(
      observeEdition(
        'failed',
        async (report) => {
          if (callbackFails) await report(progress);
          throw error;
        },
        async () => {
          throw error;
        },
        log,
      ),
      (actual) => actual === error,
    );
    assert.equal(lines.at(-1)?.event, 'edition.failure');
    assert.equal(lines.at(-1)?.stage, callbackFails ? 'publishing' : 'loading');
  }
  assert.equal(
    lines.filter((line) => line.event === 'edition.finish').length,
    2,
  );
  assert.ok(
    lines
      .filter((line) => line.durationMs !== undefined)
      .every((line) => Number(line.durationMs) >= 0),
  );
  assert.ok(!JSON.stringify(lines).includes('private'));
});
