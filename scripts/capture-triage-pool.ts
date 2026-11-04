// Read-only current production-pool evidence. No cache, model or queue calls.
import { writeFileSync } from 'node:fs';

import { relevancePolicySchema } from '@digest/contracts';

import { database } from '../apps/api/src/libs/db/connections';
import { loadArticleCandidates } from '../apps/api/src/modules/digests/database/article-candidates';
import { qualityRejection } from '../apps/api/src/modules/digests/domain/quality';
import type { Candidate } from '../apps/api/src/modules/digests/domain/rank';
import { assessRelevance } from '../apps/api/src/modules/digests/domain/relevance';

export function poolOptions(args: string[], now = Date.now()) {
  const [start, end, path] = args;
  const from = Date.parse(start);
  const to = Date.parse(end);
  if (
    args.length !== 3 ||
    !path ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= to ||
    from > now ||
    to - from > 48 * 3600000
  )
    throw new Error(
      'Expected START END OUTPUT_FILE: started window, at most 48 hours',
    );
  return { start: new Date(from), end: new Date(to), path };
}

// Mirrors edition triage admission, including semantic recovery of missing
// required phrases. Captures are prospective observations, never backdated.
export function poolAdmission(
  candidates: Candidate[],
  policy: unknown,
  storyBudget: number,
) {
  const parsed = relevancePolicySchema.parse(policy);
  return candidates.map((candidate) => ({
    ...candidate,
    triageEligible:
      storyBudget > 0 &&
      !qualityRejection(candidate) &&
      assessRelevance(candidate, { ...parsed, includeAny: [] }).eligible,
  }));
}

async function main() {
  const options = poolOptions(process.argv.slice(2));
  const db = database();
  const client = await db.connect();
  try {
    await client.query(
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    await client.query("SET LOCAL statement_timeout = '15s'");
    const capturedAt = (
      await client.query<{ at: Date }>('SELECT transaction_timestamp() AS at')
    ).rows[0].at;
    const topics = (
      await client.query<{
        id: string;
        name: string;
        description: string;
        include_guidance: string;
        exclude_guidance: string;
        relevance_policy: unknown;
        story_budget: number;
      }>(`SELECT id,name,description,include_guidance,exclude_guidance,relevance_policy,story_budget
      FROM topics WHERE enabled AND profile_id='00000000-0000-4000-8000-000000000001' ORDER BY position,id`)
    ).rows;
    const pools = [];
    for (const topic of topics) {
      const candidates = await loadArticleCandidates(
        client,
        topic.id,
        options.start,
        options.end,
      );
      pools.push({
        topic,
        candidates: poolAdmission(
          candidates,
          topic.relevance_policy,
          topic.story_budget,
        ),
      });
    }
    await client.query('COMMIT');
    writeFileSync(
      options.path,
      JSON.stringify(
        {
          capturedAt,
          windowStart: options.start,
          windowEnd: options.end,
          evidence:
            'Current edition loader (newest 200 per topic), current text/settings and hard-exclusion admission. Not historical membership, cache misses, scored work, spend or latency. Compare only captures for the same edition window; eligibility loss is potential waste until matched to actual scoring.',
          pools,
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600, flag: 'wx' },
    );
    console.log(
      JSON.stringify({
        capturedAt,
        path: options.path,
        topics: pools.map(({ topic, candidates }) => ({
          topic: topic.name,
          candidates: candidates.length,
          eligible: candidates.filter((c) => c.triageEligible).length,
        })),
      }),
    );
  } finally {
    client.release();
    await db.end();
  }
}

if (require.main === module)
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Capture failed');
    process.exitCode = 1;
  });
