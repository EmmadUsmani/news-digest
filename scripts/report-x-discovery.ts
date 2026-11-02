// Read-only evidence; no HTTP, inference, verification, jobs or settings writes.
import { database } from '../apps/api/src/libs/db/connections';
import { readXDiscoveryReport } from '../apps/api/src/modules/social/database/x-discovery-report';

async function main() {
  const db = database();
  try {
    console.log(
      JSON.stringify(
        await readXDiscoveryReport(
          db,
          process.argv[2] ?? new Date().toISOString().slice(0, 10),
        ),
        null,
        2,
      ),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'X discovery report failed; supply YYYY-MM-DD and check database access',
  );
  process.exitCode = 1;
});
