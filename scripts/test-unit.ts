import { spawnSync } from 'node:child_process';

import { testEnvironment, testFiles } from './test-suites';

const result = spawnSync(
  'pnpm',
  // Bound each isolated test file, including leaked sockets after test timeout.
  ['exec', 'tsx', '--test', '--test-timeout=60000', ...testFiles('unit')],
  {
    env: testEnvironment(),
    stdio: 'inherit',
  },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
