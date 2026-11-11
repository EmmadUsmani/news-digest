import { useQuery } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { PublicStatus } from './PublicStatus';
import { publicStatusQuery } from './queries';

// Prepared page: install only with the sanitized status transport and public
// page authorization. The private overview retains its own query and cache.
export function PublicStatusPage({
  budgetsOnly = false,
}: {
  budgetsOnly?: boolean;
}) {
  const status = useQuery(publicStatusQuery);
  return (
    <div className="grid gap-5">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          disabled={status.isFetching}
          onClick={() => void status.refetch()}
        >
          Refresh status
        </Button>
      </div>
      {status.isPending && <p role="status">Loading system status…</p>}
      {status.isError && (
        <p role="alert">
          System status could not be refreshed.
          {status.data && ' Previously loaded values may be out of date.'} Try
          refreshing.
        </p>
      )}
      {status.data && (
        <PublicStatus data={status.data} budgetsOnly={budgetsOnly} />
      )}
    </div>
  );
}
