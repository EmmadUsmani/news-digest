import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

interface Entry {
  id: string;
  day: string;
  reservedMicros: number;
  actualMicros: number | null;
  dispatchedAt?: string;
}
interface Journal {
  version: 1;
  entries: Entry[];
}
const dailyCap = 1_000_000;
const totalCap = 2_500_000;
function money(value: number) {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error('Invalid experiment amount in USD micros');
}
function validate(value: Journal) {
  if (value.version !== 1 || !Array.isArray(value.entries))
    throw new Error('Invalid experiment journal');
  const ids = new Set<string>();
  for (const entry of value.entries) {
    if (
      !entry.id ||
      ids.has(entry.id) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.day)
    )
      throw new Error('Invalid experiment entry');
    ids.add(entry.id);
    money(entry.reservedMicros);
    if (entry.actualMicros !== null) money(entry.actualMicros);
    if (entry.dispatchedAt !== undefined) {
      const instant = new Date(entry.dispatchedAt);
      if (
        !Number.isFinite(instant.getTime()) ||
        instant.toISOString() !== entry.dispatchedAt ||
        entry.dispatchedAt.slice(0, 10) !== entry.day ||
        (instant.getUTCHours() >= 13 && instant.getUTCHours() < 16)
      )
        throw new Error('Invalid experiment dispatch');
    }
  }
}

// Separate from production discovery accounting. No provider calls are made here.
// An unresolved reservation stays charged forever, including across UTC days.
export class XExperimentBudget {
  constructor(private readonly path: string) {}

  private update(change: (journal: Journal) => void) {
    mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
    const lock = this.path + '.lock';
    // Fail closed on contention or a stale lock; never reclaim automatically.
    mkdirSync(lock, { mode: 0o700 });
    const temporary = this.path + '.tmp';
    try {
      let journal: Journal;
      try {
        journal = JSON.parse(readFileSync(this.path, 'utf8')) as Journal;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        journal = { version: 1, entries: [] };
      }
      validate(journal);
      change(journal);
      validate(journal);
      const fd = openSync(temporary, 'w', 0o600);
      try {
        writeFileSync(fd, JSON.stringify(journal) + '\n');
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      renameSync(temporary, this.path);
      const directory = openSync(dirname(this.path), 'r');
      try {
        fsyncSync(directory);
      } finally {
        closeSync(directory);
      }
    } finally {
      rmSync(temporary, { force: true });
      rmSync(lock, { recursive: true });
    }
  }

  reserve(id: string, reservedMicros: number, now = new Date()) {
    money(reservedMicros);
    if (
      !id.trim() ||
      reservedMicros === 0 ||
      reservedMicros > dailyCap ||
      !Number.isFinite(now.getTime())
    )
      throw new Error('Invalid experiment reservation');
    const hour = now.getUTCHours();
    if (hour >= 13 && hour < 16)
      throw new Error('X experiment forbidden between 13:00 and 16:00 UTC');
    const day = now.toISOString().slice(0, 10);
    this.update((journal) => {
      if (journal.entries.some((entry) => entry.id === id))
        throw new Error('Experiment request already reserved');
      const charged = (entry: Entry) =>
        entry.actualMicros ?? entry.reservedMicros;
      const total = journal.entries.reduce(
        (sum, entry) => sum + charged(entry),
        0,
      );
      const daily = journal.entries
        .filter((entry) => entry.day === day)
        .reduce((sum, entry) => sum + charged(entry), 0);
      if (
        journal.entries.some(
          (entry) =>
            entry.actualMicros !== null &&
            entry.actualMicros > entry.reservedMicros,
        ) ||
        total + reservedMicros > totalCap ||
        daily + reservedMicros > dailyCap
      )
        throw new Error(
          'X experiment budget exhausted or reservation exceeded',
        );
      journal.entries.push({ id, day, reservedMicros, actualMicros: null });
    });
  }

  // Claim immediately before sending. A crash after this write keeps the hold
  // and forbids retries, even if no response (or no request) was observed.
  claimDispatch(id: string, now = new Date()) {
    if (!Number.isFinite(now.getTime()))
      throw new Error('Invalid experiment dispatch time');
    if (now.getUTCHours() >= 13 && now.getUTCHours() < 16)
      throw new Error('X experiment forbidden between 13:00 and 16:00 UTC');
    this.update((journal) => {
      const entry = journal.entries.find((candidate) => candidate.id === id);
      if (!entry || entry.actualMicros !== null || entry.dispatchedAt)
        throw new Error(
          'Unknown, settled or already dispatched experiment request',
        );
      if (entry.day !== now.toISOString().slice(0, 10))
        throw new Error(
          'Experiment reservation belongs to a different UTC day',
        );
      if (
        journal.entries.some(
          (candidate) =>
            candidate.actualMicros !== null &&
            candidate.actualMicros > candidate.reservedMicros,
        )
      )
        throw new Error('Experiment reservation exceeded');
      entry.dispatchedAt = now.toISOString();
    });
  }

  // Call only with known provider usage. Unknown/failed outcomes retain the hold.
  // Record overruns honestly, then refuse every later reservation.
  settle(id: string, actualMicros: number) {
    money(actualMicros);
    this.update((journal) => {
      const entry = journal.entries.find((candidate) => candidate.id === id);
      if (!entry || entry.actualMicros !== null)
        throw new Error('Unknown or already settled experiment request');
      entry.actualMicros = actualMicros;
    });
  }
}
