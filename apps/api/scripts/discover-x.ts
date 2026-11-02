// Explicit one-topic discovery. Dry run by default. Never scheduled by this command.
import { database } from '../src/libs/db/connections';
import {
  DirectXSearch,
  xSearchBody,
} from '../src/modules/social/adapters/x-search';
import { searchX } from '../src/modules/social/application/search-x';
import { PostgresXDiscoveryLedger } from '../src/modules/social/database/x-discovery.ledger';
import { PostgresXSearchRepository } from '../src/modules/social/database/x-search.repository';

async function main() {
  const [topicId, fromDate, toDate] = process.argv.slice(2);
  const db = database();
  try {
    const repository = new PostgresXSearchRepository(db);
    const topic = await repository.topic(topicId);
    if (!topic) throw new Error('Enabled topic unavailable');
    const request = {
      topic: topic.name,
      guidance: topic.guidance,
      handles: topic.handles,
      fromDate,
      toDate,
    };
    const body = xSearchBody(request); // Validate before creating any reservation.
    if (process.env.X_DISCOVERY_LIVE !== '1') {
      console.log(
        JSON.stringify({
          state: 'dry-run',
          request: body,
          reservationMicros: 400000,
          note: 'Reservation is not a request-dollar ceiling. No HTTP request or spend.',
        }),
      );
      return;
    }
    const adapter = new DirectXSearch(process.env.XAI_API_KEY ?? '');
    console.log(
      JSON.stringify(
        await searchX(
          topic.id,
          `explicit:${crypto.randomUUID()}`,
          request,
          adapter,
          new PostgresXDiscoveryLedger(db),
          repository,
          {
            inputPerMillion: 1.25,
            outputPerMillion: 2.5,
            perPost: 0.005,
            perProfile: 0.01,
          },
        ),
      ),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'X discovery failed; review ledger before another live attempt',
  );
  process.exitCode = 1;
});
