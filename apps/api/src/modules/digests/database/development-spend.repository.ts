import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import type { Pool } from 'pg';

import { developmentSpendAllowance } from '../domain/development-spend';

// Candidate schema only. No runtime callers until the additive migration lands.
const pools = pgTable('development_spend_pools', {
  provider: text().primaryKey(),
  cap: integer('cap_micros').notNull(),
});
const reservations = pgTable('development_spend_reservations', {
  id: uuid().primaryKey(),
  provider: text().notNull(),
  reserved: integer('reserved_micros').notNull(),
  cost: integer('cost_micros'),
});
type Provider = 'anthropic' | 'xai';

/** Lifetime ledger isolated from production reserves, dates and provider calls.
 * Null cost retains the full hold, including calls with unknown outcomes.
 * Settle only with confirmed billing; zero explicitly releases an unspent hold.
 */
export class PostgresDevelopmentSpendRepository {
  constructor(private readonly pool: Pool) {}

  /** One statement gives a consistent view while reservations settle concurrently. */
  async status(provider: Provider) {
    developmentSpendAllowance(provider, 0, 0);
    const [usage] = await drizzle(this.pool)
      .select({
        cap: pools.cap,
        chargedMicros: sql<number>`coalesce(sum(${reservations.cost}), 0)::float8`,
        heldMicros: sql<number>`coalesce(sum(case when ${reservations.cost} is null then ${reservations.reserved} else 0 end), 0)::float8`,
        unresolvedCount: sql<number>`count(${reservations.id}) filter (where ${reservations.cost} is null)::float8`,
      })
      .from(pools)
      .leftJoin(reservations, eq(reservations.provider, pools.provider))
      .where(eq(pools.provider, provider))
      .groupBy(pools.provider, pools.cap);
    if (!usage) throw new Error('Missing development pool');
    const committedMicros = usage.chargedMicros + usage.heldMicros;
    return {
      provider,
      chargedMicros: usage.chargedMicros,
      heldMicros: usage.heldMicros,
      unresolvedCount: usage.unresolvedCount,
      committedMicros,
      ...developmentSpendAllowance(provider, usage.cap, committedMicros),
    };
  }

  async reserve(id: string, provider: Provider, amount: number) {
    developmentSpendAllowance(provider, 0, 0); // Validate before opening a connection.
    if (!Number.isSafeInteger(amount) || amount <= 0)
      throw new Error('Invalid development reservation');
    return drizzle(this.pool).transaction(async (tx) => {
      const [pool] = await tx
        .select()
        .from(pools)
        .where(eq(pools.provider, provider))
        .for('update');
      if (!pool) throw new Error('Missing development pool');
      const [existing] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.id, id));
      if (existing) {
        if (existing.provider !== provider || existing.reserved !== amount)
          throw new Error('Conflicting development reservation');
        return { admitted: true, replay: true };
      }
      const [usage] = await tx
        .select({
          total: sql<number>`coalesce(sum(coalesce(${reservations.cost}, ${reservations.reserved})), 0)::float8`,
        })
        .from(reservations)
        .where(eq(reservations.provider, provider));
      const allowance = developmentSpendAllowance(
        provider,
        pool.cap,
        usage.total,
      );
      if (amount > allowance.availableMicros)
        return { admitted: false, mustReport: allowance.mustReport };
      await tx.insert(reservations).values({ id, provider, reserved: amount });
      return {
        admitted: true,
        replay: false,
        mustReport: usage.total + amount >= allowance.stopAtMicros,
      };
    });
  }

  async settle(id: string, cost: number) {
    if (!Number.isSafeInteger(cost) || cost < 0 || cost > 2147483647)
      throw new Error('Invalid development charge');
    return drizzle(this.pool).transaction(async (tx) => {
      const [entry] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.id, id));
      if (!entry) throw new Error('Missing development reservation');
      const [pool] = await tx
        .select()
        .from(pools)
        .where(eq(pools.provider, entry.provider))
        .for('update');
      if (!pool) throw new Error('Missing development pool');
      const [current] = await tx
        .select()
        .from(reservations)
        .where(eq(reservations.id, id));
      if (current.cost !== null && current.cost !== cost)
        throw new Error('Conflicting development settlement');
      await tx
        .update(reservations)
        .set({ cost })
        .where(eq(reservations.id, id));
      const [usage] = await tx
        .select({
          total: sql<number>`coalesce(sum(coalesce(${reservations.cost}, ${reservations.reserved})), 0)::float8`,
        })
        .from(reservations)
        .where(eq(reservations.provider, entry.provider));
      return developmentSpendAllowance(
        entry.provider as Provider,
        pool.cap,
        usage.total,
      );
    });
  }
}
