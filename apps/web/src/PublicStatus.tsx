import type { PublicOperationsStatus } from '@digest/contracts';

import { Card } from './components/ui/card';

const money = (micros: number) => `$${(micros / 1e6).toFixed(3)}`;
const time = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, { timeZoneName: 'short' })
    : 'Never';

// Prepared public view; route composition remains gated separately.
export function PublicStatus({ data }: { data: PublicOperationsStatus }) {
  return (
    <section
      aria-label="Public operations status"
      className="grid gap-5 [&_h1]:font-sans [&_h1]:text-2xl [&_h2]:font-sans [&_h2]:text-lg [&_h3]:font-sans [&_dd]:m-0 [&_dt]:mt-3 [&_dt]:text-sm [&_dt]:text-[var(--secondary)]"
    >
      <h1>System status</h1>
      <p>Checked {time(data.checkedAt)}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            name: 'AI production',
            budget: data.llm,
            cap: data.llm?.dailyCapMicros,
            monthly: data.llm?.monthlyCapMicros,
            holds: data.llm?.todayReservedMicros,
          },
          {
            name: 'X production',
            budget: data.xDiscovery,
            cap: data.xDiscovery?.dailyMicros,
            monthly: data.xDiscovery?.monthlyMicros,
            holds: data.xDiscovery?.reservedMicros,
          },
        ].map(({ name, budget, cap, monthly, holds }) => (
          <Card key={name} className="min-w-0 p-4">
            <h2>{name} budget</h2>
            {budget ? (
              <dl>
                <dt>Spent today (UTC)</dt>
                <dd>
                  {money(budget.todayMicros)} / {money(cap!)}
                </dd>
                <dt>Spent this month (UTC)</dt>
                <dd>
                  {money(budget.monthMicros)} / {money(monthly!)}
                </dd>
                <dt>
                  Outstanding holds
                  {name === 'AI production' ? ' today (UTC)' : ''}
                </dt>
                <dd>{money(holds!)}</dd>
                {name === 'AI production' && data.llm && (
                  <>
                    <dt>Outstanding holds this month (UTC)</dt>
                    <dd>{money(data.llm.monthReservedMicros)}</dd>
                  </>
                )}
                <dt>Available allowance</dt>
                <dd>{money(budget.availableMicros)}</dd>
              </dl>
            ) : (
              <p>Budget unavailable</p>
            )}
            {name === 'X production' && data.xDiscovery?.blocked && (
              <p>Discovery paused by budget controls</p>
            )}
          </Card>
        ))}
      </div>
      <h2>Source health</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {data.sources.map((source) => (
          <Card key={source.id} className="min-w-0 break-words p-4">
            <h3>{source.name}</h3>
            <p>
              {!source.enabled
                ? 'Disabled'
                : !source.active
                  ? 'Inactive'
                  : source.hasError
                    ? 'Recent collection failed'
                    : !source.lastSuccess
                      ? 'Awaiting first collection'
                      : Date.parse(data.checkedAt) -
                            Date.parse(source.lastSuccess) >
                          3_600_000
                        ? 'Collection delayed'
                        : 'Collecting'}
            </p>
            <p>Last attempt: {time(source.lastAttempt)}</p>
            <p>Last success: {time(source.lastSuccess)}</p>
            <p>
              {source.lastItemCount} last collected · {source.storedItems}{' '}
              stored · {source.items24h} in 24 hours · {source.items7d} in 7
              days
            </p>
          </Card>
        ))}
        {!data.sources.length && <p>No sources available</p>}
      </div>
      <h2>Job queues</h2>
      {data.queues.map((queue) => (
        <Card key={queue.name} className="min-w-0 p-4">
          <h3>{queue.name}</h3>
          <p>
            {!queue.available
              ? 'Unavailable'
              : queue.paused
                ? 'Paused'
                : queue.workers === 0
                  ? 'No workers'
                  : 'Running'}{' '}
            · {queue.workers} workers
          </p>
          <p>
            {Object.entries(queue.counts)
              .map(([name, count]) => `${name}: ${count}`)
              .join(' · ') || 'Counts unavailable'}
          </p>
          <p>
            Next run: {queue.nextRun ? time(queue.nextRun) : 'Not scheduled'}
          </p>
        </Card>
      ))}
      {!data.queues.length && <p>No queues available</p>}
      <h2>Topic coverage</h2>
      {data.coverage ? (
        <>
          <p>
            {time(data.coverage.start)} – {time(data.coverage.end)}
          </p>
          {data.coverage.topics.map((topic) => (
            <Card key={topic.topicId} className="min-w-0 p-4">
              <h3>
                {topic.name}
                {!topic.enabled && ' (disabled)'}
              </h3>
              <p>
                {topic.healthySources} / {topic.connectedSources} healthy
                sources · {topic.articles} articles · {topic.xPosts} X posts ·{' '}
                {topic.redditPosts} Reddit posts
              </p>
            </Card>
          ))}
          {!data.coverage.topics.length && <p>No topics available</p>}
        </>
      ) : (
        <p>Coverage unavailable</p>
      )}
    </section>
  );
}
