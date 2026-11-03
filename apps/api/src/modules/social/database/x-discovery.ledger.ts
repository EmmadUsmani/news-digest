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
    optionalParentId?: string,
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
    if (
      optionalParentId !== undefined &&
      (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(optionalParentId) ||
        scheduledDay === undefined ||
        !['account-list', 'story-reactions'].includes(searchType ?? ''))
    )
      throw new Error('Invalid optional X discovery reservation');
    return this.transaction(async (client) => {
      // A topic/day is consumed before HTTP, including rejected/uncertain calls.
      // Restart/retry cannot spend again or shift an obsolete job into today.
      if (scheduledDay !== undefined) {
        const {
          rows: [admission],
        } = await client.query<{ allowed: boolean }>(
          `SELECT $1::date = (clock_timestamp() AT TIME ZONE 'UTC')::date
           AND NOT EXISTS(SELECT 1 FROM x_discovery_calls WHERE scheduled_day=$1::date
             AND requested_topic->>'id'=$2
             AND (optional_parent_id IS NULL)=($3::uuid IS NULL))
           AND ($3::uuid IS NULL OR (
             EXISTS(SELECT 1 FROM topics WHERE id::text=$2 AND enabled AND post_budget > 0)
             AND EXISTS(SELECT 1 FROM x_discovery_calls p WHERE p.id=$3
               AND p.scheduled_day=$1::date AND p.requested_topic->>'id'=$2
               AND p.optional_parent_id IS NULL AND p.search_type='open-topic'
               AND p.status='succeeded' AND p.verification_completed_at IS NOT NULL
               AND NOT EXISTS(SELECT 1 FROM x_search_citations c
                 WHERE c.call_id=p.id AND c.new_candidate IS NULL)
               AND (SELECT count(*) FROM x_search_citations c JOIN social_posts s
                 ON s.platform='x' AND s.external_id=c.external_id
                 WHERE c.call_id=p.id AND c.topic_id::text=$2 AND c.new_candidate) < 3)
             AND NOT EXISTS(SELECT 1 FROM topics t WHERE t.enabled AND t.post_budget > 0
               AND NOT EXISTS(SELECT 1 FROM x_discovery_calls p
                 WHERE p.scheduled_day=$1::date AND p.requested_topic->>'id'=t.id::text
                   AND p.optional_parent_id IS NULL AND p.search_type='open-topic'
                   AND p.status='succeeded' AND p.verification_completed_at IS NOT NULL))
           ))
           AS allowed`,
          [scheduledDay, requestedTopic?.id ?? null, optionalParentId ?? null],
        );
        if (!admission.allowed) return null;
      }
      const totals = await this.totals(client);
      if (totals.availableMicros < estimateMicros) return null;
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO x_discovery_calls(id,model,run_id,status,reserved_micros,requested_topic,scheduled_day,search_type,optional_parent_id)
        VALUES($1,$2,$3,'pending',$4,$5,$6,$7,$8)`,
        [
          id,
          model,
          runId,
          estimateMicros,
          requestedTopic ?? null,
          scheduledDay ?? null,
          searchType ?? null,
          optionalParentId ?? null,
        ],
      );
      return id;
    });
  }
  // The scheduler calls this only after citation persistence and bounded
  // official verification finish. Settlement alone cannot authorize a followup.
  async completeVerification(id: string) {
    await this.transaction(async (client) => {
      const result = await client.query(
        `UPDATE x_discovery_calls SET verification_completed_at=COALESCE(
          verification_completed_at,clock_timestamp())
         WHERE id=$1 AND status='succeeded' AND search_type='open-topic'
           AND scheduled_day IS NOT NULL AND optional_parent_id IS NULL RETURNING id`,
        [id],
      );
      if (!result.rowCount) throw new Error('X open search is not completed');
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
