import { useQuery } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import {
  adminEditionCostQuery,
  adminEditionQuery,
  alertsQuery,
  healthQuery,
  statusQuery,
} from './queries';

const dollars = (micros: number) => `$${(micros / 1e6).toFixed(3)}`;
const time = (value: string) =>
  new Date(value).toLocaleString(undefined, { timeZoneName: 'short' });

export function AdminOverview() {
  const alerts = useQuery(alertsQuery);
  const status = useQuery(statusQuery);
  const health = useQuery(healthQuery);
  const edition = useQuery(adminEditionQuery);
  const cost = useQuery({
    ...adminEditionCostQuery(edition.data?.id ?? ''),
    enabled: Boolean(edition.data?.id),
  });
  const data = status.data;
  const issues = data?.sources.filter(
    (source) =>
      source.active &&
      (source.error ||
        !source.lastSuccess ||
        Date.parse(data.checkedAt) - Date.parse(source.lastSuccess) >
          3_600_000),
  );
  const run = data?.queues
    .flatMap((queue) => (queue.name === 'digest-generation' ? queue.runs : []))
    .find((item) => item.editionId === edition.data?.id);
  return (
    <section
      aria-label="Operations overview"
      className="grid max-w-none gap-5 p-0 [&_h2]:m-0 [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-semibold"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--secondary)]">
        <span>
          {data ? `Checked ${time(data.checkedAt)}` : 'Loading operations…'}
        </span>
        <Button
          variant="ghost"
          disabled={
            alerts.isFetching ||
            status.isFetching ||
            health.isFetching ||
            edition.isFetching ||
            cost.isFetching
          }
          onClick={() => {
            void alerts.refetch();
            void status.refetch();
            void health.refetch();
            void edition.refetch();
            if (edition.data) void cost.refetch();
          }}
        >
          Refresh overview
        </Button>
      </div>
      {(status.isError || health.isError || edition.isError) && (
        <p role="alert">
          Some overview data could not be refreshed. Previously loaded values
          may be out of date. Try refreshing.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          [
            'Health',
            health.isError
              ? 'Unavailable'
              : health.data?.status === 'ok'
                ? 'Online'
                : health.data
                  ? 'Needs attention'
                  : 'Loading…',
            'Database and queue',
          ],
          [
            'Alerts',
            alerts.isError
              ? 'Unavailable'
              : alerts.data
                ? `${alerts.data.firing} firing`
                : 'Loading…',
            alerts.isError
              ? 'Monitoring could not be refreshed'
              : alerts.data
                ? `${alerts.data.pending} pending · refreshes every minute`
                : 'Monitoring alerts',
          ],
          [
            'AI today',
            data ? dollars(data.llm.todayMicros) : 'Loading…',
            data
              ? `of ${dollars(data.llm.dailyCapMicros)} cap · UTC`
              : 'UTC budget',
          ],
          [
            'X today',
            data ? dollars(data.xDiscovery.todayMicros) : 'Loading…',
            data
              ? `of ${dollars(data.xDiscovery.dailyMicros)} cap · includes holds`
              : 'UTC budget',
          ],
        ].map(([label, value, note]) => (
          <Card key={label} className="min-w-0 p-4">
            <h2>{label}</h2>
            <p className="my-3 text-xl font-semibold">{value}</p>
            <p className="m-0 text-xs text-[var(--secondary)]">{note}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2>Latest edition</h2>
          {edition.data && (
            <Button asChild variant="ghost">
              <a href={`/editions/${edition.data.id}`}>View as reader</a>
            </Button>
          )}
        </div>
        {edition.data ? (
          <>
            <p className="text-sm text-[var(--secondary)]">
              {time(edition.data.createdAt)}
              {run?.durationMs != null &&
                ` · ${(run.durationMs / 1000).toFixed(1)} s`}
            </p>
            <div aria-label="Latest edition AI cost" className="mb-4 text-sm">
              {cost.isPending && <p role="status">Loading edition cost…</p>}
              {cost.isError && (
                <p role="alert">
                  Edition cost unavailable.{' '}
                  <Button variant="ghost" onClick={() => void cost.refetch()}>
                    Retry edition cost
                  </Button>
                </p>
              )}
              {cost.data && (
                <p>
                  {cost.data.calls
                    ? `AI cost: $${(cost.data.costMicros / 1e6).toFixed(6)} recorded · ${cost.data.calls} calls · $${(cost.data.reservedMicros / 1e6).toFixed(6)} unresolved holds`
                    : 'No AI ledger calls linked to this edition.'}
                </p>
              )}
              <a
                className="text-sm font-medium"
                href={`/admin/editions/${edition.data.id}`}
              >
                Inspect edition and cost breakdown
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {edition.data.topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-md border border-[var(--border)] p-3"
                >
                  <h3 className="m-0 font-sans text-sm font-semibold">
                    {topic.name}
                  </h3>
                  <p className="mb-0 text-sm">
                    Stories:{' '}
                    {topic.editorial?.mode === 'ai' ? 'AI' : 'Signal ranking'} ·{' '}
                    {topic.stories.length}
                  </p>
                  <p className="mt-1 mb-0 text-sm">
                    Posts:{' '}
                    {topic.postEditorial?.mode === 'ai'
                      ? 'AI'
                      : 'Signal ranking'}{' '}
                    · {topic.posts?.length ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>
            {edition.isPending
              ? 'Loading edition…'
              : edition.isError
                ? 'Edition unavailable.'
                : 'No saved edition yet.'}
          </p>
        )}
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2>Source health</h2>
          {data ? (
            issues?.length ? (
              <ul className="mb-0 space-y-3 pl-4 text-sm">
                {issues.map((source) => (
                  <li key={source.id}>
                    <strong>{source.name}</strong>
                    <span className="block break-words text-[var(--secondary)]">
                      {source.error || 'Collection overdue'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-0 text-sm">All active sources are collecting.</p>
            )
          ) : (
            <p>Source status unavailable.</p>
          )}
        </Card>
        <Card>
          <h2>Next scheduled runs</h2>
          {data?.queues
            .filter((queue) =>
              ['digest-generation', 'social-collection'].includes(queue.name),
            )
            .map((queue) => (
              <div key={queue.name} className="mt-4 text-sm">
                <strong>
                  {queue.name === 'digest-generation'
                    ? 'Edition'
                    : queue.name === 'social-collection'
                      ? 'Social collection'
                      : queue.name}
                </strong>
                <p className="mt-1 mb-0 text-[var(--secondary)]">
                  {queue.nextRun
                    ? time(queue.nextRun)
                    : 'No scheduled run reported'}
                  {(!queue.available || queue.paused || queue.workers === 0) &&
                    ' · Needs attention'}
                </p>
              </div>
            ))}
        </Card>
      </div>
      <a className="text-sm" href="/grafana/alerting/list">
        View monitoring alerts in Grafana ↗
      </a>
    </section>
  );
}
