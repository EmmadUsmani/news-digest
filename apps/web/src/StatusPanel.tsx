import {
  type OperationsStatus,
  operationsStatusSchema,
} from '@digest/contracts';
import React from 'react';
const time = (value: string | null) =>
  value ? new Date(value).toLocaleString() : 'Never';
const dollars = (micros: number) => '$' + (micros / 1e6).toFixed(6);
export function StatusPanel() {
  const [status, setStatus] = React.useState<OperationsStatus | null>(null);
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error();
      setStatus(operationsStatusSchema.parse(await response.json()));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    void load();
    const timer = setInterval(() => {
      void load();
    }, 60000);
    return () => clearInterval(timer);
  }, [load]);
  return (
    <details className="status-panel">
      <summary>Source &amp; run status</summary>
      <p>Collection and automatic edition activity. Refreshes every minute.</p>
      <button type="button" onClick={() => void load()} disabled={loading}>
        {loading ? 'Refreshing…' : 'Refresh status'}
      </button>
      {error && (
        <p role="alert">
          Status could not be refreshed. Last loaded information may be out of
          date.
        </p>
      )}
      {status && (
        <>
          <p>
            <small>Checked {time(status.checkedAt)}</small>
          </p>
          <h3>Sources</h3>
          <div className="status-grid">
            {status.sources.map((source) => {
              const stale =
                !source.lastSuccess ||
                Date.parse(status.checkedAt) - Date.parse(source.lastSuccess) >
                  3600000;
              const state = !source.active
                ? 'Paused · no enabled topics'
                : source.error
                  ? 'Collection failed'
                  : stale
                    ? 'Collection overdue'
                    : source.lastItemCount === 0
                      ? 'Empty response'
                      : 'Collecting';
              return (
                <article key={source.id}>
                  <h4>{source.name}</h4>
                  <p>{state}</p>
                  <p>
                    {source.storedItems} stored articles ·{' '}
                    {source.lastItemCount} in last response
                  </p>
                  <small>
                    Last attempt: {time(source.lastAttempt)}
                    <br />
                    Last success: {time(source.lastSuccess)}
                  </small>
                  {source.error && <p role="status">{source.error}</p>}
                </article>
              );
            })}
          </div>
          <h3>Queues</h3>
          <div className="status-grid">
            {status.queues.map((queue) => (
              <article key={queue.name}>
                <h4>{queue.name}</h4>
                <p>
                  {!queue.available
                    ? 'Queue unavailable'
                    : queue.paused
                      ? 'Queue paused'
                      : queue.workers === 0
                        ? 'No worker connected'
                        : `${queue.workers} worker connected`}
                </p>
                {queue.available && (
                  <p>
                    {(queue.counts.waiting ?? 0) + (queue.counts.paused ?? 0)}{' '}
                    waiting · {queue.counts.active ?? 0} active ·{' '}
                    {queue.counts.delayed ?? 0} delayed
                    <br />
                    {queue.counts.failed ?? 0} failed ·{' '}
                    {queue.counts.completed ?? 0} completed (retained)
                  </p>
                )}
                {queue.nextRun && (
                  <p>Next scheduled edition: {time(queue.nextRun)}</p>
                )}
              </article>
            ))}
          </div>
          <h3>Recent automatic runs</h3>
          <p>
            Up to 20 retained jobs. Failed jobs retry up to three attempts.
            After an outage, queued runs up to six hours late keep their
            original coverage window. Older runs are skipped; missed days are
            not backfilled. Use a custom window to recover missed coverage.
            Manual editions are in saved edition history.
          </p>
          <ul className="run-list">
            {status.queues
              .flatMap((queue) => queue.runs)
              .map((run) => (
                <li key={run.id}>
                  <strong>{run.state}</strong> · scheduled{' '}
                  {time(run.scheduledAt)} · {run.attempts} attempts
                  {run.finishedAt && <> · finished {time(run.finishedAt)}</>}
                  {run.skipped && <> · {run.skipped}</>}
                  {run.editionId && (
                    <>
                      {' '}
                      · <a href={`?edition=${run.editionId}`}>Open edition</a>
                    </>
                  )}
                </li>
              ))}
          </ul>
          {!status.queues.some((queue) => queue.runs.length) && (
            <p>No retained automatic runs yet.</p>
          )}
          <section aria-label="X discovery usage">
            <h3>X discovery usage</h3>
            <p>
              Paid X discovery is available for manual checks and has not been
              live-verified or scheduled. Free link harvesting and official post
              embeds are running.
            </p>
            <p>
              Today (UTC): {dollars(status.xDiscovery.todayMicros)} spent or
              reserved / {dollars(status.xDiscovery.dailyMicros)} cap.
              <br />
              This month (UTC): {dollars(status.xDiscovery.monthMicros)} spent
              or reserved / {dollars(status.xDiscovery.monthlyMicros)} cap.
            </p>
            <p>
              {dollars(status.xDiscovery.reservedMicros)} reserved or awaiting
              reconciliation. Available today:{' '}
              {dollars(status.xDiscovery.availableMicros)}.
            </p>
            {status.xDiscovery.blocked && (
              <p role="status">
                X prepaid credits depleted. Paid searches are stopped pending
                credit review.
              </p>
            )}
          </section>
          <section aria-label="AI usage">
            <h3>AI usage</h3>
            <p>
              AI review uses Haiku for triage and Sonnet for final editing. When
              funds run low, editing falls back to Haiku, then labeled signal
              ranking. Usage includes verification calls.
            </p>
            <p>
              Today (UTC): {dollars(status.llm.todayMicros)} spent /{' '}
              {dollars(status.llm.dailyCapMicros)} cap.
              <br />
              This month (UTC): {dollars(status.llm.monthMicros)} spent /{' '}
              {dollars(status.llm.monthlyCapMicros)} cap.
            </p>
            <p>
              {dollars(status.llm.todayReservedMicros)} reserved or awaiting
              reconciliation. Available today:{' '}
              {dollars(status.llm.availableMicros)}.
            </p>
            {status.llm.modelAllocation && (
              <p>
                Final editor ({status.llm.modelAllocation.model}):{' '}
                {dollars(status.llm.modelAllocation.usedMicros)} spent or
                reserved / {dollars(status.llm.modelAllocation.dailyCapMicros)}{' '}
                daily allocation. Available:{' '}
                {dollars(status.llm.modelAllocation.availableMicros)}. The
                remaining shared budget supports Haiku triage and fallback
                editing.
              </p>
            )}
            {status.llm.blockedUntil && (
              <p role="status">
                Provider spend limit reached. Calls stopped until{' '}
                {time(status.llm.blockedUntil)}.
              </p>
            )}
            <ul>
              {status.llm.models.map((model) => (
                <li key={model.model}>
                  {model.model}: {model.calls} calls this month ·{' '}
                  {dollars(model.costMicros)}
                </li>
              ))}
            </ul>
            {status.llm.lastError && (
              <p>
                Last provider error: {status.llm.lastError.code} ·{' '}
                {time(status.llm.lastError.at)}
              </p>
            )}
          </section>
        </>
      )}
    </details>
  );
}
