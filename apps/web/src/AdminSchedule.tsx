import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { profileQuery, statusQuery } from './queries';
import { ScheduleSettings } from './ScheduleSettings';

export function AdminSchedule() {
  const client = useQueryClient();
  const profile = useQuery(profileQuery);
  const status = useQuery(statusQuery);
  const queue = status.data?.queues.find(
    (item) => item.name === 'digest-generation',
  );
  return (
    <section aria-label="Edition schedule" className="grid max-w-3xl gap-5 p-0">
      <Card>
        <h2 className="mt-0 font-sans text-base font-semibold">Next edition</h2>
        <p className="mb-0 text-sm">
          {status.isError
            ? 'Next run could not be refreshed.'
            : queue?.nextRun
              ? new Date(queue.nextRun).toLocaleString(undefined, {
                  timeZoneName: 'short',
                })
              : status.isPending
                ? 'Loading next run…'
                : 'No scheduled run reported'}
        </p>
        {queue && (!queue.available || queue.paused || queue.workers === 0) && (
          <p role="alert" className="text-sm">
            The edition queue needs attention.
          </p>
        )}
      </Card>
      {profile.isError && (
        <div role="alert">
          <p>Schedule could not be loaded.</p>
          <Button onClick={() => void profile.refetch()}>Retry schedule</Button>
        </div>
      )}
      {profile.isPending && <p role="status">Loading schedule…</p>}
      {profile.data && (
        <ScheduleSettings
          profile={profile.data}
          onSaved={(saved) => {
            client.setQueryData(profileQuery.queryKey, saved);
            void client.invalidateQueries({ queryKey: statusQuery.queryKey });
          }}
        />
      )}
    </section>
  );
}
