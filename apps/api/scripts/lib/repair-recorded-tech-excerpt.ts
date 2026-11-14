import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { contentItems } from '../../src/libs/db/schema';

// One reviewed data correction, not a headline classifier. Never used by ingestion.
const recorded = JSON.parse(
  readFileSync(
    join(__dirname, '../../test/fixtures/google-hud-stored-2026-11-14.json'),
    'utf8',
  ),
) as {
  url: string;
  title: string;
  excerpt: string;
  publisher: { name: string; url: string };
};

export async function repairRecordedTechExcerpt(
  pool: Pool,
  id: string,
  apply: boolean,
) {
  return drizzle(pool).transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, id))
      .for('update');
    assert(item, 'Recorded candidate is missing');
    assert.equal(item.canonicalUrl, recorded.url, 'Candidate URL changed');
    assert.equal(item.title, recorded.title, 'Candidate title changed');
    assert.deepEqual(item.publisher, recorded.publisher, 'Publisher changed');
    if (item.excerpt === '') return { status: 'already-cleared', id };
    assert.equal(
      item.excerpt,
      recorded.excerpt,
      'Excerpt changed; refusing repair',
    );
    if (!apply) return { status: 'would-clear', id };
    const rows = await tx
      .update(contentItems)
      .set({ excerpt: '' })
      .where(eq(contentItems.id, id))
      .returning({ id: contentItems.id });
    assert.equal(rows.length, 1);
    return { status: 'cleared', id };
  });
}
