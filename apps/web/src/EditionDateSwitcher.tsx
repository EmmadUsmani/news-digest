import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { editionHistoryQuery } from './queries';

export function EditionDateSwitcher({
  edition,
}: {
  edition?: { id: string; windowEnd: string } | null;
}) {
  const client = useQueryClient();
  const neighbors = useQuery({
    queryKey: ['editions', 'neighbors', edition?.id],
    enabled: !!edition,
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
  const linkClass =
    'flex h-9 w-7 items-center justify-center rounded-md text-[var(--secondary)] hover:bg-[var(--muted)]';
  return (
    <nav aria-label="Edition dates" className="flex items-center gap-1">
      {neighbors.data?.older ? (
        <Link
          to="/editions/$id"
          params={{ id: neighbors.data.older }}
          aria-label="Older edition"
          className={linkClass}
        >
          ‹
        </Link>
      ) : (
        <span className="w-7" />
      )}
      <Link
        to="/editions"
        search={{ page: 1 }}
        aria-label="Browse past editions"
        className="text-sm font-normal text-[var(--secondary)]"
      >
        {edition
          ? new Date(edition.windowEnd).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Past editions'}
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
