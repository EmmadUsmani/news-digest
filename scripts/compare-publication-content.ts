// GET-only content fingerprints for the phase-0 reader off/on comparison.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import { readerEditionSchema } from '@digest/contracts';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  return value;
}

async function main() {
  const [mode, inventoryPath, baselinePath, originInput] =
    process.argv.slice(2);
  assert.ok(
    ['capture', 'compare'].includes(mode) && inventoryPath && baselinePath,
    'usage: compare-publication-content.ts capture|compare inventory.json baseline.json [origin]',
  );
  const origin = new URL(originInput ?? 'http://127.0.0.1:8000').origin;
  const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'));
  const ids: string[] = inventory.editions
    .filter(
      (edition: { proposedPublication: { publishedAt: string | null } }) =>
        edition.proposedPublication.publishedAt !== null,
    )
    .map((edition: { id: string }) => edition.id)
    .sort();
  assert.ok(ids.length > 0, 'no published candidates');
  assert.equal(new Set(ids).size, ids.length, 'duplicate candidate IDs');
  const editions = [];
  for (const id of ids) {
    const response = await fetch(
      `${origin}/api/editions/${encodeURIComponent(id)}`,
      {
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
      },
    );
    assert.equal(response.status, 200, `${id}: reader HTTP status`);
    const body: unknown = await response.json();
    const edition = readerEditionSchema.parse(body);
    assert.equal(edition.id, id);
    editions.push({
      id,
      // Hash the entire response, including fields stripped by schema parsing.
      sha256: createHash('sha256')
        .update(JSON.stringify(canonical(body)))
        .digest('hex'),
    });
  }
  const receipt = { version: 1, editions };
  if (mode === 'capture') {
    // An existing baseline must never be silently replaced by the new model.
    await writeFile(baselinePath, JSON.stringify(receipt, null, 2) + '\n', {
      flag: 'wx',
    });
  } else {
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    assert.deepEqual(
      receipt,
      baseline,
      'reader content or candidate set changed',
    );
  }
  console.log(`${mode}: ${editions.length} complete reader responses verified`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Comparison failed');
  process.exitCode = 1;
});
