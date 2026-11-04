import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { start } from 'node:repl';

import { createConsole } from './console';

async function main() {
  process.loadEnvFile(join(homedir(), '.config/news-digest/env'));
  const bindings = await createConsole();
  try {
    await bindings.db.check();
    const history = join(homedir(), '.local/state/news-digest/console-history');
    await mkdir(dirname(history), { recursive: true, mode: 0o700 });
    console.log(
      'Production console: repository calls and SQL can change live data.',
    );
    const repl = start({
      prompt: 'news-digest [PRODUCTION]> ',
      useGlobal: false,
    });
    Object.assign(repl.context, bindings);
    repl.once('exit', () => {
      void bindings.app.close();
    });
    repl.setupHistory(history, (error) => {
      if (error) console.error('Console history unavailable.');
    });
  } catch {
    await bindings.app.close();
    throw new Error(
      'Production console could not start; check local configuration.',
    );
  }
}
void main().catch(() => {
  console.error('Production console failed; check local configuration.');
  process.exitCode = 1;
});
