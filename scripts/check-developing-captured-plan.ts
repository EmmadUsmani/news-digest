// Offline only: no provider, database, environment config or ledger access.
import { readFileSync, writeFileSync } from 'node:fs';

import { developingCapturedPlan } from './lib/developing-captured-plan';

export function checkDevelopingCapturedPlan(
  inputPath: string,
  outputPath: string,
) {
  const input = JSON.parse(readFileSync(inputPath, 'utf8')) as Parameters<
    typeof developingCapturedPlan
  >[0];
  input.budget.now = new Date(input.budget.now);
  const report = {
    purpose:
      'Offline supplied-capture coverage and budget check only; not runtime admission, semantic acceptance or ledger reservation.',
    ...developingCapturedPlan(input),
  };
  writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n', {
    flag: 'wx',
    mode: 0o600,
  });
  return report;
}

if (require.main === module) {
  try {
    const [input, output] = process.argv.slice(2);
    if (!input || !output || process.argv.length !== 4)
      throw new Error('Invalid arguments');
    const report = checkDevelopingCapturedPlan(input, output);
    console.log(
      JSON.stringify({
        status: report.status,
        topics: report.topicCount,
        requests: report.requestCount,
        requiredMicros: report.requiredMicros,
      }),
    );
  } catch {
    console.error('Offline edition capture check failed');
    process.exitCode = 1;
  }
}
