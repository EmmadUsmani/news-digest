import { useQuery } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { publicQueuesQuery } from './queries';

export function PublicQueues() {
  const status = useQuery(publicQueuesQuery);
  return (
    <section className="grid gap-5" aria-label="Queue status">
      <h1 className="font-sans text-2xl">Queue status</h1>
      <p>Read-only job counts and next scheduled runs.</p>
      <Button
        variant="ghost"
        disabled={status.isFetching}
        onClick={() => void status.refetch()}
      >
        Refresh queues
      </Button>
      {status.isPending && <p role="status">Loading queues…</p>}
      {status.isError && (
        <p role="alert">
          Queue status could not be refreshed.{' '}
          {status.data && 'Previously loaded values may be out of date.'} Try
          refreshing.
        </p>
      )}
      {status.data?.queues.length === 0 && <p>No queues available.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {status.data?.queues.map((queue) => (
          <Card key={queue.name} className="min-w-0 p-4">
            <h2 className="break-words font-sans text-lg">{queue.name}</h2>
            <dl className="grid grid-cols-2 gap-2">
              {Object.entries(queue.counts).map(([state, count]) => (
                <div key={state}>
                  <dt className="capitalize text-sm text-[var(--secondary)]">
                    {state}
                  </dt>
                  <dd className="m-0">{count}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm">
              Next scheduled run:{' '}
              {queue.nextRunAt
                ? new Date(queue.nextRunAt).toLocaleString(undefined, {
                    timeZoneName: 'short',
                  })
                : 'Not scheduled'}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
