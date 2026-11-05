import type { EditionJobFailures } from '../domain/edition-job-failures';
import type {
  PreviewRepository,
  ReportEditionProgress,
} from '../domain/preview.repository';

export async function generateOnDemandEdition(
  repository: Pick<PreviewRepository, 'generate'>,
  id: string,
  data: { windowStart: string; windowEnd: string },
  reportProgress?: ReportEditionProgress,
  failures?: EditionJobFailures,
) {
  const started = Date.now();
  try {
    const edition = await repository.generate(
      new Date(data.windowStart),
      new Date(data.windowEnd),
      `on-demand:${id}`,
      reportProgress,
    );
    return {
      editionId: edition.id,
      windowStart: edition.windowStart,
      windowEnd: edition.windowEnd,
    };
  } catch (error) {
    // Preserve the generation error if the database itself is unavailable.
    await failures?.record(id, Date.now() - started).catch(() => {});
    throw error;
  }
}
