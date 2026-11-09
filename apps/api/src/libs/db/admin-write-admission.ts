import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import type { AdminWriteAdmission } from '../../public-access';
import { classifyPublicRoute } from '../../public-route-policy';
import { adminWriteAdmissions } from './schema';

type Database = ReturnType<typeof drizzle>;
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];

// Shared validation for standalone admission and transaction-bound mutations.
export async function insertAdminWriteAdmission(
  db: Pick<Database, 'insert'>,
  entry: AdminWriteAdmission,
): Promise<string> {
  // Validate again at persistence; never store arbitrary paths or query data.
  if (
    !['POST', 'PUT', 'DELETE'].includes(entry.action) ||
    entry.target.includes('?') ||
    classifyPublicRoute(entry.action, entry.target) !== 'admin' ||
    !Number.isFinite(entry.at.getTime())
  )
    throw new Error('Invalid admin write admission');
  const userId = 'userId' in entry.actor ? entry.actor.userId : null;
  const localScript =
    'localScript' in entry.actor && entry.actor.localScript === true;
  if ((userId !== null) === localScript) throw new Error('Invalid admin actor');
  const [inserted] = await db
    .insert(adminWriteAdmissions)
    .values({
      userId,
      localScript,
      method: entry.action,
      target: entry.target,
      createdAt: entry.at.toISOString(),
    })
    .returning({ id: adminWriteAdmissions.id });
  return inserted.id;
}

// Prepared only. The callback must use this transaction for every database write
// and throw to refuse a mutation. External effects/queues cannot be made atomic
// here; those need an outbox. The caller owns the pool and authorization.
export async function withAdminWriteAdmission<T>(
  pool: Pool,
  entry: AdminWriteAdmission,
  mutate: (transaction: Transaction) => Promise<T>,
  outcome?: (result: T) => 'changed' | 'unchanged',
): Promise<T> {
  return drizzle(pool).transaction(async (transaction) => {
    const id = await insertAdminWriteAdmission(transaction, entry);
    const result = await mutate(transaction);
    if (outcome) {
      await transaction
        .update(adminWriteAdmissions)
        .set({ outcome: outcome(result) })
        .where(eq(adminWriteAdmissions.id, id));
    }
    return result;
  });
}
