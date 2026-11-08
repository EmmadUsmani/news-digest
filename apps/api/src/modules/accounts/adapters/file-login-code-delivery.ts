import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { lstat, mkdir, open, rename, rm } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

import { LoginCodeDelivery } from '../domain/login-code';

// Prepared only; no application module registers this development mailer.
export class FileLoginCodeDelivery extends LoginCodeDelivery {
  constructor(private readonly directory: string) {
    super();
    if (!isAbsolute(directory))
      throw new Error('Mailbox requires an absolute path');
  }

  async deliver(email: string, code: string, expiresAt: Date): Promise<void> {
    await this.checkDirectory();
    const temporary = join(this.directory, `.${randomUUID()}.tmp`);
    try {
      const file = await open(temporary, 'wx', 0o600);
      try {
        await file.writeFile(
          JSON.stringify({ email, code, expiresAt: expiresAt.toISOString() }),
        );
        await file.sync();
      } finally {
        await file.close();
      }
      await rename(temporary, this.filename(email));
    } finally {
      await rm(temporary, { force: true });
    }
  }

  // Explicit owner retrieval only: callers must never put this result in logs.
  async latest(email: string, now: Date): Promise<string | null> {
    await this.checkDirectory();
    let file;
    try {
      file = await open(
        this.filename(email),
        constants.O_RDONLY | constants.O_NOFOLLOW,
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
    try {
      const stat = await file.stat();
      if (
        !stat.isFile() ||
        stat.uid !== process.getuid?.() ||
        (stat.mode & 0o777) !== 0o600
      )
        throw new Error('Mailbox message must be owner-only');
      const message = JSON.parse(await file.readFile('utf8')) as {
        email: string;
        code: string;
        expiresAt: string;
      };
      return message.email === email &&
        /^\d{6}$/.test(message.code) &&
        Date.parse(message.expiresAt) > now.getTime()
        ? message.code
        : null;
    } finally {
      await file.close();
    }
  }

  private filename(email: string): string {
    return join(
      this.directory,
      `${createHash('sha256').update(email).digest('hex')}.json`,
    );
  }

  private async checkDirectory(): Promise<void> {
    await mkdir(this.directory, { mode: 0o700, recursive: true });
    const stat = await lstat(this.directory);
    if (
      !stat.isDirectory() ||
      stat.isSymbolicLink() ||
      stat.uid !== process.getuid?.() ||
      (stat.mode & 0o777) !== 0o700
    )
      throw new Error('Mailbox directory must be owner-only');
  }
}
