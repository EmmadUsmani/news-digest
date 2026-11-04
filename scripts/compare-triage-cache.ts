// Offline fingerprint comparison. No database, provider, cache writes or secrets.
import { readFileSync } from 'node:fs';

import { relevancePolicySchema } from '@digest/contracts';
import { z } from 'zod';

import { CandidateTriage } from '../apps/api/src/modules/curation/application/triage';
import { comparePools } from './compare-triage-pools';

const schema = z.object({
  pools: z.array(
    z.object({
      topic: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        include_guidance: z.string(),
        exclude_guidance: z.string(),
        relevance_policy: relevancePolicySchema,
      }),
      candidates: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          excerpt: z.string().nullable(),
          sources: z.array(z.string()),
          triageEligible: z.boolean(),
        }),
      ),
    }),
  ),
});

async function fingerprints(input: unknown, model: string) {
  const capture = schema.parse(input);
  const result = new Map<string, Map<string, string>>();
  for (const { topic, candidates } of capture.pools) {
    const eligible = candidates.filter((c) => c.triageEligible);
    const keys: string[] = [];
    const triage = new CandidateTriage(
      {
        json: () =>
          Promise.reject(new Error('Offline comparison cannot score')),
      },
      {
        cached: (key) => {
          keys.push(key);
          return Promise.resolve(null);
        },
        cache: () =>
          Promise.reject(new Error('Offline comparison cannot write cache')),
      },
      { id: model, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
    );
    const policy = topic.relevance_policy;
    await triage.pending(
      {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        guidance: `${topic.include_guidance}\nExclude: ${topic.exclude_guidance}\nRequired phrases: ${policy.includeAny.join(', ')}\nExcluded phrases: ${policy.excludeAny.join(', ')}`,
      },
      eligible,
    );
    result.set(topic.id, new Map(eligible.map((c, i) => [c.id, keys[i]])));
  }
  return result;
}

export async function compareTriageCache(
  before: unknown,
  after: unknown,
  model: string,
) {
  if (!model.trim()) throw new Error('Expected explicit triage model ID');
  const membership = comparePools(before, after);
  const oldKeys = await fingerprints(before, model);
  const newKeys = await fingerprints(after, model);
  return {
    ...membership,
    model,
    evidence:
      'Prospective fingerprint compatibility using current article triage instructions and an explicit model held constant across captures. No cache contents or actual scoring observed; compatible entries may not exist. Lost or changed entries are potential waste only. Not spend, latency or final-edition membership.',
    topics: membership.topics.map((topic) => {
      const previous = oldKeys.get(topic.topicId) ?? new Map<string, string>();
      const current = newKeys.get(topic.topicId) ?? new Map<string, string>();
      const compatible = [...previous].filter(
        ([id, key]) => current.get(id) === key,
      ).length;
      return {
        ...topic,
        compatibleFingerprints: compatible,
        changedRetainedFingerprints: topic.retainedEligible - compatible,
        potentiallyUnusablePriorFingerprints: previous.size - compatible,
      };
    }),
  };
}

if (require.main === module) {
  void (async () => {
    const [before, after, model, ...extra] = process.argv.slice(2);
    if (!before || !after || !model || extra.length)
      throw new Error('Expected BEFORE_CAPTURE AFTER_CAPTURE TRIAGE_MODEL_ID');
    console.log(
      JSON.stringify(
        await compareTriageCache(
          JSON.parse(readFileSync(before, 'utf8')),
          JSON.parse(readFileSync(after, 'utf8')),
          model,
        ),
      ),
    );
  })().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Comparison failed');
    process.exitCode = 1;
  });
}
