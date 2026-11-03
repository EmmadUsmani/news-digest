// Read-only first-week evidence; never starts discovery or provider requests.
import { database } from '../apps/api/src/libs/db/connections';
import { readXDiscoveryReport } from '../apps/api/src/modules/social/database/x-discovery-report';
import { summarizeDiscovery } from '../apps/api/src/modules/social/domain/discovery-summary';

async function main() {
  const end = process.argv[2] ?? new Date().toISOString().slice(0, 10);
  const timestamp = Date.parse(end);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== end
  )
    throw new Error('Expected YYYY-MM-DD');
  const db = database();
  try {
    const reports = [];
    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date(timestamp - offset * 86_400_000)
        .toISOString()
        .slice(0, 10);
      reports.push(await readXDiscoveryReport(db, day));
    }
    console.log(
      JSON.stringify(
        {
          startDay: reports[0].day,
          endDay: end,
          checkedAt: new Date().toISOString(),
          days: reports.map((report) => ({
            day: report.day,
            calls: report.calls.length,
            costMicros: report.costMicros,
            heldMicros: report.heldMicros,
            byTopicAndSearchType: report.byTopicAndSearchType,
          })),
          byTopicAndSearchType: summarizeDiscovery(
            reports.flatMap((report) => report.calls),
          ),
          note: `${reports[0].summaryNote} Seven UTC days ending on endDay, inclusive; today may be incomplete. Empty days mean no recorded calls, not successful scheduled coverage. No provider calls or settings writes.`,
        },
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
    'Weekly X report failed; supply YYYY-MM-DD and check database access',
  );
  process.exitCode = 1;
});
