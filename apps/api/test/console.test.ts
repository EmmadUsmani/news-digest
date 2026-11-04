import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Server, Socket } from 'node:net';
import { test } from 'node:test';

const require = createRequire(import.meta.url);

void test('console context starts no listeners or timers and exposes working repositories', async (t) => {
  const { createConsole } =
    require('../dist/console.js') as typeof import('../src/console');
  const unexpected = () => {
    throw new Error('Console started a listener or timer');
  };
  const interval = t.mock.method(globalThis, 'setInterval', unexpected);
  const timeout = t.mock.method(globalThis, 'setTimeout', unexpected);
  const listen = t.mock.method(Server.prototype, 'listen', unexpected);
  const connect = t.mock.method(Socket.prototype, 'connect', unexpected);
  const bindings = await createConsole();
  t.after(() => bindings.app.close());
  assert.equal(interval.mock.callCount(), 0);
  assert.equal(timeout.mock.callCount(), 0);
  assert.equal(listen.mock.callCount(), 0);
  assert.equal(connect.mock.callCount(), 0);
  interval.mock.restore();
  timeout.mock.restore();
  listen.mock.restore();
  connect.mock.restore();
  assert.equal(bindings.get(bindings.TopicRepository), bindings.topics);
  assert.equal(
    (await bindings.db.query('SELECT 42 AS answer')).rows[0].answer,
    42,
  );
  assert.ok(await bindings.get(bindings.ProfileRepository).getDefault());
});
