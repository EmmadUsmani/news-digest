import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { Button } from './components/ui/button';
import { editionHistoryQuery, editionQuery, statusQuery } from './queries';
import { TopPosts } from './TopPosts';
export function DigestPreview() {
  const navigate = useNavigate();
  const { id: selectedEditionId } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const edition = useQuery(editionQuery(selectedEditionId));
  const preview = edition.data;
  const loaded = !edition.isPending;
  const [windowChoice, setWindowChoice] = React.useState('24');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [windowError, setWindowError] = React.useState('');
  const [jobId, setJobId] = React.useState<string | null>(() =>
    sessionStorage.getItem('edition-job'),
  );
  const [jobMessage, setJobMessage] = React.useState('');
  const {
    data: status,
    isError: budgetError,
    refetch: refreshBudgetNotice,
  } = useQuery(statusQuery);
  const reserve = status?.llm.scheduledReserve;
  const budgetNotice = budgetError
    ? 'AI budget availability could not be checked. Scheduled edition protection still applies; manual runs may use labeled non-AI ranking.'
    : reserve?.enabled && reserve.limitedByReserve
      ? `AI budget reserved for the scheduled edition. Manual runs have $${(reserve.otherAvailableMicros / 1e6).toFixed(6)} available for AI; some or all topics may use labeled non-AI ranking. See Source & run status for budget details.`
      : '';
  const [busy, setBusy] = React.useState(false);
  const working = busy || jobId !== null;
  const [error, setError] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const historyResult = useQuery(editionHistoryQuery(offset));
  const history = historyResult.data;
  const historyError = historyResult.isError;
  React.useEffect(() => {
    if (!jobId) return;
    sessionStorage.setItem('edition-job', jobId);
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      sessionStorage.removeItem('edition-job');
      setJobId(null);
    };
    async function poll() {
      try {
        const response = await fetch(
          `/api/digest-previews/jobs/${encodeURIComponent(jobId!)}`,
        );
        if (cancelled) return;
        if (response.status === 404) {
          setJobMessage(
            'This generation job is no longer available. Check saved editions before trying again.',
          );
          finish();
          return;
        }
        if (!response.ok) throw new Error();
        const job = await response.json();
        if (cancelled) return;
        if (job.state === 'failed') {
          setJobMessage('Edition generation failed. Try again later.');
          finish();
          return;
        }
        if (job.state === 'completed' && job.editionId) {
          const saved = await queryClient.fetchQuery(
            editionQuery(job.editionId),
          );
          if (!saved) throw new Error('Completed edition is unavailable');
          if (cancelled) return;
          // An initial history request has no cached data, so invalidation alone
          // can wait for it instead of replacing it with the newly saved edition.
          await queryClient.cancelQueries({
            queryKey: ['editions', 'history'],
          });
          await queryClient.invalidateQueries({ queryKey: ['editions'] });
          if (cancelled) return;
          void navigate({
            to: '/editions/$id',
            params: { id: saved.id },
            replace: true,
          });
          setOffset(0);
          setJobMessage('Edition ready.');
          finish();
          return;
        }
        setJobMessage(
          job.state === 'active'
            ? job.progress?.stage === 'publishing'
              ? 'Publishing your edition…'
              : job.progress?.topics?.length
                ? `Creating your edition: ${job.progress.topics.map((topic: { name: string; stage: string }) => `${topic.name}: ${{ triage: 'triaging stories', editing: 'editing stories', posts: 'triaging and editing posts', ready: 'ready' }[topic.stage] ?? 'processing'}`).join('; ')}.`
                : 'Creating your edition: scoring and editing topics, then publishing. You can leave this page and return.'
            : 'Edition queued. Waiting for the worker…',
        );
      } catch {
        if (cancelled) return;
        setJobMessage(
          'Connection interrupted. Retrying generation status; your job continues in the background.',
        );
      }
      if (!cancelled) timer = setTimeout(() => void poll(), 1500);
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, navigate, queryClient]);
  async function generate() {
    if (working) return;
    const end = windowChoice === 'custom' ? new Date(customEnd) : new Date();
    const start =
      windowChoice === 'custom'
        ? new Date(customStart)
        : new Date(end.getTime() - Number(windowChoice) * 3600000);
    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      start >= end ||
      end.getTime() > Date.now() ||
      end.getTime() - start.getTime() > 31 * 86400000
    ) {
      setWindowError(
        'Choose a start before the end, with no future dates, spanning at most 31 days.',
      );
      return;
    }
    setWindowError('');
    setBusy(true);
    setError(false);
    try {
      await refreshBudgetNotice();
      const response = await fetch('/api/digest-previews/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windowStart: start.toISOString(),
          windowEnd: end.toISOString(),
        }),
      });
      if (!response.ok) throw new Error();
      const job = await response.json();
      if (typeof job.id !== 'string' || !/^[0-9]{1,20}$/.test(job.id))
        throw new Error();
      setJobMessage('Edition queued. Waiting for the worker…');
      setJobId(job.id);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  async function openEdition(id?: string) {
    setBusy(true);
    setError(false);
    try {
      await queryClient.fetchQuery(editionQuery(id));
      void navigate(
        id
          ? { to: '/editions/$id', params: { id }, replace: true }
          : { to: '/', replace: true },
      );
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="digest-preview" aria-label="Ranked edition">
      <p className="eyebrow">YOUR RANKED EDITION</p>
      <h2>A shorter reading list.</h2>
      <p>
        New editions use semantic triage and AI editing of source headlines and
        excerpts, with non-AI ranking labeled per topic when unavailable. Source
        links and selection evidence are retained. Source labels do not
        establish independent reporting. Older editions keep their original
        method.
      </p>
      {budgetNotice && (
        <p role="status" aria-label="Manual edition AI budget">
          {budgetNotice}
        </p>
      )}
      <form
        className="window-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <fieldset disabled={working || !loaded}>
          <legend>Choose a coverage period</legend>
          <label htmlFor="coverage-period">Period</label>
          <select
            id="coverage-period"
            value={windowChoice}
            onChange={(event) => {
              setWindowChoice(event.target.value);
              setWindowError('');
            }}
          >
            <option value="6">Last 6 hours</option>
            <option value="24">Last 24 hours</option>
            <option value="168">Last 7 days</option>
            <option value="custom">Custom period</option>
          </select>
          {windowChoice === 'custom' && (
            <div className="custom-window">
              <p id="window-help">
                Times use your browser timezone (
                {Intl.DateTimeFormat().resolvedOptions().timeZone}). Start is
                included; end is excluded. Maximum 31 days.
              </p>
              <label htmlFor="window-start">Start</label>
              <input
                required
                id="window-start"
                type="datetime-local"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                aria-describedby="window-help"
              />
              <label htmlFor="window-end">End</label>
              <input
                required
                id="window-end"
                type="datetime-local"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                aria-describedby="window-help"
              />
            </div>
          )}
          <p className="window-note">
            Uses already collected articles; older coverage may be incomplete.
            Quiet periods stay empty.
          </p>
          <Button type="submit">
            {working
              ? 'Creating edition…'
              : `Create edition · ${windowChoice === 'custom' ? 'custom period' : windowChoice === '168' ? 'last 7 days' : `last ${windowChoice} hours`}`}
          </Button>
        </fieldset>
        {windowError && <p role="alert">{windowError}</p>}
      </form>
      {jobMessage && <p role="status">{jobMessage}</p>}
      <details className="edition-history">
        <summary>Browse saved editions</summary>
        <p>
          Immutable editions, newest first. Each regeneration is a separate
          version.
        </p>
        <Button disabled={working} onClick={() => void openEdition()}>
          Open latest edition
        </Button>
        {historyError ? (
          <p role="alert">
            Edition history could not be loaded.{' '}
            <Button onClick={() => void historyResult.refetch()}>
              Retry history
            </Button>
          </p>
        ) : !history ? (
          <p role="status">Loading history…</p>
        ) : (
          <>
            <ul>
              {history.entries.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`/editions/${entry.id}`}
                    aria-current={entry.id === preview?.id ? 'page' : undefined}
                    onClick={(event) => {
                      if (
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.shiftKey &&
                        !event.altKey
                      ) {
                        event.preventDefault();
                        if (!busy) void openEdition(entry.id);
                      }
                    }}
                  >
                    Saved {new Date(entry.createdAt).toLocaleString()} ·{' '}
                    {entry.id.slice(0, 8)}
                  </a>
                  <span>
                    {new Date(entry.windowStart).toLocaleString()} —{' '}
                    {new Date(entry.windowEnd).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            {!history.entries.length && <p>No saved editions on this page.</p>}
            <div className="history-pages">
              <Button
                disabled={offset === 0 || busy}
                onClick={() => setOffset((value) => Math.max(0, value - 20))}
              >
                Newer editions
              </Button>
              <span>Page {offset / 20 + 1}</span>
              <Button
                disabled={!history.hasMore || busy}
                onClick={() => setOffset((value) => value + 20)}
              >
                Older editions
              </Button>
            </div>
          </>
        )}
      </details>
      {(error || edition.isError) && (
        <p role="alert">
          The edition could not be loaded or created. Please try again.
        </p>
      )}
      {!preview && loaded && !error && !edition.isError && (
        <p>No edition yet. Create one from your collected articles.</p>
      )}
      {preview && (
        <>
          <p className="period">
            {new Date(preview.windowStart).toLocaleString()} —{' '}
            {new Date(preview.windowEnd).toLocaleString()} · Saved edition ·
            Created {new Date(preview.createdAt).toLocaleString()} ·{' '}
            {preview.id.slice(0, 8)} ·{' '}
            {preview.method === 'editorial-v1'
              ? 'AI editing with labeled non-AI fallback'
              : preview.method !== 'signals-v1'
                ? 'Topic phrase filtering'
                : 'Original ranking'}
          </p>
          {preview.topics.map((topic) => (
            <article className="digest-topic" key={topic.id}>
              <h3>{topic.name}</h3>
              {topic.editorial && (
                <>
                  <p className="editorial-label">
                    {topic.editorial.mode === 'ai'
                      ? `AI edited · ${topic.editorial.model}`
                      : 'Non-AI ranking'}{' '}
                    · {topic.editorial.reason}
                  </p>
                  {topic.editorial.brief.length > 0 && (
                    <ul className="topic-brief">
                      {topic.editorial.brief.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <p className="selection-count">
                {topic.stories.length} selected from {topic.candidateCount}{' '}
                candidates examined
                {topic.relevanceRejectedCount !== undefined && (
                  <> · {topic.relevanceRejectedCount} filtered by topic rules</>
                )}
                {topic.qualityRejections !== undefined && (
                  <>
                    {' '}
                    · {topic.qualityRejections.length} filtered by quality rules
                  </>
                )}
              </p>
              {!!topic.qualityRejections?.length && (
                <details className="omissions">
                  <summary>
                    Why omitted · {topic.qualityRejections.length} candidates
                  </summary>
                  <ul>
                    {topic.qualityRejections.map((item) => (
                      <li key={item.id}>
                        <span>{item.title}</span> — {item.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {topic.stories.length === 0 && (
                <p>
                  No qualifying stories in this window. Nothing added to fill
                  the space.
                </p>
              )}
              <ol>
                {topic.stories.map((story) => (
                  <li key={story.id} id={`story-${story.id}`}>
                    <a href={story.url} target="_blank" rel="noreferrer">
                      {story.title}
                    </a>
                    {story.imageUrl && (
                      <StoryImage key={story.imageUrl} url={story.imageUrl} />
                    )}{' '}
                    {(story.summary || story.excerpt) && (
                      <p className="excerpt">
                        {story.summary || story.excerpt}
                      </p>
                    )}
                    {story.whyItMatters && (
                      <p>
                        <strong>Why it matters:</strong> {story.whyItMatters}
                      </p>
                    )}
                    <p className="byline">
                      {story.sources.join(' · ')} ·{' '}
                      <time dateTime={story.publishedAt}>
                        {new Date(story.publishedAt).toLocaleString()}
                      </time>
                    </p>
                    {!!story.evidence?.length && (
                      <details className="coverage">
                        <summary>
                          Summary sources · {story.evidence.length} articles
                        </summary>
                        <p>
                          Headlines and excerpts supplied to the editor.
                          Attribution is not independent fact-checking.
                        </p>
                        <ul>
                          {story.evidence.map((article) => (
                            <li key={article.id}>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {article.title}
                              </a>
                              {' · '}
                              {article.sources.join(' · ')}
                              <p>{article.excerpt}</p>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {!!story.coverage && story.coverage.length > 1 && (
                      <details className="coverage">
                        <summary>
                          Related coverage · {story.coverage.length} articles
                        </summary>
                        <p>
                          Grouped by similar headlines; independent reporting is
                          unverified.
                        </p>
                        <ul>
                          {story.coverage.map((article) => (
                            <li key={article.id}>
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {article.title}
                              </a>{' '}
                              · {article.sources.join(' · ')}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <details>
                      <summary>Why selected · score {story.score}</summary>
                      <ul>
                        {story.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ol>
              {topic.posts !== undefined && (
                <TopPosts posts={topic.posts} editorial={topic.postEditorial} />
              )}
            </article>
          ))}
        </>
      )}
    </section>
  );
}

// Feed images have no reliable captions. The adjacent headline supplies context.
function StoryImage({ url }: { url: string }) {
  const [failed, setFailed] = React.useState(false);
  return failed ? null : (
    <img
      className="story-image"
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
