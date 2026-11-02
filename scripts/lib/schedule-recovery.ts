import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { profileSettingsSchema } from '@digest/contracts';

// Shared by both schedule-changing probes. Never overwrite an unresolved record.
export async function protectSchedule(base: string, recover = false) {
  const path = join(
    homedir(),
    '.local/state/news-digest/schedule-recovery.json',
  );
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const profile = profileSettingsSchema.parse(
    await (await fetch(`${base}/api/profile`)).json(),
  );
  try {
    if (!recover)
      await writeFile(path, JSON.stringify({ base, profile }), {
        flag: 'wx',
        mode: 0o600,
      });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      throw new Error(
        `Unresolved schedule recovery: ${path}. Restore it before running another probe.`,
      );
    throw error;
  }
  let restoring: Promise<void> | undefined;
  const restore = () =>
    (restoring ??= (async () => {
      const record = JSON.parse(await readFile(path, 'utf8')) as {
        base: string;
        profile: unknown;
      };
      const saved = profileSettingsSchema.parse(record.profile);
      if (record.base !== base || saved.id !== profile.id)
        throw new Error('Schedule recovery target mismatch');
      const response = await fetch(`${base}/api/profile/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved.schedule),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok)
        throw new Error(`Schedule restoration failed: ${response.status}`);
      const current = profileSettingsSchema.parse(
        await (
          await fetch(`${base}/api/profile`, {
            signal: AbortSignal.timeout(10000),
          })
        ).json(),
      );
      if (JSON.stringify(current.schedule) !== JSON.stringify(saved.schedule))
        throw new Error('Restored schedule did not match recovery record');
      await unlink(path);
    })());
  const terminate = (signal: NodeJS.Signals) => {
    void restore().then(
      () => process.exit(signal === 'SIGINT' ? 130 : 143),
      (error: unknown) => {
        console.error(
          'Schedule recovery failed; record retained at',
          path,
          error,
        );
        process.exit(1);
      },
    );
  };
  process.once('SIGINT', terminate);
  process.once('SIGTERM', terminate);
  return async () => {
    try {
      await restore();
    } finally {
      process.removeListener('SIGINT', terminate);
      process.removeListener('SIGTERM', terminate);
    }
  };
}
