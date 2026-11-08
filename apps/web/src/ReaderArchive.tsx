import { useQuery } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Skeleton } from './components/ui/skeleton';
import { editionHistoryQuery } from './queries';
import { ReaderSkipLink } from './ReaderSkipLink';

export function ReaderArchive() {
  const { page } = useSearch({ from: '/editions' });
  const history = useQuery(editionHistoryQuery((page - 1) * 20));
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPage = useRef(page);
  useEffect(() => {
    // Wait for the new dates (or retry control) before resuming keyboard reading.
    if (previousPage.current === page || history.isPending) return;
    previousPage.current = page;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [page, history.isPending]);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 sm:px-6">
      <ReaderSkipLink target="archive-content" />
      <header className="flex items-center justify-between border-b border-[var(--border)] py-5">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          News Digest
        </Link>
        <nav aria-label="Reader navigation" className="flex items-center gap-3">
          <Link
            to="/saved"
            className="inline-flex min-h-11 items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Saved items
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <div className="pt-12">
        <h1
          ref={heading}
          id="archive-content"
          aria-description={`Page ${page}`}
          tabIndex={-1}
          className="m-0 scroll-mt-6 font-sans text-3xl leading-tight font-semibold tracking-tight"
        >
          Past editions
        </h1>
        {history.isPending && (
          <div role="status" className="my-8">
            <span className="sr-only">Loading editions…</span>
            <div aria-hidden="true" className="divide-y divide-[var(--border)]">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="space-y-3 py-5">
                  <Skeleton className="h-6 w-3/4 max-w-80" />
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-4 w-2/3 max-w-64" />
                </div>
              ))}
            </div>
          </div>
        )}
        {history.isError && (
          <div role="alert" className="mt-6">
            <p>
              {history.data
                ? 'Past editions could not be refreshed. Showing saved links already loaded.'
                : 'Could not load past editions.'}
            </p>
            <Button onClick={() => void history.refetch()}>Try again</Button>
          </div>
        )}
        {history.data && (
          <>
            <ul className="my-8 list-none divide-y divide-[var(--border)] p-0">
              {history.data.entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to="/editions/$id"
                    params={{ id: entry.id }}
                    className="block rounded-md py-5 hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    <time
                      dateTime={entry.windowEnd}
                      className="block text-lg font-semibold"
                    >
                      {new Date(entry.windowEnd).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                    <span className="archive-window mt-1 block text-sm font-normal text-[var(--secondary)]">
                      Coverage:{' '}
                      <time dateTime={entry.windowStart}>
                        {new Date(entry.windowStart).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                      {' – '}
                      <time dateTime={entry.windowEnd}>
                        {new Date(entry.windowEnd).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </span>
                    <span className="mt-1 block text-sm font-normal text-[var(--secondary)]">
                      {entry.topics.map((topic) => topic.name).join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {!history.data.entries.length && (
              <p className="my-8 text-sm text-[var(--secondary)]">
                No editions on this page.
              </p>
            )}
          </>
        )}
        <nav
          aria-label="Edition pages"
          className="mt-8 flex items-center justify-between gap-3 text-sm"
        >
          {page > 1 ? (
            <Link
              to="/editions"
              search={{ page: page - 1 }}
              className="inline-flex min-h-11 min-w-11 items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              ← Newer editions
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[var(--secondary)]">Page {page}</span>
          {history.data?.hasMore ? (
            <Link
              to="/editions"
              search={{ page: page + 1 }}
              className="inline-flex min-h-11 min-w-11 items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Older editions →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </main>
  );
}
