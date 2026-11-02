// Explicit paid evaluation on frozen feed content; writes no content/edition rows.
// Usage: load configured env, then tsx this file. Never run as part of pnpm check.
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { relevancePolicySchema } from '@digest/contracts';

import { database } from '../src/libs/db/connections';
import type { TriageTopic } from '../src/modules/curation/application/triage';
import { editorialServices } from '../src/modules/curation/public/editorial';
import { editorialShortlist } from '../src/modules/digests/domain/editorial-shortlist';
import type { Candidate } from '../src/modules/digests/domain/rank';

async function main() {
  assert.ok(
    process.env.ANTHROPIC_API_KEY,
    'Load configured secrets environment',
  );
  const filename = 'ranking-nba-2026-11-01.json';
  const input = readFileSync(
    join(__dirname, '../test/fixtures', filename),
    'utf8',
  );
  const fixture = JSON.parse(input) as {
    candidates: Candidate[];
    relevancePolicy: unknown;
    windowStart: string;
    windowEnd: string;
    budget: number;
  };
  assert.ok(
    !existsSync(
      join(__dirname, '../test/fixtures/editorial-nba-2026-11-01.json'),
    ),
    'Recorded snapshot already exists; do not spend or overwrite it',
  );
  const db = database();
  const runId = 'recorded-nba-' + randomUUID();
  try {
    const services = editorialServices(db)!;
    const topic = (
      await db.query<TriageTopic>(
        "SELECT id,name,description,include_guidance || E'\nExclude: ' || exclude_guidance AS guidance FROM topics WHERE name='NBA' AND profile_id='00000000-0000-4000-8000-000000000001'",
      )
    ).rows[0];
    assert.ok(topic);
    const policy = relevancePolicySchema.parse(fixture.relevancePolicy);
    topic.guidance += `\nRequired phrases: ${policy.includeAny.join(', ')}\nExcluded phrases: ${policy.excludeAny.join(', ')}`;
    const triage = await services.triage.score(
      topic,
      fixture.candidates,
      runId,
    );
    assert.equal(
      triage.unscoredIds.length,
      0,
      'Incomplete triage; no snapshot recorded',
    );
    const { ranked } = editorialShortlist(
      fixture.candidates,
      triage.scores,
      policy,
      new Date(fixture.windowStart),
      new Date(fixture.windowEnd),
    );
    const result = await services.editor.edit(
      topic,
      ranked,
      fixture.budget,
      runId,
    );
    assert.ok(result, 'Editor refused; no snapshot recorded');
    const usage = (
      await db.query<{ calls: number; costMicros: number }>(
        'SELECT count(*)::int AS calls,coalesce(sum(cost_micros),0)::int AS "costMicros" FROM llm_calls WHERE run_id=$1',
        [runId],
      )
    ).rows[0];
    const snapshot = {
      provenance:
        'Real configured Anthropic inference over recorded publisher-feed excerpts. Offline evaluation only; not a published edition. Labels were not supplied to either model.',
      recordedAt: new Date().toISOString(),
      runId,
      fixture: filename,
      fixtureSha256: createHash('sha256').update(input).digest('hex'),
      topic,
      triage,
      shortlistIds: ranked.map((s) => s.id),
      result,
      usage,
    };
    writeFileSync(
      join(__dirname, '../test/fixtures/editorial-nba-2026-11-01.json'),
      JSON.stringify(snapshot, null, 2) + '\n',
    );
    console.log(
      JSON.stringify({
        runId,
        ...usage,
        shortlist: ranked.length,
        selected: result.stories.length,
      }),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Recorded evaluation failed; inspect sanitized ledger. No edition published.',
  );
  process.exitCode = 1;
});
