import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { AddFeedDialog } from './AddFeedDialog';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Table } from './components/ui/table';
import { statusQuery, topicsQuery } from './queries';

const time = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, { timeZoneName: 'short' })
    : 'Never';

export function AdminSources() {
  const status = useQuery(statusQuery);
  const topics = useQuery(topicsQuery);
  const data = status.data;
  return (
    <section
      aria-label="Source collection"
      className="grid max-w-none gap-5 p-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--secondary)]">
        <span>
          {data
            ? `${data.sources.length} sources · Checked ${time(data.checkedAt)}`
            : 'Loading sources…'}
        </span>
        <Button
          variant="ghost"
          disabled={status.isFetching}
          onClick={() => {
            void status.refetch();
            void topics.refetch();
          }}
        >
          Refresh sources
        </Button>
      </div>
      {status.isError && (
        <p role="alert">
          Sources could not be refreshed. Previously loaded values may be out of
          date.
        </p>
      )}
      <Card className="grid gap-2 text-sm">
        <AddFeedDialog topics={topics.data ?? []} />
        <p className="m-0">
          Open a topic to connect sources, add a feed or add a news query.
        </p>
        <Link
          to="/admin/topics"
          className="w-fit text-sm font-medium underline"
        >
          Manage topics & feeds
        </Link>
      </Card>
      {topics.isError && (
        <p role="alert">
          Topic connections could not be refreshed. Refresh sources to retry.
        </p>
      )}
      <p className="m-0 text-sm text-[var(--secondary)]">
        Recent counts use article publication time over the past 24 hours and 7
        days. An article can appear under each source that collected it.
      </p>
      <Card className="min-w-0 p-0">
        <Table>
          <caption className="sr-only">
            Content source collection health
          </caption>
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Topics</th>
              <th scope="col">Status</th>
              <th scope="col">Last success</th>
              <th scope="col">Last attempt</th>
              <th scope="col">Last response</th>
              <th scope="col">Articles 24 h</th>
              <th scope="col">Articles 7 d</th>
              <th scope="col">Stored articles</th>
              <th scope="col">Last error</th>
            </tr>
          </thead>
          <tbody>
            {data?.sources.map((source) => {
              const state = !source.active
                ? 'Paused'
                : source.error
                  ? 'Failed'
                  : !source.lastSuccess ||
                      Date.parse(data.checkedAt) -
                        Date.parse(source.lastSuccess) >
                        3_600_000
                    ? 'Overdue'
                    : source.lastItemCount === 0
                      ? 'Empty response'
                      : 'Collecting';
              return (
                <tr key={source.id}>
                  <th scope="row" className="min-w-40">
                    {source.name}
                  </th>
                  <td className="min-w-40">
                    {topics.data ? (
                      topics.data.some((topic) =>
                        topic.sources.includes(source.id),
                      ) ? (
                        <ul className="m-0 grid list-none gap-2 p-0">
                          {topics.data
                            .filter((topic) =>
                              topic.sources.includes(source.id),
                            )
                            .map((topic) => (
                              <li key={topic.id}>
                                <Link
                                  to="/admin/topics/$id"
                                  params={{ id: topic.id }}
                                  className="text-sm font-medium underline"
                                >
                                  {topic.name}
                                </Link>
                                {!topic.enabled && (
                                  <span className="text-[var(--secondary)]">
                                    {' '}
                                    · Disabled
                                  </span>
                                )}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        'No topics'
                      )
                    ) : topics.isError ? (
                      'Unavailable'
                    ) : (
                      'Loading…'
                    )}
                  </td>
                  <td>
                    <span className="whitespace-nowrap">
                      <span
                        aria-hidden="true"
                        className={`mr-2 inline-block size-2 rounded-full ${state === 'Collecting' ? 'bg-emerald-500' : state === 'Paused' ? 'bg-slate-400' : 'bg-amber-500'}`}
                      />
                      {state}
                    </span>
                  </td>
                  <td className="min-w-40">{time(source.lastSuccess)}</td>
                  <td className="min-w-40">{time(source.lastAttempt)}</td>
                  <td>{source.lastItemCount}</td>
                  <td data-testid="items-24h">{source.items24h}</td>
                  <td data-testid="items-7d">{source.items7d}</td>
                  <td>{source.storedItems}</td>
                  <td className="min-w-44 max-w-80 break-words">
                    {source.error || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {data?.sources.length === 0 && (
          <p className="p-4 text-sm">No sources configured.</p>
        )}
      </Card>
      <Card>
        <h2 className="mt-0 font-sans text-base font-semibold">
          Social platforms
        </h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {[
            [
              'X',
              'Official embeds · harvested links; scheduled search off pending experiment decision',
            ],
            ['Bluesky', 'Authenticated hourly collection'],
            ['Reddit', 'Parked by owner · collection disabled'],
            ['YouTube', 'Deferred by owner'],
          ].map(([name, description]) => (
            <div key={name}>
              <dt className="font-semibold">{name}</dt>
              <dd className="mt-1 ml-0 text-[var(--secondary)]">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}
