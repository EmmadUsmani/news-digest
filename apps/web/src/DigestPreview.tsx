import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { EditionDateSwitcher } from './EditionDateSwitcher';
import { editionQuery, HttpError } from './queries';
import { ReaderAccount } from './ReaderAccount';
import { ReaderContents } from './ReaderContents';
import { ReaderPreferences } from './ReaderPreferences';
import { ReaderSkeleton } from './ReaderSkeleton';
import { ReaderSkipLink } from './ReaderSkipLink';
import { StorySources } from './StorySources';
import { StoryTime } from './StoryTime';
import { TopPosts } from './TopPosts';
import { useReaderAccount } from './use-reader-account';
import { useReaderPreferences } from './use-reader-preferences';

export function DigestPreview() {
  const { id } = useParams({ strict: false });
  const routeHash = useLocation({ select: (location) => location.hash });
  // Router hashes can be partly decoded; post anchors use encoded JSON identities.
  let hash = routeHash;
  if (routeHash.startsWith('post-')) {
    try {
      hash = `post-${encodeURIComponent(decodeURIComponent(routeHash.slice(5)))}`;
    } catch {
      // A malformed external fragment has no matching saved destination.
    }
  }
  const edition = useQuery(editionQuery(id));
  const preview = edition.data;
  const content = useRef<HTMLElement>(null);
  const recovering = useRef(false);
  useEffect(() => {
    if (!recovering.current || edition.isFetching || !edition.isSuccess) return;
    recovering.current = false;
    const destination =
      content.current?.querySelector<HTMLElement>('.digest-topic h2') ??
      content.current?.querySelector<HTMLElement>('h1');
    destination?.focus();
  }, [edition.isFetching, edition.isSuccess]);
  const retryEdition = () => {
    recovering.current = true;
    void edition.refetch();
  };
  const preferences = useReaderPreferences();
  const accountsEnabled = import.meta.env.VITE_READER_ACCOUNTS === '1';
  const account = useReaderAccount(accountsEnabled, preferences.accountStore);
  const preferencesEnabled = import.meta.env.VITE_READER_PREFERENCES !== '0';
  const visibleTopics =
    preview?.topics.filter(
      (topic) =>
        !preferencesEnabled || !preferences.hiddenTopics[topic.id]?.hidden,
    ) ?? [];
  const hiddenDestination = preferencesEnabled
    ? preview?.topics.find(
        (topic) =>
          preferences.hiddenTopics[topic.id]?.hidden &&
          (topic.stories.some((story) => hash === `story-${story.id}`) ||
            topic.posts.some(
              (post) =>
                hash ===
                `post-${encodeURIComponent(JSON.stringify([post.platform, post.externalId]))}`,
            )),
      )
    : undefined;
  return (
    <main
      ref={content}
      className="mx-auto min-h-screen max-w-[1008px] px-4 pb-16 sm:px-6"
    >
      {visibleTopics[0] && (
        <ReaderSkipLink target={`topic-${visibleTopics[0].id}`} />
      )}
      <header className="sticky top-0 z-30 flex h-[65px] items-center justify-between gap-1 border-b border-[var(--border)] bg-[var(--background)] py-0">
        <Link
          to="/"
          className="min-w-0 truncate text-base font-semibold tracking-tight sm:text-lg"
        >
          News Digest
        </Link>
        <div className="flex shrink-0 items-center gap-0 sm:gap-2">
          {preview && preferencesEnabled && (
            <ReaderPreferences
              topics={preview.topics}
              preferences={preferences}
            />
          )}
          <EditionDateSwitcher edition={preview} />
          <ThemeToggle />
        </div>
      </header>
      {(preferencesEnabled || accountsEnabled) && (
        <nav
          aria-label="Reader preferences"
          className="mt-16 flex items-center justify-end gap-2 lg:mt-3"
        >
          {preferencesEnabled && (
            <Link
              to="/saved"
              className="inline-flex min-h-11 min-w-11 items-center rounded-md px-2 text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Saved items
            </Link>
          )}
          <ReaderAccount enabled={accountsEnabled} account={account} />
        </nav>
      )}
      {preferencesEnabled && preferences.storageFailed && (
        <p role="alert">
          Your browser could not save these choices. They apply until this page
          is closed or reloaded.
        </p>
      )}
      {preferencesEnabled && preferences.bookmarkError && (
        <p role="alert">{preferences.bookmarkError}</p>
      )}
      {edition.isPending && <ReaderSkeleton />}
      {edition.isError && (
        <div role="alert" className="pt-16">
          {preview ? (
            <>
              <p>
                The edition could not be refreshed. Showing the saved edition
                already loaded.
              </p>
              <Button className="min-h-11" onClick={retryEdition}>
                Try loading edition again
              </Button>
            </>
          ) : edition.error instanceof HttpError &&
            edition.error.status === 404 ? (
            <>
              <h1 className="font-sans text-2xl tracking-tight">
                Edition not found
              </h1>
              <Link
                to="/"
                className="inline-flex min-h-11 min-w-11 items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                Back to latest edition
              </Link>
            </>
          ) : (
            <>
              <p>Could not load the edition.</p>
              <Button className="min-h-11" onClick={retryEdition}>
                Try loading edition again
              </Button>
            </>
          )}
        </div>
      )}
      {!preview && !edition.isPending && !edition.isError && (
        <p className="pt-16 text-sm text-[var(--secondary)]">No edition yet.</p>
      )}
      {preview && (
        <div className="flex gap-6 pt-20 lg:pt-10">
          <h1 tabIndex={-1} className="sr-only">
            News Digest —{' '}
            {new Date(preview.windowEnd).toLocaleDateString(undefined, {
              dateStyle: 'long',
            })}
          </h1>
          <ReaderContents key={preview.id} topics={visibleTopics} />
          <div className="min-w-0 max-w-2xl flex-1 space-y-16">
            {hiddenDestination && (
              <div
                role="status"
                className="space-y-3 rounded-lg border border-[var(--border)] p-5"
              >
                <p>
                  This item is in {hiddenDestination.name}, which you have
                  hidden.
                </p>
                <Button
                  className="min-h-11"
                  onClick={() => {
                    preferences.setHidden(hiddenDestination.id, false);
                    requestAnimationFrame(() => {
                      const target = document.getElementById(hash);
                      target?.scrollIntoView({
                        behavior: 'instant',
                        block: 'center',
                      });
                      target?.focus({ preventScroll: true });
                    });
                  }}
                >
                  Show {hiddenDestination.name}
                </Button>
              </div>
            )}
            {preview.topics.length > 0 && visibleTopics.length === 0 && (
              <p role="status">
                All topics are hidden. Open Topics to show them again.
              </p>
            )}
            {visibleTopics.map((topic) => (
              <article className="digest-topic m-0 border-0 p-0" key={topic.id}>
                <h2
                  id={`topic-${topic.id}`}
                  tabIndex={-1}
                  className="m-0 scroll-mt-36 font-sans text-2xl leading-tight font-semibold tracking-tight lg:scroll-mt-24"
                >
                  {topic.name}
                </h2>
                {topic.brief.length > 0 && (
                  <ul className="topic-brief my-6 space-y-2 pl-5 text-base leading-7">
                    {topic.brief.map((line) => {
                      const story = topic.stories.find(
                        (item) => item.title === line,
                      );
                      return (
                        <li key={line}>
                          {story ? (
                            <a
                              href={`#story-${story.id}`}
                              className="text-base leading-7 font-normal underline decoration-[var(--border)] underline-offset-4 hover:text-[var(--accent)]"
                            >
                              {line}
                            </a>
                          ) : (
                            line
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {topic.stories.length === 0 && (
                  <p className="my-6 text-sm text-[var(--secondary)]">
                    No stories in this edition.
                  </p>
                )}
                <ol className="my-6 list-none space-y-4 pl-0">
                  {topic.stories.map((story) => (
                    <li key={story.id} className="border-0 p-0">
                      <Card
                        id={`story-${story.id}`}
                        tabIndex={-1}
                        className="scroll-mt-36 rounded-lg p-5 shadow-none lg:scroll-mt-24"
                      >
                        <h3 className="m-0 font-sans text-lg leading-7 font-semibold tracking-tight">
                          <a
                            href={story.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-11 min-w-11 items-center rounded-md text-lg leading-7 font-semibold hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          >
                            {story.title}
                          </a>
                        </h3>
                        {story.summary?.trim() ? (
                          <p className="excerpt my-3 text-base leading-7">
                            {story.summary}
                          </p>
                        ) : (
                          <p className="my-3 text-sm text-[var(--secondary)]">
                            Summary unavailable.{' '}
                            <a
                              href={story.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Read source: ${story.title}`}
                              className="inline-flex min-h-11 items-center rounded-md text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                            >
                              Read source
                            </a>
                          </p>
                        )}
                        {/(?:…|\.{3})\s*$/.test(story.summary ?? '') && (
                          <a
                            href={story.url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Continue reading: ${story.title}`}
                            className="mb-3 inline-flex min-h-11 items-center rounded-md text-sm text-[var(--accent)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          >
                            Continue reading at source
                          </a>
                        )}
                        <StorySources story={story}>
                          <StoryTime publishedAt={story.publishedAt} />
                        </StorySources>
                        {preferencesEnabled && (
                          <Button
                            variant="ghost"
                            className="mt-2 h-11 min-w-11 px-3 text-sm"
                            aria-label={`Save story: ${story.title}`}
                            aria-pressed={
                              !!preferences.bookmarks[`story:${story.id}`]?.copy
                            }
                            onClick={() =>
                              preferences.setBookmark(
                                `story:${story.id}`,
                                preferences.bookmarks[`story:${story.id}`]?.copy
                                  ? null
                                  : {
                                      title: story.title,
                                      url: story.url,
                                      attribution:
                                        story.publisher?.name ??
                                        story.sources.join(', '),
                                      excerpt: story.summary ?? '',
                                      publishedAt: story.publishedAt,
                                      platform: 'story',
                                      editionId: preview.id,
                                    },
                              )
                            }
                          >
                            {preferences.bookmarks[`story:${story.id}`]?.copy
                              ? 'Saved'
                              : 'Save'}
                          </Button>
                        )}
                      </Card>
                    </li>
                  ))}
                </ol>
                <div
                  id={`posts-${topic.id}`}
                  tabIndex={-1}
                  className="scroll-mt-36 lg:scroll-mt-24"
                >
                  <TopPosts
                    posts={topic.posts}
                    bookmark={
                      preferencesEnabled
                        ? {
                            isSaved: (post) =>
                              !!preferences.bookmarks[
                                `post:${JSON.stringify([post.platform, post.externalId])}`
                              ]?.copy,
                            toggle: (post) => {
                              const id = `post:${JSON.stringify([post.platform, post.externalId])}`;
                              const text =
                                post.platform === 'reddit'
                                  ? post.title
                                  : post.text;
                              preferences.setBookmark(
                                id,
                                preferences.bookmarks[id]?.copy
                                  ? null
                                  : {
                                      title:
                                        post.platform === 'reddit'
                                          ? post.title
                                          : `${post.platform === 'x' ? 'X' : 'Bluesky'} post from ${post.author}`,
                                      url: post.url,
                                      attribution: post.author,
                                      excerpt: post.displayText ?? text,
                                      publishedAt: post.publishedAt,
                                      context:
                                        post.whyItMatters?.trim() || undefined,
                                      platform: post.platform,
                                      editionId: preview.id,
                                    },
                              );
                            },
                          }
                        : undefined
                    }
                  />
                </div>
              </article>
            ))}
            <Link
              to="/editions"
              search={{ page: 1 }}
              className="inline-flex min-h-11 min-w-11 items-center rounded-md text-sm font-medium text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Past editions →
            </Link>
          </div>
        </div>
      )}
      <footer className="mt-12 border-t border-[var(--border)] py-4">
        <Link
          to="/privacy"
          className="inline-flex min-h-11 items-center rounded-md text-sm text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Privacy
        </Link>
      </footer>
    </main>
  );
}
