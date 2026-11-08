import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import { developmentJson } from '../src/modules/curation/public/development-json';

const models = llmConfig({});
const request = {
  model: models.sonnet,
  purpose: 'shortlist-editor-v13',
  runId: 'offline',
  instructions: 'fixture',
  prompt: 'fixture',
  maxOutputTokens: 10,
};
const complete = (text = '{"ok":true}', mustReport = false) => ({
  status: 'complete' as const,
  mustReport,
  value: {
    text,
    usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 },
  },
});
void test('development JSON maps fixed roles and allocates separate concurrent holds', async () => {
  const calls: unknown[] = [];
  const bridge = developmentJson(
    {
      complete: async (input, id) => {
        calls.push([input, id]);
        return complete();
      },
    },
    'private-edition',
  );
  assert.deepEqual(
    await Promise.all([
      bridge.json(request, (value) => value),
      bridge.json({ ...request, model: models.haiku }, (value) => value),
    ]),
    [{ ok: true }, { ok: true }],
  );
  const { model: _model, purpose: _purpose, ...input } = request;
  assert.deepEqual(calls, [
    [{ ...input, role: 'sonnet' }, 'private-edition:editor:1'],
    [{ ...input, role: 'haiku' }, 'private-edition:editor:2'],
  ]);
  await assert.rejects(
    bridge.json(
      { ...request, model: { ...models.haiku, id: 'unknown' } },
      (v) => v,
    ),
    /Unsupported/,
  );
  assert.equal(calls.length, 2);
});
void test('development JSON never repairs malformed or rejected completed output', async () => {
  let count = 0;
  const bridge = developmentJson(
    {
      complete: async () => {
        count++;
        return complete(count === 1 ? 'invalid' : '{}');
      },
    },
    'private-edition',
  );
  assert.equal(await bridge.json(request, (v) => v, { repair: true }), null);
  assert.equal(
    await bridge.json(request, () => {
      throw new Error('fixture');
    }),
    null,
  );
  assert.equal(count, 2);
});
void test('all stopped outcomes and uncertain errors latch off further calls', async () => {
  for (const outcome of [
    { status: 'disabled' as const },
    { status: 'replay' as const },
    { status: 'input-limit' as const },
    { status: 'budget-refused' as const, mustReport: false },
    complete('{}', true),
    new Error('uncertain provider outcome'),
  ]) {
    let count = 0;
    const bridge = developmentJson(
      {
        complete: async () => {
          count++;
          if (outcome instanceof Error) throw outcome;
          return outcome;
        },
      },
      'private-edition',
    );
    await assert.rejects(bridge.json(request, (v) => v));
    await assert.rejects(
      bridge.json(request, (v) => v),
      /stopped/,
    );
    assert.equal(count, 1);
  }
});
void test('real shortlist editor uses isolated JSON and cannot fallback past a pool stop', async () => {
  for (const stop of [false, true]) {
    let count = 0;
    const bridge = developmentJson(
      {
        complete: async () => {
          count++;
          return complete('{"brief":[],"stories":[]}', stop);
        },
      },
      'private-edition',
    );
    const editor = new ShortlistEditor(bridge, models.sonnet, models.haiku);
    const result = editor.edit(
      { id: 'topic', name: 'Tech', description: '', guidance: '' },
      [
        {
          id: 'article',
          title: 'Fixture story',
          excerpt: 'Fixture evidence',
          sources: ['Fixture'],
        },
      ],
      1,
      'private-edition',
    );
    if (stop) await assert.rejects(result, /stopped/);
    else
      assert.deepEqual(await result, {
        brief: [],
        stories: [],
        model: models.sonnet.id,
      });
    assert.equal(count, 1);
  }
});
void test('shortlist fallback after charged invalid output gets a new development attempt', async () => {
  const calls: { role: string; id: string }[] = [];
  const bridge = developmentJson(
    {
      complete: async (request, id) => {
        calls.push({ role: request.role, id });
        return complete(
          calls.length === 1 ? 'invalid' : '{"brief":[],"stories":[]}',
        );
      },
    },
    'private-edition',
  );
  const editor = new ShortlistEditor(bridge, models.sonnet, models.haiku);
  const result = await editor.edit(
    { id: 'topic', name: 'Tech', description: '', guidance: '' },
    [
      {
        id: 'article',
        title: 'Fixture',
        excerpt: 'Fixture',
        sources: ['Fixture'],
      },
    ],
    1,
    'private-edition',
  );
  assert.equal(result?.model, models.haiku.id);
  assert.deepEqual(calls, [
    { role: 'sonnet', id: 'private-edition:editor:1' },
    { role: 'haiku', id: 'private-edition:editor:2' },
  ]);
});
