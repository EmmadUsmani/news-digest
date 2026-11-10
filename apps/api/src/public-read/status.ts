import { publicOperationsStatusSchema } from '@digest/contracts';
import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

const status = publicOperationsStatusSchema.extend({
  sources: publicOperationsStatusSchema.shape.sources.element
    .omit({ hasError: true })
    .extend({ error: z.string().nullable() })
    .transform(({ error, ...row }) => ({ ...row, hasError: error !== null }))
    .array(),
});

// Preparation only. Explicit schemas omit job IDs/results, provider call ledger and
// development accounting, including any fields added to the private reader.
// Stored failures become presence flags; queue names/count keys are allowlisted.
export async function readPublicStatus(read: () => Promise<unknown>) {
  try {
    return status.parse(await read());
  } catch {
    throw new ServiceUnavailableException('Status unavailable');
  }
}
