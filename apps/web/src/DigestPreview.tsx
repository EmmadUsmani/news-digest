import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';

import { Button } from './components/ui/button';
import { editionHistoryQuery, editionQuery, HttpError } from './queries';
import { TopPosts } from './TopPosts';
export function DigestPreview() {
  const navigate = useNavigate();
  const { id: selectedEditionId } = useParams({ strict: false });
  const queryClient = useQueryClient();
  const edition = useQuery(editionQuery(selectedEditionId));
  const preview = edition.data;
  const loaded = !edition.isPending;
  const savedEditions = React.useRef<HTMLDetailsElement>(null);
  const savedEditionsTrigger = React.useRef<HTMLElement>(null);
  const reviewSavedEditions = React.useRef(false);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (busy || !reviewSavedEditions.current) return;
    reviewSavedEditions.current = false;
    if (savedEditions.current) savedEditions.current.open = true;
    savedEditionsTrigger.current?.focus();
  }, [busy]);
  const working = busy;
  const [error, setError] = React.useState('');
  const [offset, setOffset] = React.useState(0);
  const historyResult = useQuery(editionHistoryQuery(offset));
  const restoreHistoryFocus = React.useRef(false);
  React.useEffect(() => {
    if (historyResult.isFetching || !restoreHistoryFocus.current) return;
    restoreHistoryFocus.current = false;
    if (!historyResult.isError) savedEditionsTrigger.current?.focus();
  }, [historyResult.isFetching, historyResult.isError]);
  const history = historyResult.data;
  const historyError = historyResult.isError;
  async function openEdition(id?: string) {
    setBusy(true);
    setError('');
    try {
      await queryClient.fetchQuery(editionQuery(id));
      void navigate(
        id
          ? { to: '/editions/$id', params: { id }, replace: true }
          : { to: '/', replace: true },
      );
    } catch {
      setError('Could not load the edition. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="digest-preview" aria-label="Ranked edition">
      <details className="edition-history" ref={savedEditions}>
        <summary ref={savedEditionsTrigger}>Browse saved editions</summary>
        <p>
          Immutable editions, newest first. Each regeneration is a separate
          version.
        </p>
        <Button disabled={working} onClick={() => void openEdition()}>
          Open latest edition
        </Button>
        {historyError && (
          <p role="alert">
            {history
              ? 'Edition history could not be refreshed. Showing saved links already loaded.'
              : 'Edition history could not be loaded.'}{' '}
            <Button
              onClick={() => {
                restoreHistoryFocus.current = true;
                void historyResult.refetch();
              }}
            >
              Retry history
            </Button>
          </p>
        )}
        {!history && !historyError && <p role="status">Loading history…</p>}
        {history && (
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
          </>
        )}
        <div className="history-pages">
          <Button
            disabled={offset === 0 || busy}
            onClick={() => setOffset((value) => Math.max(0, value - 20))}
          >
            Newer editions
          </Button>
          <span>Page {offset / 20 + 1}</span>
          <Button
            disabled={
              !history?.hasMore ||
              historyError ||
              historyResult.isFetching ||
              busy
            }
            onClick={() => setOffset((value) => value + 20)}
          >
            Older editions
          </Button>
        </div>
      </details>
      {!preview &&
      selectedEditionId &&
      edition.error instanceof HttpError &&
      edition.error.status === 404 ? (
        <div role="alert">
          <h2>Edition not found</h2>
          <p>This saved edition is unavailable.</p>
          <Link to="/">Back to latest edition</Link>
        </div>
      ) : edition.isError ? (
        <div role="alert">
          <p>
            {preview
              ? 'The edition could not be refreshed. Showing the saved edition already loaded.'
              : 'The edition could not be loaded. Please try again.'}
          </p>
          <Button
            onClick={() => void edition.refetch()}
            disabled={edition.isFetching}
          >
            Try loading edition again
          </Button>
        </div>
      ) : null}
      {error && <p role="alert">{error}</p>}
      {!preview && loaded && !error && !edition.isError && (
        <p>No edition yet. Create one from your collected articles.</p>
      )}
      {preview && (
        <>
          <p className="period">
            {new Date(preview.windowStart).toLocaleString()} —{' '}
            {new Date(preview.windowEnd).toLocaleString()} · Saved edition ·
            Created {new Date(preview.createdAt).toLocaleString()} ·{' '}
            {preview.id.slice(0, 8)}
          </p>
          {preview.topics.map((topic) => (
            <article className="digest-topic" key={topic.id}>
              <h3>{topic.name}</h3>
              {topic.brief.length > 0 && (
                <ul className="topic-brief">
                  {topic.brief.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
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
                    {story.summary && (
                      <p className="excerpt">{story.summary}</p>
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
                  </li>
                ))}
              </ol>
              {topic.posts !== undefined && <TopPosts posts={topic.posts} />}
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
