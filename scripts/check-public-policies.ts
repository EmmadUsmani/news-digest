// Offline Phase 4 browser checks. Live widgets and proxy acceptance are separate.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const policies = [
  'form',
  'frame',
  'connect',
  'script',
  'event-handler',
  'image',
  'font',
  'media',
  'worker',
] as const;

for (const policy of policies) {
  console.log(`Public policy: ${policy}`);
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', `scripts/check-public-${policy}-policy.ts`],
    { cwd: root, stdio: 'inherit', timeout: 120_000 },
  );
  if (result.error || result.status !== 0) {
    console.error(`Public policy failed: ${policy}`);
    if (result.error) console.error(result.error.message);
    process.exitCode = result.status || 1;
    break;
  }
}

if (!process.exitCode) {
  console.log(
    `PASS: ${policies.length} offline public browser policies, including private rollback.`,
  );
}
