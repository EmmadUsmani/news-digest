import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildModel, type Catalog, UNASSIGNED } from './model.ts';

const catalog: Catalog = {
  tables: [
    { name: 'profiles', comment: null, rowEstimate: 1, sizeBytes: 8192 },
    { name: 'topics', comment: null, rowEstimate: 4.4, sizeBytes: 8192 },
    { name: 'posts', comment: null, rowEstimate: -1, sizeBytes: 0 },
  ],
  columns: [
    {
      table: 'profiles',
      name: 'id',
      type: 'uuid',
      nullable: false,
      default: null,
      comment: null,
    },
    {
      table: 'topics',
      name: 'id',
      type: 'uuid',
      nullable: false,
      default: null,
      comment: null,
    },
    {
      table: 'topics',
      name: 'profile_id',
      type: 'uuid',
      nullable: false,
      default: null,
      comment: null,
    },
    {
      table: 'topics',
      name: 'slug',
      type: 'text',
      nullable: true,
      default: null,
      comment: null,
    },
    {
      table: 'posts',
      name: 'topic_ref',
      type: 'uuid',
      nullable: true,
      default: null,
      comment: null,
    },
  ],
  constraints: [
    {
      name: 'profiles_pkey',
      type: 'p',
      table: 'profiles',
      refTable: null,
      columns: ['id'],
      refColumns: [],
      onDelete: ' ',
      definition: 'PRIMARY KEY (id)',
    },
    {
      name: 'topics_pkey',
      type: 'p',
      table: 'topics',
      refTable: null,
      columns: ['id'],
      refColumns: [],
      onDelete: ' ',
      definition: 'PRIMARY KEY (id)',
    },
    {
      name: 'topics_profile_fk',
      type: 'f',
      table: 'topics',
      refTable: 'profiles',
      columns: ['profile_id'],
      refColumns: ['id'],
      onDelete: 'c',
      definition: '',
    },
    {
      name: 'topics_budget_check',
      type: 'c',
      table: 'topics',
      refTable: null,
      columns: [],
      refColumns: [],
      onDelete: ' ',
      definition: 'CHECK (true)',
    },
  ],
  indexes: [
    {
      table: 'topics',
      name: 'topics_slug_key',
      columns: ['slug'],
      unique: true,
      primary: false,
      definition: 'CREATE UNIQUE INDEX …',
    },
    {
      table: 'topics',
      name: 'topics_pkey',
      columns: ['id'],
      unique: true,
      primary: true,
      definition: 'CREATE UNIQUE INDEX …',
    },
  ],
  triggers: [],
};

void test('builds tables, keys and foreign keys from the catalog', () => {
  const model = buildModel(catalog, undefined, new Date(0));
  const topics = model.tables.find((t) => t.name === 'topics')!;
  assert.deepEqual(topics.primaryKey, ['id']);
  assert.deepEqual(topics.uniques, [['slug']]);
  assert.equal(topics.columns.find((c) => c.name === 'slug')!.unique, true);
  assert.equal(topics.columns.find((c) => c.name === 'profile_id')!.fk, true);
  assert.deepEqual(topics.checks, ['CHECK (true)']);
  assert.equal(topics.indexes.length, 1, 'primary-key index is not repeated');
  assert.equal(topics.rowEstimate, 4);
  assert.equal(model.tables.find((t) => t.name === 'posts')!.rowEstimate, 0);
  assert.deepEqual(model.relations, [
    {
      id: 'fk:topics:topics_profile_fk',
      kind: 'fk',
      from: { table: 'topics', columns: ['profile_id'] },
      to: { table: 'profiles', columns: ['id'] },
      onDelete: 'cascade',
      note: null,
    },
  ]);
  // Without metadata every table is unassigned, and that is not a warning.
  assert.equal(model.groups.length, 1);
  assert.equal(model.groups[0].id, UNASSIGNED);
  assert.deepEqual(model.warnings, []);
});

void test('merges metadata and reports drift instead of failing', () => {
  const model = buildModel(catalog, {
    groups: [
      {
        id: 'settings',
        name: 'Settings',
        tables: ['profiles', 'topics', 'gone'],
      },
      { id: 'dup', name: 'Dup', color: '#000000', tables: ['topics'] },
      { name: 'no id' },
    ],
    tables: { topics: 'A section.', posts: { note: 'Posts.' }, ghost: 'x' },
    relations: [
      { from: 'posts.topic_ref', to: 'topics.id', note: 'soft link' },
      { from: 'posts.nope', to: 'topics.id' },
      { from: 'posts' },
    ],
  });
  assert.deepEqual(
    model.groups.map((g) => [g.id, g.tables]),
    [
      ['settings', ['profiles', 'topics']],
      ['dup', []],
      [UNASSIGNED, ['posts']],
    ],
  );
  assert.equal(
    model.tables.find((t) => t.name === 'topics')!.note,
    'A section.',
  );
  assert.equal(model.tables.find((t) => t.name === 'posts')!.note, 'Posts.');
  const implicit = model.relations.filter((r) => r.kind === 'implicit');
  assert.deepEqual(
    implicit.map((r) => [r.from, r.to, r.note]),
    [
      [
        { table: 'posts', columns: ['topic_ref'] },
        { table: 'topics', columns: ['id'] },
        'soft link',
      ],
    ],
  );
  assert.equal(model.warnings.length, 6);
  assert.match(
    model.warnings.join('\n'),
    /"gone", which is not in the database/,
  );
  assert.match(model.warnings.join('\n'), /more than one group/);
  assert.match(model.warnings.join('\n'), /Note for "ghost"/);
  assert.match(model.warnings.join('\n'), /posts\.nope/);
});

void test('ignores non-object metadata with a warning', () => {
  const model = buildModel(catalog, ['nope']);
  assert.equal(model.warnings.length, 1);
  assert.equal(model.groups[0].id, UNASSIGNED);
});
