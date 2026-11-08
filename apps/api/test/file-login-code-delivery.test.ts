import assert from 'node:assert/strict';
import { chmod, mkdtemp, readdir, rm, stat, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { FileLoginCodeDelivery } from '../src/modules/accounts/adapters/file-login-code-delivery';

void test('stand-in mailbox isolates recipients, replaces atomically and enforces expiry and permissions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'login-mailbox-'));
  const directory = join(root, 'mail');
  const mailbox = new FileLoginCodeDelivery(directory);
  const now = new Date('2026-11-08T18:00:00Z');
  const expiry = new Date(now.getTime() + 600_000);
  try {
    assert.throws(() => new FileLoginCodeDelivery('relative'));
    assert.equal(await mailbox.latest('missing@example.test', now), null);
    await mailbox.deliver('one@example.test', '123456', expiry);
    await mailbox.deliver('two@example.test', '654321', expiry);
    assert.equal(await mailbox.latest('one@example.test', now), '123456');
    assert.equal(await mailbox.latest('two@example.test', now), '654321');
    assert.equal(await mailbox.latest('one@example.test', expiry), null);
    await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        mailbox.deliver('one@example.test', String(i).padStart(6, '0'), expiry),
      ),
    );
    assert.match(
      (await mailbox.latest('one@example.test', now)) ?? '',
      /^00000[0-7]$/,
    );
    const names = await readdir(directory);
    assert.equal(names.length, 2);
    for (const name of names) {
      assert.match(name, /^[a-f0-9]{64}\.json$/);
      assert.equal((await stat(join(directory, name))).mode & 0o777, 0o600);
    }
    const message = join(directory, names[0]);
    await chmod(message, 0o644);
    // Check each recipient since the directory listing order is unspecified.
    await assert.rejects(
      Promise.all(
        ['one@example.test', 'two@example.test'].map((email) =>
          mailbox.latest(email, now),
        ),
      ),
      /owner-only/,
    );
    await chmod(directory, 0o755);
    await assert.rejects(
      mailbox.deliver('one@example.test', '111111', expiry),
      /owner-only/,
    );
    const link = join(root, 'link');
    await symlink(directory, link);
    await assert.rejects(
      new FileLoginCodeDelivery(link).latest('one@example.test', now),
      /owner-only/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
