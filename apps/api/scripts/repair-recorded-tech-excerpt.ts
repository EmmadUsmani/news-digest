// Explicit, narrowly guarded correction of reviewed mutable source data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseEnv } from 'node:util';

import { database } from '../src/libs/db/connections';
import { repairRecordedTechExcerpt } from './lib/repair-recorded-tech-excerpt';

async function main() {
  const args = process.argv.slice(2);
  assert(
    args.length === 0 || (args.length === 1 && args[0] === '--apply'),
    'Usage: pnpm exec tsx apps/api/scripts/repair-recorded-tech-excerpt.ts [--apply]',
  );
  Object.assign(
    process.env,
    parseEnv(readFileSync(`${homedir()}/.config/news-digest/env`, 'utf8')),
  );
  const pool = database();
  try {
    console.log(
      JSON.stringify(
        await repairRecordedTechExcerpt(
          pool,
          '00ecd1d3-f1c6-4865-9d04-49c41bcba8cf',
          args[0] === '--apply',
        ),
      ),
    );
  } finally {
    await pool.end();
  }
}
void main();
