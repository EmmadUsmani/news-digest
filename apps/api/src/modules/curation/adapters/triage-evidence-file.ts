import { randomUUID } from 'node:crypto';
import { link, open, unlink } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

import { z } from 'zod';

const rowsSchema = z
  .array(
    z.object({
      topicId: z.string().min(1).max(200),
      attemptId: z.string().min(1).max(200),
      articleId: z.string().min(1).max(200),
      fingerprint: z.string().regex(/^triage-item-v1:[a-f0-9]{64}$/),
      completedAt: z.string().datetime(),
      outcome: z.literal('scored'),
    }),
  )
  .max(200);

// Prepared export only: caller supplies an existing private directory outside
// the repo and must retain/report failures. No timer or production caller yet.
export async function exportTriageEvidence(directory: string, input: unknown) {
  if (!isAbsolute(directory))
    throw new Error('Expected absolute evidence directory');
  // Parse before opening anything; schema strips non-evidence fields.
  const attempts = rowsSchema.parse(input);
  if (!attempts.length) return null;
  const identities = attempts.map((row) =>
    JSON.stringify([row.topicId, row.attemptId, row.articleId]),
  );
  if (new Set(identities).size !== identities.length)
    throw new Error('Duplicate scoring evidence');
  const id = randomUUID();
  const temporary = join(directory, `.${id}.tmp`);
  const destination = join(directory, `${id}.json`);
  const file = await open(temporary, 'wx', 0o600);
  try {
    await file.writeFile(JSON.stringify({ attempts }) + '\n', 'utf8');
    await file.sync();
    await file.close();
    // Publish the completed file without overwriting any existing export.
    await link(temporary, destination);
    return destination;
  } finally {
    await file.close();
    await unlink(temporary);
  }
}
