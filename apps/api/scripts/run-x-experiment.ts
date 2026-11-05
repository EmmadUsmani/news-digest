// Explicit live experiment only; no production ingestion or application startup.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { XExperimentBudget } from '../../../scripts/lib/x-experiment-budget';
import {
  experimentWindow,
  type prepareViralXExperimentTopic,
} from '../../../scripts/lib/x-experiment-inputs';
import {
  xSearchTimeoutMs,
  xSearchUsageSchema,
} from '../src/modules/social/adapters/x-search-usage';
import { xDiscoveryCost } from '../src/modules/social/domain/x-discovery-budget';

async function main() {
  if (
    process.env.X_EXPERIMENT_LIVE !== '1' ||
    ![3, 4].includes(process.argv.length)
  )
    throw new Error('Explicit live opt-in and prepared input path required');
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('Configured xAI key required');
  const input = JSON.parse(readFileSync(process.argv[2], 'utf8')) as {
    window: { start: string; end: string };
    topics: ReturnType<typeof prepareViralXExperimentTopic>[];
  };
  const window = experimentWindow(input.window.start, input.window.end);
  const now = new Date();
  if (
    Date.parse(window.end) - Date.parse(window.start) !== 86_400_000 ||
    Date.parse(window.end) > now.getTime() ||
    now.getUTCHours() < 21
  )
    throw new Error(
      'Fresh 24-hour window and dispatch after 21:00 UTC required',
    );
  if (
    new Set(input.topics.map((topic) => topic.topicId)).size !== 4 ||
    input.topics.some((topic) => !topic.topicId.trim())
  )
    throw new Error('Four distinct topic IDs required');
  if (input.topics.length !== 4 || input.topics.some((topic) => !topic.ready))
    throw new Error('Four prepared topics required');
  for (const topic of input.topics)
    for (const style of ['viral', 'semantic'] as const)
      if (topic.requests[style]?.model !== 'grok-4.3')
        throw new Error('Expected prepared viral and semantic Grok 4.3 bodies');
  const directory = join(homedir(), '.local/state/news-digest/x-experiment');
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const budget = new XExperimentBudget(join(directory, 'budget.json'));
  const roundId =
    process.argv[3] ?? new Date().toISOString().replace(/[:.]/g, '-');
  const roundDirectory = join(directory, roundId);
  if (!process.argv[3]) mkdirSync(roundDirectory, { mode: 0o700 });
  const save = (name: string, value: unknown) =>
    writeFileSync(
      join(roundDirectory, name),
      JSON.stringify(value, null, 2) + '\n',
      {
        mode: 0o600,
        flag: 'wx',
      },
    );
  if (!process.argv[3]) save('inputs.json', input);
  else if (
    JSON.stringify(
      JSON.parse(readFileSync(join(roundDirectory, 'inputs.json'), 'utf8')),
    ) !== JSON.stringify(input)
  )
    throw new Error('Continue requires the original prepared inputs');
  const calls: { requestId: string; startedAt: string; costMicros: number }[] =
    [];
  const priorRequests = readdirSync(roundDirectory)
    .filter((name) => name.endsWith('.request.json'))
    .map(
      (name) =>
        JSON.parse(readFileSync(join(roundDirectory, name), 'utf8')) as {
          requestId: string;
          startedAt: string;
        },
    );
  for (const prior of priorRequests) {
    const settledPath = join(roundDirectory, `${prior.requestId}.settled.json`);
    if (existsSync(settledPath))
      calls.push({
        ...prior,
        costMicros: (
          JSON.parse(readFileSync(settledPath, 'utf8')) as {
            costMicros: number;
          }
        ).costMicros,
      });
  }
  const started = priorRequests.length
    ? Math.min(...priorRequests.map((prior) => Date.parse(prior.startedAt)))
    : Date.now();
  // Interleave topics within styles so the comparison uses one close dispatch window.
  for (const style of ['viral', 'semantic'] as const) {
    for (const topic of input.topics) {
      if (Date.now() - started >= 3_600_000)
        throw new Error('Comparison hour elapsed; no further dispatch');
      const body = topic.requests[style];
      if (!body || body.model !== 'grok-4.3')
        throw new Error('Expected prepared Grok 4.3 body');
      const requestId = `${roundId}-${topic.topicId}-${style}`;
      // Continuing visits only cells never attempted; unknown outcomes are never retried.
      if (existsSync(join(roundDirectory, `${requestId}.request.json`)))
        continue;
      budget.reserve(requestId, 150_000);
      const startedAt = new Date().toISOString();
      save(`${requestId}.request.json`, {
        requestId,
        startedAt,
        topicId: topic.topicId,
        topic: topic.topic,
        style,
        window: input.window,
        body,
      });
      budget.claimDispatch(requestId);
      const response = await fetch('https://api.x.ai/v1/responses', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(xSearchTimeoutMs),
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).catch((error: unknown) => {
        save(`${requestId}.failure.json`, {
          failedAt: new Date().toISOString(),
          errorName: error instanceof Error ? error.name : 'UnknownError',
          outcome: 'unknown; reservation retained',
        });
        throw error;
      });
      const raw = await response.text();
      save(`${requestId}.response.json`, {
        status: response.status,
        receivedAt: new Date().toISOString(),
        raw,
      });
      if (!response.ok)
        throw new Error('Provider rejected call; hold retained, no retry');
      const usage = xSearchUsageSchema.parse(JSON.parse(raw).usage);
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
      budget.settle(requestId, costMicros);
      calls.push({ requestId, startedAt, costMicros });
      save(`${requestId}.settled.json`, { costMicros, usage });
      console.log(
        JSON.stringify({
          topic: topic.topic,
          style,
          costMicros,
          totalMicros: calls.reduce((sum, call) => sum + call.costMicros, 0),
          postsFetched: usage.server_side_tool_usage_details.x_posts_fetched,
        }),
      );
      if (costMicros > 150_000)
        throw new Error('Call exceeded owner reservation; experiment stopped');
    }
  }
  save('round.json', {
    model: 'grok-4.3',
    topicIds: input.topics.map((topic) => topic.topicId),
    calls,
  });
  console.log(
    JSON.stringify({
      roundId,
      calls: calls.length,
      costMicros: calls.reduce((sum, call) => sum + call.costMicros, 0),
    }),
  );
}
void main().catch(() => {
  console.error(
    'X experiment stopped; inspect private saved evidence and journal. No automatic retry.',
  );
  process.exitCode = 1;
});
