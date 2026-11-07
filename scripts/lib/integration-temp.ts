import { execFileSync } from 'node:child_process';
import {
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const prefix = 'news-digest-integration-';
const hour = 60 * 60 * 1000;

// Inspect only our UID: other users cannot own a runner's private temp root.
// Fail closed if a live same-user process cannot be inspected.
export function processReferences(
  uid = process.getuid!(),
): string[] | undefined {
  const references: string[] = [];
  for (const pid of readdirSync('/proc').filter((name) => /^\d+$/.test(name))) {
    const base = join('/proc', pid);
    try {
      if (statSync(base).uid !== uid) continue;
      references.push(readFileSync(join(base, 'environ'), 'utf8'));
      references.push(readFileSync(join(base, 'cmdline'), 'utf8'));
      references.push(readlinkSync(join(base, 'cwd')));
      for (const fd of readdirSync(join(base, 'fd'))) {
        try {
          references.push(readlinkSync(join(base, 'fd', fd)));
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }
    } catch (error) {
      // Processes and descriptors can disappear while /proc is being read.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return undefined;
    }
  }
  return references;
}

export function markIntegrationTemp(directory: string) {
  writeFileSync(join(directory, '.runner-pid'), String(process.pid), {
    flag: 'wx',
    mode: 0o600,
  });
}

export function cleanupIntegrationTemps(root: string, now = Date.now()) {
  const removed: string[] = [];
  const directories = readdirSync(root)
    .filter((name) => /^news-digest-integration-[A-Za-z0-9]+$/.test(name))
    .map((name) => join(root, name));
  if (directories.length === 0) return removed;
  let references = processReferences();
  if (!references) {
    try {
      // Some same-user systemd processes are non-dumpable. The VM permits
      // passwordless sudo; output contains matching paths only, never env data.
      references = JSON.parse(
        execFileSync(
          'sudo',
          [
            '-n',
            process.execPath,
            '--import',
            'tsx',
            'scripts/lib/integration-temp-scan.ts',
            String(process.getuid!()),
          ],
          {
            encoding: 'utf8',
            input: JSON.stringify(directories),
            stdio: ['pipe', 'pipe', 'ignore'],
          },
        ),
      ) as string[];
    } catch {
      return removed; // No privilege or inspection failure: delete nothing.
    }
  }
  for (const directory of directories) {
    const name = directory.slice(root.length + 1);
    let info;
    try {
      info = lstatSync(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }
    if (
      !info.isDirectory() ||
      info.uid !== process.getuid!() ||
      now - info.mtimeMs <= hour ||
      references.some((value) => value.includes(directory))
    )
      continue;
    try {
      const pid = Number(readFileSync(join(directory, '.runner-pid'), 'utf8'));
      if (!Number.isSafeInteger(pid) || pid <= 0) continue;
      try {
        process.kill(pid, 0);
        continue; // PID reuse conservatively retains a folder.
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ESRCH') continue;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') continue;
    }
    rmSync(directory, { recursive: true, force: true });
    removed.push(name);
  }
  return removed;
}

export const integrationTempPrefix = prefix;
