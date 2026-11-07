import { appendFile, mkdir, open, rename, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { AlertDestination, type AlertEvent } from './dispatcher';

export const alertDirectory = join(
  homedir(),
  '.local/state/news-digest/alerts',
);
export const alertFile = join(alertDirectory, 'alerts.jsonl');

export class FileAlertDestination extends AlertDestination {
  readonly id = 'file';
  constructor(
    private readonly path = alertFile,
    private readonly maxBytes = 5_000_000,
  ) {
    super();
  }
  async send(event: AlertEvent) {
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    // If delivery succeeded just before state persistence was interrupted, retry is harmless.
    if (
      event.id &&
      (await recentAlertEvents(this.path)).at(-1)?.id === event.id
    )
      return;
    const line = `${JSON.stringify(event)}\n`;
    let size = 0;
    try {
      size = (await stat(this.path)).size;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (Buffer.byteLength(line) > this.maxBytes)
      throw new Error('Alert exceeds log size limit');
    if (size + Buffer.byteLength(line) > this.maxBytes)
      await rename(this.path, `${this.path}.1`);
    await appendFile(this.path, line, { mode: 0o600 });
  }
}

export async function recentAlertEvents(
  path = alertFile,
): Promise<AlertEvent[]> {
  const lines: string[] = [];
  for (const file of [`${path}.1`, path]) {
    try {
      const handle = await open(file, 'r');
      try {
        const size = (await handle.stat()).size;
        const start = Math.max(0, size - 32_768);
        const buffer = Buffer.alloc(size - start);
        await handle.read(buffer, 0, buffer.length, start);
        const text = buffer.toString('utf8');
        lines.push(
          ...(start ? text.slice(text.indexOf('\n') + 1) : text)
            .trim()
            .split('\n')
            .filter(Boolean),
        );
      } finally {
        await handle.close();
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return lines.slice(-5).map((line) => JSON.parse(line) as AlertEvent);
}
