import { useQuery } from '@tanstack/react-query';

import { statusQuery } from './queries';
const time = (value: string | null) =>
  value ? new Date(value).toLocaleString() : 'Never';
export function StatusPanel() {
  const {
    data: status,
    isError: error,
    isFetching: loading,
    refetch,
  } = useQuery(statusQuery);
  const lastDigestRun = status?.queues
    .filter((queue) => queue.name === 'digest-generation')
    .flatMap((queue) => queue.runs)
    .filter((run) => run.finishedAt && run.durationMs != null)
    .sort((a, b) => b.finishedAt!.localeCompare(a.finishedAt!))[0];
  return (
    <details className="status-panel">
      <summary>Source &amp; run status</summary>
      <p>Collection and edition activity. Refreshes every minute.</p>
      <button type="button" onClick={() => void refetch()} disabled={loading}>
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
          {status.coverage && (
            <section aria-label="Topic coverage">
              <h3>Topic coverage · last 24 hours</h3>
              <p>
                Published {time(status.coverage.start)} –{' '}
                {time(status.coverage.end)}. Articles are deduplicated within
                each topic. Posts have stored verification and a known
                publication time. Source connections indicate discovery scope;
                these counts do not measure relevance or editorial quality.
              </p>
              <div className="status-grid">
                {status.coverage.topics.map((topic) => (
                  <article key={topic.topicId}>
                    <h4>
                      {topic.name}
                      {!topic.enabled && ' · Paused'}
                    </h4>
                    <p>
                      {topic.articles} articles · {topic.xPosts} X posts ·{' '}
                      {topic.redditPosts} Reddit posts
                    </p>
                    <p>
                      {topic.healthySources} / {topic.connectedSources} sources
                      healthy
                    </p>
                  </article>
                ))}
              </div>
              <small>
                Healthy sources succeeded in the past hour with no current
                error. Paused topics retain stored coverage.
              </small>
            </section>
          )}
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
                  <p>
                    {queue.name === 'social-collection'
                      ? 'Next social collection'
                      : 'Next scheduled edition'}
                    : {time(queue.nextRun)}
                  </p>
                )}
              </article>
            ))}
          </div>
          <h3>Recent edition runs</h3>
          {lastDigestRun && (
            <p>
              Last finished run: {(lastDigestRun.durationMs! / 1000).toFixed(1)}
              s processing · {lastDigestRun.state}. Queue wait is excluded;
              retried jobs show the final attempt.
            </p>
          )}
          <p>
            Up to 20 retained jobs. Scheduled jobs retry up to three attempts;
            on-demand jobs run once. After an outage, queued runs up to six
            hours late keep their original coverage window. Older runs are
            skipped; missed days are not backfilled. Use a custom window to
            recover missed coverage. Includes on-demand editions; saved editions
            are also in history.
          </p>
          <ul className="run-list">
            {status.queues
              .filter((queue) => queue.name === 'digest-generation')
              .flatMap((queue) => queue.runs)
              .map((run) => (
                <li key={run.id}>
                  <strong>{run.state}</strong> ·{' '}
                  {run.scheduledAt
                    ? `scheduled ${time(run.scheduledAt)}`
                    : 'on-demand'}{' '}
                  · {run.attempts} attempts
                  {run.durationMs != null && (
                    <> · {(run.durationMs / 1000).toFixed(1)}s processing</>
                  )}
                  {run.finishedAt && <> · finished {time(run.finishedAt)}</>}
                  {run.skipped && <> · {run.skipped}</>}
                  {run.editionId && (
                    <>
                      {' '}
                      · <a href={`/editions/${run.editionId}`}>Open edition</a>
                    </>
                  )}
                </li>
              ))}
          </ul>
          {!status.queues.some(
            (queue) => queue.name === 'digest-generation' && queue.runs.length,
          ) && <p>No retained edition runs yet.</p>}
          <section aria-label="Free social collection">
            <h3>Free social collection</h3>
            <p>
              Up to 20 retained hourly collection jobs. A completed job can
              include source or embed errors. Counts are observations and
              successful embed checks, including refreshes; they do not measure
              new posts, relevance or virality.
            </p>
            <ul className="run-list">
              {status.queues
                .filter((queue) => queue.name === 'social-collection')
                .flatMap((queue) => queue.runs)
                .map((run) => (
                  <li key={run.id}>
                    <strong>{run.state}</strong>
                    {run.scheduledAt && (
                      <> · scheduled {time(run.scheduledAt)}</>
                    )}
                    {run.finishedAt && <> · finished {time(run.finishedAt)}</>}
                    {run.socialCollection ? (
                      <>
                        <br />
                        {run.socialCollection.sources} river sources ·{' '}
                        {run.socialCollection.citations} river citations ·{' '}
                        {run.socialCollection.discoveryErrors} river errors
                        <br />
                        {run.socialCollection.articleDiscovery.checked}{' '}
                        publisher pages read ·{' '}
                        {run.socialCollection.articleDiscovery.citations} page
                        citations ·{' '}
                        {run.socialCollection.articleDiscovery.errors} page
                        errors
                        <br />
                        {run.socialCollection.verified} successful embed checks
                        · {run.socialCollection.verificationErrors} embed errors
                      </>
                    ) : (
                      <> · Collection counts unavailable</>
                    )}
                  </li>
                ))}
            </ul>
            {!status.queues.some(
              (queue) =>
                queue.name === 'social-collection' && queue.runs.length,
            ) && <p>No retained social collection runs yet.</p>}
          </section>
        </>
      )}
    </details>
  );
}
