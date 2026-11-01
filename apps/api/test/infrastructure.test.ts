import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, redis } from '../src/libs/db/connections';
import { Queue, Worker } from 'bullmq';

test('Postgres persists the default profile and migration ledger', async () => {
 const pool = database();
 try {
 const profile = await pool.query('SELECT name FROM profiles WHERE id=$1', ['00000000-0000-4000-8000-000000000001']);
 assert.equal(profile.rows[0]?.name, 'Default');
 const migrations = await pool.query('SELECT name FROM schema_migrations');
 assert.ok(migrations.rows.some(row => row.name === '001-foundation.sql'));
 } finally { await pool.end(); }
});

test('BullMQ processes a job on the local Redis instance', async () => {
 const name = `integration-${process.pid}`;
 const connection = { host: '127.0.0.1', port: 6379 };
 const cache = redis(); const queue = new Queue(name, { connection });
 const worker = new Worker(name, async job => ({ value: job.data.value * 2 }), { connection });
 try {
 assert.equal(await cache.ping(), 'PONG');
 const completed = new Promise<void>((resolve, reject) => {
 const timeout = setTimeout(() => reject(new Error('Job did not finish')), 5000);
 worker.once('completed', (_job, result) => { clearTimeout(timeout); try { assert.deepEqual(result, { value: 42 }); resolve(); } catch (error) { reject(error); } });
 });
 await queue.add('probe', { value: 21 }); await completed;
 } finally { await worker.close(); await queue.obliterate({ force: true }); await queue.close(); cache.disconnect(); }
});
