// Build browser dependencies locally; deploy with an atomic file rename.
import { mkdir, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const root = fileURLToPath(new URL('.', import.meta.url));
await mkdir(root + 'dist', { recursive: true });
const temporary = root + 'dist/app.next.js';
try {
  await build({
    entryPoints: [root + 'public/app.js'],
    outfile: temporary,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    sourcemap: false,
    legalComments: 'eof',
  });
  await rename(temporary, root + 'dist/app.js');
} finally {
  await rm(temporary, { force: true });
}
