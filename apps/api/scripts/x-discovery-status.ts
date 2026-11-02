// Read-only; never contacts xAI or publishes an edition.
import { database } from '../src/libs/db/connections';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';

async function main() {
  const db = database();
  try {
    console.log(
      JSON.stringify(await new PostgresXDiscoveryLedger(db).status()),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error('X discovery ledger status unavailable');
  process.exitCode = 1;
});
