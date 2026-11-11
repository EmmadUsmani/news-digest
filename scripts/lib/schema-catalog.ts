// Explicit local rehearsal input, using the same restricted role as the explorer.
// Never return this private model from a public HTTP handler.
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import {
  createPool,
  introspect,
} from '../../apps/schema-explorer/src/introspect';
import { buildModel } from '../../apps/schema-explorer/src/model';

export async function readPrivateSchemaCatalog() {
  const env = parseEnv(
    await readFile(`${homedir()}/.config/news-digest/env`, 'utf8'),
  );
  if (!env.SCHEMA_EXPLORER_DATABASE_URL)
    throw new Error('Missing catalog credentials');
  const pool = createPool(env.SCHEMA_EXPLORER_DATABASE_URL);
  try {
    const meta = JSON.parse(
      await readFile('docs/schema-meta.json', 'utf8'),
    ) as unknown;
    return buildModel(await introspect(pool), meta);
  } finally {
    await pool.end();
  }
}
