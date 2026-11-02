import type { Pool } from 'pg';

import { llmConfig } from '../adapters/config';
import { readUsage } from '../database/usage.reader';

export function readLlmUsage(db: Pool) {
  return readUsage(db, llmConfig().caps);
}
