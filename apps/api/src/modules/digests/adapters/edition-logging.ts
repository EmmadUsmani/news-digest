import type { Logger } from 'pino';

import { logger } from '../../../libs/observability/logging';
import type {
  EditionProgress,
  ReportEditionProgress,
} from '../domain/preview.repository';

// Logs observations only. Content, topic names and exception messages stay out.
export async function observeEdition<T extends { id: string }>(
  runId: string,
  generate: (report: ReportEditionProgress) => Promise<T>,
  reportProgress?: ReportEditionProgress,
  log: Logger = logger,
): Promise<T> {
  const started = performance.now();
  const stages = new Map<string, string>();
  let editionStage: EditionProgress['stage'] | undefined;
  log.info({ event: 'edition.start', runId }, 'Edition started');
  try {
    const edition = await generate(async (progress) => {
      if (editionStage !== progress.stage) {
        editionStage = progress.stage;
        log.info(
          { event: 'edition.step', runId, stage: progress.stage },
          'Edition stage',
        );
      }
      for (const topic of progress.topics) {
        if (stages.get(topic.id) === topic.stage) continue;
        stages.set(topic.id, topic.stage);
        log.info(
          { event: 'edition.step', runId, topic: topic.id, stage: topic.stage },
          'Edition topic stage',
        );
      }
      if (reportProgress) await reportProgress(progress);
    });
    log.info(
      {
        event: 'edition.finish',
        runId,
        editionId: edition.id,
        outcome: edition.id === runId ? 'published' : 'reused',
        durationMs: Math.round(performance.now() - started),
      },
      'Edition finished',
    );
    return edition;
  } catch (error) {
    log.warn(
      {
        event: 'edition.failure',
        runId,
        stage: editionStage ?? 'loading',
        durationMs: Math.round(performance.now() - started),
      },
      'Edition attempt failed',
    );
    throw error;
  }
}
