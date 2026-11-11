import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import {
  identityQuery,
  publicStatusQuery,
  scheduleQuery,
  statusQuery,
} from './queries';
import { ScheduleSettings } from './ScheduleSettings';

export function AdminSchedule({
  publicMode = false,
}: {
  publicMode?: boolean;
}) {
  const client = useQueryClient();
  const schedule = useQuery(scheduleQuery);
  const identity = useQuery(identityQuery);
  const privateStatus = useQuery({ ...statusQuery, enabled: !publicMode });
  const publicStatus = useQuery({ ...publicStatusQuery, enabled: publicMode });
  const status = publicMode ? publicStatus : privateStatus;
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
      {schedule.isError && (
        <div role="alert">
          <p>Schedule could not be loaded.</p>
          <Button onClick={() => void schedule.refetch()}>
            Retry schedule
          </Button>
        </div>
      )}
      {schedule.isPending && <p role="status">Loading schedule…</p>}
      {schedule.data && (
        <ScheduleSettings
          schedule={schedule.data}
          readOnly={identity.data?.isAdmin !== true}
          onSaved={(saved) => {
            client.setQueryData(scheduleQuery.queryKey, saved);
            void client.invalidateQueries({
              queryKey: publicMode
                ? publicStatusQuery.queryKey
                : statusQuery.queryKey,
            });
          }}
        />
      )}
    </section>
  );
}
