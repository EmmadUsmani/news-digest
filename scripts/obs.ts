import { runObsCli } from './lib/obs-query';

void runObsCli(process.argv.slice(2)).then(
  ({ output, exitCode }) => {
    console.log(output.trim());
    process.exitCode = exitCode;
  },
  (error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Local query failed',
    );
    process.exitCode = 1;
  },
);
