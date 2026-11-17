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
  const recovering = useRef(false);
  useEffect(() => {
    if (!recovering.current || history.isFetching || !history.isSuccess) return;
    recovering.current = false;
    heading.current?.focus();
  }, [history.isFetching, history.isSuccess]);
  useEffect(() => {
    // Wait for the new dates (or retry control) before resuming keyboard reading.
    if (previousPage.current === page || history.isPending) return;
    previousPage.current = page;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [page, history.isPending]);
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-[20px] pb-16 [overflow-wrap:anywhere] sm:px-[24px]">
      <ReaderSkipLink target="archive-content" />
      <header className="flex flex-wrap items-center justify-between gap-[12px] border-b border-[var(--border)] py-[20px]">
        <Link
          to="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          News Digest
        </Link>
        <nav
          aria-label="Reader navigation"
          className="flex max-w-full flex-wrap items-center gap-[12px]"
        >
          <Link
            to="/saved"
            className="inline-flex min-h-[44px] items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Saved items
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <div className="pt-[48px]">
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
          <div role="status" className="my-[32px]">
            <span className="sr-only">Loading editions…</span>
            <div aria-hidden="true" className="divide-y divide-[var(--border)]">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex flex-col gap-[12px] py-[20px]">
                  <Skeleton className="h-[24px] w-3/4 max-w-[320px]" />
                  <Skeleton className="h-[16px] w-full max-w-[448px]" />
                  <Skeleton className="h-[16px] w-2/3 max-w-[256px]" />
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
            <Button
              className="h-auto min-h-[44px] px-[16px] py-[8px]"
              onClick={() => {
                recovering.current = true;
                void history.refetch();
              }}
            >
              Try again
            </Button>
          </div>
        )}
        {history.data && (
          <>
            <ul className="my-[32px] list-none divide-y divide-[var(--border)] p-0">
              {history.data.entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to="/editions/$id"
                    params={{ id: entry.id }}
                    className="block rounded-md py-[20px] hover:bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
                    <span className="archive-window mt-[4px] block text-sm font-normal text-[var(--secondary)]">
                      Coverage:{' '}
                      <time dateTime={entry.windowStart}>
                        {new Date(entry.windowStart).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short',
                        })}
                      </time>
                      {' – '}
                      <time dateTime={entry.windowEnd}>
                        {new Date(entry.windowEnd).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short',
                        })}
                      </time>
                    </span>
                    <span className="mt-[4px] block text-sm font-normal text-[var(--secondary)]">
                      {entry.topics.map((topic) => topic.name).join(' · ')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {!history.data.entries.length && (
              <div className="my-8 text-sm text-[var(--secondary)]">
                <p>No editions on this page.</p>
                {page > 1 && (
                  <Link
                    to="/editions"
                    search={{ page: 1 }}
                    className="inline-flex min-h-[44px] items-center rounded-md font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    Back to newest editions
                  </Link>
                )}
              </div>
            )}
          </>
        )}
        <nav
          aria-label="Edition pages"
          className="mt-[32px] flex flex-wrap items-center justify-between gap-[12px] text-sm"
        >
          {page > 1 ? (
            <Link
              to="/editions"
              search={{ page: page - 1 }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              ← Newer editions
            </Link>
          ) : (
            <span />
          )}
          <span className="order-first w-full text-center text-[var(--secondary)] sm:order-none sm:w-auto">
            Page {page}
          </span>
          {history.data?.hasMore ? (
            <Link
              to="/editions"
              search={{ page: page + 1 }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
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
