import type { Pool, PoolClient } from 'pg';

import {
  validateXCaps,
  type XDiscoveryCaps,
  xDiscoveryCaps,
  xDiscoveryCost,
  type XDiscoveryPrice,
  type XDiscoveryUsage,
} from '../domain/x-discovery-budget';
import type { XDiscoveryLedger } from '../domain/x-discovery-ledger.port';

export class PostgresXDiscoveryLedger implements XDiscoveryLedger {
  readonly caps: Readonly<XDiscoveryCaps>;
  constructor(
    readonly db: Pool,
    caps: XDiscoveryCaps = xDiscoveryCaps,
  ) {
    validateXCaps(caps);
    this.caps = Object.freeze({ ...caps });
  }
  private async transaction<T>(work: (client: PoolClient) => Promise<T>) {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      // Shared across API, worker and explicit discovery commands. Never hold during HTTP.
      await client.query('SELECT pg_advisory_xact_lock(756283)');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  private async totals(client: Pool | PoolClient) {
    const {
      rows: [totals],
    } = await client.query<{
      todayMicros: number;
      monthMicros: number;
      reservedMicros: number;
      blocked: boolean;
    }>(`
      SELECT
        COALESCE(sum(COALESCE(cost_micros,reserved_micros)) FILTER (
          WHERE created_at >= date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
          OR status IN ('pending','uncertain')),0)::float8 AS "todayMicros",
        COALESCE(sum(COALESCE(cost_micros,reserved_micros)) FILTER (
          WHERE created_at >= date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
          OR status IN ('pending','uncertain')),0)::float8 AS "monthMicros",
        COALESCE(sum(reserved_micros) FILTER (WHERE status IN ('pending','uncertain')),0)::float8 AS "reservedMicros",
        EXISTS(SELECT 1 FROM x_discovery_provider_block) AS blocked
      FROM x_discovery_calls WHERE status <> 'failed'
    `);
    return {
      ...totals,
      ...this.caps,
      availableMicros: totals.blocked
        ? 0
        : Math.max(
            0,
            Math.min(
              this.caps.dailyMicros - totals.todayMicros,
              this.caps.monthlyMicros - totals.monthMicros,
            ),
          ),
    };
  }
  async status() {
    return this.totals(this.db);
  }
  async reserve(
    model: string,
    runId: string,
    estimateMicros: number,
    requestedTopic?: { id: string; name: string },
    scheduledDay?: string,
    searchType?: 'open-topic' | 'account-list' | 'story-reactions',
  ) {
    if (
      !model.trim() ||
      model.length > 100 ||
      !runId.trim() ||
      runId.length > 200 ||
      !Number.isSafeInteger(estimateMicros) ||
      estimateMicros <= 0
    )
      throw new Error('Invalid X discovery reservation');
    if (
      scheduledDay !== undefined &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDay) ||
        !Number.isFinite(Date.parse(scheduledDay)) ||
        new Date(scheduledDay).toISOString().slice(0, 10) !== scheduledDay)
    )
      throw new Error('Invalid scheduled X discovery day');
    if (scheduledDay !== undefined && !requestedTopic?.id.trim())
      throw new Error('Scheduled X discovery requires a topic');
    if (
      searchType !== undefined &&
      !['open-topic', 'account-list', 'story-reactions'].includes(searchType)
    )
      throw new Error('Invalid X discovery search type');
    return this.transaction(async (client) => {
      // A topic/day is consumed before HTTP, including rejected/uncertain calls.
      // Restart/retry cannot spend again or shift an obsolete job into today.
      if (scheduledDay !== undefined) {
        const {
          rows: [admission],
        } = await client.query<{ allowed: boolean }>(
          `SELECT $1::date = (clock_timestamp() AT TIME ZONE 'UTC')::date
           AND NOT EXISTS(SELECT 1 FROM x_discovery_calls WHERE scheduled_day=$1::date
             AND requested_topic->>'id'=$2)
           AS allowed`,
          [scheduledDay, requestedTopic?.id ?? null],
        );
        if (!admission.allowed) return null;
      }
      const totals = await this.totals(client);
      if (totals.availableMicros < estimateMicros) return null;
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,requested_topic,scheduled_day,search_type)
        VALUES($1,$2,$3,'pending',$4,$5,$6,$7)`,
        [
          id,
          model,
          runId,
          estimateMicros,
          requestedTopic ?? null,
          scheduledDay ?? null,
          searchType ?? null,
        ],
      );
      return id;
    });
  }
  async settle(id: string, usage: XDiscoveryUsage, price: XDiscoveryPrice) {
    const cost = xDiscoveryCost(usage, price);
    await this.transaction(async (client) => {
      const result = await client.query(
        `UPDATE x_discovery_calls SET status='succeeded',
        completed_at=clock_timestamp(),cost_micros=$2,input_tokens=$3,output_tokens=$4,
        posts_fetched=$5,profiles_fetched=$6,
        error_code=CASE WHEN $2 > reserved_micros THEN 'estimate-exceeded' ELSE NULL END
        WHERE id=$1 AND status IN ('pending','uncertain') RETURNING id`,
        [
          id,
          cost,
          usage.inputTokens,
          usage.outputTokens,
          usage.postsFetched,
          usage.profilesFetched,
        ],
      );
      if (!result.rowCount)
        throw new Error('X discovery reservation is not open');
    });
  }
  async fail(
    id: string,
    reason: 'credits-depleted' | 'rejected' | 'uncertain',
  ) {
    await this.transaction(async (client) => {
      const result = await client.query(
        `UPDATE x_discovery_calls SET status=$2,
        completed_at=clock_timestamp(),error_code=$3 WHERE id=$1 AND status='pending' RETURNING id`,
        [id, reason === 'uncertain' ? 'uncertain' : 'failed', reason],
      );
      if (!result.rowCount)
        throw new Error('X discovery reservation is not open');
      if (reason === 'credits-depleted')
        await client.query(`INSERT INTO x_discovery_provider_block(singleton,error_code)
        VALUES(true,'credits-depleted') ON CONFLICT DO NOTHING`);
    });
  }
}
