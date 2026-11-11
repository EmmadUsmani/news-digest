import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { startRuntimeMetrics } from '@digest/tool-metrics';

import { createExplorerServer } from './http-server.ts';
import { createPool, introspect } from './introspect.ts';
import { buildModel } from './model.ts';

// Live, read-only DB schema explorer. Every /api/schema request introspects the
// database, so new migrations appear without a rebuild or restart.
startRuntimeMetrics('schema', 9467);
const port = Number(process.env.SCHEMA_EXPLORER_PORT ?? 8200);
const repo = resolve(process.env.REPO_ROOT ?? process.cwd());
const metaPath = join(repo, 'docs/schema-meta.json');
const publicDir = resolve(import.meta.dirname, '../public');
const pool = createPool(
  process.env.SCHEMA_EXPLORER_DATABASE_URL ??
    'postgres://postgres@127.0.0.1:5432/news_digest',
);
async function readMeta() {
  try {
    return JSON.parse(await readFile(metaPath, 'utf8')) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    return { __error: String(error) };
  }
}

const server = createExplorerServer({
  publicDir,
  structuralOnly: process.env.SCHEMA_EXPLORER_STRUCTURAL_ONLY === '1',
  health: () => pool.query('SELECT 1'),
  loadModel: async () => {
    const meta = await readMeta();
    const broken =
      typeof meta === 'object' && meta !== null && '__error' in meta;
    const model = buildModel(await introspect(pool), broken ? undefined : meta);
    if (broken)
      model.warnings.unshift(
        'docs/schema-meta.json could not be parsed; showing raw schema.',
      );
    return model;
  },
});

// Loopback only: the API exposes this under a subpath (see apps/api/src/internal-tools.ts).
server.listen(port, process.env.HOST ?? '127.0.0.1', () =>
  console.log(`schema-explorer listening on :${port}`),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => {
    server.close();
    void pool.end();
  });
