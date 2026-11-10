import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from './components/ui/button';
import { publicPreviewHistoryQuery, publicPreviewLatestQuery } from './queries';

export function PublicPreviewHistory() {
  const [offset, setOffset] = useState(0);
  const result = useQuery(publicPreviewHistoryQuery(offset));
  const latest = useQuery(publicPreviewLatestQuery);
  return (
    <section aria-label="Published editions" className="grid gap-5">
      <p>Browse published editions and their topics.</p>
      <Button
        disabled={result.isFetching || latest.isFetching}
        onClick={() => {
          void result.refetch();
          void latest.refetch();
        }}
      >
        Refresh editions
      </Button>
      <section aria-label="Latest published edition" className="grid gap-2">
        <h2>Latest published edition</h2>
        {latest.isPending && <p role="status">Loading latest edition…</p>}
        {latest.isError && (
          <p role="alert">
            Latest published edition unavailable. Try refreshing.
          </p>
        )}
        {latest.isSuccess && latest.data === null && (
          <p>No published edition yet.</p>
        )}
        {latest.data && !latest.isError && (
          <>
            <Link
              to="/editions/$id"
              params={{ id: latest.data.id }}
              className="text-[var(--accent)] underline"
            >
              Read latest published edition
            </Link>
            <p>{latest.data.topics.map((topic) => topic.name).join(' · ')}</p>
          </>
        )}
      </section>
      {result.isPending && <p role="status">Loading editions…</p>}
      {result.isError && (
        <p role="alert">
          Published editions could not be loaded. Try refreshing.
        </p>
      )}
      {result.data && (
        <ul className="m-0 list-none divide-y divide-[var(--border)] p-0">
          {result.data.entries.map((entry) => (
            <li key={entry.id} className="py-4">
              <Link
                to="/editions/$id"
                params={{ id: entry.id }}
                className="font-medium text-[var(--accent)] underline underline-offset-4"
              >
                {new Date(entry.windowEnd).toLocaleDateString(undefined, {
                  dateStyle: 'full',
                })}
              </Link>
              <p className="text-sm text-[var(--secondary)]">
                Coverage:{' '}
                <time dateTime={entry.windowStart}>
                  {new Date(entry.windowStart).toLocaleString()}
                </time>
                {' – '}
                <time dateTime={entry.windowEnd}>
                  {new Date(entry.windowEnd).toLocaleString()}
                </time>
              </p>
              <p className="text-sm">
                {entry.topics.map((topic) => topic.name).join(' · ')}
              </p>
            </li>
          ))}
          {!result.data.entries.length && (
            <li>No published editions on this page.</li>
          )}
        </ul>
      )}
      <nav
        aria-label="Edition pages"
        className="flex flex-wrap items-center gap-3"
      >
        <Button
          variant="ghost"
          disabled={!offset || result.isFetching}
          onClick={() => setOffset((value) => Math.max(0, value - 20))}
        >
          Newer editions
        </Button>
        <span>Page {offset / 20 + 1}</span>
        <Button
          variant="ghost"
          disabled={
            !result.data?.hasMore || result.isFetching || result.isError
          }
          onClick={() => setOffset((value) => value + 20)}
        >
          Older editions
        </Button>
      </nav>
    </section>
  );
}
