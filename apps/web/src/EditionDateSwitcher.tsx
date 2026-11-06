import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import { editionHistoryQuery } from './queries';

export function EditionDateSwitcher({
  edition,
}: {
  edition?: { id: string; windowEnd: string } | null;
}) {
  const client = useQueryClient();
  const navigation = useRef<HTMLElement>(null);
  const recovering = useRef(false);
  const [retrying, setRetrying] = useState(false);
  const neighbors = useQuery({
    queryKey: ['editions', 'neighbors', edition?.id],
    enabled: !!edition,
    // History reads already own their retries, including non-retryable failures.
    retry: false,
    queryFn: async ({ signal }) => {
      let newer: string | undefined;
      for (let offset = 0; ; offset += 20) {
        signal.throwIfAborted();
        const page = await client.fetchQuery(editionHistoryQuery(offset));
        const index = page.entries.findIndex(
          (entry) => entry.id === edition?.id,
        );
        if (index >= 0) {
          const older = page.entries[index + 1]?.id;
          const next =
            !older && page.hasMore
              ? await client.fetchQuery(editionHistoryQuery(offset + 20))
              : undefined;
          return {
            newer: page.entries[index - 1]?.id ?? newer,
            older: older ?? next?.entries[0]?.id,
          };
        }
        if (!page.hasMore) return {};
        newer = page.entries.at(-1)?.id;
      }
    },
  });
  useEffect(() => {
    if (
      !recovering.current ||
      retrying ||
      neighbors.isFetching ||
      neighbors.isError
    )
      return;
    recovering.current = false;
    navigation.current?.querySelector<HTMLAnchorElement>('a')?.focus();
  }, [neighbors.isFetching, neighbors.isError, retrying]);
  const linkClass =
    'flex h-9 w-7 items-center justify-center rounded-md text-[var(--secondary)] hover:bg-[var(--muted)]';
  return (
    <nav
      ref={navigation}
      aria-label="Edition dates"
      className="flex items-center gap-1"
    >
      {neighbors.data?.older && !neighbors.isError && !retrying ? (
        <Link
          to="/editions/$id"
          params={{ id: neighbors.data.older }}
          aria-label="Older edition"
          className={linkClass}
        >
          ‹
        </Link>
      ) : neighbors.isError || retrying ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Retry edition dates"
          title="Edition dates unavailable. Try again."
          disabled={neighbors.isFetching}
          className={`${linkClass} p-0`}
          onClick={() => {
            recovering.current = true;
            setRetrying(true);
            void neighbors.refetch().finally(() => setRetrying(false));
          }}
        >
          <RotateCw
            aria-hidden="true"
            className={`size-4 ${neighbors.isFetching ? 'motion-safe:animate-spin' : ''}`}
          />
        </Button>
      ) : (
        <span className="w-7" />
      )}
      <Link
        to="/editions"
        search={{ page: 1 }}
        aria-label="Browse past editions"
        aria-description={
          edition
            ? new Date(edition.windowEnd).toLocaleDateString(undefined, {
                dateStyle: 'long',
              })
            : undefined
        }
        className="text-sm font-normal whitespace-nowrap text-[var(--secondary)]"
      >
        {edition ? (
          <time dateTime={edition.windowEnd}>
            <span className="sm:hidden">
              {new Date(edition.windowEnd).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
              <span className="sr-only">
                {`, ${new Date(edition.windowEnd).getFullYear()}`}
              </span>
            </span>
            <span className="hidden sm:inline">
              {new Date(edition.windowEnd).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </time>
        ) : (
          'Past editions'
        )}
      </Link>
      {neighbors.data?.newer ? (
        <Link
          to="/editions/$id"
          params={{ id: neighbors.data.newer }}
          aria-label="Newer edition"
          className={linkClass}
        >
          ›
        </Link>
      ) : (
        <span className="w-7" />
      )}
    </nav>
  );
}
