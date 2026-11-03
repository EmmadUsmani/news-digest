import assert from 'node:assert/strict';
import { test } from 'node:test';

import { database } from '../src/libs/db/connections';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';
const start = new Date('2026-11-01T00:00:00Z'),
  end = new Date('2026-11-02T00:00:00Z');
const item = (id: string, changes: Partial<Candidate> = {}): Candidate => ({
  id,
  title: `Story ${id}`,
  url: `https://example.org/${id}`,
  excerpt: 'Excerpt',
  publishedAt: '2026-11-01T12:00:00Z',
  sources: ['Outlet'],
  points: 0,
  ...changes,
});
void test('rank enforces half-open windows, budgets, safe URLs, separate titles and low-value exclusions', () => {
  const items = [
    item('start', { publishedAt: start.toISOString() }),
    item('end', { publishedAt: end.toISOString() }),
    item('old', { publishedAt: '2026-10-31T23:59:59Z' }),
    item('bet', { title: 'Best bets tonight' }),
    item('unsafe', { url: 'javascript:alert(1)' }),
    item('one', { title: 'Launch announced!' }),
    item('two', { title: 'Launch announced' }),
  ];
  assert.equal(rank(items, start, end, 20).length, 3);
  assert.equal(rank(items, start, end, 1).length, 1);
  assert.deepEqual(rank(items, start, end, 0), []);
  assert.throws(() => rank(items, end, start, 5));
  assert.throws(() => rank(items, start, end, 21));
});
void test('rank gives auditable coverage, recency and bounded engagement signals with stable ties', () => {
  const selected = rank(
    [
      item('a'),
      item('b', { sources: ['A', 'B'], points: 1000 }),
      item('c', { publishedAt: '2026-11-01T23:00:00Z' }),
    ],
    start,
    end,
    3,
  );
  assert.equal(selected[0].id, 'b');
  assert.equal(selected[1].id, 'c');
  assert.equal(selected[0].reasons.length, 4);
  assert.deepEqual(
    rank([item('z'), item('a')], start, end, 2).map((i) => i.id),
    ['a', 'z'],
  );
  assert.ok(
    rank([item('x', { points: Infinity })], start, end, 1)[0].score < 11,
  );
});
void test('Postgres snapshots reject update/delete and regeneration preserves earlier versions', async () => {
  const db = database(),
    client = await db.connect();
  try {
    await client.query('BEGIN');
    const insert = () =>
      client.query(
        `INSERT INTO digest_previews(profile_id,window_start,window_end,snapshot) VALUES('00000000-0000-4000-8000-000000000001',$1,$2,'{"fixture":true}') RETURNING id`,
        [start, end],
      );
    const first = (await insert()).rows[0].id,
      second = (await insert()).rows[0].id;
    assert.notEqual(first, second);
    for (const sql of [
      "UPDATE digest_previews SET snapshot='{}' WHERE id=$1",
      'DELETE FROM digest_previews WHERE id=$1',
    ]) {
      await client.query('SAVEPOINT mutation');
      await assert.rejects(client.query(sql, [first]), /immutable/);
      await client.query('ROLLBACK TO SAVEPOINT mutation');
    }
    assert.deepEqual(
      (
        await client.query('SELECT snapshot FROM digest_previews WHERE id=$1', [
          first,
        ])
      ).rows[0].snapshot,
      { fixture: true },
    );
  } finally {
    await client.query('ROLLBACK');
    client.release();
    await db.end();
  }
});

void test('lead images retain HTTPS publisher media without borrowing related coverage or accepting unsafe schemes', () => {
  const lead = item('a', {
    title: 'New AI model released today',
    imageUrl: 'https://images.example.org/lead.jpg',
  });
  const related = item('b', {
    title: lead.title,
    imageUrl: 'https://images.example.org/other.jpg',
  });
  assert.equal(rank([lead, related], start, end, 5)[0].imageUrl, lead.imageUrl);
  assert.equal(
    rank([{ ...lead, imageUrl: null }, related], start, end, 5)[0].imageUrl,
    null,
  );
  for (const imageUrl of [
    'javascript:alert(1)',
    'data:image/png;base64,AA',
    'http://example.org/image.jpg',
    'https://user:secret@example.org/image.jpg',
    'broken',
  ]) {
    assert.equal(
      rank([{ ...lead, imageUrl }], start, end, 5)[0].imageUrl,
      null,
    );
  }
});
