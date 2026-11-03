import { open } from 'node:fs/promises';
import { join } from 'node:path';

// A single VM-local authorization marker, independent of run IDs and UTC days.
// The production caller must supply one fixed, already provisioned persistent
// directory, never /tmp. Provisioning and preflight happen before claiming.
// Never remove the claim on failure: a provider may already have billed the call.
export async function runEventGroupingEvaluationOnce<T>(
  directory: string,
  execute: () => Promise<T>,
): Promise<T> {
  const claim = await open(
    join(directory, 'item-26-evaluation.claim'),
    'wx',
    0o600,
  );
  try {
    await claim.writeFile('Owner-authorized item 26 evaluation claimed\n');
    await claim.sync();
  } finally {
    await claim.close();
  }
  // Persist the directory entry before any potentially paid operation. Failure
  // here consumes authorization too; uncertain persistence must fail closed.
  const parent = await open(directory, 'r');
  try {
    await parent.sync();
  } finally {
    await parent.close();
  }
  const result = await execute();
  // Keep the claim even if saving output fails. A later invocation cannot spend
  // again to recover a lost report. Exclusive output also prevents overwriting.
  const output = await open(
    join(directory, 'item-26-evaluation.json'),
    'wx',
    0o600,
  );
  try {
    await output.writeFile(JSON.stringify(result, null, 2) + '\n');
    await output.sync();
  } finally {
    await output.close();
  }
  const completed = await open(directory, 'r');
  try {
    await completed.sync();
  } finally {
    await completed.close();
  }
  return result;
}
