import type {
  PreviewRepository,
  ReportEditionProgress,
} from '../domain/preview.repository';

export async function generateOnDemandEdition(
  repository: Pick<PreviewRepository, 'generate'>,
  id: string,
  data: { windowStart: string; windowEnd: string },
  reportProgress?: ReportEditionProgress,
) {
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
}
