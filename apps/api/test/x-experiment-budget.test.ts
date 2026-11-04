import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { XExperimentBudget } from '../../../scripts/lib/x-experiment-budget';

function fixture(run: (path: string, budget: XExperimentBudget) => void) {
  const root = mkdtempSync(join(tmpdir(), 'x-experiment-'));
  try {
    const path = join(root, 'ledger.json');
    run(path, new XExperimentBudget(path));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const day = (number: number, hour = 18) =>
  new Date(`2026-11-${String(number).padStart(2, '0')}T${hour}:00:00Z`);

void test('experiment enforces UTC blackout boundaries and validates amounts', () =>
  fixture((path, budget) => {
    for (const hour of [13, 14, 15])
      assert.throws(
        () => budget.reserve('blocked', 1, day(4, hour)),
        /forbidden/,
      );
    for (const amount of [0, -1, 0.5, NaN, Infinity])
      assert.throws(() => budget.reserve('invalid', amount, day(4)));
    budget.reserve('before', 1, day(4, 12));
    budget.reserve('after', 1, day(4, 16));
    assert.equal(JSON.parse(readFileSync(path, 'utf8')).entries.length, 2);
    assert.equal(statSync(path).mode & 0o777, 0o600);
  }));

void test('unresolved calls survive restart and charge daily and lifetime caps', () =>
  fixture((path, budget) => {
    budget.reserve('first', 1_000_000, day(4));
    const restarted = new XExperimentBudget(path);
    assert.throws(() => restarted.reserve('extra', 1, day(4)), /budget/);
    restarted.reserve('second', 1_000_000, day(5));
    restarted.reserve('third', 500_000, day(6));
    assert.throws(() => restarted.reserve('lifetime', 1, day(7)), /budget/);
    assert.throws(() => restarted.reserve('first', 1, day(7)), /already/);
  }));

void test('known usage releases headroom but settlement cannot be replayed or fabricated', () =>
  fixture((path, budget) => {
    budget.reserve('one', 1_000_000, day(4));
    budget.settle('one', 40_000);
    new XExperimentBudget(path).reserve('two', 960_000, day(4));
    assert.throws(() => budget.settle('one', 0), /already/);
    assert.throws(() => budget.settle('missing', 0), /Unknown/);
    budget.settle('two', 3_000_000);
    assert.throws(() => budget.reserve('overrun', 1, day(5)), /exceeded/);
    assert.equal(
      JSON.parse(readFileSync(path, 'utf8')).entries[1].actualMicros,
      3_000_000,
    );
  }));

void test('contention, stale locks and damaged journals fail closed without replacing evidence', () =>
  fixture((path, budget) => {
    mkdirSync(path + '.lock');
    assert.throws(() => budget.reserve('locked', 1, day(4)));
    assert.ok(statSync(path + '.lock').isDirectory());
    rmSync(path + '.lock', { recursive: true });
    for (const contents of [
      'broken',
      '{"version":2,"entries":[]}',
      '{"version":1,"entries":[{"id":"bad","day":"2026-11-04","reservedMicros":-1,"actualMicros":null}]}',
    ]) {
      writeFileSync(path, contents);
      assert.throws(() => budget.reserve('damaged', 1, day(4)));
      assert.equal(readFileSync(path, 'utf8'), contents);
    }
  }));

void test('dispatch rechecks UTC boundaries and persists a single-use claim across restarts', () =>
  fixture((path, budget) => {
    budget.reserve('before', 500_000, day(4, 12));
    const original = readFileSync(path, 'utf8');
    for (const instant of [day(4, 13), day(4, 15), day(5, 16), new Date(NaN)]) {
      assert.throws(() => budget.claimDispatch('before', instant));
      assert.equal(readFileSync(path, 'utf8'), original);
    }
    budget.claimDispatch('before', day(4, 16));
    assert.equal(
      JSON.parse(readFileSync(path, 'utf8')).entries[0].dispatchedAt,
      day(4, 16).toISOString(),
    );
    const restarted = new XExperimentBudget(path);
    assert.throws(
      () => restarted.claimDispatch('before', day(4, 17)),
      /already/,
    );
    assert.throws(() => restarted.claimDispatch('missing', day(4)), /Unknown/);
    restarted.reserve('remaining', 500_000, day(4));
    assert.throws(() => restarted.reserve('extra', 1, day(4)), /budget/);
    restarted.settle('before', 100_000);
    assert.throws(() => restarted.claimDispatch('before', day(4)), /settled/);
  }));

void test('dispatch refuses existing overrun and corrupt dispatch evidence', () =>
  fixture((path, budget) => {
    budget.reserve('one', 100, day(4));
    budget.reserve('two', 100, day(4));
    budget.settle('one', 101);
    assert.throws(() => budget.claimDispatch('two', day(4)), /exceeded/);
    const journal = JSON.parse(readFileSync(path, 'utf8'));
    for (const dispatchedAt of [
      'invalid',
      '2026-11-05T18:00:00.000Z',
      '2026-11-04T13:00:00.000Z',
    ]) {
      journal.entries[1].dispatchedAt = dispatchedAt;
      const contents = JSON.stringify(journal);
      writeFileSync(path, contents);
      assert.throws(
        () => budget.claimDispatch('two', day(4)),
        /Invalid experiment dispatch/,
      );
      assert.equal(readFileSync(path, 'utf8'), contents);
    }
  }));
