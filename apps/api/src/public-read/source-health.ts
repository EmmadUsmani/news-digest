import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

const timestamp = z
  .union([z.date(), z.string().datetime({ offset: true })])
  .transform((value) => new Date(value).toISOString())
  .nullable();
const sourceHealth = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    lastAttempt: timestamp,
    lastSuccess: timestamp,
    lastItemCount: z.number().int().nonnegative().safe(),
    storedItems: z.number().int().nonnegative().safe(),
    error: z.string().nullable(),
  })
  .transform(({ error, ...row }) => ({ ...row, hasError: error !== null }));

// Phase 4 preparation only; no live route uses this projection. Historical
// errors are untrusted even when today's ingestion writer sanitizes failures.
// Omit configured URLs completely, rather than trying to redact credentials.
export async function readPublicSourceHealth(read: () => Promise<unknown>) {
  try {
    return sourceHealth.array().parse(await read());
  } catch {
    throw new ServiceUnavailableException('Source health unavailable');
  }
}
