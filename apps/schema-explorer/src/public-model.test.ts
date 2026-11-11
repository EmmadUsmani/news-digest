import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildModel, type Catalog } from './model.ts';
import { buildPublicModel } from './public-model.ts';

test('public schema keeps account topology without activity, definitions or prose', () => {
  const marker = 'PRIVATE_SENTINEL';
  const catalog: Catalog = {
    tables: ['users', 'sessions'].map((name) => ({
      name,
      comment: marker,
      rowEstimate: 97531,
      sizeBytes: 86420,
    })),
    columns: ['users', 'sessions'].map((table) => ({
      table,
      name: 'id',
      type: 'uuid',
      nullable: false,
      default: marker,
      comment: marker,
    })),
    constraints: [
      {
        name: 'users_pkey',
        type: 'p',
        table: 'users',
        refTable: null,
        columns: ['id'],
        refColumns: [],
        onDelete: 'a',
        definition: marker,
      },
      {
        name: 'sessions_user_fk',
        type: 'f',
        table: 'sessions',
        refTable: 'users',
        columns: ['id'],
        refColumns: ['id'],
        onDelete: 'c',
        definition: marker,
      },
      {
        name: 'secret_check',
        type: 'c',
        table: 'users',
        refTable: null,
        columns: ['id'],
        refColumns: [],
        onDelete: 'a',
        definition: marker,
      },
    ],
    indexes: [
      {
        table: 'users',
        name: marker,
        columns: ['id'],
        unique: false,
        primary: false,
        definition: marker,
      },
    ],
    triggers: [{ table: 'users', name: marker, definition: marker }],
  };
  const privateModel = buildModel(catalog, {
    groups: [
      {
        id: 'accounts',
        name: 'Accounts',
        tables: ['users', 'sessions'],
        description: marker,
      },
    ],
    notes: { users: marker },
  });
  privateModel.warnings.push(marker);
  Object.assign(privateModel.tables[0], { futurePrivateField: marker });
  const before = JSON.stringify(privateModel);
  const result = buildPublicModel(privateModel);
  const serialized = JSON.stringify(result);
  for (const forbidden of [
    marker,
    '97531',
    '86420',
    'generatedAt',
    'rowEstimate',
    'sizeBytes',
    'default',
    'comment',
    'checks',
    'triggers',
    'indexes',
    'warnings',
  ]) {
    assert.ok(!serialized.includes(forbidden), forbidden);
  }
  assert.deepEqual(result.tables[0], {
    name: 'users',
    group: 'accounts',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        nullable: false,
        pk: true,
        fk: false,
        unique: false,
      },
    ],
    primaryKey: ['id'],
    uniques: [],
  });
  assert.equal(result.relations.length, 1);
  assert.deepEqual(result.relations[0].from, {
    table: 'sessions',
    columns: ['id'],
  });
  assert.deepEqual(result.relations[0].to, { table: 'users', columns: ['id'] });
  assert.equal(result.relations[0].onDelete, 'cascade');
  result.tables[0].primaryKey.push('mutated');
  result.groups[0].tables.push('mutated');
  result.relations[0].from.columns.push('mutated');
  assert.equal(JSON.stringify(privateModel), before);
});
