import { runObs } from './lib/obs-query';

void runObs(process.argv.slice(2)).then(
  (output) => console.log(output.trim()),
  (error: unknown) => {
    console.error(
      error instanceof Error ? error.message : 'Local query failed',
    );
    process.exitCode = 1;
  },
);
