import React from 'react';
import {
  operationsStatusSchema,
  type OperationsStatus,
} from '@digest/contracts';
const time = (value: string | null) =>
  value ? new Date(value).toLocaleString() : 'Never';
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
                      ·{' '}
                      <a href={`?edition=${run.editionId}`}>
                        Open preliminary edition
                      </a>
                    </>
                  )}
                </li>
              ))}
          </ul>
          {!status.queues.some((queue) => queue.runs.length) && (
            <p>No retained automatic runs yet.</p>
          )}
          <h3>Editorial review</h3>
          <p>
            These editions use ranking rules. LLM editorial review is not
            connected; usage and cap reporting will appear when it is
            implemented.
          </p>
        </>
      )}
    </details>
  );
}
