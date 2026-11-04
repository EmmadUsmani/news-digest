import { prepareIncrementalTriageRuntime } from './incremental-triage-runtime';
import { database } from './libs/db/connections';
import { PostgresProfileRepository } from './modules/profiles/database/profile.repository';
import { PostgresTopicRepository } from './modules/topics/database/topic.repository';

function workerResources() {
  const db = database();
  const profiles = new PostgresProfileRepository();
  const topics = new PostgresTopicRepository();
  return {
    db,
    async settings() {
      const [profile, rows] = await Promise.all([
        profiles.getDefault(),
        topics.listDefault(),
      ]);
      return {
        schedule: profile.schedule,
        topicIds: rows
          .filter((topic) => topic.enabled)
          .map((topic) => topic.id),
      };
    },
    async close() {
      const results = await Promise.allSettled([
        db.end(),
        profiles.onModuleDestroy(),
        topics.onModuleDestroy(),
      ]);
      const errors = results.flatMap<unknown>((result) =>
        result.status === 'rejected' ? [result.reason as unknown] : [],
      );
      if (errors.length)
        throw new AggregateError(errors, 'Triage resource shutdown failed');
    },
  };
}

// Worker entry point; activation remains gated by the default-off setting.
// Disabled mode allocates no resources.
export async function prepareIncrementalTriageWorker(
  onError: (error: unknown) => void,
  env: NodeJS.ProcessEnv = process.env,
  resources = workerResources,
  runtime = prepareIncrementalTriageRuntime,
) {
  const enabled = env.LLM_INCREMENTAL_TRIAGE_ENABLED ?? '0';
  if (!['0', '1'].includes(enabled))
    throw new Error('Invalid LLM_INCREMENTAL_TRIAGE_ENABLED');
  if (enabled === '0') return async () => {};
  const owned = resources();
  let stop: () => Promise<void>;
  try {
    stop = runtime({
      db: owned.db,
      settings: () => owned.settings(),
      onError,
      everyMs: 60_000,
      env,
    });
  } catch (error) {
    try {
      await owned.close();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Triage startup and cleanup failed',
      );
    }
    throw error;
  }
  let stopping: Promise<void> | undefined;
  return () => {
    stopping ??= (async () => {
      // A rejected drain must not close connections beneath active scoring.
      await stop();
      await owned.close();
    })();
    return stopping;
  };
}
