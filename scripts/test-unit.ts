import { spawnSync } from 'node:child_process';

import { testEnvironment, testFiles } from './test-suites';

const result = spawnSync(
  'pnpm',
  ['exec', 'tsx', '--test', ...testFiles('unit')],
  {
    env: testEnvironment(),
    stdio: 'inherit',
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
