import { spawn, type SpawnOptions } from 'node:child_process';

// Own the complete process group, including pnpm's server grandchildren.
// Exit hooks also run when a smoke script fails before reaching its finally.
export function spawnTestServer(
  command: string,
  args: string[],
  options: SpawnOptions = {},
) {
  const child = spawn(command, args, { ...options, detached: true });
  let stopped = false;
  const stop = () => {
    if (stopped || !child.pid) return;
    stopped = true;
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
    }
  };
  const interrupt = () => process.exit(130);
  const terminate = () => process.exit(143);
  process.once('exit', stop);
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', terminate);
  const release = () => {
    stop();
    process.removeListener('exit', stop);
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', terminate);
  };
  child.once('error', release);
  // Keep ownership until explicit cleanup: a wrapper can exit before its server.
  return Object.assign(child, { stop: release });
}
