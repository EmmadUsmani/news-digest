import {
  type DigestPreview as Preview,
  digestPreviewSchema,
  type PreviewHistory,
  previewHistorySchema,
} from '@digest/contracts';
import React from 'react';
export function DigestPreview() {
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [windowChoice, setWindowChoice] = React.useState('24');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [windowError, setWindowError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [history, setHistory] = React.useState<PreviewHistory | null>(null);
  const [offset, setOffset] = React.useState(0);
  const [historyError, setHistoryError] = React.useState(false);
  const [revision, setRevision] = React.useState(0);
  React.useEffect(() => {
    setHistory(null);
    setHistoryError(false);
    fetch(`/api/digest-previews?offset=${offset}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        setHistory(previewHistorySchema.parse(await r.json()));
      })
      .catch(() => setHistoryError(true));
  }, [offset, revision]);
  React.useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('edition');
    fetch(
      id
        ? `/api/digest-previews/${encodeURIComponent(id)}`
        : '/api/digest-previews/latest',
    )
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = await r.json();
        setPreview(data ? digestPreviewSchema.parse(data) : null);
      })
      .catch(() => setError(true))
      .finally(() => setLoaded(true));
  }, []);
  async function generate() {
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
      const response = await fetch('/api/digest-previews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windowStart: start.toISOString(),
          windowEnd: end.toISOString(),
        }),
      });
      if (!response.ok) throw new Error();
      const saved = digestPreviewSchema.parse(await response.json());
      setPreview(saved);
      window.history.replaceState(null, '', `?edition=${saved.id}`);
      setOffset(0);
      setRevision((value) => value + 1);
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
      const response = await fetch(`/api/digest-previews/${id ?? 'latest'}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPreview(data ? digestPreviewSchema.parse(data) : null);
      window.history.replaceState(
        null,
        '',
        id ? `?edition=${id}` : window.location.pathname,
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
        Preliminary selection by recency and Hacker News engagement. Coverage
        links are retained; source labels do not establish independent
        reporting. Older editions retain their original scoring. Publisher
        headlines and excerpts appear as supplied; editorial summaries and post
        selection are still to come.
      </p>
      <form
        className="window-controls"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <fieldset disabled={busy || !loaded}>
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
          <button type="submit">
            {busy
              ? 'Selecting stories…'
              : `Create edition · ${windowChoice === 'custom' ? 'custom period' : windowChoice === '168' ? 'last 7 days' : `last ${windowChoice} hours`}`}
          </button>
        </fieldset>
        {windowError && <p role="alert">{windowError}</p>}
      </form>
      <details className="edition-history">
        <summary>Browse saved editions</summary>
        <p>
          Immutable preliminary selections, newest first. Each regeneration is a
          separate version.
        </p>
        <button disabled={busy} onClick={() => void openEdition()}>
          Open latest edition
        </button>
        {historyError ? (
          <p role="alert">
            Edition history could not be loaded.{' '}
            <button onClick={() => setRevision((value) => value + 1)}>
              Retry history
            </button>
          </p>
        ) : !history ? (
          <p role="status">Loading history…</p>
        ) : (
          <>
            <ul>
              {history.entries.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`?edition=${entry.id}`}
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
                    {new Date(entry.windowEnd).toLocaleString()} ·{' '}
                    {entry.method}
                  </span>
                </li>
              ))}
            </ul>
            {!history.entries.length && <p>No saved editions on this page.</p>}
            <div className="history-pages">
              <button
                disabled={offset === 0 || busy}
                onClick={() => setOffset((value) => Math.max(0, value - 20))}
              >
                Newer editions
              </button>
              <span>Page {offset / 20 + 1}</span>
              <button
                disabled={!history.hasMore || busy}
                onClick={() => setOffset((value) => value + 20)}
              >
                Older editions
              </button>
            </div>
          </>
        )}
      </details>
      {error && (
        <p role="alert">
          The edition could not be loaded or created. Please try again.
        </p>
      )}
      {!preview && loaded && !error && (
        <p>No edition yet. Create one from your collected articles.</p>
      )}
      {preview && (
        <>
          <p className="period">
            {new Date(preview.windowStart).toLocaleString()} —{' '}
            {new Date(preview.windowEnd).toLocaleString()} · Saved edition ·
            Created {new Date(preview.createdAt).toLocaleString()} ·{' '}
            {preview.id.slice(0, 8)} ·{' '}
            {preview.method !== 'signals-v1'
              ? 'Topic phrase filtering'
              : 'Original ranking'}
          </p>
          {preview.topics.map((topic) => (
            <article className="digest-topic" key={topic.id}>
              <h3>{topic.name}</h3>
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
                  <li key={story.id}>
                    <a href={story.url} target="_blank" rel="noreferrer">
                      {story.title}
                    </a>
                    {story.imageUrl && (
                      <StoryImage key={story.imageUrl} url={story.imageUrl} />
                    )}{' '}
                    {story.excerpt && (
                      <p className="excerpt">{story.excerpt}</p>
                    )}
                    <p className="byline">
                      {story.sources.join(' · ')} ·{' '}
                      <time dateTime={story.publishedAt}>
                        {new Date(story.publishedAt).toLocaleString()}
                      </time>
                    </p>
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
