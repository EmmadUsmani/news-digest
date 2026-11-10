import { randomUUID } from 'node:crypto';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import type {
  RejectedEditorRecord,
  RejectedEditorStore,
} from '../domain/rejected-editor.port';

// Private diagnostic artifacts, separate from logs, successful cache and exports.
export class FileRejectedEditorStore implements RejectedEditorStore {
  private pending: Promise<void> = Promise.resolve();
  constructor(
    private readonly directory = join(
      homedir(),
      '.local/state/news-digest/rejected-editors',
    ),
  ) {}

  save(record: RejectedEditorRecord): Promise<void> {
    const task = this.pending.then(() => this.write(record));
    this.pending = task.catch(() => {});
    return task;
  }
  private async write(record: RejectedEditorRecord) {
    const body = JSON.stringify({
      savedAt: new Date().toISOString(),
      ...record,
    });
    if (Buffer.byteLength(body) > 256 * 1024)
      throw new Error('Rejected editor artifact exceeds bound');
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const entries = await Promise.all(
      (await readdir(this.directory))
        .filter((name) => /^\d+-[a-f0-9-]+\.json$/.test(name))
        .map(async (name) => ({
          name,
          modified: (await stat(join(this.directory, name))).mtimeMs,
        })),
    );
    entries.sort(
      (a, b) => b.modified - a.modified || b.name.localeCompare(a.name),
    );
    for (const [index, entry] of entries.entries()) {
      if (index >= 99 || entry.modified < Date.now() - 30 * 86400_000)
        await unlink(join(this.directory, entry.name));
    }
    await writeFile(
      join(this.directory, `${Date.now()}-${randomUUID()}.json`),
      body,
      { mode: 0o600, flag: 'wx' },
    );
  }
}
