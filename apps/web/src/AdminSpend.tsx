import { useQuery } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Table } from './components/ui/table';
import { statusQuery } from './queries';

const dollars = (micros: number) => '$' + (micros / 1e6).toFixed(6);

export function AdminSpend() {
  const {
    data: status,
    isError,
    isPending,
    isFetching,
    refetch,
  } = useQuery(statusQuery);
  const reserve = status?.llm.scheduledReserve;
  return (
    <section
      aria-label="AI and X spending"
      className="grid max-w-none gap-5 p-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-sm text-[var(--secondary)]">
          UTC budget periods · refreshes every minute
          {status &&
            ` · checked ${new Date(status.checkedAt).toLocaleTimeString()}`}
        </p>
        <Button
          variant="ghost"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? 'Refreshing…' : 'Refresh spend'}
        </Button>
      </div>
      {isPending && <p role="status">Loading spending…</p>}
      {isError && (
        <p role="alert">
          Spending could not be refreshed. Last loaded figures may be out of
          date.
        </p>
      )}
      {status && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="min-w-0">
              <h2 className="mt-0 font-sans text-base font-semibold">
                AI budget
              </h2>
              <Table className="text-xs tabular-nums [&_td]:px-1 [&_th]:px-1 sm:text-sm sm:[&_td]:px-3 sm:[&_th]:px-3">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Spent</th>
                    <th>Reserved</th>
                    <th>Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Today</th>
                    <td>{dollars(status.llm.todayMicros)}</td>
                    <td>{dollars(status.llm.todayReservedMicros)}</td>
                    <td>{dollars(status.llm.dailyCapMicros)}</td>
                  </tr>
                  <tr>
                    <th>Month</th>
                    <td>{dollars(status.llm.monthMicros)}</td>
                    <td>{dollars(status.llm.monthReservedMicros)}</td>
                    <td>{dollars(status.llm.monthlyCapMicros)}</td>
                  </tr>
                </tbody>
              </Table>
              <p className="mb-0 text-sm">
                Available today: {dollars(status.llm.availableMicros)}
              </p>
              {status.llm.blockedUntil && (
                <p role="status">
                  Provider limit reached until{' '}
                  {new Date(status.llm.blockedUntil).toLocaleString()}.
                </p>
              )}
              {status.llm.lastError && (
                <p className="text-sm">
                  Last provider error: {status.llm.lastError.code} ·{' '}
                  {new Date(status.llm.lastError.at).toLocaleString()}
                </p>
              )}
            </Card>
            <Card className="min-w-0">
              <h2 className="mt-0 font-sans text-base font-semibold">
                X discovery budget
              </h2>
              <Table className="text-xs tabular-nums [&_td]:px-1 [&_th]:px-1 sm:text-sm sm:[&_td]:px-3 sm:[&_th]:px-3">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Spent or reserved</th>
                    <th>Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Today</th>
                    <td>{dollars(status.xDiscovery.todayMicros)}</td>
                    <td>{dollars(status.xDiscovery.dailyMicros)}</td>
                  </tr>
                  <tr>
                    <th>Month</th>
                    <td>{dollars(status.xDiscovery.monthMicros)}</td>
                    <td>{dollars(status.xDiscovery.monthlyMicros)}</td>
                  </tr>
                </tbody>
              </Table>
              <p className="mb-0 text-sm">
                Available today: {dollars(status.xDiscovery.availableMicros)} ·
                reserved or awaiting reconciliation:{' '}
                {dollars(status.xDiscovery.reservedMicros)}
              </p>
              {status.xDiscovery.blocked && (
                <p role="status">
                  X prepaid credits depleted. Paid searches are stopped pending
                  credit review.
                </p>
              )}
            </Card>
          </div>
          <Card className="min-w-0">
            <h2 className="mt-0 font-sans text-base font-semibold">
              Scheduled edition reserve
            </h2>
            {reserve ? (
              <>
                <p className="text-sm">
                  Protection {reserve.enabled ? 'enabled' : 'disabled'} ·{' '}
                  {reserve.budgetDay} · {reserve.state}
                </p>
                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[var(--secondary)]">Protected now</dt>
                    <dd className="m-0 mt-1 font-medium">
                      {dollars(reserve.reserveMicros)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--secondary)]">
                      Configured or measured target
                    </dt>
                    <dd className="m-0 mt-1 font-medium">
                      {dollars(reserve.sizedReserveMicros)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--secondary)]">
                      Available to other runs
                    </dt>
                    <dd className="m-0 mt-1 font-medium">
                      {dollars(reserve.otherAvailableMicros)}
                    </dd>
                  </div>
                </dl>
                <p className="text-sm text-[var(--secondary)]">
                  Other runs' daily limit:{' '}
                  {dollars(reserve.otherSpendLimitMicros)}, before model and
                  verification limits.
                </p>
                {reserve.limitedByReserve && (
                  <p role="status">
                    The scheduled edition reserve limits manual and development
                    runs.
                  </p>
                )}
                {reserve.lastOutcome && (
                  <p className="mb-0 text-sm">
                    Last scheduled result:{' '}
                    {reserve.lastOutcome.outcome?.mode ??
                      reserve.lastOutcome.state}{' '}
                    ·{' '}
                    {new Date(reserve.lastOutcome.scheduledAt).toLocaleString()}
                    {reserve.lastOutcome.outcome &&
                      ` · ${reserve.lastOutcome.outcome.reason}`}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm">Reserve information unavailable.</p>
            )}
          </Card>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <Card className="min-w-0">
              <h2 className="mt-0 font-sans text-base font-semibold">
                AI spend by purpose
              </h2>
              {status.llm.purposes?.length ? (
                <Table className="text-xs tabular-nums [&_td]:px-1 [&_th]:px-1 sm:text-sm sm:[&_td]:px-3 sm:[&_th]:px-3">
                  <thead>
                    <tr>
                      <th>Purpose</th>
                      <th>Today</th>
                      <th>Month</th>
                      <th>Reserved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.llm.purposes.map((usage) => (
                      <tr key={usage.purpose}>
                        <th>
                          {usage.purpose === 'verification'
                            ? 'Development verification'
                            : usage.purpose}
                        </th>
                        <td>{dollars(usage.todayMicros)}</td>
                        <td>{dollars(usage.monthMicros)}</td>
                        <td>{dollars(usage.reservedMicros)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm">No purpose totals reported.</p>
              )}
            </Card>
            <Card className="min-w-0">
              <h2 className="mt-0 font-sans text-base font-semibold">
                AI models this month
              </h2>
              {status.llm.models.length ? (
                <Table className="text-xs tabular-nums [&_td]:px-1 [&_th]:px-1 sm:text-sm sm:[&_td]:px-3 sm:[&_th]:px-3">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Calls</th>
                      <th>Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.llm.models.map((model) => (
                      <tr key={model.model}>
                        <th className="break-all">{model.model}</th>
                        <td>{model.calls}</td>
                        <td>{dollars(model.costMicros)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-sm">No model usage reported.</p>
              )}
              {status.llm.modelAllocation && (
                <p className="text-sm">
                  Final editor ({status.llm.modelAllocation.model}):{' '}
                  {dollars(status.llm.modelAllocation.usedMicros)} spent or
                  reserved /{' '}
                  {dollars(status.llm.modelAllocation.dailyCapMicros)} daily
                  allocation ·{' '}
                  {dollars(status.llm.modelAllocation.availableMicros)}{' '}
                  available.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
      <a className="text-sm" href="/grafana/d/nd-product/product">
        Open Grafana Product dashboard ↗
      </a>
    </section>
  );
}
