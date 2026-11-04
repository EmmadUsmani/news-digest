import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { reportTriageWork } from '../../../scripts/report-triage-work';
import { exportTriageEvidence } from '../src/modules/curation/adapters/triage-evidence-file';
import { triageWorkEvidence } from '../src/modules/curation/application/triage-work-evidence';

void test('private exports retain successful writes, strip extra fields and join the final pool', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'triage-evidence-'));
  try {
    const recorder = triageWorkEvidence(
      {
        cached: () => Promise.resolve(undefined),
        cache: () => Promise.resolve(),
      },
      { topicId: 'topic', attemptId: 'attempt' },
      () => Date.parse('2026-11-04T01:00:00Z'),
    );
    const fingerprint = `triage-item-v1:${'a'.repeat(64)}`;
    await recorder.cache.cache(fingerprint, { id: 'article' });
    const rows = recorder
      .attempts()
      .map((row) => ({ ...row, secret: 'must not persist' }));
    const paths = await Promise.all([
      exportTriageEvidence(directory, rows),
      exportTriageEvidence(directory, rows),
    ]);
    assert.notEqual(paths[0], paths[1]);
    for (const path of paths) {
      assert.ok(path);
      assert.equal((await stat(path)).mode & 0o777, 0o600);
      const body = await readFile(path, 'utf8');
      assert.ok(!body.includes('secret'));
      const saved = JSON.parse(body) as { attempts: unknown[] };
      assert.deepEqual(saved.attempts, recorder.attempts());
      const report = reportTriageWork({
        windowStart: '2026-11-04T00:00:00Z',
        windowEnd: '2026-11-04T02:00:00Z',
        finalPoolObservedAt: '2026-11-04T02:00:00Z',
        finalPool: [{ topicId: 'topic', articleId: 'article', fingerprint }],
        attempts: saved.attempts,
      });
      assert.equal(report.reusableArticles, 1);
    }
    assert.equal((await readdir(directory)).length, 2);
    assert.equal(await exportTriageEvidence(directory, []), null);
    await assert.rejects(
      exportTriageEvidence(directory, [rows[0], rows[0]]),
      /Duplicate/,
    );
    await assert.rejects(
      exportTriageEvidence(directory, [{ ...rows[0], fingerprint: 'invalid' }]),
    );
    await assert.rejects(exportTriageEvidence('relative', rows), /absolute/);
    await assert.rejects(
      exportTriageEvidence(join(directory, 'missing'), rows),
      /ENOENT/,
    );
    assert.equal((await readdir(directory)).length, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
