// Offline reconciliation only: never sends a provider request.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { XExperimentBudget } from '../../../scripts/lib/x-experiment-budget';
import { xSearchUsageSchema } from '../src/modules/social/adapters/x-search-usage';
import { xDiscoveryCost } from '../src/modules/social/domain/x-discovery-budget';

if (process.argv.length !== 4)
  throw new Error(
    'Usage: settle-x-experiment.ts <budget.json> <request-id.response.json>',
  );
const [, , journalPath, responsePath] = process.argv;
if (!responsePath.endsWith('.response.json'))
  throw new Error('Saved response filename required');
const evidence = readFileSync(responsePath);
const response = JSON.parse(evidence.toString('utf8')) as {
  status: number;
  raw: string;
};
if (response.status !== 200)
  throw new Error('Successful saved response required');
const usage = xSearchUsageSchema.parse(JSON.parse(response.raw).usage);
const costMicros = xDiscoveryCost(
  {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    postsFetched: usage.server_side_tool_usage_details.x_posts_fetched,
    profilesFetched: usage.server_side_tool_usage_details.x_users_fetched,
  },
  {
    inputPerMillion: 1.25,
    outputPerMillion: 2.5,
    perPost: 0.005,
    perProfile: 0.01,
  },
);
const id = basename(responsePath, '.response.json');
const evidenceSha256 = createHash('sha256').update(evidence).digest('hex');
new XExperimentBudget(journalPath).appendSavedSettlement(
  id,
  costMicros,
  evidenceSha256,
);
console.log(JSON.stringify({ id, costMicros, evidenceSha256 }));
