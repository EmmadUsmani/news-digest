import { useQuery } from '@tanstack/react-query';
import { Link, useSearch } from '@tanstack/react-router';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { editionHistoryQuery } from './queries';

export function ReaderArchive() {
  const { page } = useSearch({ from: '/editions' });
  const history = useQuery(editionHistoryQuery((page - 1) * 20));
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 sm:px-6">
      <header className="flex items-center justify-between border-b border-[var(--border)] py-5">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          News Digest
        </Link>
        <ThemeToggle />
      </header>
      <div className="pt-12">
        <h1 className="m-0 font-sans text-3xl leading-tight font-semibold tracking-tight">
          Past editions
        </h1>
        {history.isPending && <p role="status">Loading editions…</p>}
        {history.isError && (
          <div role="alert" className="mt-6">
            <p>Could not load past editions.</p>
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
                    className="block rounded-md py-5 hover:bg-[var(--muted)]"
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
              className="text-sm font-medium text-[var(--accent)]"
            >
              ← Newer editions
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[var(--secondary)]">Page {page}</span>
          {history.data?.hasMore && !history.isError ? (
            <Link
              to="/editions"
              search={{ page: page + 1 }}
              className="text-sm font-medium text-[var(--accent)]"
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
